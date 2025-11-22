/**
 * MultiStepForm - Multi-Step Form Component (Cycle 68)
 *
 * Complete multi-step form system with:
 * - Progress tracking and visualization
 * - Step-by-step validation
 * - Partial submission save
 * - Resume later via email
 * - Navigation between steps
 * - Error state management
 *
 * Usage:
 * ```tsx
 * <MultiStepForm
 *   formId="user-registration"
 *   steps={[
 *     { id: 'personal', label: 'Personal Info', fields: ['name', 'email'] },
 *     { id: 'address', label: 'Address', fields: ['street', 'city'] },
 *     { id: 'payment', label: 'Payment', fields: ['card'] }
 *   ]}
 *   onStepSubmit={(stepId, data) => console.log('Step submitted', stepId, data)}
 *   onComplete={(data) => console.log('Form complete!', data)}
 * />
 * ```
 */

import { useState, useEffect, type ReactNode } from "react";
import { useStore } from "@nanostores/react";
import { createMultiStepFormStore } from "@/stores/multiStepForm";
import { FormProgressBar } from "./FormProgressBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	AlertCircle,
	ChevronLeft,
	ChevronRight,
	Check,
	Mail,
	Save,
	Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface FormStep {
	/** Unique step identifier */
	id: string;
	/** Step display label */
	label: string;
	/** Optional description */
	description?: string;
	/** Field names in this step */
	fields: string[];
	/** Optional validation function */
	validate?: (data: Record<string, any>) => Promise<string[]> | string[];
}

export interface MultiStepFormProps {
	/** Unique form identifier (for localStorage persistence) */
	formId: string;
	/** Form title */
	title?: string;
	/** Form description */
	description?: string;
	/** Array of form steps */
	steps: FormStep[];
	/** Render function for step content */
	renderStep: (
		step: FormStep,
		stepIndex: number,
		data: Record<string, any>,
		updateData: (data: Record<string, any>) => void,
	) => ReactNode;
	/** Callback when a step is submitted */
	onStepSubmit?: (
		stepId: string,
		stepData: Record<string, any>,
	) => Promise<void> | void;
	/** Callback when entire form is completed */
	onComplete: (data: Record<string, any>) => Promise<void> | void;
	/** Whether to show save & resume later button */
	showSaveButton?: boolean;
	/** Progress bar variant */
	progressVariant?: "horizontal" | "vertical";
	/** Custom CSS class */
	className?: string;
}

