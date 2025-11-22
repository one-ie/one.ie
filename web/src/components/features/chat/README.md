# Conversation History System

Complete conversation management for AI chat interfaces with persistent storage, version control, and search capabilities.

## Features

### ✅ Implemented (Cycle 18)

1. **Show Previous Prompts and Responses**
   - Sidebar showing all past conversations
   - Click to load any conversation
   - Visual indicators for active conversation

2. **Resume Conversation from Any Point**
   - Click "Resume from here" on any message
   - Conversation continues from that point
   - Previous messages are preserved in history

3. **Undo/Redo AI Changes**
   - Track code versions automatically
   - Revert to any previous version
   - View diff between versions
   - Visual version badges on messages

4. **Export Conversation as Markdown**
   - Download conversations as `.md` files
   - Includes metadata, timestamps, and code blocks
   - Preserves formatting and structure

5. **Clear Conversation (with Confirmation)**
   - Confirmation dialog before clearing
   - Keeps conversation in history
   - Messages can be restored by loading again

6. **Search Conversation History**
   - Search across all conversations
   - Find specific messages
   - Filter by content

## Components

### `ChatWithHistory`
Main wrapper component that adds conversation history to any chat interface.

```tsx
import { ChatWithHistory } from '@/components/features/chat/ChatWithHistory';

<ChatWithHistory
  onMessagesChange={(messages) => console.log(messages)}
  onCodeRevert={(code, file) => console.log('Reverted:', code)}
>
  {/* Your chat UI */}
</ChatWithHistory>
```

**Props:**
- `children` - Your chat interface
- `onMessagesChange` - Called when messages change
- `onCodeRevert` - Called when code is reverted
- `enableAutoSave` - Auto-save messages (default: true)

### `useConversationHistory`
Hook for managing conversation messages.

```tsx
const { addMessage, trackCodeVersion, currentConversationId } = useConversationHistory();

// Add a message
const message = addMessage({
  role: 'user',
  content: 'Hello!',
  type: 'text',
});

// Track code changes
trackCodeVersion(messageId, code, 'example.ts');
```

### `ConversationHistorySidebar`
Sidebar showing all conversations with search and management.

**Features:**
- List all conversations
- Search by content
- Delete conversations
- Export as markdown
- Create new conversations

### `ConversationHistoryPanel`
Panel showing messages with resume and version control.

**Features:**
- View all messages in conversation
- Resume from any message
- View code versions
- Revert to previous versions
- Expand/collapse code diffs

### `ConversationControls`
Control bar with conversation actions.

**Features:**
- Message count badge
- Search within conversation
- Export current conversation
- Toggle history sidebar
- Clear conversation (with confirmation)

## Store

### `conversationHistory.ts`
Nanostore managing all conversation data with localStorage persistence.

**Functions:**
- `createConversation(title, model)` - Create new conversation
- `addMessage(message)` - Add message to current conversation
- `updateMessage(id, updates)` - Update existing message
- `trackCodeVersion(messageId, code, file)` - Track code change
- `revertToVersion(version)` - Revert to specific version
- `deleteConversation(id)` - Delete conversation
- `clearCurrentConversation()` - Clear messages
- `loadConversation(id)` - Load conversation messages
- `resumeFromMessage(messageId)` - Resume from specific message
- `exportAsMarkdown(id)` - Export as markdown
- `searchConversations(query)` - Search all conversations
- `getAllConversations()` - Get all conversations sorted
- `getCurrentConversation()` - Get active conversation

## Data Structure

### ConversationMessage
```typescript
interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  type?: 'text' | 'reasoning' | 'tool_call' | 'tool_result' | 'ui';
  payload?: any;
  timestamp: number;
  reasoning?: {
    content: string;
    duration?: number;
  };
  toolCalls?: Array<{
    name: string;
    args: Record<string, any>;
    result?: any;
    state: string;
  }>;
  codeVersion?: {
    version: number;
    previousCode?: string;
    currentCode?: string;
    fileChanged?: string;
  };
}
```

### Conversation
```typescript
interface Conversation {
  id: string;
  title: string;
  messages: ConversationMessage[];
  createdAt: number;
  updatedAt: number;
  model?: string;
  codeVersions: Array<{
    messageId: string;
    version: number;
    code: string;
    file: string;
    timestamp: number;
  }>;
}
```

## Usage Examples

### Basic Integration

