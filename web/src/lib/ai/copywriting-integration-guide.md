# AI Copywriting Tools - Integration Guide

## Overview

The AI Copywriting system provides tools for generating compelling funnel copy using proven conversion frameworks. This guide shows how to integrate these tools into AI agents and chatbots.

## Core Tools

### 1. `generate_headline`

Generate 5 headline variations for any product/audience.

**Parameters:**
```typescript
{
  audience: string;      // Target audience (e.g., "freelancers")
  product: string;       // Product name (e.g., "Client Mastery Course")
  benefit: string;       // Main benefit (e.g., "land high-paying clients")
  tone?: 'professional' | 'casual' | 'urgent' | 'friendly';
}
```

**Returns:** Array of 5 headline variations

**Example Usage:**
```typescript
import { generateHeadlines } from '@/lib/ai/copywriting-tools';

const headlines = generateHeadlines({
  audience: 'freelancers',
  product: 'Client Mastery Course',
  benefit: 'land high-paying clients consistently',
  tone: 'professional'
});

// Returns:
// [
//   "land high-paying clients consistently for freelancers: The Client Mastery Course Advantage",
//   "5 Ways freelancers Can land high-paying clients consistently with Client Mastery Course",
//   "From Struggling to Thriving: Client Mastery Course for freelancers",
//   ...
// ]
```

---

### 2. `generate_cta`

Generate call-to-action button text.

**Parameters:**
```typescript
{
  action: 'signup' | 'purchase' | 'download' | 'register' | 'learn_more' | 'get_started';
  urgency?: 'high' | 'medium' | 'low';
  product?: string;
}
```

**Returns:** Array of 5 CTA variations

**Example Usage:**
```typescript
import { generateCTA } from '@/lib/ai/copywriting-tools';

const ctas = generateCTA({
  action: 'signup',
  urgency: 'high',
  product: 'Client Mastery Course'
});

// Returns:
// [
//   "Sign Up NOW - Spots Filling Fast",
//   "Claim Your Spot (Only 12 Left)",
//   "Join Before It's Too Late",
//   "Last Chance to Sign Up",
//   "Get Client Mastery Course Now"
// ]
```

---

### 3. `generate_body_copy`

Generate body text using proven copywriting frameworks.

**Parameters:**
```typescript
{
  framework: 'PAS' | 'AIDA' | 'FAB' | 'BAB' | 'FourPs';
  audience: string;
  product: string;
  painPoint: string;
  transformation: string;
  uniqueValue: string;
}
```

**Returns:** Object with `fullCopy` and `sections`

**Example Usage:**
```typescript
import { generateBodyCopyTool } from '@/lib/ai/copywriting-tools';

const bodyCopy = generateBodyCopyTool({
  framework: 'PAS',
  audience: 'freelancers',
  product: 'Client Mastery Course',
  painPoint: 'struggling to find quality clients who pay well',
  transformation: 'earn $10K/month with premium clients',
  uniqueValue: 'proven templates used by 7-figure freelancers'
});

// Returns:
// {
//   fullCopy: "Struggling with earn $10K/month with premium clients?...",
//   sections: {
//     pain: "freelancers struggle with struggling to find quality clients...",
//     agitate: "Every day without progress means missed opportunities...",
//     solve: "Client Mastery Course provides proven templates..."
//   }
// }
```

---

## Copywriting Frameworks

### PAS (Pain, Agitate, Solve)

Best for: Products solving urgent problems

**Structure:**
1. **Pain:** Identify the customer's problem
2. **Agitate:** Make them feel the pain more intensely
3. **Solve:** Present your product as the solution

**Example:**
```
Pain: Struggling to get clients as a freelancer?
Agitate: Every day without clients means money slipping away. Bills pile up.
Solve: Master our proven system to land high-paying clients in 30 days.
```

---

### AIDA (Attention, Interest, Desire, Action)

Best for: General advertising and broad appeal

**Structure:**
1. **Attention:** Bold statement or question
2. **Interest:** Explain why this matters
3. **Desire:** Show transformation they want
4. **Action:** Clear call-to-action

**Example:**
```
Attention: Still charging $50/hour while others earn $10K/month?
Interest: The freelance game changed. Packages are king.
Desire: Imagine landing 5-figure projects with respected expertise.
Action: Join 2,847 freelancers who transformed in 90 days.
```

---

### FAB (Features, Advantages, Benefits)

Best for: Technical products or B2B

**Structure:**
1. **Features:** What your product has
2. **Advantages:** Why that matters technically
3. **Benefits:** How it improves their life

**Example:**
```
Feature: 50+ video lessons with step-by-step client acquisition
Advantage: Learn proven systems from 7-figure freelancers
Benefit: Land your first $5K client in 30 days without cold pitching
```

---

