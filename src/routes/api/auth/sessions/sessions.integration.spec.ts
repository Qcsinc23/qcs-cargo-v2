import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET as getSessions } from './+server';
import { POST as revokeAllSessions } from './revoke-all/+server';

function makeSessionLocals(options?: {
  userId?: string;
  getList?: ReturnType<typeof vi.fn>;
  deleteSession?: ReturnType<typeof vi.fn>;
}) {
  const getList = options?.getList ?? vi.fn();
  const deleteSession = options?.deleteSession ?? vi.fn();

  const sessionsCollection = {
    getList,
    delete: deleteSession
  };

  const locals = {
    user: options?.userId ? { id: options.userId } : null,
    pb: {
      collection: vi.fn(() => sessionsCollection)
    }
  };

  return { locals, getList, deleteSession };
}

describe('API /auth/sessions handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET returns 401 when user is missing', async () => {
    const response = await getSessions({ locals: {} } as any);

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ success: false, error: 'Unauthorized' });
  });

  it('GET paginates through all session pages with escaped filter', async () => {
    const getList = vi
      .fn()
      .mockResolvedValueOnce({ items: [{ id: 's1' }], totalPages: 2 })
      .mockResolvedValueOnce({ items: [{ id: 's2' }], totalPages: 2 });

    const { locals } = makeSessionLocals({ userId: 'user"1234', getList });

    const response = await getSessions({ locals } as any);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      success: true,
      sessions: [{ id: 's1' }, { id: 's2' }]
    });

    expect(getList).toHaveBeenNthCalledWith(1, 1, 100, {
      filter: 'user = "user\\"1234"',
      sort: '-last_active'
    });
    expect(getList).toHaveBeenNthCalledWith(2, 2, 100, {
      filter: 'user = "user\\"1234"',
      sort: '-last_active'
    });
  });

  it('GET returns empty sessions on collection errors', async () => {
    const getList = vi.fn().mockRejectedValue(new Error('missing collection'));
    const { locals } = makeSessionLocals({ userId: 'user12345', getList });

    const response = await getSessions({ locals } as any);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true, sessions: [] });
  });

  it('POST revoke-all returns 401 when user is missing', async () => {
    const response = await revokeAllSessions({ locals: {} } as any);

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ success: false, error: 'Unauthorized' });
  });

  it('POST revoke-all deletes every session page until empty', async () => {
    const getList = vi
      .fn()
      .mockResolvedValueOnce({ items: [{ id: 's1' }, { id: 's2' }] })
      .mockResolvedValueOnce({ items: [] });
    const deleteSession = vi.fn().mockResolvedValue(undefined);

    const { locals } = makeSessionLocals({ userId: 'user12345', getList, deleteSession });

    const response = await revokeAllSessions({ locals } as any);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });

    expect(getList).toHaveBeenNthCalledWith(1, 1, 100, {
      filter: 'user = "user12345"',
      fields: 'id'
    });
    expect(getList).toHaveBeenNthCalledWith(2, 1, 100, {
      filter: 'user = "user12345"',
      fields: 'id'
    });

    expect(deleteSession).toHaveBeenCalledTimes(2);
    expect(deleteSession).toHaveBeenCalledWith('s1');
    expect(deleteSession).toHaveBeenCalledWith('s2');
  });

  it('POST revoke-all is a no-op success when session storage fails', async () => {
    const getList = vi.fn().mockRejectedValue(new Error('sessions unavailable'));
    const { locals } = makeSessionLocals({ userId: 'user12345', getList });

    const response = await revokeAllSessions({ locals } as any);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
  });
});
