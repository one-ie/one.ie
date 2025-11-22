/**
 * Create Version Dialog Component
 *
 * Cycle 60: Dialog for creating new template versions.
 *
 * Features:
 * - Version type selection (major/minor/patch)
 * - Changelog entry
 * - Preview next version number
 * - Release notes
 *
 * @see /one/things/plans/clickfunnels-builder-100-cycles.md
 */

import { useMutation, useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	GitBranch,
	ArrowUpCircle,
	ArrowRightCircle,
	Package,
	Plus,
} from "lucide-react";
import { toast } from "sonner";
import type { Id } from "@/lib/convex";

interface CreateVersionDialogProps {
	templateId: Id<"things">;
	onVersionCreated?: () => void;
	trigger?: React.ReactNode;
}

export function CreateVersionDialog({
	templateId,
	onVersionCreated,
	trigger,
}: CreateVersionDialogProps) {
	const [open, setOpen] = useState(false);
	const [versionType, setVersionType] = useState<"major" | "minor" | "patch">(
		"minor"
	);
	const [changelog, setChangelog] = useState("");
	const [isCreating, setIsCreating] = useState(false);

	// Fetch latest version to calculate next version
	const latestVersion = useQuery(
		api.queries.templateVersions.getLatestVersion,
		{ templateId }
	);

	// Mutation
	const createVersion = useMutation(
		api.mutations.templateVersions.createVersion
	);

	const getNextVersionNumber = (
		currentVersion: string,
		type: "major" | "minor" | "patch"
	): string => {
		const parts = currentVersion.split(".").map(Number);
		const major = parts[0] || 0;
		const minor = parts[1] || 0;
		const patch = parts[2] || 0;

		switch (type) {
			case "major":
				return `${major + 1}.0.0`;
			case "minor":
				return `${major}.${minor + 1}.0`;
			case "patch":
				return `${major}.${minor}.${patch + 1}`;
			default:
				return currentVersion;
		}
	};

	const handleCreate = async () => {
		if (!changelog.trim()) {
			toast.error("Please enter a changelog");
			return;
		}

		setIsCreating(true);

		try {
			const result = await createVersion({
				templateId,
				changelog: changelog.trim(),
				versionType,
			});

			toast.success(`Version ${result.versionNumber} created!`);
			setChangelog("");
			setVersionType("minor");
			setOpen(false);

			if (onVersionCreated) {
				onVersionCreated();
			}
		} catch (error) {
			toast.error("Failed to create version");
			console.error(error);
		} finally {
			setIsCreating(false);
		}
	};

	const currentVersion =
		latestVersion?.properties.versionNumber || "0.0.0";
	const nextVersion = getNextVersionNumber(currentVersion, versionType);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger || (
					<Button>
						<Plus className="h-4 w-4 mr-2" />
						Create New Version
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<GitBranch className="h-5 w-5" />
						Create New Template Version
					</DialogTitle>
					<DialogDescription>
						Create a snapshot of the current template state with version
						tracking
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Version type selection */}
					<div className="space-y-3">
						<Label>Version Type</Label>
						<RadioGroup value={versionType} onValueChange={(value: any) => setVersionType(value)}>
							<Card className={versionType === "major" ? "border-destructive" : ""}>
								<CardHeader className="p-4">
									<div className="flex items-start gap-3">
										<RadioGroupItem value="major" id="major" />
										<div className="flex-1">
											<label htmlFor="major" className="cursor-pointer">
												<div className="flex items-center gap-2">
													<ArrowUpCircle className="h-4 w-4 text-destructive" />
													<span className="font-medium">Major Version</span>
													<Badge variant="destructive" className="text-xs">
														Breaking Changes
													</Badge>
												</div>
												<CardDescription className="mt-1">
													Significant changes that may break existing funnels
													using this template. Bumps first number (
													{currentVersion} → {getNextVersionNumber(currentVersion, "major")}
													)
												</CardDescription>
											</label>
										</div>
									</div>
								</CardHeader>
							</Card>

							<Card className={versionType === "minor" ? "border-primary" : ""}>
								<CardHeader className="p-4">
									<div className="flex items-start gap-3">
										<RadioGroupItem value="minor" id="minor" />
										<div className="flex-1">
											<label htmlFor="minor" className="cursor-pointer">
												<div className="flex items-center gap-2">
													<ArrowRightCircle className="h-4 w-4 text-primary" />
													<span className="font-medium">Minor Version</span>
													<Badge variant="default" className="text-xs">
														New Features
													</Badge>
												</div>
												<CardDescription className="mt-1">
													New features or enhancements that don't break existing
													funnels. Bumps second number (
													{currentVersion} → {getNextVersionNumber(currentVersion, "minor")}
													)
												</CardDescription>
											</label>
										</div>
									</div>
								</CardHeader>
							</Card>

							<Card className={versionType === "patch" ? "border-secondary" : ""}>
								<CardHeader className="p-4">
									<div className="flex items-start gap-3">
										<RadioGroupItem value="patch" id="patch" />
										<div className="flex-1">
											<label htmlFor="patch" className="cursor-pointer">
												<div className="flex items-center gap-2">
													<Package className="h-4 w-4 text-secondary" />
													<span className="font-medium">Patch Version</span>
													<Badge variant="secondary" className="text-xs">
														Bug Fixes
													</Badge>
												</div>
												<CardDescription className="mt-1">
													Bug fixes and minor improvements. Bumps third number (
													{currentVersion} → {getNextVersionNumber(currentVersion, "patch")}
													)
												</CardDescription>
											</label>
										</div>
									</div>
								</CardHeader>
							</Card>
						</RadioGroup>
					</div>

					{/* Changelog */}
					<div className="space-y-2">
						<Label htmlFor="changelog">
							Changelog <span className="text-destructive">*</span>
						</Label>
						<Textarea
							id="changelog"
							placeholder="Describe what changed in this version..."
							value={changelog}
							onChange={(e) => setChangelog(e.target.value)}
							rows={4}
							className="resize-none"
						/>
						<p className="text-xs text-muted-foreground">
							Users will see this when selecting a version to use
						</p>
					</div>

					{/* Preview */}
					<Card className="bg-muted/50">
						<CardContent className="pt-4">
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<p className="text-sm font-medium">Current Version</p>
									<Badge variant="outline">{currentVersion}</Badge>
								</div>
								<div className="flex items-center justify-between">
									<p className="text-sm font-medium">Next Version</p>
									<Badge variant="default">{nextVersion}</Badge>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => setOpen(false)}>
						Cancel
					</Button>
					<Button
						onClick={handleCreate}
						disabled={!changelog.trim() || isCreating}
					>
						{isCreating ? "Creating..." : `Create v${nextVersion}`}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
