/**
 * AI Copywriting Tools
 * Generate compelling headlines, CTAs, and body copy for funnel elements
 */

import { generateBodyCopy, generateFrameworkContent, type FRAMEWORKS } from './copywriting-frameworks';

export type Tone = 'professional' | 'casual' | 'urgent' | 'friendly';
export type CTAAction = 'signup' | 'purchase' | 'download' | 'register' | 'learn_more' | 'get_started';
export type Urgency = 'high' | 'medium' | 'low';

/**
 * Generate 5 headline variations based on parameters
 */
export function generateHeadlines(params: {
	audience: string;
	product: string;
	benefit: string;
	tone?: Tone;
}): string[] {
	const { audience, product, benefit, tone = 'professional' } = params;

	// Headline templates based on proven formulas
	const templates = {
		professional: [
			`${benefit} for ${audience}: The ${product} Advantage`,
			`How ${audience} ${benefit} with ${product}`,
			`The Complete ${product} Guide for ${audience}`,
			`${benefit}: A ${product} Solution for ${audience}`,
			`Transform Your Results: ${product} for ${audience}`
		],
		casual: [
			`Hey ${audience}! Ready to ${benefit}?`,
			`${benefit} Without the BS: ${product}`,
			`The No-Fluff Guide to ${benefit}`,
			`${audience}: Here's How to ${benefit}`,
			`Finally! ${product} That Actually Works`
		],
		urgent: [
			`URGENT: ${audience} Must ${benefit} Now`,
			`Last Chance for ${audience} to ${benefit}`,
			`Don't Miss Out: ${benefit} Ends Soon`,
			`Time-Sensitive: ${product} for ${audience}`,
			`${benefit} Before It's Too Late`
		],
		friendly: [
			`Let's Help You ${benefit}!`,
			`Your Journey to ${benefit} Starts Here`,
			`We Made ${benefit} Easy for ${audience}`,
			`${audience}, Meet Your New ${product}`,
			`Making ${benefit} Simple with ${product}`
		]
	};

	const baseHeadlines = templates[tone];

	// Add number-based variations
	const numberHeadlines = [
		`5 Ways ${audience} Can ${benefit} with ${product}`,
		`The 3-Step ${product} System for ${audience}`,
		`7 Secrets to ${benefit} Using ${product}`,
		`10X Your Results: ${product} for ${audience}`,
		`The ${benefit} Blueprint: 4 Proven Strategies`
	];

	// Add transformation-based headlines
	const transformationHeadlines = [
		`From Struggling to Thriving: ${product} for ${audience}`,
		`Double Your ${benefit} in 90 Days`,
		`The ${product} That Changed Everything for ${audience}`,
		`Before vs After: ${product} Results for ${audience}`,
		`How ${audience} 10X Their ${benefit}`
	];

	// Combine and return best 5
	const allHeadlines = [...baseHeadlines, ...numberHeadlines, ...transformationHeadlines];

	// Return 5 varied headlines
	return [
		allHeadlines[0],  // Tone-specific
		numberHeadlines[0],  // Number-based
		transformationHeadlines[0],  // Transformation
		allHeadlines[5],  // Another tone-specific
		numberHeadlines[2]  // Another number-based
	];
}

/**
 * Generate compelling CTA button text
 */
