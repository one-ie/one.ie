/**
 * SubmissionsTable Component (Cycle 70 - Example Usage)
 *
 * Complete example showing ExportModal integration with a submissions table.
 *
 * Features:
 * - Display submissions in table
 * - Row selection for bulk operations
 * - Export button with modal
 * - Bulk export selected rows
 * - Export all with filters
 *
 * Usage:
 * <SubmissionsTable funnelId={funnelId} />
 */

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Download, Loader2 } from "lucide-react";
import { ExportModal } from "./ExportModal";
import { format } from "date-fns";

// ============================================================================
// TYPES
// ============================================================================

interface SubmissionsTableProps {
	funnelId: Id<"things">;
}

type SubmissionStatus = "new" | "read" | "spam" | "archived";

const STATUS_COLORS: Record<SubmissionStatus, string> = {
	new: "bg-blue-100 text-blue-800",
	read: "bg-gray-100 text-gray-800",
	spam: "bg-red-100 text-red-800",
	archived: "bg-yellow-100 text-yellow-800",
};

// ============================================================================
// COMPONENT
// ============================================================================

export function SubmissionsTable({ funnelId }: SubmissionsTableProps) {
	// State
	const [selectedIds, setSelectedIds] = useState<Id<"things">[]>([]);
	const [exportModalOpen, setExportModalOpen] = useState(false);

	// Query submissions
	const submissions = useQuery(api.queries.forms.getSubmissions, {
		funnelId,
	});

	// ============================================================================
	// HANDLERS
	// ============================================================================

	const handleSelectAll = (checked: boolean) => {
		if (checked && submissions) {
			setSelectedIds(submissions.map((s) => s._id));
		} else {
			setSelectedIds([]);
		}
	};

	const handleSelectRow = (id: Id<"things">, checked: boolean) => {
		if (checked) {
			setSelectedIds((prev) => [...prev, id]);
		} else {
			setSelectedIds((prev) => prev.filter((i) => i !== id));
		}
	};

	const handleExportClick = () => {
		setExportModalOpen(true);
	};

	// ============================================================================
	// RENDER
	// ============================================================================

	if (submissions === undefined) {
		return (
			<div className="flex items-center justify-center p-8">
				<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
				<span className="ml-2 text-muted-foreground">Loading submissions...</span>
			</div>
		);
	}

	if (submissions.length === 0) {
		return (
			<div className="text-center p-8 text-muted-foreground">
				No submissions yet. Share your funnel to start collecting responses.
			</div>
		);
	}

	const allSelected = submissions.length > 0 && selectedIds.length === submissions.length;
	const someSelected = selectedIds.length > 0 && selectedIds.length < submissions.length;

	return (
		<div className="space-y-4">
			{/* TOOLBAR */}
			<div className="flex items-center justify-between">
				<div className="text-sm text-muted-foreground">
					{selectedIds.length > 0 ? (
						<span>
							{selectedIds.length} of {submissions.length} selected
						</span>
					) : (
						<span>{submissions.length} total submissions</span>
					)}
				</div>

				<Button onClick={handleExportClick} variant="outline" size="sm">
					<Download className="mr-2 h-4 w-4" />
					{selectedIds.length > 0
						? `Export ${selectedIds.length} Selected`
						: "Export All"}
				</Button>
			</div>

			{/* TABLE */}
			<div className="border rounded-lg overflow-hidden">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-12">
								<Checkbox
									checked={allSelected}
									onCheckedChange={handleSelectAll}
									aria-label="Select all"
									{...(someSelected && { "data-state": "indeterminate" })}
								/>
							</TableHead>
							<TableHead>Name</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Submitted</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{submissions.map((submission) => (
							<TableRow key={submission._id}>
								<TableCell>
									<Checkbox
										checked={selectedIds.includes(submission._id)}
										onCheckedChange={(checked) =>
											handleSelectRow(submission._id, !!checked)
										}
										aria-label={`Select ${submission.name}`}
									/>
								</TableCell>
								<TableCell className="font-medium">
									{submission.properties?.submitterName || "Anonymous"}
								</TableCell>
								<TableCell className="text-muted-foreground">
									{submission.properties?.submitterEmail || "—"}
								</TableCell>
								<TableCell>
									<Badge
										className={
											STATUS_COLORS[submission.status as SubmissionStatus]
										}
									>
										{submission.status}
									</Badge>
								</TableCell>
								<TableCell className="text-muted-foreground">
									{format(
										new Date(submission.properties?.submittedAt || submission.createdAt),
										"MMM d, yyyy"
									)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{/* EXPORT MODAL */}
			<ExportModal
				funnelId={funnelId}
				open={exportModalOpen}
				onOpenChange={setExportModalOpen}
				selectedSubmissionIds={selectedIds.length > 0 ? selectedIds : undefined}
			/>
		</div>
	);
}
