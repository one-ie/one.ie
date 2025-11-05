# Features Documentation Guide

Complete guide for documenting ONE Platform features with marketing-ready content and comprehensive examples.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Feature Schema](#feature-schema)
3. [Components & Usage](#components--usage)
4. [Feature Listing](#feature-listing)
5. [Marketing Copy Guide](#marketing-copy-guide)
6. [All 12 Features](#all-12-features)
7. [Design Tokens](#design-tokens)
8. [Quality Checklist](#quality-checklist)

## Quick Start

### Create a Feature in 3 Steps

1. **Create file** in `/src/content/features/[slug].md`
2. **Copy frontmatter** from `_template.md`
3. **Write content** using examples below

**Minimal example:**
```yaml
---
title: "Two-Factor Authentication"
description: "Bank-level security with SMS and authenticator apps"
featureId: "two-factor-auth"
category: "authentication"
status: "completed"
version: "1.0.0"
releaseDate: 2025-11-04T00:00:00Z
marketingPosition:
  tagline: "Security without the hassle"
  valueProposition: "Protect user accounts with optional 2FA"
  targetAudience: ["SaaS platforms", "Financial apps"]
  pricingImpact: "pro"
---

## Overview

Brief description of the feature.

## Key Benefits

- Benefit 1
- Benefit 2
```

## Feature Schema

Complete schema reference for the `features` content collection.

### Required Fields

| Field | Type | Example | Purpose |
|-------|------|---------|---------|
| `title` | string | "Two-Factor Auth" | Feature display name |
| `description` | string | "Bank-level security" | One-liner for listings |
| `featureId` | string | "two-factor-auth" | Unique identifier |
| `category` | enum | "authentication" | Feature classification |
| `status` | enum | "completed" | Development status |

### Recommended Fields

| Field | Type | Example | Purpose |
|-------|------|---------|---------|
| `version` | string | "1.0.0" | Semantic version |
| `releaseDate` | date | 2025-11-04 | When released |
| `marketingPosition` | object | See below | Positioning & messaging |
| `ontologyDimensions` | array | ["People", "Events"] | 6-dimension mapping |
| `specification` | object | See below | Technical details |
| `metrics` | object | See below | Quality metrics |

### Categories (Choose One)

```
authentication    - Auth methods, security, sessions
ecommerce         - Products, cart, checkout, payments
ai-agents         - AI copilots, automation, chatbots
protocols         - Standards, APIs, communication protocols
payments          - Payment processing, billing, subscriptions
analytics         - Tracking, metrics, dashboards, reporting
content           - Blog, docs, media library, publishing
communication     - Messaging, notifications, chat, email
infrastructure    - Database, hosting, deployment, CDN
integrations      - External services, webhooks, APIs
developer-tools   - SDKs, CLIs, debugging
other             - Anything else (use sparingly)
```

### Status Lifecycle

```
planned → in_development → beta → completed
                                       ↓
                                  deprecated
```

## Components & Usage

### FeatureCard Component

Display a feature in a grid or list:

```astro
---
import FeatureCard from '@/components/FeatureCard.astro';

const feature = {
  title: "Two-Factor Authentication",
  description: "Bank-level security with SMS",
  category: "authentication",
  status: "completed",
  featured: true,
  slug: "two-factor-authentication"
};
---

<FeatureCard feature={feature} />
```

**Props:**
- `feature` - Feature data object
- `showStatus` - Boolean to show status badge
- `showCategory` - Boolean to show category badge
- `layout` - "grid" or "list"

### StatusBadge Component

Show feature status with color:

```astro
import StatusBadge from '@/components/StatusBadge.astro';

<!-- Displays appropriate badge for status -->
<StatusBadge status="completed" />
<StatusBadge status="beta" />
<StatusBadge status="planned" />
```

**Status Colors:**
- `completed` - Green
- `beta` - Orange
- `in_development` - Blue
- `planned` - Gray
- `deprecated` - Red

### CategoryBadge Component

Show feature category:

```astro
import CategoryBadge from '@/components/CategoryBadge.astro';

<CategoryBadge category="authentication" />
<CategoryBadge category="ecommerce" />
```

**Category Colors:**
- `authentication` - Blue/Purple
- `ecommerce` - Green
- `ai-agents` - Orange
- `protocols` - Indigo
- `payments` - Gold
- `analytics` - Cyan
- `content` - Pink
- `communication` - Red
- `infrastructure` - Gray
- `integrations` - Teal
- `developer-tools` - Purple
- `other` - Gray

### FeatureGrid Component

Display multiple features in a responsive grid:

```astro
---
import FeatureGrid from '@/components/FeatureGrid.astro';
import { getCollection } from 'astro:content';

const features = await getCollection('features', ({ data }) => !data.draft);
const completed = features.filter(f => f.data.status === 'completed');
---

<FeatureGrid
  features={completed}
  columns={3}
  showFilters={true}
/>
```

### FeatureFilter Component

Allow users to filter features:

```astro
import FeatureFilter from '@/components/FeatureFilter.astro';

<FeatureFilter
  categories={["authentication", "ecommerce"]}
  statuses={["completed", "beta"]}
  onFilter={(results) => { /* handle */ }}
/>
```

### FeatureBreadcrumb Component

Show feature hierarchy:

```astro
import Breadcrumb from '@/components/Breadcrumb.astro';

<Breadcrumb
  links={[
    { label: 'Home', href: '/' },
    { label: 'Features', href: '/features' },
    { label: 'Two-Factor Auth', href: '/features/2fa' }
  ]}
/>
```

## Feature Listing

### Display All Features (Organized by Category)

```astro
---
import { getCollection } from 'astro:content';

const features = await getCollection('features', ({ data }) => !data.draft);
const categories = [...new Set(features.map(f => f.data.category))];

const featuresByCategory = categories.reduce((acc, cat) => {
  acc[cat] = features.filter(f => f.data.category === cat)
    .sort((a, b) => {
      // Completed first, then by featured
      if (a.data.status === 'completed' && b.data.status !== 'completed') return -1;
      if (a.data.featured && !b.data.featured) return -1;
      return 0;
    });
  return acc;
}, {});
---

{Object.entries(featuresByCategory).map(([category, items]) => (
  <div class="category-section">
    <h2>{category}</h2>
    <div class="feature-grid">
      {items.map(feature => (
        <FeatureCard feature={feature.data} slug={feature.slug} />
      ))}
    </div>
  </div>
))}
```

### Display Featured Features

```astro
---
const featured = features
  .filter(f => f.data.featured && f.data.status === 'completed')
  .slice(0, 6);
---

<div class="featured-section">
  <h2>Featured Capabilities</h2>
  <FeatureGrid features={featured} columns={3} />
</div>
```

### Display by Status

```astro
---
const completed = features.filter(f => f.data.status === 'completed');
const beta = features.filter(f => f.data.status === 'beta');
const planned = features.filter(f => f.data.status === 'planned');
---

<h2>Now Available</h2>
<FeatureGrid features={completed} />

<h2>Beta Testing</h2>
<FeatureGrid features={beta} />

<h2>Coming Soon</h2>
<FeatureGrid features={planned} />
```

### Pagination Example

```astro
---
import Pagination from '@/components/Pagination.astro';

const ITEMS_PER_PAGE = 12;
const currentPage = parseInt(Astro.url.searchParams.get('page') ?? '1');
const totalPages = Math.ceil(features.length / ITEMS_PER_PAGE);
const start = (currentPage - 1) * ITEMS_PER_PAGE;
const paginatedFeatures = features.slice(start, start + ITEMS_PER_PAGE);
---

<FeatureGrid features={paginatedFeatures} />

<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  baseUrl="/features"
/>
```

## Marketing Copy Guide

### Writing Great Feature Descriptions

**Formula for compelling descriptions:**

```
[Benefit] + [Proof/Feature] + [Who it helps]

Examples:

Good:
"Zero friction. Bank-level security with six auth methods."
- Benefit (zero friction) + Feature (6 methods) + Proof (bank-level)

Better:
"Let users log in however they prefer. Email, OAuth, magic links, or 2FA."
- Benefit (users' preference) + Feature specifics + Proof (options)

Best:
"Reduce signup friction from 45% to 8%. Six auth methods let users choose."
- Metric + Benefit + Feature specifics
```

### Tagline Formula

**Keep it punchy (5-10 words):**

```
[Action] + [Benefit] + [Proof]

Examples:
"Authenticate in one click." (Action + Benefit)
"Zero passwords. Maximum security." (Benefit contrast)
"Payments that just work." (Benefit + Simplicity)
"AI that understands your business." (Feature + Value)
"Scale without limits or complexity." (Benefit + Proof)
```

### Value Proposition Template

**2-3 sentences explaining why users need this:**

```markdown
## Poor Example:
"This feature provides multi-method authentication using JWT tokens
and bcrypt hashing for secure password storage with optional 2FA support."
(Too technical, no benefit)

## Good Example:
"Reduce account abandonment during signup. Users can authenticate with
their preferred method—no passwords required. Bank-level security means
you can trust it with sensitive data."
(Benefits + Simplicity + Trust)

## Better Example:
"Every percentage point of signup friction costs you customers.
Our six authentication methods let users pick their favorite,
cutting abandonment rates by 37% on average."
(Metric + Specific benefit + Proof)
```

### Target Audience Examples

```yaml
targetAudience:
  # B2B SaaS
  - "HR & payroll platforms"
  - "Project management tools"
  - "CRM systems"

  # E-commerce
  - "Marketplace platforms"
  - "Subscription services"
  - "Niche retailers"

  # Content & Creator
  - "Creator platforms"
  - "Community networks"
  - "Online courses"

  # Enterprise
  - "Financial institutions"
  - "Healthcare providers"
  - "Government agencies"
```

### Competitive Advantage Template

```yaml
# Framework: What makes us different?
competitiveAdvantage: |
  Unlike traditional auth systems that require password management,
  we offer passwordless options without sacrificing security.
  Integrated with Convex real-time database for instant updates
  and seamless multi-device synchronization.

# OR use comparison table
competitiveAdvantage: |
  - Better Auth: Passwordless + Multi-provider
  - Auth0: Passwordless ✓, Multi-provider ✓, Real-time ✗
  - Firebase: Passwordless ✗, Multi-provider ✓, Real-time ✓
  - ONE: All three + Convex speed = Fastest, most secure option
```

## All 12 Features

### 1. Authentication System

**File:** `auth.md`

```yaml
title: "Authentication System"
description: "Enterprise-grade multi-method authentication"
featureId: "auth"
category: "authentication"
status: "completed"

marketingPosition:
  tagline: "Zero friction. Bank-level security."
  valueProposition: "Six auth methods so users never get stuck. Enterprise security for everyone."
  targetAudience:
    - "SaaS platforms"
    - "E-commerce stores"
    - "Creator platforms"
  competitiveAdvantage: "Better Auth + Convex = fastest, most secure"
  pricingImpact: "free"
```

**Sub-features:**
- Email/Password authentication
- OAuth social login (Google, GitHub, Discord, Microsoft)
- Magic link passwordless
- Two-factor authentication (SMS + TOTP)
- Email verification
- Password reset flow
- Session management
- Device management

**Metrics:**
- Test coverage: 96%
- Performance: 99/100
- Accessibility: 100/100
- Security audit: Yes

---

### 2. E-Commerce Products

**File:** `ecommerce-products.md`

```yaml
title: "E-Commerce Products"
description: "Complete product catalog system with variants"
featureId: "ecommerce-products"
category: "ecommerce"
status: "completed"

marketingPosition:
  tagline: "Sell anything. Scale infinitely."
  valueProposition: "Product catalog that grows with your business."
  targetAudience:
    - "Marketplace platforms"
    - "Niche retailers"
    - "Drop-shipping services"
  pricingImpact: "starter"
```

**Sub-features:**
- Product catalog management
- Variant support (color, size, SKU)
- Category organization
- Collection curation
- Product search and filtering
- Image galleries
- Inventory tracking
- Product analytics

---

### 3. AI Chat Assistant

**File:** `ai-chat-assistant.md`

```yaml
title: "AI Chat Assistant"
description: "Intelligent chatbot for customer support"
featureId: "ai-chat-assistant"
category: "ai-agents"
status: "completed"

marketingPosition:
  tagline: "Support that scales. Answers that help."
  valueProposition: "AI handles 80% of support questions."
  targetAudience:
    - "Customer support teams"
    - "E-commerce operations"
    - "SaaS platforms"
  pricingImpact: "pro"
```

**Sub-features:**
- Natural language understanding
- Multi-turn conversations
- Knowledge base integration
- Escalation to humans
- Conversation analytics
- Custom training data

---

### 4. Blog System

**File:** `blog.md`

```yaml
title: "Blog System"
description: "Publish and manage blog posts"
featureId: "blog"
category: "content"
status: "completed"

marketingPosition:
  tagline: "Share your story. Build your audience."
  valueProposition: "Publish to every channel from one editor."
  targetAudience:
    - "Creator platforms"
    - "Corporate websites"
    - "Community builders"
  pricingImpact: "free"
```

**Sub-features:**
- Rich text editor
- Markdown support
- Scheduled publishing
- SEO optimization
- Category/tag organization
- Author profiles
- Reading time estimation
- Social sharing

---

### 5. Documentation System

**File:** `docs.md`

```yaml
title: "Documentation System"
description: "Technical docs with search and versioning"
featureId: "docs"
category: "content"
status: "completed"

marketingPosition:
  tagline: "Docs that answer questions before they're asked."
  valueProposition: "Searchable documentation reduces support burden."
  targetAudience:
    - "Developer platforms"
    - "SaaS companies"
    - "Open-source projects"
  pricingImpact: "free"
```

**Sub-features:**
- Markdown documentation
- Full-text search
- Version management
- API reference generation
- Code example highlighting
- Sidebar navigation
- Breadcrumb navigation

---

### 6. View Transitions

**File:** `view-transitions.md`

```yaml
title: "View Transitions"
description: "Smooth page transitions and animations"
featureId: "view-transitions"
category: "infrastructure"
status: "completed"

marketingPosition:
  tagline: "Every click feels instant."
  valueProposition: "Smooth transitions reduce perceived loading time by 50%."
  targetAudience:
    - "Web applications"
    - "Single-page apps"
    - "Marketplaces"
  pricingImpact: "free"
```

**Sub-features:**
- Page transition animations
- Loading state animations
- Skeleton screens
- Progress indicators
- Fade effects
- Slide animations

---

### 7. Hooks System

**File:** `hooks.md`

```yaml
title: "Hooks System"
description: "React hooks for common patterns"
featureId: "hooks"
category: "developer-tools"
status: "completed"

marketingPosition:
  tagline: "Reusable logic. Less code. More velocity."
  valueProposition: "Pre-built hooks eliminate boilerplate."
  targetAudience:
    - "React developers"
    - "Frontend teams"
    - "Startups"
  pricingImpact: "free"
```

**Sub-features:**
- `useAuth` - Authentication state
- `useCart` - Shopping cart management
- `useFetch` - Data fetching
- `useLocalStorage` - Persistent state
- `useMediaQuery` - Responsive design

---

### 8. Agent System

**File:** `agents.md`

```yaml
title: "Agent System"
description: "AI agents that automate tasks"
featureId: "agents"
category: "ai-agents"
status: "in_development"

marketingPosition:
  tagline: "Agents that do the work. You keep the control."
  valueProposition: "Automation without coding."
  targetAudience:
    - "Operations teams"
    - "Content creators"
    - "Workflow managers"
  pricingImpact: "enterprise"
```

**Sub-features:**
- Agent creation UI
- Task automation
- Scheduled execution
- Error handling
- Audit trail

---

### 9. Commands System

**File:** `commands.md`

```yaml
title: "Commands System"
description: "Slash commands for quick actions"
featureId: "commands"
category: "communication"
status: "planned"

marketingPosition:
  tagline: "Type fast. Do more."
  valueProposition: "Powers up your workflow with slash commands."
  targetAudience:
    - "Collaboration tools"
    - "Chat platforms"
    - "Developer tools"
  pricingImpact: "pro"
```

---

### 10. Skills System

**File:** `skills.md`

```yaml
title: "Skills System"
description: "Track and showcase user skills"
featureId: "skills"
category: "content"
status: "planned"

marketingPosition:
  tagline: "Let skills speak for themselves."
  valueProposition: "Profile completeness increases 40% with skills."
  targetAudience:
    - "Job platforms"
    - "Community networks"
    - "Skill marketplaces"
  pricingImpact: "starter"
```

---

### 11. Landing Pages

**File:** `landing-pages.md`

```yaml
title: "Landing Pages"
description: "Drag-and-drop landing page builder"
featureId: "landing-pages"
category: "content"
status: "planned"

marketingPosition:
  tagline: "Ship landing pages in minutes. No code."
  valueProposition: "Create high-converting pages faster."
  targetAudience:
    - "SaaS founders"
    - "Marketers"
    - "Agencies"
  pricingImpact: "pro"
```

---

### 12. SEO

**File:** `seo.md`

```yaml
title: "SEO"
description: "Built-in SEO optimization tools"
featureId: "seo"
category: "analytics"
status: "in_development"

marketingPosition:
  tagline: "Search engine friendly. Google approved."
  valueProposition: "30% more organic traffic with proper SEO."
  targetAudience:
    - "Content creators"
    - "E-commerce stores"
    - "Publishers"
  pricingImpact: "free"
```

**Sub-features:**
- Meta tag management
- Sitemap generation
- Robots.txt configuration
- Structured data (JSON-LD)
- Open Graph tags
- Twitter card optimization

---

## Design Tokens

### Status Colors

Use these colors consistently across the platform:

```css
/* Completed - Green */
--status-completed: #10b981;      /* Green 500 */
--status-completed-light: #d1fae5;  /* Green 100 */
--status-completed-dark: #047857;   /* Green 700 */

/* Beta - Orange */
--status-beta: #f59e0b;           /* Amber 500 */
--status-beta-light: #fef3c7;       /* Amber 100 */
--status-beta-dark: #d97706;        /* Amber 600 */

/* In Development - Blue */
--status-development: #3b82f6;    /* Blue 500 */
--status-development-light: #dbeafe; /* Blue 100 */
--status-development-dark: #1d4ed8;  /* Blue 700 */

/* Planned - Gray */
--status-planned: #6b7280;        /* Gray 500 */
--status-planned-light: #f3f4f6;    /* Gray 100 */
--status-planned-dark: #374151;     /* Gray 700 */

/* Deprecated - Red */
--status-deprecated: #ef4444;     /* Red 500 */
--status-deprecated-light: #fee2e2;  /* Red 100 */
--status-deprecated-dark: #dc2626;   /* Red 700 */
```

### Category Colors

Consistent colors for each feature category:

```css
/* Authentication - Blue/Purple */
--category-authentication: #6366f1;  /* Indigo 500 */

/* E-Commerce - Green */
--category-ecommerce: #10b981;      /* Emerald 500 */

/* AI Agents - Orange */
--category-ai-agents: #f59e0b;      /* Amber 500 */

/* Protocols - Deep Indigo */
--category-protocols: #4f46e5;      /* Indigo 600 */

/* Payments - Gold */
--category-payments: #f59e0b;       /* Amber 500 */

/* Analytics - Cyan */
--category-analytics: #06b6d4;      /* Cyan 500 */

/* Content - Pink */
--category-content: #ec4899;        /* Pink 500 */

/* Communication - Red */
--category-communication: #ef4444;  /* Red 500 */

/* Infrastructure - Gray */
--category-infrastructure: #8b5cf6;  /* Violet 500 */

/* Integrations - Teal */
--category-integrations: #14b8a6;   /* Teal 500 */

/* Developer Tools - Purple */
--category-developer-tools: #a855f7; /* Purple 500 */

/* Other - Gray */
--category-other: #6b7280;          /* Gray 500 */
```

### Typography Scale

```css
/* Feature Title (on Cards) */
font-size: 1.125rem;    /* 18px */
font-weight: 600;
line-height: 1.5;

/* Feature Category Badge */
font-size: 0.75rem;    /* 12px */
font-weight: 600;
text-transform: uppercase;

/* Feature Description */
font-size: 0.875rem;   /* 14px */
font-weight: 400;
line-height: 1.6;
color: #6b7280;        /* Gray 500 */

/* Section Heading */
font-size: 1.875rem;   /* 30px */
font-weight: 700;
line-height: 1.2;
```

### Component Usage

**Applying design tokens:**

```astro
---
import { statusColorMap, categoryColorMap } from '@/lib/design-tokens';

const status = 'completed';
const category = 'authentication';

const statusColor = statusColorMap[status];  // #10b981
const categoryColor = categoryColorMap[category]; // #6366f1
---

<div
  class="status-badge"
  style={`background-color: ${statusColor}; color: white;`}
>
  {status}
</div>

<div
  class="category-badge"
  style={`background-color: ${categoryColor}; color: white;`}
>
  {category}
</div>
```

## Quality Checklist

### Pre-Publication Checklist

Before publishing a feature, verify:

#### Metadata
- [ ] `title` is clear and marketing-focused (not technical)
- [ ] `description` is under 140 characters
- [ ] `description` leads with benefit, not feature
- [ ] `featureId` matches filename in kebab-case
- [ ] `category` is exactly one of the 12 standard categories
- [ ] `status` is one of: planned, in_development, beta, completed, deprecated
- [ ] `version` follows semantic versioning (MAJOR.MINOR.PATCH)
- [ ] `releaseDate` or `plannedDate` is set and valid ISO format
- [ ] File has NO typos in frontmatter

#### Marketing
- [ ] `marketingPosition.tagline` is punchy (5-10 words)
- [ ] `marketingPosition.valueProposition` explains WHY (not WHAT)
- [ ] `targetAudience` has 2-4 specific personas (not generic "users")
- [ ] `competitiveAdvantage` is concrete (not vague)
- [ ] `pricingImpact` is set to: free, starter, pro, or enterprise

#### Ontology
- [ ] `ontologyDimensions` lists 2-6 dimensions being used
- [ ] `ontologyMapping` has explanation for EACH dimension listed
- [ ] Mapping actually makes sense (think about it!)
- [ ] NO "placeholder text" in mapping fields

#### Technical
- [ ] `specification.complexity` is set: simple, moderate, complex, expert
- [ ] `specification.technologies` lists actual tech stack used
- [ ] `specification.dependencies` lists real dependencies
- [ ] `specification.apiEndpoints` (if applicable) has working endpoints
- [ ] All HTTP methods are correct (GET, POST, PUT, PATCH, DELETE)
- [ ] API paths follow RESTful conventions

#### Quality Metrics
- [ ] `metrics.testCoverage` is 0-100 and realistic
- [ ] `metrics.performanceScore` is 0-100 (Lighthouse)
- [ ] `metrics.accessibilityScore` is 0-100 (WCAG)
- [ ] `metrics.securityAudit` is boolean (true/false)
- [ ] All metrics are based on actual test results (not guesses)

#### Content
- [ ] Overview section is 2-3 paragraphs, not 1 or 10
- [ ] Overview leads with benefit, not feature
- [ ] List of capabilities/features included
- [ ] Use cases section has 2-4 real-world scenarios
- [ ] Use cases describe PROBLEMS solved, not features
- [ ] Code examples (if applicable) are functional
- [ ] Code examples have language tags (```typescript, etc)
- [ ] No incomplete sentences or lorem ipsum text
- [ ] Grammar and spell check passed

#### Design
- [ ] Uses H2 headers for main sections (not H1)
- [ ] Uses H3 for subsections
- [ ] No H4 or deeper nesting (keeps it simple)
- [ ] Bullet points used for lists (not numbered unless steps)
- [ ] Bold used for emphasis, not capitals or HTML
- [ ] No custom HTML (use Markdown only)
- [ ] Code blocks are properly indented
- [ ] Links use relative paths (/features/, not http://)

#### Related Features
- [ ] `relatedFeatures` has 2-4 actual feature IDs
- [ ] All related features actually exist
- [ ] NO self-references or circular links
- [ ] Related features make sense together

#### Documentation
- [ ] If applicable, `documentation` links point to real pages
- [ ] All links are valid (no 404s)
- [ ] Links open in same tab (no target="_blank")

#### Final
- [ ] Proofread for typos and grammar
- [ ] Feature makes sense from user's perspective
- [ ] Feature would be worth showing to customers
- [ ] You'd be proud to publish this
- [ ] Category placement makes sense

### Content Quality Scoring

Use this rubric to assess feature documentation quality:

**5 Stars (Publish Immediately)**
- All checklist items ✓
- Compelling copy that sells the benefit
- Accurate, specific metrics
- Clear ontology alignment
- Working code examples
- Professional writing

**4 Stars (Minor Revisions)**
- 95%+ checklist items ✓
- Good marketing copy, minor tweaks needed
- Realistic metrics (but could add more detail)
- Clear ontology mapping
- Working examples (but could add more)
- Minor grammar/formatting

**3 Stars (Significant Revisions)**
- 85-95% checklist items ✓
- Marketing copy is functional but bland
- Some missing metrics or unclear
- Ontology mapping needs clarification
- Examples missing or incomplete
- Several grammar issues

**2 Stars (Rewrite Required)**
- 70-85% checklist items ✓
- Weak marketing messaging
- Major metrics missing
- Ontology unclear
- No examples
- Significant grammar/spelling issues

**1 Star (Reject - Not Ready)**
- <70% checklist items ✓
- No marketing angle
- Incomplete or placeholder text
- Poor grammar
- Missing critical information
- Not ready to publish

### Automated Validation

Run type checking to validate frontmatter:

```bash
bunx astro check
```

This validates:
- Required fields present
- Enum values are correct (category, status, complexity, etc)
- Date formats are valid ISO
- No extra fields outside schema
- Type safety for all fields

## Examples: Good vs Poor

### Example 1: Feature Description

**Poor:**
```
description: "This feature provides authentication functionality for users to sign in and sign up"
```
- Too long (technical, not marketing)
- Doesn't say WHY it matters
- Generic language

**Good:**
```
description: "Six authentication methods let users choose their preferred way to log in"
```
- Under 140 characters
- Benefit-focused
- Concrete and specific

**Excellent:**
```
description: "Cut signup abandonment by 37%. Users log in their preferred way—OAuth, magic link, or 2FA"
```
- Includes metric (proof)
- Leads with benefit
- Specific and compelling

---

### Example 2: Tagline

**Poor:**
```
tagline: "Authentication and authorization system"
```
- Not marketing-focused
- Too technical
- No emotional resonance

**Good:**
```
tagline: "Zero passwords. Maximum security."
```
- Contrasts benefit with security
- Memorable
- 5 words

**Excellent:**
```
tagline: "Users log in one click. You sleep like a bank."
```
- Shows benefit AND proof
- Speaks to stakeholder concern (security)
- Under 10 words

---

### Example 3: Marketing Position

**Before:**
```yaml
marketingPosition:
  tagline: "Email and password authentication"
  valueProposition: "Provides a way for users to create accounts and log in"
  targetAudience: ["Users"]
  competitiveAdvantage: "Better than manual user management"
  pricingImpact: "free"
```
(Vague, generic, non-marketing)

**After:**
```yaml
marketingPosition:
  tagline: "Zero friction. Bank-level security."
  valueProposition: |
    Reduce signup abandonment from 45% to 8%. Users authenticate their
    preferred way—email, OAuth, magic links, or 2FA. Real-time session
    management works across all devices seamlessly.
  targetAudience:
    - "SaaS platforms losing customers at signup"
    - "E-commerce stores with cart abandonment"
    - "Creator platforms onboarding users fast"
  competitiveAdvantage: |
    Better Auth + Convex database = Fastest passwordless auth with
    real-time synchronization. No session sync delays. No auth database
    to manage separately.
  pricingImpact: "free"
```
(Specific, metrics-driven, customer-focused)

---

## Summary

This comprehensive guide provides:

1. **Quick Start** - Get features documented in minutes
2. **Schema Reference** - All required and optional fields explained
3. **Components** - Ready-to-use Astro components for displaying features
4. **Listing Examples** - How to show features on your site
5. **Marketing Copy** - Formulas for compelling descriptions
6. **12 Features** - Complete examples of all platform features
7. **Design Tokens** - Consistent colors and typography
8. **Quality Checklist** - Pre-publication validation
9. **Before/After** - Learn from real examples

Use this guide to create marketing-ready documentation that sells features while maintaining technical accuracy.

**Next Steps:**
1. Create your feature using the template (`_template.md`)
2. Run through the quality checklist
3. Compare your copy against good examples
4. Get peer review before publishing
5. Celebrate shipping! 🎉

---

**Last updated:** November 4, 2025
**Guide version:** 1.0.0
**Schema version:** 1.0.0
