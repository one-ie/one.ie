# AI Chat Funnel Builder - API Reference

**REST API and webhook documentation for programmatic funnel creation.**

Version: 1.0.0
Last Updated: 2025-11-22
Status: Complete

---

## Table of Contents

1. [Authentication](#authentication)
2. [API Endpoints](#api-endpoints)
3. [Webhooks](#webhooks)
4. [Data Models](#data-models)
5. [Error Handling](#error-handling)
6. [Rate Limits](#rate-limits)
7. [Examples](#examples)

---

## Authentication

### API Keys

**Generate API key:**
1. Navigate to **Settings** → **API Keys**
2. Click **Generate New Key**
3. Copy key (shown once)
4. Add to requests as header: `Authorization: Bearer YOUR_API_KEY`

### Authentication Header

```http
GET /api/funnels
Authorization: Bearer pk_live_51Hxxxxxxxxxxxxxxx
Content-Type: application/json
```

### Scopes

API keys have scoped permissions:
- `funnels:read` - Read funnel data
- `funnels:write` - Create and update funnels
- `funnels:delete` - Delete funnels
- `analytics:read` - Access analytics data
- `webhooks:manage` - Create and manage webhooks

---

## API Endpoints

### Base URL

```
Production: https://one.ie/api/v1
Staging: https://staging.one.ie/api/v1
```

### Funnels

#### List Funnels

```http
GET /api/v1/funnels
```

**Query parameters:**
- `status` (optional): Filter by status (draft, published, archived)
- `limit` (optional): Number of results (default: 100, max: 1000)
- `offset` (optional): Pagination offset (default: 0)

**Response:**

```json
{
  "funnels": [
    {
      "id": "fun_1a2b3c",
      "name": "Productivity Course Launch",
      "template": "product-launch",
      "status": "published",
      "url": "https://one.ie/f/productivity-course",
      "createdAt": "2025-01-08T12:00:00Z",
      "updatedAt": "2025-01-10T14:30:00Z",
      "stats": {
        "visitors": 1250,
        "conversions": 125,
        "conversionRate": 10.0,
        "revenue": 62125
      }
    }
  ],
  "total": 1,
  "limit": 100,
  "offset": 0
}
```

#### Get Funnel

```http
GET /api/v1/funnels/{funnelId}
```

**Response:**

```json
{
  "id": "fun_1a2b3c",
  "name": "Productivity Course Launch",
  "template": "product-launch",
  "status": "published",
  "url": "https://one.ie/f/productivity-course",
  "customDomain": "launch.mysite.com",
  "settings": {
    "primaryColor": "#2563eb",
    "secondaryColor": "#7c3aed",
    "logo": "https://cdn.one.ie/logos/abc123.png",
    "googleAnalyticsId": "G-XXXXXXXXXX",
    "facebookPixelId": "123456789"
  },
  "steps": [
    {
      "id": "step_1",
      "name": "Coming Soon",
      "type": "landing",
      "order": 1,
      "url": "/coming-soon"
    },
    {
      "id": "step_2",
      "name": "Early Bird",
      "type": "sales",
      "order": 2,
      "url": "/early-bird"
    }
  ],
  "createdAt": "2025-01-08T12:00:00Z",
  "updatedAt": "2025-01-10T14:30:00Z"
}
```

#### Create Funnel

```http
POST /api/v1/funnels
```

**Request body:**

```json
{
  "name": "My New Funnel",
  "template": "product-launch",
  "settings": {
    "primaryColor": "#2563eb",
    "secondaryColor": "#7c3aed"
  }
}
```

**Response:**

```json
{
  "id": "fun_2b3c4d",
  "name": "My New Funnel",
  "template": "product-launch",
  "status": "draft",
  "url": null,
  "createdAt": "2025-01-11T10:00:00Z"
}
```

#### Update Funnel

```http
PATCH /api/v1/funnels/{funnelId}
```

**Request body:**

```json
{
  "name": "Updated Funnel Name",
  "settings": {
    "primaryColor": "#10b981"
  }
}
```

#### Publish Funnel

```http
POST /api/v1/funnels/{funnelId}/publish
```

**Request body:**

```json
{
  "customDomain": "launch.mysite.com",
  "enableStripe": true,
  "enableTracking": true
}
```

**Response:**

```json
{
  "id": "fun_1a2b3c",
  "status": "published",
  "url": "https://launch.mysite.com",
  "publishedAt": "2025-01-11T12:00:00Z"
}
```

#### Unpublish Funnel

```http
POST /api/v1/funnels/{funnelId}/unpublish
```

#### Delete Funnel

```http
DELETE /api/v1/funnels/{funnelId}
```

**Response:**

```json
{
  "deleted": true,
  "id": "fun_1a2b3c"
}
```

### Funnel Steps

#### List Steps

```http
GET /api/v1/funnels/{funnelId}/steps
```

**Response:**

```json
{
  "steps": [
    {
      "id": "step_1",
      "funnelId": "fun_1a2b3c",
      "name": "Coming Soon",
      "type": "landing",
      "order": 1,
      "url": "/coming-soon",
      "elements": [
        {
          "id": "elem_1",
          "type": "headline",
          "settings": {
            "text": "Launching Soon!",
            "fontSize": "48px",
            "fontWeight": "bold"
          },
          "position": {
            "x": 0,
            "y": 0,
            "width": "100%",
            "height": "auto"
          }
        }
      ],
      "stats": {
        "visitors": 500,
        "conversions": 250,
        "conversionRate": 50.0
      }
    }
  ]
}
```

#### Add Step

```http
POST /api/v1/funnels/{funnelId}/steps
```

**Request body:**

```json
{
  "name": "Early Bird Offer",
  "type": "sales",
  "order": 2,
  "settings": {
    "headline": "Save 20% - Early Bird Special"
  }
}
```

#### Update Step

```http
PATCH /api/v1/funnels/{funnelId}/steps/{stepId}
```

#### Reorder Steps

```http
POST /api/v1/funnels/{funnelId}/steps/reorder
```

**Request body:**

```json
{
  "steps": [
    { "id": "step_2", "order": 1 },
    { "id": "step_1", "order": 2 },
    { "id": "step_3", "order": 3 }
  ]
}
```

#### Delete Step

```http
DELETE /api/v1/funnels/{funnelId}/steps/{stepId}
```

### Elements

#### Add Element to Step

```http
POST /api/v1/funnels/{funnelId}/steps/{stepId}/elements
```

**Request body:**

```json
{
  "type": "countdown_timer",
  "settings": {
    "endDate": "2025-02-01T00:00:00Z",
    "showDays": true,
    "showHours": true,
    "showMinutes": true,
    "showSeconds": true
  },
  "position": {
    "x": 0,
    "y": 100,
    "width": "100%",
    "height": "80px"
  }
}
```

#### Update Element

```http
PATCH /api/v1/funnels/{funnelId}/steps/{stepId}/elements/{elementId}
```

#### Delete Element

```http
DELETE /api/v1/funnels/{funnelId}/steps/{stepId}/elements/{elementId}
```

### Analytics

#### Get Funnel Analytics

```http
GET /api/v1/funnels/{funnelId}/analytics
```

**Query parameters:**
- `startDate` (optional): Start date (ISO 8601)
- `endDate` (optional): End date (ISO 8601)
- `granularity` (optional): hour, day, week, month (default: day)

**Response:**

```json
{
  "funnelId": "fun_1a2b3c",
  "period": {
    "startDate": "2025-01-01T00:00:00Z",
    "endDate": "2025-01-11T23:59:59Z"
  },
  "overall": {
    "visitors": 1250,
    "conversions": 125,
    "conversionRate": 10.0,
    "revenue": 62125,
    "averageOrderValue": 497
  },
  "byStep": [
    {
      "stepId": "step_1",
      "stepName": "Coming Soon",
      "visitors": 1250,
      "conversions": 625,
      "conversionRate": 50.0,
      "dropOff": 625
    },
    {
      "stepId": "step_2",
      "stepName": "Early Bird",
      "visitors": 625,
      "conversions": 125,
      "conversionRate": 20.0,
      "dropOff": 500
    }
  ],
  "timeseries": [
    {
      "date": "2025-01-01",
      "visitors": 100,
      "conversions": 10,
      "revenue": 4970
    },
    {
      "date": "2025-01-02",
      "visitors": 150,
      "conversions": 15,
      "revenue": 7455
    }
  ]
}
```

#### Get Step Analytics

```http
GET /api/v1/funnels/{funnelId}/steps/{stepId}/analytics
```

### Forms

#### Get Form Submissions

```http
GET /api/v1/funnels/{funnelId}/forms/submissions
```

**Query parameters:**
- `stepId` (optional): Filter by step
- `startDate` (optional): Start date
- `endDate` (optional): End date
- `limit` (optional): Results per page (default: 100)

**Response:**

```json
{
  "submissions": [
    {
      "id": "sub_1a2b3c",
      "stepId": "step_1",
      "stepName": "Coming Soon",
      "data": {
        "email": "user@example.com",
        "name": "John Doe",
        "phone": "+1234567890"
      },
      "submittedAt": "2025-01-11T10:30:00Z",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0..."
    }
  ],
  "total": 1,
  "limit": 100,
  "offset": 0
}
```

---

## Webhooks

### Overview

Webhooks send real-time notifications when events occur in your funnels.

### Creating a Webhook

```http
POST /api/v1/webhooks
```

**Request body:**

```json
{
  "url": "https://yoursite.com/webhook",
  "events": [
    "funnel.published",
    "purchase.completed",
    "form.submitted"
  ],
  "secret": "whsec_your_secret_key"
}
```

**Response:**

```json
{
  "id": "wh_1a2b3c",
  "url": "https://yoursite.com/webhook",
  "events": [
    "funnel.published",
    "purchase.completed",
    "form.submitted"
  ],
  "status": "active",
  "createdAt": "2025-01-11T12:00:00Z"
}
```

### Webhook Events

**Available events:**

**Funnel events:**
- `funnel.created` - Funnel created
- `funnel.updated` - Funnel settings updated
- `funnel.published` - Funnel published
- `funnel.unpublished` - Funnel unpublished
- `funnel.deleted` - Funnel deleted

**Step events:**
- `step.added` - Step added to funnel
- `step.updated` - Step updated
- `step.removed` - Step removed

**Visitor events:**
- `visitor.entered_funnel` - Visitor landed on funnel
- `visitor.viewed_step` - Visitor viewed a step
- `visitor.abandoned` - Visitor left without converting

**Form events:**
- `form.submitted` - Form submitted

**Purchase events:**
- `purchase.initiated` - Checkout started
- `purchase.completed` - Purchase completed
- `purchase.failed` - Payment failed
- `purchase.refunded` - Refund processed

**A/B test events:**
- `ab_test.started` - A/B test started
- `ab_test.completed` - A/B test completed

### Webhook Payload

**Example payload for `purchase.completed`:**

```json
{
  "id": "evt_1a2b3c",
  "type": "purchase.completed",
  "createdAt": "2025-01-11T14:30:00Z",
  "data": {
    "funnelId": "fun_1a2b3c",
    "funnelName": "Productivity Course Launch",
    "stepId": "step_2",
    "stepName": "Early Bird",
    "purchase": {
      "id": "purch_1a2b3c",
      "amount": 397,
      "currency": "usd",
      "customer": {
        "email": "customer@example.com",
        "name": "Jane Smith"
      },
      "paymentMethod": "stripe",
      "stripePaymentId": "pi_1a2b3c4d5e6f"
    },
    "visitor": {
      "id": "vis_1a2b3c",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "referrer": "https://google.com"
    }
  }
}
```

### Verifying Webhooks

**Use webhook secret to verify authenticity:**

```javascript
// Node.js example
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const expectedSignature = hmac.update(payload).digest('hex');
  return signature === expectedSignature;
}

// In your webhook handler
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-one-signature'];
  const payload = JSON.stringify(req.body);

  if (!verifyWebhook(payload, signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }

  // Process webhook
  const event = req.body;
  console.log('Received event:', event.type);

  res.status(200).send('OK');
});
```

---

## Data Models

### Funnel

```typescript
interface Funnel {
  id: string;
  name: string;
  template: 'product-launch' | 'webinar' | 'simple-sales' | 'lead-magnet' | 'book-launch' | 'membership' | 'summit';
  status: 'draft' | 'published' | 'archived';
  url: string | null;
  customDomain: string | null;
  settings: {
    primaryColor: string;      // Hex color
    secondaryColor: string;    // Hex color
    logo: string | null;       // URL
    googleAnalyticsId: string | null;
    facebookPixelId: string | null;
  };
  steps: FunnelStep[];
  createdAt: string;           // ISO 8601
  updatedAt: string;           // ISO 8601
}
```

### FunnelStep

```typescript
interface FunnelStep {
  id: string;
  funnelId: string;
  name: string;
  type: 'landing' | 'sales' | 'checkout' | 'thank-you' | 'webinar' | 'replay';
  order: number;
  url: string;                 // Relative URL
  elements: PageElement[];
  settings: Record<string, any>;
  stats: {
    visitors: number;
    conversions: number;
    conversionRate: number;
  };
}
```

### PageElement

```typescript
interface PageElement {
  id: string;
  type: 'headline' | 'image' | 'video' | 'countdown_timer' | 'buy_button' | /* ... 37 types */;
  settings: Record<string, any>;
  position: {
    x: number;
    y: number;
    width: string;
    height: string;
    zIndex: number;
  };
  styling: {
    fontSize: string;
    fontWeight: string;
    color: string;
    backgroundColor: string;
    // ... more styling
  };
  responsive: {
    mobile?: Partial<Position & Styling>;
    tablet?: Partial<Position & Styling>;
    desktop?: Partial<Position & Styling>;
  };
  visibility: {
    hidden: boolean;
    mobile: boolean;
    tablet: boolean;
    desktop: boolean;
  };
}
```

### Analytics

```typescript
interface FunnelAnalytics {
  funnelId: string;
  period: {
    startDate: string;
    endDate: string;
  };
  overall: {
    visitors: number;
    conversions: number;
    conversionRate: number;
    revenue: number;
    averageOrderValue: number;
  };
  byStep: StepAnalytics[];
  timeseries: TimeseriesData[];
}

interface StepAnalytics {
  stepId: string;
  stepName: string;
  visitors: number;
  conversions: number;
  conversionRate: number;
  dropOff: number;
}
```

---

## Error Handling

### Error Response Format

```json
{
  "error": {
    "type": "validation_error",
    "message": "Invalid funnel template",
    "code": "INVALID_TEMPLATE",
    "param": "template",
    "details": {
      "allowedValues": ["product-launch", "webinar", "simple-sales"]
    }
  }
}
```

### HTTP Status Codes

- `200 OK` - Request succeeded
- `201 Created` - Resource created
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Invalid API key
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

### Error Types

- `authentication_error` - Invalid API key
- `authorization_error` - Insufficient permissions
- `validation_error` - Invalid request data
- `not_found_error` - Resource not found
- `rate_limit_error` - Too many requests
- `server_error` - Internal server error

---

## Rate Limits

**Default limits:**
- 100 requests per minute per API key
- 10,000 requests per day per API key

**Rate limit headers:**

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1641897600
```

**When rate limited:**

```json
{
  "error": {
    "type": "rate_limit_error",
    "message": "Too many requests",
    "code": "RATE_LIMIT_EXCEEDED",
    "retryAfter": 60
  }
}
```

---

## Examples

### Create and Publish Funnel (cURL)

```bash
# 1. Create funnel
curl -X POST https://one.ie/api/v1/funnels \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Product Launch",
    "template": "product-launch",
    "settings": {
      "primaryColor": "#2563eb",
      "secondaryColor": "#7c3aed"
    }
  }'

# Response: { "id": "fun_1a2b3c", ... }

# 2. Add steps
curl -X POST https://one.ie/api/v1/funnels/fun_1a2b3c/steps \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Coming Soon",
    "type": "landing",
    "order": 1
  }'

# 3. Publish funnel
curl -X POST https://one.ie/api/v1/funnels/fun_1a2b3c/publish \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "enableStripe": true,
    "enableTracking": true
  }'
```

### Get Analytics (JavaScript)

```javascript
const apiKey = 'pk_live_51H...';
const funnelId = 'fun_1a2b3c';

async function getAnalytics() {
  const response = await fetch(
    `https://one.ie/api/v1/funnels/${funnelId}/analytics?startDate=2025-01-01&endDate=2025-01-31`,
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );

  const data = await response.json();
  console.log('Conversion rate:', data.overall.conversionRate);
  console.log('Revenue:', data.overall.revenue);
}

getAnalytics();
```

### Process Webhook (Python)

```python
import hmac
import hashlib
from flask import Flask, request

app = Flask(__name__)
WEBHOOK_SECRET = 'whsec_your_secret'

@app.route('/webhook', methods=['POST'])
def webhook():
    # Verify signature
    signature = request.headers.get('X-One-Signature')
    payload = request.get_data()

    expected_signature = hmac.new(
        WEBHOOK_SECRET.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()

    if signature != expected_signature:
        return 'Invalid signature', 401

    # Process event
    event = request.json

    if event['type'] == 'purchase.completed':
        # Send thank you email
        send_email(
            to=event['data']['purchase']['customer']['email'],
            subject='Thank you for your purchase!',
            body='...'
        )

    return 'OK', 200
```

---

**Next steps:**
- [Developer Guide](/one/knowledge/funnel-builder/developer-guide.md) - Integration patterns
- [User Guide](/one/knowledge/funnel-builder/user-guide.md) - Manual creation
- [Webhooks Guide](/one/knowledge/funnel-builder/webhooks-guide.md) - Webhook patterns

---

**Built with ONE Platform's 6-dimension ontology.**
