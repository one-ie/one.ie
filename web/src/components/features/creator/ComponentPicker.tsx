"use client";

/**
 * Component Picker
 *
 * CYCLE 15: Visual component library browser
 *
 * Features:
 * - Grid/list view of all available components
 * - Search by name or description
 * - Filter by category
 * - Click to preview
 * - Drag-and-drop or click to insert
 * - Recently used components
 */

import { useState, useMemo } from "react";
import { useStore } from "@nanostores/react";
import {
	closeComponentPicker,
	isComponentPickerOpen$,
	componentView$,
	componentSearchQuery$,
	selectedCategory$,
	selectedComponent$,
	showComponentPreview$,
	setComponentView,
	setComponentSearchQuery,
	setSelectedCategory,
	selectComponent,
	closeComponentPreview,
	addRecentComponent,
	recentComponents$,
} from "@/stores/componentPicker";
import {
	filterComponents,
	CATEGORY_LABELS,
	getComponentById,
} from "@/lib/componentLibrary";
import type { ComponentCategory, ComponentItem } from "@/stores/componentPicker";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	SearchIcon,
	GridIcon,
	ListIcon,
	XIcon,
	CopyIcon,
	ExternalLinkIcon,
	CheckIcon,
	ClockIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ComponentPicker() {
	const isOpen = useStore(isComponentPickerOpen$);
	const view = useStore(componentView$);
	const searchQuery = useStore(componentSearchQuery$);
	const selectedCategory = useStore(selectedCategory$);
	const recentComponentIds = useStore(recentComponents$);

	// Filter components based on search and category
	const filteredComponents = useMemo(
		() => filterComponents(searchQuery, selectedCategory),
		[searchQuery, selectedCategory]
	);

	// Get recent components
	const recentComponents = useMemo(
		() =>
			recentComponentIds
				.map((id: string) => getComponentById(id))
				.filter(Boolean) as ComponentItem[],
		[recentComponentIds]
	);

	const handleInsertComponent = (component: ComponentItem) => {
		// Add to recent components
		addRecentComponent(component.id);

		// Trigger insert event (parent can listen)
		window.dispatchEvent(
			new CustomEvent("insertComponent", {
				detail: { component },
			})
		);

		// Close picker
		closeComponentPicker();
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && closeComponentPicker()}>
			<DialogContent className="max-w-6xl h-[80vh] p-0 gap-0">
				{/* Header */}
				<DialogHeader className="px-6 pt-6 pb-4">
					<div className="flex items-center justify-between">
						<div>
							<DialogTitle>Component Library</DialogTitle>
							<DialogDescription>
								Browse and insert components into your page
							</DialogDescription>
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant="ghost"
								size="sm"
								onClick={() =>
									setComponentView(view === "grid" ? "list" : "grid")
								}
							>
								{view === "grid" ? (
									<ListIcon className="h-4 w-4" />
								) : (
									<GridIcon className="h-4 w-4" />
								)}
							</Button>
						</div>
					</div>
				</DialogHeader>

				<Separator />

				{/* Search and Filter */}
				<div className="px-6 py-4 space-y-3">
					<div className="relative">
						<SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search components..."
							value={searchQuery}
							onChange={(e) => setComponentSearchQuery(e.target.value)}
							className="pl-9"
						/>
						{searchQuery && (
							<Button
								variant="ghost"
								size="sm"
								className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
								onClick={() => setComponentSearchQuery("")}
							>
								<XIcon className="h-4 w-4" />
							</Button>
						)}
					</div>

					{/* Category Tabs */}
					<Tabs
						value={selectedCategory}
						onValueChange={(value) =>
							setSelectedCategory(value as ComponentCategory)
						}
					>
						<TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
							{Object.entries(CATEGORY_LABELS).map(([key, label]) => (
								<TabsTrigger key={key} value={key} className="whitespace-nowrap">
									{label}
								</TabsTrigger>
							))}
						</TabsList>
					</Tabs>
				</div>

				<Separator />

				{/* Results */}
				<div className="px-6 py-4 flex-1 overflow-hidden">
					<ScrollArea className="h-full">
						{/* Recent Components */}
						{recentComponents.length > 0 && searchQuery === "" && (
							<div className="mb-6">
								<div className="flex items-center gap-2 mb-3">
									<ClockIcon className="h-4 w-4 text-muted-foreground" />
									<h3 className="text-sm font-medium">Recently Used</h3>
								</div>
								<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
									{recentComponents.map((component) => (
										<ComponentCard
											key={component.id}
											component={component}
											view="grid"
											onSelect={selectComponent}
											onInsert={handleInsertComponent}
										/>
									))}
								</div>
								<Separator className="my-6" />
							</div>
						)}

						{/* All Components */}
						<div className="space-y-2">
							<div className="flex items-center justify-between mb-3">
								<p className="text-sm text-muted-foreground">
									{filteredComponents.length} component
									{filteredComponents.length !== 1 ? "s" : ""}
								</p>
							</div>

							{filteredComponents.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-12 text-center">
									<p className="text-muted-foreground">No components found</p>
									<p className="text-sm text-muted-foreground mt-1">
										Try a different search term or category
									</p>
								</div>
							) : (
								<div
									className={cn(
										view === "grid"
											? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
											: "space-y-2"
									)}
								>
									{filteredComponents.map((component) => (
										<ComponentCard
											key={component.id}
											component={component}
											view={view}
											onSelect={selectComponent}
											onInsert={handleInsertComponent}
										/>
									))}
								</div>
							)}
						</div>
					</ScrollArea>
				</div>

				{/* Preview Modal */}
				<ComponentPreview />
			</DialogContent>
		</Dialog>
	);
}

