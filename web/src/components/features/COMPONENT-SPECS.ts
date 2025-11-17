/**
 * Component Specifications for Features System
 *
 * This document defines all components used in the features documentation system,
 * including their props, variants, states, and accessibility requirements.
 *
 * PRINCIPLE: Components must be simple, reusable, and follow the ontology's
 * dimension framework. Each component renders one specific dimension.
 */

import type { ReactNode } from "react";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Core feature data type - represents a "thing" in the ontology
 * Maps to backend things table with type: "feature"
 */
export interface Feature {
  id: string;
  name: string;
  description: string;
  status: "completed" | "in_development" | "planned" | "deprecated";
  category: string;
  properties: {
    tags?: string[];
    icon?: string;
    difficulty?: "beginner" | "intermediate" | "advanced";
    estimatedReleaseDate?: string;
    relatedFeatures?: string[];
    dependencies?: string[];
  };
  createdAt: number;
  updatedAt: number;
}

/**
 * Feature stat data type
 * Used to display numeric information about features
 */
export interface FeatureStat {
  label: string;
  value: number | string;
  unit?: string;
  trend?: "up" | "down" | "neutral";
  trendPercent?: number;
}

// ============================================================================
// COMPONENT 1: FeatureCard
// ============================================================================

/**
 * FeatureCard Component
 *
 * PURPOSE: Display a single feature with status, category, and basic metadata
 * ONTOLOGY: Renders a "thing" with type="feature" from the Things dimension
 * REUSABILITY: Used in FeatureList and feature grids
 *
 * PROPS:
 * @param feature - Feature data object
 * @param variant - 'default' | 'compact' | 'elevated'
 * @param showCategory - Show category badge (default: true)
 * @param showStatus - Show status badge (default: true)
 * @param onClick - Handler for click events
 * @param className - Additional CSS classes
 *
 * STATES:
 * - Default: Shows all feature information
 * - Hover: Subtle border/shadow change, cursor pointer
 * - Focus: Visible focus ring per WCAG guidelines
 * - Disabled: Reduced opacity (60%), no pointer events
 * - Loading: Skeleton state with placeholder animation
 * - Empty: When no feature data provided
 *
 * ACCESSIBILITY:
 * - Semantic: Uses <article> or <div role="article">
 * - Focus: Tab-focusable with visible focus ring
 * - Labels: aria-label for status and category badges
 * - Heading: Feature name uses <h3> or heading role
 * - Description: aria-describedby links to description text
 *
 * EXAMPLE USAGE:
 * ```tsx
 * <FeatureCard
 *   feature={feature}
 *   variant="default"
 *   onClick={() => navigate(`/features/${feature.id}`)}
 * />
 * ```
 */
export interface FeatureCardProps {
  feature: Feature;
  variant?: "default" | "compact" | "elevated";
  showCategory?: boolean;
  showStatus?: boolean;
  onClick?: (feature: Feature) => void;
  className?: string;
  isLoading?: boolean;
}

export interface FeatureCardComposition {
  Header: {
    title: string;
    icon?: ReactNode;
  };
  Body: {
    description: string;
    tags?: string[];
  };
  Footer: {
    status: Feature["status"];
    category: string;
    difficulty?: string;
  };
}

// ============================================================================
// COMPONENT 2: FeatureStat
// ============================================================================

/**
 * FeatureStat Component
 *
 * PURPOSE: Display a single numeric statistic about features
 * ONTOLOGY: Renders computed metrics from the Events dimension (aggregated data)
 * REUSABILITY: Used in dashboard cards and summary sections
 *
 * PROPS:
 * @param label - Stat label (e.g., "Features Completed")
 * @param value - Numeric or string value
 * @param unit - Optional unit suffix (e.g., "%", "days")
 * @param trend - 'up' | 'down' | 'neutral' for trend indicator
 * @param trendPercent - Percent change (e.g., 23 for +23%)
 * @param variant - 'default' | 'horizontal' for layout
 * @param emphasis - 'primary' | 'secondary' for visual weight
 * @param className - Additional CSS classes
 *
 * STATES:
 * - Default: Shows value and label
 * - With trend: Shows trend arrow and percent change
 * - Loading: Skeleton animation
 * - Error: Shows fallback value
 *
 * ACCESSIBILITY:
 * - Semantics: Uses <dl>, <dt>, <dd> for definition list pattern
 * - Numbers: aria-label for screen readers (e.g., "Features Completed: 12")
 * - Trend: aria-label for trend indicators (e.g., "Up 23 percent")
 *
 * EXAMPLE USAGE:
 * ```tsx
 * <FeatureStat
 *   label="Features Completed"
 *   value={42}
 *   trend="up"
 *   trendPercent={23}
 *   variant="default"
 * />
 * ```
 */
