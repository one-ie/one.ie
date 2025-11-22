# Cycle 60: Template Versioning System

**Status:** Complete ✅
**Wave:** 4 (Cycles 51-70) - Conversion Optimization
**Cycle:** 60/100

---

## Overview

Implemented a complete template versioning system with semantic versioning, changelog tracking, version comparison, and rollback capabilities. Templates can now evolve over time while maintaining complete history and the ability to restore previous versions.

---

## Implementation

### Backend (Convex)

#### Queries (`/backend/convex/queries/templateVersions.ts`)

1. **`getVersions`** - Get all versions of a template
   - Returns versions sorted by version number (descending)
   - Includes version metadata (type, changelog, snapshot date)

2. **`getVersion`** - Get specific version by version number
   - Lookup by template ID + version number (e.g., "1.2.0")

3. **`getLatestVersion`** - Get the most recent version
   - Returns highest version number automatically

4. **`getChangelog`** - Get complete event history
   - All `template_version_created` and `template_updated` events
   - Enriched with actor information

5. **`compareVersions`** - Compare two versions
   - Shows added, removed, and modified properties
   - Detailed diff between any two versions

#### Mutations (`/backend/convex/mutations/templateVersions.ts`)

1. **`createVersion`** - Create new version snapshot
   - Version types: major (breaking), minor (features), patch (fixes)
   - Automatic version number calculation
   - Creates thing record of type `template_version`
   - Links version to template via `has_version` connection
   - Logs `template_version_created` event

2. **`rollbackToVersion`** - Restore previous version
   - Creates backup before rollback
   - Restores all properties from target version
   - Logs `template_rolled_back` event

3. **`archiveVersion`** - Archive old versions
   - Soft delete (status → archived)
   - Logs `template_version_archived` event

4. **`updateVersionMetadata`** - Edit changelog/notes
   - Update version information after creation
   - Logs `template_version_metadata_updated` event

### Frontend (React + Astro)

#### Components

1. **`TemplateVersionHistory.tsx`** - Complete version timeline
   - Visual timeline with version cards
   - Changelog display for each version
   - Rollback confirmation dialogs
   - Version comparison tool
   - Event timeline with all changes
   - Archive functionality

2. **`TemplateVersionSelector.tsx`** - Version picker
   - Dropdown with all available versions
   - "Latest" recommendation badge
   - Version details preview
   - Usage statistics (total, latest, active)
   - Callback for version selection

3. **`CreateVersionDialog.tsx`** - New version creation
   - Version type selection (major/minor/patch)
   - Semantic versioning explanation
   - Changelog entry (required)
   - Next version number preview
   - Visual version type indicators

#### Page

**`/web/src/pages/funnels/templates/[id]/versions.astro`**
- Template version management interface
- Header with create version button
- Full version history display
- Responsive container layout

---

## Schema Updates

### Thing Types
Added `template_version` to FUNNEL BUILDER TYPES:
```typescript
// Type: template_version
{
  name: "Template Name v1.2.0",
  type: "template_version",
  groupId: "group_123",
  status: "active",
  properties: {
    versionNumber: "1.2.0",
    versionType: "minor", // major | minor | patch
    changelog: "Added new conversion sections",
    notes: "Optional release notes",
    parentTemplateId: "template_id",
    snapshotDate: 1234567890,
    // ... all template properties at time of snapshot
  }
}
```

### Connection Types
Added `has_version` to FUNNEL BUILDER connections:
```typescript
// Relationship: template → version
{
  fromThingId: "template_id",
  toThingId: "version_id",
  relationshipType: "has_version",
  metadata: {
    versionNumber: "1.2.0",
    versionType: "minor"
  }
}
```

### Event Types
Added 5 new event types to TEMPLATE VERSIONING:
1. `template_updated` - Template content changed
2. `template_version_created` - New version snapshot
3. `template_rolled_back` - Restored previous version
4. `template_version_archived` - Old version archived
5. `template_version_metadata_updated` - Changelog/notes edited

---

## Semantic Versioning

Follows **SemVer** (Semantic Versioning) principles:

### Major Version (X.0.0)
- **Breaking changes** that may affect existing funnels
- Example: Removing required fields, changing structure
- Increment: 1.2.3 → 2.0.0

### Minor Version (x.X.0)
- **New features** that are backward-compatible
- Example: Adding new sections, optional fields
- Increment: 1.2.3 → 1.3.0

### Patch Version (x.x.X)
- **Bug fixes** and small improvements
- Example: Fixing typos, adjusting styling
- Increment: 1.2.3 → 1.2.4

---

## Features

### ✅ Version Numbering
- Automatic semantic versioning (major.minor.patch)
- Version type selection with explanations
- Next version preview before creation

### ✅ Version History
- Complete timeline of all versions
- Visual indicators for version type
- "Latest" badge on current version
- Created date with relative time

