# ONE Creator Platform Ontology

**Version:** 1.0.0
**Purpose:** Complete data model for the AI-powered creator platform
**Principle:** Everything maps to 6 dimensions. If it doesn't fit, you're thinking wrong.

---

## The 6-Dimension Model (Simple & Complete)

```
GROUPS      → Isolation boundaries (creators, brands, communities)
PEOPLE      → Who can do what (creator, team, fan roles)
THINGS      → All entities (AI clones, content, courses, tokens)
CONNECTIONS → How things relate (owns, teaches, subscribes, holds_tokens)
EVENTS      → What happened (published, purchased, learned, earned)
KNOWLEDGE   → Understanding (RAG, embeddings, AI training data)
```

**Golden Rule:** Every feature MUST map to these 6 dimensions. No exceptions.

---

## 1. GROUPS - Creator Organizations

**Purpose:** Multi-tenant isolation. Each creator brand is a group with complete data separation.

```typescript
{
  _id: Id<'groups'>,
  slug: string,              // URL: /creator-name
  name: string,              // "MrBeast", "Ali Abdaal", etc.
  type: 'creator_brand',     // Always for creators

  branding: {
    logo: string,
    colors: { primary, secondary, accent },
    tagline: string,
  },

  platforms: {              // Connected social platforms
    youtube: { handle, followers, verified },
    tiktok: { handle, followers, verified },
    instagram: { handle, followers, verified },
    // ... extensible
  },

  token: {                  // Creator token configuration
    symbol: string,         // "BEAST", "ALI", etc.
    supply: number,         // 10,000,000
    price: number,          // Current price in USD
    contract: string,       // Blockchain address
  },

  plan: 'starter' | 'pro' | 'enterprise',  // €99-999/month

  metrics: {
    totalFans: number,
    monthlyRevenue: number,
    tokenMarketCap: number,
  }
}
```

**Key Insights:**
- Each creator is a completely isolated group
- All data (content, fans, revenue) scoped to groupId
- Supports sub-groups for teams/communities

---

## 2. PEOPLE - Authorization & Roles

**Purpose:** Define who can do what within the platform and groups.

**NOTE:** Backend implements people as `things` with `type: 'user'` (see schema.ts). The PEOPLE dimension is preserved via:
- Type: `user`
- Properties: `{ email, role, groupId, creatorProfile?, fanProfile? }`
- Represented in the 6-dimension ontology for conceptual clarity

```typescript
// Conceptual representation (stored as thing with type: 'user')
{
  _id: Id<'things'>,
  groupId: Id<'groups'>,    // Primary group affiliation
  type: 'user',

  properties: {
    email: string,
    username: string,
    role: 'platform_owner' | 'creator' | 'team_member' | 'fan',

    // Role mapping:
    // platform_owner → Owns ONE Platform (that's you)
    // creator → Owns a creator group (group_owner)
    // team_member → Works for creator (group_user)
    // fan → Consumes content (customer)

    groups: Id<'groups'>[],   // All groups they belong to

    creatorProfile?: {        // For creators only
      yearsCreating: number,
      fullTime: boolean,
      expertise: string[],
    },

    fanProfile?: {            // For fans only
      memberSince: number,
      lifetimeValue: number,
      tokensHeld: number,
      coursesCompleted: number,
    }
  },

  status: 'active' | 'inactive' | 'archived',
  createdAt: number,
  updatedAt: number,
}
```

**Key Insights:**
- 4 clear roles with different access levels
- Creators control their group completely
- Fans can belong to multiple creator groups
- Backend implementation: People are things with `type: 'user'` (simplifies schema to 5 tables instead of 6)

---

## 3. THINGS - Core Platform Entities

**Purpose:** Every "thing" that exists in the platform.

