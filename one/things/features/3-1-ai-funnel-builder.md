# Feature 3-1: AI Chat Funnel Builder

**Status:** ✅ Complete
**Version:** 1.0.0
**Plan:** ClickFunnels-Style Funnel Builder (100 Cycles)
**Scope:** Global (platform-wide feature)
**Completed:** 2025-11-22

---

## Ontology Mapping

### THINGS (Entities Used)

**Funnel Entities:**
- `funnel` - Main funnel container with template, settings, URL
- `funnel_step` - Individual page in funnel sequence
- `page_element` - UI element on page (37 types)
- `funnel_template` - Reusable funnel blueprint
- `page_template` - Reusable page blueprint

**Form & Lead Entities:**
- `form_submission` - User form data
- `visitor` - Anonymous funnel visitor
- `customer` - Converted customer

**Testing & Analytics:**
- `ab_test` - A/B test configuration
- `funnel_analytics` - Performance metrics
- `funnel_domain` - Custom domain configuration

**Integration Entities:**
- `email_sequence` - Email automation
- `custom_code` - Custom HTML/CSS/JS snippets

### CONNECTIONS (Relationships Used)

**Funnel Structure:**
- `funnel_contains_step` - Funnel → Step (ordered sequence)
- `step_contains_element` - Step → Element (page layout)
- `funnel_based_on_template` - Funnel → Template (cloned from)
- `step_based_on_template` - Step → Page Template

**Visitor Journey:**
- `visitor_entered_funnel` - Visitor → Funnel (tracking)
- `visitor_viewed_step` - Visitor → Step (analytics)
- `visitor_submitted_form` - Visitor → Form Submission
- `customer_purchased_via_funnel` - Customer → Funnel (conversion)

