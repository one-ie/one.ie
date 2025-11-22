---
title: App Development Plan - Chat-Based Collaboration Platform
dimension: things
category: plan
tags: app, chat, messaging, collaboration, discord, 100-cycle-plan
related_dimensions: groups, people, things, connections, events, knowledge
scope: feature
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
ai_context: |
  100-cycle plan for building a chat-based collaboration platform
  Like Discord/WhatsApp/Messenger with @mentions for people and agents
  Left sidebar: stream, organisations, groups, channels, tools, agents, people
  Main area: Chat interface with real-time messaging
---

# App Development Plan - Chat-Based Collaboration Platform

**Vision:** Build a Discord/WhatsApp/Messenger-like chat application integrated with the 6-dimension ontology, featuring real-time messaging, @mentions for people and agents, and organized sidebar navigation.

**Paradigm:** Cycle-based planning (not days). Each cycle = one concrete step < 3k tokens.

---

## 🎯 ONTOLOGY MAPPING

### Groups Dimension
- **Organizations** → Top-level tenant containers (company, community)
- **Groups** → Team containers within organizations
- **Channels** → Message streams within groups
- **Direct Messages** → 1:1 or group conversations

### People Dimension
- **Users** → Chat participants with roles (owner, admin, member)
- **@Mentions** → Tag people in conversations
- **Presence** → Online/offline/away status

### Things Dimension
- **Messages** → Chat message entities
- **Threads** → Message reply chains
- **Agents** → AI assistants that can be @mentioned
- **Tools** → Integrations (file upload, screen share, etc.)
- **Streams** → Activity feeds

### Connections Dimension
- **member_of** → User ↔ Organization/Group/Channel
- **mentioned_in** → Person/Agent ↔ Message
- **replied_to** → Message ↔ Message (threading)
- **pinned_to** → Message ↔ Channel
- **follows** → User ↔ Channel/Person

### Events Dimension
- **message_sent** → User created message
- **message_edited** → User modified message
- **message_deleted** → User removed message
- **user_joined** → User joined channel/group
- **user_left** → User left channel/group
- **user_mentioned** → User was @mentioned
- **typing_started** → User is typing

### Knowledge Dimension
- **Message search** → Vector embeddings for semantic search
- **Labels** → Tags, categories for messages/channels
- **RAG** → AI context from chat history

---

## Cycle 1-10: Foundation & Ontology Validation

**1. [CYCLE-001]** Validate chat app concept against 6-dimension ontology
- Map all features to Groups, People, Things, Connections, Events, Knowledge
- Ensure multi-tenant isolation via groupId scoping

**2. [CYCLE-002]** Identify all entity types (Thing types)
- `message` - Chat messages
- `thread` - Message threads/replies
- `channel` - Message channels
- `agent` - AI assistants
- `tool` - Integrations
- `stream` - Activity feeds

**3. [CYCLE-003]** Define connection types needed
- `member_of` - User to org/group/channel membership
- `mentioned_in` - @mentions in messages
- `replied_to` - Message threading
- `pinned_to` - Pinned messages
- `follows` - Channel/user subscriptions

**4. [CYCLE-004]** List event types to track
- `message_sent`, `message_edited`, `message_deleted`
- `user_joined`, `user_left`
- `user_mentioned`, `agent_mentioned`
- `typing_started`, `typing_stopped`

**5. [CYCLE-005]** Determine knowledge requirements
- Message embeddings for semantic search
- @mention autocomplete indexing
- Channel discovery/recommendations

**6. [CYCLE-006]** Define organization scope
- Multi-tenant: Each organization has isolated chat space
- Hierarchical: Org → Groups → Channels → Messages

**7. [CYCLE-007]** Define user roles
- `org_owner` - Full admin access
- `org_admin` - Manage groups/channels
- `org_user` - Chat participant
- `guest` - Limited access (read-only channels)

