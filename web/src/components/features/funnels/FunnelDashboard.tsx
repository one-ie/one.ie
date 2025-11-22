/**
 * Funnel Dashboard Component
 *
 * Main dashboard for managing funnels with real-time data from Convex.
 * Uses ontology-ui components for consistent UX.
 *
 * Features:
 * - Real-time funnel list with Convex
 * - Search by funnel name
 * - Filter by status (draft, active, published, archived)
 * - Sort by created date, updated date, name
 * - Quick actions: Edit, Duplicate, Publish/Unpublish, Archive
 * - Empty state with AI creation CTA
 *
 * Part of Cycle 31: ClickFunnels-Style Funnel Builder
 */

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

type FunnelStatus = "draft" | "active" | "published" | "archived";
type SortField = "createdAt" | "updatedAt" | "name";
type SortDirection = "asc" | "desc";

interface Funnel {
	_id: Id<"things">;
	name: string;
	description?: string;
	status: FunnelStatus;
	properties?: {
		stepCount?: number;
		views?: number;
		conversions?: number;
		conversionRate?: number;
		slug?: string;
	};
	createdAt: number;
	updatedAt: number;
}

export function FunnelDashboard() {
	// State
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<FunnelStatus | "all">("all");
	const [sortField, setSortField] = useState<SortField>("createdAt");
	const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

	// Fetch funnels from Convex
	const funnels = useQuery(api.queries.funnels.list, {
		status: statusFilter === "all" ? undefined : statusFilter,
	}) as Funnel[] | undefined;

	// Mutations
	const publishFunnel = useMutation(api.mutations.funnels.publish);
	const unpublishFunnel = useMutation(api.mutations.funnels.unpublish);
	const duplicateFunnel = useMutation(api.mutations.funnels.duplicate);
	const archiveFunnel = useMutation(api.mutations.funnels.archive);

	// Filter and sort funnels
	const processedFunnels = useMemo(() => {
		if (!funnels) return [];

		let filtered = funnels;

		// Search filter
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(f) =>
					f.name.toLowerCase().includes(query) ||
					f.description?.toLowerCase().includes(query)
			);
		}

		// Sort
		filtered.sort((a, b) => {
			let aVal: string | number;
			let bVal: string | number;

			if (sortField === "name") {
				aVal = a.name.toLowerCase();
				bVal = b.name.toLowerCase();
			} else {
				aVal = a[sortField];
				bVal = b[sortField];
			}

			if (sortDirection === "asc") {
				return aVal > bVal ? 1 : -1;
			} else {
				return aVal < bVal ? 1 : -1;
			}
		});

		return filtered;
	}, [funnels, searchQuery, sortField, sortDirection]);

	// Loading state
	if (funnels === undefined) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-12 w-full" />
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{[...Array(6)].map((_, i) => (
						<Skeleton key={i} className="h-64" />
					))}
				</div>
			</div>
		);
	}

	// Empty state
	if (funnels.length === 0 && statusFilter === "all" && !searchQuery) {
		return (
			<div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
				<div className="mx-auto flex max-w-md flex-col items-center gap-2">
					<div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="32"
							height="32"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							className="text-primary"
						>
							<path d="M3 3v18h18" />
							<path d="m19 9-5 5-4-4-3 3" />
						</svg>
					</div>
					<h3 className="mt-4 text-xl font-semibold">No funnels yet</h3>
					<p className="mb-4 text-sm text-muted-foreground">
						Get started by creating your first sales funnel with AI
					</p>
					<Button asChild>
						<a href="/chat?context=funnel-builder">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								className="mr-2"
							>
								<path d="M12 5v14" />
								<path d="M5 12h14" />
							</svg>
							Create Funnel with AI
						</a>
					</Button>
					<Button variant="outline" className="mt-2" asChild>
						<a href="/funnels/new">Create Manually</a>
					</Button>
				</div>
			</div>
		);
	}

	// Handle actions
	const handlePublish = async (funnelId: Id<"things">) => {
		try {
			await publishFunnel({ id: funnelId });
			toast.success("Funnel published successfully");
		} catch (error) {
			toast.error("Failed to publish funnel");
			console.error(error);
		}
	};

	const handleUnpublish = async (funnelId: Id<"things">) => {
		try {
			await unpublishFunnel({ id: funnelId });
			toast.success("Funnel unpublished");
		} catch (error) {
			toast.error("Failed to unpublish funnel");
			console.error(error);
		}
	};

	const handleDuplicate = async (funnelId: Id<"things">) => {
		try {
			await duplicateFunnel({ id: funnelId });
			toast.success("Funnel duplicated");
		} catch (error) {
			toast.error("Failed to duplicate funnel");
			console.error(error);
		}
	};

	const handleArchive = async (funnelId: Id<"things">) => {
		try {
			await archiveFunnel({ id: funnelId });
			toast.success("Funnel archived");
		} catch (error) {
			toast.error("Failed to archive funnel");
			console.error(error);
		}
	};

	return (
		<div className="space-y-6">
			{/* Controls */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-1 gap-2">
					<Input
						placeholder="Search funnels..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="max-w-sm"
					/>
				</div>

				<div className="flex gap-2">
					<Select
						value={statusFilter}
						onValueChange={(value) => setStatusFilter(value as FunnelStatus | "all")}
					>
						<SelectTrigger className="w-[140px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Status</SelectItem>
							<SelectItem value="draft">Draft</SelectItem>
							<SelectItem value="active">Active</SelectItem>
							<SelectItem value="published">Published</SelectItem>
							<SelectItem value="archived">Archived</SelectItem>
						</SelectContent>
					</Select>

					<Select
						value={`${sortField}-${sortDirection}`}
						onValueChange={(value) => {
							const [field, direction] = value.split("-");
							setSortField(field as SortField);
							setSortDirection(direction as SortDirection);
						}}
					>
						<SelectTrigger className="w-[180px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="name-asc">Name (A-Z)</SelectItem>
							<SelectItem value="name-desc">Name (Z-A)</SelectItem>
							<SelectItem value="createdAt-desc">Newest First</SelectItem>
							<SelectItem value="createdAt-asc">Oldest First</SelectItem>
							<SelectItem value="updatedAt-desc">Recently Updated</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Stats Summary */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Total Funnels</CardDescription>
						<CardTitle className="text-3xl">{funnels.length}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Published</CardDescription>
						<CardTitle className="text-3xl">
							{funnels.filter((f) => f.status === "published").length}
						</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Draft</CardDescription>
						<CardTitle className="text-3xl">
							{funnels.filter((f) => f.status === "draft").length}
						</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Active</CardDescription>
						<CardTitle className="text-3xl">
							{funnels.filter((f) => f.status === "active").length}
						</CardTitle>
					</CardHeader>
				</Card>
			</div>

			{/* Results count */}
			<div className="flex items-center justify-between text-sm text-muted-foreground">
				<span>
					Showing {processedFunnels.length} of {funnels.length} funnels
				</span>
				{searchQuery && (
					<Button variant="ghost" size="sm" onClick={() => setSearchQuery("")}>
						Clear search
					</Button>
				)}
			</div>

			{/* No results after filtering */}
			{processedFunnels.length === 0 && (searchQuery || statusFilter !== "all") && (
				<div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
					<p className="text-lg text-muted-foreground">No funnels match your filters</p>
					<div className="mt-4 flex gap-2">
						{searchQuery && (
							<Button variant="outline" size="sm" onClick={() => setSearchQuery("")}>
								Clear search
							</Button>
						)}
						{statusFilter !== "all" && (
							<Button variant="outline" size="sm" onClick={() => setStatusFilter("all")}>
								Clear status filter
							</Button>
						)}
					</div>
				</div>
			)}

			{/* Funnel Grid */}
			{processedFunnels.length > 0 && (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{processedFunnels.map((funnel) => (
						<FunnelCard
							key={funnel._id}
							funnel={funnel}
							onPublish={handlePublish}
							onUnpublish={handleUnpublish}
							onDuplicate={handleDuplicate}
							onArchive={handleArchive}
						/>
					))}
				</div>
			)}
		</div>
	);
}

