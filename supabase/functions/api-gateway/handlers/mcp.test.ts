import { describe, it, expect, beforeEach, vi } from 'vitest';

// Stub global Deno for tests
vi.stubGlobal('Deno', { env: { get: vi.fn(() => '') } });

const invokeMock = vi.fn();
const getUserMock = vi.fn();
const singleMock = vi.fn();
const selectMock = vi.fn().mockReturnThis();
const eqMock = vi.fn().mockReturnThis();

vi.mock('https://esm.sh/@supabase/supabase-js@2', () => ({
  createClient: () => ({
    auth: { getUser: getUserMock },
    from: vi.fn(() => ({
      select: selectMock,
      eq: eqMock,
      single: singleMock
    })),
    functions: { invoke: invokeMock }
  })
}));

import { handleMcp } from './mcp.ts';

describe('handleMcp', () => {
  beforeEach(() => {
    invokeMock.mockReset();
    getUserMock.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    singleMock.mockResolvedValue({ data: { organization_id: 'org-1', role: 'admin' }, error: null });
    
    // Mock organization lookup for access validation
    selectMock.mockReturnThis();
    eqMock.mockReturnThis();
  });

  it('should require authorization header', async () => {
    const req = new Request('https://example.com/api/mcp', {
      method: 'GET'
    });

    const response = await handleMcp(req, '/api/mcp');
    const result = await response.json();

    expect(response.status).toBe(401);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Missing authorization header');
  });

  it('should validate authentication token', async () => {
    getUserMock.mockResolvedValue({ data: { user: null }, error: new Error('Invalid token') });

    const req = new Request('https://example.com/api/mcp', {
      method: 'GET',
      headers: { Authorization: 'Bearer invalid-token' }
    });

    const response = await handleMcp(req, '/api/mcp');
    const result = await response.json();

    expect(response.status).toBe(401);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid authentication token');
  });

  it('should require organization membership', async () => {
    singleMock.mockResolvedValue({ data: null, error: new Error('No org membership') });

    const req = new Request('https://example.com/api/mcp', {
      method: 'GET', 
      headers: { Authorization: 'Bearer valid-token' }
    });

    const response = await handleMcp(req, '/api/mcp');
    const result = await response.json();

    expect(response.status).toBe(403);
    expect(result.success).toBe(false);
    expect(result.error).toBe('User not associated with any organization');
  });

  it('forwards root MCP request to api-mcp function', async () => {
    invokeMock.mockResolvedValue({ 
      data: { 
        protocol: 'mcp',
        version: '1.0',
        capabilities: {}
      }, 
      error: null, 
      status: 200 
    });

    const req = new Request('https://example.com/api/mcp', {
      method: 'GET',
      headers: { Authorization: 'Bearer token' }
    });

    const response = await handleMcp(req, '/api/mcp');

    expect(invokeMock).toHaveBeenCalledWith('api-mcp', expect.objectContaining({
      body: expect.objectContaining({
        organizationId: 'org-1',
        userId: 'user-1',
        userRole: 'admin'
      }),
      headers: expect.objectContaining({
        Authorization: 'Bearer token',
        'Content-Type': 'application/json',
        'X-Organization-Id': 'org-1'
      }),
      path: '',
      method: 'GET'
    }));
    
    expect(response.status).toBe(200);
  });

  it('forwards MCP tools request to api-mcp function', async () => {
    invokeMock.mockResolvedValue({ 
      data: { tools: [] }, 
      error: null, 
      status: 200 
    });

    const req = new Request('https://example.com/api/mcp/tools', {
      method: 'GET',
      headers: { Authorization: 'Bearer token' }
    });

    await handleMcp(req, '/api/mcp/tools');

    expect(invokeMock).toHaveBeenCalledWith('api-mcp', expect.objectContaining({
      path: 'tools',
      method: 'GET'
    }));
  });

  it('forwards MCP tool execution with POST body', async () => {
    invokeMock.mockResolvedValue({ 
      data: { success: true, result: {} }, 
      error: null, 
      status: 200 
    });

    const requestBody = { device_id: 'device-123' };
    const req = new Request('https://example.com/api/mcp/tools/get_device_status', {
      method: 'POST',
      headers: { 
        Authorization: 'Bearer token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    await handleMcp(req, '/api/mcp/tools/get_device_status');

    expect(invokeMock).toHaveBeenCalledWith('api-mcp', expect.objectContaining({
      body: expect.objectContaining({
        device_id: 'device-123',
        organizationId: 'org-1',
        userId: 'user-1',
        userRole: 'admin'
      }),
      path: 'tools/get_device_status',
      method: 'POST'
    }));
  });

  it('forwards MCP resources request to api-mcp function', async () => {
    invokeMock.mockResolvedValue({ 
      data: { resources: [] }, 
      error: null, 
      status: 200 
    });

    const req = new Request('https://example.com/api/mcp/resources/devices', {
      method: 'GET',
      headers: { Authorization: 'Bearer token' }
    });

    await handleMcp(req, '/api/mcp/resources/devices');

    expect(invokeMock).toHaveBeenCalledWith('api-mcp', expect.objectContaining({
      path: 'resources/devices',
      method: 'GET'
    }));
  });

  it('forwards MCP prompts request to api-mcp function', async () => {
    invokeMock.mockResolvedValue({ 
      data: { prompts: [] }, 
      error: null, 
      status: 200 
    });

    const req = new Request('https://example.com/api/mcp/prompts', {
      method: 'GET',
      headers: { Authorization: 'Bearer token' }
    });

    await handleMcp(req, '/api/mcp/prompts');

    expect(invokeMock).toHaveBeenCalledWith('api-mcp', expect.objectContaining({
      path: 'prompts',
      method: 'GET'
    }));
  });

  it('forwards MCP context request to api-mcp function', async () => {
    invokeMock.mockResolvedValue({ 
      data: { context: { timestamp: new Date().toISOString() } }, 
      error: null, 
      status: 200 
    });

    const req = new Request('https://example.com/api/mcp/context', {
      method: 'GET',
      headers: { Authorization: 'Bearer token' }
    });

    await handleMcp(req, '/api/mcp/context');

    expect(invokeMock).toHaveBeenCalledWith('api-mcp', expect.objectContaining({
      path: 'context',
      method: 'GET'
    }));
  });

  it('handles query parameters correctly', async () => {
    invokeMock.mockResolvedValue({ 
      data: { tools: [] }, 
      error: null, 
      status: 200 
    });

    const req = new Request('https://example.com/api/mcp/tools?limit=10&type=sensor', {
      method: 'GET',
      headers: { Authorization: 'Bearer token' }
    });

    await handleMcp(req, '/api/mcp/tools');

    expect(invokeMock).toHaveBeenCalledWith('api-mcp', expect.objectContaining({
      query: { limit: '10', type: 'sensor' }
    }));
  });

  it('handles api-mcp function errors gracefully', async () => {
    invokeMock.mockResolvedValue({ 
      data: null, 
      error: { message: 'Function execution failed' }, 
      status: null 
    });

    const req = new Request('https://example.com/api/mcp', {
      method: 'GET',
      headers: { Authorization: 'Bearer token' }
    });

    const response = await handleMcp(req, '/api/mcp');
    const result = await response.json();

    expect(response.status).toBe(500);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Function execution failed');
  });

  it('includes user context in request body', async () => {
    invokeMock.mockResolvedValue({ 
      data: { ok: true }, 
      error: null, 
      status: 200 
    });

    singleMock.mockResolvedValue({
      data: { organization_id: 'org-123', role: 'admin' },
      error: null
    });

    const req = new Request('https://example.com/api/mcp/tools', {
      method: 'POST',
      headers: { 
        Authorization: 'Bearer token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ test: 'data' })
    });

    await handleMcp(req, '/api/mcp/tools');

    expect(invokeMock).toHaveBeenCalledWith('api-mcp', expect.objectContaining({
      body: expect.objectContaining({
        test: 'data',
        organizationId: 'org-123',
        userId: 'user-1',
        userRole: 'admin'
      })
    }));
  });

  it('handles internal server errors', async () => {
    getUserMock.mockRejectedValue(new Error('Database connection failed'));

    const req = new Request('https://example.com/api/mcp', {
      method: 'GET',
      headers: { Authorization: 'Bearer token' }
    });

    const response = await handleMcp(req, '/api/mcp');
    const result = await response.json();

    expect(response.status).toBe(500);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Internal server error');
    expect(result.details).toBe('Database connection failed');
  });

  // Enhanced error handling and validation tests
  describe('Enhanced Body Parsing', () => {
    it('should reject malformed JSON in request body', async () => {
      const req = new Request('https://example.com/api/mcp/tools', {
        method: 'POST',
        headers: { 
          Authorization: 'Bearer token',
          'Content-Type': 'application/json'
        },
        body: '{ invalid json'
      });

      const response = await handleMcp(req, '/api/mcp/tools');
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid JSON in request body');
    });

    it('should reject unsupported content-type', async () => {
      const req = new Request('https://example.com/api/mcp/tools', {
        method: 'POST',
        headers: { 
          Authorization: 'Bearer token',
          'Content-Type': 'text/plain'
        },
        body: 'some text'
      });

      const response = await handleMcp(req, '/api/mcp/tools');
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unsupported content-type. Expected application/json');
      expect(result.received).toBe('text/plain');
    });

    it('should handle empty body gracefully', async () => {
      invokeMock.mockResolvedValue({ 
        data: { success: true }, 
        error: null, 
        status: 200 
      });

      const req = new Request('https://example.com/api/mcp/tools', {
        method: 'POST',
        headers: { 
          Authorization: 'Bearer token',
          'Content-Type': 'application/json'
        },
        body: ''
      });

      await handleMcp(req, '/api/mcp/tools');

      expect(invokeMock).toHaveBeenCalledWith('api-mcp', expect.objectContaining({
        body: expect.objectContaining({
          organizationId: 'org-1',
          userId: 'user-1',
          userRole: 'admin'
        })
      }));
    });

    it('should ignore non-object JSON bodies', async () => {
      invokeMock.mockResolvedValue({ 
        data: { success: true }, 
        error: null, 
        status: 200 
      });

      const req = new Request('https://example.com/api/mcp/tools', {
        method: 'POST',
        headers: { 
          Authorization: 'Bearer token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify("just a string")
      });

      await handleMcp(req, '/api/mcp/tools');

      expect(invokeMock).toHaveBeenCalledWith('api-mcp', expect.objectContaining({
        body: expect.objectContaining({
          organizationId: 'org-1',
          userId: 'user-1', 
          userRole: 'admin'
        })
      }));
    });
  });

  describe('Organization Access Control', () => {
    beforeEach(() => {
      // First call: organization membership, second: organization lookup
      singleMock.mockReset();
      singleMock
        .mockResolvedValueOnce({ data: { organization_id: 'org-1', role: 'member' }, error: null })
        .mockResolvedValue({ data: { id: 'org-1', name: 'Test Org' }, error: null });
    });

    it('should allow member role for GET requests', async () => {
      invokeMock.mockResolvedValue({ 
        data: { resources: [] }, 
        error: null, 
        status: 200 
      });

      const req = new Request('https://example.com/api/mcp/resources', {
        method: 'GET',
        headers: { Authorization: 'Bearer token' }
      });

      const response = await handleMcp(req, '/api/mcp/resources');
      expect(response.status).toBe(200);
    });

    it('should deny member role for POST requests', async () => {
      singleMock.mockReset();
      singleMock
        .mockResolvedValueOnce({ data: { organization_id: 'org-1', role: 'member' }, error: null })
        .mockResolvedValue({ data: { id: 'org-1', name: 'Test Org' }, error: null });

      const req = new Request('https://example.com/api/mcp/tools/execute', {
        method: 'POST',
        headers: { 
          Authorization: 'Bearer token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'test' })
      });

      const response = await handleMcp(req, '/api/mcp/tools/execute');
      const result = await response.json();

      expect(response.status).toBe(403);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Write operations require admin or owner role');
      expect(result.required_role).toBe('admin');
    });

    it('should allow admin role for all operations', async () => {
      invokeMock.mockResolvedValue({
        data: { success: true },
        error: null,
        status: 200
      });

      singleMock.mockReset();
      singleMock
        .mockResolvedValueOnce({ data: { organization_id: 'org-1', role: 'admin' }, error: null })
        .mockResolvedValue({ data: { id: 'org-1', name: 'Test Org' }, error: null });

      const req = new Request('https://example.com/api/mcp/tools/execute', {
        method: 'POST',
        headers: { 
          Authorization: 'Bearer token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'test' })
      });

      const response = await handleMcp(req, '/api/mcp/tools/execute');
      expect(response.status).toBe(200);
    });

    it('should deny access when organization not found', async () => {
      singleMock.mockReset();
      singleMock
        .mockResolvedValueOnce({ data: { organization_id: 'org-1', role: 'viewer' }, error: null })
        .mockResolvedValue({ data: null, error: new Error('Org not found') });

      const req = new Request('https://example.com/api/mcp/resources', {
        method: 'GET',
        headers: { Authorization: 'Bearer token' }
      });

      const response = await handleMcp(req, '/api/mcp/resources');
      const result = await response.json();

      expect(response.status).toBe(403);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Organization not found or inaccessible');
    });
  });

  describe('Enhanced Context Forwarding', () => {
    it('should include timestamp and request method in forwarded body', async () => {
      invokeMock.mockResolvedValue({ 
        data: { success: true }, 
        error: null, 
        status: 200 
      });

      const req = new Request('https://example.com/api/mcp/tools', {
        method: 'POST',
        headers: { 
          Authorization: 'Bearer token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ test: 'data' })
      });

      await handleMcp(req, '/api/mcp/tools');

      expect(invokeMock).toHaveBeenCalledWith('api-mcp', expect.objectContaining({
        body: expect.objectContaining({
          test: 'data',
          organizationId: 'org-1',
          userId: 'user-1',
          userRole: 'admin',
          requestMethod: 'POST',
          timestamp: expect.any(String)
        })
      }));
    });
  });
});