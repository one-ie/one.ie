# Chat Platform - Technical Documentation

**Version:** 1.0.0
**Status:** ✅ Complete
**Scope:** Global
**Audience:** Developers

## Architecture Overview

### Technology Stack

**Frontend:**
- **Framework:** Astro 5 (SSR) + React 19 (islands)
- **Styling:** Tailwind v4 CSS
- **UI Components:** shadcn/ui (50+ components)
- **State Management:** nanostores (island communication)
- **Real-time:** Convex React hooks (useQuery, useMutation)

**Backend:**
- **Database:** Convex (real-time NoSQL)
- **Schema:** 6-dimension ontology (5 tables)
- **Business Logic:** Effect.ts services
- **API Layer:** Convex queries/mutations

**Deployment:**
- **Frontend:** Cloudflare Pages (SSR)
- **Backend:** Convex Cloud (shocking-falcon-870.convex.cloud)

### 6-Dimension Ontology Mapping

The chat platform maps perfectly to the 6-dimension ontology:

```typescript
// 1. GROUPS - Multi-tenant containers
{
  channels: Thing<type="channel", groupId=org>
  messages: Thing<type="message", groupId=channel>
}

// 2. PEOPLE - Users and AI agents
{
  users: Thing<type="creator", role="org_user">
  agents: Thing<type="agent", role="assistant">
}

// 3. THINGS - Chat entities
{
  type: "message" | "channel" | "thread" | "agent"
  properties: {
    content: string;        // Message text
    channelId: Id<"things">; // Parent channel
    parentId?: Id<"things">; // Thread parent
    mentions?: string[];    // @mentioned user IDs
  }
}

// 4. CONNECTIONS - Relationships
{
  "member_of": User → Channel
  "replied_to": Message → Message
  "mentioned_in": User → Message
  "reacted_to": User → Message (with emoji)
}

// 5. EVENTS - Complete audit trail
{
  "message_sent": { messageId, channelId, authorId, mentions }
  "message_edited": { messageId, oldContent, newContent }
  "message_deleted": { messageId, deletedBy }
  "mention_received": { userId, messageId, mentionType }
  "reaction_added": { userId, messageId, emoji }
  "presence_updated": { userId, status, timestamp }
}

// 6. KNOWLEDGE - Semantic search
{
  chunks: Message content indexed for search
  labels: ["channel:general", "author:john", "has:mention"]
  embeddings: Vector embeddings for semantic search
}
```

## Database Schema

### Things Table (Messages & Channels)

```typescript
// Backend: /backend/convex/schema.ts

things: defineTable({
  // Core fields
  type: v.string(),  // "message" | "channel" | "thread"
  name: v.string(),  // Message preview or channel name
  groupId: v.id("groups"),  // Multi-tenant isolation

  // Properties (JSON object)
  properties: v.object({
    // Message properties
    content: v.optional(v.string()),      // Full message text
    channelId: v.optional(v.string()),    // Parent channel
    parentId: v.optional(v.string()),     // Thread parent
    authorId: v.optional(v.string()),     // Author thing ID
    mentions: v.optional(v.array(v.string())), // @mentioned IDs
    reactions: v.optional(v.array(v.object({
      emoji: v.string(),
      userId: v.string(),
      timestamp: v.number()
    }))),

    // Channel properties
    isPrivate: v.optional(v.boolean()),   // Public vs private
    topic: v.optional(v.string()),        // Channel description
    memberCount: v.optional(v.number()),
  }),

  // Status & timestamps
  status: v.union(
    v.literal("draft"),
    v.literal("active"),
    v.literal("archived"),
    v.literal("deleted")
  ),
  createdAt: v.number(),
  updatedAt: v.number()
})
.index("by_type_group", ["type", "groupId"])
.index("by_channel", ["properties.channelId", "createdAt"])
.index("by_parent", ["properties.parentId"])
.index("by_author", ["properties.authorId"])
```

### Connections Table (Mentions & Reactions)

```typescript
connections: defineTable({
  type: v.string(),  // "mentioned_in" | "reacted_to" | "member_of"
  sourceId: v.id("things"),  // User or agent
  targetId: v.id("things"),  // Message or channel
  groupId: v.id("groups"),

  properties: v.object({
    // Mention properties
    isRead: v.optional(v.boolean()),      // Mention read status
    notifiedAt: v.optional(v.number()),   // When notification sent

    // Reaction properties
    emoji: v.optional(v.string()),        // Emoji character
  }),

  status: v.string(),
  createdAt: v.number(),
  updatedAt: v.number()
})
.index("by_type_source", ["type", "sourceId"])
.index("by_type_target", ["type", "targetId"])
.index("by_mentions", ["type", "targetId", "properties.isRead"])
```

