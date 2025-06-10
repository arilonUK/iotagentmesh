
import { Session, User } from '@supabase/supabase-js';

export enum ContextType {
  QUERY_CLIENT = 'QUERY_CLIENT',
  TOAST = 'TOAST',
  AUTH = 'AUTH',
  ORGANIZATION = 'ORGANIZATION',
  NOTIFICATION = 'NOTIFICATION',
}

export enum InitializationState {
  PENDING = 'pending',
  LOADING = 'loading',
  READY = 'ready',
  ERROR = 'error',
}

export interface ContextRegistration {
  type: ContextType;
  factory: () => Promise<any>;
  dependencies: ContextType[];
  lazy: boolean;
  state: InitializationState;
  instance?: any;
  error?: Error;
}

export interface ContextFactoryState {
  contexts: Map<ContextType, ContextRegistration>;
  initializationOrder: ContextType[];
  globalState: InitializationState;
  session: Session | null;
  user: User | null;
  error?: Error;
}

export interface ContextFactoryValue extends ContextFactoryState {
  getContext: <T = any>(type: ContextType) => T | null;
  isReady: (type: ContextType) => boolean;
  getError: (type: ContextType) => Error | null;
  setSession: (session: Session | null) => void;
  retryInitialization: (type?: ContextType) => Promise<void>;
  initializationProgress?: number;
}
