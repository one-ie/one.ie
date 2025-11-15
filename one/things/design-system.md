# Design System

**Version:** 1.0.0
**Category:** Thing Specification
**Dimension:** Things
**Status:** Active
**Last Updated:** 2025-11-16

---

## Overview

ONE Platform's design system is built on **6 extractable color tokens** that create beautiful, consistent components across the entire platform. Every card, button, and component maps to these 6 tokens.

**Key Innovation:** Same structure, infinite brands. The default 6 colors work universally, but you **can optionally** extract 6 colors from any website for thing-level branding when needed.

**Default is beautiful.** Most things use the platform defaults. Custom colors are optional for specific branding needs.

---

## The 6 Color Tokens

### Token Reference

| Token | Purpose | Light Mode | Dark Mode |
|-------|---------|------------|-----------|
| **background** | Card surface, sidebar color | `0 0% 93%` (gray) | `0 0% 10%` (dark gray) |
| **foreground** | Content area inside card | `0 0% 100%` (white) | `0 0% 13%` (dark) |
| **font** | Text color, readable in both modes | `0 0% 13%` (dark) | `0 0% 100%` (white) |
| **primary** | Main CTA, buttons | `216 55% 25%` (blue) | `216 55% 25%` |
| **secondary** | Supporting actions | `219 14% 28%` (gray-blue) | `219 14% 28%` |
| **tertiary** | Accent color (was "accent") | `105 22% 25%` (green) | `105 22% 25%` |

**Color Format:** HSL values in format `H S% L%` (Hue Saturation Lightness)

**Auto-Generated Variants:** System automatically creates:
- `primary-light`, `primary-dark`
- `secondary-light`, `secondary-dark`
- `tertiary-light`, `tertiary-dark`
- `ring` color (defaults to `primary-dark`)

---

## Component Mapping

### Cards (shadcn Card Component)

Cards use **background/foreground** tokens:

