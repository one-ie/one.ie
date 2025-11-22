# AI Code Generation Tools

**CYCLE 7 Deliverable: AI tools for website generation**

These tools enable AI-powered website creation through natural language descriptions.

## Tools

### 1. generateAstroPage

**Purpose:** Create complete .astro files from natural language descriptions

**Input:**
- `description` - Natural language description of the page
- `route` - URL route path (e.g., "/products/coffee-mug")
- `pageType` - Type of page (landing, product, blog, docs, dashboard, auth, chat, custom)
- `features` - Optional array of features (stripe-checkout, product-gallery, reviews, etc.)
- `groupScoped` - Whether to scope by groupId (default: true)

**Output:**
- `code` - Complete .astro file code
- `route` - The route path
- `filePath` - Suggested file path
- `components` - List of components used
- `instructions` - Usage instructions

**Example:**
```typescript
const result = await generateAstroPageTool.execute({
  description: "Create a product landing page for selling coffee mugs with image gallery and Stripe checkout",
  route: "/products/coffee-mug",
  pageType: "product",
  features: ["product-gallery", "stripe-checkout", "reviews"],
  groupScoped: true
});

console.log(result.code); // Complete .astro file
console.log(result.filePath); // "web/src/pages/products/coffee-mug.astro"
```

**Page Types:**
- `landing` - Landing pages with hero, features, CTA
- `product` - E-commerce product pages
- `blog` - Blog post listings
- `docs` - Documentation pages
- `dashboard` - Admin dashboards
- `auth` - Authentication pages (login, signup)
- `chat` - Chat interface pages
- `custom` - Generic pages

**Features:**
- `stripe-checkout` - Stripe payment integration
- `product-gallery` - Image gallery with zoom
- `reviews` - Customer reviews section
- `urgency-banner` - Stock/countdown banners

---

### 2. modifyCode

**Purpose:** Update existing code based on modification requests

**Input:**
- `currentCode` - The current code to modify
- `modificationRequest` - Natural language description of changes
- `fileType` - Type of file (astro, tsx, ts, css, md)
- `preserveComments` - Whether to keep comments (default: true)

**Output:**
- `modifiedCode` - Updated code
- `changes` - List of changes made
- `suggestions` - Recommendations for improvements

**Example:**
```typescript
const result = await modifyCodeTool.execute({
  currentCode: `<Layout title="Product">...</Layout>`,
  modificationRequest: "Add a reviews section below the product details",
  fileType: "astro",
  preserveComments: true
});

console.log(result.modifiedCode); // Code with reviews section added
console.log(result.suggestions); // ["Add star rating component", "Implement pagination"]
```

**Supported Modifications:**
- Add new sections/components
- Remove existing elements
- Update styling/props
- Refactor structure
- Change imports

**Targets:**
- `button` - Modify buttons
- `card` - Modify cards
- `form` - Modify forms
- `image` - Modify images/galleries
- `reviews` - Modify reviews sections
- `styling` - Update styles/colors
- `imports` - Manage imports
- `props` - Update component props

---

### 3. searchComponents

**Purpose:** Find relevant components in the component library

**Input:**
- `description` - Natural language description of component needed
- `category` - Optional category filter (ui, layout, form, data-display, feedback, overlay, navigation, features, ontology, all)
- `includeExamples` - Whether to include usage examples (default: true)

**Output:**
- `components` - Array of matching components
- `count` - Number of results
- `suggestions` - Search suggestions

**Example:**
```typescript
const result = await searchComponentsTool.execute({
  description: "button with icon and loading state",
  category: "ui",
  includeExamples: true
});

console.log(result.components);
// [
//   {
//     name: "Button",
//     category: "ui",
//     path: "@/components/ui/button",
//     description: "Clickable button with variants and sizes",
//     props: ["variant", "size", "onClick"],
//     variants: ["default", "destructive", "outline", "secondary", "ghost", "link"],
//     example: "import { Button } from '@/components/ui/button';\n\n<Button variant=\"default\" size=\"lg\">Click Me</Button>"
//   }
// ]
```

