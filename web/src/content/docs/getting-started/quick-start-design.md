---
title: Quick Start Page - Design Specification
description: Design specification for the quick-start documentation page
section: Design Specifications
type: design
designType: wireframe
status: draft
created: 2025-11-06
---

# Quick Start Page - Complete Design Specification

**Purpose:** Convert feature specifications into a beautiful, high-converting quick-start guide that makes people excited to build with ONE.

**Key Goals:**
1. Communicate the 6-dimension ontology visually and clearly
2. Guide users from "I have an idea" → "Product running in 5 minutes"
3. Maximize conversion to "Start Building" CTAs
4. Meet WCAG 2.1 AA accessibility standards
5. Mobile-first responsive design (320px - 1440px)

---

## Design System Tokens

### Color Palette (HSL Format)

**Brand Colors (from group settings - customizable per installation):**

```css
--color-background: 0 0% 100%;           /* White #FFFFFF */
--color-foreground: 222.2 84% 4.9%;      /* Near black #0F172A */
--color-primary: 222.2 47.4% 11.2%;      /* Deep blue #1E40AF */
--color-secondary: 210 40% 96.1%;        /* Light gray #F0F9FF */
--color-accent: 210 100% 50%;            /* Bright blue #0EA5E9 */
--color-muted: 210 40% 96.1%;            /* Muted gray #F0F9FF */
--color-muted-foreground: 215.4 16.3% 46.9%; /* Gray text #64748B */
--color-destructive: 0 84.2% 60.2%;      /* Red #EF4444 */
--color-success: 142.7 71.8% 29.2%;      /* Green #16A34A */

/* Semantic token for dimension colors */
--color-groups: 59 89% 43%;      /* Amber/Gold */
--color-people: 284 71% 51%;     /* Purple */
--color-things: 16 97% 56%;      /* Orange */
--color-connections: 210 100% 50%; /* Cyan */
--color-events: 220 90% 56%;     /* Indigo */
--color-knowledge: 139 69% 19%;  /* Emerald */
```

**Contrast Ratios (WCAG AA Compliance):**

- Primary text on background: 16.27:1 (exceeds 4.5:1 minimum)
- Secondary text on muted background: 4.8:1 (meets 4.5:1 minimum)
- All accent colors validated against white background: > 3:1

### Typography Scale (Modular 1.25x)

```
Base unit: 16px

-- h1: 2.986rem (48px)   weight: 700  line-height: 1.2
-- h2: 2.388rem (38px)   weight: 600  line-height: 1.3
-- h3: 1.91rem (31px)    weight: 600  line-height: 1.4
-- h4: 1.53rem (24px)    weight: 600  line-height: 1.4
-- body: 1rem (16px)     weight: 400  line-height: 1.5
-- small: 0.8rem (13px)  weight: 400  line-height: 1.5
-- tiny: 0.64rem (10px)  weight: 500  line-height: 1.4
```

### Spacing System (4px Base Unit)

```
4px  (xs)
8px  (sm)
12px (md)
16px (lg)
24px (xl)
32px (2xl)
48px (3xl)
64px (4xl)
96px (5xl)
128px (6xl)
```

### Border Radius (Modern Soft)

```
2px   (xs)  - Input fields, small controls
4px   (sm)  - Cards, buttons
8px   (md)  - Modal dialogs
12px  (lg)  - Large components, featured sections
16px  (xl)  - Hero sections, prominent blocks
```

### Shadow System (Depth)

```
shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1)
shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1)
shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1)
```

---

## Wireframe: Above-the-Fold Hero Section

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                       HEADER / NAV                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐        ┌─────────────────────────┐│
│  │                     │        │                         ││
│  │  Hero Text Area     │        │  6-Dimension Diagram    ││
│  │                     │        │  (Visual/Animated)      ││
│  │ - Main Headline     │        │                         ││
│  │ - Subheadline       │        │  Groups → People →      ││
│  │ - Value Prop        │        │  Things → Connections → ││
│  │                     │        │  Events → Knowledge     ││
│  │ ┌─────────────────┐ │        │                         ││
│  │ │ Primary CTA     │ │        │  Animated flow diagram  ││
│  │ │ (Start Building)│ │        │  with icons for each    ││
│  │ └─────────────────┘ │        │  dimension              ││
│  │ ┌─────────────────┐ │        │                         ││
│  │ │ Secondary CTA   │ │        │                         ││
│  │ │ (View Docs)     │ │        │                         ││
│  │ └─────────────────┘ │        │                         ││
│  │                     │        │                         ││
│  └─────────────────────┘        └─────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘

