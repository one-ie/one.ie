---
title: "AI Website Builder with Claude Code (Vibe Code)"
dimension: things
category: plans
tags: ai, website, builder, claude-code, aisdk, cloudflare, live-preview
related_dimensions: things, events, knowledge
scope: feature
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
ai_context: |
  AI-powered website builder where users describe what they want and Claude Code builds it.
  Live preview of changes, one-click deployment to Cloudflare Pages.
  Location: one/things/plans/ai-website-builder-vibe-code.md
  Purpose: Vibe code website builder with Claude Code as AI SDK provider
---

# AI Website Builder with Claude Code (Vibe Code)

**Vision:** "Tell me what you want your website to look like, and I'll build it for you."

**Stack:** Astro 5 + React 19 + Claude Code (AI SDK) + Convex + Cloudflare Pages
**Core Feature:** AI-powered website building with live preview and one-click deployment
**Philosophy:** Vibe coding - natural language → working website

---

## Overview

Users interact with an AI assistant (powered by Claude Code) to build websites:

```
User: "Create a landing page for my SaaS product with a hero section,
       features grid, and pricing table"

Claude: *generates Astro page with components*
        "I've created your landing page. Preview it on the right.
         Want to adjust the colors or add anything?"

User: "Make it more vibrant and add a testimonials section"

Claude: *updates the code*
        "Done! Your page now has vibrant colors and testimonials.
         Ready to deploy?"

User: "Yes, deploy it"

Claude: *deploys to Cloudflare Pages*
        "Deployed! Your site is live at: https://your-site.pages.dev"
```

---

## 30-Cycle Implementation Plan

### Cycles 1-10: Foundation & AI Setup

**Cycle 1: Design Schema for AI-Assisted Website Building**
- [ ] **websites table:** _id, groupId, userId, name, domain, status
- [ ] **pages table:** _id, websiteId, slug, title, code (Astro/React code), metadata
- [ ] **ai_conversations table:** _id, websiteId, pageId, messages[], status
- [ ] **deployments table:** _id, websiteId, status, url, deployedAt
- [ ] **components_library table:** _id, name, code, category, preview

**Cycle 2: Map to 6-Dimension Ontology**
- [ ] **Things:** website (type: website), page (type: page), ai_assistant (type: ai_clone)
- [ ] **Connections:** user `owns` website, website `contains` pages, ai_assistant `modified` page
- [ ] **Events:** website_created, page_generated, page_updated, deployment_started, deployment_completed
- [ ] **Knowledge:** Component library embeddings (search for similar components)

**Cycle 3: Set Up Claude Code as AI SDK Provider**
- [ ] Create custom provider for Claude Code integration
- [ ] Configure in Vercel AI SDK: `provider: claudeCode({ model: 'claude-sonnet-4' })`
- [ ] Test streaming responses
- [ ] Test tool calling (for code generation, component search)
- [ ] Store API keys in environment variables

**Cycle 4: Create Backend Mutations/Queries**
- [ ] `websites.create` - Create new website project
- [ ] `pages.create` - Create new page (AI-generated or blank)
- [ ] `ai.generatePage` - Generate page from natural language prompt
- [ ] `ai.modifyPage` - Modify existing page based on user request
- [ ] `ai.suggestComponents` - Search component library for matches
- [ ] `deployments.deploy` - Deploy to Cloudflare Pages

**Cycle 5: Build Component Library**
- [ ] **Hero Sections:** 10 variations (centered, split, video background)
- [ ] **Features Grids:** 3-column, 4-column, with icons
- [ ] **Pricing Tables:** 3-tier, comparison, toggle monthly/annual
- [ ] **Testimonials:** Carousel, grid, single
- [ ] **CTAs:** Buttons, forms, banners
- [ ] **Navigation:** Headers, footers, sidebars
- [ ] Store as Astro components with shadcn/ui styling

**Cycle 6: Generate Component Embeddings**
- [ ] Extract description from each component
- [ ] Generate embeddings using OpenAI text-embedding-3-large
- [ ] Store embeddings in knowledge table
- [ ] Enable semantic search: user says "pricing table" → find best match

