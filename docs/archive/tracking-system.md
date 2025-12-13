# QCS Cargo Real-Time Tracking System

## Overview

This document describes the comprehensive real-time tracking system implemented for QCS Cargo, providing public tracking capabilities, admin management tools, webhook integrations, and QR code generation.

## API Endpoints

### Public Tracking

#### GET `/api/track/[trackingNumber]`
Public endpoint for tracking shipments.

**Query Parameters:**
- `details` (optional): Include package details (default: true)
- `timeline` (optional): Include tracking timeline (default: true)

**Response:**
```json
{
  "success": true,
  "data": {
    "trackingNumber": "QCS123456789",
    "status": "in_transit",
    "currentLocation": "Miami, FL",
    "estimatedDelivery": "2024-01-15T00:00:00.000Z",
    "deliveredAt": null,
    "lastUpdated": "2024-01-10T10:30:00.000Z",
    "package": {
      "weight": 5.5,
      "dimensions": "30x20x15 cm",
      "declaredValue": 100,
      "contentsDescription": "Electronics"
    },
    "recipient": {
      "name": "John Doe",
      "phone": "+1-555-0123",
      "address": "123 Main St, Kingston, Jamaica",
      "destination": "Jamaica"
    },
    "timeline": [
      {
        "status": "created",
        "timestamp": "2024-01-09T09:00:00.000Z",
        "location": "Origin",
        "description": "Shipment created"
      },
      {
        "status": "received",
        "timestamp": "2024-01-09T14:30:00.000Z",
        "location": "Kearny, NJ",
        "description": "Package received at warehouse"
      }
    ]
  }
}
```

### Admin Management

All admin endpoints require authentication with `admin` or `staff` role.

#### PATCH `/api/admin/shipments/[id]/status`
Update shipment status (existing endpoint).

#### PATCH `/api/admin/shipments/[id]/location`
Update shipment current location.

**Request Body:**
```json
{
  "location": "Miami International Airport",
  "notes": "Package cleared customs",
  "notifyCustomer": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    // Updated shipment object
  }
}
```

#### GET `/api/admin/shipments/[id]/location`
Retrieve location history for a shipment.

#### POST `/api/admin/shipments/[id]/events`
Add a new tracking event to a shipment.

**Request Body:**
```json
{
  "event_type": "out_for_delivery",
  "location": "Kingston, Jamaica",
  "description": "Package out for final delivery",
  "notes": "Will arrive by 5 PM",
  "timestamp": "2024-01-10T08:00:00.000Z",
  "estimated_delivery": "2024-01-10T17:00:00.000Z",
  "notify_customer": true,
  "metadata": {
    "delivery_agent": "Agent John",
    "vehicle": "Van #123"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "shipment": {
      // Updated shipment object
    },
    "event": {
      // Created event object
    }
  }
}
```

#### GET `/api/admin/shipments/[id]/events`
Retrieve all tracking events for a shipment.

### Webhooks

#### POST `/api/webhooks/carrier-tracking`
Webhook endpoint for carrier tracking updates.

**Headers:**
- `x-signature`: Webhook signature for verification
- `x-carrier`: Carrier identifier (fedex, ups, dhl, usps)

**Supported Carriers:**
- FedEx
- UPS
- DHL
- USPS

**Request Body (example):**
```json
{
  "carrier": "fedex",
  "trackingNumber": "QCS123456789",
  "eventType": "IN_TRANSIT",
  "timestamp": "2024-01-10T10:00:00.000Z",
  "location": {
    "city": "Miami",
    "state": "FL"
  },
  "eventDescription": "Package in transit to destination"
}
```

### QR Code Generation

#### POST `/api/utils/qr-code`
Generate QR codes for packages.

**Request Body:**
```json
{
  "type": "tracking|detailed|batch|shipping-label",
  "data": {
    // Tracking data
  },
  "options": {
    "size": 256,
    "margin": 2,
    "errorCorrectionLevel": "M"
  }
}
```

**Types:**

1. **Tracking** - Simple QR code linking to public tracking page
2. **Detailed** - QR code with encoded package details for internal scanning
3. **Batch** - Generate multiple QR codes
4. **Shipping Label** - Generate printable shipping label with QR code

#### GET `/api/utils/qr-code`
Quick generation of tracking QR code.

**Query Parameters:**
- `tracking`: Tracking number

## Data Models

