# Custom Event Tracking System

**Cycle 79: Custom Event Tracking**

A flexible, production-ready event tracking system for capturing and analyzing custom business events.

## Features

✅ **Pre-built Event Library** - 16+ common events ready to use
✅ **Custom Event Definition** - Track any event with rich metadata
✅ **Event Goals** - Set targets and track progress
✅ **Real-time Analytics** - Charts and insights for event data
✅ **Local + Backend Storage** - localStorage with optional Convex persistence
✅ **Export Functionality** - Download events as CSV

---

## Quick Start

### 1. Track Events

```typescript
import { trackEvent, EventLibrary } from '@/lib/analytics/custom-events';

// Use pre-built event
trackEvent(EventLibrary.VIDEO_WATCHED, {
  videoId: 'intro-2024',
  duration: 120,
  percentWatched: 95
});

// Track custom event
trackEvent('pricing_page_viewed', {
  plan: 'pro',
  source: 'homepage',
  cta: 'hero-button'
});
```

### 2. View Dashboard

```tsx
import { CustomEventsDashboard } from '@/components/analytics/CustomEventsDashboard';

<CustomEventsDashboard groupId="your-group-id" />
```

### 3. Create Goals

```typescript
import { createEventGoal } from '@/lib/analytics/custom-events';

// Set a goal for 1000 video plays this month
createEventGoal('video_played', 1000, 'month');
```

---

## Event Library

### Content Engagement

**VIDEO_PLAYED**
```typescript
trackEvent(EventLibrary.VIDEO_PLAYED, {
  videoId: 'string',
  title: 'string',
  duration: 'number'
});
```

**VIDEO_WATCHED** (80%+ completion)
```typescript
trackEvent(EventLibrary.VIDEO_WATCHED, {
  videoId: 'string',
  watchTime: 'number',
  percentWatched: 'number'
});
```

**PDF_DOWNLOADED**
```typescript
trackEvent(EventLibrary.PDF_DOWNLOADED, {
  fileName: 'string',
  fileSize: 'number',
  fileUrl: 'string'
});
```

**ARTICLE_READ** (50%+ scroll)
```typescript
trackEvent(EventLibrary.ARTICLE_READ, {
  articleId: 'string',
  title: 'string',
  readTime: 'number'
});
```

### Conversion Events

**FORM_SUBMITTED**
```typescript
trackEvent(EventLibrary.FORM_SUBMITTED, {
  formId: 'string',
  formName: 'string',
  fields: { /* form data */ }
});
```

**SIGNUP_STARTED**
```typescript
trackEvent(EventLibrary.SIGNUP_STARTED, {
  source: 'string',
  plan: 'string'
});
```

**SIGNUP_COMPLETED**
```typescript
trackEvent(EventLibrary.SIGNUP_COMPLETED, {
  userId: 'string',
  plan: 'string',
  source: 'string'
});
```

**TRIAL_STARTED**
```typescript
trackEvent(EventLibrary.TRIAL_STARTED, {
  plan: 'string',
  trialDays: 'number'
});
```

**PURCHASE_INITIATED**
```typescript
trackEvent(EventLibrary.PURCHASE_INITIATED, {
  productId: 'string',
  productName: 'string',
  price: 'number'
});
```

### Navigation Events

**PAGE_VIEWED**
```typescript
trackEvent(EventLibrary.PAGE_VIEWED, {
  pageUrl: 'string',
  pageTitle: 'string'
});
```

**LINK_CLICKED**
```typescript
trackEvent(EventLibrary.LINK_CLICKED, {
  linkUrl: 'string',
  linkText: 'string',
  linkId: 'string'
});
```

**BUTTON_CLICKED**
```typescript
trackEvent(EventLibrary.BUTTON_CLICKED, {
  buttonId: 'string',
  buttonText: 'string',
  location: 'string'
});
```

**SEARCH_PERFORMED**
```typescript
trackEvent(EventLibrary.SEARCH_PERFORMED, {
  query: 'string',
  resultsCount: 'number'
});
```

### Error Events

**ERROR_OCCURRED**
```typescript
trackEvent(EventLibrary.ERROR_OCCURRED, {
  errorMessage: 'string',
  errorCode: 'string',
  stack: 'string'
});
```

**FORM_ERROR**
```typescript
trackEvent(EventLibrary.FORM_ERROR, {
  formId: 'string',
  fieldName: 'string',
  errorMessage: 'string'
});
```

---

## API Reference

### Core Functions

#### `trackEvent(eventName, properties, options)`

Track a custom event.

