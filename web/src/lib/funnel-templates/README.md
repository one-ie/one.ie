# Funnel Templates Library

**AI-powered funnel suggestions with 7 proven templates across 6 categories.**

This library provides pre-built, conversion-optimized funnel templates that AI can recommend based on user goals. Each template includes complete step sequences, element suggestions, copy patterns, and best practices.

## Quick Start

```typescript
import { suggestFromInput, getTemplateById } from '@/lib/funnel-templates';

// Get AI suggestion from user input
const suggestions = suggestFromInput("I want to build my email list");

console.log(suggestions[0].template.name);
// "Simple Lead Magnet Funnel"

console.log(suggestions[0].reason);
// "Classic lead magnet funnel - proven 35% conversion rate for building email lists"

// Get specific template
const template = getTemplateById('webinar-basic');
console.log(template.steps); // Array of 4 funnel pages
```

## Available Templates

### 1. Lead Generation (2 templates)

**Simple Lead Magnet Funnel** (`lead-magnet-basic`)
- **Conversion Rate:** 35%
- **Setup Time:** 20 minutes
- **Complexity:** Simple
- **Pages:** 2 (Opt-in, Thank You)
- **Best For:** Building email list, offering free PDF/checklist, quick setup

**Quiz Lead Funnel** (`lead-magnet-quiz`)
- **Conversion Rate:** 45%
- **Setup Time:** 1 hour
- **Complexity:** Medium
- **Pages:** 4 (Quiz Intro, Questions, Opt-in, Results)
- **Best For:** Audience segmentation, personalized recommendations, high engagement

### 2. Product Launch (1 template)

**Product Launch Funnel** (`product-launch-seed`)
- **Conversion Rate:** 25%
- **Setup Time:** 45 minutes
- **Complexity:** Medium
- **Pages:** 3 (Coming Soon, Waitlist Confirmation, Sales Page)
- **Best For:** Pre-launch buzz, validating product ideas, creating waitlists

### 3. Webinar (1 template)

**Automated Webinar Funnel** (`webinar-basic`)
- **Conversion Rate:** 40%
- **Setup Time:** 1 hour
- **Complexity:** Medium
- **Pages:** 4 (Registration, Confirmation, Replay, Checkout)
- **Best For:** High-ticket sales ($500+), building authority, automated presentations

### 4. E-commerce (1 template)

**E-commerce Tripwire Funnel** (`ecommerce-tripwire`)
- **Conversion Rate:** 30%
- **Setup Time:** 45 minutes
- **Complexity:** Medium
- **Pages:** 5 (Product, Checkout, Upsell, Downsell, Confirmation)
- **Best For:** Product sales, maximizing AOV with upsells, building buyer list

### 5. Membership (1 template)

**Membership Trial Funnel** (`membership-trial`)
- **Conversion Rate:** 35%
- **Setup Time:** 45 minutes
- **Complexity:** Medium
- **Pages:** 3 (Trial Offer, Checkout, Welcome)
- **Best For:** Subscription services, recurring revenue, membership sites

### 6. Summit/Event (1 template)

**Virtual Summit Funnel** (`virtual-summit`)
- **Conversion Rate:** 50%
- **Setup Time:** 90 minutes
- **Complexity:** Advanced
- **Pages:** 4 (Registration, Confirmation + Upsell, Daily Access, Replay Offer)
- **Best For:** Multi-day events, rapid list building, speaker partnerships

## AI Suggestion System

### Basic Usage

```typescript
import { suggestFromInput } from '@/lib/funnel-templates';

// AI analyzes user input and suggests best template
const suggestions = suggestFromInput("I want to sell my course");

suggestions.forEach(suggestion => {
  console.log(`${suggestion.template.name} (${suggestion.score}% match)`);
  console.log(`Reason: ${suggestion.reason}`);
});
```

### Advanced Usage

```typescript
import {
  detectIntent,
  suggestTemplates,
  getAIRecommendation
} from '@/lib/funnel-templates';

// 1. Detect user intent
const intent = detectIntent("I'm launching a webinar to sell my $997 course");
// {
//   goal: 'webinar',
//   pricePoint: 'high',
//   experience: undefined,
//   timeline: undefined,
//   keywords: ['webinar', 'education', 'high-ticket']
// }

// 2. Get matching templates
const suggestions = suggestTemplates(intent);

// 3. Get complete AI recommendation
const recommendation = getAIRecommendation("sell my online course");
console.log(recommendation.explanation);
// "Based on your goal... I recommend the Automated Webinar Funnel..."

console.log(recommendation.nextSteps);
// ["Review the 4-step funnel structure", "Customize the copy templates", ...]
```

## Template Structure

Each template includes:

```typescript
interface FunnelTemplate {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  description: string;           // What this funnel does
  category: string;              // lead-gen, webinar, ecommerce, etc.
  complexity: string;            // simple | medium | advanced
  conversionRate: number;        // Benchmark % (e.g., 35)
  estimatedSetupTime: string;    // "20 minutes"
  suggestedFor: string[];        // Use cases
  tags: string[];                // Searchable keywords
  steps: TemplateStep[];         // Funnel pages
}
```

