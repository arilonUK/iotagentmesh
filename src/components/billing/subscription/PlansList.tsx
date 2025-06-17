
import React from 'react';
import { SubscriptionTier } from '@/types/billing';
import PlanCard from './PlanCard';

interface PlansListProps {
  plans: SubscriptionTier[];
  currentSubscription?: any;
  isPending: boolean;
  onUpgrade: (plan: SubscriptionTier) => void;
}

const PlansList: React.FC<PlansListProps> = ({ plans, currentSubscription, isPending, onUpgrade }) => {
  const isCurrentPlan = (planId: string) => {
    return currentSubscription?.subscription_plan_id === planId;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan: SubscriptionTier) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          isCurrentPlan={isCurrentPlan(plan.id)}
          isPending={isPending}
          onUpgrade={onUpgrade}
        />
      ))}
    </div>
  );
};

export default PlansList;
