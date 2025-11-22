/**
 * A/B Test Variant Comparison Component
 *
 * Side-by-side visual comparison of test variants with:
 * - Live preview of each variant
 * - Quick variant switching
 * - Performance metrics overlay
 * - Visual diff highlighting
 *
 * Part of Cycle 95: A/B Test UI Polish
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
	ChevronLeft,
	ChevronRight,
	Eye,
	TrendingUp,
	TrendingDown,
	Trophy,
	Users,
	Target,
} from "lucide-react";

interface Variant {
	id: string;
	name: string;
	customName?: string;
	visitors: number;
	conversions: number;
	conversionRate: number;
	isControl: boolean;
	isWinner?: boolean;
	changes: {
		headline?: string;
		ctaText?: string;
		image?: string;
		pageContent?: string;
		description?: string;
	};
}

interface ABTestVariantComparisonProps {
	variants: Variant[];
	testType: "headline" | "cta_button" | "image" | "entire_page" | "funnel_flow";
	onVariantSelect?: (variantId: string) => void;
}

export function ABTestVariantComparison({
	variants,
	testType,
	onVariantSelect,
}: ABTestVariantComparisonProps) {
	const [selectedVariants, setSelectedVariants] = useState<string[]>([
		variants[0]?.id,
		variants[1]?.id,
	].filter(Boolean));
	const [showMetrics, setShowMetrics] = useState(true);
	const [highlightDifferences, setHighlightDifferences] = useState(true);

	const toggleVariantSelection = (variantId: string) => {
		if (selectedVariants.includes(variantId)) {
			if (selectedVariants.length > 1) {
				setSelectedVariants(selectedVariants.filter((id) => id !== variantId));
			}
		} else {
			if (selectedVariants.length < 3) {
				setSelectedVariants([...selectedVariants, variantId]);
			}
		}
	};

	const navigateVariant = (direction: "prev" | "next") => {
		const currentIndex = variants.findIndex((v) => v.id === selectedVariants[0]);
		const newIndex =
			direction === "next"
				? (currentIndex + 1) % variants.length
				: currentIndex === 0
					? variants.length - 1
					: currentIndex - 1;

		setSelectedVariants([variants[newIndex].id, ...selectedVariants.slice(1)]);
	};

	const selectedVariantData = selectedVariants
		.map((id) => variants.find((v) => v.id === id))
		.filter(Boolean) as Variant[];

	const getPerformanceBadge = (variant: Variant) => {
		if (variant.isWinner) {
			return (
				<Badge className="bg-green-600">
					<Trophy className="h-3 w-3 mr-1" />
					Winner
				</Badge>
			);
		}

		const control = variants.find((v) => v.isControl);
		if (!control || variant.isControl) {
			return null;
		}

		const diff = variant.conversionRate - control.conversionRate;
		if (diff > 0) {
			return (
				<Badge variant="default" className="bg-blue-600">
					<TrendingUp className="h-3 w-3 mr-1" />
					+{diff.toFixed(2)}%
				</Badge>
			);
		} else if (diff < 0) {
			return (
				<Badge variant="destructive">
					<TrendingDown className="h-3 w-3 mr-1" />
					{diff.toFixed(2)}%
				</Badge>
			);
		}

		return null;
	};

	const renderVariantPreview = (variant: Variant) => {
		return (
			<div className="relative border rounded-lg p-6 bg-muted/30">
				{/* Metrics Overlay */}
				{showMetrics && (
					<div className="absolute top-2 right-2 space-y-1">
						<div className="bg-background/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
							<div className="text-xs text-muted-foreground">Conversion Rate</div>
							<div className="text-lg font-bold">{variant.conversionRate.toFixed(2)}%</div>
						</div>
						<div className="bg-background/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<Users className="h-3 w-3" />
								{variant.visitors.toLocaleString()}
							</div>
							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<Target className="h-3 w-3" />
								{variant.conversions.toLocaleString()}
							</div>
						</div>
					</div>
				)}

				{/* Variant Preview */}
				<div className="space-y-4">
					{testType === "headline" && variant.changes.headline && (
						<div
							className={`text-3xl font-bold ${
								highlightDifferences ? "bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded" : ""
							}`}
						>
							{variant.changes.headline}
						</div>
					)}

					{testType === "cta_button" && variant.changes.ctaText && (
						<Button
							size="lg"
							className={
								highlightDifferences ? "ring-2 ring-yellow-500 ring-offset-2" : ""
							}
						>
							{variant.changes.ctaText}
						</Button>
					)}

					{testType === "image" && variant.changes.image && (
						<div className={highlightDifferences ? "ring-2 ring-yellow-500 rounded" : ""}>
							<img
								src={variant.changes.image}
								alt={`Variant ${variant.name}`}
								className="w-full h-48 object-cover rounded"
							/>
						</div>
					)}

					{variant.changes.description && (
						<p className="text-sm text-muted-foreground">{variant.changes.description}</p>
					)}
				</div>
			</div>
		);
	};

	return (
		<div className="space-y-4">
			{/* Controls */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Variant Comparison</CardTitle>
							<CardDescription>
								Compare up to 3 variants side-by-side
							</CardDescription>
						</div>
						<div className="flex items-center gap-4">
							<div className="flex items-center gap-2">
								<Switch
									id="show-metrics"
									checked={showMetrics}
									onCheckedChange={setShowMetrics}
								/>
								<Label htmlFor="show-metrics" className="text-sm cursor-pointer">
									Show Metrics
								</Label>
							</div>
							<div className="flex items-center gap-2">
								<Switch
									id="highlight-diff"
									checked={highlightDifferences}
									onCheckedChange={setHighlightDifferences}
								/>
								<Label htmlFor="highlight-diff" className="text-sm cursor-pointer">
									Highlight Changes
								</Label>
							</div>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{/* Variant Selector */}
					<div className="flex flex-wrap gap-2">
						{variants.map((variant) => (
							<Button
								key={variant.id}
								variant={selectedVariants.includes(variant.id) ? "default" : "outline"}
								size="sm"
								onClick={() => toggleVariantSelection(variant.id)}
								disabled={
									!selectedVariants.includes(variant.id) && selectedVariants.length >= 3
								}
							>
								{variant.customName || `Variant ${variant.name}`}
								{variant.isControl && " (Control)"}
							</Button>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Comparison Grid */}
			<div className={`grid gap-4 ${
				selectedVariantData.length === 1
					? "grid-cols-1"
					: selectedVariantData.length === 2
						? "grid-cols-2"
						: "grid-cols-3"
			}`}>
				{selectedVariantData.map((variant) => (
					<Card key={variant.id}>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div className="space-y-1">
									<CardTitle className="text-lg">
										{variant.customName || `Variant ${variant.name}`}
									</CardTitle>
									{variant.isControl && (
										<Badge variant="outline" className="text-xs">
											Control
										</Badge>
									)}
								</div>
								{getPerformanceBadge(variant)}
							</div>
						</CardHeader>
						<CardContent>
							{renderVariantPreview(variant)}

							{/* Quick Actions */}
							<div className="flex items-center justify-between mt-4 pt-4 border-t">
								<Button
									variant="ghost"
									size="sm"
									onClick={() => onVariantSelect?.(variant.id)}
								>
									<Eye className="h-4 w-4 mr-2" />
									View Live
								</Button>
								<div className="flex gap-1">
									<Button
										variant="ghost"
										size="icon"
										onClick={() => navigateVariant("prev")}
									>
										<ChevronLeft className="h-4 w-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => navigateVariant("next")}
									>
										<ChevronRight className="h-4 w-4" />
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Comparison Summary */}
			<Card>
				<CardHeader>
					<CardTitle className="text-sm">Performance Summary</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-3 gap-4">
						{selectedVariantData.map((variant) => (
							<div key={variant.id} className="space-y-2">
								<div className="font-medium text-sm">
									{variant.customName || `Variant ${variant.name}`}
								</div>
								<div className="space-y-1 text-xs">
									<div className="flex justify-between">
										<span className="text-muted-foreground">Visitors:</span>
										<span className="font-medium">{variant.visitors.toLocaleString()}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Conversions:</span>
										<span className="font-medium">{variant.conversions.toLocaleString()}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Rate:</span>
										<span className="font-bold text-primary">
											{variant.conversionRate.toFixed(2)}%
										</span>
									</div>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