**Cycle 7: Implement AI Code Generation Tools**
- [ ] **Tool: generateAstroPage**
  - Input: Natural language description
  - Output: Complete .astro file code
  - Uses component library for building blocks
- [ ] **Tool: modifyCode**
  - Input: Current code + modification request
  - Output: Updated code
- [ ] **Tool: searchComponents**
  - Input: Component description
  - Output: Relevant components from library

**Cycle 8: Create AI Conversation Service**
- [ ] **Effect.ts Service:** AIWebsiteBuilderService
- [ ] `generatePageFromPrompt(prompt: string)`
  - Calls Claude Code with generateAstroPage tool
  - Returns generated Astro code
- [ ] `modifyPageWithPrompt(code: string, prompt: string)`
  - Calls Claude Code with current code + modification
  - Returns updated code
- [ ] Track conversation history in ai_conversations table

**Cycle 9: Implement Live Code Execution**
- [ ] **In-browser Astro compilation** (or server-side preview)
- [ ] Hot reload on code changes
- [ ] Iframe preview with responsive controls
- [ ] Error handling (show syntax errors, runtime errors)

**Cycle 10: Add Event Logging**
- [ ] Log ai_page_generated (prompt, tokens, duration)
- [ ] Log ai_page_modified (changes, tokens)
- [ ] Log deployment_started, deployment_completed
- [ ] Track AI usage per user (quota enforcement)

---

### Cycles 11-20: Frontend UI & Live Preview

**Cycle 11: Build Main Editor Layout**
- [ ] **Route:** `/builder/[websiteId]/[pageId]`
- [ ] **Three-panel layout:**
  - Left: AI Chat (conversation with Claude)
  - Center: Live Preview (iframe with responsive controls)
  - Right: Code Editor (Monaco editor, optional)
- [ ] Resizable panels with drag handles

**Cycle 12: Implement AI Chat Interface**
- [ ] Use Prompt Kit components (PromptInput, Message, ChatContainer)
- [ ] Stream AI responses in real-time
- [ ] Show thinking/reasoning process
- [ ] Display generated code in expandable code blocks
- [ ] "Apply Changes" button to update preview

**Cycle 13: Build Live Preview Panel**
- [ ] Iframe renders current page code
- [ ] Device preview controls (mobile, tablet, desktop)
- [ ] Zoom controls
- [ ] Hot reload on code changes
- [ ] Error overlay (show compilation/runtime errors)

**Cycle 14: Add Code Editor (Optional)**
- [ ] Monaco Editor (VS Code editor in browser)
- [ ] Syntax highlighting for Astro, TypeScript, CSS
- [ ] Auto-complete, IntelliSense
- [ ] Ability to manually edit AI-generated code
- [ ] Sync changes back to preview

**Cycle 15: Implement Component Picker**
- [ ] Visual component library browser
- [ ] Search components by name or description
- [ ] Drag-and-drop components into preview
- [ ] AI suggests relevant components based on chat

**Cycle 16: Create Page Management**
- [ ] **Route:** `/builder/[websiteId]/pages`
- [ ] List all pages for website
- [ ] Create new page (blank or AI-generated)
- [ ] Duplicate page
- [ ] Delete page
- [ ] Set homepage

**Cycle 17: Build Website Settings**
- [ ] Configure domain (custom domain or .pages.dev)
- [ ] Set site metadata (title, description, favicon)
- [ ] Configure analytics (Plausible, Google Analytics)
- [ ] Environment variables for production

**Cycle 18: Add AI Conversation History**
- [ ] Show previous prompts and responses
- [ ] Resume conversation from any point
- [ ] Undo/redo AI changes
- [ ] Export conversation as markdown

**Cycle 19: Implement Multi-Page Generation**
- [ ] AI can generate entire website (multiple pages) at once
- [ ] User: "Create a 5-page portfolio site"
- [ ] Claude: Generates home, about, projects, blog, contact pages
- [ ] Show generation progress (page 1/5 generating...)

