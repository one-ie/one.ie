# Design System Primitive Components

**Cycle 4 of the design system 100-cycle implementation plan.**

These components showcase the ONE Design System's **6-color + 4-property** system through interactive, reusable primitives.

## Components

### 1. ColorSwatch

Displays a color token with its value, description, and copy functionality.

**Features:**
- Visual color preview (both light and dark mode for adaptive colors)
- HSL value display with copy-to-clipboard
- Hover state with copy button
- Adaptive color support (shows both light and dark mode)

**Usage:**
```tsx
import { ColorSwatch } from '@/components/design/primitives';

// Simple color
<ColorSwatch
  name="primary"
  value="216 55% 25%"
  description="Main CTA buttons"
/>

// Adaptive color (changes in dark mode)
<ColorSwatch
  name="background"
  value="0 0% 93%"
  darkValue="0 0% 10%"
  description="Card surface"
  adaptive={true}
/>
```

**Props:**
- `name: string` - Name of the color token
- `value: string` - HSL value (e.g., "216 55% 25%")
- `description?: string` - Usage description
- `adaptive?: boolean` - Whether color changes in dark mode
- `darkValue?: string` - Dark mode HSL value

---

### 2. StateDemo

Demonstrates all button states (hover, active, focus, disabled) with interactive preview.

**Features:**
- Interactive button that shows current state
- Hover over state list to preview each state
- Supports all button variants (primary, secondary, tertiary, outline, ghost)
- Visual indicators for active state

**Usage:**
```tsx
import { StateDemo } from '@/components/design/primitives';

<StateDemo variant="primary" label="Buy Now" />
<StateDemo variant="outline" label="Learn More" />
```

**Props:**
- `variant?: "primary" | "secondary" | "tertiary" | "outline" | "ghost"` - Button variant (default: "primary")
- `label?: string` - Button label (default: "Button")

---

### 3. ElevationDemo

Shows different shadow levels (shadow-sm, shadow-md, shadow-lg, etc.) with usage guidance.

**Features:**
- Visual comparison of all shadow levels
- Hover to highlight specific elevation
- Usage guide for each shadow level
- Interactive preview mode

**Usage:**
```tsx
import { ElevationDemo } from '@/components/design/primitives';

<ElevationDemo interactive={true} />
```

**Props:**
- `interactive?: boolean` - Enable hover effects (default: true)

---

### 4. RadiusDemo

Demonstrates different border radius options (rounded-sm, rounded-md, rounded-lg, etc.).

**Features:**
- Visual comparison of all radius options
- Hover to preview each radius
- Marks default radius (rounded-md)
- Usage recommendations for each option

**Usage:**
```tsx
import { RadiusDemo } from '@/components/design/primitives';

<RadiusDemo interactive={true} />
```

**Props:**
- `interactive?: boolean` - Enable hover effects (default: true)

---

### 5. MotionDemo

Demonstrates animation timing functions (instant, fast, normal, slow) with live playback.

**Features:**
- Animated bars showing all timing speeds simultaneously
- Play/pause controls
- Shows usage for each timing
- Easing function documentation
- Accessibility note about reduced motion

**Usage:**
```tsx
import { MotionDemo } from '@/components/design/primitives';

<MotionDemo showControls={true} />
```

**Props:**
- `showControls?: boolean` - Show play/pause button (default: true)

---

## Design System Reference

These components showcase:

### The 6 Color Tokens
1. **background** - Card surface (light: 0 0% 93%, dark: 0 0% 10%)
2. **foreground** - Content area inside cards (light: 0 0% 100%, dark: 0 0% 13%)
3. **font** - Text color (light: 0 0% 13%, dark: 0 0% 100%)
4. **primary** - Main CTA (216 55% 25%)
5. **secondary** - Supporting actions (219 14% 28%)
6. **tertiary** - Accent actions (105 22% 25%)

### The 4 Design Properties
1. **States** - hover (opacity-90, scale-[1.02]), active (opacity-80, scale-[0.98]), focus (ring-2), disabled (opacity-50)
2. **Elevation** - shadow-sm (cards), shadow-md (dropdowns), shadow-lg (buttons), shadow-xl (hover), shadow-2xl (modals)
3. **Radius** - sm (6px), md (8px - default), lg (12px), xl (16px), full (circular)
4. **Motion** - fast (150ms), normal (300ms - default), slow (500ms), easing (ease-in-out)

---

## Using in Pages

Import primitives in Astro pages with client directive:

```astro
---
// src/pages/design-system.astro
import { ColorSwatch, StateDemo, ElevationDemo, RadiusDemo, MotionDemo } from '@/components/design/primitives';
import Layout from '@/layouts/Layout.astro';
---

<Layout title="Design System Primitives">
  <h1>Color Tokens</h1>
  <ColorSwatch
    name="primary"
    value="216 55% 25%"
    description="Main CTA buttons"
    client:load
  />

  <h2>Button States</h2>
  <StateDemo variant="primary" client:load />

  <h2>Elevation Levels</h2>
  <ElevationDemo client:visible />

  <h2>Border Radius</h2>
  <RadiusDemo client:visible />

  <h2>Motion Timing</h2>
  <MotionDemo client:visible />
</Layout>
```

---

## Integration with Design Page

These primitives can be integrated into the main design page (`/web/src/pages/design.astro`) to provide interactive demonstrations of the design system.

**Example integration:**
```astro
---
import { ColorSwatch, StateDemo, ElevationDemo, RadiusDemo, MotionDemo } from '@/components/design/primitives';
---

<!-- Replace inline color demos with ColorSwatch components -->
<div class="grid gap-2">
  <ColorSwatch
    name="background"
    value="0 0% 93%"
    darkValue="0 0% 10%"
    description="Card surface · Sidebar"
    adaptive={true}
    client:load
  />
  <ColorSwatch
    name="primary"
    value="216 55% 25%"
    description="Main CTA · Buttons"
    client:load
  />
</div>

<!-- Replace inline state demos with StateDemo component -->
<StateDemo variant="primary" label="Buy Now" client:load />

<!-- Replace inline elevation demos with ElevationDemo component -->
<ElevationDemo client:visible />

<!-- Replace inline radius demos with RadiusDemo component -->
<RadiusDemo client:visible />

<!-- Replace inline motion demos with MotionDemo component -->
<MotionDemo client:visible />
```

---

## File Structure

```
/web/src/components/design/primitives/
├── ColorSwatch.tsx      # Color token display
├── StateDemo.tsx        # Button state showcase
├── ElevationDemo.tsx    # Shadow level showcase
├── RadiusDemo.tsx       # Border radius showcase
├── MotionDemo.tsx       # Animation timing showcase
├── index.ts             # Barrel export
└── README.md            # This file
```

---

## Related Documentation

- **Design System Plan:** `/one/events/design-system-100-cycle-implementation.md`
- **Design System Spec:** `/one/things/design-system.md`
- **Design Page:** `/web/src/pages/design.astro`
- **Global CSS:** `/web/src/styles/global.css`

---

## Next Steps (Cycle 5+)

These primitives will be used to:
1. Update the `/design` page with interactive components
2. Create design system gallery
3. Build component documentation
4. Showcase thing-level branding examples
5. Demonstrate accessibility compliance

**Status:** ✅ Cycle 4 Complete - Primitives created and documented
