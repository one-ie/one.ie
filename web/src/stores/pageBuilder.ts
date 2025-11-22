/**
 * Page Builder Store
 *
 * Manages state for the conversational page builder.
 */

import { atom } from "nanostores";
import type {
	PageElement,
	FunnelStep,
	PageBuilderContext,
} from "@/types/funnel-builder";

/**
 * Current page builder context (which step we're editing)
 */
export const pageBuilderContext$ = atom<PageBuilderContext | null>(null);

/**
 * Currently selected element (for editing)
 */
export const selectedElement$ = atom<PageElement | null>(null);

/**
 * History stack for undo/redo
 */
export const historyStack$ = atom<FunnelStep[]>([]);
export const historyIndex$ = atom<number>(-1);

/**
 * Set the current step being edited
 */
export function setCurrentStep(funnelId: string, stepId: string, step: FunnelStep) {
	pageBuilderContext$.set({
		funnelId,
		stepId,
		step,
		currentElement: undefined,
	});

	// Reset history
	historyStack$.set([step]);
	historyIndex$.set(0);
}

/**
 * Add element to current step
 */
export function addElement(element: PageElement) {
	const context = pageBuilderContext$.get();
	if (!context) return;

	const updatedStep = {
		...context.step,
		elements: [...context.step.elements, element],
	};

	pushHistory(updatedStep);
	pageBuilderContext$.set({ ...context, step: updatedStep });
}

/**
 * Update element properties
 */
export function updateElement(elementId: string, updates: Partial<PageElement>) {
	const context = pageBuilderContext$.get();
	if (!context) return;

	const updatedStep = {
		...context.step,
		elements: context.step.elements.map((el) =>
			el.id === elementId ? { ...el, ...updates } : el
		),
	};

	pushHistory(updatedStep);
	pageBuilderContext$.set({ ...context, step: updatedStep });
}

/**
 * Remove element from current step
 */
export function removeElement(elementId: string) {
	const context = pageBuilderContext$.get();
	if (!context) return;

	const updatedStep = {
		...context.step,
		elements: context.step.elements.filter((el) => el.id !== elementId),
	};

	pushHistory(updatedStep);
	pageBuilderContext$.set({ ...context, step: updatedStep });
}

/**
 * Reorder elements
 */
export function reorderElements(elementIds: string[]) {
	const context = pageBuilderContext$.get();
	if (!context) return;

	const elementMap = new Map(
		context.step.elements.map((el) => [el.id, el])
	);

	const updatedStep = {
		...context.step,
		elements: elementIds
			.map((id) => elementMap.get(id))
			.filter(Boolean) as PageElement[],
	};

	pushHistory(updatedStep);
	pageBuilderContext$.set({ ...context, step: updatedStep });
}

/**
 * Duplicate element
 */
export function duplicateElement(elementId: string) {
	const context = pageBuilderContext$.get();
	if (!context) return;

	const element = context.step.elements.find((el) => el.id === elementId);
	if (!element) return;

	const duplicated = {
		...element,
		id: `${element.id}-copy-${Date.now()}`,
		position: {
			...element.position,
			row: element.position.row + element.position.height,
		},
	};

	const updatedStep = {
		...context.step,
		elements: [...context.step.elements, duplicated],
	};

	pushHistory(updatedStep);
	pageBuilderContext$.set({ ...context, step: updatedStep });
}

/**
 * Select element for editing
 */
export function selectElement(elementId: string | null) {
	const context = pageBuilderContext$.get();
	if (!context) return;

	const element = elementId
		? context.step.elements.find((el) => el.id === elementId)
		: null;

	selectedElement$.set(element || null);
	pageBuilderContext$.set({
		...context,
		currentElement: element,
	});
}

/**
 * Push step to history (for undo/redo)
 */
function pushHistory(step: FunnelStep) {
	const history = historyStack$.get();
	const index = historyIndex$.get();

	// Remove any forward history
	const newHistory = history.slice(0, index + 1);
	newHistory.push(step);

	// Limit history to 50 items
	if (newHistory.length > 50) {
		newHistory.shift();
	} else {
		historyIndex$.set(index + 1);
	}

	historyStack$.set(newHistory);
}

/**
 * Undo last change
 */
export function undo() {
	const index = historyIndex$.get();
	if (index <= 0) return;

	const newIndex = index - 1;
	const history = historyStack$.get();
	const step = history[newIndex];

	historyIndex$.set(newIndex);

	const context = pageBuilderContext$.get();
	if (context) {
		pageBuilderContext$.set({ ...context, step });
	}
}

/**
 * Redo last undone change
 */
export function redo() {
	const index = historyIndex$.get();
	const history = historyStack$.get();

	if (index >= history.length - 1) return;

	const newIndex = index + 1;
	const step = history[newIndex];

	historyIndex$.set(newIndex);

	const context = pageBuilderContext$.get();
	if (context) {
		pageBuilderContext$.set({ ...context, step });
	}
}

/**
 * Clear page builder state
 */
export function clearPageBuilder() {
	pageBuilderContext$.set(null);
	selectedElement$.set(null);
	historyStack$.set([]);
	historyIndex$.set(-1);
}
