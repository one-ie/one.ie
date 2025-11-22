# Chat Platform Wireframes

**Version:** 1.0.0
**Created:** 2025-11-22
**Status:** Complete

## Overview

Comprehensive wireframes for the ONE Platform chat system covering all view states, devices, and user interactions.

---

## Desktop Layout (1440px+)

### Primary View: Chat Interface

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Header: Profile + Search + Notifications + Settings                   [≡]  │
├──────────────┬────────────────────────────────────────┬────────────────────┤
│              │                                        │                    │
│  SIDEBAR     │         MESSAGES                       │    THREAD          │
│  (280px)     │         (flex-1)                       │    (400px)         │
│              │                                        │    [Optional]      │
│              │                                        │                    │
│  Profile     │  [Message input box with @mentions]   │                    │
│  Header      │                                        │                    │
│              │  ┌──────────────────────────────┐     │                    │
│  [Collapse]  │  │ Avatar | Message text        │     │  Thread:           │
│              │  │          @mention styling    │     │  └─ Re: Message    │
│  [Search]    │  │          Timestamp           │     │                    │
│              │  │          [👍 ❤️ 😂] reactions │     │  ┌──────────────┐ │
│  Stream      │  └──────────────────────────────┘     │  │ Reply 1      │ │
│  • Mentions  │                                        │  └──────────────┘ │
│  • Threads   │  ┌──────────────────────────────┐     │                    │
│             │  │ Avatar | Message text        │     │  ┌──────────────┐ │
│  Orgs        │  │          Typing indicator... │     │  │ Reply 2      │ │
│  • Org 1     │  └──────────────────────────────┘     │  └──────────────┘ │
│              │                                        │                    │
│  Groups      │  [Scroll to bottom ↓]                 │  [Reply input]     │
│  • Group A   │                                        │                    │
│  • Group B   │                                        │                    │
│              │                                        │                    │
│  Channels    │                                        │                    │
│  • # general │                                        │                    │
│  • # random  │                                        │                    │
│              │                                        │                    │
│  Tools       │                                        │                    │
│  • Search    │                                        │                    │
│  • Files     │                                        │                    │
│              │                                        │                    │
│  Agents      │                                        │                    │
│  • @claude   │                                        │                    │
│  • @gpt      │                                        │                    │
│              │                                        │                    │
│  People      │                                        │                    │
│  • John 🟢   │                                        │                    │
│  • Sarah 🟡  │                                        │                    │
│              │                                        │                    │
│  [Settings]  │                                        │                    │
└──────────────┴────────────────────────────────────────┴────────────────────┘
```

### Collapsed Sidebar (72px)

```
┌──────┬──────────────────────────────────────────────┬──────────────────┐
│      │                                              │                  │
│  ☰   │         MESSAGES (more space)                │    THREAD        │
│      │                                              │                  │
│  🔍  │                                              │                  │
│      │                                              │                  │
│  📺  │                                              │                  │
│  🏢  │                                              │                  │
│  👥  │                                              │                  │
│  #   │                                              │                  │
│  🔧  │                                              │                  │
│  🤖  │                                              │                  │
│  👤  │                                              │                  │
│      │                                              │                  │
│  ⚙️  │                                              │                  │
└──────┴──────────────────────────────────────────────┴──────────────────┘
```

---

## Mobile Layout (320px - 768px)

### Mobile: Message List View

```
┌─────────────────────────────────┐
│ [☰] Chat Platform      [🔔] [⚙] │
├─────────────────────────────────┤
│                                 │
│  ┌───────────────────────────┐ │
│  │ Avatar | Message text     │ │
│  │          @mention          │ │
│  │          12:34 PM          │ │
│  │          [👍 ❤️]           │ │
│  └───────────────────────────┘ │
│                                 │
│  ┌───────────────────────────┐ │
│  │ Avatar | Message text     │ │
│  │          12:35 PM          │ │
│  └───────────────────────────┘ │
│                                 │
│  "Sarah is typing..."           │
│                                 │
│                                 │
│  [Scroll to bottom ↓]          │
│                                 │
├─────────────────────────────────┤
│ [Type message...]     [@] [📎] │
│ [Send ➤]                        │
└─────────────────────────────────┘
```

### Mobile: Sidebar (Overlay)

```
┌─────────────────────────────────┐
│ [← Back] Sidebar                │
├─────────────────────────────────┤
│                                 │
│  Anthony O'Connell              │
│  [Profile avatar]               │
│                                 │
│  [Search channels...]           │
│                                 │
│  Stream                         │
│  • Mentions (3)                 │
│  • Threads                      │
│                                 │
│  Organisations                  │
│  • ONE Platform                 │
│                                 │
│  Groups                         │
│  • Engineering                  │
│  • Design                       │
│                                 │
│  Channels                       │
│  • # general                    │
│  • # random                     │
│                                 │
│  Tools                          │
│  • Search                       │
│  • Files                        │
│                                 │
│  Agents                         │
│  • @claude                      │
│  • @gpt                         │
│                                 │
│  People                         │
│  • John (Online)                │
│  • Sarah (Away)                 │
│                                 │
│  [Settings]                     │
│                                 │
└─────────────────────────────────┘
```

---

## View States

### 1. Loading State

```
┌─────────────────────────────────────────┐
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ [████░░░░░░░░] Loading skeleton │   │
│  │ [████████░░░░] Loading skeleton │   │
│  │ [██████░░░░░░] Loading skeleton │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ [████████░░░░] Loading skeleton │   │
│  │ [██████░░░░░░] Loading skeleton │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ [████░░░░░░░░] Loading skeleton │   │
│  │ [████████████] Loading skeleton │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

