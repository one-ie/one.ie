/**
 * Component Library Catalog
 *
 * INTEGRATION CYCLE 1: Complete catalog of all available components
 * - shadcn/ui components (50+)
 * - Ontology-UI components (277+)
 * - Builder components
 * - Total: 330+ components
 */

import type { ComponentItem, ComponentCategory } from "@/stores/componentPicker";

// Import all ontology-ui component registries
import {
	ADVANCED_COMPONENTS as ONTOLOGY_ADVANCED,
	APP_COMPONENTS as ONTOLOGY_APP,
	CONNECTIONS_COMPONENTS as ONTOLOGY_CONNECTIONS,
	CRYPTO_COMPONENTS as ONTOLOGY_CRYPTO,
	ENHANCED_COMPONENTS as ONTOLOGY_ENHANCED,
	EVENTS_COMPONENTS as ONTOLOGY_EVENTS,
	GENERATIVE_COMPONENTS as ONTOLOGY_GENERATIVE,
	GROUPS_COMPONENTS as ONTOLOGY_GROUPS,
	INTEGRATION_COMPONENTS as ONTOLOGY_INTEGRATION,
	KNOWLEDGE_COMPONENTS as ONTOLOGY_KNOWLEDGE,
	LAYOUTS_COMPONENTS as ONTOLOGY_LAYOUTS,
	MAIL_COMPONENTS as ONTOLOGY_MAIL,
	PEOPLE_COMPONENTS as ONTOLOGY_PEOPLE,
	STREAMING_COMPONENTS as ONTOLOGY_STREAMING,
	THINGS_COMPONENTS as ONTOLOGY_THINGS,
	UNIVERSAL_COMPONENTS as ONTOLOGY_UNIVERSAL,
	VISUALIZATION_COMPONENTS as ONTOLOGY_VISUALIZATION,
} from "./componentRegistryGenerated";

/**
 * shadcn/ui Components (50+ UI primitives)
 */