/**
 * Funnel Card Component
 *
 * Displays a single funnel with stats and quick actions.
 */
interface FunnelCardProps {
	funnel: Funnel;
	onPublish: (id: Id<"things">) => void;
	onUnpublish: (id: Id<"things">) => void;
	onDuplicate: (id: Id<"things">) => void;
	onArchive: (id: Id<"things">) => void;
}

function FunnelCard({
	funnel,
	onPublish,
	onUnpublish,
	onDuplicate,
	onArchive,
}: FunnelCardProps) {
	const statusColors: Record<FunnelStatus, string> = {
		draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
		active: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
		published: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
		archived: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
	};

	const conversionRate = funnel.properties?.conversionRate || 0;
	const views = funnel.properties?.views || 0;
	const conversions = funnel.properties?.conversions || 0;
	const stepCount = funnel.properties?.stepCount || 0;

	return (
		<Card className="group relative overflow-hidden transition-all hover:shadow-lg">
			<CardHeader>
				<div className="flex items-start justify-between gap-2">
					<div className="flex-1 min-w-0">
						<CardTitle className="truncate text-lg">{funnel.name}</CardTitle>
						{funnel.description && (
							<CardDescription className="mt-1 line-clamp-2">
								{funnel.description}
							</CardDescription>
						)}
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<circle cx="12" cy="12" r="1" />
									<circle cx="12" cy="5" r="1" />
									<circle cx="12" cy="19" r="1" />
								</svg>
								<span className="sr-only">Actions</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem asChild>
								<a href={`/funnels/${funnel._id}/edit`}>Edit Funnel</a>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => onDuplicate(funnel._id)}>
								Duplicate
							</DropdownMenuItem>
							{funnel.status === "published" ? (
								<DropdownMenuItem onClick={() => onUnpublish(funnel._id)}>
									Unpublish
								</DropdownMenuItem>
							) : (
								<DropdownMenuItem onClick={() => onPublish(funnel._id)}>
									Publish
								</DropdownMenuItem>
							)}
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={() => onArchive(funnel._id)}
								className="text-destructive"
							>
								Archive
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				<div className="mt-2">
					<Badge className={statusColors[funnel.status]} variant="secondary">
						{funnel.status}
					</Badge>
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				{/* Stats */}
				<div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-3 text-sm">
					<div>
						<div className="text-muted-foreground">Steps</div>
						<div className="text-lg font-semibold">{stepCount}</div>
					</div>
					<div>
						<div className="text-muted-foreground">Views</div>
						<div className="text-lg font-semibold">{views.toLocaleString()}</div>
					</div>
					<div>
						<div className="text-muted-foreground">Conversions</div>
						<div className="text-lg font-semibold">{conversions.toLocaleString()}</div>
					</div>
					<div>
						<div className="text-muted-foreground">Rate</div>
						<div className="text-lg font-semibold">{conversionRate.toFixed(1)}%</div>
					</div>
				</div>

				{/* Timestamps */}
				<div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
					<span>Created {new Date(funnel.createdAt).toLocaleDateString()}</span>
					<span>Updated {new Date(funnel.updatedAt).toLocaleDateString()}</span>
				</div>

				{/* Quick action button */}
				<Button asChild className="w-full" variant="outline">
					<a href={`/funnels/${funnel._id}/edit`}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							className="mr-2"
						>
							<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
							<path d="m15 5 4 4" />
						</svg>
						Edit Funnel
					</a>
				</Button>
			</CardContent>
		</Card>
	);
}
