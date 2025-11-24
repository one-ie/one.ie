/**
 * PROPERTY VALIDATORS FOR ALL 66 THING TYPES
 *
 * This file defines strict TypeScript validators for every thing type property schema.
 * Used at mutation time to validate entity properties before storage.
 *
 * Pattern:
 * 1. Define a validator for each thing type using Convex v.object()
 * 2. Create a PropertySchemas map for runtime lookup
 * 3. Use validators in mutations before inserting/updating entities
 *
 * Example usage in mutation:
 * ```
 * const schema = PropertySchemas[entityType];
 * await ctx.db.patch(entityId, { properties: schema.parse(properties) });
 * ```
 */

import { v } from "convex/values";

// ============================================================================
// CORE ENTITY TYPES (4)
// ============================================================================

export const creatorProperties = v.object({
  email: v.optional(v.string()),
  username: v.optional(v.string()),
  displayName: v.optional(v.string()),
  bio: v.optional(v.string()),
  avatar: v.optional(v.string()),
  role: v.optional(
    v.union(
      v.literal("platform_owner"),
      v.literal("group_owner"),
      v.literal("group_user"),
      v.literal("customer")
    )
  ),
  social: v.optional(
    v.object({
      twitter: v.optional(v.string()),
      linkedin: v.optional(v.string()),
      github: v.optional(v.string()),
      website: v.optional(v.string()),
    })
  ),
});

export const aiCloneProperties = v.object({
  creatorId: v.optional(v.string()), // Reference to creator entity
  personality: v.optional(v.string()),
  trainingData: v.optional(v.array(v.string())),
  systemPrompt: v.optional(v.string()),
  capabilities: v.optional(v.array(v.string())),
  settings: v.optional(v.any()),
});

export const audienceMemberProperties = v.object({
  email: v.optional(v.string()),
  displayName: v.optional(v.string()),
  avatar: v.optional(v.string()),
  joinedAt: v.optional(v.number()),
  preferredLanguage: v.optional(v.string()),
  notifications: v.optional(v.boolean()),
});

export const organizationProperties = v.object({
  slug: v.optional(v.string()),
  website: v.optional(v.string()),
  industry: v.optional(v.string()),
  size: v.optional(v.union(
    v.literal("1-10"),
    v.literal("11-50"),
    v.literal("51-200"),
    v.literal("201-500"),
    v.literal("500+")
  )),
  settings: v.optional(v.any()),
});

// ============================================================================
// AGENT TYPES (10)
// ============================================================================

export const strategyAgentProperties = v.object({
  model: v.optional(v.string()),
  vision: v.optional(v.string()),
  okrs: v.optional(v.array(v.string())),
  frequency: v.optional(v.string()),
});

export const researchAgentProperties = v.object({
  model: v.optional(v.string()),
  keywords: v.optional(v.array(v.string())),
  sources: v.optional(v.array(v.string())),
  frequency: v.optional(v.string()),
});

export const marketingAgentProperties = v.object({
  model: v.optional(v.string()),
  channels: v.optional(v.array(v.string())),
  campaigns: v.optional(v.array(v.any())),
  audience: v.optional(v.object({
    segments: v.optional(v.array(v.string())),
    interests: v.optional(v.array(v.string())),
  })),
});

export const salesAgentProperties = v.object({
  model: v.optional(v.string()),
  pipeline: v.optional(v.array(v.string())),
  conversionTarget: v.optional(v.number()),
  followUpFrequency: v.optional(v.string()),
});

export const serviceAgentProperties = v.object({
  model: v.optional(v.string()),
  responseTime: v.optional(v.string()),
  escalationPolicy: v.optional(v.string()),
  knowledgeBase: v.optional(v.array(v.string())),
});

export const designAgentProperties = v.object({
  model: v.optional(v.string()),
  brandGuidelines: v.optional(v.string()),
  tools: v.optional(v.array(v.string())),
  templates: v.optional(v.array(v.string())),
});

export const engineeringAgentProperties = v.object({
  model: v.optional(v.string()),
  languages: v.optional(v.array(v.string())),
  frameworks: v.optional(v.array(v.string())),
  repos: v.optional(v.array(v.string())),
});

export const financeAgentProperties = v.object({
  model: v.optional(v.string()),
  currencies: v.optional(v.array(v.string())),
  budget: v.optional(v.number()),
  forecastPeriod: v.optional(v.string()),
});

