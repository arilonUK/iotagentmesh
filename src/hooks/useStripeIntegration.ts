
import { useMutation } from '@tanstack/react-query';
import { stripeService, CheckoutSessionRequest, CustomerPortalRequest } from '@/services/billing/stripeService';
import { useToast } from '@/hooks/use-toast';

export const useStripeCheckout = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (request: CheckoutSessionRequest) => 
      stripeService.createCheckoutSession(request),
    onSuccess: (data) => {
      console.log('Checkout session created, opening URL:', data.url);
      stripeService.openCheckout(data.url);
    },
    onError: (error) => {
      console.error('Checkout error:', error);
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
    mutationFn: (request: CustomerPortalRequest) => {
      console.log('Calling customer portal with request:', request);
      return stripeService.createCustomerPortalSession(request);
    },
    onSuccess: (data) => {
      console.log('Customer portal session successful, opening URL:', data.url);
      stripeService.openCustomerPortal(data.url);
    },
    onError: (error) => {
      console.error('Customer portal error:', error);
      toast({
        title: "Portal Error",
        description: error instanceof Error ? error.message : "Failed to open customer portal",
        variant: "destructive",
      });
    },
  });
};
