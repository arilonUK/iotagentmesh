
import { useMutation } from '@tanstack/react-query';
import { stripeService, CheckoutSessionRequest, CustomerPortalRequest } from '@/services/billing/stripeService';
import { useToast } from '@/hooks/use-toast';

export const useStripeCheckout = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (request: CheckoutSessionRequest) => 
      stripeService.createCheckoutSession(request),
    onSuccess: (data) => {
      stripeService.openCheckout(data.url);
    },
    onError: (error) => {
      toast({
        title: "Checkout Error",
        description: error instanceof Error ? error.message : "Failed to start checkout",
        variant: "destructive",
      });
    },
  });
};

export const useCustomerPortal = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (request: CustomerPortalRequest) => 
      stripeService.createCustomerPortalSession(request),
    onSuccess: (data) => {
      stripeService.openCustomerPortal(data.url);
    },
    onError: (error) => {
      toast({
        title: "Portal Error",
        description: error instanceof Error ? error.message : "Failed to open customer portal",
        variant: "destructive",
      });
    },
  });
};