**Monetization:**
- `funnel_leads_to_product` - Funnel → Product (what's sold)
- `payment_from_funnel` - Payment → Funnel (revenue tracking)

**Testing & Optimization:**
- `ab_test_variant` - A/B Test → Step (variant comparison)

**Integration:**
- `funnel_sends_email` - Funnel → Email Sequence
- `funnel_uses_domain` - Funnel → Custom Domain

### EVENTS (Actions Logged)

**Funnel Lifecycle:**
- `funnel_created` - New funnel created via AI chat
- `funnel_published` - Funnel made live
- `funnel_unpublished` - Funnel taken offline
- `funnel_duplicated` - Funnel cloned
- `funnel_archived` - Funnel soft deleted

**Step Management:**
- `step_added` - New step added to funnel
- `step_removed` - Step deleted from funnel
- `step_reordered` - Funnel sequence changed
- `step_updated` - Step content modified

**Element Management:**
- `element_added` - Element added to page
- `element_updated` - Element settings changed
- `element_removed` - Element deleted

**Visitor Actions:**
- `visitor_entered_funnel` - First page view
- `visitor_viewed_step` - Page view
- `visitor_abandoned` - Left without converting

**Conversions:**
- `form_submitted` - Lead captured
- `purchase_completed` - Sale completed via Stripe
- `purchase_failed` - Payment declined

**Testing:**
- `ab_test_started` - A/B test launched
- `ab_test_completed` - Test concluded with winner

**Integration:**
- `email_sent` - Email sequence triggered
- `domain_connected` - Custom domain verified
- `analytics_generated` - Metrics calculated

---

## Overview

The AI Chat Funnel Builder creates complete sales funnels through natural conversation. Users describe what they're selling, and the AI guides them through template selection, customization, and publishing in 10-20 minutes (vs 2-8 hours manually).

**Key Innovation:** Conversational interface replaces drag-and-drop builders. AI recommends proven templates, optimizes copy, and handles technical configuration automatically.

---

## For Users

### Creating a Funnel

**5-Stage Conversation Flow:**

#### Stage 1: Discovery (Understanding)
1. Navigate to `/funnels/builder`
2. Start conversation: "I want to sell my online course"
3. AI asks about product, audience, price, experience level

#### Stage 2: Template Selection (Recommendation)
1. AI analyzes your answers
2. Recommends 2-3 templates with conversion rates
3. Explains why each template fits
4. You choose template

#### Stage 3: Customization (Branding)
1. Name your funnel
2. Provide brand colors (hex codes)
3. Upload logo (optional)
4. Set tone (professional, casual, urgent)

#### Stage 4: Build Pages (Step-by-Step)
1. AI creates each page in sequence
2. Suggests headlines and copy
3. Adds conversion elements (timers, social proof)
4. You approve or customize

#### Stage 5: Preview & Publish (Launch)
1. Preview funnel flow
2. Add Stripe for payments (optional)
3. Add tracking codes (GA, FB Pixel)
4. Publish and get live URL

**Time:** 10-20 minutes per funnel

### Available Templates

**7 Proven Templates:**

1. **Product Launch Funnel** (8-12% conversion)
   - Coming Soon → Early Bird → Launch → Thank You
   - Best for: Courses, info products, software

2. **Webinar Funnel** (5-10% conversion)
   - Registration → Reminder → Webinar → Replay → Thank You
   - Best for: High-ticket coaching, B2B services

3. **Simple Sales Page** (2-5% conversion)
   - Landing → Checkout → Upsell → Thank You
   - Best for: Physical products, low-ticket items

4. **Lead Magnet Funnel** (30-50% conversion)
   - Landing → Delivery → Welcome Email
   - Best for: Email list building, lead generation

5. **Book Launch Funnel** (15-25% conversion)
   - Pre-order → Bonuses → Launch → Thank You
   - Best for: Book pre-orders, author platform

6. **Membership Funnel** (5-15% conversion)
   - Sales → Trial → Onboarding → Member Area
   - Best for: Subscriptions, communities, SaaS

7. **Summit/Event Funnel** (40-60% register, 10-20% upgrade)
   - Registration → Schedule → Sessions → All-Access
   - Best for: Virtual summits, conferences

---

## For Developers

### Backend API

**Create Funnel:**
```typescript
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const createFunnel = useMutation(api.mutations.funnels.create);

const funnelId = await createFunnel({
  name: "Productivity Course Launch",
  template: "product-launch",
  settings: {
    primaryColor: "#2563eb",
    secondaryColor: "#7c3aed"
  }
});
```

**Add Step:**
```typescript
const addStep = useMutation(api.mutations.funnels.addStep);

await addStep({
  funnelId,
  name: "Coming Soon",
  type: "landing",
  order: 1,
  settings: {
    headline: "Launching Soon!",
    ctaText: "Get Early Access"
  }
});
```

**Publish Funnel:**
```typescript
const publish = useMutation(api.mutations.funnels.publish);

await publish({
  funnelId,
  enableTracking: true,
  enableStripe: true,
  customDomain: "launch.mysite.com"
});
```

### Frontend Components

**Funnel Flow Visualization:**
```tsx
import { FunnelFlowGraph } from "@/components/features/funnel";

<FunnelFlowGraph
  steps={steps}
  onStepClick={handleStepClick}
  onStepReorder={handleReorder}
  showMetrics={true}
  editable={true}
/>
```

**AI Chat Interface:**
```tsx
import { FunnelBuilderChat } from "@/components/ai/FunnelBuilderChat";

<FunnelBuilderChat
  systemPrompt={FUNNEL_BUILDER_SYSTEM_PROMPT}
  suggestions={suggestionGroups}
  onFunnelCreated={(funnelId) => router.push(`/funnels/${funnelId}`)}
/>
```

### Data Structures

**Funnel Thing:**
```typescript
{
  _id: Id<"things">,
  type: "funnel",
  name: "Productivity Course Launch",
  groupId: Id<"groups">,
  properties: {
    template: "product-launch",
    status: "published",
    url: "https://one.ie/f/productivity-course",
    customDomain: "launch.mysite.com",
    primaryColor: "#2563eb",
    secondaryColor: "#7c3aed",
    logo: "https://cdn.one.ie/logos/abc123.png",
    googleAnalyticsId: "G-XXXXXXXXXX",
    facebookPixelId: "123456789",
    stepCount: 4,
    publishedAt: 1641897600000
  },
  status: "active",
  createdAt: 1641897600000,
  updatedAt: 1641897600000
}
```

**Funnel Step Thing:**
```typescript
{
  _id: Id<"things">,
  type: "funnel_step",
  name: "Coming Soon",
  groupId: Id<"groups">,
  properties: {
    funnelId: Id<"things">,  // Parent funnel
    stepType: "landing",
    order: 1,
    url: "/coming-soon",
    headline: "Launching Soon!",
    elementCount: 12
  },
  status: "active",
  createdAt: 1641897600000,
  updatedAt: 1641897600000
}
```

**Page Element Thing:**
```typescript
{
  _id: Id<"things">,
  type: "page_element",
  name: "Hero Headline",
  groupId: Id<"groups">,
  properties: {
    stepId: Id<"things">,  // Parent step
    elementType: "headline",
    settings: {
      text: "Launching Soon!",
      fontSize: "48px",
      fontWeight: "bold"
    },
    position: {
      x: 0,
      y: 0,
      width: "100%",
      height: "auto",
      zIndex: 1
    },
    styling: {
      color: "#000000",
      backgroundColor: "transparent",
      fontFamily: "Inter"
    },
    responsive: {
      mobile: {
        fontSize: "32px"
      }
    },
    visibility: {
      hidden: false,
      mobile: true,
      tablet: true,
      desktop: true
    }
  },
  status: "active",
  createdAt: 1641897600000,
  updatedAt: 1641897600000
}
```

### Events Emitted

**Funnel created:**
```typescript
{
  type: "funnel_created",
  actorId: Id<"things">,  // Creator
  targetId: Id<"things">,  // Funnel
  groupId: Id<"groups">,
  timestamp: 1641897600000,
  metadata: {
    template: "product-launch",
    createdVia: "ai_chat"
  }
}
```

**Purchase completed:**
```typescript
{
  type: "purchase_completed",
  actorId: Id<"things">,  // Customer
  targetId: Id<"things">,  // Funnel
  groupId: Id<"groups">,
  timestamp: 1641897600000,
  metadata: {
    amount: 397,
    currency: "usd",
    funnelStepId: Id<"things">,
    paymentMethod: "stripe",
    stripePaymentId: "pi_1a2b3c4d5e6f"
  }
}
```

---

## Patterns Used

### Effect.ts Services Pattern

**Pure business logic in services/funnel/:**

- `funnel.ts` - Funnel CRUD and validation
- `step.ts` - Step management
- `element.ts` - Element operations (37 types)
- `template.ts` - Template cloning
- `analytics.ts` - Metrics calculation
- `payment.ts` - Stripe integration

**Example service:**
```typescript
// services/funnel/funnel.ts
import { Effect } from "effect";

export const FunnelService = {
  validateForPublish: (funnel: any) =>
    Effect.gen(function* () {
      if (funnel.status === "published") {
        return yield* Effect.fail(
          new FunnelAlreadyPublishedError(funnel._id)
        );
      }

      if (!funnel.properties?.stepCount || funnel.properties.stepCount === 0) {
        return yield* Effect.fail({
          _tag: "ValidationError",
          message: "Funnel must have at least one step"
        });
      }

      return funnel;
    }),

  calculateMetrics: (events: any[]) =>
    Effect.sync(() => {
      const visitors = new Set(events.map(e => e.actorId)).size;
      const conversions = events.filter(
        e => e.type === "purchase_completed"
      ).length;

      return {
        visitors,
        conversions,
        conversionRate: visitors > 0 ? conversions / visitors : 0
      };
    })
};
```

### Convex Mutation Pattern

**Thin wrappers around services:**

```typescript
// mutations/funnels.ts
export const publish = mutation({
  args: {
    funnelId: v.id("things"),
    enableTracking: v.boolean(),
    enableStripe: v.boolean(),
    customDomain: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // 1. Auth
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // 2. Get funnel
    const funnel = await ctx.db.get(args.funnelId);
    if (!funnel) throw new Error("Funnel not found");

    // 3. Validate (Effect.ts service)
    const validationResult = await Effect.runPromise(
      FunnelService.validateForPublish(funnel)
    );

    // 4. Update status
    await ctx.db.patch(args.funnelId, {
      status: "published",
      properties: {
        ...funnel.properties,
        publishedAt: Date.now(),
        url: args.customDomain || `https://one.ie/f/${funnel._id}`
      }
    });

    // 5. Log event
    await ctx.db.insert("events", {
      type: "funnel_published",
      actorId: identity.tokenIdentifier,
      targetId: args.funnelId,
      groupId: funnel.groupId,
      timestamp: Date.now(),
      metadata: {
        enableTracking: args.enableTracking,
        enableStripe: args.enableStripe,
        customDomain: args.customDomain
      }
    });
  }
});
```

### AI Chat Pattern

**Conversation flow with stages:**

```typescript
// lib/ai/funnel-prompts.ts
export const FUNNEL_BUILDER_SYSTEM_PROMPT = `
You are an expert funnel builder assistant...

CONVERSATION STAGES:
1. DISCOVERY - Understand what they're selling
2. TEMPLATE - Recommend 2-3 templates
3. CUSTOMIZATION - Branding and colors
4. BUILD - Create pages step-by-step
5. PUBLISH - Preview and launch
`;

