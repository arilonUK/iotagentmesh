
// This hook is used to provide toast functionality throughout the app
import { 
  useToast as useToastOriginal, 
  toast as toastOriginal 
} from '@/components/ui/toast';

export const useToast = useToastOriginal;
export const toast = toastOriginal;

// Re-export default toast for backward compatibility
export default { useToast: useToastOriginal, toast: toastOriginal };
