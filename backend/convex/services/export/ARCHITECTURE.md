# Form Export System - Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React/TSX)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐         ┌──────────────────────┐         │
│  │ SubmissionsTable │────────▶│   ExportModal        │         │
│  │                  │ onClick │                      │         │
│  │ - Display rows   │         │ - Format selector    │         │
│  │ - Checkboxes     │         │ - Date range picker  │         │
│  │ - Select all     │         │ - Status filter      │         │
│  │ - Export button  │         │ - Column selection   │         │
│  └──────────────────┘         │ - Preview summary    │         │
│                                │ - Download button    │         │
│                                └──────────┬───────────┘         │
│                                           │ useMutation          │
└───────────────────────────────────────────┼─────────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND (Convex Mutations)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ api.mutations.forms.exportSubmissions                     │  │
│  │                                                            │  │
│  │ 1. Authenticate user                                       │  │
│  │ 2. Get user's groupId                                      │  │
│  │ 3. Verify funnel access (groupId match)                    │  │
│  │ 4. Query submissions (by_group_type index)                 │  │
│  │ 5. Call FormExportService.export() ────────────┐          │  │
│  │ 6. Log event (export_generated/export_failed)  │          │  │
│  │ 7. Return { content, filename, mimeType }      │          │  │
│  └────────────────────────────────────────────────┼──────────┘  │
│                                                    │             │
│  ┌─────────────────────────────────────────────────┼──────────┐ │
│  │ api.mutations.forms.exportSelectedSubmissions   │          │ │
│  │                                                  │          │ │
│  │ 1. Authenticate user                            │          │ │
│  │ 2. Get user's groupId                           │          │ │
│  │ 3. Get submissions by IDs (verify access)       │          │ │
│  │ 4. Call FormExportService.export() ─────────────┘          │ │
│  │ 5. Log event                                               │ │
│  │ 6. Return result                                           │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
└───────────────────────────────────────────┼─────────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND (Effect.ts Service Layer)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ FormExportService.export()                                │  │
│  │                                                            │  │
│  │ Effect.gen(function* () {                                 │  │
│  │   // 1. Apply filters                                     │  │
│  │   const filtered = yield* applyFilters(submissions)       │  │
│  │                                                            │  │
│  │   // 2. Generate export based on format                   │  │
│  │   switch (format) {                                       │  │
│  │     case "csv":  yield* exportCSV(filtered)  ────────┐   │  │
│  │     case "xlsx": yield* exportExcel(filtered) ───────┼─┐ │  │
│  │     case "json": yield* exportJSON(filtered)  ───────┼─┼─│  │
│  │     case "pdf":  yield* exportPDF(filtered)   ───────┼─┼─│  │
│  │   }                                                   │ │ │  │
│  │ })                                                    │ │ │  │
│  └───────────────────────────────────────────────────────┼─┼─┘  │
│                                                           │ │    │
│  ┌────────────────────────────────────────────────────────┼─┼─┐ │
│  │ exportCSV(submissions, columns)                        │ │ │ │
│  │                                                         │ │ │ │
│  │ 1. Build CSV header                                    │ │ │ │
│  │ 2. Build CSV rows (with escaping)                      │ │ │ │
│  │ 3. Return { format, content, filename, mimeType }      │ │ │ │
│  └────────────────────────────────────────────────────────┘ │ │ │
│                                                              │ │ │
│  ┌───────────────────────────────────────────────────────────┼─│ │
│  │ exportExcel(submissions, columns)                         │ │ │
│  │                                                            │ │ │
│  │ 1. Generate CSV content (Excel-compatible)                │ │ │
│  │ 2. Return with .xlsx extension and MIME type              │ │ │
│  └────────────────────────────────────────────────────────────┘ │ │
│                                                                  │ │
│  ┌─────────────────────────────────────────────────────────────┼─│
│  │ exportJSON(submissions, columns)                            │ │
│  │                                                              │ │
│  │ 1. Map submissions to selected columns                      │ │
│  │ 2. JSON.stringify with pretty-print                         │ │
│  │ 3. Return { format, content, filename, mimeType }           │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌───────────────────────────────────────────────────────────────┐│
│  │ exportPDF(submissions, columns)                               ││
│  │                                                                ││
│  │ 1. Generate basic PDF content (text-based)                    ││
│  │ 2. Limit to 30 rows (PDF size constraint)                     ││
│  │ 3. Return { format, content, filename, mimeType }             ││
│  └────────────────────────────────────────────────────────────────┘│
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   DATABASE (Convex Tables)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ things (form_submission)                                  │  │
│  │                                                            │  │
│  │ - _id: Id<"things">                                        │  │
│  │ - type: "form_submission"                                  │  │
│  │ - name: "Submission: Contact Form"                         │  │
│  │ - groupId: Id<"groups">         ◀─ Multi-tenant isolation │  │
│  │ - status: "new" | "read" | ...                             │  │
│  │ - properties: {                                            │  │
│  │     formId, formName, fields,                              │  │
│  │     submitterEmail, submitterName                          │  │
│  │   }                                                         │  │
│  │ - createdAt, updatedAt                                     │  │
│  │                                                            │  │
│  │ Indexes:                                                   │  │
│  │   - by_group_type (groupId, type) ◀─ PRIMARY QUERY        │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ events                                                    │  │
│  │                                                            │  │
│  │ - type: "export_generated" | "export_failed"               │  │
│  │ - actorId: Id<"things">        ◀─ Who exported            │  │
│  │ - targetId: Id<"things">       ◀─ Funnel/submission       │  │
│  │ - timestamp: number                                        │  │
│  │ - metadata: {                                              │  │
│  │     format, submissionCount,                               │  │
│  │     filename, size, filters,                               │  │
│  │     groupId                                                │  │
│  │   }                                                         │  │
│  │                                                            │  │
│  │ Indexes:                                                   │  │
│  │   - by_type (type)                                         │  │
│  │   - by_actor (actorId, timestamp)                          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

