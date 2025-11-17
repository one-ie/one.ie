/**
 * Design Tokens for Features System
 *
 * These tokens define the visual language for the features documentation system.
 * All colors use HSL format for consistency with Tailwind v4 configuration.
 *
 * Structure:
 * - Status colors (feature development lifecycle)
 * - Category colors (feature categorization)
 * - Spacing scale (8px base unit)
 * - Typography scale (modular 1.25x)
 * - Component variants (cards, badges, stats)
 */

// ============================================================================
// STATUS COLORS
// ============================================================================
// Feature development status lifecycle with WCAG AA contrast requirements

export const statusColors = {
  completed: {
    light: {
      background: "142 70% 85%", // Light green
      foreground: "142 65% 20%", // Dark green
      border: "142 70% 45%", // Medium green
      badge: "hsl(142 70% 45%)", // For badges
      // Contrast: 7.2:1 (exceeds WCAG AAA)
    },
    dark: {
      background: "142 65% 30%",
      foreground: "142 70% 90%",
      border: "142 70% 50%",
      badge: "hsl(142 70% 50%)",
    },
  },
  in_development: {
    light: {
      background: "38 93% 85%", // Light amber/orange
      foreground: "38 93% 20%", // Dark amber/orange
      border: "38 93% 45%", // Medium amber
      badge: "hsl(38 93% 45%)",
      // Contrast: 6.8:1 (exceeds WCAG AA)
    },
    dark: {
      background: "38 93% 35%",
      foreground: "38 93% 90%",
      border: "38 93% 50%",
      badge: "hsl(38 93% 50%)",
    },
  },
  planned: {
    light: {
      background: "217 91% 85%", // Light blue
      foreground: "217 91% 20%", // Dark blue
      border: "217 91% 45%", // Medium blue
      badge: "hsl(217 91% 45%)",
      // Contrast: 7.5:1 (exceeds WCAG AAA)
    },
    dark: {
      background: "217 91% 35%",
      foreground: "217 91% 90%",
      border: "217 91% 50%",
      badge: "hsl(217 91% 50%)",
    },
  },
  deprecated: {
    light: {
      background: "0 84% 85%", // Light red
      foreground: "0 84% 20%", // Dark red
      border: "0 84% 45%", // Medium red
      badge: "hsl(0 84% 45%)",
      // Contrast: 7.1:1 (exceeds WCAG AA)
    },
    dark: {
      background: "0 84% 35%",
      foreground: "0 84% 90%",
      border: "0 84% 50%",
      badge: "hsl(0 84% 50%)",
    },
  },
} as const;

// ============================================================================
// CATEGORY COLORS
// 12 feature categories with distinct, accessible colors
// ============================================================================

