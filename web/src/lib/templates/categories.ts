/**
 * Template Category System
 *
 * Organizes funnel templates by category and industry for filtering and navigation.
 * Integrates with ThingFilter component for multi-select filtering.
 *
 * Cycle 53: Template Category System
 */

import type { FilterConfig } from '@/components/ontology-ui/types';

// ============================================================================
// CATEGORY TYPES
// ============================================================================

/**
 * Template categories - primary classification by funnel type
 */
export type TemplateCategory =
  | 'lead-gen'
  | 'ecommerce'
  | 'webinar'
  | 'membership'
  | 'product-launch'
  | 'summit'
  | 'course-launch';

/**
 * Industry tags - secondary classification by business type
 */
export type IndustryTag =
  | 'saas'
  | 'coaching'
  | 'physical-products'
  | 'digital-products'
  | 'services'
  | 'consulting'
  | 'education'
  | 'fitness'
  | 'agency'
  | 'elearning';

/**
 * Additional filter tags
 */
export type TemplateTag =
  | 'beginner-friendly'
  | 'high-converting'
  | 'quick-setup'
  | 'advanced'
  | 'automated'
  | 'interactive'
  | 'high-ticket'
  | 'recurring-revenue'
  | 'list-building'
  | 'partnerships';

// ============================================================================
// CATEGORY METADATA
// ============================================================================

export interface CategoryMetadata {
  id: TemplateCategory;
  name: string;
  description: string;
  icon: string;
  color: string;
  useCases: string[];
  avgConversion: number; // Benchmark conversion rate
  idealFor: string[];
}

/**
 * Complete category definitions with metadata
 */
export const TEMPLATE_CATEGORIES: Record<TemplateCategory, CategoryMetadata> = {
  'lead-gen': {
    id: 'lead-gen',
    name: 'Lead Generation',
    description: 'Build your email list with free offers, quizzes, and lead magnets',
    icon: '📧',
    color: 'blue',
    useCases: [
      'Build email list',
      'Offer free PDF/checklist',
      'Segment audience with quiz',
      'Grow newsletter subscribers',
    ],
    avgConversion: 40,
    idealFor: ['Content creators', 'Bloggers', 'Coaches', 'Course creators'],
  },

  'ecommerce': {
    id: 'ecommerce',
    name: 'E-commerce',
    description: 'Product sales funnels with upsells, order bumps, and cart optimization',
    icon: '🛍️',
    color: 'green',
    useCases: [
      'Sell physical products',
      'Sell digital products',
      'Maximize cart value',
      'Tripwire offers',
    ],
    avgConversion: 30,
    idealFor: ['Product businesses', 'Store owners', 'Dropshippers', 'Digital product sellers'],
  },

  'webinar': {
    id: 'webinar',
    name: 'Webinar',
    description: 'Automated webinar funnels for teaching and selling high-ticket offers',
    icon: '🎥',
    color: 'purple',
    useCases: [
      'Sell high-ticket products ($500+)',
      'Automated sales presentations',
      'Build authority',
      'Educate and convert',
    ],
    avgConversion: 40,
    idealFor: ['Coaches', 'Consultants', 'Course creators', 'SaaS companies'],
  },

  'membership': {
    id: 'membership',
    name: 'Membership',
    description: 'Trial and subscription funnels for recurring revenue businesses',
    icon: '🔑',
    color: 'indigo',
    useCases: [
      'Membership sites',
      'Subscription services',
      'Online communities',
      'SaaS trial signups',
    ],
    avgConversion: 35,
    idealFor: ['Membership sites', 'SaaS', 'Communities', 'Subscription businesses'],
  },

  'product-launch': {
    id: 'product-launch',
    name: 'Product Launch',
    description: 'Pre-launch and launch funnels to build anticipation and early buyers',
    icon: '🚀',
    color: 'red',
    useCases: [
      'Launch new products',
      'Build pre-launch buzz',
      'Create waitlist',
      'Validate product ideas',
    ],
    avgConversion: 25,
    idealFor: ['Product businesses', 'Course creators', 'SaaS launches', 'Digital products'],
  },

  'summit': {
    id: 'summit',
    name: 'Virtual Summit',
    description: 'Multi-day virtual events with speaker sessions and all-access passes',
    icon: '🎤',
    color: 'orange',
    useCases: [
      'Host virtual summits',
      'Multi-speaker events',
      'List building at scale',
      'Build partnerships',
    ],
    avgConversion: 50,
    idealFor: ['Event organizers', 'Industry leaders', 'Community builders', 'Network builders'],
  },

  'course-launch': {
    id: 'course-launch',
    name: 'Course Launch',
    description: 'Complete course launch funnels with waitlist, launch, and enrollment',
    icon: '🎓',
    color: 'teal',
    useCases: [
      'Launch online courses',
      'Build course waitlist',
      'Enrollment campaigns',
      'Cohort launches',
    ],
    avgConversion: 30,
    idealFor: ['Course creators', 'Educators', 'Coaches', 'Training companies'],
  },
};