```typescript
type CreatorThingType =
  // AI & AGENTS (Most Important)
  | 'ai_clone'           // Creator's digital twin (voice + appearance + knowledge)
  | 'creator_agent'      // Autonomous agent managing creator business

  // CONTENT
  | 'video'              // YouTube/TikTok imports
  | 'blog_post'          // Written content
  | 'podcast'            // Audio content
  | 'social_post'        // Cross-platform posts
  | 'livestream'         // Live content

  // EDUCATION
  | 'course'             // Full course
  | 'lesson'             // Course lesson
  | 'quiz'               // Assessment
  | 'certificate'        // Completion cert

  // COMMUNITY
  | 'community_post'     // Forum/feed posts
  | 'chat_message'       // DMs and group chats
  | 'challenge'          // Community challenges

  // MONETIZATION
  | 'token'              // Creator token
  | 'product'            // Digital/physical products
  | 'membership_tier'    // Subscription levels
  | 'sponsorship'        // Brand deals

  // ANALYTICS
  | 'report'             // Performance reports
  | 'insight';           // AI-generated insights

{
  _id: Id<'things'>,
  groupId: Id<'groups'>,          // ALWAYS - which creator owns this
  type: CreatorThingType,
  name: string,

  // Type-specific properties
  properties: {
    // For AI Clone
    voiceModelId?: string,
    appearanceModelId?: string,
    personalityProfile?: object,
    knowledgeBaseIds?: string[],
    qualityScores?: {
      voice: number,         // 1-100
      appearance: number,    // 1-100
      personality: number,   // 1-100
      knowledge: number,     // 1-100
    },

    // For Token
    totalSupply?: number,
    burnedSupply?: number,
    currentPrice?: number,

    // For Course
    modules?: object[],
    duration?: number,
    difficulty?: 'beginner' | 'intermediate' | 'advanced',
    tokenPrice?: number,      // How many tokens to access

    // ... extensible per type
  },

  status: 'draft' | 'active' | 'archived',
  createdAt: number,
  updatedAt: number,
}
```

**Key Insights:**
- AI Clone is the central "thing" - it represents the creator digitally
- Everything is owned by a group (via groupId)
- Properties field allows flexibility without schema changes

---

## 4. CONNECTIONS - Relationships

**Purpose:** How things relate to each other.

```typescript
type CreatorConnectionType =
  // OWNERSHIP
  | 'owns'               // Creator owns AI clone, courses, content
  | 'created_by'         // Content created by creator/AI

  // EDUCATION
  | 'teaches'            // AI clone teaches course
  | 'enrolled_in'        // Fan enrolled in course
  | 'completed'          // Fan completed lesson

  // TOKENS
  | 'holds_tokens'       // Fan holds creator tokens
  | 'staked_tokens'      // Tokens staked for benefits

  // COMMUNITY
  | 'member_of'          // Fan member of community
  | 'moderates'          // Team moderates community
  | 'subscribed_to'      // Fan subscribed to creator

  // ENGAGEMENT
  | 'chatted_with'       // Fan chatted with AI clone
  | 'liked'              // Fan liked content
  | 'shared';            // Fan shared content

{
  _id: Id<'connections'>,
  groupId: Id<'groups'>,           // Which creator's ecosystem

  fromThingId: Id<'things'>,       // Source entity
  toThingId: Id<'things'>,         // Target entity
  connectionType: CreatorConnectionType,

  metadata: {
    // For holds_tokens
    balance?: number,
    acquiredAt?: number,
    averagePrice?: number,

    // For enrolled_in
    progress?: number,             // 0-100%
    startedAt?: number,

    // For chatted_with
    messageCount?: number,
    satisfaction?: number,          // 1-5 rating

    // ... extensible per connection type
  },

  validFrom: number,               // When relationship started
  validTo?: number,                // When ended (if applicable)
}
```

**Key Insights:**
- Tracks token holdings as connections (fan → token)
- AI clone interactions are connections (fan → ai_clone)
- Enables relationship-based queries (who holds most tokens?)

---

## 5. EVENTS - Activity Stream

**Purpose:** Complete audit trail of everything that happens.

