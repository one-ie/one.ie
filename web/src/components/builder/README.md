# Website Builder Component Library

A comprehensive collection of **21 production-ready components** for building modern websites and landing pages.

## Overview

This library provides reusable, customizable components built with:
- **React 19** + **TypeScript** (`.tsx` files only)
- **Tailwind v4** for styling
- **shadcn/ui** for UI primitives
- **Dark mode** support
- **Responsive** design
- **Accessible** (WCAG compliant)

## Quick Start

```typescript
import { HeroCentered, FeaturesGrid, CTASimple } from '@/components/builder';

// Use in any Astro page
<HeroCentered
  badge="New Release"
  headline="Build Beautiful Websites Fast"
  subheadline="Production-ready components with TypeScript, Tailwind, and dark mode."
  primaryCTA={{ text: "Get Started", href: "/signup" }}
  secondaryCTA={{ text: "View Demo", href: "/demo" }}
/>
```

## Component Categories

### 🎯 Hero Sections (7 variations)

Hero sections for landing pages with different layouts and features.

#### 1. HeroCentered
Classic centered hero with headline, subheadline, and CTA buttons.

**Use cases:** Landing pages, product launches, marketing pages

```typescript
<HeroCentered
  badge="New Feature"
  headline="Welcome to the Future"
  subheadline="Build faster with our component library"
  primaryCTA={{ text: "Get Started", href: "/signup" }}
  secondaryCTA={{ text: "Learn More", href: "/docs" }}
/>
```

#### 2. HeroSplit
Split-screen layout with content on one side and image on the other.

**Use cases:** SaaS products, app showcases, feature highlights

```typescript
<HeroSplit
  headline="Build Faster"
  description="Ship production-ready websites in hours, not weeks"
  features={["TypeScript", "Tailwind v4", "Dark Mode"]}
  primaryCTA={{ text: "Start Free Trial", href: "/trial" }}
  image={{ src: "/hero.png", alt: "Product screenshot" }}
  imagePosition="right"
/>
```

#### 3. HeroVideo
Hero with video background for immersive experiences.

**Use cases:** Product demos, brand stories, video showcases

```typescript
<HeroVideo
  headline="Experience the Difference"
  subheadline="Watch how our platform transforms your workflow"
  primaryCTA={{ text: "Watch Demo", href: "/demo" }}
  video={{ src: "/hero-video.mp4", poster: "/poster.jpg" }}
  showControls={true}
  overlayOpacity={60}
/>
```

#### 4. HeroMinimal
Minimalist typography-focused hero.

**Use cases:** Blogs, portfolios, content-focused sites

```typescript
<HeroMinimal
  headline="Simple. Powerful. Beautiful."
  description="Everything you need, nothing you don't."
  cta={{ text: "Read More →", href: "/about" }}
/>
```

#### 5. HeroWithStats
Hero with impressive statistics and social proof.

**Use cases:** Showcasing achievements, user counts, metrics

```typescript
<HeroWithStats
  headline="Trusted by Thousands"
  description="Join the community building the future"
  primaryCTA={{ text: "Get Started", href: "/signup" }}
  stats={[
    { value: "10K+", label: "Active Users" },
    { value: "99.9%", label: "Uptime" },
    { value: "24/7", label: "Support" },
  ]}
/>
```

#### 6. HeroWithForm
Hero with inline signup or contact form.

**Use cases:** Lead generation, waitlists, direct conversions

```typescript
<HeroWithForm
  headline="Join the Waitlist"
  description="Be the first to know when we launch"
  benefits={["Early access", "Exclusive discounts", "Priority support"]}
  formTitle="Get Early Access"
  onSubmit={async (data) => {
    await fetch('/api/waitlist', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }}
/>
```

#### 7. HeroGradient
Hero with animated gradient background.

**Use cases:** Modern landing pages, creative portfolios

```typescript
<HeroGradient
  badge="✨ New"
  headline="The Future is Here"
  subheadline="Experience next-generation web design"
  primaryCTA={{ text: "Get Started", href: "/signup" }}
  gradientFrom="from-purple-600"
  gradientVia="via-pink-500"
  gradientTo="to-orange-500"
/>
```

---

### ⚡ Features Sections (3 variations)

Showcase product features, benefits, and capabilities.

#### 1. FeaturesGrid
Grid layout with icons, titles, and descriptions.

**Use cases:** Product features, service offerings, benefits

```typescript
import { Zap, Shield, Globe } from 'lucide-react';

<FeaturesGrid
  title="Why Choose Us"
  subtitle="Everything you need to succeed"
  badge="Features"
  columns={3}
  features={[
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized for speed and performance"
    },
    {
      icon: Shield,
      title: "Secure by Default",
      description: "Enterprise-grade security built-in"
    },
    {
      icon: Globe,
      title: "Global CDN",
      description: "Fast loading times worldwide"
    },
  ]}
/>
```

#### 2. FeaturesWithImages
Alternating image and text layout (zigzag pattern).

**Use cases:** Detailed feature explanations with visuals

