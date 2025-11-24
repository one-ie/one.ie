# Example Generated Output

This file shows what the type generator produces for different feature combinations.

## Example 1: Core Only (Minimal)

```bash
bun run generate-types core
```

### Generated Types

```typescript
export type ThingType = 'page' | 'user' | 'file' | 'link' | 'note';

export type ConnectionType = 'created_by' | 'updated_by' | 'viewed_by' | 'favorited_by';

export type EventType = 'thing_created' | 'thing_updated' | 'thing_deleted' | 'thing_viewed';

export const ENABLED_FEATURES = ["core"] as const;
```

**Stats:**
- Thing Types: 5
- Connection Types: 4
- Event Types: 4

---

## Example 2: Blog + Portfolio (Content Creator)

```bash
bun run generate-types blog,portfolio
```

### Generated Types

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

export const ENABLED_FEATURES = ["core","blog","portfolio"] as const;
```

**Stats:**
- Thing Types: 9
- Connection Types: 6
- Event Types: 7

---

## Example 3: Education Platform (Courses + Blog)

```bash
bun run generate-types blog,courses
```

### Generated Types

```typescript
export type ThingType =
  | 'page'
  | 'user'
  | 'file'
  | 'link'
  | 'note'           // from core
  | 'blog_post'
  | 'blog_category'  // from blog
  | 'course'
  | 'lesson'
  | 'quiz'
  | 'certificate';   // from courses

export type ConnectionType =
  | 'created_by'
  | 'updated_by'
  | 'viewed_by'
  | 'favorited_by'   // from core
  | 'posted_in'      // from blog
  | 'enrolled_in'
  | 'part_of';       // from courses

export type EventType =
  | 'thing_created'
  | 'thing_updated'
  | 'thing_deleted'
  | 'thing_viewed'         // from core
  | 'blog_post_published'
  | 'blog_post_viewed'     // from blog
  | 'enrolled_in_course'
  | 'lesson_completed'
  | 'quiz_submitted'
  | 'certificate_earned';  // from courses

export const ENABLED_FEATURES = ["core","blog","courses"] as const;
```

**Stats:**
- Thing Types: 11
- Connection Types: 7
- Event Types: 10

---

## Example 4: Full Platform (All Features)

```bash
bun run generate-types blog,courses,community,tokens
```

### Generated Types

```typescript
export type ThingType =
  | 'page'
  | 'user'
  | 'file'
  | 'link'
  | 'note'            // from core
  | 'blog_post'
  | 'blog_category'   // from blog
  | 'course'
  | 'lesson'
  | 'quiz'
  | 'certificate'     // from courses
  | 'forum_topic'
  | 'forum_reply'
  | 'direct_message'  // from community
  | 'token'
  | 'token_holder';   // from tokens

export type ConnectionType =
  | 'created_by'
  | 'updated_by'
  | 'viewed_by'
  | 'favorited_by'   // from core
  | 'posted_in'      // from blog
  | 'enrolled_in'
  | 'part_of'        // from courses
  | 'follows'
  | 'member_of'      // from community
  | 'holds_tokens';  // from tokens

export type EventType =
  | 'thing_created'
  | 'thing_updated'
  | 'thing_deleted'
  | 'thing_viewed'         // from core
  | 'blog_post_published'
  | 'blog_post_viewed'     // from blog
  | 'enrolled_in_course'
  | 'lesson_completed'
  | 'quiz_submitted'
  | 'certificate_earned'   // from courses
  | 'topic_created'
  | 'topic_replied'
  | 'message_sent'
  | 'user_followed'        // from community
  | 'tokens_purchased'
  | 'tokens_sold'
  | 'tokens_transferred';  // from tokens

export const ENABLED_FEATURES = ["core","blog","courses","community","tokens"] as const;
```

**Stats:**
- Thing Types: 16
- Connection Types: 10
- Event Types: 17

---

## Generated Helper Functions

Every generated file includes these helpers:

```typescript
// Type Guards
export function isThingType(value: string): value is ThingType {
  return THING_TYPES.includes(value as ThingType);
}

export function isConnectionType(value: string): value is ConnectionType {
  return CONNECTION_TYPES.includes(value as ConnectionType);
}

export function isEventType(value: string): value is EventType {
  return EVENT_TYPES.includes(value as EventType);
}

// Generic Validation
export function isValidOntologyType(
  dimension: 'thing' | 'connection' | 'event',
  value: string
): boolean {
  switch (dimension) {
    case 'thing': return isThingType(value);
    case 'connection': return isConnectionType(value);
    case 'event': return isEventType(value);
    default: return false;
  }
}

