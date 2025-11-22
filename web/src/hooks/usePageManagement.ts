import { useState, useCallback, useMemo } from "react";

/**
 * Page interface for management operations
 */
export interface ManagedPage {
	id: string;
	name: string;
	slug: string;
	status: "draft" | "published";
	isHomepage: boolean;
	createdAt: number;
	updatedAt: number;
	viewCount?: number;
}

/**
 * Hook for managing page operations
 * Handles creation, deletion, duplication, and homepage assignment
 */
export function usePageManagement(initialPages: ManagedPage[] = []) {
	const [pages, setPages] = useState<ManagedPage[]>(initialPages);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published">("all");
	const [sortField, setSortField] = useState<"name" | "created" | "updated" | "views">("updated");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
	const [selectedPageIds, setSelectedPageIds] = useState<Set<string>>(new Set());
	const [isLoading, setIsLoading] = useState(false);

	/**
	 * Filter and sort pages based on current state
	 */
	const filteredPages = useMemo(() => {
		let result = pages.filter((page) => {
			const matchesSearch =
				page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				page.slug.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesStatus = statusFilter === "all" || page.status === statusFilter;
			return matchesSearch && matchesStatus;
		});

		// Sort
		result.sort((a, b) => {
			let aValue: any =
				sortField === "created" ? a.createdAt :
				sortField === "updated" ? a.updatedAt :
				sortField === "views" ? a.viewCount ?? 0 :
				a.name;

			let bValue: any =
				sortField === "created" ? b.createdAt :
				sortField === "updated" ? b.updatedAt :
				sortField === "views" ? b.viewCount ?? 0 :
				b.name;

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

	/**
	 * Create a new page
	 */
	const createPage = useCallback(
		async (name: string): Promise<ManagedPage> => {
			setIsLoading(true);

			try {
				const newPage: ManagedPage = {
					id: `page-${Date.now()}`,
					name,
					slug: name.toLowerCase().replace(/\s+/g, "-"),
					status: "draft",
					isHomepage: false,
					createdAt: Date.now(),
					updatedAt: Date.now(),
					viewCount: 0,
				};

				setPages([...pages, newPage]);
				return newPage;
			} finally {
				setIsLoading(false);
			}
		},
		[pages]
	);

	/**
	 * Delete a page by ID
	 */
	const deletePage = useCallback(
		async (pageId: string): Promise<void> => {
			setIsLoading(true);

			try {
				setPages(pages.filter((p) => p.id !== pageId));
				setSelectedPageIds((prev) => {
					const next = new Set(prev);
					next.delete(pageId);
					return next;
				});
			} finally {
				setIsLoading(false);
			}
		},
		[pages]
	);

	/**
	 * Delete multiple pages
	 */
	const deletePages = useCallback(
		async (pageIds: string[]): Promise<void> => {
			setIsLoading(true);

			try {
				setPages(pages.filter((p) => !pageIds.includes(p.id)));
				setSelectedPageIds(new Set());
			} finally {
				setIsLoading(false);
			}
		},
		[pages]
	);

	/**
	 * Duplicate a page
	 */
	const duplicatePage = useCallback(
		async (pageId: string): Promise<ManagedPage> => {
			setIsLoading(true);

			try {
				const pageToDuplicate = pages.find((p) => p.id === pageId);
				if (!pageToDuplicate) {
					throw new Error("Page not found");
				}

				const newPage: ManagedPage = {
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
				return newPage;
			} finally {
				setIsLoading(false);
			}
		},
		[pages]
	);

	/**
	 * Set a page as homepage
	 */
	const setHomepage = useCallback(
		async (pageId: string): Promise<void> => {
			setIsLoading(true);

			try {
				setPages(
					pages.map((p) => ({
						...p,
						isHomepage: p.id === pageId,
					}))
				);
			} finally {
				setIsLoading(false);
			}
		},
		[pages]
	);

	/**
	 * Update page metadata
	 */
	const updatePage = useCallback(
		async (pageId: string, updates: Partial<ManagedPage>): Promise<void> => {
			setIsLoading(true);

			try {
				setPages(
					pages.map((p) =>
						p.id === pageId
							? { ...p, ...updates, updatedAt: Date.now() }
							: p
					)
				);
			} finally {
				setIsLoading(false);
			}
		},
		[pages]
	);

	/**
	 * Toggle page selection
	 */
	const togglePageSelection = useCallback((pageId: string, selected: boolean) => {
		setSelectedPageIds((prev) => {
			const next = new Set(prev);
			if (selected) {
				next.add(pageId);
			} else {
				next.delete(pageId);
			}
			return next;
		});
	}, []);

	/**
	 * Select all pages
	 */
	const selectAllPages = useCallback((selected: boolean) => {
		if (selected) {
			setSelectedPageIds(new Set(filteredPages.map((p) => p.id)));
		} else {
			setSelectedPageIds(new Set());
		}
	}, [filteredPages]);

	/**
	 * Clear selection
	 */
	const clearSelection = useCallback(() => {
		setSelectedPageIds(new Set());
	}, []);

	/**
	 * Get page by ID
	 */
	const getPage = useCallback(
		(pageId: string): ManagedPage | undefined => {
			return pages.find((p) => p.id === pageId);
		},
		[pages]
	);

	/**
	 * Get homepage
	 */
	const getHomepage = useCallback((): ManagedPage | undefined => {
		return pages.find((p) => p.isHomepage);
	}, [pages]);

	/**
	 * Get page statistics
	 */
	const getStats = useCallback(() => {
		const total = pages.length;
		const published = pages.filter((p) => p.status === "published").length;
		const draft = pages.filter((p) => p.status === "draft").length;
		const totalViews = pages.reduce((sum, p) => sum + (p.viewCount ?? 0), 0);

		return { total, published, draft, totalViews };
	}, [pages]);

	return {
		// State
		pages,
		filteredPages,
		searchQuery,
		statusFilter,
		sortField,
		sortOrder,
		selectedPageIds,
		isLoading,

		// State setters
		setSearchQuery,
		setStatusFilter,
		setSortField,
		setSortOrder,

		// Operations
		createPage,
		deletePage,
		deletePages,
		duplicatePage,
		setHomepage,
		updatePage,

		// Selection
		togglePageSelection,
		selectAllPages,
		clearSelection,

		// Queries
		getPage,
		getHomepage,
		getStats,
	};
}

export type UsePageManagementReturn = ReturnType<typeof usePageManagement>;
