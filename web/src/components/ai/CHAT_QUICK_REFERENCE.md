# Chat System - Quick Reference Guide

## File Locations at a Glance

```
/web/src/pages/
├── ai-chat.astro                    # Marketing page (features showcase)
├── examples/
│   └── basic-chat.astro             # Free tier example
├── chat/
│   ├── index.astro                  # Premium chat (main)
│   ├── simple.astro                 # Free chat (main)
│   ├── premium-demo.astro           # Premium feature demo
│   └── [threadId].astro             # Persistent thread (backend TBD)
└── api/
    └── chat.ts                      # OpenRouter bridge endpoint

/web/src/components/ai/
├── basic/
│   ├── SimpleChatClient.tsx         # Free tier component
│   ├── FreeChatClient.tsx           # Alternative free tier
│   ├── MessageList.tsx              # Message renderer
│   ├── PromptInput.tsx              # Input interface
│   └── Suggestions.tsx              # Quick prompts
├── premium/
│   ├── PremiumChatClient.tsx        # Premium component
│   ├── AgentMessage.tsx             # Extended message renderer
│   ├── Reasoning.tsx                # Reasoning visualization
│   └── ToolCall.tsx                 # Tool call display
└── CHAT_ARCHITECTURE.md             # This documentation
```

## Routes

| Path | Component | Tier | Purpose |
|------|-----------|------|---------|
| `/ai-chat` | Marketing page | Any | Showcase features & pricing |
| `/chat` (simple.astro) | SimpleChatClient | Free | Main free chat app |
| `/chat/index` | PremiumChatClient | Premium | Main premium chat app |
| `/chat/premium-demo` | Demo components | Any | Interactive feature demo |
| `/chat/[threadId]` | (Backend TBD) | Premium | Persistent thread viewer |
| `/examples/basic-chat` | SimpleChatClient | Free | Example implementation |

## Models (All via OpenRouter)

```
google/gemini-2.5-flash-lite    (default, free tier)
openai/gpt-4
openai/gpt-3.5-turbo
anthropic/claude-3-opus
anthropic/claude-3-sonnet
meta-llama/llama-3-70b-instruct
google/gemini-pro-1.5
+ 8+ more via OpenRouter
```

## API Key Management

| Tier | Storage | Location | Server? |
|------|---------|----------|---------|
| Free | localStorage | Browser | No, direct to OpenRouter |
| Premium | localStorage (now) | Browser | Planned: Convex backend |

**Storage Keys:**
- `openrouter-api-key` - User's API key
- `openrouter-model` - Selected model ID

## Request/Response Format

### /api/chat Endpoint

**Request (POST):**
```
{
  messages: Message[],
  apiKey: string,           // User's OpenRouter key
  model?: string,           // Default: 'openai/gpt-4'
  premium?: boolean         // Enables chart generation
}
```

**Response: Server-Sent Events (SSE)**
```
data: {"choices":[{"delta":{"content":"Hello"}}]}
data: {"type":"ui","payload":{"component":"chart",...}}
data: [DONE]
```

## Message Types

### Free Tier
```typescript
{
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}
```

### Premium Tier (Extended)
```typescript
{
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  type?: 'text' | 'reasoning' | 'tool_call' | 'ui';
  payload?: { ... };
  timestamp?: number;
}
```

## UI Component Types (Premium)

| Type | Purpose | Example |
|------|---------|---------|
| `text` | Regular message | Chat bubble |
| `reasoning` | Agent thinking | Step-by-step logic |
| `tool_call` | Function call | Function args + result |
| `ui` | Generated UI | Chart, table, form |

## Feature Comparison

| Feature | Free | Premium |
|---------|------|---------|
| Chat | ✓ | ✓ |
| Models | ✓ (15+) | ✓ (15+) |
| Streaming | ✓ | ✓ |
| Persistence | ✗ | Soon |
| Reasoning viz | ✗ | ✓ |
| Tool calls | ✗ | ✓ |
| Charts/Tables | ✗ | ✓ |

## Key Differences

### SimpleChatClient (Free)
- Manual API key management
- localStorage key storage
- Basic message types only
- No reasoning/tool visualization
- Demo responses: None

### PremiumChatClient (Premium)
- Same key management (for now)
- Extended message types
- Agent reasoning steps
- Tool call visualization
- Generative UI (charts, tables, buttons, cards)
- Demo responses for feature showcase
- Client-side chart fallback

## Development Commands

```bash
# Start dev server (includes chat pages)
cd /Users/toc/Server/ONE/web
bun run dev

# Build for production
bun run build

# Type checking
bunx astro check

# Run tests
bun test
```

## Environment Setup

```bash
# Copy example
cp .env.example .env.local

# Add your keys
PUBLIC_CONVEX_URL=https://...     # Optional, for backend features
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Common Tasks

### Add a new model to the list
Edit `POPULAR_MODELS` array in:
- `SimpleChatClient.tsx`
- `FreeChatClient.tsx`
- `PremiumChatClient.tsx`

### Change default model
Edit `useState` initialization:
```typescript
const [selectedModel, setSelectedModel] = useState('MODEL_ID_HERE');
```

### Customize system prompt
Edit `SYSTEM_PROMPT` in `/web/src/pages/api/chat.ts`

### Add demo responses
Edit `DEMO_RESPONSES` in `PremiumChatClient.tsx`

### Change suggestions
Edit `PROMPT_SUGGESTIONS` array in chat components

## Error Handling

| Error | Free Tier | Premium Tier |
|-------|-----------|--------------|
| No API key | Setup form | Setup form |
| Invalid key | Alert + retry | Alert + retry |
| Network error | Error message | Error message |
| Demo error | N/A | Graceful fallback |
| Stream error | Close stream | Close stream + fallback detection |

## Security Notes

1. API key stored in browser localStorage
2. NOT sent to ONE servers
3. Only sent directly to OpenRouter API
4. Users advised to clear before sharing device
5. Future: Backend key storage via Convex

## Performance Optimizations

- Streaming responses (no waiting for complete response)
- Client-side only (no backend latency on free tier)
- Efficient state updates (only changed messages)
- Auto-scroll to new messages
- Graceful fallback for UI component detection

## Future Roadmap

- [ ] Backend thread persistence
- [ ] User authentication (Better Auth)
- [ ] API quota management
- [ ] Usage analytics
- [ ] Team collaboration
- [ ] Custom workflows
- [ ] Search history
- [ ] Message bookmarking

---

**Last Updated**: 2025-01-12
**Component Architecture**: `/web/src/components/ai/CHAT_ARCHITECTURE.md`
