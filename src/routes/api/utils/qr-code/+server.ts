import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { qrCodeGenerator } from '$lib/utils/qr-code';

export const POST: RequestHandler = async ({ request, locals }) => {
  // Require authentication (any user role can generate QR codes)
  if (!locals.user) {
    throw error(401, { message: 'Authentication required' });
  }

  const correlationId = locals.correlationId || crypto.randomUUID();

  try {
    const body = await request.json();
    const { type, data, options } = body;

    if (!type || !data) {
      throw error(400, { message: 'Type and data are required' });
    }

    let result;

    switch (type) {
      case 'tracking':
        if (!data.trackingNumber) {
          throw error(400, { message: 'Tracking number is required for tracking QR codes' });
        }
        result = await qrCodeGenerator.generatePackageQR(data.trackingNumber, options);
        break;

      case 'detailed':
        if (!data.trackingNumber) {
          throw error(400, { message: 'Tracking number is required for detailed QR codes' });
        }
        result = await qrCodeGenerator.generateDetailedQR(data, options);
        break;

      case 'batch':
        if (!data.trackingNumbers || !Array.isArray(data.trackingNumbers)) {
          throw error(400, { message: 'Array of tracking numbers is required for batch generation' });
        }
        result = await qrCodeGenerator.generateBatchQR(data.trackingNumbers, options);
        break;

      case 'shipping-label':
        if (!data.trackingNumber) {
          throw error(400, { message: 'Tracking number is required for shipping labels' });
        }
        result = await qrCodeGenerator.generateShippingLabel(data, options);
        break;

      default:
        throw error(400, { message: 'Invalid QR code type' });
    }

    console.log('[qr_code_generation]', {
      correlationId,
      userId: locals.user.id,
      type,
      trackingNumber: data.trackingNumber || 'batch',
      success: true
    });

    return json({
      success: true,
      data: result
    });

  } catch (err) {
    console.error('[qr_code_generation_error]', {
      correlationId,
      userId: locals.user?.id,
      error: err
    });

    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }

    throw error(500, { message: 'Failed to generate QR code' });
  }
};

// GET endpoint for QR code validation
export const GET: RequestHandler = async ({ url, locals }) => {
  const trackingNumber = url.searchParams.get('tracking');
  const correlationId = locals.correlationId || crypto.randomUUID();

  try {
    if (!trackingNumber) {
      throw error(400, { message: 'Tracking number parameter is required' });
    }

    // Generate a simple tracking QR code
    const qrCode = await qrCodeGenerator.generatePackageQR(trackingNumber, {
      size: 256
    });

    return json({
      success: true,
      data: {
        trackingNumber,
        qrCode,
        trackingUrl: `${locals.pb.baseUrl}/track/${trackingNumber}`
      }
    });

  } catch (err) {
    console.error('[qr_code_get_error]', {
      correlationId,
      trackingNumber,
      error: err
    });

    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }

    throw error(500, { message: 'Failed to generate QR code' });
  }
};