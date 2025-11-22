# WebsiteBuilderChat Component

AI-powered chat interface for building websites with Claude Code.

## Features

✅ **Real-time Streaming** - Live responses from Claude Code API
✅ **Thinking Display** - Show AI's reasoning process transparently
✅ **Tool Visualization** - Display file operations (Read, Write, Edit, Bash, etc.)
✅ **Code Highlighting** - Expandable code blocks with syntax highlighting
✅ **Apply Changes** - One-click button to apply generated code
✅ **Copy Code** - Quick clipboard copy for all code blocks
✅ **Conversation History** - Full chat context maintained
✅ **Error Handling** - Graceful error states with user feedback

## Usage

### Basic Implementation

```astro
---
// src/pages/builder.astro
import Layout from '@/layouts/Layout.astro';
import { WebsiteBuilderChat } from '@/components/ai/WebsiteBuilderChat';
---

<Layout title="AI Builder" sidebarInitialCollapsed={true}>
  <WebsiteBuilderChat client:only="react" />
</Layout>
```

### With Custom Header

```astro
<Layout title="AI Builder" sidebarInitialCollapsed={true}>
  <div class="flex h-full flex-col">
    <!-- Custom header -->
    <div class="border-b px-6 py-4">
      <h1>AI Website Builder</h1>
    </div>

    <!-- Chat component -->
    <div class="flex-1 overflow-hidden">
      <WebsiteBuilderChat client:only="react" />
    </div>
  </div>
</Layout>
```

## API Integration

### Endpoint: `/api/chat-claude-code`

The component connects to the Claude Code endpoint which provides:

- **Full file system access** - Read, Write, Edit operations
- **Command execution** - Bash commands with output
- **File search** - Grep and Glob for finding files
- **Web fetching** - External content retrieval
- **Extended thinking** - 10 minute timeout for complex tasks

### Message Format

```typescript
{
  messages: [
    { role: "user", content: "Create a landing page" },
    { role: "assistant", content: "I'll create that..." }
  ],
  model: "sonnet" // or "opus"
}
```

### Response Format (Server-Sent Events)

```typescript
// Text delta
data: { "choices": [{ "delta": { "content": "..." } }] }

// Reasoning delta
data: { "choices": [{ "delta": { "reasoning": "..." } }] }

// Tool call
data: {
  "type": "tool_call",
  "payload": {
    "name": "Write",
    "args": { "file_path": "...", "content": "..." },
    "state": "input-available"
  }
}

// Tool result
data: {
  "type": "tool_result",
  "payload": {
    "name": "Write",
    "result": "File written successfully",
    "state": "output-available"
  }
}

// Completion
data: [DONE]
```

## Component Architecture

### State Management

```typescript
type MessageType = {
  key: string;                    // Unique message ID
  from: "user" | "assistant";     // Message sender
  content: string;                 // Message text
  reasoning?: string;              // AI thinking process
  tools?: ToolCall[];              // File operations
  timestamp: number;               // Creation time
}

type ToolCall = {
  name: string;                    // Tool name (Read, Write, etc.)
  args: Record<string, unknown>;   // Tool arguments
  result?: string;                 // Tool output
  state: "input-available" | "output-available" | "error";
  error?: string;                  // Error message if failed
}
```

### Key Functions

**`streamResponse(userMessage: string)`**
- Streams AI response from Claude Code API
- Handles SSE parsing and state updates
- Updates messages with content, reasoning, and tool calls

**`handleSubmit(message: PromptInputMessage)`**
- Validates and adds user message
- Triggers AI response streaming
- Manages input state

**`extractCodeBlocks(content: string)`**
- Extracts all code blocks from markdown
- Used for copy and apply features

## UI Components

### Conversation Display
- `Conversation` - Scrollable message container
- `Message` - Individual message bubble
- `MessageBranch` - Support for message versions
- `ConversationScrollButton` - Auto-scroll control

### Reasoning Display
- `Reasoning` - Collapsible thinking section
- `ReasoningTrigger` - Expand/collapse button
- `ReasoningContent` - Thinking text content

