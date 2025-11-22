# Page Management - Getting Started Guide

## Quick Start (5 minutes)

### 1. View the Page Management Interface
Navigate to `/builder/your-website-id/pages` in your browser.

Example: `http://localhost:4321/builder/website-123/pages`

### 2. What You'll See
- **Header**: "Pages" title with page count
- **Toolbar**: Search box, status filter, sort dropdown
- **Table**: List of pages with columns for Name, Status, Updated Date
- **Actions**: Edit, Preview, and More menu for each page
- **Create Button**: "New Page" button in the top right

### 3. Common Actions

#### Create a New Page
1. Click "New Page" button
2. Enter page name (e.g., "About Us")
3. Choose "Blank Page" or "AI Generated"
4. Click "Create Page"

#### Edit a Page
1. Click "Edit" icon next to page name
2. Opens page editor at `/builder/[websiteId]/[pageId]`

#### Preview a Page
1. Click "Eye" icon next to page name
2. Opens preview in new tab at `/preview/[websiteId]/[pageId]`

#### Set as Homepage
1. Click "..." menu next to page name
2. Select "Set as Homepage"
3. Only published pages can be homepages

#### Duplicate a Page
1. Click "..." menu next to page name
2. Select "Duplicate"
3. Creates copy with "(Copy)" suffix
4. New page is draft status

#### Delete a Page
1. Click "..." menu next to page name
2. Select "Delete"
3. Confirm in the dialog
4. Page is permanently removed

### 4. Filtering & Searching

#### Search for a Page
- Type in the search box
- Searches by page name or slug
- Results update in real-time

#### Filter by Status
- Click "all", "draft", or "published" buttons
- Shows only pages with that status
- Combines with search

#### Sort Pages
- Click "Sort: Name/Created/Updated" dropdown
- Select field to sort by
- Arrow shows sort direction (↑ ascending, ↓ descending)
- Click again to reverse order

### 5. Bulk Operations
- Check boxes next to multiple pages
- "Select All" checkbox at top
- Footer shows selected count
- Future: Bulk delete, bulk publish

## Component Usage for Developers

### Basic Usage
```astro
---
import { PageManagementPanel } from "@/components/builder/PageManagementPanel";
import Layout from "@/layouts/Layout.astro";

const { websiteId } = Astro.params;

// Mock data for demo
const pages = [
  { id: "page-1", name: "Home", slug: "home", ... },
  { id: "page-2", name: "About", slug: "about", ... },
];
---

<Layout title="Pages">
  <PageManagementPanel
    websiteId={websiteId}
    pages={pages}
    client:only="react"
  />
</Layout>
```

### With Convex (Recommended for Production)
```astro
---
import { PageManagementWithConvex } from "@/components/builder/PageManagementPanel.integration-example";
import Layout from "@/layouts/Layout.astro";

const { websiteId } = Astro.params;
---

<Layout title="Pages">
  <PageManagementWithConvex
    websiteId={websiteId}
    client:only="react"
  />
</Layout>
```

### With Custom Data Source
```tsx
import { usePageManagement } from "@/hooks/usePageManagement";
import { PageManagementPanel } from "@/components/builder/PageManagementPanel";

export function MyPageManager({ websiteId }: { websiteId: string }) {
  const { pages, createPage, deletePage, setHomepage } = usePageManagement([]);

  return (
    <PageManagementPanel
      websiteId={websiteId}
      pages={pages}
      onPageCreate={createPage}
      onPageDelete={deletePage}
      onSetHomepage={setHomepage}
    />
  );
}
```

## File Structure

```
web/src/
├── pages/
│   └── builder/
│       └── [websiteId]/
│           ├── [pageId].astro              (existing page editor)
│           └── pages.astro                 (NEW page management)
├── components/
│   └── builder/
│       ├── PageManagementPanel.tsx         (NEW main component)
│       ├── PAGES-README.md                 (NEW documentation)
│       └── PAGE-MANAGEMENT-GETTING-STARTED.md (NEW this file)
├── hooks/
│   └── usePageManagement.ts                (NEW hook)
└── lib/
    └── pageUtils.ts                        (NEW utilities)
```