1. **User clicks Export button** → Opens `ExportModal`
2. **User configures export** → Format, columns, filters
3. **User clicks Download** → Calls `useMutation(exportSubmissions)`
4. **Mutation authenticates** → Gets user identity and groupId
5. **Mutation queries submissions** → Filters by groupId (multi-tenant)
6. **Service generates export** → Effect.ts pure functions
7. **Export logged as event** → `export_generated` or `export_failed`
8. **Result returned to frontend** → `{ content, filename, mimeType }`
9. **Blob created and downloaded** → Browser triggers file download

## Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Authentication                                     │
│ ─────────────────────────                                   │
│ ctx.auth.getUserIdentity() → Must be logged in             │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: User Lookup                                        │
│ ─────────────────────────                                   │
│ Query "things" by email → Get person record                 │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: Group Verification                                 │
│ ─────────────────────────                                   │
│ person.groupId must exist                                   │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 4: Resource Authorization                             │
│ ─────────────────────────                                   │
│ funnel.groupId === person.groupId → Access granted          │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 5: Multi-Tenant Query                                 │
│ ─────────────────────────                                   │
│ .withIndex("by_group_type", groupId, type) → Isolated data │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 6: Event Logging                                      │
│ ─────────────────────────                                   │
│ Insert event with actorId, targetId, groupId → Audit trail │
└─────────────────────────────────────────────────────────────┘
```

## Export Format Pipeline

```
Submissions (DB)
     │
     ▼
applyFilters() ──────┐
     │               │ Date range
     ▼               │ Status
Filtered List        │ Custom filters
     │               │
     ▼               ▼
selectColumns() ─────┐
     │               │ User-selected
     ▼               │ or defaults
Column Data          │
     │               │
     ▼               ▼
switch (format) ─────┐
     │               │
     ├──▶ CSV ───────┼──▶ escapeCSV()  ──▶ "col1,col2\nval1,val2"
     │               │
     ├──▶ Excel ─────┼──▶ exportCSV() ───▶ Same as CSV with .xlsx
     │               │
     ├──▶ JSON ──────┼──▶ JSON.stringify() ──▶ [{"col1":"val1"}]
     │               │
     └──▶ PDF ───────┼──▶ generatePDF() ───▶ "%PDF-1.4\n..."
                     │
                     ▼
              ExportResult {
                format,
                content,
                filename,
                mimeType,
                size
              }
                     │
                     ▼
              Frontend Blob
                     │
                     ▼
              Browser Download
```

---

**Built with the 6-dimension ontology. Every layer maps to reality.**
