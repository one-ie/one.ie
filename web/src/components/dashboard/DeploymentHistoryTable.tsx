/**
 * DeploymentHistoryTable Component
 *
 * Displays deployment history with status, duration, URLs, and actions.
 * Allows rollback to previous deployments and comparison of versions.
 */

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { formatDistance } from "date-fns";

interface Deployment {
	_id: string;
	name: string;
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

interface DeploymentHistoryTableProps {
	deployments: Deployment[];
	onRollback?: (deploymentId: string) => Promise<void>;
	onDelete?: (deploymentId: string) => Promise<void>;
	onCompare?: (deploymentId: string) => void;
	websiteId: string;
}

export function DeploymentHistoryTable({
	deployments,
	onRollback,
	onDelete,
	onCompare,
	websiteId,
}: DeploymentHistoryTableProps) {
	const [loading, setLoading] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [localDeployments, setLocalDeployments] = useState(deployments);
	const [selectedDeployment, setSelectedDeployment] =
		useState<Deployment | null>(null);
	const [rollbackTarget, setRollbackTarget] = useState<Deployment | null>(null);

	const handleRollback = async (deployment: Deployment) => {
		if (!onRollback) return;

		const confirmMsg = `Roll back to deployment from ${new Date(deployment.createdAt).toLocaleString()}? This will create a new deployment.`;
		if (!confirm(confirmMsg)) return;

		setLoading(deployment._id);
		setError(null);

		try {
			await onRollback(deployment._id);
			// Show success message
			alert("Rollback deployment created! Check deployment history for status.");
			setRollbackTarget(null);
		} catch (err) {
			setError(`Rollback failed: ${err instanceof Error ? err.message : "Unknown error"}`);
			console.error("Rollback failed:", err);
		} finally {
			setLoading(null);
		}
	};

	const handleDelete = async (deployment: Deployment) => {
		if (!onDelete) return;

		const confirmMsg = `Delete deployment from ${new Date(deployment.createdAt).toLocaleString()}? This cannot be undone.`;
		if (!confirm(confirmMsg)) return;

		setLoading(deployment._id);
		setError(null);

		try {
			await onDelete(deployment._id);
			// Optimistic update
			setLocalDeployments((prev) =>
				prev.filter((d) => d._id !== deployment._id)
			);
		} catch (err) {
			setError(`Delete failed: ${err instanceof Error ? err.message : "Unknown error"}`);
			console.error("Delete failed:", err);
		} finally {
			setLoading(null);
		}
	};

	const getStatusBadgeVariant = (status: string) => {
		switch (status) {
			case "live":
				return "default";
			case "failed":
				return "destructive";
			case "deploying":
				return "secondary";
			default:
				return "outline";
		}
	};

	const getStatusDisplay = (deployment: Deployment) => {
		if (deployment.status === "deploying") {
			return "Deploying...";
		}
		if (deployment.status === "failed") {
			return "Failed";
		}
		if (deployment._metadata?.isLatest) {
			return "Live (Current)";
		}
		if (deployment.status === "live") {
			return "Live (Previous)";
		}
		return deployment.status;
	};

	const formatDuration = (ms: number) => {
		if (!ms) return "—";
		const seconds = Math.floor(ms / 1000);
		if (seconds < 60) return `${seconds}s`;
		const minutes = Math.floor(seconds / 60);
		return `${minutes}m ${seconds % 60}s`;
	};

	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<div className="space-y-4">
			{error && (
				<div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
					<p className="text-sm text-red-800 dark:text-red-200">{error}</p>
				</div>
			)}

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Status</TableHead>
						<TableHead>Deployed</TableHead>
						<TableHead>Environment</TableHead>
						<TableHead>Build Duration</TableHead>
						<TableHead>URL</TableHead>
						<TableHead className="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{localDeployments.length === 0 ? (
						<TableRow>
							<TableCell colSpan={6} className="text-center text-gray-500">
								No deployments found
							</TableCell>
						</TableRow>
					) : (
						localDeployments.map((deployment) => (
							<TableRow key={deployment._id}>
								<TableCell>
									<Badge
										variant={getStatusBadgeVariant(deployment.status)}
										className={
											deployment._metadata?.isLatest
												? "border-2 border-green-500"
												: ""
										}
									>
										{getStatusDisplay(deployment)}
									</Badge>
								</TableCell>
								<TableCell className="text-sm">
									<div className="font-medium">
										{formatDate(deployment.createdAt)}
									</div>
									<div className="text-xs text-muted-foreground">
										{formatDistance(new Date(deployment.createdAt), new Date(), {
											addSuffix: true,
										})}
									</div>
								</TableCell>
								<TableCell>
									<span className="text-sm">
										{deployment.properties.environment || "production"}
									</span>
								</TableCell>
								<TableCell>
									<span className="text-sm font-mono">
										{formatDuration(deployment._metadata?.duration || 0)}
									</span>
								</TableCell>
								<TableCell>
									{deployment.properties.url ? (
										<a
											href={deployment.properties.url}
											target="_blank"
											rel="noopener noreferrer"
											className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 truncate"
										>
											{new URL(deployment.properties.url).hostname}
										</a>
									) : (
										<span className="text-sm text-muted-foreground">
											{deployment.status === "deploying"
												? "Building..."
												: "Not available"}
										</span>
									)}
								</TableCell>
								<TableCell className="text-right">
									<div className="flex justify-end gap-2">
										{/* View Logs */}
										{deployment.properties.buildLogs &&
											deployment.properties.buildLogs.length > 0 && (
												<Dialog>
													<DialogTrigger asChild>
														<Button
															variant="outline"
															size="sm"
															onClick={() => setSelectedDeployment(deployment)}
														>
															Logs
														</Button>
													</DialogTrigger>
													<DialogContent className="max-w-2xl">
														<DialogHeader>
															<DialogTitle>Build Logs</DialogTitle>
															<DialogDescription>
																Deployment from {formatDate(deployment.createdAt)}
															</DialogDescription>
														</DialogHeader>
														<div className="space-y-2 max-h-96 overflow-y-auto bg-gray-950 p-4 rounded-lg">
															{deployment.properties.buildLogs?.map(
																(log, idx) => (
																	<div
																		key={idx}
																		className="font-mono text-xs text-green-400"
																	>
																		{log}
																	</div>
																)
															)}
														</div>
													</DialogContent>
												</Dialog>
											)}

										{/* Rollback Button */}
										{deployment.status === "live" &&
											!deployment._metadata?.isLatest && (
												<Dialog open={rollbackTarget?._id === deployment._id}>
													<DialogTrigger asChild>
														<Button
															variant="secondary"
															size="sm"
															onClick={() => setRollbackTarget(deployment)}
															disabled={loading === deployment._id}
														>
															{loading === deployment._id ? "..." : "Rollback"}
														</Button>
													</DialogTrigger>
													<DialogContent>
														<DialogHeader>
															<DialogTitle>Rollback Deployment</DialogTitle>
															<DialogDescription>
																This will create a new deployment rolling back to the
																version from {formatDate(deployment.createdAt)}
															</DialogDescription>
														</DialogHeader>
														<div className="space-y-4 py-4">
															<div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-900/20">
																<p className="text-sm font-medium text-amber-900 dark:text-amber-200">
																	⚠️ This creates a new deployment, it doesn't revert
																	to the previous code
																</p>
															</div>
															<p className="text-sm text-muted-foreground">
																A new deployment will be created using the same code
																and configuration as the selected deployment.
															</p>
														</div>
														<DialogFooter>
															<Button
																variant="outline"
																onClick={() => setRollbackTarget(null)}
															>
																Cancel
															</Button>
															<Button
																variant="destructive"
																onClick={() =>
																	handleRollback(deployment).then(() =>
																		setRollbackTarget(null)
																	)
																}
																disabled={loading === deployment._id}
															>
																{loading === deployment._id
																	? "Rolling back..."
																	: "Confirm Rollback"}
															</Button>
														</DialogFooter>
													</DialogContent>
												</Dialog>
											)}

										{/* Compare Versions */}
										{onCompare && deployment.status === "live" && (
											<Button
												variant="outline"
												size="sm"
												onClick={() => onCompare(deployment._id)}
											>
												Diff
											</Button>
										)}

										{/* Delete Button */}
										{!deployment._metadata?.isLatest &&
											deployment.status !== "deploying" && (
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleDelete(deployment)}
													disabled={loading === deployment._id}
													className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
												>
													{loading === deployment._id ? "..." : "Delete"}
												</Button>
											)}
									</div>
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>

			<div className="text-xs text-muted-foreground">
				Total deployments: {localDeployments.length}
			</div>
		</div>
	);
}
