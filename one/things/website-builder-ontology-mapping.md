---
title: AI Website Builder - Ontology Mapping
dimension: things
category: website-builder
tags: ontology, website-builder, platform, design, ai, mapping
related_dimensions: groups, people, connections, events, knowledge
scope: platform
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
ai_context: |
  This document maps the AI website builder to the 6-dimension ontology.
  The website builder enables users to create, design, and deploy websites using AI.
  All features map cleanly to the core 6 dimensions without creating new dimensions or breaking patterns.
---

# AI Website Builder - Ontology Mapping

**Version:** 1.0.0
**Status:** Specification - CYCLE 2 Ontology Mapping
**Purpose:** Define how the AI website builder maps to the ONE Platform's 6-dimension ontology
**Author:** Ontology Guardian Agent

---

## Executive Summary

The AI website builder is a feature-complete platform for creating, designing, and deploying websites using AI assistance. All capabilities map cleanly to the existing 6-dimension ontology without creating new dimensions or prototype patterns.

**Key Principle:** The website builder doesn't need new data structures. It uses the existing `website`, `landing_page`, `template`, and `ai_clone` thing types with rich metadata, connections, and events.

---

## Cycle 2: Mapping to 6 Dimensions

### Dimension 1: GROUPS - Multi-Tenant Isolation

**Purpose:** Isolate each user/organization's websites and data

**Thing Structure:**
```typescript
// Creator's personal group (group_owner can build websites here)
{
  _id: Id<'groups'>,
  slug: 'acme-studios',           // URL: /group/acme-studios
  name: 'Acme Digital Studios',
  type: 'business',                // business, friend_circle, community
  parentGroupId?: null,            // Can have parent org
  settings: {
    visibility: 'private',         // Only members can access
    joinPolicy: 'invite_only',
    plan: 'pro'                    // Free → Pro → Enterprise
  },
  metadata: {
    industry: 'marketing',
    website_builder_enabled: true,
    component_library_size: 150,   // Components created in this group
    deployed_websites: 5
  }
}
```

**Access Control:**
- `group_owner`: Full control of all websites in group
- `group_user`: Can create/edit websites (if permitted)
- `customer`: Can only view published websites
- `platform_owner`: Can access for support

**Scoping Pattern:**
```typescript
// CRITICAL: All website builder queries MUST filter by groupId
const websites = await db
  .query('things')
  .withIndex('by_type', q => q.eq('type', 'website'))
  .filter(q => q.eq(q.field('groupId'), currentGroupId))
  .collect();
```

---

### Dimension 2: PEOPLE - Authorization & Governance

**People Thing Structure:**
```typescript
{
  _id: Id<'people'>,
  email: 'creator@acme.com',
  username: 'acme-creator',
  displayName: 'Acme Creator',
  role: 'group_owner',              // Who can what
  groupId: groupId,                 // Current/default group
  groups: [groupId, ...],           // All groups this person belongs to
  permissions: [
    'create_website',
    'create_page',
    'design_page',
    'publish_website',
    'deploy_website'
  ],
  properties: {
    designerSkill: 'advanced',       // novice|intermediate|advanced
    preferredTheme: 'dark',
    templatePreferences: ['minimal', 'commerce'],
    recentWebsites: [websiteId1, websiteId2, ...]
  }
}
```

**Permission Model:**
| Role | Can Create | Can Design | Can Publish | Can Deploy | Can Invite |
|------|-----------|-----------|-----------|-----------|-----------|
| platform_owner | ✅ | ✅ | ✅ | ✅ | ✅ |
| group_owner | ✅ | ✅ | ✅ | ✅ | ✅ |
| group_user | ✅* | ✅* | ✅* | ❌ | ❌ |
| customer | ❌ | ❌ | ❌ | ❌ | ❌ |

*= if granted by group_owner

---

### Dimension 3: THINGS - All Website Builder Entities (66 Types)

#### Core Thing Types Used by Website Builder

**1. Website (platform category)**
```yaml
type: website
category: platform
description: Auto-generated creator site or custom website
properties:
  title: string                    # Display name
  slug: string                     # URL identifier (/websites/{slug})
  description: string?             # SEO description
  domain: string?                  # Custom domain (example.com)
  favicon: string?                 # favicon URL
  theme: object                    # Design system + colors
    primaryColor: '#000000'
    secondaryColor: '#FFFFFF'
    accentColor: '#FF5733'
    fontFamily: 'Inter, sans-serif'
    fontSize: 16
  metadata:
    generatedBy: 'ai|human|hybrid'
    templateUsed: templateId?       # Which template was used
    aiCloneId: aiCloneId?           # Which AI assisted
    analytics: true|false           # Track visitors
    seoOptimized: true|false
    publishedAt: number?
    deploymentStatus: 'draft|staging|production'
    domainSetupCompleted: boolean
    dnsConfigured: boolean
  homepage: pageId                 # Reference to homepage thing
  pages: [pageId, ...]             # All pages in website
```

**2. Landing Page (platform category)**
```yaml
type: landing_page
description: Specific landing page type with conversion focus
properties:
  title: string                    # Page title
  slug: string                     # URL path (/services, /pricing)
  headline: string                 # Main headline
  subheading: string?              # Subheading text
  ctaText: string                  # Call-to-action button text
  ctaUrl: string                   # Where CTA leads
  sections: [
    {
      type: 'hero|feature|testimonial|pricing|contact|faq'
      content: { ... }
      layout: 'full_width|two_column|three_column'
      backgroundColor: string?
      backgroundImage: string?
    }
  ]
  seoMetadata:
    metaTitle: string
    metaDescription: string
    keywords: string[]
    ogImage: string?
  conversionTracking:
    trackingId: string?             # GTM, Mixpanel, etc.
    conversionGoal: string?         # Form submit, purchase, etc.
```

