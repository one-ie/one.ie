# Chat Platform - User Guide

**Version:** 1.0.0
**Status:** ✅ Complete
**Scope:** Global
**Audience:** End Users

## Overview

The ONE chat platform provides real-time messaging with @mentions, threads, and AI agent integration. Built on the 6-dimension ontology, it seamlessly integrates people, channels, messages, and AI agents into a unified communication experience.

## Getting Started (5 Minutes)

### Accessing Chat

1. Navigate to `/chat` in your ONE installation
2. The sidebar shows 7 organized sections (collapsed by default for maximum chat space)
3. Select a channel from the **Channels** section to start

### Interface Overview

```
┌─────────────────────────────────────────────────────────┐
│ Header: Channel name, search, settings                  │
├──────┬──────────────────────────────────────────────────┤
│ Side │ Message List                                     │
│ bar  │ ┌─────────────────────────────────────────┐     │
│ (80px│ │ User avatar | Message content           │     │
│ icons│ │             | @mentions highlighted     │     │
│ only)│ │             | Reactions, Reply, Thread  │     │
│      │ └─────────────────────────────────────────┘     │
│      │                                                  │
│      │ ┌─────────────────────────────────────────┐     │
│      │ │ Message Composer                        │     │
│      │ │ Type @ to mention users/agents          │     │
│      │ └─────────────────────────────────────────┘     │
└──────┴──────────────────────────────────────────────────┘
```

