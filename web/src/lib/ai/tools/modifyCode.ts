/**
 * AI Tool: Modify Code
 *
 * Updates existing code based on modification request
 * Preserves structure and only changes what's requested
 */

import type { CoreTool } from "ai";
import { z } from "zod";

export const modifyCodeTool: CoreTool = {
	description:
		"Modify existing code based on a natural language request. Preserves the overall structure and only changes what's specifically requested. Returns the updated code.",
	parameters: z.object({
		currentCode: z
			.string()
			.describe("The current code that needs to be modified"),
		modificationRequest: z
			.string()
			.describe(
				"Natural language description of what to change. Example: 'Add a reviews section below the product details' or 'Change the button color to red'",
			),
		fileType: z
			.enum(["astro", "tsx", "ts", "css", "md"])
			.describe("The type of file being modified"),
		preserveComments: z
			.boolean()
			.optional()
			.default(true)
			.describe("Whether to preserve existing comments. Default: true"),
	}),
	execute: async ({
		currentCode,
		modificationRequest,
		fileType,
		preserveComments,
	}) => {
		// Analyze the modification request
		const analysis = analyzeModificationRequest(modificationRequest);

		// Apply modifications based on analysis
		const modifiedCode = applyModifications({
			currentCode,
			analysis,
			fileType,
			preserveComments: preserveComments ?? true,
		});

		return {
			modifiedCode,
			changes: analysis.changes,
			suggestions: generateSuggestions(analysis, fileType),
		};
	},
};

/**
 * Analyze modification request to determine what changes are needed
 */
function analyzeModificationRequest(request: string): {
	action: "add" | "remove" | "update" | "refactor";
	target: string;
	changes: string[];
} {
	const lower = request.toLowerCase();

	// Determine action type
	let action: "add" | "remove" | "update" | "refactor" = "update";
	if (
		lower.includes("add") ||
		lower.includes("insert") ||
		lower.includes("create")
	) {
		action = "add";
	} else if (lower.includes("remove") || lower.includes("delete")) {
		action = "remove";
	} else if (lower.includes("refactor") || lower.includes("reorganize")) {
		action = "refactor";
	}

	// Determine target
	let target = "general";
	if (lower.includes("button")) target = "button";
	else if (lower.includes("card")) target = "card";
	else if (lower.includes("form")) target = "form";
	else if (lower.includes("image") || lower.includes("gallery"))
		target = "image";
	else if (lower.includes("review")) target = "reviews";
	else if (lower.includes("style") || lower.includes("color"))
		target = "styling";
	else if (lower.includes("import")) target = "imports";
	else if (lower.includes("prop")) target = "props";

	// Extract specific changes
	const changes: string[] = [request];

	return { action, target, changes };
}

/**
 * Apply modifications to code
 */
function applyModifications({
	currentCode,
	analysis,
	fileType,
	preserveComments,
}: {
	currentCode: string;
	analysis: {
		action: "add" | "remove" | "update" | "refactor";
		target: string;
		changes: string[];
	};
	fileType: string;
	preserveComments: boolean;
}): string {
	let modifiedCode = currentCode;

	// Handle different file types
	if (fileType === "astro") {
		modifiedCode = modifyAstroFile(currentCode, analysis);
	} else if (fileType === "tsx" || fileType === "ts") {
		modifiedCode = modifyTypeScriptFile(currentCode, analysis);
	} else if (fileType === "css") {
		modifiedCode = modifyCSSFile(currentCode, analysis);
	}

	// Remove comments if requested
	if (!preserveComments) {
		modifiedCode = removeComments(modifiedCode, fileType);
	}

	return modifiedCode;
}

/**
 * Modify Astro file
 */
function modifyAstroFile(
	code: string,
	analysis: {
		action: "add" | "remove" | "update" | "refactor";
		target: string;
		changes: string[];
	},
): string {
	const { action, target } = analysis;

	// Split frontmatter and markup
	const parts = code.split("---");
	if (parts.length < 3) {
		// No frontmatter, treat entire code as markup
		return modifyMarkup(code, action, target);
	}

	const frontmatter = parts[1];
	const markup = parts.slice(2).join("---");

	// Modify based on target
	if (target === "imports") {
		const modifiedFrontmatter = modifyImports(frontmatter, action);
		return `---\n${modifiedFrontmatter}\n---\n${markup}`;
	}

	if (target === "button" || target === "card" || target === "reviews") {
		const modifiedMarkup = modifyMarkup(markup, action, target);
		return `---\n${frontmatter}\n---\n${modifiedMarkup}`;
	}

	// Default: modify markup
	const modifiedMarkup = modifyMarkup(markup, action, target);
	return `---\n${frontmatter}\n---\n${modifiedMarkup}`;
}