export interface FeatureStatProps {
  label: string;
  value: number | string;
  unit?: string;
  trend?: "up" | "down" | "neutral";
  trendPercent?: number;
  variant?: "default" | "horizontal";
  emphasis?: "primary" | "secondary";
  className?: string;
  isLoading?: boolean;
}

// ============================================================================
// COMPONENT 3: FeatureList
// ============================================================================

/**
 * FeatureList Component
 *
 * PURPOSE: Display multiple features in a grid or list layout
 * ONTOLOGY: Renders multiple "things" from the Things dimension (paginated)
 * REUSABILITY: Main component for features page and feature grids
 *
 * PROPS:
 * @param features - Array of feature objects
 * @param variant - 'grid' | 'list' | 'compact' for layout
 * @param filterStatus - Filter by status (optional)
 * @param filterCategory - Filter by category (optional)
 * @param sortBy - 'name' | 'updated' | 'status' for sorting
 * @param onFeatureClick - Handler for feature selection
 * @param isLoading - Loading state
 * @param pagination - Pagination settings (page, pageSize, total)
 * @param onPageChange - Pagination handler
 * @param className - Additional CSS classes
 *
 * STATES:
 * - Loading: Shows skeleton cards
 * - Empty: Shows empty state with icon and message
 * - Filtered: Shows only matching features with clear filter indication
 * - Paginated: Shows pagination controls
 * - Error: Shows error message with retry option
 *
 * ACCESSIBILITY:
 * - Semantics: Uses <section> with aria-label
 * - Focus: Manageable focus order within list
 * - Keyboard: Supports arrow keys for navigation (when enabled)
 * - Live regions: aria-live for filter/sort updates
 *
 * EXAMPLE USAGE:
 * ```tsx
 * <FeatureList
 *   features={features}
 *   variant="grid"
 *   filterStatus="completed"
 *   sortBy="updated"
 *   onFeatureClick={(feature) => navigate(`/features/${feature.id}`)}
 *   pagination={{ page: 1, pageSize: 12, total: 48 }}
 * />
 * ```
 */
export interface FeatureListProps {
  features: Feature[];
  variant?: "grid" | "list" | "compact";
  filterStatus?: Feature["status"][];
  filterCategory?: string[];
  sortBy?: "name" | "updated" | "status";
  onFeatureClick?: (feature: Feature) => void;
  isLoading?: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
  };
  onPageChange?: (page: number) => void;
  className?: string;
  emptyState?: {
    icon?: ReactNode;
    title?: string;
    description?: string;
  };
}

// ============================================================================
// COMPONENT 4: StatusBadge
// ============================================================================

/**
 * StatusBadge Component
 *
 * PURPOSE: Display feature status with semantic color coding
 * ONTOLOGY: Renders metadata from the Things dimension (properties.status)
 * REUSABILITY: Used in FeatureCard, FeatureRow, and status displays
 *
 * PROPS:
 * @param status - 'completed' | 'in_development' | 'planned' | 'deprecated'
 * @param variant - 'badge' | 'pill' | 'dot' for visual style
 * @param size - 'sm' | 'md' | 'lg' for sizing
 * @param showLabel - Show text label (default: true)
 * @param className - Additional CSS classes
 *
 * STATES:
 * - Default: Shows status with color coding
 * - Disabled: Reduced opacity
 * - Loading: Skeleton animation
 *
 * ACCESSIBILITY:
 * - Semantics: Uses <span> with role="status" or role="img"
 * - Labels: aria-label provides full status description
 * - Colors: Not solely reliant on color to convey meaning (uses text + icons)
 *
 * VARIANTS:
 * - badge: Rectangular with padding (default)
 * - pill: Rounded corners, full height
 * - dot: Icon-only dot with hover label
 *
 * EXAMPLE USAGE:
 * ```tsx
 * <StatusBadge status="in_development" variant="badge" />
 * <StatusBadge status="completed" variant="pill" size="sm" />
 * <StatusBadge status="planned" variant="dot" />
 * ```
 */
