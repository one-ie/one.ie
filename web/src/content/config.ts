import { defineCollection, z } from 'astro:content';

// Define the Blog schema
const BlogSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.date(),
  draft: z.boolean().optional(),
  image: z.string().optional(),
  picture: z.string().optional(), // Support oneieold blog posts
  author: z.string().default('ONE'),
  tags: z.array(z.string()).default([]),
  category: z
    .enum(['tutorial', 'news', 'guide', 'review', 'article'])
    .default('article'),
  readingTime: z.number().optional(),
  featured: z.boolean().default(false),
  type: z.string().optional(), // Support oneieold blog posts
});

// Define the Blog collection schema
const blog = defineCollection({
  type: 'content',
  schema: BlogSchema,
});

// Define the News schema - unified schema for all news/activity content
// Combines platform activity updates and curated news articles
const NewsSchema = z.object({
  title: z.string(), // Required: title of the article/update
  date: z.date(), // Required: publication/update date
  description: z.string().optional(), // Optional description
  author: z.string().optional().default('ONE'), // Author name
  category: z.string().optional(), // News category (AI, Platform, Technology, etc.)
  type: z.string().optional(), // Type of activity: file_created, feature_added, etc.
  tags: z.array(z.string()).optional().default([]), // Tags for categorization
  image: z.string().optional(), // Optional featured image
  draft: z.boolean().optional().default(false), // Hide if draft
  readingTime: z.number().optional(), // Estimated reading time
  featured: z.boolean().optional().default(false), // Feature on homepage
  source: z.string().optional(), // Original news source URL
  relevanceScore: z.number().optional(), // 0-100 relevance to ONE Platform
  path: z.string().optional(), // Original file path
  repo: z.string().optional(), // Which repo (web, backend, one, etc.)
});

// Define the News collection
const news = defineCollection({
  type: 'content',
  schema: NewsSchema,
});

// Define the Products schema (ecommerce ontology - thing type: product)
const ProductSchema = z.object({
  id: z.string().optional(), // Unique identifier (optional, defaults to slug)
  name: z.string(),
  description: z.string(),
  price: z.number(),
  compareAtPrice: z.number().optional(),
  salePrice: z.number().optional(), // Discounted price
  isSale: z.boolean().optional().default(false), // Whether product is on sale
  isNew: z.boolean().optional().default(false), // Whether product is new
  images: z.array(z.string()),
  category: z.string(), // References categories collection
  collections: z.array(z.string()).optional(), // References collections collection
  variants: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        sku: z.string(),
        price: z.number(),
        inStock: z.boolean(),
        options: z.record(z.string()), // { color: "red", size: "M" }
      })
    )
    .optional(),
  inStock: z.boolean().default(true),
  featured: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

// Define the Products collection
const products = defineCollection({
  type: 'content',
  schema: ProductSchema,
});

// Define the Categories schema (ecommerce ontology - thing type: category)
const CategorySchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  image: z.string().optional(),
  parent: z.string().optional(), // Slug of parent category for hierarchy
  order: z.number().default(0),
});

// Define the Categories collection
const categories = defineCollection({
  type: 'content',
  schema: CategorySchema,
});

// Define the Collections schema (ecommerce ontology - thing type: collection)
const ProductCollectionSchema = z.object({
  name: z.string(),
  description: z.string(),
  image: z.string().optional(),
  featured: z.boolean().default(false),
  products: z.array(z.string()), // Array of product slugs
});

// Define the Collections collection
const productCollections = defineCollection({
  type: 'content',
  schema: ProductCollectionSchema,
});

// Define the Plans schema (100-cycle feature plans)
const PlanSchema = z.object({
  title: z.string(),
  description: z.string(),
  feature: z.string(), // Feature name
  organization: z.string().optional(), // Organization name
  personRole: z.enum(['platform_owner', 'org_owner', 'org_user', 'customer']).optional(),
  ontologyDimensions: z.array(z.string()).optional(), // Groups, People, Things, Connections, Events, Knowledge
  assignedSpecialist: z.string().optional(), // Agent name
  totalCycles: z.number().default(100),
  completedCycles: z.number().default(0),
  cycleTemplate: z.array(z.object({
    range: z.string(), // e.g., "1-10"
    phase: z.string(), // e.g., "Foundation & Setup"
    description: z.string(),
    tasks: z.array(z.string()).optional(),
  })).optional(),
  tasks: z.array(z.object({
    cycleNumber: z.number(),
    content: z.string(), // Task description
    status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
    activeForm: z.string(), // Present continuous form of task
    dependencies: z.array(z.number()).optional(), // Other cycle numbers it depends on
  })).optional(),
  dependenciesMet: z.number().default(0),
  totalDependencies: z.number().default(0),
  lessonsLearned: z.array(z.object({
    cycle: z.number(),
    lesson: z.string(),
  })).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  draft: z.boolean().optional().default(false),
});

