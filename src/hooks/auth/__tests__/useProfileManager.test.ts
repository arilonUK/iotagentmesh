
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useProfileManager } from '../useProfileManager';
import { profileServices } from '@/services/profileServices';
import { waitFor } from '@/test/utils';

// Mock the profileServices
vi.mock('@/services/profileServices', () => ({
  profileServices: {
    getProfile: vi.fn(),
  },
}));

describe('useProfileManager', () => {
  const mockProfile = {
    id: '123',
    user_id: '123',
    username: 'testuser',
    full_name: 'Test User',
    avatar_url: null,
    created_at: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return null profile by default', () => {
    const { result } = renderHook(() => useProfileManager());
    expect(result.current.profile).toBeNull();
  });

  it('should fetch profile data', async () => {
    // Setup the mock to return our test profile
    vi.mocked(profileServices.getProfile).mockResolvedValueOnce(mockProfile);

    const { result } = renderHook(() => useProfileManager());
    
    // Call the fetchProfile function
    result.current.fetchProfile();
    
    // Wait for profile to be updated
    await waitFor(() => {
      expect(result.current.profile).toEqual(mockProfile);
    });
    
    // Verify that getProfile was called
    expect(profileServices.getProfile).toHaveBeenCalled();
  });

  it('should handle errors when fetching profile', async () => {
    // Setup the mock to throw an error
    const mockError = new Error('Failed to fetch profile');
    vi.mocked(profileServices.getProfile).mockRejectedValueOnce(mockError);
    
    // Spy on console.error
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const { result } = renderHook(() => useProfileManager());
    
    // Call the fetchProfile function
    result.current.fetchProfile();
    
    // Wait for the error to be logged
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching profile:', mockError);
    });
    
    // Profile should still be null
    expect(result.current.profile).toBeNull();
    
    // Restore console.error
    consoleSpy.mockRestore();
  });
});
