
import { useState } from 'react';
import { Profile } from '@/contexts/auth/types';
import { profileServices } from '@/services/profileServices';

export type ProfileManagerReturn = {
  profile: Profile | null;
  fetchProfile: (userId: string) => Promise<void>;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
};

export const useProfileManager = (): ProfileManagerReturn => {
  const [profile, setProfile] = useState<Profile | null>(null);

  const fetchProfile = async (userId: string) => {
    try {
      const profileData = await profileServices.getProfile(userId);
      if (profileData) {
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  return {
    profile,
    fetchProfile,
    setProfile
  };
};
