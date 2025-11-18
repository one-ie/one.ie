/**
 * Collection Page Client Component
 * Wraps FilterSidebar and ProductGrid with shared filtering state
 * Provides real-time filtering, sorting, and product display
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import type { FilterOptions } from "@/types/ecommerce";
import { ProductGrid } from "../static/ProductGrid";
import { FilterSidebar } from "./FilterSidebar";
import { ProductCard } from "./ProductCard";

export interface Product {
	id: string;
	slug: string;
	name: string;
	description: string;
	price: number;
	compareAtPrice?: number;
	images: string[];
	thumbnail: string;
	category: string;
	tags: string[];
	inStock: boolean;
	rating: number;
	reviewCount: number;
	featured: boolean;
	inventory?: number;
	createdAt: Date | string;
	updatedAt: Date | string;
}

export interface CollectionCategory {
	id: string;
	name: string;
	count?: number;
	products?: string[];
}

interface CollectionPageClientProps {
	products: Product[];
	categories: CollectionCategory[];
	tags: string[];
	currentCollectionSlug: string;
}

function CollectionPageClient({
	products: initialProducts,
	categories,
	tags,
	currentCollectionSlug,
}: CollectionPageClientProps) {
	const [filters, setFilters] = useState<FilterOptions>(() => ({
		categories:
			currentCollectionSlug && currentCollectionSlug !== "all"
				? [currentCollectionSlug]
				: [],
		tags: [],
		inStockOnly: false,
		priceRange: undefined,
		sortBy: "newest",
		rating: undefined,
	}));

	useEffect(() => {
		if (currentCollectionSlug && currentCollectionSlug !== "all") {
			setFilters((prev) => {
				if (prev.categories?.includes(currentCollectionSlug)) {
					return prev;
				}
				return { ...prev, categories: [currentCollectionSlug] };
			});
		}
	}, [currentCollectionSlug]);

	const normalizedProducts = useMemo(() => {
		return initialProducts.map((product) => ({
			...product,
			createdAt:
				product.createdAt instanceof Date
					? product.createdAt
					: new Date(product.createdAt),
			updatedAt:
				product.updatedAt instanceof Date
					? product.updatedAt
					: new Date(product.updatedAt),
		}));
	}, [initialProducts]);

	// Calculate min/max prices for slider
	const priceRange = useMemo(() => {
		if (normalizedProducts.length === 0) return { min: 0, max: 500 };
		const prices = normalizedProducts.map((p) => p.price);
		return {
			min: Math.floor(Math.min(...prices) / 10) * 10, // Round down to nearest 10
			max: Math.ceil(Math.max(...prices) / 10) * 10, // Round up to nearest 10
		};
	}, [normalizedProducts]);

	// Filter and sort products based on current filters
	const filteredProducts = useMemo(() => {
		let result = [...normalizedProducts];

		// Filter by collections (if other collections selected)
		if (filters.categories && filters.categories.length > 0) {
			const selectedCollectionSlugs = filters.categories;

			// Get all product slugs that should be shown
			// For each selected collection, we need to find which products belong to it
			const productsToShow = new Set<string>();

			selectedCollectionSlugs.forEach((collectionSlug) => {
				// Find products that belong to this collection
				result.forEach((product) => {
					// Check if this product is in the selected collection
					const collection = categories.find((c) => c.id === collectionSlug);
					if (
						collection?.products &&
						collection.products.includes(product.slug)
					) {
						productsToShow.add(product.slug);
					}
				});
			});

			// If collections are selected, only show products in those collections
			if (productsToShow.size > 0) {
				result = result.filter((p) => productsToShow.has(p.slug));
			}
		}

		// Filter by tags
		if (filters.tags && filters.tags.length > 0) {
			result = result.filter((p) =>
				filters.tags.some((tag) => p.tags.includes(tag)),
			);
		}

		// Filter by in stock
		if (filters.inStockOnly) {
			result = result.filter((p) => p.inStock);
		}

		// Filter by price range
		if (filters.priceRange) {
			const { min, max } = filters.priceRange;
			result = result.filter((p) => p.price >= min && p.price <= max);
		}

		// Filter by rating
		if (filters.rating) {
			const minRating = filters.rating;
			result = result.filter((p) => p.rating >= minRating);
		}

		// Sort products
		switch (filters.sortBy) {
			case "newest":
				result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
				break;
			case "popular":
				result.sort((a, b) => b.reviewCount - a.reviewCount);
				break;
			case "rating":
				result.sort((a, b) => b.rating - a.rating);
				break;
			case "price-asc":
				result.sort((a, b) => a.price - b.price);
				break;
			case "price-desc":
				result.sort((a, b) => b.price - a.price);
				break;
			default:
				break;
		}

		return result;
	}, [normalizedProducts, filters, categories]);

	const handleFilterChange = (newFilters: FilterOptions) => {
		setFilters(newFilters);
	};

	return (
		<div className="lg:grid lg:grid-cols-4 lg:gap-8">
			{/* Filters Sidebar */}
			<aside className="mb-8 lg:mb-0">
				<div className="rounded-lg border border-border bg-card p-6">
					<h2 className="mb-4 text-lg font-semibold text-foreground">
						Filters
					</h2>
					<FilterSidebar
						categories={categories}
						tags={tags}
						onFilterChange={handleFilterChange}
						maxPrice={priceRange.max}
						minPrice={priceRange.min}
						initialFilters={
							currentCollectionSlug !== "all"
								? { categories: [currentCollectionSlug] }
								: undefined
						}
					/>
				</div>
			</aside>

			{/* Product Grid */}
			<div className="lg:col-span-3">
				<div className="mb-4 flex items-center justify-between">
					<p className="text-sm text-muted-foreground">
						Showing {filteredProducts.length} of {normalizedProducts.length}{" "}
						products
					</p>
				</div>

				{filteredProducts.length > 0 ? (
					<ProductGrid columns={3}>
						{filteredProducts.map((product) => (
							<ProductCard key={product.id} product={product} />
						))}
					</ProductGrid>
				) : (
					<div className="py-16 text-center">
						<svg
							className="mx-auto h-16 w-16 text-muted-foreground"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
							/>
						</svg>
						<h3 className="mt-4 text-lg font-semibold text-foreground">
							No products found
						</h3>
						<p className="mt-2 text-muted-foreground">
							Try adjusting your filters
						</p>
					</div>
				)}

				{/* Pagination Placeholder */}
				{filteredProducts.length > 0 && (
					<div className="mt-8 flex justify-center gap-2">
						<button className="rounded-md border border-border bg-background px-4 py-2 text-sm hover:bg-accent">
							Previous
						</button>
						<button className="rounded-md border border-primary bg-primary px-4 py-2 text-sm text-primary-foreground">
							1
						</button>
						<button className="rounded-md border border-border bg-background px-4 py-2 text-sm hover:bg-accent">
							2
						</button>
						<button className="rounded-md border border-border bg-background px-4 py-2 text-sm hover:bg-accent">
							3
						</button>
						<button className="rounded-md border border-border bg-background px-4 py-2 text-sm hover:bg-accent">
							Next
						</button>
					</div>
				)}
			</div>
		</div>
	);
}

export { CollectionPageClient };
export default CollectionPageClient;
