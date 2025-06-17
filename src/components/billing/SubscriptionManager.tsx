
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Circle, Crown, Zap, Shield, CreditCard } from 'lucide-react';
import { 
  useSubscriptionPlans, 
  useOrganizationSubscription,
} from '@/hooks/useBilling';
import { useStripeCheckout, useCustomerPortal } from '@/hooks/useStripeIntegration';
import { useOrganization } from '@/contexts/organization';
import { SubscriptionTier } from '@/types/billing';

// You'll need to map these to your actual Stripe price IDs
const STRIPE_PRICE_IDS = {
  professional: 'price_1234567890', // Replace with your actual price ID
  enterprise: 'price_0987654321',   // Replace with your actual price ID
};

const SubscriptionManager = () => {
  const { organization } = useOrganization();
  const { data: plans, isLoading: plansLoading } = useSubscriptionPlans();
  const { data: currentSubscription } = useOrganizationSubscription();
  const stripeCheckout = useStripeCheckout();
  const customerPortal = useCustomerPortal();

  const handleUpgrade = (plan: SubscriptionTier) => {
    if (!organization?.id) {
      console.error('No organization selected');
      return;
    }

    // Get the corresponding Stripe price ID
    const priceId = STRIPE_PRICE_IDS[plan.name as keyof typeof STRIPE_PRICE_IDS];
    if (!priceId) {
      console.error('No price ID found for plan:', plan.name);
      return;
    }

    stripeCheckout.mutate({
      priceId,
      organizationId: organization.id,
    });
  };

  const handleManageSubscription = () => {
    if (!organization?.id) {
      console.error('No organization selected');
      return;
    }

    console.log('Attempting to open customer portal for organization:', organization.id);
    customerPortal.mutate({
      organizationId: organization.id,
    });
  };

  if (plansLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case 'free': return <Circle className="h-5 w-5" />;
      case 'professional': return <Zap className="h-5 w-5" />;
      case 'enterprise': return <Crown className="h-5 w-5" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };

  const isCurrentPlan = (planId: string) => {
    return currentSubscription?.subscription_plan_id === planId;
  };

  const formatPrice = (price: number, currency: string, interval: string) => {
    if (price === 0) return 'Free';
    return `$${price}/${interval === 'yearly' ? 'year' : 'month'}`;
  };

  const canUpgrade = (plan: SubscriptionTier) => {
    return plan.name !== 'free' && !isCurrentPlan(plan.id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Subscription Plans</h2>
        <p className="text-muted-foreground">
          Choose the plan that best fits your IoT infrastructure needs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans?.map((plan: SubscriptionTier) => (
          <Card 
            key={plan.id} 
            className={`relative ${
              plan.name === 'professional' ? 'border-primary shadow-lg scale-105' : ''
            } ${isCurrentPlan(plan.id) ? 'ring-2 ring-green-500' : ''}`}
          >
            {plan.name === 'professional' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
              </div>
            )}
            
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {getPlanIcon(plan.name)}
                <CardTitle className="text-xl">{plan.display_name}</CardTitle>
              </div>
              <div className="text-3xl font-bold">
                {formatPrice(plan.price, plan.currency, plan.billing_interval)}
              </div>
              {plan.price > 0 && (
                <p className="text-sm text-muted-foreground">
                  Billed {plan.billing_interval}
                </p>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              <Separator />
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">
                    Up to {plan.features.max_devices.toLocaleString()} devices
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">
                    {plan.features.max_api_calls_per_month.toLocaleString()} API calls/month
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">
                    {plan.features.max_data_retention_days} days data retention
                  </span>
                </div>
                
                {plan.features.advanced_analytics && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Advanced analytics</span>
                  </div>
                )}
                
                {plan.features.priority_support && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Priority support</span>
                  </div>
                )}
              </div>

              <Separator />

              <Button 
                className="w-full" 
                variant={isCurrentPlan(plan.id) ? "outline" : "default"}
                disabled={isCurrentPlan(plan.id) || stripeCheckout.isPending}
                onClick={() => handleUpgrade(plan)}
              >
                {isCurrentPlan(plan.id) ? 'Current Plan' : canUpgrade(plan) ? 'Upgrade to This Plan' : 'Contact Sales'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {currentSubscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
              <div>
                <p className="text-muted-foreground">Status</p>
                <Badge variant={currentSubscription.status === 'active' ? 'default' : 'destructive'}>
                  {currentSubscription.status}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Current Period</p>
                <p>{new Date(currentSubscription.current_period_start).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Next Billing</p>
                <p>{new Date(currentSubscription.current_period_end).toLocaleDateString()}</p>
              </div>
              {currentSubscription.trial_end && (
                <div>
                  <p className="text-muted-foreground">Trial Ends</p>
                  <p>{new Date(currentSubscription.trial_end).toLocaleDateString()}</p>
                </div>
              )}
            </div>
            
            {currentSubscription.status === 'active' && (
              <Button 
                variant="outline" 
                onClick={handleManageSubscription}
                disabled={customerPortal.isPending}
                className="flex items-center gap-2"
              >
                <CreditCard className="h-4 w-4" />
                {customerPortal.isPending ? 'Opening Portal...' : 'Manage Subscription'}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubscriptionManager;