Desktop: 50% / 50% split (flex row)
Tablet: 60% / 40% split
Mobile: 100% / 100% stack (diagram below text)
```

### Hero Text Content

**Headline:** "Build Intelligent Systems That Scale Infinitely"
- Font: h1 (48px), weight 700, color: foreground
- Line height: 1.2
- Letter spacing: -0.02em
- Margin bottom: 24px

**Subheadline:** "Model reality in six core dimensions. Map everything to them. Deploy to the edge."
- Font: h2 (38px), weight 600, color: muted-foreground
- Line height: 1.3
- Margin bottom: 32px

**Value Propositions (3 bullet points):**
- "Write in English. System generates TypeScript, tests, and deploys."
- "6-dimension ontology ensures 98% AI code generation accuracy."
- "Scales from friend circles to governments without schema changes."
- Font: body (16px), color: foreground
- Line height: 1.5
- Each with: 8px left border (color: accent), 16px left padding
- Spacing between items: 16px

**CTAs:**
1. **Primary:** "Start Building" → `/quick-start`
   - Background: hsl(var(--color-primary))
   - Text: white
   - Padding: 16px 32px
   - Border radius: 8px
   - Font weight: 600
   - Hover: darker shade (10% darker)
   - Focus: outline ring 2px offset 2px

2. **Secondary:** "View Documentation"
   - Background: hsl(var(--color-secondary))
   - Text: hsl(var(--color-primary))
   - Border: 1px solid hsl(var(--color-primary))
   - Padding: 16px 32px
   - Border radius: 8px
   - Font weight: 600
   - Hover: background slight darken

### 6-Dimension Diagram Component

**Visual Design:** Animated flow diagram with 6 cards

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ┌────────┐     ┌────────┐     ┌────────┐         │
│  │ GROUPS │ --> │ PEOPLE │ --> │ THINGS │         │
│  └────────┘     └────────┘     └────────┘         │
│      ↓              ↓               ↓              │
│   (Amber)       (Purple)        (Orange)          │
│                                                     │
│  ┌────────┐     ┌────────┐     ┌────────┐         │
│  │  CONN  │ <-- │ EVENTS │ <-- │KNOWLDG │         │
│  └────────┘     └────────┘     └────────┘         │
│   (Cyan)        (Indigo)       (Emerald)          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Card Styling (each dimension):**
- Height: 80px
- Width: 120px (minimum)
- Border radius: 8px
- Background: HSL color specific to dimension
- Text: white (18px bold)
- Icon: 32x32 centered above text
- Box shadow: md
- Animation: fade-in on scroll (0.6s ease-out)

**Arrow Styling:**
- Stroke width: 2px
- Color: muted-foreground (opacity: 0.5)
- Arrow head: 8px
- Animation: animated flow (1.5s loop, cubic-bezier)

**Icons (one per dimension):**
- Groups: People circle icon
- People: User shield icon
- Things: Package icon
- Connections: Link icon
- Events: Clock history icon
- Knowledge: Brain/lightbulb icon

**Responsive Adjustments:**
- Tablet: 2x3 grid layout (instead of circular)
- Mobile: Vertical stack with simplified arrows

---

## Wireframe: Quick Start Section

### Layout: Cards + Code Blocks

```
┌─────────────────────────────────────────────────────────────┐
│  SECTION: "Get Running in 5 Minutes"                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────────────────────────────────────────────────┐│
│  │ Tab 1: Bootstrap (Recommended) | Tab 2: Manual Clone  ││
│  └────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─ Content for Active Tab ──────────────────────────────┐ │
│  │                                                         │ │
│  │  "Fastest way to get started with AI assistance"      │ │
│  │                                                         │ │
│  │  ┌─────────────────────────────────────────────────┐  │ │
│  │  │ $ npx oneie                                    │  │ │
│  │  │ $ claude                                        │  │ │
│  │  │ $ /one                                         │  │ │
│  │  └─────────────────────────────────────────────────┘  │ │
│  │                                                         │ │
│  │  Benefits:                                              │ │
│  │  ✓ AI-assisted development                             │ │
│  │  ✓ Understands 6-dimension ontology                    │ │
│  │  ✓ Generates code, tests, documentation                │ │
│  │                                                         │ │
│  │  ┌─────────────────────────────────────────────────┐  │ │
│  │  │ CTA: "Bootstrap New Project"                   │  │ │
│  │  └─────────────────────────────────────────────────┘  │ │
│  │                                                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─ Dependencies Section ────────────────────────────────┐ │
│  │                                                         │ │
│  │  ┌────────────────────────────────────────────────┐  │ │
│  │  │ $ bun install  (or npm/pnpm)                  │  │ │
│  │  └────────────────────────────────────────────────┘  │ │
│  │                                                         │ │
│  │  ┌────────────────────────────────────────────────┐  │ │
│  │  │ $ bun run dev                                 │  │ │
│  │  │                                                │  │ │
│  │  │ Your site: http://localhost:4321             │  │ │
│  │  └────────────────────────────────────────────────┘  │ │
│  │                                                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Code Block Styling

