# ONE Design System - Claude Enforcement Rules

**Version:** 1.0.0
**Purpose:** Ensure all UI code adheres to the ONE design system
**Applies to:** All frontend code, components, pages, and styling

---

## CRITICAL: Design System First

**Single Source of Truth:** `/one/things/design-system.md`

**All changes to the design system happen in ONE place:**
1. Update `/one/things/design-system.md` (specification - ONLY place to change)
2. Changes automatically cascade to:
   - `/web/src/pages/design.astro` (visual examples)
   - All components site-wide
   - This enforcement doc

**Before writing ANY UI code, you MUST:**

1. Read `/one/things/design-system.md` (complete specification - SOURCE OF TRUTH)
2. Reference `/web/src/pages/design.astro` (live examples of the spec)
3. Apply the 6-color + 4-property system (no exceptions)

**Golden Rules:**
- If it's not in `/one/things/design-system.md`, don't build it
- To add new values: Update `/one/things/design-system.md` FIRST
- Never create custom styles outside the system
- The system drives the code, code never drives the system

---

## The 6 Core Colors (NEVER deviate)

All colors come from these 6 tokens. NEVER hardcode colors outside this system.

```css
/* Cards & Surfaces */
--color-background: 0 0% 93%;     /* Card surface, sidebar (light) */
--color-foreground: 0 0% 100%;    /* Content area (light) */
--color-font: 0 0% 13%;           /* Text (light) */

/* Buttons & Actions */
--color-primary: 216 55% 25%;     /* Main CTA (blue) */
--color-secondary: 219 14% 28%;   /* Supporting (gray-blue) */
--color-tertiary: 105 22% 25%;    /* Accent (green) */
```

**Dark mode:** background/foreground/font invert. Primary/secondary/tertiary stay constant.

**Usage:**
```tsx
// ✅ CORRECT - Uses design system
<div className="bg-background text-font">
  <Card className="bg-card">
    <Button className="bg-[hsl(216_55%_25%)]">Primary</Button>
  </Card>
</div>

// ❌ WRONG - Hardcoded colors
<div style="background: #f0f0f0; color: #333">
  <button style="background: blue">Click</button>
</div>
```

---

## The 4 Design Properties (ALWAYS apply)

### 1. States (Buttons & Interactive Elements)

**Every button/link MUST have these states:**

```tsx
<button className="
  bg-[hsl(216_55%_25%)]           // Default
  hover:bg-[hsl(216_55%_20%)]     // Hover (darken 5%)
  active:bg-[hsl(216_55%_18%)]    // Active (darken 7%)
  focus:ring-2 focus:ring-primary focus:ring-offset-2  // Focus
  disabled:opacity-50 disabled:cursor-not-allowed      // Disabled
  transition-all duration-150     // Motion
">
  Button Text
</button>
```

**State checklist:**
- [ ] Hover: Darken 5% + scale-[1.02] (optional)
- [ ] Active: Darken 7% + scale-[0.98] (optional)
- [ ] Focus: 2px ring with 2px offset (MANDATORY for a11y)
- [ ] Disabled: 50% opacity + cursor-not-allowed
- [ ] Transition: 150ms for hovers, 300ms for larger changes

### 2. Elevation (Shadow Depth)

**Use these shadow levels consistently:**

| Elevation | Class | Use Case |
|-----------|-------|----------|
| None | `shadow-none` | Flat surfaces, nested cards |
| Subtle | `shadow-sm` | Cards (DEFAULT) |
| Medium | `shadow-md` | Dropdowns, elevated cards |
| Strong | `shadow-lg` | Buttons, featured cards |
| Maximum | `shadow-xl` | Modals, hover states |

```tsx
// ✅ CORRECT
<Card className="shadow-sm">            // Default cards
<Button className="shadow-lg">          // Buttons
<div className="shadow-xl">             // Modals

// ❌ WRONG
<Card className="shadow-2xl">           // Non-standard elevation
<div style="box-shadow: 0 4px 8px">    // Custom shadow
```

### 3. Radius (Border Rounding)

**Use these radius values consistently:**

| Radius | Class | Pixels | Use Case |
|--------|-------|--------|----------|
| Small | `rounded-sm` | 6px | Badges, pills |
| Medium | `rounded-md` | 8px | Cards, buttons (DEFAULT) |
| Large | `rounded-lg` | 12px | Large cards |
| XL | `rounded-xl` | 16px | Modals, hero sections |
| Full | `rounded-full` | 9999px | Avatars, circles |

