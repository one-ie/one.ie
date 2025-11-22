# AI Funnel Builder - Conversational Creation Guide

**Create high-converting sales funnels through natural conversation.**

Part of Cycle 43: Conversational Funnel Creation Flow

---

## Overview

The AI Funnel Builder guides users through creating complete sales funnels using ChatClientV2 with specialized prompts, tools, and conversation flows.

### Key Features

✅ **Conversational Flow** - Natural language funnel creation
✅ **Template Recommendations** - AI suggests optimal funnel types
✅ **Step-by-Step Guidance** - Build pages with AI assistance
✅ **Smart Customization** - Personalize branding and design
✅ **Preview & Publish** - See and launch your funnel

---

## Architecture

```
/web/src/pages/funnels/builder.astro
├─ Uses FunnelBuilderChat component
├─ Full-screen chat interface
└─ Sidebar collapsed for maximum space

/web/src/components/ai/FunnelBuilderChat.tsx
├─ Specialized ChatClientV2
├─ Funnel-specific suggestions
└─ Tool integration (when backend ready)

/web/src/lib/ai/funnel-prompts.ts
├─ FUNNEL_BUILDER_SYSTEM_PROMPT
├─ FUNNEL_TEMPLATES (7 templates)
└─ STAGE_PROMPTS (5 stages)

/web/src/lib/ai/funnel-tools.ts
├─ create_funnel
├─ add_funnel_step
├─ customize_funnel
├─ preview_funnel
├─ publish_funnel
└─ get_template_info
```

---

## Conversation Flow (5 Stages)

### Stage 1: Discovery (Understanding)

**AI asks about:**
- What they're selling
- Target audience
- Main goal (leads, sales, signups)
- Experience level

**Example:**
```
User: "I want to sell my online course"

AI: "Excellent! I'll help you create a high-converting course funnel.
     First, let me understand your needs:

     1. What's your course about?
     2. Who is your target audience?
     3. What's the price point?
     4. Have you launched courses before?"
```

### Stage 2: Template Selection (Recommendation)

**AI suggests 3 templates:**
- Explains why each fits their needs
- Shows conversion rates
- Describes funnel steps

**Example:**
```
User: "Productivity course for entrepreneurs, $497, first launch"

AI: "Perfect! For a $497 course, I recommend:

     **1. Product Launch Funnel** ⭐ RECOMMENDED
        - Pre-launch buzz building
        - Early bird discount
        - Launch day sales page
        - Expected conversion: 8-12%

     **2. Webinar Funnel**
        - Free training first
        - Pitch at the end
        - Expected conversion: 5-10%

     **3. Simple Sales Page**
        - Direct to sales
        - Quick testing
        - Expected conversion: 2-5%

     Which approach sounds best?"
```

### Stage 3: Customization (Branding)

**AI helps with:**
- Funnel name and URL slug
- Brand colors (primary, secondary)
- Logo and imagery
- Tone and voice

**Example:**
```
User: "Let's go with Product Launch"

AI: "Great choice! Now let's personalize your funnel.

     1. What should we name your funnel?
     2. What are your brand colors? (hex codes)
     3. What tone works best? (professional/casual/urgent)"
```

### Stage 4: Build Pages (Step-by-Step)

**AI creates each page:**
- Page purpose and goal
- Headline suggestions
- Key sections
- CTA recommendations

**Example:**
```
AI: "Let's build your Coming Soon page:

     **Suggested headline:**
     'The Productivity System That Helped 10,000+ Entrepreneurs
      Reclaim 20 Hours Per Week'

     **Key sections:**
     - Countdown timer (14 days until launch)
     - 3 key benefits
     - Email signup form
     - Social proof

     Want me to create this page?"

User: "Yes, create it!"

AI: *calls create_funnel_step tool*
    "✓ Created Coming Soon page!

     Next, let's build your Early Bird Offer page.
     This is where we reward early adopters..."
```

### Stage 5: Preview & Publish (Launch)

**AI helps with:**
- Preview funnel flow
- Add tracking codes
- Set up Stripe payments
- Publish and get URL

**Example:**
```
AI: "Your funnel is ready for preview:

     **Funnel Flow:**
     1. Coming Soon → Collect emails
     2. Early Bird → $397 (20% off)
     3. Launch Day → $497 full price
     4. Thank You → Deliver course

     **Next steps:**
     - Add Stripe for payments?
     - Add Google Analytics tracking?
     - Preview pages before publishing?

     When ready, I'll publish your funnel!"
```

---

## 7 Funnel Templates

### 1. Product Launch Funnel
**Best for:** Courses, info products, software
**Steps:** Coming Soon → Early Bird → Launch → Thank You
**Conversion:** 8-12%
**Timeline:** 2-4 weeks

