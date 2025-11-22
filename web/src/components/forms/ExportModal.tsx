/**
 * ExportModal Component (Cycle 70)
 *
 * Modal for exporting form submissions with multiple formats and filters.
 *
 * Features:
 * - Format selection (CSV, Excel, JSON, PDF)
 * - Date range filtering
 * - Status filtering
 * - Column selection
 * - Export progress indication
 * - Download trigger
 *
 * Usage:
 * <ExportModal
 *   funnelId={funnelId}
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 * />
 */

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Download, FileText, FileSpreadsheet, FileJson, FileImage, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

// ============================================================================
// TYPES
// ============================================================================

type ExportFormat = "csv" | "xlsx" | "json" | "pdf";
type SubmissionStatus = "new" | "read" | "spam" | "archived";

interface ExportModalProps {
	funnelId: Id<"things">;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	selectedSubmissionIds?: Id<"things">[]; // Optional: for bulk export of selected rows
}

interface ExportFilters {
	startDate?: number;
	endDate?: number;
	status?: SubmissionStatus;
}

// ============================================================================
// AVAILABLE COLUMNS
// ============================================================================

const AVAILABLE_COLUMNS = [
	{ id: "id", label: "Submission ID", default: true },
	{ id: "submittedAt", label: "Submitted At", default: true },
	{ id: "name", label: "Name", default: true },
	{ id: "email", label: "Email", default: true },
	{ id: "status", label: "Status", default: true },
	{ id: "formName", label: "Form Name", default: true },
	{ id: "phone", label: "Phone", default: false },
	{ id: "company", label: "Company", default: false },
	{ id: "message", label: "Message", default: false },
];

// ============================================================================
// FORMAT ICONS
// ============================================================================

const FORMAT_ICONS: Record<ExportFormat, typeof FileText> = {
	csv: FileText,
	xlsx: FileSpreadsheet,
	json: FileJson,
	pdf: FileImage,
};

// ============================================================================
// EXPORT MODAL COMPONENT
// ============================================================================