export const legalAgentProperties = v.object({
  model: v.optional(v.string()),
  jurisdiction: v.optional(v.string()),
  specialties: v.optional(v.array(v.string())),
  templates: v.optional(v.array(v.string())),
});

export const intelligenceAgentProperties = v.object({
  model: v.optional(v.string()),
  metrics: v.optional(v.array(v.string())),
  dashboards: v.optional(v.array(v.string())),
  alerts: v.optional(v.any()),
});

// ============================================================================
// CONTENT TYPES (6)
// ============================================================================

export const blogPostProperties = v.object({
  slug: v.optional(v.string()),
  content: v.optional(v.string()),
  excerpt: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
  category: v.optional(v.string()),
  publishedAt: v.optional(v.number()),
  imageUrl: v.optional(v.string()),
});

export const videoProperties = v.object({
  url: v.optional(v.string()),
  thumbnail: v.optional(v.string()),
  duration: v.optional(v.number()),
  transcript: v.optional(v.string()),
  platform: v.optional(v.union(
    v.literal("youtube"),
    v.literal("vimeo"),
    v.literal("custom")
  )),
});

export const podcastProperties = v.object({
  feedUrl: v.optional(v.string()),
  episodeNumber: v.optional(v.number()),
  duration: v.optional(v.number()),
  transcript: v.optional(v.string()),
  platform: v.optional(v.string()),
});

export const socialPostProperties = v.object({
  platform: v.optional(
    v.union(
      v.literal("twitter"),
      v.literal("instagram"),
      v.literal("linkedin"),
      v.literal("facebook"),
      v.literal("tiktok")
    )
  ),
  content: v.optional(v.string()),
  media: v.optional(v.array(v.string())),
  engagementMetrics: v.optional(v.object({
    likes: v.optional(v.number()),
    shares: v.optional(v.number()),
    comments: v.optional(v.number()),
  })),
});

export const emailProperties = v.object({
  subject: v.optional(v.string()),
  content: v.optional(v.string()),
  htmlContent: v.optional(v.string()),
  recipient: v.optional(v.string()),
  sentAt: v.optional(v.number()),
});

// ============================================================================
// COURSE/EDUCATION TYPES (already in content, adding specific ones)
// ============================================================================

export const courseProperties = v.object({
  slug: v.optional(v.string()),
  description: v.optional(v.string()),
  price: v.optional(v.number()),
  currency: v.optional(v.string()),
  lessons: v.optional(v.array(v.string())), // References to lesson entities
  instructor: v.optional(v.string()), // Reference to creator/instructor
  level: v.optional(
    v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced")
    )
  ),
  duration: v.optional(v.number()), // Hours
  enrollmentCount: v.optional(v.number()),
});

export const lessonProperties = v.object({
  courseId: v.optional(v.string()), // Reference to course entity
  sequenceNumber: v.optional(v.number()),
  content: v.optional(v.string()),
  videoUrl: v.optional(v.string()),
  duration: v.optional(v.number()), // Minutes
  quiz: v.optional(v.any()),
});

// ============================================================================
// PRODUCT/COMMERCE TYPES
// ============================================================================

export const productProperties = v.object({
  slug: v.optional(v.string()),
  sku: v.optional(v.string()),
  description: v.optional(v.string()),
  price: v.optional(v.number()),
  originalPrice: v.optional(v.number()),
  currency: v.optional(v.string()),
  inventory: v.optional(v.number()),
  category: v.optional(v.string()),
  images: v.optional(v.array(v.string())),
  attributes: v.optional(v.any()), // Variants, dimensions, etc.
});

export const digitalProductProperties = v.object({
  slug: v.optional(v.string()),
  price: v.optional(v.number()),
  currency: v.optional(v.string()),
  downloadUrl: v.optional(v.string()),
  fileSize: v.optional(v.number()),
  licenseType: v.optional(v.string()),
  deliveryMethod: v.optional(
    v.union(
      v.literal("instant_download"),
      v.literal("email"),
      v.literal("account_access")
    )
  ),
});

