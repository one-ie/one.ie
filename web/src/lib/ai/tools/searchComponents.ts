/**
 * AI Tool: Search Components
 *
 * Searches the component library for relevant components
 * Returns components that match the description
 */

import type { CoreTool } from "ai";
import { z } from "zod";

export const searchComponentsTool: CoreTool = {
	description:
		"Search the component library (shadcn/ui and custom components) for components that match a description. Returns a list of relevant components with usage examples.",
	parameters: z.object({
		description: z
			.string()
			.describe(
				"Natural language description of the component needed. Example: 'button with icon' or 'card with image and title'",
			),
		category: z
			.enum([
				"ui",
				"layout",
				"form",
				"data-display",
				"feedback",
				"overlay",
				"navigation",
				"features",
				"ontology",
				"things",
				"people",
				"groups",
				"connections",
				"events",
				"knowledge",
				"crypto",
				"streaming",
				"visualization",
				"all",
			])
			.optional()
			.default("all")
			.describe(
				"Optional category to narrow search. Default: 'all' (searches everything)",
			),
		includeExamples: z
			.boolean()
			.optional()
			.default(true)
			.describe("Whether to include usage examples. Default: true"),
	}),
	execute: async ({ description, category, includeExamples }) => {
		// Search component library
		const results = searchComponentLibrary({
			description,
			category: category || "all",
		});

		// Add usage examples if requested
		if (includeExamples) {
			results.forEach((result) => {
				result.example = generateUsageExample(result.name, result.category);
			});
		}

		return {
			components: results,
			count: results.length,
			suggestions: generateSearchSuggestions(description, results),
		};
	},
};

/**
 * Component search result
 */
interface ComponentResult {
	name: string;
	category: string;
	path: string;
	description: string;
	props?: string[];
	example?: string;
	variants?: string[];
}

/**
 * Search the component library
 */
function searchComponentLibrary({
	description,
	category,
}: {
	description: string;
	category: string;
}): ComponentResult[] {
	const lower = description.toLowerCase();
	const results: ComponentResult[] = [];

	// shadcn/ui components
	const shadcnComponents = getShadcnComponents();
	const customComponents = getCustomComponents();
	const ontologyComponents = getOntologyComponents();

	// Combine all components
	let allComponents = [
		...shadcnComponents,
		...customComponents,
		...ontologyComponents,
	];

	// Filter by category if specified
	if (category !== "all") {
		allComponents = allComponents.filter((c) => c.category === category);
	}

	// Search by keywords
	for (const component of allComponents) {
		const componentName = component.name.toLowerCase();
		const componentDesc = component.description.toLowerCase();

		// Check if description matches component name or description
		if (
			componentName.includes(lower) ||
			componentDesc.includes(lower) ||
			matchesKeywords(lower, component)
		) {
			results.push(component);
		}
	}

	// Sort by relevance (exact matches first)
	results.sort((a, b) => {
		const aExact = a.name.toLowerCase() === lower;
		const bExact = b.name.toLowerCase() === lower;
		if (aExact && !bExact) return -1;
		if (!aExact && bExact) return 1;
		return 0;
	});

	return results;
}

/**
 * Check if keywords match component
 */
function matchesKeywords(query: string, component: ComponentResult): boolean {
	const keywords = query.split(" ");

	for (const keyword of keywords) {
		if (component.name.toLowerCase().includes(keyword)) return true;
		if (component.description.toLowerCase().includes(keyword)) return true;
		if (component.props?.some((p) => p.toLowerCase().includes(keyword)))
			return true;
	}

	return false;
}

/**
 * Get shadcn/ui components
 */