### Template Steps

Each step represents a page in the funnel:

```typescript
interface TemplateStep {
  id: string;                    // Page identifier
  name: string;                  // Page name
  type: string;                  // landing, opt-in, sales, etc.
  description: string;           // Page purpose
  elements: ElementSuggestion[]; // Page elements
  colorScheme?: ColorScheme;     // Suggested colors
  bestPractices: string[];       // Implementation tips
}
```

### Element Suggestions

Each page includes suggested elements with copy:

```typescript
interface ElementSuggestion {
  type: string;          // headline, button, form, video, etc.
  position: number;      // Order on page
  content?: string;      // Suggested copy
  placeholder?: string;  // Dynamic content placeholder
  notes?: string;        // Best practice notes
}
```

## Query Helpers

### Get Template by ID

```typescript
import { getTemplateById } from '@/lib/funnel-templates';

const template = getTemplateById('lead-magnet-basic');
if (template) {
  console.log(template.steps.length); // 2
}
```

### Get Templates by Category

```typescript
import { getTemplatesByCategory } from '@/lib/funnel-templates';

const webinarTemplates = getTemplatesByCategory('webinar');
// Returns all webinar templates
```

### Search Templates

```typescript
import { searchTemplates } from '@/lib/funnel-templates';

const results = searchTemplates('email list');
// Returns templates matching "email list" in name, description, tags, or use cases
```

### Filter by Criteria

```typescript
import {
  getBeginnerTemplates,
  getQuickTemplates,
  getHighConvertingTemplates
} from '@/lib/funnel-templates';

// Templates for beginners
const beginner = getBeginnerTemplates();

// Templates with < 45 min setup
const quick = getQuickTemplates();

// Templates with > 35% conversion rate
const highConverting = getHighConvertingTemplates();
```

## Compare Templates

```typescript
import { compareTemplates } from '@/lib/funnel-templates';

const comparison = compareTemplates('lead-magnet-basic', 'lead-magnet-quiz');

console.log(comparison.differences);
// [
//   "Simple Lead Magnet is simple while Quiz Lead Funnel is medium complexity",
//   "Simple Lead Magnet takes 20 minutes vs 1 hour",
//   ...
// ]

console.log(comparison.bestFor.template1);
// ["Beginners and quick setup", "Faster launch", ...]

console.log(comparison.bestFor.template2);
// ["More experienced users", "Higher conversion rates", ...]
```

## Using Templates in UI

### Display Template Card

```tsx
import { FUNNEL_TEMPLATES } from '@/lib/funnel-templates';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function TemplateCard({ templateId }: { templateId: string }) {
  const template = FUNNEL_TEMPLATES.find(t => t.id === templateId);
  if (!template) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{template.name}</CardTitle>
        <Badge>{template.complexity}</Badge>
      </CardHeader>
      <CardContent>
        <p>{template.description}</p>
        <p>Conversion Rate: {template.conversionRate}%</p>
        <p>Setup Time: {template.estimatedSetupTime}</p>
        <p>Steps: {template.steps.length} pages</p>
      </CardContent>
    </Card>
  );
}
```

### AI Suggestion Component

```tsx
import { suggestFromInput } from '@/lib/funnel-templates';
import { useState } from 'react';

export function FunnelSuggester() {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const handleSuggest = () => {
    const results = suggestFromInput(input);
    setSuggestions(results);
  };

  return (
    <div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="What's your goal? (e.g., build email list)"
      />
      <button onClick={handleSuggest}>Get Suggestions</button>

      {suggestions.map((suggestion) => (
        <div key={suggestion.template.id}>
          <h3>{suggestion.template.name}</h3>
          <p>Match: {suggestion.score}%</p>
          <p>{suggestion.reason}</p>
        </div>
      ))}
    </div>
  );
}
```

## Example: Building a Funnel from Template

```typescript
import { getTemplateById } from '@/lib/funnel-templates';

// 1. Get the template
const template = getTemplateById('lead-magnet-basic');

// 2. Create pages from template steps
template.steps.forEach((step, index) => {
  console.log(`Creating page ${index + 1}: ${step.name}`);

  // 3. Add elements from template
  step.elements.forEach((element) => {
    console.log(`  - Add ${element.type}: ${element.content || element.placeholder}`);

    // Your logic to create funnel page elements
    // createFunnelElement({
    //   type: element.type,
    //   content: element.content,
    //   position: element.position
    // });
  });

  // 4. Apply color scheme
  if (step.colorScheme) {
    console.log(`  - Apply colors: ${JSON.stringify(step.colorScheme)}`);
  }

  // 5. Show best practices
  console.log(`  - Best practices:`);
  step.bestPractices.forEach(bp => console.log(`    * ${bp}`));
});
```

## Intent Detection

The AI can detect user intent from natural language:

```typescript
import { detectIntent } from '@/lib/funnel-templates';

// Detects: email list building
detectIntent("I want to grow my email list with a free PDF");

// Detects: webinar for high-ticket
detectIntent("I'm hosting a training to sell my $997 course");

// Detects: product launch
detectIntent("I'm launching a new app next month and want to build a waitlist");

// Detects: quiz funnel
detectIntent("I want to segment my audience with a quiz");
```