### 2. Webinar Funnel
**Best for:** High-ticket coaching, B2B services
**Steps:** Registration → Reminder → Webinar → Replay → Thank You
**Conversion:** 20-30% attend, 5-10% buy
**Timeline:** 1-2 weeks

### 3. Simple Sales Page
**Best for:** Physical products, low-ticket items
**Steps:** Landing → Checkout → Upsell → Thank You
**Conversion:** 2-5%
**Timeline:** 1-3 days

### 4. Lead Magnet Funnel
**Best for:** Free guides, email list building
**Steps:** Landing → Delivery → Welcome Email
**Conversion:** 30-50%
**Timeline:** 1 day

### 5. Book Launch Funnel
**Best for:** Book pre-orders, author platform
**Steps:** Pre-order → Bonuses → Launch → Thank You
**Conversion:** 15-25%
**Timeline:** 2-8 weeks

### 6. Membership Funnel
**Best for:** Subscriptions, communities, SaaS
**Steps:** Sales → Trial → Onboarding → Member Area
**Conversion:** 5-15%
**Timeline:** Ongoing

### 7. Summit/Event Funnel
**Best for:** Virtual summits, conferences
**Steps:** Registration → Schedule → Sessions → All-Access
**Conversion:** 40-60% register, 10-20% upgrade
**Timeline:** 1-3 months

---

## AI Tools Available

### create_funnel
```typescript
// Creates new funnel with settings
{
  name: "Productivity Course Launch",
  template: "product-launch",
  description: "High-converting course funnel",
  primaryColor: "#2563eb",
  secondaryColor: "#7c3aed"
}
```

### add_funnel_step
```typescript
// Adds page to funnel sequence
{
  funnelId: "funnel_123",
  name: "Coming Soon",
  type: "landing",
  order: 1,
  settings: {
    headline: "Launching Soon!",
    ctaText: "Get Early Access"
  }
}
```

### customize_funnel
```typescript
// Updates funnel branding
{
  funnelId: "funnel_123",
  updates: {
    primaryColor: "#10b981",
    customDomain: "launch.mysite.com",
    googleAnalyticsId: "G-XXXXXXXXXX"
  }
}
```

### preview_funnel
```typescript
// Generates preview
{
  funnelId: "funnel_123",
  includeAnalytics: true
}
```

### publish_funnel
```typescript
// Makes funnel live
{
  funnelId: "funnel_123",
  enableTracking: true,
  enableStripe: true
}
```

---

## Example Conversations

### Example 1: E-commerce Product Launch

```
User: "I want to create a funnel to sell hoodies"

AI: "Perfect! I'll help you create a hoodie sales funnel.
     Tell me:

     1. What makes your hoodies special?
     2. Who's buying them? (age, interests)
     3. Price range?

     This helps me suggest the best funnel type!"

User: "Premium eco-friendly hoodies, ages 25-35, $89"

AI: "Excellent! For premium hoodies at $89, I recommend:

     **1. Product Launch Funnel** ⭐ RECOMMENDED
        - Pre-launch waitlist
        - Early bird 15% discount
        - Launch day full price
        - Perfect for: Building hype

     **2. Simple Sales Page**
        - Direct product page
        - Add to cart
        - Quick checkout
        - Perfect for: Immediate sales

     Which approach fits your launch timeline?"

User: "Product launch, we want to build hype first"

AI: "Smart choice! Let's set it up.

     **Funnel name:** What should we call this?
     Example: 'Eco Hoodie Launch 2025'

     **Brand colors:** Share your hex codes
     Example: #10b981 (green) #1f2937 (dark gray)"

User: "EcoHoods Launch, #047857 and #6b7280"

AI: *creates funnel*
    "✓ Created 'EcoHoods Launch' funnel!

     Now let's build your pages:

     **Page 1: Coming Soon**
     - Countdown timer (21 days)
     - Email signup for early access
     - Preview image of hoodie
     - '500 Limited Units' scarcity

     Sound good? I'll create this now."
```

### Example 2: Course Launch

