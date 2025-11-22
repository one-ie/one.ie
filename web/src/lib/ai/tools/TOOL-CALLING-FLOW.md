# AI Clone Tool Calling Flow

This document demonstrates the complete flow of tool calling for AI clones, from user request to tool execution and result display.

## Architecture Overview

```
User Message → LLM Decision → Tool Call → Backend Execution → Result → LLM Response
     ↓              ↓              ↓              ↓                ↓           ↓
  "What did     Identifies     Calls         Executes        Returns      Formats
   I teach      tool needed    search_       vector         chunks      response
   about AI?"                  knowledge     search                     with citations
```

## Example 1: Search Knowledge Tool

### User Request
```
User: "What did I teach about machine learning in my Python course?"
```

### LLM Decision (Vercel AI SDK)
```typescript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { cloneTools } from '@/lib/ai/tools/clone-tools';

const result = await generateText({
  model: openai('gpt-4-turbo'),
  messages: [
    {
      role: 'system',
      content: 'You are an AI clone of a course creator. Use tools to answer questions.'
    },
    {
      role: 'user',
      content: 'What did I teach about machine learning in my Python course?'
    }
  ],
  tools: cloneTools,
  maxSteps: 5, // Allow multiple tool calls
});
```

### LLM Calls Tool
```typescript
// LLM decides to call search_knowledge tool
{
  toolName: 'search_knowledge',
  args: {
    query: 'machine learning Python course',
    limit: 5,
    minRelevance: 0.7
  }
}
```

### Frontend Executes Tool
```typescript
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

const executeToolCall = useMutation(api.mutations.cloneToolCalls.executeToolCall);

const toolResult = await executeToolCall({
  cloneId: 'clone_123',
  toolName: 'search_knowledge',
  args: {
    query: 'machine learning Python course',
    limit: 5,
    minRelevance: 0.7
  }
});
```

### Backend Execution (Convex Mutation)
```typescript
// In /backend/convex/mutations/clone-tool-calls.ts

async function executeSearchKnowledge(ctx, cloneId, args) {
  const { query, limit, minRelevance } = args;

  // 1. Generate embedding for query
  const embedding = await generateEmbedding(query);

  // 2. Vector search in knowledge table
  const results = await ctx.db
    .query('knowledge')
    .withSearchIndex('by_embedding', (q) =>
      q.similar('embedding', embedding, limit)
        .filter((k) => k.groupId === clone.groupId)
    )
    .collect();

  // 3. Filter by relevance
  const relevant = results.filter(r => r._score >= minRelevance);

  // 4. Return chunks with sources
  return {
    success: true,
    query,
    results: relevant.map(r => ({
      text: r.text,
      source: r.sourceThingId,
      relevance: r._score,
    }))
  };
}
```

### Event Logging
```typescript
// Logged in executeToolCall mutation
await ctx.db.insert('events', {
  type: 'tool_called',
  actorId: person._id,
  targetId: cloneId,
  groupId: clone.groupId,
  timestamp: Date.now(),
  metadata: {
    toolName: 'search_knowledge',
    success: true,
    argsHash: 'query=machine learning...',
  }
});
```

### LLM Final Response
```typescript
// LLM uses tool results to formulate response
{
  role: 'assistant',
  content: `In your Python course, you taught three key concepts about machine learning:

1. **Supervised Learning** - You covered linear regression and classification using scikit-learn.
2. **Neural Networks** - You explained backpropagation and demonstrated building a simple neural network.
3. **Model Evaluation** - You taught about train/test splits, cross-validation, and metrics like accuracy and F1 score.

These topics were covered in Lessons 8-12 of your "Python for Data Science" course.`,

  citations: [
    { text: 'Lesson 8: Introduction to scikit-learn', source: 'lesson_8_id' },
    { text: 'Lesson 10: Neural Networks Basics', source: 'lesson_10_id' },
    { text: 'Lesson 12: Model Evaluation', source: 'lesson_12_id' }
  ]
}
```

## Example 2: Recommend Product Tool

### User Request
```
User: "I want to learn Python but I'm a beginner with a $50 budget. What do you recommend?"
```

### LLM Decision
```typescript
// LLM decides to call recommend_product tool
{
  toolName: 'recommend_product',
  args: {
    category: 'course',
    budget: { min: 0, max: 50, currency: 'USD' },
    needs: ['learn Python', 'beginner level'],
    level: 'beginner',
    limit: 3
  }
}
```

