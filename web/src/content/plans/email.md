---
title: "Mail Application v1.0.0"
description: "Full-featured email client with inbox, compose, threads, and rich editor"
feature: "mail"
organization: "ONE Platform"
personRole: "platform_owner"
ontologyDimensions: ["Things", "Connections", "Events"]
assignedSpecialist: "Engineering Director"
totalCycles: 45
completedCycles: 0
createdAt: 2025-10-30
draft: false
---

# ONE Platform: Mail Application v1.0.0

**Focus:** Real-time messaging/email client with inbox, compose, threads, and rich editor
**Type:** Backend + Frontend integration (Convex real-time + Astro + React 19)
**UI Pattern:** Gmail-like interface with sidebar, email list, and detail view
**Process:** `Optimized 45-cycle sequence with quick wins`
**Timeline:** 8-12 cycles per specialist per day
**Target:** Working MVP deployed by Cycle 10, full features by Cycle 45

---

## Cycle Budget (45 Cycles Total)

**Quick Wins (Cycles 1-10):** Working messaging interface deployed
**Backend Schema (Cycles 11-18):** Real-time database and mutations
**Frontend Integration (Cycles 19-28):** Connect UI to live backend
**Advanced Features (Cycles 29-38):** Rich text, threading, search
**Polish & Deploy (Cycles 39-45):** Performance, accessibility, production

---

## Quick Wins (Cycles 1-10)

**Milestone:** Deploy working messaging interface that can send/receive messages in real-time

### Cycle 1: Ontology Mapping & MVP Scope
- [x] Map to 6 dimensions (Things: message/contact, Events: sent/read, Connections: replied_to)
- [x] Define MVP features (send, receive, list, mark read)
- [x] Identify backend requirements (real-time sync needed)

### Cycle 2: Mock Data Interface
- [x] Create mock message data (10-15 sample messages)
- [x] Build MessageList component with shadcn Card
- [x] Build MessageDetail component with basic styling

### Cycle 3: Backend Schema
- [x] Define `messages` table in Convex schema
- [x] Add indexes: by_userId, by_threadId, by_timestamp
- [x] Create basic query: `list(userId)`

### Cycle 4: Core Mutations
- [x] Create `send` mutation (insert message, log event)
- [x] Create `markAsRead` mutation (update status)
- [x] Test mutations via Convex dashboard

### Cycle 5: Inbox Page
- [x] Create `/mail/index.astro` with layout
- [x] Wire up `useQuery` for message list
- [x] Display messages with real-time updates

### Cycle 6: Compose Form
- [x] Build ComposeForm component (To, Subject, Body)
- [x] Wire up `useMutation` for send
- [x] Show success toast on send

### Cycle 7: Message Detail View
- [x] Add routing to `/mail/[messageId]`
- [x] Display full message content
- [x] Add Reply button (opens compose with context)

### Cycle 8: Real-time Sync Testing
- [x] Open app in two browser windows
- [x] Send message from Window A
- [x] Verify instant appearance in Window B
- [x] Test mark as read sync

### Cycle 9: Basic Mobile Responsive
- [x] Mobile: single column, hamburger sidebar
- [x] Tablet: two columns
- [x] Desktop: three columns

### Cycle 10: Deploy MVP
- [x] Run `bun run build`
- [x] Deploy to Cloudflare Pages
- [x] Verify production real-time sync
- [x] Share live URL

**Milestone Complete:** Users can send/receive messages in real-time

---

## PHASE 2: BACKEND SCHEMA & SERVICES (Cycles 11-18)

**Milestone:** Complete backend data model with queries, mutations, and real-time sync

### Cycle 11: Extended Message Schema
- [ ] Add contacts table (name, email, avatar, lastInteraction)
- [ ] Add labels table (name, color, unreadCount)
- [ ] Add drafts table (extends messages with isDraft flag)
- [ ] Add attachments support to messages

### Cycle 12: Threading & Connections
- [ ] Add threadId to messages schema
- [ ] Create connection: message → message (reply_to, forward_of)
- [ ] Query: getThread(threadId) returns all related messages
- [ ] Mutation: createThread() groups related messages

### Cycle 13: Advanced Queries
- [ ] Query: searchMessages(query, filters) with full-text search
- [ ] Query: getByLabel(labelId) returns filtered messages
- [ ] Query: getUnreadCount(userId) for badge display
- [ ] Query: getContacts(userId) for autocomplete

