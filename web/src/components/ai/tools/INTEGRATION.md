# Funnel Builder Tools - Integration Guide

**Cycle 41 Complete**: Conversational funnel building tools integrated with ChatClientV2.

## Overview

This directory contains AI tool definitions and UI response components for conversational funnel building. Users can create, manage, and publish funnels through natural language conversations with the AI.

## Architecture

```
ai/tools/
├── FunnelBuilderTools.tsx    # Tool definitions (backend calls)
├── FunnelResponses.tsx        # UI response components
├── index.ts                   # Exports
└── INTEGRATION.md             # This file
```

### Key Components

**FunnelBuilderTools.tsx**
- Tool definitions with parameters and execute functions
- Convex mutation integration
- System prompt for AI assistant

**FunnelResponses.tsx**
- Beautiful UI components for tool responses
- Uses ThingCard for ontology consistency
- Success, error, and info states

## Tools Available

### 1. create_funnel
Create a new funnel with optional template.

**Parameters:**
- `name` (required): Funnel name
- `description` (optional): Funnel description
- `template` (optional): Template type (lead-gen, product-launch, webinar, ecommerce)

**Example:**
```
User: "Create a funnel called 'Summer Sale 2024' for promoting our summer products"
AI: Uses create_funnel tool → Shows FunnelCreatedResponse
```

### 2. list_funnels
List all funnels in the organization.

**Parameters:**
- `status` (optional): Filter by status (draft, active, published, archived)
- `limit` (optional): Maximum number of results (default: 10)

**Example:**
```
User: "Show me all my published funnels"
AI: Uses list_funnels tool with status="published" → Shows FunnelListResponse
```

### 3. get_funnel
Get detailed information about a specific funnel.

**Parameters:**
- `id` (required): Funnel ID

**Example:**
```
User: "Show me details for funnel abc123"
AI: Uses get_funnel tool → Shows FunnelDetailsResponse
```

### 4. update_funnel
Update funnel properties.

**Parameters:**
- `id` (required): Funnel ID
- `name` (optional): New name
- `description` (optional): New description
- `settings` (optional): Settings object (SEO, tracking, branding)

**Example:**
```
User: "Rename the summer sale funnel to 'Summer Clearance'"
AI: Uses update_funnel tool → Shows success message
```

### 5. publish_funnel
Publish a funnel (make it live).

**Parameters:**
- `id` (required): Funnel ID

**Requirements:**
- Funnel must have at least one step
- User must be org_owner or platform_owner

**Example:**
```
User: "Publish my summer sale funnel"
AI: Uses publish_funnel tool → Shows FunnelPublishedResponse
```

### 6. unpublish_funnel
Unpublish a funnel (take it offline).

**Parameters:**
- `id` (required): Funnel ID

**Example:**
```
User: "Take the summer sale funnel offline"
AI: Uses unpublish_funnel tool → Shows unpublished confirmation
```

### 7. archive_funnel
Archive a funnel (soft delete).

**Parameters:**
- `id` (required): Funnel ID

**Example:**
```
User: "Archive the old marketing funnel"
AI: Uses archive_funnel tool → Shows archive confirmation
```

### 8. duplicate_funnel
Create a copy of an existing funnel.

**Parameters:**
- `id` (required): Funnel ID to duplicate
- `name` (optional): Name for the copy

**Example:**
```
User: "Make a copy of my lead gen funnel"
AI: Uses duplicate_funnel tool → Shows duplication confirmation
```

## Integration with ChatClientV2

### Step 1: Import Tools

```tsx
import { useFunnelBuilderTools, FUNNEL_BUILDER_SYSTEM_PROMPT } from '@/components/ai/tools';
```

### Step 2: Get Tools in Component

```tsx
export function FunnelBuilderChat() {
  const funnelTools = useFunnelBuilderTools();

  // Convert to array format for AI SDK
  const tools = Object.entries(funnelTools).map(([name, tool]) => ({
    name,
    description: tool.description,
    parameters: tool.parameters,
    execute: tool.execute,
  }));

  return (
    <ChatClientV2
      systemPrompt={FUNNEL_BUILDER_SYSTEM_PROMPT}
      tools={tools}
    />
  );
}
```

### Step 3: Handle Tool Calls

The AI SDK will automatically:
1. Parse user intent
2. Select appropriate tool
3. Extract parameters from conversation
4. Call tool's execute function
5. Display the returned React component

## Example Conversations

### Creating a Funnel

```
User: "I want to create a lead generation funnel for my SaaS product"

AI: "I'll help you create a lead generation funnel! What would you like to name it?"

User: "Call it 'SaaS Free Trial Signup'"

AI: [Calls create_funnel tool]
    [Shows FunnelCreatedResponse]
    "Great! I've created your 'SaaS Free Trial Signup' funnel. It's currently in draft mode.
     Would you like to add steps to it now?"
```

### Managing Funnels

```
User: "Show me all my funnels"

AI: [Calls list_funnels tool]
    [Shows FunnelListResponse with all funnels]
    "Here are all your funnels. You have 3 funnels total:
     1 published, 1 draft, and 1 archived."

User: "Show me just the published ones"

AI: [Calls list_funnels tool with status="published"]
    [Shows FunnelListResponse with filtered results]
```