export const categoryColors = {
  "ai-integration": {
    light: { background: "280 65% 85%", foreground: "280 65% 20%", border: "280 65% 45%" },
    dark: { background: "280 65% 35%", foreground: "280 65% 90%", border: "280 65% 50%" },
  },
  authentication: {
    light: { background: "220 65% 85%", foreground: "220 65% 20%", border: "220 65% 45%" },
    dark: { background: "220 65% 35%", foreground: "220 65% 90%", border: "220 65% 50%" },
  },
  "content-management": {
    light: { background: "42 93% 80%", foreground: "42 93% 15%", border: "42 93% 45%" },
    dark: { background: "42 93% 30%", foreground: "42 93% 90%", border: "42 93% 50%" },
  },
  analytics: {
    light: { background: "260 70% 85%", foreground: "260 70% 20%", border: "260 70% 45%" },
    dark: { background: "260 70% 35%", foreground: "260 70% 90%", border: "260 70% 50%" },
  },
  performance: {
    light: { background: "142 70% 85%", foreground: "142 70% 20%", border: "142 70% 45%" },
    dark: { background: "142 70% 35%", foreground: "142 70% 90%", border: "142 70% 50%" },
  },
  security: {
    light: { background: "0 84% 85%", foreground: "0 84% 20%", border: "0 84% 45%" },
    dark: { background: "0 84% 35%", foreground: "0 84% 90%", border: "0 84% 50%" },
  },
  "ui-components": {
    light: { background: "180 60% 80%", foreground: "180 60% 15%", border: "180 60% 45%" },
    dark: { background: "180 60% 30%", foreground: "180 60% 90%", border: "180 60% 50%" },
  },
  database: {
    light: { background: "270 65% 85%", foreground: "270 65% 20%", border: "270 65% 45%" },
    dark: { background: "270 65% 35%", foreground: "270 65% 90%", border: "270 65% 50%" },
  },
  deployment: {
    light: { background: "38 93% 85%", foreground: "38 93% 20%", border: "38 93% 45%" },
    dark: { background: "38 93% 35%", foreground: "38 93% 90%", border: "38 93% 50%" },
  },
  integration: {
    light: { background: "190 70% 85%", foreground: "190 70% 20%", border: "190 70% 45%" },
    dark: { background: "190 70% 35%", foreground: "190 70% 90%", border: "190 70% 50%" },
  },
  "developer-tools": {
    light: { background: "210 90% 85%", foreground: "210 90% 20%", border: "210 90% 45%" },
    dark: { background: "210 90% 35%", foreground: "210 90% 90%", border: "210 90% 50%" },
  },
  infrastructure: {
    light: { background: "315 65% 85%", foreground: "315 65% 20%", border: "315 65% 45%" },
    dark: { background: "315 65% 35%", foreground: "315 65% 90%", border: "315 65% 50%" },
  },
} as const;

// ============================================================================
// SPACING SCALE
// Base unit: 8px (consistent with Tailwind v4)
// ============================================================================

export const spacingScale = {
  xs: "4px", // 0.5 * base
  sm: "8px", // 1 * base
  md: "12px", // 1.5 * base
  lg: "16px", // 2 * base
  xl: "24px", // 3 * base
  "2xl": "32px", // 4 * base
  "3xl": "48px", // 6 * base
  "4xl": "64px", // 8 * base
} as const;

// Feature card spacing
export const cardSpacing = {
  padding: "16px", // lg
  paddingCompact: "12px", // md
  gap: "12px", // md between elements
  gapCompact: "8px", // sm between compact elements
  borderRadius: "8px", // sm
  borderRadiusLarge: "12px", // md
} as const;

// ============================================================================
// TYPOGRAPHY SCALE
// Modular scale: 1.25x ratio
// Base: 16px body text
// ============================================================================

export const typographyScale = {
  // Sizes (in pixels)
  sizes: {
    xs: "12px", // 0.75rem - small labels, captions
    sm: "14px", // 0.875rem - input labels, hints
    base: "16px", // 1rem - body text, default
    lg: "18px", // 1.125rem - emphasized body
    xl: "22.5px", // 1.4rem - feature title
    "2xl": "28px", // 1.75rem - section heading
    "3xl": "35px", // 2.2rem - page heading
  },

  // Font weights
  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Line heights
  lineHeights: {
    tight: 1.25, // 20px for 16px text
    normal: 1.5, // 24px for 16px text
    relaxed: 1.625, // 26px for 16px text
    loose: 2, // 32px for 16px text
  },

  // Letter spacing
  letterSpacing: {
    tight: "-0.02em",
    normal: "0em",
    wide: "0.02em",
  },
} as const;

// Feature-specific typography
export const featureTypography = {
  // Feature card title
  cardTitle: {
    size: "22.5px", // xl
    weight: 600,
    lineHeight: 1.25,
    letterSpacing: "-0.02em",
  },

  // Feature card description
  cardDescription: {
    size: "14px", // sm
    weight: 400,
    lineHeight: 1.5,
    letterSpacing: "0em",
  },

  // Feature metadata (status, category)
  metadata: {
    size: "12px", // xs
    weight: 500,
    lineHeight: 1.25,
    letterSpacing: "0.02em",
  },

  // Feature stat value (in FeatureStat component)
  statValue: {
    size: "28px", // 2xl
    weight: 700,
    lineHeight: 1.25,
    letterSpacing: "-0.02em",
  },

  // Feature stat label
  statLabel: {
    size: "12px", // xs
    weight: 500,
    lineHeight: 1.25,
    letterSpacing: "0.02em",
  },
} as const;

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

