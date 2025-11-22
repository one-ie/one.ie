# Chat Platform Acceptance Criteria

**Document Type:** Quality Specification
**Created:** 2025-11-22
**Status:** Active
**Test Coverage Target:** 80%+

## Overview

This document defines measurable acceptance criteria for the chat platform. Each criterion is specific, testable, and maps to user flows from Cycle 61.

---

## 1. Message Functionality

### 1.1 Message Creation

**Criteria:**
- [ ] User can send message with Enter key
- [ ] User can send message with Send button click
- [ ] Shift+Enter creates new line without sending
- [ ] Messages persist in things table with correct groupId
- [ ] Messages appear in MessageList within 500ms
- [ ] Optimistic updates show immediately (< 50ms)
- [ ] Failed sends show error toast and allow retry
- [ ] Empty/whitespace-only messages rejected
- [ ] Messages > 4000 characters rejected with error
- [ ] Character count warning appears at 3900 characters

**Performance:**
- Message send latency < 500ms (p95)
- Optimistic update render < 50ms
- Real-time propagation < 1 second

**Ontology Validation:**
- Message created as thing with type: "message"
- groupId matches user's organization
- properties.authorId = current user ID
- properties.channelId = target channel
- communication_event logged with action: "sent"

---

### 1.2 Message Editing

**Criteria:**
- [ ] Author can edit own message within 15 minutes
- [ ] Edit button visible on message hover (author only)
- [ ] Edit mode shows textarea with current content
- [ ] Save with Enter, Cancel with Escape
- [ ] Edited messages show "(edited)" indicator
- [ ] properties.editedAt timestamp updated
- [ ] Non-authors cannot edit message
- [ ] Messages > 15 minutes old cannot be edited

**Performance:**
- Edit UI appears < 100ms
- Save/update completes < 300ms

**Ontology Validation:**
- editMessage mutation validates authorId matches current user
- properties.editedAt = timestamp of edit
- Original content NOT preserved (no edit history yet)

---

### 1.3 Message Deletion

**Criteria:**
- [ ] Author can delete own message anytime
- [ ] Admins can delete any message
- [ ] Delete requires confirmation dialog
- [ ] Deleted messages removed from UI immediately
- [ ] Deleted messages have deletedAt timestamp (soft delete)
- [ ] Non-authors/non-admins cannot delete
- [ ] Thread replies orphaned if parent deleted (show "message deleted")

**Performance:**
- Delete confirmation appears < 100ms
- Delete completes < 300ms
- UI update < 50ms

**Ontology Validation:**
- deleteMessage mutation checks role/permissions
- deletedAt timestamp set (soft delete)
- Message still in database (can be recovered by admin)

---

## 2. @Mention Functionality

### 2.1 Mention Autocomplete

**Criteria:**
- [ ] Autocomplete triggers on @ character
- [ ] Autocomplete appears < 300ms after @
- [ ] Autocomplete shows users from current organization
- [ ] Autocomplete shows agents (distinguished by icon/badge)
- [ ] Autocomplete shows special mentions (@here, @channel)
- [ ] Fuzzy search matches username
- [ ] Arrow keys navigate autocomplete
- [ ] Enter selects highlighted item
- [ ] Escape closes autocomplete
- [ ] Click outside closes autocomplete

**Performance:**
- Autocomplete render < 300ms
- Search query execution < 100ms
- Keyboard navigation < 16ms (60 FPS)

**Ontology Validation:**
- searchMentionables query filters by groupId
- Results include type: "creator" (users) and type: "agent"
- Special mentions hardcoded (@here, @channel, @everyone)

---

### 2.2 Mention Notifications

**Criteria:**
- [ ] Mentioned user receives notification within 1 second
- [ ] Notification shows in MentionNotifications component
- [ ] Unread count badge updates (MentionBadge)
- [ ] Click notification navigates to message
- [ ] Message highlighted when arrived via notification
- [ ] Mention marked as read after viewing
- [ ] Notification persists until read
- [ ] Multiple mentions show chronologically

**Performance:**
- Notification delivery < 1 second (real-time)
- Navigation < 500ms
- Scroll-to-message < 300ms

