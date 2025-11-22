/**
 * AI Tool: Generate Astro Page
 *
 * Creates complete .astro file code from natural language description
 * Uses component library for building blocks
 *
 * Available Templates:
 * - dashboard: Admin dashboard with DimensionNav, EntityDisplay, UnifiedSearch (/templates/dashboard.astro)
 * - profile: User profile with UserCard, UserActivity, UserPermissions (/templates/profile.astro)
 * - marketplace: E-commerce with ProductCard, TokenCard, NFTCard (/templates/marketplace.astro)
 * - analytics: Analytics dashboard with charts and visualizations (/templates/analytics.astro)
 * - chat: Real-time chat with ChatMessage, ChatInput, LiveNotifications (/templates/chat.astro)
 * - product: Product landing page with gallery and checkout
 * - blog: Blog listing and posts
 * - docs: Documentation pages
 * - landing: Marketing landing pages
 * - auth: Authentication pages
 */

import type { CoreTool } from "ai";
import { z } from "zod";

export const generateAstroPageTool: CoreTool = {
	description:
		"Generate a complete Astro page file (.astro) from a natural language description. Returns TypeScript/Astro code ready to be written to a file. Automatically uses shadcn/ui components and follows ONE platform patterns.",
	parameters: z.object({
		description: z
			.string()
			.describe(
				"Natural language description of the page to generate. Example: 'Create a product landing page with image gallery, reviews section, and buy button'",
			),
		route: z
			.string()
			.describe(
				"The route path for this page. Example: '/products/coffee-mug' or '/shop/t-shirt'",
			),
		pageType: z
			.enum([
				"landing",
				"product",
				"blog",
				"docs",
				"dashboard",
				"profile",
				"marketplace",
				"analytics",
				"auth",
				"chat",
				"custom",
			])
			.describe("The type of page being generated. Use template-based types (dashboard, profile, marketplace, analytics, chat) for production-ready pages with ontology-ui components."),
		features: z
			.array(z.string())
			.optional()
			.describe(
				"Optional list of specific features to include. Example: ['stripe-checkout', 'product-gallery', 'reviews', 'urgency-banner']",
			),
		groupScoped: z
			.boolean()
			.optional()
			.default(true)
			.describe(
				"Whether this page should be scoped to a group (multi-tenant). Default: true",
			),
	}),
	execute: async ({ description, route, pageType, features, groupScoped }) => {
		// Generate Astro page code based on type and description
		const code = generatePageCode({
			description,
			route,
			pageType,
			features: features || [],
			groupScoped: groupScoped ?? true,
		});

		return {
			code,
			route,
			filePath: routeToFilePath(route),
			components: extractComponentsUsed(code),
			instructions: generateUsageInstructions(pageType, route),
		};
	},
};

/**
 * Generate Astro page code based on parameters
 */
function generatePageCode({
	description,
	route,
	pageType,
	features,
	groupScoped,
}: {
	description: string;
	route: string;
	pageType: string;
	features: string[];
	groupScoped: boolean;
}): string {
	// Determine if this is a dynamic route
	const isDynamic = route.includes("[");
	const hasGroupId = groupScoped && route.includes("[groupId]");

	// Start building the page
	const imports = generateImports(pageType, features);
	const frontmatter = generateFrontmatter(
		pageType,
		isDynamic,
		hasGroupId,
		features,
	);
	const markup = generateMarkup(pageType, description, features);

	return `---
${imports}

${frontmatter}
---

${markup}`;
}

/**
 * Generate imports based on page type and features
 */