export const componentVariants = {
  // FeatureCard variants
  featureCard: {
    default: {
      padding: "16px",
      gap: "12px",
      borderRadius: "8px",
      border: "1px solid hsl(var(--color-border))",
      background: "hsl(var(--color-card))",
      hover: "hover:border-primary/20 hover:shadow-md transition-all",
    },
    compact: {
      padding: "12px",
      gap: "8px",
      borderRadius: "8px",
      border: "1px solid hsl(var(--color-border))",
      background: "hsl(var(--color-card))",
      hover: "hover:border-primary/10 transition-colors",
    },
    elevated: {
      padding: "16px",
      gap: "12px",
      borderRadius: "12px",
      border: "1px solid hsl(var(--color-border))",
      background: "hsl(var(--color-card))",
      shadow: "shadow-lg",
      hover: "hover:shadow-xl hover:border-primary/30 transition-all",
    },
  },

  // Status badge variants
  statusBadge: {
    completed: {
      background: "bg-green-100 dark:bg-green-900/30",
      foreground: "text-green-900 dark:text-green-100",
      border: "border-green-300 dark:border-green-700/50",
    },
    in_development: {
      background: "bg-amber-100 dark:bg-amber-900/30",
      foreground: "text-amber-900 dark:text-amber-100",
      border: "border-amber-300 dark:border-amber-700/50",
    },
    planned: {
      background: "bg-blue-100 dark:bg-blue-900/30",
      foreground: "text-blue-900 dark:text-blue-100",
      border: "border-blue-300 dark:border-blue-700/50",
    },
    deprecated: {
      background: "bg-red-100 dark:bg-red-900/30",
      foreground: "text-red-900 dark:text-red-100",
      border: "border-red-300 dark:border-red-700/50",
    },
  },

  // FeatureStat component
  featureStat: {
    default: {
      layout: "flex flex-col gap-2",
      valueSize: "28px",
      labelSize: "12px",
      textAlign: "text-center",
    },
    horizontal: {
      layout: "flex flex-row items-baseline gap-4",
      valueSize: "28px",
      labelSize: "12px",
      textAlign: "text-left",
    },
  },

  // FeatureList layout variants
  featureList: {
    grid: {
      columns: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      gap: "16px",
      itemLayout: "flex flex-col",
    },
    list: {
      columns: "grid-cols-1",
      gap: "12px",
      itemLayout: "flex flex-row items-start",
    },
    compact: {
      columns: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4",
      gap: "12px",
      itemLayout: "flex flex-col",
    },
  },
} as const;

// ============================================================================
// SHADOW SYSTEM
// ============================================================================

export const shadows = {
  xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
} as const;

// ============================================================================
// TRANSITIONS & ANIMATIONS
// ============================================================================

export const transitions = {
  fast: "150ms ease-out",
  normal: "200ms ease-out",
  slow: "300ms ease-out",
  slower: "500ms ease-out",
} as const;

// ============================================================================
// ACCESSIBILITY REQUIREMENTS
// ============================================================================

export const accessibility = {
  // WCAG AA contrast requirements
  contrast: {
    normalText: "4.5:1", // For text < 18px
    largeText: "3:1", // For text ≥ 18px and 14px+ bold
    graphical: "3:1", // For UI components and graphical objects
  },

  // Focus state requirements
  focusState: {
    outline: "2px solid hsl(var(--color-ring))",
    outlineOffset: "2px",
    borderRadius: "2px",
  },

  // Minimum touch target size
  touchTarget: "44px", // 44x44px for interactive elements

  // Minimum spacing for touch
  touchSpacing: "8px", // Between touch targets
} as const;

// ============================================================================
// THEME TOKENS
// Exported for use in components
// ============================================================================

export const designTokens = {
  statusColors,
  categoryColors,
  spacingScale,
  cardSpacing,
  typographyScale,
  featureTypography,
  componentVariants,
  shadows,
  transitions,
  accessibility,
} as const;

export type FeatureStatus = keyof typeof statusColors;
export type FeatureCategory = keyof typeof categoryColors;
