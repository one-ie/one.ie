/**
 * AI Funnel Suggestion Logic
 *
 * Intelligent template matching based on user goals and intent.
 */

import type { FunnelTemplate } from './templates';
import { FUNNEL_TEMPLATES, TEMPLATES_BY_CATEGORY } from './templates';

// ============================================================================
// INTENT DETECTION
// ============================================================================

export interface UserIntent {
  goal: string; // What user wants to achieve
  pricePoint?: 'low' | 'medium' | 'high'; // Product price range
  experience?: 'beginner' | 'intermediate' | 'advanced'; // User experience level
  timeline?: 'quick' | 'normal' | 'comprehensive'; // Setup urgency
  keywords: string[]; // Extracted keywords from user input
}

export interface TemplateSuggestion {
  template: FunnelTemplate;
  score: number; // Match confidence 0-100
  reason: string; // Why this template was suggested
  alternatives?: FunnelTemplate[]; // Other good options
}

/**
 * Analyze user input and extract intent
 */
export function detectIntent(userInput: string): UserIntent {
  const input = userInput.toLowerCase();
  const keywords: string[] = [];

  // Goal detection - Order matters! Check specific keywords before general ones
  let goal = 'unknown';

  // Check specific intents first (webinar, quiz, summit, launch) before general "sell"
  if (input.includes('quiz') || input.includes('assessment') || input.includes('survey')) {
    goal = 'interactive-lead-gen';
    keywords.push('quiz', 'engagement', 'segmentation');
  } else if (
    input.includes('summit') ||
    input.includes('conference') ||
    input.includes('event') ||
    input.includes('multi-speaker')
  ) {
    goal = 'summit';
    keywords.push('summit', 'event', 'speakers');
  } else if (
    input.includes('webinar') ||
    input.includes('workshop') ||
    input.includes('training') ||
    input.includes('masterclass')
  ) {
    goal = 'webinar';
    keywords.push('webinar', 'education', 'high-ticket');
  } else if (
    input.includes('launch') ||
    input.includes('pre-launch') ||
    input.includes('coming soon') ||
    input.includes('waitlist')
  ) {
    goal = 'product-launch';
    keywords.push('launch', 'anticipation', 'pre-sale');
  } else if (
    input.includes('membership') ||
    input.includes('subscription') ||
    input.includes('recurring') ||
    input.includes('trial')
  ) {
    goal = 'membership';
    keywords.push('membership', 'subscription', 'recurring-revenue');
  } else if (
    input.includes('email') ||
    input.includes('list') ||
    input.includes('leads') ||
    input.includes('subscribers')
  ) {
    goal = 'build-email-list';
    keywords.push('email-list', 'lead-generation');
  } else if (
    input.includes('sell') ||
    input.includes('product') ||
    input.includes('ecommerce') ||
    input.includes('store') ||
    input.includes('shop')
  ) {
    goal = 'sell-product';
    keywords.push('ecommerce', 'sales', 'checkout');
  }

  // Price point detection
  let pricePoint: 'low' | 'medium' | 'high' | undefined;

  // Check for actual dollar amounts first
  const priceMatch = input.match(/\$(\d+)/);
  if (priceMatch) {
    const price = parseInt(priceMatch[1]);
    if (price < 100) {
      pricePoint = 'low';
    } else if (price < 500) {
      pricePoint = 'medium';
    } else {
      pricePoint = 'high';
    }
  }

  // Check for keyword-based price indicators (override if not already set)
  if (!pricePoint) {
    if (
      input.includes('cheap') ||
      input.includes('low price') ||
      input.includes('under $50') ||
      input.includes('tripwire')
    ) {
      pricePoint = 'low';
    } else if (
      input.includes('expensive') ||
      input.includes('high ticket') ||
      input.includes('premium') ||
      input.includes('over $500')
    ) {
      pricePoint = 'high';
    } else if (input.includes('mid price') || input.includes('$100-$500')) {
      pricePoint = 'medium';
    }
  }

  // Experience level detection
  let experience: 'beginner' | 'intermediate' | 'advanced' | undefined;

  if (
    input.includes('beginner') ||
    input.includes('first time') ||
    input.includes('new to') ||
    input.includes('simple')
  ) {
    experience = 'beginner';
  } else if (input.includes('advanced') || input.includes('complex') || input.includes('sophisticated')) {
    experience = 'advanced';
  } else if (input.includes('intermediate') || input.includes('some experience')) {
    experience = 'intermediate';
  }

  // Timeline detection
  let timeline: 'quick' | 'normal' | 'comprehensive' | undefined;

  if (
    input.includes('quick') ||
    input.includes('fast') ||
    input.includes('asap') ||
    input.includes('today')
  ) {
    timeline = 'quick';
  } else if (input.includes('detailed') || input.includes('comprehensive') || input.includes('complete')) {
    timeline = 'comprehensive';
  }

  return {
    goal,
    pricePoint,
    experience,
    timeline,
    keywords,
  };
}