// ============================================================================
// INDUSTRY METADATA
// ============================================================================

export interface IndustryMetadata {
  id: IndustryTag;
  name: string;
  description: string;
  icon: string;
  recommendedCategories: TemplateCategory[];
}

/**
 * Industry tag definitions
 */
export const INDUSTRY_TAGS: Record<IndustryTag, IndustryMetadata> = {
  'saas': {
    id: 'saas',
    name: 'SaaS',
    description: 'Software as a Service businesses',
    icon: '💻',
    recommendedCategories: ['membership', 'webinar', 'product-launch'],
  },

  'coaching': {
    id: 'coaching',
    name: 'Coaching',
    description: 'Coaches, consultants, and mentors',
    icon: '🎯',
    recommendedCategories: ['webinar', 'lead-gen', 'membership'],
  },

  'physical-products': {
    id: 'physical-products',
    name: 'Physical Products',
    description: 'Physical goods and merchandise',
    icon: '📦',
    recommendedCategories: ['ecommerce', 'product-launch'],
  },

  'digital-products': {
    id: 'digital-products',
    name: 'Digital Products',
    description: 'eBooks, templates, software, downloads',
    icon: '💾',
    recommendedCategories: ['ecommerce', 'product-launch', 'lead-gen'],
  },

  'services': {
    id: 'services',
    name: 'Services',
    description: 'Service-based businesses',
    icon: '🛠️',
    recommendedCategories: ['lead-gen', 'webinar'],
  },

  'consulting': {
    id: 'consulting',
    name: 'Consulting',
    description: 'Professional consulting services',
    icon: '💼',
    recommendedCategories: ['webinar', 'lead-gen'],
  },

  'education': {
    id: 'education',
    name: 'Education',
    description: 'Educational content and courses',
    icon: '📚',
    recommendedCategories: ['course-launch', 'webinar', 'summit'],
  },

  'fitness': {
    id: 'fitness',
    name: 'Fitness',
    description: 'Fitness programs and training',
    icon: '💪',
    recommendedCategories: ['membership', 'course-launch', 'webinar'],
  },

  'agency': {
    id: 'agency',
    name: 'Agency',
    description: 'Marketing and service agencies',
    icon: '🎨',
    recommendedCategories: ['lead-gen', 'webinar'],
  },

  'elearning': {
    id: 'elearning',
    name: 'E-Learning',
    description: 'Online learning platforms',
    icon: '🎓',
    recommendedCategories: ['course-launch', 'membership', 'summit'],
  },
};

// ============================================================================
// FILTER INTEGRATION (ThingFilter)
// ============================================================================

/**
 * Convert category selection to FilterConfig for ThingFilter
 */
export function categoryToFilter(categories: TemplateCategory[]): FilterConfig[] {
  if (categories.length === 0) return [];

  // If single category, use equals
  if (categories.length === 1) {
    return [{
      field: 'category',
      operator: 'eq',
      value: categories[0],
    }];
  }

  // If multiple categories, create multiple filters
  return categories.map(category => ({
    field: 'category',
    operator: 'eq',
    value: category,
  }));
}

/**
 * Convert industry tags to FilterConfig for ThingFilter
 */
export function industryToFilter(industries: IndustryTag[]): FilterConfig[] {
  return industries.map(industry => ({
    field: 'tags',
    operator: 'contains',
    value: industry,
  }));
}

/**
 * Convert template tags to FilterConfig for ThingFilter
 */
export function tagsToFilter(tags: TemplateTag[]): FilterConfig[] {
  return tags.map(tag => ({
    field: 'tags',
    operator: 'contains',
    value: tag,
  }));
}

/**
 * Combine all filters into single FilterConfig array
 */
export function combineFilters(
  categories: TemplateCategory[],
  industries: IndustryTag[],
  tags: TemplateTag[]
): FilterConfig[] {
  return [
    ...categoryToFilter(categories),
    ...industryToFilter(industries),
    ...tagsToFilter(tags),
  ];
}

/**
 * Parse FilterConfig back to category/industry/tag selections
 */
export function parseFilters(filters: FilterConfig[]): {
  categories: TemplateCategory[];
  industries: IndustryTag[];
  tags: TemplateTag[];
} {
  const categories: TemplateCategory[] = [];
  const industries: IndustryTag[] = [];
  const tags: TemplateTag[] = [];

  filters.forEach(filter => {
    if (filter.field === 'category' && filter.operator === 'eq') {
      categories.push(filter.value as TemplateCategory);
    } else if (filter.field === 'tags' && filter.operator === 'contains') {
      const value = filter.value as string;
      if (value in INDUSTRY_TAGS) {
        industries.push(value as IndustryTag);
      } else {
        tags.push(value as TemplateTag);
      }
    }
  });

  return { categories, industries, tags };
}

