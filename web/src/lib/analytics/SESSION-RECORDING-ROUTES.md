# Session Recording - Routes & APIs

**Quick reference for all session recording URLs, components, and APIs.**

## Routes

### Session List
```
URL: /funnels/[id]/sessions
File: /web/src/pages/funnels/[id]/sessions.astro
Component: SessionList (client:load)

Example: /funnels/abc123/sessions
```

**Features:**
- View all session recordings for a funnel
- Filter by conversion status, device type
- Search by session ID or visitor ID
- Sort by date, duration, page views, conversion
- Export to CSV
- Stats cards (total sessions, conversions, avg duration, revenue)

### Session Playback
```
URL: /funnels/[id]/sessions/[sessionId]
File: /web/src/pages/funnels/[id]/sessions/[sessionId].astro
Component: SessionPlayer (client:load)

Example: /funnels/abc123/sessions/session_xyz789
```

**Features:**
- Watch full session recording
- Video-like controls (play, pause, seek)
- Speed control (0.5x - 4x)
- Timeline scrubbing
- Full-screen mode
- Session metadata (date, duration, device, conversion)

## Components

### SessionPlayer
```typescript
import { SessionPlayer } from '@/components/analytics/SessionPlayer';

<SessionPlayer
  session={sessionMetadata}
  autoPlay={true}
  showMetadata={true}
  client:load
/>
```

**Props:**
- `session: SessionMetadata` - Session data to play back
- `autoPlay?: boolean` - Auto-play on load (default: false)
- `showMetadata?: boolean` - Show session details (default: true)

### SessionList
```typescript
import { SessionList } from '@/components/analytics/SessionList';

<SessionList
  funnelId="funnel_123"
  groupId="org_456"
  client:load
/>
```

**Props:**
- `funnelId: string` - Funnel ID to filter sessions
- `groupId: string` - Group ID for multi-tenancy

## APIs

### Backend Mutation

#### saveSessionRecording
```typescript
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

const saveRecording = useMutation(api.mutations.analytics.saveSessionRecording);

await saveRecording({
  sessionId: "session_123",
  visitorId: "visitor_456",
  funnelId: funnelId,
  startTime: Date.now(),
  endTime: Date.now() + 30000,
  duration: 30000,
  pageViews: ["/step1", "/step2"],
  device: {
    userAgent: navigator.userAgent,
    viewport: { width: 1920, height: 1080 },
    platform: navigator.platform
  },
  conversion: {
    converted: true,
    conversionType: "purchase",
    revenue: 99.99
  },
  events: [...] // rrweb events
});
```

**Arguments:**
- `sessionId: string` - Unique session identifier
- `visitorId: string` - Visitor identifier (can be anonymous)
- `funnelId?: Id<"things">` - Funnel ID (optional)
- `startTime: number` - Session start timestamp
- `endTime: number` - Session end timestamp
- `duration: number` - Session duration in milliseconds
- `pageViews: string[]` - Array of page paths visited
- `device: object` - Device information
- `conversion?: object` - Conversion data (if converted)
- `events: any` - rrweb event stream

**Returns:**
```typescript
{
  eventId: Id<"events">,
  message: "Session recording saved successfully"
}
```

### Backend Query

#### events.byType
```typescript
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

const sessionEvents = useQuery(api.queries.events.byType, {
  type: "session_recorded"
});

// Filter by funnel
const funnelSessions = sessionEvents?.filter(
  (event) => event.metadata?.funnelId === funnelId
);
```

**Arguments:**
- `type: string` - Event type (use "session_recorded")
- `limit?: number` - Max results (default: 100)

**Returns:**
```typescript
Array<{
  _id: Id<"events">,
  type: "session_recorded",
  actorId: Id<"things">,
  targetId?: Id<"things">,
  timestamp: number,
  metadata: {
    sessionId: string,
    visitorId: string,
    funnelId?: string,
    startTime: number,
    endTime: number,
    duration: number,
    pageViews: string[],
    device: object,
    conversion?: object,
    events: any[]
  }
}>
```

## Recording Library

### startRecording
```typescript
import { startRecording } from '@/lib/analytics/session-recorder';

const stopRecording = startRecording({
  funnelId: 'funnel_123',
  visitorId: 'visitor_456', // Optional, auto-generated if not provided
  onUpload: async (sessionData) => {
    // Upload session data to Convex
    await saveRecording(sessionData);
  }
});

// Stop recording later
stopRecording();
```

**Options:**
- `funnelId?: string` - Funnel ID to associate with session
- `visitorId?: string` - Visitor ID (auto-generated if not provided)
- `onUpload?: (data: SessionMetadata) => Promise<void>` - Upload callback

**Returns:**
- `() => void` - Function to stop recording

### Helper Functions