### Shipment Statuses
- `received` - Package received at warehouse
- `processing` - Package being processed
- `in_transit` - Package in transit
- `customs` - Package at customs
- `out_for_delivery` - Out for delivery
- `delivered` - Package delivered
- `exception` - Delivery exception
- `returned` - Package returned

### Tracking Events
- `pickup` - Package picked up
- `in_transit` - Package in transit
- `customs_clearance` - Customs clearance
- `out_for_delivery` - Out for delivery
- `delivery_attempt` - Delivery attempted
- `delivered` - Package delivered
- `exception` - Exception occurred
- `returned` - Package returned
- `delayed` - Package delayed
- `facility_arrival` - Arrived at facility
- `facility_departure` - Departed from facility

## Email Notifications

The system automatically sends email notifications for:

1. **Status Updates** - When shipment status changes
2. **Location Updates** - When current location changes
3. **Tracking Events** - When new tracking events are added

Email templates are located in `/src/lib/server/email.ts`.

## QR Code Features

The QR code utility supports:

1. **Public Tracking URLs** - Direct link to tracking page
2. **Package Details** - Encoded JSON with shipping information
3. **Batch Generation** - Multiple QR codes at once
4. **Shipping Labels** - Printable labels with QR codes
5. **Custom Styling** - Size, colors, error correction levels

## Real-Time Updates

The system supports real-time updates through:

1. **Webhook Subscriptions** - Carrier webhook integration
2. **Admin Panel** - Manual status and event updates
3. **Email Notifications** - Automatic customer notifications
4. **WebSocket Ready** - Prepared for real-time browser updates

## Security Features

1. **Authentication** - Admin endpoints require valid authentication
2. **Role-Based Access** - Admin/staff only access to management endpoints
3. **Webhook Verification** - HMAC signature verification for webhooks
4. **Rate Limiting** - Applied to prevent abuse
5. **Activity Logging** - All admin actions are logged

## Integration Examples

### JavaScript Client - Track Shipment
```javascript
const trackingResponse = await fetch('/api/track/QCS123456789');
const trackingData = await trackingResponse.json();
console.log(trackingData.data);
```

### JavaScript Client - Generate QR Code
```javascript
const qrResponse = await fetch('/api/utils/qr-code', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'tracking',
    data: { trackingNumber: 'QCS123456789' },
    options: { size: 256 }
  })
});
const qrData = await qrResponse.json();
```

### Carrier Webhook Integration
```javascript
// Example: Setting up FedEx webhook
const webhookUrl = 'https://your-domain.com/api/webhooks/carrier-tracking';
const webhookSecret = process.env.CARRIER_WEBHOOK_SECRET;

// FedEx will POST updates to this endpoint
// Updates will automatically update shipment status and notify customers
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "errors": [
    {
      "field": "field_name",
      "message": "Field validation error"
    }
  ]
}
```

Common error codes:
- `TRACKING_NOT_FOUND` - Tracking number not found
- `INVALID_STATUS` - Invalid shipment status
- `PERMISSION_DENIED` - Insufficient permissions
- `VALIDATION_ERROR` - Request validation failed

## Monitoring and Logging

All tracking operations are logged with correlation IDs for debugging:

1. **Public Tracking Lookups** - Anonymous tracking requests
2. **Admin Actions** - All admin modifications are logged
3. **Webhook Processing** - Carrier webhook processing status
4. **Email Notifications** - Email delivery status
5. **QR Code Generation** - Generation requests and results

## Future Enhancements

1. **SMS Notifications** - SMS tracking updates
2. **Mobile App Integration** - Native app tracking
3. **Map Visualization** - Visual package journey
4. **Predictive ETA** - ML-based delivery predictions
5. **Multi-carrier Support** - Extended carrier integrations
6. **Customer Preferences** - Notification preferences management

## Environment Variables

Required environment variables:

```bash
# Webhook security
CARRIER_WEBHOOK_SECRET=your-secret-key

# QR code settings
PUBLIC_APP_URL=https://your-domain.com
```

## Database Schema Updates

The system uses the existing `shipments` collection with these fields:

- `status_history` - JSON array of tracking events
- `current_location` - Current location string
- `estimated_delivery` - Estimated delivery date
- `delivered_at` - Actual delivery timestamp
- `exception_reason` - Reason for exceptions
- `notes` - Additional notes

All updates are backward compatible with existing data.