export const SHADCN_COMPONENTS: ComponentItem[] = [
	{
		id: "button",
		name: "Button",
		category: "ui",
		path: "@/components/ui/button",
		description: "Clickable button with variants and sizes",
		props: ["variant", "size", "onClick", "disabled"],
		variants: [
			"default",
			"destructive",
			"outline",
			"secondary",
			"ghost",
			"link",
		],
		tags: ["button", "click", "action", "cta"],
		previewCode: `<Button variant="default">Click Me</Button>`,
		example: `import { Button } from '@/components/ui/button';

<Button variant="default" size="lg">
  Click Me
</Button>`,
	},
	{
		id: "card",
		name: "Card",
		category: "ui",
		path: "@/components/ui/card",
		description: "Container with header, content, and footer sections",
		props: ["className"],
		tags: ["card", "container", "box", "panel"],
		previewCode: `<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
</Card>`,
		example: `import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Card content</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>`,
	},
	{
		id: "badge",
		name: "Badge",
		category: "ui",
		path: "@/components/ui/badge",
		description: "Small label or tag component",
		props: ["variant"],
		variants: ["default", "secondary", "destructive", "outline"],
		tags: ["badge", "label", "tag", "pill"],
		previewCode: `<Badge variant="default">New</Badge>`,
		example: `import { Badge } from '@/components/ui/badge';

<Badge variant="default">New</Badge>
<Badge variant="secondary">Featured</Badge>`,
	},
	{
		id: "input",
		name: "Input",
		category: "form",
		path: "@/components/ui/input",
		description: "Text input field",
		props: ["type", "placeholder", "value", "onChange"],
		tags: ["input", "text", "field", "form"],
		previewCode: `<Input type="text" placeholder="Enter text..." />`,
		example: `import { Input } from '@/components/ui/input';

<Input
  type="email"
  placeholder="you@example.com"
/>`,
	},
	{
		id: "select",
		name: "Select",
		category: "form",
		path: "@/components/ui/select",
		description: "Dropdown select component",
		props: ["value", "onValueChange"],
		tags: ["select", "dropdown", "picker", "form"],
		previewCode: `<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
  </SelectContent>
</Select>`,
		example: `import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Choose..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="a">Option A</SelectItem>
    <SelectItem value="b">Option B</SelectItem>
  </SelectContent>
</Select>`,
	},
	{
		id: "dialog",
		name: "Dialog",
		category: "overlay",
		path: "@/components/ui/dialog",
		description: "Modal dialog component",
		props: ["open", "onOpenChange"],
		tags: ["dialog", "modal", "popup", "overlay"],
		previewCode: `<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
  </DialogContent>
</Dialog>`,
		example: `import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    <p>Dialog content goes here</p>
  </DialogContent>
</Dialog>`,
	},
	{
		id: "avatar",
		name: "Avatar",
		category: "data-display",
		path: "@/components/ui/avatar",
		description: "User avatar with fallback",
		props: [],
		tags: ["avatar", "profile", "image", "user"],
		previewCode: `<Avatar>
  <AvatarImage src="/avatar.jpg" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>`,
		example: `import { Avatar, AvatarImage, AvatarFallback} from '@/components/ui/avatar';

<Avatar>
  <AvatarImage src="/avatar.jpg" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>`,
	},
	{
		id: "skeleton",
		name: "Skeleton",
		category: "feedback",
		path: "@/components/ui/skeleton",
		description: "Loading placeholder skeleton",
		props: ["className"],
		tags: ["skeleton", "loading", "placeholder"],
		previewCode: `<Skeleton className="h-12 w-full" />`,
		example: `import { Skeleton } from '@/components/ui/skeleton';

<Skeleton className="h-12 w-full" />`,
	},
	{
		id: "separator",
		name: "Separator",
		category: "layout",
		path: "@/components/ui/separator",
		description: "Horizontal or vertical divider line",
		props: ["orientation"],
		tags: ["separator", "divider", "line", "hr"],
		previewCode: `<Separator />`,
		example: `import { Separator } from '@/components/ui/separator';

<Separator />
<Separator orientation="vertical" />`,
	},
	{
		id: "alert",
		name: "Alert",
		category: "feedback",
		path: "@/components/ui/alert",
		description: "Alert message component",
		props: ["variant"],
		variants: ["default", "destructive"],
		tags: ["alert", "message", "notification", "banner"],
		previewCode: `<Alert>
  <AlertTitle>Alert Title</AlertTitle>
  <AlertDescription>Alert message</AlertDescription>
</Alert>`,
		example: `import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

<Alert>
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>
    You can add components to your app.
  </AlertDescription>
</Alert>`,
	},
	{
		id: "accordion",
		name: "Accordion",
		category: "layout",
		path: "@/components/ui/accordion",
		description: "Expandable accordion component",
		props: ["type", "collapsible"],
		tags: ["accordion", "collapse", "expand", "faq"],
		previewCode: `<Accordion type="single">
  <AccordionItem value="1">
    <AccordionTrigger>Item 1</AccordionTrigger>
    <AccordionContent>Content 1</AccordionContent>
  </AccordionItem>
</Accordion>`,
		example: `import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Is it accessible?</AccordionTrigger>
    <AccordionContent>
      Yes. It adheres to WAI-ARIA design patterns.
    </AccordionContent>
  </AccordionItem>
</Accordion>`,
	},
	{
		id: "tabs",
		name: "Tabs",
		category: "navigation",
		path: "@/components/ui/tabs",
		description: "Tabbed navigation component",
		props: ["value", "onValueChange"],
		tags: ["tabs", "navigation", "switcher"],
		previewCode: `<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
</Tabs>`,
		example: `import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">Account content</TabsContent>
  <TabsContent value="password">Password content</TabsContent>
</Tabs>`,
	},
	{
		id: "table",
		name: "Table",
		category: "data-display",
		path: "@/components/ui/table",
		description: "Data table component",
		props: [],
		tags: ["table", "grid", "data", "list"],
		previewCode: `<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
		example: `import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>john@example.com</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
	},
	{
		id: "dropdown-menu",
		name: "DropdownMenu",
		category: "overlay",
		path: "@/components/ui/dropdown-menu",
		description: "Dropdown menu component",
		props: [],
		tags: ["dropdown", "menu", "popover", "context"],
		previewCode: `<DropdownMenu>
  <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Item 1</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`,
		example: `import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Open Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`,
	},
	{
		id: "tooltip",
		name: "Tooltip",
		category: "overlay",
		path: "@/components/ui/tooltip",
		description: "Tooltip on hover",
		props: [],
		tags: ["tooltip", "hint", "help", "popover"],
		previewCode: `<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover</TooltipTrigger>
    <TooltipContent>Tooltip text</TooltipContent>
  </Tooltip>
</TooltipProvider>`,
		example: `import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button>Hover me</Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Tooltip text</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>`,
	},
];

