
// Import from our hooks directory
import { useToast } from "@/hooks/use-toast";
import type { ToastProps } from "@/hooks/use-toast";

// Export the hook
export { useToast };
export type { ToastProps };

// Helper function for direct usage
export const toast = (props: ToastProps) => {
  // This should be used only in components
  console.warn('Please use the useToast() hook inside components instead of the toast function directly');
  // Implementation will be provided by component logic
  return props;
};