### Events Table (Audit Trail)

```typescript
events: defineTable({
  type: v.string(),  // "message_sent" | "mention_received" | etc.
  actorId: v.id("things"),   // Who performed action
  targetId: v.id("things"),  // What was affected
  groupId: v.id("groups"),

  metadata: v.object({
    // Event-specific data
    action: v.string(),
    messageId: v.optional(v.string()),
    channelId: v.optional(v.string()),
    mentions: v.optional(v.array(v.string())),
    // ... other metadata
  }),

  timestamp: v.number()
})
.index("by_type_group", ["type", "groupId"])
.index("by_actor", ["actorId", "timestamp"])
.index("by_target", ["targetId", "timestamp"])
```

## Backend API

### Queries (Read Operations)

All queries use Convex real-time subscriptions. Frontend components automatically re-render when data changes.

#### getChannelMessages

```typescript
// Backend: /backend/convex/queries/chat.ts

export const getChannelMessages = query({
  args: {
    channelId: v.string(),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),  // Pagination
  },
  handler: async (ctx, { channelId, limit = 50, cursor }) => {
    // Query messages by channel, ordered by creation time
    const messages = await ctx.db
      .query("things")
      .withIndex("by_channel", q =>
        q.eq("properties.channelId", channelId)
      )
      .order("desc")  // Newest first
      .take(limit);

    // Enrich with author data
    return Promise.all(messages.map(async msg => ({
      ...msg,
      author: await ctx.db.get(msg.properties.authorId),
      replyCount: await getReplyCount(ctx, msg._id),
      reactions: msg.properties.reactions || []
    })));
  }
});
```

**Frontend Usage:**
```typescript
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function MessageList({ channelId }) {
  const messages = useQuery(api.queries.getChannelMessages, {
    channelId,
    limit: 50
  });

  // Automatically updates when new messages arrive!
  return messages?.map(msg => <Message key={msg._id} {...msg} />);
}
```

#### getUserMentions

```typescript
export const getUserMentions = query({
  args: {
    limit: v.optional(v.number()),
    unreadOnly: v.optional(v.boolean())
  },
  handler: async (ctx, { limit = 50, unreadOnly = false }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // Get current user thing
    const user = await getUserByEmail(ctx, identity.email);
    if (!user) return [];

    // Query mention connections
    let query = ctx.db
      .query("connections")
      .withIndex("by_type_source", q =>
        q.eq("type", "mentioned_in").eq("sourceId", user._id)
      );

    if (unreadOnly) {
      query = query.filter(q =>
        q.eq(q.field("properties.isRead"), false)
      );
    }

    const mentions = await query.take(limit);

    // Enrich with message and author data
    return Promise.all(mentions.map(async mention => {
      const message = await ctx.db.get(mention.targetId);
      const author = await ctx.db.get(message.properties.authorId);
      const channel = await ctx.db.get(message.properties.channelId);

      return {
        ...message,
        author,
        channel,
        isRead: mention.properties.isRead || false
      };
    }));
  }
});
```

#### searchMentionables

```typescript
export const searchMentionables = query({
  args: {
    query: v.string(),
    channelId: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, { query, channelId, limit = 10 }) => {
    const lowerQuery = query.toLowerCase();

    // Search users and agents in channel
    const channel = await ctx.db.get(channelId);
    const members = await getChannelMembers(ctx, channelId);

    // Filter by name or email
    const matches = members
      .filter(m =>
        m.name.toLowerCase().includes(lowerQuery) ||
        m.properties.email?.toLowerCase().includes(lowerQuery)
      )
      .slice(0, limit);

    return matches.map(m => ({
      id: m._id,
      name: m.name,
      type: m.type,  // "creator" or "agent"
      avatar: m.properties.avatarUrl,
      email: m.properties.email
    }));
  }
});
```

### Mutations (Write Operations)

#### sendMessage

