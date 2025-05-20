
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import { EndpointManager } from '@/components/endpoints/EndpointManager';
import { fetchEndpoints } from '@/services/endpoints';

// Mock the endpoints service
vi.mock('@/services/endpoints', () => ({
  fetchEndpoints: vi.fn(),
  createEndpoint: vi.fn(),
  updateEndpoint: vi.fn(),
  deleteEndpoint: vi.fn(),
  triggerEndpoint: vi.fn()
}));

describe('EndpointManager', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Mock implementation for fetchEndpoints
    vi.mocked(fetchEndpoints).mockResolvedValue([
      {
        id: '1',
        name: 'Test Endpoint',
        description: 'Test endpoint description',
        type: 'webhook',
        organization_id: 'org-123',
        enabled: true,
        configuration: { url: 'https://example.com/webhook' },
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      }
    ]);
  });

  it('should display endpoint loading state initially', () => {
    render(<EndpointManager organizationId="org-123" />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should display endpoints after loading', async () => {
    render(<EndpointManager organizationId="org-123" />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Endpoint')).toBeInTheDocument();
      expect(screen.getByText('Test endpoint description')).toBeInTheDocument();
    });
    
    expect(fetchEndpoints).toHaveBeenCalledWith('org-123');
  });

  it('should display no endpoints message when none exist', async () => {
    vi.mocked(fetchEndpoints).mockResolvedValueOnce([]);
    
    render(<EndpointManager organizationId="org-123" />);
    
    await waitFor(() => {
      expect(screen.getByText(/no endpoints/i)).toBeInTheDocument();
    });
  });

  it('should handle errors when fetching endpoints', async () => {
    vi.mocked(fetchEndpoints).mockRejectedValueOnce(new Error('Failed to fetch'));
    
    render(<EndpointManager organizationId="org-123" />);
    
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
