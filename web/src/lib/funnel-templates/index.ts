/**
 * Funnel Templates Library
 *
 * AI-powered funnel suggestions with 7 proven templates across 6 categories.
 *
 * @example Basic usage
 * ```ts
 * import { suggestFromInput, getTemplateById } from '@/lib/funnel-templates';
 *
 * // Get AI suggestion
 * const suggestions = suggestFromInput("I want to build my email list");
 * console.log(suggestions[0].template.name); // "Simple Lead Magnet Funnel"
 *
 * // Get specific template
 * const template = getTemplateById('webinar-basic');
 * console.log(template.steps.length); // 4 pages
 * ```
 *
 * @example Advanced usage
 * ```ts
 * import {
 *   detectIntent,
 *   suggestTemplates,
 *   getAIRecommendation,
 *   compareTemplates
 * } from '@/lib/funnel-templates';
 *
 * // Manual intent detection
 * const intent = detectIntent("I'm launching a new course with a webinar");
 * const suggestions = suggestTemplates(intent);
 *
 * // Get complete AI recommendation
 * const recommendation = getAIRecommendation("sell my online course");
 * console.log(recommendation.explanation);
 * console.log(recommendation.nextSteps);
 *
 * // Compare two templates
 * const comparison = compareTemplates('lead-magnet-basic', 'lead-magnet-quiz');
 * console.log(comparison?.differences);
 * ```
 */

// ============================================================================
// EXPORTS - TEMPLATES
// ============================================================================

export {
  // Types
  type ElementSuggestion,
  type TemplateStep,
  type FunnelTemplate,

  // Individual Templates
  leadMagnetBasic,
  leadMagnetQuiz,
  productLaunchSeed,
  webinarBasic,
  ecommerceTripwire,
  membershipTrial,
  virtualSummit,

  // Template Collections
  FUNNEL_TEMPLATES,
  TEMPLATES_BY_CATEGORY,
  TEMPLATES_BY_COMPLEXITY,
} from './templates';

// ============================================================================
// EXPORTS - SUGGESTIONS
// ============================================================================

export {
  // Types
  type UserIntent,
  type TemplateSuggestion,
  type AIRecommendation,
  type TemplateComparison,

  // Intent Detection
  detectIntent,

  // Template Matching
  suggestTemplates,
  suggestFromInput,

  // Template Queries
  getTemplateById,
  getTemplatesByCategory,
  getTemplatesByComplexity,
  searchTemplates,
  getBeginnerTemplates,
  getQuickTemplates,
  getHighConvertingTemplates,

  // AI Helpers
  getAIRecommendation,
  compareTemplates,
} from './suggestions';

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

/**
 * Quick template lookup by common names
 */
export const QUICK_LOOKUP = {
  // Lead generation
  'lead-magnet': 'lead-magnet-basic',
  'quiz-funnel': 'lead-magnet-quiz',
  'email-list': 'lead-magnet-basic',

  // Product launch
  'product-launch': 'product-launch-seed',
  'coming-soon': 'product-launch-seed',
  'pre-launch': 'product-launch-seed',

  // Webinar
  'webinar': 'webinar-basic',
  'workshop': 'webinar-basic',
  'training': 'webinar-basic',

  // E-commerce
  'ecommerce': 'ecommerce-tripwire',
  'product-sales': 'ecommerce-tripwire',
  'tripwire': 'ecommerce-tripwire',

  // Membership
  'membership': 'membership-trial',
  'subscription': 'membership-trial',
  'trial': 'membership-trial',

  // Summit
  'summit': 'virtual-summit',
  'conference': 'virtual-summit',
  'event': 'virtual-summit',
} as const;

/**
 * Template categories with descriptions
 */
export const CATEGORIES = {
  'lead-gen': {
    name: 'Lead Generation',
    description: 'Build your email list with free offers and quizzes',
    icon: '📧',
    templates: 2,
  },
  'product-launch': {
    name: 'Product Launch',
    description: 'Create buzz and waitlists for new product launches',
    icon: '🚀',
    templates: 1,
  },
  'webinar': {
    name: 'Webinar',
    description: 'Automated webinar funnels for high-ticket sales',
    icon: '🎥',
    templates: 1,
  },
  'ecommerce': {
    name: 'E-commerce',
    description: 'Product sales with upsells and order bumps',
    icon: '🛍️',
    templates: 1,
  },
  'membership': {
    name: 'Membership',
    description: 'Trial funnels for recurring revenue businesses',
    icon: '🔑',
    templates: 1,
  },
  'summit': {
    name: 'Virtual Summit',
    description: 'Multi-day events with speaker sessions',
    icon: '🎤',
    templates: 1,
  },
} as const;

/**
 * Complexity levels with recommendations
 */
export const COMPLEXITY_GUIDE = {
  simple: {
    name: 'Simple',
    description: 'Quick setup, beginner-friendly, 2-3 pages',
    recommended: 'First funnel or testing new ideas',
    setupTime: '< 30 minutes',
  },
  medium: {
    name: 'Medium',
    description: 'Moderate complexity, 3-5 pages with advanced features',
    recommended: 'Established business with some funnel experience',
    setupTime: '30-60 minutes',
  },
  advanced: {
    name: 'Advanced',
    description: 'Comprehensive multi-page funnels with automation',
    recommended: 'Expert marketers and major launches',
    setupTime: '60-90 minutes',
  },
} as const;

/**
 * Common use case to template mapping
 */
export const USE_CASE_MAP: Record<string, string[]> = {
  'Build email list': ['lead-magnet-basic', 'lead-magnet-quiz', 'virtual-summit'],
  'Sell digital product': ['ecommerce-tripwire', 'webinar-basic', 'product-launch-seed'],
  'Sell physical product': ['ecommerce-tripwire'],
  'Launch new product': ['product-launch-seed', 'webinar-basic'],
  'Sell high-ticket ($500+)': ['webinar-basic', 'membership-trial'],
  'Recurring revenue': ['membership-trial'],
  'Host virtual event': ['virtual-summit', 'webinar-basic'],
  'Segment audience': ['lead-magnet-quiz'],
  'Quick win / test idea': ['lead-magnet-basic', 'ecommerce-tripwire'],
};

/**
 * Template statistics for AI context
 */
export const TEMPLATE_STATS = {
  total: 7,
  categories: 6,
  avgConversionRate: 37, // Average across all templates
  avgSetupTime: '50 minutes',
  totalSteps: 26, // Total pages across all templates
  complexityDistribution: {
    simple: 1,
    medium: 5,
    advanced: 1,
  },
} as const;