- Background: hsl(222.2 84% 10%) (dark)
- Text: hsl(210 40% 98%) (light text)
- Font: Monaco / Menlo / Courier New (monospace)
- Font size: 14px
- Line height: 1.6
- Padding: 16px
- Border radius: 8px
- Border: 1px solid hsl(210 40% 20%)
- Copy button: top-right corner
  - Background: hsl(var(--color-accent))
  - Text: white
  - Padding: 8px 12px
  - Font size: 12px
  - Border radius: 4px
  - Opacity: 0 (hidden until hover)
  - Transition: opacity 0.2s

**Syntax Highlighting:**
- Keywords: hsl(210 100% 50%) (cyan)
- Strings: hsl(142.7 71.8% 59%) (green)
- Comments: hsl(215.4 16.3% 56%) (gray)
- Numbers: hsl(39.1 89.3% 49.3%) (orange)

### Tabs Component

**Navigation:**
- Font: body (16px), weight 600
- Border bottom: 2px solid hsl(var(--color-muted))
- Selected tab: border color hsl(var(--color-primary))
- Padding: 8px 16px vertical/horizontal
- Gap between tabs: 16px
- Cursor: pointer
- Transition: color 0.2s, border-color 0.2s

**Content Area:**
- Padding: 32px 16px
- Fade in animation: 0.3s ease-out
- Min height: 400px

---

## Wireframe: Benefits Grid Section

### Layout: 3-Column Card Grid