function getShadcnComponents(): ComponentResult[] {
	return [
		{
			name: "Button",
			category: "ui",
			path: "@/components/ui/button",
			description: "Clickable button with variants and sizes",
			props: ["variant", "size", "onClick"],
			variants: ["default", "destructive", "outline", "secondary", "ghost", "link"],
		},
		{
			name: "Card",
			category: "ui",
			path: "@/components/ui/card",
			description:
				"Container with header, content, and footer sections. Includes CardHeader, CardTitle, CardContent, CardFooter",
			props: ["className"],
		},
		{
			name: "Badge",
			category: "ui",
			path: "@/components/ui/badge",
			description: "Small label or tag component",
			props: ["variant"],
			variants: ["default", "secondary", "destructive", "outline"],
		},
		{
			name: "Input",
			category: "form",
			path: "@/components/ui/input",
			description: "Text input field",
			props: ["type", "placeholder", "value", "onChange"],
		},
		{
			name: "Label",
			category: "form",
			path: "@/components/ui/label",
			description: "Form label for input fields",
			props: ["htmlFor"],
		},
		{
			name: "Select",
			category: "form",
			path: "@/components/ui/select",
			description:
				"Dropdown select component. Includes SelectTrigger, SelectValue, SelectContent, SelectItem",
			props: ["value", "onValueChange"],
		},
		{
			name: "Dialog",
			category: "overlay",
			path: "@/components/ui/dialog",
			description:
				"Modal dialog component. Includes DialogTrigger, DialogContent, DialogHeader, DialogTitle",
			props: ["open", "onOpenChange"],
		},
		{
			name: "Skeleton",
			category: "feedback",
			path: "@/components/ui/skeleton",
			description: "Loading placeholder skeleton",
			props: ["className"],
		},
		{
			name: "Separator",
			category: "layout",
			path: "@/components/ui/separator",
			description: "Horizontal or vertical divider line",
			props: ["orientation"],
		},
		{
			name: "Avatar",
			category: "data-display",
			path: "@/components/ui/avatar",
			description:
				"User avatar with fallback. Includes AvatarImage, AvatarFallback",
			props: [],
		},
		{
			name: "Checkbox",
			category: "form",
			path: "@/components/ui/checkbox",
			description: "Checkbox input",
			props: ["checked", "onCheckedChange"],
		},
		{
			name: "Accordion",
			category: "layout",
			path: "@/components/ui/accordion",
			description:
				"Expandable accordion component. Includes AccordionItem, AccordionTrigger, AccordionContent",
			props: ["type", "collapsible"],
		},
		{
			name: "Alert",
			category: "feedback",
			path: "@/components/ui/alert",
			description:
				"Alert message component. Includes AlertTitle, AlertDescription",
			props: ["variant"],
			variants: ["default", "destructive"],
		},
		{
			name: "Breadcrumb",
			category: "navigation",
			path: "@/components/ui/breadcrumb",
			description:
				"Navigation breadcrumb trail. Includes BreadcrumbList, BreadcrumbItem, BreadcrumbLink",
			props: [],
		},
		{
			name: "Carousel",
			category: "data-display",
			path: "@/components/ui/carousel",
			description:
				"Image carousel component. Includes CarouselContent, CarouselItem, CarouselNext, CarouselPrevious",
			props: ["orientation"],
		},
		{
			name: "Chart",
			category: "data-display",
			path: "@/components/ui/chart",
			description: "Data visualization chart component",
			props: ["data", "type"],
		},
		{
			name: "Collapsible",
			category: "layout",
			path: "@/components/ui/collapsible",
			description:
				"Collapsible content container. Includes CollapsibleTrigger, CollapsibleContent",
			props: ["open", "onOpenChange"],
		},
		{
			name: "ContextMenu",
			category: "overlay",
			path: "@/components/ui/context-menu",
			description:
				"Right-click context menu. Includes ContextMenuTrigger, ContextMenuContent, ContextMenuItem",
			props: [],
		},
		{
			name: "DropdownMenu",
			category: "overlay",
			path: "@/components/ui/dropdown-menu",
			description:
				"Dropdown menu component. Includes DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem",
			props: [],
		},
		{
			name: "HoverCard",
			category: "overlay",
			path: "@/components/ui/hover-card",
			description:
				"Popover on hover. Includes HoverCardTrigger, HoverCardContent",
			props: [],
		},
		{
			name: "Drawer",
			category: "overlay",
			path: "@/components/ui/drawer",
			description:
				"Slide-out drawer panel. Includes DrawerTrigger, DrawerContent",
			props: ["side"],
		},
		{
			name: "Form",
			category: "form",
			path: "@/components/ui/form",
			description: "Form wrapper with validation. Includes FormField, FormItem, FormLabel, FormControl, FormMessage",
			props: ["onSubmit"],
		},
		{
			name: "Tooltip",
			category: "overlay",
			path: "@/components/ui/tooltip",
			description:
				"Tooltip on hover. Includes TooltipTrigger, TooltipContent, TooltipProvider",
			props: [],
		},
	];
}

