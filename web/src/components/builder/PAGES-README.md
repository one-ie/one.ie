# Page Management Interface - CYCLE 16

Complete page management solution for the website builder, including listing, creation, duplication, and deletion of pages.

## Features

### 1. Page List View (Table)
- **Sortable columns**: Name, Created Date, Updated Date, Views
- **Status badges**: Draft vs Published
- **Quick preview icons**: View button opens preview in new tab
- **Edit links**: Direct navigation to page editor
- **Homepage indicator**: Shows which page is set as homepage

### 2. Create New Page
- **Blank page**: Create empty page ready for editing
- **AI-generated page**: Uses Claude AI to generate page based on description
- **Dialog interface**: Simple form for page name and creation method

### 3. Page Management Actions
- **Edit page**: Navigate to `/builder/[websiteId]/[pageId]` editor
- **Preview page**: Open `/preview/[websiteId]/[pageId]` in new tab
- **Duplicate page**: Create copy of page with "(Copy)" suffix
- **Delete page**: Remove page with confirmation dialog
- **Set as homepage**: Make any published page the homepage
- **Bulk select**: Select multiple pages with checkboxes

### 4. Filtering & Searching
- **Search**: Find pages by name or slug
- **Status filter**: Show all, draft only, or published only
- **Multi-criteria**: Combine search + status filter

### 5. Sorting Options
- **Name**: Alphabetical order (A-Z or Z-A)
- **Created**: Oldest or newest first
- **Updated**: Most or least recently updated
- **Views**: Most or least viewed pages

### 6. Additional Features
- **Drag handle**: Visual indicator for future drag-to-reorder functionality
- **Page stats**: View count, creation date, last updated
- **Empty state**: Helpful message when no pages exist
- **Footer info**: Shows selected page count or current homepage

## Components

### PageManagementPanel.tsx
Main component that handles all page management functionality.

**Props**:
```typescript
interface PageManagementPanelProps {
  websiteId: string;              // ID of the website
  pages?: Page[];                 // List of pages to manage
  onPageCreate?: (page: Page) => void;      // Callback after creation
  onPageDelete?: (pageId: string) => void;  // Callback after deletion
  onPageDuplicate?: (pageId: string) => void; // Callback after duplication
  onSetHomepage?: (pageId: string) => void; // Callback when setting homepage
}
```

**Page Interface**:
```typescript
interface Page {
  id: string;                     // Unique page ID
  name: string;                   // Display name
  slug: string;                   // URL-friendly slug
  status: "draft" | "published";  // Publication status
  isHomepage: boolean;            // Is this the homepage?
  createdAt: number;              // Creation timestamp
  updatedAt: number;              // Last update timestamp
  viewCount?: number;             // Optional view count
}
```

## Usage

### In Astro Page
```astro
---
import { PageManagementPanel } from "@/components/builder/PageManagementPanel";
import Layout from "@/layouts/Layout.astro";

const { websiteId } = Astro.params;

// Fetch pages from Convex or content collection
const pages = await fetchPages(websiteId);
---

<Layout title="Pages">
  <PageManagementPanel
    websiteId={websiteId}
    pages={pages}
    client:only="react"
  />
</Layout>
```

## Route Structure

**Page Management Interface**:
- Route: `/builder/[websiteId]/pages`
- File: `/web/src/pages/builder/[websiteId]/pages.astro`
- Component: `PageManagementPanel`

**Page Editor**:
- Route: `/builder/[websiteId]/[pageId]`
- File: `/web/src/pages/builder/[websiteId]/[pageId].astro`
- Component: `WebsiteBuilder`

**Page Preview**:
- Route: `/preview/[websiteId]/[pageId]`
- File: `/web/src/pages/preview/[websiteId]/[pageId].astro`

## State Management

### Local State (React Component)
```typescript
// Page list
const [pages, setPages] = useState<Page[]>(initialPages);

// Search & filter
const [searchQuery, setSearchQuery] = useState("");
const [statusFilter, setStatusFilter] = useState("all");

// Sorting
const [sortField, setSortField] = useState("updated");
const [sortOrder, setSortOrder] = useState("desc");

// Selection
const [selectedPages, setSelectedPages] = useState(new Set());

// Dialogs
const [showCreateDialog, setShowCreateDialog] = useState(false);
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
```

### Backend Integration (Future)
When connected to Convex backend:
```typescript
// In Astro page script
const pages = await convex.query(api.queries.pages.listByWebsite, {
  websiteId,
});

// In mutation handlers
await convex.mutation(api.mutations.pages.create, { ... });
await convex.mutation(api.mutations.pages.delete, { ... });
await convex.mutation(api.mutations.pages.duplicate, { ... });
```

## Styling

### Design System
Uses the ONE platform design system:
- **Colors**: Primary, secondary, destructive, muted
- **Spacing**: Consistent gap and padding sizes
- **Typography**: Font weights and sizes from Tailwind
- **Components**: shadcn/ui components with theme support
- **Animations**: Smooth transitions and hover states