```
User: "Create a webinar funnel for my $2,000 coaching program"

AI: "Excellent! Webinars work great for high-ticket coaching.

     Quick questions:
     1. What's your coaching niche?
     2. How long is the webinar? (60-90 min ideal)
     3. Have you run webinars before?

     This ensures we optimize conversion!"

User: "Leadership coaching, 90 min, yes I've done 3 before"

AI: "Perfect! Since you're experienced, I'll set up an
     advanced webinar funnel:

     **Your Funnel Flow:**
     1. Registration Page (sign up for webinar)
     2. Confirmation Page (add to calendar)
     3. Reminder Sequence (email/SMS before event)
     4. Webinar Page (live or automated)
     5. Replay Page (for no-shows)
     6. Thank You (after purchase)

     **Optimization Tips:**
     - Show social proof on registration
     - Offer limited-time bonuses
     - Create urgency (24-hour replay)

     Ready to build this?"

User: "Yes, let's do it"

AI: *creates funnel with 6 pages*
    "✓ Created complete webinar funnel!

     **Next Steps:**
     - Add Stripe for $2,000 payments?
     - Connect your webinar software (Zoom/WebinarJam)?
     - Set up email reminders (ConvertKit/ActiveCampaign)?

     What would you like to tackle first?"
```

---

## Suggestion Groups (UI)

### Popular Funnels
- "I want to sell an online course - help me create a high-converting funnel"
- "Create a webinar funnel for my $2,000 coaching program"
- "Build a lead magnet funnel to grow my email list"

### E-commerce
- "Create a product launch funnel with countdown timer"
- "Build a cart abandonment recovery funnel"
- "Set up a subscription box funnel"

### Lead Generation
- "Build a lead magnet funnel with free checklist"
- "Create a consultation booking funnel"
- "Design a free trial funnel for SaaS"

### Events & Webinars
- "Create a webinar registration funnel"
- "Build a virtual summit funnel"
- "Design a workshop registration funnel"

### Memberships
- "Build a membership funnel with 14-day trial"
- "Create a course platform funnel"
- "Design a community funnel with tiers"

### Advanced
- "Create an application funnel for high-ticket coaching"
- "Build a product launch with 3 phases"
- "Set up a certification program funnel"

---

## Integration Points

### When Backend Ready

**1. Wire up tools:**
```typescript
<FunnelBuilderChat
  tools={funnelBuilderTools}
  onToolCall={handleToolCall}
/>
```

**2. Connect to Convex:**
```typescript
const handleToolCall = async (toolName, args) => {
  switch (toolName) {
    case 'create_funnel':
      return await convex.mutation(api.mutations.funnels.create, args);
    case 'add_funnel_step':
      return await convex.mutation(api.mutations.funnels.addStep, args);
    // etc...
  }
};
```

**3. Navigate on creation:**
```typescript
<FunnelBuilderChat
  onFunnelCreated={(funnelId) => {
    router.push(`/funnels/${funnelId}/edit`);
  }}
  onFunnelPublished={(funnelId, url) => {
    toast.success(`Funnel published: ${url}`);
  }}
/>
```

### Stripe Integration

After funnel creation, offer Stripe setup:

```
AI: "Your funnel is ready! To accept payments:

     1. Add your Stripe API keys
     2. I'll configure checkout pages
     3. Test with Stripe test mode
     4. Go live when ready

     Here's the guide: https://one.ie/docs/develop/stripe"
```

---

## Design Principles

### 1. Guide, Don't Dictate
- Users make final decisions
- AI provides recommendations with reasoning
- Always offer options, not commands

### 2. Show, Don't Tell
- Preview pages before creating
- Visualize funnel flow
- Example headlines and copy

### 3. One Question at a Time
- Don't overwhelm with 10 questions
- Progressive disclosure
- Build confidence step-by-step

### 4. Explain Why
- "This works because..."
- Show conversion rates
- Reference best practices

### 5. Optimize for Conversion
- Suggest proven patterns
- Highlight scarcity/urgency
- Recommend A/B tests

---

## Success Metrics

**Funnel Creation Speed:**
- Traditional: 2-8 hours
- AI-guided: 10-20 minutes

**Conversion Optimization:**
- AI suggests proven templates
- Built-in best practices
- Automatic scarcity/urgency

**User Experience:**
- Natural conversation
- No technical knowledge needed
- Step-by-step guidance

---

## Future Enhancements

### Phase 2 (Cycle 44+)
- Visual funnel flow diagram
- Drag-and-drop page reordering
- Real-time preview as you chat

### Phase 3 (Cycle 50+)
- A/B testing suggestions
- AI-generated copy and headlines
- Integration with email platforms

### Phase 4 (Cycle 60+)
- Clone existing high-converting funnels
- Industry-specific templates
- AI optimization recommendations

---

## Related Documentation

- **100-Cycle Plan:** `/one/things/plans/clickfunnels-builder-100-cycles.md`
- **Funnel Schema:** `/web/src/lib/schemas/funnel-schema.ts`
- **Ontology Mapping:** Funnels map to 6-dimension model (14 thing types, 12 connection types, 18 event types)

---

**Built with ONE Platform's 6-dimension ontology and progressive complexity architecture.**
