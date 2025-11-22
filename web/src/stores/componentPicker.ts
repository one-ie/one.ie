import { atom } from "nanostores";
import { persistentAtom } from "@nanostores/persistent";

/**
 * Component Picker State Management
 *
 * CYCLE 15: Visual component library browser
 * Manages component picker UI state, search, filters, and selection
 */

export type ComponentCategory =
	| "all"
	| "builder"
	| "things"
	| "people"
	| "groups"
	| "connections"
	| "events"
	| "knowledge"
	| "crypto"
	| "streaming"
	| "advanced"
	| "enhanced"
	| "generative"
	| "visualization"
	| "universal"
	| "layouts"
	| "app"
	| "integration"
	| "mail"
	| "ui"
	| "layout"
	| "form"
	| "data-display"
	| "feedback"
	| "overlay"
	| "navigation"
	| "features"
	| "ontology";

export interface ComponentItem {
	id: string;
	name: string;
	category: ComponentCategory;
	path: string;
	description: string;
	props?: string[];
	variants?: string[];
	example?: string;
	previewCode?: string;
	tags?: string[];
}

export interface ComponentPickerState {
	isOpen: boolean;
	view: "grid" | "list";
	searchQuery: string;
	selectedCategory: ComponentCategory;
	selectedComponent: ComponentItem | null;
	showPreview: boolean;
	recentComponents: string[];
}

// Component picker open/close state
export const isComponentPickerOpen$ = atom<boolean>(false);

// Current view mode (grid or list)
export const componentView$ = persistentAtom<"grid" | "list">(
	"componentView",
	"grid",
	{
		encode: JSON.stringify,
		decode: JSON.parse,
	}
);

// Search query
export const componentSearchQuery$ = atom<string>("");

// Selected category filter
export const selectedCategory$ = atom<ComponentCategory>("all");

// Selected component for preview
export const selectedComponent$ = atom<ComponentItem | null>(null);

// Show component preview modal
export const showComponentPreview$ = atom<boolean>(false);

// Recently used components (persisted)
export const recentComponents$ = persistentAtom<string[]>(
	"recentComponents",
	[],
	{
		encode: JSON.stringify,
		decode: JSON.parse,
	}
);

/**
 * Actions
 */

export function openComponentPicker() {
	isComponentPickerOpen$.set(true);
}

export function closeComponentPicker() {
	isComponentPickerOpen$.set(false);
	componentSearchQuery$.set("");
	selectedComponent$.set(null);
}

export function toggleComponentPicker() {
	isComponentPickerOpen$.set(!isComponentPickerOpen$.get());
}

export function setComponentView(view: "grid" | "list") {
	componentView$.set(view);
}

export function setComponentSearchQuery(query: string) {
	componentSearchQuery$.set(query);
}

export function setSelectedCategory(category: ComponentCategory) {
	selectedCategory$.set(category);
}

export function selectComponent(component: ComponentItem | null) {
	selectedComponent$.set(component);
	if (component) {
		showComponentPreview$.set(true);
	}
}

export function closeComponentPreview() {
	showComponentPreview$.set(false);
	selectedComponent$.set(null);
}

export function addRecentComponent(componentName: string) {
	const recent = recentComponents$.get();
	const filtered = recent.filter((name: string) => name !== componentName);
	const updated = [componentName, ...filtered].slice(0, 10); // Keep last 10
	recentComponents$.set(updated);
}

export function clearRecentComponents() {
	recentComponents$.set([]);
}

/**
 * Helper: Get component picker state
 */
export function getComponentPickerState(): ComponentPickerState {
	return {
		isOpen: isComponentPickerOpen$.get(),
		view: componentView$.get(),
		searchQuery: componentSearchQuery$.get(),
		selectedCategory: selectedCategory$.get(),
		selectedComponent: selectedComponent$.get(),
		showPreview: showComponentPreview$.get(),
		recentComponents: recentComponents$.get(),
	};
}