/**
 * Custom Builder Components
 */
export const BUILDER_COMPONENTS: ComponentItem[] = [
	{
		id: "live-preview",
		name: "LivePreview",
		category: "builder",
		path: "@/components/features/creator/LivePreview",
		description: "Live code editor with preview panel",
		props: ["initialCode", "language", "useMonaco", "autoCompile"],
		tags: ["editor", "code", "preview", "compiler"],
		previewCode: `<LivePreview
  initialCode="<h1>Hello</h1>"
  language="html"
  autoCompile={true}
/>`,
		example: `import { LivePreview } from '@/components/features/creator/LivePreview';

<LivePreview
  client:only="react"
  initialCode={sampleCode}
  language="astro"
  autoCompile={true}
/>`,
	},
	{
		id: "chat-client",
		name: "ChatClient",
		category: "builder",
		path: "@/components/ai/ChatClient",
		description: "AI chat interface component",
		props: [],
		tags: ["chat", "ai", "assistant", "conversation"],
		previewCode: `<ChatClient client:only="react" />`,
		example: `import { ChatClient } from '@/components/ai/ChatClient';

<ChatClient client:only="react" />`,
	},
	{
		id: "component-picker",
		name: "ComponentPicker",
		category: "builder",
		path: "@/components/features/creator/ComponentPicker",
		description: "Visual component library browser",
		props: ["onSelect", "categories"],
		tags: ["picker", "library", "browse", "components"],
		previewCode: `<ComponentPicker onSelect={handleSelect} />`,
		example: `import { ComponentPicker } from '@/components/features/creator/ComponentPicker';

<ComponentPicker
  client:load
  onSelect={(component) => console.log(component)}
/>`,
	},
];

/**
 * Custom Feature Components
 */
export const FEATURE_COMPONENTS: ComponentItem[] = [
	{
		id: "product-gallery",
		name: "ProductGallery",
		category: "features",
		path: "@/components/features/products/ProductGallery",
		description: "Product image gallery with zoom and thumbnails",
		props: ["images", "alt", "enableZoom"],
		tags: ["gallery", "images", "product", "ecommerce"],
		previewCode: `<ProductGallery
  images={['/img1.jpg', '/img2.jpg']}
  alt="Product"
  enableZoom={true}
/>`,
		example: `import { ProductGallery } from '@/components/features/products/ProductGallery';

<ProductGallery
  images={['/image1.jpg', '/image2.jpg', '/image3.jpg']}
  alt="Product Name"
  enableZoom={true}
  client:load
/>`,
	},
];

/**
 * All components combined
 */
export const ALL_COMPONENTS: ComponentItem[] = [
	...SHADCN_COMPONENTS,
	...BUILDER_COMPONENTS,
	...FEATURE_COMPONENTS,
	// Ontology-UI Components (277)
	...ONTOLOGY_ADVANCED,
	...ONTOLOGY_APP,
	...ONTOLOGY_CONNECTIONS,
	...ONTOLOGY_CRYPTO,
	...ONTOLOGY_ENHANCED,
	...ONTOLOGY_EVENTS,
	...ONTOLOGY_GENERATIVE,
	...ONTOLOGY_GROUPS,
	...ONTOLOGY_INTEGRATION,
	...ONTOLOGY_KNOWLEDGE,
	...ONTOLOGY_LAYOUTS,
	...ONTOLOGY_MAIL,
	...ONTOLOGY_PEOPLE,
	...ONTOLOGY_STREAMING,
	...ONTOLOGY_THINGS,
	...ONTOLOGY_UNIVERSAL,
	...ONTOLOGY_VISUALIZATION,
];