function generateImports(pageType: string, features: string[]): string {
	const imports: string[] = ["import Layout from '@/layouts/Layout.astro';"];

	// Add ontology-ui components based on page type
	if (pageType === "product" || pageType === "landing") {
		imports.push(
			"import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';",
		);
		imports.push("import { Button } from '@/components/ui/button';");
		imports.push("import { Badge } from '@/components/ui/badge';");
		// Ontology-UI: Thing components for products
		imports.push("import { ThingCard } from '@/components/ontology-ui/things';");
		imports.push("import { ProductCard } from '@/components/ontology-ui/things';");
	}

	if (pageType === "dashboard") {
		imports.push("import { Separator } from '@/components/ui/separator';");
		imports.push("import { Skeleton } from '@/components/ui/skeleton';");
		// Ontology-UI: Dashboard components
		imports.push("import { DimensionNav } from '@/components/ontology-ui/app';");
		imports.push("import { EntityDisplay } from '@/components/ontology-ui/app';");
		imports.push("import { UnifiedSearch } from '@/components/ontology-ui/app';");
	}

	if (pageType === "auth") {
		imports.push("import { Input } from '@/components/ui/input';");
		imports.push("import { Label } from '@/components/ui/label';");
		// Ontology-UI: User/People components
		imports.push("import { UserCard } from '@/components/ontology-ui/people';");
		imports.push("import { UserProfile } from '@/components/ontology-ui/people';");
	}

	if (pageType === "chat") {
		// Ontology-UI: Streaming components
		imports.push("import { LiveActivityFeed } from '@/components/ontology-ui/streaming';");
		imports.push("import { ChatMessage } from '@/components/ontology-ui/streaming';");
		imports.push("import { PresenceIndicator } from '@/components/ontology-ui/streaming';");
	}

	if (features.includes("stripe-checkout")) {
		imports.push("// Stripe integration (add API keys to .env)");
	}

	if (features.includes("product-gallery")) {
		imports.push(
			"import { ProductGallery } from '@/components/features/products/ProductGallery';",
		);
	}

	if (features.includes("crypto")) {
		// Ontology-UI: Crypto components
		imports.push("import { WalletConnectButton } from '@/components/ontology-ui/crypto/wallet';");
		imports.push("import { TokenSwap } from '@/components/ontology-ui/crypto/dex';");
		imports.push("import { TokenBalance } from '@/components/ontology-ui/crypto/portfolio';");
	}

	if (features.includes("analytics")) {
		// Ontology-UI: Visualization components
		imports.push("import { TimeSeriesChart } from '@/components/ontology-ui/visualization';");
		imports.push("import { HeatmapChart } from '@/components/ontology-ui/visualization';");
	}

	if (features.includes("marketplace")) {
		// Ontology-UI: NFT/Marketplace components
		imports.push("import { NFTCard } from '@/components/ontology-ui/crypto/nft';");
		imports.push("import { NFTMarketplace } from '@/components/ontology-ui/crypto/nft';");
	}

	return imports.join("\n");
}

/**
 * Generate frontmatter (data fetching, getStaticPaths, etc.)
 */
function generateFrontmatter(
	pageType: string,
	isDynamic: boolean,
	hasGroupId: boolean,
	features: string[],
): string {
	const sections: string[] = [];

	// Add getStaticPaths for dynamic routes
	if (isDynamic) {
		sections.push(`export async function getStaticPaths() {
  // TODO: Replace with actual data fetching
  return [
    { params: { id: "1" }, props: { name: "Example Item" } },
  ];
}`);
	}

	// Add data fetching
	if (hasGroupId) {
		sections.push(`const { groupId } = Astro.params;`);
	}

	if (pageType === "product" || pageType === "landing") {
		sections.push(`const title = "Product Name";
const description = "Product description goes here";
const price = 99.99;`);
	}

	if (pageType === "blog") {
		sections.push(
			`import { getCollection } from 'astro:content';
const posts = await getCollection('blog');`,
		);
	}

	if (pageType === "dashboard") {
		sections.push(`const title = "Dashboard";`);
	}

	return sections.join("\n\n");
}

/**
 * Generate HTML markup based on page type
 */