### Supported Intent Keywords

**Goals:**
- `email`, `list`, `leads`, `subscribers` → build-email-list
- `quiz`, `assessment`, `survey` → interactive-lead-gen
- `launch`, `pre-launch`, `waitlist` → product-launch
- `webinar`, `workshop`, `training` → webinar
- `sell`, `product`, `ecommerce`, `shop` → sell-product
- `membership`, `subscription`, `trial` → membership
- `summit`, `conference`, `event` → summit

**Price Points:**
- `cheap`, `low price`, `under $50`, `tripwire` → low
- `mid price`, `$100-$500` → medium
- `expensive`, `high ticket`, `premium`, `over $500` → high

**Experience Levels:**
- `beginner`, `first time`, `new to`, `simple` → beginner
- `intermediate`, `some experience` → intermediate
- `advanced`, `complex`, `sophisticated` → advanced

**Timeline:**
- `quick`, `fast`, `asap`, `today` → quick
- `detailed`, `comprehensive`, `complete` → comprehensive

## Statistics

```typescript
import { TEMPLATE_STATS } from '@/lib/funnel-templates';

console.log(TEMPLATE_STATS);
// {
//   total: 7,
//   categories: 6,
//   avgConversionRate: 37,
//   avgSetupTime: '50 minutes',
//   totalSteps: 26,
//   complexityDistribution: { simple: 1, medium: 5, advanced: 1 }
// }
```

## Categories Reference

```typescript
import { CATEGORIES } from '@/lib/funnel-templates';

Object.entries(CATEGORIES).forEach(([key, category]) => {
  console.log(`${category.icon} ${category.name}`);
  console.log(`   ${category.description}`);
  console.log(`   Templates: ${category.templates}`);
});

// Output:
// 📧 Lead Generation
//    Build your email list with free offers and quizzes
//    Templates: 2
// 🚀 Product Launch
//    Create buzz and waitlists for new product launches
//    Templates: 1
// ... etc
```

## Best Practices

### 1. Use AI Suggestions First

Always start with `suggestFromInput()` to get AI recommendations:

```typescript
const suggestions = suggestFromInput(userGoal);
const bestMatch = suggestions[0];
```

### 2. Show Alternatives

Present multiple options to users:

```typescript
const primary = suggestions[0];
const alternatives = primary.alternatives || suggestions.slice(1, 3);
```

### 3. Explain Why

Always show the reasoning:

```typescript
console.log(`Recommended: ${suggestion.template.name}`);
console.log(`Why: ${suggestion.reason}`);
```

### 4. Customize Copy

Use template copy as starting points, not final copy:

```typescript
const headline = step.elements.find(e => e.type === 'headline');
// Show headline.content as placeholder, let user customize
```

### 5. Include Best Practices

Display best practices for each page:

```typescript
step.bestPractices.forEach(practice => {
  showTip(practice);
});
```

## Integration with Funnel Builder

This template library is designed to integrate with the AI-powered funnel builder:

```typescript
// User: "I want to build my email list"

// 1. AI suggests template
const suggestions = suggestFromInput(userInput);
const template = suggestions[0].template;

// 2. Create funnel from template
const funnel = await createFunnel({
  name: "My Email List Funnel",
  templateId: template.id
});

// 3. Create pages from template steps
for (const step of template.steps) {
  await createFunnelPage({
    funnelId: funnel.id,
    name: step.name,
    type: step.type,
    elements: step.elements.map(el => ({
      type: el.type,
      content: el.content,
      position: el.position
    }))
  });
}

// 4. Apply template styling
await applyColorScheme(funnel.id, template.steps[0].colorScheme);

// 5. Show best practices
showOnboardingTips(template.steps[0].bestPractices);
```

## Testing

```typescript
import { describe, test, expect } from 'bun:test';
import { suggestFromInput, getTemplateById } from '@/lib/funnel-templates';

describe('Funnel Templates', () => {
  test('suggests correct template for email list building', () => {
    const suggestions = suggestFromInput('build my email list');
    expect(suggestions[0].template.id).toBe('lead-magnet-basic');
    expect(suggestions[0].score).toBeGreaterThan(50);
  });

  test('suggests webinar for high-ticket sales', () => {
    const suggestions = suggestFromInput('sell my $1000 course');
    expect(suggestions[0].template.id).toBe('webinar-basic');
  });

  test('returns template by ID', () => {
    const template = getTemplateById('ecommerce-tripwire');
    expect(template).toBeDefined();
    expect(template?.steps.length).toBe(5);
  });
});
```

## Future Enhancements

- [ ] Add more templates (7 → 20+)
- [ ] Industry-specific templates (real estate, coaching, SaaS)
- [ ] A/B test variations for each template
- [ ] Template performance tracking
- [ ] Visual previews/screenshots
- [ ] Template customization wizard
- [ ] Integration with page builder
- [ ] Copy variation suggestions
- [ ] Smart element ordering based on AI
- [ ] Template versioning and updates

## License

Part of the ONE.ie platform. See main LICENSE file.
