import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { communicationService, type CreateCommunicationParams } from '$lib/services/communicationService';

// GET: Fetch communications for a user
export const GET: RequestHandler = async ({ url, locals }) => {
  if (!locals.user) {
    throw error(401, { message: 'Authentication required' });
  }

  const userId = url.searchParams.get('userId');
  const type = url.searchParams.get('type');
  const direction = url.searchParams.get('direction');
  const search = url.searchParams.get('search');
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '50');

  // Admins can view any user's communications, customers only their own
  const targetUserId = userId || locals.user.id;
  const isAdmin = locals.user.role === 'admin' || locals.user.role === 'staff';
  
  if (!isAdmin && targetUserId !== locals.user.id) {
    throw error(403, { message: 'Access denied' });
  }

  try {
    if (search) {
      const results = await communicationService.searchCommunications(targetUserId, search);
      return json({
        status: 'success',
        data: {
          items: results,
          totalItems: results.length,
          totalPages: 1
        }
      });
    }

    const result = await communicationService.getUserCommunications(targetUserId, {
      type: type as any,
      direction: direction as any,
      page,
      limit
    });

    return json({
      status: 'success',
      data: result
    });
  } catch (err: any) {
    console.error('[get_communications] Error:', err);
    throw error(500, { message: 'Failed to fetch communications' });
  }
};

// POST: Create a new communication log entry
export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    throw error(401, { message: 'Authentication required' });
  }

  try {
    const body = await request.json();
    const { userId, type, content, direction, subject, metadata } = body;

    // Validate required fields
    if (!userId || !type || !content || !direction) {
      throw error(400, { message: 'Missing required fields: userId, type, content, direction' });
    }

    // Check permissions
    const isAdmin = locals.user.role === 'admin' || locals.user.role === 'staff';
    if (!isAdmin && userId !== locals.user.id) {
      throw error(403, { message: 'Access denied' });
    }

    const params: CreateCommunicationParams = {
      userId,
      type,
      content,
      direction,
      subject,
      sentBy: direction === 'outbound' || direction === 'internal' ? locals.user.id : undefined,
      metadata
    };

    const communication = await communicationService.createCommunication(params);

    console.log('[create_communication]', {
      userId: locals.user.id,
      targetUserId: userId,
      type,
      direction
    });

    return json({
      status: 'success',
      data: communication
    });
  } catch (err: any) {
    console.error('[create_communication] Error:', err);
    if (err.status) throw err;
    throw error(500, { message: 'Failed to create communication' });
  }
};

// PATCH: Update a communication (e.g., mark as opened)
export const PATCH: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    throw error(401, { message: 'Authentication required' });
  }

  try {
    const body = await request.json();
    const { id, action } = body;

    if (!id) {
      throw error(400, { message: 'Communication ID required' });
    }

    if (action === 'mark_opened') {
      const communication = await communicationService.markAsOpened(id);
      return json({
        status: 'success',
        data: communication
      });
    }

    throw error(400, { message: 'Invalid action' });
  } catch (err: any) {
    console.error('[update_communication] Error:', err);
    if (err.status) throw err;
    throw error(500, { message: 'Failed to update communication' });
  }
};