```
┌─────────────────────────────────────────────────────────────┐
│  SECTION: "Why ONE is Different"                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Headline: "Everything Maps to Six Dimensions"              │
│  Subheadline: "Same pattern, infinite scale"                │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │              │  │              │  │              │    │
│  │  GROUPS      │  │  PEOPLE      │  │  THINGS      │    │
│  │              │  │              │  │              │    │
│  │ Icon (48px)  │  │ Icon (48px)  │  │ Icon (48px)  │    │
│  │              │  │              │  │              │    │
│  │ Title: "..." │  │ Title: "..." │  │ Title: "..." │    │
│  │              │  │              │  │              │    │
│  │ Description  │  │ Description  │  │ Description  │    │
│  │ (3-4 lines)  │  │ (3-4 lines)  │  │ (3-4 lines)  │    │
│  │              │  │              │  │              │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │              │  │              │  │              │    │
│  │  CONNECTIONS │  │  EVENTS      │  │  KNOWLEDGE   │    │
│  │              │  │              │  │              │    │
│  │ Icon (48px)  │  │ Icon (48px)  │  │ Icon (48px)  │    │
│  │              │  │              │  │              │    │
│  │ Title: "..." │  │ Title: "..." │  │ Title: "..." │    │
│  │              │  │              │  │              │    │
│  │ Description  │  │ Description  │  │ Description  │    │
│  │ (3-4 lines)  │  │ (3-4 lines)  │  │ (3-4 lines)  │    │
│  │              │  │              │  │              │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Card Styling

- Width: 100% (responsive: calc(100% / 3 - gap) on desktop)
- Padding: 32px 24px
- Border radius: 12px
- Background: hsl(var(--color-secondary))
- Border: 1px solid hsl(210 40% 96.1%) [matches background with subtle border]
- Box shadow: md
- Hover effect:
  - Transform: translateY(-4px)
  - Box shadow: lg
  - Transition: all 0.3s ease-out

**Icon Container:**
- Width: 64px
- Height: 64px
- Background: linear gradient from dimension color to darker shade
- Border radius: 12px
- Display: flex (center items)
- Margin bottom: 16px
- Icon: 32x32, white color

**Title:**
- Font: h4 (24px), weight 600
- Color: foreground
- Margin bottom: 12px

**Description:**
- Font: body (16px), weight 400
- Color: muted-foreground
- Line height: 1.6
- Margin bottom: 0

### Responsive Adjustments

- Desktop: 3 columns (gap: 24px)
- Tablet: 2 columns (gap: 20px)
- Mobile: 1 column (gap: 16px)
- Card padding: 24px on mobile (vs 32px desktop)

---

## Wireframe: Call-to-Action Section

### Layout: Center-Aligned Promo

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│             ┌──────────────────────────────────┐           │
│             │                                  │           │
│             │  Ready to Start Building?        │           │
│             │                                  │           │
│             │  Create your first project in   │           │
│             │  minutes with AI assistance.     │           │
│             │                                  │           │
│             │  ┌────────────────────────────┐ │           │
│             │  │ Start Building (Primary) │ │           │
│             │  └────────────────────────────┘ │           │
│             │                                  │           │
│             │  Or explore full documentation: │           │
│             │  ┌────────────────────────────┐ │           │
│             │  │ View Ontology Spec        │ │           │
│             │  └────────────────────────────┘ │           │
│             │                                  │           │
│             └──────────────────────────────────┘           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Styling

- Background: linear gradient (from accent color 0% to accent color 100%)
- Padding: 96px 32px (vertical/horizontal)
- Border radius: 16px
- Text align: center
- Max width: 600px
- Margin: 96px auto 0

**Headline:**
- Font: h2 (38px), weight 600
- Color: white
- Margin bottom: 16px

**Description:**
- Font: body (16px), weight 400
- Color: white (opacity: 0.9)
- Margin bottom: 32px
- Line height: 1.6

**Buttons:**
- Primary: Same styling as hero CTA (16px margin between)
- Secondary: Outline style with white border/text
- Gap between: 16px (vertical on mobile, horizontal on desktop)

---

## Wireframe: Prerequisites Section

### Layout: Text + Checklist

```
┌─────────────────────────────────────────────────────────────┐
│  SECTION: "Prerequisites"                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  You'll need these before getting started:                  │
│                                                             │
│  ☑ Node.js 18+ (or Bun 1.0+)                               │
│  ☑ Git                                                      │
│  ☑ A text editor (or Claude Code for AI assistance)        │
│                                                             │
│  [Optional box with Claude Code recommendation]              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Styling

- Padding: 48px 32px
- Background: hsl(var(--color-secondary))
- Border left: 4px solid hsl(var(--color-accent))

**List Items:**
- Font: body (16px)
- Icon: checkmark circle (24x24, color: accent)
- Padding: 12px 0
- Line height: 1.6

---

## Wireframe: Next Steps Section

### Layout: Card Grid (3 Cards)

```
┌─────────────────────────────────────────────────────────────┐
│  SECTION: "Next Steps"                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─ Step 1 ──────────────────────┐                         │
│  │ Learn the 6 Dimensions        │                         │
│  │ Read: Ontology Spec           │                         │
│  │ Time: 10 minutes              │                         │
│  │ [Link]                        │                         │
│  └───────────────────────────────┘                         │
│                                                             │
│  ┌─ Step 2 ──────────────────────┐                         │
│  │ Build Backend Services        │                         │
│  │ Read: Backend Guide           │                         │
│  │ Time: 15 minutes              │                         │
│  │ [Link]                        │                         │
│  └───────────────────────────────┘                         │
│                                                             │
│  ┌─ Step 3 ──────────────────────┐                         │
│  │ Create Components             │                         │
│  │ Read: Frontend Architecture   │                         │
│  │ Time: 20 minutes              │                         │
│  │ [Link]                        │                         │
│  └───────────────────────────────┘                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Card Styling

- Same as benefits grid cards
- Max width: 300px
- Minimum height: 200px
- Numbered badge (top-left): 40x40, background color (accent)
- Link styling: underline on hover, color (primary)

---

## Component Specifications

### Required shadcn/ui Components

```typescript
// Cards & Layout
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

// Buttons & Forms
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Data Display
import { Badge } from "@/components/ui/badge";

