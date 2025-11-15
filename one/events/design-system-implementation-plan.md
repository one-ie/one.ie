# Design System Implementation Plan

**Version:** 1.0.0
**Category:** Event
**Dimension:** Events
**Status:** Active
**Created:** 2025-11-15
**Specialist:** @agent-designer, @agent-frontend, @agent-backend

---

## Overview

This plan implements the **6-token + 4 design properties** design system across the entire ONE Platform, built on shadcn/ui and integrated with the 6-dimension ontology.

**Goal:** Create a unified design system that flows through every component, supports thing-level branding, and maintains accessibility standards.

**Timeline:** 10 cycles (estimated 3-5 days total)

---

## 10-Cycle Implementation Plan

### 🎯 Cycle 1: Foundation - CSS Variables & Design Tokens

**Objective:** Establish the 6-token system as CSS variables in Tailwind CSS v4

**Tasks:**
1. Update `/web/src/styles/global.css` with new token structure:
   - Replace `--color-card` → `--color-background`
   - Replace `--color-popover` → `--color-foreground`
   - Add `--color-font` (unified text color)
   - Rename `--color-accent` → `--color-tertiary`
   - Keep `--color-primary` and `--color-secondary`
2. Add auto-generated variants:
   - `--color-primary-light`, `--color-primary-dark`
   - `--color-secondary-light`, `--color-secondary-dark`
   - `--color-tertiary-light`, `--color-tertiary-dark`
3. Add backward compatibility aliases for old tokens
4. Test light/dark mode switching

**Deliverables:**
- Updated `web/src/styles/global.css` with 6-token system
- All color variables properly scoped
- Dark mode working correctly

**Success Criteria:**
- No visual regressions
- All existing components still render
- DevTools show new CSS variables

---

### 🎨 Cycle 2: Design Properties - States, Elevation, Radius, Motion

**Objective:** Add the 4 design properties to the global CSS

**Tasks:**
1. **States:** Define in CSS utilities
   ```css
   .btn-hover { opacity: 0.9; transform: scale(1.02); }
   .btn-active { opacity: 0.8; transform: scale(0.98); }
   .btn-focus { ring: 2px; ring-color: var(--color-primary-dark); }
   ```
2. **Elevation:** Add shadow scale
   ```css
   --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
   --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
   --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
   --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
   ```
3. **Radius:** Update existing radius tokens
   ```css
   --radius-sm: 0.375rem; /* 6px */
   --radius-md: 0.5rem;   /* 8px - default */
   --radius-lg: 0.75rem;  /* 12px */
   --radius-xl: 1rem;     /* 16px */
   ```
4. **Motion:** Define animation durations
   ```css
   --duration-fast: 150ms;
   --duration-normal: 300ms;
   --duration-slow: 500ms;
   --ease: ease-in-out;
   ```

**Deliverables:**
- Complete design properties in `global.css`
- Tailwind utilities for states
- Shadow, radius, motion scales defined

**Success Criteria:**
- All 4 design properties available globally
- Components can reference them consistently
- Documentation updated

---

### 🔘 Cycle 3: Button Component - New Variants & States

**Objective:** Update Button component with primary/secondary/tertiary variants and comprehensive states

**Tasks:**
1. Update `/web/src/components/ui/button.tsx`:
   - Add `primary` variant: `bg-primary text-white hover:opacity-90 active:opacity-80`
   - Add `secondary` variant: `bg-secondary text-white hover:opacity-90`
   - Add `tertiary` variant: `bg-tertiary text-white hover:opacity-90`
   - Update `outline` variant: `border-font text-font hover:bg-font/10`
   - Update `ghost` variant: `text-font hover:bg-font/10`
   - Keep `link` variant: `text-primary hover:underline`
2. Add comprehensive state styling:
   - Hover: `hover:opacity-90 hover:scale-[1.02]`
   - Active: `active:opacity-80 active:scale-[0.98]`
   - Focus: `focus-visible:ring-2 focus-visible:ring-primary-dark`
   - Disabled: `disabled:opacity-50 disabled:cursor-not-allowed`
3. Update size scale:
   - `sm`: `h-8 px-3 text-xs`
   - `md`: `h-10 px-4 text-sm` (default)
   - `lg`: `h-12 px-6 text-base`
   - `xl`: `h-14 px-8 text-lg`
   - `icon`: `h-10 w-10`
