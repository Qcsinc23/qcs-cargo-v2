# SMS Notification System Documentation

## Overview

QCS Cargo now supports SMS notifications for shipment updates using Twilio. This system provides real-time updates to customers about their shipment status, booking confirmations, and important alerts.

## Features

- **Real-time Shipment Updates**: Automatic SMS notifications for shipment status changes
- **Booking Confirmations**: Instant SMS when booking is confirmed and payment is processed
- **Phone Number Verification**: Secure verification of user phone numbers
- **User Preferences**: Granular control over which notifications to receive via SMS
- **Rate Limiting**: Built-in protection against SMS spam
- **Delivery Tracking**: Track SMS delivery status through Twilio webhooks
- **Unified Notifications**: Seamless integration with existing email notification system

## Architecture

### Core Components

1. **SMS Service** (`src/lib/server/sms/index.ts`)
   - Twilio SDK integration
   - Rate limiting (10 SMS per minute per number)
   - Phone number validation
   - Error handling

2. **SMS Templates** (`src/lib/server/sms/templates.ts`)
   - Pre-defined templates for all notification types
   - Auto-truncation to fit SMS length limits
   - Dynamic content insertion

3. **Unified Notification Service** (`src/lib/server/notifications/index.ts`)
   - Coordinates email and SMS sending
   - User preference management
   - Notification logging

4. **API Endpoints**
   - Phone verification (`/api/sms/send-verification`, `/api/sms/verify`)
   - Preferences management (`/api/sms/preferences`)
   - Webhook handler (`/api/webhooks/sms/status`)

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=AC_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
```

To get these values:
1. Sign up for a Twilio account at https://twilio.com
2. Create a new project
3. Get your Account SID and Auth Token from the dashboard
4. Purchase a phone number or use the trial number

### Twilio Phone Number Requirements

- Must be a US/Canada number for SMS functionality
- Should be configured for SMS in the Twilio console
- For production, consider purchasing a dedicated number

## Database Schema Updates

### Users Collection
- `phone_verified`: Boolean flag for verified phone numbers
- `phone_verification_code`: Temporary verification code
- `phone_verification_expires`: Expiration timestamp for verification code
- `sms_enabled`: Master switch for SMS notifications
- `sms_notifications`: JSON object with granular preferences

### Notification Logs Collection
- Tracks all sent notifications (email and SMS)
- Includes delivery status, timestamps, and error messages
- Links to bookings and shipments for context

## API Reference

### Phone Verification

#### Send Verification Code
```http
POST /api/sms/send-verification
Content-Type: application/json

{
  "phone": "+1234567890"
}
```

#### Verify Code
```http
POST /api/sms/verify
Content-Type: application/json

{
  "code": "123456"
}
```

### Notification Preferences

#### Get Preferences
```http
GET /api/sms/preferences
```

#### Update Preferences
```http
PUT /api/sms/preferences
Content-Type: application/json

{
  "email": {
    "booking": true,
    "shipment": true,
    "payment": false,
    "marketing": false
  },
  "sms": {
    "booking": true,
    "shipment": true,
    "payment": true,
    "marketing": false
  },
  "smsEnabled": true
}
```

## Notification Types

### 1. Booking Confirmation
- Triggered when payment is successfully processed
- Includes booking ID, destination, and tracking numbers
- Sent to both email and SMS (if enabled)

### 2. Shipment Status Updates
- Triggered when admin updates shipment status
- Statuses: Received, Processing, In Transit, Customs, Out for Delivery, Delivered, Exception
- Includes tracking number and location (if available)

### 3. Out for Delivery Alert
- Special notification when shipment is out for delivery
- Includes estimated delivery window

### 4. Delivery Confirmation
- Triggered when shipment is marked as delivered
- Includes delivery time confirmation

### 5. Exception Alerts
- High-priority notifications for delivery issues
- Includes action required information

### 6. ETA Updates
- Updates when estimated delivery date changes

## Rate Limiting

- **Per Number**: 10 SMS per minute
- **Global**: Configurable limits via SMS service
- **Verification**: Max 3 attempts per hour
- **Cleanup**: Automatic cleanup of expired rate limits every 5 minutes

## Security Considerations

1. **Phone Verification**: Required before sending SMS notifications
2. **User Consent**: Users must opt-in to receive SMS notifications
3. **Code Expiration**: Verification codes expire after 10 minutes
4. **Rate Limiting**: Prevents SMS spam and abuse
5. **Input Validation**: All phone numbers are validated and normalized

## Webhook Configuration

### SMS Status Webhook
Configure this URL in your Twilio console:
```
https://your-domain.com/api/webhooks/sms/status
```

This webhook receives:
- Message delivery status updates
- Error notifications
- Bounce handling

## Testing

### Local Development
1. Use Twilio's trial account for testing
2. Verified phone numbers can receive SMS
3. Test webhooks using ngrok for local development

### Test Scenarios
1. Phone number verification flow
2. Booking confirmation notifications
3. Shipment status updates
4. Rate limiting behavior
5. Error handling (invalid numbers, etc.)

## Monitoring and Logging

### Logs
- All SMS attempts are logged in `notification_logs` collection
- Includes Twilio message SID for tracking
- Error messages are captured for debugging

### Monitoring Metrics
- SMS delivery success rate
- Verification success rate
- Rate limiting statistics
- Error rates by type

## Best Practices

1. **Message Content**
   - Keep messages concise (under 160 characters)
   - Include tracking numbers when applicable
   - Use clear, actionable language

2. **Timing**
   - Send immediate confirmations
   - Batch status updates when possible
   - Respect user quiet hours (future enhancement)

3. **Error Handling**
   - Graceful degradation if SMS fails
   - Retry logic for temporary failures
   - Clear error messages for users

4. **User Experience**
   - Clear opt-in process
   - Easy preference management
   - Unsubscribe option included in messages

## Troubleshooting

### Common Issues

1. **SMS Not Sending**
   - Check Twilio credentials
   - Verify phone number format
   - Check rate limiting status

2. **Verification Codes Not Received**
   - Verify phone number is SMS-capable
   - Check if number is verified (for trial accounts)
   - Review rate limiting

3. **Webhook Not Receiving Updates**
   - Ensure webhook URL is publicly accessible
   - Check Twilio webhook configuration
   - Verify SSL certificate

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
```

This will provide detailed logs for all SMS operations.

## Future Enhancements

1. **MMS Support**: Send images of delivered packages
2. **Two-way Communication**: Allow users to reply to SMS for status updates
3. **International SMS**: Support for international phone numbers
4. **Scheduled Notifications**: Batch notifications during business hours
5. **SMS Analytics**: Detailed analytics on engagement rates
6. **Custom Templates**: Allow admins to customize SMS templates