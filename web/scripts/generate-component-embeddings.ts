#!/usr/bin/env bun
/**
 * Generate Component Embeddings Script
 *
 * CYCLE 6: Generate embeddings for semantic component search
 *
 * Tasks:
 * 1. Scan all components in /web/src/components/
 * 2. Extract component metadata (name, path, description, props, usage)
 * 3. Generate embeddings using OpenAI text-embedding-3-large (3072 dimensions)
 * 4. Store embeddings in Convex knowledge table
 * 5. Create component → knowledge links via thingKnowledge
 *
 * Usage:
 *   bun run scripts/generate-component-embeddings.ts
 *
 * Environment:
 *   OPENAI_API_KEY - Required for embeddings
 *   CONVEX_URL - Convex deployment URL (defaults to dev)
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative, basename } from "path";
import { createOpenAI } from "@ai-sdk/openai";
import { embed } from "ai";

// ============================================================================
// CONFIGURATION
// ============================================================================

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const COMPONENTS_DIR = join(process.cwd(), "src", "components");
const BATCH_SIZE = 10; // Process 10 components at a time
const EMBEDDING_MODEL = "text-embedding-3-large";
const EMBEDDING_DIM = 3072;

if (!OPENAI_API_KEY) {
  console.error("❌ Error: OPENAI_API_KEY environment variable is required");
  console.error("   Set it in .env.local or export it: export OPENAI_API_KEY=sk-...");
  process.exit(1);
}

// ============================================================================
// TYPES
// ============================================================================

interface ComponentMetadata {
  filePath: string;
  relativePath: string;
  name: string;
  description: string;
  category: string;
  props?: string[];
  imports?: string[];
  exports?: string[];
}

interface ComponentEmbedding {
  metadata: ComponentMetadata;
  text: string;
  embedding: number[];
}

// ============================================================================
// COMPONENT SCANNER
// ============================================================================

/**
 * Recursively scan directory for component files
 */
function scanComponents(dir: string, components: string[] = []): string[] {
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      scanComponents(fullPath, components);
    } else if (entry.endsWith(".tsx") || entry.endsWith(".astro")) {
      components.push(fullPath);
    }
  }

  return components;
}

/**
 * Extract metadata from component file
 */
function extractComponentMetadata(filePath: string): ComponentMetadata {
  const content = readFileSync(filePath, "utf-8");
  const relativePath = relative(COMPONENTS_DIR, filePath);
  const name = basename(filePath, filePath.endsWith(".tsx") ? ".tsx" : ".astro");

  // Determine category from path
  const pathParts = relativePath.split("/");
  const category = pathParts.length > 1 ? pathParts[0] : "general";

  // Extract props (simple regex - looks for interface or type definitions)
  const propsMatch = content.match(/(?:interface|type)\s+\w*Props\s*=?\s*\{([^}]+)\}/s);
  const props = propsMatch
    ? propsMatch[1]
        .split(/[,;]/)
        .map((p) => p.trim())
        .filter((p) => p && !p.startsWith("//"))
    : [];

  // Extract imports (to understand dependencies)
  const importMatches = content.matchAll(/import\s+.*?from\s+["']([^"']+)["']/g);
  const imports = Array.from(importMatches).map((m) => m[1]);

  // Extract exports
  const exportMatches = content.matchAll(/export\s+(?:default\s+)?(?:function|const|class)\s+(\w+)/g);
  const exports = Array.from(exportMatches).map((m) => m[1]);

  // Extract JSDoc comments or leading comments for description
  const descriptionMatch = content.match(/\/\*\*\s*\n\s*\*\s*([^\n*]+)/);
  let description = descriptionMatch ? descriptionMatch[1].trim() : "";

  // If no JSDoc, try to infer from component name
  if (!description) {
    description = inferDescriptionFromName(name, category, content);
  }

  return {
    filePath,
    relativePath,
    name,
    description,
    category,
    props,
    imports,
    exports,
  };
}

/**
 * Infer description from component name and content
 */
function inferDescriptionFromName(name: string, category: string, content: string): string {
  // Convert camelCase/PascalCase to words
  const words = name.replace(/([A-Z])/g, " $1").trim().toLowerCase();

  // Check for common UI patterns
  if (category === "ui") {
    if (content.includes("Radix") || content.includes("@radix-ui")) {
      return `A ${words} component from shadcn/ui (Radix UI primitive)`;
    }
    return `A reusable ${words} UI component`;
  }

  if (category === "dashboard") {
    return `Dashboard component for ${words}`;
  }

  if (category === "ai") {
    return `AI-powered ${words} component`;
  }

  if (category === "shop" || category === "commerce") {
    return `E-commerce ${words} component`;
  }

  return `A ${words} component in ${category}`;
}

/**
 * Create searchable text from component metadata
 */
