---
title: Design System
description: The ONE Design System - 6 extractable colors + 4 design properties. Extract from any website. Apply everywhere. Beautiful by default.
section: Develop
order: 2
tags:
  - design
  - tokens
  - colors
  - accessibility
  - components
  - implementation
---

# Design System

**The 6 extractable colors. Extract from any website. Map to these 6 tokens. Apply everywhere.**

**Source of Truth:** `/one/things/design-system.md` (complete specification)
**Live Examples:** `/web/src/pages/design.astro` (interactive demos)
**Enforcement:** `/.claude/prompts/design-system.md` (Claude rules)

---

## Quick Start

### The 6 Core Colors

All colors come from these 6 tokens. NEVER hardcode colors outside this system.

```css
/* Cards & Surfaces (adapt to light/dark mode) */
--color-background: 0 0% 93%;     /* Card surface, sidebar */
--color-foreground: 0 0% 100%;    /* Content area */
--color-font: 0 0% 13%;           /* Text color */

/* Buttons & Actions (constant across modes) */
--color-primary: 216 55% 25%;     /* Main CTA (blue) */
--color-secondary: 219 14% 28%;   /* Supporting (gray-blue) */
--color-tertiary: 105 22% 25%;    /* Accent (green) */
```

**Dark mode:** background/foreground/font invert. Primary/secondary/tertiary stay constant.

---

### The 4 Design Properties

#### 1. States (Buttons & Interactive)

Every button MUST have these states:

```tsx
<button className="
  bg-[hsl(216_55%_25%)]           // Default
  hover:bg-[hsl(216_55%_20%)]     // Hover (darken 5%)
  active:bg-[hsl(216_55%_18%)]    // Active (darken 7%)
  focus:ring-2 focus:ring-primary focus:ring-offset-2  // Focus
  disabled:opacity-50 disabled:cursor-not-allowed      // Disabled
  transition-all duration-150     // Motion
">
  Button
</button>
```

#### 2. Elevation (Shadow Depth)

Use these shadow levels consistently:

- `shadow-none` - Flat surfaces
- `shadow-sm` - Cards (DEFAULT)
- `shadow-md` - Dropdowns
- `shadow-lg` - Buttons
- `shadow-xl` - Modals

#### 3. Radius (Border Rounding)

Use these radius values consistently:

- `rounded-sm` - 6px (badges)
- `rounded-md` - 8px (cards, buttons - DEFAULT)
- `rounded-lg` - 12px (large cards)
- `rounded-xl` - 16px (modals)
- `rounded-full` - 9999px (avatars)

#### 4. Motion (Animation Timing)

Use these timing values consistently:

- `duration-0` - 0ms (instant)
- `duration-150` - 150ms (hovers, DEFAULT for buttons)
- `duration-300` - 300ms (component transitions)
- `duration-500` - 500ms (page transitions)

**Always use `ease-in-out`**

---

## Component Patterns

### Card Pattern (Foundation)

```tsx
<Card className="bg-background p-1 shadow-sm rounded-md">
  <CardContent className="bg-foreground p-4 rounded-md">
    <h3 className="text-font text-lg font-semibold">Title</h3>
    <p className="text-font opacity-80 text-sm">Description</p>
    <div className="flex gap-2 mt-4">
      <button className="bg-[hsl(216_55%_25%)] text-white px-4 py-2 rounded-md shadow-lg hover:shadow-xl transition-all duration-150">
        Primary
      </button>
    </div>
  </CardContent>
</Card>
```

**Rules:**
- Outer card: `background` color + `p-1` frame + `shadow-sm`
- Inner content: `foreground` color + `p-4` padding
- Always use `rounded-md` (8px)

---

### Button Variants

```tsx
// Primary - Main CTA (blue)
<button className="rounded-md bg-[hsl(216_55%_25%)] px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-[hsl(216_55%_20%)] hover:shadow-xl active:shadow-md transition-all duration-150">
  Primary
</button>

// Secondary - Supporting (gray-blue)
<button className="rounded-md bg-[hsl(219_14%_28%)] px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-[hsl(219_14%_23%)] hover:shadow-xl active:shadow-md transition-all duration-150">
  Secondary
</button>

// Tertiary - Accent (green)
<button className="rounded-md bg-[hsl(105_22%_25%)] px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-[hsl(105_22%_20%)] hover:shadow-xl active:shadow-md transition-all duration-150">
  Tertiary
</button>

// Outline - Neutral
<button className="rounded-md border-2 border-font bg-transparent px-4 py-2 text-sm font-medium text-font hover:bg-font/10 transition-all duration-150">
  Outline
</button>

// Ghost - Minimal
<button className="rounded-md bg-transparent px-4 py-2 text-sm font-medium text-font hover:bg-font/10 transition-all duration-150">
  Ghost
</button>
```

---

### Typography Scale

Use ONLY these text sizes:

```tsx
<h1 className="text-4xl font-bold leading-tight">Hero Title</h1>
<h2 className="text-3xl font-bold leading-tight">Section</h2>
<h3 className="text-2xl font-semibold leading-snug">Card Title</h3>
<h4 className="text-xl font-semibold">Component</h4>
<p className="text-base leading-relaxed">Body text</p>
<span className="text-sm">Metadata</span>
<span className="text-xs">Captions</span>
```

**Rules:**
- Headings: `font-bold` or `font-semibold`
- Body: `font-normal`
- Line height: `leading-tight` (headings), `leading-relaxed` (body)
- Color: ALWAYS `text-font` (auto-adapts to light/dark)

---

### Spacing Scale

