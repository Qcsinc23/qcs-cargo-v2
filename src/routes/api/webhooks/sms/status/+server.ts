import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { pb } from '$lib/server/index';

export const POST: RequestHandler = async ({ request }) => {
  try {
    // Parse Twilio webhook data
    const formData = await request.formData();
    const messageSid = formData.get('MessageSid') as string;
    const messageStatus = formData.get('MessageStatus') as string;
    const errorCode = formData.get('ErrorCode') as string;
    const errorMessage = formData.get('ErrorMessage') as string;
    const to = formData.get('To') as string;
    const from = formData.get('From') as string;

    console.log(`[SMS Webhook] Status update: ${messageSid} - ${messageStatus}`);

    // Find the notification log for this SMS
    try {
      const logs = await pb.collection('notification_logs').getList(1, 1, {
        filter: `provider_id = "${messageSid}" && type = "sms"`,
        sort: '-created'
      });

      if (logs.totalItems > 0) {
        const log = logs.items[0];
        let status: 'sent' | 'delivered' | 'failed' | 'bounced' = 'sent';

        // Map Twilio status to our status
        switch (messageStatus) {
          case 'queued':
          case 'sent':
            status = 'sent';
            break;
          case 'delivered':
            status = 'delivered';
            break;
          case 'undelivered':
          case 'failed':
            status = 'failed';
            break;
          default:
            status = 'sent';
        }

        // Update the notification log
        await pb.collection('notification_logs').update(log.id, {
          status,
          error_message: errorMessage || null,
          delivered_at: status === 'delivered' ? new Date().toISOString() : null,
          metadata: {
            ...log.metadata,
            twilio_status: messageStatus,
            twilio_error_code: errorCode,
            webhook_received: new Date().toISOString()
          }
        });

        console.log(`[SMS Webhook] Updated log ${log.id} with status ${status}`);
      } else {
        console.warn(`[SMS Webhook] No notification log found for SMS SID: ${messageSid}`);
      }
    } catch (dbError) {
      console.error('[SMS Webhook] Database error:', dbError);
    }

    // Return TwiML response to acknowledge receipt
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Status update received</Message>
</Response>`;

    return new Response(twiml, {
      headers: {
        'Content-Type': 'text/xml'
      }
    });
  } catch (error) {
    console.error('[SMS Webhook Error]', error);
    // Still return 200 to Twilio to avoid retries
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response></Response>`;

    return new Response(twiml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml'
      }
    });
  }
};

// Handle GET requests for webhook verification
export const GET: RequestHandler = async () => {
  return json({
    status: 'active',
    service: 'sms-status-webhook',
    timestamp: new Date().toISOString()
  });
};