```typescript
// Backend: /backend/convex/mutations/chat.ts

export const sendMessage = mutation({
  args: {
    channelId: v.string(),
    content: v.string(),
    parentId: v.optional(v.string()),  // For threads
    mentions: v.optional(v.array(v.string()))
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const author = await getUserByEmail(ctx, identity.email);
    if (!author) throw new Error("User not found");

    const channel = await ctx.db.get(args.channelId);
    if (!channel) throw new Error("Channel not found");

    // Create message thing
    const messageId = await ctx.db.insert("things", {
      type: args.parentId ? "thread_reply" : "message",
      name: args.content.slice(0, 100),  // Preview
      groupId: channel.groupId,
      properties: {
        content: args.content,
        channelId: args.channelId,
        parentId: args.parentId,
        authorId: author._id,
        mentions: args.mentions || []
      },
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    // Create mention connections
    if (args.mentions && args.mentions.length > 0) {
      await Promise.all(args.mentions.map(userId =>
        ctx.db.insert("connections", {
          type: "mentioned_in",
          sourceId: userId,
          targetId: messageId,
          groupId: channel.groupId,
          properties: {
            isRead: false,
            notifiedAt: Date.now()
          },
          status: "active",
          createdAt: Date.now(),
          updatedAt: Date.now()
        })
      ));

      // Trigger agent mentions
      const agents = args.mentions.filter(id =>
        // Check if ID is an agent
      );
      for (const agentId of agents) {
        await triggerAgentMention(ctx, {
          agentId,
          messageId,
          content: args.content
        });
      }
    }

    // Log event
    await ctx.db.insert("events", {
      type: "content_event",
      actorId: author._id,
      targetId: messageId,
      groupId: channel.groupId,
      metadata: {
        action: "message_sent",
        channelId: args.channelId,
        mentions: args.mentions,
        hasThread: !!args.parentId
      },
      timestamp: Date.now()
    });

    return messageId;
  }
});
```

**Frontend Usage:**
```typescript
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

function MessageComposer({ channelId }) {
  const sendMessage = useMutation(api.mutations.sendMessage);

  const handleSend = async (content, mentions) => {
    await sendMessage({
      channelId,
      content,
      mentions: mentions.map(m => m.id)
    });
  };

  return <textarea onSubmit={handleSend} />;
}
```

#### markMentionAsRead

```typescript
export const markMentionAsRead = mutation({
  args: {
    messageId: v.string()
  },
  handler: async (ctx, { messageId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await getUserByEmail(ctx, identity.email);
    if (!user) throw new Error("User not found");

    // Find mention connection
    const mention = await ctx.db
      .query("connections")
      .withIndex("by_type_target", q =>
        q.eq("type", "mentioned_in").eq("targetId", messageId)
      )
      .filter(q => q.eq(q.field("sourceId"), user._id))
      .first();

    if (!mention) return;

    // Update isRead flag
    await ctx.db.patch(mention._id, {
      properties: {
        ...mention.properties,
        isRead: true
      },
      updatedAt: Date.now()
    });

    // Log event
    await ctx.db.insert("events", {
      type: "content_event",
      actorId: user._id,
      targetId: messageId,
      groupId: mention.groupId,
      metadata: {
        action: "mention_marked_read"
      },
      timestamp: Date.now()
    });
  }
});
```

## Frontend Components

### Component Architecture

```
/web/src/components/chat/
├── MessageList.tsx          # Main message feed
├── MessageComposer.tsx      # Input with @mention autocomplete
├── Message.tsx              # Single message card
├── ThreadView.tsx           # Thread modal
├── MentionAutocomplete.tsx  # @mention dropdown
├── MentionsList.tsx         # Mentions inbox
├── MentionNotifications.tsx # Unread count badge
├── MentionBadge.tsx         # Mention pill in message
├── PresenceIndicator.tsx    # Online status dot
└── TypingIndicator.tsx      # "User is typing..."
```

### Real-Time Subscriptions

All components use Convex `useQuery` for automatic real-time updates:

```typescript
// Component re-renders automatically when data changes!
const messages = useQuery(api.queries.getChannelMessages, { channelId });
const mentions = useQuery(api.queries.getUserMentions, { unreadOnly: true });
const typing = useQuery(api.queries.getTypingUsers, { channelId });
```

**How it works:**
1. Component calls `useQuery` with query name + args
2. Convex establishes WebSocket connection
3. Backend pushes updates when data changes
4. React re-renders component with new data
5. No polling, no manual refreshing needed!

### @Mention Autocomplete Pattern