export const STAGE_PROMPTS = {
  discovery: "What are you selling? Who's your target audience?",
  template: "Based on your answers, I recommend...",
  customization: "Let's personalize your funnel...",
  build: "Let's build your [page name] page...",
  publish: "Your funnel is ready! Let's publish..."
};
```

---

## Common Issues

### Funnel Won't Publish

**Q: Clicking "Publish" does nothing**

**A: Check:**
1. Funnel has at least one step
2. Steps have at least one element
3. Stripe configured (if selling)
4. Custom domain verified (if using)

### Analytics Not Tracking

**Q: Zero visitors despite traffic**

**A: Solutions:**
1. Verify funnel is published
2. Check tracking code in page source
3. Test in incognito mode (bypass ad blockers)
4. Wait 5 minutes for data to appear

### Custom Domain Not Working

**Q: Domain shows 404 error**

**A: Verify DNS:**
```
CNAME: www.yourdomain.com → one.ie
A:     yourdomain.com     → 76.76.21.21
```

Wait 5-60 minutes for DNS propagation.

---

## Related

- [User Guide](/one/knowledge/funnel-builder/user-guide.md) - Complete user documentation
- [API Reference](/one/knowledge/funnel-builder/api-reference.md) - REST API docs
- [FAQ](/one/knowledge/funnel-builder/faq.md) - Common questions
- [Troubleshooting](/one/knowledge/funnel-builder/troubleshooting.md) - Issue resolution
- [100-Cycle Plan](/one/things/plans/clickfunnels-builder-100-cycles.md) - Original implementation plan
- [Ontology Mapping](/one/knowledge/ontology.md) - 6-dimension alignment

---

**Status:** ✅ Feature complete (Cycle 98)
**Next:** Video tutorials and advanced integrations (Phase 2)
