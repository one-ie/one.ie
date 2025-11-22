/**
 * A/B Test Templates Component
 *
 * Pre-configured test templates for common optimization scenarios:
 * - Headline variations
 * - CTA button optimization
 * - Pricing page tests
 * - Hero image tests
 * - Form optimization
 * - Email subject lines
 *
 * Part of Cycle 95: A/B Test UI Polish
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	FileText,
	MousePointer,
	DollarSign,
	Image as ImageIcon,
	List,
	Mail,
	Search,
	Sparkles,
} from "lucide-react";

interface TestTemplate {
	id: string;
	name: string;
	category: string;
	icon: any;
	description: string;
	variants: Array<{
		name: string;
		changes: Record<string, string>;
	}>;
	successMetric: string;
	duration: number;
	minimumSampleSize: number;
	tags: string[];
}

const TEST_TEMPLATES: TestTemplate[] = [
	{
		id: "headline-power-words",
		name: "Headline Power Words",
		category: "Headline",
		icon: FileText,
		description: "Test headlines with emotional power words vs. straightforward copy",
		variants: [
			{
				name: "A (Control)",
				changes: {
					headline: "Learn How to Build Better Websites",
				},
			},
			{
				name: "B (Power Words)",
				changes: {
					headline: "Discover the Secrets to Building Incredible Websites",
				},
			},
		],
		successMetric: "conversion_rate",
		duration: 14,
		minimumSampleSize: 300,
		tags: ["copywriting", "emotional", "proven"],
	},
	{
		id: "cta-urgency",
		name: "CTA with Urgency",
		category: "CTA Button",
		icon: MousePointer,
		description: "Test CTA buttons with and without urgency/scarcity messaging",
		variants: [
			{
				name: "A (Control)",
				changes: {
					ctaText: "Get Started",
				},
			},
			{
				name: "B (Urgency)",
				changes: {
					ctaText: "Start Free Trial - Limited Time",
				},
			},
			{
				name: "C (FOMO)",
				changes: {
					ctaText: "Join 10,000+ Users Today",
				},
			},
		],
		successMetric: "click_through_rate",
		duration: 7,
		minimumSampleSize: 200,
		tags: ["urgency", "fomo", "conversion"],
	},
	{
		id: "pricing-anchor",
		name: "Price Anchoring",
		category: "Pricing",
		icon: DollarSign,
		description: "Test different pricing displays (monthly vs. annual savings)",
		variants: [
			{
				name: "A (Monthly)",
				changes: {
					headline: "$99/month",
					description: "Billed monthly",
				},
			},
			{
				name: "B (Annual Savings)",
				changes: {
					headline: "$79/month",
					description: "Save $240/year with annual billing",
				},
			},
		],
		successMetric: "conversion_rate",
		duration: 14,
		minimumSampleSize: 500,
		tags: ["pricing", "savings", "saas"],
	},
	{
		id: "hero-image-people",
		name: "Hero Image - People vs. Product",
		category: "Image",
		icon: ImageIcon,
		description: "Test hero images with people vs. product-only shots",
		variants: [
			{
				name: "A (Product)",
				changes: {
					image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
					description: "Product-focused imagery",
				},
			},
			{
				name: "B (People)",
				changes: {
					image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
					description: "People using product",
				},
			},
		],
		successMetric: "conversion_rate",
		duration: 14,
		minimumSampleSize: 400,
		tags: ["imagery", "emotional", "social"],
	},
	{
		id: "form-length",
		name: "Form Length Optimization",
		category: "Form",
		icon: List,
		description: "Test short form (email only) vs. longer qualification form",
		variants: [
			{
				name: "A (Short)",
				changes: {
					description: "Email only - 1 field",
				},
			},
			{
				name: "B (Medium)",
				changes: {
					description: "Email + Name - 2 fields",
				},
			},
			{
				name: "C (Long)",
				changes: {
					description: "Email + Name + Company - 3 fields",
				},
			},
		],
		successMetric: "form_completion",
		duration: 7,
		minimumSampleSize: 300,
		tags: ["forms", "lead-gen", "friction"],
	},
	{
		id: "email-subject-personalization",
		name: "Email Subject Personalization",
		category: "Email",
		icon: Mail,
		description: "Test personalized vs. generic email subject lines",
		variants: [
			{
				name: "A (Generic)",
				changes: {
					headline: "Weekly Newsletter - Tips & Updates",
				},
			},
			{
				name: "B (Personalized)",
				changes: {
					headline: "[Name], Your Personalized Tips Inside",
				},
			},
		],
		successMetric: "click_through_rate",
		duration: 7,
		minimumSampleSize: 1000,
		tags: ["email", "personalization", "engagement"],
	},
];

interface ABTestTemplatesProps {
	onSelectTemplate?: (template: TestTemplate) => void;
}

export function ABTestTemplates({ onSelectTemplate }: ABTestTemplatesProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

	const categories = Array.from(new Set(TEST_TEMPLATES.map((t) => t.category)));

	const filteredTemplates = TEST_TEMPLATES.filter((template) => {
		const matchesSearch =
			searchQuery === "" ||
			template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
			template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

		const matchesCategory = !selectedCategory || template.category === selectedCategory;

		return matchesSearch && matchesCategory;
	});

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h2 className="text-2xl font-bold flex items-center gap-2">
					<Sparkles className="h-6 w-6 text-yellow-500" />
					A/B Test Templates
				</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Start with proven test templates or create your own from scratch
				</p>
			</div>

			{/* Search & Filters */}
			<div className="flex gap-4">
				<div className="flex-1 relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search templates..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10"
					/>
				</div>
				<div className="flex gap-2">
					<Button
						variant={selectedCategory === null ? "default" : "outline"}
						size="sm"
						onClick={() => setSelectedCategory(null)}
					>
						All
					</Button>
					{categories.map((category) => (
						<Button
							key={category}
							variant={selectedCategory === category ? "default" : "outline"}
							size="sm"
							onClick={() => setSelectedCategory(category)}
						>
							{category}
						</Button>
					))}
				</div>
			</div>

			{/* Template Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{filteredTemplates.map((template) => {
					const Icon = template.icon;
					return (
						<Dialog key={template.id}>
							<DialogTrigger asChild>
								<Card className="cursor-pointer hover:shadow-lg transition-shadow">
									<CardHeader>
										<div className="flex items-start justify-between">
											<div className="flex items-center gap-2">
												<div className="p-2 rounded-lg bg-primary/10">
													<Icon className="h-5 w-5 text-primary" />
												</div>
												<div>
													<CardTitle className="text-base">{template.name}</CardTitle>
													<Badge variant="outline" className="mt-1 text-xs">
														{template.category}
													</Badge>
												</div>
											</div>
										</div>
									</CardHeader>
									<CardContent>
										<CardDescription className="text-sm line-clamp-2">
											{template.description}
										</CardDescription>
										<div className="flex flex-wrap gap-1 mt-3">
											{template.tags.slice(0, 3).map((tag) => (
												<Badge key={tag} variant="secondary" className="text-xs">
													{tag}
												</Badge>
											))}
										</div>
										<div className="grid grid-cols-2 gap-2 mt-4 text-xs text-muted-foreground">
											<div>
												<span className="font-medium">{template.variants.length}</span> variants
											</div>
											<div>
												<span className="font-medium">{template.duration}</span> days
											</div>
										</div>
									</CardContent>
								</Card>
							</DialogTrigger>
							<DialogContent className="max-w-2xl">
								<DialogHeader>
									<div className="flex items-center gap-2">
										<div className="p-2 rounded-lg bg-primary/10">
											<Icon className="h-5 w-5 text-primary" />
										</div>
										<div>
											<DialogTitle>{template.name}</DialogTitle>
											<DialogDescription>{template.description}</DialogDescription>
										</div>
									</div>
								</DialogHeader>

								<div className="space-y-4">
									{/* Template Details */}
									<div className="grid grid-cols-2 gap-4">
										<div>
											<div className="text-sm font-medium">Success Metric</div>
											<div className="text-sm text-muted-foreground capitalize">
												{template.successMetric.replace(/_/g, " ")}
											</div>
										</div>
										<div>
											<div className="text-sm font-medium">Recommended Duration</div>
											<div className="text-sm text-muted-foreground">
												{template.duration} days
											</div>
										</div>
										<div>
											<div className="text-sm font-medium">Min Sample Size</div>
											<div className="text-sm text-muted-foreground">
												{template.minimumSampleSize.toLocaleString()} visitors
											</div>
										</div>
										<div>
											<div className="text-sm font-medium">Variants</div>
											<div className="text-sm text-muted-foreground">
												{template.variants.length} variations
											</div>
										</div>
									</div>

									{/* Variant Preview */}
									<div>
										<div className="text-sm font-medium mb-2">Variant Examples</div>
										<div className="space-y-2">
											{template.variants.map((variant, index) => (
												<div key={index} className="border rounded-lg p-3 bg-muted/30">
													<div className="font-medium text-sm mb-1">{variant.name}</div>
													{Object.entries(variant.changes).map(([key, value]) => (
														<div key={key} className="text-sm">
															<span className="text-muted-foreground capitalize">
																{key.replace(/([A-Z])/g, " $1").trim()}:
															</span>{" "}
															<span className="font-medium">{value}</span>
														</div>
													))}
												</div>
											))}
										</div>
									</div>

									{/* Tags */}
									<div>
										<div className="text-sm font-medium mb-2">Tags</div>
										<div className="flex flex-wrap gap-1">
											{template.tags.map((tag) => (
												<Badge key={tag} variant="secondary">
													{tag}
												</Badge>
											))}
										</div>
									</div>

									{/* Actions */}
									<div className="flex gap-2 pt-4 border-t">
										<Button
											className="flex-1"
											onClick={() => onSelectTemplate?.(template)}
										>
											Use This Template
										</Button>
										<Button variant="outline">Preview</Button>
									</div>
								</div>
							</DialogContent>
						</Dialog>
					);
				})}
			</div>

			{/* Empty State */}
			{filteredTemplates.length === 0 && (
				<div className="text-center py-12 border rounded-lg bg-muted/30">
					<Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
					<p className="text-lg font-medium mb-2">No templates found</p>
					<p className="text-sm text-muted-foreground">
						Try adjusting your search or filters
					</p>
				</div>
			)}
		</div>
	);
}