// Define the Plans collection
const plans = defineCollection({
  type: 'content',
  schema: PlanSchema,
});

// Define the Projects schema (project management and initiatives)
const ProjectSchema = z.object({
  title: z.string(),
  description: z.string(),
  project: z.string(), // Project name
  organization: z.string().optional(), // Organization name
  personRole: z.enum(['platform_owner', 'org_owner', 'org_user', 'customer']).optional(),
  ontologyDimensions: z.array(z.string()).optional(), // Groups, People, Things, Connections, Events, Knowledge
  assignedSpecialist: z.string().optional(), // Agent name
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'archived']).default('planning'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),

  // Display properties for project cards
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
  demoUrl: z.string().optional(),
  planUrl: z.string().optional(),
  iconName: z.string().optional(),
  borderColor: z.string().optional(),
  bgColor: z.string().optional(),
  levelColor: z.string().optional(),

  // Learning and feature details
  features: z.array(z.string()).optional(),
  learningPath: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
  prerequisiteProjects: z.array(z.string()).optional(),
  difficulty: z.string().optional(),

  // Timeline
  startDate: z.date(),
  targetEndDate: z.date().optional(),
  completedAt: z.date().optional(),
  totalCycles: z.number().optional().default(100),
  completedCycles: z.number().optional().default(0),
  estimatedWeeks: z.number().optional(),

  // Scope
  objectives: z.array(z.string()).optional(),
  deliverables: z.array(z.string()).optional(),
  scope: z.string().optional(),

  // Metrics
  progress: z.number().min(0).max(100).default(0), // Percentage complete
  budget: z.number().optional(),
  spent: z.number().optional(),
  estimatedHours: z.number().optional(),
  actualHours: z.number().optional(),

  // Organization
  parentProjectId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  teams: z.array(z.string()).optional(),

  // Lessons
  lessonsLearned: z.array(z.object({
    milestone: z.string(),
    lesson: z.string(),
  })).optional(),

  // Timestamps
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  draft: z.boolean().optional().default(false),
});

// Define the Projects collection
const projects = defineCollection({
  type: 'content',
  schema: ProjectSchema,
});

// Define the Connections schema (protocol documentation)
const ConnectionSchema = z.object({
  title: z.string(), // Protocol name
  description: z.string(), // Brief description
  protocol: z.string(), // Protocol ID (acp, mcp, a2a, ap2, x402, agui)
  category: z.enum(['communication', 'context', 'coordination', 'payments', 'interface']).optional(), // Protocol category
  organization: z.string().optional(), // Organization behind protocol
  personRole: z.enum(['platform_owner', 'org_owner', 'org_user', 'customer']).optional(),
  ontologyDimensions: z.array(z.string()).optional(), // Groups, People, Things, Connections, Events, Knowledge
  assignedSpecialist: z.string().optional(), // Agent name

  // Protocol specification
  specification: z.object({
    version: z.string().optional(), // Protocol version
    status: z.enum(['draft', 'active', 'stable', 'deprecated']).optional(), // Protocol status
    standards: z.array(z.string()).optional(), // Standards (RFC, Linux Foundation, etc)
  }).optional(),

  // Ontology mapping
  ontologyMapping: z.object({
    groups: z.string().optional(),
    people: z.string().optional(),
    things: z.string().optional(),
    connections: z.string().optional(),
    events: z.string().optional(),
    knowledge: z.string().optional(),
  }).optional(),

  // Use cases
  useCases: z.array(z.object({
    title: z.string(),
    description: z.string(),
    protocols: z.array(z.string()).optional(),
  })).optional(),

  // Code examples
  examples: z.array(z.object({
    title: z.string(),
    language: z.string(), // typescript, python, javascript
    code: z.string(),
  })).optional(),

  // Features
  features: z.array(z.object({
    name: z.string(),
    description: z.string(),
  })).optional(),

  // Standards & organizations
  standards: z.array(z.string()).optional(),
  organizations: z.array(z.string()).optional(),

  // Integration
  integrationLevel: z.enum(['basic', 'advanced', 'enterprise']).optional(),
  prerequisites: z.array(z.string()).optional(),

  // Timestamps
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  draft: z.boolean().optional().default(false),
});

// Define the Connections collection
const connections = defineCollection({
  type: 'content',
  schema: ConnectionSchema,
});

