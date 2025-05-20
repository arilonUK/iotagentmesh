import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuthSession } from '../useAuthSession';
import { supabase } from '@/integrations/supabase/client';

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(),
      getSession: vi.fn(),
    },
  },
}));

describe('useAuthSession', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Mock implementation for onAuthStateChange
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: {
        subscription: {
          unsubscribe: vi.fn(),
          id: 'mock-id',
          callback: vi.fn(),
        },
      },
    } as any);
    
    // Mock implementation for getSession
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as any);
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useAuthSession());
    
    expect(result.current.loading).toBe(true);
    expect(result.current.session).toBeNull();
    expect(result.current.user).toBeNull();
  });

  it('should handle session retrieval', async () => {
    const mockUser = { id: '123', email: 'test@example.com' };
    const mockSession = { user: mockUser };
    
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: mockSession as any },
      error: null,
    });
    
    const { result } = renderHook(() => useAuthSession());
    
    // Wait for the effect to complete
    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.session).toEqual(mockSession);
    expect(result.current.user).toEqual(mockUser);
  });

  it('should handle auth state changes', async () => {
    // Setup initial render
    const { result } = renderHook(() => useAuthSession());
    
    // Wait for initial loading to complete
    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Mock an auth state change
    const mockUser = { id: '456', email: 'new@example.com' };
    const mockSession = { user: mockUser };
    
    // Get the callback function that was passed to onAuthStateChange
    const authStateCallback = vi.mocked(supabase.auth.onAuthStateChange).mock.calls[0][0];
    
    // Call the callback with a SIGNED_IN event
    act(() => {
      authStateCallback('SIGNED_IN', mockSession as any);
    });
    
    // Verify the state was updated
    expect(result.current.session).toEqual(mockSession);
    expect(result.current.user).toEqual(mockUser);
    
    // Now simulate a sign out
    act(() => {
      authStateCallback('SIGNED_OUT', null);
    });
    
    // Verify the state was cleared
    expect(result.current.session).toBeNull();
    expect(result.current.user).toBeNull();
  });
});