4. Add transitions: `transition-all duration-fast ease-in-out`

**Deliverables:**
- Updated Button component with 6 variants
- All states properly implemented
- Size scale refined

**Success Criteria:**
- All button variants render correctly
- States work smoothly (hover/active/focus)
- Accessibility maintained (keyboard navigation)
- Visual polish (smooth animations)

---

### 🗂️ Cycle 4: Card Component - Frame + Content Pattern

**Objective:** Implement the "frame + content" card pattern with background/foreground

**Tasks:**
1. Update `/web/src/components/ui/card.tsx`:
   - Card wrapper: `bg-background p-1 shadow-sm rounded-md`
   - CardContent: `bg-foreground p-4 rounded-md text-font`
   - Remove old `bg-card` references
2. Update CardHeader, CardFooter to use `text-font`
3. Update CardDescription to use `text-font opacity-80`
4. Add card elevation variants:
   - Default: `shadow-sm`
   - Elevated: `shadow-md`
   - Floating: `shadow-lg`
   - Flat: `shadow-none`
5. Update all card spacing:
   - Outer padding: `p-1` (4px frame)
   - Inner padding: `p-4` (16px content)
   - Gap between cards: `gap-4`

**Deliverables:**
- Updated Card component with frame + content pattern
- All card sub-components using new tokens
- Elevation system integrated

**Success Criteria:**
- Cards have visible 4px background "frame"
- Content area properly elevated on foreground
- Text uses font color consistently
- Shadows work in light/dark mode

---

### 🎨 Cycle 5: Typography & Form Components

**Objective:** Update typography utilities and form components to use font token

**Tasks:**
1. **Typography Updates:**
   - Create text utilities: `.text-muted` (opacity-80), `.text-subtle` (opacity-60)
   - Ensure all headings use `text-font`
   - Update paragraph styles with `leading-relaxed`
2. **Form Component Updates:**
   - Input: `bg-foreground text-font border-font/20 focus:ring-primary-dark`
   - Textarea: Same as input
   - Select: Same as input
   - Checkbox: `text-primary bg-foreground border-font/20`
   - Label: `text-font font-medium`
3. **Component Files to Update:**
   - `/web/src/components/ui/input.tsx`
   - `/web/src/components/ui/textarea.tsx`
   - `/web/src/components/ui/select.tsx`
   - `/web/src/components/ui/checkbox.tsx`
   - `/web/src/components/ui/label.tsx`

**Deliverables:**
- All form components using new tokens
- Typography utilities created
- Consistent text hierarchy

**Success Criteria:**
- Forms readable in light/dark mode
- Proper focus states on all inputs
- Text hierarchy clear (opacity-based)
- WCAG AA compliance maintained

---

### 🗄️ Cycle 6: Thing Schema - Color Override System

**Objective:** Add optional color override field to Thing schema in Convex

**Tasks:**
1. Update `/backend/convex/schema.ts`:
   ```typescript
   things: defineTable({
     // ... existing fields
     colors: v.optional(v.object({
       background: v.string(),   // HSL format
       foreground: v.string(),
       font: v.string(),
       primary: v.string(),
       secondary: v.string(),
       tertiary: v.string()
     }))
   }).index("by_group", ["groupId"])
   ```
2. Add migration for existing things (colors field nullable)
3. Test schema update in Convex dashboard
4. Update TypeScript types

**Deliverables:**
- Updated Convex schema with colors field
- Migration completed
- TypeScript types generated

**Success Criteria:**
- Schema deployed without errors
- Existing things unaffected
- New things can have optional colors
- Types available in frontend

---

### 🎨 Cycle 7: Thing-Level Color Application (Frontend)

**Objective:** Create components that apply thing-level color overrides

**Tasks:**
1. Create `/web/src/components/ThingCard.tsx`:
   ```tsx
   export function ThingCard({ thing, children }: Props) {
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
         className="thing-card"
       >
         {children}
       </Card>
     )
   }
   ```
2. Create color provider hook:
   ```tsx
   export function useThingColors(thing?: Thing) {
     return thing?.colors || defaultColors
   }
   ```