**3. Page (content category)**
```yaml
type: blog_post  # Using blog_post for generic page content
description: Individual page within a website
properties:
  title: string
  slug: string
  content: string                  # HTML or markdown
  excerpt: string?
  sections: [
    {
      type: 'text|image|video|form|component'
      content: { ... }
      componentId: componentId?     # Reference to component
      styling: { ... }
    }
  ]
  metadata:
    layout: 'landing|blog|portfolio|documentation'
    publishedAt: number?
    lastEditedBy: personId
    editCount: number
    editHistory: [
      { timestamp, personId, changes }
    ]
    thumbnail: string?              # Page preview image
```

**4. Website Component (digital_product category)**
```yaml
type: digital_product
description: Reusable UI component or module
subtype: 'component|section|module'
properties:
  name: string                     # "Hero Banner", "Product Card"
  description: string?
  thumbnail: string?               # Component preview
  category: string                 # 'header|footer|hero|form|card|gallery|etc'
  framework: 'html|react|vue|svelte'
  code: string                     # HTML/React code
  props: [                          # Component parameters
    {
      name: 'title'
      type: 'string|number|boolean|object'
      default: any
      description: string?
    }
  ]
  styling:
    css: string                     # Component styles
    tailwindClasses: string[]
    customVariables: { ... }        # CSS variables
  metadata:
    popularity: number              # Download count
    rating: number                  # 1-5 stars
    usedInPages: [pageId, ...]      # Which pages use it
    usedInWebsites: [websiteId, ...]
    version: '1.0.0'
    licenseType: 'free|paid|pro'
    generatedBy: aiCloneId?
```

**5. Template (platform category)**
```yaml
type: template
description: Website template with pre-designed layout
properties:
  name: string                     # "Minimalist Portfolio"
  slug: string
  description: string?
  category: string                 # 'portfolio|ecommerce|blog|landing|saas'
  thumbnail: string                # Preview image
  demoUrl: string?                 # Live demo link
  pages: [                          # Pre-built page structure
    {
      title: 'Homepage'
      slug: 'index'
      sections: [...]               # Pre-built sections
    },
    {
      title: 'About'
      slug: 'about'
      sections: [...]
    }
  ]
  designSystem:
    colors: { ... }
    typography: { ... }
    spacing: { ... }
    components: [componentId, ...]
  metadata:
    category: 'portfolio|ecommerce|blog'
    difficulty: 'beginner|intermediate|advanced'
    customizable: boolean           # Can users modify
    premium: boolean                # Free or paid
    downloads: number
    rating: number
    generatedBy: aiCloneId?
```

**6. Design System / Style Guide (knowledge_item or digital_product)**
```yaml
type: digital_product
subtype: 'design-system'
properties:
  name: string                     # "Acme Brand Guidelines"
  description: string?
  colors:
    primary: '#000000'
    secondary: '#FFFFFF'
    accent: '#FF5733'
    neutrals: { ... }
    semantic: { success, warning, error, info }
  typography:
    headingFont: 'Playfair Display'
    bodyFont: 'Inter'
    sizes: { h1, h2, h3, h4, h5, h6, body, small }
    lineHeights: { ... }
    letterSpacing: { ... }
  spacing:
    scale: [4, 8, 12, 16, 24, 32, 48, 64, 96]
    useCase: '4px = spacing scale'
  components:
    buttons: { ... }
    inputs: { ... }
    cards: { ... }
    navigation: { ... }
  metadata:
    generatedBy: aiCloneId?
    brandVoice: string?             # Tone and style description
    accessibilityLevel: 'wcag-a|wcag-aa|wcag-aaa'
```

**7. AI Clone (core category)**
```yaml
type: ai_clone
description: AI assistant that helps with website design/generation
properties:
  name: string                     # "Design Assistant", "Content Writer"
  role: string                     # 'designer|developer|copywriter|seo_expert'
  voiceId: string?                 # Elevenlabs, Azure TTS
  systemPrompt: string             # AI instruction set
  knowledgeBase: [
    {
      type: 'design-principles|brand-guidelines|templates|components'
      content: string
    }
  ]
  capabilities: [                  # What this AI can do
    'generate_page',
    'create_component',
    'write_copy',
    'suggest_layout',
    'optimize_seo',
    'generate_images'
  ]
  metadata:
    trainedOn: [websiteId, ...]     # Websites this AI learned from
    generationModel: 'gpt-4|claude-3|custom'
    temperature: 0.7                # Creativity level
    maxTokens: 2000
    style: 'minimalist|detailed|professional|creative'
    lastUsed: number?
    usageCount: number
    userRating: number?             # 1-5 stars
```

---

### Dimension 4: CONNECTIONS - Relationships (25 Types)

#### Key Connection Types for Website Builder

**1. Ownership Relationships**
```yaml
# Creator owns website
{
  fromThingId: creatorId            # Person (type: creator)
  toThingId: websiteId              # Website
  relationshipType: 'owns'
  metadata: null
}

# Creator owns page
{
  fromThingId: creatorId
  toThingId: pageId
  relationshipType: 'owns'
  metadata: null
}

# Creator owns component
{
  fromThingId: creatorId
  toThingId: componentId
  relationshipType: 'owns'
  metadata: null
}
```

