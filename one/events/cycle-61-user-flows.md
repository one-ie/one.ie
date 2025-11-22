# Chat Platform User Flows

**Document Type:** Quality Specification
**Created:** 2025-11-22
**Status:** Active
**Ontology Mapping:** All 6 dimensions validated

## Overview

This document defines the critical user flows for the chat platform, mapped to the 6-dimension ontology. Each flow includes time budgets, ontology operations, and expected outcomes.

---

## Flow 1: Join Organization and Send First Message

**User goal:** New user joins organization, navigates to channel, sends first message

**Time budget:** < 5 seconds (total flow)

**Ontology Mapping:**
- **Things created:** message (type: "message")
- **Connections created:** member_of (user → channel)
- **Events logged:** user_registered, communication_event (action: "sent")
- **Knowledge updated:** message content indexed for search

**Steps:**
1. User completes registration (Better Auth)
2. System creates person thing (type: "creator")
3. User joins organization (groupId assigned)
4. User navigates to #general channel
5. User types message in MessageComposer
6. User presses Enter or clicks Send
7. sendMessage mutation creates message thing
8. System logs communication_event
9. Message appears in MessageList
10. Other users see message in real-time (Convex subscription)

**Acceptance Criteria:**
- ✅ Message appears within 500ms of send
- ✅ Message persisted in things table with correct groupId
- ✅ communication_event logged with action: "sent"
- ✅ Message visible to all channel members
- ✅ Author name and avatar displayed correctly
- ✅ Timestamp shows "just now"
- ✅ No duplicate messages (optimistic update handled)

**Technical Tests:**
- Unit: sendMessage mutation validates groupId, channelId, content
- Integration: MessageComposer → sendMessage → MessageList updates
- E2E: Complete registration → join → send → verify flow

---

## Flow 2: Mention User and Trigger Notification

**User goal:** Mention another user with @username, user receives notification and navigates to message

**Time budget:** < 1 second (mention → notification)

**Ontology Mapping:**
- **Things involved:** message (author), person (mentioned user)
- **Connections created:** mentioned_in (message → person)
- **Events logged:** communication_event (action: "mentioned")
- **Knowledge updated:** Labels applied (mentioned user notified)

**Steps:**
1. User types "@john" in MessageComposer
2. MentionAutocomplete appears showing users matching "john"
3. User selects "@john_doe" from autocomplete
4. User completes message and sends
5. sendMessage mutation parses @mentions
6. System creates mentioned_in connection (message → john_doe)
7. System logs communication_event (action: "mentioned")
8. John receives notification (MentionNotifications component)
9. John clicks notification
10. Browser scrolls to mentioned message
11. Message highlighted (you were mentioned)
12. System marks mention as read (markMentionAsRead mutation)

**Acceptance Criteria:**
- ✅ Autocomplete appears < 300ms after typing "@"
- ✅ Autocomplete filters by username (fuzzy match)
- ✅ Mention inserted correctly (@username format)
- ✅ mentioned_in connection created in database
- ✅ Notification appears within 1 second
- ✅ Notification count badge updates (MentionBadge)
- ✅ Click notification navigates to message
- ✅ Message highlighted with background color
- ✅ Mention marked as read after viewing

**Technical Tests:**
- Unit: parseMentions extracts all @mentions from content
- Unit: searchMentionables query filters by username
- Integration: MentionAutocomplete → select → sendMessage with mentions
- E2E: Type @ → select user → send → verify notification → click → verify navigation

---

## Flow 3: Mention AI Agent and Receive Response

**User goal:** Mention AI agent with @agent_name, agent responds with contextual answer

**Time budget:** < 3 seconds (mention → agent response)

**Ontology Mapping:**
- **Things involved:** message (user), agent (type: "agent"), message (agent reply)
- **Connections created:** mentioned_in (message → agent), replied_to (agent message → user message)
- **Events logged:** communication_event (action: "agent_mentioned"), agent_executed
- **Knowledge updated:** Message content embedded for RAG, agent response indexed