```typescript
// web/src/components/chat/MentionAutocomplete.tsx

export function MentionAutocomplete({ channelId, onSelect }) {
  const [query, setQuery] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  // Real-time search as user types
  const results = useQuery(api.queries.searchMentionables, {
    query,
    channelId,
    limit: 10
  });

  const handleInput = (e) => {
    const text = e.target.value;
    const lastChar = text[text.length - 1];

    if (lastChar === "@") {
      setShowMenu(true);
      setQuery("");
    } else if (showMenu) {
      // Extract query after @
      const atIndex = text.lastIndexOf("@");
      setQuery(text.slice(atIndex + 1));
    }
  };

  const handleSelect = (user) => {
    onSelect(user);
    setShowMenu(false);
    setQuery("");
  };

  return (
    <div>
      <textarea onChange={handleInput} />
      {showMenu && results && (
        <Menu>
          {results.map(user => (
            <MenuItem
              key={user.id}
              onClick={() => handleSelect(user)}
            >
              <Avatar src={user.avatar} />
              <span>{user.name}</span>
              <Badge>{user.type}</Badge>
            </MenuItem>
          ))}
        </Menu>
      )}
    </div>
  );
}
```

### Typing Indicators

```typescript
// Real-time typing indicator pattern

export function TypingIndicator({ channelId }) {
  const typing = useQuery(api.queries.getTypingUsers, { channelId });

  if (!typing || typing.length === 0) return null;

  const names = typing.map(u => u.name).join(", ");

  return (
    <div className="text-sm text-muted-foreground">
      {names} {typing.length === 1 ? "is" : "are"} typing...
    </div>
  );
}

// Update typing status on keypress
export function MessageComposer({ channelId }) {
  const updatePresence = useMutation(api.mutations.updatePresence);

  const handleKeyPress = useCallback(
    debounce(() => {
      updatePresence({ channelId, isTyping: true });
    }, 300),
    [channelId]
  );

  return <textarea onKeyPress={handleKeyPress} />;
}
```

## AI Agent Integration

### Agent Mention Flow

1. **User types `@agent` in message**
2. **Frontend:** Autocomplete shows available agents
3. **User sends message** with agent mention
4. **Backend:** `sendMessage` mutation creates message + mention connection
5. **Backend:** `triggerAgentMention` mutation fires
6. **Agent:** Receives event, processes message, responds
7. **Frontend:** Response appears in thread (real-time via Convex)

### Agent Response Handler

```typescript
// Backend: /backend/convex/mutations/chat.ts

export const triggerAgentMention = mutation({
  args: {
    agentId: v.string(),
    messageId: v.string(),
    content: v.string()
  },
  handler: async (ctx, { agentId, messageId, content }) => {
    const agent = await ctx.db.get(agentId);
    if (!agent || agent.type !== "agent") return;

    const message = await ctx.db.get(messageId);
    if (!message) return;

    // Call agent's webhook or API
    const agentConfig = agent.properties.config;
    const response = await callAgentAPI(agentConfig, {
      messageId,
      content,
      channelId: message.properties.channelId,
      authorId: message.properties.authorId
    });

    // Agent responds in thread
    if (response.text) {
      await sendMessage(ctx, {
        channelId: message.properties.channelId,
        content: response.text,
        parentId: messageId,  // Reply in thread
        authorId: agentId     // Agent is author
      });
    }

    // Log event
    await ctx.db.insert("events", {
      type: "task_event",
      actorId: agentId,
      targetId: messageId,
      groupId: message.groupId,
      metadata: {
        action: "agent_responded",
        responseTime: Date.now() - message.createdAt
      },
      timestamp: Date.now()
    });
  }
});
```

## Performance Optimizations

### Real-Time Subscription Management

**Problem:** Too many subscriptions slow down app
**Solution:** Subscribe only to visible data

```typescript
// Only subscribe when channel is visible
export function ChatPage({ channelId }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleVisibility = () => {
      setIsVisible(document.visibilityState === "visible");
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Subscription only active when visible
  const messages = useQuery(
    isVisible ? api.queries.getChannelMessages : null,
    { channelId }
  );

  return <MessageList messages={messages} />;
}
```

### Message List Virtualization

```typescript
import { useVirtualizer } from "@tanstack/react-virtual";

export function MessageList({ messages }) {
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,  // Estimated message height
    overscan: 5  // Render 5 extra items above/below
  });

  return (
    <div ref={parentRef} style={{ height: "600px", overflow: "auto" }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(virtualRow => {
          const message = messages[virtualRow.index];
          return (
            <div
              key={message._id}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`
              }}
            >
              <Message {...message} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### Mention Autocomplete Debouncing

```typescript
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export function MentionAutocomplete() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);  // 300ms delay

  // Only searches after user stops typing for 300ms
  const results = useQuery(api.queries.searchMentionables, {
    query: debouncedQuery,
    channelId,
    limit: 10
  });

  return <Autocomplete results={results} />;
}
```

