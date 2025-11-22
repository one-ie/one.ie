/**
 * AI Component Suggestions
 *
 * CYCLE 15: AI-powered component suggestions based on chat context
 *
 * Analyzes user messages and suggests relevant components:
 * - "I need a button" → suggests Button component
 * - "Add a pricing table" → suggests Card, Table components
 * - "Show user profiles" → suggests Avatar, PersonCard components
 */

import type { ComponentItem } from "@/stores/componentPicker";
import { ALL_COMPONENTS } from "@/lib/componentLibrary";

/**
 * Keyword mapping for component suggestions
 */
const KEYWORD_MAPPING: Record<string, string[]> = {
	// UI primitives
	button: ["button", "btn", "cta", "action", "click"],
	card: ["card", "box", "panel", "container"],
	badge: ["badge", "label", "tag", "pill"],
	avatar: ["avatar", "profile picture", "user image", "profile pic"],
	input: ["input", "text field", "form field", "text box"],
	select: ["select", "dropdown", "picker", "choose"],
	dialog: ["dialog", "modal", "popup", "overlay"],
	alert: ["alert", "message", "notification", "banner"],
	separator: ["separator", "divider", "line", "hr"],
	skeleton: ["skeleton", "loading", "placeholder"],

	// Layout
	accordion: ["accordion", "collapse", "expand", "faq"],
	tabs: ["tabs", "switcher", "navigation"],
	table: ["table", "grid", "data", "list"],

	// Features
	"thing-card": [
		"product card",
		"course card",
		"thing",
		"entity",
		"item card",
	],
	"person-card": [
		"user card",
		"profile card",
		"team member",
		"person",
		"user profile",
	],
	"event-item": [
		"activity",
		"timeline",
		"event",
		"history",
		"feed",
		"log",
	],
	"product-gallery": [
		"gallery",
		"image gallery",
		"product images",
		"photo gallery",
	],
	"chat-client": [
		"chat",
		"messaging",
		"conversation",
		"ai chat",
		"assistant",
	],
	"live-preview": [
		"editor",
		"code editor",
		"preview",
		"live code",
		"playground",
	],

	// E-commerce
	pricing: ["pricing", "price", "cost", "payment"],
	checkout: ["checkout", "cart", "purchase", "buy"],
	payment: ["payment", "pay", "stripe", "checkout"],

	// Forms
	form: ["form", "input", "submit", "validation"],
	login: ["login", "sign in", "authentication", "auth"],
	signup: ["signup", "sign up", "register", "create account"],

	// Data display
	chart: ["chart", "graph", "analytics", "data visualization"],
	stats: ["stats", "statistics", "metrics", "numbers"],

	// Crypto - Wallet
	"wallet-connect": ["wallet", "connect wallet", "web3", "metamask", "wallet connect"],
	"wallet-balance": ["balance", "wallet balance", "crypto balance", "token balance"],

	// Crypto - Payments
	"send-token": ["send", "transfer", "send crypto", "send token", "payment"],
	"receive-payment": ["receive", "receive payment", "accept crypto", "payment address"],

	// Crypto - DEX
	"token-swap": ["swap", "exchange", "trade", "dex", "uniswap", "token swap"],

	// Crypto - NFT
	"nft-card": ["nft", "nft card", "digital art", "collectible"],
	"nft-gallery": ["nft gallery", "nft collection", "art gallery"],
	"nft-marketplace": ["nft marketplace", "buy nft", "sell nft", "marketplace"],
};

/**
 * Analyze text and suggest components
 */
export function suggestComponents(text: string, limit = 5): ComponentItem[] {
	const lower = text.toLowerCase();
	const scores = new Map<string, number>();

	// Score each component based on keyword matches
	ALL_COMPONENTS.forEach((component) => {
		let score = 0;

		// Check component ID keywords
		const keywords = KEYWORD_MAPPING[component.id] || [];
		keywords.forEach((keyword) => {
			if (lower.includes(keyword)) {
				score += 10; // High weight for keyword match
			}
		});

		// Check component name
		if (lower.includes(component.name.toLowerCase())) {
			score += 15; // Highest weight for name match
		}

		// Check description
		if (lower.includes(component.description.toLowerCase())) {
			score += 5;
		}

		// Check tags
		component.tags?.forEach((tag) => {
			if (lower.includes(tag)) {
				score += 8;
			}
		});

		if (score > 0) {
			scores.set(component.id, score);
		}
	});

	// Sort by score and return top N
	const sorted = Array.from(scores.entries())
		.sort((a, b) => b[1] - a[1])
		.slice(0, limit);

	return sorted
		.map(([id]) => ALL_COMPONENTS.find((c) => c.id === id))
		.filter(Boolean) as ComponentItem[];
}

