# Page Templates - README

**INTEGRATION CYCLE 6: Complete**

Production-ready page templates using ontology-ui components.

---

## 📦 Available Templates

### 1. Dashboard Template (`dashboard.astro`)

**Admin dashboard with 6-dimension navigation**

**Components Used:**
- `DimensionNav` - Navigation across 6 dimensions with keyboard shortcuts
- `EntityDisplay` - Display entities with filters
- `UnifiedSearch` - Cross-dimensional search
- Stats cards and quick actions

**Use Cases:**
- Platform administration
- Entity management dashboards
- Multi-tenant admin panels
- Analytics overview

**Customization:**
```astro
---
// Update dimension counts
const dimensionCounts = {
  groups: 12,
  people: 45,
  things: 234,
  // ... fetch from Convex
};

// Change default dimension
const defaultDimension: Dimension = 'things';
---
```

---

### 2. Profile Template (`profile.astro`)

**User profile with activity and permissions**

**Components Used:**
- `UserCard` - User profile card with avatar
- `UserActivity` - Activity timeline
- `UserPermissions` - Permission matrix
- `UserAvatar` - Avatar with status indicator

**Use Cases:**
- User profile pages
- Team member profiles
- Account management
- Social networking profiles

**Customization:**
```astro
---
// Replace with real user data from Convex
const user = await convex.query(api.queries.users.get, {
  userId: Astro.params.userId
});

// Fetch user activity
const activities = await convex.query(api.queries.events.list, {
  userId: user.id,
  limit: 10
});
---
```

---

### 3. Marketplace Template (`marketplace.astro`)

**E-commerce for products, tokens, and NFTs**

**Components Used:**
- `ProductCard` - Product listings with prices
- `TokenCard` - Cryptocurrency token display
- `NFTCard` - NFT collectibles (referenced in markup)
- `SearchBar` - Product search

**Use Cases:**
- Product marketplaces
- NFT galleries
- Token exchanges
- Digital goods stores

**Customization:**
```astro
---
// Replace with real product data
const products = await convex.query(api.queries.products.list, {
  groupId: currentGroup.id,
  status: 'active'
});

// Fetch tokens from blockchain
const tokens = await convex.query(api.queries.tokens.list);
---
```

**Stripe Integration:**
See `/web/src/pages/shop/TEMPLATE-README.md` for Stripe setup.

---

### 4. Analytics Template (`analytics.astro`)

**Data visualization and insights dashboard**

**Components Used:**
- `TimeSeriesChart` - Trend visualization (placeholder)
- `HeatmapChart` - Activity patterns
- `NetworkDiagram` - Relationship visualization
- `KnowledgeGraph` - Semantic connections

**Use Cases:**
- Analytics dashboards
- Performance tracking
- Data insights and reporting
- Relationship visualization

**Customization:**
```astro
---
// Replace with real analytics data
const analyticsData = await convex.query(api.queries.analytics.timeSeries, {
  groupId: currentGroup.id,
  range: 'last_7_days'
});

// Fetch network data
const networkData = await convex.query(api.queries.connections.graph, {
  groupId: currentGroup.id
});
---
```

---

### 5. Chat Template (`chat.astro`)

**Real-time messaging and collaboration**

**Components Used:**
- `ChatMessage` - Message display
- `ChatInput` - Message composition
- `LiveNotifications` - Real-time updates (referenced)
- `PresenceIndicator` - User status (referenced)
- `UserAvatar` - User avatars with status

**Use Cases:**
- Team chat applications
- Customer support chat
- Community forums
- Live collaboration tools

**Customization:**
```astro
---
// Use Convex real-time subscriptions
const messages = await convex.query(api.queries.messages.list, {
  channelId: currentChannel.id,
  limit: 50
});

// Get online users
const onlineUsers = await convex.query(api.queries.users.online, {
  groupId: currentGroup.id
});
---
```

---

## 🚀 Quick Start

### 1. Copy Template to Your Project

```bash
# Copy the template you want
cp web/src/templates/dashboard.astro web/src/pages/dashboard.astro

# Or create a new route
cp web/src/templates/profile.astro web/src/pages/users/[userId].astro
```

### 2. Update Mock Data

Replace mock data with real Convex queries:

```astro
---
// Before (mock data)
const user = {
  id: 'user-123',
  name: 'Sarah Johnson',
  // ...
};

// After (Convex query)
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);
const user = await convex.query(api.queries.users.get, {
  userId: Astro.params.userId
});
---
```

### 3. Customize Styling

All templates use Tailwind CSS v4 and shadcn/ui components:

```astro
<!-- Change colors, spacing, layout as needed -->
<div class="container mx-auto px-4 py-8">
  <!-- Customize grid columns -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <!-- ... -->
  </div>
</div>
```

### 4. Add Client Interactivity

Templates include `client:load` directives for interactive components. Adjust as needed:

