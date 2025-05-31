
import { User, Session } from '@supabase/supabase-js';
import { Profile, UserOrganization, Organization } from '@/contexts/auth/types';

export type AuthState = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error';

export interface AuthStateData {
  state: AuthState;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  userOrganizations: UserOrganization[];
  currentOrganization: UserOrganization | null;
  organization: Organization | null;
  error: string | null;
}

export type AuthAction = 
  | { type: 'SET_LOADING' }
  | { type: 'SET_SESSION'; payload: Session | null }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_PROFILE'; payload: Profile | null }
  | { type: 'SET_USER_ORGANIZATIONS'; payload: UserOrganization[] }
  | { type: 'SET_CURRENT_ORGANIZATION'; payload: UserOrganization | null }
  | { type: 'SET_ORGANIZATION'; payload: Organization | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_AUTH' };

export class AuthStateManager {
  private state: AuthStateData = {
    state: 'idle',
    session: null,
    user: null,
    profile: null,
    userOrganizations: [],
    currentOrganization: null,
    organization: null,
    error: null
  };

  private listeners: ((state: AuthStateData) => void)[] = [];

  getState(): AuthStateData {
    return { ...this.state };
  }

  subscribe(listener: (state: AuthStateData) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  dispatch(action: AuthAction): void {
    const prevState = this.state;
    
    switch (action.type) {
      case 'SET_LOADING':
        this.state = { ...prevState, state: 'loading', error: null };
        break;
        
      case 'SET_SESSION':
        if (action.payload) {
          this.state = {
            ...prevState,
            state: 'authenticated',
            session: action.payload,
            user: action.payload.user,
            error: null
          };
        } else {
          this.state = {
            ...prevState,
            state: 'unauthenticated',
            session: null,
            user: null,
            profile: null,
            userOrganizations: [],
            currentOrganization: null,
            organization: null,
            error: null
          };
        }
        break;
        
      case 'SET_USER':
        this.state = { ...prevState, user: action.payload };
        break;
        
      case 'SET_PROFILE':
        this.state = { ...prevState, profile: action.payload };
        break;
        
      case 'SET_USER_ORGANIZATIONS':
        this.state = { ...prevState, userOrganizations: action.payload };
        break;
        
      case 'SET_CURRENT_ORGANIZATION':
        this.state = { ...prevState, currentOrganization: action.payload };
        break;
        
      case 'SET_ORGANIZATION':
        this.state = { ...prevState, organization: action.payload };
        break;
        
      case 'SET_ERROR':
        this.state = { ...prevState, state: 'error', error: action.payload };
        break;
        
      case 'RESET_AUTH':
        this.state = {
          state: 'unauthenticated',
          session: null,
          user: null,
          profile: null,
          userOrganizations: [],
          currentOrganization: null,
          organization: null,
          error: null
        };
        break;
        
      default:
        return;
    }
    
    this.notifyListeners();
  }
}

export const authStateManager = new AuthStateManager();