**Cycle 20: Add Collaborative Editing (Optional)**
- [ ] Real-time sync via Convex (multiple users editing same site)
- [ ] Show cursors of other users
- [ ] Conflict resolution for simultaneous edits

---

### Cycles 21-30: Cloudflare Deployment & Production

**Cycle 21: Implement Cloudflare Pages Deployment**
- [ ] **Service:** CloudflareDeploymentService
- [ ] Use Wrangler API or Cloudflare API
- [ ] Build Astro project (bun run build)
- [ ] Upload dist/ folder to Cloudflare Pages
- [ ] Return deployment URL

**Cycle 22: Create Deployment UI**
- [ ] **Route:** `/builder/[websiteId]/deploy`
- [ ] One-click "Deploy" button
- [ ] Show build logs in real-time
- [ ] Display deployment status (building → deploying → live)
- [ ] Show live URL when complete

**Cycle 23: Add Deployment History**
- [ ] List previous deployments
- [ ] Show deployment timestamp, status, URL
- [ ] Rollback to previous deployment
- [ ] Compare versions (git-style diff)

**Cycle 24: Implement Custom Domains**
- [ ] Add custom domain to Cloudflare Pages
- [ ] DNS configuration instructions
- [ ] SSL certificate auto-provisioning
- [ ] Domain verification

**Cycle 25: Add Environment Variables**
- [ ] Configure env vars for production (API keys, etc.)
- [ ] Separate dev/prod environment variables
- [ ] Secure storage in Convex or Cloudflare

**Cycle 26: Implement Build Optimization**
- [ ] Minify HTML, CSS, JS
- [ ] Optimize images (Astro Image component)
- [ ] Code splitting
- [ ] Tree shaking
- [ ] Target Lighthouse score > 95

**Cycle 27: Add Monitoring & Analytics**
- [ ] Track deployments per user (quota enforcement)
- [ ] Track build times, deploy success/failure rates
- [ ] Monitor live site uptime (Cloudflare Analytics)
- [ ] Show Core Web Vitals in dashboard

**Cycle 28: Create Onboarding Flow**
- [ ] Welcome screen with quick start
- [ ] Sample prompts: "Create a landing page", "Build a blog"
- [ ] Tutorial: chat with AI → preview → deploy
- [ ] Pre-built templates (choose and customize)

**Cycle 29: Implement AI Suggestions**
- [ ] AI suggests improvements: "Add a CTA button", "Improve SEO"
- [ ] AI detects errors: "Missing alt text on images"
- [ ] AI recommends components: "Consider adding testimonials"
- [ ] Proactive assistance based on page analysis

**Cycle 30: Launch MVP & Test**
- [ ] Deploy to production
- [ ] Create sample websites (showcase)
- [ ] User testing with 10 beta users
- [ ] Collect feedback
- [ ] Iterate based on usage

---

## Technical Architecture

### AI Workflow

```typescript
// User sends prompt
const prompt = "Create a landing page for my AI app";

// Call Claude Code via AI SDK
const response = await streamText({
  provider: claudeCode({ model: 'claude-sonnet-4' }),
  messages: [
    { role: 'system', content: WEBSITE_BUILDER_SYSTEM_PROMPT },
    { role: 'user', content: prompt }
  ],
  tools: {
    generateAstroPage: {
      description: 'Generate a complete Astro page from description',
      parameters: z.object({
        description: z.string(),
        components: z.array(z.string()), // Component IDs from library
        layout: z.string(),
      }),
      execute: async ({ description, components, layout }) => {
        // Generate page code using components
        const code = await generatePageCode(components, layout);
        return { code };
      }
    },
    searchComponents: {
      description: 'Search component library for relevant components',
      parameters: z.object({
        query: z.string()
      }),
      execute: async ({ query }) => {
        // Semantic search via embeddings
        const components = await vectorSearch(query);
        return { components };
      }
    }
  }
});

// Stream response to user
for await (const chunk of response.textStream) {
  sendToClient(chunk);
}

// Apply generated code to preview
await updatePreview(response.toolCalls[0].result.code);
```