export const membershipProperties = v.object({
  tier: v.optional(v.string()),
  price: v.optional(v.number()),
  currency: v.optional(v.string()),
  billingCycle: v.optional(
    v.union(
      v.literal("monthly"),
      v.literal("yearly")
    )
  ),
  benefits: v.optional(v.array(v.string())),
  maxMembers: v.optional(v.number()),
});

export const consultationProperties = v.object({
  expertId: v.optional(v.string()), // Reference to creator/expert
  pricePerHour: v.optional(v.number()),
  currency: v.optional(v.string()),
  availableSlots: v.optional(v.array(v.object({
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
  }))),
  timezone: v.optional(v.string()),
  format: v.optional(
    v.union(
      v.literal("video_call"),
      v.literal("phone"),
      v.literal("in_person")
    )
  ),
});

export const nftProperties = v.object({
  contractAddress: v.optional(v.string()),
  tokenId: v.optional(v.string()),
  chain: v.optional(
    v.union(
      v.literal("ethereum"),
      v.literal("polygon"),
      v.literal("solana"),
      v.literal("arbitrum")
    )
  ),
  metadata: v.optional(v.any()),
  royalties: v.optional(v.number()), // Percentage
});

// ============================================================================
// COMMUNITY/SOCIAL TYPES
// ============================================================================

export const communityProperties = v.object({
  slug: v.optional(v.string()),
  description: v.optional(v.string()),
  memberCount: v.optional(v.number()),
  categories: v.optional(v.array(v.string())),
  rules: v.optional(v.string()),
  moderators: v.optional(v.array(v.string())), // References to creator entities
});

export const conversationProperties = v.object({
  title: v.optional(v.string()),
  participants: v.optional(v.array(v.string())), // References to creator entities
  isPublic: v.optional(v.boolean()),
  messageCount: v.optional(v.number()),
});

export const messageProperties = v.object({
  conversationId: v.optional(v.string()), // Reference to conversation entity
  senderId: v.optional(v.string()), // Reference to creator entity
  content: v.optional(v.string()),
  attachments: v.optional(v.array(v.string())),
  reactions: v.optional(v.object({
    emoji: v.optional(v.string()),
    count: v.optional(v.number()),
  })),
});

// ============================================================================
// TOKEN/BLOCKCHAIN TYPES
// ============================================================================

export const tokenProperties = v.object({
  symbol: v.optional(v.string()),
  name: v.optional(v.string()),
  contractAddress: v.optional(v.string()),
  chain: v.optional(
    v.union(
      v.literal("ethereum"),
      v.literal("polygon"),
      v.literal("solana"),
      v.literal("arbitrum")
    )
  ),
  totalSupply: v.optional(v.number()),
  decimals: v.optional(v.number()),
  metadata: v.optional(v.any()),
});

export const tokenContractProperties = v.object({
  address: v.optional(v.string()),
  chain: v.optional(
    v.union(
      v.literal("ethereum"),
      v.literal("polygon"),
      v.literal("solana")
    )
  ),
  standard: v.optional(
    v.union(
      v.literal("ERC20"),
      v.literal("ERC721"),
      v.literal("ERC1155"),
      v.literal("SPL")
    )
  ),
  deploymentBlock: v.optional(v.number()),
});

// ============================================================================
// PLATFORM/WEB TYPES
// ============================================================================

export const websiteProperties = v.object({
  slug: v.optional(v.string()),
  url: v.optional(v.string()),
  title: v.optional(v.string()),
  description: v.optional(v.string()),
  favicon: v.optional(v.string()),
});

export const landingPageProperties = v.object({
  slug: v.optional(v.string()),
  headline: v.optional(v.string()),
  subheadline: v.optional(v.string()),
  cta: v.optional(v.object({
    text: v.optional(v.string()),
    url: v.optional(v.string()),
  })),
  sections: v.optional(v.array(v.any())),
});

export const templateProperties = v.object({
  category: v.optional(v.string()),
  description: v.optional(v.string()),
  previewUrl: v.optional(v.string()),
  variables: v.optional(v.array(v.string())),
  customizable: v.optional(v.boolean()),
});

export const livestreamProperties = v.object({
  platform: v.optional(
    v.union(
      v.literal("youtube"),
      v.literal("twitch"),
      v.literal("custom")
    )
  ),
  url: v.optional(v.string()),
  scheduledAt: v.optional(v.number()),
  duration: v.optional(v.number()),
  viewerCount: v.optional(v.number()),
});