**Features:**
- Shimmer animation (gradient sweep left-to-right)
- 5 skeleton message placeholders
- Avatar circles (40px) + text bars
- Pulsing effect (opacity 1 → 0.5 → 1)

### 2. Empty State: No Messages

```
┌─────────────────────────────────────────┐
│                                         │
│              💬                         │
│                                         │
│         No messages yet                 │
│                                         │
│    Start the conversation by           │
│    sending a message below.             │
│                                         │
│    Suggested icebreakers:               │
│    • "Hello team! 👋"                   │
│    • "What's everyone working on?"      │
│    • "Welcome to the channel!"          │
│                                         │
└─────────────────────────────────────────┘
```

**Features:**
- Centered emoji icon (48px)
- Friendly headline (text-lg font-semibold)
- Helpful description (text-sm text-muted-foreground)
- 3 suggested messages (clickable)

### 3. Empty State: No Channels

```
┌─────────────────────────────────────────┐
│                                         │
│              #️⃣                          │
│                                         │
│      No channels available              │
│                                         │
│    Create your first channel to         │
│    start collaborating with your team.  │
│                                         │
│    Channel templates:                   │
│    • # general (team updates)           │
│    • # random (casual chat)             │
│    • # announcements (important news)   │
│                                         │
│    [+ Create Channel]                   │
│                                         │
└─────────────────────────────────────────┘
```

### 4. Empty State: No Mentions

```
┌─────────────────────────────────────────┐
│                                         │
│              @                          │
│                                         │
│      No mentions yet                    │
│                                         │
│    No one has mentioned you yet.        │
│    Stay active to get noticed!          │
│                                         │
│    Tips to get mentioned:               │
│    • Contribute to discussions          │
│    • Share helpful insights             │
│    • Ask thoughtful questions           │
│                                         │
│    [Browse Channels]                    │
│                                         │
└─────────────────────────────────────────┘
```

### 5. Empty State: No Search Results

