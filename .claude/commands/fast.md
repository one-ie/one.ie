# /fast - Rapid Feature Building & Modification

**Purpose:** Build or modify features at maximum speed without planning cycles. Zero ceremony, pure execution.

---

## Core Philosophy

**Sometimes you just need it done. Now.**

The `/fast` command is for when:
- ✅ You know exactly what you want
- ✅ Feature is small/straightforward (< 5 files)
- ✅ No planning needed, just execution
- ✅ Speed > process

**No cycles. No planning. No bureaucracy. Just build.**

---

## Usage

```bash
/fast [feature-description]

# Examples:
/fast Add dark mode toggle to header
/fast Fix broken cart icon on mobile
/fast Create pricing page with 3 tiers
/fast Add email signup form to footer
/fast Change primary color to blue
```

**What happens:**
1. Parse feature description
2. Identify files to create/modify
3. Execute immediately (no plan, no approval)
4. Deploy if applicable
5. Done.

**Time:** 30 seconds to 3 minutes (average: 90 seconds)

---

## When to Use /fast vs /plan

### Use /fast When:
- Small, self-contained changes (< 5 files)
- Clear requirements (no ambiguity)
- Existing patterns to follow
- Quick fixes or tweaks
- Cosmetic changes (colors, text, styling)

### Use /plan When:
- Complex features (> 5 files)
- Backend schema changes
- Multi-step integrations
- Unclear requirements
- Need to coordinate multiple specialists

---

## Fast Execution Modes

### Mode 1: Create New Feature (3-5 minutes)

```bash
/fast Create pricing page with 3 tiers
```

**Execution:**
```
→ Identify: Need Astro page + pricing component
→ Create: /web/src/pages/pricing.astro
→ Create: /web/src/components/Pricing.tsx
→ Style: Use existing design tokens
→ Test: Visual check (no formal testing)
→ Deploy: Push to staging
✅ Done in 3 minutes
```

### Mode 2: Modify Existing Feature (1-2 minutes)

```bash
/fast Change primary color from purple to blue
```

**Execution:**
```
→ Identify: Update /web/src/styles/global.css
→ Find: --color-primary: 147 51 234 (purple)
→ Replace: --color-primary: 59 130 246 (blue)
→ Verify: Check contrast ratios (WCAG)
✅ Done in 90 seconds
```

### Mode 3: Fix Bug (30 seconds - 2 minutes)

```bash
/fast Fix cart icon alignment on mobile
```

**Execution:**
```
→ Identify: /web/src/components/Header.tsx
→ Find: Cart icon CSS
→ Fix: Add flex items-center
→ Test: Mobile viewport check
✅ Done in 45 seconds
```

### Mode 4: Quick Integration (2-4 minutes)

```bash
/fast Add Google Analytics tracking
```

**Execution:**
```
→ Identify: Layout component
→ Add: Analytics script tag
→ Configure: GA_MEASUREMENT_ID env var
→ Verify: Test in browser console
✅ Done in 2 minutes
```

---

## Fast Build Patterns

### Pattern 1: Single Component

```bash
/fast Create hero section with CTA button
```

**Output:**
```typescript
// /web/src/components/Hero.tsx
export function Hero() {
  return (
    <section className="bg-gradient-to-r from-purple-600 to-blue-600">
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-5xl font-bold text-white">Your Headline</h1>
        <p className="text-xl text-white/80 mt-4">Your subheadline</p>
        <button className="mt-8 px-8 py-3 bg-white text-purple-600 rounded-lg">
          Get Started
        </button>
      </div>
    </section>
  );
}
```

**Time:** 60 seconds

### Pattern 2: Single Page

```bash
/fast Create about page with team section
```

**Output:**
```astro
---
// /web/src/pages/about.astro
import Layout from '@/layouts/Layout.astro';
import TeamGrid from '@/components/TeamGrid.tsx';

const team = [
  { name: 'John Doe', role: 'CEO', image: '/team/john.jpg' },
  { name: 'Jane Smith', role: 'CTO', image: '/team/jane.jpg' },
];
---

<Layout title="About Us">
  <section class="container mx-auto px-4 py-20">
    <h1 class="text-4xl font-bold">About Our Company</h1>
    <p class="text-lg mt-4">We're building the future...</p>
    <TeamGrid team={team} client:load />
  </section>
</Layout>
```

**Time:** 2 minutes

### Pattern 3: Style Update

```bash
/fast Update button styles to be more rounded
```

**Execution:**
```css
/* /web/src/styles/global.css */

/* Before: */
.btn {
  @apply px-4 py-2 rounded-md;
}

/* After: */
.btn {
  @apply px-4 py-2 rounded-full;
}
```

**Time:** 30 seconds

### Pattern 4: Config Change

```bash
/fast Add contact@example.com to footer
```

**Execution:**
```astro
// /web/src/components/Footer.astro

// Before:
<footer>
  <p>&copy; 2024 Company</p>
</footer>

// After:
<footer>
  <p>&copy; 2024 Company</p>
  <a href="mailto:contact@example.com">contact@example.com</a>
</footer>
```

**Time:** 45 seconds

---

## Intelligent Feature Detection

The `/fast` command automatically detects:

### Frontend-Only Features
```bash
/fast Add pricing page
→ Creates Astro page + React components
→ No backend needed
→ Time: 3 minutes
```

### Backend Features
```bash
/fast Add user profile page with bio
→ Detects: Need to store user data
→ Creates: Convex mutation + query
→ Creates: Frontend page
→ Time: 5 minutes
```