```typescript
type CreatorEventType =
  // PUBLISHING
  | 'content_published'      // Video, post, podcast released
  | 'course_launched'        // New course available
  | 'livestream_started'     // Going live

  // AI CLONE
  | 'ai_conversation'        // Fan talked to AI
  | 'ai_content_generated'   // AI created content
  | 'ai_training_updated'    // AI improved

  // TOKENS
  | 'tokens_purchased'       // Fan bought tokens
  | 'tokens_burned'          // Tokens used for access
  | 'tokens_earned'          // Fan earned tokens
  | 'tokens_staked'          // Locked for benefits

  // LEARNING
  | 'lesson_completed'       // Progress tracked
  | 'quiz_passed'           // Assessment done
  | 'certificate_earned'     // Course finished

  // COMMUNITY
  | 'member_joined'          // New fan
  | 'post_created'          // Community content
  | 'challenge_completed'    // Engagement

  // REVENUE
  | 'revenue_generated'      // Money earned
  | 'payout_processed';      // Creator paid

{
  _id: Id<'events'>,
  groupId: Id<'groups'>,           // Which creator's ecosystem

  eventType: CreatorEventType,
  actorId: Id<'people'>,           // Who did it
  targetId?: Id<'things'>,         // What was affected

  metadata: {
    // For tokens_purchased
    amount?: number,
    price?: number,
    paymentMethod?: string,

    // For ai_conversation
    messages?: number,
    duration?: number,
    satisfaction?: number,

    // For revenue_generated
    source?: 'tokens' | 'courses' | 'products' | 'memberships',
    amount?: number,
    currency?: string,

    // ... extensible per event type
  },

  timestamp: number,
}
```

**Key Insights:**
- Every token transaction is logged
- AI interactions tracked for quality improvement
- Revenue attribution by source

---

## 6. KNOWLEDGE - AI Training & RAG

**Purpose:** Powers AI clone intelligence and semantic search.

```typescript
type KnowledgeType =
  | 'training_data'       // Source content for AI clone
  | 'conversation'        // Fan-AI interactions for learning
  | 'correction'          // Creator feedback on AI responses
  | 'embedding'           // Vector for semantic search
  | 'tag';                // Categorization

{
  _id: Id<'knowledge'>,
  groupId: Id<'groups'>,          // Which creator's knowledge

  knowledgeType: KnowledgeType,

  // For training data
  sourceType?: 'video' | 'blog' | 'podcast' | 'course',
  sourceId?: Id<'things'>,

  // Text content
  text?: string,                  // Actual content

  // Vector embedding
  embedding?: number[],            // For semantic search
  embeddingModel?: string,        // Which AI model

  // Quality tracking
  accuracy?: number,               // How accurate is this knowledge
  useCount?: number,              // How often referenced
  lastUsed?: number,              // When last accessed

  metadata: {
    // For conversations
    fanRating?: number,            // 1-5 stars
    creatorApproved?: boolean,

    // For corrections
    originalResponse?: string,
    correctedResponse?: string,

    // ... extensible
  },

  createdAt: number,
  updatedAt: number,
}
```

**Key Insights:**
- AI clone learns from all creator content
- Fan conversations improve AI over time
- Creator corrections are high-value training data
- Embeddings enable "AI that knows everything about creator"

---

## Feature → Dimension Mapping

### Core Features Mapped

| Feature | Groups | People | Things | Connections | Events | Knowledge |
|---------|---------|---------|---------|-------------|---------|-----------|
| **AI Clone** | Creator's group owns it | Creator controls it | `ai_clone` entity | `owns`, `chatted_with` | `ai_conversation` | Training data, corrections |
| **Tokens** | Token per group | Fans hold them | `token` entity | `holds_tokens` | `tokens_purchased` | - |
| **Courses** | Group's courses | Creator teaches, fans learn | `course`, `lesson` | `enrolled_in`, `teaches` | `lesson_completed` | Course content for RAG |
| **Community** | Group's community | Members interact | `community_post` | `member_of` | `post_created` | - |
| **Content** | Group's content | Creator publishes | `video`, `blog_post` | `created_by` | `content_published` | Content for AI training |
| **Revenue** | Group's revenue | Creator earns | - | - | `revenue_generated` | - |

### Onboarding Flows Mapped

**Creator Onboarding (< 60 min):**
1. Create GROUP (brand setup)
2. Create PERSON (creator role)
3. Create THING (ai_clone)
4. Create KNOWLEDGE (import content)
5. Create THING (token)
6. Create CONNECTION (creator owns ai_clone)
7. Create EVENT (creator_onboarded)

**Fan Onboarding (< 10 min):**
1. Create PERSON (fan role)
2. Create CONNECTION (member_of group)
3. Create EVENT (tokens_purchased)
4. Create CONNECTION (holds_tokens)
5. Create CONNECTION (enrolled_in course)
6. Create CONNECTION (chatted_with ai_clone)
7. Create EVENT (fan_activated)

---

## Implementation Rules