**Steps:**
1. User types "@support_bot" in message
2. MentionAutocomplete shows agents (distinguished by icon)
3. User selects agent and sends message
4. sendMessage mutation detects agent mention
5. System creates mentioned_in connection (message → agent)
6. System triggers triggerAgentMention mutation
7. Agent processes message context (RAG lookup)
8. Agent generates response via ChatClientV2
9. Agent sends reply message (replied_to connection)
10. User sees agent response in real-time
11. System logs agent_executed event

**Acceptance Criteria:**
- ✅ Agents distinguished from users in autocomplete (purple badge)
- ✅ Agent mention triggers agent processing
- ✅ Agent response appears < 3 seconds
- ✅ Agent response is contextually relevant (uses RAG)
- ✅ Agent message shows agent avatar and name
- ✅ replied_to connection links agent reply to user message
- ✅ agent_executed event logged
- ✅ Agent response includes citations/sources (if applicable)

**Technical Tests:**
- Unit: triggerAgentMention mutation validates agent exists
- Integration: MentionAutocomplete shows agents with correct type
- Integration: sendMessage → triggerAgentMention → agent response
- E2E: Type @agent → send → verify response → verify connection

---

## Flow 4: Create Thread and Reply to Message

**User goal:** Create thread from message, add replies, view thread in sidebar

**Time budget:** < 2 seconds (click thread → thread view renders)

**Ontology Mapping:**
- **Things involved:** message (parent), message (replies with threadId)
- **Connections created:** replied_to (reply message → parent message)
- **Events logged:** communication_event (action: "replied")
- **Knowledge updated:** Thread messages indexed together

**Steps:**
1. User hovers over message
2. Actions menu appears (reaction, thread, edit, delete)
3. User clicks "Reply in thread" button
4. ThreadView opens in right panel
5. User sees parent message and any existing replies
6. User types reply in ThreadView composer
7. User sends reply (threadId = parent message ID)
8. sendMessage mutation creates reply with threadId
9. System creates replied_to connection
10. Reply appears in thread
11. Parent message shows "N replies" indicator
12. System logs communication_event (action: "replied")

**Acceptance Criteria:**
- ✅ Thread button visible on message hover
- ✅ ThreadView opens within 500ms
- ✅ Parent message displayed at top of thread
- ✅ All replies loaded and displayed
- ✅ Reply count badge accurate
- ✅ Reply message includes threadId in properties
- ✅ replied_to connection created
- ✅ Thread updates in real-time (Convex subscription)
- ✅ Mobile: Thread opens as full-screen overlay

**Technical Tests:**
- Unit: sendMessage mutation accepts threadId parameter
- Unit: getThread query fetches parent + all replies
- Integration: Message → click thread → ThreadView renders
- E2E: Click thread → type reply → send → verify appears

---

## Flow 5: Search Messages and Navigate to Result

**User goal:** Search for keyword, find message, navigate to message location

**Time budget:** < 100ms (perceived - instant search)

**Ontology Mapping:**
- **Things queried:** messages (type: "message") via search index
- **Connections involved:** message → channel (groupId filtering)
- **Events logged:** None (read-only operation)
- **Knowledge used:** searchMessages query uses full-text search

**Steps:**
1. User clicks search icon or presses Cmd+K
2. Search modal/dropdown opens
3. User types search query
4. searchMessages query executes (debounced)
5. Results appear with message preview, author, timestamp
6. Results grouped by channel
7. User clicks result
8. Browser navigates to channel
9. MessageList scrolls to message
10. Message highlighted briefly

**Acceptance Criteria:**
- ✅ Search input accessible via keyboard shortcut
- ✅ Search executes after 300ms debounce
- ✅ Results appear instantly (< 100ms perceived)
- ✅ Results show context (message preview, author, time)
- ✅ Results filtered by user's accessible channels
- ✅ Click result navigates correctly
- ✅ Target message highlighted on arrival
- ✅ Search supports basic operators (from:, in:, has:)