/**
 * Get custom feature components
 */
function getCustomComponents(): ComponentResult[] {
	return [
		{
			name: "ProductGallery",
			category: "features",
			path: "@/components/features/products/ProductGallery",
			description:
				"Product image gallery with zoom and thumbnails (from product-landing template)",
			props: ["images", "alt", "enableZoom"],
		},
		{
			name: "ChatClient",
			category: "features",
			path: "@/components/ai/ChatClient",
			description: "AI chat interface component",
			props: ["client:only"],
		},
	];
}

/**
 * Get ontology-specific components (286+ components across all 6 dimensions)
 */
function getOntologyComponents(): ComponentResult[] {
	return [
		// THINGS DIMENSION (66+ entity types)
		{
			name: "ThingCard",
			category: "things",
			path: "@/components/ontology-ui/things",
			description:
				"Universal card for rendering any 'thing' (product, course, token, agent, etc.)",
			props: ["thing", "type", "variant", "onSelect"],
		},
		{
			name: "ProductCard",
			category: "things",
			path: "@/components/ontology-ui/things",
			description: "Display product with image, price, and purchase action",
			props: ["product", "showPrice", "onPurchase"],
		},
		{
			name: "CourseCard",
			category: "things",
			path: "@/components/ontology-ui/things",
			description: "Display course with progress, lessons, and enrollment",
			props: ["course", "showProgress", "onEnroll"],
		},
		{
			name: "TokenCard",
			category: "things",
			path: "@/components/ontology-ui/things",
			description: "Display cryptocurrency token with price, balance, and swap action",
			props: ["token", "showBalance", "onSwap"],
		},
		{
			name: "AgentCard",
			category: "things",
			path: "@/components/ontology-ui/things",
			description: "Display AI agent with capabilities and execution status",
			props: ["agent", "showCapabilities", "onExecute"],
		},
		{
			name: "ContentCard",
			category: "things",
			path: "@/components/ontology-ui/things",
			description: "Display content (blog, video, podcast) with metadata",
			props: ["content", "contentType", "showMeta"],
		},
		{
			name: "ThingGrid",
			category: "things",
			path: "@/components/ontology-ui/things",
			description: "Grid layout for displaying multiple things with filtering",
			props: ["things", "columns", "onFilter"],
		},
		{
			name: "ThingList",
			category: "things",
			path: "@/components/ontology-ui/things",
			description: "List layout for things with sorting and search",
			props: ["things", "sortBy", "onSearch"],
		},

		// PEOPLE DIMENSION (Users, roles, teams)
		{
			name: "UserCard",
			category: "people",
			path: "@/components/ontology-ui/people",
			description: "Display user with avatar, role badge, and online status",
			props: ["user", "showRole", "showStatus"],
		},
		{
			name: "UserProfile",
			category: "people",
			path: "@/components/ontology-ui/people",
			description: "Full user profile with bio, activity, and permissions",
			props: ["userId", "editable"],
		},
		{
			name: "UserActivity",
			category: "people",
			path: "@/components/ontology-ui/people",
			description: "User activity timeline showing recent actions",
			props: ["userId", "limit", "eventTypes"],
		},
		{
			name: "TeamCard",
			category: "people",
			path: "@/components/ontology-ui/people",
			description: "Display team with members, roles, and collaboration",
			props: ["team", "showMembers"],
		},
		{
			name: "RoleBadge",
			category: "people",
			path: "@/components/ontology-ui/people",
			description: "Badge showing user role (platform_owner, org_owner, org_user, customer)",
			props: ["role", "variant"],
		},
		{
			name: "UserPermissions",
			category: "people",
			path: "@/components/ontology-ui/people",
			description: "Permission matrix for user authorization",
			props: ["userId", "editable"],
		},
		{
			name: "PermissionMatrix",
			category: "people",
			path: "@/components/ontology-ui/people",
			description: "Full permission matrix for role-based access control",
			props: ["roles", "permissions", "editable"],
		},

		// EVENTS DIMENSION (67+ event types)
		{
			name: "EventCard",
			category: "events",
			path: "@/components/ontology-ui/events",
			description: "Display single event with timestamp, actor, and metadata",
			props: ["event", "showActor", "compact"],
		},
		{
			name: "ActivityFeed",
			category: "events",
			path: "@/components/ontology-ui/events",
			description: "Real-time activity feed showing recent events",
			props: ["groupId", "eventTypes", "limit"],
		},
		{
			name: "EventTimeline",
			category: "events",
			path: "@/components/ontology-ui/events",
			description: "Timeline view of events with filtering",
			props: ["events", "groupBy", "onFilter"],
		},
		{
			name: "AuditLog",
			category: "events",
			path: "@/components/ontology-ui/events",
			description: "Complete audit trail for compliance and debugging",
			props: ["entityId", "eventTypes", "dateRange"],
		},
		{
			name: "NotificationCenter",
			category: "events",
			path: "@/components/ontology-ui/events",
			description: "Notification center with read/unread status",
			props: ["userId", "showUnreadOnly"],
		},

		// GROUPS DIMENSION (Multi-tenant containers)
		{
			name: "GroupSelector",
			category: "groups",
			path: "@/components/ontology-ui/groups",
			description: "Dropdown to select active group (organization)",
			props: ["currentGroupId", "onSelect"],
		},
		{
			name: "GroupCard",
			category: "groups",
			path: "@/components/ontology-ui/groups",
			description: "Display group with members, usage, and settings",
			props: ["group", "showUsage"],
		},
		{
			name: "GroupHierarchy",
			category: "groups",
			path: "@/components/ontology-ui/groups",
			description: "Tree view of nested groups (infinite nesting)",
			props: ["rootGroupId", "expandable"],
		},

		// CONNECTIONS DIMENSION (25+ relationship types)
		{
			name: "ConnectionList",
			category: "connections",
			path: "@/components/ontology-ui/connections",
			description: "List of connections between entities",
			props: ["fromEntityId", "relationshipType"],
		},
		{
			name: "RelationshipGraph",
			category: "connections",
			path: "@/components/ontology-ui/connections",
			description: "Visual graph of entity relationships",
			props: ["entityId", "depth", "interactive"],
		},
		{
			name: "ConnectionCard",
			category: "connections",
			path: "@/components/ontology-ui/connections",
			description: "Display single connection with metadata",
			props: ["connection", "showMetadata"],
		},

		// KNOWLEDGE DIMENSION (Labels + vectors + RAG)
		{
			name: "SearchResults",
			category: "knowledge",
			path: "@/components/ontology-ui/knowledge",
			description: "Display search results with relevance scores",
			props: ["query", "results", "onSelect"],
		},
		{
			name: "KnowledgeGraph",
			category: "knowledge",
			path: "@/components/ontology-ui/knowledge",
			description: "Visual knowledge graph with semantic relationships",
			props: ["entityId", "depth"],
		},
		{
			name: "LabelCloud",
			category: "knowledge",
			path: "@/components/ontology-ui/knowledge",
			description: "Tag cloud of knowledge labels",
			props: ["labels", "onSelectLabel"],
		},

		// CRYPTO DIMENSION (Wallet, tokens, NFTs, DeFi)
		{
			name: "WalletConnectButton",
			category: "crypto",
			path: "@/components/ontology-ui/crypto/wallet",
			description: "Connect wallet (MetaMask, WalletConnect, Coinbase)",
			props: ["onConnect", "showBalance"],
		},
		{
			name: "TokenSwap",
			category: "crypto",
			path: "@/components/ontology-ui/crypto/dex",
			description: "Token swap interface with slippage and gas settings",
			props: ["fromToken", "toToken", "onSwap"],
		},
		{
			name: "TokenBalance",
			category: "crypto",
			path: "@/components/ontology-ui/crypto/portfolio",
			description: "Display token balance with USD value",
			props: ["tokenAddress", "walletAddress"],
		},
		{
			name: "NFTCard",
			category: "crypto",
			path: "@/components/ontology-ui/crypto/nft",
			description: "Display NFT with image, metadata, and actions",
			props: ["nft", "showMetadata", "onBuy"],
		},
		{
			name: "NFTMarketplace",
			category: "crypto",
			path: "@/components/ontology-ui/crypto/nft",
			description: "NFT marketplace with filtering and sorting",
			props: ["collection", "onPurchase"],
		},
		{
			name: "TransactionHistory",
			category: "crypto",
			path: "@/components/ontology-ui/crypto/transactions",
			description: "List of wallet transactions with status",
			props: ["walletAddress", "limit"],
		},
		{
			name: "LiquidityPool",
			category: "crypto",
			path: "@/components/ontology-ui/crypto/liquidity",
			description: "Liquidity pool interface for adding/removing liquidity",
			props: ["poolAddress", "onAddLiquidity"],
		},
		{
			name: "StakingPool",
			category: "crypto",
			path: "@/components/ontology-ui/crypto/liquidity",
			description: "Staking interface with APY and rewards",
			props: ["stakingContract", "onStake"],
		},

		// STREAMING DIMENSION (Real-time, presence, chat)
		{
			name: "LiveActivityFeed",
			category: "streaming",
			path: "@/components/ontology-ui/streaming",
			description: "Real-time activity feed with WebSocket updates",
			props: ["groupId", "eventTypes", "autoScroll"],
		},
		{
			name: "PresenceIndicator",
			category: "streaming",
			path: "@/components/ontology-ui/streaming",
			description: "Show online users with avatars and status",
			props: ["users", "showNames"],
		},
		{
			name: "ChatMessage",
			category: "streaming",
			path: "@/components/ontology-ui/streaming",
			description: "Chat message component with reactions and threading",
			props: ["message", "showReactions", "onReply"],
		},
		{
			name: "LiveNotifications",
			category: "streaming",
			path: "@/components/ontology-ui/streaming",
			description: "Real-time notification toast system",
			props: ["userId", "position"],
		},
		{
			name: "CollaborationCursor",
			category: "streaming",
			path: "@/components/ontology-ui/streaming",
			description: "Show collaborator cursors in real-time",
			props: ["userId", "position", "color"],
		},

		// VISUALIZATION DIMENSION (Charts, graphs, analytics)
		{
			name: "TimeSeriesChart",
			category: "visualization",
			path: "@/components/ontology-ui/visualization",
			description: "Line chart for time-series data",
			props: ["data", "xAxis", "yAxis"],
		},
		{
			name: "HeatmapChart",
			category: "visualization",
			path: "@/components/ontology-ui/visualization",
			description: "Heatmap for matrix data visualization",
			props: ["data", "colorScale"],
		},
		{
			name: "NetworkDiagram",
			category: "visualization",
			path: "@/components/ontology-ui/visualization",
			description: "Network graph for relationship visualization",
			props: ["nodes", "edges", "interactive"],
		},

		// APP DIMENSION (Navigation, search, layout)
		{
			name: "DimensionNav",
			category: "app",
			path: "@/components/ontology-ui/app",
			description: "Navigation between 6 dimensions (groups, people, things, etc.)",
			props: ["currentDimension", "onNavigate"],
		},
		{
			name: "UnifiedSearch",
			category: "app",
			path: "@/components/ontology-ui/app",
			description: "Search across all dimensions with filters",
			props: ["placeholder", "dimensions", "onSearch"],
		},
		{
			name: "EntityDisplay",
			category: "app",
			path: "@/components/ontology-ui/app",
			description: "Universal entity display with type detection",
			props: ["entityType", "filters"],
		},
	];
}

