import { describe, it, expect, beforeEach, vi } from 'vitest';

// Stub global Deno for tests
vi.stubGlobal('Deno', { env: { get: vi.fn(() => '') } });

const invokeMock = vi.fn();
const getUserMock = vi.fn();
const singleMock = vi.fn();

vi.mock('https://esm.sh/@supabase/supabase-js@2', () => ({
  createClient: () => ({
    auth: { getUser: getUserMock },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: singleMock,
    functions: { invoke: invokeMock }
  })
}));

import { handleData } from './data.ts';

describe('handleData', () => {
  beforeEach(() => {
    invokeMock.mockReset();
    getUserMock.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    singleMock.mockResolvedValue({ data: { organization_id: 'org-1', role: 'admin' }, error: null });
  });

  it('forwards device readings path to api-data', async () => {
    invokeMock.mockResolvedValue({ data: { ok: true }, error: null, status: 200 });

    const req = new Request('https://example.com/api/data/devices/dev123/readings', {
      method: 'GET',
      headers: { Authorization: 'Bearer token' }
    });

    await handleData(req, '/api/data/devices/dev123/readings');

    expect(invokeMock).toHaveBeenCalledWith('api-data', expect.objectContaining({
      path: 'devices/dev123/readings',
      method: 'GET'
    }));
  });

  it('forwards bucket data path to api-data', async () => {
    invokeMock.mockResolvedValue({ data: { ok: true }, error: null, status: 200 });

    const body = { value: 1 };
    const req = new Request('https://example.com/api/data/data-buckets/bucket1/data', {
      method: 'POST',
      headers: { Authorization: 'Bearer token', 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    await handleData(req, '/api/data/data-buckets/bucket1/data');

    expect(invokeMock).toHaveBeenCalledWith('api-data', expect.objectContaining({
      path: 'data-buckets/bucket1/data',
      method: 'POST',
      body
    }));
  });
});

