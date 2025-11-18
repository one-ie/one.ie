/**
 * EntityFilters Component
 *
 * Filter controls for entity list page.
 */

import React from "react";
import { Button } from "@/components/ui/button";

interface EntityFiltersProps {
	availableTypes: string[];
	currentFilters: {
		type?: string;
		status?: string;
	};
}

export function EntityFilters({
	availableTypes,
	currentFilters,
}: EntityFiltersProps) {
	const handleFilterChange = (key: string, value: string) => {
		const url = new URL(window.location.href);
		if (value) {
			url.searchParams.set(key, value);
		} else {
			url.searchParams.delete(key);
		}
		url.searchParams.delete("page"); // Reset to page 1
		window.location.href = url.toString();
	};

	const clearFilters = () => {
		window.location.href = "/dashboard/things";
	};

	const hasFilters = currentFilters.type || currentFilters.status;

	return (
		<div className="flex flex-wrap items-center gap-4">
			<div className="flex items-center gap-2">
				<label
					htmlFor="type-filter"
					className="text-sm font-medium text-gray-700 dark:text-gray-300"
				>
					Type:
				</label>
				<select
					id="type-filter"
					value={currentFilters.type || ""}
					onChange={(e) => handleFilterChange("type", e.target.value)}
					className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
				>
					<option value="">All Types</option>
					{availableTypes.map((type) => (
						<option key={type} value={type}>
							{type}
						</option>
					))}
				</select>
			</div>

			<div className="flex items-center gap-2">
				<label
					htmlFor="status-filter"
					className="text-sm font-medium text-gray-700 dark:text-gray-300"
				>
					Status:
				</label>
				<select
					id="status-filter"
					value={currentFilters.status || ""}
					onChange={(e) => handleFilterChange("status", e.target.value)}
					className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
				>
					<option value="">All Statuses</option>
					<option value="draft">Draft</option>
					<option value="active">Active</option>
					<option value="published">Published</option>
					<option value="archived">Archived</option>
				</select>
			</div>

			{hasFilters && (
				<Button variant="outline" size="sm" onClick={clearFilters}>
					Clear Filters
				</Button>
			)}
		</div>
	);
}