**2. Composition Relationships (part_of)**
```yaml
# Page is part of website
{
  fromThingId: pageId
  toThingId: websiteId
  relationshipType: 'part_of'
  metadata:
    order: 2                        # Navigation order
    isHomepage: false
}

# Section is part of page
{
  fromThingId: sectionId
  toThingId: pageId
  relationshipType: 'part_of'
  metadata:
    order: 1
}

# Component is part of page
{
  fromThingId: componentId
  toThingId: pageId
  relationshipType: 'part_of'
  metadata:
    placement: 'hero|content|footer'
    props: { title: 'Hero Banner', ... }
}
```

**3. Template Usage**
```yaml
# Website uses template
{
  fromThingId: websiteId
  toThingId: templateId
  relationshipType: 'created_by'    # or references
  metadata:
    customized: true                # How much was modified
    changes: [...]                  # List of changes
}
```

**4. Component Relationships (references)**
```yaml
# Page references component
{
  fromThingId: pageId
  toThingId: componentId
  relationshipType: 'references'
  metadata:
    usage: 'header|hero|card|footer'
    props: { ... }                  # Component props for this instance
}

# Component references design system
{
  fromThingId: componentId
  toThingId: designSystemId
  relationshipType: 'references'
  metadata:
    colorPalette: 'primary'
    typography: 'heading'
}
```

**5. AI Assistance (generated_by)**
```yaml
# Page generated by AI clone
{
  fromThingId: pageId
  toThingId: aiCloneId
  relationshipType: 'generated_by'
  metadata:
    prompt: 'Create a landing page for SaaS product'
    model: 'gpt-4'
    confidence: 0.92                # AI confidence score
    editsMade: 3                    # Human edits after generation
}

# Component generated by AI
{
  fromThingId: componentId
  toThingId: aiCloneId
  relationshipType: 'generated_by'
  metadata:
    generationTime: 1234            # ms taken to generate
    variations: 5                   # How many options AI offered
    selectedIndex: 2                # Which one user selected
}
```

**6. Design System References (trained_on)**
```yaml
# AI clone trained on design system
{
  fromThingId: aiCloneId
  toThingId: designSystemId
  relationshipType: 'trained_on'
  metadata:
    trainingType: 'brand-guidelines'
    emphasis: ['colors', 'typography']
}
```

**7. Team Collaboration (collaborates_with)**
```yaml
# Person A collaborates with Person B on website
{
  fromThingId: personId_A
  toThingId: personId_B
  relationshipType: 'collaborates_with'
  metadata:
    role: 'designer|developer|copywriter'
    website: websiteId
    permissions: ['view', 'edit', 'comment']
    joinedAt: number
}
```

**8. Permission Delegation (delegated)**
```yaml
# Group owner delegates website management to team member
{
  fromThingId: delegatingPersonId
  toThingId: delegatedPersonId
  relationshipType: 'delegated'
  metadata:
    task: 'manage_website_deployment'
    scope: websiteId
    permissions: ['edit', 'publish', 'deploy']
    expiresAt: number?
}
```

**9. Publishing (published_to)**
```yaml
# Website published to domain
{
  fromThingId: websiteId
  toThingId: domainId               # Domain thing or config
  relationshipType: 'published_to'
  metadata:
    customDomain: 'example.com'
    deployed: true
    deployedAt: number
    deploymentURL: 'https://example.com'
}
```

---

### Dimension 5: EVENTS - All Actions (67 Types)

#### Website Builder Event Types

**1. Website Lifecycle Events**
```yaml
# Website created
{
  type: 'entity_created'            # Consolidated type
  actorId: creatorId
  targetId: websiteId
  timestamp: Date.now()
  metadata:
    action: 'website_created'       # Specific action
    entityType: 'website'
    templateUsed: templateId?
    title: 'My Portfolio'
}

# Website updated
{
  type: 'entity_updated'
  actorId: creatorId
  targetId: websiteId
  timestamp: Date.now()
  metadata:
    action: 'website_updated'
    changedFields: ['title', 'description']
    changes: {
      title: { from: 'Old', to: 'New' }
    }
}

# Website published
{
  type: 'content_event'
  actorId: creatorId
  targetId: websiteId
  timestamp: Date.now()
  metadata:
    action: 'published'
    entityType: 'website'
    publishedAt: Date.now()
}

# Website archived
{
  type: 'entity_archived'
  actorId: creatorId
  targetId: websiteId
  timestamp: Date.now()
  metadata:
    action: 'archived'
    reason: 'no_longer_needed|replaced|testing'
}
```

**2. Page Lifecycle Events**
```yaml
# Page created
{
  type: 'content_event'
  actorId: creatorId
  targetId: pageId
  timestamp: Date.now()
  metadata:
    action: 'created'
    entityType: 'page'
    websiteId: websiteId
    template: 'landing|blog|portfolio'
}

# Page updated
{
  type: 'content_event'
  actorId: creatorId
  targetId: pageId
  timestamp: Date.now()
  metadata:
    action: 'updated'
    changedFields: ['title', 'content']
    editCount: 5
}

# Page generated by AI
{
  type: 'content_event'
  actorId: aiCloneId
  targetId: pageId
  timestamp: Date.now()
  metadata:
    action: 'generated'
    entityType: 'page'
    prompt: 'Create landing page for SaaS'
    model: 'gpt-4'
}

# Page deleted
{
  type: 'entity_deleted'
  actorId: creatorId
  targetId: pageId
  timestamp: Date.now()
  metadata:
    action: 'deleted'
    websiteId: websiteId
}
```

