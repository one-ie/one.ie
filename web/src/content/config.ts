import { defineCollection, z } from 'astro:content';

// Define the Blog schema
const BlogSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.date(),
  draft: z.boolean().optional(),
  image: z.string().optional(),
  author: z.string().default('ONE'),
  tags: z.array(z.string()).default([]),
  category: z
    .enum(['tutorial', 'news', 'guide', 'review', 'article'])
    .default('article'),
  readingTime: z.number().optional(),
  featured: z.boolean().default(false),
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

// Define the Plans schema (100-inference feature plans)
const PlanSchema = z.object({
  title: z.string(),
  description: z.string(),
  feature: z.string(), // Feature name
  organization: z.string().optional(), // Organization name
  personRole: z.enum(['platform_owner', 'org_owner', 'org_user', 'customer']).optional(),
  ontologyDimensions: z.array(z.string()).optional(), // Groups, People, Things, Connections, Events, Knowledge
  assignedSpecialist: z.string().optional(), // Agent name
  totalInferences: z.number().default(100),
  completedInferences: z.number().default(0),
  inferenceTemplate: z.array(z.object({
    range: z.string(), // e.g., "1-10"
    phase: z.string(), // e.g., "Foundation & Setup"
    description: z.string(),
    tasks: z.array(z.string()).optional(),
  })).optional(),
  tasks: z.array(z.object({
    inferenceNumber: z.number(),
    content: z.string(), // Task description
    status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
    activeForm: z.string(), // Present continuous form of task
    dependencies: z.array(z.number()).optional(), // Other inference numbers it depends on
  })).optional(),
  dependenciesMet: z.number().default(0),
  totalDependencies: z.number().default(0),
  lessonsLearned: z.array(z.object({
    inference: z.number(),
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
  totalInferences: z.number().optional().default(100),
  completedInferences: z.number().optional().default(0),
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