**8. [CYCLE-008]** Create vision document
- Problem: Fragmented communication across tools
- Solution: Unified chat with AI agents, perfect ontology mapping
- Value: Real-time collaboration with intelligent assistance

**9. [CYCLE-009]** Generate feature breakdown plan
- Phase 1: Core chat (messages, channels)
- Phase 2: @Mentions system
- Phase 3: Sidebar navigation
- Phase 4: AI agents integration

**10. [CYCLE-010]** Assign features to specialists
- Backend: Message schema, real-time queries, @mention parsing
- Frontend: Chat UI, sidebar, message composer
- Integration: Agent @mention hooks, WebSocket connections

---

## Cycle 11-20: Backend Schema & Services

**11. [CYCLE-011]** Design database schema for chat entities
- Add `message`, `channel`, `thread` to Things table types
- Define `mentioned_in`, `replied_to` connection types
- Add message_* event types

**12. [CYCLE-012]** Update backend/convex/schema.ts
- Extend thing type union with chat types
- Add message-specific fields (content, authorId, channelId)
- Add presence tracking fields (online, lastSeen)

**13. [CYCLE-013]** Create Effect.ts service: MessageService
- Pure functions: createMessage, editMessage, deleteMessage
- Validation: content length, @mention parsing, rate limiting
- Business logic: thread resolution, notification triggers

**14. [CYCLE-014]** Define service errors with tagged unions
- `MessageTooLong`, `ChannelNotFound`, `UserNotMember`
- `MentionInvalid`, `RateLimitExceeded`
- Use `_tag` field for type discrimination

**15. [CYCLE-015]** Write Convex queries for chat reads
- `getChannelMessages(channelId)` - Paginated message list
- `getThread(messageId)` - Thread with replies
- `searchMessages(query)` - Full-text + vector search
- `getUserMentions(userId)` - All @mentions for user

**16. [CYCLE-016]** Write Convex mutations for chat writes
- `sendMessage(channelId, content, mentions)` - Create message
- `editMessage(messageId, content)` - Update message
- `deleteMessage(messageId)` - Soft delete message
- `addReaction(messageId, emoji)` - React to message

**17. [CYCLE-017]** Add event logging to all mutations
- Log `message_sent` event on sendMessage
- Log `message_edited`, `message_deleted` events
- Log `user_mentioned` events for @mentions
- Ensure complete audit trail

**18. [CYCLE-018]** Implement organization scoping
- Filter all queries by user's groupId
- Validate user membership before message access
- Ensure multi-tenant data isolation

**19. [CYCLE-019]** Add rate limiting to mutations
- Limit messages per minute per user (prevent spam)
- Limit @mentions per message (prevent abuse)
- Return clear error messages on rate limit

**20. [CYCLE-020]** Write unit tests for MessageService
- Test message creation with valid/invalid content
- Test @mention parsing and validation
- Test thread creation and reply logic

---

## Cycle 21-30: Frontend Chat Components

**21. [CYCLE-021]** Create /web/src/pages/app/chat/[channelId].astro
- SSR page with channel metadata
- Pre-fetch initial messages for fast render
- SEO-friendly channel URLs

**22. [CYCLE-022]** Build ChatContainer.tsx component
- 3-column layout: Sidebar | Messages | Thread/Details
- Responsive: Stack on mobile
- Real-time updates via Convex subscriptions

**23. [CYCLE-023]** Build MessageList.tsx component
- Virtual scrolling for performance (react-window)
- Infinite scroll (load more on scroll up)
- Auto-scroll to bottom on new message
- Group messages by sender + time

**24. [CYCLE-024]** Build MessageComposer.tsx component
- Rich text input with markdown support
- @mention autocomplete dropdown
- Emoji picker integration
- File upload support (images, files)
- "User is typing..." indicator

**25. [CYCLE-025]** Build Message.tsx component
- Show avatar, username, timestamp
- Render markdown content
- Highlight @mentions with links
- Show edit/delete actions (for message author)
- Reaction emojis display

