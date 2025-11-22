# Experimental Features Lab - Quick Start Guide

## Overview

The Labs system provides a framework for testing experimental features with users before promoting them to production. It includes feature flags, A/B testing, usage tracking, and feedback collection.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Labs Homepage                           │
│                  /labs/index.astro                          │
│  ┌────────────────────────────────────────────────────┐    │
│  │              LabsGrid Component                    │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐          │    │
│  │  │ Exp Card │ │ Exp Card │ │ Exp Card │ ...      │    │
│  │  └──────────┘ └──────────┘ └──────────┘          │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                  LabsService (Effect.ts)                    │
│  • setFeatureFlag()     • trackUsage()                      │
│  • getActiveExperiments() • submitFeedback()                │
│  • A/B testing framework                                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              Convex Mutations (Backend)                     │
│  • feature-flags.ts                                         │
│  • Creates: experiments (things)                            │
│  • Creates: enabled_experiment (connections)                │
│  • Logs: experiment_* (events)                              │
│  • Stores: feedback (knowledge)                             │
└─────────────────────────────────────────────────────────────┘
```

## Files Structure

```
web/
├── src/
│   ├── pages/
│   │   └── labs/
│   │       ├── index.astro                    # Labs homepage
│   │       └── experiments/
│   │           ├── multimodal-clones.astro    # Experiment 1
│   │           ├── realtime-voice.astro       # Experiment 2
│   │           ├── clone-memory.astro         # Experiment 3
│   │           ├── personality-evolution.astro # Experiment 4
│   │           ├── clone-swarm.astro          # Experiment 5
│   │           ├── clone-api.astro            # Experiment 6
│   │           └── clone-marketplace.astro    # Experiment 7
│   ├── components/
│   │   └── labs/
│   │       ├── ExperimentCard.tsx             # Experiment display
│   │       ├── LabsGrid.tsx                   # Grid layout
│   │       └── README.md                      # This file
│   └── lib/
│       └── services/
│           └── LabsService.ts                 # Business logic
backend/
└── convex/
    └── mutations/
        └── feature-flags.ts                    # Backend mutations
```

## Quick Start

### 1. Create a New Experiment

```typescript
import { api } from '../../../convex/_generated/api';
import { useMutation } from 'convex/react';

// In your component
const createExperiment = useMutation(api.mutations['feature-flags'].createExperiment);

await createExperiment({
  name: 'Voice Translation',
  description: 'Real-time voice translation in 50+ languages',
  experimentType: 'multimodal',
  status: 'active',
  properties: {
    icon: '🌍',
    category: 'multimodal',
    difficulty: 'hard',
    estimatedTime: '10 min setup',
    tags: ['voice', 'translation', 'multilingual'],
  },
});
```

### 2. Enable/Disable Experiment for User

```typescript
const setFeatureFlag = useMutation(api.mutations['feature-flags'].setFeatureFlag);

// Enable
await setFeatureFlag({
  experimentId: 'exp-123',
  enabled: true,
});

// Disable
await setFeatureFlag({
  experimentId: 'exp-123',
  enabled: false,
});
```

### 3. Track Experiment Usage

```typescript
const trackUsage = useMutation(api.mutations['feature-flags'].trackExperimentUsage);

await trackUsage({
  experimentId: 'exp-123',
  eventType: 'clicked', // 'viewed', 'clicked', 'completed', 'error'
  metadata: {
    feature: 'translate_button',
    duration: 5000,
  },
});
```

### 4. Submit Feedback

```typescript
const submitFeedback = useMutation(api.mutations['feature-flags'].submitExperimentFeedback);

await submitFeedback({
  experimentId: 'exp-123',
  rating: 5, // 1-5
  feedback: 'Amazing feature! Works perfectly.',
  sentiment: 'positive', // 'positive', 'neutral', 'negative'
});
```

### 5. Check if Experiment is Enabled

```typescript
const activeExperiments = useMutation(api.mutations['feature-flags'].getActiveExperiments);
const experiments = await activeExperiments({});

const isEnabled = experiments.some((exp) => exp.experimentId === 'exp-123');
```

### 6. List All Experiments

```typescript
const listExperiments = useMutation(api.mutations['feature-flags'].listExperiments);