export function generateCTA(params: {
	action: CTAAction;
	urgency?: Urgency;
	product?: string;
}): string[] {
	const { action, urgency = 'medium', product } = params;

	const ctaMap: Record<CTAAction, Record<Urgency, string[]>> = {
		signup: {
			high: [
				'Sign Up NOW - Spots Filling Fast',
				'Claim Your Spot (Only 12 Left)',
				'Join Before It\'s Too Late',
				'Last Chance to Sign Up',
				'Secure Your Access Now'
			],
			medium: [
				'Start Your Free Trial',
				'Get Instant Access',
				'Join Today',
				'Sign Up Now',
				'Create Your Account'
			],
			low: [
				'Try It Free',
				'Get Started',
				'Sign Me Up',
				'Join the Waitlist',
				'Learn More'
			]
		},
		purchase: {
			high: [
				'Buy Now - Price Increases Tonight',
				'Add to Cart (Sale Ends Soon)',
				'Grab Yours Before They\'re Gone',
				'Purchase Now - Limited Stock',
				'Secure Your Order Today'
			],
			medium: [
				'Buy Now',
				'Add to Cart',
				'Get Yours Today',
				'Purchase Now',
				'Order Now'
			],
			low: [
				'Shop Now',
				'View Options',
				'See Pricing',
				'Explore Plans',
				'Browse Products'
			]
		},
		download: {
			high: [
				'Download Now (Expires in 24h)',
				'Get Instant Download',
				'Download Free Guide Today',
				'Claim Your Free Download',
				'Access Limited-Time Download'
			],
			medium: [
				'Download Free Guide',
				'Get Your Copy',
				'Download Now',
				'Access Now',
				'Get the Guide'
			],
			low: [
				'View Sample',
				'Preview Download',
				'See What\'s Inside',
				'Learn More',
				'Explore Contents'
			]
		},
		register: {
			high: [
				'Register Now - Event Starts Soon',
				'Save Your Seat (Limited)',
				'Register Before Deadline',
				'Claim Your Spot Today',
				'Lock In Your Registration'
			],
			medium: [
				'Register Today',
				'Reserve Your Spot',
				'Sign Up for Event',
				'Join the Event',
				'Register Now'
			],
			low: [
				'Learn More About Event',
				'See Event Details',
				'View Schedule',
				'Get Event Info',
				'Explore Agenda'
			]
		},
		learn_more: {
			high: [
				'Discover the Secret Now',
				'See How It Works (Free)',
				'Uncover the Strategy',
				'Get the Inside Scoop',
				'Find Out Why'
			],
			medium: [
				'Learn More',
				'Discover How',
				'See How It Works',
				'Find Out More',
				'Explore Benefits'
			],
			low: [
				'Read More',
				'View Details',
				'See Features',
				'Browse Info',
				'Learn About Us'
			]
		},
		get_started: {
			high: [
				'Start Now - Don\'t Wait',
				'Begin Your Journey Today',
				'Get Started Immediately',
				'Launch Your Success',
				'Start Your Transformation'
			],
			medium: [
				'Get Started',
				'Begin Now',
				'Start Today',
				'Launch Now',
				'Take the First Step'
			],
			low: [
				'Explore Options',
				'See How to Start',
				'View Getting Started',
				'Learn the Basics',
				'Discover More'
			]
		}
	};

	const ctas = ctaMap[action][urgency];

	// If product name provided, personalize one CTA
	if (product) {
		return [
			...ctas.slice(0, 4),
			`Get ${product} Now`
		];
	}

	return ctas;
}

/**
 * Generate body copy using copywriting framework
 */
export function generateBodyCopyTool(params: {
	framework: keyof typeof FRAMEWORKS;
	audience: string;
	product: string;
	painPoint: string;
	transformation: string;
	uniqueValue: string;
}): {
	fullCopy: string;
	sections: Record<string, string>;
} {
	const { framework, audience, product, painPoint, transformation, uniqueValue } = params;

	return {
		fullCopy: generateBodyCopy({
			framework,
			audience,
			product,
			transformation,
			uniqueValue
		}),
		sections: generateFrameworkContent({
			framework,
			audience,
			product,
			painPoint,
			transformation,
			uniqueValue
		})
	};
}

/**
 * Generate complete funnel element copy
 */
