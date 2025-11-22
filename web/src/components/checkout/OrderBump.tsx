/**
 * OrderBump Component (Cycle 83)
 *
 * Order bump checkbox for checkout upsells
 * - Checkbox with product offer
 * - Discount display
 * - Product image and description
 * - Urgency indicators
 * - Analytics tracking
 *
 * Usage:
 * <OrderBump
 *   bump={orderBump}
 *   onToggle={handleToggle}
 *   accepted={isAccepted}
 * />
 */

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OrderBump } from "@/stores/checkout";

interface OrderBumpProps {
	bump: OrderBump;
	accepted: boolean;
	onToggle: (bumpId: string) => void;
	variant?: "default" | "compact" | "featured";
	showImage?: boolean;
	className?: string;
}

export function OrderBump({
	bump,
	accepted,
	onToggle,
	variant = "default",
	showImage = true,
	className,
}: OrderBumpProps) {
	const { product } = bump;
	const savings = product.originalPrice - product.discountedPrice;
	const savingsPercentage = product.discountPercentage ||
		Math.round((savings / product.originalPrice) * 100);

	const handleCheckboxChange = (checked: boolean) => {
		onToggle(bump.id);
	};

	return (
		<Card
			className={cn(
				"relative overflow-hidden transition-all duration-200",
				accepted && "ring-2 ring-primary",
				variant === "featured" && "border-primary shadow-md",
				className
			)}
		>
			<CardContent className="p-4">
				<div className="flex gap-4">
					{/* Checkbox */}
					<div className="flex items-start pt-1">
						<Checkbox
							id={`bump-${bump.id}`}
							checked={accepted}
							onCheckedChange={handleCheckboxChange}
							className="h-5 w-5"
						/>
					</div>

					{/* Product Image */}
					{showImage && product.image && (
						<div className="flex-shrink-0">
							<img
								src={product.image}
								alt={product.name}
								className="h-20 w-20 rounded-lg object-cover"
							/>
						</div>
					)}

					{/* Product Details */}
					<div className="flex-1 space-y-2">
						{/* Discount Badge */}
						{savingsPercentage > 0 && (
							<Badge
								variant="destructive"
								className="absolute right-4 top-4"
							>
								Save {savingsPercentage}%
							</Badge>
						)}

						{/* Title and Description */}
						<label
							htmlFor={`bump-${bump.id}`}
							className="block cursor-pointer"
						>
							<div className="space-y-1">
								<p className="font-semibold leading-tight">
									{variant === "compact" ? (
										<>
											Yes, add <span className="text-primary">{product.name}</span> for only{" "}
											<span className="text-lg font-bold">
												${(product.discountedPrice / 100).toFixed(2)}
											</span>
										</>
									) : (
										<>
											<span className="text-green-600">✓</span> Yes, add this to my order!
										</>
									)}
								</p>

								{variant !== "compact" && (
									<>
										<p className="text-base font-medium">{product.name}</p>
										<p className="text-sm text-muted-foreground">
											{product.description}
										</p>
									</>
								)}
							</div>
						</label>

						{/* Pricing */}
						<div className="flex items-center gap-3">
							{/* Discounted Price */}
							<div className="flex items-baseline gap-1">
								<span className="text-sm text-muted-foreground">Only</span>
								<span className="text-2xl font-bold text-primary">
									${(product.discountedPrice / 100).toFixed(2)}
								</span>
							</div>

							{/* Original Price */}
							{savings > 0 && (
								<div className="flex items-baseline gap-1">
									<span className="text-sm text-muted-foreground line-through">
										${(product.originalPrice / 100).toFixed(2)}
									</span>
									<span className="text-sm font-medium text-green-600">
										(Save ${(savings / 100).toFixed(2)})
									</span>
								</div>
							)}
						</div>

						{/* Urgency Indicator (Optional) */}
						{variant === "featured" && (
							<div className="mt-2">
								<Badge variant="outline" className="text-xs">
									🔥 Limited time offer - Today only!
								</Badge>
							</div>
						)}
					</div>
				</div>
			</CardContent>

			{/* Accepted State Overlay */}
			{accepted && (
				<div className="absolute inset-0 pointer-events-none bg-primary/5" />
			)}
		</Card>
	);
}

/**
 * OrderBumpList Component
 * Displays multiple order bumps
 */
interface OrderBumpListProps {
	bumps: OrderBump[];
	acceptedBumpIds: string[];
	onToggle: (bumpId: string) => void;
	maxBumps?: number;
	variant?: "default" | "compact" | "featured";
	className?: string;
}

export function OrderBumpList({
	bumps,
	acceptedBumpIds,
	onToggle,
	maxBumps = 3,
	variant = "default",
	className,
}: OrderBumpListProps) {
	const displayBumps = bumps.slice(0, maxBumps);

	if (displayBumps.length === 0) {
		return null;
	}

	return (
		<div className={cn("space-y-3", className)}>
			{/* Section Header */}
			<div className="space-y-1">
				<h3 className="text-lg font-semibold">Add to Your Order</h3>
				<p className="text-sm text-muted-foreground">
					Special offers available only during checkout
				</p>
			</div>

			{/* Bumps */}
			{displayBumps.map((bump) => (
				<OrderBump
					key={bump.id}
					bump={bump}
					accepted={acceptedBumpIds.includes(bump.id)}
					onToggle={onToggle}
					variant={variant}
				/>
			))}
		</div>
	);
}