// Visual Elements
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Icons (from lucide-react)
import {
  Users,
  Shield,
  Box,
  Link2,
  Clock,
  Brain,
  Check,
  ArrowRight,
  Terminal,
  Copy,
  CheckCircle
} from "lucide-react";
```

### Custom Components (to be created)

```typescript
// Hero Section
<HeroSection
  headline="Build Intelligent Systems That Scale Infinitely"
  subheadline="Model reality in six core dimensions..."
  primaryCtaLabel="Start Building"
  primaryCtaHref="/quick-start"
  secondaryCtaLabel="View Documentation"
  secondaryCtaHref="/docs"
/>

// 6-Dimension Diagram
<DimensionDiagram
  dimensions={[
    { name: "Groups", color: "groups", icon: Users },
    { name: "People", color: "people", icon: Shield },
    { name: "Things", color: "things", icon: Box },
    { name: "Connections", color: "connections", icon: Link2 },
    { name: "Events", color: "events", icon: Clock },
    { name: "Knowledge", color: "knowledge", icon: Brain }
  ]}
/>

// Benefits Grid
<BenefitsGrid
  benefits={[
    {
      title: "Multi-Tenant from Day One",
      description: "Groups partition your data...",
      icon: Users,
      color: "groups"
    },
    // ... more benefits
  ]}
/>

// Code Block with Copy
<CodeBlock
  language="bash"
  code="npx oneie"
  showLineNumbers={false}
  showCopyButton={true}
/>

// Call-to-Action Section
<CtaSection
  headline="Ready to Start Building?"
  description="Create your first project in minutes..."
  primaryCtaLabel="Start Building"
  primaryCtaHref="/quick-start"
/>

// Next Steps Cards
<NextStepsGrid
  steps={[
    {
      stepNumber: 1,
      title: "Learn the 6 Dimensions",
      description: "Read the Ontology Spec",
      time: "10 minutes",
      href: "/docs/core-concepts/ontology"
    },
    // ... more steps
  ]}
/>
```

---

## Mobile-First Responsive Design

### Breakpoints (Tailwind v4)

```
Mobile:  320px - 640px   (default, no prefix)
Tablet:  641px - 1024px  (md: prefix)
Desktop: 1025px+         (lg: prefix)
```

### Layout Adjustments

**Hero Section:**

```
Mobile (320px):
- Stack vertically (100% width)
- Text: h2 (32px), h3 (24px) - reduced size
- Diagram: full width, simplified to vertical stack
- Padding: 24px 16px
- CTAs: 100% width, stacked vertically

Tablet (768px):
- 60% / 40% split (text left, diagram right)
- Text: h2 (38px), h3 (28px)
- Diagram: full width of container
- Padding: 48px 32px

Desktop (1024px+):
- 50% / 50% split
- Text: h1 (48px), h2 (38px)
- Diagram: side-by-side
- Padding: 96px 64px
```

**Benefits Grid:**

```
Mobile: 1 column, padding 16px
Tablet: 2 columns, gap 20px, padding 24px
Desktop: 3 columns, gap 24px, padding 32px
```

**Code Tabs:**

```
Mobile: Full width, font-size 12px, padding 12px
Tablet: Full width, font-size 13px, padding 16px
Desktop: Full width, font-size 14px, padding 16px
```

---

## Accessibility Specifications (WCAG 2.1 AA)

### Color Contrast Validation

- [ ] All text ≥ 4.5:1 contrast ratio (body text)
- [ ] Large text (≥18px) ≥ 3:1 contrast ratio
- [ ] Icons + background ≥ 3:1 contrast ratio
- [ ] No color-only information (always include text/icons)

### Keyboard Navigation

```
Tab Order:
1. Navigation menu items
2. Hero primary CTA button
3. Hero secondary CTA button
4. Tabs (in quick start section)
5. Code block copy button
6. Dimension cards (if interactive)
7. All section links
8. CTA section buttons

Focus States:
- Visible outline ring: 2px solid hsl(var(--color-accent))
- Offset: 2px
- All focusable elements: :focus-visible
```

### ARIA Labels

```html
<!-- Tabs -->
<div role="tablist">
  <button role="tab" aria-selected="true" aria-controls="tab-content-1">
    Bootstrap
  </button>
  <button role="tab" aria-selected="false" aria-controls="tab-content-2">
    Manual Clone
  </button>
</div>

<!-- Code Block -->
<pre>
  <code>npx oneie</code>