**26. [CYCLE-026]** Build ThreadView.tsx component
- Show parent message + all replies
- Inline reply composer
- Navigate back to channel view
- Real-time updates for new replies

**27. [CYCLE-027]** Implement real-time state with Convex
- `useQuery()` for messages subscription
- `useMutation()` for send/edit/delete
- Optimistic updates for instant feedback
- Error handling with rollback

**28. [CYCLE-028]** Style components with Tailwind v4
- Use design tokens from shadcn/ui
- Dark mode support via @variant dark
- Smooth transitions for message appearance
- Accessible focus states

**29. [CYCLE-029]** Ensure responsive mobile design
- Stack layout on small screens
- Swipe gestures for sidebar (mobile)
- Full-screen message composer
- Touch-friendly tap targets

**30. [CYCLE-030]** Add loading and error states
- Skeleton loaders for messages
- Empty state: "No messages yet"
- Error boundaries for graceful failures
- Retry buttons on network errors

---

## Cycle 31-40: Real-Time Features & WebSocket

**31. [CYCLE-031]** Implement typing indicators
- Track when user is typing (debounced)
- Broadcast typing events to channel
- Display "User is typing..." in UI
- Auto-clear after 3s of inactivity

**32. [CYCLE-032]** Add presence tracking
- Track user online/offline status
- Show green dot for online users
- Update lastSeen timestamp
- Display in user avatars

**33. [CYCLE-033]** Implement message read receipts
- Track when user reads message
- Show "read by X users" count
- Mark messages as read on scroll
- Highlight unread messages

**34. [CYCLE-034]** Add optimistic UI updates
- Instantly show sent message (pending state)
- Rollback on send failure
- Show upload progress for files
- Smooth transitions

**35. [CYCLE-035]** Implement message reactions
- Click emoji to react
- Show reaction counts
- Highlight user's own reactions
- Popular emojis quick-select

**36. [CYCLE-036]** Add message editing
- Edit within 15 minutes of send
- Show "edited" indicator
- Track edit history (events table)
- Real-time update for all viewers

**37. [CYCLE-037]** Add message deletion
- Soft delete (hide, keep in DB)
- Show "Message deleted" placeholder
- Only author or admin can delete
- Log deletion event

**38. [CYCLE-038]** Implement thread replies
- Click "Reply" to start thread
- Show reply count on parent message
- Thread sidebar view
- Real-time thread updates

**39. [CYCLE-039]** Add pinned messages
- Pin important messages to top
- Show pinned messages banner
- Admins can pin/unpin
- Highlight pinned state

**40. [CYCLE-040]** Write integration tests for real-time flows
- Test message send → receive cycle
- Test typing indicators propagation
- Test presence updates
- Test optimistic updates + rollback

---

## Cycle 41-50: @Mentions System

**41. [CYCLE-041]** Design @mention parsing system
- Regex to detect @username or @agentname
- Parse on send, validate against user/agent list
- Store as connection: mentioned_in
- Support @here (all channel members) and @channel

**42. [CYCLE-042]** Build MentionAutocomplete.tsx component
- Trigger on @ character
- Fuzzy search users + agents
- Keyboard navigation (↑↓ to select)
- Show avatar + name
- Insert mention on select/Enter

**43. [CYCLE-043]** Implement @mention highlighting
- Highlight @mentions in message text
- Different color for @user vs @agent
- Click to view profile/agent details
- Accessibility: Screen reader friendly

**44. [CYCLE-044]** Create mention notification system
- Send notification on @mention
- Track unread mentions count
- Jump to mention from notification
- Mark mention as read on view

**45. [CYCLE-045]** Add @mentions filter view
- Dedicated page: /app/mentions
- List all messages mentioning user
- Filter by date, channel, sender
- Mark all as read button

