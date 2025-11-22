# Form Components - Export System

**Cycle 70 Implementation**

Complete form data export system with multiple formats, filtering, and bulk operations.

## Components

### ExportModal

Modal dialog for configuring and triggering form submission exports.

**Features:**
- Multiple export formats (CSV, Excel, JSON, PDF)
- Date range filtering
- Status filtering (new, read, spam, archived)
- Column selection (choose which fields to export)
- Bulk export selected submissions
- Download progress indication

**Usage:**

```tsx
import { ExportModal } from "@/components/forms/ExportModal";

function MyComponent() {
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setExportOpen(true)}>
        Export Submissions
      </Button>

      <ExportModal
        funnelId={funnelId}
        open={exportOpen}
        onOpenChange={setExportOpen}
      />
    </>
  );
}
```

**Props:**

```typescript
interface ExportModalProps {
  funnelId: Id<"things">;               // Funnel to export submissions from
  open: boolean;                         // Modal open state
  onOpenChange: (open: boolean) => void; // Modal state handler
  selectedSubmissionIds?: Id<"things">[]; // Optional: bulk export specific rows
}
```

### SubmissionsTable

Complete example showing ExportModal integration with a submissions table.

**Features:**
- Display submissions in table format
- Row selection with checkboxes
- Select all / select individual
- Export button in toolbar
- Auto-switches between "Export All" and "Export N Selected"

**Usage:**

```tsx
import { SubmissionsTable } from "@/components/forms/SubmissionsTable";

function SubmissionsPage() {
  return <SubmissionsTable funnelId={funnelId} />;
}
```

## Backend API

### Mutations

**`api.mutations.forms.exportSubmissions`**

Export all submissions for a funnel with optional filters.

```typescript
const result = await exportSubmissions({
  funnelId: "j1234567890",
  format: "csv",
  columns: ["id", "name", "email", "status"],
  filters: {
    startDate: Date.now() - 7 * 24 * 60 * 60 * 1000, // Last 7 days
    endDate: Date.now(),
    status: "new"
  }
});

// Returns:
{
  success: true,
  format: "csv",
  content: "id,name,email,status\n...",
  filename: "form-submissions-2025-01-22.csv",
  mimeType: "text/csv",
  size: 1024
}
```

**`api.mutations.forms.exportSelectedSubmissions`**

Export specific submissions by ID (for bulk export of selected rows).

```typescript
const result = await exportSelectedSubmissions({
  submissionIds: ["j123", "j456", "j789"],
  format: "xlsx",
  columns: ["id", "name", "email"]
});
```

### Export Formats

| Format | Extension | MIME Type | Notes |
|--------|-----------|-----------|-------|
| CSV | `.csv` | `text/csv` | Universal format, opens in Excel/Sheets |
| Excel | `.xlsx` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | Excel-compatible CSV (true .xlsx requires library) |
| JSON | `.json` | `application/json` | Array of objects with selected columns |
| PDF | `.pdf` | `application/pdf` | Basic text-based PDF (limited to 30 rows) |

### Available Columns

Default columns (auto-selected):
- `id` - Submission ID
- `submittedAt` - Submission timestamp
- `name` - Submitter name
- `email` - Submitter email
- `status` - Submission status
- `formName` - Form name

Optional columns:
- `phone` - Phone number (if collected)
- `company` - Company name (if collected)
- `message` - Message/comments (if collected)
- Custom form fields (automatically detected)

### Filters

**Date Range:**
- `startDate` - Unix timestamp (milliseconds)
- `endDate` - Unix timestamp (milliseconds)

**Status:**
- `new` - Unread submissions
- `read` - Read submissions
- `spam` - Marked as spam
- `archived` - Archived submissions

## Implementation Details

### Backend Service

**`FormExportService`** (`/backend/convex/services/export/form-export.ts`)

Effect.ts service for generating exports:

```typescript
import { FormExportService } from "../services/export/form-export";

const exportProgram = FormExportService.export({
  submissions,
  format: "csv",
  columns: ["id", "name", "email"],
  filters: { status: "new" }
});

const result = await Effect.runPromise(exportProgram);
```

### Event Logging

All exports are logged for audit trail:

**`export_generated`** - Successful export
```typescript
{
  type: "export_generated",
  actorId: person._id,
  targetId: funnelId,
  timestamp: Date.now(),
  metadata: {
    format: "csv",
    submissionCount: 50,
    filename: "form-submissions-2025-01-22.csv",
    size: 1024,
    filters: { status: "new" },
    groupId: person.groupId
  }
}
```

**`export_failed`** - Failed export
```typescript
{
  type: "export_failed",
  actorId: person._id,
  targetId: funnelId,
  timestamp: Date.now(),
  metadata: {
    format: "csv",
    error: "Export failed: ...",
    groupId: person.groupId
  }
}
```

## Scheduled Exports (Future Enhancement)

Currently not implemented, but the service layer supports it:

```typescript
// Future feature: Email exports daily/weekly/monthly
const emailResult = await FormExportService.emailExport(
  exportResult,
  "admin@example.com"
);
```

**To implement:**
1. Add Convex scheduled functions
2. Store export schedules in `things` table
3. Use `FormExportService.emailExport()` to send via email
4. Integrate with existing `EmailService`

## Production Considerations

### Excel (.xlsx) Format

Current implementation generates CSV with `.xlsx` extension (Excel-compatible).

**For true Excel format:**
```bash
npm install exceljs
```

Update `FormExportService.exportExcel()` to use `exceljs` library.

### PDF Format

Current implementation generates basic text-based PDF (limited to 30 rows).

**For production PDF:**
```bash
npm install pdfkit
```

Update `FormExportService.exportPDF()` to use `pdfkit` library with proper formatting, tables, and pagination.

### Large Datasets

Current implementation loads all submissions into memory.

**For large datasets (1000+ submissions):**
- Implement streaming exports
- Add pagination to export generation
- Use Convex scheduled functions for background processing
- Store export files in cloud storage (S3, R2)
- Email download links instead of direct downloads

### Security

**Current implementation:**
- ✅ Authentication required
- ✅ Group-based authorization (groupId filtering)
- ✅ Event logging for audit trail
- ✅ Multi-tenant isolation

**Production enhancements:**
- Add rate limiting (max exports per hour)
- Add file size limits
- Add virus scanning for uploaded data
- Add encryption for sensitive exports

## Testing

### Manual Testing

1. Create test submissions
2. Open ExportModal
3. Select format (CSV)
4. Select columns
5. Apply filters
6. Click "Export CSV"
7. Verify download

### Automated Testing

```typescript
// Test export service
describe("FormExportService", () => {
  it("should generate CSV export", async () => {
    const result = await Effect.runPromise(
      FormExportService.export({
        submissions: mockSubmissions,
        format: "csv",
        columns: ["id", "name"]
      })
    );

    expect(result.format).toBe("csv");
    expect(result.content).toContain("id,name");
  });
});
```

## File Locations

**Backend:**
- Service: `/backend/convex/services/export/form-export.ts`
- Mutations: `/backend/convex/mutations/forms.ts` (exportSubmissions, exportSelectedSubmissions)

**Frontend:**
- Modal: `/web/src/components/forms/ExportModal.tsx`
- Example: `/web/src/components/forms/SubmissionsTable.tsx`
- Docs: `/web/src/components/forms/README.md`

---

**Built with the 6-dimension ontology. Exports as things, events as audit trail.**
