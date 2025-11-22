# Deployment History Feature

**CYCLE 23**: Track and display deployment history with rollback and comparison capabilities.

## Overview

The deployment history feature provides a complete view of all deployments with the ability to:
- View deployment status (live, failed, deploying)
- See build duration and deployment URLs
- Rollback to previous deployments
- Compare code changes between versions
- Delete old deployments

## Files

### Pages
- **`/web/src/pages/dashboard/deployments.astro`** - Main deployment history page
  - Displays stats (total, live, failed, avg duration)
  - Shows deployment history table
  - Provides quick actions and info

### Components
- **`/web/src/components/dashboard/DeploymentHistoryTable.tsx`** - Core table component
  - Lists all deployments with filters
  - Shows status badges and metadata
  - Provides action buttons (rollback, delete, logs, diff)
  - Handles optimistic updates

- **`/web/src/components/dashboard/DeploymentDiffViewer.tsx`** - Version comparison
  - Shows git-style diff between deployments
  - Lists changed files with additions/deletions
  - Displays code changes with syntax highlighting

### Backend Support
- **`/web/convex/queries/deployments.ts`**
  - `list()` - Fetch deployment history
  - `get()` - Get single deployment
  - `getLatest()` - Get latest deployment
  - `getHistory()` - Get deployment history for a website

- **`/web/convex/mutations/deployments.ts`**
  - `create()` - Create new deployment
  - `updateStatus()` - Update deployment status
  - `rollback()` - Rollback to previous deployment

## Usage

### Accessing the Page
```
/dashboard/deployments
```

### Table Features

#### Status Badges
- **Live (Current)** - Currently in production, marked with green border
- **Live (Previous)** - Previous versions still available
- **Deploying...** - In progress
- **Failed** - Deployment failed with error

#### Actions

**Logs Button**
- View build logs for a deployment
- Shows each log line in a terminal-style display

**Rollback Button**
- Only available for previous live deployments
- Creates a new deployment from previous code
- Requires confirmation

**Diff Button**
- Compare code changes with current or other deployments
- Shows files changed and line-by-line diffs
- Displays additions (green) and deletions (red)

**Delete Button**
- Remove old deployments
- Cannot delete current live deployment
- Requires confirmation

### Backend Integration

The component uses Convex queries to fetch data:

```typescript
// In deployments.astro
const deployments = await convex.query(api.queries.deployments.list, {
  limit: 100,
});
```

Each deployment object has:
```typescript
{
  _id: string;
  status: "deploying" | "live" | "failed";
  properties: {
    environment: string;
    url?: string;
    startedAt: number;
    completedAt?: number;
    duration?: number;
    error?: string;
    buildLogs?: string[];
  };
  createdAt: number;
  _metadata?: {
    duration: number;
    isActive: boolean;
    isLatest: boolean;
  };
}
```

## Enhancement Ideas

### Phase 1: Core Features (Implemented)
- ✅ List deployments in table view
- ✅ Show status, duration, URL
- ✅ Rollback to previous deployment
- ✅ View build logs
- ✅ Delete old deployments

### Phase 2: Comparison (Stub Ready)
- ⏳ Git-style diff viewer
- ⏳ File-level changes
- ⏳ Line-by-line comparison
- ⏳ Syntax highlighting

### Phase 3: Analytics
- ⏳ Deployment success rate
- ⏳ Average build time trends
- ⏳ Deployment frequency chart
- ⏳ Performance metrics

### Phase 4: Advanced
- ⏳ Scheduled rollbacks
- ⏳ A/B testing deployments
- ⏳ Automated rollback on error
- ⏳ Slack/Discord notifications
- ⏳ Deployment webhooks

## Architecture

### Component Hierarchy
```
deployments.astro (Page)
├── DashboardStats (Cards)
├── DeploymentHistoryTable (Main Table)
│   ├── Dialog (Logs Viewer)
│   ├── Dialog (Rollback Confirmation)
│   └── DeploymentDiffViewer (Comparison)
└── Info/Quick Actions Cards
```

### State Management
- **Local state**: Table optimistically updates on delete
- **Server state**: Convex queries fetch from database
- **Dialog state**: Modal visibility managed per deployment

### Error Handling
- Network errors caught and displayed
- Confirmation dialogs prevent accidental actions
- Optimistic updates with rollback on failure
- Error messages shown to user

## Styling

Uses shadcn/ui components:
- `Button` - Actions and controls
- `Badge` - Status indicators
- `Card` - Layout containers
- `Dialog` - Modals for logs and rollback
- `Table` - Deployment history display
- `Tabs` - Multi-section layout (in diff viewer)

Responsive design:
- Mobile: Stacked layout, simplified buttons
- Desktop: Full-width table, all actions visible

## Future Integration Points

### 1. Deployment Webhooks
Connect to Cloudflare webhooks to auto-update deployment status:
```typescript
// Webhook handler would update deployment status
await mutation(api.mutations.deployments.updateStatus, {
  id: webhookData.deploymentId,
  status: webhookData.status,
  url: webhookData.url,
})
```

### 2. Git Integration
Fetch commit info to show in deployment history:
```typescript
// Get commit message and author
const commit = await getGitCommit(deployment.properties.branch);
```

### 3. Performance Metrics
Track and display deployment performance:
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- Time to Interactive (TTI)

### 4. Notification System
Send notifications on deployment status:
```typescript
// Notify on deployment completion
await sendNotification({
  type: "deployment_complete",
  channel: "slack" | "discord" | "email",
  message: `Deployment #${id} completed in ${duration}ms`
});
```

## Testing Checklist

- [ ] Loads deployment list correctly
- [ ] Status badges show correct colors
- [ ] Timestamps format correctly
- [ ] Duration calculations are accurate
- [ ] URLs are clickable and correct
- [ ] Rollback confirmation shows
- [ ] Delete confirmation shows
- [ ] Logs dialog displays build logs
- [ ] Diff viewer opens (when implemented)
- [ ] Responsive on mobile/tablet
- [ ] Error messages display on failure
- [ ] Loading states show during actions

## Migration Notes

When upgrading from previous deployments system:
1. Ensure all deployments have `properties.startedAt`
2. Calculate missing `properties.completedAt` from `properties.duration`
3. Populate missing `properties.buildLogs` from build system
4. Update deployment status to match current state

## See Also

- **Backend**: `/web/convex/queries/deployments.ts`, `/web/convex/mutations/deployments.ts`
- **Marketing Page**: `/web/src/pages/deploy.astro` - User-facing deployment guide
- **Deploy Command**: `/.claude/commands/deploy.md` - Deployment CLI
- **Ontology**: `/one/knowledge/ontology.md` - Deployments as Things in 6-dimension ontology
