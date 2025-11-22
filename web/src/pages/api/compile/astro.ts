import type { APIRoute } from 'astro';

/**
 * Astro Compilation API
 *
 * Compiles Astro code server-side and returns HTML for preview
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

		// For now, we'll use a simple HTML transformation approach
		// In production, you'd integrate with Astro's compiler API
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
 * Compile Astro code to HTML
 *
 * This is a simplified compiler for demo purposes.
 * In production, use @astrojs/compiler or Vite's dev server
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

	// Simple variable substitution for demo
	// In production, use actual Astro compiler
	let html = template;

	// Replace {variable} with values from props
	Object.entries(props).forEach(([key, value]) => {
		const regex = new RegExp(`{${key}}`, 'g');
		html = html.replace(regex, String(value));
	});

	// Handle basic Astro expressions
	// This is a very simplified version - real Astro has full JS support
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

	// Wrap in HTML document if not already complete
	if (!html.includes('<!DOCTYPE') && !html.includes('<html')) {
		html = `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Preview</title>
	<script src="https://cdn.tailwindcss.com"></script>
	<style>
		body { margin: 0; padding: 1rem; font-family: system-ui, sans-serif; }
	</style>
</head>
<body>
${html}
</body>
</html>`;
	}

	return html;
}
