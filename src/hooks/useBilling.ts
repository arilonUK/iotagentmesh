
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billingApiService } from '@/services/api/billingApiService';
import { useOrganization } from '@/contexts/organization';
import { useToast } from '@/hooks/use-toast';

export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: ['subscription-plans'],
    queryFn: billingApiService.getSubscriptionPlans,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useOrganizationSubscription = () => {
  const { organization } = useOrganization();
  
  return useQuery({
    queryKey: ['organization-subscription', organization?.id],
    queryFn: () => 
      organization?.id 
        ? billingApiService.getOrganizationSubscription(organization.id)
        : null,
    enabled: !!organization?.id,
  });
};

export const useCurrentUsage = () => {
  const { organization } = useOrganization();
  
  return useQuery({
    queryKey: ['current-usage', organization?.id],
    queryFn: () => 
      organization?.id 
        ? billingApiService.getCurrentUsage(organization.id)
        : null,
    enabled: !!organization?.id,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

export const useUsageLimits = () => {
  const { organization } = useOrganization();
  
  return useQuery({
    queryKey: ['usage-limits', organization?.id],
    queryFn: () => 
      organization?.id 
        ? billingApiService.checkUsageLimits(organization.id)
        : null,
    enabled: !!organization?.id,
    refetchInterval: 60000, // Refresh every minute
  });
};

export const useUsageMetrics = (
  metricType?: string, 
  startDate?: string, 
  endDate?: string
) => {
  const { organization } = useOrganization();
  
  return useQuery({
    queryKey: ['usage-metrics', organization?.id, metricType, startDate, endDate],
    queryFn: () => 
      organization?.id 
        ? billingApiService.getUsageMetrics(organization.id, metricType, startDate, endDate)
        : [],
    enabled: !!organization?.id,
  });
};

export const useDeviceConnections = (deviceId?: string, activeOnly = false) => {
  const { organization } = useOrganization();
  
  return useQuery({
    queryKey: ['device-connections', organization?.id, deviceId, activeOnly],
    queryFn: () => 
      organization?.id 
        ? billingApiService.getDeviceConnections(organization.id, deviceId, activeOnly)
        : [],
    enabled: !!organization?.id,
  });
};

export const useDataVolumeUsage = (
  startDate?: string,
  endDate?: string,
  dataType?: 'ingestion' | 'egress' | 'storage'
) => {
  const { organization } = useOrganization();
  
  return useQuery({
    queryKey: ['data-volume-usage', organization?.id, startDate, endDate, dataType],
    queryFn: () => 
      organization?.id 
        ? billingApiService.getDataVolumeUsage(organization.id, startDate, endDate, dataType)
        : [],
    enabled: !!organization?.id,
  });
};

export const useCreateSubscription = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: (subscriptionPlanId: string) => {
      if (!organization?.id) throw new Error('No organization selected');
      return billingApiService.createOrganizationSubscription(organization.id, subscriptionPlanId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-subscription'] });
      queryClient.invalidateQueries({ queryKey: ['usage-limits'] });
      toast({
        title: "Subscription Updated",
        description: "Your subscription has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Subscription Error",
        description: error instanceof Error ? error.message : "Failed to update subscription",
        variant: "destructive",
      });
    },
  });
};

export const useRecordUsageMetric = () => {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: ({
      metricType,
      metricValue,
      periodStart,
      periodEnd,
      metadata = {}
    }: {
      metricType: string;
      metricValue: number;
      periodStart: string;
      periodEnd: string;
      metadata?: Record<string, any>;
    }) => {
      if (!organization?.id) throw new Error('No organization selected');
      return billingApiService.recordUsageMetric(
        organization.id,
        metricType,
        metricValue,
        periodStart,
        periodEnd,
        metadata
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usage-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['current-usage'] });
    },
  });
};