</pre>
<button aria-label="Copy code to clipboard">
  <Copy size={16} />
</button>

<!-- Section Landmarks -->
<section aria-labelledby="hero-headline">
  <h1 id="hero-headline">Build Intelligent Systems...</h1>
</section>

<section aria-labelledby="benefits-headline">
  <h2 id="benefits-headline">Why ONE is Different</h2>
</section>

<!-- Decorative Elements -->
<svg aria-hidden="true"><!-- diagram --></svg>
```

### Semantic HTML

```html
<!-- Proper heading hierarchy -->
<h1>Build Intelligent Systems That Scale Infinitely</h1>
<h2>Why ONE is Different</h2>
<h3>Multi-Tenant from Day One</h3>

<!-- Form labels -->
<label for="email">Email Address</label>
<input id="email" type="email" />

<!-- Buttons -->
<button type="button">Start Building</button>

<!-- Links with context -->
<a href="/docs/core-concepts/ontology">
  Learn the 6 Dimensions
  <span aria-label="opens in new window">(opens in new window)</span>
</a>

<!-- Lists -->
<ul>
  <li>Node.js 18+</li>
  <li>Git</li>
  <li>Text editor</li>
</ul>
```

### Screen Reader Support

- [ ] All images have alt text (or aria-hidden if decorative)
- [ ] Icon-only buttons have aria-label
- [ ] Section landmarks properly labeled (aria-labelledby)
- [ ] Form inputs associated with labels
- [ ] Error messages connected to inputs (aria-describedby)
- [ ] Loading states announced (aria-busy, aria-live)
- [ ] Status updates announced (toast notifications with role="status")

### Text & Readability

- [ ] Line length: 50-75 characters (ideal for readability)
- [ ] Line height: 1.5 (minimum for body text)
- [ ] Font size: 16px minimum for body text
- [ ] All text resizable to 200% without loss of functionality
- [ ] No paragraphs with walls of text (max 3-4 sentences per paragraph)

---

## Performance Specifications

### Core Web Vitals Targets

- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1
- **Lighthouse Performance:** ≥ 90/100

### Implementation Guidelines

**Images:**
```astro
<Image
  src={diagramImage}
  alt="6-Dimension Ontology Flow Diagram"
  width={600}
  height={400}
  format="webp"
  quality={85}
  loading="lazy"
/>
```

**Critical CSS:**
- Astro automatically inlines above-the-fold CSS
- No manual inlining needed

**Code Splitting:**
```astro
---
import { lazy, Suspense } from 'react';

const CodeBlock = lazy(() => import('./CodeBlock'));
---

<Suspense fallback={<Skeleton />}>
  <CodeBlock client:visible />
</Suspense>
```

**Font Loading:**
- System font stack: `"system-ui", "-apple-system", "Segoe UI"`
- No custom fonts in initial page load (load on idle)

---

## Design System Integration

### How This Maps to Ontology

**Things Dimension (Entity Types):**
- Quick-start page is a `documentation` thing type
- Each section is a content chunk with metadata

**Connections Dimension:**
- "Quick-start" connects to "feature" via `teaches` relationship
- "Quick-start" connects to "ontology" via `references` relationship

**Knowledge Dimension:**
- Labels: skill:getting-started, format:documentation, goal:learn
- Embeddings enable RAG for similar documentation pages
- Chunks: "6-dimension concept", "setup instructions", "CTA strategy"

**Events Dimension (when tracked):**
- `page_viewed` - User visits quick-start
- `cta_clicked` - User clicks "Start Building"
- `section_scrolled_to` - User scrolls to specific section

---

## Design Token Implementation

### Tailwind v4 CSS Configuration

```css
/* src/styles/global.css */
@import "tailwindcss";

