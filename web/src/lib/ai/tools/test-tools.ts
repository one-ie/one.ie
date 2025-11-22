/**
 * Test AI Code Generation Tools
 *
 * Simple test file to verify tools work correctly
 */

import {
	generateAstroPageTool,
	modifyCodeTool,
	searchComponentsTool,
} from "./index";

async function testGenerateAstroPage() {
	console.log("Testing generateAstroPage...");

	const result = await generateAstroPageTool.execute({
		description:
			"Create a product landing page for selling coffee mugs with image gallery and reviews",
		route: "/products/coffee-mug",
		pageType: "product",
		features: ["product-gallery", "reviews"],
		groupScoped: true,
	});

	console.log("✓ Generated page:");
	console.log("  Route:", result.route);
	console.log("  File path:", result.filePath);
	console.log("  Components used:", result.components);
	console.log("  Code length:", result.code.length, "characters");
	console.log("");
}

async function testModifyCode() {
	console.log("Testing modifyCode...");

	const originalCode = `---
import Layout from '@/layouts/Layout.astro';
import { Button } from '@/components/ui/button';

const title = "Product Page";
---

<Layout title={title}>
  <div class="container">
    <h1>{title}</h1>
    <Button>Buy Now</Button>
  </div>
</Layout>`;

	const result = await modifyCodeTool.execute({
		currentCode: originalCode,
		modificationRequest:
			"Add a reviews section below the button with a heading and placeholder text",
		fileType: "astro",
		preserveComments: true,
	});

	console.log("✓ Modified code:");
	console.log("  Changes:", result.changes);
	console.log("  Suggestions:", result.suggestions);
	console.log("  Modified code length:", result.modifiedCode.length, "characters");
	console.log("");
}

async function testSearchComponents() {
	console.log("Testing searchComponents...");

	const result = await searchComponentsTool.execute({
		description: "button with variants and sizes",
		category: "ui",
		includeExamples: true,
	});

	console.log("✓ Search results:");
	console.log("  Found", result.count, "components");
	console.log("  Components:", result.components.map((c) => c.name).join(", "));
	console.log("  Suggestions:", result.suggestions);
	console.log("");
}

async function runAllTests() {
	console.log("=".repeat(50));
	console.log("AI Code Generation Tools - Test Suite");
	console.log("=".repeat(50));
	console.log("");

	try {
		await testGenerateAstroPage();
		await testModifyCode();
		await testSearchComponents();

		console.log("=".repeat(50));
		console.log("✓ All tests passed!");
		console.log("=".repeat(50));
	} catch (error) {
		console.error("✗ Test failed:", error);
		process.exit(1);
	}
}

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
	runAllTests();
}

export { testGenerateAstroPage, testModifyCode, testSearchComponents };