### 1. ALWAYS Use GroupId
Every table has `groupId` for multi-tenant isolation:
```typescript
entities.groupId      // Which creator owns this thing (formerly "things")
connections.groupId   // Which creator's relationship
events.groupId        // Which creator's event
knowledge.groupId     // Which creator's knowledge
```

### 2. Schema Composition (Dynamic Ontology)
The backend uses **ontology composition** to dynamically generate schema types:

```bash
# Enabled features: core, blog, portfolio, shop
PUBLIC_FEATURES="core,blog,portfolio,shop" bun run scripts/generate-ontology-types.ts
```

**Result:** Auto-generated `backend/convex/types/ontology.ts`
- `THING_TYPES` array (15 types: page, user, file, link, note, blog_post, blog_category, project, case_study, product, product_variant, shopping_cart, order, discount_code, payment, contact_submission)
- `CONNECTION_TYPES` array (11 types: created_by, updated_by, viewed_by, favorited_by, posted_in, belongs_to_portfolio, purchased, in_cart, variant_of, ordered, paid_for)
- `EVENT_TYPES` array (18 types: thing_created, thing_updated, thing_deleted, thing_viewed, blog_post_published, etc.)
- `ENABLED_FEATURES` constant
- Type guards and validation functions

### 3. People as Things (5-Table Schema)
The 6-dimension ontology is implemented as **5 database tables**:
```typescript
groups          // Dimension 1: Multi-tenant boundaries
entities        // Dimension 2+3: People (type:'user') + Things
connections     // Dimension 4: Relationships
events          // Dimension 5: Activity log
knowledge       // Dimension 6: RAG & embeddings
```

**People mapping:**
- Person (role: 'creator') → Entity (type: 'user', properties: {role: 'creator'})
- Person (role: 'fan') → Entity (type: 'user', properties: {role: 'fan'})

### 4. Token Economy Rules
- Tokens are THINGS (type: 'token')
- Holdings are CONNECTIONS (fan → token, metadata.balance)
- Transactions are EVENTS (tokens_purchased, tokens_burned, tokens_earned)

### 5. AI Clone Quality Loop
```
1. KNOWLEDGE (training_data) → trains → AI_CLONE
2. FAN → chatted_with → AI_CLONE → creates → EVENT
3. EVENT.metadata.satisfaction → low? → flag for review
4. CREATOR → creates → KNOWLEDGE (correction)
5. KNOWLEDGE (correction) → improves → AI_CLONE
```

### 6. Query Patterns

**"Show creator's total token holders":**
```sql
SELECT COUNT(*) FROM connections
WHERE groupId = ?
AND toThingId = ? (token)
AND connectionType = 'holds_tokens'
AND metadata.balance > 0
```

**"Get fan's course progress":**
```sql
SELECT * FROM connections
WHERE groupId = ?
AND fromThingId = ? (fan)
AND connectionType = 'enrolled_in'
-- Progress in metadata.progress
```

**"AI clone conversation history":**
```sql
SELECT * FROM events
WHERE groupId = ?
AND targetId = ? (ai_clone)
AND eventType = 'ai_conversation'
ORDER BY timestamp DESC
```

---

## Success Metrics Queries

### Creator Success
- **Revenue**: Sum events where eventType = 'revenue_generated'
- **Fans**: Count unique people where role = 'fan' in group
- **Token Value**: Get thing where type = 'token', check properties.currentPrice
- **AI Quality**: Average events.metadata.satisfaction where eventType = 'ai_conversation'

### Platform Success
- **Total Creators**: Count groups where type = 'creator_brand'
- **Total Fans**: Count people where role = 'fan'
- **Token Volume**: Sum events where eventType = 'tokens_purchased'
- **AI Interactions**: Count events where eventType = 'ai_conversation'

---

## Why This Ontology Wins

1. **Simple**: Just 6 dimensions to understand
2. **Complete**: Maps every platform feature
3. **Scalable**: Works for 1 or 1M creators
4. **Flexible**: Properties/metadata allow evolution
5. **Multi-tenant**: Perfect isolation per creator
6. **Queryable**: Optimized for analytics
7. **Auditable**: Complete event history

**The Bottom Line:** If you understand these 6 dimensions, you can build ANY feature for the creator platform. Every new feature is just a new combination of things, connections, and events within a group's isolated data space.

---

**Status:** READY FOR IMPLEMENTATION ✅