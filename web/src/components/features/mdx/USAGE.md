# MDX Component Usage Guide

## ✅ Working Example

Visit: `http://localhost:4321/features/simple-demo`

## How to Use MDX Components in Feature Pages

### Step 1: Create/Convert Feature File to .mdx

```bash
# Create new
touch src/content/features/my-feature.mdx

# Or convert existing
mv src/content/features/my-feature.md src/content/features/my-feature.mdx
```

### Step 2: Add Imports Using Relative Paths

```mdx
---
title: "My Feature"
description: "Feature with embedded components"
featureId: "my-feature"
category: "developer-tools"
status: "completed"
version: "1.0.0"
releaseDate: 2025-11-08T00:00:00Z
draft: false
---

import { FeatureCTA } from '../../components/features/mdx/FeatureCTA.tsx';
import { FeatureComparison } from '../../components/features/mdx/FeatureComparison.tsx';

## My Feature Content

<FeatureCTA
  title="Ready to Get Started?"
  description="Join thousands using this feature"
  primaryText="Start Free Trial"
  primaryUrl="/signup"
/>
```

### Step 3: Use Components Anywhere in Your Content

All components are now available to use with JSX syntax.

## Available Components

### 1. FeatureCTA (Call-to-Action)

```mdx
import { FeatureCTA } from '../../components/features/mdx/FeatureCTA.tsx';

<FeatureCTA
  title="Ready to Get Started?"
  description="Join thousands using ONE Platform"
  primaryText="Start Free Trial"
  primaryUrl="/signup"
  secondaryText="View Docs"
  secondaryUrl="/docs"
  variant="gradient"  // options: "default" | "gradient" | "minimal"
/>
```

### 2. FeatureComparison (Comparison Table)

```mdx
import { FeatureComparison } from '../../components/features/mdx/FeatureComparison.tsx';

<FeatureComparison
  title="ONE vs Competitors"
  rows={[
    { feature: "Setup Time", one: "5 min", competitor: "30+ min" },
    { feature: "Multi-Tenancy", one: "Built-in", competitor: "DIY" },
    { feature: "Type Safety", one: "Full TypeScript", competitor: "Partial" }
  ]}
/>
```

### 3. PricingCalculator (Interactive)

```mdx
import { PricingCalculator } from '../../components/features/mdx/PricingCalculator.tsx';

<PricingCalculator
  title="Calculate Your Savings"
  basePrice={29}
  pricePerUnit={0.01}
  unitName="API calls per month"
  maxUnits={100000}
/>
```

### 4. SocialProof (Testimonials)

```mdx
import { SocialProof } from '../../components/features/mdx/SocialProof.tsx';

<SocialProof
  testimonials={[
    {
      quote: "This feature is amazing!",
      author: {
        name: "Sarah Chen",
        role: "CTO",
        company: "TechCo",
        avatarUrl: "/avatars/sarah.jpg"
      },
      rating: 5
    }
  ]}
  stats={{
    userCount: 12453,
    transactionVolume: "$2.4M",
    uptime: "99.98%"
  }}
  companyLogos={[
    { name: "Stripe", logoUrl: "/logos/stripe.svg" }
  ]}
/>
```

### 5. CodePlayground (Code Examples)

```mdx
import { CodePlayground } from '../../components/features/mdx/CodePlayground.tsx';

<CodePlayground
  title="Quick Start Example"
  examples={[
    {
      language: "typescript",
      code: `import { ONE } from 'oneie';
const platform = new ONE({ groupId: 'your-org' });`
    }
  ]}
/>
```

### 6. FeatureDemo (Demo Links)

```mdx
import { FeatureDemo } from '../../components/features/mdx/FeatureDemo.tsx';

<FeatureDemo
  title="See It In Action"
  description="Try our interactive demo"
  demoUrl="https://demo.one.ie"
  videoUrl="https://youtube.com/watch?v=..."
  codeUrl="https://github.com/..."
/>
```

## Import All at Once

```mdx
import {
  FeatureCTA,
  FeatureComparison,
  PricingCalculator,
  SocialProof,
  CodePlayground,
  FeatureDemo
} from '../../components/features/mdx/index.ts';
```

## Conversion Best Practices

1. **Place CTAs strategically:**
   - One above the fold (after intro)
   - One mid-page (after key benefits)
   - One at page bottom (final conversion)

2. **Use psychology triggers:**
   - FeatureCTA → Scarcity (limited beta)
   - SocialProof → Authority (company logos)
   - PricingCalculator → Consistency (personalized value)
   - CodePlayground → Reciprocity (free value)

3. **Test variants:**
   - FeatureCTA has 3 variants (default, gradient, minimal)
   - A/B test which converts better

4. **Measure results:**
   - Track CTA click rates
   - Monitor trial signups
   - Expect 20-40% increase

## Troubleshooting

### Components not rendering?
- Check import path is relative: `../../components/features/mdx/`
- Include `.tsx` extension in import
- Verify frontmatter closes with `---`

### Imports showing as text?
- Don't use `@/components` alias in MDX files
- Always use relative paths from content location

### Syntax errors?
- Close all JSX tags: `<FeatureCTA />` not `<FeatureCTA>`
- Use `{[...]}` for arrays in props
- Escape quotes in strings

## Examples

See these working examples:
- `/features/simple-demo` - Basic CTA
- `/features/test-simple` - Plain MDX
- `/features/test-mdx` - MDX with component

## Next Steps

1. Convert your top 3 features to .mdx
2. Add FeatureCTA and SocialProof components
3. Measure baseline conversion rate
4. A/B test different variants
5. Optimize based on data

Expected results: **20-40% increase in CTA clicks** 📈