```
┌─────────────────────────────────────────┐
│                                         │
│              🔍                         │
│                                         │
│      No results found                   │
│                                         │
│    No messages match your search        │
│    query "kubernetes deployment".       │
│                                         │
│    Search tips:                         │
│    • Try different keywords             │
│    • Check for typos                    │
│    • Use @mentions for people           │
│    • Use #channel for channels          │
│                                         │
│    [Clear Search]                       │
│                                         │
└─────────────────────────────────────────┘
```

### 6. Error State: Network Error

```
┌─────────────────────────────────────────┐
│                                         │
│              ⚠️                          │
│                                         │
│      Connection lost                    │
│                                         │
│    Unable to reach the server.          │
│    Your messages are safe.              │
│                                         │
│    Reconnecting in 5 seconds...         │
│                                         │
│    [Retry Now]   [Go Offline]          │
│                                         │
└─────────────────────────────────────────┘
```

**Features:**
- Countdown timer (5, 4, 3, 2, 1...)
- Auto-retry on countdown end
- Manual retry button
- Offline mode option (saves drafts locally)

### 7. Error State: Permission Denied

```
┌─────────────────────────────────────────┐
│                                         │
│              🔒                         │
│                                         │
│      Access denied                      │
│                                         │
│    You don't have permission to         │
│    view this channel.                   │
│                                         │
│    Contact your admin to request        │
│    access to #engineering.              │
│                                         │
│    [Request Access]   [Go Back]        │
│                                         │
└─────────────────────────────────────────┘
```

### 8. Error State: Channel Not Found

```
┌─────────────────────────────────────────┐
│                                         │
│              🔍                         │
│                                         │
│      Channel not found                  │
│                                         │
│    The channel you're looking for       │
│    doesn't exist or has been deleted.   │
│                                         │
│    [Browse Channels]   [Go Home]       │
│                                         │
└─────────────────────────────────────────┘
```

### 9. Error State: Rate Limit

```
┌─────────────────────────────────────────┐
│                                         │
│              ⏳                          │
│                                         │
│      Slow down there!                   │
│                                         │
│    You're sending messages too quickly. │
│    Please wait 30 seconds.              │
│                                         │
│    Cooldown: 00:27 remaining            │
│                                         │
│    [Okay]                               │
│                                         │
└─────────────────────────────────────────┘
```

---

## Interactive States

### Typing Indicator

```
┌───────────────────────────────────┐
│ Sarah is typing...                │
│ [● ● ●] (bouncing dots animation) │
└───────────────────────────────────┘

┌───────────────────────────────────┐
│ John and Sarah are typing...      │
│ [● ● ●]                           │
└───────────────────────────────────┘

┌───────────────────────────────────┐
│ John, Sarah, and 2 others are     │
│ typing...                         │
│ [● ● ●]                           │
└───────────────────────────────────┘
```

**Features:**
- 1 user: "{Name} is typing..."
- 2 users: "{Name} and {Name} are typing..."
- 3+ users: "{Name}, {Name}, and X others are typing..."
- Bouncing dots animation (3 dots, staggered bounce)
- Text color: muted-foreground
- Auto-clears after 3 seconds of inactivity

### Mention Autocomplete