**3. Component Events**
```yaml
# Component created
{
  type: 'content_event'
  actorId: creatorId
  targetId: componentId
  timestamp: Date.now()
  metadata:
    action: 'created'
    entityType: 'component'
    category: 'hero|card|form'
}

# Component used in page
{
  type: 'content_event'
  actorId: creatorId
  targetId: componentId
  timestamp: Date.now()
  metadata:
    action: 'used_in_page'
    pageId: pageId
    websiteId: websiteId
}
```

**4. Design Events**
```yaml
# Design system created
{
  type: 'entity_created'
  actorId: creatorId
  targetId: designSystemId
  timestamp: Date.now()
  metadata:
    action: 'design_system_created'
    entityType: 'design_system'
    colors: 5
    typography: 3
}

# Theme changed
{
  type: 'settings_updated'
  actorId: creatorId
  targetId: websiteId
  timestamp: Date.now()
  metadata:
    action: 'theme_changed'
    fromTheme: 'light'
    toTheme: 'dark'
}

# Colors updated
{
  type: 'settings_updated'
  actorId: creatorId
  targetId: websiteId
  timestamp: Date.now()
  metadata:
    action: 'colors_updated'
    colorScheme: 'primary_updated'
    newColor: '#FF5733'
}
```

**5. Deployment Events**
```yaml
# Deployment started
{
  type: 'task_event'
  actorId: creatorId
  targetId: websiteId
  timestamp: Date.now()
  metadata:
    action: 'delegated'             # Task delegated to system
    taskType: 'deploy'
    environment: 'staging|production'
}

# Deployment completed
{
  type: 'task_event'
  actorId: systemAgentId            # System/automation
  targetId: websiteId
  timestamp: Date.now()
  metadata:
    action: 'completed'
    taskType: 'deploy'
    environment: 'production'
    deploymentUrl: 'https://example.com'
    deploymentTime: 3500             # ms
}

# Deployment failed
{
  type: 'task_event'
  actorId: systemAgentId
  targetId: websiteId
  timestamp: Date.now()
  metadata:
    action: 'failed'
    taskType: 'deploy'
    errorCode: 'INVALID_DNS'
    errorMessage: 'DNS records not configured'
    retryCount: 2
}
```

**6. Domain Events**
```yaml
# Custom domain configured
{
  type: 'settings_updated'
  actorId: creatorId
  targetId: websiteId
  timestamp: Date.now()
  metadata:
    action: 'domain_configured'
    domain: 'example.com'
    dnsStatus: 'pending|verified'
}

# Domain verified
{
  type: 'settings_updated'
  actorId: systemAgentId
  targetId: websiteId
  timestamp: Date.now()
  metadata:
    action: 'domain_verified'
    domain: 'example.com'
    verificationTime: 1234
}
```

**7. Collaboration Events**
```yaml
# Team member invited
{
  type: 'user_invited_to_group'
  actorId: groupOwnerId
  targetId: invitedPersonId
  timestamp: Date.now()
  metadata:
    scope: 'website'
    websiteId: websiteId
    role: 'editor|viewer|admin'
}

# Team member joined
{
  type: 'user_joined_group'
  actorId: invitedPersonId
  targetId: groupId
  timestamp: Date.now()
  metadata:
    invitedBy: groupOwnerId
    scope: 'website'
    websiteId: websiteId
}

# Permissions granted
{
  type: 'approved'
  actorId: groupOwnerId
  targetId: personId
  timestamp: Date.now()
  metadata:
    approvalType: 'permission_grant'
    permissions: ['view', 'edit', 'deploy']
    scope: websiteId
}
```

**8. Analytics Events (Optional)**
```yaml
# Page viewed (visitor analytics)
{
  type: 'content_event'
  actorId: visitorId?               # Anonymous or authenticated
  targetId: pageId
  timestamp: Date.now()
  metadata:
    action: 'viewed'
    entityType: 'page'
    referer: string?
    userAgent: string?
    ipHash: string?                 # Privacy-preserving
}

# Form submitted
{
  type: 'payment_event'
  actorId: visitorId?
  targetId: formId?
  timestamp: Date.now()
  metadata:
    action: 'completed'
    formType: 'contact|newsletter|lead'
    data: { ... }                   # What was submitted
}
```

**9. AI Cycle Events**
```yaml
# Page generation cycle requested
{
  type: 'cycle_request'
  actorId: creatorId
  targetId: cycleId
  timestamp: Date.now()
  metadata:
    request: 'generate_page'
    prompt: 'Create landing page for fitness app'
    templateId: templateId?
    options: { ... }
}

# Generation cycle completed
{
  type: 'cycle_completed'
  actorId: aiCloneId
  targetId: cycleId
  timestamp: Date.now()
  metadata:
    request: 'generate_page'
    variants: 3                     # How many options offered
    selected: 1                     # Which user chose
    pageId: generatedPageId
}

# Generation cycle failed
{
  type: 'cycle_failed'
  actorId: aiCloneId
  targetId: cycleId
  timestamp: Date.now()
  metadata:
    request: 'generate_page'
    error: 'RATE_LIMIT_EXCEEDED'
    retryAfter: 3600                # seconds
}
```