```typescript
<FeaturesWithImages
  title="Powerful Features"
  subtitle="Everything you need in one place"
  features={[
    {
      title: "Real-Time Collaboration",
      description: "Work together seamlessly with your team",
      benefits: ["Live updates", "Instant sync", "Team chat"],
      image: { src: "/feature-1.png", alt: "Collaboration" },
      cta: { text: "Learn More", href: "/features/collab" }
    },
  ]}
/>
```

#### 3. FeaturesComparison
Side-by-side before/after comparison.

**Use cases:** Showing improvements, upgrades, differences

```typescript
<FeaturesComparison
  title="See the Difference"
  beforeLabel="Before"
  afterLabel="After"
  items={[
    {
      label: "Deployment Time",
      before: { value: "2 hours", description: "Manual process" },
      after: { value: "30 seconds", description: "One-click deploy" }
    },
  ]}
/>
```

---

### 💰 Pricing Tables (2 variations)

Display pricing plans and feature comparisons.

#### 1. PricingThreeTier
Classic 3-tier pricing (Basic, Pro, Enterprise).

**Use cases:** SaaS products, subscription services

```typescript
<PricingThreeTier
  title="Choose Your Plan"
  subtitle="Start free, scale as you grow"
  showToggle={true}
  defaultBilling="monthly"
  tiers={[
    {
      name: "Basic",
      description: "Perfect for individuals",
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        { text: "Up to 5 projects", included: true },
        { text: "Basic support", included: true },
        { text: "Advanced features", included: false },
      ],
      cta: { text: "Start Free", href: "/signup" }
    },
    {
      name: "Pro",
      description: "For growing teams",
      monthlyPrice: 29,
      annualPrice: 290,
      featured: true,
      features: [
        { text: "Unlimited projects", included: true },
        { text: "Priority support", included: true },
        { text: "Advanced features", included: true },
      ],
      cta: { text: "Start Trial", href: "/trial" }
    },
    // ... Enterprise tier
  ]}
/>
```

#### 2. PricingComparison
Detailed feature-by-feature comparison table.

**Use cases:** Complex products with many features

```typescript
<PricingComparison
  title="Compare Plans"
  plans={[
    {
      name: "Basic",
      price: 0,
      period: "month",
      cta: { text: "Start Free", href: "/signup" }
    },
    {
      name: "Pro",
      price: 29,
      period: "month",
      featured: true,
      cta: { text: "Start Trial", href: "/trial" }
    },
  ]}
  features={[
    { category: "Core Features" },
    { name: "Projects", plans: ["5", "Unlimited"] },
    { name: "Users", plans: ["1", "10"] },
    { category: "Support" },
    { name: "Email Support", plans: [true, true] },
    { name: "Phone Support", plans: [false, true] },
  ]}
/>
```

---

### 💬 Testimonials (2 variations)

Display customer reviews and social proof.

#### 1. TestimonialsGrid
Grid layout for multiple testimonials.

**Use cases:** Customer reviews, case studies, social proof

```typescript
<TestimonialsGrid
  title="What Our Customers Say"
  subtitle="Join thousands of happy users"
  badge="Testimonials"
  columns={3}
  testimonials={[
    {
      quote: "This product changed my life!",
      author: "Sarah Johnson",
      role: "CEO",
      company: "Acme Inc",
      avatar: "/avatars/sarah.jpg",
      rating: 5
    },
  ]}
/>
```

#### 2. TestimonialsCarousel
Auto-rotating carousel for testimonials.

**Use cases:** Homepage heroes, feature sections

```typescript
<TestimonialsCarousel
  title="Loved by Thousands"
  testimonials={[
    {
      quote: "Best decision we ever made",
      author: "John Smith",
      role: "CTO",
      company: "Tech Corp",
      rating: 5
    },
  ]}
  autoRotate={true}
  rotateInterval={5000}
/>
```

---

### 🎯 Call-to-Action (3 variations)

Drive conversions with compelling CTAs.

#### 1. CTASimple
Simple CTA with headline and buttons.

**Use cases:** Page endings, content breaks, conversion points

```typescript
<CTASimple
  headline="Ready to Get Started?"
  description="Join thousands of users building amazing things"
  primaryCTA={{ text: "Start Free Trial", href: "/trial" }}
  secondaryCTA={{ text: "Contact Sales", href: "/contact" }}
  variant="gradient"
/>
```

#### 2. CTAWithForm
CTA with inline email signup form.

**Use cases:** Newsletter signups, waitlists, lead generation

```typescript
<CTAWithForm
  badge="📧 Newsletter"
  headline="Stay in the Loop"
  description="Get the latest updates and exclusive offers"
  placeholder="Enter your email"
  buttonText="Subscribe"
  onSubmit={async (email) => {
    await fetch('/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }}
/>
```

#### 3. CTABanner
Sticky announcement banner.

**Use cases:** Flash sales, announcements, urgent CTAs

```typescript
<CTABanner
  message="🎉 Black Friday Sale: 50% off all plans!"
  cta={{ text: "Claim Offer", href: "/sale" }}
  position="top"
  dismissible={true}
  variant="primary"
  countdownTo={new Date('2024-11-30')}
/>
```

---

