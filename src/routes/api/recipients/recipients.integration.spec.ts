import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET as listRecipients, POST as createRecipient } from './+server';
import { PATCH as updateRecipient } from './[id]/+server';

function makeRecipientsLocals(options?: {
  userId?: string;
  getList?: ReturnType<typeof vi.fn>;
  create?: ReturnType<typeof vi.fn>;
  update?: ReturnType<typeof vi.fn>;
  getOne?: ReturnType<typeof vi.fn>;
}) {
  const getList = options?.getList ?? vi.fn();
  const create = options?.create ?? vi.fn();
  const update = options?.update ?? vi.fn();
  const getOne = options?.getOne ?? vi.fn();

  const recipientsCollection = {
    getList,
    create,
    update,
    getOne,
    delete: vi.fn()
  };

  const locals = {
    user: options?.userId ? { id: options.userId } : null,
    pb: {
      collection: vi.fn(() => recipientsCollection)
    }
  };

  return {
    locals,
    recipientsCollection,
    getList,
    create,
    update,
    getOne
  };
}

describe('API /recipients handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET paginates all user recipients', async () => {
    const getList = vi
      .fn()
      .mockResolvedValueOnce({ items: [{ id: 'r1' }], totalPages: 2 })
      .mockResolvedValueOnce({ items: [{ id: 'r2' }], totalPages: 2 });

    const { locals } = makeRecipientsLocals({ userId: 'user12345', getList });

    const response = await listRecipients({ locals } as any);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      status: 'success',
      data: [{ id: 'r1' }, { id: 'r2' }]
    });

    expect(getList).toHaveBeenNthCalledWith(1, 1, 100, {
      filter: 'user = "user12345"',
      sort: '-is_default,-created'
    });
    expect(getList).toHaveBeenNthCalledWith(2, 2, 100, {
      filter: 'user = "user12345"',
      sort: '-is_default,-created'
    });
  });

  it('POST with isDefault unsets existing defaults across pages before creating', async () => {
    const getList = vi
      .fn()
      .mockResolvedValueOnce({ items: [{ id: 'old1' }, { id: 'old2' }] })
      .mockResolvedValueOnce({ items: [] });
    const update = vi.fn().mockResolvedValue({});
    const create = vi.fn().mockResolvedValue({ id: 'new-recipient' });

    const { locals } = makeRecipientsLocals({
      userId: 'user"12345',
      getList,
      update,
      create
    });

    const request = new Request('http://localhost/api/recipients', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'Jane Doe',
        phone: '+15551234567',
        addressLine1: '123 Main St',
        city: 'Kingston',
        destination: 'JM',
        isDefault: true
      })
    });

    const response = await createRecipient({ request, locals } as any);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ status: 'success', data: { id: 'new-recipient' } });

    expect(getList).toHaveBeenNthCalledWith(1, 1, 100, {
      filter: 'user = "user\\"12345" && is_default = true',
      fields: 'id'
    });
    expect(getList).toHaveBeenNthCalledWith(2, 1, 100, {
      filter: 'user = "user\\"12345" && is_default = true',
      fields: 'id'
    });

    expect(update).toHaveBeenCalledTimes(2);
    expect(update).toHaveBeenCalledWith('old1', { is_default: false });
    expect(update).toHaveBeenCalledWith('old2', { is_default: false });

    expect(create).toHaveBeenCalledWith({
      user: 'user"12345',
      name: 'Jane Doe',
      phone: '+15551234567',
      address_line1: '123 Main St',
      address_line2: '',
      city: 'Kingston',
      destination: 'JM',
      delivery_instructions: '',
      is_default: true
    });
  });

  it('PATCH rejects invalid recipient IDs before hitting database', async () => {
    const { locals, getOne } = makeRecipientsLocals({ userId: 'user12345' });

    const request = new Request('http://localhost/api/recipients/bad', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Invalid' })
    });

    await expect(updateRecipient({ params: { id: 'bad!' }, request, locals } as any)).rejects.toMatchObject({
      status: 400
    });

    expect(getOne).not.toHaveBeenCalled();
  });

  it('PATCH with isDefault=true unsets other defaults and maps camelCase fields', async () => {
    const getOne = vi.fn().mockResolvedValue({ id: 'recipient001', user: 'user12345' });
    const getList = vi
      .fn()
      .mockResolvedValueOnce({ items: [{ id: 'other001' }, { id: 'other002' }] })
      .mockResolvedValueOnce({ items: [] });

    const update = vi
      .fn()
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ id: 'recipient001', is_default: true, name: 'Updated Name' });

    const { locals } = makeRecipientsLocals({ userId: 'user12345', getOne, getList, update });

    const request = new Request('http://localhost/api/recipients/recipient001', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'Updated Name',
        isDefault: true,
        deliveryInstructions: 'Leave at gate'
      })
    });

    const response = await updateRecipient({ params: { id: 'recipient001' }, request, locals } as any);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      status: 'success',
      data: { id: 'recipient001', is_default: true, name: 'Updated Name' }
    });

    expect(getList).toHaveBeenNthCalledWith(1, 1, 100, {
      filter: 'user = "user12345" && is_default = true && id != "recipient001"',
      fields: 'id'
    });

    expect(update).toHaveBeenNthCalledWith(1, 'other001', { is_default: false });
    expect(update).toHaveBeenNthCalledWith(2, 'other002', { is_default: false });
    expect(update).toHaveBeenNthCalledWith(3, 'recipient001', {
      name: 'Updated Name',
      is_default: true,
      delivery_instructions: 'Leave at gate'
    });
  });
});