// ============================================================================
// NAVIGATION TABS
// ============================================================================

export interface CategoryTab {
  id: TemplateCategory | 'all';
  label: string;
  icon: string;
  description: string;
  count?: number; // Template count (filled dynamically)
}

/**
 * Navigation tabs for category filtering
 */
export const CATEGORY_TABS: CategoryTab[] = [
  {
    id: 'all',
    label: 'All Templates',
    icon: '📋',
    description: 'Browse all available templates',
  },
  {
    id: 'lead-gen',
    label: 'Lead Gen',
    icon: '📧',
    description: 'Build your email list',
  },
  {
    id: 'ecommerce',
    label: 'E-commerce',
    icon: '🛍️',
    description: 'Sell products online',
  },
  {
    id: 'webinar',
    label: 'Webinar',
    icon: '🎥',
    description: 'Automated webinars',
  },
  {
    id: 'membership',
    label: 'Membership',
    icon: '🔑',
    description: 'Recurring revenue',
  },
  {
    id: 'product-launch',
    label: 'Launch',
    icon: '🚀',
    description: 'Product launches',
  },
  {
    id: 'summit',
    label: 'Summit',
    icon: '🎤',
    description: 'Virtual events',
  },
  {
    id: 'course-launch',
    label: 'Course',
    icon: '🎓',
    description: 'Course launches',
  },
];

// ============================================================================
// TEMPLATE FILTERING
// ============================================================================

/**
 * Filter templates by category
 */
export function filterByCategory<T extends { category: string }>(
  templates: T[],
  categories: TemplateCategory[]
): T[] {
  if (categories.length === 0) return templates;
  return templates.filter(t => categories.includes(t.category as TemplateCategory));
}

/**
 * Filter templates by industry tag
 */
export function filterByIndustry<T extends { tags?: string[] }>(
  templates: T[],
  industries: IndustryTag[]
): T[] {
  if (industries.length === 0) return templates;
  return templates.filter(t =>
    t.tags?.some(tag => industries.includes(tag as IndustryTag))
  );
}

/**
 * Filter templates by any tag
 */
export function filterByTags<T extends { tags?: string[] }>(
  templates: T[],
  tags: string[]
): T[] {
  if (tags.length === 0) return templates;
  return templates.filter(t =>
    t.tags?.some(tag => tags.includes(tag))
  );
}

/**
 * Apply all filters to template list
 */
export function applyFilters<T extends { category: string; tags?: string[] }>(
  templates: T[],
  filters: {
    categories?: TemplateCategory[];
    industries?: IndustryTag[];
    tags?: TemplateTag[];
  }
): T[] {
  let filtered = templates;

  if (filters.categories && filters.categories.length > 0) {
    filtered = filterByCategory(filtered, filters.categories);
  }

  if (filters.industries && filters.industries.length > 0) {
    filtered = filterByIndustry(filtered, filters.industries);
  }

  if (filters.tags && filters.tags.length > 0) {
    filtered = filterByTags(filtered, filters.tags);
  }

  return filtered;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get category metadata by ID
 */
export function getCategoryMetadata(category: TemplateCategory): CategoryMetadata {
  return TEMPLATE_CATEGORIES[category];
}

/**
 * Get all category IDs
 */
export function getAllCategories(): TemplateCategory[] {
  return Object.keys(TEMPLATE_CATEGORIES) as TemplateCategory[];
}

/**
 * Get all industry IDs
 */
export function getAllIndustries(): IndustryTag[] {
  return Object.keys(INDUSTRY_TAGS) as IndustryTag[];
}

/**
 * Get recommended categories for an industry
 */
export function getRecommendedCategories(industry: IndustryTag): TemplateCategory[] {
  return INDUSTRY_TAGS[industry].recommendedCategories;
}

/**
 * Search categories by name or description
 */
export function searchCategories(query: string): CategoryMetadata[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(TEMPLATE_CATEGORIES).filter(
    cat =>
      cat.name.toLowerCase().includes(lowerQuery) ||
      cat.description.toLowerCase().includes(lowerQuery) ||
      cat.useCases.some(uc => uc.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get category color class for Tailwind
 */
export function getCategoryColorClass(category: TemplateCategory): string {
  const color = TEMPLATE_CATEGORIES[category].color;
  return `bg-${color}-100 text-${color}-800 dark:bg-${color}-900 dark:text-${color}-200`;
}

/**
 * Get category icon
 */
export function getCategoryIcon(category: TemplateCategory): string {
  return TEMPLATE_CATEGORIES[category].icon;
}

/**
 * Get category name
 */
export function getCategoryName(category: TemplateCategory): string {
  return TEMPLATE_CATEGORIES[category].name;
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  CategoryMetadata,
  IndustryMetadata,
  CategoryTab,
};

export {
  TEMPLATE_CATEGORIES,
  INDUSTRY_TAGS,
  CATEGORY_TABS,
};
