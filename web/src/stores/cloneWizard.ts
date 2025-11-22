/**
 * AI Clone Creation Wizard State Management
 * Uses Nanostores for reactive state across wizard steps
 * Persists draft to localStorage for resuming later
 */

import { atom, computed } from "nanostores";

export interface CloneWizardData {
	// Step 1: Basic Info
	name: string;
	personality: "professional" | "friendly" | "creative" | "technical" | "casual";

	// Step 2: Training Sources
	selectedSources: {
		blogPosts: string[];
		courses: string[];
		videos: string[];
		products: string[];
	};

	// Step 3: Voice Samples
	voiceSamples: File[];
	voiceProcessing: boolean;

	// Step 4: Photo Upload
	photo?: File;
	photoProcessing: boolean;

	// Step 5: Personality Configuration
	temperature: number; // 0-1
	tone: "formal" | "casual" | "enthusiastic" | "neutral";
	expertiseTags: string[];

	// Wizard State
	currentStep: number;
	totalSteps: number;
	completedSteps: Set<number>;
	skippedSteps: Set<number>;

	// Processing State
	isProcessing: boolean;
	processingProgress: number; // 0-100
	processingMessage: string;
	estimatedTimeRemaining?: number; // seconds
}

// Load draft from localStorage
const loadDraft = (): CloneWizardData => {
	if (typeof window === "undefined") return getDefaultWizardData();

	try {
		const stored = localStorage.getItem("clone-wizard-draft");
		if (stored) {
			const draft = JSON.parse(stored) as Partial<CloneWizardData>;
			// Convert Set back from array
			const completedSteps = new Set(
				(draft.completedSteps as unknown as number[]) || [],
			);
			const skippedSteps = new Set(
				(draft.skippedSteps as unknown as number[]) || [],
			);
			return {
				...getDefaultWizardData(),
				...draft,
				completedSteps,
				skippedSteps,
			};
		}
	} catch (error) {
		console.error("Failed to load wizard draft:", error);
	}

	return getDefaultWizardData();
};

// Save draft to localStorage
const saveDraft = (data: CloneWizardData): void => {
	if (typeof window === "undefined") return;

	try {
		// Convert Set to array for JSON serialization
		const serializable = {
			...data,
			completedSteps: Array.from(data.completedSteps),
			skippedSteps: Array.from(data.skippedSteps),
			// Don't persist File objects
			voiceSamples: [],
			photo: undefined,
		};
		localStorage.setItem("clone-wizard-draft", JSON.stringify(serializable));
	} catch (error) {
		console.error("Failed to save wizard draft:", error);
	}
};

function getDefaultWizardData(): CloneWizardData {
	return {
		name: "",
		personality: "professional",
		selectedSources: {
			blogPosts: [],
			courses: [],
			videos: [],
			products: [],
		},
		voiceSamples: [],
		voiceProcessing: false,
		photoProcessing: false,
		temperature: 0.7,
		tone: "neutral",
		expertiseTags: [],
		currentStep: 1,
		totalSteps: 6,
		completedSteps: new Set(),
		skippedSteps: new Set(),
		isProcessing: false,
		processingProgress: 0,
		processingMessage: "",
	};
}

// Wizard data atom
export const $wizardData = atom<CloneWizardData>(loadDraft());

// Computed values
export const $canProceed = computed($wizardData, (data) => {
	switch (data.currentStep) {
		case 1:
			return data.name.trim().length >= 3;
		case 2:
			const totalSources =
				data.selectedSources.blogPosts.length +
				data.selectedSources.courses.length +
				data.selectedSources.videos.length +
				data.selectedSources.products.length;
			return totalSources > 0;
		case 3:
			// Voice is optional, can skip
			return true;
		case 4:
			// Photo is optional, can skip
			return true;
		case 5:
			return data.expertiseTags.length > 0;
		case 6:
			// Review step always allows proceeding
			return true;
		default:
			return true;
	}
});

export const $progressPercentage = computed($wizardData, (data) => {
	return Math.round((data.currentStep / data.totalSteps) * 100);
});