```
┌─────────────────────────────────────┐
│  Card Surface (background)          │
│  ┌───────────────────────────────┐  │
│  │ Content Area (foreground)     │  │
│  │                               │  │
│  │ Text uses font color          │  │
│  │                               │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Example:** Product card
- Outer card surface: `background` (gray in light mode)
- Inner content area: `foreground` (white in light mode)
- Text: `font` (dark in light mode, white in dark mode)

### Buttons (shadcn Button Component)

Buttons use **primary/secondary/tertiary** tokens:

| Variant | Token Used | Use Case |
|---------|------------|----------|
| **Primary** | `primary` | Main CTA (Purchase, Start, Join) |
| **Secondary** | `secondary` | Supporting actions (Learn More, View Details) |
| **Tertiary** | `tertiary` | Accent actions (Special offers, highlights) |
| **Outline** | `font` (border only) | Neutral variant, no fill |
| **Ghost** | `font` (hover only) | Minimal variant, transparent |

**Visual Reference:**

```
Primary Button     ← Uses primary color
Secondary Button   ← Uses secondary color
Tertiary Button    ← Uses tertiary color
Outline Button     ← Uses font color (border only)
Ghost Button       ← Uses font color (hover only)
```

---

## Extraction Process

### From Any Website

1. **Identify dominant colors** from target website
2. **Map to 6 tokens:**
   - Background: Card/surface color (usually light gray or dark)
   - Foreground: Content area (usually white or dark)
   - Font: Text color (must be readable on both backgrounds)
   - Primary: Main brand color (CTA buttons)
   - Secondary: Supporting color (secondary actions)
   - Tertiary: Accent color (highlights, special features)

3. **Apply everywhere:** All components automatically adapt

### Extraction Tools

- **Manual:** Use browser DevTools to inspect CSS
- **Automated:** Use `@agent-designer` to extract from screenshots
- **Brand guidelines:** Many companies publish HSL/HEX values

**Example Extraction (Stripe):**

```typescript
const stripeColors = {
  background: "220 14% 96%",   // Light gray surface
  foreground: "0 0% 100%",     // White content area
  font: "220 39% 11%",         // Dark text
  primary: "229 84% 55%",      // Stripe blue
  secondary: "220 14% 40%",    // Gray buttons
  tertiary: "151 55% 42%"      // Green accent
}
```

---

## Thing-Level Override (Optional)

### Per-Thing Branding

**IMPORTANT:** Our platform components are already beautiful with the default 6 colors. Thing-level overrides are **optional** and should only be used when:
- A product has strong existing brand identity (e.g., replicating Stripe's exact colors)
- External brand guidelines require specific colors
- Multi-brand marketplace needs distinct visual separation

**Most things should use the platform defaults.** The 6-color system is designed to work universally.

Each Thing (product, course, token, agent) **can optionally** define its own 6 colors while maintaining the same component structure.

**Database Schema (backend/convex/schema.ts):**

```typescript
things: defineTable({
  // ... other fields
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

**Frontend Implementation:**

```tsx
// web/src/components/ThingCard.tsx
export function ThingCard({ thing }: { thing: Thing }) {
  const colors = thing.colors || defaultColors

  return (
    <Card
      style={{
        '--background': colors.background,
        '--foreground': colors.foreground,
        '--font': colors.font,
        '--primary': colors.primary,
        '--secondary': colors.secondary,
        '--tertiary': colors.tertiary
      } as React.CSSProperties}
    >
      <CardContent className="bg-foreground text-font">
        <h3>{thing.name}</h3>
        <Button variant="primary">Purchase</Button>
        <Button variant="secondary">Learn More</Button>
        <Button variant="tertiary">Special Offer</Button>
      </CardContent>
    </Card>
  )
}
```

### Multi-Brand Example

**Default Platform Colors (Blue theme):**
```typescript
platform: {
  background: "0 0% 93%",
  foreground: "0 0% 100%",
  font: "0 0% 13%",
  primary: "216 55% 25%",    // Blue
  secondary: "219 14% 28%",  // Gray-blue
  tertiary: "105 22% 25%"    // Green
}
```

**Product A (Purple theme):**
```typescript
productA: {
  background: "270 50% 92%",
  foreground: "270 50% 98%",
  font: "270 50% 15%",
  primary: "280 100% 60%",   // Purple
  secondary: "200 100% 50%", // Blue
  tertiary: "150 80% 40%"    // Green
}
```

**Product B (Orange theme):**
```typescript
productB: {
  background: "30 50% 92%",
  foreground: "30 50% 98%",
  font: "30 50% 15%",
  primary: "25 100% 55%",    // Orange
  secondary: "45 100% 50%",  // Yellow
  tertiary: "340 80% 50%"    // Red
}
```

**Same card structure. Different brands. Zero custom CSS.**

---

## Implementation Guide

### Global Defaults (Tailwind Config)

```typescript
// web/tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        font: "hsl(var(--font))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          light: "hsl(var(--primary-light))",
          dark: "hsl(var(--primary-dark))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          light: "hsl(var(--secondary-light))",
          dark: "hsl(var(--secondary-dark))"
        },
        tertiary: {
          DEFAULT: "hsl(var(--tertiary))",
          light: "hsl(var(--tertiary-light))",
          dark: "hsl(var(--tertiary-dark))"
        }
      }
    }
  }
}
```

### CSS Variables (Root)

```css
/* web/src/styles/globals.css */
:root {
  /* Light mode defaults */
  --background: 0 0% 93%;
  --foreground: 0 0% 100%;
  --font: 0 0% 13%;
  --primary: 216 55% 25%;
  --secondary: 219 14% 28%;
  --tertiary: 105 22% 25%;

  /* Auto-generated variants */
  --primary-light: 216 55% 35%;
  --primary-dark: 216 55% 15%;
  --ring: var(--primary-dark);
}

.dark {
  /* Dark mode overrides */
  --background: 0 0% 10%;
  --foreground: 0 0% 13%;
  --font: 0 0% 100%;
}
```

### Component Usage

```tsx
// Cards automatically use background/foreground
<Card className="bg-background">
  <CardContent className="bg-foreground text-font">
    <h3>Product Title</h3>
    <p>Product description</p>
  </CardContent>
</Card>

// Buttons use brand colors
<Button variant="primary">Main CTA</Button>
<Button variant="secondary">Supporting Action</Button>
<Button variant="tertiary">Accent Action</Button>
<Button variant="outline">Neutral</Button>
<Button variant="ghost">Minimal</Button>
```

---

## Migration from Old System

### Old Token Names → New Token Names

| Old Name | New Name | Notes |
|----------|----------|-------|
| `card` | `background` | Card surface color |
| `card-foreground` | `font` | Text on cards |
| `popover` | `foreground` | Content area |
| `popover-foreground` | `font` | Text in content |
| `accent` | `tertiary` | Renamed for clarity |
| `accent-foreground` | `font` | Auto-handled |

**Breaking Change:** None. Old tokens still work via CSS variable mapping.

---

## Design Tokens Export

### For Design Tools (Figma, Sketch)

```json
{
  "colors": {
    "background": {
      "light": "hsl(0, 0%, 93%)",
      "dark": "hsl(0, 0%, 10%)"
    },
    "foreground": {
      "light": "hsl(0, 0%, 100%)",
      "dark": "hsl(0, 0%, 13%)"
    },
    "font": {
      "light": "hsl(0, 0%, 13%)",
      "dark": "hsl(0, 0%, 100%)"
    },
    "primary": "hsl(216, 55%, 25%)",
    "secondary": "hsl(219, 14%, 28%)",
    "tertiary": "hsl(105, 22%, 25%)"
  }
}
```

---

## Best Practices

### DO ✅

- **Use platform defaults for most things** (they're already beautiful!)
- Extract colors only when replicating existing brands (Stripe, Shopify, etc.)
- Use thing-level colors **sparingly** for products with strong brand identity
- Maintain high contrast ratios (WCAG AA minimum)
- Test in both light and dark modes
- Use primary for main CTAs, secondary for supporting actions
- Keep background/foreground as neutral grays

### DON'T ❌

- **Don't override colors unless absolutely necessary**
- Don't use more than 6 base colors per thing
- Don't hardcode HSL values in components
- Don't override font color without testing readability
- Don't use tertiary for critical actions
- Don't mix color systems (stick to 6 tokens)
- **Don't assume every thing needs custom colors** (default is perfect!)

---

## Accessibility

### Color Contrast Requirements

**WCAG AA Compliance (Minimum):**
- Normal text: 4.5:1 contrast ratio
- Large text: 3:1 contrast ratio
- UI components: 3:1 contrast ratio

**Test Tools:**
- Chrome DevTools (Lighthouse)
- WebAIM Contrast Checker
- `@agent-designer` auto-checks contrast

**Font Color Rules:**
- Light mode: `font` must be dark enough on `foreground` (white)
- Dark mode: `font` must be light enough on `foreground` (dark)
- Default `font` values guarantee WCAG AA

---

## Examples

### Platform Default

```typescript
// Global platform colors
{
  background: "0 0% 93%",     // Light gray card
  foreground: "0 0% 100%",    // White content
  font: "0 0% 13%",           // Dark text
  primary: "216 55% 25%",     // Blue buttons
  secondary: "219 14% 28%",   // Gray buttons
  tertiary: "105 22% 25%"     // Green accents
}
```

### E-commerce Product (Purple Brand)

```typescript
// Purple-themed product
{
  background: "270 50% 92%",  // Purple-tinted card
  foreground: "270 50% 98%",  // Purple-tinted white
  font: "270 50% 15%",        // Purple-tinted dark
  primary: "280 100% 60%",    // Vibrant purple
  secondary: "200 100% 50%",  // Blue support
  tertiary: "150 80% 40%"     // Green accent
}
```

### Course Platform (Orange Brand)

```typescript
// Orange-themed course
{
  background: "30 50% 92%",   // Orange-tinted card
  foreground: "30 50% 98%",   // Orange-tinted white
  font: "30 50% 15%",         // Orange-tinted dark
  primary: "25 100% 55%",     // Vibrant orange
  secondary: "45 100% 50%",   // Yellow support
  tertiary: "340 80% 50%"     // Red accent
}
```

---

## Related Documentation

- **shadcn/ui Components:** `/web/src/components/ui/`
- **Tailwind Config:** `/web/tailwind.config.ts`
- **Global Styles:** `/web/src/styles/globals.css`
- **Design Templates:** `/web/src/pages/shop/TEMPLATE-README.md`
- **Ontology Spec:** `/one/knowledge/ontology.md`
- **Thing Schema:** `/backend/convex/schema.ts`

---

## Version History

**1.0.0 (2025-11-16)**
- Initial specification
- 6 core color tokens defined
- Thing-level override system
- Component mapping (cards + buttons)
- Migration guide from old tokens

---

**The 6 extractable colors. Extract from any website. Map to these 6 tokens. Apply everywhere.**
