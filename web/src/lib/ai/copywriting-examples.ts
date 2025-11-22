/**
 * AI Copywriting Tools - Usage Examples
 * Demonstrates how to use the copywriting tools programmatically
 */

import {
	generateHeadlines,
	generateCTA,
	generateFunnelCopy,
	analyzeHeadline,
	generateABTestHeadlines,
} from './copywriting-tools';

/**
 * Example 1: Generate Headlines for a Freelance Course
 */
export function example1_FreelanceCourse() {
	const headlines = generateHeadlines({
		audience: 'freelancers',
		product: 'Client Mastery Course',
		benefit: 'land high-paying clients consistently',
		tone: 'professional',
	});

	console.log('=== FREELANCE COURSE HEADLINES ===');
	headlines.forEach((headline, index) => {
		console.log(`${index + 1}. ${headline}`);
	});

	return headlines;
}

/**
 * Example 2: Generate CTAs with Different Urgency Levels
 */
export function example2_CTAVariations() {
	const highUrgency = generateCTA({
		action: 'signup',
		urgency: 'high',
		product: 'Client Mastery Course',
	});

	const mediumUrgency = generateCTA({
		action: 'signup',
		urgency: 'medium',
	});

	const lowUrgency = generateCTA({
		action: 'signup',
		urgency: 'low',
	});

	console.log('=== HIGH URGENCY CTAs ===');
	highUrgency.forEach((cta) => console.log(`- ${cta}`));

	console.log('\n=== MEDIUM URGENCY CTAs ===');
	mediumUrgency.forEach((cta) => console.log(`- ${cta}`));

	console.log('\n=== LOW URGENCY CTAs ===');
	lowUrgency.forEach((cta) => console.log(`- ${cta}`));

	return { highUrgency, mediumUrgency, lowUrgency };
}

/**
 * Example 3: Generate Complete Funnel Copy
 */
export function example3_CompleteFunnel() {
	const funnelCopy = generateFunnelCopy({
		audience: 'freelancers',
		product: 'Client Mastery Course',
		benefit: 'earn more money',
		painPoint: 'struggling to find quality clients who pay well',
		transformation: 'earn $10K/month with premium clients',
		uniqueValue: 'proven outreach templates and positioning strategies used by 7-figure freelancers',
		tone: 'professional',
		ctaAction: 'signup',
		urgency: 'high',
		framework: 'PAS',
	});

	console.log('=== COMPLETE FUNNEL COPY ===');
	console.log('\nHEADLINES:');
	funnelCopy.headlines.forEach((h, i) => console.log(`${i + 1}. ${h}`));

	console.log('\nCTAs:');
	funnelCopy.ctas.forEach((c, i) => console.log(`${i + 1}. ${c}`));

	console.log('\nBODY COPY:');
	console.log(funnelCopy.bodyCopy.fullCopy);

	console.log('\nSUBHEADLINES:');
	funnelCopy.subheadlines.forEach((s, i) => console.log(`${i + 1}. ${s}`));

	return funnelCopy;
}

/**
 * Example 4: Analyze Headline Effectiveness
 */
export function example4_HeadlineAnalysis() {
	const testHeadlines = [
		'Double Your Freelance Income in 90 Days',
		'Freelance Course',
		'How to Get More Clients',
		'The Ultimate Guide to Premium Freelancing for Professionals',
	];

	console.log('=== HEADLINE ANALYSIS ===');

	testHeadlines.forEach((headline) => {
		const analysis = analyzeHeadline(headline);

		console.log(`\nHeadline: "${headline}"`);
		console.log(`Score: ${analysis.score}/100`);
		console.log('Strengths:', analysis.strengths);
		console.log('Improvements:', analysis.improvements);
		console.log('Emotional Triggers:', analysis.emotionalTriggers);
	});

	return testHeadlines.map((h) => analyzeHeadline(h));
}

/**
 * Example 5: Generate A/B Test Variations
 */
export function example5_ABTesting() {
	const test = generateABTestHeadlines({
		audience: 'freelancers',
		product: 'Client Mastery Course',
		benefit: 'land high-paying clients',
	});

	console.log('=== A/B TEST VARIATIONS ===');
	console.log(`Variant A: ${test.variantA}`);
	console.log(`Variant B: ${test.variantB}`);
	console.log(`Hypothesis: ${test.hypothesis}`);

	return test;
}

/**
 * Example 6: Compare Different Frameworks
 */