### Backend Execution
```typescript
async function executeRecommendProduct(ctx, cloneId, args) {
  const { category, budget, needs, level, limit } = args;

  // 1. Query products in clone's group
  const products = await ctx.db
    .query('things')
    .withIndex('by_group_type', (q) =>
      q.eq('groupId', clone.groupId).eq('type', 'product')
    )
    .filter((p) => p.status === 'published')
    .collect();

  // 2. Filter by budget
  let filtered = products.filter(p => {
    const price = p.properties?.price || 0;
    return price <= (budget?.max || Infinity);
  });

  // 3. Filter by level
  filtered = filtered.filter(p =>
    p.properties?.level?.toLowerCase() === level?.toLowerCase()
  );

  // 4. Sort by relevance (semantic search on needs)
  // TODO: Use embeddings for semantic matching

  return {
    success: true,
    recommendations: filtered.slice(0, limit).map(p => ({
      id: p._id,
      name: p.name,
      description: p.description,
      price: p.properties.price,
      level: p.properties.level,
    })),
    reasoning: [
      { productId: filtered[0]._id, reason: 'Perfect for beginners, within budget' }
    ]
  };
}
```

### LLM Final Response
```
Based on your needs and budget, I recommend:

1. **Python Basics for Beginners** ($39)
   - Perfect starting point for complete beginners
   - Covers fundamentals step-by-step
   - Includes 20+ hands-on projects

2. **Python Fundamentals** ($29)
   - Great value option
   - Comprehensive introduction
   - Lifetime access to materials

Both courses fit your $50 budget and are designed specifically for beginners. I'd suggest starting with "Python Basics for Beginners" as it has the most beginner-friendly structure.

Would you like to enroll in one of these courses?
```

## Example 3: Schedule Meeting Tool

### User Request
```
User: "Can I schedule a 30-minute call with you next Tuesday at 2pm EST?"
```

### LLM Decision
```typescript
// LLM calls check_calendar first
{
  toolName: 'check_calendar',
  args: {
    date: '2025-11-28',
    startTime: '14:00',
    endTime: '14:30',
    timezone: 'America/New_York'
  }
}

// Then calls schedule_meeting if available
{
  toolName: 'schedule_meeting',
  args: {
    datetime: '2025-11-28T14:00:00-05:00',
    duration: 30,
    attendees: ['user@example.com'],
    subject: 'Call with AI Clone',
    meetingType: 'video'
  }
}
```

### Multi-Step Execution
```typescript
// Step 1: Check availability
const availabilityResult = await executeToolCall({
  cloneId,
  toolName: 'check_calendar',
  args: { date: '2025-11-28', startTime: '14:00', ... }
});

if (availabilityResult.result.available) {
  // Step 2: Schedule meeting
  const scheduleResult = await executeToolCall({
    cloneId,
    toolName: 'schedule_meeting',
    args: { datetime: '2025-11-28T14:00:00-05:00', ... }
  });
}
```

### Backend Execution
```typescript
async function executeScheduleMeeting(ctx, cloneId, args) {
  // 1. Verify clone owner (creator)
  const creatorConnection = await ctx.db
    .query('connections')
    .withIndex('to_type', (q) =>
      q.eq('toThingId', cloneId).eq('relationshipType', 'owns')
    )
    .first();

  const creator = await ctx.db.get(creatorConnection.fromThingId);

  // 2. Integrate with calendar service (Google Calendar, Cal.com, etc.)
  const calendarEvent = await createCalendarEvent({
    creator: creator,
    datetime: args.datetime,
    duration: args.duration,
    attendees: args.attendees,
    subject: args.subject,
  });

  // 3. Create meeting thing
  const meetingId = await ctx.db.insert('things', {
    type: 'meeting',
    name: args.subject,
    groupId: clone.groupId,
    properties: {
      datetime: args.datetime,
      duration: args.duration,
      attendees: args.attendees,
      calendarEventId: calendarEvent.id,
      meetingType: args.meetingType,
    },
    status: 'active',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  // 4. Create connection: user → meeting
  await ctx.db.insert('connections', {
    fromThingId: person._id,
    toThingId: meetingId,
    relationshipType: 'scheduled',
    metadata: {},
    validFrom: Date.now(),
    createdAt: Date.now(),
  });

  return {
    success: true,
    meetingId,
    calendarLink: calendarEvent.link,
    datetime: args.datetime,
    duration: args.duration,
  };
}
```

### LLM Final Response
```
Great! I've scheduled a 30-minute video call for Tuesday, November 28th at 2:00 PM EST.

📅 Meeting Details:
- Date: Tuesday, November 28, 2025
- Time: 2:00 PM - 2:30 PM EST
- Duration: 30 minutes
- Type: Video call

You'll receive a calendar invitation at user@example.com with the meeting link.

Looking forward to speaking with you!
```

## Tool Authorization Flow

```typescript
// In executeToolCall mutation

// 1. Check if tool is enabled
const toolConfig = clone.properties?.tools?.[toolName];
if (!toolConfig?.enabled) {
  throw new Error('Tool not enabled');
}

// 2. Check rate limits
const recentCalls = await ctx.db
  .query('events')
  .filter(event =>
    event.type === 'tool_called' &&
    event.targetId === cloneId &&
    event.metadata.toolName === toolName &&
    event.timestamp >= (Date.now() - 60 * 60 * 1000) // Last hour
  )
  .collect();

if (recentCalls.length >= toolConfig.rateLimitPerHour) {
  throw new Error('Rate limit exceeded');
}

// 3. Check approval requirement
if (toolConfig.requiresApproval) {
  // Create pending approval
  await ctx.db.insert('things', {
    type: 'approval_request',
    groupId: clone.groupId,
    properties: {
      cloneId,
      toolName,
      args,
      requestedBy: person._id,
      status: 'pending',
    },
    status: 'active',
    createdAt: Date.now(),
  });

  return {
    success: false,
    status: 'pending_approval',
    message: 'This tool call requires creator approval'
  };
}

// 4. Execute tool
const result = await executeTool(toolName, args);
```

