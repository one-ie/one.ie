# AI Tools - Funnel Builder

**Conversational funnel building tools for ChatClientV2 integration.**

## Quick Start

```tsx
import { useFunnelBuilderTools, FUNNEL_BUILDER_SYSTEM_PROMPT } from '@/components/ai/tools';

function MyFunnelChat() {
  const tools = useFunnelBuilderTools();

  const toolsArray = Object.entries(tools).map(([name, tool]) => ({
    name,
    description: tool.description,
    parameters: tool.parameters,
    execute: tool.execute,
  }));

  return (
    <ChatClientV2
      systemPrompt={FUNNEL_BUILDER_SYSTEM_PROMPT}
      tools={toolsArray}
    />
  );
}
```

## Files

- **FunnelBuilderTools.tsx** - Tool definitions and backend integration
- **FunnelResponses.tsx** - Beautiful UI response components
- **index.ts** - Exports
- **FunnelBuilderChatExample.tsx** - Integration example
- **INTEGRATION.md** - Complete integration guide
- **README.md** - This file

## Available Tools

1. **create_funnel** - Create new funnel
2. **list_funnels** - List all funnels
3. **get_funnel** - Get funnel details
4. **update_funnel** - Update funnel properties
5. **publish_funnel** - Publish funnel (make live)
6. **unpublish_funnel** - Unpublish funnel (take offline)
7. **archive_funnel** - Archive funnel (soft delete)
8. **duplicate_funnel** - Duplicate existing funnel

## Example Conversations

**Create Funnel:**
```
User: "Create a funnel called Summer Sale 2024"
AI: [Uses create_funnel] → Shows beautiful success card with next steps
```

**List Funnels:**
```
User: "Show me all my published funnels"
AI: [Uses list_funnels with status filter] → Shows grid of funnel cards
```

**Publish Funnel:**
```
User: "Publish my summer sale funnel"
AI: [Uses publish_funnel] → Shows published confirmation with share URL
```

## Features

- **Conversational Interface** - Natural language funnel building
- **Beautiful UI Responses** - ThingCard integration with success/error states
- **Real-time Updates** - Convex subscriptions for instant updates
- **Type-safe** - Full TypeScript support
- **Ontology Mapped** - Follows 6-dimension ontology patterns
- **Secure** - Role-based access control and multi-tenant isolation

## Backend Integration

All tools use Convex mutations and queries:
- `api.mutations.funnels.*` - Create, update, publish, etc.
- `api.queries.funnels.*` - List, get, getWithSteps

## Response Components

All response components are in **FunnelResponses.tsx**:
- `FunnelCreatedResponse` - Success state with next steps
- `FunnelListResponse` - Grid of funnel cards
- `FunnelDetailsResponse` - Detailed funnel view
- `FunnelPublishedResponse` - Publish/unpublish confirmation
- `FunnelErrorResponse` - Error states with troubleshooting

## Next Steps

1. Read **INTEGRATION.md** for detailed integration guide
2. Check **FunnelBuilderChatExample.tsx** for working example
3. Implement in your chat interface
4. Test with example prompts

## Future Enhancements

- Step management tools (add_step, remove_step, reorder_steps)
- Element management tools (add_element, update_element, remove_element)
- Analytics tools (get_analytics, get_conversion_rate)
- A/B testing tools (create_variant, compare_variants)
- Preview tools (preview_funnel, preview_step)

---

**Built for Cycle 41**: Conversational funnel building with ChatClientV2 integration.