**Ontology Validation:**
- mentioned_in connection created (message → person)
- metadata.read = false initially
- communication_event logged (action: "mentioned")
- markMentionAsRead mutation updates metadata.read = true

---

### 2.3 Agent Mentions

**Criteria:**
- [ ] Agent mention triggers agent processing
- [ ] Agent distinguished in autocomplete (purple badge)
- [ ] Agent response appears < 3 seconds
- [ ] Agent reply creates thread automatically
- [ ] Agent message shows agent avatar
- [ ] Agent response is contextually relevant (RAG)
- [ ] Agent citations included (if applicable)
- [ ] Failed agent triggers show error toast

**Performance:**
- Agent response < 3 seconds (p95)
- Agent response < 5 seconds (p99)

**Ontology Validation:**
- triggerAgentMention mutation called
- mentioned_in connection (message → agent)
- agent_executed event logged
- Agent reply has replied_to connection

---

## 3. Thread Functionality

### 3.1 Thread Creation

**Criteria:**
- [ ] Thread button visible on message hover
- [ ] Click thread opens ThreadView
- [ ] ThreadView shows parent message at top
- [ ] ThreadView loads existing replies
- [ ] Thread composer targets threadId
- [ ] Parent message shows reply count
- [ ] Thread updates in real-time

**Performance:**
- ThreadView opens < 500ms
- Thread messages load < 300ms

**Ontology Validation:**
- Reply messages have properties.threadId = parent message ID
- replied_to connection created (reply → parent)
- communication_event logged (action: "replied")

---

### 3.2 Thread Navigation

**Criteria:**
- [ ] Desktop: Thread panel opens on right
- [ ] Mobile: Thread opens as full-screen overlay
- [ ] Close button closes thread
- [ ] Thread state preserved when switching channels
- [ ] Deep link to thread works (/channel/msg/thread)

**Performance:**
- Thread panel render < 500ms
- Thread navigation < 300ms

---

## 4. Search Functionality

### 4.1 Message Search

**Criteria:**
- [ ] Search accessible via Cmd+K (Mac) or Ctrl+K (Windows)
- [ ] Search input triggers after 300ms debounce
- [ ] Results appear instantly (< 100ms perceived)
- [ ] Results show message preview
- [ ] Results show author, channel, timestamp
- [ ] Results grouped by channel
- [ ] Click result navigates to message
- [ ] Message highlighted after navigation
- [ ] Search filters by accessible channels only

**Performance:**
- Search query < 100ms
- Results render < 50ms
- Navigation < 500ms

**Ontology Validation:**
- searchMessages query uses search index
- Results filtered by groupId
- Only messages in channels user has member_of connection

---

### 4.2 Search Operators

**Criteria:**
- [ ] `from:username` filters by author
- [ ] `in:channel` filters by channel
- [ ] `has:link` filters messages with URLs
- [ ] `has:mention` filters messages with mentions
- [ ] Operators combinable (e.g., `from:john in:general`)

**Performance:**
- Complex queries < 200ms

---

## 5. Real-Time Features

### 5.1 Typing Indicators

**Criteria:**
- [ ] Typing indicator appears < 300ms after keystroke
- [ ] Shows "User is typing..." for 1 user
- [ ] Shows "User A and User B are typing..." for 2 users
- [ ] Shows "User A, User B, and 1 other are typing..." for 3+ users
- [ ] Indicator clears after 3 seconds of inactivity
- [ ] Indicator clears when message sent
- [ ] No indicator shown for own typing
- [ ] Works independently per channel

**Performance:**
- Presence update < 300ms
- Indicator render < 50ms

**Ontology Validation:**
- updatePresence mutation sets isTyping: true
- typingInChannelId = current channel
- getTypingUsers query filters by channel

---

### 5.2 Presence Indicators

**Criteria:**
- [ ] Online users show green dot
- [ ] Offline users show gray dot
- [ ] Away users show yellow dot
- [ ] Busy users show red dot
- [ ] Presence updates within 5 seconds
- [ ] Presence indicator on avatar
- [ ] Hover shows "Online" / "Away" / "Offline"

**Performance:**
- Presence query < 100ms
- Indicator updates < 1 second