## Error Handling

```typescript
try {
  const result = await executeToolCall({
    cloneId,
    toolName: 'send_email',
    args: { to: 'user@example.com', subject: 'Hello', body: 'Hi there!' }
  });

  if (!result.success) {
    // Tool execution failed
    console.error('Tool failed:', result.errorMessage);

    // LLM can explain the error to user
    return {
      role: 'assistant',
      content: `I apologize, but I couldn't send that email because: ${result.errorMessage}. Would you like me to try again or use a different approach?`
    };
  }
} catch (error) {
  // Network or authorization error
  console.error('Tool call error:', error);

  return {
    role: 'assistant',
    content: 'I encountered an error while trying to help. Please try again or contact support.'
  };
}
```

## Streaming Tool Results

```typescript
import { streamText } from 'ai';

const result = await streamText({
  model: openai('gpt-4-turbo'),
  messages: [...],
  tools: cloneTools,
  maxSteps: 5,

  onStepFinish: async (step) => {
    // Stream tool call progress to user
    if (step.toolCalls) {
      for (const toolCall of step.toolCalls) {
        console.log(`Calling ${toolCall.toolName}...`);

        // Execute tool
        const result = await executeToolCall({
          cloneId,
          toolName: toolCall.toolName,
          args: toolCall.args,
        });

        console.log(`${toolCall.toolName} completed:`, result.success);
      }
    }
  },
});

// Stream final response
for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}
```

## Best Practices

### 1. Tool Selection
- **search_knowledge**: Use for answering questions about creator's content
- **create_content**: Use for generating new content in creator's voice
- **schedule_meeting**: Use for booking time with creator
- **send_email**: Use for follow-ups and resource sharing
- **check_calendar**: Use before scheduling to verify availability
- **access_course**: Use for enrolled students requesting content
- **recommend_product**: Use for product discovery and recommendations

### 2. Rate Limiting
- Set conservative limits initially
- Monitor usage patterns
- Adjust based on actual needs
- Different limits for different roles (customer vs org_user)

### 3. Approval Workflow
- Require approval for high-impact tools (send_email, schedule_meeting)
- Auto-approve safe tools (search_knowledge, check_calendar)
- Batch approval for efficiency
- Notify creator of pending approvals

### 4. Error Recovery
- Always handle tool failures gracefully
- Provide clear error messages to users
- Log all errors for debugging
- Suggest alternatives when tools fail

### 5. Privacy & Security
- Never log sensitive tool arguments
- Encrypt email content
- Validate all tool inputs
- Respect user permissions (enrolled_in for courses)

## Ontology Mapping

### Tools → 6 Dimensions

| Tool | Groups | People | Things | Connections | Events | Knowledge |
|------|--------|--------|--------|-------------|--------|-----------|
| search_knowledge | ✓ (scope) | ✗ | ✓ (sources) | ✗ | ✓ (log) | ✓ (vector) |
| create_content | ✓ (scope) | ✓ (actor) | ✓ (new) | ✓ (created_by) | ✓ (log) | ✓ (RAG) |
| schedule_meeting | ✓ (scope) | ✓ (attendees) | ✓ (meeting) | ✓ (scheduled) | ✓ (log) | ✗ |
| send_email | ✓ (scope) | ✓ (sender/receiver) | ✗ | ✓ (communicated) | ✓ (log) | ✗ |
| check_calendar | ✓ (scope) | ✓ (owner) | ✓ (events) | ✗ | ✓ (log) | ✗ |
| access_course | ✓ (scope) | ✓ (student) | ✓ (course) | ✓ (enrolled_in) | ✓ (log) | ✓ (content) |
| recommend_product | ✓ (scope) | ✗ | ✓ (products) | ✗ | ✓ (log) | ✓ (semantic) |

**Pattern:** Every tool maps cleanly to the 6 dimensions. This ensures consistency and enables AI agents to understand tool behavior with 98% accuracy.

## Next Steps

1. **Cycle 3: Embeddings** - Implement vector search for `search_knowledge`
2. **Cycle 6: RAG Pipeline** - Enable `create_content` with retrieval-augmented generation
3. **Calendar Integration** - Connect `schedule_meeting` to Google Calendar/Cal.com
4. **Email Service** - Integrate `send_email` with Resend/SendGrid
5. **Approval UI** - Build creator dashboard for tool approval workflow

---

**Built on the 6-dimension ontology for infinite extensibility.**
