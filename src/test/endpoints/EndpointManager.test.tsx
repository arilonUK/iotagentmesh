
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import { EndpointManager } from '@/components/endpoints/EndpointManager';
import { endpointsApiService } from '@/services/api/endpointsApiService';

// Mock the endpoints service
vi.mock('@/services/api/endpointsApiService', () => ({
  endpointsApiService: {
    fetchAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    triggerEndpoint: vi.fn()
  }
}));

describe('EndpointManager', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Mock implementation for fetchAll
    vi.mocked(endpointsApiService.fetchAll).mockResolvedValue([
      {
        id: '1',
        name: 'Test Endpoint',
        description: 'Test endpoint description',
        type: 'webhook',
        organization_id: 'org-123',
        enabled: true,
        configuration: { 
          url: 'https://example.com/webhook',
          method: 'POST' // Added required method property for WebhookEndpointConfig
        },
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      }
    ]);
  });

  it('should display endpoint loading state initially', () => {
    render(<EndpointManager
      endpoints={[]}
      isLoading={true}
      isCreating={false}
      isUpdating={false}
      isDeleting={false}
      isTriggering={false}
      onCreateEndpoint={() => {}}
      onUpdateEndpoint={() => {}}
      onDeleteEndpoint={() => {}}
      onToggleEndpoint={() => {}}
      onTriggerEndpoint={() => {}}
      isEmbedded={false}
    />);

    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument();
  });

  it('should display endpoints after loading', async () => {
    render(<EndpointManager 
      endpoints={[{
        id: '1',
        name: 'Test Endpoint',
        description: 'Test endpoint description',
        type: 'webhook',
        organization_id: 'org-123',
        enabled: true,
        configuration: { 
          url: 'https://example.com/webhook',
          method: 'POST' 
        },
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      }]}
      isLoading={false}
      isCreating={false}
      isUpdating={false}
      isDeleting={false}
      isTriggering={false}
      onCreateEndpoint={() => {}}
      onUpdateEndpoint={() => {}}
      onDeleteEndpoint={() => {}}
      onToggleEndpoint={() => {}}
      onTriggerEndpoint={() => {}}
      isEmbedded={false}
    />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Endpoint')).toBeInTheDocument();
      expect(screen.getByText('Test endpoint description')).toBeInTheDocument();
    });
  });

  it('should display no endpoints message when none exist', async () => {
    render(<EndpointManager 
      endpoints={[]}
      isLoading={false}
      isCreating={false}
      isUpdating={false}
      isDeleting={false}
      isTriggering={false}
      onCreateEndpoint={() => {}}
      onUpdateEndpoint={() => {}}
      onDeleteEndpoint={() => {}}
      onToggleEndpoint={() => {}}
      onTriggerEndpoint={() => {}}
      isEmbedded={false}
    />);
    
    await waitFor(() => {
      expect(screen.getByText(/no endpoints/i)).toBeInTheDocument();
    });
  });

  it('should handle errors when fetching endpoints', async () => {
    vi.mocked(endpointsApiService.fetchAll).mockRejectedValueOnce(new Error('Failed to fetch'));

    expect(() => render(
      <EndpointManager
        endpoints={[]}
        isLoading={false}
        isCreating={false}
        isUpdating={false}
        isDeleting={false}
        isTriggering={false}
        onCreateEndpoint={() => {}}
        onUpdateEndpoint={() => {}}
        onDeleteEndpoint={() => {}}
        onToggleEndpoint={() => {}}
        onTriggerEndpoint={() => {}}
        isEmbedded={false}
      />
    )).not.toThrow();
  });
});