---

### Dimension 6: KNOWLEDGE - Understanding & Search

#### Component Library as Semantic Knowledge

**1. Component Knowledge (Embeddings)**
```yaml
# Each component becomes a knowledge item for semantic search
{
  _id: Id<'knowledge'>,
  knowledgeType: 'chunk',           # Text chunk with embedding
  text: |
    Hero Component - Large banner with image, headline, and CTA.
    Perfect for landing pages, product launches, and announcements.
    Includes parallax scroll effect and responsive design.
    Categories: hero, banner, landing-page
    Use cases: product launch, announcement, homepage
  embedding: [0.123, 0.456, ...],   # Vector embedding
  embeddingModel: 'text-embedding-3-large',
  embeddingDim: 1536,
  sourceThingId: componentId,       # Links to component thing
  sourceField: 'description',
  labels: [
    'component:hero',
    'category:layout',
    'framework:html',
    'usecase:landing-page',
    'responsive:true',
    'accessibility:wcag-aa',
    'difficulty:beginner'
  ],
  metadata: {
    componentType: 'hero',
    framework: 'html',
    previewUrl: 'https://...',
    downloadCount: 1234,
    rating: 4.8,
    version: '2.1.0'
  }
}
```

**2. Design System Knowledge (Labels)**
```yaml
# Design system as knowledge labels for filtering and discovery
{
  knowledgeType: 'label',
  text: null                        # Labels don't need text
  labels: [
    'design-system:acme',
    'color:primary',
    'color:secondary',
    'typography:heading',
    'typography:body',
    'spacing:8px-scale',
    'framework:tailwind',
    'brand:professional',
    'accessibility:wcag-aaa'
  ],
  sourceThingId: designSystemId,
  metadata: {
    version: '3.0.0',
    colorCount: 8,
    typographyFamilies: 2,
    componentCount: 25
  }
}
```

**3. Template Knowledge (Document)**
```yaml
# Template as document for RAG retrieval
{
  knowledgeType: 'document',
  text: |
    Minimalist Portfolio Template

    Description: A clean, modern portfolio template perfect for designers,
    photographers, and creative professionals.

    Includes:
    - Homepage with hero section
    - Portfolio gallery with lightbox
    - About page with bio
    - Contact form
    - Blog section (optional)

    Features:
    - Fully responsive design
    - Dark mode support
    - SEO optimized
    - Fast loading (Lighthouse 95+)

    Best for:
    - Personal portfolios
    - Creative professionals
    - Freelancers
    - Small design studios

    Categories: portfolio, minimalist, creative, professional
  embedding: [...],
  sourceThingId: templateId,
  labels: [
    'template:portfolio',
    'style:minimalist',
    'industry:creative',
    'difficulty:beginner',
    'responsive:true',
    'darkMode:true'
  ],
  metadata: {
    category: 'portfolio',
    downloads: 5234,
    rating: 4.9,
    priceTier: 'free'
  }
}
```

**4. Brand Guidelines as Knowledge**
```yaml
# Brand guidelines chunked and embedded
{
  knowledgeType: 'chunk',
  text: |
    Primary Colors:
    - Acme Blue: #0066CC (main brand color)
    - Acme Green: #00CC66 (success, growth)
    - Neutral Gray: #333333 (text, UI elements)

    Usage:
    - Acme Blue: Primary buttons, headers, focus states
    - Acme Green: Success states, positive actions, growth indicators
    - Gray: Body text, secondary elements, backgrounds
  embedding: [...],
  sourceThingId: designSystemId,
  sourceField: 'colors',
  labels: [
    'brand:acme',
    'section:colors',
    'purpose:guidance',
    'color-harmony:complementary'
  ],
  chunk: {
    index: 0,
    tokenCount: 145
  }
}
```

**5. Semantic Search Implementation**
```typescript
// Find hero components matching "modern landing page hero"
const heroComponents = await db.vectorSearch('knowledge', {
  vectorField: 'embedding',
  query: await embedQuery('modern landing page hero'),
  filter: {
    groupId: currentGroupId,
    knowledgeType: 'chunk',
    'labels': 'component:hero'  // Filter by labels
  },
  k: 10  // Return top 10 results
});

// Find templates by style
const templates = await db.vectorSearch('knowledge', {
  query: await embedQuery('minimalist professional portfolio'),
  filter: {
    'metadata.category': 'portfolio',
    'labels': 'style:minimalist'
  },
  k: 5
});

// Find design systems by brand
const brandSystems = await db
  .query('knowledge')
  .filter(q => q.eq(q.field('knowledgeType'), 'label'))
  .filter(q => q.array.contains(q.field('labels'), 'design-system:*'))
  .collect();
```

**6. thingKnowledge Junction (Linking)**
```yaml
# Link component to design system labels
{
  _id: Id<'thingKnowledge'>,
  thingId: componentId,
  knowledgeId: designSystemLabelId,
  role: 'label',                    # This knowledge labels the thing
  metadata: {
    appliedAt: timestamp
  }
}

# Link page to component
{
  thingId: pageId,
  knowledgeId: componentEmbeddingId,
  role: 'chunk_of'                  # Component is chunk of page design
  metadata: {
    componentCount: 5,
    lastUpdated: timestamp
  }
}
```

---

## Data Model Mapping

### The 5 Tables (Implementation of 6 Dimensions)