**Categories:**
- `ui` - Basic UI components (Button, Badge, Avatar)
- `layout` - Layout components (Card, Separator, Accordion)
- `form` - Form components (Input, Label, Select, Checkbox)
- `data-display` - Data components (Chart, Carousel)
- `feedback` - Feedback components (Alert, Skeleton)
- `overlay` - Overlay components (Dialog, Dropdown, Tooltip)
- `navigation` - Navigation components (Breadcrumb)
- `features` - Custom feature components (ProductGallery, ChatClient)
- `ontology` - 6-dimension ontology components (ThingCard, PersonCard, EventItem)
- `all` - Search everything (default)

---

## Integration with AI SDK

### API Endpoint

The tools are integrated in `/web/src/pages/api/chat-website-builder.ts`:

```typescript
import { streamText } from "ai";
import { claudeCode } from "ai-sdk-provider-claude-code";
import {
  generateAstroPageTool,
  modifyCodeTool,
  searchComponentsTool,
} from "@/lib/ai/tools";

const result = await streamText({
  model: claudeCode("sonnet"),
  messages: messagesWithSystem,
  tools: {
    generateAstroPage: generateAstroPageTool,
    modifyCode: modifyCodeTool,
    searchComponents: searchComponentsTool,
  },
});
```

### Usage in Chat

**User:** "Create a product page for selling coffee mugs"

**AI Response:**
1. Calls `searchComponents` to check for existing templates
2. Finds `/web/src/pages/shop/product-landing.astro` template
3. Calls `generateAstroPage` with product details
4. Returns complete code + instructions
5. Asks: "Would you like to add Stripe checkout?"

**User:** "Yes, add Stripe"

**AI Response:**
1. Calls `modifyCode` to add Stripe integration
2. Returns updated code
3. Provides Stripe setup instructions

---

## Component Library

### shadcn/ui Components (50+)

**Basic UI:**
- Button - Variants: default, destructive, outline, secondary, ghost, link
- Badge - Label/tag component
- Avatar - User avatars with fallback
- Separator - Divider lines

**Layout:**
- Card - Container with header/content/footer
- Accordion - Collapsible sections
- Collapsible - Expandable content

**Forms:**
- Input - Text input fields
- Label - Form labels
- Select - Dropdown select
- Checkbox - Checkbox input
- Form - Form wrapper with validation

**Data Display:**
- Chart - Data visualization
- Carousel - Image carousel
- Table - Data tables

**Feedback:**
- Alert - Alert messages
- Skeleton - Loading placeholders
- Toast - Notifications

**Overlays:**
- Dialog - Modal dialogs
- DropdownMenu - Dropdown menus
- Tooltip - Hover tooltips
- HoverCard - Hover popovers
- Drawer - Slide-out panels

**Navigation:**
- Breadcrumb - Breadcrumb trails

### Custom Components

**Features:**
- ProductGallery - Image gallery with zoom (from product-landing template)
- ChatClient - AI chat interface

**Ontology (6-Dimension):**
- ThingCard - Universal renderer for all thing types (product, course, token, agent, etc.)
- PersonCard - User/person renderer with role badges
- EventItem - Event renderer for activity feeds

---

## Templates

### Product Landing Template

**Location:** `/web/src/pages/shop/product-landing.astro`

**Features:**
- Product gallery with image zoom
- Reviews section
- Urgency banners (stock indicators, countdown)
- Stripe checkout integration
- Mobile-responsive
- Dark mode support

**Usage:**
1. Copy template to new page
2. Update product data (title, price, images)
3. Add Stripe API keys to `.env`
4. Customize as needed

**Guide:** `/web/src/pages/shop/TEMPLATE-README.md`

---

## Development Workflow

### 1. User Request

**User:** "I want to create a page that sells t-shirts"

### 2. AI Search Templates

```typescript
// AI calls searchComponents
const templates = await searchComponentsTool.execute({
  description: "product landing page template",
  category: "features"
});

// Finds: /web/src/pages/shop/product-landing.astro
```

### 3. AI Generates Page

```typescript
// AI calls generateAstroPage
const page = await generateAstroPageTool.execute({
  description: "T-shirt product page with gallery and checkout",
  route: "/products/t-shirt",
  pageType: "product",
  features: ["product-gallery", "stripe-checkout", "reviews"],
  groupScoped: true
});

// Returns complete code + instructions
```

### 4. User Requests Changes

**User:** "Add a size selector"

```typescript
// AI calls modifyCode
const modified = await modifyCodeTool.execute({
  currentCode: page.code,
  modificationRequest: "Add a size selector with options: S, M, L, XL",
  fileType: "astro",
  preserveComments: true
});

// Returns updated code
```

