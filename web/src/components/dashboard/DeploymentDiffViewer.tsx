/**
 * DeploymentDiffViewer Component
 *
 * Shows git-style diff between two deployments.
 * Displays changed files and code changes.
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DiffFile {
	path: string;
	status: "added" | "modified" | "deleted";
	additions: number;
	deletions: number;
	changes: Array<{
		type: "add" | "remove" | "context";
		line: string;
		lineNumber?: number;
	}>;
}

interface DeploymentDiffViewerProps {
	fromDeployment: {
		_id: string;
		createdAt: number;
		properties: {
			commitMessage?: string;
			branch?: string;
		};
	};
	toDeployment?: {
		_id: string;
		createdAt: number;
		properties: {
			commitMessage?: string;
			branch?: string;
		};
	};
	files?: DiffFile[];
	onFetch?: (fromId: string, toId?: string) => Promise<DiffFile[]>;
}

export function DeploymentDiffViewer({
	fromDeployment,
	toDeployment,
	files = [],
	onFetch,
}: DeploymentDiffViewerProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [diffFiles, setDiffFiles] = useState<DiffFile[]>(files);
	const [error, setError] = useState<string | null>(null);
	const [selectedFile, setSelectedFile] = useState<DiffFile | null>(null);

	const handleViewDiff = async () => {
		if (!onFetch) return;

		setLoading(true);
		setError(null);

		try {
			const result = await onFetch(fromDeployment._id, toDeployment?._id);
			setDiffFiles(result);
			setSelectedFile(result[0] || null);
		} catch (err) {
			setError(`Failed to fetch diff: ${err instanceof Error ? err.message : "Unknown error"}`);
		} finally {
			setLoading(false);
		}
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

	const getStatusColor = (status: string) => {
		switch (status) {
			case "added":
				return "bg-green-50 dark:bg-green-900/20";
			case "modified":
				return "bg-blue-50 dark:bg-blue-900/20";
			case "deleted":
				return "bg-red-50 dark:bg-red-900/20";
			default:
				return "";
		}
	};

	const getStatusBadgeVariant = (status: string) => {
		switch (status) {
			case "added":
				return "default";
			case "modified":
				return "secondary";
			case "deleted":
				return "destructive";
			default:
				return "outline";
		}
	};

	const totalChanges = diffFiles.reduce(
		(sum, f) => sum + f.additions + f.deletions,
		0
	);
	const totalAdditions = diffFiles.reduce((sum, f) => sum + f.additions, 0);
	const totalDeletions = diffFiles.reduce((sum, f) => sum + f.deletions, 0);

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm">
					Diff
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
				<DialogHeader>
					<DialogTitle>Compare Deployments</DialogTitle>
					<DialogDescription>
						View code changes between deployments
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 flex-1 overflow-y-auto">
					{/* Deployment Comparison */}
					<div className="grid grid-cols-2 gap-4 text-sm">
						<div className="rounded-lg border p-3">
							<p className="font-medium">From</p>
							<p className="text-xs text-muted-foreground">
								{formatDate(fromDeployment.createdAt)}
							</p>
							{fromDeployment.properties.commitMessage && (
								<p className="text-xs mt-1 truncate">
									{fromDeployment.properties.commitMessage}
								</p>
							)}
						</div>
						<div className="rounded-lg border p-3">
							<p className="font-medium">To</p>
							<p className="text-xs text-muted-foreground">
								{toDeployment ? formatDate(toDeployment.createdAt) : "Latest"}
							</p>
							{toDeployment?.properties.commitMessage && (
								<p className="text-xs mt-1 truncate">
									{toDeployment.properties.commitMessage}
								</p>
							)}
						</div>
					</div>

					{!diffFiles.length && !loading && (
						<div className="rounded-lg border border-dashed p-8 text-center">
							<p className="text-sm text-muted-foreground mb-4">
								No diff data available
							</p>
							{onFetch && (
								<Button onClick={handleViewDiff} disabled={loading}>
									{loading ? "Loading..." : "Fetch Diff"}
								</Button>
							)}
						</div>
					)}

					{error && (
						<div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
							<p className="text-sm text-red-800 dark:text-red-200">{error}</p>
						</div>
					)}

					{diffFiles.length > 0 && (
						<>
							{/* Summary */}
							<div className="rounded-lg border p-4 bg-muted/50">
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium">
										{diffFiles.length} files changed
									</span>
									<div className="flex gap-4 text-xs">
										<span className="text-green-600">
											+{totalAdditions} additions
										</span>
										<span className="text-red-600">
											−{totalDeletions} deletions
										</span>
									</div>
								</div>
							</div>

							{/* Files List */}
							<div className="space-y-2">
								<p className="text-sm font-medium">Files Changed</p>
								<div className="space-y-1 max-h-48 overflow-y-auto">
									{diffFiles.map((file) => (
										<button
											key={file.path}
											onClick={() => setSelectedFile(file)}
											className={`w-full text-left px-3 py-2 rounded-md border text-sm transition-colors ${getStatusColor(file.status)} ${selectedFile?.path === file.path ? "border-primary" : "border-border"} hover:border-primary`}
										>
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2 min-w-0">
													<Badge
														variant={getStatusBadgeVariant(file.status)}
														className="flex-shrink-0"
													>
														{file.status}
													</Badge>
													<span className="font-mono text-xs truncate">
														{file.path}
													</span>
												</div>
												<div className="flex gap-2 text-xs flex-shrink-0 ml-2">
													{file.additions > 0 && (
														<span className="text-green-600">+{file.additions}</span>
													)}
													{file.deletions > 0 && (
														<span className="text-red-600">−{file.deletions}</span>
													)}
												</div>
											</div>
										</button>
									))}
								</div>
							</div>

							{/* Diff Viewer */}
							{selectedFile && (
								<div className="space-y-2">
									<p className="text-sm font-medium">{selectedFile.path}</p>
									<div className="bg-gray-950 rounded-lg overflow-hidden border">
										<div className="max-h-96 overflow-y-auto">
											{selectedFile.changes.map((change, idx) => (
												<div
													key={idx}
													className={`flex font-mono text-xs ${
														change.type === "add"
															? "bg-green-900/20"
															: change.type === "remove"
																? "bg-red-900/20"
																: ""
													}`}
												>
													<span
														className={`w-12 select-none px-3 py-1 text-right ${
															change.type === "add"
																? "text-green-400 bg-green-900/10"
																: change.type === "remove"
																	? "text-red-400 bg-red-900/10"
																	: "text-muted-foreground"
														}`}
													>
														{change.type === "add"
															? "+"
															: change.type === "remove"
																? "−"
																: " "}
													</span>
													<span className="flex-1 px-3 py-1 overflow-x-auto text-gray-200">
														{change.line}
													</span>
												</div>
											))}
										</div>
									</div>
								</div>
							)}
						</>
					)}
				</div>

				<div className="border-t pt-4">
					<Button variant="outline" onClick={() => setIsOpen(false)}>
						Close
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