**46. [CYCLE-046]** Implement @agent mentions
- Trigger agent on @mention in message
- Agent replies in thread
- Show "Agent is typing..." indicator
- Agent response uses AI (ChatClientV2 integration)

**47. [CYCLE-047]** Add @here and @channel mentions
- @here mentions all online users
- @channel mentions all channel members
- Require admin permission
- Show count: "@here (5 people)"

**48. [CYCLE-048]** Implement mention preferences
- User settings: Disable @here/@channel
- Mute mentions from specific users
- Notification preferences (push, email, none)
- Do Not Disturb mode

**49. [CYCLE-049]** Log all mention events
- `user_mentioned` event on @user
- `agent_mentioned` event on @agent
- Track mention engagement (clicked, ignored)
- Analytics: Most mentioned users/agents

**50. [CYCLE-050]** Write tests for @mention flows
- Test autocomplete search
- Test mention parsing and validation
- Test notification delivery
- Test agent trigger on @mention

---

## Cycle 51-60: Sidebar Navigation

**51. [CYCLE-051]** Build AppSidebar.tsx component
- Collapsible sidebar (desktop)
- Icon-only mode for more space
- Smooth expand/collapse animation
- Persistent state (localStorage)

**52. [CYCLE-052]** Create Stream navigation section
- Show activity stream (all updates)
- Unread count badge
- Real-time updates
- Filter by type (messages, mentions, etc.)

**53. [CYCLE-053]** Create Organizations navigation section
- List user's organizations
- Switch between orgs
- Create new organization button
- Show org avatar + name

**54. [CYCLE-054]** Create Groups navigation section
- List groups in current org
- Expandable tree structure
- Create group button
- Drag to reorder

**55. [CYCLE-055]** Create Channels navigation section
- List channels in current group
- Public vs private channel icons
- Unread message count badges
- Star/favorite channels

**56. [CYCLE-056]** Create Tools navigation section
- List available integrations
- File browser, screen share, etc.
- Install new tools button
- Tool usage indicators

**57. [CYCLE-057]** Create Agents navigation section
- List available AI agents
- Agent status (online, busy, offline)
- Quick chat with agent button
- Agent capabilities preview

**58. [CYCLE-058]** Create People navigation section
- List organization members
- Online status indicators
- Direct message button
- User search/filter

**59. [CYCLE-059]** Add sidebar search
- Global search across all sections
- Quick switcher (Cmd+K)
- Recent items history
- Keyboard shortcuts

**60. [CYCLE-060]** Add sidebar customization
- Reorder sections (drag-drop)
- Show/hide sections
- Custom icons/colors
- Save layout preference

---

## Cycle 61-70: Quality & Testing

**61. [CYCLE-061]** Define user flows
- Flow 1: Join org → browse channels → send message
- Flow 2: @mention agent → get AI response
- Flow 3: Create thread → reply to message
- Flow 4: Search messages → find old conversation

**62. [CYCLE-062]** Create acceptance criteria
- Messages appear in real-time (< 500ms latency)
- @mentions trigger notifications
- Typing indicators show/hide correctly
- Sidebar navigation is intuitive

**63. [CYCLE-063]** Write unit tests for services
- MessageService: createMessage, editMessage, deleteMessage
- MentionService: parseMentions, validateMentions
- PresenceService: trackPresence, getOnlineUsers

**64. [CYCLE-064]** Write integration tests
- Frontend → Backend message send flow
- @mention → notification → agent response
- Real-time updates propagation
- Multi-user scenarios

**65. [CYCLE-065]** Write E2E tests with Playwright
- Test complete user journey
- Test @agent conversation
- Test message search
- Test sidebar navigation

**66. [CYCLE-066]** Run all tests and capture results
- Execute: `bun test`
- Fix any failing tests
- Achieve >90% code coverage
- Document test patterns

**67. [CYCLE-067]** Validate against 6-dimension ontology
- Verify all features map to dimensions
- Check multi-tenant isolation
- Ensure event logging complete
- Validate data model consistency