// ============================================================================
// TEMPLATE MATCHING
// ============================================================================

/**
 * Score a template against user intent (0-100)
 */
function scoreTemplate(template: FunnelTemplate, intent: UserIntent): number {
  let score = 0;

  // Goal matching (40 points max)
  const goalScores: Record<string, { [key: string]: number }> = {
    'build-email-list': {
      'lead-magnet-basic': 40,
      'lead-magnet-quiz': 35,
      'virtual-summit': 30,
    },
    'interactive-lead-gen': {
      'lead-magnet-quiz': 40,
      'lead-magnet-basic': 20,
    },
    'product-launch': {
      'product-launch-seed': 40,
      'webinar-basic': 20,
    },
    'webinar': {
      'webinar-basic': 40,
      'product-launch-seed': 15,
    },
    'sell-product': {
      'ecommerce-tripwire': 40,
      'webinar-basic': 25,
      'product-launch-seed': 20,
    },
    'membership': {
      'membership-trial': 40,
      'webinar-basic': 20,
    },
    'summit': {
      'virtual-summit': 40,
      'webinar-basic': 15,
    },
  };

  if (goalScores[intent.goal]?.[template.id]) {
    score += goalScores[intent.goal][template.id];
  }

  // Experience level matching (20 points max)
  if (intent.experience) {
    if (intent.experience === 'beginner' && template.complexity === 'simple') {
      score += 20;
    } else if (intent.experience === 'intermediate' && template.complexity === 'medium') {
      score += 20;
    } else if (intent.experience === 'advanced' && template.complexity === 'advanced') {
      score += 20;
    } else if (intent.experience === 'beginner' && template.complexity === 'medium') {
      score += 10;
    } else if (intent.experience === 'intermediate' && template.complexity === 'simple') {
      score += 15;
    }
  }

  // Timeline matching (15 points max)
  if (intent.timeline) {
    const setupMinutes = parseInt(template.estimatedSetupTime);
    if (intent.timeline === 'quick' && setupMinutes <= 30) {
      score += 15;
    } else if (intent.timeline === 'normal' && setupMinutes <= 60) {
      score += 15;
    } else if (intent.timeline === 'comprehensive') {
      score += 15;
    }
  }

  // Price point matching (15 points max)
  if (intent.pricePoint) {
    const priceMatches: Record<string, string[]> = {
      low: ['lead-magnet-basic', 'lead-magnet-quiz', 'ecommerce-tripwire'],
      medium: ['webinar-basic', 'membership-trial', 'product-launch-seed'],
      high: ['webinar-basic', 'product-launch-seed', 'virtual-summit'],
    };

    if (priceMatches[intent.pricePoint].includes(template.id)) {
      score += 15;
    }
  }

  // Keyword matching (10 points max)
  const matchingKeywords = intent.keywords.filter((keyword) =>
    template.tags.some((tag) => tag.includes(keyword) || keyword.includes(tag))
  );
  score += Math.min(10, matchingKeywords.length * 5);

  // Special case: Course/coaching + high ticket = webinar is better
  if (
    template.id === 'webinar-basic' &&
    intent.pricePoint === 'high' &&
    intent.goal === 'sell-product'
  ) {
    score += 20; // Boost webinar for high-ticket product sales
  }

  // Special case: Physical products = ecommerce is better
  if (
    template.id === 'ecommerce-tripwire' &&
    intent.pricePoint === 'low' &&
    intent.goal === 'sell-product'
  ) {
    score += 10; // Boost ecommerce for low-ticket product sales
  }

  return Math.min(100, score);
}

/**
 * Get why this template matches user intent
 */
