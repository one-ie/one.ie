/**
 * FormProgressBar - Multi-Step Form Progress Indicator (Cycle 68)
 *
 * Shows progress through multi-step forms with:
 * - Visual progress bar
 * - Step numbers and labels
 * - Clickable navigation (for completed steps)
 * - Validation state indicators
 *
 * Usage:
 * ```tsx
 * <FormProgressBar
 *   steps={['Personal Info', 'Address', 'Payment']}
 *   currentStep={0}
 *   completedSteps={[]}
 *   onStepClick={(step) => goToStep(step)}
 * />
 * ```
 */

import { Progress } from "@/components/ui/progress";
import { Check, Circle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FormProgressBarProps {
	/** Step labels */
	steps: string[];
	/** Current active step (0-indexed) */
	currentStep: number;
	/** Array of completed step indices */
	completedSteps: number[];
	/** Array of step indices with validation errors */
	errorSteps?: number[];
	/** Callback when a step is clicked */
	onStepClick?: (stepIndex: number) => void;
	/** Whether to allow clicking on steps */
	clickable?: boolean;
	/** Variant: 'horizontal' or 'vertical' */
	variant?: "horizontal" | "vertical";
}

export function FormProgressBar({
	steps,
	currentStep,
	completedSteps,
	errorSteps = [],
	onStepClick,
	clickable = true,
	variant = "horizontal",
}: FormProgressBarProps) {
	const progressPercentage = ((currentStep + 1) / steps.length) * 100;

	// Determine if a step is clickable
	const isStepClickable = (stepIndex: number): boolean => {
		if (!clickable || !onStepClick) return false;
		// Can only click on current step or completed steps
		return stepIndex <= currentStep || completedSteps.includes(stepIndex);
	};

	// Get step state
	const getStepState = (
		stepIndex: number,
	): "completed" | "current" | "error" | "pending" => {
		if (completedSteps.includes(stepIndex)) return "completed";
		if (errorSteps.includes(stepIndex)) return "error";
		if (stepIndex === currentStep) return "current";
		return "pending";
	};

	// Render step icon
	const renderStepIcon = (stepIndex: number) => {
		const state = getStepState(stepIndex);

		if (state === "completed") {
			return (
				<div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white">
					<Check className="w-5 h-5" />
				</div>
			);
		}

		if (state === "error") {
			return (
				<div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white">
					<AlertCircle className="w-5 h-5" />
				</div>
			);
		}

		if (state === "current") {
			return (
				<div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold">
					{stepIndex + 1}
				</div>
			);
		}

		return (
			<div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground">
				<Circle className="w-5 h-5" />
			</div>
		);
	};

	if (variant === "vertical") {
		return (
			<div className="space-y-4">
				{/* Progress text */}
				<div className="text-sm font-medium text-muted-foreground">
					Step {currentStep + 1} of {steps.length}
				</div>

				{/* Vertical steps */}
				<div className="space-y-2">
					{steps.map((step, index) => {
						const state = getStepState(index);
						const clickable = isStepClickable(index);

						return (
							<button
								key={index}
								type="button"
								onClick={() => clickable && onStepClick?.(index)}
								disabled={!clickable}
								className={cn(
									"w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
									state === "current" &&
										"border-primary bg-primary/5 shadow-sm",
									state === "completed" && "border-green-200 bg-green-50",
									state === "error" && "border-red-200 bg-red-50",
									state === "pending" && "border-muted bg-background",
									clickable && "cursor-pointer hover:bg-accent",
									!clickable && "cursor-not-allowed opacity-60",
								)}
							>
								{renderStepIcon(index)}
								<div className="flex-1">
									<div
										className={cn(
											"font-medium",
											state === "current" && "text-foreground",
											state === "completed" && "text-green-900",
											state === "error" && "text-red-900",
											state === "pending" && "text-muted-foreground",
										)}
									>
										{step}
									</div>
									{state === "current" && (
										<div className="text-xs text-muted-foreground mt-0.5">
											In progress
										</div>
									)}
									{state === "completed" && (
										<div className="text-xs text-green-700 mt-0.5">
											Completed
										</div>
									)}
									{state === "error" && (
										<div className="text-xs text-red-700 mt-0.5">
											Has errors
										</div>
									)}
								</div>
							</button>
						);
					})}
				</div>
			</div>
		);
	}

	// Horizontal variant
	return (
		<div className="space-y-4">
			{/* Progress bar */}
			<div className="space-y-2">
				<div className="flex justify-between text-sm">
					<span className="font-medium">
						Step {currentStep + 1} of {steps.length}
					</span>
					<span className="text-muted-foreground">
						{Math.round(progressPercentage)}% Complete
					</span>
				</div>
				<Progress value={progressPercentage} className="h-2" />
			</div>

			{/* Step indicators */}
			<div className="flex items-center justify-between">
				{steps.map((step, index) => {
					const state = getStepState(index);
					const clickable = isStepClickable(index);
					const isLast = index === steps.length - 1;

					return (
						<div key={index} className="flex items-center flex-1">
							{/* Step button */}
							<button
								type="button"
								onClick={() => clickable && onStepClick?.(index)}
								disabled={!clickable}
								className={cn(
									"flex flex-col items-center gap-2 transition-all",
									clickable && "cursor-pointer hover:scale-105",
									!clickable && "cursor-not-allowed",
								)}
							>
								{renderStepIcon(index)}
								<span
									className={cn(
										"text-xs font-medium text-center max-w-[100px]",
										state === "current" && "text-foreground",
										state === "completed" && "text-green-700",
										state === "error" && "text-red-700",
										state === "pending" && "text-muted-foreground",
									)}
								>
									{step}
								</span>
							</button>

							{/* Connector line */}
							{!isLast && (
								<div
									className={cn(
										"h-0.5 flex-1 mx-2 transition-all",
										completedSteps.includes(index) && "bg-green-600",
										index < currentStep && "bg-primary",
										index >= currentStep && "bg-muted",
									)}
								/>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