export function MultiStepForm({
	formId,
	title,
	description,
	steps,
	renderStep,
	onStepSubmit,
	onComplete,
	showSaveButton = true,
	progressVariant = "horizontal",
	className,
}: MultiStepFormProps) {
	// Create store instance for this form
	const [store] = useState(() =>
		createMultiStepFormStore(formId, steps.length),
	);

	// Subscribe to store
	const formData = useStore(store.$formData);
	const progress = useStore(store.$progress);
	const isComplete = useStore(store.$isComplete);
	const hasProgress = useStore(store.$hasProgress);

	// Local state
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showResumeDialog, setShowResumeDialog] = useState(false);
	const [resumeEmail, setResumeEmail] = useState("");
	const [isSendingResume, setIsSendingResume] = useState(false);

	// Get current step
	const currentStep = steps[formData.currentStep];
	const isFirstStep = formData.currentStep === 0;
	const isLastStep = formData.currentStep === steps.length - 1;

	// Update data for current step
	const updateStepData = (data: Record<string, any>) => {
		store.actions.updateStepData(formData.currentStep, data);
	};

	// Validate current step
	const validateCurrentStep = async (): Promise<boolean> => {
		if (!currentStep.validate) return true;

		try {
			const errors = await currentStep.validate(formData.data);

			if (errors.length > 0) {
				store.actions.setStepError(formData.currentStep, true);
				toast.error(errors[0]);
				return false;
			}

			store.actions.setStepError(formData.currentStep, false);
			return true;
		} catch (error) {
			console.error("Validation error:", error);
			store.actions.setStepError(formData.currentStep, true);
			toast.error("Validation failed");
			return false;
		}
	};

	// Handle next button
	const handleNext = async () => {
		// Validate current step
		const isValid = await validateCurrentStep();
		if (!isValid) return;

		// Call step submit callback
		if (onStepSubmit) {
			try {
				setIsSubmitting(true);
				await onStepSubmit(currentStep.id, formData.data);
			} catch (error) {
				console.error("Step submit error:", error);
				toast.error("Failed to save step");
				return;
			} finally {
				setIsSubmitting(false);
			}
		}

		// Move to next step
		store.actions.nextStep();
	};

	// Handle previous button
	const handlePrevious = () => {
		store.actions.previousStep();
	};

	// Handle complete button
	const handleComplete = async () => {
		// Validate final step
		const isValid = await validateCurrentStep();
		if (!isValid) return;

		try {
			setIsSubmitting(true);

			// Call completion callback
			await onComplete(formData.data);

			// Show success message
			toast.success("Form submitted successfully!");

			// Reset form
			store.actions.resetForm();
		} catch (error) {
			console.error("Form completion error:", error);
			toast.error("Failed to submit form");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Handle save & resume later
	const handleSaveResume = () => {
		setShowResumeDialog(true);
	};

	// Send resume link
	const handleSendResumeLink = async () => {
		if (!resumeEmail) {
			toast.error("Please enter your email address");
			return;
		}

		try {
			setIsSendingResume(true);
			const success = await store.actions.sendResumeLink(resumeEmail);

			if (success) {
				toast.success("Resume link sent to your email!");
				setShowResumeDialog(false);
				setResumeEmail("");
			} else {
				toast.error("Failed to send resume link");
			}
		} catch (error) {
			console.error("Send resume link error:", error);
			toast.error("Failed to send resume link");
		} finally {
			setIsSendingResume(false);
		}
	};

	return (
		<div className={cn("space-y-6", className)}>
			{/* Header */}
			{(title || description) && (
				<div className="space-y-2">
					{title && <h2 className="text-3xl font-bold">{title}</h2>}
					{description && (
						<p className="text-muted-foreground">{description}</p>
					)}
				</div>
			)}

			{/* Progress Bar */}
			<FormProgressBar
				steps={steps.map((s) => s.label)}
				currentStep={formData.currentStep}
				completedSteps={formData.completedSteps}
				errorSteps={formData.errorSteps}
				onStepClick={(stepIndex) => store.actions.goToStep(stepIndex)}
				variant={progressVariant}
			/>

			{/* Step Content */}
			<Card>
				<CardHeader>
					<CardTitle>{currentStep.label}</CardTitle>
					{currentStep.description && (
						<CardDescription>{currentStep.description}</CardDescription>
					)}
				</CardHeader>

				<CardContent>
					{renderStep(
						currentStep,
						formData.currentStep,
						formData.data,
						updateStepData,
					)}
				</CardContent>

				<CardFooter className="flex justify-between">
					{/* Previous button */}
					<Button
						type="button"
						variant="outline"
						onClick={handlePrevious}
						disabled={isFirstStep || isSubmitting}
					>
						<ChevronLeft className="mr-2 h-4 w-4" />
						Previous
					</Button>

					<div className="flex gap-2">
						{/* Save & Resume Later */}
						{showSaveButton && hasProgress && !isLastStep && (
							<Button
								type="button"
								variant="ghost"
								onClick={handleSaveResume}
								disabled={isSubmitting}
							>
								<Save className="mr-2 h-4 w-4" />
								Save & Resume Later
							</Button>
						)}

						{/* Next or Complete button */}
						{isLastStep ? (
							<Button
								type="button"
								onClick={handleComplete}
								disabled={isSubmitting}
							>
								{isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Submitting...
									</>
								) : (
									<>
										<Check className="mr-2 h-4 w-4" />
										Complete
									</>
								)}
							</Button>
						) : (
							<Button
								type="button"
								onClick={handleNext}
								disabled={isSubmitting}
							>
								{isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Saving...
									</>
								) : (
									<>
										Next
										<ChevronRight className="ml-2 h-4 w-4" />
									</>
								)}
							</Button>
						)}
					</div>
				</CardFooter>
			</Card>

			{/* Resume Later Dialog */}
			<Dialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Save & Resume Later</DialogTitle>
						<DialogDescription>
							We'll send you an email with a link to continue where you left off.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="resume-email">Email Address</Label>
							<Input
								id="resume-email"
								type="email"
								placeholder="your@email.com"
								value={resumeEmail}
								onChange={(e) => setResumeEmail(e.target.value)}
								disabled={isSendingResume}
							/>
						</div>

						<div className="flex items-start gap-2 p-3 rounded-lg bg-muted">
							<AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
							<div className="text-sm text-muted-foreground">
								Your progress has been saved locally. The email link will help you
								resume on another device or browser.
							</div>
						</div>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setShowResumeDialog(false)}
							disabled={isSendingResume}
						>
							Cancel
						</Button>
						<Button
							type="button"
							onClick={handleSendResumeLink}
							disabled={isSendingResume || !resumeEmail}
						>
							{isSendingResume ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Sending...
								</>
							) : (
								<>
									<Mail className="mr-2 h-4 w-4" />
									Send Resume Link
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