export function ExportModal({
	funnelId,
	open,
	onOpenChange,
	selectedSubmissionIds,
}: ExportModalProps) {
	const { toast } = useToast();

	// State
	const [format, setFormat] = useState<ExportFormat>("csv");
	const [selectedColumns, setSelectedColumns] = useState<string[]>(
		AVAILABLE_COLUMNS.filter((c) => c.default).map((c) => c.id)
	);
	const [filters, setFilters] = useState<ExportFilters>({});
	const [startDate, setStartDate] = useState<Date>();
	const [endDate, setEndDate] = useState<Date>();
	const [isExporting, setIsExporting] = useState(false);

	// Mutations
	const exportSubmissions = useMutation(api.mutations.forms.exportSubmissions);
	const exportSelected = useMutation(
		api.mutations.forms.exportSelectedSubmissions
	);

	// ============================================================================
	// HANDLERS
	// ============================================================================

	const handleColumnToggle = (columnId: string) => {
		setSelectedColumns((prev) =>
			prev.includes(columnId)
				? prev.filter((c) => c !== columnId)
				: [...prev, columnId]
		);
	};

	const handleStatusChange = (value: string) => {
		setFilters((prev) => ({
			...prev,
			status: value === "all" ? undefined : (value as SubmissionStatus),
		}));
	};

	const handleStartDateChange = (date: Date | undefined) => {
		setStartDate(date);
		setFilters((prev) => ({
			...prev,
			startDate: date ? date.getTime() : undefined,
		}));
	};

	const handleEndDateChange = (date: Date | undefined) => {
		setEndDate(date);
		setFilters((prev) => ({
			...prev,
			endDate: date ? date.getTime() : undefined,
		}));
	};

	const handleExport = async () => {
		setIsExporting(true);

		try {
			let result;

			// Use bulk export if specific submissions are selected
			if (selectedSubmissionIds && selectedSubmissionIds.length > 0) {
				result = await exportSelected({
					submissionIds: selectedSubmissionIds,
					format,
					columns: selectedColumns.length > 0 ? selectedColumns : undefined,
				});
			} else {
				// Export all with filters
				result = await exportSubmissions({
					funnelId,
					format,
					columns: selectedColumns.length > 0 ? selectedColumns : undefined,
					filters: Object.keys(filters).length > 0 ? filters : undefined,
				});
			}

			if (result.success) {
				// Create download link
				const blob = new Blob([result.content], {
					type: result.mimeType,
				});
				const url = URL.createObjectURL(blob);
				const link = document.createElement("a");
				link.href = url;
				link.download = result.filename;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				URL.revokeObjectURL(url);

				toast({
					title: "Export successful",
					description: `Downloaded ${result.filename} (${formatBytes(result.size)})`,
				});

				// Close modal
				onOpenChange(false);
			}
		} catch (error) {
			console.error("Export failed:", error);
			toast({
				title: "Export failed",
				description: String(error),
				variant: "destructive",
			});
		} finally {
			setIsExporting(false);
		}
	};

	// ============================================================================
	// RENDER
	// ============================================================================

	const FormatIcon = FORMAT_ICONS[format];

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Export Form Submissions</DialogTitle>
					<DialogDescription>
						{selectedSubmissionIds && selectedSubmissionIds.length > 0
							? `Exporting ${selectedSubmissionIds.length} selected submission(s)`
							: "Export all form submissions with optional filters"}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 py-4">
					{/* FORMAT SELECTION */}
					<div className="space-y-2">
						<Label>Export Format</Label>
						<Select
							value={format}
							onValueChange={(value) => setFormat(value as ExportFormat)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="csv">
									<div className="flex items-center gap-2">
										<FileText className="h-4 w-4" />
										<span>CSV (Comma-separated values)</span>
									</div>
								</SelectItem>
								<SelectItem value="xlsx">
									<div className="flex items-center gap-2">
										<FileSpreadsheet className="h-4 w-4" />
										<span>Excel (.xlsx)</span>
									</div>
								</SelectItem>
								<SelectItem value="json">
									<div className="flex items-center gap-2">
										<FileJson className="h-4 w-4" />
										<span>JSON</span>
									</div>
								</SelectItem>
								<SelectItem value="pdf">
									<div className="flex items-center gap-2">
										<FileImage className="h-4 w-4" />
										<span>PDF (Preview only, limited to 30 rows)</span>
									</div>
								</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* FILTERS (only for full export, not bulk) */}
					{(!selectedSubmissionIds || selectedSubmissionIds.length === 0) && (
						<div className="space-y-4">
							<h3 className="font-medium">Filters</h3>

							{/* STATUS FILTER */}
							<div className="space-y-2">
								<Label>Status</Label>
								<Select
									value={filters.status || "all"}
									onValueChange={handleStatusChange}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Statuses</SelectItem>
										<SelectItem value="new">New</SelectItem>
										<SelectItem value="read">Read</SelectItem>
										<SelectItem value="spam">Spam</SelectItem>
										<SelectItem value="archived">Archived</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* DATE RANGE FILTER */}
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>Start Date</Label>
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												className="w-full justify-start text-left font-normal"
											>
												<CalendarIcon className="mr-2 h-4 w-4" />
												{startDate ? (
													format(startDate, "PPP")
												) : (
													<span>Pick a date</span>
												)}
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0">
											<Calendar
												mode="single"
												selected={startDate}
												onSelect={handleStartDateChange}
												initialFocus
											/>
										</PopoverContent>
									</Popover>
								</div>

								<div className="space-y-2">
									<Label>End Date</Label>
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												className="w-full justify-start text-left font-normal"
											>
												<CalendarIcon className="mr-2 h-4 w-4" />
												{endDate ? (
													format(endDate, "PPP")
												) : (
													<span>Pick a date</span>
												)}
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0">
											<Calendar
												mode="single"
												selected={endDate}
												onSelect={handleEndDateChange}
												initialFocus
											/>
										</PopoverContent>
									</Popover>
								</div>
							</div>
						</div>
					)}

					{/* COLUMN SELECTION */}
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label>Columns to Export</Label>
							<div className="text-sm text-muted-foreground">
								{selectedColumns.length} / {AVAILABLE_COLUMNS.length} selected
							</div>
						</div>
						<div className="grid grid-cols-2 gap-3 border rounded-md p-4 max-h-48 overflow-y-auto">
							{AVAILABLE_COLUMNS.map((column) => (
								<div key={column.id} className="flex items-center space-x-2">
									<Checkbox
										id={column.id}
										checked={selectedColumns.includes(column.id)}
										onCheckedChange={() => handleColumnToggle(column.id)}
									/>
									<label
										htmlFor={column.id}
										className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
									>
										{column.label}
									</label>
								</div>
							))}
						</div>
					</div>

					{/* PREVIEW INFO */}
					<div className="rounded-lg bg-muted p-4 text-sm">
						<div className="font-medium mb-2">Export Preview</div>
						<div className="space-y-1 text-muted-foreground">
							<div>
								Format: <span className="font-medium text-foreground">{format.toUpperCase()}</span>
							</div>
							<div>
								Columns: <span className="font-medium text-foreground">{selectedColumns.length}</span>
							</div>
							{filters.status && (
								<div>
									Status filter: <span className="font-medium text-foreground">{filters.status}</span>
								</div>
							)}
							{startDate && (
								<div>
									From: <span className="font-medium text-foreground">{format(startDate, "PPP")}</span>
								</div>
							)}
							{endDate && (
								<div>
									To: <span className="font-medium text-foreground">{format(endDate, "PPP")}</span>
								</div>
							)}
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button
						onClick={handleExport}
						disabled={isExporting || selectedColumns.length === 0}
					>
						{isExporting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Exporting...
							</>
						) : (
							<>
								<Download className="mr-2 h-4 w-4" />
								Export {format.toUpperCase()}
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
	if (bytes === 0) return "0 Bytes";

	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}
