/**
 * Template Preview Modal Component
 *
 * Displays detailed preview of funnel templates before using them.
 * Shows all steps, benchmarks, elements, and best practices.
 *
 * Usage:
 * <TemplatePreviewModal
 *   template={template}
 *   open={open}
 *   onOpenChange={setOpen}
 *   onUseTemplate={() => handleUseTemplate(template.id)}
 * />
 */

"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	CheckCircle2,
	Clock,
	TrendingUp,
	Layers,
	ExternalLink,
	Sparkles,
	ChevronRight,
	Target,
	Zap,
	Award,
} from "lucide-react";
import type { FunnelTemplate, TemplateStep } from "@/lib/funnel-templates/templates";

interface TemplatePreviewModalProps {
	template: FunnelTemplate;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onUseTemplate?: () => void;
	previewUrl?: string; // Optional live preview URL
}

export function TemplatePreviewModal({
	template,
	open,
	onOpenChange,
	onUseTemplate,
	previewUrl,
}: TemplatePreviewModalProps) {
	const [selectedStep, setSelectedStep] = useState(0);

	const complexityColors = {
		simple: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
		medium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
		advanced:
			"bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
	};

	const categoryColors = {
		"lead-gen": "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
		"product-launch":
			"bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
		webinar: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
		ecommerce:
			"bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
		membership:
			"bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200",
		summit: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<div className="flex items-start justify-between gap-4">
						<div className="flex-1">
							<DialogTitle className="text-3xl font-bold mb-2">
								{template.name}
							</DialogTitle>
							<p className="text-base text-muted-foreground">
								{template.description}
							</p>
						</div>
						<div className="flex flex-col gap-2">
							<Badge
								className={
									categoryColors[template.category as keyof typeof categoryColors]
								}
							>
								{template.category}
							</Badge>
							<Badge
								className={
									complexityColors[
										template.complexity as keyof typeof complexityColors
									]
								}
							>
								{template.complexity}
							</Badge>
						</div>
					</div>
				</DialogHeader>

				{/* Key Metrics */}
				<div className="grid grid-cols-3 gap-4 py-4">
					<div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
						<div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
							<TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
						</div>
						<div>
							<div className="text-2xl font-bold">{template.conversionRate}%</div>
							<div className="text-xs text-muted-foreground">
								Avg. Conversion
							</div>
						</div>
					</div>

					<div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
						<div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
							<Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
						</div>
						<div>
							<div className="text-2xl font-bold">
								{template.estimatedSetupTime}
							</div>
							<div className="text-xs text-muted-foreground">Setup Time</div>
						</div>
					</div>

					<div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
						<div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900">
							<Layers className="h-5 w-5 text-purple-600 dark:text-purple-400" />
						</div>
						<div>
							<div className="text-2xl font-bold">{template.steps.length}</div>
							<div className="text-xs text-muted-foreground">
								Funnel Steps
							</div>
						</div>
					</div>
				</div>

				{/* Suggested Use Cases */}
				<div className="space-y-3">
					<div className="flex items-center gap-2">
						<Target className="h-4 w-4 text-muted-foreground" />
						<h3 className="font-semibold">Suggested For:</h3>
					</div>
					<div className="grid grid-cols-2 gap-2">
						{template.suggestedFor.map((useCase, index) => (
							<div
								key={index}
								className="flex items-start gap-2 text-sm p-2 rounded-md bg-muted/50"
							>
								<CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
								<span>{useCase}</span>
							</div>
						))}
					</div>
				</div>

				<Separator />

				{/* Step Preview Tabs */}
				<div className="space-y-4">
					<div className="flex items-center gap-2">
						<Sparkles className="h-4 w-4 text-muted-foreground" />
						<h3 className="font-semibold">Template Steps</h3>
					</div>

					<Tabs
						value={selectedStep.toString()}
						onValueChange={(val) => setSelectedStep(parseInt(val))}
					>
						<TabsList className="w-full grid grid-cols-auto-fit gap-2">
							{template.steps.map((step, index) => (
								<TabsTrigger
									key={step.id}
									value={index.toString()}
									className="flex items-center gap-2"
								>
									<span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-xs font-bold">
										{index + 1}
									</span>
									<span className="truncate">{step.name}</span>
								</TabsTrigger>
							))}
						</TabsList>

						{template.steps.map((step, index) => (
							<TabsContent key={step.id} value={index.toString()}>
								<StepPreview step={step} stepNumber={index + 1} />
							</TabsContent>
						))}
					</Tabs>
				</div>

				<Separator />

				{/* Tags */}
				{template.tags && template.tags.length > 0 && (
					<div className="space-y-3">
						<div className="flex items-center gap-2">
							<Award className="h-4 w-4 text-muted-foreground" />
							<h3 className="font-semibold">Features:</h3>
						</div>
						<div className="flex flex-wrap gap-2">
							{template.tags.map((tag) => (
								<Badge key={tag} variant="outline">
									{tag}
								</Badge>
							))}
						</div>
					</div>
				)}

				{/* Action Buttons */}
				<div className="flex gap-3 pt-4">
					<Button
						onClick={onUseTemplate}
						className="flex-1"
						size="lg"
						disabled={!onUseTemplate}
					>
						<Zap className="mr-2 h-4 w-4" />
						Use This Template
					</Button>

					{previewUrl && (
						<Button
							variant="outline"
							size="lg"
							onClick={() => window.open(previewUrl, "_blank")}
						>
							<ExternalLink className="mr-2 h-4 w-4" />
							Preview Live
						</Button>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

/**
 * Individual Step Preview Component
 */
interface StepPreviewProps {
	step: TemplateStep;
	stepNumber: number;
}

function StepPreview({ step }: StepPreviewProps) {
	const stepTypeIcons = {
		landing: "🎯",
		"opt-in": "📧",
		"thank-you": "✅",
		sales: "💰",
		upsell: "⬆️",
		checkout: "🛒",
		confirmation: "🎉",
		webinar: "🎥",
		replay: "▶️",
		onboarding: "🚀",
	};

	return (
		<div className="space-y-4 p-4 border rounded-lg bg-card">
			{/* Step Header */}
			<div className="space-y-2">
				<div className="flex items-center gap-3">
					<span className="text-3xl">
						{stepTypeIcons[step.type as keyof typeof stepTypeIcons] || "📄"}
					</span>
					<div className="flex-1">
						<h4 className="text-xl font-bold">{step.name}</h4>
						<p className="text-sm text-muted-foreground">{step.description}</p>
					</div>
					<Badge variant="secondary">{step.type}</Badge>
				</div>
			</div>

			{/* Color Scheme Preview */}
			{step.colorScheme && (
				<div className="space-y-2">
					<h5 className="text-sm font-medium text-muted-foreground">
						Color Scheme
					</h5>
					<div className="flex gap-2">
						{Object.entries(step.colorScheme).map(([name, color]) => (
							<div key={name} className="flex flex-col items-center gap-1">
								<div
									className="w-12 h-12 rounded-md border shadow-sm"
									style={{ backgroundColor: color }}
								/>
								<span className="text-xs text-muted-foreground capitalize">
									{name}
								</span>
							</div>
						))}
					</div>
				</div>
			)}

			<Separator />

			{/* Page Elements */}
			<div className="space-y-3">
				<h5 className="text-sm font-semibold flex items-center gap-2">
					<Layers className="h-4 w-4" />
					Included Elements ({step.elements.length})
				</h5>
				<div className="space-y-2">
					{step.elements.map((element, index) => (
						<div
							key={index}
							className="flex items-start gap-3 p-3 rounded-md bg-muted/50 border"
						>
							<div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-xs font-bold flex-shrink-0 mt-0.5">
								{element.position}
							</div>
							<div className="flex-1 space-y-1">
								<div className="flex items-center gap-2">
									<Badge variant="outline" className="text-xs">
										{element.type}
									</Badge>
								</div>
								{element.content && (
									<p className="text-sm whitespace-pre-line">{element.content}</p>
								)}
								{element.placeholder && (
									<p className="text-xs text-muted-foreground italic">
										{element.placeholder}
									</p>
								)}
								{element.notes && (
									<p className="text-xs text-blue-600 dark:text-blue-400">
										💡 {element.notes}
									</p>
								)}
							</div>
						</div>
					))}
				</div>
			</div>

			<Separator />

			{/* Best Practices */}
			<div className="space-y-3">
				<h5 className="text-sm font-semibold flex items-center gap-2">
					<CheckCircle2 className="h-4 w-4" />
					Best Practices ({step.bestPractices.length})
				</h5>
				<ul className="space-y-2">
					{step.bestPractices.map((practice, index) => (
						<li
							key={index}
							className="flex items-start gap-2 text-sm p-2 rounded-md bg-green-50 dark:bg-green-900/20"
						>
							<ChevronRight className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
							<span>{practice}</span>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