/**
 * Component Card (Grid or List View)
 */
interface ComponentCardProps {
	component: ComponentItem;
	view: "grid" | "list";
	onSelect: (component: ComponentItem) => void;
	onInsert: (component: ComponentItem) => void;
}

function ComponentCard({
	component,
	view,
	onSelect,
	onInsert,
}: ComponentCardProps) {
	const [isDragging, setIsDragging] = useState(false);

	const handleDragStart = (e: React.DragEvent) => {
		setIsDragging(true);
		e.dataTransfer.setData("component", JSON.stringify(component));
		e.dataTransfer.effectAllowed = "copy";
	};

	const handleDragEnd = () => {
		setIsDragging(false);
	};

	if (view === "list") {
		return (
			<div
				draggable
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
				className={cn(
					"flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-move",
					isDragging && "opacity-50"
				)}
			>
				<div className="flex items-center gap-3 flex-1">
					<div className="flex-1">
						<div className="flex items-center gap-2">
							<h4 className="text-sm font-medium">{component.name}</h4>
							<Badge variant="outline" className="text-xs">
								{CATEGORY_LABELS[component.category]}
							</Badge>
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							{component.description}
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => onSelect(component)}
					>
						Preview
					</Button>
					<Button size="sm" onClick={() => onInsert(component)}>
						Insert
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div
			draggable
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
			className={cn(
				"group relative p-4 rounded-lg border bg-card hover:shadow-md transition-all cursor-move",
				isDragging && "opacity-50"
			)}
		>
			{/* Preview Code */}
			{component.previewCode && (
				<div className="mb-3 p-3 rounded-md bg-muted/50 font-mono text-xs overflow-x-auto">
					<code>{component.previewCode}</code>
				</div>
			)}

			<div className="space-y-2">
				<div className="flex items-start justify-between gap-2">
					<h4 className="text-sm font-semibold">{component.name}</h4>
					<Badge variant="outline" className="text-xs shrink-0">
						{CATEGORY_LABELS[component.category]}
					</Badge>
				</div>

				<p className="text-xs text-muted-foreground line-clamp-2">
					{component.description}
				</p>

				{/* Props */}
				{component.props && component.props.length > 0 && (
					<div className="flex flex-wrap gap-1">
						{component.props.slice(0, 3).map((prop) => (
							<Badge key={prop} variant="secondary" className="text-xs">
								{prop}
							</Badge>
						))}
						{component.props.length > 3 && (
							<Badge variant="secondary" className="text-xs">
								+{component.props.length - 3}
							</Badge>
						)}
					</div>
				)}
			</div>

			{/* Actions */}
			<div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
				<Button
					variant="outline"
					size="sm"
					className="flex-1"
					onClick={() => onSelect(component)}
				>
					Preview
				</Button>
				<Button size="sm" className="flex-1" onClick={() => onInsert(component)}>
					Insert
				</Button>
			</div>
		</div>
	);
}

