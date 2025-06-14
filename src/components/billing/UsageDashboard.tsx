
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Database, 
  Wifi, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  Server 
} from 'lucide-react';
import { 
  useCurrentUsage, 
  useUsageLimits, 
  useSubscriptionPlans,
  useOrganizationSubscription 
} from '@/hooks/useBilling';

const UsageDashboard = () => {
  const { data: currentUsage, isLoading: usageLoading } = useCurrentUsage();
  const { data: usageLimits, isLoading: limitsLoading } = useUsageLimits();
  const { data: plans } = useSubscriptionPlans();
  const { data: subscription } = useOrganizationSubscription();

  if (usageLoading || limitsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-2 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const currentPlan = plans?.find(plan => plan.id === subscription?.subscription_plan_id) || 
                     plans?.find(plan => plan.name === 'free');

  const getUsagePercentage = (current: number, limit: number) => {
    return limit > 0 ? Math.min((current / limit) * 100, 100) : 0;
  };

  const getProgressVariant = (percentage: number) => {
    if (percentage >= 90) return 'destructive';
    if (percentage >= 75) return 'warning';
    return 'default';
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const usageCards = [
    {
      title: 'Devices',
      current: currentUsage?.device_count || 0,
      limit: currentPlan?.features.max_devices || 0,
      icon: Server,
      suffix: '',
      description: 'Active devices in your organization'
    },
    {
      title: 'API Calls',
      current: currentUsage?.api_calls_this_month || 0,
      limit: currentPlan?.features.max_api_calls_per_month || 0,
      icon: Activity,
      suffix: '/month',
      description: 'API requests made this month'
    },
    {
      title: 'Data Volume',
      current: currentUsage?.data_volume_mb || 0,
      limit: (currentPlan?.features.max_data_retention_days || 0) * 100, // 100MB per day limit
      icon: Database,
      suffix: 'MB',
      description: 'Data stored this month'
    },
    {
      title: 'Active Connections',
      current: currentUsage?.active_connections || 0,
      limit: (currentPlan?.features.max_devices || 0) * 2, // 2x device limit for connections
      icon: Wifi,
      suffix: '',
      description: 'Currently connected devices'
    }
  ];

  const hasExceededLimits = usageLimits?.exceeds_device_limit || 
                           usageLimits?.exceeds_api_limit || 
                           usageLimits?.exceeds_data_limit;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">Usage Overview</h2>
          <p className="text-muted-foreground">
            Monitor your current usage and plan limits
          </p>
        </div>
        {currentPlan && (
          <Badge variant="outline" className="text-sm">
            {currentPlan.display_name}
          </Badge>
        )}
      </div>

      {hasExceededLimits && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have exceeded one or more plan limits. Consider upgrading your subscription to avoid service interruptions.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {usageCards.map((card) => {
          const percentage = getUsagePercentage(card.current, card.limit);
          const isExceeded = percentage >= 100;
          const Icon = card.icon;

          return (
            <Card key={card.title} className={isExceeded ? 'border-destructive' : ''}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <Icon className={`h-4 w-4 ${isExceeded ? 'text-destructive' : 'text-muted-foreground'}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {card.title === 'Data Volume' && card.current > 0 
                    ? formatBytes(card.current * 1024 * 1024).split(' ')[0]
                    : card.current.toLocaleString()
                  }
                  <span className="text-sm font-normal text-muted-foreground">
                    {card.title === 'Data Volume' && card.current > 0 
                      ? ' ' + formatBytes(card.current * 1024 * 1024).split(' ')[1]
                      : card.suffix
                    }
                  </span>
                </div>
                <div className="space-y-2 mt-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{card.description}</span>
                    <span>
                      {card.limit > 0 ? `${card.limit.toLocaleString()} limit` : 'No limit'}
                    </span>
                  </div>
                  {card.limit > 0 && (
                    <Progress 
                      value={percentage} 
                      className={`h-2 ${isExceeded ? 'bg-destructive/20' : ''}`}
                    />
                  )}
                </div>
                {isExceeded && (
                  <div className="flex items-center gap-1 mt-2">
                    <AlertTriangle className="h-3 w-3 text-destructive" />
                    <span className="text-xs text-destructive">Limit exceeded</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Usage Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium">Plan Status</h4>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">
                  {usageLimits?.current_plan_name || 'Free Plan'}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Billing Period</h4>
              <p className="text-sm text-muted-foreground">
                {subscription ? 
                  `${new Date(subscription.current_period_start).toLocaleDateString()} - ${new Date(subscription.current_period_end).toLocaleDateString()}` :
                  'No active subscription'
                }
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Next Billing</h4>
              <p className="text-sm text-muted-foreground">
                {subscription ? 
                  new Date(subscription.current_period_end).toLocaleDateString() :
                  'N/A'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsageDashboard;