// Define the Features schema (feature documentation and specifications)
const FeatureSchema = z.object({
  title: z.string(), // Feature name
  description: z.string(), // Brief description
  featureId: z.string(), // Unique feature identifier (e.g., "auth-magic-links", "ecommerce-cart")
  category: z.enum([
    'authentication',
    'ecommerce',
    'ai-agents',
    'protocols',
    'payments',
    'analytics',
    'content',
    'communication',
    'infrastructure',
    'integrations',
    'developer-tools',
    'other'
  ]).optional(), // Feature category

  // Feature status and metadata
  status: z.enum(['planned', 'in_development', 'beta', 'completed', 'deprecated']).default('planned'),
  version: z.string().optional(), // Feature version (e.g., "1.0.0", "2.1.3")
  releaseDate: z.date().optional(), // When feature was released
  plannedDate: z.date().optional(), // When feature is planned for release

  // Ontology alignment
  organization: z.string().optional(), // Organization that owns/builds this feature
  personRole: z.enum(['platform_owner', 'org_owner', 'org_user', 'customer']).optional(),
  ontologyDimensions: z.array(z.string()).optional(), // Groups, People, Things, Connections, Events, Knowledge
  assignedSpecialist: z.string().optional(), // Agent name (agent-backend, agent-frontend, etc.)

  // Technical specification
  specification: z.object({
    complexity: z.enum(['simple', 'moderate', 'complex', 'expert']).optional(),
    estimatedHours: z.number().optional(),
    dependencies: z.array(z.string()).optional(), // Other features this depends on
    technologies: z.array(z.string()).optional(), // Tech stack (React, Convex, Astro, etc.)
    apiEndpoints: z.array(z.object({
      method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
      path: z.string(),
      description: z.string(),
    })).optional(),
  }).optional(),

  // Ontology mapping (how this feature uses the 6 dimensions)
  ontologyMapping: z.object({
    groups: z.string().optional(),
    people: z.string().optional(),
    things: z.string().optional(),
    connections: z.string().optional(),
    events: z.string().optional(),
    knowledge: z.string().optional(),
  }).optional(),

  // Use cases
  useCases: z.array(z.object({
    title: z.string(),
    description: z.string(),
    userType: z.string().optional(), // Who uses this (creator, customer, admin)
    scenario: z.string().optional(), // Step-by-step scenario
  })).optional(),

  // Code examples
  examples: z.array(z.object({
    title: z.string(),
    language: z.string(), // typescript, python, javascript
    code: z.string(),
    description: z.string().optional(),
  })).optional(),

  // Features (sub-features or capabilities)
  features: z.array(z.object({
    name: z.string(),
    description: z.string(),
    status: z.enum(['planned', 'in_development', 'completed']).optional(),
  })).optional(),

  // Marketing & positioning
  marketingPosition: z.object({
    tagline: z.string().optional(), // One-line positioning
    valueProposition: z.string().optional(), // Why this matters
    targetAudience: z.array(z.string()).optional(), // Who needs this
    competitiveAdvantage: z.string().optional(), // What makes it better
    pricingImpact: z.enum(['free', 'starter', 'pro', 'enterprise']).optional(),
  }).optional(),

  // Screenshots and media
  media: z.object({
    screenshot: z.string().optional(), // Main screenshot URL
    video: z.string().optional(), // Demo video URL
    demo: z.string().optional(), // Live demo URL
    gallery: z.array(z.string()).optional(), // Additional images
  }).optional(),

  // Integration details
  integrationLevel: z.enum(['basic', 'advanced', 'enterprise']).optional(),
  prerequisites: z.array(z.string()).optional(),
  relatedFeatures: z.array(z.string()).optional(), // IDs of related features

  // Quality metrics
  metrics: z.object({
    testCoverage: z.number().optional(), // Percentage
    performanceScore: z.number().optional(), // Lighthouse score
    accessibilityScore: z.number().optional(), // WCAG compliance
    securityAudit: z.boolean().optional(), // Has been audited
  }).optional(),

  // Documentation links
  documentation: z.object({
    userGuide: z.string().optional(),
    apiReference: z.string().optional(),
    videoTutorial: z.string().optional(),
    blogPost: z.string().optional(),
  }).optional(),

  // Tags and categorization
  tags: z.array(z.string()).optional(),
  featured: z.boolean().default(false),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),

  // Timestamps
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  draft: z.boolean().optional().default(false),
});

// Define the Features collection (MDX-enabled for component embedding)
const features = defineCollection({
  type: 'content',
  schema: FeatureSchema,
});

// Define the Docs schema (documentation pages)
const DocsSchema = z.object({
  title: z.string(), // Document title
  description: z.string(), // Brief description
  section: z.string().optional(), // Docs section/category
  order: z.number().optional(), // Display order within section
  tags: z.array(z.string()).optional(), // Tags for filtering
  date: z.date().optional(), // Publication date
  draft: z.boolean().optional().default(false), // Hide if draft
});