```
groups          ← Dimension 1: GROUPS
things          ← Dimensions 3 (THINGS)
connections     ← Dimension 4 (CONNECTIONS)
events          ← Dimension 5 (EVENTS)
knowledge       ← Dimension 6 (KNOWLEDGE)
people          ← Dimension 2 (PEOPLE as things with type: 'creator')
```

### Website Builder Schema Projection

```typescript
// GROUPS table (Multi-tenant isolation)
groups:
  - _id, slug, name, type (business), parentGroupId
  - settings: { visibility, joinPolicy, plan }
  - metadata: { websites, components, templates }

// THINGS table (All entities)
things:
  - type: 'website'           // Website
  - type: 'blog_post'         // Page (using existing type)
  - type: 'digital_product'   // Component, Design System
  - type: 'template'          // Template
  - type: 'ai_clone'          // AI Assistant
  - type: 'creator'           // User (existing type)

// CONNECTIONS table (Relationships)
connections:
  - relationshipType: 'owns'              // Creator owns website
  - relationshipType: 'part_of'           // Page part of website
  - relationshipType: 'references'        // Page references component
  - relationshipType: 'generated_by'      // Page generated by AI
  - relationshipType: 'created_by'        // Website created_by template
  - relationshipType: 'trained_on'        // AI trained on design system
  - relationshipType: 'collaborates_with' // Team collaboration
  - relationshipType: 'delegated'         // Permission delegation
  - relationshipType: 'published_to'      // Website published to domain

// EVENTS table (Audit trail)
events:
  - type: 'entity_created'    // Website/page created
  - type: 'entity_updated'    // Website/page updated
  - type: 'content_event'     // Content actions (action: published, viewed, etc)
  - type: 'task_event'        // Deployment tasks
  - type: 'settings_updated'  // Design theme changed
  - type: 'user_invited_to_group' // Team invited

// KNOWLEDGE table (Search + semantics)
knowledge:
  - knowledgeType: 'chunk'    // Component with embedding
  - knowledgeType: 'label'    // Design system labels
  - knowledgeType: 'document' // Template documentation
  - labels: [...design, color, framework, usecase...]
```

---

## Concrete Usage Examples

### Example 1: Creating a Website from Template

```typescript
// Step 1: Creator requests website from template
const cycleId = crypto.randomUUID();
await db.insert('events', {
  type: 'cycle_request',
  actorId: creatorId,
  targetId: cycleId,
  timestamp: Date.now(),
  metadata: {
    request: 'create_website_from_template',
    templateId: templateId,
    title: 'My Portfolio Site',
    prompt: 'Create a minimalist portfolio website for designer'
  },
  groupId: groupId
});

// Step 2: AI clone generates website structure
const websiteId = crypto.randomUUID();
const websitePages = [
  { title: 'Home', slug: 'index' },
  { title: 'About', slug: 'about' },
  { title: 'Portfolio', slug: 'portfolio' },
  { title: 'Contact', slug: 'contact' }
];

// Create website thing
await db.insert('things', {
  _id: websiteId,
  type: 'website',
  name: 'My Portfolio Site',
  groupId: groupId,
  status: 'draft',
  properties: {
    title: 'My Portfolio Site',
    slug: 'my-portfolio-site',
    description: 'A minimalist portfolio showcasing creative work',
    theme: {
      primaryColor: '#000000',
      secondaryColor: '#FFFFFF',
      fontFamily: 'Inter, sans-serif'
    },
    metadata: {
      templateUsed: templateId,
      aiCloneId: aiCloneId,
      generatedBy: 'ai'
    }
  },
  createdAt: Date.now(),
  updatedAt: Date.now()
});

// Create pages
for (const pageSpec of websitePages) {
  const pageId = crypto.randomUUID();

  // Insert page thing
  await db.insert('things', {
    _id: pageId,
    type: 'blog_post',
    name: pageSpec.title,
    groupId: groupId,
    status: 'draft',
    properties: {
      title: pageSpec.title,
      slug: pageSpec.slug,
      content: await ai_clone.generateContent(pageSpec)
    },
    createdAt: Date.now(),
    updatedAt: Date.now()
  });

  // Create part_of connection: page → website
  await db.insert('connections', {
    fromThingId: pageId,
    toThingId: websiteId,
    relationshipType: 'part_of',
    metadata: { order: websitePages.indexOf(pageSpec) },
    createdAt: Date.now()
  });

  // Create generated_by connection: page ← AI clone
  await db.insert('connections', {
    fromThingId: pageId,
    toThingId: aiCloneId,
    relationshipType: 'generated_by',
    metadata: {
      prompt: pageSpec.title,
      model: 'gpt-4',
      confidence: 0.95
    },
    createdAt: Date.now()
  });
}

// Create ownership: creator → website
await db.insert('connections', {
  fromThingId: creatorId,
  toThingId: websiteId,
  relationshipType: 'owns',
  metadata: null,
  createdAt: Date.now()
});

// Log website created event
await db.insert('events', {
  type: 'entity_created',
  actorId: aiCloneId,
  targetId: websiteId,
  timestamp: Date.now(),
  metadata: {
    action: 'website_created',
    templateUsed: templateId,
    pageCount: websitePages.length
  },
  groupId: groupId
});

// Log cycle completed
await db.insert('events', {
  type: 'cycle_completed',
  actorId: aiCloneId,
  targetId: cycleId,
  timestamp: Date.now(),
  metadata: {
    request: 'create_website_from_template',
    websiteId: websiteId,
    pageCount: websitePages.length
  },
  groupId: groupId
});
```

