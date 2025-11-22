/**
 * Source Selector Component
 * Searchable list of creator content with checkboxes
 * Shows preview of selected content and estimated training time
 */

import { useState, useMemo } from "react";
import { useStore } from "@nanostores/react";
import {
	$wizardData,
	$estimatedContentVolume,
	wizardActions,
	type CloneWizardData,
} from "@/stores/cloneWizard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, FileText, BookOpen, Video, Package, Clock } from "lucide-react";

interface ContentSource {
	id: string;
	title: string;
	type: "blogPost" | "course" | "video" | "product";
	description: string;
	wordCount: number;
	published?: Date;
}

// Mock data - in real app, this would come from API/content collections
const MOCK_SOURCES: ContentSource[] = [
	{
		id: "blog-1",
		type: "blogPost",
		title: "Getting Started with React 19",
		description: "Learn the new features in React 19 including Actions and use",
		wordCount: 850,
		published: new Date("2024-11-01"),
	},
	{
		id: "blog-2",
		type: "blogPost",
		title: "Building AI Clones with RAG",
		description: "Complete guide to building personalized AI assistants",
		wordCount: 1200,
		published: new Date("2024-10-15"),
	},
	{
		id: "course-1",
		type: "course",
		title: "Complete Web Development Bootcamp",
		description: "Full-stack development from zero to hero",
		wordCount: 12000,
		published: new Date("2024-09-01"),
	},
	{
		id: "course-2",
		type: "course",
		title: "AI for Creators",
		description: "How creators can leverage AI to scale their impact",
		wordCount: 8500,
		published: new Date("2024-10-20"),
	},
	{
		id: "video-1",
		type: "video",
		title: "Introduction to TypeScript",
		description: "Quick overview of TypeScript fundamentals",
		wordCount: 1500,
		published: new Date("2024-11-10"),
	},
	{
		id: "video-2",
		type: "video",
		title: "Astro Islands Architecture",
		description: "Understanding partial hydration and island architecture",
		wordCount: 2000,
		published: new Date("2024-11-05"),
	},
	{
		id: "product-1",
		type: "product",
		title: "Premium Course Bundle",
		description: "All-access pass to premium content library",
		wordCount: 300,
	},
	{
		id: "product-2",
		type: "product",
		title: "1-on-1 Coaching Session",
		description: "Personalized mentoring for your specific goals",
		wordCount: 250,
	},
];

const TYPE_CONFIG = {
	blogPost: {
		label: "Blog Posts",
		icon: FileText,
		color: "bg-blue-100 text-blue-800",
	},
	course: {
		label: "Courses",
		icon: BookOpen,
		color: "bg-green-100 text-green-800",
	},
	video: {
		label: "Videos",
		icon: Video,
		color: "bg-purple-100 text-purple-800",
	},
	product: {
		label: "Products",
		icon: Package,
		color: "bg-orange-100 text-orange-800",
	},
};

interface SourceSelectorProps {
	sources?: ContentSource[];
}

