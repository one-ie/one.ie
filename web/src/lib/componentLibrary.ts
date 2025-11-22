/**
 * Component Library Catalog
 *
 * CYCLE 15: Complete catalog of all available components
 * Provides metadata, previews, and usage examples
 */

import type { ComponentItem, ComponentCategory } from "@/stores/componentPicker";

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
		example: `import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

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
 * Custom Feature Components
 */
export const FEATURE_COMPONENTS: ComponentItem[] = [
	{
		id: "thing-card",
		name: "ThingCard",
		category: "ontology",
		path: "@/components/features/ontology/ThingCard",
		description:
			"Universal card for rendering any 'thing' (product, course, token, agent)",
		props: ["thing", "type", "variant", "onSelect"],
		tags: ["thing", "entity", "ontology", "card"],
		previewCode: `<ThingCard thing={product} type="product" />`,
		example: `import { ThingCard } from '@/components/features/ontology/ThingCard';

// Works with any thing type
<ThingCard thing={product} type="product" />
<ThingCard thing={course} type="course" />
<ThingCard thing={token} type="token" />`,
	},
	{
		id: "person-card",
		name: "PersonCard",
		category: "ontology",
		path: "@/components/features/ontology/PersonCard",
		description: "Card for rendering people/users with role badges",
		props: ["person", "showRole"],
		tags: ["person", "user", "profile", "ontology"],
		previewCode: `<PersonCard person={user} showRole={true} />`,
		example: `import { PersonCard } from '@/components/features/ontology/PersonCard';

<PersonCard person={user} showRole={true} />`,
	},
	{
		id: "event-item",
		name: "EventItem",
		category: "ontology",
		path: "@/components/features/ontology/EventItem",
		description: "Render events in activity feeds or timelines",
		props: ["event", "compact"],
		tags: ["event", "activity", "timeline", "ontology"],
		previewCode: `<EventItem event={event} compact={false} />`,
		example: `import { EventItem } from '@/components/features/ontology/EventItem';

<EventItem event={event} compact={false} />`,
	},
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
	{
		id: "chat-client",
		name: "ChatClient",
		category: "features",
		path: "@/components/ai/ChatClient",
		description: "AI chat interface component",
		props: [],
		tags: ["chat", "ai", "assistant", "conversation"],
		previewCode: `<ChatClient client:only="react" />`,
		example: `import { ChatClient } from '@/components/ai/ChatClient';

<ChatClient client:only="react" />`,
	},
	{
		id: "live-preview",
		name: "LivePreview",
		category: "features",
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
];

/**
 * All components combined
 */
export const ALL_COMPONENTS: ComponentItem[] = [
	...SHADCN_COMPONENTS,
	...FEATURE_COMPONENTS,
];

/**
 * Get components by category
 */
export function getComponentsByCategory(
	category: ComponentCategory
): ComponentItem[] {
	if (category === "all") {
		return ALL_COMPONENTS;
	}
	return ALL_COMPONENTS.filter((c) => c.category === category);
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
		results = results.filter((c) => c.category === category);
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
 * Category icons
 */
export const CATEGORY_ICONS: Record<ComponentCategory, string> = {
	all: "grid-3x3",
	ui: "square",
	layout: "layout-grid",
	form: "file-input",
	"data-display": "bar-chart-3",
	feedback: "message-circle",
	overlay: "layers",
	navigation: "compass",
	features: "package",
	ontology: "boxes",
};