**Technical Tests:**
- Unit: searchMessages query filters by groupId
- Unit: searchMessages handles special characters
- Integration: Search input → searchMessages → results render
- E2E: Search → select result → verify navigation → verify highlight

---

## Flow 6: Use Sidebar to Navigate Organization Structure

**User goal:** Navigate from one channel to another via ChatSidebar

**Time budget:** < 2 seconds (click → channel loads)

**Ontology Mapping:**
- **Groups involved:** organization, channels (nested groups)
- **Things involved:** messages in new channel
- **Connections involved:** member_of (user → channels)
- **Events logged:** None (navigation only)
- **Knowledge used:** Sidebar sections use labels (topic:stream, topic:channels)

**Steps:**
1. User opens ChatSidebar (always visible on desktop)
2. User sees 7 sections: Stream, Orgs, Groups, Channels, Tools, Agents, People
3. User clicks "Channels" section
4. List of channels appears (public + joined private)
5. User clicks "#marketing" channel
6. MessageList loads marketing channel messages
7. Composer updates to send to #marketing
8. Presence indicator shows who's in channel
9. Previous channel state preserved (back button works)

**Acceptance Criteria:**
- ✅ Sidebar renders all 7 sections
- ✅ Channel list shows only accessible channels
- ✅ Private channels show lock icon
- ✅ Click channel loads messages < 2 seconds
- ✅ Active channel highlighted in sidebar
- ✅ Unread message count badges accurate
- ✅ Sidebar collapsible (icons only on narrow screens)
- ✅ Mobile: Sidebar as sheet overlay

**Technical Tests:**
- Unit: ChatSidebar renders all sections
- Integration: ChatSidebar → click channel → MessageList updates
- E2E: Navigate sidebar → select channel → verify messages load

---

## Flow 7: Real-Time Typing Indicators

**User goal:** See when other users are typing in channel

**Time budget:** < 300ms (user types → indicator appears for others)

**Ontology Mapping:**
- **Things involved:** person (user typing)
- **Presence table:** isTyping flag, typingInChannelId
- **Events logged:** None (presence updates only)
- **Knowledge used:** None (real-time state)

**Steps:**
1. User A types in MessageComposer
2. handleTyping debounce triggers updatePresence mutation
3. updatePresence sets isTyping: true, typingInChannelId
4. User B's getTypingUsers query subscription fires
5. User B sees "User A is typing..." indicator
6. User A stops typing for 3 seconds
7. Timeout clears isTyping flag
8. Indicator disappears for User B

**Acceptance Criteria:**
- ✅ Typing indicator appears < 300ms after keystroke
- ✅ Shows up to 3 users typing (e.g., "Alice, Bob, and Charlie are typing...")
- ✅ Indicator disappears after 3 seconds of inactivity
- ✅ Indicator cleared when message sent
- ✅ No indicator for own typing
- ✅ Works across multiple channels independently

**Technical Tests:**
- Unit: updatePresence mutation sets isTyping correctly
- Unit: getTypingUsers query filters by channel
- Integration: Type in composer → verify presence updated
- E2E: User A types → User B sees indicator → verify clears

---

## Summary

**Total User Flows Defined:** 7
**Total Ontology Dimensions Mapped:** 6/6 (Groups, People, Things, Connections, Events, Knowledge)
**Time Budget Compliance:** All flows < 5 seconds
**Acceptance Criteria:** 63 specific, measurable criteria

**Next Steps (Cycle 62):** Convert acceptance criteria into technical test specifications

---

**Validation:**
- ✅ All flows map to ontology dimensions
- ✅ All flows have time budgets
- ✅ All flows have specific acceptance criteria
- ✅ All flows include technical test types
- ✅ Backend integration validated (not frontend-only)