export function SourceSelector({ sources = MOCK_SOURCES }: SourceSelectorProps) {
	const wizardData = useStore($wizardData);
	const contentVolume = useStore($estimatedContentVolume);
	const [searchQuery, setSearchQuery] = useState("");
	const [filterType, setFilterType] = useState<ContentSource["type"] | "all">(
		"all",
	);

	// Filter sources based on search and type
	const filteredSources = useMemo(() => {
		return sources.filter((source) => {
			const matchesSearch =
				searchQuery === "" ||
				source.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				source.description.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesType = filterType === "all" || source.type === filterType;

			return matchesSearch && matchesType;
		});
	}, [sources, searchQuery, filterType]);

	// Count selected sources by type
	const selectedCounts = useMemo(() => {
		const counts = {
			blogPosts: wizardData.selectedSources.blogPosts.length,
			courses: wizardData.selectedSources.courses.length,
			videos: wizardData.selectedSources.videos.length,
			products: wizardData.selectedSources.products.length,
		};
		const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
		return { ...counts, total };
	}, [wizardData.selectedSources]);

	const isSelected = (source: ContentSource): boolean => {
		const typeMap: Record<
			ContentSource["type"],
			keyof CloneWizardData["selectedSources"]
		> = {
			blogPost: "blogPosts",
			course: "courses",
			video: "videos",
			product: "products",
		};
		const sourceType = typeMap[source.type];
		return wizardData.selectedSources[sourceType].includes(source.id);
	};

	const toggleSource = (source: ContentSource) => {
		const typeMap: Record<
			ContentSource["type"],
			keyof CloneWizardData["selectedSources"]
		> = {
			blogPost: "blogPosts",
			course: "courses",
			video: "videos",
			product: "products",
		};
		const sourceType = typeMap[source.type];

		if (isSelected(source)) {
			wizardActions.removeSource(sourceType, source.id);
		} else {
			wizardActions.addSource(sourceType, source.id);
		}
	};

	return (
		<div className="space-y-6">
			{/* Summary Card */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Selected Training Content</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<div className="text-center">
							<div className="text-3xl font-bold text-blue-600">
								{selectedCounts.blogPosts}
							</div>
							<div className="text-sm text-muted-foreground">Blog Posts</div>
						</div>
						<div className="text-center">
							<div className="text-3xl font-bold text-green-600">
								{selectedCounts.courses}
							</div>
							<div className="text-sm text-muted-foreground">Courses</div>
						</div>
						<div className="text-center">
							<div className="text-3xl font-bold text-purple-600">
								{selectedCounts.videos}
							</div>
							<div className="text-sm text-muted-foreground">Videos</div>
						</div>
						<div className="text-center">
							<div className="text-3xl font-bold text-orange-600">
								{selectedCounts.products}
							</div>
							<div className="text-sm text-muted-foreground">Products</div>
						</div>
					</div>

					<Separator className="my-4" />

					<div className="flex items-center justify-between text-sm">
						<div className="flex items-center gap-2">
							<Clock className="h-4 w-4 text-muted-foreground" />
							<span className="text-muted-foreground">
								Estimated training time:
							</span>
							<span className="font-medium">
								~{contentVolume.estimatedMinutes} minutes
							</span>
						</div>
						<div>
							<span className="text-muted-foreground">Total words:</span>
							<span className="font-medium ml-2">
								{contentVolume.words.toLocaleString()}
							</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Search and Filters */}
			<div className="flex flex-col md:flex-row gap-4">
				<div className="flex-1 relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search your content..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10"
					/>
				</div>
				<div className="flex gap-2">
					<Button
						variant={filterType === "all" ? "default" : "outline"}
						size="sm"
						onClick={() => setFilterType("all")}
					>
						All ({sources.length})
					</Button>
					{Object.entries(TYPE_CONFIG).map(([type, config]) => (
						<Button
							key={type}
							variant={filterType === type ? "default" : "outline"}
							size="sm"
							onClick={() =>
								setFilterType(type as ContentSource["type"])
							}
						>
							<config.icon className="h-4 w-4 mr-1" />
							{config.label}
						</Button>
					))}
				</div>
			</div>

			{/* Source List */}
			<div className="space-y-3">
				{filteredSources.length === 0 ? (
					<Card>
						<CardContent className="py-8 text-center text-muted-foreground">
							No content found matching your search.
						</CardContent>
					</Card>
				) : (
					filteredSources.map((source) => {
						const config = TYPE_CONFIG[source.type];
						const Icon = config.icon;
						const selected = isSelected(source);

						return (
							<Card
								key={source.id}
								className={`cursor-pointer transition-all ${
									selected
										? "ring-2 ring-primary bg-primary/5"
										: "hover:shadow-md"
								}`}
								onClick={() => toggleSource(source)}
							>
								<CardContent className="p-4">
									<div className="flex items-start gap-4">
										<Checkbox
											checked={selected}
											onCheckedChange={() => toggleSource(source)}
											onClick={(e) => e.stopPropagation()}
										/>
										<Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
										<div className="flex-1 min-w-0">
											<div className="flex items-start justify-between gap-2">
												<h3 className="font-medium">{source.title}</h3>
												<Badge className={config.color}>
													{config.label}
												</Badge>
											</div>
											<p className="text-sm text-muted-foreground mt-1">
												{source.description}
											</p>
											<div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
												<span>
													{source.wordCount.toLocaleString()} words
												</span>
												{source.published && (
													<span>
														Published{" "}
														{source.published.toLocaleDateString()}
													</span>
												)}
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						);
					})
				)}
			</div>

			{/* Helper Text */}
			{selectedCounts.total === 0 && (
				<div className="text-center text-sm text-muted-foreground">
					Select at least one piece of content to train your AI clone
				</div>
			)}
		</div>
	);
}

// Import Button component (was missing)
import { Button } from "@/components/ui/button";
