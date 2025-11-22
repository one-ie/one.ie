import type { APIRoute } from 'astro';

/**
 * Astro Compilation API - Enhanced for Ontology-UI Components
 *
 * Compiles Astro code server-side and returns HTML for preview
 * Supports ontology-ui components with proper import resolution
 *
 * POST /api/compile/astro
 * Body: { code: string, props?: Record<string, unknown> }
 * Response: { html: string } | { error: string, stack?: string }
 */
export const POST: APIRoute = async ({ request }) => {
	try {
		const { code, props = {} } = await request.json();

		if (!code || typeof code !== 'string') {
			return new Response(
				JSON.stringify({ error: 'Invalid code parameter' }),
				{ status: 400, headers: { 'Content-Type': 'application/json' } }
			);
		}

		// Compile Astro to HTML with ontology-ui support
		const html = await compileAstroToHTML(code, props);

		return new Response(
			JSON.stringify({ html }),
			{ status: 200, headers: { 'Content-Type': 'application/json' } }
		);
	} catch (error) {
		console.error('Compilation error:', error);

		return new Response(
			JSON.stringify({
				error: error instanceof Error ? error.message : 'Unknown compilation error',
				stack: error instanceof Error ? error.stack : undefined,
			}),
			{ status: 500, headers: { 'Content-Type': 'application/json' } }
		);
	}
};

/**
 * Compile Astro code to HTML with ontology-ui component support
 */
async function compileAstroToHTML(code: string, props: Record<string, unknown>): Promise<string> {
	// Extract frontmatter (code between --- delimiters)
	const frontmatterMatch = code.match(/^---\n([\s\S]*?)\n---/);
	let frontmatter = '';
	let template = code;

	if (frontmatterMatch) {
		frontmatter = frontmatterMatch[1];
		template = code.slice(frontmatterMatch[0].length);
	}

	// Detect ontology-ui component imports
	const ontologyImports = detectOntologyUIImports(frontmatter);

	// Generate mock component HTML for ontology-ui components
	let html = template;

	// Replace ontology-ui components with preview-safe HTML
	html = replaceOntologyUIComponents(html, ontologyImports);

	// Handle basic variable substitution
	Object.entries(props).forEach(([key, value]) => {
		const regex = new RegExp(`{${key}}`, 'g');
		html = html.replace(regex, String(value));
	});

	// Handle basic Astro expressions
	html = html.replace(/{([^}]+)}/g, (match, expr) => {
		try {
			// Evaluate simple expressions (UNSAFE - only for demo)
			// In production, use proper sandboxing
			const result = new Function(...Object.keys(props), `return ${expr}`)(...Object.values(props));
			return String(result);
		} catch {
			return match; // Keep original if evaluation fails
		}
	});

	// Wrap in complete HTML document with ontology-ui styles
	if (!html.includes('<!DOCTYPE') && !html.includes('<html')) {
		html = wrapWithDocument(html, ontologyImports);
	}

	return html;
}

/**
 * Detect ontology-ui component imports in frontmatter
 */
function detectOntologyUIImports(frontmatter: string): Set<string> {
	const imports = new Set<string>();
	const importRegex = /import\s+{([^}]+)}\s+from\s+['"]@\/components\/ontology-ui\/([^'"]+)['"]/g;

	let match;
	while ((match = importRegex.exec(frontmatter)) !== null) {
		const components = match[1].split(',').map(c => c.trim());
		components.forEach(comp => imports.add(comp));
	}

	return imports;
}

/**
 * Replace ontology-ui components with preview-safe HTML
 */