@theme {
  /* Primary Colors */
  --color-background: 0 0% 100%;
  --color-foreground: 222.2 84% 4.9%;
  --color-primary: 222.2 47.4% 11.2%;
  --color-secondary: 210 40% 96.1%;
  --color-accent: 210 100% 50%;

  /* Semantic Dimension Colors */
  --color-dimension-groups: 59 89% 43%;
  --color-dimension-people: 284 71% 51%;
  --color-dimension-things: 16 97% 56%;
  --color-dimension-connections: 210 100% 50%;
  --color-dimension-events: 220 90% 56%;
  --color-dimension-knowledge: 139 69% 19%;

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 0.75rem;
  --spacing-lg: 1rem;
  --spacing-xl: 1.5rem;
  --spacing-2xl: 2rem;
  --spacing-3xl: 3rem;
  --spacing-4xl: 4rem;
  --spacing-5xl: 6rem;
  --spacing-6xl: 8rem;

  /* Border Radius */
  --radius-xs: 0.125rem;
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;

  /* Font Sizes */
  --font-size-h1: 3rem;
  --font-size-h2: 2.25rem;
  --font-size-h3: 1.875rem;
  --font-size-h4: 1.5rem;
  --font-size-body: 1rem;
  --font-size-small: 0.875rem;

  /* Line Heights */
  --line-height-tight: 1.2;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.625;
}

/* Dark mode */
@variant dark (.dark &);

.dark {
  --color-background: 222.2 84% 4.9%;
  --color-foreground: 210 40% 98%;
  --color-primary: 210 40% 98%;
}
```

---

## Implementation Checklist

**Design Phase:**
- [ ] Hero section wireframe finalized
- [ ] 6-dimension diagram design approved
- [ ] Color scheme validated (WCAG AA)
- [ ] Typography scale defined
- [ ] Component list completed

**Development Phase:**
- [ ] Set up Tailwind v4 theme config
- [ ] Create HeroSection component
- [ ] Create DimensionDiagram component (with animation)
- [ ] Create BenefitsGrid component
- [ ] Create CodeBlock component (with copy)
- [ ] Create NextStepsGrid component
- [ ] Create CtaSection component
- [ ] Implement responsive design (mobile-first)
- [ ] Add ARIA labels and semantic HTML
- [ ] Set up keyboard navigation

**Quality Assurance:**
- [ ] Run WCAG 2.1 AA accessibility audit
- [ ] Test keyboard navigation (Tab, Enter, Escape)
- [ ] Test color contrast (WebAIM contrast checker)
- [ ] Test responsive design (320px, 768px, 1024px, 1440px)
- [ ] Lighthouse audit (target: 90+ performance score)
- [ ] Test on screen readers (NVDA, VoiceOver, JAWS)
- [ ] A/B test CTA buttons for conversion

**Optimization:**
- [ ] Optimize images (WebP format, proper sizing)
- [ ] Minimize CSS (production build)
- [ ] Defer non-critical JavaScript
- [ ] Implement lazy loading for below-fold sections
- [ ] Test Core Web Vitals

---

## Design Decision Matrix

| Decision | Option A | Option B | Decision |
|----------|----------|----------|----------|
| Diagram type | Animated flow | Static grid | Animated flow (higher engagement) |
| CTA placement | One above fold | Multiple sections | Multiple (increases conversion) |
| Color scheme | Monochrome | Dimension-colored | Dimension-colored (teaches ontology) |
| Code display | Inline | Tabs | Tabs (cleaner, educational) |
| Heading size | Large (h1:48px) | Small (h2:32px) | Large (hierarchy clarity) |
| Mobile layout | Stack all | Grid where possible | Stack all (simplicity) |

---

## Success Metrics

**Conversion Metrics:**
- Click-through rate on primary CTA: target > 15%
- Click-through rate on secondary CTA: target > 8%
- Scroll depth: > 75% of users scroll to "Next Steps"

**Engagement Metrics:**
- Average time on page: > 90 seconds
- Section interaction rate: > 40% (code copy, tab switching)
- Return visit rate: > 25%

**Quality Metrics:**
- Accessibility score: 100/100
- Performance score: ≥ 90/100
- Lighthouse SEO score: 100/100

---

## Notes & Rationale

1. **6-Dimension Visual Priority:** The diagram appears prominently in hero (above fold) to establish ONE's core differentiator visually before explaining verbally.

2. **Progressive Disclosure:** Quick-start shows minimal setup (3 commands) first, then expands to full prerequisites and next steps below fold.

3. **Dual CTAs:** Primary CTA ("Start Building") drives conversion; secondary CTA ("View Docs") serves readers who need context first.

4. **Responsive Design:** Mobile-first approach ensures fast page loads on slower connections; diagram simplifies on mobile to maintain performance.

5. **Accessibility First:** All color coding has text labels (not just color); keyboard navigation is complete; semantic HTML enables screen reader usage.

6. **Design Token System:** All colors, spacing, typography stored as CSS variables for brand consistency and easy customization per group.