// Get Types for Dimension
export function getTypesForDimension(
  dimension: 'thing' | 'connection' | 'event'
): readonly string[] {
  switch (dimension) {
    case 'thing': return THING_TYPES;
    case 'connection': return CONNECTION_TYPES;
    case 'event': return EVENT_TYPES;
    default: return [];
  }
}

// Metadata
export const ONTOLOGY_METADATA = {
  features: ENABLED_FEATURES,
  thingTypeCount: 9,
  connectionTypeCount: 6,
  eventTypeCount: 7,
  generatedAt: '2025-10-19T19:45:05.314Z',
} as const;
```

---

## CLI Output

The generator provides beautiful, informative CLI output:

```
🚀 Ontology Type Generator
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 Features: blog,portfolio

📖 Loading ontologies...
[Ontology Loader] Composing features: core, blog, portfolio
[Ontology Loader] Composition complete:
  - Features: core, blog, portfolio
  - Thing Types: 9
  - Connection Types: 6
  - Event Types: 7

✅ Ontologies loaded successfully!
   - Features: core, blog, portfolio
   - Thing Types: 9
   - Connection Types: 6
   - Event Types: 7

⚙️  Generating TypeScript types...
📝 Writing to: /Users/toc/Server/ONE/backend/convex/types/ontology.ts

✅ Types generated successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 Generated types:
   - ThingType (9 types)
   - ConnectionType (6 types)
   - EventType (7 types)

🎯 Usage:
   import { ThingType, ConnectionType, EventType } from "./types/ontology";

💡 Next steps:
   1. Import types in your Convex functions
   2. Use type guards (isThingType, etc.) for validation
   3. Reference THING_TYPES array for iteration
```

---

## Feature Breakdown Documentation

Each generated file includes a breakdown of what each feature contributed:

```typescript
// ============================================================================
// Feature Breakdown
// ============================================================================

/**
 * Feature: core
 * Core ontology always present in every ONE installation
 *
 * Thing Types: page, user, file, link, note
 * Connection Types: created_by, updated_by, viewed_by, favorited_by
 * Event Types: thing_created, thing_updated, thing_deleted, thing_viewed
 */

/**
 * Feature: blog
 * Blog and content publishing
 *
 * Thing Types: blog_post, blog_category
 * Connection Types: posted_in
 * Event Types: blog_post_published, blog_post_viewed
 */

/**
 * Feature: portfolio
 * Portfolio and project showcase
 *
 * Thing Types: project, case_study
 * Connection Types: belongs_to_portfolio
 * Event Types: project_viewed
 */
```

---

## Usage Examples in Generated File

Each generated file includes practical examples:

```typescript
// ============================================================================
// Usage Examples
// ============================================================================

/**
 * Example: Validate thing type at runtime
 *
 * @example
 * const type = 'page';
 * if (isThingType(type)) {
 *   // TypeScript knows this is a valid ThingType
 *   console.log('Valid thing type:', type);
 * }
 */

/**
 * Example: Iterate over all thing types
 *
 * @example
 * for (const type of THING_TYPES) {
 *   console.log('Thing type:', type);
 * }
 */

/**
 * Example: Check if connection type exists
 *
 * @example
 * const connectionType = 'created_by';
 * if (isConnectionType(connectionType)) {
 *   // Safe to use
 * }
 */
```

---

## Performance Metrics

| Feature Set | Thing Types | Connection Types | Event Types | Generation Time | File Size |
|------------|-------------|------------------|-------------|-----------------|-----------|
| core | 5 | 4 | 4 | ~20ms | ~3KB |
| blog,portfolio | 9 | 6 | 7 | ~35ms | ~5KB |
| blog,courses | 11 | 7 | 10 | ~40ms | ~6KB |
| blog,courses,community,tokens | 16 | 10 | 17 | ~50ms | ~8KB |

---

## Integration with Convex

The generated types work seamlessly with Convex functions:

```typescript
import { mutation } from './_generated/server';
import { v } from 'convex/values';
import type { ThingType } from './types/ontology';
import { isThingType } from './types/ontology';

export const createEntity = mutation({
  args: {
    groupId: v.id('groups'),
    type: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    if (!isThingType(args.type)) {
      throw new Error(`Invalid type: ${args.type}`);
    }

    return await ctx.db.insert('entities', {
      groupId: args.groupId,
      type: args.type as ThingType, // Type-safe!
      name: args.name,
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
```

---

**This system provides complete type safety while maintaining the flexibility of the multi-ontology architecture.**
