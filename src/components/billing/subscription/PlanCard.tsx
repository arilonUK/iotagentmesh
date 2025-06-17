
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Circle, Crown, Zap, Shield } from 'lucide-react';
import { SubscriptionTier } from '@/types/billing';

interface PlanCardProps {
  plan: SubscriptionTier;
  isCurrentPlan: boolean;
  isPending: boolean;
  onUpgrade: (plan: SubscriptionTier) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, isCurrentPlan, isPending, onUpgrade }) => {
  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case 'free': return <Circle className="h-5 w-5" />;
      case 'professional': return <Zap className="h-5 w-5" />;
      case 'enterprise': return <Crown className="h-5 w-5" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };

  const formatPrice = (price: number, currency: string, interval: string) => {
    if (price === 0) return 'Free';
    return `$${price}/${interval === 'yearly' ? 'year' : 'month'}`;
  };

  const canUpgrade = (plan: SubscriptionTier) => {
    return plan.name !== 'free' && !isCurrentPlan;
  };

  return (
    <Card 
      className={`relative ${
        plan.name === 'professional' ? 'border-primary shadow-lg scale-105' : ''
      } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
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
          variant={isCurrentPlan ? "outline" : "default"}
          disabled={isCurrentPlan || isPending}
          onClick={() => onUpgrade(plan)}
        >
          {isCurrentPlan ? 'Current Plan' : canUpgrade(plan) ? 'Upgrade to This Plan' : 'Contact Sales'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PlanCard;
