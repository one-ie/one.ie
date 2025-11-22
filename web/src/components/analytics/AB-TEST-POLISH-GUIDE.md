# A/B Test UI Polish - Quick Reference Guide

**Created in Cycle 95**

This guide shows you how to use all the polished A/B testing components.

---

## 🎨 Component Showcase

### 1. Status Badges

**Import:**
```tsx
import { ABTestStatusBadge } from '@/components/analytics/ABTestStatusBadge';
```

**Usage:**
```tsx
// Running test (green, animated pulse)
<ABTestStatusBadge status="running" size="md" showIcon={true} />

// Completed test (blue)
<ABTestStatusBadge status="completed" size="md" showIcon={true} />

// Paused test (yellow outline)
<ABTestStatusBadge status="paused" size="sm" showIcon={false} />

// Scheduled test (purple)
<ABTestStatusBadge status="scheduled" size="lg" />

// Archived test (gray)
<ABTestStatusBadge status="archived" />

// Draft test (gray outline)
<ABTestStatusBadge status="draft" />
```

**Available Sizes:**
- `sm` - Small (12px text, 16px icon)
- `md` - Medium (14px text, 20px icon) - **Default**
- `lg` - Large (16px text, 24px icon)

---

### 2. Variant Comparison

**Import:**
```tsx
import { ABTestVariantComparison } from '@/components/analytics/ABTestVariantComparison';
```

**Usage:**
```tsx
<ABTestVariantComparison
  variants={[
    {
      id: "1",
      name: "A",
      customName: "Control",
      visitors: 1000,
      conversions: 120,
      conversionRate: 12.0,
      isControl: true,
      changes: {
        headline: "Get Started Today"
      }
    },
    {
      id: "2",
      name: "B",
      customName: "Power Words",
      visitors: 1000,
      conversions: 145,
      conversionRate: 14.5,
      isControl: false,
      isWinner: true,
      changes: {
        headline: "Transform Your Business Today"
      }
    }
  ]}
  testType="headline"
  onVariantSelect={(variantId) => {
    console.log('Selected variant:', variantId);
  }}
/>
```

**Test Types:**
- `headline` - Displays headline changes
- `cta_button` - Shows button with CTA text
- `image` - Displays image previews
- `entire_page` - Full page content
- `funnel_flow` - Flow descriptions

**Features:**
- Compare up to 3 variants side-by-side
- Toggle metrics visibility
- Toggle difference highlighting
- Keyboard navigation (← →)
- Quick "View Live" action

---

### 3. Test Templates

**Import:**
```tsx
import { ABTestTemplates } from '@/components/analytics/ABTestTemplates';
```

**Usage:**
```tsx
<ABTestTemplates
  onSelectTemplate={(template) => {
    console.log('Selected template:', template.name);
    console.log('Variants:', template.variants);
    console.log('Recommended duration:', template.duration);

    // Pre-fill your test setup
    setTestName(template.name);
    setTestType(template.testType);
    setVariants(template.variants);
    setDuration(template.duration);
  }}
/>
```

**Available Templates:**

1. **Headline Power Words**
   - Control: "Learn How to Build Better Websites"
   - Variant: "Discover the Secrets to Building Incredible Websites"
   - Duration: 14 days
   - Sample size: 300 visitors

2. **CTA with Urgency**
   - Control: "Get Started"
   - Variant B: "Start Free Trial - Limited Time"
   - Variant C: "Join 10,000+ Users Today"
   - Duration: 7 days
   - Sample size: 200 visitors

3. **Price Anchoring**
   - Control: "$99/month - Billed monthly"
   - Variant: "$79/month - Save $240/year with annual billing"
   - Duration: 14 days
   - Sample size: 500 visitors

4. **Hero Image - People vs. Product**
   - Control: Product-focused imagery
   - Variant: People using product
   - Duration: 14 days
   - Sample size: 400 visitors

5. **Form Length Optimization**
   - Short: Email only (1 field)
   - Medium: Email + Name (2 fields)
   - Long: Email + Name + Company (3 fields)
   - Duration: 7 days
   - Sample size: 300 visitors

6. **Email Subject Personalization**
   - Generic: "Weekly Newsletter - Tips & Updates"
   - Personalized: "[Name], Your Personalized Tips Inside"
   - Duration: 7 days
   - Sample size: 1000 visitors