/**
 * Component statistics
 */
export const COMPONENT_STATS = {
	total: ALL_COMPONENTS.length,
	shadcn: SHADCN_COMPONENTS.length,
	builder: BUILDER_COMPONENTS.length,
	feature: FEATURE_COMPONENTS.length,
	ontologyUI: {
		advanced: ONTOLOGY_ADVANCED.length,
		app: ONTOLOGY_APP.length,
		connections: ONTOLOGY_CONNECTIONS.length,
		crypto: ONTOLOGY_CRYPTO.length,
		enhanced: ONTOLOGY_ENHANCED.length,
		events: ONTOLOGY_EVENTS.length,
		generative: ONTOLOGY_GENERATIVE.length,
		groups: ONTOLOGY_GROUPS.length,
		integration: ONTOLOGY_INTEGRATION.length,
		knowledge: ONTOLOGY_KNOWLEDGE.length,
		layouts: ONTOLOGY_LAYOUTS.length,
		mail: ONTOLOGY_MAIL.length,
		people: ONTOLOGY_PEOPLE.length,
		streaming: ONTOLOGY_STREAMING.length,
		things: ONTOLOGY_THINGS.length,
		universal: ONTOLOGY_UNIVERSAL.length,
		visualization: ONTOLOGY_VISUALIZATION.length,
	},
};

/**
 * Get components by category
 */
export function getComponentsByCategory(
	category: ComponentCategory
): ComponentItem[] {
	if (category === "all") {
		return ALL_COMPONENTS;
	}

	// Map category to component collections
	const categoryMap: Record<string, ComponentItem[]> = {
		ui: SHADCN_COMPONENTS.filter((c) => c.category === "ui"),
		layout: SHADCN_COMPONENTS.filter((c) => c.category === "layout"),
		form: SHADCN_COMPONENTS.filter((c) => c.category === "form"),
		"data-display": SHADCN_COMPONENTS.filter((c) => c.category === "data-display"),
		feedback: SHADCN_COMPONENTS.filter((c) => c.category === "feedback"),
		overlay: SHADCN_COMPONENTS.filter((c) => c.category === "overlay"),
		navigation: SHADCN_COMPONENTS.filter((c) => c.category === "navigation"),
		builder: BUILDER_COMPONENTS,
		features: FEATURE_COMPONENTS,
		advanced: ONTOLOGY_ADVANCED,
		app: ONTOLOGY_APP,
		connections: ONTOLOGY_CONNECTIONS,
		crypto: ONTOLOGY_CRYPTO,
		enhanced: ONTOLOGY_ENHANCED,
		events: ONTOLOGY_EVENTS,
		generative: ONTOLOGY_GENERATIVE,
		groups: ONTOLOGY_GROUPS,
		integration: ONTOLOGY_INTEGRATION,
		knowledge: ONTOLOGY_KNOWLEDGE,
		layouts: ONTOLOGY_LAYOUTS,
		mail: ONTOLOGY_MAIL,
		people: ONTOLOGY_PEOPLE,
		streaming: ONTOLOGY_STREAMING,
		things: ONTOLOGY_THINGS,
		universal: ONTOLOGY_UNIVERSAL,
		visualization: ONTOLOGY_VISUALIZATION,
	};

	return categoryMap[category] || [];
}

/**
 * Search components by query
 */
export function searchComponents(query: string): ComponentItem[] {
	const lower = query.toLowerCase().trim();

	if (!lower) {
		return ALL_COMPONENTS;
	}

	return ALL_COMPONENTS.filter((component) => {
		const nameMatch = component.name.toLowerCase().includes(lower);
		const descMatch = component.description.toLowerCase().includes(lower);
		const tagMatch = component.tags?.some((tag) => tag.includes(lower));
		const propMatch = component.props?.some((prop) =>
			prop.toLowerCase().includes(lower)
		);

		return nameMatch || descMatch || tagMatch || propMatch;
	});
}

/**
 * Filter components
 */