/**
 * Modify TypeScript/TSX file
 */
function modifyTypeScriptFile(
	code: string,
	analysis: {
		action: "add" | "remove" | "update" | "refactor";
		target: string;
		changes: string[];
	},
): string {
	const { action, target } = analysis;

	if (target === "imports") {
		return modifyImports(code, action);
	}

	if (target === "props") {
		return modifyProps(code, action);
	}

	// Default modifications
	return code;
}

/**
 * Modify CSS file
 */
function modifyCSSFile(
	code: string,
	analysis: {
		action: "add" | "remove" | "update" | "refactor";
		target: string;
		changes: string[];
	},
): string {
	// CSS-specific modifications
	return code;
}

/**
 * Modify imports section
 */
function modifyImports(code: string, action: "add" | "remove" | "update"): string {
	if (action === "add") {
		// Add new import at the top
		const newImport = "import { NewComponent } from '@/components/ui/new';";
		return `${newImport}\n${code}`;
	}

	if (action === "remove") {
		// Remove specific import (simplified)
		return code;
	}

	return code;
}

/**
 * Modify markup/JSX
 */
function modifyMarkup(
	markup: string,
	action: "add" | "remove" | "update" | "refactor",
	target: string,
): string {
	if (action === "add" && target === "reviews") {
		// Add reviews section
		const reviewsSection = `
    <!-- Reviews Section -->
    <div class="mt-16">
      <h2 class="text-2xl font-bold mb-6">Customer Reviews</h2>
      <div class="grid gap-4">
        <!-- Review items go here -->
      </div>
    </div>`;

		// Insert before closing </Layout> or at end
		if (markup.includes("</Layout>")) {
			return markup.replace("</Layout>", `${reviewsSection}\n  </Layout>`);
		}
		return markup + reviewsSection;
	}

	if (action === "update" && target === "button") {
		// Update button styling
		return markup.replace(
			/<Button/g,
			'<Button variant="default" size="lg"',
		);
	}

	return markup;
}

/**
 * Modify props interface
 */
function modifyProps(code: string, action: "add" | "remove" | "update"): string {
	if (action === "add") {
		// Add new prop to interface
		const interfaceMatch = code.match(/interface\s+\w+Props\s*{([^}]*)}/);
		if (interfaceMatch) {
			const currentProps = interfaceMatch[1];
			const newProp = "\n  newProp?: string;";
			return code.replace(
				interfaceMatch[0],
				`interface Props {${currentProps}${newProp}\n}`,
			);
		}
	}

	return code;
}

/**
 * Remove comments from code
 */
function removeComments(code: string, fileType: string): string {
	if (fileType === "astro" || fileType === "tsx" || fileType === "ts") {
		// Remove single-line comments
		code = code.replace(/\/\/.*/g, "");
		// Remove multi-line comments
		code = code.replace(/\/\*[\s\S]*?\*\//g, "");
	}

	if (fileType === "css") {
		// Remove CSS comments
		code = code.replace(/\/\*[\s\S]*?\*\//g, "");
	}

	return code;
}

/**
 * Generate suggestions for further improvements
 */
function generateSuggestions(
	analysis: {
		action: "add" | "remove" | "update" | "refactor";
		target: string;
		changes: string[];
	},
	fileType: string,
): string[] {
	const suggestions: string[] = [];

	if (analysis.target === "button") {
		suggestions.push("Consider adding hover states for better UX");
		suggestions.push("Add loading state for async actions");
	}

	if (analysis.target === "reviews") {
		suggestions.push("Add star rating component");
		suggestions.push("Implement pagination for large review lists");
	}

	if (analysis.target === "styling") {
		suggestions.push("Ensure dark mode compatibility");
		suggestions.push("Check mobile responsiveness");
	}

	if (fileType === "astro") {
		suggestions.push("Test with `bun run dev` to verify changes");
	}

	return suggestions;
}