### Cycle 14: Label & Archive Mutations
- [ ] Mutation: addLabel(messageId, labelId)
- [ ] Mutation: removeLabel(messageId, labelId)
- [ ] Mutation: archive(messageId) updates status
- [ ] Mutation: delete(messageId) soft delete with flag

### Cycle 15: Draft System
- [ ] Mutation: saveDraft(data) autosave every 10s
- [ ] Mutation: deleteDraft(draftId) on send or discard
- [ ] Query: getDrafts(userId) for drafts folder
- [ ] Event: draft_created, draft_saved, draft_discarded

### Cycle 16: Attachment Handling
- [ ] Add file upload to Convex storage
- [ ] Mutation: uploadAttachment(file) returns storageId
- [ ] Query: getAttachment(storageId) returns file URL
- [ ] Link attachments to messages via array

### Cycle 17: Event Logging
- [ ] Log all actions: message_sent, message_read, message_starred
- [ ] Log: message_archived, message_deleted, label_added
- [ ] Create activity feed query for analytics
- [ ] Add timestamp indexes for performance

### Cycle 18: Backend Testing
- [ ] Test all mutations via Convex dashboard
- [ ] Verify real-time sync across multiple clients
- [ ] Test search performance with 100+ messages
- [ ] Validate schema constraints and indexes

---

## PHASE 3: FRONTEND INTEGRATION (Cycles 19-28)

**Milestone:** Connect React components to Convex backend with real-time updates

### Cycle 19: Core UI Components with Convex
- [ ] Build MessageListItem with shadcn Card, Avatar, Badge
- [ ] Wire up `useQuery(api.queries.messages.list)` for real-time
- [ ] Build MailSidebar with folder navigation
- [ ] Add unread count badges via `useQuery(api.queries.messages.unreadCount)`

### Cycle 20: Enhanced Compose with Rich Text
- [ ] Integrate Tiptap or similar rich text editor
- [ ] Add formatting toolbar (bold, italic, lists, links)
- [ ] Wire up draft autosave via `useMutation(api.mutations.drafts.save)`
- [ ] Test draft restore on page reload

### Cycle 21: Label & Filter System
- [ ] Build LabelManager component with CRUD operations
- [ ] Add label selector to messages
- [ ] Implement filter UI (unread, starred, by label)
- [ ] Wire filters to backend queries

### Cycle 22: Attachment System
- [ ] Add file upload UI with drag-and-drop
- [ ] Wire up `useMutation(api.mutations.attachments.upload)`
- [ ] Display attachment previews in message detail
- [ ] Add download functionality

### Cycle 23: Threading UI
- [ ] Build ThreadView component
- [ ] Query related messages via threadId
- [ ] Add collapse/expand for previous messages
- [ ] Test reply creates correct thread connection

### Cycle 24: Search Implementation
- [ ] Build SearchBar with autocomplete
- [ ] Wire up `useQuery(api.queries.messages.search)` with filters
- [ ] Add advanced search modal (from, to, date range)
- [ ] Show search results with highlighting

### Cycle 25: Settings Panel
- [ ] Create SettingsPanel with tabs (General, Display, Notifications)
- [ ] Add theme toggle (save to localStorage)
- [ ] Add density setting (comfortable/compact/spacious)
- [ ] Add keyboard shortcuts reference

### Cycle 26: Loading & Empty States
- [ ] Add Skeleton components for message list
- [ ] Create EmptyState for inbox, search, folders
- [ ] Add error boundaries with retry buttons
- [ ] Implement optimistic UI updates

### Cycle 27: Complete Responsive Layout
- [ ] Test and fix mobile layout (<768px)
- [ ] Hamburger menu for sidebar toggle
- [ ] Bottom action bar for mobile
- [ ] Touch-friendly targets (44px minimum)

### Cycle 28: Integration Testing
- [ ] Test full flow: compose → send → receive → reply
- [ ] Test draft system: save → restore → discard
- [ ] Test attachments: upload → display → download
- [ ] Test search across 50+ messages

---

## PHASE 4: ADVANCED FEATURES (Cycles 29-38)

**Milestone:** Add power-user features and polish experience

### Cycle 29: Keyboard Shortcuts
- [ ] Implement keyboard shortcut system
- [ ] Add shortcuts: `/` search, `c` compose, `r` reply, `e` archive
- [ ] Add `j`/`k` navigation through messages
- [ ] Show shortcut hints on hover

