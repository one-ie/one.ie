# Auto-Generated Ontology Types

This directory contains TypeScript type definitions automatically generated from composed ontologies.

## Overview

The ONE Platform uses a **multi-ontology architecture** where features (blog, courses, portfolio, etc.) compose together to create a custom ontology for each installation. This system automatically generates TypeScript types based on which features are enabled.

## Generated File

- **`ontology.ts`** - Auto-generated TypeScript types (DO NOT EDIT MANUALLY)

## Usage

### 1. Generate Types

Generate types based on enabled features:

```bash
# Using environment variable
PUBLIC_FEATURES="blog,portfolio" bun run generate-types

# Using command line argument
bun run generate-types blog,courses,community

# Core only (minimal)
bun run generate-types core
```

### 2. Import Types in Convex Functions

```typescript
import { ThingType, ConnectionType, EventType } from './types/ontology';

// Use in Convex function signatures
export const createEntity = mutation({
  args: {
    type: v.string() as ThingType,
    name: v.string(),
    properties: v.any(),
  },
  handler: async (ctx, args) => {
    // Validate type at runtime
    if (!isThingType(args.type)) {
      throw new Error(`Invalid thing type: ${args.type}`);
    }

    // Type-safe operations
    await ctx.db.insert('entities', {
      type: args.type,
      name: args.name,
      properties: args.properties,
      // ...
    });
  },
});
```

### 3. Runtime Validation

```typescript
import {
  isThingType,
  isConnectionType,
  isEventType,
  THING_TYPES,
  CONNECTION_TYPES,
  EVENT_TYPES
} from './types/ontology';

// Type guard
if (isThingType(userInput)) {
  // TypeScript knows this is a valid ThingType
  console.log('Valid thing type:', userInput);
}

// Iterate over all types
for (const type of THING_TYPES) {
  console.log('Available thing type:', type);
}

// Check metadata
import { ONTOLOGY_METADATA } from './types/ontology';
console.log('Enabled features:', ONTOLOGY_METADATA.features);
console.log('Generated at:', ONTOLOGY_METADATA.generatedAt);
```

### 4. Type Guards

```typescript
import { isValidOntologyType, getTypesForDimension } from './types/ontology';

// Generic validation
const isValid = isValidOntologyType('thing', someString);

// Get all types for a dimension
const thingTypes = getTypesForDimension('thing');
const connectionTypes = getTypesForDimension('connection');
const eventTypes = getTypesForDimension('event');
```

## Available Ontology Features

Available features (defined in `/one/knowledge/ontology-*.yaml`):

- **core** - Always included (page, user, file, link, note)
- **blog** - Blog posts and categories
- **portfolio** - Projects and case studies
- **courses** - Courses, lessons, quizzes, certificates
- **community** - Forums, topics, replies, direct messages
- **tokens** - Token holders and balances

## Ontology Composition

Features can extend other features and compose together:

```yaml
# ontology-blog.yaml
feature: blog
extends: core
description: Blog and content publishing

thingTypes:
  - name: blog_post
    properties:
      title: string
      content: string
      publishedAt: number
```

The type generator:
1. Resolves dependencies (e.g., blog extends core)
2. Loads all feature YAML files
3. Merges types from all features
4. Generates TypeScript union types
5. Creates validation functions and constants

## Regeneration

Types should be regenerated whenever:

1. Features change (`PUBLIC_FEATURES` environment variable)
2. Ontology YAML files are modified
3. New features are added
4. Deployment to new environment

### Automatic Regeneration

Add to your build pipeline:

```json
{
  "scripts": {
    "build": "bun run generate-types && convex deploy"
  }
}
```

### Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Regenerate types if ontology files changed
if git diff --cached --name-only | grep -q "ontology-.*\.yaml"; then
  echo "Ontology files changed, regenerating types..."
  cd backend && bun run generate-types
  git add backend/convex/types/ontology.ts
fi
```

## File Structure

```
backend/
├── convex/
│   ├── lib/
│   │   ├── ontology-loader.ts    # Loads and composes ontology YAML files
│   │   ├── type-generator.ts     # Generates TypeScript from composed ontology
│   │   └── ontology-validator.ts # Validates ontology structure
│   ├── types/
│   │   ├── ontology.ts           # AUTO-GENERATED - DO NOT EDIT
│   │   └── README.md             # This file
│   └── ...
├── scripts/
│   └── generate-ontology-types.ts # CLI script for type generation
└── package.json
```

## Example Generated Types

### For `blog,portfolio` features:

```typescript
export type ThingType =
  | 'page'
  | 'user'
  | 'file'
  | 'link'
  | 'note'           // from core
  | 'blog_post'
  | 'blog_category'  // from blog
  | 'project'
  | 'case_study';    // from portfolio

export type ConnectionType =
  | 'created_by'
  | 'updated_by'
  | 'viewed_by'
  | 'favorited_by'          // from core
  | 'posted_in'             // from blog
  | 'belongs_to_portfolio'; // from portfolio

export type EventType =
  | 'thing_created'
  | 'thing_updated'
  | 'thing_deleted'
  | 'thing_viewed'         // from core
  | 'blog_post_published'
  | 'blog_post_viewed'     // from blog
  | 'project_viewed';      // from portfolio
```

## Benefits

1. **Type Safety** - Compile-time checking for ontology types
2. **Runtime Validation** - Type guards for user input validation
3. **Auto-completion** - IDE support for valid types
4. **Documentation** - Self-documenting with JSDoc comments
5. **Feature Composition** - Types adapt to enabled features
6. **Single Source of Truth** - Generated from YAML ontology specs

## Troubleshooting

### Error: Ontology file not found

Ensure the feature name matches a file in `/one/knowledge/`:

```
/one/knowledge/ontology-{feature}.yaml
```

### Error: Circular dependency detected

Check that features don't have circular `extends` or `dependencies` chains.

### Error: The service was stopped

Use `bun` instead of `tsx` or `node`:

```bash
bun run generate-types
```

### Types out of sync

Regenerate types after any ontology changes:

```bash
bun run generate-types
```

---

**Generated by:** `backend/scripts/generate-ontology-types.ts`
**Architecture:** Multi-Ontology Architecture v1.0
**Documentation:** See `one/things/plans/multi-ontology-architecture.md`
