'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Copy, CheckCircle } from 'lucide-react';

interface WalkthroughStep {
  id: number;
  title: string;
  description: string;
  file: string;
  codeBlock: string;
  explanation: string;
  timeEstimate: string;
}

const steps: WalkthroughStep[] = [
  {
    id: 1,
    title: 'Start Development Server',
    description: 'Launch the local development environment',
    file: 'terminal',
    codeBlock: `bun install
bun run dev`,
    explanation:
      'Your site will be available at http://localhost:4321. The dev server watches for file changes and hot-reloads automatically.',
    timeEstimate: '1 min',
  },
  {
    id: 2,
    title: 'Create Your First Thing (Entity)',
    description: 'Add product data to your content collection',
    file: 'src/content/products/first-product.md',
    codeBlock: `---
title: My First Product
description: A simple product demonstration
price: 29.99
category: software
status: active
---

# My First Product

This product demonstrates the **Things** dimension.

- **Type:** product
- **Properties:** price, category, status
- **Scoped to:** Your group (automatically)`,
    explanation:
      'Content collections provide type-safe, frontmatter-based data. Markdown files are automatically converted to TypeScript types via Zod schemas.',
    timeEstimate: '2 min',
  },
  {
    id: 3,
    title: 'Display with Components',
    description: 'Render your things using shadcn/ui components',
    file: 'src/pages/products.astro',
    codeBlock: `---
import Layout from '../layouts/Layout.astro';
import { getCollection } from 'astro:content';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Type-safe, fully typed
const products = await getCollection('products');
---

<Layout title="Products">
  <div class="container mx-auto py-12">
    <h1 class="text-4xl font-bold mb-8">Products</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      {products.map((product) => (
        <Card key={product.id}>
          <CardHeader>
            <CardTitle>{product.data.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-muted-foreground mb-4">
              {product.data.description}
            </p>
            <div class="flex items-center justify-between">
              <span class="text-2xl font-bold">
                \${product.data.price}
              </span>
              <Button>Buy Now</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
</Layout>`,
    explanation:
      'Astro uses file-based routing and server-side rendering. The page is 100% static HTML by default - no JavaScript needed unless you add interactive components with client:load.',
    timeEstimate: '3 min',
  },
  {
    id: 4,
    title: 'Understand Things',
    description: 'Learn the Things dimension of the ontology',
    file: 'understanding-things.ts',
    codeBlock: `// Every Thing is an entity with:
interface Thing {
  _id: string;              // Unique ID
  groupId: string;          // Who owns this (multi-tenant)
  type: "product";          // Entity type (66+ types available)
  name: string;             // Display name

  // Type-specific data (flexible)
  properties: {
    price?: number;
    category?: string;
    inventory?: number;
    // ... any properties you need
  };

  status: "draft" | "active" | "archived";
  createdAt: number;        // Timestamps
  updatedAt: number;
}

// Use in any collection:
// src/content/products/ → Things of type "product"
// src/content/courses/ → Things of type "course"
// src/content/users/ → Things of type "user"
// src/content/agents/ → Things of type "ai_clone"`,
    explanation:
      'Things are the fundamental entities in the 6-dimension ontology. They map to real-world concepts (products, users, agents) and scale from friend circles to enterprises.',
    timeEstimate: '2 min',
  },
  {
    id: 5,
    title: 'Add Connections',
    description: 'Model relationships between Things',
    file: 'understanding-connections.ts',
    codeBlock: `// Connections link Things with metadata
interface Connection {
  fromThingId: string;      // Source (e.g., customer)
  toThingId: string;        // Target (e.g., product)

  // Type of relationship
  relationshipType:
    | "owns"
    | "purchased"
    | "enrolled_in"
    | "follows"
    | "manages"
    | "holds_tokens"
    | // ... 20+ relationship types

  // Relationship-specific data
  metadata: {
    purchaseDate?: number;
    balance?: number;
    expiry?: number;
  };

  validFrom: number;        // Temporal validity
  validTo?: number;
}

// Example: When someone buys a product, create a connection
// fromThingId: customer_123
// toThingId: product_456
// relationshipType: "holds_tokens"
// metadata: { balance: 1, purchaseDate: now }`,
    explanation:
      'Connections represent relationships between entities. Every purchase, enrollment, follow, or ownership is a Connection with rich metadata for context.',
    timeEstimate: '2 min',
  },
];

export function QuickWalkthrough() {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([1]));
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const toggleStep = (stepId: number) => {
    const newSet = new Set(expandedSteps);
    if (newSet.has(stepId)) {
      newSet.delete(stepId);
    } else {
      newSet.add(stepId);
    }
    setExpandedSteps(newSet);
  };

  const copyCode = (code: string, stepId: number) => {
    navigator.clipboard.writeText(code);
    setCopiedStep(stepId);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">5-Minute Walkthrough</h2>
          <p className="text-muted-foreground">
            Follow these steps to build your first ONE application
          </p>
        </div>
        <Badge variant="outline">~10 min</Badge>
      </div>

      <div className="space-y-3">
        {steps.map((step, idx) => {
          const isExpanded = expandedSteps.has(step.id);

          return (
            <Card
              key={step.id}
              className={`cursor-pointer transition-all ${
                isExpanded ? 'ring-2 ring-primary' : ''
              }`}
            >
              <div
                className="p-4 flex items-start justify-between hover:bg-muted/50 transition"
                onClick={() => toggleStep(step.id)}
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Step Number */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {step.id}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                    {!isExpanded && (
                      <div className="text-xs text-muted-foreground mt-2">
                        {step.file}
                      </div>
                    )}
                  </div>
                </div>

                {/* Toggle Button */}
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  <Badge variant="secondary" className="text-xs">
                    {step.timeEstimate}
                  </Badge>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t px-4 py-4 space-y-4 bg-muted/30">
                  {/* File Path */}
                  <div className="text-xs font-mono text-muted-foreground bg-black/5 dark:bg-white/5 rounded px-3 py-1 inline-block">
                    {step.file}
                  </div>

                  {/* Code Block */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-muted-foreground">
                        CODE
                      </label>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyCode(step.codeBlock, step.id);
                        }}
                      >
                        {copiedStep === step.id ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <pre className="bg-black dark:bg-slate-950 text-white rounded-lg p-4 overflow-x-auto text-xs">
                      <code>{step.codeBlock}</code>
                    </pre>
                  </div>

                  {/* Explanation */}
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>Why this works:</strong> {step.explanation}
                    </p>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Progress Note */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-900 dark:text-green-100">
              After these 5 steps, you'll have a fully functional application with type-safe
              content, beautiful components, and the ontology foundation to scale to enterprise
              complexity.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