### Cycle 30: Bulk Actions
- [ ] Add checkbox selection to message list
- [ ] Build bulk action toolbar (mark read, archive, delete, label)
- [ ] Implement select all / select none
- [ ] Add undo functionality with toast

### Cycle 31: Context Menus
- [ ] Add right-click context menu to messages
- [ ] Actions: reply, forward, archive, delete, mark spam
- [ ] Add label submenu
- [ ] Keyboard navigation for menu

### Cycle 32: Notifications System
- [ ] Desktop notifications for new messages (if permitted)
- [ ] Toast notifications for actions (sent, archived, etc.)
- [ ] Unread count in page title
- [ ] Browser notification API integration

### Cycle 33: Email Templates
- [ ] Create template editor
- [ ] Store templates in backend
- [ ] Template selector in compose
- [ ] Variable substitution (name, date, etc.)

### Cycle 34: Scheduled Send
- [ ] Add schedule send option to compose
- [ ] Date/time picker for send time
- [ ] Backend mutation: schedule message
- [ ] Show scheduled messages in separate folder

### Cycle 35: Spam & Archive Enhancements
- [ ] Improve spam detection UI
- [ ] Add "Report spam" with feedback
- [ ] Archive keyboard shortcut and quick actions
- [ ] Undo delete/archive with 5s window

### Cycle 36: Contact Management
- [ ] Build ContactList page
- [ ] Add/edit contact form
- [ ] Autocomplete contacts in compose To field
- [ ] Show contact frequency and last interaction

### Cycle 37: Performance Optimization
- [ ] Virtualize long message lists (react-window)
- [ ] Lazy load rich text editor
- [ ] Code split by route
- [ ] Optimize bundle size (<300KB gzipped)

### Cycle 38: Advanced Search
- [ ] Full-text search across all fields
- [ ] Search operators: from:, to:, subject:, has:attachment
- [ ] Save search filters as smart labels
- [ ] Recent searches dropdown

---

## PHASE 5: POLISH & DEPLOY (Cycles 39-45)

**Milestone:** Production-ready app with accessibility and performance

### Cycle 39: Accessibility Audit
- [ ] Keyboard navigation through all UI
- [ ] ARIA labels for screen readers
- [ ] Focus management (trap in modals)
- [ ] Color contrast WCAG AA compliant

### Cycle 40: Dark Mode Polish
- [ ] Refine dark mode colors
- [ ] Smooth theme transitions
- [ ] Save preference to backend (optional)
- [ ] Test readability in both modes

### Cycle 41: Animations & Micro-interactions
- [ ] Message list item hover effects
- [ ] Compose modal slide-in animation
- [ ] Delete with slide-out animation
- [ ] Loading spinners and progress indicators

### Cycle 42: Error Handling
- [ ] Network error recovery
- [ ] Form validation with clear messages
- [ ] Rate limiting feedback
- [ ] Offline mode detection

### Cycle 43: Testing Suite
- [ ] Unit tests for components
- [ ] Integration tests for flows
- [ ] E2E tests with Playwright
- [ ] Visual regression tests (optional)

### Cycle 44: Performance Audit
- [ ] Lighthouse score > 90 (all metrics)
- [ ] Core Web Vitals optimization
- [ ] Image optimization
- [ ] Bundle analysis and tree shaking

### Cycle 45: Production Deployment
- [ ] Final build and optimization
- [ ] Deploy to Cloudflare Pages
- [ ] Configure custom domain (optional)
- [ ] Monitor real-time sync in production

---

## SUCCESS CRITERIA

Mail app is complete when:

- ✅ Users can send/receive messages in real-time
- ✅ Compose with rich text editor and attachments
- ✅ Threading shows related messages
- ✅ Search works with filters
- ✅ Labels organize messages
- ✅ Drafts autosave and restore
- ✅ Mark read/unread, star, archive, delete
- ✅ Mobile responsive (hamburger, touch-friendly)
- ✅ Dark mode works perfectly
- ✅ Keyboard shortcuts functional
- ✅ Lighthouse > 90 (all metrics)
- ✅ Accessible (WCAG 2.1 AA)
- ✅ Real-time sync verified in production

---

**Timeline:** 45 cycles optimized (vs 100 original)
**Status:** Ready to build
**Efficiency Gain:** 55% reduction in cycles while maintaining full feature set
**Next:** Start Cycle 1 with ontology mapping