export const $estimatedContentVolume = computed($wizardData, (data) => {
	// Estimate based on selected sources
	const sources = data.selectedSources;
	const blogWords = sources.blogPosts.length * 800; // avg blog post
	const courseWords = sources.courses.length * 5000; // avg course
	const videoWords = sources.videos.length * 1500; // avg video transcript
	const productWords = sources.products.length * 300; // avg product description

	const totalWords = blogWords + courseWords + videoWords + productWords;
	return {
		words: totalWords,
		estimatedMinutes: Math.ceil(totalWords / 500), // 500 words/minute processing
	};
});

// Wizard actions
export const wizardActions = {
	/**
	 * Update wizard data and save draft
	 */
	updateData: (updates: Partial<CloneWizardData>) => {
		const current = $wizardData.get();
		const newData = { ...current, ...updates };
		$wizardData.set(newData);
		saveDraft(newData);
	},

	/**
	 * Move to next step
	 */
	nextStep: () => {
		const data = $wizardData.get();
		if (data.currentStep < data.totalSteps) {
			const completedSteps = new Set(data.completedSteps);
			completedSteps.add(data.currentStep);

			wizardActions.updateData({
				currentStep: data.currentStep + 1,
				completedSteps,
			});
		}
	},

	/**
	 * Move to previous step
	 */
	previousStep: () => {
		const data = $wizardData.get();
		if (data.currentStep > 1) {
			wizardActions.updateData({
				currentStep: data.currentStep - 1,
			});
		}
	},

	/**
	 * Skip current step (marks as skipped)
	 */
	skipStep: () => {
		const data = $wizardData.get();
		const skippedSteps = new Set(data.skippedSteps);
		skippedSteps.add(data.currentStep);

		wizardActions.updateData({
			currentStep: data.currentStep + 1,
			skippedSteps,
		});
	},

	/**
	 * Jump to specific step
	 */
	goToStep: (step: number) => {
		const data = $wizardData.get();
		if (step >= 1 && step <= data.totalSteps) {
			wizardActions.updateData({ currentStep: step });
		}
	},

	/**
	 * Add selected source
	 */
	addSource: (
		type: keyof CloneWizardData["selectedSources"],
		sourceId: string,
	) => {
		const data = $wizardData.get();
		const sources = { ...data.selectedSources };
		if (!sources[type].includes(sourceId)) {
			sources[type] = [...sources[type], sourceId];
			wizardActions.updateData({ selectedSources: sources });
		}
	},

	/**
	 * Remove selected source
	 */
	removeSource: (
		type: keyof CloneWizardData["selectedSources"],
		sourceId: string,
	) => {
		const data = $wizardData.get();
		const sources = { ...data.selectedSources };
		sources[type] = sources[type].filter((id) => id !== sourceId);
		wizardActions.updateData({ selectedSources: sources });
	},

	/**
	 * Add expertise tag
	 */
	addExpertiseTag: (tag: string) => {
		const data = $wizardData.get();
		if (!data.expertiseTags.includes(tag)) {
			wizardActions.updateData({
				expertiseTags: [...data.expertiseTags, tag],
			});
		}
	},

	/**
	 * Remove expertise tag
	 */
	removeExpertiseTag: (tag: string) => {
		const data = $wizardData.get();
		wizardActions.updateData({
			expertiseTags: data.expertiseTags.filter((t) => t !== tag),
		});
	},

	/**
	 * Start processing (clone creation)
	 */
	startProcessing: (message: string) => {
		wizardActions.updateData({
			isProcessing: true,
			processingProgress: 0,
			processingMessage: message,
		});
	},

	/**
	 * Update processing progress
	 */
	updateProgress: (
		progress: number,
		message?: string,
		estimatedTime?: number,
	) => {
		const updates: Partial<CloneWizardData> = { processingProgress: progress };
		if (message) updates.processingMessage = message;
		if (estimatedTime !== undefined)
			updates.estimatedTimeRemaining = estimatedTime;
		wizardActions.updateData(updates);
	},

	/**
	 * Complete processing
	 */
	completeProcessing: () => {
		wizardActions.updateData({
			isProcessing: false,
			processingProgress: 100,
		});
	},

	/**
	 * Reset wizard to start over
	 */
	reset: () => {
		const newData = getDefaultWizardData();
		$wizardData.set(newData);
		saveDraft(newData);
	},

	/**
	 * Clear draft from localStorage
	 */
	clearDraft: () => {
		if (typeof window !== "undefined") {
			localStorage.removeItem("clone-wizard-draft");
		}
	},
};
