# Template Versioning Components

Quick reference for using the template versioning system.

## Components

### 1. TemplateVersionHistory

Display complete version history with timeline, changelog, and rollback.

```tsx
import { TemplateVersionHistory } from '@/components/features/funnels/templates/TemplateVersionHistory';

<TemplateVersionHistory
  templateId={templateId}
/>
```

**Features:**
- Visual timeline of all versions
- Version comparison tool
- Rollback confirmation dialogs
- Event timeline with complete changelog
- Archive old versions

---

### 2. TemplateVersionSelector

Allow users to choose which version to use when creating from template.

```tsx
import { TemplateVersionSelector } from '@/components/features/funnels/templates/TemplateVersionSelector';

<TemplateVersionSelector
  templateId={templateId}
  defaultVersion="latest" // or specific version like "1.2.0"
  onVersionSelect={(versionNumber, versionData) => {
    // Use selected version to create funnel
    console.log('Selected version:', versionNumber);
    console.log('Version data:', versionData);
  }}
/>
```

**Features:**
- Dropdown with all versions
- "Latest" recommendation
- Version details preview
- Usage statistics

---

### 3. CreateVersionDialog

Dialog for creating new template versions.

```tsx
import { CreateVersionDialog } from '@/components/features/funnels/templates/CreateVersionDialog';

<CreateVersionDialog
  templateId={templateId}
  onVersionCreated={() => {
    // Refresh data or show success message
    console.log('Version created!');
  }}
  trigger={<Button>Custom Trigger</Button>} // Optional custom trigger
/>
```

**Features:**
- Version type selection (major/minor/patch)
- Changelog entry (required)
- Next version preview
- Semantic versioning explanation

---

## Backend API

### Queries

```typescript
import { api } from '@/lib/convex';
import { useQuery } from 'convex/react';

// Get all versions
const versions = useQuery(api.queries.templateVersions.getVersions, {
  templateId: 'template_123'
});

// Get specific version
const version = useQuery(api.queries.templateVersions.getVersion, {
  templateId: 'template_123',
  versionNumber: '1.2.0'
});

// Get latest version
const latest = useQuery(api.queries.templateVersions.getLatestVersion, {
  templateId: 'template_123'
});

// Get changelog
const changelog = useQuery(api.queries.templateVersions.getChangelog, {
  templateId: 'template_123'
});

// Compare versions
const comparison = useQuery(api.queries.templateVersions.compareVersions, {
  templateId: 'template_123',
  versionA: '1.0.0',
  versionB: '1.2.0'
});
```

### Mutations

```typescript
import { api } from '@/lib/convex';
import { useMutation } from 'convex/react';

// Create new version
const createVersion = useMutation(api.mutations.templateVersions.createVersion);

await createVersion({
  templateId: 'template_123',
  changelog: 'Added new countdown timer section',
  versionType: 'minor' // 'major' | 'minor' | 'patch'
});

// Rollback to version
const rollback = useMutation(api.mutations.templateVersions.rollbackToVersion);

await rollback({
  templateId: 'template_123',
  versionNumber: '1.0.0'
});

// Archive version
const archiveVersion = useMutation(api.mutations.templateVersions.archiveVersion);

await archiveVersion({
  versionId: 'version_456'
});

// Update version metadata
const updateMetadata = useMutation(api.mutations.templateVersions.updateVersionMetadata);

await updateMetadata({
  versionId: 'version_456',
  changelog: 'Updated changelog text',
  notes: 'Additional release notes'
});
```

---

## Version Types

### Major (X.0.0)
Breaking changes that may affect existing funnels.

**Examples:**
- Removing required fields
- Changing data structure
- Removing sections

**Increment:** 1.2.3 → 2.0.0

### Minor (x.X.0)
New features that are backward-compatible.

**Examples:**
- Adding new sections
- Adding optional fields
- New styling options

**Increment:** 1.2.3 → 1.3.0

### Patch (x.x.X)
Bug fixes and small improvements.

**Examples:**
- Fixing typos
- Adjusting colors
- Performance improvements

**Increment:** 1.2.3 → 1.2.4

---

## Usage Patterns

### Pattern 1: Template Management Page

```astro
---
// pages/templates/[id]/versions.astro
import Layout from '@/layouts/Layout.astro';
import { TemplateVersionHistory } from '@/components/features/funnels/templates/TemplateVersionHistory';
import { CreateVersionDialog } from '@/components/features/funnels/templates/CreateVersionDialog';

const { id } = Astro.params;
---

<Layout title="Template Versions">
  <div class="container">
    <header>
      <h1>Template Versions</h1>
      <CreateVersionDialog client:load templateId={id} />
    </header>

    <TemplateVersionHistory client:load templateId={id} />
  </div>
</Layout>
```