3. Create default color constants:
   ```tsx
   export const defaultColors = {
     background: "0 0% 93%",
     foreground: "0 0% 100%",
     font: "0 0% 13%",
     primary: "216 55% 25%",
     secondary: "219 14% 28%",
     tertiary: "105 22% 25%"
   }
   ```

**Deliverables:**
- ThingCard component with color override support
- useThingColors hook
- Default color constants

**Success Criteria:**
- Things can display with custom colors
- Components inherit thing colors via CSS variables
- Fallback to platform defaults works
- No flash of unstyled content

---

### 🎨 Cycle 8: Color Extraction Utilities

**Objective:** Create utilities for extracting and validating colors

**Tasks:**
1. Create `/web/src/lib/color-utils.ts`:
   ```typescript
   // Convert HEX to HSL
   export function hexToHsl(hex: string): string

   // Validate WCAG contrast ratio
   export function checkContrast(fg: string, bg: string): number

   // Extract colors from CSS (manual)
   export function extractColorsFromCSS(css: string): ColorTokens

   // Generate light/dark variants
   export function generateVariants(color: string): {
     light: string
     dark: string
   }
   ```
2. Create `/web/src/lib/color-validator.ts`:
   ```typescript
   // Validate all 6 colors meet WCAG AA
   export function validateColorScheme(colors: ColorTokens): {
     valid: boolean
     errors: string[]
   }
   ```
3. Add color preset library:
   ```typescript
   export const colorPresets = {
     stripe: { ... },
     shopify: { ... },
     github: { ... }
   }
   ```

**Deliverables:**
- Color conversion utilities
- WCAG validation functions
- Color preset library

**Success Criteria:**
- Utilities work correctly
- Contrast validation accurate
- Presets match real brands
- Easy to use for designers

---

### 🔄 Cycle 9: Update All Existing Components

**Objective:** Migrate all 50+ shadcn components to use new 6-token system

**Tasks:**
1. **High Priority Components** (10 files):
   - Alert, Badge, Dialog, Dropdown Menu, Popover
   - Navigation Menu, Sheet, Tabs, Toast, Tooltip
2. **Medium Priority Components** (15 files):
   - Accordion, Avatar, Breadcrumb, Calendar, Chart
   - Collapsible, Command, Context Menu, Drawer, Hover Card
   - Pagination, Progress, Radio Group, Separator, Skeleton
3. **Low Priority Components** (25 files):
   - All remaining UI components
4. **Update Strategy:**
   - Replace `bg-card` → `bg-background` or `bg-foreground` (context-dependent)
   - Replace `text-card-foreground` → `text-font`
   - Replace `bg-popover` → `bg-foreground`
   - Replace `bg-accent` → `bg-tertiary`
   - Update all border colors to `border-font/20`
5. **Automated Search & Replace:**
   - Use VSCode find/replace across `/web/src/components/ui/`
   - Test each component after update

**Deliverables:**
- All 50+ components updated to new tokens
- No visual regressions
- Components tested in light/dark mode

**Success Criteria:**
- All components render correctly
- Color consistency across platform
- Dark mode works everywhere
- No hardcoded colors remain

---

### ✅ Cycle 10: Testing, Documentation & Deployment

**Objective:** Comprehensive testing, documentation updates, and deployment

**Tasks:**
1. **Testing:**
   - Create test page: `/web/src/pages/design-system-test.astro`
   - Test all button variants
   - Test card patterns
   - Test form components
   - Test thing-level color overrides
   - Test light/dark mode switching
   - Run accessibility audit (Lighthouse)
2. **Documentation:**
   - Update `/CLAUDE.md` with design system reference
   - Update `/web/CLAUDE.md` with component usage
   - Create migration guide: `/one/events/design-system-migration.md`
   - Update `/.claude/agents/agent-designer.md` with color extraction workflow
3. **Create Example Pages:**
   - `/web/src/pages/examples/default-theme.astro` (platform colors)
   - `/web/src/pages/examples/purple-theme.astro` (custom thing)
   - `/web/src/pages/examples/orange-theme.astro` (custom thing)
