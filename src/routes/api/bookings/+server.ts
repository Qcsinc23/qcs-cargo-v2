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
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/5b213dbc-91de-4ad8-8838-6c46ba2df294',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'bookings/+server.ts:19',message:'POST handler entry',data:{hasUser:!!locals.user,userId:locals.user?.id,userEmail:locals.user?.email,pbAuthValid:locals.pb?.authStore?.isValid,pbIsAdmin:locals.pb?.authStore?.isAdmin},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  if (!locals.user) {
    throw error(401, { message: 'Authentication required' });
  }

  const correlationId = locals.correlationId || crypto.randomUUID();

  try {
    const body = await request.json();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/5b213dbc-91de-4ad8-8838-6c46ba2df294',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'bookings/+server.ts:28',message:'Request body parsed',data:{hasServiceType:!!body.serviceType,hasDestination:!!body.destination,hasScheduledDate:!!body.scheduledDate,hasTimeSlot:!!body.timeSlot,packageCount:body.packages?.length,hasRecipientId:!!body.recipientId,hasNewRecipient:!!body.recipient,hasQuote:!!body.quote},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/5b213dbc-91de-4ad8-8838-6c46ba2df294',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'bookings/+server.ts:54',message:'Before recipient handling',data:{hasRecipientId:!!recipientId,hasNewRecipient:!!newRecipient,userId:locals.user.id},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    if (!recipientId && newRecipient) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5b213dbc-91de-4ad8-8838-6c46ba2df294',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'bookings/+server.ts:57',message:'Creating new recipient',data:{userId:locals.user.id,recipientName:newRecipient.name,recipientPhone:newRecipient.phone,hasAddress:!!newRecipient.addressLine1},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
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
          is_default: newRecipient.saveForFuture && !recipientId
        });
        finalRecipientId = createdRecipient.id;
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5b213dbc-91de-4ad8-8838-6c46ba2df294',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'bookings/+server.ts:69',message:'Recipient created successfully',data:{recipientId:finalRecipientId},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
      } catch (recipientErr: any) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5b213dbc-91de-4ad8-8838-6c46ba2df294',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'bookings/+server.ts:72',message:'Recipient creation failed',data:{errorType:recipientErr?.constructor?.name,errorMessage:recipientErr?.message,errorStatus:recipientErr?.status,errorCode:recipientErr?.response?.code,errorData:recipientErr?.response?.data,userId:locals.user.id},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        throw recipientErr;
      }

      console.log('[create_booking] Created new recipient', {
        correlationId,
        recipientId: finalRecipientId
      });
    }

    // Transform service type to match database schema
    const dbServiceType = serviceType === 'door-to-door' ? 'door_to_door' : serviceType;
    // #region agent log
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
    fetch('http://127.0.0.1:7242/ingest/5b213dbc-91de-4ad8-8838-6c46ba2df294',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'bookings/+server.ts:80',message:'Before booking creation',data:{userId:bookingData.user,hasRecipient:!!bookingData.recipient,serviceType:bookingData.service_type,destination:bookingData.destination,scheduledDate:bookingData.scheduled_date,timeSlot:bookingData.time_slot,packageCount:bookingData.package_count,totalCost:bookingData.total_cost},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
    // #endregion

    // Create booking record
    let booking;
    try {
      booking = await locals.pb.collection('bookings').create(bookingData);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5b213dbc-91de-4ad8-8838-6c46ba2df294',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'bookings/+server.ts:120',message:'Booking created successfully',data:{bookingId:booking.id},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
    } catch (bookingErr: any) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5b213dbc-91de-4ad8-8838-6c46ba2df294',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'bookings/+server.ts:123',message:'Booking creation failed',data:{errorType:bookingErr?.constructor?.name,errorMessage:bookingErr?.message,errorStatus:bookingErr?.status,errorCode:bookingErr?.response?.code,errorData:bookingErr?.response?.data,bookingData},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      throw bookingErr;
    }

    console.log('[create_booking] Booking created', {
      correlationId,
      bookingId: booking.id
    });

    // Create package records
    const createdPackages = [];
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/5b213dbc-91de-4ad8-8838-6c46ba2df294',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'bookings/+server.ts:105',message:'Before package creation loop',data:{packageCount:packages.length,bookingId:booking.id},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    for (let i = 0; i < packages.length; i++) {
      const pkg = packages[i];
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5b213dbc-91de-4ad8-8838-6c46ba2df294',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'bookings/+server.ts:107',message:'Creating package',data:{packageIndex:i,bookingId:booking.id,hasWeight:!!pkg.weight,weight:pkg.weight,hasDimensions:!!(pkg.length&&pkg.width&&pkg.height)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
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
        billable_weight: pkg.billableWeight || pkg.weight,
        declared_value: pkg.declaredValue,
        contents_description: pkg.contentsDescription || '',
        special_instructions: pkg.specialInstructions || '',
        cost: pkg.cost || 0
      };
      const createdPkg = await locals.pb.collection('packages').create(packageData);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5b213dbc-91de-4ad8-8838-6c46ba2df294',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'bookings/+server.ts:127',message:'Package created successfully',data:{packageId:createdPkg.id,packageIndex:i,trackingNumber},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
      // #endregion

      createdPackages.push({
        id: createdPkg.id,
        trackingNumber,
        qrCode
      });
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
    // #region agent log
    const errorData: any = { correlationId };
    if (err && typeof err === 'object') {
      errorData.errorType = err.constructor?.name;
      errorData.errorMessage = (err as any)?.message;
      errorData.errorStatus = (err as any)?.status;
      errorData.errorCode = (err as any)?.response?.code;
      errorData.errorData = (err as any)?.response?.data;
      errorData.errorResponse = (err as any)?.response?.message;
      errorData.errorFull = JSON.stringify(err, Object.getOwnPropertyNames(err));
    }
    fetch('http://127.0.0.1:7242/ingest/5b213dbc-91de-4ad8-8838-6c46ba2df294',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'bookings/+server.ts:190',message:'Booking creation error caught',data:errorData,timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
    
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