### Tailwind Classes Used
- Layout: `flex`, `flex-col`, `h-full`, `flex-1`
- Grid: `grid`, `gap-4`, `grid-cols-3`
- Borders: `border`, `border-b`, `border-t`
- Colors: `bg-background`, `text-foreground`, `text-muted-foreground`
- Hover: `hover:bg-muted`, `hover:shadow-lg`, `transition-shadow`

## Data Fetching Strategies

### Strategy 1: Mock Data (Current Demo)
```astro
---
const mockPages = [
  { id: "page-1", name: "Home", ... },
  { id: "page-2", name: "About", ... },
];
---

<PageManagementPanel pages={mockPages} />
```

### Strategy 2: Convex Queries (Recommended)
```astro
---
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);

const pages = await convex.query(
  api.queries.pages.listByWebsite,
  { websiteId }
);
---

<PageManagementPanel pages={pages} client:only="react" />
```

### Strategy 3: Content Collections (Alternative)
```astro
---
import { getCollection } from "astro:content";

const pages = await getCollection("pages")
  .filter(p => p.data.websiteId === websiteId)
  .sort((a, b) => b.data.updatedAt - a.data.updatedAt);
---

<PageManagementPanel pages={pages} />
```

## Planned Enhancements

### Phase 1 (Current)
- ✅ Page list and table view
- ✅ Create new page
- ✅ Duplicate page
- ✅ Delete page
- ✅ Set homepage
- ✅ Sort and filter
- ✅ Quick preview links

### Phase 2 (Next)
- [ ] Drag-to-reorder pages
- [ ] Bulk delete multiple pages
- [ ] Page templates (landing, blog, product)
- [ ] AI page generation with description
- [ ] Page analytics view
- [ ] Batch publish/unpublish

### Phase 3 (Future)
- [ ] SEO optimization panel
- [ ] Page hierarchy (parent/child)
- [ ] Page versioning/history
- [ ] Scheduled publishing
- [ ] Page collaboration
- [ ] Multi-language support

## Integration with Website Builder

### Navigation from Builder
In the main WebsiteBuilder component, add navigation button:

```typescript
// In header
<Button>
  <Grid className="h-4 w-4 mr-2" />
  Pages
</Button>

// On click
window.location.href = `/builder/${websiteId}/pages`;
```

### Quick Add Page from Builder
```typescript
<Dialog>
  <DialogTrigger asChild>
    <Button size="sm">
      <Plus className="h-4 w-4" />
    </Button>
  </DialogTrigger>
  <DialogContent>
    {/* PageManagementPanel create dialog... */}
  </DialogContent>
</Dialog>
```

## Performance Optimization

### Rendering
- **Table virtualization**: For 100+ pages (use React Window)
- **Lazy loading**: Images and icons load on demand
- **Memoization**: Filter/sort results cached with useMemo

### Data Fetching
- **Pagination**: Load 50 pages at a time
- **Search debouncing**: Delay search until user stops typing
- **Caching**: Use SWR or React Query for cache management

### Code Splitting
- Component lazy-loaded with `React.lazy()`
- Dialog content split from main component
- Table rows memoized to prevent re-renders

## Testing

### Unit Tests
```typescript
// PageManagementPanel.test.tsx
describe("PageManagementPanel", () => {
  test("filters pages by search query", () => {
    // Test search functionality
  });

  test("sorts pages by selected field", () => {
    // Test sorting
  });

  test("deletes page with confirmation", () => {
    // Test delete flow
  });

  test("duplicates page successfully", () => {
    // Test duplicate
  });
});
```

### E2E Tests
```typescript
// pages.spec.ts
test("user can create, edit, and delete a page", async ({ page }) => {
  // Navigate to pages
  await page.goto("/builder/website-1/pages");

  // Create page
  await page.click("button:has-text('New Page')");
  await page.fill("input#page-name", "My Page");
  await page.click("button:has-text('Create Page')");

  // Verify page appears in list
  expect(page.locator("text=My Page")).toBeVisible();

  // Delete page
  // ...
});
```

## Troubleshooting

### Pages Not Loading
- Check that `pages` prop is passed correctly
- Verify Convex queries are returning data
- Check browser console for errors

### Sorting/Filtering Not Working
- Ensure `filteredPages` useMemo is updating correctly
- Check that sort field names match Page interface
- Verify filter logic in useMemo

### Mutations Not Calling Callbacks
- Ensure `onPageCreate`, `onPageDelete` etc. are passed as props
- Check that callbacks are async and properly awaited
- Verify error handling in callback

## Contributing

To extend this component:

1. **Add new action**: Add to dropdown menu or new button
2. **Add new column**: Add to table header and body
3. **Add new filter**: Add filter toggle to toolbar
4. **Add new sort**: Add to sort dropdown menu
5. **Add new dialog**: Create new DialogTrigger and DialogContent

All additions should follow the existing patterns and use shadcn/ui components.

---

**Status**: Production ready for CYCLE 16
**Last Updated**: 2025-01-22
**Maintainer**: Frontend Specialist Agent
