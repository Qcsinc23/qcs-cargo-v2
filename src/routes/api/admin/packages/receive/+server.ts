import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { escapePbFilterValue, sanitizePocketBaseId, sanitizeTrackingNumber } from '$lib/server/pb-filter';

const RECEIVABLE_BOOKING_STATUSES = new Set(['confirmed', 'in_progress']);

function toPositiveNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return null;
}

function buildConditionNote(condition: unknown, notes: unknown): string {
  const trimmedNotes = typeof notes === 'string' ? notes.trim() : '';

  if (condition === 'damaged') {
    return `[DAMAGED] ${trimmedNotes || 'Package received in damaged condition'}`;
  }

  if (condition === 'missing_contents') {
    return `[MISSING CONTENTS] ${trimmedNotes || 'Package appears to be missing contents'}`;
  }

  return trimmedNotes;
}

function safeString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    throw error(401, { message: 'Authentication required' });
  }

  if (!['admin', 'staff'].includes(locals.user.role)) {
    throw error(403, { message: 'Staff access required' });
  }

  const correlationId = locals.correlationId || crypto.randomUUID();

  try {
    const body = await request.json();
    const safeTrackingNumber = sanitizeTrackingNumber(String(body?.trackingNumber || ''));
    const safeBookingId = sanitizePocketBaseId(String(body?.bookingId || ''));
    const actualWeight = toPositiveNumber(body?.actualWeight);
    const length = toPositiveNumber(body?.length);
    const width = toPositiveNumber(body?.width);
    const height = toPositiveNumber(body?.height);
    const providedDimWeight = toPositiveNumber(body?.dimWeight);
    const providedBillableWeight = toPositiveNumber(body?.billableWeight);
    const condition = body?.condition;
    const notes = body?.notes;
    const offlineScanId = typeof body?.offlineScanId === 'string' ? body.offlineScanId : '';

    if (!safeTrackingNumber) {
      throw error(400, { message: 'Valid trackingNumber is required' });
    }

    if (!actualWeight) {
      throw error(400, { message: 'actualWeight must be a positive number' });
    }

    const dimWeight =
      length && width && height ? (length * width * height) / 166 : providedDimWeight;
    const billableWeight = providedBillableWeight || (dimWeight ? Math.max(actualWeight, dimWeight) : actualWeight);
    const conditionNote = buildConditionNote(condition, notes);

    let pkg: any = null;

    try {
      pkg = await locals.pb.collection('packages').getFirstListItem(
        `tracking_number = "${escapePbFilterValue(safeTrackingNumber)}"`,
        { expand: 'booking,booking.recipient' }
      );
    } catch (pkgErr: any) {
      if (pkgErr?.status !== 404) {
        throw pkgErr;
      }
    }

    let booking: any = null;

    if (pkg?.expand?.booking) {
      booking = pkg.expand.booking;
      if (safeBookingId && booking.id !== safeBookingId) {
        throw error(409, { message: 'trackingNumber does not belong to provided bookingId' });
      }
    } else {
      if (!safeBookingId) {
        throw error(404, { message: 'Package not found for trackingNumber and bookingId not provided' });
      }

      booking = await locals.pb.collection('bookings').getOne(safeBookingId, {
        expand: 'recipient'
      });
    }

    if (!booking?.id) {
      throw error(404, { message: 'Booking not found' });
    }

    const bookingStatus = safeString(booking.status);
    if (!RECEIVABLE_BOOKING_STATUSES.has(bookingStatus)) {
      throw error(400, {
        message: `Cannot receive packages for booking in '${bookingStatus || 'unknown'}' status`
      });
    }

    if (pkg) {
      const updateData: Record<string, unknown> = {
        weight: actualWeight,
        dim_weight: dimWeight || null,
        billable_weight: billableWeight,
        special_instructions: conditionNote
      };

      if (length) updateData.length = length;
      if (width) updateData.width = width;
      if (height) updateData.height = height;

      pkg = await locals.pb.collection('packages').update(pkg.id, updateData, {
        expand: 'booking,booking.recipient'
      });
    } else {
      pkg = await locals.pb.collection('packages').create(
        {
          booking: booking.id,
          tracking_number: safeTrackingNumber,
          weight: actualWeight,
          length: length || null,
          width: width || null,
          height: height || null,
          dim_weight: dimWeight || null,
          billable_weight: billableWeight,
          special_instructions: conditionNote,
          contents_description: ''
        },
        {
          expand: 'booking,booking.recipient'
        }
      );
    }

    const recipient = pkg.expand?.booking?.expand?.recipient || booking.expand?.recipient;
    const historyEntry = {
      status: 'received',
      timestamp: new Date().toISOString(),
      location: 'QCS Warehouse - Receiving',
      updated_by: locals.user.id,
      notes: conditionNote || null,
      metadata: {
        offline_scan_id: offlineScanId || null
      }
    };

    let shipment: any = null;

    try {
      shipment = await locals.pb.collection('shipments').getFirstListItem(
        `tracking_number = "${escapePbFilterValue(safeTrackingNumber)}"`
      );
    } catch (shipmentErr: any) {
      if (shipmentErr?.status !== 404) {
        throw shipmentErr;
      }
    }

    if (shipment) {
      const priorHistory = Array.isArray(shipment.status_history) ? shipment.status_history : [];
      shipment = await locals.pb.collection('shipments').update(shipment.id, {
        user: booking.user,
        booking: booking.id,
        package: pkg.id,
        destination: booking.destination,
        recipient_name: safeString(recipient?.name, 'Recipient'),
        recipient_phone: safeString(recipient?.phone, ''),
        recipient_address: [
          safeString(recipient?.address_line1, ''),
          safeString(recipient?.address_line2, ''),
          safeString(recipient?.city, '')
        ]
          .filter((part) => part.trim().length > 0)
          .join(', '),
        weight: actualWeight,
        actual_weight: actualWeight,
        status: 'received',
        current_location: 'QCS Warehouse - Receiving',
        status_history: [...priorHistory, historyEntry],
        notes: conditionNote || shipment.notes || ''
      });
    } else {
      shipment = await locals.pb.collection('shipments').create({
        user: booking.user,
        booking: booking.id,
        package: pkg.id,
        tracking_number: safeTrackingNumber,
        destination: booking.destination,
        recipient_name: safeString(recipient?.name, 'Recipient'),
        recipient_phone: safeString(recipient?.phone, ''),
        recipient_address: [
          safeString(recipient?.address_line1, ''),
          safeString(recipient?.address_line2, ''),
          safeString(recipient?.city, '')
        ]
          .filter((part) => part.trim().length > 0)
          .join(', '),
        weight: actualWeight,
        actual_weight: actualWeight,
        status: 'received',
        current_location: 'QCS Warehouse - Receiving',
        status_history: [historyEntry],
        notes: conditionNote || ''
      });
    }

    if (booking.status === 'confirmed') {
      await locals.pb.collection('bookings').update(booking.id, {
        status: 'in_progress'
      });
    }

    await locals.pb.collection('activity_logs').create({
      user: locals.user.id,
      action: 'package.received',
      resource_type: 'package',
      resource_id: pkg.id,
      metadata: {
        booking_id: booking.id,
        shipment_id: shipment.id,
        tracking_number: safeTrackingNumber,
        actual_weight: actualWeight,
        dim_weight: dimWeight,
        billable_weight: billableWeight,
        condition,
        offline_scan_id: offlineScanId || null
      }
    }).catch((logError) => {
      console.error('[receive_package] Failed to write activity log', { correlationId, logError });
    });

    console.log('[receive_package] Success', {
      correlationId,
      userId: locals.user.id,
      bookingId: booking.id,
      packageId: pkg.id,
      shipmentId: shipment.id,
      trackingNumber: safeTrackingNumber
    });

    return json({
      status: 'success',
      message: 'Package received successfully',
      data: {
        packageId: pkg.id,
        shipmentId: shipment.id,
        trackingNumber: safeTrackingNumber,
        actualWeight,
        dimWeight,
        billableWeight,
        bookingStatus: booking.status === 'confirmed' ? 'in_progress' : booking.status
      }
    });
  } catch (err) {
    console.error('[receive_package] Error', {
      correlationId,
      error: err
    });

    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }

    throw error(500, { message: 'Failed to receive package' });
  }
};
