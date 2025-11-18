/**
 * SignUpOnboarding - Multi-step onboarding flow controller
 *
 * Manages the complete Wave 1 creator onboarding flow across all steps
 */

import { useEffect, useState } from "react";
import { AppProviders } from "@/components/providers/AppProviders";
import { EmailVerificationForm } from "./EmailVerificationForm";
import { OnboardingCompleted } from "./OnboardingCompleted";
import { OnboardingLayout } from "./OnboardingLayout";
import { ProfileForm } from "./ProfileForm";
import { SkillsSelector } from "./SkillsSelector";
import { TeamInviteForm } from "./TeamInviteForm";
import { WalletConnector } from "./WalletConnector";
import { Wave1SignUpForm } from "./Wave1SignUpForm";
import { WorkspaceForm } from "./WorkspaceForm";

type OnboardingStep =
	| "signup"
	| "email_verification"
	| "profile"
	| "workspace"
	| "team"
	| "wallet"
	| "skills"
	| "completed";

interface OnboardingState {
	userId?: string;
	email?: string;
	displayName?: string;
	workspaceId?: string;
}

const STEP_CONFIGS: Record<OnboardingStep, { number: number; label: string }> =
	{
		signup: { number: 1, label: "Sign Up" },
		email_verification: { number: 1, label: "Verify Email" },
		profile: { number: 2, label: "Profile" },
		workspace: { number: 3, label: "Workspace" },
		team: { number: 4, label: "Team" },
		wallet: { number: 5, label: "Wallet" },
		skills: { number: 6, label: "Skills" },
		completed: { number: 6, label: "Complete" },
	};

const COMPLETED_STEPS: Record<OnboardingStep, string[]> = {
	signup: [],
	email_verification: [],
	profile: ["email_verification"],
	workspace: ["email_verification", "profile"],
	team: ["email_verification", "profile", "workspace"],
	wallet: ["email_verification", "profile", "workspace", "team"],
	skills: ["email_verification", "profile", "workspace", "team", "wallet"],
	completed: [
		"email_verification",
		"profile",
		"workspace",
		"team",
		"wallet",
		"skills",
	],
};

const PROGRESS_PERCENTAGES: Record<OnboardingStep, number> = {
	signup: 0,
	email_verification: 17,
	profile: 33,
	workspace: 50,
	team: 67,
	wallet: 83,
	skills: 100,
	completed: 100,
};

