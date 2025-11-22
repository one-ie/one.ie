/**
 * Related Products Section
 * Displays product cards with add to cart functionality
 */

"use client";

import { AddToCartButton } from "./interactive/AddToCartButton";
import type { CartItem } from "@/stores/cart";

export interface RelatedProduct {
	id: string;
	name: string;
	slug: string;
	price: number;
	image: string;
	category?: string;
	rating?: number;
}

interface RelatedProductsProps {
	products: RelatedProduct[];
	title?: string;
}

export function RelatedProducts({
	products,
	title = "You Might Also Like",
}: RelatedProductsProps) {
	return (
		<section className="max-w-7xl mx-auto px-6 py-24 border-t-4 border-black dark:border-white">
			{/* Header */}
			<div className="mb-16">
				<p className="text-xs font-bold tracking-[0.3em] uppercase mb-4">
					Related Products
				</p>
				<h2 className="text-4xl md:text-5xl font-light tracking-tight">
					{title}
				</h2>
			</div>

			{/* Products Grid */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
				{products.map((product) => (
					<div
						key={product.id}
						className="border-2 border-black dark:border-white bg-white dark:bg-black group hover:shadow-2xl transition-shadow duration-300"
					>
						{/* Product Image */}
						<div className="aspect-square overflow-hidden border-b-2 border-black dark:border-white">
							<img
								src={product.image}
								alt={product.name}
								className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
							/>
						</div>

						{/* Product Info */}
						<div className="p-6 space-y-4">
							{/* Category */}
							{product.category && (
								<p className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-60">
									{product.category}
								</p>
							)}

							{/* Name */}
							<h3 className="text-xl font-light tracking-tight min-h-[3rem]">
								{product.name}
							</h3>

							{/* Rating */}
							{product.rating && (
								<div className="flex items-center gap-2">
									<div className="flex gap-1">
										{Array.from({ length: 5 }, (_, i) => (
											<svg
												key={i}
												className="w-4 h-4"
												viewBox="0 0 24 24"
												fill="currentColor"
												style={{ color: "#D4AF37" }}
												opacity={i < Math.floor(product.rating!) ? "1" : "0.3"}
											>
												<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
											</svg>
										))}
									</div>
									<span className="text-xs opacity-60">
										{product.rating.toFixed(1)}
									</span>
								</div>
							)}

							{/* Price */}
							<div className="pt-4 border-t border-black dark:border-white">
								<span className="text-3xl font-light tabular-nums">
									${product.price.toFixed(2)}
								</span>
							</div>

							{/* Add to Cart Button */}
							<AddToCartButton
								product={{
									id: product.id,
									name: product.name,
									slug: product.slug,
									price: product.price,
									image: product.image,
								}}
								className="w-full bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white py-4 hover:opacity-80"
							>
								<span className="text-[10px] font-bold tracking-[0.3em] uppercase">
									Add to Cart
								</span>
							</AddToCartButton>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
