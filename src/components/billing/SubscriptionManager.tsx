
import React from 'react';
import { 
  useSubscriptionPlans, 
  useOrganizationSubscription,
} from '@/hooks/useBilling';
import { useStripeCheckout, useCustomerPortal } from '@/hooks/useStripeIntegration';
import { useOrganization } from '@/contexts/organization';
import { SubscriptionTier } from '@/types/billing';
import { PlansList, CurrentSubscriptionCard, PlansLoadingSkeleton } from './subscription';

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
    return <PlansLoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Subscription Plans</h2>
        <p className="text-muted-foreground">
          Choose the plan that best fits your IoT infrastructure needs.
        </p>
      </div>

      <PlansList
        plans={plans || []}
        currentSubscription={currentSubscription}
        isPending={stripeCheckout.isPending}
        onUpgrade={handleUpgrade}
      />

      {currentSubscription && (
        <CurrentSubscriptionCard
          subscription={currentSubscription}
          onManageSubscription={handleManageSubscription}
          isPending={customerPortal.isPending}
        />
      )}
    </div>
  );
};

export default SubscriptionManager;
