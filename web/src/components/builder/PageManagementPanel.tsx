"use client";

import * as React from "react";
import {
	FileText,
	Copy,
	Trash2,
	Home,
	Search,
	Plus,
	MoreHorizontal,
	Eye,
	Edit,
	GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";

interface Page {
	id: string;
	name: string;
	slug: string;
	status: "draft" | "published";
	isHomepage: boolean;
	createdAt: number;
	updatedAt: number;
	viewCount?: number;
}

interface PageManagementPanelProps {
	websiteId: string;
	pages?: Page[];
	onPageCreate?: (page: Page) => void;
	onPageDelete?: (pageId: string) => void;
	onPageDuplicate?: (pageId: string) => void;
	onSetHomepage?: (pageId: string) => void;
}

type SortField = "name" | "created" | "updated" | "views";
type SortOrder = "asc" | "desc";

export function PageManagementPanel({
	websiteId,
	pages: initialPages = [],
	onPageCreate,
	onPageDelete,
	onPageDuplicate,
	onSetHomepage,
}: PageManagementPanelProps) {
	const [pages, setPages] = React.useState<Page[]>(initialPages);
	const [searchQuery, setSearchQuery] = React.useState("");
	const [sortField, setSortField] = React.useState<SortField>("updated");
	const [sortOrder, setSortOrder] = React.useState<SortOrder>("desc");
	const [statusFilter, setStatusFilter] = React.useState<"all" | "draft" | "published">("all");
	const [selectedPages, setSelectedPages] = React.useState<Set<string>>(new Set());
	const [showCreateDialog, setShowCreateDialog] = React.useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
	const [deletePageId, setDeletePageId] = React.useState<string | null>(null);
	const [newPageName, setNewPageName] = React.useState("");
	const [createMode, setCreateMode] = React.useState<"blank" | "ai">("blank");
	const [isLoading, setIsLoading] = React.useState(false);

	// Filter and sort pages
	const filteredPages = React.useMemo(() => {
		let result = pages.filter((page) => {
			const matchesSearch = page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				page.slug.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesStatus = statusFilter === "all" || page.status === statusFilter;
			return matchesSearch && matchesStatus;
		});

		// Sort
		result.sort((a, b) => {
			let aValue: any = a[sortField === "created" ? "createdAt" : sortField === "updated" ? "updatedAt" : sortField === "views" ? "viewCount" : "name"];
			let bValue: any = b[sortField === "created" ? "createdAt" : sortField === "updated" ? "updatedAt" : sortField === "views" ? "viewCount" : "name"];

			if (typeof aValue === "string") {
				aValue = aValue.toLowerCase();
				bValue = bValue.toLowerCase();
			}

			if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
			if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
			return 0;
		});

		return result;
	}, [pages, searchQuery, statusFilter, sortField, sortOrder]);

	const handleCreatePage = async () => {
		if (!newPageName.trim()) {
			toast({
				title: "Error",
				description: "Page name is required",
				variant: "destructive",
			});
			return;
		}

		setIsLoading(true);

		try {
			// Create new page
			const newPage: Page = {
				id: `page-${Date.now()}`,
				name: newPageName,
				slug: newPageName.toLowerCase().replace(/\s+/g, "-"),
				status: "draft",
				isHomepage: false,
				createdAt: Date.now(),
				updatedAt: Date.now(),
				viewCount: 0,
			};

			setPages([...pages, newPage]);
			onPageCreate?.(newPage);

			toast({
				title: "Success",
				description: `Page "${newPageName}" created successfully`,
			});

			setNewPageName("");
			setShowCreateDialog(false);
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeletePage = async () => {
		if (!deletePageId) return;

		setIsLoading(true);

		try {
			setPages(pages.filter((p) => p.id !== deletePageId));
			onPageDelete?.(deletePageId);

			toast({
				title: "Success",
				description: "Page deleted successfully",
			});

			setShowDeleteConfirm(false);
			setDeletePageId(null);
		} finally {
			setIsLoading(false);
		}
	};

	const handleDuplicatePage = async (pageId: string) => {
		const pageToDuplicate = pages.find((p) => p.id === pageId);
		if (!pageToDuplicate) return;

		setIsLoading(true);

		try {
			const newPage: Page = {
				...pageToDuplicate,
				id: `page-${Date.now()}`,
				name: `${pageToDuplicate.name} (Copy)`,
				slug: `${pageToDuplicate.slug}-copy`,
				status: "draft",
				isHomepage: false,
				createdAt: Date.now(),
				updatedAt: Date.now(),
			};

			setPages([...pages, newPage]);
			onPageDuplicate?.(pageId);

			toast({
				title: "Success",
				description: `Page duplicated as "${newPage.name}"`,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleSetHomepage = async (pageId: string) => {
		setIsLoading(true);

		try {
			setPages(
				pages.map((p) => ({
					...p,
					isHomepage: p.id === pageId,
				}))
			);

			onSetHomepage?.(pageId);

			toast({
				title: "Success",
				description: "Homepage updated",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedPages(new Set(filteredPages.map((p) => p.id)));
		} else {
			setSelectedPages(new Set());
		}
	};

	const handleSelectPage = (pageId: string, checked: boolean) => {
		const newSelected = new Set(selectedPages);
		if (checked) {
			newSelected.add(pageId);
		} else {
			newSelected.delete(pageId);
		}
		setSelectedPages(newSelected);
	};

	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	const homepagePage = pages.find((p) => p.isHomepage);

	return (
		<div className="h-full flex flex-col bg-background">
			{/* Header */}
			<div className="border-b px-6 py-4">
				<div className="flex items-center justify-between gap-4">
					<div>
						<h1 className="text-2xl font-bold">Pages</h1>
						<p className="text-sm text-muted-foreground mt-1">
							Manage {pages.length} page{pages.length !== 1 ? "s" : ""} for your website
						</p>
					</div>

					<Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
						<DialogTrigger asChild>
							<Button>
								<Plus className="h-4 w-4 mr-2" />
								New Page
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Create New Page</DialogTitle>
							</DialogHeader>

							<div className="space-y-4 py-4">
								{/* Page Name */}
								<div className="space-y-2">
									<Label htmlFor="page-name">Page Name</Label>
									<Input
										id="page-name"
										placeholder="e.g., About, Services, Blog"
										value={newPageName}
										onChange={(e) => setNewPageName(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												handleCreatePage();
											}
										}}
									/>
								</div>

								{/* Mode Selection */}
								<div className="space-y-2">
									<Label>Creation Method</Label>
									<div className="flex gap-4">
										<label className="flex items-center gap-2 cursor-pointer">
											<Checkbox
												checked={createMode === "blank"}
												onCheckedChange={() => setCreateMode("blank")}
											/>
											<span className="text-sm">Blank Page</span>
										</label>
										<label className="flex items-center gap-2 cursor-pointer">
											<Checkbox
												checked={createMode === "ai"}
												onCheckedChange={() => setCreateMode("ai")}
											/>
											<span className="text-sm">AI Generated</span>
										</label>
									</div>
								</div>

								{createMode === "ai" && (
									<div className="p-3 bg-primary/10 rounded-lg text-sm">
										<p>Describe what you want on this page and AI will generate it for you.</p>
									</div>
								)}
							</div>

							<DialogFooter>
								<Button variant="outline" onClick={() => setShowCreateDialog(false)}>
									Cancel
								</Button>
								<Button onClick={handleCreatePage} disabled={isLoading}>
									{isLoading ? "Creating..." : "Create Page"}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			{/* Toolbar */}
			<div className="border-b px-6 py-3 bg-muted/30 flex items-center justify-between gap-4">
				<div className="flex items-center gap-2 flex-1">
					<Search className="h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search pages..."
						className="max-w-sm border-0 bg-transparent"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>

				<div className="flex items-center gap-2">
					{/* Status Filter */}
					<div className="flex items-center gap-1 bg-background rounded-lg p-1">
						{(["all", "draft", "published"] as const).map((status) => (
							<Button
								key={status}
								variant={statusFilter === status ? "default" : "ghost"}
								size="sm"
								onClick={() => setStatusFilter(status)}
								className="capitalize"
							>
								{status}
							</Button>
						))}
					</div>

					{/* Sort Dropdown */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="sm">
								Sort: {sortField === "created" ? "Created" : sortField === "updated" ? "Updated" : "Name"}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							{(["name", "created", "updated", "views"] as const).map((field) => (
								<DropdownMenuItem
									key={field}
									onClick={() => {
										if (sortField === field) {
											setSortOrder(sortOrder === "asc" ? "desc" : "asc");
										} else {
											setSortField(field);
											setSortOrder("desc");
										}
									}}
									className="capitalize"
								>
									{field === "created" ? "Created Date" : field === "updated" ? "Updated Date" : field === "name" ? "Page Name" : "Views"}
									{sortField === field && (
										<span className="ml-2">{sortOrder === "asc" ? "↑" : "↓"}</span>
									)}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{/* Table */}
			<div className="flex-1 overflow-auto">
				{filteredPages.length === 0 ? (
					<div className="flex items-center justify-center h-full">
						<div className="text-center">
							<FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
							<p className="text-muted-foreground">
								{searchQuery || statusFilter !== "all"
									? "No pages found"
									: "No pages yet. Create your first page!"}
							</p>
						</div>
					</div>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-12">
									<Checkbox
										checked={selectedPages.size === filteredPages.length && filteredPages.length > 0}
										onCheckedChange={handleSelectAll}
									/>
								</TableHead>
								<TableHead className="w-12"></TableHead>
								<TableHead
									className="cursor-pointer select-none"
									onClick={() => {
										if (sortField === "name") {
											setSortOrder(sortOrder === "asc" ? "desc" : "asc");
										} else {
											setSortField("name");
											setSortOrder("asc");
										}
									}}
								>
									Name {sortField === "name" && (sortOrder === "asc" ? "↑" : "↓")}
								</TableHead>
								<TableHead>Status</TableHead>
								<TableHead
									className="cursor-pointer select-none"
									onClick={() => {
										if (sortField === "updated") {
											setSortOrder(sortOrder === "asc" ? "desc" : "asc");
										} else {
											setSortField("updated");
											setSortOrder("desc");
										}
									}}
								>
									Last Updated {sortField === "updated" && (sortOrder === "asc" ? "↑" : "↓")}
								</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredPages.map((page) => (
								<TableRow key={page.id} className="hover:bg-muted/50">
									<TableCell>
										<Checkbox
											checked={selectedPages.has(page.id)}
											onCheckedChange={(checked) => handleSelectPage(page.id, checked as boolean)}
										/>
									</TableCell>
									<TableCell>
										<GripVertical className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing" />
									</TableCell>
									<TableCell>
										<div>
											<div className="font-medium">{page.name}</div>
											<div className="text-xs text-muted-foreground">/{page.slug}</div>
											{page.isHomepage && (
												<Badge variant="secondary" className="mt-1">
													Homepage
												</Badge>
											)}
										</div>
									</TableCell>
									<TableCell>
										<Badge
											variant={page.status === "published" ? "default" : "outline"}
											className="capitalize"
										>
											{page.status}
										</Badge>
									</TableCell>
									<TableCell className="text-sm text-muted-foreground">
										{formatDate(page.updatedAt)}
									</TableCell>
									<TableCell className="text-right">
										<div className="flex items-center justify-end gap-2">
											<Button
												variant="ghost"
												size="sm"
												asChild
												title="Edit page"
											>
												<a href={`/builder/${websiteId}/${page.id}`}>
													<Edit className="h-4 w-4" />
												</a>
											</Button>

											<Button
												variant="ghost"
												size="sm"
												asChild
												title="Preview page"
											>
												<a href={`/preview/${websiteId}/${page.id}`} target="_blank" rel="noopener noreferrer">
													<Eye className="h-4 w-4" />
												</a>
											</Button>

											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="sm">
														<MoreHorizontal className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													{!page.isHomepage && (
														<>
															<DropdownMenuItem onClick={() => handleSetHomepage(page.id)}>
																<Home className="h-4 w-4 mr-2" />
																Set as Homepage
															</DropdownMenuItem>
															<DropdownMenuSeparator />
														</>
													)}

													<DropdownMenuItem onClick={() => handleDuplicatePage(page.id)}>
														<Copy className="h-4 w-4 mr-2" />
														Duplicate
													</DropdownMenuItem>

													<DropdownMenuSeparator />

													<DropdownMenuItem
														onClick={() => {
															setDeletePageId(page.id);
															setShowDeleteConfirm(true);
														}}
														className="text-destructive"
													>
														<Trash2 className="h-4 w-4 mr-2" />
														Delete
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</div>

			{/* Footer */}
			{pages.length > 0 && (
				<div className="border-t px-6 py-3 bg-muted/30 flex items-center justify-between text-sm text-muted-foreground">
					<div>
						{selectedPages.size > 0 && (
							<span>{selectedPages.size} page{selectedPages.size !== 1 ? "s" : ""} selected</span>
						)}
						{selectedPages.size === 0 && homepagePage && (
							<span>Homepage: <span className="font-medium">{homepagePage.name}</span></span>
						)}
					</div>
				</div>
			)}

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Page</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this page? This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handleDeletePage} className="bg-destructive text-destructive-foreground">
							{isLoading ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