function getMatchReason(template: FunnelTemplate, intent: UserIntent): string {
  const reasons: string[] = [];

  // Goal-based reasons
  const goalReasons: Record<string, Record<string, string>> = {
    'build-email-list': {
      'lead-magnet-basic': 'Classic lead magnet funnel - proven 35% conversion rate for building email lists',
      'lead-magnet-quiz': 'Interactive quiz funnel - 45% conversion with audience segmentation',
      'virtual-summit': 'Multi-speaker summit - excellent for rapid list growth',
    },
    'interactive-lead-gen': {
      'lead-magnet-quiz': 'Perfect for segmentation and personalized recommendations',
      'lead-magnet-basic': 'Alternative: simpler setup if quiz seems complex',
    },
    'product-launch': {
      'product-launch-seed': 'Designed specifically for pre-launch buzz and waitlist building',
      'webinar-basic': 'Alternative: webinar-style launch presentation',
    },
    'webinar': {
      'webinar-basic': 'Complete automated webinar funnel with 40% registration conversion',
      'product-launch-seed': 'Alternative: if webinar is for product launch',
    },
    'sell-product': {
      'ecommerce-tripwire': 'Optimized for product sales with upsells to maximize AOV',
      'webinar-basic': 'Alternative: better for high-ticket products ($500+)',
      'product-launch-seed': 'Alternative: if this is a new product launch',
    },
    'membership': {
      'membership-trial': '$1 trial funnel optimized for recurring revenue',
      'webinar-basic': 'Alternative: webinar to sell membership upfront',
    },
    'summit': {
      'virtual-summit': 'Complete summit infrastructure with All-Access upsell',
      'webinar-basic': 'Alternative: simplified single-speaker event',
    },
  };

  if (goalReasons[intent.goal]?.[template.id]) {
    reasons.push(goalReasons[intent.goal][template.id]);
  }

  // Experience-based reasons
  if (intent.experience === 'beginner' && template.complexity === 'simple') {
    reasons.push('Simple setup - perfect for beginners');
  } else if (intent.experience === 'beginner' && template.complexity === 'medium') {
    reasons.push('Slightly more complex but includes detailed guidance');
  }

  // Timeline-based reasons
  const setupMinutes = parseInt(template.estimatedSetupTime);
  if (intent.timeline === 'quick' && setupMinutes <= 30) {
    reasons.push(`Quick setup in ${template.estimatedSetupTime}`);
  }

  // Conversion rate reason
  if (template.conversionRate >= 40) {
    reasons.push(`High ${template.conversionRate}% conversion rate`);
  }

  return reasons.join('. ') || `Good match for ${intent.goal.replace(/-/g, ' ')}`;
}

/**
 * Suggest templates based on user intent
 */
export function suggestTemplates(intent: UserIntent): TemplateSuggestion[] {
  const scoredTemplates = FUNNEL_TEMPLATES.map((template) => ({
    template,
    score: scoreTemplate(template, intent),
    reason: getMatchReason(template, intent),
  }));

  // Sort by score
  scoredTemplates.sort((a, b) => b.score - a.score);

  // Get top 3 suggestions
  const topSuggestions = scoredTemplates.slice(0, 3);

  // Add alternatives to top suggestion
  if (topSuggestions.length > 0) {
    topSuggestions[0].alternatives = topSuggestions
      .slice(1)
      .map((s) => s.template)
      .slice(0, 2);
  }

  return topSuggestions;
}

/**
 * Quick suggest from user input string
 */
export function suggestFromInput(userInput: string): TemplateSuggestion[] {
  const intent = detectIntent(userInput);
  return suggestTemplates(intent);
}

// ============================================================================
// TEMPLATE QUERY HELPERS
// ============================================================================

/**
 * Get template by ID
 */
export function getTemplateById(id: string): FunnelTemplate | undefined {
  return FUNNEL_TEMPLATES.find((t) => t.id === id);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(
  category: 'lead-gen' | 'product-launch' | 'webinar' | 'ecommerce' | 'membership' | 'summit'
): FunnelTemplate[] {
  return TEMPLATES_BY_CATEGORY[category] || [];
}

/**
 * Get templates by complexity
 */
export function getTemplatesByComplexity(
  complexity: 'simple' | 'medium' | 'advanced'
): FunnelTemplate[] {
  return FUNNEL_TEMPLATES.filter((t) => t.complexity === complexity);
}

/**
 * Search templates by keyword
 */
export function searchTemplates(query: string): FunnelTemplate[] {
  const q = query.toLowerCase();

  return FUNNEL_TEMPLATES.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.includes(q)) ||
      t.suggestedFor.some((use) => use.toLowerCase().includes(q))
  );
}

/**
 * Get templates for beginners
 */
export function getBeginnerTemplates(): FunnelTemplate[] {
  return FUNNEL_TEMPLATES.filter(
    (t) => t.complexity === 'simple' || (t.complexity === 'medium' && t.tags.includes('beginner-friendly'))
  );
}

/**
 * Get quick setup templates (< 45 minutes)
 */
export function getQuickTemplates(): FunnelTemplate[] {
  return FUNNEL_TEMPLATES.filter((t) => {
    const minutes = parseInt(t.estimatedSetupTime);
    return minutes <= 45;
  });
}

/**
 * Get high-converting templates (> 35% conversion rate)
 */
