/**
 * Template Version Selector Component
 *
 * Cycle 60: Allow users to select which version to use.
 *
 * Features:
 * - Version dropdown
 * - Latest/stable badges
 * - Version preview
 * - Quick comparison
 *
 * @see /one/things/plans/clickfunnels-builder-100-cycles.md
 */

import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	GitBranch,
	Info,
	ArrowUpCircle,
	ArrowRightCircle,
	Package,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Id } from "@/lib/convex";

interface TemplateVersionSelectorProps {
	templateId: Id<"things">;
	onVersionSelect: (versionNumber: string, versionData: any) => void;
	defaultVersion?: string;
}

export function TemplateVersionSelector({
	templateId,
	onVersionSelect,
	defaultVersion,
}: TemplateVersionSelectorProps) {
	const [selectedVersion, setSelectedVersion] = useState<string>(
		defaultVersion || "latest"
	);

	// Fetch versions
	const versions = useQuery(api.queries.templateVersions.getVersions, {
		templateId,
	});

	// Fetch selected version data
	const versionData = useQuery(
		api.queries.templateVersions.getVersion,
		selectedVersion && selectedVersion !== "latest"
			? {
					templateId,
					versionNumber: selectedVersion,
			  }
			: "skip"
	);

	// Fetch latest version
	const latestVersion = useQuery(
		api.queries.templateVersions.getLatestVersion,
		{ templateId }
	);

	const handleVersionChange = (version: string) => {
		setSelectedVersion(version);

		// Get version data
		const data =
			version === "latest"
				? latestVersion
				: versions?.find((v) => v.properties.versionNumber === version);

		if (data) {
			onVersionSelect(version, data);
		}
	};

	const getVersionIcon = (versionType: string) => {
		switch (versionType) {
			case "major":
				return <ArrowUpCircle className="h-3 w-3" />;
			case "minor":
				return <ArrowRightCircle className="h-3 w-3" />;
			case "patch":
				return <Package className="h-3 w-3" />;
			default:
				return <GitBranch className="h-3 w-3" />;
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

	if (versions === undefined || latestVersion === undefined) {
		return (
			<Card>
				<CardContent className="p-6">
					<div className="flex items-center justify-center">
						<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
					</div>
				</CardContent>
			</Card>
		);
	}

	const currentVersionData =
		selectedVersion === "latest" ? latestVersion : versionData;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-base">
					<GitBranch className="h-4 w-4" />
					Select Template Version
				</CardTitle>
				<CardDescription>
					Choose which version of the template to use
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Version selector */}
				<div className="space-y-2">
					<label className="text-sm font-medium">Version</label>
					<Select value={selectedVersion} onValueChange={handleVersionChange}>
						<SelectTrigger>
							<SelectValue placeholder="Select version..." />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="latest">
								<div className="flex items-center gap-2">
									<span>Latest</span>
									<Badge variant="default" className="text-xs">
										Recommended
									</Badge>
								</div>
							</SelectItem>
							<Separator className="my-1" />
							{versions.map((version) => (
								<SelectItem
									key={version._id}
									value={version.properties.versionNumber}
								>
									<div className="flex items-center gap-2">
										{getVersionIcon(version.properties.versionType)}
										<span>v{version.properties.versionNumber}</span>
										<Badge
											variant={getVersionBadgeVariant(
												version.properties.versionType
											)}
											className="text-xs"
										>
											{version.properties.versionType}
										</Badge>
									</div>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Version details */}
				{currentVersionData && (
					<div className="space-y-3 p-4 rounded-lg bg-muted/50">
						<div className="flex items-start gap-3">
							<Info className="h-4 w-4 text-muted-foreground mt-0.5" />
							<div className="flex-1 space-y-1">
								<div className="flex items-center gap-2">
									<p className="text-sm font-medium">
										Version {currentVersionData.properties.versionNumber}
									</p>
									<Badge
										variant={getVersionBadgeVariant(
											currentVersionData.properties.versionType
										)}
										className="text-xs"
									>
										{currentVersionData.properties.versionType}
									</Badge>
								</div>
								<p className="text-xs text-muted-foreground">
									Released{" "}
									{formatDistanceToNow(currentVersionData.createdAt, {
										addSuffix: true,
									})}
								</p>
							</div>
						</div>

						{currentVersionData.properties.changelog && (
							<div>
								<p className="text-xs font-medium text-muted-foreground mb-1">
									What's new:
								</p>
								<p className="text-sm">
									{currentVersionData.properties.changelog}
								</p>
							</div>
						)}

						{currentVersionData.properties.notes && (
							<div>
								<p className="text-xs font-medium text-muted-foreground mb-1">
									Notes:
								</p>
								<p className="text-sm text-muted-foreground">
									{currentVersionData.properties.notes}
								</p>
							</div>
						)}
					</div>
				)}

				{/* Stats */}
				<div className="grid grid-cols-3 gap-4 pt-2">
					<div className="text-center">
						<p className="text-2xl font-bold">{versions.length}</p>
						<p className="text-xs text-muted-foreground">Total Versions</p>
					</div>
					<div className="text-center">
						<p className="text-2xl font-bold">
							{latestVersion?.properties.versionNumber || "1.0.0"}
						</p>
						<p className="text-xs text-muted-foreground">Latest</p>
					</div>
					<div className="text-center">
						<p className="text-2xl font-bold">
							{versions.filter((v) => v.status === "active").length}
						</p>
						<p className="text-xs text-muted-foreground">Active</p>
					</div>
				</div>

				{/* Action */}
				<Button
					className="w-full"
					onClick={() =>
						currentVersionData &&
						onVersionSelect(selectedVersion, currentVersionData)
					}
					disabled={!currentVersionData}
				>
					Use This Version
				</Button>
			</CardContent>
		</Card>
	);
}