**Sidebar Design Decision:**
- **Collapsed by default** - Chat interface optimized for maximum horizontal space
- **Icon-only (80px)** - Quick access to all 7 sections without sacrificing chat width
- **Hover to expand** - Desktop users can hover to see full labels temporarily
- **Mobile overlay** - Full sidebar slides over chat on mobile devices

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+K` (Mac) / `Ctrl+K` (Windows) | Quick search messages |
| `@username` | Mention a user |
| `@agent` | Mention an AI agent |
| `Enter` | Send message |
| `Shift+Enter` | New line in message |
| `↑` (in composer) | Edit last message |
| `Esc` | Cancel editing |

## Sending Messages

### Basic Message

1. Click in the message composer at the bottom
2. Type your message
3. Press `Enter` to send (or `Shift+Enter` for multi-line)

**Markdown Support:**
```markdown
**bold** → bold text
*italic* → italic text
`code` → inline code
```code block``` → code block with syntax highlighting
[link](url) → clickable link
```

### Message Actions

Hover over any message to see actions:
- **React** (😊👍🎉💯) - Add emoji reaction
- **Reply** - Create a thread
- **Edit** (your messages only) - Modify content
- **Delete** (your messages only) - Remove message

## @Mentions

### Mentioning Users

1. Type `@` in the message composer
2. Autocomplete shows matching users (by name or email)
3. Select user with arrow keys or mouse
4. Press `Enter` or `Tab` to insert mention

**Example:**
```
Hey @john, can you review this?
```

### Mentioning AI Agents

Same process as users, but select an AI agent:

```
@copilot, help me debug this code
```

**Available Special Mentions:**
- `@here` - Notify all online users in channel
- `@channel` - Notify all channel members (use sparingly!)

### Managing Mentions

**View Your Mentions:**
1. Click **Stream** in sidebar
2. Select **Mentions** tab
3. Filter by "All" or "Unread"
4. Click "View Message" to jump to original

**Mark as Read:**
- Individual: Click "Mark as Read" on mention card
- Bulk: Click "Mark All Read" button

**Notification Badge:**
- Unread mentions show count badge in sidebar
- Real-time updates as new mentions arrive

## Threads

### Creating a Thread

1. Hover over a message
2. Click **Reply** button
3. Your reply appears in a thread

### Viewing Threads

**Thread indicators:**
- Messages with threads show reply count: "3 replies"
- Click reply count or message to open thread view

**Thread View:**
- Original message at top
- All replies below in chronological order
- Reply from thread view to continue conversation

### When to Use Threads

✅ **Use threads for:**
- Follow-up questions on a message
- Detailed discussions that would clutter main chat
- Code reviews or feedback loops

❌ **Avoid threads for:**
- New topics (start new message instead)
- Time-sensitive announcements (keep in main chat)

## Sidebar Navigation

The sidebar provides 7 organized sections (all collapsed to icons by default):

### 1. Stream
- **All Activity** - Everything happening across your workspace
- **Mentions** - Messages where you were @mentioned
- **Threads** - Conversations you're participating in
- **Saved** - Bookmarked messages (coming soon)

### 2. Organizations
- Switch between different organizations
- View organization-wide channels
- Access org settings (if you're an owner)

### 3. Groups
- Hierarchical group navigation
- Department or team-specific channels
- Group-scoped content and resources

### 4. Channels
- All channels you're a member of
- Public channels (# prefix)
- Private channels (🔒 prefix)
- Direct messages (DM)

### 5. Tools
- Search - Full-text message search
- Files - Shared files and attachments
- Analytics - Usage statistics (org owners)

### 6. Agents
- AI agents available in workspace
- Agent status (online/offline)
- Agent conversation history
- Configure agent behaviors (if you're an admin)

### 7. People
- Team directory
- User presence indicators
- Profile cards with role badges

**Expanding Sections:**
- **Desktop:** Hover over icon to temporarily expand labels
- **Mobile:** Tap hamburger menu to open full sidebar overlay
- **Toggle:** Click desktop toggle button to switch between collapsed/expanded

## Search Messages

### Quick Search (Cmd+K)

1. Press `Cmd+K` (Mac) or `Ctrl+K` (Windows)
2. Type search query
3. Results appear instantly as you type
4. Click result to jump to message

### Advanced Search

**Search in Tools > Search:**
- Filter by date range
- Filter by channel
- Filter by author
- Filter by has:mentions, has:threads, has:files

**Search Syntax:**
```
from:john           # Messages from user John
in:#general         # Messages in #general channel
has:mention         # Messages with @mentions
has:thread          # Messages with replies
before:2025-01-01   # Messages before date
after:2025-01-01    # Messages after date
```

## Presence & Typing Indicators

### Your Status

**Automatic presence detection:**
- **Online (green)** - Active in last 5 minutes
- **Away (yellow)** - Inactive 5-30 minutes
- **Offline (gray)** - Inactive > 30 minutes

**Manual status:**
1. Click your avatar in sidebar
2. Select status: Available, Busy, Do Not Disturb
3. Optional: Add status message ("In a meeting until 3pm")

### Seeing Others

**User presence:**
- Colored dot next to user avatar indicates status
- Hover over avatar to see full status message

**Typing indicators:**
- "John is typing..." appears when someone types in channel
- Real-time updates using Convex subscriptions
- Clears after 3 seconds of inactivity

## Customization

### Sidebar Settings

**Collapse/Expand:**
- Chat pages start with sidebar collapsed (icons only)
- Other pages start with sidebar expanded (full labels)
- Toggle button in header switches between modes
- Setting persists per-page type (chat vs other)

### Notification Settings (Coming Soon)

- Mute channels
- Notification schedule (quiet hours)
- Desktop notifications
- Mobile push notifications
- Email digests

### Display Preferences (Coming Soon)

- Light/dark theme
- Message density (compact/comfortable)
- Font size
- Emoji skin tone

## Common Questions

### Q: How do I know if someone saw my message?

**A:** Read receipts are not currently implemented. Use reactions (👀 or ✅) to acknowledge messages.

### Q: Can I edit messages after sending?

**A:** Yes! Hover over your message and click "Edit". An (edited) tag appears after editing.

### Q: What happens when I @mention an AI agent?

**A:** The agent receives a notification event and responds in the thread. Response time depends on agent configuration (typically < 5 seconds).

### Q: Can I delete messages?

**A:** Yes, you can delete your own messages. Deleted messages show as "Message deleted" to preserve conversation context.

### Q: How many messages can I search?

**A:** All messages in channels you have access to. Search is real-time and indexed.

### Q: Can I upload files?

**A:** File upload is coming in the next release. For now, paste links to cloud storage (Dropbox, Google Drive, etc.).

### Q: How do I create a new channel?

**A:** Org owners and users with "create_channel" permission can create channels. Click the "+" button next to "Channels" in the sidebar.

## Performance Tips

### For Best Experience

1. **Use threads** - Keep main channel focused, details in threads
2. **Search first** - Before asking, search if question was answered
3. **@mention sparingly** - Only mention when you need someone's attention
4. **Mark mentions read** - Clear your mention inbox regularly
5. **Mute noisy channels** - Stay focused on what matters

### Troubleshooting

**Messages not loading?**
- Check internet connection
- Refresh page (Cmd+R / Ctrl+R)
- Clear browser cache if issue persists

**Mentions not appearing?**
- Verify you typed @ correctly
- User must be in the channel to be mentioned
- Check autocomplete menu appeared

**Typing indicators not working?**
- Real-time features require WebSocket connection
- Check for firewall/proxy blocking WebSockets
- Try different browser

## Mobile Experience

**Responsive design works on:**
- iOS Safari (iPhone, iPad)
- Android Chrome
- Mobile browsers

**Mobile-specific features:**
- Sidebar becomes full-screen overlay
- Swipe gestures for navigation
- Touch-optimized message actions
- Optimized keyboard handling

## What's Next?

**Upcoming features:**
- File uploads and attachments
- Video/voice calls
- Screen sharing
- Channel analytics
- Advanced search filters
- Custom emojis
- Message templates

## Related Documentation

- **Technical Guide:** [Chat Platform Technical Documentation](./chat-platform-technical.md)
- **API Reference:** [Chat API Documentation](/backend/API-DOCUMENTATION.md)
- **Ontology:** [6-Dimension Ontology](/one/knowledge/ontology.md)
- **Architecture:** [Platform Architecture](/one/knowledge/architecture.md)

## Support

**Need help?**
- Search documentation: https://one.ie/docs
- Community forum: https://one.ie/community
- Email support: support@one.ie
- GitHub issues: https://github.com/one-ie/one/issues

---

**Built with clarity, simplicity, and infinite scale in mind.**