export function SignUpOnboarding() {
	const [currentStep, setCurrentStep] = useState<OnboardingStep>("signup");
	const [state, setState] = useState<OnboardingState>({});
	const [isTransitioning, setIsTransitioning] = useState(false);

	const config = STEP_CONFIGS[currentStep];
	const completedSteps = COMPLETED_STEPS[currentStep];
	const progress = PROGRESS_PERCENTAGES[currentStep];

	const handleSignupSuccess = (data: {
		userId: string;
		email: string;
		displayName: string;
	}) => {
		setState({
			...state,
			userId: data.userId,
			email: data.email,
			displayName: data.displayName,
		});
		setIsTransitioning(true);
		setTimeout(() => {
			setCurrentStep("email_verification");
			setIsTransitioning(false);
		}, 500);
	};

	const handleEmailVerificationSuccess = () => {
		setIsTransitioning(true);
		setTimeout(() => {
			setCurrentStep("profile");
			setIsTransitioning(false);
		}, 500);
	};

	const handleProfileSuccess = () => {
		setIsTransitioning(true);
		setTimeout(() => {
			setCurrentStep("workspace");
			setIsTransitioning(false);
		}, 500);
	};

	const handleWorkspaceSuccess = (workspaceId: string) => {
		setState({ ...state, workspaceId });
		setIsTransitioning(true);
		setTimeout(() => {
			setCurrentStep("team");
			setIsTransitioning(false);
		}, 500);
	};

	const handleTeamSuccess = () => {
		setIsTransitioning(true);
		setTimeout(() => {
			setCurrentStep("wallet");
			setIsTransitioning(false);
		}, 500);
	};

	const handleWalletSuccess = () => {
		setIsTransitioning(true);
		setTimeout(() => {
			setCurrentStep("skills");
			setIsTransitioning(false);
		}, 500);
	};

	const handleSkillsSuccess = () => {
		setIsTransitioning(true);
		setTimeout(() => {
			setCurrentStep("completed");
			setIsTransitioning(false);
		}, 500);
	};

	const handleBack = () => {
		const stepOrder: OnboardingStep[] = [
			"signup",
			"email_verification",
			"profile",
			"workspace",
			"team",
			"wallet",
			"skills",
		];
		const currentIndex = stepOrder.indexOf(currentStep);
		if (currentIndex > 0) {
			setIsTransitioning(true);
			setTimeout(() => {
				setCurrentStep(stepOrder[currentIndex - 1]);
				setIsTransitioning(false);
			}, 500);
		}
	};

	const getTitlesAndSubtitles = () => {
		switch (currentStep) {
			case "signup":
				return {
					title: "Create Your Account",
					subtitle: "Join Wave 1 to start creating",
				};
			case "email_verification":
				return {
					title: "Verify Your Email",
					subtitle: `We sent a code to ${state.email}`,
				};
			case "profile":
				return {
					title: "Complete Your Profile",
					subtitle: "Help others discover you",
				};
			case "workspace":
				return {
					title: "Create Your Workspace",
					subtitle: "Your space to create and collaborate",
				};
			case "team":
				return {
					title: "Invite Your Team",
					subtitle: "Work together with your team",
				};
			case "wallet":
				return {
					title: "Connect Your Wallet",
					subtitle: "Secure your web3 presence",
				};
			case "skills":
				return {
					title: "Add Your Skills",
					subtitle: "Tell us what you do best",
				};
			case "completed":
				return {
					title: "Welcome to Wave 1!",
					subtitle: "Your onboarding is complete",
				};
			default:
				return { title: "", subtitle: "" };
		}
	};

	const { title, subtitle } = getTitlesAndSubtitles();

	return (
		<AppProviders>
			<OnboardingLayout
				title={title}
				subtitle={subtitle}
				step={config.number}
				progress={progress}
				completedSteps={completedSteps}
				onBack={
					currentStep !== "signup" && currentStep !== "completed"
						? handleBack
						: undefined
				}
				showProgress={currentStep !== "completed"}
			>
				<div
					className={`transition-opacity duration-300 ${
						isTransitioning ? "opacity-50" : "opacity-100"
					}`}
				>
					{currentStep === "signup" && (
						<SignUpOnboardingForm onSuccess={handleSignupSuccess} />
					)}

					{currentStep === "email_verification" && state.email && (
						<EmailVerificationForm
							email={state.email}
							onSuccess={handleEmailVerificationSuccess}
							onBack={() => handleBack()}
						/>
					)}

					{currentStep === "profile" && state.userId && (
						<ProfileForm
							userId={state.userId}
							onSuccess={handleProfileSuccess}
							onSkip={handleProfileSuccess}
						/>
					)}

					{currentStep === "workspace" && state.userId && (
						<WorkspaceFormWrapper
							userId={state.userId}
							onSuccess={(workspaceId) => handleWorkspaceSuccess(workspaceId)}
							onSkip={handleWorkspaceSuccess}
						/>
					)}

					{currentStep === "team" && state.userId && state.workspaceId && (
						<TeamInviteForm
							userId={state.userId}
							workspaceId={state.workspaceId}
							onSuccess={handleTeamSuccess}
							onSkip={handleTeamSuccess}
						/>
					)}

					{currentStep === "wallet" && state.userId && (
						<WalletConnector
							userId={state.userId}
							onSuccess={handleWalletSuccess}
							onSkip={handleWalletSuccess}
						/>
					)}

					{currentStep === "skills" && state.userId && (
						<SkillsSelector
							userId={state.userId}
							onSuccess={handleSkillsSuccess}
							onSkip={handleSkillsSuccess}
						/>
					)}

					{currentStep === "completed" && state.userId && (
						<OnboardingCompleted
							userId={state.userId}
							workspaceName={state.displayName || "Your Workspace"}
						/>
					)}
				</div>
			</OnboardingLayout>
		</AppProviders>
	);
}

// Wrapper component for signup form
function SignUpOnboardingForm({
	onSuccess,
}: {
	onSuccess: (data: {
		userId: string;
		email: string;
		displayName: string;
	}) => void;
}) {
	return <Wave1SignUpForm onSuccess={onSuccess} />;
}

// Wrapper component for workspace form to extract workspace ID
function WorkspaceFormWrapper({
	userId,
	onSuccess,
	onSkip,
}: {
	userId: string;
	onSuccess: (workspaceId: string) => void;
	onSkip: (workspaceId: string) => void;
}) {
	const [tempWorkspaceId, setTempWorkspaceId] = useState<string | null>(null);

	return (
		<WorkspaceForm
			userId={userId}
			onSuccess={() => {
				if (tempWorkspaceId) onSuccess(tempWorkspaceId);
			}}
			onSkip={() => {
				if (tempWorkspaceId) onSkip(tempWorkspaceId);
				else onSkip(userId as any); // fallback
			}}
		/>
	);
}