### 5. AI Suggests Enhancements

**AI:** "Would you like to:"
- Make this your home page?
- Add Stripe checkout for payments?
- Add more product features?

---

## Best Practices

### Template-First Development

**ALWAYS search for templates BEFORE building from scratch:**

```typescript
// 1. Search for templates
const results = await searchComponentsTool.execute({
  description: "product page template",
  category: "all"
});

// 2. If template found, use it
if (results.components.length > 0) {
  // Copy and customize template
}

// 3. If no template, generate new page
else {
  const page = await generateAstroPageTool.execute({
    description: "...",
    pageType: "product"
  });
}
```

### Pattern Convergence

**Use ontology components for consistency:**

```typescript
// ✅ CORRECT - One component for all thing types
<ThingCard thing={product} type="product" />
<ThingCard thing={course} type="course" />
<ThingCard thing={token} type="token" />

// ❌ WRONG - Separate components for each type
<ProductCard product={product} />
<CourseCard course={course} />
<TokenCard token={token} />
```

### Multi-Tenancy

**Always scope pages by groupId:**

```typescript
const page = await generateAstroPageTool.execute({
  description: "Dashboard",
  route: "/groups/[groupId]/dashboard",
  pageType: "dashboard",
  groupScoped: true // ← REQUIRED for multi-tenancy
});
```

### Progressive Complexity

**Start simple, add features incrementally:**

```typescript
// Step 1: Basic page
const page = await generateAstroPageTool.execute({
  description: "Simple product page",
  pageType: "product",
  features: [] // No features yet
});

// Step 2: Add gallery
const withGallery = await modifyCodeTool.execute({
  currentCode: page.code,
  modificationRequest: "Add product gallery",
  fileType: "astro"
});

// Step 3: Add Stripe
const withStripe = await modifyCodeTool.execute({
  currentCode: withGallery.modifiedCode,
  modificationRequest: "Add Stripe checkout button",
  fileType: "astro"
});
```

---

## Testing

### Run Development Server

```bash
cd /home/user/one.ie/web
bun run dev
```

Navigate to generated page route to test.

### Check Build

```bash
cd /home/user/one.ie/web
bun run build
```

Verify no build errors.

### Type Check

```bash
cd /home/user/one.ie/web
bunx astro check
```

---

## Troubleshooting

### Tool Not Found

**Error:** "Tool 'generateAstroPage' not found"

**Solution:** Ensure tools are registered in API endpoint:
```typescript
tools: {
  generateAstroPage: generateAstroPageTool,
  modifyCode: modifyCodeTool,
  searchComponents: searchComponentsTool,
}
```

### Invalid Route

**Error:** "Route must start with /"

**Solution:** Ensure route starts with `/`:
```typescript
route: "/products/coffee-mug" // ✅ Correct
route: "products/coffee-mug"  // ❌ Wrong
```

### Component Not Found

**Error:** "Component 'ProductGallery' not found"

**Solution:** Search components first:
```typescript
const results = await searchComponentsTool.execute({
  description: "product gallery",
  category: "features"
});
```

### Code Generation Timeout

**Error:** "Request timeout"

**Solution:** Break down request into smaller tasks:
```typescript
// Instead of: "Create a complete e-commerce site"
// Use: "Create a product landing page" (one page at a time)
```

---

## File Structure

```
/home/user/one.ie/web/src/lib/ai/tools/
├── generateAstroPage.ts    # Page generation tool
├── modifyCode.ts            # Code modification tool
├── searchComponents.ts      # Component search tool
├── index.ts                 # Tool exports
└── README.md                # This file

/home/user/one.ie/web/src/pages/api/
└── chat-website-builder.ts  # API endpoint with tools
```

---

## Next Steps (Post-CYCLE 7)

### CYCLE 8: Testing & Quality
- Write tests for each tool
- Test edge cases (invalid routes, empty descriptions)
- Validate generated code compiles

### CYCLE 9: UI Integration
- Create ChatClient component for website builder
- Add tool call visualization (show generated code in UI)
- Implement code preview and editing

### CYCLE 10: Advanced Features
- Multi-page generation (create entire site structure)
- Component extraction (extract reusable components from templates)
- Style customization (apply theme/branding)

---

**Built with AI SDK v4, Claude Code, and the ONE Platform 6-dimension ontology.**