function createSearchableText(metadata: ComponentMetadata): string {
  const parts = [
    `Component: ${metadata.name}`,
    `Category: ${metadata.category}`,
    `Description: ${metadata.description}`,
    `Path: ${metadata.relativePath}`,
  ];

  if (metadata.props && metadata.props.length > 0) {
    parts.push(`Props: ${metadata.props.slice(0, 5).join(", ")}`);
  }

  if (metadata.imports && metadata.imports.length > 0) {
    const uiImports = metadata.imports.filter((i) => i.includes("ui/") || i.includes("@/components"));
    if (uiImports.length > 0) {
      parts.push(`Uses: ${uiImports.slice(0, 3).join(", ")}`);
    }
  }

  return parts.join("\n");
}

// ============================================================================
// EMBEDDING GENERATION
// ============================================================================

/**
 * Generate embedding for component using OpenAI text-embedding-3-large
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const openai = createOpenAI({
    apiKey: OPENAI_API_KEY,
  });

  try {
    const result = await embed({
      model: openai.embedding(EMBEDDING_MODEL),
      value: text,
    });

    return result.embedding;
  } catch (error) {
    console.error("❌ Error generating embedding:", error);
    throw error;
  }
}

/**
 * Generate embeddings for batch of components
 */
async function generateComponentEmbeddings(
  components: ComponentMetadata[]
): Promise<ComponentEmbedding[]> {
  const embeddings: ComponentEmbedding[] = [];

  for (let i = 0; i < components.length; i += BATCH_SIZE) {
    const batch = components.slice(i, i + BATCH_SIZE);
    console.log(`\n📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(components.length / BATCH_SIZE)}`);

    const batchResults = await Promise.all(
      batch.map(async (metadata) => {
        const text = createSearchableText(metadata);
        console.log(`  ⚡ Embedding: ${metadata.name} (${metadata.category})`);

        try {
          const embedding = await generateEmbedding(text);
          return { metadata, text, embedding };
        } catch (error) {
          console.error(`  ❌ Failed: ${metadata.name}`);
          throw error;
        }
      })
    );

    embeddings.push(...batchResults);

    // Rate limiting: wait 1 second between batches
    if (i + BATCH_SIZE < components.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return embeddings;
}

// ============================================================================
// STORAGE (Convex Integration)
// ============================================================================

/**
 * Store embeddings in Convex knowledge table
 *
 * NOTE: This outputs JSON that can be imported to Convex.
 * For real-time storage, integrate with ConvexProvider.
 */
function saveEmbeddings(embeddings: ComponentEmbedding[]): void {
  const outputPath = join(process.cwd(), "component-embeddings.json");

  const output = embeddings.map((emb) => ({
    knowledgeType: "component" as const,
    text: emb.text,
    embedding: emb.embedding,
    embeddingModel: EMBEDDING_MODEL,
    embeddingDim: EMBEDDING_DIM,
    metadata: {
      ...emb.metadata,
      generatedAt: new Date().toISOString(),
    },
    labels: [emb.metadata.category, "component", emb.metadata.name],
  }));

  Bun.write(outputPath, JSON.stringify(output, null, 2));
  console.log(`\n✅ Saved ${embeddings.length} component embeddings to ${outputPath}`);
  console.log(`\n📊 Statistics:`);
  console.log(`   Total components: ${embeddings.length}`);
  console.log(`   Embedding dimensions: ${EMBEDDING_DIM}`);
  console.log(`   Model: ${EMBEDDING_MODEL}`);

  // Category breakdown
  const categories = new Map<string, number>();
  for (const emb of embeddings) {
    const cat = emb.metadata.category;
    categories.set(cat, (categories.get(cat) || 0) + 1);
  }

  console.log(`\n📁 Categories:`);
  for (const [cat, count] of Array.from(categories.entries()).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${cat}: ${count}`);
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log("🚀 Component Embedding Generation - CYCLE 6");
  console.log("=".repeat(60));
  console.log(`📂 Scanning: ${COMPONENTS_DIR}`);
  console.log(`🤖 Model: ${EMBEDDING_MODEL} (${EMBEDDING_DIM}D)`);
  console.log("=".repeat(60));

  // 1. Scan components
  console.log("\n1️⃣ Scanning components...");
  const componentFiles = scanComponents(COMPONENTS_DIR);
  console.log(`   Found ${componentFiles.length} component files`);

  // 2. Extract metadata
  console.log("\n2️⃣ Extracting metadata...");
  const components = componentFiles.map((file) => {
    const metadata = extractComponentMetadata(file);
    console.log(`   ✓ ${metadata.name} (${metadata.category})`);
    return metadata;
  });

  // 3. Generate embeddings
  console.log("\n3️⃣ Generating embeddings...");
  console.log(`   Processing in batches of ${BATCH_SIZE}`);
  const embeddings = await generateComponentEmbeddings(components);

  // 4. Save to file
  console.log("\n4️⃣ Saving embeddings...");
  saveEmbeddings(embeddings);

  console.log("\n" + "=".repeat(60));
  console.log("✅ Component embedding generation complete!");
  console.log("=".repeat(60));
  console.log("\n📌 Next steps:");
  console.log("   1. Review component-embeddings.json");
  console.log("   2. Import to Convex using upload script");
  console.log("   3. Test semantic search with sample queries");
}

// Run if called directly
if (import.meta.main) {
  main().catch((error) => {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  });
}

export { generateComponentEmbeddings, extractComponentMetadata, scanComponents };