export function example6_FrameworkComparison() {
	const frameworks = ['PAS', 'AIDA', 'FAB', 'BAB', 'FourPs'] as const;

	const params = {
		audience: 'small business owners',
		product: 'InvoiceFlow',
		benefit: 'get paid faster',
		painPoint: 'chasing late payments manually',
		transformation: 'automate invoicing and reduce payment delays',
		uniqueValue: 'automated reminders, one-click payments, and real-time tracking',
		tone: 'professional' as const,
		ctaAction: 'signup' as const,
		urgency: 'medium' as const,
	};

	console.log('=== FRAMEWORK COMPARISON ===');

	frameworks.forEach((framework) => {
		const copy = generateFunnelCopy({ ...params, framework });
		console.log(`\n--- ${framework} FRAMEWORK ---`);
		console.log(copy.bodyCopy.fullCopy);
	});

	return frameworks.map((framework) => generateFunnelCopy({ ...params, framework }));
}

/**
 * Example 7: Multi-Tone Headlines
 */
export function example7_ToneVariations() {
	const tones = ['professional', 'casual', 'urgent', 'friendly'] as const;

	const params = {
		audience: 'aspiring developers',
		product: 'Full-Stack Bootcamp',
		benefit: 'become job-ready in 12 weeks',
	};

	console.log('=== TONE VARIATIONS ===');

	tones.forEach((tone) => {
		const headlines = generateHeadlines({ ...params, tone });
		console.log(`\n${tone.toUpperCase()}:`);
		console.log(headlines[0]);
	});

	return tones.map((tone) => generateHeadlines({ ...params, tone }));
}

/**
 * Example 8: CTA Action Types
 */
export function example8_CTAActions() {
	const actions = ['signup', 'purchase', 'download', 'register', 'learn_more', 'get_started'] as const;

	console.log('=== CTA ACTION TYPES ===');

	actions.forEach((action) => {
		const ctas = generateCTA({ action, urgency: 'medium' });
		console.log(`\n${action.toUpperCase()}:`);
		console.log(ctas[0]);
	});

	return actions.map((action) => generateCTA({ action, urgency: 'medium' }));
}

/**
 * Example 9: SaaS Product Copy
 */
export function example9_SaaSProduct() {
	const funnelCopy = generateFunnelCopy({
		audience: 'small business owners',
		product: 'InvoiceFlow',
		benefit: 'get paid faster',
		painPoint: 'chasing late payments and managing invoices manually',
		transformation: 'automate invoicing and reduce payment delays by 50%',
		uniqueValue: 'automated reminders, one-click payments, and real-time tracking',
		tone: 'professional',
		ctaAction: 'get_started',
		urgency: 'medium',
		framework: 'BAB',
	});

	console.log('=== SaaS PRODUCT COPY (BAB Framework) ===');
	console.log('\nHeadline:', funnelCopy.headlines[0]);
	console.log('\nBody Copy:', funnelCopy.bodyCopy.fullCopy);
	console.log('\nCTA:', funnelCopy.ctas[0]);

	return funnelCopy;
}

/**
 * Example 10: Educational Course Copy
 */
export function example10_EducationalCourse() {
	const funnelCopy = generateFunnelCopy({
		audience: 'aspiring developers',
		product: 'Full-Stack Bootcamp',
		benefit: 'become job-ready in 12 weeks',
		painPoint: 'learning to code but not building real projects',
		transformation: 'get hired as a developer',
		uniqueValue: 'hands-on projects, code reviews, and career coaching from senior engineers',
		tone: 'friendly',
		ctaAction: 'register',
		urgency: 'high',
		framework: 'AIDA',
	});

	console.log('=== EDUCATIONAL COURSE COPY (AIDA Framework) ===');
	console.log('\nHeadline:', funnelCopy.headlines[0]);
	console.log('\nBody Copy:', funnelCopy.bodyCopy.fullCopy);
	console.log('\nCTA:', funnelCopy.ctas[0]);

	return funnelCopy;
}

/**
 * Run all examples
 */
export function runAllExamples() {
	console.log('\n\n========================================');
	console.log('AI COPYWRITING TOOLS - ALL EXAMPLES');
	console.log('========================================\n');

	example1_FreelanceCourse();
	console.log('\n');
	example2_CTAVariations();
	console.log('\n');
	example3_CompleteFunnel();
	console.log('\n');
	example4_HeadlineAnalysis();
	console.log('\n');
	example5_ABTesting();
	console.log('\n');
	example6_FrameworkComparison();
	console.log('\n');
	example7_ToneVariations();
	console.log('\n');
	example8_CTAActions();
	console.log('\n');
	example9_SaaSProduct();
	console.log('\n');
	example10_EducationalCourse();
}

// Export all examples
export const examples = {
	freelanceCourse: example1_FreelanceCourse,
	ctaVariations: example2_CTAVariations,
	completeFunnel: example3_CompleteFunnel,
	headlineAnalysis: example4_HeadlineAnalysis,
	abTesting: example5_ABTesting,
	frameworkComparison: example6_FrameworkComparison,
	toneVariations: example7_ToneVariations,
	ctaActions: example8_CTAActions,
	saasProduct: example9_SaaSProduct,
	educationalCourse: example10_EducationalCourse,
	runAll: runAllExamples,
};
