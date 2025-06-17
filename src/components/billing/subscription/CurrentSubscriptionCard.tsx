
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard } from 'lucide-react';
import { OrganizationSubscription } from '@/types/billing';

interface CurrentSubscriptionCardProps {
  subscription: OrganizationSubscription;
  onManageSubscription: () => void;
  isPending: boolean;
}

const CurrentSubscriptionCard: React.FC<CurrentSubscriptionCardProps> = ({
  subscription,
  onManageSubscription,
  isPending
}) => {
  return (
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
            <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>
              {subscription.status}
            </Badge>
          </div>
          <div>
            <p className="text-muted-foreground">Current Period</p>
            <p>{new Date(subscription.current_period_start).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Next Billing</p>
            <p>{new Date(subscription.current_period_end).toLocaleDateString()}</p>
          </div>
          {subscription.trial_end && (
            <div>
              <p className="text-muted-foreground">Trial Ends</p>
              <p>{new Date(subscription.trial_end).toLocaleDateString()}</p>
            </div>
          )}
        </div>
        
        {subscription.status === 'active' && (
          <Button 
            variant="outline" 
            onClick={onManageSubscription}
            disabled={isPending}
            className="flex items-center gap-2"
          >
            <CreditCard className="h-4 w-4" />
            {isPending ? 'Opening Portal...' : 'Manage Subscription'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default CurrentSubscriptionCard;