### Pattern 2: Template Selection Flow

```tsx
// components/CreateFunnelFlow.tsx
import { useState } from 'react';
import { TemplateVersionSelector } from './templates/TemplateVersionSelector';

export function CreateFunnelFlow({ templateId }) {
  const [selectedVersion, setSelectedVersion] = useState(null);

  return (
    <div>
      <h2>Select Template Version</h2>

      <TemplateVersionSelector
        templateId={templateId}
        onVersionSelect={(versionNumber, versionData) => {
          setSelectedVersion(versionData);
          // Proceed to next step
        }}
      />

      {selectedVersion && (
        <Button onClick={() => createFunnel(selectedVersion)}>
          Create Funnel
        </Button>
      )}
    </div>
  );
}
```

### Pattern 3: Template Editor with Auto-versioning

```tsx
// components/TemplateEditor.tsx
import { CreateVersionDialog } from './templates/CreateVersionDialog';

export function TemplateEditor({ templateId }) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  return (
    <div>
      {/* Editor UI */}

      {hasUnsavedChanges && (
        <div className="alert">
          <p>You have unsaved changes.</p>
          <CreateVersionDialog
            templateId={templateId}
            onVersionCreated={() => setHasUnsavedChanges(false)}
            trigger={<Button>Save as New Version</Button>}
          />
        </div>
      )}
    </div>
  );
}
```

---

## Data Structure

### Version Thing
```typescript
{
  _id: "version_456",
  type: "template_version",
  name: "Template Name v1.2.0",
  groupId: "group_123",
  status: "active",
  properties: {
    versionNumber: "1.2.0",
    versionType: "minor",
    changelog: "Added countdown timer",
    notes: "Optional notes",
    parentTemplateId: "template_123",
    snapshotDate: 1234567890,
    // ... all template properties
  },
  createdAt: 1234567890,
  updatedAt: 1234567890
}
```

### Version Connection
```typescript
{
  fromThingId: "template_123",
  toThingId: "version_456",
  relationshipType: "has_version",
  metadata: {
    versionNumber: "1.2.0",
    versionType: "minor"
  }
}
```

---

## Events Logged

All version operations create events for audit trail:

1. **template_version_created** - New version created
2. **template_rolled_back** - Restored previous version
3. **template_version_archived** - Old version archived
4. **template_version_metadata_updated** - Changelog updated

---

## Styling

All components use shadcn/ui and follow the design system:

### Version Type Colors
- **Major:** `variant="destructive"` (red)
- **Minor:** `variant="default"` (blue)
- **Patch:** `variant="secondary"` (gray)

### Badges
```tsx
<Badge variant="destructive">Major</Badge>
<Badge variant="default">Minor</Badge>
<Badge variant="secondary">Patch</Badge>
<Badge variant="outline">v1.2.0</Badge>
```

---

## Best Practices

### When to Create Versions

**Always create version when:**
- Publishing template to users
- Making breaking changes
- Adding major features
- Before significant refactoring

**Consider creating version when:**
- Adding new optional sections
- Updating copy significantly
- Changing default values

**Don't create version for:**
- Typo fixes (unless already published)
- Internal development iterations
- Experimental features

### Changelog Writing

**Good changelog:**
```
Added countdown timer to hero section
- Users can now set urgency deadline
- Timer shows days/hours/minutes/seconds
- Fully customizable colors and text
```

**Bad changelog:**
```
Updates
```

### Version Selection

**Recommend "Latest" when:**
- Creating new funnels
- User wants newest features
- No specific version requirement

**Allow version choice when:**
- Recreating existing funnel
- Testing specific version
- Rolling back to known-good state

---

## Troubleshooting

### Version not appearing

Check:
1. Version created successfully (check events)
2. Connection created (`has_version`)
3. User in correct group (multi-tenant isolation)

### Rollback failed

Check:
1. User has permission (same group)
2. Target version exists and is active
3. No validation errors in version data

### Comparison shows no differences

Check:
1. Both versions selected
2. Versions are actually different
3. Properties being compared correctly

---

## Links

- **Full Documentation:** `/one/things/plans/cycle-060-template-versioning.md`
- **Backend Queries:** `/backend/convex/queries/templateVersions.ts`
- **Backend Mutations:** `/backend/convex/mutations/templateVersions.ts`
- **Demo Page:** `/web/src/pages/funnels/templates/[id]/versions.astro`

---

**Need help? Check the full documentation or ask in #funnel-builder.**