**68. [CYCLE-068]** Check type safety
- Run: `bunx astro check`
- Fix all TypeScript errors
- Ensure strict mode compliance
- No `any` types in new code

**69. [CYCLE-069]** Run linter
- Execute: `bun run lint`
- Fix all linting errors
- Enforce consistent code style
- Document any lint overrides

**70. [CYCLE-070]** Fix all failing tests before continuing
- Address root causes, not symptoms
- Refactor if needed
- Update tests for new behavior
- Green build required

---

## Cycle 71-80: Design & Polish

**71. [CYCLE-071]** Create wireframes for all views
- Chat view (3-column layout)
- Mobile view (stacked)
- Empty states, loading states
- Error states

**72. [CYCLE-072]** Design component architecture
- Atoms: Avatar, Badge, Button, Input
- Molecules: MessageBubble, MentionTag, TypingIndicator
- Organisms: MessageList, Sidebar, Composer
- Templates: ChatLayout

**73. [CYCLE-073]** Set design tokens
- Colors: Primary (blue), success, warning, error
- Spacing: 4px base unit
- Typography: System font stack
- Timing: 200ms transitions

**74. [CYCLE-074]** Ensure WCAG AA accessibility
- Keyboard navigation (Tab, Arrow keys)
- Screen reader labels (ARIA)
- Color contrast ratio > 4.5:1
- Focus indicators visible

**75. [CYCLE-075]** Design loading states
- Skeleton loaders for messages
- Shimmer animation
- Progressive enhancement
- Fast perceived performance

**76. [CYCLE-076]** Create error state designs
- Network error: "Reconnecting..."
- Permission error: "Access denied"
- Not found: "Channel not found"
- Retry buttons

**77. [CYCLE-077]** Design empty states
- No messages: "Start the conversation"
- No channels: "Create your first channel"
- No mentions: "No one's mentioned you yet"
- Helpful CTAs

**78. [CYCLE-078]** Implement animations
- Message slide-in on send
- Sidebar expand/collapse
- Mention highlight pulse
- Smooth scroll

**79. [CYCLE-079]** Validate design enables tests to pass
- Ensure interactive elements have test IDs
- Consistent naming conventions
- Predictable state transitions

**80. [CYCLE-080]** Design review and approval
- Review with stakeholders
- Gather feedback
- Iterate on problem areas
- Final approval before optimization

---

## Cycle 81-90: Performance & Optimization

**81. [CYCLE-081]** Optimize database queries
- Add indexes on channelId, authorId, createdAt
- Optimize @mention lookups
- Use Convex query caching
- Minimize round-trips

**82. [CYCLE-082]** Implement pagination
- Load 50 messages per page
- Infinite scroll (load more on scroll)
- Cursor-based pagination
- Preserve scroll position

**83. [CYCLE-083]** Add caching strategies
- Cache channel metadata
- Cache user/agent profiles
- React Query for client cache
- Convex built-in caching

**84. [CYCLE-084]** Optimize images
- Use Astro Image component
- Lazy load avatars
- WebP format with fallbacks
- Responsive image sizes

**85. [CYCLE-085]** Minimize JavaScript bundle
- Code splitting by route
- Dynamic imports for heavy components
- Tree shaking unused code
- Analyze bundle with rollup-plugin-visualizer

**86. [CYCLE-086]** Use Astro Islands for selective hydration
- Static sidebar (SSR)
- Hydrate only interactive components
- Reduce JavaScript payload
- Faster initial load

**87. [CYCLE-087]** Enable SSR for critical pages
- Pre-render channel list
- Pre-render initial messages
- Streaming SSR for progressive load
- Better SEO + performance

**88. [CYCLE-088]** Optimize Lighthouse scores
- Target: Performance > 90
- Accessibility > 95
- Best Practices > 95
- SEO > 90

