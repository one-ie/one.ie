/**
 * Copywriting Frameworks
 * Classic conversion frameworks for generating compelling sales copy
 */

export interface CopywritingFramework {
	name: string;
	description: string;
	structure: string[];
	example: string;
}

/**
 * PAS - Pain, Agitate, Solve
 * Identifies customer pain, amplifies it, then presents your solution
 */
export const PAS: CopywritingFramework = {
	name: 'PAS (Pain, Agitate, Solve)',
	description: 'Identify pain point, amplify the problem, then present your solution',
	structure: [
		'Pain: What problem does your customer face?',
		'Agitate: Make them feel the pain more intensely',
		'Solve: Present your product as the solution'
	],
	example: `
Pain: Struggling to get clients as a freelancer?
Agitate: Every day without clients means money slipping away. Bills pile up. Opportunities vanish.
Solve: Master our proven system to land high-paying clients in 30 days or less.
	`.trim()
};

/**
 * AIDA - Attention, Interest, Desire, Action
 * Classic advertising formula
 */
export const AIDA: CopywritingFramework = {
	name: 'AIDA (Attention, Interest, Desire, Action)',
	description: 'Grab attention, build interest, create desire, drive action',
	structure: [
		'Attention: Bold statement or question',
		'Interest: Explain why this matters',
		'Desire: Show transformation they want',
		'Action: Clear call-to-action'
	],
	example: `
Attention: Still charging $50/hour while others earn $10K/month?
Interest: The freelance game changed. Hourly rates are dead. Packages are king.
Desire: Imagine landing 5-figure projects with clients who respect your expertise.
Action: Join 2,847 freelancers who transformed their income in 90 days.
	`.trim()
};

/**
 * FAB - Features, Advantages, Benefits
 * Connects product features to customer outcomes
 */
export const FAB: CopywritingFramework = {
	name: 'FAB (Features, Advantages, Benefits)',
	description: 'Connect product features to tangible customer benefits',
	structure: [
		'Features: What your product has',
		'Advantages: Why that matters technically',
		'Benefits: How it improves their life'
	],
	example: `
Feature: 50+ video lessons with step-by-step client acquisition
Advantage: Learn proven systems from 7-figure freelancers
Benefit: Land your first $5K client in 30 days without cold pitching
	`.trim()
};

/**
 * BAB - Before, After, Bridge
 * Paints contrast between current state and desired state
 */
export const BAB: CopywritingFramework = {
	name: 'BAB (Before, After, Bridge)',
	description: 'Show the transformation journey from before to after',
	structure: [
		'Before: Current painful situation',
		'After: Desired future state',
		'Bridge: How to get from before to after'
	],
	example: `
Before: Spending 40 hours/week hunting for clients on Upwork, competing on price
After: Clients reaching out to YOU with premium budgets, respecting your expertise
Bridge: Our Client Attraction System teaches positioning, outreach, and pricing strategies
	`.trim()
};

/**
 * 4 Ps - Picture, Promise, Prove, Push
 * Creates vivid imagery and social proof
 */
export const FourPs: CopywritingFramework = {
	name: '4 Ps (Picture, Promise, Prove, Push)',
	description: 'Paint picture, make promise, prove it works, push to action',
	structure: [
		'Picture: Paint vivid scene of transformation',
		'Promise: Make clear guarantee or commitment',
		'Prove: Show social proof and credibility',
		'Push: Strong call-to-action with urgency'
	],
	example: `
Picture: Imagine waking up to 3 new client inquiries, each with $10K+ budgets
Promise: Master client acquisition in 90 days or get your money back
Prove: Join 2,847 freelancers earning $10K+/month (verified on LinkedIn)
Push: 47 spots left. Price increases $200 on Friday. Enroll now.
	`.trim()
};

/**
 * All available frameworks
 */
export const FRAMEWORKS = {
	PAS,
	AIDA,
	FAB,
	BAB,
	FourPs
} as const;

/**
 * Get framework by key
 */
export function getFramework(key: keyof typeof FRAMEWORKS): CopywritingFramework {
	return FRAMEWORKS[key];
}