function replaceOntologyUIComponents(html: string, components: Set<string>): string {
	// Map of component names to preview HTML
	const componentPreviewMap: Record<string, (props: string) => string> = {
		ThingCard: (props) => `
			<div class="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow bg-card">
				<div class="flex items-start justify-between gap-2 mb-3">
					<div class="flex items-center gap-2">
						<span class="text-2xl">📦</span>
						<div>
							<h3 class="font-semibold text-lg">Thing Card</h3>
							<span class="text-xs bg-secondary px-2 py-0.5 rounded">Preview Mode</span>
						</div>
					</div>
				</div>
				<p class="text-sm text-muted-foreground mb-3">
					This component will display thing data from the ontology when connected to backend.
				</p>
				<div class="flex gap-1 flex-wrap">
					<span class="text-xs bg-secondary px-2 py-1 rounded">tag-1</span>
					<span class="text-xs bg-secondary px-2 py-1 rounded">tag-2</span>
				</div>
			</div>
		`,
		PersonCard: (props) => `
			<div class="flex items-center gap-3 p-3 rounded-lg border bg-card">
				<div class="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold">
					P
				</div>
				<div class="flex-1">
					<p class="font-medium">Person Card</p>
					<span class="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Preview Mode</span>
				</div>
			</div>
		`,
		EventCard: (props) => `
			<div class="flex gap-2 py-2 px-3 rounded border bg-card">
				<span class="text-lg">📅</span>
				<div class="flex-1">
					<p class="text-sm font-medium">Event Card</p>
					<p class="text-xs text-muted-foreground">Preview of event component</p>
				</div>
				<span class="text-xs text-muted-foreground">Just now</span>
			</div>
		`,
		TokenSwap: (props) => `
			<div class="border rounded-lg p-6 shadow-md bg-card max-w-md mx-auto">
				<div class="flex items-center justify-between mb-6">
					<h3 class="text-xl font-bold flex items-center gap-2">
						<span>🔄</span>
						Token Swap
					</h3>
					<span class="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">Preview Mode</span>
				</div>
				<div class="space-y-4">
					<div class="p-4 bg-secondary rounded-lg">
						<p class="text-xs text-muted-foreground mb-2">From</p>
						<div class="flex items-center justify-between">
							<span class="font-semibold">ETH</span>
							<span class="text-2xl">0.00</span>
						</div>
					</div>
					<div class="flex justify-center">
						<div class="bg-primary text-primary-foreground rounded-full p-2">⬇</div>
					</div>
					<div class="p-4 bg-secondary rounded-lg">
						<p class="text-xs text-muted-foreground mb-2">To</p>
						<div class="flex items-center justify-between">
							<span class="font-semibold">USDC</span>
							<span class="text-2xl">0.00</span>
						</div>
					</div>
					<button class="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity" disabled>
						Connect Wallet to Swap
					</button>
					<p class="text-xs text-center text-muted-foreground">
						⚠️ Requires wallet connection and backend integration
					</p>
				</div>
			</div>
		`,
		WalletConnect: (props) => `
			<button class="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
				<span>👛</span>
				<span class="font-semibold">Connect Wallet</span>
			</button>
		`,
		LiveActivityFeed: (props) => `
			<div class="border rounded-lg p-4 bg-card">
				<div class="flex items-center justify-between mb-4">
					<h3 class="font-semibold flex items-center gap-2">
						Live Activity
						<span class="text-xs bg-secondary px-2 py-0.5 rounded">3</span>
					</h3>
				</div>
				<div class="space-y-3">
					<div class="flex gap-2 items-start animate-pulse">
						<span>📝</span>
						<div class="flex-1">
							<p class="text-sm font-medium">Activity 1</p>
							<p class="text-xs text-muted-foreground">2 minutes ago</p>
						</div>
					</div>
					<div class="flex gap-2 items-start">
						<span>🔄</span>
						<div class="flex-1">
							<p class="text-sm font-medium">Activity 2</p>
							<p class="text-xs text-muted-foreground">1 hour ago</p>
						</div>
					</div>
					<div class="flex gap-2 items-start">
						<span>✅</span>
						<div class="flex-1">
							<p class="text-sm font-medium">Activity 3</p>
							<p class="text-xs text-muted-foreground">Yesterday</p>
						</div>
					</div>
				</div>
				<p class="text-xs text-center text-muted-foreground mt-4">
					⚠️ Live updates require backend connection
				</p>
			</div>
		`,
		ChatMessage: (props) => `
			<div class="flex gap-3 p-3 rounded-lg border bg-card max-w-lg">
				<div class="h-8 w-8 rounded-full bg-gradient-to-br from-green-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
					U
				</div>
				<div class="flex-1">
					<div class="flex items-center gap-2 mb-1">
						<span class="font-semibold text-sm">User</span>
						<span class="text-xs text-muted-foreground">Just now</span>
					</div>
					<p class="text-sm">This is a preview of a chat message component.</p>
				</div>
			</div>
		`,
		RichTextEditor: (props) => `
			<div class="border rounded-lg p-4 bg-card">
				<div class="flex gap-2 mb-3 pb-3 border-b">
					<button class="px-2 py-1 hover:bg-secondary rounded text-sm font-bold">B</button>
					<button class="px-2 py-1 hover:bg-secondary rounded text-sm italic">I</button>
					<button class="px-2 py-1 hover:bg-secondary rounded text-sm underline">U</button>
				</div>
				<div class="min-h-[120px] p-3 text-sm text-muted-foreground">
					Rich text editor preview...
				</div>
			</div>
		`,
		FileUploader: (props) => `
			<div class="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors bg-card">
				<div class="text-4xl mb-3">📎</div>
				<p class="font-semibold mb-1">Drop files here</p>
				<p class="text-xs text-muted-foreground">or click to browse</p>
			</div>
		`,
	};

	// Replace component tags with preview HTML
	components.forEach(componentName => {
		if (componentPreviewMap[componentName]) {
			// Match self-closing and regular component tags
			const selfClosingRegex = new RegExp(`<${componentName}\\s+([^/>]*?)\\s*/>`, 'g');
			const regularRegex = new RegExp(`<${componentName}\\s+([^>]*?)>([\\s\\S]*?)</${componentName}>`, 'g');

			html = html.replace(selfClosingRegex, (match, props) => {
				return componentPreviewMap[componentName](props || '');
			});

			html = html.replace(regularRegex, (match, props, children) => {
				return componentPreviewMap[componentName](props || '');
			});
		} else {
			// Generic fallback for unmapped components
			const genericRegex = new RegExp(`<${componentName}\\s+([^/>]*?)\\s*/>`, 'g');
			html = html.replace(genericRegex, `
				<div class="border border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
					<p class="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
						⚠️ ${componentName}
					</p>
					<p class="text-xs text-yellow-700 dark:text-yellow-300">
						This ontology-ui component requires backend integration to display properly.
					</p>
				</div>
			`);
		}
	});

	return html;
}

