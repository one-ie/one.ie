"use client";

import * as React from "react";
import { ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export type BreadcrumbStep = "chat" | "builder" | "preview" | "components" | "deploy";

interface BreadcrumbsProps {
	currentStep: BreadcrumbStep;
	onNavigate?: (step: BreadcrumbStep) => void;
	showDeploy?: boolean;
}

const breadcrumbLabels: Record<BreadcrumbStep, string> = {
	chat: "Chat",
	builder: "Builder",
	preview: "Preview",
	components: "Components",
	deploy: "Deploy",
};

const breadcrumbOrder: BreadcrumbStep[] = ["chat", "builder", "preview", "deploy"];

export function Breadcrumbs({
	currentStep,
	onNavigate,
	showDeploy = false,
}: BreadcrumbsProps) {
	const visibleSteps = showDeploy
		? breadcrumbOrder
		: breadcrumbOrder.filter((step) => step !== "deploy");

	const currentIndex = visibleSteps.indexOf(currentStep);

	return (
		<Breadcrumb className="flex items-center gap-2">
			<BreadcrumbList className="flex items-center gap-1">
				{/* Home Icon */}
				<BreadcrumbItem>
					<Button
						variant="ghost"
						size="sm"
						className="h-8 w-8 p-0"
						onClick={() => onNavigate?.("chat")}
						title="Go to Chat"
					>
						<Home className="h-4 w-4" />
					</Button>
				</BreadcrumbItem>

				<BreadcrumbSeparator className="text-muted-foreground">
					<ChevronRight className="h-4 w-4" />
				</BreadcrumbSeparator>

				{/* Navigation Steps */}
				{visibleSteps.map((step, index) => (
					<React.Fragment key={step}>
						<BreadcrumbItem>
							{index < currentIndex ? (
								// Completed steps are clickable
								<Button
									variant="ghost"
									size="sm"
									className="h-8 px-2 text-xs font-medium text-primary hover:text-primary/80"
									onClick={() => onNavigate?.(step)}
								>
									{breadcrumbLabels[step]}
								</Button>
							) : index === currentIndex ? (
								// Current step is disabled
								<BreadcrumbPage className="text-sm font-semibold text-foreground">
									{breadcrumbLabels[step]}
								</BreadcrumbPage>
							) : (
								// Future steps are disabled
								<span className="text-sm text-muted-foreground opacity-50">
									{breadcrumbLabels[step]}
								</span>
							)}
						</BreadcrumbItem>

						{index < visibleSteps.length - 1 && (
							<BreadcrumbSeparator className="text-muted-foreground">
								<ChevronRight className="h-4 w-4" />
							</BreadcrumbSeparator>
						)}
					</React.Fragment>
				))}
			</BreadcrumbList>

			{/* Progress Indicator */}
			<div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
				<span>
					Step {currentIndex + 1} of {visibleSteps.length}
				</span>
				<div className="h-1.5 w-16 rounded-full bg-secondary overflow-hidden">
					<div
						className="h-full bg-primary transition-all duration-300"
						style={{
							width: `${((currentIndex + 1) / visibleSteps.length) * 100}%`,
						}}
					/>
				</div>
			</div>
		</Breadcrumb>
	);
}