### ✅ Changelog
- Required changelog entry for each version
- Optional release notes
- Event timeline with all updates
- Actor attribution (who created version)

### ✅ Version Comparison
- Side-by-side version selector
- Detailed diff showing:
  - Added properties
  - Removed properties
  - Modified properties (old → new)
- Empty state when no differences

### ✅ Rollback
- One-click rollback to any version
- Automatic backup before rollback
- Confirmation dialog with warning
- Event logging for audit trail

### ✅ Version Selection
- Version picker when using template
- Latest version recommended by default
- Version details preview
- Quick stats (total, latest, active)

### ✅ Archive
- Soft delete old versions
- Filter archived versions
- Maintain complete history

---

## User Workflow

### Creating a New Version

1. User updates template content
2. Clicks "Create New Version" button
3. Selects version type:
   - Major (breaking changes)
   - Minor (new features)
   - Patch (bug fixes)
4. Enters changelog describing changes
5. Reviews next version number preview
6. Confirms creation
7. System creates:
   - New `template_version` thing
   - `has_version` connection
   - `template_version_created` event

### Using a Template Version

1. User selects template for funnel
2. Version selector appears
3. User chooses:
   - "Latest" (recommended)
   - Specific version number
4. Version details preview shows:
   - Version number and type
   - Release date
   - Changelog
   - Notes
5. User confirms selection
6. Funnel created from chosen version

### Rolling Back

1. User views version history
2. Selects previous version
3. Clicks "Rollback" button
4. Confirmation dialog warns about changes
5. User confirms rollback
6. System:
   - Creates backup of current state
   - Restores properties from target version
   - Logs `template_rolled_back` event
7. Success notification shows version restored

### Comparing Versions

1. User selects two versions (A and B)
2. System calculates differences
3. Display shows:
   - Added properties (green badge)
   - Removed properties (red badge)
   - Modified properties (yellow badge)
   - Old vs new values for modifications
4. User can make informed rollback decision

---

## Technical Implementation

### Version Storage
Versions are stored as separate `thing` records with:
- Full snapshot of template properties at creation time
- Version metadata (number, type, changelog)
- Reference to parent template
- Snapshot timestamp

### Version Linking
Connections create relationships:
```
Template (funnel_template)
  ↓ has_version
Version 1.0.0 (template_version)
  ↓ has_version
Version 1.1.0 (template_version)
  ↓ has_version
Version 2.0.0 (template_version)
```

### Version Numbering
Automatic increment based on type:
```typescript
Current: 1.2.3

Major → 2.0.0  (reset minor and patch)
Minor → 1.3.0  (reset patch)
Patch → 1.2.4  (increment patch only)
```

### Rollback Safety
Before rollback:
1. Create backup with `status: "archived"`
2. Store backup ID in event metadata
3. Restore target version properties
4. Log complete audit trail

### Comparison Algorithm
```typescript
// For each property:
if (exists in B but not A) → added
if (exists in A but not B) → removed
if (exists in both && different) → modified
```

---

## Database Schema

### Things Table
```typescript
// Template (parent)
{
  _id: "template_123",
  type: "funnel_template",
  name: "Lead Magnet Template",
  properties: { /* current state */ }
}

// Version (snapshot)
{
  _id: "version_456",
  type: "template_version",
  name: "Lead Magnet Template v1.2.0",
  properties: {
    versionNumber: "1.2.0",
    versionType: "minor",
    changelog: "Added countdown timer",
    parentTemplateId: "template_123",
    snapshotDate: 1234567890,
    /* all template properties at v1.2.0 */
  }
}
```

### Connections Table
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

### Events Table
```typescript
{
  type: "template_version_created",
  actorId: "creator_789",
  targetId: "template_123",
  timestamp: 1234567890,
  metadata: {
    versionId: "version_456",
    versionNumber: "1.2.0",
    versionType: "minor",
    changelog: "Added countdown timer",
    groupId: "group_123"
  }
}
```

---

## UI Components

### Version Badge Colors
- **Major** (destructive): Red - Breaking changes warning
- **Minor** (default): Blue - New features
- **Patch** (secondary): Gray - Bug fixes

### Timeline Design
- Vertical timeline with connecting lines
- Version cards with:
  - Version number header
  - Version type badge
  - Changelog content
  - Action buttons (rollback, archive)
- Latest version highlighted in primary color
- Older versions in muted colors

### Comparison View
Color-coded differences:
- **Green badges** for added properties
- **Red badges** for removed properties
- **Yellow badges** for modified properties
- Side-by-side old/new value display

---

## Event Logging

All version operations are logged for complete audit trail:

1. **Version Created**
   ```typescript
   type: "template_version_created"
   metadata: { versionId, versionNumber, versionType, changelog }
   ```

2. **Rolled Back**
   ```typescript
   type: "template_rolled_back"
   metadata: { rolledBackTo, backupId }
   ```

3. **Version Archived**
   ```typescript
   type: "template_version_archived"
   metadata: { versionNumber }
   ```