```tsx
// ✅ CORRECT - Uses design system
<Card className="rounded-md">     // Default
<Button className="rounded-md">   // Default
<Avatar className="rounded-full"> // Circular

// ❌ WRONG - Custom radius
<Card className="rounded-[10px]">
<Button style="border-radius: 5px">
```

### 4. Motion (Animation Timing)

**Use these timing values consistently:**

| Speed | Class | ms | Use Case |
|-------|-------|----|----|
| Instant | `transition-none` | 0 | No animation |
| Fast | `duration-150` | 150 | Hovers, quick feedback |
| Normal | `duration-300` | 300 | Component transitions (DEFAULT) |
| Slow | `duration-500` | 500 | Page transitions, modals |

**Always use ease-in-out:**
```tsx
// ✅ CORRECT
<button className="transition-all duration-150 ease-in-out">

// ❌ WRONG
<button className="transition-all duration-200"> // Non-standard timing
<button style="transition: 0.3s ease">          // Custom timing
```

---

## Component Patterns (ALWAYS follow)

### Cards (Foundation of Everything)

**Structure:**
```tsx
<Card className="bg-background p-1 shadow-sm rounded-md">
  <CardContent className="bg-foreground p-4 rounded-md">
    <h3 className="text-font font-semibold text-lg">Title</h3>
    <p className="text-font opacity-80 text-sm">Description</p>
    <div className="flex gap-2 mt-4">
      <Button>Primary</Button>
      <Button>Secondary</Button>
    </div>
  </CardContent>
</Card>
```

**Rules:**
- Outer card: `background` color + `p-1` frame + `shadow-sm`
- Inner content: `foreground` color + `p-4` padding
- Always use `rounded-md` (8px)

### Buttons (5 Variants)

```tsx
// Primary - Main CTA
<button className="bg-[hsl(216_55%_25%)] text-white shadow-lg hover:shadow-xl hover:bg-[hsl(216_55%_20%)] active:shadow-md transition-all duration-150 rounded-md px-4 py-2 font-semibold">
  Primary
</button>

// Secondary - Supporting actions
<button className="bg-[hsl(219_14%_28%)] text-white shadow-lg hover:shadow-xl hover:bg-[hsl(219_14%_23%)] active:shadow-md transition-all duration-150 rounded-md px-4 py-2 font-semibold">
  Secondary
</button>

// Tertiary - Accent actions
<button className="bg-[hsl(105_22%_25%)] text-white shadow-lg hover:shadow-xl hover:bg-[hsl(105_22%_20%)] active:shadow-md transition-all duration-150 rounded-md px-4 py-2 font-semibold">
  Tertiary
</button>

// Outline - Neutral variant
<button className="bg-transparent border-2 border-font text-font hover:bg-font/10 transition-all duration-150 rounded-md px-4 py-2 font-medium">
  Outline
</button>

// Ghost - Minimal variant
<button className="bg-transparent text-font hover:bg-font/10 transition-all duration-150 rounded-md px-4 py-2 font-medium">
  Ghost
</button>
```

### Typography Scale

**Use ONLY these text sizes:**

```tsx
<h1 className="text-4xl font-bold leading-tight">Hero Title</h1>
<h2 className="text-3xl font-bold leading-tight">Section Heading</h2>
<h3 className="text-2xl font-semibold leading-snug">Card Title</h3>
<h4 className="text-xl font-semibold">Component Heading</h4>
<p className="text-base leading-relaxed">Body text</p>
<span className="text-sm">Metadata, labels</span>
<span className="text-xs">Captions, fine print</span>
```

**Typography rules:**
- Headings: `font-bold` or `font-semibold`
- Body: `font-normal`
- Line height: `leading-tight` (headings), `leading-relaxed` (body)
- Color: ALWAYS `text-font` (auto-adapts to light/dark)

### Spacing Scale

**Use ONLY these gap/padding values:**

```tsx
gap-2  // 8px  - Tight spacing
gap-3  // 12px - Component gaps
gap-4  // 16px - Default spacing
gap-6  // 24px - Card gutters
gap-8  // 32px - Section rhythm
gap-12 // 48px - Hero whitespace
```

---

## Enforcement Checklist

**Before committing ANY UI code, verify:**

### Colors ✓
- [ ] Uses ONLY the 6 color tokens (background, foreground, font, primary, secondary, tertiary)
- [ ] No hardcoded hex/rgb/hsl colors outside the system
- [ ] All text uses `text-font` (never hardcoded text colors)
- [ ] Cards use `bg-background` and `bg-foreground` pattern

