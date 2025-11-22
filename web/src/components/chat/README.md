# Chat Components - Real-Time Features Guide

## Quick Start

### Basic Chat Setup

```tsx
import { ChatContainer } from '@/components/chat/ChatContainer';
import { usePresenceHeartbeat } from '@/hooks/usePresenceHeartbeat';

function ChatPage({ channelId }: { channelId: string }) {
  // Enable presence tracking
  usePresenceHeartbeat({ channelId, enabled: true });

  return <ChatContainer channelId={channelId} />;
}
```

## Components

### MessageList
Real-time message display with typing indicators and infinite scroll.

**Features:**
- ✅ Typing indicators ("User is typing...")
- ✅ Auto-scroll to bottom
- ✅ Infinite scroll pagination
- ✅ Message grouping

### MessageComposer
Rich input with typing detection.

**Features:**
- ✅ Auto-resize textarea
- ✅ Send on Enter
- ✅ Character count (4000 limit)
- ✅ Typing indicator emission

### Message
Individual message with reactions and editing.

**Features:**
- ✅ Presence indicator
- ✅ Emoji reactions (10 quick-pick)
- ✅ Edit/delete with keyboard shortcuts
- ✅ Markdown rendering

### PresenceIndicator
Status display with color-coded dots.

**Colors:**
- 🟢 Green: Online
- 🟡 Yellow: Away  
- 🔴 Red: Busy
- ⚫ Gray: Offline

## Real-Time Features

### Typing Indicators
- Triggers on keystroke
- Auto-clears after 3s
- Smart formatting (1-3+ users)

### Presence Tracking
- Heartbeat every 30s
- Offline after 5min idle
- Real-time status updates

### Message Reactions
- 10 emoji quick-picker
- Toggle add/remove
- Highlight user reactions

## Usage

See `/one/events/cycle-31-40-real-time-features-summary.md` for complete documentation.

---

**Built for real-time, designed for delight.**