// ============================================================================
// BUSINESS/OPERATIONS TYPES
// ============================================================================

export const paymentProperties = v.object({
  amount: v.optional(v.number()),
  currency: v.optional(v.string()),
  method: v.optional(
    v.union(
      v.literal("card"),
      v.literal("bank_transfer"),
      v.literal("crypto"),
      v.literal("paypal")
    )
  ),
  status: v.optional(
    v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("refunded")
    )
  ),
  externalId: v.optional(v.string()),
  metadata: v.optional(v.any()),
});

export const subscriptionProperties = v.object({
  tier: v.optional(v.string()),
  price: v.optional(v.number()),
  currency: v.optional(v.string()),
  billingCycle: v.optional(
    v.union(
      v.literal("monthly"),
      v.literal("yearly")
    )
  ),
  nextBillingDate: v.optional(v.number()),
  cancellationDate: v.optional(v.number()),
});

export const invoiceProperties = v.object({
  invoiceNumber: v.optional(v.string()),
  amount: v.optional(v.number()),
  currency: v.optional(v.string()),
  dueDate: v.optional(v.number()),
  issuedDate: v.optional(v.number()),
  items: v.optional(v.array(v.any())),
  notes: v.optional(v.string()),
});

export const metricProperties = v.object({
  key: v.optional(v.string()),
  value: v.optional(v.number()),
  unit: v.optional(v.string()),
  timestamp: v.optional(v.number()),
  target: v.optional(v.number()),
});

export const insightProperties = v.object({
  title: v.optional(v.string()),
  description: v.optional(v.string()),
  data: v.optional(v.any()),
  confidence: v.optional(v.number()),
  actionItems: v.optional(v.array(v.string())),
});

export const taskProperties = v.object({
  title: v.optional(v.string()),
  description: v.optional(v.string()),
  assignee: v.optional(v.string()), // Reference to creator entity
  dueDate: v.optional(v.number()),
  priority: v.optional(
    v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    )
  ),
  checklist: v.optional(v.array(v.object({
    item: v.optional(v.string()),
    completed: v.optional(v.boolean()),
  }))),
});

// ============================================================================
// ADDITIONAL TYPES FOR COMMERCE/PORTFOLIO
// ============================================================================

export const caseStudyProperties = v.object({
  slug: v.optional(v.string()),
  client: v.optional(v.string()),
  description: v.optional(v.string()),
  results: v.optional(v.array(v.string())),
  images: v.optional(v.array(v.string())),
  technologies: v.optional(v.array(v.string())),
});

export const projectProperties = v.object({
  slug: v.optional(v.string()),
  description: v.optional(v.string()),
  image: v.optional(v.string()),
  technologies: v.optional(v.array(v.string())),
  link: v.optional(v.string()),
  github: v.optional(v.string()),
});

export const pageProperties = v.object({
  slug: v.optional(v.string()),
  content: v.optional(v.string()),
  meta: v.optional(v.object({
    title: v.optional(v.string()),
    description: v.optional(v.string()),
  })),
});

export const fileProperties = v.object({
  url: v.optional(v.string()),
  mimeType: v.optional(v.string()),
  size: v.optional(v.number()),
  uploadedAt: v.optional(v.number()),
});

export const linkProperties = v.object({
  url: v.optional(v.string()),
  title: v.optional(v.string()),
  description: v.optional(v.string()),
  favicon: v.optional(v.string()),
});

export const noteProperties = v.object({
  content: v.optional(v.string()),
  color: v.optional(v.string()),
  pinned: v.optional(v.boolean()),
  tags: v.optional(v.array(v.string())),
});

// ============================================================================
// PRODUCT-SPECIFIC TYPES
// ============================================================================

export const productVariantProperties = v.object({
  sku: v.optional(v.string()),
  price: v.optional(v.number()),
  attributes: v.optional(v.any()), // Size, color, etc.
  inventory: v.optional(v.number()),
});

export const shoppingCartProperties = v.object({
  items: v.optional(v.array(v.object({
    productId: v.optional(v.string()),
    quantity: v.optional(v.number()),
    price: v.optional(v.number()),
  }))),
  subtotal: v.optional(v.number()),
  tax: v.optional(v.number()),
  shipping: v.optional(v.number()),
  total: v.optional(v.number()),
});