**Ontology Validation:**
- getUserPresence query fetches presence table
- Presence status enum: online, offline, away, busy
- lastSeen timestamp updated on activity

---

## 6. Sidebar Navigation

### 6.1 Sidebar Structure

**Criteria:**
- [ ] Sidebar shows 7 sections: Stream, Orgs, Groups, Channels, Tools, Agents, People
- [ ] Each section expandable/collapsible
- [ ] Active channel highlighted
- [ ] Unread count badges accurate
- [ ] Private channels show lock icon
- [ ] Sidebar collapsible to icons only
- [ ] Desktop: Sidebar always visible (unless collapsed)
- [ ] Mobile: Sidebar as sheet overlay

**Performance:**
- Sidebar render < 500ms
- Section expand/collapse < 100ms

---

### 6.2 Channel Navigation

**Criteria:**
- [ ] Click channel loads messages < 2 seconds
- [ ] Channel messages load with pagination (50 most recent)
- [ ] Scroll to load older messages
- [ ] Active channel state preserved
- [ ] URL updates on channel change (/chat/channel-slug)
- [ ] Back button navigates to previous channel

**Performance:**
- Channel switch < 2 seconds
- Messages load < 1 second
- Infinite scroll < 300ms

**Ontology Validation:**
- Channels are groups with type: "channel"
- parentGroupId = organization ID
- member_of connection required for private channels

---

## 7. Reactions & Emoji

### 7.1 Emoji Reactions

**Criteria:**
- [ ] Emoji picker visible on message hover
- [ ] Click emoji adds reaction
- [ ] Reaction count updates immediately
- [ ] User's reactions highlighted
- [ ] Click own reaction removes it
- [ ] Reactions grouped by emoji
- [ ] Hover shows who reacted

**Performance:**
- Reaction add < 200ms
- UI update < 50ms

**Ontology Validation:**
- addReaction mutation updates properties.reactions array
- Reaction object: { emoji, count, userIds }

---

## 8. Performance Standards

### 8.1 Core Web Vitals

**Criteria:**
- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] FID (First Input Delay) < 100ms
- [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] Lighthouse Performance Score > 90

---

### 8.2 Real-Time Performance

**Criteria:**
- [ ] Message send → delivery < 500ms (p95)
- [ ] Convex subscription latency < 1 second
- [ ] UI updates at 60 FPS (16ms frame budget)
- [ ] Optimistic updates < 50ms

---

## 9. Accessibility Standards

### 9.1 WCAG 2.1 AA Compliance

**Criteria:**
- [ ] All interactive elements keyboard accessible
- [ ] Tab order logical and predictable
- [ ] Focus indicators visible
- [ ] ARIA labels on all buttons/inputs
- [ ] Screen reader announces message updates
- [ ] Color contrast ratio > 4.5:1
- [ ] Text resizable to 200% without loss of function

---

### 9.2 Keyboard Navigation

**Criteria:**
- [ ] Tab navigates between messages
- [ ] Arrow keys navigate autocomplete
- [ ] Enter sends message / selects autocomplete item
- [ ] Escape closes modals/autocomplete
- [ ] Cmd+K opens search
- [ ] Alt+Up/Down navigates channels
- [ ] Cmd+Shift+T opens thread

---

## 10. Error Handling

### 10.1 Network Errors

**Criteria:**
- [ ] Failed sends show error toast
- [ ] Retry button available on failure
- [ ] Offline mode shows banner
- [ ] Queued messages sent when reconnected
- [ ] Clear error messages (not "Error: undefined")

---

### 10.2 Validation Errors

**Criteria:**
- [ ] Empty message shows "Message cannot be empty"
- [ ] Long message shows "Maximum 4000 characters"
- [ ] Rate limit shows "Slow down! Maximum 10 messages per minute"
- [ ] Permission error shows "You don't have permission"

---

## Summary

**Total Acceptance Criteria:** 150+ specific, measurable criteria
**Categories:** 10 major areas (Messages, Mentions, Threads, Search, Real-Time, Sidebar, Reactions, Performance, Accessibility, Errors)
**Test Coverage Target:** 80%+
**Ontology Alignment:** All criteria map to 6-dimension ontology

**Next Steps (Cycle 63):** Write unit tests for backend services validating these criteria