**Template Properties:**
```typescript
interface TestTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  variants: Array<{
    name: string;
    changes: Record<string, string>;
  }>;
  successMetric: string;
  duration: number; // days
  minimumSampleSize: number; // visitors
  tags: string[];
}
```

---

### 4. Test Archive

**Import:**
```tsx
import { ABTestArchive } from '@/components/analytics/ABTestArchive';
```

**Usage:**
```tsx
<ABTestArchive funnelId="funnel_123" />
```

**Features:**
- Search tests by name or type
- Filter by status (all, running, completed, paused, archived)
- Select multiple tests with checkboxes
- Bulk archive selected tests
- Bulk delete selected tests (with confirmation)
- Export all tests to CSV
- View statistics (total, running, completed, archived)
- Archive/unarchive individual tests
- View results for any test

**Bulk Actions:**
```tsx
// User selects tests via checkboxes
// Then clicks "Archive Selected" or "Delete Selected"

// Archive: Moves tests to archived status
// Delete: Permanently removes tests (requires confirmation)
```

**CSV Export Columns:**
- Test Name
- Status
- Start Date
- End Date
- Winner
- Best Conversion Rate

---

### 5. Enhanced Test Setup

**Import:**
```tsx
import { ABTestSetup } from '@/components/analytics/ABTestSetup';
```

**New Features in Cycle 95:**

#### Custom Variant Names
```tsx
// Instead of just "Variant A" and "Variant B"
// Users can name them:
{
  name: "A",
  customName: "Blue Button with Urgency",
  trafficPercent: 50,
  changes: { ctaText: "Start Now - Limited Time!" }
}

{
  name: "B",
  customName: "Green Button Standard",
  trafficPercent: 50,
  changes: { ctaText: "Get Started" }
}
```

#### Email Notifications
```tsx
// In Step 4 of the wizard
const [enableEmailNotifications, setEnableEmailNotifications] = useState(true);

// When enabled:
// - User receives email when test reaches 95% confidence
// - Email includes winner details and conversion rates
// - Can be toggled on/off per test
```

---

## 🎯 Complete User Flows

### Flow 1: Create Test from Template

```
1. User visits /funnels/{id}/ab-tests
2. Clicks "Browse Templates" card
3. Browses templates, filters by category
4. Clicks template card to preview
5. Clicks "Use This Template"
6. Setup wizard pre-fills with template data
7. User customizes variant names (optional)
8. Enables email notifications (default: on)
9. Creates test
10. Test starts running
```

### Flow 2: Compare Variants

```
1. User visits test results page
2. Sees ABTestVariantComparison component
3. Selects 2-3 variants to compare
4. Toggles metrics overlay
5. Toggles difference highlighting
6. Clicks "View Live" to preview variant
7. Uses ← → keys to navigate variants
```

### Flow 3: Archive Old Tests

```
1. User visits /funnels/{id}/ab-tests/archive
2. Searches for old tests
3. Filters by "completed" status
4. Selects multiple tests via checkboxes
5. Clicks "Archive Selected"
6. Tests move to archived status
7. User exports CSV for reporting
```

---

## 📊 Integration with Existing Components

### ABTestResults (Cycle 76)

**Add variant comparison:**
```tsx
import { ABTestResults } from '@/components/analytics/ABTestResults';
import { ABTestVariantComparison } from '@/components/analytics/ABTestVariantComparison';

export function TestResultsPage({ testId, funnelId }) {
  const testData = useQuery(api.queries.abTests.getResults, { testId });

  return (
    <div className="space-y-6">
      {/* Existing results dashboard */}
      <ABTestResults testId={testId} funnelId={funnelId} />

      {/* NEW: Variant comparison */}
      <ABTestVariantComparison
        variants={testData.variants}
        testType={testData.testType}
      />
    </div>
  );
}
```

### Test List Page

**Add status badges:**
```tsx
import { ABTestStatusBadge } from '@/components/analytics/ABTestStatusBadge';

{tests.map(test => (
  <div key={test._id}>
    <span>{test.name}</span>
    <ABTestStatusBadge status={test.status} size="sm" />
  </div>
))}
```

---

## 🎨 Styling & Theming

All components use:
- **shadcn/ui** base components
- **Tailwind CSS v4** for styling
- **Dark mode** compatible
- **Responsive** grid layouts