```typescript
import {
  getOrCreateSessionId,
  formatDuration,
  formatDeviceInfo,
  formatViewport,
  getSessionSummary
} from '@/lib/analytics/session-recorder';

// Get or create session ID
const sessionId = getOrCreateSessionId();
// Returns: "session_1234567890_abc123"

// Format duration
const formatted = formatDuration(30000);
// Returns: "30s" or "5m 30s" or "1h 5m"

// Format device info
const device = formatDeviceInfo({
  userAgent: navigator.userAgent,
  viewport: { width: 1920, height: 1080 },
  platform: 'MacIntel'
});
// Returns: "Chrome on macOS"

// Format viewport
const viewport = formatViewport({ width: 1920, height: 1080 });
// Returns: "Desktop (1920×1080)"

// Get session summary
const summary = getSessionSummary(sessionMetadata);
// Returns: { sessionId, visitorId, startTime, duration, pageViews, converted, device, viewport }
```

## Privacy Configuration

### Automatic Masking

```html
<!-- Passwords (automatically masked) -->
<input type="password" />
<!-- Displays as: •••••••• -->

<!-- Credit cards (data-type attribute) -->
<input data-type="credit-card" />
<!-- Displays as: •••• •••• •••• •••• -->

<!-- SSN (data-type attribute) -->
<input data-type="ssn" />
<!-- Displays as: •••-••-•••• -->

<!-- Phone numbers (automatically masked) -->
<input type="tel" />
<!-- Displays as: (•••) •••-•••• -->
```

### Custom Masking

```html
<!-- Mask specific content -->
<div data-recording="mask">
  This content will be masked in recordings
</div>

<!-- Block from recording entirely -->
<div data-recording="block">
  This content will NOT appear in recordings
</div>
```

### Privacy Config

```typescript
import { privacyConfig } from '@/lib/analytics/session-recorder';

// Current settings:
privacyConfig = {
  maskAllInputs: true,
  maskInputOptions: {
    password: true,
    email: false,
    text: false,
  },
  blockClass: "rr-block",
  maskTextClass: "rr-mask",
  maskInputFn: (text, element) => {
    // Custom masking logic
    return text;
  }
}
```

## Integration Examples

### Basic Funnel Integration

```typescript
// In your funnel page component
import { useEffect } from 'react';
import { startRecording } from '@/lib/analytics/session-recorder';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function FunnelPage({ funnelId }) {
  const saveRecording = useMutation(api.mutations.analytics.saveSessionRecording);

  useEffect(() => {
    const stop = startRecording({
      funnelId,
      onUpload: async (data) => {
        await saveRecording(data);
      }
    });

    return () => stop();
  }, [funnelId]);

  return <div>Funnel content</div>;
}
```

### Astro Page Integration

```astro
---
// src/pages/funnels/[id]/index.astro
import { FunnelPage } from '@/components/funnel/FunnelPage';

const { id } = Astro.params;
---

<Layout>
  <FunnelPage funnelId={id} client:load />
</Layout>
```

## Event Types

### session_recorded
```typescript
{
  type: "session_recorded",
  actorId: visitorThingId,
  targetId: funnelId,
  timestamp: startTime,
  metadata: {
    sessionId: "session_123",
    visitorId: "visitor_456",
    funnelId: "funnel_789",
    startTime: 1234567890,
    endTime: 1234567920,
    duration: 30000,
    pageViews: ["/step1", "/step2"],
    device: { ... },
    conversion: { ... },
    events: [ ... ],
    protocol: "session-recording"
  }
}
```

### visitor_converted
```typescript
// Auto-created when session has conversion
{
  type: "visitor_converted",
  actorId: visitorThingId,
  targetId: funnelId,
  timestamp: endTime,
  metadata: {
    sessionId: "session_123",
    funnelId: "funnel_789",
    value: 99.99,
    conversionType: "purchase",
    protocol: "session-recording"
  }
}
```

## Data Types

### SessionMetadata
```typescript
interface SessionMetadata {
  sessionId: string;
  funnelId?: string;
  visitorId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  pageViews: string[];
  device: {
    userAgent: string;
    viewport: { width: number; height: number };
    platform: string;
  };
  conversion?: {
    converted: boolean;
    conversionType?: string;
    revenue?: number;
  };
  events: eventWithTime[];
}
```

### SessionSummary
```typescript
interface SessionSummary {
  sessionId: string;
  funnelId?: string;
  visitorId: string;
  startTime: number;
  duration: number;
  pageViews: number;
  converted: boolean;
  device: string;
  viewport: string;
}
```

## Quick Links

- **Full Documentation:** `/web/src/lib/analytics/SESSION-RECORDING-README.md`
- **Integration Examples:** `/web/src/lib/analytics/session-recorder-integration-example.tsx`
- **Completion Summary:** `/one/events/cycle-078-session-recording-complete.md`
- **Session Recorder Library:** `/web/src/lib/analytics/session-recorder.ts`
- **Player Component:** `/web/src/components/analytics/SessionPlayer.tsx`
- **List Component:** `/web/src/components/analytics/SessionList.tsx`
- **Backend Mutation:** `/backend/convex/mutations/analytics.ts` (line 1035)

## Testing URLs

Once you start your dev server (`bun run dev`):

```
Session List:
http://localhost:4321/funnels/YOUR_FUNNEL_ID/sessions

Session Player:
http://localhost:4321/funnels/YOUR_FUNNEL_ID/sessions/SESSION_ID
```

Replace `YOUR_FUNNEL_ID` and `SESSION_ID` with actual IDs.
