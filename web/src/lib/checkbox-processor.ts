/**
 * Checkbox Processor
 * Transforms checkbox markdown syntax into styled HTML elements
 * Converts [x] or [ x] to green checkmarks
 * Converts [ ] to empty checkbox outline
 */

export interface ProcessedContent {
	html: string;
	hasCheckboxes: boolean;
}

/**
 * Process markdown content and replace checkbox syntax with HTML
 * Handles:
 * - [x], [ x], [X], [ X] → green checkmark
 * - [ ] → empty checkbox
 */
export function processCheckboxes(htmlContent: string): ProcessedContent {
	let processed = htmlContent;
	let hasCheckboxes = false;

	// Pattern for completed checkboxes: [x], [ x], [X], [ X]
	const completedPattern = /\[\s*[xX]\s*\]/g;
	if (completedPattern.test(processed)) {
		hasCheckboxes = true;
		processed = processed.replace(
			completedPattern,
			'<span class="checkbox-completed">✓</span>',
		);
	}

	// Pattern for pending checkboxes: [ ]
	const pendingPattern = /\[\s*\]/g;
	if (pendingPattern.test(processed)) {
		hasCheckboxes = true;
		processed = processed.replace(
			pendingPattern,
			'<span class="checkbox-pending"></span>',
		);
	}

	return {
		html: processed,
		hasCheckboxes,
	};
}

/**
 * Creates a DOM element from HTML string
 * This is used for client-side processing if needed
 */
export function createCheckboxElement(isCompleted: boolean): HTMLElement {
	const span = document.createElement("span");
	span.className = isCompleted ? "checkbox-completed" : "checkbox-pending";
	if (isCompleted) {
		span.textContent = "✓";
	}
	return span;
}
