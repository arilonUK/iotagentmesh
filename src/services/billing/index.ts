
import { subscriptionService } from './subscriptionService';
import { usageService } from './usageService';
import { paymentService } from './paymentService';
import { deviceConnectionService } from './deviceConnectionService';

// Export all services as a unified API
export const billingApiService = {
  ...subscriptionService,
  ...usageService,
  ...paymentService,
  ...deviceConnectionService,
};

// Export individual services for specific use cases
export { subscriptionService } from './subscriptionService';
export { usageService } from './usageService';
export { paymentService } from './paymentService';
export { deviceConnectionService } from './deviceConnectionService';

// Export types
export type { Payment, Invoice } from './paymentService';