/**
 * Generate body copy using a specific framework
 */
export function generateBodyCopy(params: {
	framework: keyof typeof FRAMEWORKS;
	audience: string;
	product: string;
	transformation: string;
	uniqueValue: string;
}): string {
	const { framework, audience, product, transformation, uniqueValue } = params;
	const fw = getFramework(framework);

	// Template generation based on framework
	switch (framework) {
		case 'PAS':
			return `
Struggling with ${transformation.toLowerCase()}?

Most ${audience} face this exact challenge. They try the usual tactics—free content, social media, cold outreach—but nothing sticks. Days turn into weeks. Opportunities slip away. The frustration builds.

That's where ${product} changes everything. ${uniqueValue}. No more guessing. No more wasted time. Just results.
			`.trim();

		case 'AIDA':
			return `
Attention, ${audience}!

${transformation} isn't just possible—it's happening right now for thousands like you. The difference? They discovered ${product}.

Imagine: ${uniqueValue}. No more struggle. No more uncertainty. Just clear progress toward your goals.

Ready to join them? Start your transformation today.
			`.trim();

		case 'FAB':
			return `
${product} includes everything ${audience} need to ${transformation.toLowerCase()}.

What makes it different? ${uniqueValue}. This means you get results faster, with less trial and error.

The benefit to you? You'll finally achieve ${transformation.toLowerCase()} without the overwhelm. Simple. Proven. Effective.
			`.trim();

		case 'BAB':
			return `
Before: You're ${transformation.toLowerCase()}, stuck in the same patterns, wondering if it'll ever change.

After: ${uniqueValue}. You've got clarity, momentum, and results you can see.

How do you get there? ${product} bridges the gap with proven strategies used by thousands of ${audience}.
			`.trim();

		case 'FourPs':
			return `
Picture this: ${uniqueValue}. That's the reality for ${audience} who master ${product}.

We promise: You'll ${transformation.toLowerCase()} or we'll work with you until you do.

Don't just take our word for it. Thousands of ${audience} have already transformed their results.

Your spot is waiting. The question is: will you take it?
			`.trim();

		default:
			return '';
	}
}

/**
 * Generate structured framework content
 */
export function generateFrameworkContent(params: {
	framework: keyof typeof FRAMEWORKS;
	audience: string;
	product: string;
	painPoint: string;
	transformation: string;
	uniqueValue: string;
}): Record<string, string> {
	const { framework, audience, product, painPoint, transformation, uniqueValue } = params;

	switch (framework) {
		case 'PAS':
			return {
				pain: `${audience} struggle with ${painPoint}, feeling stuck and frustrated.`,
				agitate: `Every day without progress means missed opportunities and mounting pressure. The same tactics that worked before aren't working anymore.`,
				solve: `${product} provides ${uniqueValue}, helping you ${transformation} with proven strategies.`
			};

		case 'AIDA':
			return {
				attention: `Ready to ${transformation}?`,
				interest: `${audience} who master ${uniqueValue} see results 3x faster.`,
				desire: `Imagine having ${transformation} without the overwhelm or guesswork.`,
				action: `Join ${product} today and start your transformation.`
			};

		case 'FAB':
			return {
				feature: `${product} includes ${uniqueValue}`,
				advantage: `Unlike other solutions, this approach is proven by ${audience}`,
				benefit: `You'll ${transformation} without wasted time or effort.`
			};

		case 'BAB':
			return {
				before: `Currently: ${painPoint} holds you back from ${transformation}.`,
				after: `Future: ${uniqueValue} becomes your reality.`,
				bridge: `${product} shows you exactly how to bridge the gap.`
			};

		case 'FourPs':
			return {
				picture: `Imagine ${transformation} as your new normal. ${uniqueValue}.`,
				promise: `Master ${product} and ${transformation}, guaranteed.`,
				prove: `Trusted by thousands of ${audience} worldwide.`,
				push: `Limited spots available. Start your transformation now.`
			};

		default:
			return {};
	}
}
