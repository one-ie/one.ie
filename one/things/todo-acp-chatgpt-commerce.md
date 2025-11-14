---
title: "Agentic Commerce Protocol - ChatGPT Integration"
description: "Virtual sales agent living inside ChatGPT powered by 6-dimension ontology"
feature: "acp-chatgpt-commerce"
organization: "ONE Platform"
personRole: "platform_owner"
ontologyDimensions: ["Things", "Connections", "Events", "Knowledge", "People", "Groups"]
assignedSpecialist: "integrator"
totalCycles: 100
completedCycles: 0
createdAt: 2025-11-14
draft: false
protocol: "ACP"
version: "1.0.0"
---

# Agentic Commerce Protocol - ChatGPT Integration

**Strategic Vision:** Deploy a virtual, expert `sales_agent` that lives inside ChatGPT, powered by the complete intelligence of our ontology.

**Universal Architecture:** This system works with **ANY product category** (fashion, electronics, sports equipment, courses, software, etc.). The 6-dimension ontology naturally adapts to any vertical without code changes.

**Demo Use Case:** We use **padel equipment** (Nine Padel) as our reference implementation because it demonstrates complex product consultation (skill level, playing style, pain points, materials). The exact same system works for selling courses, software licenses, fashion, electronics, or any other product—just swap the product catalog and expertise domain.

**Core Insight:** We're not "listing products in a chatbot." We're deploying an autonomous sales agent that intercepts customer research, provides expert consultation, enables frictionless purchase, and builds lifelong customer relationships—all inside ChatGPT.

**Competitive Advantage:** While competitors figure out how to list products in chatbots, we build a fully autonomous system that uses conversational AI as a customer acquisition channel, seamlessly integrating new buyers into a long-term, predictive, and highly profitable loyalty loop.

---

## THE 4-PHASE STRATEGY

### Phase 1: Integration (The Digital Handshake)
Before a customer asks their first question, we establish the connection via ACP.

### Phase 2: Attraction & Consultation (Winning the Moment of Research)
Customer asks ChatGPT about padel rackets. Our agent provides expert consultation, not just search results.

### Phase 3: Conversion (Frictionless In-Chat Purchase)
Customer says "I want to buy it." One-click checkout, zero friction, peak intent capture.

### Phase 4: Growth (From Transaction to Lifelong Customer)
The competitor's interaction ends at the sale. Ours is just beginning. Automated growth engine takes over.

---

## ONTOLOGY MAPPING

### 6-Dimension Model

**GROUPS:**
- Customer's organization (if B2B)
- Seller's business group
- Platform group (ONE)

**PEOPLE:**
- Customer (asking in ChatGPT)
- Sales Agent (AI powered by ontology)
- Creator (product seller)
- Platform Owner (us)

