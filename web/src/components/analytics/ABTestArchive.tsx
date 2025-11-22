/**
 * A/B Test Archive Component
 *
 * Manage archived and completed tests with:
 * - Archive/unarchive functionality
 * - Filterable list of all tests
 * - Historical performance tracking
 * - Export archived test data
 * - Bulk actions (archive multiple, delete)
 *
 * Part of Cycle 95: A/B Test UI Polish
 */

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	Archive,
	ArchiveRestore,
	Download,
	Search,
	Trash2,
	Calendar,
	TrendingUp,
	Trophy,
	Filter,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface ABTest {
	_id: Id<"things">;
	name: string;
	status: "running" | "completed" | "paused" | "archived";
	startDate: number;
	endDate?: number;
	winner?: string;
	variants: Array<{
		name: string;
		conversionRate: number;
	}>;
	testType: string;
}

interface ABTestArchiveProps {
	funnelId: string;
}

export function ABTestArchive({ funnelId }: ABTestArchiveProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [selectedTests, setSelectedTests] = useState<Set<string>>(new Set());
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

	// Fetch all tests (active and archived)
	const allTests = useQuery(api.queries.abTests.listByFunnel, {
		funnelId: funnelId as any,
		includeArchived: true,
	}) as ABTest[] | undefined;

	// Mutations
	const archiveTest = useMutation(api.mutations.abTests.archive);
	const unarchiveTest = useMutation(api.mutations.abTests.unarchive);
	const deleteTests = useMutation(api.mutations.abTests.bulkDelete);

	// Filter tests
	const filteredTests = allTests?.filter((test) => {
		const matchesSearch =
			searchQuery === "" ||
			test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			test.testType.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesStatus = statusFilter === "all" || test.status === statusFilter;

		return matchesSearch && matchesStatus;
	});

	// Handle archive/unarchive
	const handleArchive = async (testId: Id<"things">, isArchived: boolean) => {
		try {
			if (isArchived) {
				await unarchiveTest({ testId });
				toast.success("Test restored from archive");
			} else {
				await archiveTest({ testId });
				toast.success("Test archived");
			}
		} catch (error) {
			toast.error("Failed to update test");
		}
	};

	// Handle bulk actions
	const handleBulkArchive = async () => {
		try {
			for (const testId of selectedTests) {
				await archiveTest({ testId: testId as any });
			}
			toast.success(`${selectedTests.size} tests archived`);
			setSelectedTests(new Set());
		} catch (error) {
			toast.error("Failed to archive tests");
		}
	};

	const handleBulkDelete = async () => {
		try {
			await deleteTests({
				testIds: Array.from(selectedTests) as any,
			});
			toast.success(`${selectedTests.size} tests deleted`);
			setSelectedTests(new Set());
			setDeleteConfirmOpen(false);
		} catch (error) {
			toast.error("Failed to delete tests");
		}
	};

	// Handle export
	const handleExport = () => {
		if (!filteredTests) return;

		const csvData = [
			["Test Name", "Status", "Start Date", "End Date", "Winner", "Best Conversion Rate"],
			...filteredTests.map((test) => [
				test.name,
				test.status,
				new Date(test.startDate).toISOString(),
				test.endDate ? new Date(test.endDate).toISOString() : "",
				test.winner || "",
				Math.max(...test.variants.map((v) => v.conversionRate)).toFixed(2) + "%",
			]),
		];

		const csv = csvData.map((row) => row.join(",")).join("\n");
		const blob = new Blob([csv], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `ab-tests-${new Date().toISOString()}.csv`;
		a.click();
		URL.revokeObjectURL(url);

		toast.success("Tests exported to CSV");
	};

	// Toggle test selection
	const toggleTestSelection = (testId: string) => {
		const newSelection = new Set(selectedTests);
		if (newSelection.has(testId)) {
			newSelection.delete(testId);
		} else {
			newSelection.add(testId);
		}
		setSelectedTests(newSelection);
	};

	// Select all
	const toggleSelectAll = () => {
		if (selectedTests.size === filteredTests?.length) {
			setSelectedTests(new Set());
		} else {
			setSelectedTests(new Set(filteredTests?.map((t) => t._id)));
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "running":
				return (
					<Badge className="bg-green-600">
						<span className="flex items-center gap-1">
							<span className="relative flex h-2 w-2">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
								<span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
							</span>
							Running
						</span>
					</Badge>
				);
			case "completed":
				return <Badge className="bg-blue-600">Completed</Badge>;
			case "paused":
				return <Badge variant="outline">Paused</Badge>;
			case "archived":
				return <Badge variant="secondary">Archived</Badge>;
			default:
				return <Badge>{status}</Badge>;
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold flex items-center gap-2">
						<Archive className="h-6 w-6" />
						Test Archive
					</h2>
					<p className="text-sm text-muted-foreground mt-1">
						Manage completed and archived A/B tests
					</p>
				</div>
				<Button onClick={handleExport} variant="outline">
					<Download className="h-4 w-4 mr-2" />
					Export CSV
				</Button>
			</div>

			{/* Filters & Search */}
			<div className="flex gap-4">
				<div className="flex-1 relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search tests..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10"
					/>
				</div>
				<Select value={statusFilter} onValueChange={setStatusFilter}>
					<SelectTrigger className="w-[180px]">
						<Filter className="h-4 w-4 mr-2" />
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Status</SelectItem>
						<SelectItem value="running">Running</SelectItem>
						<SelectItem value="completed">Completed</SelectItem>
						<SelectItem value="paused">Paused</SelectItem>
						<SelectItem value="archived">Archived</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Bulk Actions */}
			{selectedTests.size > 0 && (
				<Card className="border-primary bg-primary/5">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium">
								{selectedTests.size} test{selectedTests.size > 1 ? "s" : ""} selected
							</span>
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={handleBulkArchive}
								>
									<Archive className="h-4 w-4 mr-2" />
									Archive Selected
								</Button>
								<Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
									<DialogTrigger asChild>
										<Button variant="destructive" size="sm">
											<Trash2 className="h-4 w-4 mr-2" />
											Delete Selected
										</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>Delete {selectedTests.size} Tests?</DialogTitle>
											<DialogDescription>
												This action cannot be undone. The selected tests and all their data will be permanently deleted.
											</DialogDescription>
										</DialogHeader>
										<DialogFooter>
											<Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
												Cancel
											</Button>
											<Button variant="destructive" onClick={handleBulkDelete}>
												Delete Permanently
											</Button>
										</DialogFooter>
									</DialogContent>
								</Dialog>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Tests Table */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>All Tests</CardTitle>
							<CardDescription>
								{filteredTests?.length || 0} tests found
							</CardDescription>
						</div>
						<Checkbox
							checked={selectedTests.size === filteredTests?.length && filteredTests.length > 0}
							onCheckedChange={toggleSelectAll}
						/>
					</div>
				</CardHeader>
				<CardContent>
					{filteredTests && filteredTests.length > 0 ? (
						<div className="space-y-2">
							{filteredTests.map((test) => (
								<div
									key={test._id}
									className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
								>
									<Checkbox
										checked={selectedTests.has(test._id)}
										onCheckedChange={() => toggleTestSelection(test._id)}
									/>
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-1">
											<span className="font-medium">{test.name}</span>
											{getStatusBadge(test.status)}
											{test.winner && (
												<Badge variant="default" className="bg-green-600">
													<Trophy className="h-3 w-3 mr-1" />
													Winner: {test.winner}
												</Badge>
											)}
										</div>
										<div className="flex items-center gap-4 text-xs text-muted-foreground">
											<span className="flex items-center gap-1">
												<Calendar className="h-3 w-3" />
												Started {formatDistanceToNow(new Date(test.startDate), { addSuffix: true })}
											</span>
											{test.endDate && (
												<span>
													Ended {formatDistanceToNow(new Date(test.endDate), { addSuffix: true })}
												</span>
											)}
											<span className="capitalize">{test.testType.replace(/_/g, " ")}</span>
										</div>
										<div className="flex gap-2 mt-2">
											{test.variants.map((variant) => (
												<Badge key={variant.name} variant="outline" className="text-xs">
													{variant.name}: {variant.conversionRate.toFixed(2)}%
												</Badge>
											))}
										</div>
									</div>
									<div className="flex gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => (window.location.href = `/funnels/${funnelId}/ab-tests/${test._id}/results`)}
										>
											View Results
										</Button>
										{test.status === "archived" ? (
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleArchive(test._id, true)}
											>
												<ArchiveRestore className="h-4 w-4 mr-2" />
												Restore
											</Button>
										) : (
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleArchive(test._id, false)}
											>
												<Archive className="h-4 w-4 mr-2" />
												Archive
											</Button>
										)}
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-12">
							<Archive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
							<p className="text-lg font-medium mb-2">No tests found</p>
							<p className="text-sm text-muted-foreground">
								{searchQuery || statusFilter !== "all"
									? "Try adjusting your filters"
									: "Create your first A/B test to get started"}
							</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Stats Summary */}
			{filteredTests && filteredTests.length > 0 && (
				<div className="grid grid-cols-4 gap-4">
					<Card>
						<CardContent className="p-4">
							<div className="text-sm text-muted-foreground">Total Tests</div>
							<div className="text-2xl font-bold">{filteredTests.length}</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-4">
							<div className="text-sm text-muted-foreground">Running</div>
							<div className="text-2xl font-bold">
								{filteredTests.filter((t) => t.status === "running").length}
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-4">
							<div className="text-sm text-muted-foreground">Completed</div>
							<div className="text-2xl font-bold">
								{filteredTests.filter((t) => t.status === "completed").length}
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-4">
							<div className="text-sm text-muted-foreground">Archived</div>
							<div className="text-2xl font-bold">
								{filteredTests.filter((t) => t.status === "archived").length}
							</div>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
}