**Parameters:**
- `eventName` (string | CustomEventDefinition) - Event name or definition from EventLibrary
- `properties` (Record<string, unknown>) - Event metadata
- `options` (object) - Optional configuration
  - `userId` (string) - User ID
  - `groupId` (string) - Group ID for multi-tenant
  - `persistToBackend` (boolean) - Save to Convex (default: false)

**Returns:** CustomEvent

**Example:**
```typescript
trackEvent('video_watched',
  { videoId: 'intro', duration: 120 },
  { userId: 'user_123', persistToBackend: true }
);
```

---

### Retrieval Functions

#### `getAllEvents()`
Get all tracked events from localStorage.

#### `getEventsByName(eventName)`
Get events filtered by name.

#### `getEventsByDateRange(startDate, endDate)`
Get events within a date range.

#### `getEventsBySession(sessionId)`
Get events from a specific session.

#### `getEventCount(eventName)`
Get count of a specific event.

#### `getEventCounts()`
Get counts grouped by event name.

#### `getTopEvents(limit)`
Get top N events by count.

**Example:**
```typescript
const videoPlays = getEventsByName('video_played');
const topEvents = getTopEvents(10);
const counts = getEventCounts(); // { video_played: 45, form_submitted: 12, ... }
```

---

### Goal Functions

#### `createEventGoal(eventName, target, period)`

Create an event goal.

**Parameters:**
- `eventName` (string) - Event to track
- `target` (number) - Target count
- `period` ('day' | 'week' | 'month' | 'all-time') - Goal period

**Returns:** EventGoal

**Example:**
```typescript
// Track 100 signups this week
const goal = createEventGoal('signup_completed', 100, 'week');

// Track 1000 video plays all-time
const goal = createEventGoal('video_played', 1000, 'all-time');
```

#### `getAllGoals()`
Get all event goals.

#### `getActiveGoals()`
Get active (in-progress) goals.

#### `getGoalById(goalId)`
Get a specific goal by ID.

#### `deleteGoal(goalId)`
Delete a goal.

#### `archiveGoal(goalId)`
Archive a completed/failed goal.

---

### Utility Functions

#### `exportEventsAsCSV()`
Export events as CSV string.

#### `downloadEventsCSV()`
Download events as CSV file.

#### `clearAllEvents()`
Clear all stored events (for testing).

#### `clearAllGoals()`
Clear all goals (for testing).

#### `getEventDefinition(eventName)`
Get event definition from library.

#### `getAllEventDefinitions()`
Get all event definitions from library.

---

## Dashboard Components

### CustomEventsDashboard

Comprehensive dashboard with:
- Event feed with search, filtering, pagination
- Analytics charts (line, bar, pie)
- Event goals with progress tracking
- Event library browser
- Export functionality

**Props:**
- `groupId` (string, optional) - Group ID for multi-tenant
- `showBackendEvents` (boolean, optional) - Fetch events from Convex

**Example:**
```tsx
<CustomEventsDashboard
  groupId="group_123"
  showBackendEvents={true}
/>
```

---

## Use Cases

### 1. Video Engagement Tracking

```typescript
// Track when video starts
const video = document.querySelector('video');
video.addEventListener('play', () => {
  trackEvent(EventLibrary.VIDEO_PLAYED, {
    videoId: video.id,
    title: video.dataset.title,
    duration: video.duration
  });
});

// Track when video completes
video.addEventListener('ended', () => {
  trackEvent(EventLibrary.VIDEO_WATCHED, {
    videoId: video.id,
    watchTime: video.currentTime,
    percentWatched: 100
  });
});

// Set goal: 1000 video plays this month
createEventGoal('video_played', 1000, 'month');
```

### 2. Form Analytics

```typescript
// Track form submission
form.addEventListener('submit', (e) => {
  trackEvent(EventLibrary.FORM_SUBMITTED, {
    formId: form.id,
    formName: form.dataset.name,
    fields: getFormData(form)
  });
});

// Track form errors
form.querySelectorAll('input').forEach(input => {
  input.addEventListener('invalid', () => {
    trackEvent(EventLibrary.FORM_ERROR, {
      formId: form.id,
      fieldName: input.name,
      errorMessage: input.validationMessage
    });
  });
});

// Set goal: 50 form submissions this week
createEventGoal('form_submitted', 50, 'week');
```

### 3. Content Download Tracking

```typescript
// Track PDF downloads
document.querySelectorAll('a[href$=".pdf"]').forEach(link => {
  link.addEventListener('click', () => {
    trackEvent(EventLibrary.PDF_DOWNLOADED, {
      fileName: link.download || link.href.split('/').pop(),
      fileUrl: link.href,
      fileSize: parseFloat(link.dataset.size || '0')
    });
  });
});

// Set goal: 200 PDF downloads this month
createEventGoal('pdf_downloaded', 200, 'month');
```