/**
 * Generate usage example for a component
 */
function generateUsageExample(name: string, category: string): string {
	const examples: Record<string, string> = {
		Button: `import { Button } from '@/components/ui/button';

<Button variant="default" size="lg" onClick={() => console.log('clicked')}>
  Click Me
</Button>`,

		Card: `import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>`,

		Badge: `import { Badge } from '@/components/ui/badge';

<Badge variant="default">New</Badge>
<Badge variant="secondary">Featured</Badge>
<Badge variant="outline">Sale</Badge>`,

		Input: `import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

<div>
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="you@example.com"
  />
</div>`,

		// THINGS DIMENSION
		ThingCard: `import { ThingCard } from '@/components/ontology-ui/things';

// Universal card for ANY thing type
<ThingCard thing={product} type="product" client:load />
<ThingCard thing={course} type="course" client:load />
<ThingCard thing={token} type="token" client:load />`,

		ProductCard: `import { ProductCard } from '@/components/ontology-ui/things';

<ProductCard
  product={product}
  showPrice={true}
  onPurchase={(id) => console.log('Purchase:', id)}
  client:load
/>`,

		CourseCard: `import { CourseCard } from '@/components/ontology-ui/things';

<CourseCard
  course={course}
  showProgress={true}
  onEnroll={(id) => console.log('Enroll:', id)}
  client:load
/>`,

		TokenCard: `import { TokenCard } from '@/components/ontology-ui/things';

<TokenCard
  token={token}
  showBalance={true}
  onSwap={(token) => console.log('Swap:', token)}
  client:load
/>`,

		ThingGrid: `import { ThingGrid } from '@/components/ontology-ui/things';

<ThingGrid
  things={products}
  columns={3}
  onFilter={(filters) => console.log('Filter:', filters)}
  client:load
/>`,

		// PEOPLE DIMENSION
		UserCard: `import { UserCard } from '@/components/ontology-ui/people';

<UserCard
  user={user}
  showRole={true}
  showStatus={true}
  client:load
/>`,

		UserProfile: `import { UserProfile } from '@/components/ontology-ui/people';

<UserProfile
  userId={userId}
  editable={true}
  client:load
/>`,

		UserActivity: `import { UserActivity } from '@/components/ontology-ui/people';

<UserActivity
  userId={userId}
  limit={10}
  eventTypes={['created', 'updated', 'purchased']}
  client:load
/>`,

		RoleBadge: `import { RoleBadge } from '@/components/ontology-ui/people';

<RoleBadge role="org_owner" variant="default" />
<RoleBadge role="platform_owner" variant="secondary" />
<RoleBadge role="customer" variant="outline" />`,

		// EVENTS DIMENSION
		EventCard: `import { EventCard } from '@/components/ontology-ui/events';

<EventCard
  event={event}
  showActor={true}
  compact={false}
  client:load
/>`,

		ActivityFeed: `import { ActivityFeed } from '@/components/ontology-ui/events';

<ActivityFeed
  groupId={groupId}
  eventTypes={['created', 'updated', 'purchased']}
  limit={50}
  client:load
/>`,

		EventTimeline: `import { EventTimeline } from '@/components/ontology-ui/events';

<EventTimeline
  events={events}
  groupBy="day"
  onFilter={(filters) => console.log('Filter:', filters)}
  client:load
/>`,

		AuditLog: `import { AuditLog } from '@/components/ontology-ui/events';

<AuditLog
  entityId={entityId}
  eventTypes={['created', 'updated', 'deleted']}
  dateRange={{ start: startDate, end: endDate }}
  client:load
/>`,

		NotificationCenter: `import { NotificationCenter } from '@/components/ontology-ui/events';

<NotificationCenter
  userId={userId}
  showUnreadOnly={false}
  client:load
/>`,

		// GROUPS DIMENSION
		GroupSelector: `import { GroupSelector } from '@/components/ontology-ui/groups';

<GroupSelector
  currentGroupId={groupId}
  onSelect={(id) => console.log('Selected:', id)}
  client:load
/>`,

		GroupCard: `import { GroupCard } from '@/components/ontology-ui/groups';

<GroupCard
  group={group}
  showUsage={true}
  client:load
/>`,

		GroupHierarchy: `import { GroupHierarchy } from '@/components/ontology-ui/groups';

<GroupHierarchy
  rootGroupId={rootId}
  expandable={true}
  client:load
/>`,

		// CONNECTIONS DIMENSION
		ConnectionList: `import { ConnectionList } from '@/components/ontology-ui/connections';

<ConnectionList
  fromEntityId={entityId}
  relationshipType="owns"
  client:load
/>`,

		RelationshipGraph: `import { RelationshipGraph } from '@/components/ontology-ui/connections';

<RelationshipGraph
  entityId={entityId}
  depth={2}
  interactive={true}
  client:load
/>`,

		// KNOWLEDGE DIMENSION
		SearchResults: `import { SearchResults } from '@/components/ontology-ui/knowledge';

<SearchResults
  query="blockchain"
  results={results}
  onSelect={(result) => console.log('Selected:', result)}
  client:load
/>`,

		KnowledgeGraph: `import { KnowledgeGraph } from '@/components/ontology-ui/knowledge';

<KnowledgeGraph
  entityId={entityId}
  depth={3}
  client:load
/>`,

		// CRYPTO DIMENSION
		WalletConnectButton: `import { WalletConnectButton } from '@/components/ontology-ui/crypto/wallet';

<WalletConnectButton
  onConnect={(wallet) => console.log('Connected:', wallet)}
  showBalance={true}
  client:load
/>`,

		TokenSwap: `import { TokenSwap } from '@/components/ontology-ui/crypto/dex';

<TokenSwap
  fromToken="ETH"
  toToken="USDC"
  onSwap={(tx) => console.log('Swap:', tx)}
  client:load
/>`,

		TokenBalance: `import { TokenBalance } from '@/components/ontology-ui/crypto/portfolio';

<TokenBalance
  tokenAddress="0x..."
  walletAddress="0x..."
  client:load
/>`,

		NFTCard: `import { NFTCard } from '@/components/ontology-ui/crypto/nft';

<NFTCard
  nft={nft}
  showMetadata={true}
  onBuy={(nft) => console.log('Buy:', nft)}
  client:load
/>`,

		NFTMarketplace: `import { NFTMarketplace } from '@/components/ontology-ui/crypto/nft';

<NFTMarketplace
  collection="bored-apes"
  onPurchase={(nft) => console.log('Purchase:', nft)}
  client:load
/>`,

		TransactionHistory: `import { TransactionHistory } from '@/components/ontology-ui/crypto/transactions';

<TransactionHistory
  walletAddress="0x..."
  limit={20}
  client:load
/>`,

		LiquidityPool: `import { LiquidityPool } from '@/components/ontology-ui/crypto/liquidity';

<LiquidityPool
  poolAddress="0x..."
  onAddLiquidity={(tx) => console.log('Add liquidity:', tx)}
  client:load
/>`,

		StakingPool: `import { StakingPool } from '@/components/ontology-ui/crypto/liquidity';

<StakingPool
  stakingContract="0x..."
  onStake={(tx) => console.log('Stake:', tx)}
  client:load
/>`,

		// STREAMING DIMENSION
		LiveActivityFeed: `import { LiveActivityFeed } from '@/components/ontology-ui/streaming';

<LiveActivityFeed
  groupId={groupId}
  eventTypes={['message_sent', 'user_joined']}
  autoScroll={true}
  client:load
/>`,

		PresenceIndicator: `import { PresenceIndicator } from '@/components/ontology-ui/streaming';

<PresenceIndicator
  users={onlineUsers}
  showNames={true}
  client:load
/>`,

		ChatMessage: `import { ChatMessage } from '@/components/ontology-ui/streaming';

<ChatMessage
  message={message}
  showReactions={true}
  onReply={(msg) => console.log('Reply:', msg)}
  client:load
/>`,

		LiveNotifications: `import { LiveNotifications } from '@/components/ontology-ui/streaming';

<LiveNotifications
  userId={userId}
  position="top-right"
  client:load
/>`,

		CollaborationCursor: `import { CollaborationCursor } from '@/components/ontology-ui/streaming';

<CollaborationCursor
  userId={userId}
  position={{ x: 100, y: 200 }}
  color="blue"
  client:load
/>`,

		// VISUALIZATION DIMENSION
		TimeSeriesChart: `import { TimeSeriesChart } from '@/components/ontology-ui/visualization';

<TimeSeriesChart
  data={timeSeriesData}
  xAxis="timestamp"
  yAxis="value"
  client:load
/>`,

		HeatmapChart: `import { HeatmapChart } from '@/components/ontology-ui/visualization';

<HeatmapChart
  data={matrixData}
  colorScale="viridis"
  client:load
/>`,

		NetworkDiagram: `import { NetworkDiagram } from '@/components/ontology-ui/visualization';

<NetworkDiagram
  nodes={nodes}
  edges={edges}
  interactive={true}
  client:load
/>`,

		// APP DIMENSION
		DimensionNav: `import { DimensionNav } from '@/components/ontology-ui/app';

<DimensionNav
  currentDimension="things"
  onNavigate={(dimension) => console.log('Navigate:', dimension)}
  client:load
/>`,

		UnifiedSearch: `import { UnifiedSearch } from '@/components/ontology-ui/app';

<UnifiedSearch
  placeholder="Search across all dimensions..."
  dimensions={['things', 'people', 'events', 'knowledge']}
  onSearch={(query) => console.log('Search:', query)}
  client:load
/>`,

		EntityDisplay: `import { EntityDisplay } from '@/components/ontology-ui/app';

<EntityDisplay
  entityType="thing"
  filters={{ status: "active", type: "product" }}
  client:load
/>`,

		ProductGallery: `import { ProductGallery } from '@/components/features/products/ProductGallery';

<ProductGallery
  images={['/image1.jpg', '/image2.jpg', '/image3.jpg']}
  alt="Product Name"
  enableZoom={true}
  client:load
/>`,
	};

	return (
		examples[name] ||
		`import { ${name} } from '@/components/ui/${name.toLowerCase()}';\n\n<${name} />`
	);
}

/**
 * Generate search suggestions
 */
function generateSearchSuggestions(
	query: string,
	results: ComponentResult[],
): string[] {
	const suggestions: string[] = [];

	if (results.length === 0) {
		suggestions.push("No components found. Try a different search term.");
		suggestions.push("Browse all components: shadcn.com/docs/components");
		suggestions.push(
			"Consider building a custom component if nothing matches.",
		);
	}

	if (results.length > 10) {
		suggestions.push("Too many results. Try narrowing with a category.");
	}

	if (query.includes("form")) {
		suggestions.push("Also check: Label, Checkbox, Select for forms");
	}

	if (query.includes("button")) {
		suggestions.push("Consider Button variants: default, outline, ghost, link");
	}

	if (query.includes("card")) {
		suggestions.push("Use ThingCard for 6-dimension ontology entities");
	}

	return suggestions;
}
