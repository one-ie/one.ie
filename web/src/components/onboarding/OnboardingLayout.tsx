/**
 * OnboardingLayout - Shared layout for onboarding pages
 *
 * Provides consistent layout with progress bar, branding, and content area
 * for all onboarding steps
 */

import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "./ProgressBar";

interface OnboardingLayoutProps {
	children: ReactNode;
	title: string;
	subtitle?: string;
	step: number;
	progress: number;
	completedSteps: string[];
	onBack?: () => void;
	showProgress?: boolean;
}

export function OnboardingLayout({
	children,
	title,
	subtitle,
	step,
	progress,
	completedSteps,
	onBack,
	showProgress = true,
}: OnboardingLayoutProps) {
	return (
		<div className="min-h-screen bg-gradient-to-br from-background to-secondary/5 p-4 sm:p-6 lg:p-8">
			<div className="max-w-2xl mx-auto space-y-8">
				{/* Header */}
				<div className="text-center space-y-2">
					<div className="flex items-center justify-center gap-2">
						<div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
							1
						</div>
						<span className="text-sm font-semibold text-muted-foreground">
							creator onboarding
						</span>
					</div>
					<h1 className="text-3xl sm:text-4xl font-bold text-foreground">
						{title}
					</h1>
					{subtitle && (
						<p className="text-muted-foreground max-w-lg mx-auto">{subtitle}</p>
					)}
				</div>

				{/* Progress Bar */}
				{showProgress && (
					<div className="px-4">
						<ProgressBar
							currentStep={step}
							completedSteps={completedSteps}
							progress={progress}
						/>
					</div>
				)}

				{/* Main Content Card */}
				<Card className="p-6 sm:p-8 shadow-lg">
					{/* Back Button */}
					{onBack && (
						<div className="mb-6">
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={onBack}
								className="gap-2"
							>
								<ArrowLeft className="w-4 h-4" />
								Back
							</Button>
						</div>
					)}

					{/* Form Content */}
					{children}
				</Card>

				{/* Footer */}
				<div className="text-center text-sm text-muted-foreground space-y-2">
					<p>Step {step} of 6</p>
					<p>
						By signing up, you agree to our{" "}
						<a
							href="/terms"
							className="underline hover:text-foreground transition-colors"
						>
							Terms of Service
						</a>{" "}
						and{" "}
						<a
							href="/privacy"
							className="underline hover:text-foreground transition-colors"
						>
							Privacy Policy
						</a>
					</p>
				</div>
			</div>
		</div>
	);
}

/**
 * OnboardingContainer - Container component for building onboarding pages
 *
 * Simplified wrapper that manages state and renders layout with form
 *
 * @example
 * ```tsx
 * export function OnboardProfilePage() {
 *   return (
 *     <OnboardingContainer
 *       title="Complete Your Profile"
 *       subtitle="Tell us about yourself"
 *       step={2}
 *       formComponent={<ProfileForm onSuccess={...} />}
 *     />
 *   );
 * }
 * ```
 */
interface OnboardingContainerProps {
	title: string;
	subtitle?: string;
	step: number;
	progress: number;
	completedSteps: string[];
	formComponent: ReactNode;
	onBack?: () => void;
	showProgress?: boolean;
}

export function OnboardingContainer({
	title,
	subtitle,
	step,
	progress,
	completedSteps,
	formComponent,
	onBack,
	showProgress = true,
}: OnboardingContainerProps) {
	return (
		<OnboardingLayout
			title={title}
			subtitle={subtitle}
			step={step}
			progress={progress}
			completedSteps={completedSteps}
			onBack={onBack}
			showProgress={showProgress}
		>
			{formComponent}
		</OnboardingLayout>
	);
}