```tsx
import { ChatWithHistory } from '@/components/features/chat/ChatWithHistory';
import { YourChatComponent } from './YourChatComponent';

export function ChatPage() {
  return (
    <ChatWithHistory>
      <YourChatComponent />
    </ChatWithHistory>
  );
}
```

### With Custom Handlers

```tsx
import { ChatWithHistory } from '@/components/features/chat/ChatWithHistory';
import { useState } from 'react';

export function ChatPage() {
  const [messages, setMessages] = useState([]);

  return (
    <ChatWithHistory
      onMessagesChange={(msgs) => {
        setMessages(msgs);
        console.log('Messages updated:', msgs);
      }}
      onCodeRevert={(code, file) => {
        console.log('Reverting code in', file);
        // Apply code changes to your editor
      }}
    >
      <YourChatComponent messages={messages} />
    </ChatWithHistory>
  );
}
```

### Manual Message Management

```tsx
import { useConversationHistory } from '@/components/features/chat/ChatWithHistory';

export function YourChatComponent() {
  const { addMessage, trackCodeVersion } = useConversationHistory();

  const handleSend = async (text: string) => {
    // Add user message
    const userMessage = addMessage({
      role: 'user',
      content: text,
      type: 'text',
    });

    // Get AI response
    const response = await getAIResponse(text);

    // Add assistant message
    const assistantMessage = addMessage({
      role: 'assistant',
      content: response,
      type: 'text',
    });

    // If response contains code, track it
    if (response.includes('```')) {
      trackCodeVersion(assistantMessage.id, extractCode(response), 'file.ts');
    }
  };

  return (
    // Your chat UI
  );
}
```

## Demo

Visit `/chat/history-demo` to see all features in action:

```
http://localhost:4321/chat/history-demo
```

## localStorage Keys

Conversations are stored in localStorage with these keys:
- `current-conversation-id` - Active conversation ID
- `conversations` - All conversations data

## Persistence

- All data persists in localStorage
- Survives page reloads
- Works offline
- No backend required

## Performance

- Efficient message rendering
- Code splitting for lazy loading
- Optimized search (client-side)
- Minimal re-renders with nanostores

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile: ✅ Full support

## File Structure

```
src/
├── stores/
│   └── conversationHistory.ts       # Nanostore with persistence
├── components/
│   └── features/
│       └── chat/
│           ├── ChatWithHistory.tsx           # Main wrapper
│           ├── ConversationHistorySidebar.tsx  # Sidebar component
│           ├── ConversationHistoryPanel.tsx    # History panel
│           ├── ConversationControls.tsx        # Control bar
│           ├── ChatHistoryDemo.tsx            # Demo component
│           └── README.md                      # This file
└── pages/
    └── chat/
        └── history-demo.astro         # Demo page
```

## Next Steps (Future Enhancements)

- [ ] Cloud sync (optional backend integration)
- [ ] Conversation branching (explore alternative paths)
- [ ] Rich text formatting in messages
- [ ] Attachments support (images, files)
- [ ] Conversation sharing (export/import)
- [ ] Analytics (message count, response time)
- [ ] Keyboard shortcuts
- [ ] Voice input/output integration

## Integration with Existing Chat

To add conversation history to an existing chat component:

1. **Wrap with ChatWithHistory:**
```tsx
<ChatWithHistory>
  <ExistingChatComponent />
</ChatWithHistory>
```

2. **Use the hook to save messages:**
```tsx
const { addMessage } = useConversationHistory();

// When user sends message
addMessage({ role: 'user', content: userInput, type: 'text' });

// When AI responds
addMessage({ role: 'assistant', content: aiResponse, type: 'text' });
```

3. **That's it!** History sidebar and controls are automatically added.

## Troubleshooting

**Q: Conversations not persisting?**
- Check browser's localStorage is enabled
- Check for quota exceeded errors (>5MB storage)
- Clear old conversations to free space

**Q: Search not working?**
- Search is case-insensitive and searches content only
- Ensure conversations have messages with content

**Q: Sidebar not showing?**
- Click the History icon in controls
- Check `historySidebarOpen` store value

**Q: Version control not tracking code?**
- Ensure you call `trackCodeVersion` after AI generates code
- Code must be in markdown code blocks for auto-detection

## Credits

Built with:
- [Nanostores](https://github.com/nanostores/nanostores) - State management
- [shadcn/ui](https://ui.shadcn.com) - UI components
- [Lucide Icons](https://lucide.dev) - Icons
- [React](https://react.dev) - UI framework

---

**Cycle 18 Complete** ✅

All conversation history features implemented and ready to use!
