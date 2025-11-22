# Design System Migration Guide

**Version:** 1.0.0
**Created:** 2025-11-22
**Status:** Active
**For:** Developers migrating to the 6-token design system

---

## Overview

### What Changed

ONE Platform's design system has been simplified from shadcn/ui's 10+ color tokens to **6 extractable color tokens + 4 design properties**. This creates a more consistent, maintainable, and brandable system.

**Key Philosophy:**
- **Before:** 10+ shadcn tokens (card, popover, accent, muted, destructive, etc.)
- **After:** 6 core tokens (background, foreground, font, primary, secondary, tertiary)
- **Result:** Extract 6 colors from any website → Apply everywhere → Same components, infinite brands

### Why This Matters

1. **Thing-Level Branding:** Each Thing (product, course, token) can define its own 6 colors
2. **Consistency:** Same component structure, different brands, zero custom CSS
3. **Simplicity:** 6 tokens instead of 10+ makes decisions easier
4. **Extractability:** AI can extract 6 colors from any website automatically

---

## The 6-Token + 4-Property System

### The 6 Color Tokens

| Token | Light Mode | Dark Mode | Purpose | Adaptive? |
|-------|-----------|-----------|---------|-----------|
| **background** | `0 0% 93%` (gray) | `0 0% 10%` (dark gray) | Card surface, sidebar, page background | ✅ Yes |
| **foreground** | `0 0% 100%` (white) | `0 0% 13%` (dark) | Content area inside cards, elevated surfaces | ✅ Yes |
| **font** | `0 0% 13%` (dark) | `0 0% 100%` (white) | All text, icons, readable in both modes | ✅ Yes |
| **primary** | `216 55% 25%` (blue) | `216 55% 25%` | Main CTA buttons, links, active states | ❌ No |
| **secondary** | `219 14% 28%` (gray-blue) | `219 14% 28%` | Supporting actions, secondary buttons | ❌ No |
| **tertiary** | `105 22% 25%` (green) | `105 22% 25%` | Accent highlights, success states, badges | ❌ No |

**Key Insight:** 3 colors adapt for dark mode (background, foreground, font), 3 stay constant (primary, secondary, tertiary).

### The 4 Design Properties

| Property | Values | Purpose |
|----------|--------|---------|
| **states** | hover: `opacity-90 scale-[1.02]`<br/>active: `opacity-80 scale-[0.98]`<br/>focus: `ring-2 ring-primary-dark`<br/>disabled: `opacity-50 cursor-not-allowed` | Button/interactive states |
| **elevation** | `shadow-sm` (cards)<br/>`shadow-md` (dropdowns)<br/>`shadow-lg` (buttons)<br/>`shadow-xl` (hover)<br/>`shadow-2xl` (modals) | Depth hierarchy |
| **radius** | `rounded-sm` (6px)<br/>`rounded-md` (8px - default)<br/>`rounded-lg` (12px)<br/>`rounded-xl` (16px)<br/>`rounded-full` (circular) | Corner rounding |
| **motion** | `duration-150` (hovers)<br/>`duration-300` (default)<br/>`duration-500` (page transitions)<br/>easing: `ease-in-out` | Animation timing |

---

## Token Mapping

### Old Token → New Token

| Old shadcn Token | New Token | Notes |
|------------------|-----------|-------|
| `card` | `background` | Card surface color |
| `card-foreground` | `font` | Text on cards |
| `popover` | `foreground` | Content area |
| `popover-foreground` | `font` | Text in content |
| `background` | `background` | Same name, same purpose |
| `foreground` | `font` | Renamed for clarity |
| `primary` | `primary` | Same name, same purpose |
| `primary-foreground` | Auto-handled | System generates light/dark variants |
| `secondary` | `secondary` | Same name, same purpose |
| `secondary-foreground` | Auto-handled | System generates light/dark variants |
| `accent` | `tertiary` | Renamed from "accent" to "tertiary" |
| `accent-foreground` | Auto-handled | System generates light/dark variants |
| `muted` | Use `font` with `opacity-80` | Removed token, use opacity instead |
| `muted-foreground` | Use `font` with `opacity-60` | Removed token, use opacity instead |
| `destructive` | Use custom red | Not part of 6-token system |
| `destructive-foreground` | Use white on red | Not part of 6-token system |
| `border` | Use `font/20` | Use font color with opacity |
| `input` | `foreground` | Input backgrounds use foreground |
| `ring` | `primary-dark` | Focus rings use darker primary |