### BAB (Before, After, Bridge)

Best for: Transformation-focused products

**Structure:**
1. **Before:** Current painful situation
2. **After:** Desired future state
3. **Bridge:** How to get from before to after

**Example:**
```
Before: 40 hours/week hunting clients on Upwork, competing on price
After: Clients reaching out to YOU with premium budgets
Bridge: Our system teaches positioning, outreach, and pricing
```

---

### 4 Ps (Picture, Promise, Prove, Push)

Best for: High-ticket offers and launches

**Structure:**
1. **Picture:** Paint vivid scene of transformation
2. **Promise:** Make clear guarantee
3. **Prove:** Show social proof
4. **Push:** Strong CTA with urgency

**Example:**
```
Picture: Imagine waking up to 3 new client inquiries, each $10K+ budgets
Promise: Master client acquisition in 90 days or money back
Prove: Join 2,847 freelancers earning $10K+/month (verified)
Push: 47 spots left. Price increases Friday. Enroll now.
```

---

## AI Conversation Examples

### Example 1: Headline Generation

```
User: "Write a headline for my course"

AI: "I'd love to help! Tell me:
     1. Who is your target audience?
     2. What transformation do they want?
     3. What makes your course unique?"

User: "Freelancers who want to earn more"

AI: "Perfect! Here are 5 headline options:

     1. Double Your Freelance Income in 90 Days
     2. The Freelancer's Blueprint to $10K/Month
     3. Stop Undercharging: Master Premium Pricing
     4. From Broke Freelancer to Booked Solid
     5. Earn What You're Worth: Freelance Mastery

     Which resonates most with your audience?"
```

**Implementation:**
```typescript
// Step 1: Collect information
const questions = [
  "Who is your target audience?",
  "What transformation do they want?",
  "What makes your course unique?"
];

// Step 2: Generate headlines
const headlines = generateHeadlines({
  audience: userResponse.audience,
  product: userResponse.courseName,
  benefit: userResponse.transformation,
  tone: 'professional'
});

// Step 3: Present options
return `Perfect! Here are 5 headline options:\n\n${headlines.map((h, i) => `${i+1}. ${h}`).join('\n')}`;
```

---

### Example 2: CTA Generation

```
User: "I need a button for my signup page"

AI: "Great! A few quick questions:
     1. What action do you want (signup, purchase, download)?
     2. How urgent is your offer (high, medium, low)?
     3. What's your product name?"

User: "Signup, high urgency, Client Mastery Course"

AI: "Here are 5 high-urgency signup CTAs:

     1. Sign Up NOW - Spots Filling Fast
     2. Claim Your Spot (Only 12 Left)
     3. Join Before It's Too Late
     4. Last Chance to Sign Up
     5. Get Client Mastery Course Now

     Which matches your funnel's vibe?"
```

**Implementation:**
```typescript
const ctas = generateCTA({
  action: 'signup',
  urgency: 'high',
  product: 'Client Mastery Course'
});

return `Here are 5 high-urgency signup CTAs:\n\n${ctas.map((c, i) => `${i+1}. ${c}`).join('\n')}`;
```

---

### Example 3: Complete Funnel Copy

```
User: "I need copy for my entire landing page"

AI: "Let's create a complete funnel! I'll ask a few questions:

     1. Who is your target audience?
     2. What's your product/service?
     3. What's their main pain point?
     4. What transformation do you offer?
     5. What makes you unique?"

User: [Provides answers]

AI: "Perfect! Here's your complete funnel copy:

     HEADLINE (choose one):
     1. Double Your Freelance Income in 90 Days
     2. The Freelancer's Blueprint to $10K/Month
     ...

     BODY COPY (PAS Framework):
     Struggling to find quality clients who pay well?

     Most freelancers face this exact challenge...

     CTA BUTTONS (choose one):
     1. Start Your Transformation Now
     2. Get Instant Access
     ...

     Would you like me to:
     - Generate variations with different frameworks?
     - Adjust the tone (more urgent/casual)?
     - Create A/B test versions?"
```

**Implementation:**
```typescript
const funnelCopy = generateFunnelCopy({
  audience: 'freelancers',
  product: 'Client Mastery Course',
  benefit: 'earn more',
  painPoint: 'struggling to find quality clients',
  transformation: 'earn $10K/month',
  uniqueValue: 'proven templates',
  tone: 'professional',
  ctaAction: 'signup',
  urgency: 'high',
  framework: 'PAS'
});

// Return structured copy with headlines, body, and CTAs
```

---

## Integration with AI Agents

### Pattern 1: Conversational Wizard

Guide users through copy generation with questions:

