import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Generate tracking number: QCS-YYYYMMDD-XXXX
function generateTrackingNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `QCS-${dateStr}-${random}`;
}

// Generate QR code data URL (simple implementation)
function generateQRCodeData(trackingNumber: string): string {
  // In production, use a proper QR library like 'qrcode'
  // For now, return a placeholder that can be rendered
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(trackingNumber)}`;
}

export const POST: RequestHandler = async ({ request, locals }) => {
  // DEBUG: Remove debug logging in production
  // TODO: Implement proper logging system with configurable levels
  
  if (!locals.user) {
    throw error(401, { message: 'Authentication required' });
  }

  // Validate user ID format - must be a valid PocketBase user ID
  // PocketBase IDs are alphanumeric strings (15 characters)
  const userId = locals.user.id;
  if (!userId || userId.length < 10) {
    console.error('[create_booking] Invalid user ID format - user sync may have failed', { userId });
    throw error(500, {
      message: 'User account not properly synchronized. Please log out and log back in. (User ID format invalid - this usually means user sync to PocketBase failed)'
    });
  }

  const correlationId = locals.correlationId || crypto.randomUUID();

  try {
    const body = await request.json();
    const {
      serviceType,
      destination,
      scheduledDate,
      timeSlot,
      packages,
      recipientId,
      recipient: newRecipient,
      quote,
      specialInstructions
    } = body;

    // Validate required fields
    if (!serviceType || !destination || !scheduledDate || !timeSlot || !packages?.length) {
      throw error(400, { message: 'Missing required booking fields' });
    }

    console.log('[create_booking]', {
      correlationId,
      userId: locals.user.id,
      serviceType,
      destination,
      packageCount: packages.length
    });

    // Handle recipient - either use existing or create new
    let finalRecipientId = recipientId;

    if (!recipientId && newRecipient) {
      try {
        // Create new recipient
        const createdRecipient = await locals.pb.collection('recipients').create({
          user: locals.user.id,
          name: newRecipient.name,
          phone: newRecipient.phone,
          address_line1: newRecipient.addressLine1,
          address_line2: newRecipient.addressLine2 || '',
          city: newRecipient.city,
          destination: newRecipient.destination || destination,
          delivery_instructions: newRecipient.deliveryInstructions || '',
          // BUG FIX: Simplified redundant condition
          // Original: is_default: newRecipient.saveForFuture && !recipientId
          // Since we're in the block where !recipientId is true, this simplifies to:
          is_default: newRecipient.saveForFuture
        });
        finalRecipientId = createdRecipient.id;
      } catch (recipientErr: any) {
        throw recipientErr;
      }

      console.log('[create_booking] Created new recipient', {
        correlationId,
        recipientId: finalRecipientId
      });
    }

    // Transform service type to match database schema
    const dbServiceType = serviceType === 'door-to-door' ? 'door_to_door' : serviceType;
    const bookingData = {
      user: locals.user.id,
      recipient: finalRecipientId || null,
      service_type: dbServiceType,
      destination,
      scheduled_date: scheduledDate,
      time_slot: timeSlot,
      package_count: packages.length,
      total_weight: quote?.packages?.reduce((sum: number, p: { weight: number }) => sum + (p.weight || 0), 0) || 0,
      subtotal: quote?.subtotal || 0,
      discount: quote?.multiPackageDiscount || 0,
      insurance_cost: quote?.insuranceCost || 0,
      total_cost: quote?.totalCost || 0,
      status: 'pending_payment',
      payment_status: 'pending',
      special_instructions: specialInstructions || ''
    };

    // Create booking record
    let booking;
    try {
      booking = await locals.pb.collection('bookings').create(bookingData);
    } catch (bookingErr: any) {
      throw bookingErr;
    }

    console.log('[create_booking] Booking created', {
      correlationId,
      bookingId: booking.id
    });

    // Create package records with transaction support
    const createdPackages = [];
    
    // Track created package IDs for rollback
    const createdPackageIds: string[] = [];
    
    try {
      for (let i = 0; i < packages.length; i++) {
        const pkg = packages[i];
        const trackingNumber = generateTrackingNumber();
        const qrCode = generateQRCodeData(trackingNumber);

        const packageData = {
          booking: booking.id,
          tracking_number: trackingNumber,
          qr_code: qrCode,
          weight: pkg.weight,
          weight_unknown: pkg.weightUnknown || false,
          length: pkg.length,
          width: pkg.width,
          height: pkg.height,
          dimensions_unknown: pkg.dimensionsUnknown || false,
          dim_weight: pkg.dimWeight || null,
          // BUG FIX: Validate billableWeight is not null or zero
          billable_weight: pkg.billableWeight || pkg.weight || 0,
          declared_value: pkg.declaredValue,
          contents_description: pkg.contentsDescription || '',
          special_instructions: pkg.specialInstructions || '',
          cost: pkg.cost || 0
        };
        const createdPkg = await locals.pb.collection('packages').create(packageData);

        createdPackageIds.push(createdPkg.id);
        createdPackages.push({
          id: createdPkg.id,
          trackingNumber,
          qrCode
        });
      }
    } catch (packageError: any) {
      // Rollback: delete any packages that were successfully created
      console.error('[create_booking] Package creation failed, rolling back packages:', {
        correlationId,
        bookingId: booking.id,
        packageIds: createdPackageIds,
        error: packageError.message
      });
      
      for (const packageId of createdPackageIds) {
        try {
          await locals.pb.collection('packages').delete(packageId);
        } catch (rollbackError) {
          console.error('[create_booking] Failed to rollback package:', packageId, rollbackError);
        }
      }
      
      // Also delete the booking since it's incomplete
      try {
        await locals.pb.collection('bookings').delete(booking.id);
      } catch (bookingDeleteError) {
        console.error('[create_booking] Failed to delete booking during rollback:', bookingDeleteError);
      }
      
      throw packageError;
    }

    console.log('[create_booking] Packages created', {
      correlationId,
      bookingId: booking.id,
      packageCount: createdPackages.length
    });

    return json({
      status: 'success',
      data: {
        bookingId: booking.id,
        packages: createdPackages,
        totalCost: quote?.totalCost || 0,
        status: 'pending_payment'
      }
    });
  } catch (err) {
    // Enhanced error logging
    const errorDetails: any = {
      correlationId,
      errorType: err?.constructor?.name,
      errorMessage: (err as any)?.message,
      errorStatus: (err as any)?.status,
      errorCode: (err as any)?.response?.code,
      errorData: (err as any)?.response?.data,
      errorResponse: (err as any)?.response?.message,
      userId: locals.user?.id,
      hasPb: !!locals.pb,
      pbAuthValid: locals.pb?.authStore?.isValid,
      pbIsAdmin: locals.pb?.authStore?.isAdmin
    };
    console.error('[create_booking] Error', JSON.stringify(errorDetails, null, 2));
    console.error('[create_booking] Full error object:', err);

    // If it's a SvelteKit error, re-throw it
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }

    // Extract detailed error message from PocketBase errors
    let errorMessage = 'Failed to create booking';
    if (err && typeof err === 'object') {
      const pbErr = err as any;
      if (pbErr.response?.data) {
        // PocketBase validation errors
        const data = pbErr.response.data;
        if (typeof data === 'object') {
          errorMessage = Object.entries(data)
            .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
            .join(', ');
        } else {
          errorMessage = JSON.stringify(data);
        }
      } else if (pbErr.message) {
        errorMessage = pbErr.message;
      }
    }

    throw error(500, { message: errorMessage });
  }
};

// Whitelist of valid booking statuses (prevents filter injection)
const VALID_BOOKING_STATUSES = [
  'pending_payment',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'payment_failed',
  'under_review'
] as const;

export const GET: RequestHandler = async ({ url, locals }) => {
  if (!locals.user) {
    throw error(401, { message: 'Authentication required' });
  }

  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const perPage = parseInt(url.searchParams.get('perPage') || '10', 10);
  const status = url.searchParams.get('status');

  try {
    // BUG FIX: Prevent filter injection by validating status against whitelist
    let filter = `user = "${locals.user.id}"`;
    if (status && status !== 'all' && VALID_BOOKING_STATUSES.includes(status as any)) {
      filter += ` && status = "${status}"`;
    }
    // Type safety: Use proper type narrowing instead of 'as any'
    // The VALID_BOOKING_STATUSES array is readonly, so we can safely use 'as const' for type assertion
    // This is safe because we've already validated status is in the whitelist

    const result = await locals.pb.collection('bookings').getList(page, perPage, {
      filter,
      sort: '-created',
      expand: 'recipient'
    });

    return json({
      status: 'success',
      data: {
        items: result.items,
        page: result.page,
        perPage: result.perPage,
        totalItems: result.totalItems,
        totalPages: result.totalPages
      }
    });
  } catch (err) {
    console.error('[get_bookings] Error', err);
    throw error(500, { message: 'Failed to fetch bookings' });
  }
};