### 4. Conversion Funnel Tracking

```typescript
// Step 1: User visits pricing page
trackEvent('pricing_viewed', {
  source: document.referrer,
  plan: selectedPlan
});

// Step 2: User starts signup
trackEvent(EventLibrary.SIGNUP_STARTED, {
  source: 'pricing-page',
  plan: selectedPlan
});

// Step 3: User completes signup
trackEvent(EventLibrary.SIGNUP_COMPLETED, {
  userId: newUser.id,
  plan: selectedPlan,
  source: 'pricing-page'
});

// Set goals for each step
createEventGoal('pricing_viewed', 5000, 'month');
createEventGoal('signup_started', 500, 'month');
createEventGoal('signup_completed', 100, 'month');
```

---

## Backend Integration (Optional)

By default, events are stored in localStorage. For persistence and analytics across devices:

### 1. Enable Backend Persistence

```typescript
trackEvent('my_event', { data: 'value' }, {
  persistToBackend: true  // Saves to Convex
});
```

### 2. Query Backend Events

```typescript
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

const events = useQuery(api.queries.events.getCustomEvents, {
  eventNames: ['video_played', 'form_submitted'],
  startDate: Date.now() - 30 * 24 * 60 * 60 * 1000, // Last 30 days
  limit: 1000
});
```

### 3. Dashboard with Backend Events

```tsx
<CustomEventsDashboard
  groupId="group_123"
  showBackendEvents={true}  // Fetches from Convex
/>
```

---

## Data Model

### CustomEvent

```typescript
interface CustomEvent {
  name: string;              // Event name
  timestamp: number;         // Event timestamp (ms)
  sessionId: string;         // Session identifier
  properties: Record<string, unknown>;  // Event metadata
  pageUrl: string;           // Page URL where event occurred
  userId?: string;           // User ID (if authenticated)
  groupId?: string;          // Group ID (for multi-tenant)
}
```

### EventGoal

```typescript
interface EventGoal {
  id: string;                // Goal ID
  eventName: string;         // Event to track
  target: number;            // Target count
  current: number;           // Current count
  period: 'day' | 'week' | 'month' | 'all-time';
  startDate: number;         // Goal start date
  endDate?: number;          // Goal end date (optional)
  status: 'active' | 'completed' | 'failed' | 'archived';
}
```

### CustomEventDefinition

```typescript
interface CustomEventDefinition {
  name: string;              // Unique event name
  displayName: string;       // Human-readable name
  description: string;       // Event description
  category: 'engagement' | 'conversion' | 'content' | 'navigation' | 'error' | 'custom';
  properties?: Record<string, 'string' | 'number' | 'boolean' | 'object'>;
  icon?: string;             // Emoji icon
}
```

---

## Demo Page

Visit `/analytics/custom-events` to see the system in action:

- Live event tracking dashboard
- Test buttons to trigger sample events
- Event library browser
- Goal creation and tracking
- Interactive charts and analytics

---

## Best Practices

1. **Use Descriptive Event Names**
   - ✅ Good: `video_played`, `signup_completed`, `pdf_downloaded`
   - ❌ Bad: `event1`, `action`, `click`

2. **Include Rich Metadata**
   ```typescript
   // ✅ Good: Rich context
   trackEvent('button_clicked', {
     buttonId: 'cta-hero',
     buttonText: 'Get Started',
     location: 'homepage-hero',
     timestamp: Date.now()
   });

   // ❌ Bad: Minimal context
   trackEvent('button_clicked', {});
   ```

3. **Set Realistic Goals**
   - Base goals on historical data
   - Start with achievable targets
   - Adjust goals based on trends

4. **Monitor Goal Progress**
   - Check goals regularly
   - Adjust strategies if falling behind
   - Celebrate when goals are reached

5. **Export and Analyze Data**
   - Export CSV for deeper analysis
   - Combine with other analytics tools
   - Share insights with team

---

## Troubleshooting

### Events Not Appearing

1. Check browser console for errors
2. Verify `trackEvent()` is being called
3. Check localStorage: `localStorage.getItem('custom-events')`
4. Ensure event name is correct

### Goals Not Updating

1. Verify goal event name matches tracked event name
2. Check goal status (active vs. completed/archived)
3. Refresh dashboard to see latest data

### Backend Persistence Not Working

1. Ensure `persistToBackend: true` is set
2. Verify Convex connection is active
3. Check backend logs for errors
4. Ensure user is authenticated

---

## License

Part of the ONE Platform - Built with Astro, React, and Convex.

---

**Ready to track custom events? Start with the demo page: `/analytics/custom-events`**
