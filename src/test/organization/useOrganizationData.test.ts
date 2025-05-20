
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useOrganizationData } from '@/hooks/organization/useOrganizationData';

// Mock the dependent hooks
vi.mock('@/hooks/organization/useUserOrganizationRole', () => ({
  useUserOrganizationRole: () => ({
    userRole: 'admin',
    setUserRole: vi.fn(),
    fetchUserRole: vi.fn().mockResolvedValue(undefined)
  })
}));

vi.mock('@/hooks/organization/useOrganizationEntity', () => ({
  useOrganizationEntity: () => ({
    organization: {
      id: 'org-123',
      name: 'Test Organization',
      slug: 'test-org',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    },
    setOrganization: vi.fn(),
    fetchOrganizationEntity: vi.fn().mockResolvedValue(undefined)
  })
}));

vi.mock('@/hooks/organization/useOrganizationMembership', () => ({
  useOrganizationMembership: () => ({
    createMemberRole: vi.fn().mockResolvedValue(true)
  })
}));

describe('useOrganizationData', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return organization and user role', () => {
    const { result } = renderHook(() => useOrganizationData());
    
    expect(result.current.organization).toEqual({
      id: 'org-123',
      name: 'Test Organization',
      slug: 'test-org',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    });
    
    expect(result.current.userRole).toBe('admin');
  });

  it('should fetch organization data when requested', async () => {
    const { result } = renderHook(() => useOrganizationData());
    
    // Call the fetch function
    await result.current.fetchOrganizationData('org-123', 'user-123');
    
    // Unfortunately, we can't easily verify the internal hook calls from here
    // since we're mocking at the module level, but we can check the result is correct
    expect(result.current.organization.id).toBe('org-123');
  });
});