### 🧭 Navigation (3 variations)

Site-wide navigation components.

#### 1. Header
Main navigation header with logo and menu.

**Use cases:** Site-wide navigation, branding

```typescript
<Header
  logo={{ src: "/logo.png", text: "Brand", href: "/" }}
  links={[
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Docs", href: "/docs" },
  ]}
  cta={{ text: "Sign Up", href: "/signup" }}
  sticky={true}
/>
```

#### 2. Footer
Multi-column footer with links and social icons.

**Use cases:** Site-wide footer, sitemap, social links

```typescript
import { Twitter, Github, Linkedin } from 'lucide-react';

<Footer
  logo={{ text: "Brand", href: "/" }}
  description="Building the future of web development"
  linkGroups={[
    {
      title: "Product",
      links: [
        { label: "Features", href: "/features" },
        { label: "Pricing", href: "/pricing" },
      ]
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Blog", href: "/blog" },
      ]
    },
  ]}
  socialLinks={[
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Github, href: "https://github.com", label: "GitHub" },
  ]}
  copyright="© 2024 Brand Inc. All rights reserved."
  showNewsletter={true}
/>
```

#### 3. MegaMenu
Dropdown mega menu for complex navigation.

**Use cases:** Large sites, many pages, categories

```typescript
import { Zap, Shield, Globe } from 'lucide-react';

<MegaMenu
  label="Products"
  categories={[
    {
      title: "For Teams",
      items: [
        {
          label: "Collaboration",
          href: "/collaboration",
          description: "Work together in real-time",
          icon: Zap
        },
      ]
    },
  ]}
  featured={{
    title: "New: AI Assistant",
    description: "Boost productivity with AI",
    href: "/ai",
    image: "/ai-feature.png"
  }}
/>
```

---

## Component Props Reference

All components are fully typed with TypeScript. See each component file for detailed prop definitions.

### Common Patterns

**CTA Buttons:**
```typescript
{
  text: string;
  href: string;
}
```

**Images:**
```typescript
{
  src: string;
  alt: string;
}
```

**Icons:**
Use lucide-react icons:
```typescript
import { Zap, Shield, Globe } from 'lucide-react';
```

## Hydration Strategy

All builder components are React components (`.tsx`) and require client-side hydration when used in Astro pages.

**Choose the right directive:**

```astro
<!-- Static (no JavaScript needed) -->
<HeroCentered {...props} />

<!-- Critical interactivity (loads immediately) -->
<HeroVideo client:load {...props} />

<!-- Secondary interaction (loads when idle) -->
<CTAWithForm client:idle {...props} />

<!-- Below fold (loads when visible) -->
<TestimonialsGrid client:visible {...props} />
```

## Styling and Customization

All components use Tailwind v4 and support:
- **Dark mode** - Automatic with `dark:` variants
- **Custom classes** - All components accept `className` prop
- **Responsive** - Mobile-first breakpoints (sm, md, lg, xl)

**Example customization:**
```typescript
<HeroCentered
  className="bg-gradient-to-r from-purple-500 to-pink-500"
  headline="Custom Styled Hero"
  // ... other props
/>
```

## Accessibility

All components follow WCAG 2.1 Level AA guidelines:
- Semantic HTML
- Keyboard navigation
- ARIA labels
- Focus management
- Screen reader support

## Dark Mode

All components automatically support dark mode via Tailwind's dark mode.

Toggle dark mode in your app:
```typescript
import { ModeToggle } from '@/components/ModeToggle';

<ModeToggle />
```

## Performance

**Best practices:**
- Use `client:visible` for below-fold components
- Use `client:idle` for non-critical interactions
- Lazy load images with `loading="lazy"`
- Optimize images (WebP, proper sizing)

## Examples

See `/web/src/pages/builder-demo.astro` for live examples of all components.

## Development

**Adding new components:**
1. Create `.tsx` file in appropriate category folder
2. Export from `index.ts`
3. Add documentation to this README
4. Add semantic tags for AI search

**Component template:**
```typescript
/**
 * ComponentName Component
 *
 * Brief description of what this component does.
 * Perfect for [use cases].
 *
 * Features:
 * - Feature 1
 * - Feature 2
 * - Feature 3
 *
 * Semantic tags: tag1, tag2, tag3
 */

import { Button } from '@/components/ui/button';

export interface ComponentNameProps {
  title: string;
  // ... other props
}

export function ComponentName({ title }: ComponentNameProps) {
  return (
    <section className="py-20 px-4">
      <h2>{title}</h2>
    </section>
  );
}
```

## AI-Powered Component Discovery

All components include semantic tags for AI-powered search:

**Example queries:**
- "hero with video background" → `HeroVideo`
- "pricing table with toggle" → `PricingThreeTier`
- "testimonials carousel" → `TestimonialsCarousel`
- "sticky announcement banner" → `CTABanner`

## Support

For issues, questions, or feature requests:
- Read the documentation
- Check component props in TypeScript
- See live examples in demo pages
- Open an issue on GitHub

---

**Built with ❤️ using React 19, TypeScript, Tailwind v4, and shadcn/ui**