// All experiments
const allExperiments = await listExperiments({});

// Only active
const activeOnly = await listExperiments({ status: 'active' });
```

## Component Usage

### ExperimentCard

```tsx
import { ExperimentCard } from './ExperimentCard';

<ExperimentCard
  experiment={{
    id: 'exp-1',
    name: 'Multi-modal Clones',
    description: 'Voice + video + text in one conversation',
    experimentType: 'multimodal',
    status: 'active',
    isEnabled: false,
    usageCount: 127,
    feedbackCount: 23,
    avgRating: 4.2,
    properties: {
      icon: '🎭',
      category: 'multimodal',
      difficulty: 'medium',
      estimatedTime: '5 min',
      tags: ['voice', 'video', 'ai'],
    },
  }}
  onToggle={async (id, enabled) => {
    await setFeatureFlag({ experimentId: id, enabled });
  }}
  onViewResults={(id) => {
    window.location.href = `/labs/experiments/${id}/results`;
  }}
  onSubmitFeedback={async (id, rating, feedback) => {
    await submitFeedback({ experimentId: id, rating, feedback });
  }}
/>
```

### LabsGrid

```tsx
import LabsGrid from './LabsGrid';

<LabsGrid client:load />
```

The LabsGrid component:
- Fetches all experiments automatically
- Handles search and filtering via custom events
- Displays experiments in responsive grid
- Manages loading and empty states

## A/B Testing

### Create A/B Test

```typescript
import { LabsService } from '../lib/services/LabsService';

const test = {
  experimentId: 'exp-voice-mode',
  variants: [
    { id: 'control', name: 'Auto Mode', weight: 50, config: { mode: 'auto' } },
    { id: 'treatment', name: 'Voice First', weight: 50, config: { mode: 'voice' } },
  ],
  userAssignments: new Map(),
};

// Assign user to variant (deterministic)
const variant = await labsService.assignToVariant(test, userId);

// Use variant config
if (variant.config.mode === 'voice') {
  // Show voice-first UI
} else {
  // Show auto mode UI
}
```

## Ontology Integration

Every experiment follows the 6-dimension ontology:

### 1. GROUPS (Multi-tenant)
- All experiments scoped by `groupId`
- Users can only see experiments in their group

### 2. PEOPLE (Authorization)
- Only `org_owner` can create experiments
- All users can enable/disable experiments
- Every action tracked with `actorId`

### 3. THINGS (Entities)
- Experiments stored as `things` with `type: "experiment"`
- Properties: `experimentType`, `usageCount`, `feedbackCount`, `avgRating`

### 4. CONNECTIONS (Relationships)
- User enables experiment → `enabled_experiment` connection created
- User disables experiment → connection deleted

### 5. EVENTS (Audit Trail)
- `experiment_enabled` - when user enables
- `experiment_disabled` - when user disables
- `experiment_used` - when user interacts
- `feedback_submitted` - when user provides feedback

### 6. KNOWLEDGE (Semantic Understanding)
- User feedback stored as knowledge chunks
- Labels: `experiment:{name}`, `rating:{1-5}`, `sentiment:{positive|neutral|negative}`

## Helper Functions

### Calculate Health Score

```typescript
import { calculateHealthScore } from '../lib/services/LabsService';

const score = calculateHealthScore(experiment);
// Returns 0-100 based on rating (70%) + usage (30%)
```

### Detect Sentiment

```typescript
import { detectSentiment } from '../lib/services/LabsService';

const sentiment = detectSentiment('This is amazing!');
// Returns 'positive', 'neutral', or 'negative'
```

### Should Promote to Production

```typescript
import { shouldPromote } from '../lib/services/LabsService';

if (shouldPromote(experiment)) {
  // Experiment ready for production
  // Criteria: feedbackCount >= 10, avgRating >= 4.0, usageCount >= 50
}
```

## Best Practices

### 1. Always Track Usage

Every experiment interaction should be tracked:

```typescript
// When user views experiment page
await trackUsage({ experimentId, eventType: 'viewed' });

// When user clicks feature
await trackUsage({ experimentId, eventType: 'clicked' });