### Integration Features
```bash
/fast Add Stripe payment button
→ Detects: Third-party integration
→ Installs: @stripe/stripe-js
→ Creates: Payment component
→ Time: 4 minutes
```

---

## Speed Optimizations

### 1. Use Existing Patterns
```bash
/fast Create new blog post page

→ Searches: /web/src/pages/blog/
→ Finds: Existing post structure
→ Replicates: Same pattern, new content
→ Time: 60 seconds (vs 5 minutes from scratch)
```

### 2. Component Reuse
```bash
/fast Add testimonials to home page

→ Checks: Do testimonials component exist?
→ Found: /web/src/components/Testimonials.tsx
→ Uses: Import and place on home page
→ Time: 30 seconds (vs 4 minutes new component)
```

### 3. Template Matching
```bash
/fast Create landing page

→ Matches: Similar to existing pages
→ Template: Hero + Features + CTA + Footer
→ Time: 3 minutes (vs 10 minutes custom)
```

---

## Fast Command Variants

```bash
# Create new
/fast create [feature]
/fast add [feature]
/fast new [feature]

# Modify existing
/fast update [feature]
/fast change [feature]
/fast modify [feature]

# Fix bugs
/fast fix [bug-description]
/fast repair [issue]

# Delete
/fast remove [feature]
/fast delete [feature]
```

---

## Example Scenarios

### Scenario 1: Launch Day Tweaks

```bash
# 5 minutes before launch, need quick changes:

/fast Change hero headline to "Build Faster"
→ 30 seconds

/fast Fix mobile menu not closing
→ 60 seconds

/fast Add live chat widget
→ 2 minutes

/fast Update pricing from $29 to $19
→ 30 seconds

Total: 4 minutes, all changes live
```

### Scenario 2: Client Feedback

```bash
# Client just called with urgent requests:

/fast Add testimonials section to home
→ 3 minutes

/fast Change CTA button color to green
→ 30 seconds

/fast Create case studies page
→ 4 minutes

/fast Fix broken contact form
→ 2 minutes

Total: 9.5 minutes, client happy
```

### Scenario 3: New Feature Request

```bash
# Product team wants quick experiment:

/fast Add email signup popup
→ 3 minutes

/fast Create simple analytics dashboard
→ 5 minutes

/fast Add export to CSV button
→ 2 minutes

Total: 10 minutes, experiment live
```

---

## Guardrails & Safety

Even though `/fast` is rapid, it still:

✅ **Validates against ontology** - Ensures features map to 6 dimensions
✅ **Checks existing code** - Searches for patterns to reuse
✅ **Type checks** - Runs `bunx astro check` before deploy
✅ **Maintains consistency** - Uses existing design tokens
✅ **Git commits** - Auto-commits with descriptive messages

**What /fast does NOT do:**
❌ Formal testing (unless requested)
❌ Documentation (code is self-documenting)
❌ Design reviews (trust the patterns)
❌ Planning cycles (immediate execution)

---

## Integration with Other Commands

### /fast → /plan
```bash
# Start with fast, scale to plan:
/fast Create simple blog
→ Ships in 3 minutes

# Later, when you need more:
/plan Add comments, tags, search to blog
→ Generates 20-cycle plan for enhancements
```

### /fast + /deploy
```bash
/fast [feature]
→ Builds feature

/deploy
→ Pushes to production immediately
```

### /fast + /push
```bash
/fast [feature]
→ Creates files, makes changes

/push "Quick feature: [description]"
→ Commits and pushes to repo
```

---

## Performance Metrics

**Average execution times:**
- Simple change (color, text): 30-60 seconds
- New component: 1-2 minutes
- New page: 2-4 minutes
- Integration: 3-5 minutes
- Bug fix: 30 seconds - 2 minutes

**Comparison to traditional workflow:**
- `/fast`: 30 seconds - 5 minutes
- Traditional: 30 minutes - 2 hours
- **Speed multiplier: 6-24x faster**

---

## Advanced Usage

### Batch Operations

```bash
/fast Batch: Add dark mode, fix mobile nav, create FAQ page
→ Executes all three in sequence
→ Time: 8 minutes total
```

### Conditional Changes

```bash
/fast If pricing page exists, update prices; else create page
→ Checks for existence
→ Takes appropriate action
```

### Pattern-Based Creation

```bash
/fast Create 5 blog posts using template
→ Replicates pattern 5x
→ Time: 3 minutes (vs 15 minutes manual)
```

---

## When /fast Fails

If feature is too complex for `/fast`, you'll see:

```
⚠️ Feature too complex for /fast mode

This feature requires:
- Backend schema changes (5+ cycles)
- Multiple agent coordination
- Design system updates

Recommendation: Use /plan instead

/plan [your-feature-description]
```

**Complexity triggers:**
- Backend schema changes
- Multi-agent coordination needed
- Requires design system updates
- Ambiguous requirements
- > 10 file changes

---

## State Persistence

Fast executions are logged to:
- `.claude/state/fast-log.json` - Execution history
- Git commits - Auto-committed with timestamps
- No cycle tracking (fast mode bypasses cycles)

---

## Key Principles

1. **Speed is the priority** - Sacrifice process for velocity
2. **Trust the patterns** - Replicate what works
3. **Good enough ships** - Perfection is the enemy of done
4. **Auto-commit everything** - Never lose work
5. **Fail fast** - If complex, escalate to `/plan`

---

## See Also

- `/plan` - For complex features requiring planning
- `/create` - For specialist-based building
- `/deploy` - For immediate production deployment
- `/push` - For git commits and repo sync
