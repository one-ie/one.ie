/**
 * FunnelStatusToggle - Publish/Unpublish Toggle for Funnels
 *
 * Displays the current status of a funnel with color-coded badges and
 * provides a toggle switch to publish/unpublish funnels.
 *
 * Features:
 * - Visual status indicators (Draft, Published, Archived)
 * - Toggle switch for publish/unpublish
 * - Validation before publish (must have at least 1 step)
 * - Shows publish timestamp
 * - Confirmation dialog for unpublish
 *
 * @example
 * ```tsx
 * import { FunnelStatusToggle } from '@/components/funnel/FunnelStatusToggle';
 *
 * <FunnelStatusToggle
 *   funnelId={funnel._id}
 *   status={funnel.status}
 *   stepCount={funnel.properties.stepCount}
 *   updatedAt={funnel.updatedAt}
 * />
 * ```
 */

"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FileText, CheckCircle, Archive, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface FunnelStatusToggleProps {
	funnelId: Id<"things">;
	status: "draft" | "active" | "published" | "archived";
	stepCount?: number;
	updatedAt: number;
	onStatusChange?: (newStatus: string) => void;
}

// Status configuration with colors and icons
const statusConfig = {
	draft: {
		label: "Draft",
		color: "bg-slate-100 text-slate-700 border-slate-200",
		icon: FileText,
		description: "Not published",
	},
	active: {
		label: "Active",
		color: "bg-blue-100 text-blue-700 border-blue-200",
		icon: FileText,
		description: "Active but not published",
	},
	published: {
		label: "Published",
		color: "bg-green-100 text-green-700 border-green-200",
		icon: CheckCircle,
		description: "Live and accepting visitors",
	},
	archived: {
		label: "Archived",
		color: "bg-red-100 text-red-700 border-red-200",
		icon: Archive,
		description: "No longer active",
	},
};

export function FunnelStatusToggle({
	funnelId,
	status,
	stepCount = 0,
	updatedAt,
	onStatusChange,
}: FunnelStatusToggleProps) {
	const { toast } = useToast();
	const [showUnpublishDialog, setShowUnpublishDialog] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const publishFunnel = useMutation(api.mutations.funnels.publish);
	const unpublishFunnel = useMutation(api.mutations.funnels.unpublish);

	const config = statusConfig[status] || statusConfig.draft;
	const Icon = config.icon;
	const isPublished = status === "published";
	const isArchived = status === "archived";

	// Handle toggle change
	const handleToggleChange = async (checked: boolean) => {
		// Prevent toggle if archived
		if (isArchived) {
			toast({
				title: "Cannot modify archived funnel",
				description: "Unarchive the funnel first to publish it.",
				variant: "destructive",
			});
			return;
		}

		if (checked) {
			// Publishing
			if (stepCount === 0) {
				toast({
					title: "Cannot publish funnel",
					description: "Add at least one step before publishing.",
					variant: "destructive",
				});
				return;
			}

			setIsLoading(true);
			try {
				await publishFunnel({ id: funnelId });
				toast({
					title: "Funnel published",
					description: "Your funnel is now live and accepting visitors.",
				});
				onStatusChange?.("published");
			} catch (error) {
				toast({
					title: "Failed to publish",
					description:
						error instanceof Error
							? error.message
							: "An unexpected error occurred",
					variant: "destructive",
				});
			} finally {
				setIsLoading(false);
			}
		} else {
			// Unpublishing - show confirmation dialog
			setShowUnpublishDialog(true);
		}
	};

	// Handle confirmed unpublish
	const handleUnpublishConfirm = async () => {
		setIsLoading(true);
		try {
			await unpublishFunnel({ id: funnelId });
			toast({
				title: "Funnel unpublished",
				description: "Your funnel is no longer accepting visitors.",
			});
			onStatusChange?.("active");
		} catch (error) {
			toast({
				title: "Failed to unpublish",
				description:
					error instanceof Error ? error.message : "An unexpected error occurred",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
			setShowUnpublishDialog(false);
		}
	};

	return (
		<>
			<div className="flex items-center justify-between gap-4 p-4 rounded-lg border bg-card">
				{/* Status Badge */}
				<div className="flex items-center gap-3">
					<Badge
						variant="outline"
						className={`${config.color} flex items-center gap-2 px-3 py-1.5`}
					>
						<Icon className="h-4 w-4" />
						<span className="font-medium">{config.label}</span>
					</Badge>

					<div className="flex flex-col">
						<span className="text-sm text-muted-foreground">
							{config.description}
						</span>
						<span className="text-xs text-muted-foreground">
							Updated {formatDistanceToNow(updatedAt, { addSuffix: true })}
						</span>
					</div>
				</div>

				{/* Publish Toggle */}
				{!isArchived && (
					<div className="flex items-center gap-3">
						<Label
							htmlFor="publish-toggle"
							className="text-sm font-medium cursor-pointer"
						>
							{isPublished ? "Published" : "Publish"}
						</Label>
						<Switch
							id="publish-toggle"
							checked={isPublished}
							onCheckedChange={handleToggleChange}
							disabled={isLoading || isArchived}
							aria-label={
								isPublished ? "Unpublish funnel" : "Publish funnel"
							}
						/>
						{isLoading && (
							<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
						)}
					</div>
				)}

				{/* Archived Notice */}
				{isArchived && (
					<div className="text-sm text-muted-foreground italic">
						Funnel is archived
					</div>
				)}
			</div>

			{/* Validation Warning */}
			{!isPublished && !isArchived && stepCount === 0 && (
				<div className="mt-2 p-3 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
					<p className="text-sm text-yellow-800 dark:text-yellow-200">
						Add at least one step before publishing this funnel.
					</p>
				</div>
			)}

			{/* Unpublish Confirmation Dialog */}
			<AlertDialog
				open={showUnpublishDialog}
				onOpenChange={setShowUnpublishDialog}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Unpublish Funnel?</AlertDialogTitle>
						<AlertDialogDescription>
							This will take your funnel offline. Visitors will no longer be
							able to access it. You can republish it at any time.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleUnpublishConfirm}
							disabled={isLoading}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{isLoading && (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							)}
							Unpublish
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