export interface StatusBadgeProps {
  status: Feature["status"];
  variant?: "badge" | "pill" | "dot";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

// ============================================================================
// COMPONENT 5: CategoryPill
// ============================================================================

/**
 * CategoryPill Component
 *
 * PURPOSE: Display feature category with semantic color coding
 * ONTOLOGY: Renders metadata from the Things dimension (properties.category)
 * REUSABILITY: Used in FeatureCard and category filters
 *
 * PROPS:
 * @param category - Category name/ID
 * @param variant - 'pill' | 'badge' | 'button' for style
 * @param size - 'sm' | 'md' | 'lg' for sizing
 * @param removable - Show remove button (for use in filters)
 * @param onRemove - Handler for remove button
 * @param className - Additional CSS classes
 *
 * STATES:
 * - Default: Shows category with color
 * - Hover: Subtle background change
 * - Focus: Visible focus ring
 * - Selected: Different styling when used as filter
 * - Disabled: Reduced opacity
 *
 * ACCESSIBILITY:
 * - Semantics: Uses <span> or <button> depending on variant
 * - Labels: aria-label for category description
 * - Keyboard: Tab-focusable, Enter to select
 *
 * EXAMPLE USAGE:
 * ```tsx
 * <CategoryPill category="ai-integration" variant="pill" />
 * <CategoryPill category="authentication" variant="badge" removable />
 * ```
 */
export interface CategoryPillProps {
  category: string;
  variant?: "pill" | "badge" | "button";
  size?: "sm" | "md" | "lg";
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
  icon?: ReactNode;
}

// ============================================================================
// COMPONENT 6: FeatureHeader
// ============================================================================

/**
 * FeatureHeader Component
 *
 * PURPOSE: Page header for feature pages (detail view)
 * ONTOLOGY: Renders a single "thing" with type="feature"
 * REUSABILITY: Used at top of feature detail pages
 *
 * PROPS:
 * @param feature - Feature object
 * @param showBreadcrumb - Show breadcrumb navigation
 * @param showActions - Show action buttons (edit, share, etc.)
 * @param actions - Custom action buttons
 * @param className - Additional CSS classes
 *
 * STATES:
 * - Default: Shows feature title, status, category, description
 * - Loading: Skeleton animation
 * - With actions: Shows action buttons in header
 *
 * ACCESSIBILITY:
 * - Semantics: Uses <header> with <h1> for page title
 * - Breadcrumb: List structure with aria-label
 * - Actions: Buttons with clear labels
 *
 * EXAMPLE USAGE:
 * ```tsx
 * <FeatureHeader
 *   feature={feature}
 *   showBreadcrumb={true}
 *   showActions={true}
 * />
 * ```
 */
export interface FeatureHeaderProps {
  feature: Feature;
  showBreadcrumb?: boolean;
  showActions?: boolean;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary" | "destructive";
  }>;
  className?: string;
}

// ============================================================================
// COMPONENT 7: FeatureFilter
// ============================================================================

/**
 * FeatureFilter Component
 *
 * PURPOSE: Filter controls for feature lists
 * ONTOLOGY: Queries the Things dimension with filters
 * REUSABILITY: Used above FeatureList for filtering
 *
 * PROPS:
 * @param statuses - Available status options
 * @param categories - Available category options
 * @param selectedStatuses - Currently selected statuses
 * @param selectedCategories - Currently selected categories
 * @param onStatusChange - Handler for status filter change
 * @param onCategoryChange - Handler for category filter change
 * @param onClear - Handler for clear all filters
 * @param className - Additional CSS classes
 *
 * STATES:
 * - Default: Shows all filter options
 * - Filtered: Shows selected filters with clear button
 * - Loading: Skeleton animation while options load
 *
 * ACCESSIBILITY:
 * - Semantics: Uses <fieldset> and <legend>
 * - Labels: <label> elements for each checkbox
 * - Keyboard: Tab navigation, Space/Enter to toggle
 *
 * EXAMPLE USAGE:
 * ```tsx
 * <FeatureFilter
 *   statuses={['completed', 'in_development']}
 *   categories={['ai-integration', 'authentication']}
 *   selectedStatuses={['completed']}
 *   onStatusChange={(statuses) => setStatuses(statuses)}
 * />
 * ```
 */