function generateMarkup(
	pageType: string,
	description: string,
	features: string[],
): string {
	if (pageType === "product" || pageType === "landing") {
		return `<Layout title={title} description={description}>
  <div class="container mx-auto px-4 py-8">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Product Image/Gallery -->
      <div class="space-y-4">
        ${features.includes("product-gallery") ? '<ProductGallery images={["/placeholder.jpg"]} alt={title} client:load />' : '<img src="/placeholder.jpg" alt={title} class="rounded-lg w-full" />'}
      </div>

      <!-- Product Details -->
      <div class="space-y-6">
        <div>
          <Badge>New</Badge>
          <h1 class="text-4xl font-bold mt-2">{title}</h1>
          <p class="text-muted-foreground mt-4">{description}</p>
        </div>

        <div class="text-3xl font-bold">
          \${price}
        </div>

        ${features.includes("stripe-checkout") ? '<Button size="lg" class="w-full">Buy Now with Stripe</Button>' : '<Button size="lg" class="w-full">Add to Cart</Button>'}
      </div>
    </div>

    ${features.includes("reviews") ? `
    <!-- Reviews Section -->
    <div class="mt-16">
      <h2 class="text-2xl font-bold mb-6">Customer Reviews</h2>
      <div class="grid gap-4">
        <!-- Review items go here -->
      </div>
    </div>` : ""}
  </div>
</Layout>`;
	}

	if (pageType === "blog") {
		return `<Layout title="Blog">
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold mb-8">Blog Posts</h1>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      {posts.map(post => (
        <Card>
          <CardHeader>
            <CardTitle>{post.data.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-muted-foreground">{post.data.excerpt}</p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" as="a" href={\`/blog/\${post.slug}\`}>
              Read More
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  </div>
</Layout>`;
	}

	if (pageType === "dashboard") {
		return `<Layout title={title} sidebarInitialCollapsed={false}>
  <div class="container mx-auto px-4 py-8">
    <!-- Ontology-UI: Dimension Navigation -->
    <DimensionNav client:load />

    <h1 class="text-3xl font-bold mb-8">{title}</h1>

    <!-- Ontology-UI: Unified Search -->
    <UnifiedSearch
      placeholder="Search across all dimensions..."
      dimensions={['things', 'people', 'events']}
      client:load
    />

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Metric 1</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">1,234</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Metric 2</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">5,678</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Metric 3</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">9,012</div>
        </CardContent>
      </Card>
    </div>

    <!-- Ontology-UI: Entity Display -->
    <EntityDisplay
      entityType="thing"
      filters={{ status: "active" }}
      client:load
    />
  </div>
</Layout>`;
	}

	if (pageType === "chat") {
		return `<Layout title="Chat" sidebarInitialCollapsed={true}>
  <div class="h-screen flex flex-col">
    <!-- Ontology-UI: Presence Indicators -->
    <div class="border-b p-4">
      <PresenceIndicator
        users={[]}
        showNames={true}
        client:load
      />
    </div>

    <!-- Ontology-UI: Chat Messages -->
    <div class="flex-1 overflow-y-auto p-4">
      <LiveActivityFeed
        groupId="current-group"
        eventTypes={['message_sent', 'user_joined']}
        client:load
      />
    </div>

    <!-- Ontology-UI: Chat Input -->
    <div class="border-t p-4">
      <ChatMessage
        mode="input"
        onSend={(message) => console.log('Send:', message)}
        client:load
      />
    </div>
  </div>
</Layout>`;
	}

	// Custom/generic page
	return `<Layout title="Page Title">
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold mb-8">Page Title</h1>
    <p class="text-muted-foreground">
      ${description}
    </p>
  </div>
</Layout>`;
}

/**
 * Convert route to file path
 */
function routeToFilePath(route: string): string {
	// Remove leading slash
	const cleanRoute = route.startsWith("/") ? route.slice(1) : route;

	// Convert to file path
	if (cleanRoute === "") {
		return "web/src/pages/index.astro";
	}

	return `web/src/pages/${cleanRoute}.astro`;
}

/**
 * Extract components used in generated code
 */
function extractComponentsUsed(code: string): string[] {
	const components: string[] = [];

	if (code.includes("Card")) components.push("Card");
	if (code.includes("Button")) components.push("Button");
	if (code.includes("Badge")) components.push("Badge");
	if (code.includes("Input")) components.push("Input");
	if (code.includes("Label")) components.push("Label");
	if (code.includes("Separator")) components.push("Separator");
	if (code.includes("Skeleton")) components.push("Skeleton");
	if (code.includes("ProductGallery")) components.push("ProductGallery");

	return components;
}

/**
 * Generate usage instructions for the generated page
 */
function generateUsageInstructions(pageType: string, route: string): string {
	const filePath = routeToFilePath(route);

	const instructions: string[] = [
		`# Generated Astro Page`,
		``,
		`**File:** ${filePath}`,
		`**Route:** ${route}`,
		`**Type:** ${pageType}`,
		``,
		`## Next Steps`,
		``,
		`1. Review the generated code`,
		`2. Replace placeholder content with real data`,
		`3. Customize styling as needed`,
		`4. Test in development: \`bun run dev\``,
		`5. Build for production: \`bun run build\``,
	];

	if (pageType === "product") {
		instructions.push(
			``,
			`## Stripe Integration`,
			``,
			`To enable Stripe checkout:`,
			`1. Add STRIPE_SECRET_KEY to .env`,
			`2. Add PUBLIC_STRIPE_PUBLISHABLE_KEY to .env`,
			`3. Implement checkout handler`,
			`4. See: /web/src/pages/shop/TEMPLATE-README.md`,
		);
	}

	return instructions.join("\n");
}
