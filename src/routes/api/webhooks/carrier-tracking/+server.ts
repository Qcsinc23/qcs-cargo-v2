import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';

// Webhook signature verification (if carrier supports it)
const verifyWebhookSignature = (body: string, signature: string, secret: string): boolean => {
  // Implementation depends on the carrier's signature method
  // This is a placeholder for HMAC-SHA256 verification
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  return signature === expectedSignature;
};

// Common webhook payload schema (can be extended per carrier)
const carrierWebhookSchema = z.object({
  carrier: z.string(),
  tracking_number: z.string(),
  event_type: z.string(),
  timestamp: z.string().datetime(),
  location: z.string().optional(),
  status: z.string().optional(),
  description: z.string().optional(),
  estimated_delivery: z.string().datetime().optional(),
  metadata: z.record(z.any()).optional()
});

// Carrier-specific transformations
const transformCarrierData = (carrier: string, payload: any): any => {
  switch (carrier.toLowerCase()) {
    case 'fedex':
      return transformFedExData(payload);
    case 'ups':
      return transformUPSData(payload);
    case 'dhl':
      return transformDHLData(payload);
    case 'usps':
      return transformUSPSData(payload);
    default:
      return payload;
  }
};

const transformFedExData = (payload: any) => {
  // FedEx-specific transformation logic
  return {
    tracking_number: payload.trackingNumber,
    event_type: payload.eventType?.toLowerCase().replace(/\s+/g, '_'),
    timestamp: payload.timestamp,
    location: payload.location?.city && payload.location?.state
      ? `${payload.location.city}, ${payload.location.state}`
      : 'Unknown',
    status: payload.statusCode,
    description: payload.eventDescription,
    metadata: {
      carrier: 'fedex',
      raw_event: payload
    }
  };
};

const transformUPSData = (payload: any) => {
  // UPS-specific transformation logic
  return {
    tracking_number: payload.trackingNumber,
    event_type: payload.activity?.[0]?.status?.code?.toLowerCase().replace(/\s+/g, '_'),
    timestamp: payload.activity?.[0]?.date + ' ' + payload.activity?.[0]?.time,
    location: payload.activity?.[0]?.location?.address?.city,
    status: payload.activity?.[0]?.status?.type,
    description: payload.activity?.[0]?.status?.description,
    metadata: {
      carrier: 'ups',
      raw_event: payload
    }
  };
};

const transformDHLData = (payload: any) => {
  // DHL-specific transformation logic
  return {
    tracking_number: payload.shipments?.[0]?.id,
    event_type: payload.shipments?.[0]?.events?.[0]?.code?.toLowerCase().replace(/\s+/g, '_'),
    timestamp: payload.shipments?.[0]?.events?.[0]?.timestamp,
    location: payload.shipments?.[0]?.events?.[0]?.location?.address?.addressLocality,
    status: payload.shipments?.[0]?.status?.statusCode,
    description: payload.shipments?.[0]?.events?.[0]?.description,
    metadata: {
      carrier: 'dhl',
      raw_event: payload
    }
  };
};

const transformUSPSData = (payload: any) => {
  // USPS-specific transformation logic
  return {
    tracking_number: payload.trackInfo?.[0]?.trackNumber,
    event_type: payload.trackInfo?.[0]?.event?.[0]?.eventCode?.toLowerCase().replace(/\s+/g, '_'),
    timestamp: payload.trackInfo?.[0]?.event?.[0]?.eventDate + ' ' + payload.trackInfo?.[0]?.event?.[0]?.eventTime,
    location: payload.trackInfo?.[0]?.event?.[0]?.eventCity,
    status: payload.trackInfo?.[0]?.event?.[0]?.eventCode,
    description: payload.trackInfo?.[0]?.event?.[0]?.eventDescription,
    metadata: {
      carrier: 'usps',
      raw_event: payload
    }
  };
};