## Data Model

### Page Interface
```typescript
interface Page {
  id: string;                        // Unique identifier
  name: string;                      // Display name
  slug: string;                      // URL-friendly slug
  status: "draft" | "published";     // Publication status
  isHomepage: boolean;               // Is this the homepage?
  createdAt: number;                 // Creation timestamp
  updatedAt: number;                 // Last update timestamp
  viewCount?: number;                // Optional view count
}
```

### Creating Pages
```typescript
const newPage: Page = {
  id: `page-${Date.now()}`,
  name: "My Page",
  slug: "my-page",
  status: "draft",
  isHomepage: false,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  viewCount: 0,
};
```

## Routes & Navigation

### Page Management Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/builder/[websiteId]/pages` | PageManagementPanel | List and manage pages |
| `/builder/[websiteId]/[pageId]` | WebsiteBuilder | Edit individual page |
| `/preview/[websiteId]/[pageId]` | Page preview | View published page |

### Navigation Between Routes
```typescript
// From page management to editor
window.location.href = `/builder/${websiteId}/${pageId}`;

// From page management to preview
window.open(`/preview/${websiteId}/${pageId}`, "_blank");

// From editor back to page management
window.location.href = `/builder/${websiteId}/pages`;
```

## Hooks & Utilities

### usePageManagement Hook
```typescript
import { usePageManagement } from "@/hooks/usePageManagement";

const {
  pages, filteredPages,
  createPage, deletePage, duplicatePage, setHomepage,
  searchQuery, setSearchQuery,
  statusFilter, setStatusFilter,
  sortField, setSortField,
  sortOrder, setSortOrder,
  selectedPageIds, togglePageSelection
} = usePageManagement(initialPages);
```

### Page Utilities
```typescript
import {
  generateSlug,
  validatePageName,
  formatPageName,
  formatPageDate,
  getTimeSince,
  sortPages,
  filterPagesByStatus,
  searchPages,
  calculatePageStats,
} from "@/lib/pageUtils";

// Generate slug from name
const slug = generateSlug("My Page"); // "my-page"

// Validate page name
const { valid, error } = validatePageName("About Us");

// Format date
const dateStr = formatPageDate(Date.now()); // "Jan 22, 2025"

// Time since
const timeSince = getTimeSince(Date.now() - 86400000); // "1d ago"
```

## Customization

### Styling
All components use shadcn/ui and Tailwind CSS. Customize by:

1. Modifying Tailwind classes in PageManagementPanel.tsx
2. Updating theme variables in `/web/src/styles/globals.css`
3. Adding custom CSS to PageManagementPanel.tsx

### Colors
```css
/* From design system */
--color-primary: primary
--color-secondary: secondary
--color-destructive: destructive
--color-muted: muted
--color-background: background
--color-foreground: foreground
```

### Sizing
```typescript
// Column widths
const columnWidths = {
  checkbox: "w-12",
  drag: "w-12",
  name: "auto",
  status: "w-20",
  date: "w-32",
  actions: "w-32",
};
```

## Backend Integration Steps

### Step 1: Create Convex Schema
```typescript
// backend/convex/schema.ts
pages: defineTable({
  websiteId: v.id("websites"),
  name: v.string(),
  slug: v.string(),
  status: v.union(v.literal("draft"), v.literal("published")),
  isHomepage: v.boolean(),
  viewCount: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_website", ["websiteId"])
  .index("by_slug", ["websiteId", "slug"])
```

### Step 2: Create Convex Queries
```typescript
// backend/convex/queries/pages.ts
export const listByWebsite = query({
  args: { websiteId: v.id("websites") },
  handler: async (ctx, args) => {
    return ctx.db
      .query("pages")
      .withIndex("by_website", q => q.eq("websiteId", args.websiteId))
      .order("desc")
      .collect();
  },
});
```