export const orderProperties = v.object({
  orderNumber: v.optional(v.string()),
  items: v.optional(v.array(v.any())),
  total: v.optional(v.number()),
  status: v.optional(
    v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled")
    )
  ),
  shippingAddress: v.optional(v.any()),
  trackingNumber: v.optional(v.string()),
});

export const discountCodeProperties = v.object({
  code: v.optional(v.string()),
  type: v.optional(
    v.union(
      v.literal("percentage"),
      v.literal("fixed_amount")
    )
  ),
  value: v.optional(v.number()),
  expiryDate: v.optional(v.number()),
  maxUses: v.optional(v.number()),
  currentUses: v.optional(v.number()),
  minPurchaseAmount: v.optional(v.number()),
});

// ============================================================================
// BLOG-SPECIFIC TYPES
// ============================================================================

export const blogCategoryProperties = v.object({
  slug: v.optional(v.string()),
  description: v.optional(v.string()),
  icon: v.optional(v.string()),
});

// ============================================================================
// CONTACT/FORM TYPES
// ============================================================================

export const contactSubmissionProperties = v.object({
  name: v.optional(v.string()),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  subject: v.optional(v.string()),
  message: v.optional(v.string()),
  ipAddress: v.optional(v.string()),
  userAgent: v.optional(v.string()),
  status: v.optional(
    v.union(
      v.literal("new"),
      v.literal("read"),
      v.literal("responded"),
      v.literal("archived")
    )
  ),
});

// ============================================================================
// SCHEMA REGISTRY: MAP TYPE -> VALIDATOR
//
// This map is used at runtime to validate properties for any entity type.
// Add new types here as they're defined.
// ============================================================================

export const PropertySchemas = {
  // Core
  creator: creatorProperties,
  ai_clone: aiCloneProperties,
  audience_member: audienceMemberProperties,
  organization: organizationProperties,

  // Agents
  strategy_agent: strategyAgentProperties,
  research_agent: researchAgentProperties,
  marketing_agent: marketingAgentProperties,
  sales_agent: salesAgentProperties,
  service_agent: serviceAgentProperties,
  design_agent: designAgentProperties,
  engineering_agent: engineeringAgentProperties,
  finance_agent: financeAgentProperties,
  legal_agent: legalAgentProperties,
  intelligence_agent: intelligenceAgentProperties,

  // Content
  blog_post: blogPostProperties,
  video: videoProperties,
  podcast: podcastProperties,
  social_post: socialPostProperties,
  email: emailProperties,
  course: courseProperties,
  lesson: lessonProperties,

  // Products & Commerce
  product: productProperties,
  digital_product: digitalProductProperties,
  membership: membershipProperties,
  consultation: consultationProperties,
  nft: nftProperties,

  // Community
  community: communityProperties,
  conversation: conversationProperties,
  message: messageProperties,

  // Tokens & Blockchain
  token: tokenProperties,
  token_contract: tokenContractProperties,

  // Platform & Web
  website: websiteProperties,
  landing_page: landingPageProperties,
  template: templateProperties,
  livestream: livestreamProperties,

  // Business & Operations
  payment: paymentProperties,
  subscription: subscriptionProperties,
  invoice: invoiceProperties,
  metric: metricProperties,
  insight: insightProperties,
  task: taskProperties,

  // Portfolio
  case_study: caseStudyProperties,
  project: projectProperties,
  page: pageProperties,
  file: fileProperties,
  link: linkProperties,
  note: noteProperties,

  // Product-specific
  product_variant: productVariantProperties,
  shopping_cart: shoppingCartProperties,
  order: orderProperties,
  discount_code: discountCodeProperties,

  // Blog
  blog_category: blogCategoryProperties,

  // Contact & Forms
  contact_submission: contactSubmissionProperties,
} as const;

/**
 * Get validator for a thing type
 * Returns undefined if type not found
 */
export function getPropertyValidator(
  thingType: string
): (typeof PropertySchemas)[keyof typeof PropertySchemas] | undefined {
  return PropertySchemas[thingType as keyof typeof PropertySchemas];
}

/**
 * Type guard: Check if a thing type has a defined property schema
 */
export function hasPropertySchema(thingType: string): boolean {
  return thingType in PropertySchemas;
}