### CSS Variable Changes

**Old shadcn format:**
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
}
```

**New 6-token format:**
```css
@theme {
  /* 6 Core Color Tokens */
  --color-background: 0 0% 93%;      /* Card surface (light gray) */
  --color-foreground: 0 0% 100%;     /* Content area (white) */
  --color-font: 0 0% 13%;            /* Text color (dark) */
  --color-primary: 216 55% 25%;      /* Main CTA (blue) */
  --color-secondary: 219 14% 28%;    /* Supporting actions (gray-blue) */
  --color-tertiary: 105 22% 25%;     /* Accent actions (green) */

  /* Auto-generated variants (DO NOT DEFINE MANUALLY) */
  --color-primary-light: 216 55% 35%;
  --color-primary-dark: 216 55% 15%;
  --color-secondary-light: 219 14% 38%;
  --color-secondary-dark: 219 14% 18%;
  --color-tertiary-light: 105 22% 35%;
  --color-tertiary-dark: 105 22% 15%;
  --color-ring: var(--color-primary-dark);
}

.dark {
  /* Dark mode overrides (only 3 colors change) */
  --color-background: 0 0% 10%;      /* Dark gray card */
  --color-foreground: 0 0% 13%;      /* Darker content */
  --color-font: 0 0% 100%;           /* White text */
  /* primary, secondary, tertiary remain same */
}
```

---

## Before/After Examples

### Cards (Frame + Content Pattern)

**❌ Old shadcn Pattern:**
```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function ProductCard({ product }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{product.description}</p>
        <div className="text-2xl font-bold">${product.price}</div>
      </CardContent>
    </Card>
  );
}
```

**✅ New 6-Token Pattern:**
```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function ProductCard({ product }) {
  return (
    <Card className="bg-background p-1 shadow-sm rounded-md">
      <CardContent className="bg-foreground p-4 rounded-md">
        <CardTitle className="text-font font-semibold">{product.name}</CardTitle>
        <p className="text-font opacity-80">{product.description}</p>
        <div className="text-2xl font-bold text-font">${product.price}</div>
      </CardContent>
    </Card>
  );
}
```

**What Changed:**
1. **Explicit frame + content:** Card has `bg-background` (gray frame), CardContent has `bg-foreground` (white content)
2. **Text uses `font` token:** All text is `text-font`, use opacity for hierarchy
3. **No `muted-foreground`:** Use `opacity-80` or `opacity-60` instead
4. **Explicit elevation:** `shadow-sm` (cards), `shadow-md` (elevated), `shadow-lg` (featured)

---

### Buttons (6 Variants with States)

**❌ Old shadcn Pattern:**
```tsx
import { Button } from "@/components/ui/button";

export function Actions() {
  return (
    <div className="flex gap-2">
      <Button variant="default">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Delete</Button>
    </div>
  );
}
```

**✅ New 6-Token Pattern:**
```tsx
import { Button } from "@/components/ui/button";