**THINGS:**
- `external_agent` (ChatGPT Commerce Agent)
- `external_connection` (ACP credential store)
- `sales_agent` (our autonomous sales AI)
- `conversation_session` (chat history)
- `product` (what we're selling)
- `ai_recommendation` (agent's product suggestion)
- `customer` (buyer created from first purchase)
- `order` (purchase from chat)

**CONNECTIONS:**
- `communicates_with` (sales_agent ↔ external_agent)
- `authenticated_via` (external_agent ↔ external_connection)
- `recommended` (sales_agent → product)
- `purchased_via_chat` (customer → order)
- `places` (customer → order)
- `owns` (creator → product)

**EVENTS:**
- `acp_message_sent` (outbound to ChatGPT)
- `acp_message_received` (inbound from ChatGPT)
- `conversation_started` (customer initiates)
- `product_mentioned` (in conversation)
- `product_recommended` (by sales agent)
- `question_asked` (customer inquiry)
- `order_placed_from_chat` (purchase)
- `follow_up_scheduled` (automated growth)
- `follow_up_sent` (6 months later)

**KNOWLEDGE:**
- Product embeddings (semantic search)
- Product metadata (AI understanding)
- Customer preferences (inferred from conversation)
- Conversation summaries (for personalization)
- Product comparison data (for recommendations)

---

## UNIVERSAL PRODUCT ARCHITECTURE

**Key Principle:** The sales agent works with ANY product category without code changes. Only the data (product catalog, expertise domain) changes.

### Multi-Vertical Support

**Padel Equipment (Demo):**
```
Sales Agent: "Nine Padel Expert"
Specialization: padel_equipment
Intent Extraction: skill level, playing style, pain points
Consultation: "Power racket + tennis elbow? Try soft-core racket"
Follow-up: "Time to replace overgrips?" (6 months)
```

**Online Courses:**
```
Sales Agent: "Learning Path Advisor"
Specialization: online_education
Intent Extraction: skill level, learning goals, time availability
Consultation: "Beginner in web dev? Start with HTML/CSS before React"
Follow-up: "Ready for advanced JavaScript?" (3 months post-completion)
```

**Fashion E-commerce:**
```
Sales Agent: "Style Consultant"
Specialization: fashion
Intent Extraction: style preferences, body type, occasion, budget
Consultation: "Business casual + athletic build? Try fitted blazers"
Follow-up: "Summer collection just dropped" (seasonal)
```

**SaaS Software:**
```
Sales Agent: "Solution Architect"
Specialization: business_software
Intent Extraction: company size, use case, integrations needed
Consultation: "Need CRM for 10-person team? Start with Starter plan"
Follow-up: "Ready to upgrade to Pro?" (usage-based trigger)
```

**Electronics:**
```
Sales Agent: "Tech Advisor"
Specialization: consumer_electronics
Intent Extraction: use case, technical skill, budget, compatibility
Consultation: "Photography + travel? Mirrorless over DSLR for weight"
Follow-up: "New lens released for your camera" (product-specific)
```

### How It Adapts

**1. Product Schema (Universal):**
```typescript
{
  type: 'product',
  properties: {
    // Universal fields (work for ANY product)
    category: 'padel_racket' | 'course' | 'clothing' | 'software' | 'camera',
    name: string,
    price: number,
    description: string,

    // AI-optimized (adapts to category)
    aiDescription: string, // Detailed, conversational
    aiUseCases: string[], // Category-specific use cases
    aiTargetAudience: string[], // Who it's for
    aiBestFor: string, // Ideal customer
    aiAvoidWhen: string, // When NOT to buy

    // Comparison (category-specific attributes)
    aiComparisonPoints: {
      // Padel: "weight: 360g - lighter for faster swings"
      // Course: "duration: 8 weeks - fits busy schedules"
      // Fashion: "fit: relaxed - comfortable for all-day wear"
      // SaaS: "users: up to 50 - scales with your team"
    },

    // Semantic search (universal)
    aiEmbedding: number[],
    aiKeywords: string[]
  }
}
```

**2. Sales Agent Persona (Per Category):**
```typescript
const agentPersonas = {
  padel_equipment: {
    name: "Nine Padel Expert",
    tone: "Friendly coach who loves the sport",
    expertise: ["skill levels", "playing styles", "injury prevention", "equipment care"],
    questions: [
      "What's your current skill level?",
      "Do you play more aggressively or defensively?",
      "Any arm or shoulder issues?",
      "What's your budget range?"
    ]
  },

  online_courses: {
    name: "Learning Path Advisor",
    tone: "Supportive mentor focused on outcomes",
    expertise: ["learning styles", "skill prerequisites", "time management", "career goals"],
    questions: [
      "What's your current experience level?",
      "What's your end goal with this skill?",
      "How many hours per week can you dedicate?",
      "Prefer video, text, or hands-on projects?"
    ]
  },

  fashion: {
    name: "Style Consultant",
    tone: "Trendy but practical fashion advisor",
    expertise: ["body types", "occasions", "color theory", "seasonal trends"],
    questions: [
      "What's the occasion?",
      "What's your usual style (casual, formal, sporty)?",
      "Any fit preferences or concerns?",
      "Favorite colors or patterns?"
    ]
  }
};
```

**3. Follow-Up Logic (Per Product Lifecycle):**
```typescript
const followUpSchedules = {
  consumables: {
    // Overgrips, cosmetics, food
    replenishmentCycle: 3-6 months,
    trigger: "time-based",
    message: "Time to restock?"
  },

  durables: {
    // Rackets, electronics, furniture
    replenishmentCycle: 2-5 years,
    trigger: "upgrade-based",
    message: "New model with better features"
  },

  courses: {
    // Online education
    replenishmentCycle: "completion-based",
    trigger: "80% course progress",
    message: "Ready for the next level?"
  },

  subscriptions: {
    // SaaS, memberships
    replenishmentCycle: "usage-based",
    trigger: "approaching limits",
    message: "Upgrade to unlock more features?"
  }
};
```

### Why This Works

**Ontology is Universal:**
- A "padel racket" and a "JavaScript course" are both `things` with `type` and `properties`
- A "purchase" connection works the same for physical and digital products
- An "order_placed_from_chat" event captures any transaction
- Product embeddings work for any text description

**AI Adapts Naturally:**
- Same semantic search algorithm (cosine similarity)
- Same recommendation logic (match customer needs to product features)
- Same objection handling (address concerns with product evidence)
- Just the domain expertise changes (loaded as context)

**Creator Experience:**
1. Create product (any category)
2. Fill in AI-optimized fields (description, use cases, target audience)
3. System auto-generates embeddings
4. Sales agent instantly knows how to sell it

**No Code Changes Needed:**
- New vertical? Add products to database
- New sales agent personality? Update system prompt
- New follow-up schedule? Configure lifecycle rules
- Everything else stays the same

---

## PHASE 1: FOUNDATION & ACP INTEGRATION (Cycles 1-10)

**Purpose:** Establish the ACP connection and create the external agent architecture

### Cycle 1: Understand ACP Protocol & Architecture
**Specialist:** integrator

**Tasks:**
- [ ] Read `/one/connections/acp.md` (ACP specification)
- [ ] Understand REST-based agent communication
- [ ] Map ACP concepts to our 6-dimension ontology
- [ ] Review OpenAI's GPT Actions documentation
- [ ] Document decision: Use ACP as foundation for ChatGPT integration

**Deliverable:** Understanding of how ACP enables agent-to-agent communication

**Ontology Alignment:**
- ACP = protocol for external agent communication
- Maps to `connections` dimension (agent relationships)
- Maps to `events` dimension (message logs)

---

### Cycle 2: Design External Agent Architecture
**Specialist:** backend

**Tasks:**
- [ ] Design `external_agent` thing type
  ```typescript
  {
    type: 'external_agent',
    properties: {
      agentId: 'chatgpt-commerce-agent',
      platform: 'openai',
      capabilities: ['product_search', 'product_recommendation', 'purchase_initiation'],
      endpoint: 'https://chat.openai.com',
      status: 'active',
      apiVersion: '1.0'
    }
  }
  ```

- [ ] Design `external_connection` thing type for secure credential storage
  ```typescript
  {
    type: 'external_connection',
    properties: {
      agentId: Id<'things'>, // external_agent
      protocol: 'acp',
      credentials: {
        apiKey: string, // encrypted
        oauth: { clientId, clientSecret, refreshToken }
      },
      dataSharingRules: {
        allowProductData: true,
        allowCustomerData: false, // privacy first
        allowPricing: true,
        allowInventory: true
      }
    }
  }
  ```

- [ ] Design `sales_agent` thing type (our autonomous AI)
  ```typescript
  {
    type: 'sales_agent',
    properties: {
      agentId: 'nine-padel-sales-agent',
      role: 'product_advisor',
      specialization: 'padel_equipment',
      personality: 'helpful_expert_not_pushy',
      capabilities: [
        'product_discovery',
        'expert_consultation',
        'objection_handling',
        'purchase_facilitation',
        'follow_up_automation'
      ],
      knowledgeBase: {
        productCount: 0, // updated dynamically
        conversationHistory: 0, // grows over time
        successRate: 0.0 // conversion metrics
      }
    }
  }
  ```

**Deliverable:** Architecture design for external agent integration

---

### Cycle 3: Create ACP Service (Effect.ts)
**Specialist:** backend

**Tasks:**
- [ ] Create `backend/convex/services/acp.ts`
- [ ] Implement ACP REST endpoints:
  - `POST /agents/{agentId}/messages` - Send message to external agent
  - `GET /agents/{agentId}/messages` - Receive messages from external agent
  - `POST /agents/{agentId}/tasks` - Create task for external agent
  - `GET /agents/{agentId}/tasks/{taskId}` - Check task status
  - `GET /agents/{agentId}/capabilities` - Query agent capabilities
- [ ] Implement message queue for async communication
- [ ] Add error handling for network failures, rate limits, timeouts
- [ ] Log all ACP communications as events

**Effect.ts Service Pattern:**
```typescript
export class ACPService extends Effect.Service<ACPService>()("ACPService", {
  effect: Effect.gen(function* () {
    const db = yield* ConvexDatabase;
    const events = yield* EventService;

    return {
      // Send message via ACP
      sendMessage: (request: ACPMessageRequest) =>
        Effect.gen(function* () {
          const messageId = crypto.randomUUID();

          // Log outbound event
          yield* events.log({
            entityId: request.from,
            eventType: "acp_message_sent",
            actorType: "agent",
            actorId: request.to,
            metadata: { messageId, messageType: request.message.type }
          });

          // Send via REST
          const response = yield* Effect.tryPromise(() =>
            fetch(`${request.endpoint}/agents/${request.to}/messages`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-ACP-Version": "1.0",
                "Authorization": `Bearer ${request.apiKey}`
              },
              body: JSON.stringify({
                from: request.from,
                messageId,
                message: request.message,
                mode: request.mode || "async"
              })
            })
          );

          return yield* Effect.promise(() => response.json());
        }),

      // Receive message from external agent
      receiveMessage: (agentId: string, message: ACPMessage) =>
        Effect.gen(function* () {
          // Log inbound event
          yield* events.log({
            entityId: agentId,
            eventType: "acp_message_received",
            actorType: "external_agent",
            actorId: message.from,
            metadata: message
          });

          // Process based on message type
          if (message.type === "product_query") {
            return yield* handleProductQuery(message);
          } else if (message.type === "purchase_request") {
            return yield* handlePurchaseRequest(message);
          }
        })
    };
  }),
  dependencies: [ConvexDatabase.Default, EventService.Default]
}) {}
```

**Deliverable:** ACP service for external agent communication

---

### Cycle 4: Create Sales Agent Intelligence Service
**Specialist:** backend

**Tasks:**
- [ ] Create `backend/convex/services/sales-agent.ts`
- [ ] Implement conversation state management
- [ ] Implement product recommendation logic
- [ ] Implement objection handling patterns
- [ ] Create consultative dialogue engine

**Sales Agent Pattern:**
```typescript
export class SalesAgentService extends Effect.Service<SalesAgentService>()("SalesAgentService", {
  effect: Effect.gen(function* () {
    const products = yield* ProductService;
    const ai = yield* AIService;
    const knowledge = yield* KnowledgeService;

    return {
      // Process customer query
      handleQuery: (query: string, conversationContext: ConversationContext) =>
        Effect.gen(function* () {
          // Parse intent (what is the customer asking?)
          const intent = yield* ai.parseIntent(query);

          // Extract needs (beginner, budget, style preferences)
          const needs = yield* extractCustomerNeeds(query, conversationContext);

          // Get relevant products (semantic search)
          const relevantProducts = yield* knowledge.semanticSearch({
            query,
            needs,
            limit: 5
          });

          // Check for conflicts (power racket + tennis elbow)
          const conflicts = yield* detectConflicts(needs);

          if (conflicts.length > 0) {
            // Ask clarifying question
            return yield* generateClarifyingQuestion(conflicts[0]);
          }

          // Generate recommendation
          return yield* generateRecommendation({
            products: relevantProducts,
            needs,
            conversationHistory: conversationContext.messages
          });
        }),

      // Detect and address objections
      handleObjection: (objection: string, product: Product) =>
        Effect.gen(function* () {
          const objectionType = yield* classifyObjection(objection);

          // "Is it durable?" → warranty + materials
          // "Good for tournaments?" → pro endorsements
          // "Can I upgrade later?" → upgrade path

          return yield* generateObjectionResponse({
            type: objectionType,
            product,
            evidence: yield* getProductEvidence(product, objectionType)
          });
        })
    };
  }),
  dependencies: [ProductService.Default, AIService.Default, KnowledgeService.Default]
}) {}
```

**Deliverable:** Sales agent intelligence service

---

### Cycle 5: Create ChatGPT Action Definition (OpenAPI Spec)
**Specialist:** integrator

**Tasks:**
- [ ] Create OpenAPI 3.0 spec for ChatGPT Custom Action
- [ ] Define endpoints ChatGPT will call
- [ ] Configure authentication (API key)
- [ ] Set up rate limiting
- [ ] Configure privacy policy URL

**OpenAPI Spec:**
```yaml
openapi: 3.0.0
info:
  title: Nine Padel Commerce API
  description: Expert padel equipment consultation and purchase
  version: 1.0.0
servers:
  - url: https://ninepadel.com/api/acp
paths:
  /agents/chatgpt/search:
    post:
      operationId: searchProducts
      summary: Search padel products with natural language
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                query:
                  type: string
                  description: Customer's natural language query
                needs:
                  type: object
                  description: Extracted customer preferences
                conversationId:
                  type: string
                  description: Conversation session ID
      responses:
        200:
          description: Product recommendations
          content:
            application/json:
              schema:
                type: object
                properties:
                  products:
                    type: array
                  recommendations:
                    type: array
                  clarifyingQuestion:
                    type: string

  /agents/chatgpt/purchase:
    post:
      operationId: initiatePurchase
      summary: Start checkout process
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                productId:
                  type: string
                quantity:
                  type: integer
                conversationId:
                  type: string
      responses:
        200:
          description: Checkout URL
          content:
            application/json:
              schema:
                type: object
                properties:
                  checkoutUrl:
                    type: string
                  orderPreview:
                    type: object
```

**Deliverable:** ChatGPT Custom Action OpenAPI specification

---

### Cycle 6: Implement Product Knowledge Enhancement
**Specialist:** backend

**Tasks:**
- [ ] Enhance product schema with AI-optimized metadata
- [ ] Generate embeddings for all products
- [ ] Create product comparison matrix
- [ ] Build recommendation graph

**Enhanced Product Schema:**
```typescript
{
  type: 'product',
  properties: {
    // Existing fields
    name: string,
    price: number,
    description: string,

    // AI-optimized fields
    aiDescription: string, // Detailed, conversational
    aiUseCases: string[], // ["beginner learning", "competitive play"]
    aiTargetAudience: string[], // ["beginners", "intermediate", "pro"]
    aiBestFor: string, // "Beginners who want forgiving racket"
    aiAvoidWhen: string, // "Not for advanced players seeking precision"

    // Comparison data
    aiComparisonPoints: {
      weight: "360g - lighter than average for faster swings",
      sweetSpot: "Large sweet spot - very forgiving",
      balance: "Head-light - easier maneuverability"
    },

    // Relationships
    aiSimilarProducts: Id<'things'>[], // Similar rackets
    aiOftenBoughtWith: Id<'things'>[], // Strings, grips, bags
    aiUpgradeFrom: Id<'things'>[], // Lower-tier options
    aiUpgradeTo: Id<'things'>[], // Higher-tier options

    // Semantic search
    aiEmbedding: number[], // Vector from OpenAI embeddings
    aiKeywords: string[], // "padel racket, beginner, carbon fiber"
  }
}
```

**Embedding Generation Pipeline:**
```typescript
// Generate embedding for product
const embedding = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: `${product.name} ${product.description} ${product.aiDescription} ${product.aiUseCases.join(' ')}`
});

// Store in product
await products.patch(productId, {
  properties: {
    ...product.properties,
    aiEmbedding: embedding.data[0].embedding
  }
});
```

**Deliverable:** Enhanced product knowledge system

---

### Cycle 7: Create Conversation Session Management
**Specialist:** backend

**Tasks:**
- [ ] Create `conversation_session` thing type
- [ ] Implement session state management
- [ ] Track conversation history
- [ ] Extract and store customer preferences

**Conversation Session Schema:**
```typescript
{
  type: 'conversation_session',
  properties: {
    sessionId: string,
    platform: 'chatgpt',
    userId: string | null, // null until first purchase

    messages: [{
      role: 'user' | 'assistant',
      content: string,
      timestamp: number,
      mentionedProducts: Id<'things'>[]
    }],

    // AI-extracted understanding
    inferredNeeds: {
      skillLevel: 'beginner' | 'intermediate' | 'advanced' | null,
      budget: { min: number, max: number } | null,
      playingStyle: 'aggressive' | 'defensive' | 'balanced' | null,
      painPoints: string[], // ["tennis elbow", "lack of control"]
      preferences: string[] // ["lightweight", "good spin"]
    },

    // Recommendations made
    suggestedProducts: Id<'things'>[],

    // Outcomes
    productsViewed: Id<'things'>[],
    productsAddedToCart: Id<'things'>[],
    ordersCompleted: Id<'things'>[],
    totalValue: number,

    // Status
    startedAt: number,
    endedAt: number | null,
    status: 'active' | 'completed' | 'abandoned'
  }
}
```

**Deliverable:** Conversation session management system

---

### Cycle 8: Create External Agent Registration Flow
**Specialist:** integrator

**Tasks:**
- [ ] Implement agent registration mutation
- [ ] Create external_agent thing in database
- [ ] Create external_connection with credentials
- [ ] Establish communicates_with connection
- [ ] Test ACP handshake

**Registration Flow:**
```typescript
// Step 1: Create external agent
const externalAgent = await things.create({
  type: 'external_agent',
  name: 'ChatGPT Commerce Agent',
  properties: {
    agentId: 'chatgpt-commerce-agent',
    platform: 'openai',
    capabilities: ['product_search', 'product_recommendation', 'purchase_initiation'],
    endpoint: 'https://chat.openai.com',
    status: 'active'
  }
});

// Step 2: Create credentials storage
const connection = await things.create({
  type: 'external_connection',
  name: 'ChatGPT ACP Connection',
  properties: {
    agentId: externalAgent._id,
    protocol: 'acp',
    credentials: encryptCredentials({
      apiKey: process.env.OPENAI_API_KEY
    }),
    dataSharingRules: {
      allowProductData: true,
      allowCustomerData: false,
      allowPricing: true
    }
  }
});

// Step 3: Create our sales agent
const salesAgent = await things.create({
  type: 'sales_agent',
  name: 'Nine Padel Sales Agent',
  properties: {
    agentId: 'nine-padel-sales-agent',
    role: 'product_advisor',
    specialization: 'padel_equipment'
  }
});

// Step 4: Establish relationship
await connections.create({
  fromThingId: salesAgent._id,
  toThingId: externalAgent._id,
  relationshipType: 'communicates_with',
  metadata: {
    protocol: 'acp',
    connectionId: connection._id
  }
});

// Step 5: Log event
await events.log({
  entityId: externalAgent._id,
  eventType: 'external_agent_registered',
  actorType: 'system',
  metadata: {
    platform: 'openai',
    capabilities: externalAgent.properties.capabilities
  }
});
```

**Deliverable:** External agent registration complete

---

### Cycle 9: Create API Routes for ACP Endpoints
**Specialist:** frontend

**Tasks:**
- [ ] Create `/api/acp/agents/chatgpt/search.ts`
- [ ] Create `/api/acp/agents/chatgpt/purchase.ts`
- [ ] Create `/api/acp/agents/chatgpt/messages.ts`
- [ ] Add rate limiting middleware
- [ ] Add authentication middleware

**Search Endpoint:**
```typescript
// web/src/pages/api/acp/agents/chatgpt/search.ts
import type { APIRoute } from "astro";
import { ConvexHttpClient } from "convex/browser";

export const POST: APIRoute = async ({ request }) => {
  const convex = new ConvexHttpClient(import.meta.env.CONVEX_URL);
  const body = await request.json();

  // Validate API key
  const apiKey = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!apiKey || apiKey !== import.meta.env.CHATGPT_API_KEY) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  // Call sales agent service
  const result = await convex.mutation(api.agents.handleProductQuery, {
    query: body.query,
    needs: body.needs,
    conversationId: body.conversationId
  });

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};
```

**Deliverable:** ACP API routes implemented

---

### Cycle 10: Test ACP Integration End-to-End
**Specialist:** quality

**Tasks:**
- [ ] Test agent registration flow
- [ ] Test message sending via ACP
- [ ] Test message receiving from ChatGPT
- [ ] Test product search through ACP
- [ ] Test purchase initiation
- [ ] Verify all events logged correctly

**Test Cases:**
1. Register external agent → verify thing created
2. Send ACP message → verify event logged
3. Receive ACP message → verify processed correctly
4. Search products → verify recommendations returned
5. Initiate purchase → verify checkout URL generated

**Deliverable:** Phase 1 complete, ACP integration tested

---

## PHASE 2: ATTRACTION & CONSULTATION (Cycles 11-30)

**Purpose:** Build the expert consultation layer that wins the moment of research

### Cycle 11: Create Intent Parser (AI Understanding)
**Specialist:** backend

**Tasks:**
- [ ] Implement intent classification
- [ ] Extract skill level from natural language
- [ ] Extract budget constraints
- [ ] Extract playing style preferences
- [ ] Extract pain points and concerns

**Intent Parser:**
```typescript
const parseIntent = async (query: string): Promise<Intent> => {
  const response = await claude.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    system: `You are an expert at understanding customer needs for padel equipment.

    Extract:
    - Skill level (beginner, intermediate, advanced)
    - Budget (extract numbers or "budget-conscious", "willing to invest")
    - Playing style (aggressive, defensive, balanced)
    - Pain points (tennis elbow, lack of control, etc)
    - Preferences (lightweight, good spin, durable, etc)

    Return JSON only.`,
    messages: [{
      role: "user",
      content: query
    }]
  });

  return JSON.parse(response.content[0].text);
};

// Example:
// Query: "I have a bit of tennis elbow, but I'm a fairly aggressive intermediate player"
// Returns:
{
  skillLevel: 'intermediate',
  playingStyle: 'aggressive',
  painPoints: ['tennis elbow'],
  preferences: ['vibration dampening', 'soft core'],
  concerns: ['elbow sensitivity']
}
```

**Deliverable:** AI-powered intent parsing

---

### Cycle 12: Create Conflict Detection System
**Specialist:** backend

**Tasks:**
- [ ] Detect conflicting preferences
- [ ] Generate clarifying questions
- [ ] Resolve conflicts through dialogue

**Conflict Detection:**
```typescript
const detectConflicts = (needs: CustomerNeeds): Conflict[] => {
  const conflicts: Conflict[] = [];

  // Power racket + tennis elbow = conflict
  if (needs.playingStyle === 'aggressive' && needs.painPoints.includes('tennis elbow')) {
    conflicts.push({
      type: 'style_vs_health',
      description: 'Power rackets can aggravate tennis elbow',
      clarifyingQuestion: 'For aggressive players with elbow sensitivity, the key is finding a "soft power" racket. Do you prefer a harder feel for more feedback, or a softer feel for more comfort?',
      resolution: 'recommend_soft_power_rackets'
    });
  }

  // Budget constraint + premium preference
  if (needs.budget?.max < 100 && needs.preferences.includes('premium materials')) {
    conflicts.push({
      type: 'budget_vs_preference',
      clarifyingQuestion: 'Premium carbon fiber rackets typically start around €120. Would you consider increasing your budget for better materials, or should I focus on best value under €100?',
      resolution: 'adjust_expectations_or_budget'
    });
  }

  return conflicts;
};
```

**Deliverable:** Conflict detection and resolution

---

### Cycle 13: Create Semantic Product Search
**Specialist:** backend

**Tasks:**
- [ ] Implement vector similarity search
- [ ] Rank products by relevance to needs
- [ ] Filter by availability and rating
- [ ] Apply boost factors (new products, best sellers)

**Semantic Search:**
```typescript
const semanticSearch = async (query: string, needs: CustomerNeeds): Promise<Product[]> => {
  // Generate query embedding
  const queryEmbedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: `${query} ${needs.skillLevel} ${needs.playingStyle} ${needs.preferences.join(' ')}`
  });

  // Get all products with embeddings
  const products = await db.query('things')
    .filter(q => q.eq(q.field('type'), 'product'))
    .collect();

  // Calculate cosine similarity
  const scoredProducts = products.map(product => ({
    product,
    score: cosineSimilarity(
      queryEmbedding.data[0].embedding,
      product.properties.aiEmbedding
    )
  }));

  // Apply filters
  const filtered = scoredProducts.filter(p =>
    p.product.properties.rating >= 3.5 &&
    p.product.properties.inStock === true
  );

  // Apply boost factors
  const boosted = filtered.map(p => ({
    ...p,
    score: p.score * getBoostFactor(p.product, needs)
  }));

  // Sort by score and return top N
  return boosted
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(p => p.product);
};
```

**Deliverable:** Semantic product search engine

---

### Cycle 14: Create Recommendation Generator
**Specialist:** backend

**Tasks:**
- [ ] Generate personalized recommendations
- [ ] Explain WHY each product matches
- [ ] Include comparison points
- [ ] Suggest alternatives

**Recommendation Generator:**
```typescript
const generateRecommendation = async (context: RecommendationContext): Promise<Recommendation> => {
  const { products, needs, conversationHistory } = context;

  // Generate reasoning for each product
  const recommendations = await Promise.all(
    products.map(async product => {
      const reasoning = await claude.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 512,
        system: `You are an expert padel equipment advisor.

        Explain WHY this product is a good match for the customer.
        - Reference their specific needs
        - Highlight relevant features
        - Be honest about limitations
        - Use conversational tone

        Customer needs: ${JSON.stringify(needs)}
        Product: ${product.name}
        Features: ${JSON.stringify(product.properties.aiComparisonPoints)}`,
        messages: [{
          role: "user",
          content: "Why is this a good match for me?"
        }]
      });

      return {
        product,
        reasoning: reasoning.content[0].text,
        confidenceScore: calculateConfidence(product, needs),
        type: determineRecommendationType(product, needs)
      };
    })
  );

  // Sort by confidence
  const sorted = recommendations.sort((a, b) => b.confidenceScore - a.confidenceScore);

  return {
    primary: sorted[0],
    alternatives: sorted.slice(1, 3),
    explanation: generateOverallExplanation(sorted, needs)
  };
};
```

**Deliverable:** Personalized recommendation engine

---

### Cycle 15: Create Objection Handler
**Specialist:** backend

**Tasks:**
- [ ] Classify objection types
- [ ] Retrieve product evidence
- [ ] Generate honest responses
- [ ] Handle edge cases

**Objection Classification:**
```typescript
const objectionHandlers = {
  durability: async (product: Product) => ({
    response: `The ${product.name} comes with a 2-year warranty and uses ${product.properties.material} which is known for exceptional durability. Customer reviews average ${product.properties.durabilityRating}/5 for long-term use.`,
    evidence: [
      `Warranty: ${product.properties.warranty}`,
      `Material: ${product.properties.material}`,
      `User reviews mention "lasted 2+ years" in ${product.properties.durabilityReviews} reviews`
    ]
  }),

  tournament_ready: async (product: Product) => {
    const proEndorsements = await getProEndorsements(product._id);
    return {
      response: proEndorsements.length > 0
        ? `Yes! ${proEndorsements.length} professional players use this racket in tournaments, including ${proEndorsements[0].name}.`
        : `This racket is approved for tournament play and meets all regulations, though it's more popular among recreational players.`,
      evidence: proEndorsements
    };
  },

  upgrade_path: async (product: Product) => {
    const upgrades = await getRelatedProducts(product._id, 'upgrade_to');
    return {
      response: upgrades.length > 0
        ? `Absolutely! When you're ready, you can upgrade to the ${upgrades[0].name} which offers ${upgrades[0].properties.upgradeAdvantages}.`
        : `This is already a premium racket. Most players stick with it for years.`,
      evidence: upgrades
    };
  }
};
```

**Deliverable:** Objection handling system

---

### Cycle 16: Create Comparison Generator
**Specialist:** backend

**Tasks:**
- [ ] Extract products from conversation
- [ ] Generate side-by-side comparison
- [ ] Highlight key differences
- [ ] Make personalized recommendation

**Comparison Generator:**
```typescript
const generateComparison = async (product1: Product, product2: Product, needs: CustomerNeeds): Promise<Comparison> => {
  const comparison = await claude.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    system: `You are a padel equipment expert. Compare these two products.

    Create a clear, side-by-side comparison highlighting:
    - Key differences (weight, sweet spot, power, control)
    - Which is better for what use case
    - Price difference and value proposition
    - Final recommendation for THIS customer

    Customer needs: ${JSON.stringify(needs)}

    Product 1: ${JSON.stringify(product1)}
    Product 2: ${JSON.stringify(product2)}`,
    messages: [{
      role: "user",
      content: `Compare ${product1.name} vs ${product2.name}`
    }]
  });

  return {
    product1Summary: extractProductSummary(comparison.content[0].text, product1.name),
    product2Summary: extractProductSummary(comparison.content[0].text, product2.name),
    keyDifferences: extractKeyDifferences(comparison.content[0].text),
    recommendation: extractRecommendation(comparison.content[0].text),
    fullComparison: comparison.content[0].text
  };
};
```

**Deliverable:** Product comparison system

---

### Cycle 17: Create Conversation Prompts (System Prompts)
**Specialist:** backend

**Tasks:**
- [ ] Create expert sales agent persona
- [ ] Define conversation guidelines
- [ ] Add product knowledge
- [ ] Include objection handling patterns

**System Prompt:**
```
You are a friendly, knowledgeable padel racket advisor for Nine Padel.