export const POST: RequestHandler = async ({ request, locals }) => {
  const correlationId = locals.correlationId || crypto.randomUUID();
  const webhookSecret = process.env.CARRIER_WEBHOOK_SECRET;

  try {
    // Get raw body for signature verification
    const body = await request.text();
    let payload;

    try {
      payload = JSON.parse(body);
    } catch (parseErr) {
      console.error('[carrier_webhook] Invalid JSON', { correlationId, body: body.substring(0, 200) });
      throw error(400, { message: 'Invalid JSON payload' });
    }

    // Verify webhook signature if available
    const signature = request.headers.get('x-signature') || request.headers.get('signature');
    if (webhookSecret && signature) {
      if (!verifyWebhookSignature(body, signature, webhookSecret)) {
        console.error('[carrier_webhook] Invalid signature', { correlationId });
        throw error(401, { message: 'Invalid webhook signature' });
      }
    }

    // Transform carrier-specific data to standard format
    const carrier = payload.carrier || request.headers.get('x-carrier') || 'unknown';
    const transformedPayload = transformCarrierData(carrier, payload);

    // Validate transformed payload
    const validationResult = carrierWebhookSchema.safeParse(transformedPayload);
    if (!validationResult.success) {
      console.error('[carrier_webhook] Validation error', {
        correlationId,
        errors: validationResult.error.errors,
        carrier
      });
      throw error(400, { message: 'Invalid webhook payload format' });
    }

    const webhookData = validationResult.data;

    // Find shipment by tracking number
    let shipment;
    try {
      shipment = await locals.pb.collection('shipments').getFirstListItem(
        `tracking_number = "${webhookData.tracking_number}"`
      );
    } catch (findErr) {
      console.log('[carrier_webhook] Shipment not found', {
        correlationId,
        trackingNumber: webhookData.tracking_number,
        carrier
      });
      // Return success to avoid duplicate webhook attempts
      return json({ success: true, message: 'Webhook received (shipment not found)' });
    }

    // Create tracking event entry
    const eventEntry = {
      event_id: crypto.randomUUID(),
      event_type: webhookData.event_type,
      location: webhookData.location || 'Unknown',
      description: webhookData.description || null,
      notes: null,
      timestamp: webhookData.timestamp,
      created_by: null, // System generated
      metadata: {
        ...webhookData.metadata,
        carrier_webhook: true,
        correlationId
      }
    };

    // Parse existing status history or create new array
    const statusHistory = Array.isArray(shipment.status_history)
      ? [...shipment.status_history, eventEntry]
      : [eventEntry];

    // Prepare update data
    const updateData: Record<string, unknown> = {
      status_history: statusHistory
    };

    // Update current location if provided
    if (webhookData.location) {
      updateData.current_location = webhookData.location;
    }

    // Update estimated delivery if provided
    if (webhookData.estimated_delivery) {
      updateData.estimated_delivery = webhookData.estimated_delivery;
    }

    // Map event type to shipment status
    const statusMap: Record<string, string> = {
      received: 'received',
      pickup: 'processing',
      in_transit: 'in_transit',
      customs: 'customs',
      out_for_delivery: 'out_for_delivery',
      delivered: 'delivered',
      exception: 'exception',
      returned: 'returned',
      delivery_attempt: 'exception'
    };

    if (statusMap[webhookData.event_type]) {
      updateData.status = statusMap[webhookData.event_type];

      // Set delivered_at timestamp if delivered
      if (webhookData.event_type === 'delivered') {
        updateData.delivered_at = webhookData.timestamp;
      }
    }

    const updatedShipment = await locals.pb.collection('shipments').update(shipment.id, updateData);

    console.log('[carrier_webhook] Shipment updated', {
      correlationId,
      trackingNumber: webhookData.tracking_number,
      carrier,
      eventType: webhookData.event_type,
      newStatus: updateData.status
    });

    // Log webhook event
    try {
      await locals.pb.collection('activity_logs').create({
        user: null,
        action: 'carrier.webhook_update',
        resource_type: 'shipments',
        resource_id: shipment.id,
        metadata: {
          carrier,
          tracking_number: webhookData.tracking_number,
          event_type: webhookData.event_type,
          location: webhookData.location,
          timestamp: webhookData.timestamp
        }
      });
    } catch (logErr) {
      console.error('[carrier_webhook] Failed to log action:', logErr);
    }

    // Trigger real-time update (WebSocket or Server-Sent Events)
    // This would depend on your real-time implementation
    try {
      // Example: Send update through WebSocket
      // locals.broadcastChannel.send(JSON.stringify({
      //   type: 'shipment_update',
      //   trackingNumber: webhookData.tracking_number,
      //   event: eventEntry
      // }));
    } catch (realtimeErr) {
      console.error('[carrier_webhook] Failed to send real-time update:', realtimeErr);
    }

    return json({
      success: true,
      data: {
        shipmentId: shipment.id,
        trackingNumber: webhookData.tracking_number,
        status: updateData.status,
        eventId: eventEntry.event_id
      }
    });

  } catch (err) {
    console.error('[carrier_webhook] Error', { correlationId, error: err });

    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }

    throw error(500, { message: 'Webhook processing failed' });
  }
};

// GET endpoint for webhook verification (health check)
export const GET: RequestHandler = async () => {
  return json({
    status: 'active',
    timestamp: new Date().toISOString(),
    message: 'Carrier webhook endpoint is active'
  });
};