---

## Multi-Tenancy

All queries and mutations enforce `groupId` scoping:
1. Get authenticated user's group
2. Verify template belongs to user's group
3. Filter versions by group ownership
4. Prevent cross-tenant data access

---

## Performance

### Query Optimization
- Indexed queries using `by_from_type` for connections
- Parallel fetches for version data
- Efficient sorting by version number

### Version Comparison
- Client-side diff calculation
- Only fetches when both versions selected
- Skippable query when not needed

### Timeline Rendering
- Lazy loading of version details
- Skeleton states during fetch
- Optimistic UI updates

---

## Testing Scenarios

### Creating Versions
1. ✅ Create major version (1.0.0 → 2.0.0)
2. ✅ Create minor version (1.0.0 → 1.1.0)
3. ✅ Create patch version (1.0.0 → 1.0.1)
4. ✅ Changelog required validation
5. ✅ Event logged correctly

### Viewing History
1. ✅ Display all versions sorted
2. ✅ Show latest badge
3. ✅ Display version type badges
4. ✅ Show changelog content
5. ✅ Relative timestamps

### Comparison
1. ✅ Select two versions
2. ✅ Show added properties
3. ✅ Show removed properties
4. ✅ Show modified properties
5. ✅ Empty state when identical

### Rollback
1. ✅ Rollback to previous version
2. ✅ Backup created before rollback
3. ✅ Properties restored correctly
4. ✅ Event logged
5. ✅ Confirmation required

### Multi-Tenancy
1. ✅ Only see own group's versions
2. ✅ Cannot access other group's versions
3. ✅ All queries scoped by groupId

---

## Files Created

### Backend
- `/backend/convex/queries/templateVersions.ts` (293 lines)
- `/backend/convex/mutations/templateVersions.ts` (273 lines)

### Frontend
- `/web/src/components/features/funnels/templates/TemplateVersionHistory.tsx` (420 lines)
- `/web/src/components/features/funnels/templates/TemplateVersionSelector.tsx` (248 lines)
- `/web/src/components/features/funnels/templates/CreateVersionDialog.tsx` (292 lines)

### Pages
- `/web/src/pages/funnels/templates/[id]/versions.astro` (52 lines)

### Documentation
- `/one/things/plans/cycle-060-template-versioning.md` (this file)

**Total:** 1,578 lines of production code

---

## Schema Updates

### Things
- Added `template_version` type (67 total types)

### Connections
- Added `has_version` relationship (26 total types)

### Events
- Added 5 versioning events (72 total types)

---

## Integration Points

### Template Creation
When creating template:
```typescript
// Initial version 1.0.0 auto-created
await createVersion({
  templateId,
  changelog: "Initial template version",
  versionType: "major"
});
```

### Template Updates
When updating template:
```typescript
// User decides when to create version
<CreateVersionDialog
  templateId={templateId}
  onVersionCreated={() => refreshData()}
/>
```

### Funnel Creation
When creating funnel from template:
```typescript
<TemplateVersionSelector
  templateId={templateId}
  onVersionSelect={(version, data) => {
    // Create funnel from selected version
    createFunnel({ templateData: data });
  }}
/>
```

---

## Future Enhancements

### Phase 2 (Future)
1. **Auto-versioning** - Automatic version creation on template publish
2. **Version tags** - Label versions as "stable", "beta", "deprecated"
3. **Migration guides** - Show upgrade path between major versions
4. **Diff preview** - Visual diff before creating version
5. **Batch operations** - Archive multiple versions at once
6. **Version analytics** - Track which versions are most used
7. **Export/Import** - Share version history between organizations

---

## Success Metrics

### Functionality
- ✅ Version creation works for all types
- ✅ Version history displays correctly
- ✅ Comparison shows accurate diffs
- ✅ Rollback restores correctly
- ✅ Events logged for audit trail

### UX
- ✅ Clear version type explanations
- ✅ Visual timeline is intuitive
- ✅ Rollback requires confirmation
- ✅ Latest version recommended by default
- ✅ Responsive on all screen sizes

### Performance
- ✅ Queries use proper indexes
- ✅ Version comparison is fast
- ✅ Timeline renders smoothly
- ✅ No unnecessary refetches

### Security
- ✅ Multi-tenant isolation enforced
- ✅ All mutations require auth
- ✅ Cross-tenant access prevented
- ✅ Complete audit trail

---

## Conclusion

The template versioning system provides complete version control with:

- **Semantic Versioning** - Clear major/minor/patch versioning
- **Complete History** - Timeline of all changes with changelogs
- **Version Comparison** - Detailed diffs between any versions
- **Safe Rollback** - Restore previous versions with backup
- **Audit Trail** - Complete event logging for compliance
- **Multi-Tenancy** - Secure group isolation

Users can confidently evolve their templates knowing they can always restore previous versions and understand what changed in each release.

**Cycle 60 complete! 🎉**