export function getHighConvertingTemplates(): FunnelTemplate[] {
  return FUNNEL_TEMPLATES.filter((t) => t.conversionRate >= 35);
}

// ============================================================================
// AI ASSISTANT HELPERS
// ============================================================================

export interface AIRecommendation {
  primary: TemplateSuggestion;
  alternatives: TemplateSuggestion[];
  explanation: string;
  nextSteps: string[];
}

/**
 * Get complete AI recommendation with explanation and next steps
 */
export function getAIRecommendation(userInput: string): AIRecommendation {
  const suggestions = suggestFromInput(userInput);

  if (suggestions.length === 0) {
    return {
      primary: {
        template: FUNNEL_TEMPLATES[0], // Default to lead magnet
        score: 50,
        reason: 'Default suggestion - lead generation is a great starting point',
      },
      alternatives: [],
      explanation: 'I recommend starting with a simple lead magnet funnel to build your email list.',
      nextSteps: [
        'Choose your lead magnet type (PDF, checklist, template, etc.)',
        'Write compelling copy for your opt-in page',
        'Set up email delivery',
        'Create a thank-you page',
      ],
    };
  }

  const primary = suggestions[0];
  const alternatives = suggestions.slice(1);

  // Generate explanation
  const explanation = `Based on your goal to ${primary.reason.toLowerCase()}, I recommend the **${primary.template.name}**.

This funnel has a proven ${primary.template.conversionRate}% conversion rate and typically takes ${primary.template.estimatedSetupTime} to set up.
It includes ${primary.template.steps.length} pages and is perfect for: ${primary.template.suggestedFor.slice(0, 2).join(', ')}.`;

  // Generate next steps
  const nextSteps = [
    `Review the ${primary.template.steps.length}-step funnel structure`,
    `Customize the copy templates for ${primary.template.steps[0].name}`,
    primary.template.steps.length > 2
      ? `Set up ${primary.template.steps[1].name} with suggested elements`
      : null,
    `Configure colors and branding`,
    `Test the complete funnel flow`,
  ].filter(Boolean) as string[];

  return {
    primary,
    alternatives,
    explanation,
    nextSteps,
  };
}

/**
 * Compare two templates
 */
export interface TemplateComparison {
  template1: FunnelTemplate;
  template2: FunnelTemplate;
  differences: string[];
  bestFor: {
    template1: string[];
    template2: string[];
  };
}

export function compareTemplates(id1: string, id2: string): TemplateComparison | null {
  const t1 = getTemplateById(id1);
  const t2 = getTemplateById(id2);

  if (!t1 || !t2) return null;

  const differences: string[] = [];
  const bestFor = {
    template1: [] as string[],
    template2: [] as string[],
  };

  // Compare complexity
  if (t1.complexity !== t2.complexity) {
    differences.push(
      `${t1.name} is ${t1.complexity} while ${t2.name} is ${t2.complexity} complexity`
    );

    if (t1.complexity === 'simple') {
      bestFor.template1.push('Beginners and quick setup');
      bestFor.template2.push('More experienced users');
    } else if (t2.complexity === 'simple') {
      bestFor.template2.push('Beginners and quick setup');
      bestFor.template1.push('More experienced users');
    }
  }

  // Compare setup time
  const time1 = parseInt(t1.estimatedSetupTime);
  const time2 = parseInt(t2.estimatedSetupTime);
  if (time1 !== time2) {
    differences.push(`${t1.name} takes ${t1.estimatedSetupTime} vs ${t2.estimatedSetupTime}`);

    if (time1 < time2) {
      bestFor.template1.push('Faster launch');
    } else {
      bestFor.template2.push('Faster launch');
    }
  }

  // Compare conversion rates
  if (t1.conversionRate !== t2.conversionRate) {
    differences.push(
      `${t1.name} has ${t1.conversionRate}% conversion rate vs ${t2.conversionRate}%`
    );

    if (t1.conversionRate > t2.conversionRate) {
      bestFor.template1.push('Higher conversion rates');
    } else {
      bestFor.template2.push('Higher conversion rates');
    }
  }

  // Compare number of steps
  if (t1.steps.length !== t2.steps.length) {
    differences.push(`${t1.name} has ${t1.steps.length} pages vs ${t2.steps.length} pages`);
  }

  // Category differences
  if (t1.category !== t2.category) {
    differences.push(`${t1.name} is for ${t1.category} while ${t2.name} is for ${t2.category}`);
  }

  // Use cases
  bestFor.template1.push(...t1.suggestedFor.slice(0, 2));
  bestFor.template2.push(...t2.suggestedFor.slice(0, 2));

  return {
    template1: t1,
    template2: t2,
    differences,
    bestFor,
  };
}