**89. [CYCLE-089]** Test on slow connections
- Throttle to 3G speed
- Verify loading states appear
- Test offline resilience
- Optimize critical path

**90. [CYCLE-090]** Monitor Core Web Vitals
- LCP (Largest Contentful Paint) < 2.5s
- FID (First Input Delay) < 100ms
- CLS (Cumulative Layout Shift) < 0.1
- Add performance monitoring

---

## Cycle 91-100: Deployment & Documentation

**91. [CYCLE-091]** Build production bundle
- Run: `cd web && bun run build`
- Verify no build errors
- Check bundle size
- Test production build locally

**92. [CYCLE-092]** Deploy backend to Convex Cloud
- Run: `cd backend && npx convex deploy`
- Verify deployment success
- Test API endpoints
- Monitor error logs

**93. [CYCLE-093]** Deploy frontend to Cloudflare Pages
- Run: `cd web && wrangler pages deploy dist`
- Verify deployment success
- Test production URL
- Configure custom domain

**94. [CYCLE-094]** Run smoke tests in production
- Test login flow
- Send test message
- Test @mention
- Verify real-time updates

**95. [CYCLE-095]** Write feature documentation
- Create: `one/knowledge/features/chat-platform.md`
- Document architecture
- API reference
- User guide

**96. [CYCLE-096]** Update API documentation
- Document chat mutations/queries
- @mention API
- WebSocket events
- Code examples

**97. [CYCLE-097]** Create user guide
- How to create a channel
- How to @mention users/agents
- How to customize sidebar
- Keyboard shortcuts

**98. [CYCLE-098]** Capture lessons learned
- What worked: Real-time via Convex
- What didn't: Initial @mention parsing approach
- What to improve: Agent response latency
- Best practices discovered

**99. [CYCLE-099]** Update knowledge base with patterns
- Add to: `one/knowledge/patterns/frontend/chat-patterns.md`
- Add to: `one/knowledge/patterns/backend/real-time-patterns.md`
- Document reusable components
- Share with team

**100. [CYCLE-100]** Mark feature complete
- Update project status
- Notify stakeholders
- Celebrate launch 🎉
- Plan next iteration

---

## How to Use This Plan

### Sequential Execution
- Execute cycles in order (1 → 100)
- Each cycle builds on previous work
- Don't skip ahead unless dependencies met

### Parallel Execution Opportunities
- **Cycles 11-20 + 21-30:** Backend and Frontend can work in parallel after schema defined (Cycle 12)
- **Cycles 61-70 + 71-80:** Testing and Design can inform each other
- **Cycles 95-99:** Documentation can start earlier

### Adaptive Planning
This is a template. Adapt based on:
- **Simplify:** Skip cycles if feature is simple (e.g., skip E2E tests for prototype)
- **Expand:** Add cycles for complex requirements (e.g., video chat = +20 cycles)
- **Prioritize:** Re-order cycles based on MVP scope

### Integration with Existing Code
- **Reuse ChatClientV2:** Leverage existing chat component for @agent responses
- **Reuse AppLayout:** Build on existing 3-column layout pattern
- **Reuse shadcn/ui:** Use existing component library for consistency

### Commands
- `/now` - Show current cycle
- `/next` - Advance to next cycle
- `/done` - Mark complete and advance
- `/plan` - Show full 100-cycle plan

---

## Success Metrics

- **Real-time latency:** < 500ms message delivery
- **@mention accuracy:** 100% correct parsing
- **Test coverage:** > 90% code coverage
- **Performance:** Lighthouse score > 90
- **Accessibility:** WCAG AA compliant
- **User engagement:** Daily active users, messages sent

---

**Philosophy:** This plan transforms a complex chat platform into 100 small, perfect steps. Each cycle is concrete, testable, and advances toward production. The 6-dimension ontology ensures every feature maps to reality itself—making AI code generation 98% accurate.

**Ready to build?** Start with Cycle 1. Do the next thing, perfectly. 🚀