export function Actions() {
  return (
    <div className="flex gap-2">
      {/* Primary CTA - Main action */}
      <Button className="bg-[hsl(216_55%_25%)] text-white shadow-lg hover:bg-[hsl(216_55%_20%)] hover:shadow-xl hover:scale-[1.02] active:shadow-md active:scale-[0.98] transition-all duration-150">
        Primary
      </Button>

      {/* Secondary - Supporting action */}
      <Button className="bg-[hsl(219_14%_28%)] text-white shadow-lg hover:bg-[hsl(219_14%_23%)] hover:shadow-xl hover:scale-[1.02] active:shadow-md active:scale-[0.98] transition-all duration-150">
        Secondary
      </Button>

      {/* Tertiary - Accent action */}
      <Button className="bg-[hsl(105_22%_25%)] text-white shadow-lg hover:bg-[hsl(105_22%_20%)] hover:shadow-xl hover:scale-[1.02] active:shadow-md active:scale-[0.98] transition-all duration-150">
        Tertiary
      </Button>

      {/* Outline - Neutral action */}
      <Button variant="outline" className="shadow-md hover:shadow-lg hover:scale-[1.02] active:shadow-sm active:scale-[0.98] transition-all duration-150">
        Outline
      </Button>

      {/* Ghost - Minimal action */}
      <Button variant="ghost" className="hover:scale-[1.02] active:scale-[0.98] transition-all duration-150">
        Ghost
      </Button>
    </div>
  );
}
```

**What Changed:**
1. **Renamed variants:** `default` → `primary`, `accent` → `tertiary`, added explicit `secondary`
2. **Explicit states:** All buttons have hover (darken 5%, shadow-xl, scale-[1.02]), active (darken 7%, shadow-md, scale-[0.98])
3. **No destructive:** Red buttons are application-specific, not part of core 6 tokens
4. **Motion baked in:** `transition-all duration-150` for smooth interactions

---

### Forms (Input = Card Pattern)

**❌ Old shadcn Pattern:**
```tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ContactForm() {
  return (
    <form className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="you@example.com" />
      </div>
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

**✅ New 6-Token Pattern:**
```tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function ContactForm() {
  return (
    <form className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-font">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          className="w-full h-10 px-3 bg-foreground text-font border border-font/20 rounded-md
                     focus:ring-2 focus:ring-primary-dark focus:border-transparent
                     transition-all duration-150"
        />
      </div>
      <Button
        type="submit"
        className="bg-[hsl(216_55%_25%)] text-white shadow-lg hover:bg-[hsl(216_55%_20%)] hover:shadow-xl hover:scale-[1.02] active:shadow-md active:scale-[0.98] transition-all duration-150"
      >
        Submit
      </Button>
    </form>
  );
}
```

**What Changed:**
1. **Input background:** Uses `bg-foreground` (white content area)
2. **Border:** Uses `border-font/20` (font color with opacity)
3. **Focus state:** `ring-2 ring-primary-dark` (darker primary for focus)
4. **Explicit spacing:** `space-y-6` between form groups, `space-y-2` within groups
5. **Explicit transitions:** `transition-all duration-150` for smooth focus states

---

## Common Patterns

### Pattern 1: Card with Frame + Content

**The fundamental building block of the design system.**

```tsx
<Card className="bg-background p-1 shadow-sm rounded-md">
  <CardContent className="bg-foreground p-4 rounded-md text-font">
    <h3 className="text-font font-semibold text-lg">Card Title</h3>
    <p className="text-font opacity-80 text-sm">Card description</p>
    <div className="flex gap-2 mt-4">
      <Button variant="primary">Main Action</Button>
      <Button variant="secondary">Secondary</Button>
    </div>
  </CardContent>
</Card>
```

**Visual Structure:**
```
┌─────────────────────────────────────────┐
│  bg-background (gray frame, 4px p-1)    │
│  ┌─────────────────────────────────┐   │
│  │ bg-foreground (white, 16px p-4)  │   │
│  │                                  │   │
│  │ text-font (dark text)            │   │
│  │ opacity-80 (lighter text)        │   │
│  │                                  │   │
│  │ [Button] [Button]                │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

### Pattern 2: Button Variants

**6 button variants for all actions.**

```tsx
// Primary - Main CTA (blue)
<Button className="bg-[hsl(216_55%_25%)] text-white shadow-lg hover:bg-[hsl(216_55%_20%)] hover:shadow-xl hover:scale-[1.02] active:shadow-md active:scale-[0.98] transition-all duration-150">
  Purchase Now
</Button>

// Secondary - Supporting action (gray-blue)
<Button className="bg-[hsl(219_14%_28%)] text-white shadow-lg hover:bg-[hsl(219_14%_23%)] hover:shadow-xl hover:scale-[1.02] active:shadow-md active:scale-[0.98] transition-all duration-150">
  Learn More
</Button>

// Tertiary - Accent action (green)
<Button className="bg-[hsl(105_22%_25%)] text-white shadow-lg hover:bg-[hsl(105_22%_20%)] hover:shadow-xl hover:scale-[1.02] active:shadow-md active:scale-[0.98] transition-all duration-150">
  Special Offer
</Button>

// Outline - Neutral action (transparent bg)
<Button variant="outline" className="shadow-md hover:shadow-lg hover:scale-[1.02] active:shadow-sm active:scale-[0.98] transition-all duration-150">
  Cancel
</Button>

// Ghost - Minimal action (no bg, no shadow)
<Button variant="ghost" className="hover:scale-[1.02] active:scale-[0.98] transition-all duration-150">
  View Details
</Button>

// Link - Text link (no bg, no shadow, underline on hover)
<Button variant="link" className="text-[hsl(216_55%_25%)] hover:underline">
  Read More
</Button>
```

---

### Pattern 3: Dark Mode Handling

**3 colors adapt, 3 stay constant.**

```tsx
// Adaptive colors (invert in dark mode)
<div className="bg-background text-font">
  {/* Light: gray bg, dark text */}
  {/* Dark: dark gray bg, white text */}
</div>

<Card className="bg-foreground">
  {/* Light: white card */}
  {/* Dark: dark card */}
</Card>

// Constant colors (same in light and dark)
<Button className="bg-[hsl(216_55%_25%)]">
  {/* Always blue in light and dark */}
</Button>

<Button className="bg-[hsl(219_14%_28%)]">
  {/* Always gray-blue in light and dark */}
</Button>

<Button className="bg-[hsl(105_22%_25%)]">
  {/* Always green in light and dark */}
</Button>
```

---

### Pattern 4: Thing-Level Color Overrides

**Each Thing can define its own 6 colors (OPTIONAL).**

```tsx
// Default platform colors (most things use these)
export function ProductCard({ product }) {
  return (
    <Card className="bg-background p-1 shadow-sm">
      <CardContent className="bg-foreground p-4">
        <h3 className="text-font">{product.name}</h3>
        <Button className="bg-[hsl(216_55%_25%)]">Buy Now</Button>
      </CardContent>
    </Card>
  );
}

// Thing-level color override (only when brand identity is strong)
export function ThingCard({ thing }) {
  const colors = thing.colors || defaultColors;

  return (
    <Card
      className="p-1 shadow-sm rounded-md"
      style={{
        '--background': colors.background,
        '--foreground': colors.foreground,
        '--font': colors.font,
        '--primary': colors.primary,
        '--secondary': colors.secondary,
        '--tertiary': colors.tertiary
      } as React.CSSProperties}
    >
      <CardContent className="bg-foreground p-4 rounded-md">
        <h3 className="text-font font-semibold">{thing.name}</h3>
        <Button className="bg-[hsl(var(--primary))]">Buy Now</Button>
      </CardContent>
    </Card>
  );
}
```

**When to use thing-level colors:**
- Strong existing brand identity (e.g., replicating Stripe's exact colors)
- External brand guidelines require specific colors
- Multi-brand marketplace needs distinct visual separation

**When NOT to use:**
- Most products/things should use platform defaults (they're already beautiful!)
- Adding colors "just because" (default is perfect)

---

## Migration Checklist

### Phase 1: Audit (Before Touching Code)

- [ ] **Read design system docs:**
  - [ ] `/one/knowledge/design-system.md` (specification)
  - [ ] `/one/events/design-system-100-cycle-implementation.md` (plan)
  - [ ] `/web/src/pages/design.astro` (live examples)

- [ ] **Identify all color token usage:**
  ```bash
  # Find hardcoded HSL colors
  grep -r "hsl(" web/src --include="*.tsx" --include="*.astro"

  # Find old shadcn tokens
  grep -r "text-muted-foreground\|bg-card\|bg-popover" web/src
  ```

- [ ] **Document components to migrate:**
  - [ ] List all components in `/web/src/components/ui/`
  - [ ] List all pages in `/web/src/pages/`
  - [ ] List all layouts in `/web/src/layouts/`

### Phase 2: Update Global CSS

- [ ] **Replace old tokens with 6-token system** (`/web/src/styles/global.css`):
  ```css
  @theme {
    /* 6 Core Tokens */
    --color-background: 0 0% 93%;
    --color-foreground: 0 0% 100%;
    --color-font: 0 0% 13%;
    --color-primary: 216 55% 25%;
    --color-secondary: 219 14% 28%;
    --color-tertiary: 105 22% 25%;
  }

  .dark {
    --color-background: 0 0% 10%;
    --color-foreground: 0 0% 13%;
    --color-font: 0 0% 100%;
  }
  ```

- [ ] **Remove old shadcn tokens:**
  - [ ] Delete `--card`, `--card-foreground`
  - [ ] Delete `--popover`, `--popover-foreground`
  - [ ] Delete `--muted`, `--muted-foreground`
  - [ ] Delete `--accent`, `--accent-foreground`
  - [ ] Delete `--destructive`, `--destructive-foreground`
  - [ ] Delete `--border`, `--input`, `--ring`

### Phase 3: Update Core Components

**Start with Button (most used component):**

- [ ] **Update Button component** (`/web/src/components/ui/button.tsx`):
  - [ ] Add primary variant: `bg-[hsl(216_55%_25%)]`
  - [ ] Add secondary variant: `bg-[hsl(219_14%_28%)]`
  - [ ] Add tertiary variant: `bg-[hsl(105_22%_25%)]`
  - [ ] Add hover states: darken 5%, shadow-xl, scale-[1.02]
  - [ ] Add active states: darken 7%, shadow-md, scale-[0.98]
  - [ ] Add focus states: ring-2 ring-primary-dark ring-offset-2
  - [ ] Add disabled states: opacity-50, cursor-not-allowed

**Update Card component:**

- [ ] **Update Card component** (`/web/src/components/ui/card.tsx`):
  - [ ] Card wrapper: `bg-background p-1 shadow-sm rounded-md`
  - [ ] CardContent: `bg-foreground p-4 rounded-md`
  - [ ] CardHeader: `bg-foreground`
  - [ ] CardFooter: `bg-foreground`
  - [ ] All text: `text-font`

**Update Form components:**

- [ ] **Update Input** (`/web/src/components/ui/input.tsx`):
  - [ ] Background: `bg-foreground`
  - [ ] Border: `border-font/20`
  - [ ] Focus: `ring-2 ring-primary-dark`

- [ ] **Update Select** (`/web/src/components/ui/select.tsx`):
  - [ ] Same as Input

- [ ] **Update Textarea** (`/web/src/components/ui/textarea.tsx`):
  - [ ] Same as Input

- [ ] **Update Label** (`/web/src/components/ui/label.tsx`):
  - [ ] Text: `text-font font-medium`

### Phase 4: Update All Other Components

- [ ] **Update Badge** (`/web/src/components/ui/badge.tsx`):
  - [ ] Default: `bg-background text-font`
  - [ ] Primary: `bg-primary/10 text-primary`
  - [ ] Secondary: `bg-secondary/10 text-secondary`
  - [ ] Tertiary: `bg-tertiary/10 text-tertiary`

- [ ] **Update Dialog/Modal** (`/web/src/components/ui/dialog.tsx`):
  - [ ] DialogContent: `bg-foreground shadow-2xl rounded-lg`
  - [ ] DialogTitle: `text-font font-semibold`
  - [ ] DialogDescription: `text-font/60`

- [ ] **Update Alert** (`/web/src/components/ui/alert.tsx`):
  - [ ] Default: `bg-background border-font/20`
  - [ ] Info: `bg-primary/10 border-primary/30`
  - [ ] Success: `bg-tertiary/10 border-tertiary/30`

- [ ] **Update Dropdown** (`/web/src/components/ui/dropdown-menu.tsx`):
  - [ ] DropdownContent: `bg-foreground shadow-lg rounded-md`
  - [ ] DropdownItem: `hover:bg-background`

### Phase 5: Update Pages

- [ ] **Update all pages to use new tokens:**
  ```bash
  # Find all pages
  find /web/src/pages -name "*.astro" -o -name "*.tsx"

  # Search and replace
  # text-muted-foreground → text-font opacity-80
  # bg-card → bg-background
  # bg-popover → bg-foreground
  ```

- [ ] **Test in light and dark modes:**
  - [ ] Verify 3 colors adapt (background, foreground, font)
  - [ ] Verify 3 colors stay constant (primary, secondary, tertiary)

### Phase 6: Quality Assurance

- [ ] **Visual regression testing:**
  - [ ] Screenshot all components in light mode
  - [ ] Screenshot all components in dark mode
  - [ ] Compare before/after
  - [ ] Fix any visual regressions

- [ ] **Accessibility audit:**
  - [ ] Verify contrast ratios (WCAG AA minimum 4.5:1)
  - [ ] Test keyboard navigation
  - [ ] Verify focus indicators
  - [ ] Test with screen reader

- [ ] **Performance testing:**
  - [ ] Run Lighthouse
  - [ ] Check bundle size (CSS < 100KB)
  - [ ] Verify Core Web Vitals (LCP < 2.5s, CLS < 0.1, FID < 100ms)

### Phase 7: Documentation

- [ ] **Update component documentation:**
  - [ ] Document new token usage
  - [ ] Add before/after examples
  - [ ] Update Storybook/demo pages

- [ ] **Create migration notes:**
  - [ ] List breaking changes
  - [ ] Document migration path
  - [ ] Share with team

---

## Breaking Changes

### 1. Token Names Changed

**Impact:** All components using old tokens will break.

**Old:**
```tsx
<div className="bg-card text-muted-foreground">
```

**New:**
```tsx
<div className="bg-background text-font opacity-80">
```

**Fix:** Global search and replace:
- `bg-card` → `bg-background`
- `text-card-foreground` → `text-font`
- `bg-popover` → `bg-foreground`
- `text-muted-foreground` → `text-font opacity-80`

---

### 2. Card Structure Changed

**Impact:** Cards now require explicit frame + content pattern.

**Old:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
</Card>
```

**New:**
```tsx
<Card className="bg-background p-1 shadow-sm rounded-md">
  <CardContent className="bg-foreground p-4 rounded-md">
    <h3 className="text-font font-semibold">Title</h3>
    <p className="text-font opacity-80">Content</p>
  </CardContent>
</Card>
```

**Fix:** Add explicit background/foreground classes to all cards.

---

### 3. Button Variants Renamed

**Impact:** Old variant names won't work.

**Old:**
```tsx
<Button variant="default">Action</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="accent">Accent</Button>
```

**New:**
```tsx
<Button variant="primary">Action</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="tertiary">Accent</Button>
```

**Fix:** Rename variants:
- `default` → `primary`
- `accent` → `tertiary`
- Add explicit states (hover, active, focus)

---

### 4. Muted Colors Removed

**Impact:** `muted` and `muted-foreground` tokens removed.

**Old:**
```tsx
<p className="text-muted-foreground">Secondary text</p>
<div className="bg-muted">Subtle background</div>
```

**New:**
```tsx
<p className="text-font opacity-80">Secondary text</p>
<div className="bg-background">Subtle background</div>
```

**Fix:** Use `opacity-80` or `opacity-60` for text hierarchy.

---

### 5. Destructive Removed from Core

**Impact:** Red/destructive variant removed from core 6 tokens.

**Old:**
```tsx
<Button variant="destructive">Delete</Button>
```

**New:**
```tsx
<Button className="bg-red-500 text-white hover:bg-red-600">Delete</Button>
```

**Fix:** Use custom red colors for destructive actions (not part of core 6 tokens).

---

### 6. Border/Ring Colors Changed

**Impact:** Borders now use `font` color with opacity.

**Old:**
```tsx
<div className="border">Content</div>
```

**New:**
```tsx
<div className="border border-font/20">Content</div>
```

**Fix:** Add explicit `border-font/20` to all borders.

---

## Code Examples

### Example 1: Product Card

```tsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: {
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="bg-background p-1 shadow-sm rounded-md">
      <CardContent className="bg-foreground p-4 rounded-md">
        {/* Image */}
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover rounded-md mb-4"
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-font font-semibold text-lg">{product.name}</h3>
          <Badge variant="outline" className="text-xs">
            {product.category}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-font opacity-80 text-sm mb-4">
          {product.description}
        </p>

        {/* Price */}
        <div className="text-2xl font-bold text-font mb-4">
          ${product.price}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button className="flex-1 bg-[hsl(216_55%_25%)] text-white shadow-lg hover:bg-[hsl(216_55%_20%)] hover:shadow-xl hover:scale-[1.02] active:shadow-md active:scale-[0.98] transition-all duration-150">
            Add to Cart
          </Button>
          <Button variant="outline" className="shadow-md hover:shadow-lg hover:scale-[1.02] active:shadow-sm active:scale-[0.98] transition-all duration-150">
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

### Example 2: Contact Form

```tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function ContactForm() {
  return (
    <form className="space-y-6">
      {/* Name field */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium text-font">
          Full Name
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="John Doe"
          className="w-full h-10 px-3 bg-foreground text-font border border-font/20 rounded-md
                     focus:ring-2 focus:ring-primary-dark focus:border-transparent
                     transition-all duration-150"
        />
      </div>

      {/* Email field */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-font">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          className="w-full h-10 px-3 bg-foreground text-font border border-font/20 rounded-md
                     focus:ring-2 focus:ring-primary-dark focus:border-transparent
                     transition-all duration-150"
        />
      </div>

      {/* Message field */}
      <div className="space-y-2">
        <Label htmlFor="message" className="text-sm font-medium text-font">
          Message
        </Label>
        <Textarea
          id="message"
          placeholder="Your message..."
          className="w-full min-h-[120px] px-3 py-2 bg-foreground text-font border border-font/20 rounded-md
                     focus:ring-2 focus:ring-primary-dark focus:border-transparent
                     transition-all duration-150"
        />
      </div>

      {/* Submit button */}
      <div className="flex gap-2">
        <Button
          type="submit"
          className="bg-[hsl(216_55%_25%)] text-white shadow-lg hover:bg-[hsl(216_55%_20%)] hover:shadow-xl hover:scale-[1.02] active:shadow-md active:scale-[0.98] transition-all duration-150"
        >
          Send Message
        </Button>
        <Button
          type="button"
          variant="outline"
          className="shadow-md hover:shadow-lg hover:scale-[1.02] active:shadow-sm active:scale-[0.98] transition-all duration-150"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
```

---

### Example 3: Dashboard Card Grid

```tsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";

export function DashboardStats() {
  const stats = [
    { label: "Total Users", value: "2,543", icon: Users, trend: "+12%" },
    { label: "Orders", value: "1,234", icon: ShoppingCart, trend: "+8%" },
    { label: "Revenue", value: "$45,678", icon: DollarSign, trend: "+23%" },
    { label: "Growth", value: "18%", icon: TrendingUp, trend: "+5%" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-background p-1 shadow-sm rounded-md">
          <CardContent className="bg-foreground p-4 rounded-md">
            {/* Icon and trend */}
            <div className="flex items-center justify-between mb-2">
              <stat.icon className="h-5 w-5 text-font opacity-60" />
              <Badge variant="outline" className="text-xs text-[hsl(105_22%_25%)]">
                {stat.trend}
              </Badge>
            </div>

            {/* Value */}
            <div className="text-2xl font-bold text-font mb-1">
              {stat.value}
            </div>

            {/* Label */}
            <p className="text-sm text-font opacity-60">{stat.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

---

### Example 4: Alert Components

```tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info, CheckCircle, AlertTriangle } from "lucide-react";

export function Alerts() {
  return (
    <div className="space-y-4">
      {/* Info alert */}
      <Alert className="bg-primary/10 border-primary/30 rounded-md">
        <Info className="h-4 w-4 text-[hsl(216_55%_25%)]" />
        <AlertTitle className="text-font font-semibold">Information</AlertTitle>
        <AlertDescription className="text-font opacity-80">
          Your subscription will renew on January 15, 2025.
        </AlertDescription>
      </Alert>

      {/* Success alert */}
      <Alert className="bg-tertiary/10 border-tertiary/30 rounded-md">
        <CheckCircle className="h-4 w-4 text-[hsl(105_22%_25%)]" />
        <AlertTitle className="text-font font-semibold">Success</AlertTitle>
        <AlertDescription className="text-font opacity-80">
          Your changes have been saved successfully.
        </AlertDescription>
      </Alert>

      {/* Warning alert */}
      <Alert className="bg-yellow-500/10 border-yellow-500/30 rounded-md">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-font font-semibold">Warning</AlertTitle>
        <AlertDescription className="text-font opacity-80">
          Your storage is almost full. Please upgrade your plan.
        </AlertDescription>
      </Alert>

      {/* Error alert */}
      <Alert className="bg-red-500/10 border-red-500/30 rounded-md">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-font font-semibold">Error</AlertTitle>
        <AlertDescription className="text-font opacity-80">
          Failed to process payment. Please try again.
        </AlertDescription>
      </Alert>
    </div>
  );
}
```

---

## Testing Checklist

### Visual Testing

- [ ] **Light mode:**
  - [ ] All components render correctly
  - [ ] Text is readable (4.5:1 contrast minimum)
  - [ ] Buttons have visible states (hover, active, focus)
  - [ ] Cards have clear hierarchy (frame + content)

- [ ] **Dark mode:**
  - [ ] 3 colors adapt (background, foreground, font)
  - [ ] 3 colors stay constant (primary, secondary, tertiary)
  - [ ] Text is readable (4.5:1 contrast minimum)
  - [ ] Elevation is visible (shadows are subtle)

### Accessibility Testing

- [ ] **Keyboard navigation:**
  - [ ] All interactive elements are focusable
  - [ ] Focus indicators are visible (2px ring)
  - [ ] Tab order is logical
  - [ ] Escape key works on modals

- [ ] **Screen reader:**
  - [ ] All buttons have accessible names
  - [ ] All form inputs have labels
  - [ ] ARIA labels are present where needed
  - [ ] Semantic HTML is used

- [ ] **Contrast ratios:**
  - [ ] Body text: 4.5:1 minimum (WCAG AA)
  - [ ] Large headings: 3:1 minimum (WCAG AA)
  - [ ] UI components: 3:1 minimum (WCAG AA)
  - [ ] Focus indicators: 3:1 with adjacent colors

### Performance Testing

- [ ] **Bundle size:**
  - [ ] CSS < 100KB (gzipped)
  - [ ] No unused tokens
  - [ ] Tree-shaking works

- [ ] **Core Web Vitals:**
  - [ ] LCP < 2.5s (Largest Contentful Paint)
  - [ ] FID < 100ms (First Input Delay)
  - [ ] CLS < 0.1 (Cumulative Layout Shift)

- [ ] **Lighthouse score:**
  - [ ] Performance: 90+
  - [ ] Accessibility: 100
  - [ ] Best Practices: 90+
  - [ ] SEO: 90+

---

## FAQ

### Q: Do I need to update all components at once?

**A:** No. The migration can be done incrementally. Start with core components (Button, Card, Input) and gradually update others.

---

### Q: Can I keep some old shadcn tokens?

**A:** Not recommended. Mixing old and new tokens creates inconsistency. The 6-token system is designed to replace all old tokens.

---

### Q: What if I need a destructive/red button?

**A:** Use custom red colors for destructive actions:
```tsx
<Button className="bg-red-500 text-white hover:bg-red-600">Delete</Button>
```
Red is not part of the core 6 tokens because it's application-specific.

---

### Q: How do I handle thing-level color overrides?

**A:** Use CSS custom properties:
```tsx
<Card
  style={{
    '--background': thing.colors.background,
    '--foreground': thing.colors.foreground,
    '--font': thing.colors.font,
    '--primary': thing.colors.primary,
    '--secondary': thing.colors.secondary,
    '--tertiary': thing.colors.tertiary
  } as React.CSSProperties}
>
  {/* Component uses hsl(var(--primary)) */}
</Card>
```

---

### Q: What about borders and rings?

**A:** Use `font` color with opacity:
```tsx
<div className="border border-font/20">Content</div>
<input className="focus:ring-2 focus:ring-primary-dark" />
```

---

### Q: How do I create text hierarchy without muted-foreground?

**A:** Use opacity:
```tsx
<h1 className="text-font font-bold">Main Heading</h1>
<p className="text-font">Body text</p>
<p className="text-font opacity-80">Secondary text</p>
<p className="text-font opacity-60">Tertiary text</p>
```

---

## Support

**Questions or issues?**
- Read design system spec: `/one/knowledge/design-system.md`
- See live examples: `/web/src/pages/design.astro`
- Check 100-cycle plan: `/one/events/design-system-100-cycle-implementation.md`

**Report bugs or suggest improvements:**
- Create an issue with before/after screenshots
- Include component name and expected behavior
- Tag with `design-system` label

---

## Version History

**1.0.0 (2025-11-22)**
- Initial migration guide created
- 6-token system documented
- 4 design properties explained
- Before/after examples added
- Migration checklist provided
- Breaking changes documented
- Code examples included

---

**The 6 extractable colors + 4 design properties. Extract from any website. Apply everywhere. Beautiful by default.**
