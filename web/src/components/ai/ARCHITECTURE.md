# WebsiteBuilderChat Architecture

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│ WebsiteBuilderChat Component                                │
│ (/web/src/components/ai/WebsiteBuilderChat.tsx)             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │ Conversation (Prompt Kit)                          │     │
│  │                                                     │     │
│  │  ┌──────────────────────────────────────────────┐  │     │
│  │  │ ConversationContent                          │  │     │
│  │  │                                              │  │     │
│  │  │  ┌────────────────────────────────────────┐ │  │     │
│  │  │  │ Message Loop (map over messages)       │ │  │     │
│  │  │  │                                        │ │  │     │
│  │  │  │  ┌──────────────────────────────────┐ │ │  │     │
│  │  │  │  │ MessageBranch                    │ │ │  │     │
│  │  │  │  │                                  │ │ │  │     │
│  │  │  │  │  ┌────────────────────────────┐ │ │ │  │     │
│  │  │  │  │  │ Message (user/assistant)   │ │ │ │  │     │
│  │  │  │  │  │                            │ │ │ │  │     │
│  │  │  │  │  │  [Reasoning Section]       │ │ │ │  │     │
│  │  │  │  │  │   ├─ ReasoningTrigger      │ │ │ │  │     │
│  │  │  │  │  │   └─ ReasoningContent      │ │ │ │  │     │
│  │  │  │  │  │                            │ │ │ │  │     │
│  │  │  │  │  │  [Tool Calls Section]      │ │ │ │  │     │
│  │  │  │  │  │   └─ ToolCallCard[]        │ │ │ │  │     │
│  │  │  │  │  │       ├─ Tool Icon         │ │ │ │  │     │
│  │  │  │  │  │       ├─ Status Badge      │ │ │ │  │     │
│  │  │  │  │  │       ├─ Arguments (JSON)  │ │ │ │  │     │
│  │  │  │  │  │       └─ Result/Error      │ │ │ │  │     │
│  │  │  │  │  │                            │ │ │ │  │     │
│  │  │  │  │  │  [Message Content]         │ │ │ │  │     │
│  │  │  │  │  │   └─ MessageResponse       │ │ │ │  │     │
│  │  │  │  │  │                            │ │ │ │  │     │
│  │  │  │  │  │  [Action Buttons]          │ │ │ │  │     │
│  │  │  │  │  │   ├─ Apply Changes         │ │ │ │  │     │
│  │  │  │  │  │   └─ Copy Code             │ │ │ │  │     │
│  │  │  │  │  └────────────────────────────┘ │ │ │  │     │
│  │  │  │  └──────────────────────────────────┘ │ │  │     │
│  │  │  └────────────────────────────────────────┘ │  │     │
│  │  │                                              │  │     │
│  │  │  [Current Streaming State]                  │  │     │
│  │  │   ├─ Thinking Card (if reasoning)           │  │     │
│  │  │   └─ Tool Call Cards (if tools)             │  │     │
│  │  │                                              │  │     │
│  │  └──────────────────────────────────────────────┘  │     │
│  │                                                     │     │
│  │  ┌──────────────────────────────────────────────┐  │     │
│  │  │ ConversationScrollButton                     │  │     │
│  │  └──────────────────────────────────────────────┘  │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │ Input Section                                      │     │
│  │                                                     │     │
│  │  ┌──────────────────────────────────────────────┐  │     │
│  │  │ Suggestions (empty state only)               │  │     │
│  │  │  └─ Suggestion Chips                         │  │     │
│  │  └──────────────────────────────────────────────┘  │     │
│  │                                                     │     │
│  │  ┌──────────────────────────────────────────────┐  │     │
│  │  │ PromptInput (Prompt Kit)                     │  │     │
│  │  │                                              │  │     │
│  │  │  ┌────────────────────────────────────────┐ │  │     │
│  │  │  │ PromptInputBody                        │ │  │     │
│  │  │  │  └─ PromptInputTextarea                 │ │  │     │
│  │  │  └────────────────────────────────────────┘ │  │     │
│  │  │                                              │  │     │
│  │  │  ┌────────────────────────────────────────┐ │  │     │
│  │  │  │ PromptInputFooter                      │ │  │     │
│  │  │  │  ├─ PromptInputTools (badge)           │ │  │     │
│  │  │  │  └─ PromptInputSubmit                  │ │  │     │
│  │  │  └────────────────────────────────────────┘ │  │     │
│  │  └──────────────────────────────────────────────┘  │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

```
┌──────────────┐
│ User Input   │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────┐
│ handleSubmit()                       │
│ - Validate input                     │
│ - Add user message to state          │
│ - Clear input                        │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ streamResponse()                     │
│ - Create assistant message           │
│ - POST to /api/chat-claude-code      │
│ - Start SSE stream                   │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ SSE Stream Parser                    │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Text Delta                     │  │
│  │ → Update message.content       │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Reasoning Delta                │  │
│  │ → Update currentReasoning      │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Tool Call                      │  │
│  │ → Add to currentToolCalls      │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Tool Result                    │  │
│  │ → Update tool in array         │  │
│  └────────────────────────────────┘  │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Stream Complete                      │
│ - Update final message               │
│ - Add reasoning & tools              │
│ - Set status to "ready"              │
│ - Clear streaming state              │
└──────────────────────────────────────┘
```

## State Structure