/**
 * Component Preview Modal
 */
function ComponentPreview() {
	const isOpen = useStore(showComponentPreview$);
	const component = useStore(selectedComponent$);
	const [copied, setCopied] = useState(false);

	if (!component) return null;

	const handleCopy = () => {
		if (component.example) {
			navigator.clipboard.writeText(component.example);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && closeComponentPreview()}>
			<DialogContent className="max-w-4xl max-h-[80vh] p-0 gap-0">
				<DialogHeader className="px-6 pt-6 pb-4">
					<div className="flex items-center justify-between">
						<div>
							<DialogTitle>{component.name}</DialogTitle>
							<DialogDescription>{component.description}</DialogDescription>
						</div>
						<Badge variant="outline">{CATEGORY_LABELS[component.category]}</Badge>
					</div>
				</DialogHeader>

				<Separator />

				<ScrollArea className="max-h-[60vh] p-6">
					{/* Preview Code */}
					{component.previewCode && (
						<div className="mb-6">
							<h3 className="text-sm font-medium mb-2">Preview</h3>
							<div className="p-4 rounded-lg border bg-muted/50">
								<code className="text-sm font-mono">{component.previewCode}</code>
							</div>
						</div>
					)}

					{/* Props */}
					{component.props && component.props.length > 0 && (
						<div className="mb-6">
							<h3 className="text-sm font-medium mb-2">Props</h3>
							<div className="flex flex-wrap gap-2">
								{component.props.map((prop) => (
									<Badge key={prop} variant="secondary">
										{prop}
									</Badge>
								))}
							</div>
						</div>
					)}

					{/* Variants */}
					{component.variants && component.variants.length > 0 && (
						<div className="mb-6">
							<h3 className="text-sm font-medium mb-2">Variants</h3>
							<div className="flex flex-wrap gap-2">
								{component.variants.map((variant) => (
									<Badge key={variant}>{variant}</Badge>
								))}
							</div>
						</div>
					)}

					{/* Usage Example */}
					{component.example && (
						<div className="mb-6">
							<div className="flex items-center justify-between mb-2">
								<h3 className="text-sm font-medium">Usage Example</h3>
								<Button
									variant="ghost"
									size="sm"
									onClick={handleCopy}
									className="gap-2"
								>
									{copied ? (
										<>
											<CheckIcon className="h-4 w-4" />
											Copied
										</>
									) : (
										<>
											<CopyIcon className="h-4 w-4" />
											Copy
										</>
									)}
								</Button>
							</div>
							<pre className="p-4 rounded-lg border bg-muted/50 text-xs overflow-x-auto">
								<code>{component.example}</code>
							</pre>
						</div>
					)}

					{/* Documentation Link */}
					<div className="flex justify-between items-center">
						<a
							href={`https://ui.shadcn.com/docs/components/${component.id}`}
							target="_blank"
							rel="noopener noreferrer"
							className="text-sm text-primary hover:underline flex items-center gap-1"
						>
							View documentation
							<ExternalLinkIcon className="h-3 w-3" />
						</a>
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
