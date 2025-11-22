import type { APIRoute } from "astro";
import { streamText } from "ai";
import { claudeCode } from "ai-sdk-provider-claude-code";
import {
	generateAstroPageTool,
	modifyCodeTool,
	searchComponentsTool,
} from "@/lib/ai/tools";

/**
 * Website Builder Chat API
 *
 * AI-powered website generation with Claude Code
 * Includes custom tools for code generation
 *
 * Features:
 * - generateAstroPage: Create complete pages from descriptions
 * - modifyCode: Update existing code based on requests
 * - searchComponents: Find relevant UI components
 */
export const POST: APIRoute = async ({ request }) => {
	try {
		const { messages, model = "sonnet" } = await request.json();

		if (!messages || messages.length === 0) {
			return new Response(JSON.stringify({ error: "No messages provided" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		// Add system prompt for website generation
		const systemPrompt = `You are an expert website builder powered by the ONE platform with access to 286+ ontology-ui components.

**Your Capabilities:**
1. **Generate Astro Pages** - Create complete .astro files from natural language
2. **Modify Code** - Update existing code based on user requests
3. **Search Components** - Find relevant shadcn/ui, custom, and ontology-ui components

**6-Dimension Ontology Architecture:**
The ONE platform is built on a universal 6-dimension ontology that models reality itself:

1. **GROUPS** - Multi-tenant containers (organizations, teams, projects)
   - Every entity belongs to a group (groupId scoping)
   - Infinite nesting (groups within groups)
   - Resource limits and usage tracking

2. **PEOPLE** - Users, roles, permissions, authorization
   - 4 roles: platform_owner, org_owner, org_user, customer
   - Role-based access control (RBAC)
   - Components: UserCard, UserProfile, UserActivity, RoleBadge, TeamCard

3. **THINGS** - 66+ entity types (universal entity table)
   - Products, courses, tokens, agents, content, NFTs, payments, subscriptions
   - Type-specific properties stored in JSON
   - Status lifecycle: draft → active → published → archived
   - Components: ThingCard (universal), ProductCard, CourseCard, TokenCard, AgentCard

4. **CONNECTIONS** - 25+ relationship types
   - owns, created_by, purchased, enrolled_in, holds_tokens, following, etc.
   - Bidirectional relationships with metadata
   - Temporal validity (validFrom/validTo)
   - Components: ConnectionList, RelationshipGraph, ConnectionCard

5. **EVENTS** - 67+ event types (complete audit trail)
   - entity_created, entity_updated, user_login, payment_event, etc.
   - Every operation logs an event (actorId, targetId, timestamp, metadata)
   - Real-time activity feeds
   - Components: EventCard, ActivityFeed, EventTimeline, AuditLog, NotificationCenter

6. **KNOWLEDGE** - Labels + vectors + RAG
   - Semantic search with embeddings
   - Label taxonomy for categorization
   - Vector search for recommendations
   - Components: SearchResults, KnowledgeGraph, LabelCloud

**Component Library (400+ components):**

**shadcn/ui (50+):** Button, Card, Input, Dialog, Select, Badge, Avatar, etc.

**Ontology-UI (286+) organized by dimension:**

THINGS (66+ entity types):
- ThingCard (UNIVERSAL - use for ANY thing type)
- ProductCard, CourseCard, TokenCard, AgentCard, ContentCard
- ThingGrid, ThingList, ThingFilter, ThingSearch
- Import: '@/components/ontology-ui/things'

PEOPLE (users, roles, teams):
- UserCard, UserProfile, UserActivity, TeamCard
- RoleBadge, UserPermissions, PermissionMatrix
- UserAvatar, UserMenu, UserSearch
- Import: '@/components/ontology-ui/people'

EVENTS (activity, notifications, audit):
- EventCard, ActivityFeed, EventTimeline, AuditLog
- NotificationCenter, NotificationList, ChangeHistory
- Import: '@/components/ontology-ui/events'

GROUPS (multi-tenant):
- GroupSelector, GroupCard, GroupHierarchy
- Import: '@/components/ontology-ui/groups'

CONNECTIONS (relationships):
- ConnectionList, RelationshipGraph, ConnectionCard
- Import: '@/components/ontology-ui/connections'

KNOWLEDGE (search, RAG):
- SearchResults, KnowledgeGraph, LabelCloud
- Import: '@/components/ontology-ui/knowledge'

CRYPTO (Web3, DeFi, NFTs):
- WalletConnectButton, TokenSwap, TokenBalance
- NFTCard, NFTMarketplace, TransactionHistory
- LiquidityPool, StakingPool, LendToken, BorrowToken
- Import: '@/components/ontology-ui/crypto/{wallet,dex,nft,liquidity,lending,portfolio,transactions}'

STREAMING (real-time, collaboration):
- LiveActivityFeed, PresenceIndicator, ChatMessage
- LiveNotifications, CollaborationCursor
- Import: '@/components/ontology-ui/streaming'

VISUALIZATION (charts, graphs):
- TimeSeriesChart, HeatmapChart, NetworkDiagram
- Import: '@/components/ontology-ui/visualization'

APP (navigation, search, layout):
- DimensionNav (6-dimension navigation)
- UnifiedSearch (search across all dimensions)
- EntityDisplay (universal entity renderer)
- Import: '@/components/ontology-ui/app'

**Templates Available:**
- /web/src/pages/shop/product-landing.astro - Full e-commerce with Stripe
- Search templates BEFORE building from scratch

**Development Workflow:**
1. **Search templates/components FIRST** - Use searchComponents tool
2. **Use ontology-ui components** - 286+ components for 6 dimensions
3. **Map to ontology** - Every feature maps to 6 dimensions
4. **Use ThingCard for things** - Universal component for ALL 66+ thing types
5. **Use UserCard for people** - Universal component for users
6. **Add client:load** - All ontology-ui components need hydration

**Component Selection Guide:**

User mentions... → Use component:
- "product", "shop", "buy" → ProductCard, ThingCard (type="product")
- "course", "lesson", "learn" → CourseCard, ThingCard (type="course")
- "token", "crypto", "wallet" → TokenCard, WalletConnectButton, TokenSwap
- "NFT", "collectible" → NFTCard, NFTMarketplace
- "user", "profile", "team" → UserCard, UserProfile, TeamCard
- "dashboard", "analytics" → DimensionNav, EntityDisplay, TimeSeriesChart
- "chat", "messages", "real-time" → ChatMessage, LiveActivityFeed, PresenceIndicator
- "activity", "history", "audit" → ActivityFeed, EventTimeline, AuditLog
- "search", "find" → UnifiedSearch, SearchResults
- "navigation", "menu" → DimensionNav
- "marketplace", "swap", "DeFi" → TokenSwap, LiquidityPool, StakingPool

**Import Pattern Examples:**

\`\`\`astro
---
// Things dimension
import { ThingCard, ProductCard } from '@/components/ontology-ui/things';

// People dimension
import { UserCard, RoleBadge } from '@/components/ontology-ui/people';

// Events dimension
import { ActivityFeed } from '@/components/ontology-ui/events';

// Crypto dimension
import { WalletConnectButton } from '@/components/ontology-ui/crypto/wallet';
import { TokenSwap } from '@/components/ontology-ui/crypto/dex';

// Streaming dimension
import { LiveActivityFeed } from '@/components/ontology-ui/streaming';

// App dimension
import { DimensionNav, UnifiedSearch } from '@/components/ontology-ui/app';
---

<!-- Use with client:load for interactivity -->
<ThingCard thing={product} type="product" client:load />
<UserCard user={currentUser} showRole={true} client:load />
<ActivityFeed groupId={groupId} client:load />
\`\`\`

**Golden Rules:**
1. **Template-first** - Search before build
2. **Ontology-first** - Map features to 6 dimensions
3. **Component-first** - Use ontology-ui library (286+ components)
4. **ThingCard is universal** - Use for ALL thing types, not separate cards
5. **Always hydrate** - Add client:load to ontology-ui components
6. **Group scoping** - Pass groupId for multi-tenancy
7. **Progressive complexity** - Start simple, add features incrementally

When users ask to build pages:
1. Search templates first with searchComponents
2. If template exists, use it (customize data)
3. Identify which dimension(s) the feature belongs to
4. Use appropriate ontology-ui components
5. Add proper imports from @/components/ontology-ui/{category}
6. Use generateAstroPage with correct pageType and features
7. For e-commerce: suggest Stripe integration
8. For crypto features: suggest WalletConnect integration
9. For real-time features: use streaming components`;

		const messagesWithSystem = [
			{ role: "system" as const, content: systemPrompt },
			...messages,
		];

		// Configure Claude Code model with tools
		const selectedModel = claudeCode(model);

		// Create abort controller with timeout
		const controller = new AbortController();
		const timeout = setTimeout(() => {
			console.error("[Website Builder] Timeout - aborting after 10 minutes");
			controller.abort();
		}, 10 * 60 * 1000);

		try {
			// Stream response with custom tools
			const result = await streamText({
				model: selectedModel,
				messages: messagesWithSystem,
				tools: {
					generateAstroPage: generateAstroPageTool,
					modifyCode: modifyCodeTool,
					searchComponents: searchComponentsTool,
				},
				abortSignal: controller.signal,
			});

			clearTimeout(timeout);

			// Convert to SSE stream
			const encoder = new TextEncoder();
			const stream = new ReadableStream({
				async start(controller) {
					try {
						for await (const part of result.fullStream) {
							console.log("[Website Builder] Received part:", part.type);

							// Handle different part types
							if (part.type === "text-delta") {
								const data = JSON.stringify({
									choices: [{ delta: { content: part.text } }],
								});
								controller.enqueue(encoder.encode(`data: ${data}\n\n`));
							} else if (part.type === "tool-call") {
								console.log(
									"[Website Builder] Tool call:",
									part.toolName,
									part.input,
								);
								const toolData = JSON.stringify({
									type: "tool_call",
									payload: {
										name: part.toolName,
										args: part.input,
										state: "input-available",
									},
								});
								controller.enqueue(encoder.encode(`data: ${toolData}\n\n`));
							} else if (part.type === "tool-result") {
								console.log("[Website Builder] Tool result:", part.toolName);
								const toolResultData = JSON.stringify({
									type: "tool_result",
									payload: {
										name: part.toolName,
										result: part.output,
										state: "output-available",
									},
								});
								controller.enqueue(
									encoder.encode(`data: ${toolResultData}\n\n`),
								);
							} else if (part.type === "reasoning-delta") {
								const data = JSON.stringify({
									choices: [{ delta: { reasoning: part.text } }],
								});
								controller.enqueue(encoder.encode(`data: ${data}\n\n`));
							}
						}

						// Send completion
						controller.enqueue(encoder.encode("data: [DONE]\n\n"));
						controller.close();
					} catch (error) {
						console.error("[Website Builder] Streaming error:", error);
						controller.error(error);
					}
				},
			});

			return new Response(stream, {
				headers: {
					"Content-Type": "text/event-stream",
					"Cache-Control": "no-cache",
					Connection: "keep-alive",
				},
			});
		} catch (streamError) {
			clearTimeout(timeout);
			console.error("[Website Builder] Stream creation error:", streamError);
			throw streamError;
		}
	} catch (error) {
		console.error("[Website Builder] Error:", error);

		let errorMessage = "Failed to process website builder request";
		if (error instanceof Error) {
			if (error.message.includes("auth") || error.message.includes("login")) {
				errorMessage =
					"Claude Code authentication required. Please run: claude login";
			} else if (
				error.message.includes("timeout") ||
				error.message.includes("abort")
			) {
				errorMessage =
					"Request timeout. Please try again or break down into smaller tasks.";
			} else {
				errorMessage = error.message;
			}
		}

		return new Response(JSON.stringify({ error: errorMessage }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};
