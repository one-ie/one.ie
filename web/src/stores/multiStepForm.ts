/**
 * Multi-Step Form State Management (Cycle 68)
 *
 * Manages form progress, partial submissions, and resume functionality
 * Uses nanostores for lightweight reactive state with localStorage persistence
 */

import { atom, computed } from "nanostores";

export interface FormStep {
	id: string;
	label: string;
	fields: string[];
}

export interface MultiStepFormData {
	/** Unique form ID */
	formId: string;
	/** Current step index */
	currentStep: number;
	/** Completed step indices */
	completedSteps: number[];
	/** Step indices with errors */
	errorSteps: number[];
	/** Partial form data (all steps combined) */
	data: Record<string, any>;
	/** Timestamp of last update */
	updatedAt: number;
	/** Email for resume link (if provided) */
	resumeEmail?: string;
}

// Load form data from localStorage
const loadFormData = (formId: string): MultiStepFormData | null => {
	if (typeof window === "undefined") return null;

	try {
		const stored = localStorage.getItem(`multi-step-form-${formId}`);
		if (stored) {
			return JSON.parse(stored) as MultiStepFormData;
		}
	} catch (error) {
		console.error("Failed to load form data from localStorage:", error);
	}

	return null;
};

// Save form data to localStorage
const saveFormData = (formData: MultiStepFormData): void => {
	if (typeof window === "undefined") return;

	try {
		localStorage.setItem(
			`multi-step-form-${formData.formId}`,
			JSON.stringify(formData),
		);
	} catch (error) {
		console.error("Failed to save form data to localStorage:", error);
	}
};

// Clear form data from localStorage
const clearFormData = (formId: string): void => {
	if (typeof window === "undefined") return;

	try {
		localStorage.removeItem(`multi-step-form-${formId}`);
	} catch (error) {
		console.error("Failed to clear form data from localStorage:", error);
	}
};

// Create store for specific form instance
export function createMultiStepFormStore(formId: string, totalSteps: number) {
	// Initialize with saved data or defaults
	const initialData =
		loadFormData(formId) ||
		({
			formId,
			currentStep: 0,
			completedSteps: [],
			errorSteps: [],
			data: {},
			updatedAt: Date.now(),
		} as MultiStepFormData);

	// Form data atom
	const $formData = atom<MultiStepFormData>(initialData);

	// Computed values
	const $progress = computed($formData, (formData) =>
		Math.round(((formData.currentStep + 1) / totalSteps) * 100),
	);

	const $isComplete = computed(
		$formData,
		(formData) => formData.currentStep >= totalSteps - 1,
	);

	const $hasProgress = computed(
		$formData,
		(formData) =>
			formData.currentStep > 0 ||
			formData.completedSteps.length > 0 ||
			Object.keys(formData.data).length > 0,
	);

	// Actions
	const actions = {
		/**
		 * Update current step data
		 */
		updateStepData: (stepIndex: number, data: Record<string, any>) => {
			const formData = $formData.get();
			const newData = {
				...formData,
				data: {
					...formData.data,
					...data,
				},
				updatedAt: Date.now(),
			};
			$formData.set(newData);
			saveFormData(newData);
		},

		/**
		 * Go to next step
		 */
		nextStep: () => {
			const formData = $formData.get();
			const currentStep = formData.currentStep;

			// Mark current step as completed
			const completedSteps = Array.from(
				new Set([...formData.completedSteps, currentStep]),
			);

			// Clear error for current step
			const errorSteps = formData.errorSteps.filter((s) => s !== currentStep);

			const newData = {
				...formData,
				currentStep: Math.min(currentStep + 1, totalSteps - 1),
				completedSteps,
				errorSteps,
				updatedAt: Date.now(),
			};
			$formData.set(newData);
			saveFormData(newData);
		},

		/**
		 * Go to previous step
		 */
		previousStep: () => {
			const formData = $formData.get();
			const newData = {
				...formData,
				currentStep: Math.max(formData.currentStep - 1, 0),
				updatedAt: Date.now(),
			};
			$formData.set(newData);
			saveFormData(newData);
		},

		/**
		 * Go to specific step
		 */
		goToStep: (stepIndex: number) => {
			const formData = $formData.get();

			// Only allow going to current step or completed steps
			if (
				stepIndex <= formData.currentStep ||
				formData.completedSteps.includes(stepIndex)
			) {
				const newData = {
					...formData,
					currentStep: stepIndex,
					updatedAt: Date.now(),
				};
				$formData.set(newData);
				saveFormData(newData);
			}
		},

		/**
		 * Mark current step as having errors
		 */
		setStepError: (stepIndex: number, hasError: boolean) => {
			const formData = $formData.get();
			const errorSteps = hasError
				? Array.from(new Set([...formData.errorSteps, stepIndex]))
				: formData.errorSteps.filter((s) => s !== stepIndex);

			const newData = {
				...formData,
				errorSteps,
				updatedAt: Date.now(),
			};
			$formData.set(newData);
			saveFormData(newData);
		},

		/**
		 * Save resume email
		 */
		saveResumeEmail: (email: string) => {
			const formData = $formData.get();
			const newData = {
				...formData,
				resumeEmail: email,
				updatedAt: Date.now(),
			};
			$formData.set(newData);
			saveFormData(newData);
		},

		/**
		 * Send resume link via email
		 */
		sendResumeLink: async (email: string): Promise<boolean> => {
			try {
				// Save email
				actions.saveResumeEmail(email);

				// Generate resume link
				const resumeUrl = `${window.location.origin}${window.location.pathname}?resumeForm=${formId}`;

				// Send email (would integrate with backend email service)
				const response = await fetch("/api/send-resume-link", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						email,
						formId,
						resumeUrl,
						formData: $formData.get(),
					}),
				});

				return response.ok;
			} catch (error) {
				console.error("Failed to send resume link:", error);
				return false;
			}
		},

		/**
		 * Reset form to initial state
		 */
		resetForm: () => {
			const newData: MultiStepFormData = {
				formId,
				currentStep: 0,
				completedSteps: [],
				errorSteps: [],
				data: {},
				updatedAt: Date.now(),
			};
			$formData.set(newData);
			clearFormData(formId);
		},

		/**
		 * Get all form data
		 */
		getAllData: () => {
			return $formData.get().data;
		},

		/**
		 * Check if step is completed
		 */
		isStepCompleted: (stepIndex: number): boolean => {
			return $formData.get().completedSteps.includes(stepIndex);
		},

		/**
		 * Check if step has errors
		 */
		hasStepErrors: (stepIndex: number): boolean => {
			return $formData.get().errorSteps.includes(stepIndex);
		},
	};

	return {
		$formData,
		$progress,
		$isComplete,
		$hasProgress,
		actions,
	};
}

/**
 * Generate resume URL for a form
 */
export function generateResumeUrl(formId: string): string {
	const baseUrl =
		typeof window !== "undefined"
			? window.location.origin
			: "https://one.ie";
	return `${baseUrl}/forms/resume?formId=${formId}`;
}

/**
 * Load form from URL parameter
 */
export function loadFormFromUrl(): string | null {
	if (typeof window === "undefined") return null;

	const params = new URLSearchParams(window.location.search);
	return params.get("resumeForm");
}
