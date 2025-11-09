# MDX Components for Feature Pages

Conversion-optimized React components for embedding in feature markdown (.mdx) files.

## Overview

These components enable interactive demos, CTAs, comparisons, and social proof directly within feature pages. All components are built with shadcn/ui for consistency and are fully type-safe.

## Installation

MDX support is already configured. Just import and use components in `.mdx` files.

## Available Components

### 1. FeatureDemo

Interactive feature previews with optional live demo and code links.

**Usage:**
```mdx
<FeatureDemo
  title="Try Authentication"
  description="See magic link login in action"
  demoUrl="/demo/auth/magic-link"
  codeUrl="https://github.com/example/auth-demo"
>
  <YourCustomDemoComponent />
</FeatureDemo>
```

**Props:**
- `title` (string, required) - Demo title
- `description` (string, optional) - Demo description
- `demoUrl` (string, optional) - Link to live demo
- `codeUrl` (string, optional) - Link to source code
- `children` (ReactNode, optional) - Custom demo content

---

### 2. FeatureCTA

Call-to-action component to drive conversions. Supports multiple variants.

**Usage:**
```mdx
<FeatureCTA
  title="Ready to get started?"
  description="Sign up in under 5 minutes"
  primaryText="Start Free Trial"
  primaryUrl="/signup"
  secondaryText="View Pricing"
  secondaryUrl="/pricing"
  variant="gradient"
/>
```

**Props:**
- `title` (string, required) - CTA headline
- `description` (string, optional) - Supporting text
- `primaryText` (string, default: "Get Started") - Primary button text
- `primaryUrl` (string, default: "/signup") - Primary button URL
- `secondaryText` (string, optional) - Secondary button text
- `secondaryUrl` (string, optional) - Secondary button URL
- `variant` ("default" | "gradient" | "minimal", default: "default") - Visual style

**Variants:**
- `default` - Subtle background with primary border
- `gradient` - Eye-catching gradient background
- `minimal` - Clean border-only style

---

### 3. FeatureComparison

Side-by-side comparison table showing advantages vs competitors.

**Usage:**
```mdx
<FeatureComparison
  title="ONE vs Competitors"
  description="See why developers choose ONE"
  competitorName="Other Platforms"
  rows={[
    { feature: "Setup Time", one: "5 minutes", competitor: "30+ minutes" },
    { feature: "OAuth Providers", one: true, competitor: false },
    { feature: "Price", one: "$0-120/mo", competitor: "$500+/mo" }
  ]}
/>
```

**Props:**
- `title` (string, default: "Feature Comparison") - Table title
- `description` (string, optional) - Table description
- `competitorName` (string, default: "Competitors") - Competitor column header
- `rows` (array, required) - Comparison rows

**Row format:**
```typescript
{
  feature: string;           // Feature name
  one: boolean | string;     // ONE's value (✓/✗ for boolean)
  competitor?: boolean | string; // Competitor's value
}
```

---

### 4. PricingCalculator

Interactive ROI calculator with slider input.

**Usage:**
```mdx
<PricingCalculator
  title="Cost Calculator"
  description="See how much you save"
  basePrice={0}
  pricePerUnit={0.01}
  unitName="monthly active users"
  maxUnits={100000}
/>
```

**Props:**
- `title` (string, default: "Cost Calculator") - Calculator title
- `description` (string, optional) - Calculator description
- `basePrice` (number, default: 0) - Base monthly fee
- `pricePerUnit` (number, default: 0.01) - Price per unit
- `unitName` (string, default: "users") - Unit description
- `maxUnits` (number, default: 10000) - Maximum slider value

**Note:** Assumes competitors cost 3x more (hardcoded for simplicity).

---

### 5. SocialProof

Customer testimonials, ratings, and usage statistics.

**Usage:**
```mdx
<SocialProof
  title="Trusted by Thousands"
  testimonials={[
    {
      quote: "Best auth system ever!",
      author: "Sarah Chen",
      role: "CTO",
      company: "TechCorp",
      rating: 5
    }
  ]}
  stats={[
    { label: "Active Users", value: "50,000+" },
    { label: "Uptime", value: "99.99%" }
  ]}
/>
```

**Props:**
- `title` (string, default: "What Our Users Say") - Section title
- `testimonials` (array, optional) - Customer testimonials
- `stats` (array, optional) - Usage statistics

**Testimonial format:**
```typescript
{
  quote: string;        // Testimonial text
  author: string;       // Customer name
  role: string;         // Job title
  company?: string;     // Company name
  rating?: number;      // 1-5 stars
}
```

**Stat format:**
```typescript
{
  label: string;  // Metric name
  value: string;  // Metric value
}
```

---

### 6. CodePlayground

Live code examples with syntax highlighting and copy-to-clipboard.

**Usage:**
```mdx
<CodePlayground
  title="Sign In Example"
  description="Add authentication in 3 lines"
  examples={[
    {
      language: "typescript",
      label: "TypeScript",
      code: `import { auth } from '@/lib/auth';