4. **Git Commit & Push:**
   - Commit all changes with message:
     ```
     Implement 6-token design system with thing-level overrides

     - Add 6 color tokens (background, foreground, font, primary, secondary, tertiary)
     - Add 4 design properties (states, elevation, radius, motion)
     - Update all 50+ shadcn components to new system
     - Add thing-level color override capability
     - Maintain backward compatibility with old tokens
     - WCAG AA/AAA compliant
     - Built on shadcn/ui + Tailwind CSS v4
     ```
   - Push to `claude/ontology-ui-design-system-012Qc6uoxpkNaq4btZyx3Z3i`

**Deliverables:**
- Complete test suite
- Updated documentation
- Example pages demonstrating system
- Git commit & push

**Success Criteria:**
- All tests pass
- Lighthouse accessibility score 95+
- Documentation complete and accurate
- Example pages look professional
- Code committed and pushed

---

## Timeline Estimate

**Conservative Estimate:**
- Cycles 1-2: 1 day (foundation)
- Cycles 3-5: 1.5 days (core components)
- Cycles 6-7: 1 day (backend + thing integration)
- Cycle 8: 0.5 day (utilities)
- Cycle 9: 1 day (migrate all components)
- Cycle 10: 1 day (testing + docs)
**Total: 5-6 days**

**Optimistic Estimate (with @agent-frontend, @agent-designer parallel work):**
- Cycles 1-2: 4 hours
- Cycles 3-5: 6 hours
- Cycles 6-7: 4 hours
- Cycle 8: 2 hours
- Cycle 9: 4 hours
- Cycle 10: 4 hours
**Total: 24 hours (3 days)**

---

## Parallel Execution Opportunities

**Cycles that can run in parallel:**

1. **Cycles 3-4-5** can partially overlap:
   - @agent-frontend: Button component
   - @agent-frontend: Card component
   - @agent-frontend: Form components

2. **Cycles 6-7** backend/frontend split:
   - @agent-backend: Update Convex schema (Cycle 6)
   - @agent-frontend: Prepare ThingCard component (Cycle 7)

3. **Cycle 8-9** can overlap:
   - @agent-designer: Color utilities (Cycle 8)
   - @agent-frontend: Migrate components (Cycle 9)

**Recommendation:** Execute cycles sequentially for clarity, but use parallel agents for different file modifications within each cycle.

---

## Risk Mitigation

**Potential Risks:**

1. **Visual Regressions:**
   - Mitigation: Screenshot testing before/after
   - Mitigation: Maintain old token aliases during transition

2. **Accessibility Issues:**
   - Mitigation: WCAG validation at each cycle
   - Mitigation: Lighthouse audits in Cycle 10

3. **Breaking Changes:**
   - Mitigation: Backward compatibility for 1 version
   - Mitigation: Migration guide for external users

4. **Performance:**
   - Mitigation: CSS variables are performant
   - Mitigation: No runtime overhead for thing colors

---

## Success Metrics

**Quantitative:**
- 6 color tokens (down from 10+)
- 4 design properties documented
- 50+ components updated
- 100% WCAG AA compliance
- 0 visual regressions
- Lighthouse accessibility score ≥ 95

**Qualitative:**
- Design system feels cohesive
- Components look modern and polished
- Thing-level branding works seamlessly
- Developer experience improved (simpler naming)
- Documentation clear and comprehensive

---

## Post-Implementation

**After Cycle 10:**

1. **Monitor for Issues:**
   - Watch for bug reports
   - Check community feedback
   - Monitor accessibility scores

2. **Iterate on Design:**
   - Gather designer feedback
   - Refine color presets
   - Add more example pages

3. **Extend System:**
   - Add color extraction CLI tool
   - Create Figma plugin for token export
   - Build visual theme editor

4. **Deprecate Old Tokens:**
   - Version 2.0.0: Remove backward compatibility
   - Full migration to 6-token system

---

## Related Documentation

- **Design System Spec:** `/one/knowledge/design-system.md`
- **Ontology:** `/one/knowledge/ontology.md`
- **Agent Designer:** `/.claude/agents/agent-designer.md`
- **Frontend Patterns:** `/one/knowledge/patterns/frontend/`
- **CLAUDE.md:** `/CLAUDE.md`, `/web/CLAUDE.md`

---

**Ready to implement. Each cycle builds on the previous, creating a complete, production-ready design system integrated with the 6-dimension ontology.**
