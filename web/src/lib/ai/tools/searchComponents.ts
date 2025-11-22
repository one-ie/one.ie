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
 * Get ontology-specific components
 */
function getOntologyComponents(): ComponentResult[] {
	return [
		{
			name: "ThingCard",
			category: "ontology",
			path: "@/components/features/ontology/ThingCard",
			description:
				"Universal card for rendering any 'thing' (product, course, token, agent, etc.)",
			props: ["thing", "type", "variant", "onSelect"],
		},
		{
			name: "PersonCard",
			category: "ontology",
			path: "@/components/features/ontology/PersonCard",
			description: "Card for rendering people/users with role badges",
			props: ["person", "showRole"],
		},
		{
			name: "EventItem",
			category: "ontology",
			path: "@/components/features/ontology/EventItem",
			description: "Render events in activity feeds or timelines",
			props: ["event", "compact"],
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

		ThingCard: `import { ThingCard } from '@/components/features/ontology/ThingCard';

// Render any thing type
<ThingCard thing={product} type="product" />
<ThingCard thing={course} type="course" />
<ThingCard thing={token} type="token" />`,

		PersonCard: `import { PersonCard } from '@/components/features/ontology/PersonCard';

<PersonCard person={user} showRole={true} />`,

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
