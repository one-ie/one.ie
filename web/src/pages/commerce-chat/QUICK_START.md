# Conversational Commerce - Quick Start Guide

## 5-Minute Setup

### Step 1: Add Chat to Your Website

```astro
---
// your-page.astro
import { CommerceWidget } from '@/components/commerce';
---

<html>
  <body>
    <!-- Your page content -->

    <!-- Add floating chat widget -->
    <CommerceWidget
      client:only="react"
      category="your_category"
      position="bottom-right"
    />
  </body>
</html>
```

That's it! You now have a floating chat widget.

### Step 2: Create a Dedicated Chat Page

```astro
---
// pages/shop/chat.astro
import Layout from '@/layouts/Layout.astro';
import { CommerceChatInterface } from '@/components/commerce';
---

<Layout title="Product Advisor">
  <CommerceChatInterface
    client:only="react"
    category="padel_racket"
    platform="web"
  />
</Layout>
```

### Step 3: Configure for Your Products

Update the mock products in `/api/commerce/chat.ts`:

```typescript
const mockProducts: Product[] = [
  {
    id: 'your-product-1',
    name: 'Your Product Name',
    price: 99,
    currency: '$',
    description: 'Product description',
    image: '/path/to/image.jpg',
    category: 'your_category',
    rating: 4.5,
    reviewCount: 50,
    inStock: true,

    // AI-optimized fields (critical for recommendations!)
    aiDescription: 'Detailed conversational description',
    aiUseCases: ['use case 1', 'use case 2'],
    aiTargetAudience: ['beginners', 'intermediate'],
    aiBestFor: 'Best for people who...',
    aiAvoidWhen: 'Not suitable for...',
    aiComparisonPoints: {
      feature1: 'Description of feature 1',
      feature2: 'Description of feature 2',
    },
    aiKeywords: ['keyword1', 'keyword2', 'keyword3'],
    aiSimilarProducts: [],
    aiOftenBoughtWith: [],
    aiUpgradeTo: [],
  },
  // Add more products...
];
```

## Common Use Cases

### Use Case 1: E-commerce Product Pages

Add a "Chat with Expert" button:

```astro
---
import { Button } from '@/components/ui/button';
---

<div class="product-page">
  <!-- Product details -->

  <Button
    onclick="window.location.href='/commerce-chat?category=padel_racket'"
  >
    💬 Chat with Product Advisor
  </Button>
</div>
```

### Use Case 2: Homepage Hero

```astro
<section class="hero">
  <h1>Find Your Perfect Padel Racket</h1>
  <p>Chat with our AI advisor for personalized recommendations</p>

  <iframe
    src="/commerce-chat?category=padel_racket&embed=true"
    class="w-full h-[600px] rounded-lg border"
  ></iframe>
</section>
```

### Use Case 3: ChatGPT Integration

See `CHATGPT_INTEGRATION.md` for full guide.

Quick version:
1. Go to ChatGPT → Create Custom GPT
2. Name: "Your Product Advisor"
3. Add Action → Point to `https://your-domain.com/api/commerce/chat`
4. Test with: "I need [your product type]"

## Customization

### Change Sales Agent Persona

Edit `/api/commerce/chat.ts` - `generateResponse()` function:

```typescript
// For padel equipment
if (category === 'padel_racket') {
  return "I'm your padel equipment expert...";
}

// For courses
if (category === 'course') {
  return "I'm your learning path advisor...";
}

// For fashion
if (category === 'fashion') {
  return "I'm your style consultant...";
}
```

### Customize Intent Extraction

Edit `/api/commerce/chat.ts` - `extractCustomerNeeds()` function:

```typescript
// Add your own patterns
if (lowerMessage.includes('your_keyword')) {
  needs.yourCustomField = 'value';
}
```

### Customize Recommendation Logic

Edit `/api/commerce/chat.ts` - `getProductRecommendations()` function:

```typescript
// Adjust scoring
if (needs.yourCriteria) {
  score += 50; // High priority
}
```

## Testing

### Test Conversation Flow

1. Navigate to `/commerce-chat`
2. Try these test queries:
   - "I'm a beginner" → Should extract skill level
   - "Budget under €100" → Should extract budget
   - "I have tennis elbow" → Should extract pain point
   - "Aggressive play" → Should extract style

### Test Recommendations

1. Type: "I need a padel racket for aggressive play but I have tennis elbow"
2. Should receive:
   - Clarifying question OR
   - 2-3 product recommendations with reasoning
   - Each recommendation should explain WHY it matches

### Test Purchase Flow

1. Click "Buy Now" on a recommendation
2. Should redirect to checkout
3. Checkout should be pre-filled
4. Complete purchase (mock)
5. Should see confirmation

## Analytics

View metrics at `/commerce-chat/analytics`:

- Conversations started
- Conversion rate
- Average order value
- Top products
- Customer satisfaction

## Troubleshooting

### Chat not loading?
- Check browser console for errors
- Verify API endpoints are accessible
- Check that React components are client:only

### No recommendations?
- Check that products have AI-optimized fields filled
- Verify intent extraction is working (check console logs)
- Ensure products match the extracted needs

### Recommendations not relevant?
- Improve `aiDescription` field (be specific!)
- Add more `aiKeywords`
- Adjust scoring in `getProductRecommendations()`

## Next Steps

1. **Connect to Database:** Replace mock data with Convex queries
2. **Add Payment:** Integrate Stripe/payment processor
3. **Deploy to Production:** See `/docs/deployment.md`
4. **Monitor Performance:** Track conversion rates
5. **Optimize:** A/B test conversation styles

## Support

- **Documentation:** `/web/src/components/commerce/README.md`
- **ChatGPT Guide:** `/web/src/pages/commerce-chat/CHATGPT_INTEGRATION.md`
- **Examples:** `/web/src/pages/commerce-chat/demo.astro`

## Advanced Features

### Multi-Category Support

```typescript
// Detect category from conversation
const category = detectCategory(message);
// Returns: 'padel_racket' | 'course' | 'fashion' | etc.

// Load category-specific persona
const persona = getPersona(category);

// Use in response generation
const response = generateResponseWithPersona(message, persona);
```

### Follow-up Automation

```typescript
// After purchase, schedule follow-ups
scheduleFollowUp({
  customerId: customer.id,
  orderId: order.id,
  delays: [
    { days: 7, template: 'first_use_tips' },
    { days: 30, template: 'feedback_request' },
    { days: 180, template: 'accessory_recommendation' },
  ],
});
```

### A/B Testing

```typescript
// Test different conversation styles
const variant = Math.random() < 0.5 ? 'friendly' : 'professional';

const response =
  variant === 'friendly'
    ? generateFriendlyResponse(message)
    : generateProfessionalResponse(message);

// Track which converts better
trackVariant(sessionId, variant, converted);
```

---

**You're ready to go!** Start with the demo page (`/commerce-chat/demo`) to see everything in action.