### Live Preview System

```typescript
// In-browser preview with iframe
const PreviewPanel = ({ code, device }) => {
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    // Compile Astro code on server or in-browser
    const compiledHtml = await compileAstro(code);

    // Create blob URL for iframe
    const blob = new Blob([compiledHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
  }, [code]);

  return (
    <div className={`preview-container ${device}`}>
      <iframe src={previewUrl} sandbox="allow-scripts" />
    </div>
  );
};
```

### Cloudflare Deployment

```typescript
// Deploy to Cloudflare Pages
export const deploySite = async (websiteId: string) => {
  // 1. Build Astro project
  const buildResult = await exec('bun run build');

  // 2. Upload to Cloudflare Pages via API
  const deployment = await fetch('https://api.cloudflare.com/client/v4/accounts/{account_id}/pages/projects/{project_name}/deployments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`
    },
    body: formData // dist/ folder files
  });

  // 3. Poll for deployment status
  const status = await pollDeploymentStatus(deployment.id);

  // 4. Return live URL
  return {
    url: `https://${project_name}.pages.dev`,
    status: 'live'
  };
};
```

---

## Schema Design

### Tables

**websites**
```typescript
{
  _id: Id<"things">,
  type: "website",
  groupId: Id<"groups">,
  userId: Id<"people">,
  name: string,
  domain: string | null, // Custom domain
  properties: {
    settings: {
      title: string,
      description: string,
      favicon: string,
      analytics: { provider: 'plausible' | 'ga', id: string }
    },
    cloudflare: {
      projectId: string,
      accountId: string
    }
  },
  status: "draft" | "live",
  createdAt: number,
  updatedAt: number
}
```

**pages**
```typescript
{
  _id: Id<"things">,
  type: "page",
  websiteId: Id<"things">,
  slug: string,
  title: string,
  properties: {
    code: string, // Astro code
    compiledHtml: string, // Cached compiled output
    metadata: {
      description: string,
      keywords: string[],
      ogImage: string
    }
  },
  status: "draft" | "published",
  createdAt: number,
  updatedAt: number
}
```

**ai_conversations**
```typescript
{
  _id: Id<"things">,
  type: "ai_conversation",
  websiteId: Id<"things">,
  pageId: Id<"things"> | null,
  properties: {
    messages: Array<{
      role: "user" | "assistant",
      content: string,
      timestamp: number,
      toolCalls?: Array<{
        tool: string,
        args: any,
        result: any
      }>
    }>,
    totalTokens: number,
    status: "active" | "completed"
  },
  createdAt: number,
  updatedAt: number
}
```

**deployments**
```typescript
{
  _id: Id<"things">,
  type: "deployment",
  websiteId: Id<"things">,
  properties: {
    status: "building" | "deploying" | "live" | "failed",
    url: string,
    buildLogs: string,
    error: string | null,
    cloudflareDeploymentId: string
  },
  createdAt: number,
  completedAt: number | null
}
```

**components_library**
```typescript
{
  _id: Id<"knowledge">,
  type: "component",
  properties: {
    name: string,
    category: "hero" | "features" | "pricing" | "testimonials" | "cta" | "nav",
    code: string, // Astro component code
    preview: string, // Screenshot URL
    description: string,
    tags: string[]
  },
  embedding: number[], // For semantic search
  createdAt: number
}
```

---

## System Prompts

### Website Builder System Prompt

```markdown
You are an expert web developer helping users build websites with Astro and React.

When a user describes what they want, you:
1. Search the component library for relevant components
2. Generate complete Astro pages using those components
3. Apply Tailwind v4 styling
4. Ensure responsive design (mobile-first)
5. Follow accessibility best practices (WCAG AA)

Available tools:
- generateAstroPage: Create a complete .astro file
- modifyCode: Update existing code based on user request
- searchComponents: Find components in the library