/**
 * Wrap HTML in complete document with styles and dependencies
 */
function wrapWithDocument(html: string, ontologyComponents: Set<string>): string {
	const hasInteractiveComponents = Array.from(ontologyComponents).some(comp =>
		['TokenSwap', 'WalletConnect', 'RichTextEditor', 'FileUploader'].includes(comp)
	);

	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Preview</title>
	<script src="https://cdn.tailwindcss.com"></script>
	<style>
		body {
			margin: 0;
			padding: 1rem;
			font-family: system-ui, -apple-system, sans-serif;
			background: hsl(0 0% 100%);
			color: hsl(222.2 84% 4.9%);
		}

		@media (prefers-color-scheme: dark) {
			body {
				background: hsl(222.2 84% 4.9%);
				color: hsl(210 40% 98%);
			}

			.bg-card { background: hsl(222.2 84% 4.9%); }
			.bg-secondary { background: hsl(217.2 32.6% 17.5%); }
			.text-muted-foreground { color: hsl(215 20.2% 65.1%); }
		}

		/* Tailwind CSS variables */
		.bg-card { background: hsl(0 0% 100%); }
		.bg-secondary { background: hsl(210 40% 96.1%); }
		.bg-primary { background: hsl(222.2 47.4% 11.2%); }
		.text-primary-foreground { color: hsl(210 40% 98%); }
		.text-muted-foreground { color: hsl(215.4 16.3% 46.9%); }
		.border { border-color: hsl(214.3 31.8% 91.4%); }

		/* Animation utilities */
		@keyframes pulse {
			0%, 100% { opacity: 1; }
			50% { opacity: 0.5; }
		}
		.animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }

		/* Component styles */
		.shadow-sm { box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
		.shadow-md { box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); }
		.transition-shadow { transition: box-shadow 150ms ease-in-out; }
		.transition-opacity { transition: opacity 150ms ease-in-out; }
		.transition-colors { transition: color 150ms ease-in-out, background-color 150ms ease-in-out, border-color 150ms ease-in-out; }

		button:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}

		button:not(:disabled):hover {
			opacity: 0.9;
		}
	</style>
</head>
<body>
${html}
${hasInteractiveComponents ? `
<script>
	// Console interception for preview
	const originalConsole = {
		log: console.log,
		warn: console.warn,
		error: console.error,
	};

	['log', 'warn', 'error'].forEach(level => {
		console[level] = (...args) => {
			originalConsole[level](...args);
			window.parent.postMessage({
				type: 'console',
				level,
				message: args.join(' '),
			}, '*');
		};
	});

	// Error handling
	window.addEventListener('error', (event) => {
		window.parent.postMessage({
			type: 'console',
			level: 'error',
			message: event.message + ' at ' + event.filename + ':' + event.lineno,
		}, '*');
	});

	// Mock wallet connection
	document.addEventListener('click', (e) => {
		const target = e.target;
		if (target.textContent?.includes('Connect Wallet')) {
			alert('Wallet connection requires Web3 provider. This is a preview environment.');
		}
	});
</script>
` : ''}
</body>
</html>`;
}
