import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ClientResponseError } from 'pocketbase';
import type { ExceptionType, ExceptionStatus, ExceptionPriority } from '$lib/config/exceptions';

export interface Exception {
  id: string;
  package_id?: string;
  booking_id?: string;
  shipment_id?: string;
  type: ExceptionType;
  status: ExceptionStatus;
  priority: ExceptionPriority;
  description: string;
  resolution?: string;
  resolution_notes?: string;
  customer_notified: boolean;
  customer_notification_date?: string;
  assigned_to?: string;
  created_by: string;
  created: string;
  updated: string;
  // Expanded relations
  package?: {
    id: string;
    tracking_number: string;
    description: string;
  };
  booking?: {
    id: string;
    customer_name: string;
    customer_email: string;
    destination: string;
  };
  notes?: ExceptionNote[];
}

export interface ExceptionNote {
  id: string;
  exception_id: string;
  content: string;
  created_by: string;
  created_by_name?: string;
  created: string;
}

// GET - List exceptions with filtering
export const GET: RequestHandler = async ({ url, locals }) => {
  // Check authentication
  if (!locals.user) {
    throw error(401, { message: 'Authentication required' });
  }

  // Check role (admin or staff only)
  const isStaff = locals.user.role === 'admin' || locals.user.role === 'staff';
  if (!isStaff) {
    throw error(403, { message: 'Admin or staff access required' });
  }

  try {
    const status = url.searchParams.get('status') || 'all';
    const type = url.searchParams.get('type') || 'all';
    const priority = url.searchParams.get('priority') || 'all';
    const page = parseInt(url.searchParams.get('page') || '1');
    const perPage = parseInt(url.searchParams.get('perPage') || '20');
    const search = url.searchParams.get('search') || '';

    // Build filter
    const filters: string[] = [];
    
    if (status !== 'all') {
      filters.push(`status = "${status}"`);
    }
    
    if (type !== 'all') {
      filters.push(`type = "${type}"`);
    }
    
    if (priority !== 'all') {
      filters.push(`priority = "${priority}"`);
    }

    if (search) {
      filters.push(`(description ~ "${search}" || package.tracking_number ~ "${search}")`);
    }

    const filterString = filters.length > 0 ? filters.join(' && ') : '';

    // Check if exceptions collection exists, if not return mock data
    try {
      const result = await locals.pb.collection('exceptions').getList(page, perPage, {
        filter: filterString,
        sort: '-created',
        expand: 'package,booking,created_by,assigned_to'
      });

      const exceptions = result.items.map(item => ({
        id: item.id,
        package_id: item.package_id,
        booking_id: item.booking_id,
        shipment_id: item.shipment_id,
        type: item.type,
        status: item.status,
        priority: item.priority,
        description: item.description,
        resolution: item.resolution,
        resolution_notes: item.resolution_notes,
        customer_notified: item.customer_notified,
        customer_notification_date: item.customer_notification_date,
        assigned_to: item.assigned_to,
        created_by: item.created_by,
        created: item.created,
        updated: item.updated,
        package: item.expand?.package,
        booking: item.expand?.booking
      }));

      return json({
        status: 'success',
        data: {
          exceptions,
          totalItems: result.totalItems,
          totalPages: result.totalPages,
          page: result.page
        }
      });
    } catch (err) {
      // If collection doesn't exist, return empty data
      if (err instanceof ClientResponseError && err.status === 404) {
        return json({
          status: 'success',
          data: {
            exceptions: [],
            totalItems: 0,
            totalPages: 0,
            page: 1
          }
        });
      }
      throw err;
    }
  } catch (err) {
    console.error('[list_exceptions] Error:', err);
    if (err instanceof ClientResponseError) {
      throw error(err.status, { message: err.message });
    }
    throw error(500, { message: 'Failed to load exceptions' });
  }
};

// POST - Create new exception
export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    throw error(401, { message: 'Authentication required' });
  }

  const isStaff = locals.user.role === 'admin' || locals.user.role === 'staff';
  if (!isStaff) {
    throw error(403, { message: 'Admin or staff access required' });
  }

  try {
    const body = await request.json();
    
    const {
      package_id,
      booking_id,
      shipment_id,
      type,
      priority,
      description,
      assigned_to
    } = body;

    if (!type || !description) {
      throw error(400, { message: 'Type and description are required' });
    }

    const exceptionData = {
      package_id: package_id || null,
      booking_id: booking_id || null,
      shipment_id: shipment_id || null,
      type,
      status: 'open',
      priority: priority || 'medium',
      description,
      customer_notified: false,
      assigned_to: assigned_to || null,
      created_by: locals.user.id
    };

    const exception = await locals.pb.collection('exceptions').create(exceptionData);

    console.log('[create_exception]', {
      userId: locals.user.id,
      exceptionId: exception.id,
      type
    });

    return json({
      status: 'success',
      data: exception
    });
  } catch (err) {
    console.error('[create_exception] Error:', err);
    if (err instanceof ClientResponseError) {
      throw error(err.status, { message: err.message });
    }
    throw error(500, { message: 'Failed to create exception' });
  }
};

// PATCH - Update exception
export const PATCH: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    throw error(401, { message: 'Authentication required' });
  }

  const isStaff = locals.user.role === 'admin' || locals.user.role === 'staff';
  if (!isStaff) {
    throw error(403, { message: 'Admin or staff access required' });
  }

  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      throw error(400, { message: 'Exception ID is required' });
    }

    // Allowed fields to update
    const allowedFields = [
      'status',
      'priority',
      'description',
      'resolution',
      'resolution_notes',
      'customer_notified',
      'customer_notification_date',
      'assigned_to'
    ];

    const filteredData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    if (Object.keys(filteredData).length === 0) {
      throw error(400, { message: 'No valid fields to update' });
    }

    const exception = await locals.pb.collection('exceptions').update(id, filteredData);

    console.log('[update_exception]', {
      userId: locals.user.id,
      exceptionId: id,
      fields: Object.keys(filteredData)
    });

    return json({
      status: 'success',
      data: exception
    });
  } catch (err) {
    console.error('[update_exception] Error:', err);
    if (err instanceof ClientResponseError) {
      throw error(err.status, { message: err.message });
    }
    throw error(500, { message: 'Failed to update exception' });
  }
};

