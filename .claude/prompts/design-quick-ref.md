# ONE Design System - Quick Reference

**Source of Truth:** `/one/things/design-system.md`
**Last Updated:** 2025-11-16

---

## Copy-Paste Ready Components

### Button (Primary)
```tsx
<button className="
  rounded-md bg-[hsl(216_55%_25%)] px-4 py-2 text-sm font-semibold text-white shadow-lg
  hover:bg-[hsl(216_55%_20%)] hover:shadow-xl
  active:bg-[hsl(216_55%_18%)] active:shadow-md
  focus:ring-2 focus:ring-primary focus:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
  transition-all duration-150 ease-in-out
">
  Primary Button
</button>
```

### Button (Secondary)
```tsx
<button className="
  rounded-md bg-[hsl(219_14%_28%)] px-4 py-2 text-sm font-semibold text-white shadow-lg
  hover:bg-[hsl(219_14%_23%)] hover:shadow-xl
  active:bg-[hsl(219_14%_21%)] active:shadow-md
  focus:ring-2 focus:ring-primary focus:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
  transition-all duration-150 ease-in-out
">
  Secondary Button
</button>
```

### Button (Tertiary)
```tsx
<button className="
  rounded-md bg-[hsl(105_22%_25%)] px-4 py-2 text-sm font-semibold text-white shadow-lg
  hover:bg-[hsl(105_22%_20%)] hover:shadow-xl
  active:bg-[hsl(105_22%_18%)] active:shadow-md
  focus:ring-2 focus:ring-primary focus:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
  transition-all duration-150 ease-in-out
">
  Tertiary Button
</button>
```

### Card Pattern
```tsx
<Card className="bg-background p-1 shadow-sm rounded-md">
  <CardContent className="bg-foreground p-4 rounded-md">
    <h3 className="text-font text-lg font-semibold">Card Title</h3>
    <p className="text-font opacity-80 text-sm mt-2">Card description text</p>
    <div className="flex gap-2 mt-4">
      <button className="rounded-md bg-[hsl(216_55%_25%)] px-4 py-2 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-150">
        Action
      </button>
    </div>
  </CardContent>
</Card>
```

---

## Color Reference

```tsx
// Surface Colors (Cards)
bg-background           // hsl(0 0% 93%) light, hsl(0 0% 10%) dark
bg-foreground           // hsl(0 0% 100%) light, hsl(0 0% 13%) dark
text-font               // hsl(0 0% 13%) light, hsl(0 0% 100%) dark

// Action Colors (Buttons)
bg-[hsl(216_55%_25%)]   // Primary (blue)
bg-[hsl(219_14%_28%)]   // Secondary (gray-blue)
bg-[hsl(105_22%_25%)]   // Tertiary (green)
```

---

## Common Patterns

### Hover Darkening
```tsx
// Primary hover: Darken by 5% lightness
bg-[hsl(216_55%_25%)]      // Base (25%)
hover:bg-[hsl(216_55%_20%)] // Hover (20%)
active:bg-[hsl(216_55%_18%)] // Active (18%)
```

### Standard States
```tsx
className="
  shadow-lg                    // Default elevation
  hover:shadow-xl              // Elevate on hover
  active:shadow-md             // Drop on active
  focus:ring-2 focus:ring-primary focus:ring-offset-2  // Focus ring (a11y)
  disabled:opacity-50 disabled:cursor-not-allowed      // Disabled state
  transition-all duration-150  // 150ms for buttons
"
```

### Typography Sizes
```tsx
text-4xl  // 36px - Hero titles
text-3xl  // 30px - Section headings
text-2xl  // 24px - Card titles
text-xl   // 20px - Component headings
text-base // 16px - Body text (DEFAULT)
text-sm   // 14px - Metadata, labels
text-xs   // 12px - Captions, fine print
```

### Spacing Scale
```tsx
gap-2   // 8px  - Tight spacing
gap-3   // 12px - Component gaps
gap-4   // 16px - Default spacing (MOST COMMON)
gap-6   // 24px - Card gutters
gap-8   // 32px - Section spacing
gap-12  // 48px - Hero whitespace
```

---

## Pre-flight Checklist

**Before committing UI code:**

```
[ ] Colors: Uses ONLY 6 tokens (no custom colors)
[ ] States: hover, active, focus, disabled defined
[ ] Elevation: shadow-sm/md/lg/xl (no custom shadows)
[ ] Radius: rounded-md default (no custom radius)
[ ] Motion: duration-150/300 with ease-in-out
[ ] Typography: Uses text-xs through text-4xl scale
[ ] Spacing: Uses gap-2/3/4/6/8/12 scale
```

---

## Quick Fixes

### Fix Hardcoded Colors
```tsx
// BEFORE
<div className="bg-blue-500">

// AFTER
<div className="bg-[hsl(216_55%_25%)]">
```

### Fix Missing States
```tsx
// BEFORE
<button className="bg-primary">

// AFTER
<button className="
  bg-[hsl(216_55%_25%)]
  hover:bg-[hsl(216_55%_20%)]
  focus:ring-2 focus:ring-primary
  transition-all duration-150
">
```

### Fix Custom Spacing
```tsx
// BEFORE
<div className="gap-5 p-7">

// AFTER
<div className="gap-6 p-6">  // or gap-4 p-4
```

---

**Read full spec:** `/one/things/design-system.md`
**See live examples:** `/web/src/pages/design.astro`
**Enforcement rules:** `/.claude/prompts/design-system.md`