// Define the Docs collection
const docs = defineCollection({
  type: 'content',
  schema: DocsSchema,
});

// Define the Videos schema (video content ontology - thing type: video)
// Enhanced with premium Vidstack features for education and news content
const VideoSchema = z.object({
  // Basic metadata
  title: z.string(),
  description: z.string(),
  youtubeId: z.string().optional(), // For YouTube embeds
  videoUrl: z.string().optional(),  // For native hosting (future)
  thumbnail: z.string(),            // Image URL or path
  duration: z.number(),             // Seconds
  publishedAt: z.coerce.date(),     // Coerce string to Date
  author: z.string().optional(),
  categories: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),

  // Premium features - Education & News
  chapters: z.array(z.object({
    startTime: z.number(),          // Seconds from start
    endTime: z.number().optional(), // Optional end time
    text: z.string(),               // Chapter title
  })).optional(),                   // Chapter markers for navigation

  subtitles: z.array(z.object({
    src: z.string(),                // VTT file URL
    label: z.string(),              // Display name (e.g., "English")
    language: z.string(),           // Language code (e.g., "en")
    kind: z.enum(['subtitles', 'captions']), // Type of text track
    default: z.boolean().optional(), // Default language
  })).optional(),                   // Multi-language subtitle support

  thumbnails: z.string().optional(), // VTT file with thumbnail previews
  streamType: z.enum(['on-demand', 'live', 'live:dvr']).optional(), // Video type
  aspectRatio: z.string().optional(), // Custom aspect ratio (default: 16/9)
  featured: z.boolean().default(false), // Feature on homepage
  draft: z.boolean().default(false), // Hide if draft
});

// Define the Videos collection
const videos = defineCollection({
  type: 'content',
  schema: VideoSchema,
});

// Define the Podcasts schema (audio content ontology - thing type: podcast)
// Enhanced with premium audio features for education and entertainment content
const PodcastSchema = z.object({
  // Basic metadata
  title: z.string(),
  description: z.string(),
  audioUrl: z.string().optional(),  // Audio file URL
  thumbnail: z.string().optional(), // Cover art image
  duration: z.string().optional(),  // Duration in HH:MM:SS or MM:SS format
  date: z.coerce.date(),            // Publication date
  author: z.string().optional(),
  category: z.string().optional(),  // Podcast category
  tags: z.array(z.string()).default([]),

  // Episode information
  episode: z.number().optional(),   // Episode number
  season: z.number().optional(),    // Season number

  // Status and visibility
  status: z.enum(['draft', 'public', 'archived']).optional().default('public'),
  featured: z.boolean().default(false),

  // Premium features
  chapters: z.array(z.object({
    startTime: z.number(),          // Seconds from start
    endTime: z.number().optional(), // Optional end time
    text: z.string(),               // Chapter title
  })).optional(),                   // Chapter markers for navigation

  subtitles: z.array(z.object({
    src: z.string(),                // VTT file URL
    label: z.string(),              // Display name (e.g., "English")
    language: z.string(),           // Language code (e.g., "en")
    kind: z.enum(['subtitles', 'captions']), // Type of text track
    default: z.boolean().optional(), // Default language
  })).optional(),                   // Multi-language subtitle support

  transcript: z.string().optional(), // Full episode transcript

  // Ontology alignment
  slug: z.string().optional(),      // URL slug (optional, defaults to filename)
});

// Define the Podcasts collection
const podcasts = defineCollection({
  type: 'content',
  schema: PodcastSchema,
});

// Note: Installation-specific documentation is handled via file-resolver utility
// in Astro pages, not through content collections. This allows dynamic resolution
// based on INSTALLATION_NAME environment variable at runtime.

export const collections = {
  blog: blog,
  news: news,
  products: products,
  categories: categories,
  collections: productCollections,
  plans: plans,
  projects: projects,
  connections: connections,
  features: features,
  docs: docs,
  videos: videos,
  podcasts: podcasts,
};

// Export schema types
export type BlogSchema = z.infer<typeof BlogSchema>;
export type NewsSchema = z.infer<typeof NewsSchema>;
export type ProductSchema = z.infer<typeof ProductSchema>;
export type CategorySchema = z.infer<typeof CategorySchema>;
export type ProductCollectionSchema = z.infer<typeof ProductCollectionSchema>;
export type PlanSchema = z.infer<typeof PlanSchema>;
export type ProjectSchema = z.infer<typeof ProjectSchema>;
export type ConnectionSchema = z.infer<typeof ConnectionSchema>;
export type FeatureSchema = z.infer<typeof FeatureSchema>;
export type DocsSchema = z.infer<typeof DocsSchema>;
export type VideoSchema = z.infer<typeof VideoSchema>;
export type PodcastSchema = z.infer<typeof PodcastSchema>;