### Tool Call Display
- `ToolCallCard` - Individual tool operation card
- Shows tool name, arguments, result, and state
- Expandable with full JSON details

### Input Components
- `PromptInput` - Main input container
- `PromptInputTextarea` - Multi-line text input
- `PromptInputSubmit` - Send button with loading state
- `Suggestions` - Quick action chips

## Styling

Uses Tailwind CSS v4 with shadcn/ui components:

- **Dark mode compatible** - Automatic theme switching
- **Responsive design** - Mobile-first approach
- **Smooth animations** - Loading states and transitions
- **Accessible** - ARIA labels and keyboard navigation

## Example User Flows

### 1. Create Landing Page

**User:** "Create a landing page with hero section"

**AI Response:**
- Shows thinking: "I'll create a landing page using Astro..."
- Tool calls: Write → `/src/pages/landing.astro`
- Generated code displayed in expandable block
- "Apply Changes" button to integrate

### 2. Modify Existing Code

**User:** "Add a pricing table to the landing page"

**AI Response:**
- Shows thinking: "I'll read the existing file and add pricing..."
- Tool calls: Read → `/src/pages/landing.astro`
- Tool calls: Edit → Add pricing section
- Shows diff of changes
- "Apply Changes" button

### 3. Debug Issue

**User:** "Fix the broken navigation menu"

**AI Response:**
- Shows thinking: "Let me search for navigation components..."
- Tool calls: Grep → Search for "nav"
- Tool calls: Read → Navigation component
- Tool calls: Edit → Fix issue
- Explanation of what was fixed

## Error Handling

The component handles multiple error scenarios:

1. **Network Errors** - Toast notification with retry option
2. **API Errors** - Clear error message in chat
3. **Tool Errors** - Display in tool call card with details
4. **Timeout Errors** - Graceful degradation after 10 minutes

## Performance

- **Streaming** - Immediate feedback, no waiting for full response
- **Code Splitting** - Component loaded only when needed
- **Memoization** - Optimized re-renders with useCallback
- **Lazy Loading** - Tool details loaded on expand

## Customization

### Change Model

```typescript
// In streamResponse function
body: JSON.stringify({
  messages: [...],
  model: "opus" // Change from "sonnet"
})
```

### Custom Suggestions

```typescript
const suggestions = [
  "Your custom suggestion 1",
  "Your custom suggestion 2",
  // Add more...
];
```

### Styling Overrides

```typescript
// Custom message bubble colors
<Message from={message.from} className="custom-class">
  {/* ... */}
</Message>
```

## Testing

```bash
# Start dev server
cd web && bun run dev

# Open chat interface
open http://localhost:4321/chat/builder

# Test features
1. Enter message and submit
2. Watch streaming response
3. View thinking process
4. Expand tool calls
5. Click "Apply Changes"
6. Copy code blocks
```

## Troubleshooting

### No response from AI
- Check Claude Code authentication: `claude login`
- Verify API endpoint is running
- Check browser console for errors

### Tool calls not showing
- Check SSE parsing in `streamResponse`
- Verify API returns correct format
- Check `currentToolCalls` state updates

### Code blocks not rendering
- Check markdown parsing in MessageResponse
- Verify code fence syntax (```)
- Check `extractCodeBlocks` function

## Future Enhancements

- [ ] File preview before applying changes
- [ ] Multi-file diff viewer
- [ ] Undo/redo for applied changes
- [ ] Export conversation history
- [ ] Share conversation link
- [ ] Voice input support
- [ ] Image upload for mockups
- [ ] Real-time collaboration

## Related Components

- `/web/src/components/ai/PromptInput.tsx` - Input component
- `/web/src/components/ai/Message.tsx` - Message display
- `/web/src/components/ai/ChatMessages.tsx` - Message list
- `/web/src/pages/api/chat-claude-code.ts` - API endpoint

## Documentation

- Template-First Development: `/web/src/pages/shop/TEMPLATE-README.md`
- Architecture Guide: `/one/knowledge/astro-effect-simple-architecture.md`
- Component Patterns: `/web/src/components/CLAUDE.md`
