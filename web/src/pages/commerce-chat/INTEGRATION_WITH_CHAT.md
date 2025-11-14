# Integrating Conversational Commerce with Existing Chat

## Overview

The conversational commerce system is designed to work **inside existing chat interfaces** - primarily:
1. **ChatGPT** (via ACP protocol)
2. **Our existing `/chat` page** (ChatClientV2)

This means products are recommended, discussed, and purchased all within the natural conversation flow.

## Integration Points

### 1. ChatGPT Integration (Primary Use Case)

**How it works:**
- Customer opens ChatGPT
- Types: "I need a padel racket for aggressive play"
- ChatGPT calls our API: `POST /api/commerce/chat`
- We return recommendations
- ChatGPT displays them inline in the conversation
- Customer clicks "Buy Now" → Redirects to our checkout

**What we provide:**
```
User Message → [ChatGPT] → [Our API] → Product Recommendations
                    ↓
            Displays in chat with [Buy Now] button
                    ↓
            Clicks → /commerce-chat/checkout/prod-123?conv=session-xyz
```

**API Response Format (optimized for ChatGPT):**
```typescript
{
  message: "Based on your needs, here's what I recommend:\n\n**StarVie Metheora Warrior (€139)**\nThis racket has a soft carbon-fiber core that protects your elbow while delivering excellent power for aggressive play. 4.9★ from 127 reviews.\n\n**Why this matches:**\n- Soft core reduces vibration (perfect for tennis elbow)\n- Diamond shape for aggressive play\n- Large sweet spot for forgiveness\n\n[Buy Now](/commerce-chat/checkout/prod-1?conv=session-123) | [View Details](/products/prod-1)",

  recommendations: [
    {
      product: { ...full product data... },
      reasoning: "Detailed reasoning...",
      confidenceScore: 0.95
    }
  ],

  extractedNeeds: {
    playingStyle: "aggressive",
    painPoints: ["tennis elbow"]
  }
}
```

**ChatGPT displays this as:**
```
Based on your needs, here's what I recommend:

**StarVie Metheora Warrior (€139)**
This racket has a soft carbon-fiber core that protects your elbow
while delivering excellent power for aggressive play. 4.9★ from 127 reviews.

**Why this matches:**
- Soft core reduces vibration (perfect for tennis elbow)
- Diamond shape for aggressive play
- Large sweet spot for forgiveness

[Buy Now] | [View Details]
```

### 2. Existing Chat Page Integration

**Option A: Add Product Recommendations to Existing Chat**

Modify `/web/src/components/ai/ChatClientV2.tsx` to detect product queries:

```typescript
// Inside ChatClientV2.tsx

// Detect if message is a product query
const isProductQuery = (message: string) => {
  const productKeywords = ['racket', 'buy', 'recommend', 'looking for', 'need'];
  return productKeywords.some(keyword => message.toLowerCase().includes(keyword));
};

// When sending message
const handleSend = async () => {
  if (isProductQuery(input)) {
    // Call commerce API instead of regular chat API
    const response = await fetch('/api/commerce/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: currentSessionId,
        message: input,
        conversationHistory: messages,
      }),
    });

    const data = await response.json();

    // Display recommendations inline
    if (data.recommendations) {
      // Render ProductCardChat components within the message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message,
        recommendations: data.recommendations
      }]);
    }
  } else {
    // Regular chat flow
    // ...existing code
  }
};
```

**Option B: Separate Commerce Mode**

Add a toggle to switch between regular chat and commerce mode:

```typescript
// ChatClientV2.tsx

const [mode, setMode] = useState<'chat' | 'commerce'>('chat');

return (
  <div>
    {/* Mode Toggle */}
    <div className="flex gap-2 mb-4">
      <Button
        variant={mode === 'chat' ? 'default' : 'outline'}
        onClick={() => setMode('chat')}
      >
        💬 General Chat
      </Button>
      <Button
        variant={mode === 'commerce' ? 'default' : 'outline'}
        onClick={() => setMode('commerce')}
      >
        🛍️ Product Advisor
      </Button>
    </div>

    {/* Render appropriate interface */}
    {mode === 'commerce' ? (
      <CommerceChatInterface category="padel_racket" />
    ) : (
      // ...existing chat interface
    )}
  </div>
);
```

**Option C: Hybrid Mode (Recommended)**

Automatically detect product discussions and inject recommendations:

```typescript
// Message rendering in ChatClientV2.tsx

const renderMessage = (message: Message) => {
  return (
    <div>
      {/* Regular message content */}
      <p>{message.content}</p>

      {/* If message contains product recommendations */}
      {message.recommendations && (
        <RecommendationSection
          recommendations={message.recommendations}
          onAction={(action, productId) => {
            if (action === 'buy_now') {
              window.location.href = `/commerce-chat/checkout/${productId}?conv=${sessionId}`;
            }
          }}
        />
      )}
    </div>
  );
};
```

### 3. API Route Strategy

**Unified API Endpoint:**

```typescript
// /api/chat/unified.ts

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const { message, sessionId, conversationHistory } = body;

  // Detect if this is a commerce query
  const isCommerce = detectCommerceIntent(message);

  if (isCommerce) {
    // Route to commerce handler
    return await handleCommerceQuery(message, sessionId, conversationHistory);
  } else {
    // Route to regular chat handler
    return await handleRegularChat(message, sessionId, conversationHistory);
  }
};

function detectCommerceIntent(message: string): boolean {
  const commerceKeywords = [
    'buy', 'purchase', 'recommend', 'looking for', 'need',
    'racket', 'course', 'product', 'shop', 'price',
    'best', 'top', 'review', 'compare'
  ];

  const lowerMessage = message.toLowerCase();
  return commerceKeywords.some(keyword => lowerMessage.includes(keyword));
}
```

## Conversation Flow Examples

### Example 1: Pure Commerce Flow

```
User: I need a padel racket for beginners