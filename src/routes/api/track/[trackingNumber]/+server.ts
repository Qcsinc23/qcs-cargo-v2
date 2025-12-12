import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals, url }) => {
  const { trackingNumber } = params;
  const correlationId = locals.correlationId || crypto.randomUUID();

  // Parse query parameters
  const includeDetails = url.searchParams.get('details') !== 'false';
  const includeTimeline = url.searchParams.get('timeline') !== 'false';

  try {
    // Validate tracking number format
    if (!trackingNumber || trackingNumber.length < 6) {
      throw error(400, { message: 'Invalid tracking number format' });
    }

    // Find shipment by tracking number
    let shipment;
    try {
      shipment = await locals.pb.collection('shipments').getFirstListItem(`tracking_number = "${trackingNumber}"`, {
        expand: 'user, booking, package'
      });
    } catch (fetchErr: any) {
      if (fetchErr.status === 404) {
        throw error(404, { message: 'Tracking number not found' });
      }
      throw fetchErr;
    }

    // Build response
    const response: Record<string, any> = {
      trackingNumber: shipment.tracking_number,
      status: shipment.status,
      currentLocation: shipment.current_location || 'Unknown',
      estimatedDelivery: shipment.estimated_delivery || null,
      deliveredAt: shipment.delivered_at || null,
      lastUpdated: shipment.updated
    };

    // Add package details if requested
    if (includeDetails && shipment.expand?.package) {
      const pkg = shipment.expand.package;
      response.package = {
        weight: pkg.weight || 'Unknown',
        dimensions: (pkg.length && pkg.width && pkg.height)
          ? `${pkg.length}x${pkg.width}x${pkg.height} cm`
          : 'Unknown',
        declaredValue: pkg.declared_value || null,
        contentsDescription: pkg.contents_description || null
      };
    }

    // Add recipient information
    response.recipient = {
      name: shipment.recipient_name,
      phone: shipment.recipient_phone || null,
      address: shipment.recipient_address || null,
      destination: shipment.destination
    };

    // Build timeline of events if requested
    if (includeTimeline) {
      const timeline = [];

      // Add initial status
      timeline.push({
        status: 'created',
        timestamp: shipment.created,
        location: 'Origin',
        description: 'Shipment created'
      });

      // Add status history if available
      if (shipment.status_history && Array.isArray(shipment.status_history)) {
        shipment.status_history.forEach((event: any) => {
          const statusDescriptions: Record<string, string> = {
            received: 'Package received at warehouse',
            processing: 'Package being processed',
            in_transit: 'Package in transit',
            customs: 'Package at customs',
            out_for_delivery: 'Out for delivery',
            delivered: 'Package delivered',
            exception: 'Delivery exception',
            returned: 'Package returned'
          };

          timeline.push({
            status: event.status,
            timestamp: event.timestamp,
            location: event.location || shipment.current_location || 'Unknown',
            description: statusDescriptions[event.status] || event.status,
            notes: event.notes || null
          });
        });
      }

      // Sort timeline by timestamp
      timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      response.timeline = timeline;
    }

    // Log tracking lookup (non-sensitive data only)
    console.log('[public_tracking_lookup]', {
      correlationId,
      trackingNumber,
      status: shipment.status,
      ip: 'unknown' // clientIP not available in Locals
    });

    return json({
      success: true,
      data: response
    });

  } catch (err) {
    console.error('[public_tracking_error]', {
      correlationId,
      trackingNumber,
      error: err
    });

    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }

    throw error(500, {
      message: 'Failed to retrieve tracking information',
      code: 'TRACKING_LOOKUP_ERROR'
    });
  }
};

// Enable CORS for public endpoint
export const OPTIONS: RequestHandler = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};