export function filterComponents(
	query: string,
	category: ComponentCategory
): ComponentItem[] {
	let results = ALL_COMPONENTS;

	// Filter by category
	if (category !== "all") {
		results = getComponentsByCategory(category);
	}

	// Search by query
	if (query.trim()) {
		const lower = query.toLowerCase();
		results = results.filter((component) => {
			const nameMatch = component.name.toLowerCase().includes(lower);
			const descMatch = component.description.toLowerCase().includes(lower);
			const tagMatch = component.tags?.some((tag) => tag.includes(lower));

			return nameMatch || descMatch || tagMatch;
		});
	}

	return results;
}

/**
 * Get component by ID
 */
export function getComponentById(id: string): ComponentItem | null {
	return ALL_COMPONENTS.find((c) => c.id === id) || null;
}

/**
 * Category labels for UI
 */
export const CATEGORY_LABELS: Record<ComponentCategory, string> = {
	all: "All Components",
	builder: "Website Builder",
	things: "Things",
	people: "People",
	groups: "Groups",
	connections: "Connections",
	events: "Events",
	knowledge: "Knowledge",
	crypto: "Crypto & Web3",
	streaming: "Real-time & Streaming",
	advanced: "Advanced UI",
	enhanced: "Enhanced Components",
	generative: "AI-Generated",
	visualization: "Visualization",
	universal: "Universal",
	layouts: "Layouts",
	app: "Application",
	integration: "Integrations",
	mail: "Mail & Messaging",
	ui: "UI Primitives",
	layout: "Layout",
	form: "Forms",
	"data-display": "Data Display",
	feedback: "Feedback",
	overlay: "Overlays",
	navigation: "Navigation",
	features: "Features",
	ontology: "Ontology",
};

/**
 * Category icons (Lucide icon names)
 */
export const CATEGORY_ICONS: Record<ComponentCategory, string> = {
	all: "grid-3x3",
	builder: "wrench",
	things: "box",
	people: "users",
	groups: "building",
	connections: "link",
	events: "activity",
	knowledge: "brain",
	crypto: "coins",
	streaming: "radio",
	advanced: "sparkles",
	enhanced: "zap",
	generative: "bot",
	visualization: "bar-chart-3",
	universal: "globe",
	layouts: "layout",
	app: "app-window",
	integration: "plug",
	mail: "mail",
	ui: "square",
	layout: "layout-grid",
	form: "file-input",
	"data-display": "database",
	feedback: "message-circle",
	overlay: "layers",
	navigation: "compass",
	features: "package",
	ontology: "boxes",
};

/**
 * Category descriptions
 */
export const CATEGORY_DESCRIPTIONS: Record<ComponentCategory, string> = {
	all: "All available components across the entire library",
	builder: "Website builder components for creating pages with AI",
	things: "All entities (products, courses, tokens, agents, content)",
	people: "User profiles, teams, roles, and permissions",
	groups: "Multi-tenant containers with infinite nesting",
	connections: "Relationships between entities (25+ types)",
	events: "Complete audit trail and activity tracking (67+ event types)",
	knowledge: "Labels, vectors, semantic search, and RAG",
	crypto: "Cryptocurrency, Web3, DeFi, NFTs, and wallets",
	streaming: "Real-time data, live updates, and WebSocket components",
	advanced: "Advanced UI features (rich text, file upload, date pickers)",
	enhanced: "Enhanced component variants with advanced features",
	generative: "AI-powered UI generation and dynamic components",
	visualization: "Charts, graphs, and data visualization",
	universal: "Cross-dimensional components that work with any dimension",
	layouts: "Navigation, headers, footers, and page structure",
	app: "Application-level components (search, filters, navigation)",
	integration: "Third-party integrations and external services",
	mail: "Email, inbox, and messaging components",
	ui: "UI primitives (buttons, cards, badges, inputs)",
	layout: "Layout components (grids, containers, separators)",
	form: "Form components (inputs, selects, checkboxes)",
	"data-display": "Data display (tables, avatars, lists)",
	feedback: "Feedback components (alerts, toasts, skeletons)",
	overlay: "Overlays (dialogs, dropdowns, tooltips)",
	navigation: "Navigation components (tabs, breadcrumbs, menus)",
	features: "Custom feature components",
	ontology: "6-dimension ontology components",
};