### Publishing Workflow

```
User: "I want to publish my summer sale funnel"

AI: [Calls get_funnel to check requirements]
    "I see your summer sale funnel currently has 0 steps. Before publishing,
     you need to add at least one step. Would you like me to help you add steps?"

User: "Yes, add a landing page"

AI: [Calls add_step tool - to be implemented in future cycle]
    "I've added a landing page step. Now your funnel has 1 step.
     Would you like to publish it now?"

User: "Yes, publish it"

AI: [Calls publish_funnel tool]
    [Shows FunnelPublishedResponse]
    "Your funnel is now live! Here's the URL to share with your audience..."
```

## UI Components

All response components follow these patterns:

### Success States
- **Green color scheme** (bg-green-50, border-green-200)
- **Success icon** (CheckCircle2, Sparkles, Rocket)
- **Next steps** guidance
- **Action buttons** (Edit, Preview, Copy URL)

### Error States
- **Red color scheme** (bg-red-50, border-red-200)
- **Error icon** (AlertCircle)
- **Error message** with details
- **Common solutions** list
- **Troubleshooting** guidance

### Info States
- **Blue/Gray color scheme** (bg-blue-50, bg-gray-50)
- **Info icons** (Eye, Copy, Archive)
- **Contextual information**
- **Related actions**

### Example Response

```tsx
<FunnelCreatedResponse
  funnelId="kjsdfu123"
  name="Summer Sale 2024"
  description="Promotional funnel for summer products"
  template="product-launch"
/>
```

Renders:
- ✨ Success header with green styling
- Description and template info
- Funnel ID in code block
- Next steps checklist:
  1. Add steps to your funnel
  2. Customize branding
  3. Add elements
  4. Preview and publish
- Action buttons (Edit, Preview)

## Backend Integration

All tools use Convex mutations from:
- `/backend/convex/mutations/funnels.ts`
- `/backend/convex/queries/funnels.ts`

### Mutations Used
- `api.mutations.funnels.create`
- `api.mutations.funnels.update`
- `api.mutations.funnels.publish`
- `api.mutations.funnels.unpublish`
- `api.mutations.funnels.archive`
- `api.mutations.funnels.duplicate`

### Queries Used
- `api.queries.funnels.list`
- `api.queries.funnels.get`
- `api.queries.funnels.getWithSteps`

### Event Logging

All mutations automatically log events:
- `funnel_created`
- `entity_updated` (for funnels)
- `funnel_published`
- `funnel_unpublished`
- `funnel_archived`
- `funnel_duplicated`

## Future Enhancements

### Step Management Tools (Cycle 42+)
- `add_step` - Add a step to funnel
- `remove_step` - Remove a step
- `reorder_steps` - Change step sequence
- `update_step` - Update step properties

### Element Management Tools
- `add_element` - Add element to step
- `update_element` - Update element properties
- `remove_element` - Remove element

### Advanced Features
- `get_analytics` - Funnel performance metrics
- `ab_test` - Create A/B test variants
- `duplicate_step` - Copy steps within/between funnels
- `preview_funnel` - Generate preview URL

## Testing

### Manual Testing

1. **Create Funnel**
```
User: "Create a funnel called Test Funnel"
Expected: FunnelCreatedResponse with funnel details
```

2. **List Funnels**
```
User: "Show me all my funnels"
Expected: FunnelListResponse with all funnels
```

3. **Update Funnel**
```
User: "Rename Test Funnel to My Test Funnel"
Expected: Success message
```

4. **Publish (Should Fail - No Steps)**
```
User: "Publish Test Funnel"
Expected: Error message about needing at least one step
```

5. **Archive**
```
User: "Archive Test Funnel"
Expected: Archive confirmation
```

### Error Scenarios

1. **No Permission**
- User role: customer
- Action: create_funnel
- Expected: Error about customers not having permission

2. **Funnel Not Found**
- Action: get_funnel with invalid ID
- Expected: FunnelErrorResponse

3. **Already Published**
- Action: publish_funnel on already published funnel
- Expected: Error about funnel already being published

## Performance

- Tools use Convex real-time subscriptions
- Response components render instantly
- No loading states needed (Convex handles optimistic updates)
- All mutations logged for audit trail

## Security

- All tools validate user authentication
- Multi-tenant isolation via groupId
- Role-based access control (RBAC)
- Only org_owner and platform_owner can modify/publish funnels
- Customers cannot manage funnels

## Ontology Mapping

All funnel tools map to the 6-dimension ontology:

1. **Groups** - Multi-tenant isolation via groupId
2. **People** - User authentication and role-based access
3. **Things** - Funnels stored as things with type="funnel"
4. **Connections** - Ownership (user owns funnel)
5. **Events** - All operations logged (funnel_created, funnel_published, etc.)
6. **Knowledge** - Future: Search and recommendations

## Next Steps

1. **Implement Step Management Tools** (Cycle 42)
2. **Add Element Management Tools** (Cycle 43)
3. **Build Preview System** (Cycle 44)
4. **Implement Analytics Tools** (Cycle 45)
5. **Add A/B Testing Tools** (Cycle 46)

---

**Built for Cycle 41**: Conversational funnel building with beautiful UI responses.
