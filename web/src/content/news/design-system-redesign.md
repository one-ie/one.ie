---
title: "ONE Design System: 6 Colors That Power Every Thing"
date: 2025-01-16
description: "Complete redesign of the design system page reveals the elegant simplicity behind ONE's brand extraction technology"
author: "ONE Platform Team"
type: "feature_update"
tags: ["design", "design-system", "shadcn-ui", "ontology", "brand-extraction"]
category: "product"
repo: "web"
draft: false
---

The ONE Design System just got a major upgrade, and it's beautifully simple: **6 colors. Extract from any site. Apply to every Thing.**

We've completely redesigned the `/design` page to showcase the core philosophy that makes ONE's brand system work at scale.

## What's New

### Above-the-Fold Clarity

The new design system page gets straight to the point. No endless scrolling to understand the concept. Everything you need is visible immediately:

- **Prominent heading**: "ONE Design System"
- **Clear value prop**: 6 colors. Extract from any site. Apply to every Thing.
- **Live theme toggle**: Test light and dark modes with side-by-side buttons
- **Visual color swatches**: See exactly how the 6 colors work in both modes

### The 6 Extractable Colors

Here's the brilliance: instead of dozens of color tokens, we simplified to just 6:

**3 colors that change per mode** (light/dark):
1. **background** - Card surface and sidebar (gray in light, dark in dark mode)
2. **foreground** - Content areas inside cards (white in light, darker in dark mode)
3. **font** - Text color (dark in light mode, white in dark mode)

**3 colors that stay constant**:
4. **primary** - Main CTA buttons (your brand's signature color)
5. **secondary** - Supporting actions (complementary brand color)
6. **tertiary** - Accent actions (accent brand color)

Each color is displayed with actual swatches showing how it appears in both light and dark modes.

### Live Product Card Demo

No more guessing how buttons will look. The new page includes a full product card showcasing all 5 button variants:

- **Primary Button** - shadow-lg elevation with primary color
- **Secondary Button** - shadow-lg elevation with secondary color
- **Tertiary Button** - shadow-lg elevation with tertiary color
- **Outline Button** - shadow-md with border
- **Ghost Button** - shadow-sm, subtle

Every button uses the new 6px radius (slightly rounded, not pill-shaped) and proper shadow elevation for depth.

### Extraction Workflow

Three simple cards explain the process:

1. **Extract** - AI scans any website and pulls the 6 core colors
2. **Map** - Colors map to background, foreground, font, primary, secondary, tertiary
3. **Apply** - CSS vars generated, all shadcn components adapt instantly

## Technical Improvements

### Button & Elevation System

We've refined the elevation hierarchy:

- **shadow-sm**: Inputs & lists
- **shadow-md**: Stronger depth for emphasis (0 8px 16px with 0.4 opacity)
- **shadow-lg**: Buttons and cards (default state)
- **shadow-xl**: Button hover states (dramatic 20px-25px spread)

Buttons now use `shadow-lg` by default and elevate to `shadow-xl` on hover, creating a tangible sense of depth and interactivity.

### Modern Radius Scale

Updated from large, pill-shaped radii to a modern, slightly-rounded scale:

- **xs**: 2px (pills & badges)
- **sm**: 4px (inputs & controls)
- **md**: 6px (cards & buttons) ← Primary change
- **lg**: 8px (modals & hero surfaces)
- **xl**: 16px (large hero surfaces)

This creates a more contemporary, professional appearance while maintaining clarity.

### Enhanced Theme Toggle

The ThemeToggle component got two new features:

1. **Inline variant** - Side-by-side Light/Dark buttons (used on design page)
2. **Size variants** - sm, md, lg for different contexts
3. **Backward compatible** - Original floating toggle still works

## Thing-Level Color Overrides

Here's where it gets powerful: every Thing (product, course, token, agent) can define its own 6 colors.

Same card structure. Same button components. Different brand.

```typescript
thing.colors = {
  background: "270 50% 92%",  // Purple-gray card
  foreground: "270 50% 98%",  // Light purple content
  font: "270 50% 15%",        // Dark purple text
  primary: "280 100% 60%",    // Vibrant purple button
  secondary: "200 100% 50%",  // Blue button
  tertiary: "150 80% 40%"     // Green accent
}
```

The page includes a live side-by-side comparison showing the same product card with default site colors vs. custom Thing-level overrides.

## Why This Matters

**Ontology meets design**. In the ONE Platform, everything is a Thing. Products, courses, tokens, agents—all rendered with the same Card and Button components.

By standardizing on 6 extractable colors, we've created a system that:

- ✅ Scales infinitely (each Thing can have its own brand)
- ✅ Maintains consistency (same components, same structure)
- ✅ Simplifies development (designers and developers speak the same language)
- ✅ Enables AI extraction (6 colors are scannable from any website)

## Built on shadcn/ui

Everything is built on top of shadcn/ui, the component library trusted by thousands of projects. We're not reinventing the wheel—we're making it extractable, scalable, and Thing-aware.

All 50+ shadcn components work seamlessly with the 6-color system. Change the colors, everything updates. Extract colors from a competitor's site, apply them to your Thing in seconds.

## See It Live

Visit [one.ie/design](https://one.ie/design) to explore the complete design system with:

- Interactive theme toggle
- Live color swatches for both modes
- All 5 button variants in action
- Complete token documentation
- Typography, spacing, and motion guidelines
- Accessibility checklist

The entire system is now above the fold, immediately understandable, and ready to power every Thing in the ONE Platform.

---

**Ship with clarity. Design with intention. Build with tokens.**