export function generateFunnelCopy(params: {
	audience: string;
	product: string;
	benefit: string;
	painPoint: string;
	transformation: string;
	uniqueValue: string;
	tone?: Tone;
	ctaAction?: CTAAction;
	urgency?: Urgency;
	framework?: keyof typeof FRAMEWORKS;
}) {
	const {
		audience,
		product,
		benefit,
		painPoint,
		transformation,
		uniqueValue,
		tone = 'professional',
		ctaAction = 'get_started',
		urgency = 'medium',
		framework = 'PAS'
	} = params;

	return {
		headlines: generateHeadlines({ audience, product, benefit, tone }),
		ctas: generateCTA({ action: ctaAction, urgency, product }),
		bodyCopy: generateBodyCopyTool({
			framework,
			audience,
			product,
			painPoint,
			transformation,
			uniqueValue
		}),
		subheadlines: [
			`Trusted by ${audience} Worldwide`,
			`${transformation} in Record Time`,
			`The ${product} Advantage`,
			`Join Thousands of Successful ${audience}`,
			`Your Journey to ${benefit} Starts Here`
		]
	};
}

/**
 * A/B test headline variations
 */
export function generateABTestHeadlines(params: {
	audience: string;
	product: string;
	benefit: string;
}): {
	variantA: string;
	variantB: string;
	hypothesis: string;
} {
	const { audience, product, benefit } = params;

	return {
		variantA: `How ${audience} ${benefit} with ${product}`,
		variantB: `${benefit} for ${audience}: The ${product} Advantage`,
		hypothesis: 'Variant A focuses on "how" (process), Variant B emphasizes "advantage" (outcome). Test which resonates more with your audience.'
	};
}

/**
 * Analyze headline effectiveness
 */
export function analyzeHeadline(headline: string): {
	score: number;
	strengths: string[];
	improvements: string[];
	emotionalTriggers: string[];
} {
	const strengths: string[] = [];
	const improvements: string[] = [];
	const emotionalTriggers: string[] = [];
	let score = 50; // Base score

	// Check for numbers
	if (/\d+/.test(headline)) {
		strengths.push('Contains specific numbers (increases credibility)');
		score += 10;
	} else {
		improvements.push('Consider adding numbers (e.g., "5 Ways", "3-Step")');
	}

	// Check for power words
	const powerWords = ['secret', 'proven', 'guaranteed', 'ultimate', 'complete', 'essential', 'master'];
	const hasPowerWords = powerWords.some(word => headline.toLowerCase().includes(word));
	if (hasPowerWords) {
		strengths.push('Uses power words that drive action');
		score += 10;
	}

	// Check for emotional triggers
	const emotions = {
		curiosity: ['how', 'why', 'what', 'secret', 'discover'],
		urgency: ['now', 'today', 'urgent', 'limited', 'last chance'],
		benefit: ['easy', 'simple', 'fast', 'proven', 'guaranteed'],
		transformation: ['transform', 'change', 'improve', 'boost', 'increase']
	};

	Object.entries(emotions).forEach(([emotion, words]) => {
		if (words.some(word => headline.toLowerCase().includes(word))) {
			emotionalTriggers.push(emotion);
			score += 5;
		}
	});

	// Check length (optimal: 6-12 words)
	const wordCount = headline.split(/\s+/).length;
	if (wordCount >= 6 && wordCount <= 12) {
		strengths.push('Optimal length (6-12 words)');
		score += 10;
	} else if (wordCount < 6) {
		improvements.push('Too short - add more detail or benefit');
		score -= 5;
	} else {
		improvements.push('Too long - make it more concise');
		score -= 5;
	}

	// Check for clear benefit
	const benefitWords = ['how to', 'get', 'earn', 'save', 'learn', 'discover', 'achieve'];
	if (benefitWords.some(word => headline.toLowerCase().includes(word))) {
		strengths.push('Clearly states a benefit');
		score += 15;
	} else {
		improvements.push('Make the benefit more explicit');
	}

	// Ensure score is between 0-100
	score = Math.max(0, Math.min(100, score));

	return {
		score,
		strengths,
		improvements,
		emotionalTriggers
	};
}
