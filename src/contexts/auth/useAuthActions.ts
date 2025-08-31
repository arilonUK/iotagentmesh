
import { authServices } from './authServices';
import { profileServices } from '@/services/profileServices';
import { Profile, UserMetadata } from './types';

export const useAuthActions = () => {
  const login = async (email: string, password: string) => {
    return authServices.signIn(email, password);
  };

  const signup = async (email: string, password: string, metadata?: UserMetadata) => {
    return authServices.signUp(email, password, metadata);
  };

  const logout = async (): Promise<void> => {
    await authServices.signOut();
  };

  const signIn = async (email: string, password: string) => {
    return authServices.signIn(email, password);
  };

  const signUp = async (email: string, password: string, metadata?: UserMetadata) => {
    return authServices.signUp(email, password, metadata);
  };

  const signOut = async (): Promise<void> => {
    await authServices.signOut();
  };

  const updateProfile = async (profileData: Partial<Profile>) => {
    return profileServices.updateProfile(profileData);
  };

  return {
    login,
    signup,
    logout,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };
};