export interface FeatureFilterProps {
  statuses: Feature["status"][];
  categories: string[];
  selectedStatuses?: Feature["status"][];
  selectedCategories?: string[];
  onStatusChange?: (statuses: Feature["status"][]) => void;
  onCategoryChange?: (categories: string[]) => void;
  onClear?: () => void;
  className?: string;
}

// ============================================================================
// COMPONENT 8: FeatureSummary
// ============================================================================

/**
 * FeatureSummary Component
 *
 * PURPOSE: Dashboard summary showing feature statistics
 * ONTOLOGY: Aggregates data from Things and Events dimensions
 * REUSABILITY: Used in dashboards and overview pages
 *
 * PROPS:
 * @param stats - Array of FeatureStat objects
 * @param title - Section title
 * @param description - Optional description
 * @param layout - 'grid' | 'flex' for layout
 * @param isLoading - Loading state
 * @param className - Additional CSS classes
 *
 * STATES:
 * - Default: Shows all statistics
 * - Loading: Shows skeleton cards
 * - Empty: Shows empty state
 *
 * ACCESSIBILITY:
 * - Semantics: Uses <section> with <h2> heading
 * - Stats: Each stat uses definition list pattern
 *
 * EXAMPLE USAGE:
 * ```tsx
 * <FeatureSummary
 *   stats={[
 *     { label: 'Completed', value: 42 },
 *     { label: 'In Development', value: 18 },
 *     { label: 'Planned', value: 35 }
 *   ]}
 *   title="Feature Status Overview"
 * />
 * ```
 */
export interface FeatureSummaryProps {
  stats: FeatureStat[];
  title: string;
  description?: string;
  layout?: "grid" | "flex";
  isLoading?: boolean;
  className?: string;
}

// ============================================================================
// ACCESSIBILITY CHECKLIST FOR COMPONENTS
// ============================================================================

export const accessibilityChecklist = {
  FeatureCard: [
    '[ ] Uses semantic <article> or role="article"',
    "[ ] Feature name uses <h3> heading level",
    "[ ] Focus ring visible per WCAG (2px solid)",
    "[ ] Status badge has aria-label",
    "[ ] Category badge has aria-label",
    "[ ] Description text has sufficient contrast (4.5:1)",
    "[ ] Hover states don't rely on color alone",
    "[ ] Click handler includes keyboard support",
  ],

  StatusBadge: [
    '[ ] Uses role="status" for dynamic updates',
    "[ ] aria-label provides full status text",
    "[ ] Color + icon (not color alone) conveys meaning",
    "[ ] Contrast ratio meets WCAG AA (4.5:1)",
    "[ ] Dot variant includes tooltip on hover",
  ],

  CategoryPill: [
    "[ ] Removable variant is keyboard accessible",
    "[ ] aria-label describes category",
    "[ ] Focus ring visible when interactive",
    "[ ] Remove button has aria-label",
  ],

  FeatureList: [
    "[ ] Container uses <section> with aria-label",
    "[ ] Filter updates announce with aria-live",
    "[ ] Keyboard navigation supported",
    "[ ] Focus moved to results on filter change",
    "[ ] Empty state has descriptive text",
    "[ ] Pagination controls fully keyboard accessible",
  ],

  FeatureFilter: [
    "[ ] Uses <fieldset> with <legend>",
    "[ ] Checkboxes have associated <label> elements",
    "[ ] Keyboard navigation with arrow keys",
    "[ ] Space/Enter toggles checkboxes",
    "[ ] Focus ring visible on all controls",
    "[ ] Clear button has aria-label",
  ],
} as const;

// ============================================================================
// COMPONENT EXPORT TYPE
// ============================================================================

export type ComponentVariant =
  | "default"
  | "compact"
  | "elevated"
  | "grid"
  | "list"
  | "badge"
  | "pill";

export interface ComponentRegistry {
  FeatureCard: FeatureCardProps;
  FeatureStat: FeatureStatProps;
  FeatureList: FeatureListProps;
  StatusBadge: StatusBadgeProps;
  CategoryPill: CategoryPillProps;
  FeatureHeader: FeatureHeaderProps;
  FeatureFilter: FeatureFilterProps;
  FeatureSummary: FeatureSummaryProps;
}
