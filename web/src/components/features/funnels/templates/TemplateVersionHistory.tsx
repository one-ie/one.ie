/**
 * Template Version History Component
 *
 * Cycle 60: Display complete version history with EventTimeline.
 *
 * Features:
 * - Version timeline with all changes
 * - Changelog for each version
 * - Rollback to previous version
 * - Version comparison
 *
 * @see /one/things/plans/clickfunnels-builder-100-cycles.md
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Clock,
	GitBranch,
	RotateCcw,
	FileText,
	GitCommit,
	ArrowUpCircle,
	ArrowRightCircle,
	Package,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import type { Id } from "@/lib/convex";

interface TemplateVersionHistoryProps {
	templateId: Id<"things">;
}

export function TemplateVersionHistory({
	templateId,
}: TemplateVersionHistoryProps) {
	const [selectedVersionA, setSelectedVersionA] = useState<string | null>(null);
	const [selectedVersionB, setSelectedVersionB] = useState<string | null>(null);
	const [showComparison, setShowComparison] = useState(false);

	// Fetch version history
	const versions = useQuery(api.queries.templateVersions.getVersions, {
		templateId,
	});

	// Fetch changelog
	const changelog = useQuery(api.queries.templateVersions.getChangelog, {
		templateId,
	});

	// Mutations
	const rollbackToVersion = useMutation(
		api.mutations.templateVersions.rollbackToVersion
	);
	const archiveVersion = useMutation(
		api.mutations.templateVersions.archiveVersion
	);

	// Comparison data
	const comparison = useQuery(
		api.queries.templateVersions.compareVersions,
		selectedVersionA && selectedVersionB
			? {
					templateId,
					versionA: selectedVersionA,
					versionB: selectedVersionB,
			  }
			: "skip"
	);

	const handleRollback = async (versionNumber: string) => {
		try {
			await rollbackToVersion({
				templateId,
				versionNumber,
			});
			toast.success(`Rolled back to version ${versionNumber}`);
		} catch (error) {
			toast.error("Failed to rollback");
			console.error(error);
		}
	};

	const handleArchive = async (versionId: Id<"things">) => {
		try {
			await archiveVersion({ versionId });
			toast.success("Version archived");
		} catch (error) {
			toast.error("Failed to archive version");
			console.error(error);
		}
	};

	const getVersionIcon = (versionType: string) => {
		switch (versionType) {
			case "major":
				return <ArrowUpCircle className="h-4 w-4" />;
			case "minor":
				return <ArrowRightCircle className="h-4 w-4" />;
			case "patch":
				return <Package className="h-4 w-4" />;
			default:
				return <GitCommit className="h-4 w-4" />;
		}
	};

	const getVersionBadgeVariant = (versionType: string) => {
		switch (versionType) {
			case "major":
				return "destructive";
			case "minor":
				return "default";
			case "patch":
				return "secondary";
			default:
				return "outline";
		}
	};

	if (versions === undefined || changelog === undefined) {
		return (
			<Card>
				<CardContent className="p-6">
					<div className="flex items-center justify-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="flex items-center gap-2">
								<GitBranch className="h-5 w-5" />
								Version History
							</CardTitle>
							<CardDescription>
								{versions.length} version{versions.length !== 1 ? "s" : ""}{" "}
								available
							</CardDescription>
						</div>
						<Button
							variant="outline"
							onClick={() => setShowComparison(!showComparison)}
						>
							<FileText className="h-4 w-4 mr-2" />
							Compare Versions
						</Button>
					</div>
				</CardHeader>
			</Card>

			{/* Version Comparison */}
			{showComparison && (
				<Card>
					<CardHeader>
						<CardTitle>Compare Versions</CardTitle>
						<CardDescription>
							Select two versions to compare their differences
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="text-sm font-medium">Version A</label>
								<select
									className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
									value={selectedVersionA || ""}
									onChange={(e) => setSelectedVersionA(e.target.value)}
								>
									<option value="">Select version...</option>
									{versions.map((version) => (
										<option
											key={version._id}
											value={version.properties.versionNumber}
										>
											v{version.properties.versionNumber}
										</option>
									))}
								</select>
							</div>
							<div>
								<label className="text-sm font-medium">Version B</label>
								<select
									className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
									value={selectedVersionB || ""}
									onChange={(e) => setSelectedVersionB(e.target.value)}
								>
									<option value="">Select version...</option>
									{versions.map((version) => (
										<option
											key={version._id}
											value={version.properties.versionNumber}
										>
											v{version.properties.versionNumber}
										</option>
									))}
								</select>
							</div>
						</div>

						{comparison && (
							<div className="space-y-4 mt-6">
								<Separator />
								<div>
									<h4 className="font-medium text-sm text-muted-foreground mb-2">
										Differences
									</h4>

									{/* Added properties */}
									{comparison.differences.added.length > 0 && (
										<div className="mb-4">
											<Badge variant="default" className="mb-2">
												Added
											</Badge>
											<ul className="list-disc list-inside text-sm space-y-1">
												{comparison.differences.added.map((item: any) => (
													<li key={item.key}>
														<span className="font-medium">{item.key}</span>:{" "}
														{JSON.stringify(item.value)}
													</li>
												))}
											</ul>
										</div>
									)}

									{/* Removed properties */}
									{comparison.differences.removed.length > 0 && (
										<div className="mb-4">
											<Badge variant="destructive" className="mb-2">
												Removed
											</Badge>
											<ul className="list-disc list-inside text-sm space-y-1">
												{comparison.differences.removed.map((item: any) => (
													<li key={item.key}>
														<span className="font-medium">{item.key}</span>:{" "}
														{JSON.stringify(item.value)}
													</li>
												))}
											</ul>
										</div>
									)}

									{/* Modified properties */}
									{comparison.differences.modified.length > 0 && (
										<div className="mb-4">
											<Badge variant="secondary" className="mb-2">
												Modified
											</Badge>
											<ul className="list-disc list-inside text-sm space-y-1">
												{comparison.differences.modified.map((item: any) => (
													<li key={item.key}>
														<span className="font-medium">{item.key}</span>:
														<br />
														<span className="text-muted-foreground ml-4">
															Old: {JSON.stringify(item.oldValue)}
														</span>
														<br />
														<span className="text-primary ml-4">
															New: {JSON.stringify(item.newValue)}
														</span>
													</li>
												))}
											</ul>
										</div>
									)}

									{comparison.differences.added.length === 0 &&
										comparison.differences.removed.length === 0 &&
										comparison.differences.modified.length === 0 && (
											<p className="text-sm text-muted-foreground">
												No differences found between these versions.
											</p>
										)}
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			)}

			{/* Version Timeline */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Clock className="h-5 w-5" />
						Timeline
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{versions.map((version, index) => (
							<div key={version._id}>
								<div className="flex items-start gap-4">
									{/* Timeline dot */}
									<div className="flex flex-col items-center">
										<div
											className={`rounded-full p-2 ${
												index === 0
													? "bg-primary text-primary-foreground"
													: "bg-muted text-muted-foreground"
											}`}
										>
											{getVersionIcon(version.properties.versionType)}
										</div>
										{index < versions.length - 1 && (
											<div className="w-px h-12 bg-border mt-2" />
										)}
									</div>

									{/* Version card */}
									<Card className="flex-1">
										<CardHeader>
											<div className="flex items-center justify-between">
												<div>
													<CardTitle className="text-lg">
														Version {version.properties.versionNumber}
														{index === 0 && (
															<Badge variant="default" className="ml-2">
																Latest
															</Badge>
														)}
													</CardTitle>
													<CardDescription className="mt-1">
														{formatDistanceToNow(version.createdAt, {
															addSuffix: true,
														})}
													</CardDescription>
												</div>
												<Badge
													variant={getVersionBadgeVariant(
														version.properties.versionType
													)}
												>
													{version.properties.versionType}
												</Badge>
											</div>
										</CardHeader>
										<CardContent>
											<div className="space-y-4">
												{/* Changelog */}
												<div>
													<h4 className="text-sm font-medium mb-2">Changelog</h4>
													<p className="text-sm text-muted-foreground">
														{version.properties.changelog ||
															"No changelog provided"}
													</p>
												</div>

												{/* Actions */}
												{index > 0 && version.status !== "archived" && (
													<div className="flex gap-2">
														<Dialog>
															<DialogTrigger asChild>
																<Button variant="outline" size="sm">
																	<RotateCcw className="h-4 w-4 mr-2" />
																	Rollback
																</Button>
															</DialogTrigger>
															<DialogContent>
																<DialogHeader>
																	<DialogTitle>Rollback to version {version.properties.versionNumber}?</DialogTitle>
																	<DialogDescription>
																		This will restore the template to this version.
																		A backup of the current state will be created.
																	</DialogDescription>
																</DialogHeader>
																<DialogFooter>
																	<Button
																		variant="destructive"
																		onClick={() =>
																			handleRollback(
																				version.properties.versionNumber
																			)
																		}
																	>
																		Confirm Rollback
																	</Button>
																</DialogFooter>
															</DialogContent>
														</Dialog>

														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleArchive(version._id)}
														>
															Archive
														</Button>
													</div>
												)}
											</div>
										</CardContent>
									</Card>
								</div>
							</div>
						))}
					</div>

					{versions.length === 0 && (
						<div className="text-center py-12">
							<GitBranch className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
							<p className="text-muted-foreground">No versions yet</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Event Timeline */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<FileText className="h-5 w-5" />
						Complete Changelog
					</CardTitle>
					<CardDescription>
						All version events and updates
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{changelog.map((event) => (
							<div key={event._id} className="flex items-start gap-3">
								<div className="rounded-full bg-muted p-2">
									<GitCommit className="h-4 w-4 text-muted-foreground" />
								</div>
								<div className="flex-1">
									<div className="flex items-center gap-2">
										<p className="text-sm font-medium">
											{event.type === "template_version_created"
												? "Version Created"
												: "Template Updated"}
										</p>
										{event.metadata.versionNumber && (
											<Badge variant="outline" className="text-xs">
												v{event.metadata.versionNumber}
											</Badge>
										)}
									</div>
									<p className="text-sm text-muted-foreground">
										By {event.actorName}
									</p>
									<p className="text-xs text-muted-foreground">
										{formatDistanceToNow(event.timestamp, { addSuffix: true })}
									</p>
									{event.metadata.changelog && (
										<p className="text-sm mt-2">{event.metadata.changelog}</p>
									)}
								</div>
							</div>
						))}

						{changelog.length === 0 && (
							<div className="text-center py-8">
								<p className="text-muted-foreground text-sm">
									No changelog events yet
								</p>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