```astro
<!-- Load immediately (critical) -->
<DimensionNav client:load />

<!-- Load when idle (secondary) -->
<UnifiedSearch client:idle />

<!-- Load when visible (below fold) -->
<EntityDisplay client:visible />
```

### 5. Test and Deploy

```bash
# Test locally
cd web/
bun run dev

# Visit http://localhost:4321/your-route

# Build for production
bun run build

# Deploy to Cloudflare Pages
wrangler pages deploy dist
```

---

## 📚 Component Documentation

All templates use components from the ontology-ui library. See component documentation:

- **Full component library**: `/web/src/components/ontology-ui/README.md`
- **Component list**: `/web/src/components/ontology-ui/COMPONENTS.md`
- **Types reference**: `/web/src/components/ontology-ui/types/index.ts`

### Importing Components

```astro
---
// Import from specific dimension
import { DimensionNav, EntityDisplay } from '@/components/ontology-ui/app';
import { UserCard, UserActivity } from '@/components/ontology-ui/people';
import { ProductCard, TokenCard } from '@/components/ontology-ui/things';
import { HeatmapChart, NetworkDiagram } from '@/components/ontology-ui/visualization';
import { ChatMessage, ChatInput } from '@/components/ontology-ui/streaming';
---
```

---

## 🎨 Customization Examples

### Change Template Colors

```astro
<!-- Update gradient colors -->
<div class="bg-gradient-to-r from-blue-500/10 to-purple-500/5">
  <!-- ... -->
</div>

<!-- Update badge colors -->
<Badge class="bg-green-100 text-green-800">
  New
</Badge>
```

### Add New Sections

```astro
<!-- Add a new card section -->
<Card class="mt-8">
  <CardHeader>
    <CardTitle>Custom Section</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Your custom content here</p>
  </CardContent>
</Card>
```

### Modify Layout

```astro
<!-- Change from 3 columns to 4 columns -->
<div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
  <!-- ... -->
</div>

<!-- Change to full-width layout -->
<div class="max-w-7xl mx-auto">
  <!-- ... -->
</div>
```

---

## 🔗 Integration with Backend

### Convex Real-Time Queries

```astro
---
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);

// Fetch data at build time (SSG)
const products = await convex.query(api.queries.products.list, {
  groupId: 'example-group',
  status: 'active'
});
---

<!-- Use in React component for real-time updates -->
<EntityDisplay
  groupId="example-group"
  dimension="things"
  client:load
/>
```

### Stripe Integration

For marketplace template, see Stripe setup guide:
`/web/src/pages/shop/TEMPLATE-README.md`

---

## 🧪 Testing Templates

### Manual Testing

1. Copy template to `/web/src/pages/test-[template].astro`
2. Run dev server: `bun run dev`
3. Visit `http://localhost:4321/test-[template]`
4. Test interactivity, responsiveness, dark mode

### Automated Testing

```bash
# Type check
bunx astro check

# Build test
bun run build

# Component tests (if applicable)
bun test
```

---

## 📋 Template Checklist

Before deploying a customized template:

- [ ] Replace all mock data with real Convex queries
- [ ] Update page title and description (SEO)
- [ ] Test all interactive components work
- [ ] Test responsive layout (mobile, tablet, desktop)
- [ ] Test dark mode appearance
- [ ] Verify all links work
- [ ] Check Lighthouse score (aim for 90+)
- [ ] Test with real user data
- [ ] Add error handling for missing data
- [ ] Add loading states for async data

---

## 🆘 Common Issues

### Component Not Found

```
Error: Cannot find module '@/components/ontology-ui/...'
```

**Solution:** Check component import path matches the actual file location:
```bash
ls -la web/src/components/ontology-ui/
```

### Client Directive Not Working

```
Component not hydrating
```

**Solution:** Ensure you're using the correct client directive:
- `client:load` - Load immediately
- `client:idle` - Load when browser idle
- `client:visible` - Load when visible
- `client:only="react"` - Client-side only (no SSR)

### Missing Convex Data

```
Cannot read property 'name' of undefined
```

**Solution:** Add null checks and fallback data:
```astro
---
const user = await convex.query(...) ?? {
  name: 'Unknown User',
  // ... fallback data
};
---
```

---

## 🌟 Next Steps

After using a template:

1. **Browse Components**: Visit `/ontology-ui` to see all 286+ components
2. **Read Patterns**: Check `/one/knowledge/patterns/` for best practices
3. **Join Community**: Share your customizations and get help
4. **Contribute**: Submit PRs with improvements or new templates

---

## 📖 Additional Resources

- **Ontology Documentation**: `/one/knowledge/ontology.md`
- **Frontend Patterns**: `/one/knowledge/patterns/frontend/`
- **Astro Documentation**: https://docs.astro.build
- **Convex Documentation**: https://docs.convex.dev
- **Tailwind CSS**: https://tailwindcss.com/docs

---

**Built with clarity, simplicity, and infinite scale in mind.**

5 templates. 286+ components. 6 dimensions. 1 unified system.