/**
 * Get suggestions from chat messages
 */
export function getSuggestionsFromChat(
	messages: Array<{ role: string; content: string }>,
	limit = 5
): ComponentItem[] {
	// Analyze last few user messages
	const recentUserMessages = messages
		.filter((m) => m.role === "user")
		.slice(-3)
		.map((m) => m.content)
		.join(" ");

	return suggestComponents(recentUserMessages, limit);
}

/**
 * Intent-based suggestions
 */
export interface Intent {
	type:
		| "create-page"
		| "add-form"
		| "show-data"
		| "user-profile"
		| "e-commerce"
		| "dashboard"
		| "chat"
		| "other";
	confidence: number;
}

export function detectIntent(text: string): Intent {
	const lower = text.toLowerCase();

	const intentPatterns: Array<{
		type: Intent["type"];
		patterns: string[];
	}> = [
		{
			type: "create-page",
			patterns: ["create page", "new page", "build page", "make page"],
		},
		{
			type: "add-form",
			patterns: ["add form", "create form", "form", "input", "submit"],
		},
		{
			type: "show-data",
			patterns: [
				"show data",
				"display data",
				"list",
				"table",
				"grid",
				"chart",
			],
		},
		{
			type: "user-profile",
			patterns: ["user", "profile", "account", "avatar", "person"],
		},
		{
			type: "e-commerce",
			patterns: [
				"shop",
				"product",
				"cart",
				"checkout",
				"buy",
				"sell",
				"price",
			],
		},
		{
			type: "dashboard",
			patterns: ["dashboard", "admin", "analytics", "stats", "metrics"],
		},
		{
			type: "chat",
			patterns: ["chat", "message", "conversation", "assistant"],
		},
	];

	let bestMatch: Intent = { type: "other", confidence: 0 };

	intentPatterns.forEach(({ type, patterns }) => {
		const matchCount = patterns.filter((pattern) =>
			lower.includes(pattern)
		).length;

		if (matchCount > 0) {
			const confidence = matchCount / patterns.length;
			if (confidence > bestMatch.confidence) {
				bestMatch = { type, confidence };
			}
		}
	});

	return bestMatch;
}

/**
 * Get components by intent
 */
export function getComponentsByIntent(intent: Intent["type"]): ComponentItem[] {
	const intentComponentMap: Record<Intent["type"], string[]> = {
		"create-page": ["card", "button", "separator"],
		"add-form": ["input", "select", "button", "form"],
		"show-data": ["table", "card", "badge"],
		"user-profile": ["avatar", "person-card", "badge"],
		"e-commerce": ["thing-card", "product-gallery", "button", "badge"],
		dashboard: ["card", "table", "badge", "separator"],
		chat: ["chat-client", "avatar", "badge"],
		other: [],
	};

	const componentIds = intentComponentMap[intent] || [];

	return componentIds
		.map((id) => ALL_COMPONENTS.find((c) => c.id === id))
		.filter(Boolean) as ComponentItem[];
}

/**
 * Smart suggestions combining keyword and intent analysis
 */
export function getSmartSuggestions(
	text: string,
	limit = 5
): ComponentItem[] {
	// 1. Get keyword-based suggestions
	const keywordSuggestions = suggestComponents(text, limit);

	// 2. Detect intent
	const intent = detectIntent(text);

	// 3. Get intent-based suggestions
	const intentSuggestions =
		intent.confidence > 0.5 ? getComponentsByIntent(intent.type) : [];

	// 4. Merge and deduplicate
	const combined = [...keywordSuggestions, ...intentSuggestions];
	const unique = Array.from(
		new Map(combined.map((c) => [c.id, c])).values()
	);

	return unique.slice(0, limit);
}