Component library includes:
- Hero sections (centered, split, video background)
- Features grids (3-col, 4-col, with icons)
- Pricing tables (3-tier, comparison)
- Testimonials (carousel, grid)
- CTAs (buttons, forms, banners)
- Navigation (headers, footers)

Guidelines:
- Use shadcn/ui components for UI elements
- Apply consistent spacing (Tailwind spacing scale)
- Ensure dark mode support (@variant dark)
- Optimize for performance (lazy loading, code splitting)
- Generate clean, readable code with comments

When you generate code, explain what you created and why.
```

---

## User Flows

### Flow 1: Create Website from Scratch

```
1. User: Sign up → Create new website
2. AI: "What kind of website do you want to build?"
3. User: "A landing page for my SaaS product"
4. AI: "Great! I'll create a landing page with a hero section,
       features, and pricing. What's your product called?"
5. User: "TaskMaster - a productivity app"
6. AI: *generates landing page*
    "Here's your landing page for TaskMaster. You can see the
     preview on the right. Want to adjust anything?"
7. User: "Add a testimonials section"
8. AI: *adds testimonials*
    "Added testimonials. Ready to deploy?"
9. User: "Yes!"
10. AI: *deploys to Cloudflare*
     "Live at https://taskmaster.pages.dev"
```

### Flow 2: Modify Existing Page

```
1. User: Opens existing page in editor
2. User: "Make the hero section more vibrant"
3. AI: "I'll update the colors to be more vibrant"
    *modifies code*
4. Preview updates in real-time
5. User: "Perfect, deploy it"
6. AI: *redeploys*
```

### Flow 3: Multi-Page Website

```
1. User: "Create a complete portfolio website"
2. AI: "I'll create a portfolio with:
       - Home page (hero + featured projects)
       - About page (bio + skills)
       - Projects page (grid of projects)
       - Blog page (list of posts)
       - Contact page (form)

       Sound good?"
3. User: "Yes!"
4. AI: *generates all 5 pages*
    "Created all pages. Check them out in the pages list."
```

---

## Success Metrics

### MVP (Cycle 10)
- ✅ Claude Code integrated as AI SDK provider
- ✅ AI can generate Astro pages from prompts
- ✅ Component library with 20+ components
- ✅ Live preview updates on code changes

### Beta (Cycle 20)
- ✅ Full editor UI (chat + preview + code)
- ✅ Multi-page generation
- ✅ Component picker and search
- ✅ Conversation history and undo/redo

### Production (Cycle 30)
- ✅ One-click deployment to Cloudflare Pages
- ✅ Custom domain support
- ✅ 10+ beta users building real websites
- ✅ AI suggests improvements proactively
- ✅ Lighthouse score > 95 on deployed sites

---

## Differentiation

**vs. Traditional Website Builders (Webflow, Wix):**
- No drag-and-drop complexity - just describe what you want
- Full code access (not locked into proprietary system)
- Deployed to Cloudflare (fast, cheap, scalable)

**vs. AI Code Generators (v0, GPT):**
- Live preview built-in (no copy-paste)
- One-click deployment (no setup required)
- Component library optimized for common use cases

**vs. Manual Coding:**
- 10x faster (AI does the heavy lifting)
- No need to know Astro, React, Tailwind
- AI handles responsive design, accessibility

---

## Pricing Model

**Free Tier:**
- 1 website
- 10 pages per website
- 100 AI messages per month
- .pages.dev domain

**Pro Tier ($19/month):**
- Unlimited websites
- Unlimited pages
- Unlimited AI messages
- Custom domains
- Priority deployment

**Enterprise ($99/month):**
- White-label
- Team collaboration
- Priority support
- Custom component library

---

## Timeline

**With 1 agent (sequential):** 30 days (1 cycle/day)
**With parallel execution:** 10-15 days
**MVP (Cycle 10):** 3-5 days

---

## Next Steps

1. **Cycle 1:** Design schema and map to ontology
2. **Cycle 2:** Set up Claude Code as AI SDK provider
3. **Cycle 3:** Build component library
4. **Cycle 4:** Implement AI code generation
5. **Cycle 5:** Create live preview system

Ready to build?