### States ✓
- [ ] Buttons have hover state (darken 5% or bg opacity change)
- [ ] Buttons have active state (darken 7% or scale)
- [ ] All interactive elements have `focus:ring-2 focus:ring-primary` (a11y)
- [ ] Disabled states use `opacity-50 cursor-not-allowed`

### Elevation ✓
- [ ] Cards use `shadow-sm` (default)
- [ ] Buttons use `shadow-lg`
- [ ] Modals use `shadow-xl`
- [ ] No custom box-shadow values

### Radius ✓
- [ ] Cards and buttons use `rounded-md` (8px default)
- [ ] Avatars use `rounded-full`
- [ ] No custom border-radius values

### Motion ✓
- [ ] Transitions use `duration-150` (hovers) or `duration-300` (default)
- [ ] All transitions use `ease-in-out`
- [ ] No custom transition timings

### Typography ✓
- [ ] Uses design system text sizes (text-xs → text-4xl)
- [ ] No custom font sizes
- [ ] Headings use proper weights (bold/semibold)
- [ ] Body text uses `leading-relaxed`

### Spacing ✓
- [ ] Uses gap-2/3/4/6/8/12 scale
- [ ] Uses p-1/2/3/4/6/8 scale
- [ ] No custom spacing values

---

## Code Review Questions

**When reviewing UI code, ask:**

1. **"Does this follow the 6-color system?"**
   - If no → Refactor to use design tokens

2. **"Are all states defined (hover, active, focus, disabled)?"**
   - If no → Add missing states

3. **"Does this use standard elevation/radius/motion?"**
   - If no → Replace with design system values

4. **"Could this be built with existing shadcn components?"**
   - If yes → Use shadcn instead of custom markup

5. **"Is the typography from the design system?"**
   - If no → Replace with standard text sizes

---

## Common Violations & Fixes

### ❌ Violation: Custom Colors
```tsx
// WRONG
<div className="bg-blue-500 text-gray-900">
<button style="background: #3b82f6">
```

### ✅ Fix: Use Design System
```tsx
// CORRECT
<div className="bg-[hsl(216_55%_25%)] text-font">
<button className="bg-[hsl(216_55%_25%)]">
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
<div style="margin: 20px">
```

### ✅ Fix: Use Design System
```tsx
// CORRECT
<div className="gap-6 p-6">  // 24px
<div className="gap-4 p-4">  // 16px
```

---

### ❌ Violation: Custom Typography
```tsx
// WRONG
<h1 className="text-[32px] font-[600]">
<p style="font-size: 15px; line-height: 1.8">
```

### ✅ Fix: Use Design System
```tsx
// CORRECT
<h1 className="text-3xl font-bold leading-tight">
<p className="text-base leading-relaxed">
```

---

## Quick Reference Card

```
COLORS (6):
  bg-background, bg-foreground, text-font
  bg-[hsl(216_55%_25%)] = primary
  bg-[hsl(219_14%_28%)] = secondary
  bg-[hsl(105_22%_25%)] = tertiary

ELEVATION (5):
  shadow-none, shadow-sm, shadow-md, shadow-lg, shadow-xl

RADIUS (5):
  rounded-sm (6px), rounded-md (8px), rounded-lg (12px),
  rounded-xl (16px), rounded-full

MOTION (4):
  duration-0, duration-150, duration-300, duration-500
  ALWAYS with ease-in-out

TYPOGRAPHY (7):
  text-xs, text-sm, text-base, text-xl,
  text-2xl, text-3xl, text-4xl

SPACING (6):
  gap-2 (8px), gap-3 (12px), gap-4 (16px),
  gap-6 (24px), gap-8 (32px), gap-12 (48px)
```

---

## When in Doubt

1. Check `/one/things/design-system.md` (source of truth)
2. Check `/web/src/pages/design.astro` (live examples)
3. Check existing components in `/web/src/components/ui/`
4. Ask: "Is this in the design system?" If no → Add it to the system first

**NEVER create custom styles outside the design system without explicit approval.**

---

## Design System Evolution

**To add new values to the system:**

1. Propose change in `/one/things/design-system.md`
2. Update `/web/src/pages/design.astro` with examples
3. Document rationale and use cases
4. Get approval before using in production code

**The design system is the source of truth. Code follows the system, not vice versa.**

---

**Built with consistency. Enforced with discipline. Beautiful by default.**