**Color scheme:**
```css
Running:    green-600 (bg) + white (text) + pulse animation
Completed:  blue-600 (bg) + white (text)
Paused:     yellow-600 (border) + yellow-700 (text)
Scheduled:  purple-600 (bg) + white (text)
Archived:   gray-500 (bg) + white (text)
Draft:      gray-400 (border) + gray-600 (text)
```

---

## 🔧 Backend Requirements

### Mutations

```typescript
// api.mutations.abTests
export const archive = mutation({
  args: { testId: v.id("things") },
  handler: async (ctx, { testId }) => {
    await ctx.db.patch(testId, { status: "archived" });
  }
});

export const unarchive = mutation({
  args: { testId: v.id("things") },
  handler: async (ctx, { testId }) => {
    await ctx.db.patch(testId, { status: "completed" });
  }
});

export const bulkDelete = mutation({
  args: { testIds: v.array(v.id("things")) },
  handler: async (ctx, { testIds }) => {
    for (const id of testIds) {
      await ctx.db.delete(id);
    }
  }
});
```

### Queries

```typescript
// api.queries.abTests
export const listByFunnel = query({
  args: {
    funnelId: v.id("things"),
    includeArchived: v.optional(v.boolean())
  },
  handler: async (ctx, { funnelId, includeArchived }) => {
    let tests = await ctx.db
      .query("things")
      .filter(q => q.eq(q.field("type"), "ab_test"))
      .filter(q => q.eq(q.field("parentId"), funnelId))
      .collect();

    if (!includeArchived) {
      tests = tests.filter(t => t.status !== "archived");
    }

    return tests;
  }
});
```

---

## 📱 Mobile Responsiveness

All components are mobile-optimized:

- **Variant Comparison:**
  - Desktop: 3-column grid
  - Tablet: 2-column grid
  - Mobile: 1-column stack

- **Templates:**
  - Desktop: 3-column grid
  - Tablet: 2-column grid
  - Mobile: 1-column stack

- **Archive:**
  - Desktop: Full table view
  - Mobile: Card-based list

---

## ♿ Accessibility

- ✅ Keyboard navigation (Tab, Enter, ←, →)
- ✅ ARIA labels on all interactive elements
- ✅ Focus indicators
- ✅ Screen reader support
- ✅ Color contrast meets WCAG AA
- ✅ No color-only information

---

## 🚀 Performance Tips

1. **Variant Comparison:**
   - Limit to 3 variants max
   - Use `client:visible` for below-fold comparisons

2. **Templates:**
   - Templates are static data (no API calls)
   - Search is client-side (instant)

3. **Archive:**
   - Use pagination for 100+ tests
   - CSV export is async for large datasets

---

## 📚 Related Documentation

- **Cycle 75:** A/B Testing Setup (foundation)
- **Cycle 76:** A/B Test Results Dashboard
- **Cycle 95:** A/B Test UI Polish (this cycle)
- **Backend API:** `/backend/convex/mutations/abTests.ts`
- **Design System:** `/one/things/design-system.md`

---

## 🎉 Quick Start Example

```tsx
import { ABTestTemplates } from '@/components/analytics/ABTestTemplates';
import { ABTestSetup } from '@/components/analytics/ABTestSetup';
import { ABTestVariantComparison } from '@/components/analytics/ABTestVariantComparison';
import { ABTestStatusBadge } from '@/components/analytics/ABTestStatusBadge';
import { ABTestArchive } from '@/components/analytics/ABTestArchive';

export function ABTestingWorkflow() {
  return (
    <div className="space-y-8">
      {/* Step 1: Browse templates */}
      <ABTestTemplates
        onSelectTemplate={(template) => {
          console.log('Using template:', template);
        }}
      />

      {/* Step 2: Setup test */}
      <ABTestSetup
        funnelId="funnel_123"
        onSuccess={(testId) => {
          console.log('Test created:', testId);
        }}
      />

      {/* Step 3: View results with comparison */}
      <ABTestVariantComparison
        variants={testData.variants}
        testType="headline"
      />

      {/* Step 4: Archive old tests */}
      <ABTestArchive funnelId="funnel_123" />
    </div>
  );
}
```

---

**That's it! You now have a complete, polished A/B testing system.** 🎨✨