// When user completes action
await trackUsage({ experimentId, eventType: 'completed' });
```

### 2. Request Feedback at Right Time

Don't spam users with feedback requests. Good times to ask:

- After 3+ successful uses
- After completion of significant action
- When user seems engaged (5+ minutes of usage)

### 3. Provide Context in Metadata

Include helpful metadata for analytics:

```typescript
await trackUsage({
  experimentId,
  eventType: 'clicked',
  metadata: {
    feature: 'translate_button',
    language: 'spanish',
    duration: 5000,
    sessionId: 'abc123',
  },
});
```

### 4. Handle Errors Gracefully

```typescript
try {
  await setFeatureFlag({ experimentId, enabled: true });
} catch (error) {
  console.error('Failed to enable experiment:', error);
  // Show user-friendly error message
  toast.error('Failed to enable experiment. Please try again.');
}
```

### 5. Test Before Deploying

```typescript
// Always check if experiment exists before using
const experiments = await listExperiments({});
const experiment = experiments.find((e) => e.id === 'exp-123');

if (!experiment) {
  console.error('Experiment not found');
  return;
}

// Check if experiment is active
if (experiment.status !== 'active') {
  console.warn('Experiment is not active');
  return;
}
```

## Common Patterns

### Feature Flag Wrapper Component

```tsx
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

function ExperimentWrapper({ experimentId, children, fallback = null }) {
  const activeExperiments = useQuery(api.mutations['feature-flags'].getActiveExperiments, {});

  const isEnabled = activeExperiments?.some((exp) => exp.experimentId === experimentId);

  return isEnabled ? children : fallback;
}

// Usage
<ExperimentWrapper experimentId="exp-voice-translation">
  <VoiceTranslationFeature />
</ExperimentWrapper>
```

### Experiment Results Page

```astro
---
// /labs/experiments/[experimentId]/results.astro
import { api } from '../../../../convex/_generated/api';

const { experimentId } = Astro.params;

// Fetch experiment data
const experiment = await convex.query(
  api.mutations['feature-flags'].listExperiments,
  {}
).then(exps => exps.find(e => e.id === experimentId));

// Fetch usage events
const events = await convex.query(
  api.queries.events.list,
  { targetId: experimentId, type: 'experiment_used' }
);

// Fetch feedback
const feedback = await convex.query(
  api.queries.knowledge.listBySource,
  { sourceThingId: experimentId }
);
---

<Layout>
  <h1>{experiment.name} - Results</h1>

  <div class="stats">
    <div>Usage: {experiment.usageCount}</div>
    <div>Rating: {experiment.avgRating}/5</div>
    <div>Feedback: {experiment.feedbackCount}</div>
  </div>

  <div class="chart">
    <!-- Usage over time chart -->
  </div>

  <div class="feedback">
    {feedback.map(item => (
      <div class="feedback-item">
        <div class="rating">{'★'.repeat(item.metadata.rating)}</div>
        <div class="text">{item.text}</div>
      </div>
    ))}
  </div>
</Layout>
```

## Troubleshooting

### Experiment not showing up

1. Check experiment status is `active`
2. Verify experiment belongs to your group
3. Check browser console for errors
4. Refresh page to clear cache

### Toggle not working

1. Verify user is authenticated
2. Check user has permission (org_user or org_owner)
3. Inspect network requests for error messages
4. Ensure experiment exists in database

### Feedback not submitting

1. Check rating is between 1-5
2. Verify feedback text is not empty
3. Ensure user is authenticated
4. Check backend logs for errors

## Next Steps

1. **Add more experiments:** Create new experiment pages and entities
2. **Integrate analytics:** Connect to analytics platform for deeper insights
3. **Add experiment lifecycle:** Auto-archive low-performing experiments
4. **Implement experiment dependencies:** Some experiments require others
5. **Add experiment versioning:** Track changes over time

## Support

For questions or issues:
- **Documentation:** `/one/knowledge/ontology.md`
- **Backend patterns:** `/backend/CLAUDE.md`
- **Frontend patterns:** `/web/CLAUDE.md`
- **Integration patterns:** `/.claude/agents/agent-integrator.md`

---

**Built with the 6-dimension ontology. No shortcuts. No violations. Just clean, scalable code.**