```typescript
// Component State
{
  // Input
  text: string                              // Current input text
  status: "ready" | "streaming" | "error"  // Current state

  // Messages
  messages: MessageType[]                   // Conversation history

  // Streaming State
  currentReasoning: string                  // Active thinking
  currentToolCalls: ToolCall[]             // Active tool operations
}

// Message Type
{
  key: string                               // Unique ID
  from: "user" | "assistant"               // Sender
  content: string                           // Message text
  reasoning?: string                        // AI thinking (optional)
  tools?: ToolCall[]                       // File operations (optional)
  timestamp: number                         // Creation time
}

// Tool Call Type
{
  name: string                              // "Read", "Write", "Edit", etc.
  args: Record<string, unknown>            // Tool parameters
  result?: string                           // Tool output (optional)
  state: "input-available"                 // Execution state
       | "output-available"
       | "error"
  error?: string                            // Error message (optional)
}
```

## API Integration

```
┌─────────────────────────────────────────────────────────┐
│ /api/chat-claude-code                                   │
│                                                          │
│ Request:                                                 │
│ {                                                        │
│   messages: [                                            │
│     { role: "user", content: "Create a page" },         │
│     { role: "assistant", content: "I'll create..." }    │
│   ],                                                     │
│   model: "sonnet"                                        │
│ }                                                        │
│                                                          │
│ Response (Server-Sent Events):                          │
│                                                          │
│ data: {                                                  │
│   "choices": [{                                          │
│     "delta": { "content": "Let me..." }                 │
│   }]                                                     │
│ }                                                        │
│                                                          │
│ data: {                                                  │
│   "choices": [{                                          │
│     "delta": { "reasoning": "First I'll..." }           │
│   }]                                                     │
│ }                                                        │
│                                                          │
│ data: {                                                  │
│   "type": "tool_call",                                   │
│   "payload": {                                           │
│     "name": "Write",                                     │
│     "args": { "file_path": "..." },                     │
│     "state": "input-available"                          │
│   }                                                      │
│ }                                                        │
│                                                          │
│ data: {                                                  │
│   "type": "tool_result",                                 │
│   "payload": {                                           │
│     "name": "Write",                                     │
│     "result": "File written",                           │
│     "state": "output-available"                         │
│   }                                                      │
│ }                                                        │
│                                                          │
│ data: [DONE]                                             │
└─────────────────────────────────────────────────────────┘
```

## Page Integration

```
┌─────────────────────────────────────────────────────────┐
│ /chat/builder                                            │
│ (Astro Page)                                             │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Layout (sidebarInitialCollapsed={true})           │  │
│  │                                                    │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │ Header                                      │  │  │
│  │  │  - Title: "AI Website Builder"             │  │  │
│  │  │  - Description                             │  │  │
│  │  │  - Link to /websites                       │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │                                                    │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │ WebsiteBuilderChat                          │  │  │
│  │  │ (client:only="react")                       │  │  │
│  │  │  - Full height                              │  │  │
│  │  │  - Scrollable                               │  │  │
│  │  │  - Interactive                              │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Event Handlers

```typescript
// User submits message
handleSubmit(message: PromptInputMessage) {
  1. Validate input (hasText)
  2. Create user message object
  3. Add to messages array
  4. Clear input text
  5. Call streamResponse()
}

// Stream AI response
streamResponse(userMessage: string) {
  1. Set status to "streaming"
  2. Reset streaming state (reasoning, tools)
  3. Create placeholder assistant message
  4. POST to /api/chat-claude-code
  5. Parse SSE stream:
     - Text delta → Update content
     - Reasoning delta → Update reasoning
     - Tool call → Add to tools
     - Tool result → Update tool
  6. On completion:
     - Update final message
     - Set status to "ready"
     - Clear streaming state
}

// Handle suggestion click
handleSuggestionClick(suggestion: string) {
  1. Call handleSubmit() with suggestion text
}

// Apply code changes
handleApplyChanges() {
  1. Show toast confirmation
  2. [Future: Actually apply to preview]
}

// Copy code to clipboard
handleCopyCode() {
  1. Extract code blocks from content
  2. Join with newlines
  3. Copy to clipboard
  4. Show success toast
}
```

## Styling Tokens

```css
/* Design System Colors */
--color-background      /* Page background */
--color-foreground      /* Text color */
--color-primary         /* Brand color */
--color-muted           /* Subtle backgrounds */
--color-muted-foreground /* Subtle text */
--color-destructive     /* Error states */

/* Component-Specific */
.message-user           /* User message bubble */
.message-assistant      /* AI message bubble */
.reasoning-card         /* Thinking display */
.tool-call-card         /* File operation card */
.code-block             /* Generated code */
```

## Performance Optimizations

```typescript
// Memoized callbacks
const streamResponse = useCallback(/* ... */, [dependencies]);
const handleSubmit = useCallback(/* ... */, [dependencies]);
const handleSuggestionClick = useCallback(/* ... */, [dependencies]);

// Client-only rendering
<WebsiteBuilderChat client:only="react" />

// Lazy tool details
<Collapsible> {/* Only renders when expanded */}
  <ToolDetails />
</Collapsible>

// Minimal re-renders
setMessages(prev => prev.map(/* targeted update */));
```

## Error Boundaries

```typescript
try {
  // API call
  const response = await fetch('/api/chat-claude-code', ...);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  // Stream parsing
  for (const line of lines) {
    try {
      const data = JSON.parse(line);
      // Process data
    } catch (e) {
      console.error('Parse error:', e);
      // Continue streaming (graceful degradation)
    }
  }
} catch (error) {
  // Network error
  console.error('Streaming error:', error);
  setStatus('error');
  toast.error('Failed to get response');
}
```

---

**Architecture Version**: 1.0.0
**Last Updated**: 2025-11-22
**Component**: WebsiteBuilderChat
