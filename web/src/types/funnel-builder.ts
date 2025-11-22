/**
 * Funnel Builder Types
 *
 * Type definitions for the conversational funnel page builder.
 */

export type ElementType =
	| "headline"
	| "subheadline"
	| "text"
	| "image"
	| "video"
	| "button"
	| "form"
	| "countdown"
	| "testimonial"
	| "pricing-table"
	| "divider"
	| "spacer";

export interface ElementPosition {
	row: number;
	col: number;
	width: number; // 1-12 (grid columns)
	height: number; // in grid rows
}

export interface BaseElementProperties {
	id: string;
	type: ElementType;
	position: ElementPosition;
	visible: boolean;
	animations?: {
		entrance?: "fade" | "slide" | "zoom" | "none";
		duration?: number;
	};
}

export interface HeadlineElementProperties extends BaseElementProperties {
	type: "headline";
	text: string;
	level: "h1" | "h2" | "h3";
	align: "left" | "center" | "right";
	color?: string;
	fontSize?: string;
	fontWeight?: "normal" | "bold" | "extrabold";
}

export interface SubheadlineElementProperties extends BaseElementProperties {
	type: "subheadline";
	text: string;
	align: "left" | "center" | "right";
	color?: string;
	fontSize?: string;
}

export interface TextElementProperties extends BaseElementProperties {
	type: "text";
	content: string;
	align: "left" | "center" | "right" | "justify";
	color?: string;
	fontSize?: string;
}

export interface ImageElementProperties extends BaseElementProperties {
	type: "image";
	src: string;
	alt: string;
	width?: string;
	height?: string;
	objectFit?: "contain" | "cover" | "fill";
	rounded?: boolean;
	shadow?: boolean;
	link?: string;
}

export interface VideoElementProperties extends BaseElementProperties {
	type: "video";
	src: string;
	thumbnail?: string;
	autoplay?: boolean;
	muted?: boolean;
	controls?: boolean;
	loop?: boolean;
}

export interface ButtonElementProperties extends BaseElementProperties {
	type: "button";
	text: string;
	action: "link" | "scroll" | "submit" | "popup";
	link?: string;
	scrollTo?: string;
	variant: "primary" | "secondary" | "outline" | "ghost";
	size: "sm" | "md" | "lg";
	fullWidth?: boolean;
	icon?: string;
}

export interface FormFieldConfig {
	id: string;
	type: "text" | "email" | "phone" | "select" | "checkbox" | "textarea";
	label: string;
	placeholder?: string;
	required: boolean;
	options?: string[]; // for select fields
	validation?: {
		pattern?: string;
		message?: string;
	};
}

export interface FormElementProperties extends BaseElementProperties {
	type: "form";
	title?: string;
	description?: string;
	fields: FormFieldConfig[];
	submitText: string;
	successMessage?: string;
	redirectUrl?: string;
}

export interface CountdownElementProperties extends BaseElementProperties {
	type: "countdown";
	endDate: string; // ISO date string
	title?: string;
	urgencyText?: string;
	showDays?: boolean;
	showHours?: boolean;
	showMinutes?: boolean;
	showSeconds?: boolean;
}

export interface TestimonialElementProperties extends BaseElementProperties {
	type: "testimonial";
	quote: string;
	author: string;
	role?: string;
	avatar?: string;
	rating?: number; // 1-5
}

export interface PricingTableElementProperties extends BaseElementProperties {
	type: "pricing-table";
	plans: Array<{
		name: string;
		price: string;
		period?: string;
		features: string[];
		highlighted?: boolean;
		buttonText: string;
		buttonLink: string;
	}>;
}

export interface DividerElementProperties extends BaseElementProperties {
	type: "divider";
	style: "solid" | "dashed" | "dotted";
	width?: string;
	color?: string;
}

export interface SpacerElementProperties extends BaseElementProperties {
	type: "spacer";
	height: number; // in pixels
}

export type PageElement =
	| HeadlineElementProperties
	| SubheadlineElementProperties
	| TextElementProperties
	| ImageElementProperties
	| VideoElementProperties
	| ButtonElementProperties
	| FormElementProperties
	| CountdownElementProperties
	| TestimonialElementProperties
	| PricingTableElementProperties
	| DividerElementProperties
	| SpacerElementProperties;

export interface FunnelStep {
	id: string;
	funnelId: string;
	name: string;
	slug: string;
	type:
		| "landing"
		| "sales"
		| "upsell"
		| "downsell"
		| "thankyou"
		| "webinar"
		| "optin";
	elements: PageElement[];
	settings: {
		seoTitle?: string;
		seoDescription?: string;
		ogImage?: string;
		backgroundColor?: string;
		customCss?: string;
		customJs?: string;
	};
	status: "draft" | "published";
}

export interface Funnel {
	id: string;
	groupId: string;
	name: string;
	slug: string;
	description?: string;
	category: "ecommerce" | "webinar" | "lead-gen" | "book-launch" | "membership";
	steps: FunnelStep[];
	status: "draft" | "published";
	createdAt: string;
	updatedAt: string;
}

export interface PageBuilderContext {
	funnelId: string;
	stepId: string;
	step: FunnelStep;
	currentElement?: PageElement;
}