## Testing

### Unit Tests (Vitest + React Testing Library)

```typescript
// web/test/components/chat/Message.test.tsx

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Message } from "@/components/chat/Message";

describe("Message", () => {
  it("renders message content", () => {
    render(<Message
      content="Hello world"
      author={{ name: "John" }}
      createdAt={Date.now()}
    />);

    expect(screen.getByText("Hello world")).toBeInTheDocument();
    expect(screen.getByText("John")).toBeInTheDocument();
  });

  it("highlights @mentions", () => {
    render(<Message
      content="Hey @alice, can you review?"
      mentions={[{ id: "alice", name: "Alice" }]}
      author={{ name: "John" }}
      createdAt={Date.now()}
    />);

    const mention = screen.getByText("@alice");
    expect(mention).toHaveClass("mention-highlight");
  });
});
```

### Integration Tests (Convex Backend)

```typescript
// backend/convex/tests/chat.test.ts

import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import schema from "../schema";
import { sendMessage, getUserMentions } from "../mutations/chat";

test("send message with mention creates connection", async () => {
  const t = convexTest(schema);

  // Create test user
  const userId = await t.mutation(internal.testing.createUser, {
    email: "test@example.com",
    name: "Test User"
  });

  // Create channel
  const channelId = await t.mutation(internal.testing.createChannel, {
    name: "general"
  });

  // Send message with mention
  const messageId = await t.mutation(sendMessage, {
    channelId,
    content: "Hey @test, check this out",
    mentions: [userId]
  });

  // Verify mention connection created
  const mentions = await t.query(getUserMentions, {
    limit: 10
  });

  expect(mentions).toHaveLength(1);
  expect(mentions[0]._id).toBe(messageId);
  expect(mentions[0].isRead).toBe(false);
});
```

## Deployment

### Environment Variables

```bash
# .env.production

# Convex backend
CONVEX_DEPLOYMENT=shocking-falcon-870
CONVEX_URL=https://shocking-falcon-870.convex.cloud

# Better Auth
AUTH_SECRET=<random-secret>
AUTH_TRUST_HOST=true

# Cloudflare
CLOUDFLARE_ACCOUNT_ID=<account-id>
CLOUDFLARE_PROJECT_NAME=one-chat
```

### Build Process

```bash
# Backend deployment
cd backend/
npx convex deploy

# Frontend build
cd web/
bun run build

# Frontend deployment
wrangler pages deploy dist --project-name=one-chat
```

### Monitoring

**Convex Dashboard:**
- https://dashboard.convex.dev/t/shocking-falcon-870
- Query performance metrics
- Real-time connection count
- Error logs

**Cloudflare Analytics:**
- Page views and unique visitors
- Core Web Vitals (LCP, FID, CLS)
- Geographic distribution

## Known Issues & Limitations

### Current Limitations

1. **File uploads not implemented** - Use external links for now
2. **Search limited to text** - No attachment search
3. **Voice/video calls not supported** - Use external tools
4. **Maximum 1000 messages per query** - Pagination required for larger channels
5. **Typing indicators clear after 3s** - No persistent typing state

### Known Issues

**Issue #1: Chat components require backend integration**
- **Status:** Documented
- **Impact:** Stub API used for production build
- **Workaround:** Real backend integration needed for full functionality
- **Timeline:** Next sprint

**Issue #2: @mention autocomplete race condition**
- **Status:** Low priority
- **Impact:** Occasionally shows stale results if typing very fast
- **Workaround:** Debouncing helps (300ms)
- **Fix:** Use request ID to cancel stale requests

## Future Enhancements

### Planned Features

1. **Rich text editor** - Markdown with preview
2. **File uploads** - Images, PDFs, attachments
3. **Message search** - Full-text + filters
4. **Channel analytics** - Message volume, active users
5. **Custom emojis** - Upload org-specific emojis
6. **Message templates** - Save and reuse common messages
7. **Voice/video calls** - WebRTC integration
8. **Screen sharing** - Collaborate visually
9. **Advanced notifications** - Desktop, mobile, email
10. **Read receipts** - See who viewed messages

## Related Documentation

- **User Guide:** [Chat Platform User Guide](./chat-platform.md)
- **API Reference:** [Chat API Documentation](/backend/API-DOCUMENTATION.md)
- **Ontology:** [6-Dimension Ontology](/one/knowledge/ontology.md)
- **Convex Docs:** https://docs.convex.dev
- **React 19:** https://react.dev

---

**Built with clarity, simplicity, and infinite scale in mind.**