```typescript
const copywritingWizard = {
  steps: [
    { question: "Who is your target audience?", field: "audience" },
    { question: "What's your product/service name?", field: "product" },
    { question: "What's the main benefit?", field: "benefit" },
    { question: "What tone do you prefer?", field: "tone", options: ["professional", "casual", "urgent"] }
  ],

  async complete(answers: Record<string, string>) {
    return generateHeadlines({
      audience: answers.audience,
      product: answers.product,
      benefit: answers.benefit,
      tone: answers.tone as Tone
    });
  }
};
```

---

### Pattern 2: One-Shot Generation

Generate everything at once with minimal input:

```typescript
async function quickCopy(prompt: string) {
  // Parse prompt with AI
  const parsed = await extractCopyParams(prompt);

  // Generate complete funnel copy
  return generateFunnelCopy(parsed);
}

// Usage:
const copy = await quickCopy(
  "I need copy for a freelance course that helps people earn $10K/month"
);
```

---

### Pattern 3: Iterative Refinement

Generate, show, refine based on feedback:

```typescript
async function refineCopy(userFeedback: string, previousCopy: string) {
  // Analyze feedback
  if (userFeedback.includes("more urgent")) {
    return generateHeadlines({ ...params, tone: 'urgent' });
  }

  if (userFeedback.includes("longer")) {
    return generateBodyCopyTool({ ...params, framework: 'FourPs' });
  }
}
```

---

## Best Practices

### 1. Always Ask for Context

Don't generate blind. Get:
- Target audience
- Product/service name
- Main benefit or transformation
- Tone preference

### 2. Provide Multiple Options

Always give 5+ variations to choose from.

### 3. Explain the "Why"

Tell users which framework you used and why:
```
"I used the PAS framework because your product solves an urgent pain point."
```

### 4. Enable A/B Testing

Suggest testing different variations:
```
"Test Variant A (benefit-focused) vs Variant B (urgency-focused)"
```

### 5. Offer Follow-Up Actions

After generating copy:
- "Would you like me to adjust the tone?"
- "Want to try a different framework?"
- "Should I generate email subject lines too?"

---

## Advanced Features

### Headline Analysis

Analyze any headline for effectiveness:

```typescript
import { analyzeHeadline } from '@/lib/ai/copywriting-tools';

const analysis = analyzeHeadline("Double Your Freelance Income in 90 Days");

// Returns:
// {
//   score: 85,
//   strengths: ["Contains numbers", "Clear benefit", "Optimal length"],
//   improvements: ["Consider adding emotional trigger"],
//   emotionalTriggers: ["transformation", "benefit"]
// }
```

### A/B Test Generation

Create test variations automatically:

```typescript
import { generateABTestHeadlines } from '@/lib/ai/copywriting-tools';

const test = generateABTestHeadlines({
  audience: 'freelancers',
  product: 'Course',
  benefit: 'earn more'
});

// Returns:
// {
//   variantA: "How freelancers earn more with Course",
//   variantB: "earn more for freelancers: The Course Advantage",
//   hypothesis: "Variant A focuses on 'how' (process), Variant B on 'advantage' (outcome)"
// }
```

---

## Error Handling

Always validate inputs:

```typescript
function generateSafely(params: CopyParams) {
  if (!params.audience || !params.product || !params.benefit) {
    return {
      error: "Missing required fields. Please provide: audience, product, and benefit."
    };
  }

  try {
    return generateHeadlines(params);
  } catch (error) {
    return {
      error: "Generation failed. Please try again with different inputs."
    };
  }
}
```

---

## Next Steps

After implementing copywriting tools, consider:

1. **Save Generated Copy** - Store to knowledge dimension for learning
2. **Performance Tracking** - Track which headlines convert best
3. **User Preferences** - Remember tone and framework preferences
4. **Multi-Language** - Extend tools for international audiences
5. **Industry Templates** - Add pre-built templates for common industries

---

## Examples in Production

### Funnel Builder Integration

```typescript
// When user creates a new funnel page
const funnelPage = {
  headline: await generateHeadlines(userInput)[0],
  cta: await generateCTA({ action: 'signup', urgency: 'high' })[0],
  bodyCopy: await generateBodyCopyTool({ framework: 'PAS', ...userInput })
};
```

### Email Campaign Generator

```typescript
// Generate email subject lines
const subjectLines = generateHeadlines({
  audience: emailList.audience,
  product: campaign.product,
  benefit: campaign.offer,
  tone: 'urgent'
});
```

### Landing Page Builder

```typescript
// Auto-generate landing page sections
const landingPage = generateFunnelCopy({
  audience: 'small business owners',
  product: 'InvoiceFlow',
  benefit: 'get paid faster',
  painPoint: 'chasing late payments',
  transformation: 'automate invoicing',
  uniqueValue: 'one-click payments',
  framework: 'BAB'
});
```

---

**Built with proven conversion frameworks. Test, iterate, convert.**