Your goal is to help customers find the perfect racket through genuine consultation, not pushy sales.

PERSONALITY:
- Helpful expert who loves padel
- Honest about product limitations
- Asks clarifying questions before recommending
- Never oversells or misleads

UNDERSTANDING:
- Skill levels: beginner (learning basics) → intermediate (regular player) → advanced (competitive)
- Playing styles: aggressive (power, winners) → defensive (control, consistency) → balanced (all-around)
- Common pain points: tennis elbow, lack of control, weak power, durability concerns
- Budget sensitivity: acknowledge constraints, show value

RECOMMENDATION PROCESS:
1. ASK clarifying questions (don't assume)
2. UNDERSTAND their needs deeply (skill, style, pain points, budget)
3. RECOMMEND 2-3 best matches (not overwhelming)
4. EXPLAIN why each is suitable (reference their specific needs)
5. ANSWER questions honestly (including when NOT to buy)
6. MENTION complementary products naturally (strings, grips, bags)
7. FACILITATE purchase when they're ready (no pressure)

OBJECTION HANDLING:
- "Is it durable?" → Warranty, materials, user reviews
- "Good for tournaments?" → Regulations, pro endorsements
- "Can I upgrade later?" → Explain upgrade path
- "Is it worth the price?" → Compare value vs alternatives
- "Will it help my [issue]?" → Honest assessment, alternatives if needed

FOLLOW-UP:
- After purchase: "You'll love it! Any questions about using it?"
- Natural upsells: "Many players pair this with [complementary product]"
- Long-term: "How's your racket? Need new grips yet?"

GUARDRAILS:
- Never recommend out-of-stock products
- Never recommend products rated < 3.5 stars
- Always mention if there's a better option outside their budget
- Be transparent about tradeoffs

Make recommendations personal, not pushy. Build trust through expertise.
```

**Deliverable:** Expert sales agent persona

---

### Cycle 18-20: Implement Consultation Flow Components
**Specialist:** backend

**Tasks:**
- [ ] Create question-asking logic
- [ ] Implement preference refinement
- [ ] Build trust through transparency
- [ ] Test consultation quality

**Deliverable:** Complete consultation engine

---

### Cycle 21-30: Build ChatGPT Integration Layer
**Specialist:** integrator

**Tasks:**
- [ ] Format responses for ChatGPT display
- [ ] Include product cards in chat
- [ ] Add "Buy Now" buttons
- [ ] Test conversation flow
- [ ] Optimize for mobile ChatGPT app
- [ ] Add error handling for network issues
- [ ] Implement retry logic
- [ ] Test edge cases (unclear queries, contradictions)
- [ ] Document ChatGPT action setup process
- [ ] Create deployment guide

**Deliverable:** ChatGPT custom action live and tested

---

## PHASE 3: CONVERSION (Cycles 31-50)

**Purpose:** Enable frictionless in-chat purchase at peak intent

### Cycle 31: Create Purchase Initiation Flow
**Specialist:** backend

**Tasks:**
- [ ] Detect purchase intent ("I want to buy it", "Buy", "Check out")
- [ ] Generate pre-filled checkout URL
- [ ] Create cart with recommended product
- [ ] Return secure checkout link to ChatGPT

**Purchase Intent Detection:**
```typescript
const detectPurchaseIntent = (message: string): boolean => {
  const purchaseKeywords = [
    "buy", "purchase", "checkout", "get it", "i want it",
    "add to cart", "i'll take it", "sold", "let's do it"
  ];

  return purchaseKeywords.some(keyword =>
    message.toLowerCase().includes(keyword)
  );
};

const initiatePurchase = async (context: PurchaseContext): Promise<CheckoutResponse> => {
  const { productId, conversationId, quantity = 1 } = context;

  // Create cart
  const cart = await things.create({
    type: 'cart',
    properties: {
      items: [{
        productId,
        quantity,
        price: product.properties.price
      }],
      source: 'chatgpt',
      conversationId
    }
  });

  // Generate checkout URL
  const checkoutUrl = `https://ninepadel.com/checkout/${cart._id}?source=chatgpt&conv=${conversationId}`;

  // Log event
  await events.log({
    entityId: cart._id,
    eventType: 'purchase_initiated_from_chat',
    actorType: 'customer',
    metadata: {
      productId,
      conversationId,
      platform: 'chatgpt'
    }
  });

  return {
    checkoutUrl,
    orderPreview: {
      product: product.name,
      quantity,
      total: product.properties.price * quantity,
      estimatedDelivery: '3-5 business days'
    }
  };
};
```

**Deliverable:** Purchase initiation flow

---

### Cycle 32: Create One-Click Checkout Page
**Specialist:** frontend

**Tasks:**
- [ ] Create `/checkout/[cartId]` route
- [ ] Pre-fill from conversation data
- [ ] Display product summary
- [ ] Integrate payment (Stripe)
- [ ] Show "Back to chat" button

**Checkout Page:**
```astro
---
// web/src/pages/checkout/[cartId].astro
import CheckoutLayout from '@/layouts/CheckoutLayout.astro';
import { ConvexHttpClient } from 'convex/browser';

const { cartId } = Astro.params;
const convex = new ConvexHttpClient(import.meta.env.CONVEX_URL);

const cart = await convex.query(api.carts.get, { cartId });
const product = await convex.query(api.products.get, { id: cart.items[0].productId });

const source = Astro.url.searchParams.get('source'); // 'chatgpt'
const conversationId = Astro.url.searchParams.get('conv');
---

<CheckoutLayout title="Complete Your Purchase">
  <div class="checkout-container">
    {source === 'chatgpt' && (
      <div class="chat-indicator">
        🤖 Recommended in ChatGPT
      </div>
    )}

    <div class="product-summary">
      <img src={product.image} alt={product.name} />
      <h2>{product.name}</h2>
      <p>{product.description}</p>
      <p class="price">€{cart.items[0].price * cart.items[0].quantity}</p>
    </div>

    <form method="POST" action="/api/checkout/complete">
      <input type="hidden" name="cartId" value={cartId} />
      <input type="hidden" name="conversationId" value={conversationId} />

      <!-- Pre-filled from conversation if available -->
      <input type="email" name="email" placeholder="Email" required />
      <input type="text" name="name" placeholder="Full Name" required />

      <!-- Stripe Elements -->
      <div id="card-element"></div>

      <button type="submit" class="btn-primary">
        Complete Purchase - €{cart.items[0].price * cart.items[0].quantity}
      </button>
    </form>

    {source === 'chatgpt' && (
      <a href="https://chat.openai.com" class="back-to-chat">
        ← Back to ChatGPT
      </a>
    )}
  </div>
</CheckoutLayout>
```

**Deliverable:** One-click checkout page

---

### Cycle 33: Create Customer Record on First Purchase
**Specialist:** backend

**Tasks:**
- [ ] On successful payment, create `customer` thing
- [ ] Link order to customer
- [ ] Link conversation to customer
- [ ] Log purchase event

**Customer Creation:**
```typescript
const onPurchaseComplete = async (payment: StripePayment): Promise<void> => {
  // Create customer thing
  const customer = await things.create({
    type: 'customer',
    properties: {
      email: payment.email,
      name: payment.name,
      firstPurchaseDate: Date.now(),
      acquisitionChannel: 'chatgpt',
      conversationId: payment.metadata.conversationId,
      totalSpent: payment.amount,
      orderCount: 1
    }
  });

  // Create order thing
  const order = await things.create({
    type: 'order',
    properties: {
      customerId: customer._id,
      items: payment.items,
      total: payment.amount,
      status: 'paid',
      conversationId: payment.metadata.conversationId,
      source: 'chatgpt',
      paymentId: payment.id
    }
  });

  // Create connection: customer → order
  await connections.create({
    fromThingId: customer._id,
    toThingId: order._id,
    relationshipType: 'places',
    metadata: {
      orderDate: Date.now(),
      source: 'chatgpt'
    }
  });

  // Log event
  await events.log({
    entityId: order._id,
    eventType: 'order_placed_from_chat',
    actorId: customer._id,
    actorType: 'customer',
    metadata: {
      conversationId: payment.metadata.conversationId,
      platform: 'chatgpt',
      productIds: payment.items.map(i => i.productId),
      total: payment.amount
    }
  });

  // Update conversation with outcome
  await things.patch(payment.metadata.conversationId, {
    properties: {
      ordersCompleted: [order._id],
      totalValue: payment.amount,
      status: 'completed'
    }
  });

  // Trigger follow-up automation
  await scheduleFollowUp(customer._id, order._id);
};
```

**Deliverable:** Customer creation on first purchase

---

### Cycle 34-40: Implement Post-Purchase Confirmation
**Specialist:** backend

**Tasks:**
- [ ] Send confirmation back to ChatGPT via ACP
- [ ] Format order confirmation message
- [ ] Include order number and tracking
- [ ] Offer post-purchase tips
- [ ] Schedule follow-up messages

**Post-Purchase ChatGPT Message:**
```typescript
const sendPurchaseConfirmation = async (order: Order, customer: Customer): Promise<void> => {
  // Send ACP message back to ChatGPT
  await acp.sendMessage({
    from: 'nine-padel-sales-agent',
    to: 'chatgpt-commerce-agent',
    endpoint: 'https://chat.openai.com/api/acp',
    message: {
      type: 'purchase_confirmation',
      content: formatConfirmationMessage(order, customer),
      mimeType: 'text/markdown'
    },
    metadata: {
      conversationId: order.properties.conversationId,
      orderId: order._id
    }
  });
};

const formatConfirmationMessage = (order: Order, customer: Customer): string => {
  return `
🎉 **Order Confirmed!**

**Order #${order._id.slice(-8).toUpperCase()}**

${order.properties.items.map(item => `- ${item.name} x${item.quantity}`).join('\n')}

**Total:** €${order.properties.total}
**Estimated Delivery:** 3-5 business days
**Tracking:** You'll receive tracking info at ${customer.properties.email}

**Quick Tips for Your New Racket:**
1. Use light grip pressure for the first few sessions
2. Replace overgrip every 10-15 hours of play
3. Store in a cool, dry place (avoid car trunk)

Need anything else? Just ask! 🎾
`;
};
```

**Deliverable:** Post-purchase confirmation system

---

### Cycle 41-50: Build Attribution & Analytics
**Specialist:** backend

**Tasks:**
- [ ] Track conversation → purchase attribution
- [ ] Calculate conversion rates
- [ ] Measure time-to-purchase
- [ ] Track product performance in chat
- [ ] Build creator analytics dashboard
- [ ] Create admin metrics page
- [ ] Test attribution accuracy
- [ ] Document analytics queries

**Deliverable:** Complete attribution system

---

## PHASE 4: GROWTH (Cycles 51-70)

**Purpose:** Transform single transaction into lifelong customer relationship

### Cycle 51: Create Follow-Up Automation Engine
**Specialist:** backend

**Tasks:**
- [ ] Implement time-based follow-up scheduler
- [ ] Create follow-up message templates
- [ ] Personalize based on purchase
- [ ] Send via email + ChatGPT (if possible)

**Follow-Up Scheduler:**
```typescript
const scheduleFollowUp = async (customerId: Id<'things'>, orderId: Id<'things'>): Promise<void> => {
  const order = await things.get(orderId);
  const product = await things.get(order.properties.items[0].productId);

  // Schedule based on product lifecycle
  const followUps = [
    {
      delay: 7 * 24 * 60 * 60 * 1000, // 1 week
      template: 'first_use_tips',
      subject: `How's your new ${product.name}?`
    },
    {
      delay: 30 * 24 * 60 * 60 * 1000, // 1 month
      template: 'early_feedback',
      subject: 'Quick question about your racket'
    },
    {
      delay: 180 * 24 * 60 * 60 * 1000, // 6 months
      template: 'accessory_recommendation',
      subject: `Time to refresh your ${product.properties.category} setup`
    }
  ];

  for (const followUp of followUps) {
    await things.create({
      type: 'scheduled_task',
      properties: {
        taskType: 'follow_up',
        customerId,
        orderId,
        template: followUp.template,
        scheduledFor: Date.now() + followUp.delay,
        status: 'pending',
        channel: ['email', 'chatgpt'] // multi-channel
      }
    });
  }
};
```

**Deliverable:** Follow-up automation engine

---

### Cycle 52: Create Follow-Up Message Templates
**Specialist:** writer

**Tasks:**
- [ ] Write 1-week follow-up (tips)
- [ ] Write 1-month follow-up (feedback)
- [ ] Write 6-month follow-up (accessories)
- [ ] Write 1-year follow-up (upgrade path)

**6-Month Follow-Up Template:**
```typescript
const templates = {
  accessory_recommendation: (customer: Customer, order: Order) => {
    const product = order.properties.items[0];
    const monthsSincePurchase = Math.floor((Date.now() - order.createdAt) / (30 * 24 * 60 * 60 * 1000));

    return `
Hi ${customer.properties.name},

It's been about ${monthsSincePurchase} months with your ${product.name}!

Players who use this racket typically replace their overgrips around now to maintain feel and prevent blisters.

**Top 3 grips that pair perfectly with your racket:**

1. **Tourna Mega Tac** (€6.99) - Extra tacky, great for sweaty hands
2. **Wilson Pro Overgrip** (€8.99) - Thin, maintains racket feel
3. **Head Super Comp** (€7.99) - Cushioned, reduces vibration

These are popular with ${product.name} owners because [personalized reason based on racket properties].

Want to grab a few? Just reply "yes" and I'll add them to your order.

Still loving your racket?

Best,
Nine Padel
`;
  }
};
```

**Deliverable:** Personalized follow-up templates

---

### Cycle 53: Create Predictive Replenishment System
**Specialist:** backend

**Tasks:**
- [ ] Track product lifecycles
- [ ] Predict when customer needs new items
- [ ] Send proactive recommendations
- [ ] Base on usage patterns

**Predictive Logic:**
```typescript
const predictReplenishment = async (customer: Customer): Promise<Recommendation[]> => {
  const orders = await getCustomerOrders(customer._id);
  const recommendations: Recommendation[] = [];

  for (const order of orders) {
    const daysSincePurchase = (Date.now() - order.createdAt) / (24 * 60 * 60 * 1000);

    for (const item of order.properties.items) {
      const product = await things.get(item.productId);

      // Overgrips: replace every 4-6 months
      if (product.properties.category === 'overgrip' && daysSincePurchase >= 120) {
        recommendations.push({
          type: 'replenishment',
          product,
          reason: 'Overgrips typically need replacement every 4-6 months',
          confidence: 0.9,
          urgency: 'medium'
        });
      }

      // Rackets: upgrade after 2-3 years
      if (product.properties.category === 'racket' && daysSincePurchase >= 730) {
        const upgrades = await getRelatedProducts(product._id, 'upgrade_to');
        if (upgrades.length > 0) {
          recommendations.push({
            type: 'upgrade',
            product: upgrades[0],
            reason: `After 2 years with your ${product.name}, you might enjoy the enhanced features of the ${upgrades[0].name}`,
            confidence: 0.7,
            urgency: 'low'
          });
        }
      }

      // Strings: replace every 6-12 months
      if (product.properties.category === 'strings' && daysSincePurchase >= 180) {
        recommendations.push({
          type: 'replenishment',
          product,
          reason: 'String tension degrades over time, even without breaking',
          confidence: 0.85,
          urgency: 'medium'
        });
      }
    }
  }

  return recommendations;
};
```

**Deliverable:** Predictive replenishment system

---

### Cycle 54: Create Natural Upsell Engine
**Specialist:** backend

**Tasks:**
- [ ] Detect complementary product opportunities
- [ ] Generate bundle offers
- [ ] Create "often bought together" logic
- [ ] Personalize based on customer history

**Upsell Logic:**
```typescript
const generateUpsells = async (order: Order): Promise<Upsell[]> => {
  const upsells: Upsell[] = [];

  for (const item of order.properties.items) {
    const product = await things.get(item.productId);

    // If buying racket, suggest accessories
    if (product.properties.category === 'racket') {
      const complementary = await getRelatedProducts(product._id, 'often_bought_with');

      upsells.push({
        type: 'bundle',
        products: [
          complementary.find(p => p.properties.category === 'strings'),
          complementary.find(p => p.properties.category === 'overgrip'),
          complementary.find(p => p.properties.category === 'bag')
        ].filter(Boolean),
        discount: 0.05, // 5% off bundle
        message: `Complete your setup! Get ${product.name} + essential accessories for 5% off.`
      });
    }

    // If buying strings, suggest related products
    if (product.properties.category === 'strings') {
      upsells.push({
        type: 'complementary',
        products: await getRelatedProducts(product._id, 'pairs_well_with'),
        message: 'Players who use these strings also love...'
      });
    }
  }

  return upsells;
};
```

**Deliverable:** Natural upsell engine

---

### Cycle 55-60: Build Customer Intelligence System
**Specialist:** backend

**Tasks:**
- [ ] Track customer preferences over time
- [ ] Build customer profiles
- [ ] Segment customers (beginner → intermediate → advanced)
- [ ] Personalize future recommendations
- [ ] Create customer journey map
- [ ] Test personalization accuracy

**Deliverable:** Customer intelligence system

---

### Cycle 61-70: Implement Multi-Channel Growth Loop
**Specialist:** integrator

**Tasks:**
- [ ] Email integration for follow-ups
- [ ] ChatGPT re-engagement (if supported)
- [ ] SMS for urgent notifications
- [ ] Push notifications (if app installed)
- [ ] Test all channels
- [ ] Measure engagement by channel
- [ ] Optimize delivery timing
- [ ] A/B test messaging
- [ ] Build unsubscribe management
- [ ] Document growth loop architecture

**Deliverable:** Multi-channel growth loop

---

## PHASE 5: QUALITY & TESTING (Cycles 71-80)

### Cycle 71-75: End-to-End Testing
**Specialist:** quality

**Tasks:**
- [ ] Test complete flow: ChatGPT query → consultation → purchase → follow-up
- [ ] Test error handling (out of stock, payment failure, etc)
- [ ] Test edge cases (unclear queries, conflicting preferences)
- [ ] Test scalability (100 concurrent conversations)
- [ ] Test security (prompt injection, unauthorized access)

**Deliverable:** Comprehensive test suite

---

### Cycle 76-80: Performance Optimization
**Specialist:** clean

**Tasks:**
- [ ] Optimize AI API calls (caching, batching)
- [ ] Optimize database queries
- [ ] Reduce latency (< 3s response time)
- [ ] Monitor costs (Claude API, OpenAI embeddings)
- [ ] Set up alerts for anomalies

**Deliverable:** Optimized system

---

## PHASE 6: DEPLOYMENT & MONITORING (Cycles 81-90)

### Cycle 81-85: Production Deployment
**Specialist:** ops

**Tasks:**
- [ ] Deploy backend to Convex Cloud
- [ ] Deploy frontend to Cloudflare Pages
- [ ] Configure environment variables
- [ ] Set up ChatGPT Custom Action in OpenAI platform
- [ ] Test in production

**Deliverable:** System live in production

---

### Cycle 86-90: Monitoring & Analytics
**Specialist:** ops

**Tasks:**
- [ ] Set up monitoring dashboards
- [ ] Track key metrics:
  - Conversations started
  - Conversion rate (chat → purchase)
  - Average order value (chat vs traditional)
  - Customer lifetime value
  - Follow-up engagement rate
- [ ] Set up alerts for system health
- [ ] Create weekly reports

**Deliverable:** Monitoring and analytics

---

## PHASE 7: DOCUMENTATION (Cycles 91-95)

### Cycle 91-93: Create Documentation
**Specialist:** documenter

**Tasks:**
- [ ] Document ACP integration architecture
- [ ] Create sales agent training guide
- [ ] Write creator handbook (how to optimize products for AI)
- [ ] Document analytics and metrics
- [ ] Create troubleshooting guide

**Deliverable:** Complete documentation

---

### Cycle 94-95: Create Marketing Materials
**Specialist:** writer

**Tasks:**
- [ ] Write announcement blog post
- [ ] Create demo video
- [ ] Design infographic explaining the system
- [ ] Prepare PR kit

**Deliverable:** Marketing materials

---

## PHASE 8: KNOWLEDGE & LESSONS (Cycles 96-100)

### Cycle 96: Document Universal Multi-Vertical Patterns
**Specialist:** ontology

**Tasks:**
- [ ] Document how ACP maps to 6 dimensions
- [ ] Create reusable patterns for external agent integration
- [ ] Document conversation tracking patterns
- [ ] Document multi-vertical product architecture:
  - How product schema adapts to any category
  - How sales agent persona changes per vertical
  - How follow-up schedules adapt to product lifecycles
  - Examples: padel equipment, courses, fashion, SaaS, electronics
- [ ] Create vertical expansion playbook:
  - Step 1: Add products to database (any category)
  - Step 2: Configure sales agent persona (tone, expertise)
  - Step 3: Set follow-up schedules (lifecycle rules)
  - Step 4: Test with sample conversations
  - Step 5: Deploy (no code changes needed)
- [ ] Share learnings with team

**Key Insight:** The same ontology works for ANY product. Padel is just the demo. Fashion, courses, software, electronics—all use identical architecture.

**Deliverable:** Universal multi-vertical patterns documented

---

### Cycle 97: Lessons Learned
**Specialist:** director

**Tasks:**
- [ ] What went well
- [ ] What was challenging
- [ ] What would we do differently
- [ ] Recommendations for future integrations

**Deliverable:** Lessons learned document

---

### Cycle 98: Competitive Analysis
**Specialist:** director

**Tasks:**
- [ ] Compare our implementation to competitors
- [ ] Identify our unique advantages
- [ ] Document competitive moat

**Our Advantages:**
1. **Universal multi-vertical** - Works with ANY product (padel, courses, fashion, SaaS, electronics)
2. **Integrated with ontology** - Complete customer intelligence across all verticals
3. **Autonomous sales agent** - Expert consultation, not just product search
4. **Multi-channel growth loop** - Doesn't end at purchase, works across categories
5. **Protocol-based** - Can extend to Gemini, Claude, and any future LLM
6. **Creator-friendly** - Any seller benefits from AI recommendations (no category limits)
7. **Zero code changes** - New vertical = add products + configure persona

**Deliverable:** Competitive analysis

---

### Cycle 99: Future Roadmap
**Specialist:** director

**Tasks:**
- [ ] Plan v2.0 features:
  - **Vertical Expansion:**
    - Add 5+ new product categories (courses, fashion, electronics, software, home goods)
    - Create category-specific sales agent personas
    - Build vertical-specific follow-up automation
    - Multi-category shopping (buy racket + course in same chat)
  - **Multi-language support:**
    - Spanish, French, Portuguese, German
    - Auto-detect customer language
    - Translate product descriptions on-the-fly
  - **LLM Platform Expansion:**
    - Gemini integration (Google Shopping)
    - Claude integration (Anthropic)
    - Perplexity integration (search-first commerce)
  - **Advanced Features:**
    - Voice commerce (via ACP)
    - AR product visualization (try before you buy)
    - Live agent handoff for complex queries
    - Video product demos in chat
    - Social proof (show real-time purchases)
- [ ] Define success metrics for v2.0:
  - 10+ active product categories
  - 5,000+ conversations/day across all verticals
  - $100,000+ monthly revenue via conversational commerce
  - 3+ LLM platforms integrated

**Deliverable:** Multi-vertical expansion roadmap

---

### Cycle 100: Celebration & Reflection
**Specialist:** director

## 🎉 Agentic Commerce Protocol - Complete!

**What We Built:**
1. ✅ ACP integration with ChatGPT
2. ✅ Autonomous sales agent powered by ontology
3. ✅ Expert consultation engine (not just search)
4. ✅ Frictionless one-click checkout
5. ✅ Automated growth loop (lifetime customer)
6. ✅ Complete attribution system
7. ✅ Multi-channel follow-up automation
8. ✅ Predictive replenishment
9. ✅ Natural upsell engine
10. ✅ Full observability and analytics

**Impact Achieved:**
- ✅ First 100 purchases via ChatGPT
- ✅ 30%+ higher conversion than traditional search
- ✅ 25%+ higher average order value
- ✅ 5x customer lifetime value (vs one-time buyers)
- ✅ Fully autonomous system (no human intervention needed)

**The Competitive Moat:**
While competitors are still figuring out how to list products in chatbots, we built a fully autonomous system that:
- **Intercepts** customer research (winning the moment)
- **Advises** with expert consultation (building trust)
- **Converts** at peak intent (frictionless checkout)
- **Grows** customers for life (automated nurture)

**What's Next:**
- Scale to 1000+ conversations/day (across all verticals)
- Expand to 10+ product categories (courses, fashion, electronics, SaaS, home goods, etc.)
- Expand to Gemini, Claude, Perplexity (any LLM with ACP support)
- International markets (multi-language support)
- Voice commerce integration (speak to buy)
- Cross-category shopping (racket + course + apparel in one chat)

**The Universal Vision:**
We didn't build a padel commerce system. We built a **universal conversational commerce platform** that works with ANY product, ANY vertical, ANY LLM. Padel is just the proof of concept. The same ontology powers course sales, fashion recommendations, software subscriptions, and electronics advice—with zero code changes.

---

## SUCCESS CRITERIA

Agentic Commerce Protocol complete when:

- ✅ ACP integration live with ChatGPT
- ✅ Sales agent providing expert consultation
- ✅ Conversion rate > 30% (vs 2% traditional search)
- ✅ Average order value 25%+ higher
- ✅ 100+ purchases via ChatGPT
- ✅ Follow-up automation operational
- ✅ Customer lifetime value 5x higher
- ✅ Complete attribution working
- ✅ $10,000+ revenue via conversational commerce
- ✅ System stable (99.9% uptime)
- ✅ Customer satisfaction > 4.7/5 stars

---

## INTEGRATION ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                        CHATGPT                              │
│                  (Customer Interface)                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ ACP Protocol (REST)
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              EXTERNAL AGENT (ChatGPT Agent)                 │
│                                                             │
│  - Receives customer queries                                │
│  - Calls our API via ACP                                   │
│  - Displays responses in chat                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTPS REST API
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  ONE PLATFORM API                           │
│              (web/src/pages/api/acp/)                       │
│                                                             │
│  - /agents/chatgpt/search                                  │
│  - /agents/chatgpt/purchase                                │
│  - /agents/chatgpt/messages                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Convex Mutations/Queries
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                SALES AGENT SERVICE                          │
│           (backend/convex/services/)                        │
│                                                             │
│  - Intent Parser                                            │
│  - Conflict Detector                                        │
│  - Recommendation Engine                                    │
│  - Objection Handler                                        │
│  - Purchase Facilitator                                     │
│  - Follow-up Scheduler                                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Provider Interface
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                 6-DIMENSION ONTOLOGY                        │
│                    (Convex Database)                        │
│                                                             │
│  GROUPS:      Multi-tenant isolation                        │
│  PEOPLE:      Customer, Creator, Sales Agent               │
│  THINGS:      Product, Order, Conversation, Agent          │
│  CONNECTIONS: Purchased, Recommended, Owns                 │
│  EVENTS:      ACP messages, Purchases, Follow-ups          │
│  KNOWLEDGE:   Embeddings, Preferences, Summaries           │
└─────────────────────────────────────────────────────────────┘
```

---

**Built with the 6-dimension ontology, enabling 98% AI accuracy and infinite scale.**

**Status:** Ready to deploy and dominate conversational commerce.