await auth.signIn({ email, password });`
    },
    {
      language: "javascript",
      label: "JavaScript",
      code: `import { auth } from '@/lib/auth';
await auth.signIn({ email, password });`
    }
  ]}
/>
```

**Props:**
- `title` (string, default: "Code Example") - Playground title
- `description` (string, optional) - Playground description
- `examples` (array, required) - Code examples
- `runnable` (boolean, default: false) - Show "Live Preview" badge

**Example format:**
```typescript
{
  language: string;  // Language for syntax highlighting
  code: string;      // Code to display
  label?: string;    // Tab label (defaults to language)
}
```

**Features:**
- Tab navigation for multiple examples
- One-click copy to clipboard
- Syntax highlighting (basic)
- Mobile-responsive

---

## Component Guidelines

### File Type Requirements

**CRITICAL:** All components must be `.tsx` files, not `.astro` files.

```
✅ src/components/features/mdx/FeatureCTA.tsx
❌ src/components/features/mdx/FeatureCTA.astro
```

### Importing in MDX

Always import at the top of the MDX file:

```mdx
---
title: "My Feature"
---

import { FeatureCTA } from '@/components/features/mdx/FeatureCTA';
import { CodePlayground } from '@/components/features/mdx/CodePlayground';

## Feature Content

<FeatureCTA title="Get Started" />
<CodePlayground examples={...} />
```

### Client-Side Interactivity

Components marked `"use client"` (PricingCalculator, CodePlayground) automatically hydrate on the client. No `client:load` directive needed in MDX.

### Styling

All components use:
- shadcn/ui primitives (Card, Button, Badge, etc.)
- Tailwind CSS v4 classes
- Dark mode support via `.dark` class

### Accessibility

All components include:
- Semantic HTML
- ARIA labels where appropriate
- Keyboard navigation support
- Screen reader compatibility

---

## Best Practices

### Conversion Optimization

**Do:**
- Place CTAs after value propositions
- Show social proof near pricing
- Use comparisons to highlight advantages
- Provide interactive demos for complex features

**Don't:**
- Overuse CTAs (1-3 per page maximum)
- Make comparisons unfair or misleading
- Add demos without clear value
- Overwhelm users with too many components

### Performance

- Components are code-split automatically
- Interactive components lazy-load
- Images should use Astro's `<Image>` component
- Keep demo content lightweight

### Content Strategy

**Feature Page Structure:**
1. Overview + CTA (top)
2. Feature details + Code examples
3. Comparison table (middle)
4. Social proof (before pricing)
5. Pricing calculator (optional)
6. Final CTA (bottom)

---

## Examples

See `src/content/features/auth.mdx` for a complete example using all components.

**Key patterns:**

1. **Multiple CTAs with different variants:**
   ```mdx
   <FeatureCTA variant="gradient" />  <!-- Hero CTA -->
   <FeatureCTA variant="minimal" />   <!-- Mid-page CTA -->
   <FeatureCTA variant="gradient" />  <!-- Final CTA -->
   ```

2. **Code + Comparison combo:**
   ```mdx
   <CodePlayground examples={codeExamples} />
   <FeatureComparison rows={comparisonData} />
   ```

3. **Social proof before pricing:**
   ```mdx
   <SocialProof testimonials={...} stats={...} />
   <PricingCalculator ... />
   <FeatureCTA variant="gradient" />
   ```

---

## Troubleshooting

### Component not rendering

**Issue:** Component shows as text, not rendered.

**Fix:** Check import statement. Must import from correct path:
```mdx
import { FeatureCTA } from '@/components/features/mdx/FeatureCTA';
```

### TypeScript errors

**Issue:** Props showing type errors.

**Fix:** Check component TypeScript interface for required vs optional props.

### Styling not working

**Issue:** Component looks unstyled.

**Fix:** Ensure Tailwind CSS is configured and `global.css` is imported.

### Client-side features not working

**Issue:** Interactive components (PricingCalculator, CodePlayground) not interactive.

**Fix:** Ensure `"use client"` directive is at top of component file.

---

## Contributing

When adding new MDX components:

1. Create `.tsx` file in `src/components/features/mdx/`
2. Export named component (not default export)
3. Add to `index.ts` for easy importing
4. Document in this README
5. Add example to `auth.mdx` or other feature page
6. Test in dev and production builds

**File naming:** Use PascalCase for component files (`FeatureCTA.tsx`, not `feature-cta.tsx`)

---

## Related Documentation

- **MDX in Astro:** https://docs.astro.build/en/guides/markdown-content/
- **shadcn/ui:** https://ui.shadcn.com/docs/components
- **Tailwind v4:** https://tailwindcss.com/docs
- **Feature Schema:** `src/content/config.ts`

---

**Built for conversion. Optimized for performance. Type-safe throughout.**