### Example 2: Adding a Component to Page

```typescript
// Creator wants to add hero component to homepage
const pageId = /* homepage thing id */;

// 1. Semantic search for hero components
const heroOptions = await db.vectorSearch('knowledge', {
  vectorField: 'embedding',
  query: await embedQuery('modern hero banner for landing page'),
  filter: {
    groupId: groupId,
    labels: 'component:hero'
  },
  k: 3
});

// 2. Creator selects first option
const selectedComponentThingId =
  (await db.get('knowledge', heroOptions[0]._id)).sourceThingId;

// 3. Create references connection: page → component
await db.insert('connections', {
  fromThingId: pageId,
  toThingId: selectedComponentThingId,
  relationshipType: 'references',
  metadata: {
    placement: 'hero',
    props: {
      headline: 'Welcome to My Portfolio',
      ctaText: 'View Work',
      ctaUrl: '/portfolio'
    }
  },
  createdAt: Date.now()
});

// 4. Log page updated event
await db.insert('events', {
  type: 'content_event',
  actorId: creatorId,
  targetId: pageId,
  timestamp: Date.now(),
  metadata: {
    action: 'updated',
    changedFields: ['added_component'],
    componentId: selectedComponentThingId
  },
  groupId: groupId
});
```

### Example 3: Publishing Website to Custom Domain

```typescript
// Creator publishes website to custom domain
const websiteId = /* website thing id */;
const customDomain = 'myportfolio.com';

// Step 1: Update website properties
await db.patch(websiteId, {
  'properties.domain': customDomain,
  'properties.metadata.domainSetupCompleted': false,
  'properties.metadata.dnsConfigured': false,
  updatedAt: Date.now()
});

// Step 2: Log domain configuration event
await db.insert('events', {
  type: 'settings_updated',
  actorId: creatorId,
  targetId: websiteId,
  timestamp: Date.now(),
  metadata: {
    action: 'domain_configured',
    domain: customDomain,
    dnsStatus: 'pending'
  },
  groupId: groupId
});

// Step 3: Trigger deployment task
const deploymentCycleId = crypto.randomUUID();
await db.insert('events', {
  type: 'task_event',
  actorId: creatorId,
  targetId: websiteId,
  timestamp: Date.now(),
  metadata: {
    action: 'delegated',
    taskType: 'deploy',
    environment: 'production',
    cycleId: deploymentCycleId,
    domain: customDomain
  },
  groupId: groupId
});

// Step 4: System verifies DNS and deploys
// (This would be an automated system agent)
await db.insert('events', {
  type: 'settings_updated',
  actorId: systemAgentId,
  targetId: websiteId,
  timestamp: Date.now(),
  metadata: {
    action: 'domain_verified',
    domain: customDomain,
    verificationTime: 45000  // 45 seconds
  },
  groupId: groupId
});

// Step 5: Deployment completed
await db.insert('events', {
  type: 'task_event',
  actorId: systemAgentId,
  targetId: websiteId,
  timestamp: Date.now(),
  metadata: {
    action: 'completed',
    taskType: 'deploy',
    environment: 'production',
    deploymentUrl: `https://${customDomain}`,
    deploymentTime: 3500  // 3.5 seconds
  },
  groupId: groupId
});

// Step 6: Update website with deployment status
await db.patch(websiteId, {
  'properties.metadata.deploymentStatus': 'production',
  'properties.metadata.dnsConfigured': true,
  'properties.metadata.domainSetupCompleted': true,
  updatedAt: Date.now()
});
```

---

## Properties by Thing Type

### website
```typescript
properties: {
  // Identity
  title: string                    // Display name
  slug: string                     // URL slug
  description?: string             // SEO description
  domain?: string                  // Custom domain
  favicon?: string                 // Icon URL

  // Design
  theme: {
    primaryColor: string
    secondaryColor: string
    accentColor: string
    fontFamily: string
    fontSize: number
  }

  // Metadata
  metadata: {
    generatedBy: 'ai' | 'human' | 'hybrid'
    templateUsed?: string           // Template thing ID
    aiCloneId?: string              // AI that generated
    analytics: boolean              // Track visitors
    seoOptimized: boolean
    publishedAt?: number
    deploymentStatus: 'draft' | 'staging' | 'production'
    domainSetupCompleted: boolean
    dnsConfigured: boolean
    hostingProvider?: string        // e.g., 'cloudflare'
    sslCertificate?: {
      issuer: string
      expiresAt: number
    }
  }

  // Performance
  lighthouse?: {
    performance: number            // 0-100
    accessibility: number
    bestPractices: number
    seo: number
    checkedAt: number
  }
}
```

### blog_post (used as page)
```typescript
properties: {
  // Identity
  title: string
  slug: string
  excerpt?: string

  // Content
  content: string                  // HTML or markdown
  sections: Array<{
    type: 'text' | 'image' | 'video' | 'form' | 'component'
    content: any
    componentId?: string            // Reference to component
    styling?: object
  }>

  // SEO
  seoMetadata?: {
    metaTitle?: string
    metaDescription?: string
    keywords?: string[]
    ogImage?: string
  }

  // Layout
  layout: 'landing' | 'blog' | 'portfolio' | 'documentation'

  // Editorial
  publishedAt?: number
  thumbnail?: string

  // Metadata
  metadata: {
    lastEditedBy: string           // Person ID
    editCount: number
    editHistory: Array<{
      timestamp: number
      personId: string
      changes: object
    }>
    internalLinks: string[]         // Other page IDs
    externalLinks: string[]
  }
}
```

### digital_product (used as component/design-system)
```typescript
properties: {
  // Identity (for component)
  name: string
  description?: string
  category: string                 // hero, card, form, footer, etc

  // Code
  framework: 'html' | 'react' | 'vue' | 'svelte'
  code: string                     // Source code
  props: Array<{
    name: string
    type: string
    default?: any
    description?: string
  }>

  // Styling
  styling: {
    css?: string                   // CSS code
    tailwindClasses?: string[]
    customVariables?: object        // CSS variables
    responsive: boolean
    darkMode: boolean
  }

  // Metadata
  metadata: {
    popularity: number              // Download/usage count
    rating: number                  // 1-5 stars
    usedInPages: string[]           // Page IDs
    usedInWebsites: string[]        // Website IDs
    version: string
    licenseType: 'free' | 'paid' | 'pro'
    generatedBy?: string            // AI clone ID
    previewImage?: string
    demoUrl?: string
  }

  // (For design system variant)
  // ... includes colors, typography, spacing, etc.
}
```

---

## Multi-Tenant Isolation Pattern

```typescript
// CRITICAL: Every query must scope by groupId