Use ONLY these gap/padding values:

```tsx
gap-2  // 8px  - Tight spacing
gap-3  // 12px - Component gaps
gap-4  // 16px - Default spacing (MOST COMMON)
gap-6  // 24px - Card gutters
gap-8  // 32px - Section spacing
gap-12 // 48px - Hero whitespace
```

---

## Extraction Workflow

**Want to match an existing brand?**

1. **Extract** - AI scans website and identifies 6 core colors
2. **Map** - Maps to background, foreground, font, primary, secondary, tertiary
3. **Apply** - Generates CSS vars, all components adapt instantly

**Example (Stripe):**
```typescript
const stripeColors = {
  background: "220 14% 96%",   // Light gray surface
  foreground: "0 0% 100%",     // White content
  font: "220 39% 11%",         // Dark text
  primary: "229 84% 55%",      // Stripe blue
  secondary: "220 14% 40%",    // Gray
  tertiary: "151 55% 42%"      // Green
}
```

---

## Thing-Level Override (Optional)

**IMPORTANT:** Our platform components are already beautiful with the default 6 colors. Thing-level overrides are **optional** and should only be used when:
- Replicating existing brand identity (e.g., Stripe's exact colors)
- External brand guidelines require specific colors
- Multi-brand marketplace needs visual separation

**Most things should use the platform defaults.**

```typescript
// Database schema (optional override)
things: defineTable({
  colors: v.optional(v.object({
    background: v.string(),   // HSL: "270 50% 92%"
    foreground: v.string(),   // HSL: "270 50% 98%"
    font: v.string(),         // HSL: "270 50% 15%"
    primary: v.string(),      // HSL: "280 100% 60%"
    secondary: v.string(),    // HSL: "200 100% 50%"
    tertiary: v.string()      // HSL: "150 80% 40%"
  }))
})
```

---

## Accessibility Checklist

Before shipping ANY UI:

- [ ] **Contrast:** Text is 4.5:1 (or 3:1 for large text)
- [ ] **Focus:** `focus:ring-2` visible on all interactive elements
- [ ] **Keyboard:** Can navigate without mouse
- [ ] **States:** hover, active, focus, disabled all defined
- [ ] **Responsive:** Works at 320px, 768px, 1024px
- [ ] **Motion:** Works with `prefers-reduced-motion`
- [ ] **Alt Text:** Images have descriptions
- [ ] **Labels:** Form inputs have labels

---

## Common Violations & Fixes

### ❌ Violation: Custom Colors
```tsx
// WRONG
<div className="bg-blue-500 text-gray-900">
```

### ✅ Fix: Use Design System
```tsx
// CORRECT
<div className="bg-[hsl(216_55%_25%)] text-font">
```

---

### ❌ Violation: Missing States
```tsx
// WRONG
<button className="bg-primary">Click</button>
```

### ✅ Fix: Add All States
```tsx
// CORRECT
<button className="
  bg-[hsl(216_55%_25%)]
  hover:bg-[hsl(216_55%_20%)]
  active:bg-[hsl(216_55%_18%)]
  focus:ring-2 focus:ring-primary focus:ring-offset-2
  disabled:opacity-50
  transition-all duration-150
">
  Click
</button>
```

---

### ❌ Violation: Custom Spacing
```tsx
// WRONG
<div className="gap-5 p-7">
```

### ✅ Fix: Use Design System
```tsx
// CORRECT
<div className="gap-6 p-6">  // or gap-4 p-4
```

---

## Pre-Commit Checklist

Before committing UI code:

```
[ ] Colors: Uses ONLY 6 tokens (no hardcoded colors)
[ ] States: hover, active, focus, disabled defined
[ ] Elevation: shadow-sm/md/lg/xl (no custom shadows)
[ ] Radius: rounded-md default (no custom radius)
[ ] Motion: duration-150/300 with ease-in-out
[ ] Typography: Uses text-xs through text-4xl scale
[ ] Spacing: Uses gap-2/3/4/6/8/12 scale
```

---

## Complete Documentation

**For complete specification:**
- Read `/one/things/design-system.md` (832 lines, full spec)
- See `/web/src/pages/design.astro` (interactive examples)
- Check `/.claude/prompts/design-system.md` (enforcement rules)

**For quick reference:**
- See `/.claude/prompts/design-quick-ref.md` (copy-paste templates)

---

## Three Core Principles

### Clarity
**Measured whitespace · Bold hierarchy · Grid alignment**

Structure beats decoration. Use whitespace to create breathing room.

### Velocity
**Tokens · Components · Consistency**

Decide once, reuse everywhere. Documentation prevents reinvention.

### Inclusive
**Accessibility · Motion · Color**

WCAG 2.1 AA compliance is non-negotiable. Respect motion preferences. Never rely on color alone.

---

## shadcn/ui Components

**50+ pre-installed components** - Use these instead of building custom:

```typescript
// Layout
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

// Actions
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Forms
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'

// Feedback
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
```

---

## Performance Targets

- **Largest Contentful Paint (LCP):** < 2.5s
- **First Input Delay (FID):** < 100ms
- **Cumulative Layout Shift (CLS):** < 0.1
- **Lighthouse Performance:** ≥ 90/100

---

## Design Governs ONE Experience

Ship with intention. Every commit should strengthen clarity, trust, and velocity. When in doubt, return to the tokens, principles, and checklists above—or propose updates so the system evolves together.

**The goal:** Build experiences so consistent, accessible, and performant that users never think about design. They just feel like home.

**Built with consistency. Enforced with discipline. Beautiful by default.**
