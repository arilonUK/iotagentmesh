
// This is a helper service to log events that should trigger toast notifications
// Components will handle showing actual toast notifications using the useToast hook

export type ToastEvent = {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  action?: any;
};

// Global event system for handling toast notifications
class ToastEventEmitter {
  private static instance: ToastEventEmitter;
  private listeners: Array<(event: ToastEvent) => void> = [];

  private constructor() {}

  public static getInstance(): ToastEventEmitter {
    if (!ToastEventEmitter.instance) {
      ToastEventEmitter.instance = new ToastEventEmitter();
    }
    return ToastEventEmitter.instance;
  }

  public addListener(listener: (event: ToastEvent) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public emit(event: ToastEvent): void {
    this.listeners.forEach((listener) => listener(event));
    console.log(`[Toast Event]: ${event.title} - ${event.description || ''}`);
  }
}

export const toastEventEmitter = ToastEventEmitter.getInstance();

export const logToast = (event: ToastEvent): void => {
  toastEventEmitter.emit(event);
};

// Simple way to log toast notifications from services
export const toastService = {
  success: (title: string, description?: string) => {
    logToast({ title, description, variant: 'default' });
  },
  
  error: (title: string, description?: string) => {
    logToast({ title, description, variant: 'destructive' });
  },
  
  info: (title: string, description?: string) => {
    logToast({ title, description, variant: 'default' });
  },
  
  warning: (title: string, description?: string) => {
    logToast({ title, description, variant: 'destructive' });
  }
};