```
┌─────────────────────────────────┐
│ Type message: @jo               │
│ ▼ Suggestions:                  │
│ ┌─────────────────────────────┐ │
│ │ 👤 @john (Online)            │ │
│ │ 👤 @joan (Away)              │ │
│ │ 🤖 @jobot (Agent)            │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**Features:**
- Triggers on "@" character
- Fuzzy search (matches "jo" → "john", "joan")
- Arrow key navigation (↑↓)
- Enter to select, Esc to cancel
- Shows presence indicator (🟢 online, 🟡 away, 🔴 busy, ⚫ offline)
- Highlights matching characters
- Max 5 suggestions shown

### Message Hover Actions

```
┌─────────────────────────────────────────────────┐
│ Avatar | Message text                           │
│          @mention styling                       │
│          12:34 PM                               │
│          [👍 ❤️ 😂]                             │
│                                                 │
│   [😊] [💬] [⋮] ← Hover actions (top right)    │
└─────────────────────────────────────────────────┘
```

**Hover Actions:**
- 😊 Add reaction (dropdown with 10 quick emojis)
- 💬 Reply in thread
- ⋮ More options (Edit, Delete, Copy link, Pin)

**Visibility:**
- Hidden by default
- Appears on hover (opacity 0 → 1, duration 150ms)
- Positioned absolute top-right of message
- Background: white with border and shadow
- Sticks while dropdown is open

### Message Reactions

```
┌─────────────────────────────────────────┐
│ Message text...                         │
│                                         │
│ [👍 3] [❤️ 1] [😂  5] [+ Add reaction]  │
└─────────────────────────────────────────┘
```

**Features:**
- Reactions grouped by emoji
- Count badge (rounded-full, text-xs)
- Highlighted if current user reacted (border-2 border-primary)
- Click to toggle (add/remove)
- Hover shows tooltip with reactors' names
- "+ Add reaction" button shows emoji picker

---

## Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | 320px - 767px | Stacked (sidebar overlay) |
| Tablet | 768px - 1023px | 2-column (sidebar + messages) |
| Desktop | 1024px - 1439px | 3-column (sidebar + messages + thread optional) |
| Wide | 1440px+ | 3-column (full layout) |

---

## Accessibility Features

### Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Navigate through interactive elements |
| Shift+Tab | Navigate backwards |
| Enter | Select/activate focused element |
| Escape | Close dropdown/modal/autocomplete |
| ↑/↓ | Navigate autocomplete suggestions |
| Alt+S | Focus search box |
| Alt+C | Open channel switcher |
| Alt+M | View mentions |

### Screen Reader Labels

- "Message from {User} at {Time}: {Content}"
- "Add reaction button"
- "Reply in thread button"
- "Send message button"
- "Typing indicator: {Users} are typing"
- "Mention autocomplete: {Count} suggestions available"

### Focus Management

- Visible focus ring (2px solid, ring color)
- Skip to main content link
- Focus trap in modals
- Focus returns to trigger after modal close
- Auto-focus on input after sending message

### ARIA Live Regions

```html
<div aria-live="polite" aria-label="Typing indicators">
  Sarah is typing...
</div>

<div aria-live="assertive" aria-label="Error notifications">
  Network connection lost. Retrying...
</div>

<div role="log" aria-label="New messages">
  New message from John at 12:34 PM
</div>
```

---

## Design Tokens Reference

### Colors
- Primary: `hsl(216 55% 25%)` - Blue
- Mention: `hsl(280 100% 60%)` - Purple
- Success: `hsl(142 71% 45%)` - Green
- Warning: `hsl(45 93% 47%)` - Yellow/Orange
- Error: `hsl(0 84% 60%)` - Red

### Spacing
- Base unit: 4px
- Scale: [4, 8, 12, 16, 24, 32, 48, 64, 96, 128]

### Typography
- Font family: System UI stack
- Sizes: xs (12px), sm (14px), base (16px), lg (18px), xl (20px), 2xl (24px)
- Weights: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Timing
- Instant: 150ms (hover, focus)
- Fast: 300ms (dropdown, tooltip)
- Moderate: 500ms (modal, slide)
- Slow: 1000ms (page transition)

---

## Wireframe Notes

**Version History:**
- 1.0.0 (2025-11-22): Initial comprehensive wireframes

**Tools Used:**
- ASCII art for rapid iteration
- Markdown for documentation
- Reference: Slack, Discord, Microsoft Teams

**Next Steps:**
- Convert to high-fidelity mockups (Figma)
- Create interactive prototype (Framer)
- User testing with 5 participants
- A/B test empty states
- Measure conversion: empty state CTA clicks

---

**Wireframes complete. Ready for component implementation.**