// ✅ CORRECT: Query scoped to group
const userWebsites = await db
  .query('things')
  .withIndex('by_type', q => q.eq('type', 'website'))
  .filter(q => q.eq(q.field('groupId'), currentGroupId))
  .collect();

// ❌ WRONG: Unscoped query leaks data
const anyWebsite = await db
  .query('things')
  .withIndex('by_type', q => q.eq('type', 'website'))
  .collect();  // Returns websites from ALL groups!

// ✅ CORRECT: Create with groupId
await db.insert('things', {
  type: 'website',
  name: 'My Site',
  groupId: currentGroupId,  // ← ESSENTIAL
  status: 'draft',
  properties: { ... },
  createdAt: Date.now(),
  updatedAt: Date.now()
});

// ❌ WRONG: Missing groupId
await db.insert('things', {
  type: 'website',
  name: 'My Site',
  // ← Missing groupId = multi-tenant violation!
  status: 'draft',
  properties: { ... }
});
```

---

## Extension Points (Without Breaking Ontology)

### Adding Custom Components

No schema changes needed. Just add properties:

```typescript
// Custom component (uses digital_product type)
await db.insert('things', {
  type: 'digital_product',
  name: 'Custom Hero Banner',
  groupId: groupId,
  properties: {
    name: 'Custom Hero Banner',
    category: 'hero',
    framework: 'react',
    code: '...',
    customProperties: {
      // Domain-specific properties can go here
      animation: 'fade-in',
      parallaxStrength: 0.5,
      mobileOptimization: 'adaptive'
    }
  }
});
```

### Adding Custom Metadata

Use metadata field on connections/events:

```typescript
// Custom metadata on component usage
await db.insert('connections', {
  fromThingId: pageId,
  toThingId: componentId,
  relationshipType: 'references',
  metadata: {
    placement: 'hero',
    props: { ... },
    // Domain-specific metadata
    abTest: {
      variant: 'A',
      startedAt: Date.now()
    },
    analytics: {
      trackClicks: true,
      conversionGoal: 'signup'
    }
  }
});
```

### Adding Custom Knowledge Labels

Use the knowledge label system:

```typescript
// Add custom label to component
await db.insert('knowledge', {
  knowledgeType: 'label',
  labels: [
    'component:hero',
    'custom:mobile-first',
    'custom:high-conversion',
    'custom:animated'
  ],
  sourceThingId: componentId,
  metadata: {
    customField: 'value'
  }
});
```

---

## Golden Rules for Website Builder

1. **Always scope to groupId** - Multi-tenant isolation is non-negotiable
2. **Use existing thing types** - Don't create `page_type` when `blog_post` exists
3. **Store protocol in metadata** - Deployment provider goes in `metadata.hostingProvider`
4. **Log all actions as events** - Every change creates an event with actorId
5. **Link components to knowledge** - Make component library searchable via embeddings
6. **Use consolidated types** - Don't create `website_updated` event, use `content_event` with `metadata.action`
7. **Support AI generation** - Every entity should be generatable via AI clone
8. **Maintain audit trail** - Events track complete history of changes
9. **Enable collaboration** - Use `collaborates_with` and `delegated` for team features
10. **Keep schema clean** - All customization goes in properties or metadata

---

## Summary

The AI website builder maps completely to the 6-dimension ontology:

| Dimension | Implementation | Key Types |
|-----------|----------------|-----------|
| **1. Groups** | `groupId` scoping | Websites belong to groups |
| **2. People** | `creator`, `group_owner` roles | Ownership and permissions |
| **3. Things** | `website`, `blog_post`, `template`, `ai_clone` | Core entities |
| **4. Connections** | `owns`, `part_of`, `references`, `generated_by` | Relationships |
| **5. Events** | `entity_created`, `content_event`, `task_event` | Audit trail |
| **6. Knowledge** | Component embeddings, design labels | Search and discovery |

**No new dimensions. No schema pollution. Pure ontology mapping.**

---

## Next Steps (Cycles 3-6)

**Cycle 3:** Design Services - Effect.ts business logic
**Cycle 4:** Implement Backend - Convex mutations/queries
**Cycle 5:** Build Frontend - React components
**Cycle 6:** Test & Document - User flows and acceptance criteria