### Step 3: Create Convex Mutations
```typescript
// backend/convex/mutations/pages.ts
export const create = mutation({
  args: {
    websiteId: v.id("websites"),
    name: v.string(),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("pages", {
      websiteId: args.websiteId,
      name: args.name,
      slug: args.slug,
      status: "draft",
      isHomepage: false,
      viewCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
```

### Step 4: Update Astro Page
```astro
---
// Fetch pages from Convex
import { ConvexHttpClient } from "convex/browser";
const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);
const pages = await convex.query(api.queries.pages.listByWebsite, {
  websiteId,
});
---

<!-- Use real data instead of mock -->
<PageManagementPanel pages={pages} client:only="react" />
```

### Step 5: Add Callback Handlers
```astro
---
import { PageManagementWithConvex } from "@/components/builder/PageManagementPanel.integration-example";

// Wraps all Convex operations with callbacks
---

<PageManagementWithConvex websiteId={websiteId} client:only="react" />
```

## Troubleshooting

### Pages Not Loading
**Problem**: See empty state or "Loading..."
**Solution**:
- Check that `websiteId` prop is passed correctly
- Verify Convex is connected if using real data
- Check browser console for errors

### Search/Filter Not Working
**Problem**: Changes don't update results
**Solution**:
- Clear search box and try again
- Check that pages have `name` and `slug` properties
- Verify filter buttons are clickable

### Mutations Not Working
**Problem**: Create/Delete/Duplicate fail silently
**Solution**:
- Check callbacks are passed as props
- Verify Convex mutations are implemented
- Check browser console for error messages
- Ensure user is authenticated

### Styling Issues
**Problem**: Components look broken or unstyled
**Solution**:
- Verify Tailwind CSS is configured
- Check that shadcn/ui components are installed
- Clear browser cache and rebuild

## Performance Tips

### For Small Sites (<50 pages)
- Use current implementation as-is
- Mock data is fine for demo
- No optimization needed

### For Medium Sites (50-500 pages)
- Implement pagination (50 pages per page)
- Add debouncing to search input
- Use React.memo for table rows
- Consider virtual scrolling

### For Large Sites (500+ pages)
- Use virtual table scrolling (React Window)
- Implement pagination or infinite scroll
- Add request debouncing and caching
- Consider serverless search (Algolia)

## Best Practices

### ✅ Do
- Pass typed `pages` prop
- Use search for large lists
- Set default `sortField` to "updated"
- Handle async operations with loading state
- Use toast for user feedback

### ❌ Don't
- Mutate pages array directly
- Render pages without keys
- Ignore loading states
- Mix mock and real data
- Change sort order rapidly

## Examples

### Example 1: Create a Page Programmatically
```typescript
const { pages, createPage } = usePageManagement([]);

const handleQuickCreate = async () => {
  const newPage = await createPage("New Landing Page");
  // Navigate to editor
  window.location.href = `/builder/${websiteId}/${newPage.id}`;
};
```

### Example 2: Filter Published Pages Only
```typescript
const filteredPublished = pages.filter(p => p.status === "published");
```

### Example 3: Generate Page Statistics
```typescript
const { total, published, draft, totalViews } = calculatePageStats(pages);

console.log(`${published} published, ${draft} drafts, ${totalViews} total views`);
```

### Example 4: Auto-Generate Slug
```typescript
const slug = generateSlug("About Our Company"); // "about-our-company"
```

## Next Steps

1. **Review** the `PAGES-README.md` for complete API documentation
2. **Integrate** with Convex backend using the integration example
3. **Customize** styling if needed for your brand
4. **Add** to your website builder navigation
5. **Test** with real pages and users
6. **Monitor** performance with large page counts

## Support

- Component code: `/web/src/components/builder/PageManagementPanel.tsx`
- Complete docs: `/web/src/components/builder/PAGES-README.md`
- Integration guide: `/web/src/components/builder/PageManagementPanel.integration-example.tsx`
- Utilities: `/web/src/lib/pageUtils.ts`
- Hook: `/web/src/hooks/usePageManagement.ts`

---

**Version**: 1.0.0
**Status**: Production Ready
**Last Updated**: 2025-01-22
