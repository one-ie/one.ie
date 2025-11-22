/**
 * AI Design Rules Database
 *
 * Best practices, conversion optimization rules, and industry benchmarks
 * for funnel design analysis and suggestions.
 *
 * Part of Cycle 46: Add AI Design Suggestion System
 */

export type DesignRuleCategory =
  | "layout"
  | "color"
  | "copy"
  | "conversion"
  | "images"
  | "forms"
  | "social-proof"
  | "performance";

export type DesignRuleSeverity = "critical" | "warning" | "tip";

export interface DesignRule {
  id: string;
  category: DesignRuleCategory;
  severity: DesignRuleSeverity;
  name: string;
  description: string;
  benchmark?: number | string;
  check: (element: any, context?: any) => boolean;
  suggestion: string;
  autoFix?: (element: any) => any;
}

/**
 * Layout Design Rules
 */
export const layoutRules: DesignRule[] = [
  {
    id: "headline-size",
    category: "layout",
    severity: "warning",
    name: "Headline Size",
    description: "Headlines should be large and prominent (min 36px, optimal 48-64px)",
    benchmark: "48-64px",
    check: (element) => {
      const size = parseInt(element.fontSize || "0", 10);
      return size >= 36;
    },
    suggestion:
      "Your headline is too small. Try 48-64px for better impact and readability.",
    autoFix: (element) => ({
      ...element,
      fontSize: "48px",
    }),
  },
  {
    id: "cta-above-fold",
    category: "layout",
    severity: "critical",
    name: "CTA Above Fold",
    description: "Call-to-action button must be visible without scrolling",
    check: (element, context) => {
      return element.position?.y < 800; // Assume 800px viewport
    },
    suggestion:
      "CRITICAL: Add a call-to-action button above the fold. Users should see your CTA without scrolling.",
  },
  {
    id: "white-space",
    category: "layout",
    severity: "tip",
    name: "White Space",
    description: "Adequate spacing improves readability and focus",
    check: (element) => {
      const padding = parseInt(element.padding || "0", 10);
      return padding >= 16;
    },
    suggestion: "Add more white space (padding/margin) to improve readability.",
    autoFix: (element) => ({
      ...element,
      padding: "24px",
      margin: "16px",
    }),
  },
  {
    id: "mobile-responsive",
    category: "layout",
    severity: "critical",
    name: "Mobile Responsive",
    description: "Design must work on mobile devices (50%+ of traffic)",
    check: (element) => {
      return element.responsive === true;
    },
    suggestion:
      "CRITICAL: Your design is not mobile-responsive. Add responsive breakpoints.",
  },
];

/**
 * Color & Contrast Rules
 */
export const colorRules: DesignRule[] = [
  {
    id: "color-contrast",
    category: "color",
    severity: "warning",
    name: "Color Contrast",
    description: "Text must have sufficient contrast (WCAG AA: 4.5:1)",
    benchmark: "4.5:1",
    check: (element) => {
      // Simplified contrast check (real implementation would use color contrast algorithm)
      return element.contrastRatio >= 4.5;
    },
    suggestion:
      "Your text is hard to read. Increase contrast between text and background (aim for 4.5:1 ratio).",
  },
  {
    id: "cta-button-color",
    category: "color",
    severity: "warning",
    name: "CTA Button Color",
    description: "CTA button should contrast with page (not blend in)",
    check: (element) => {
      return element.type === "button" && element.standout === true;
    },
    suggestion:
      "Your CTA button blends in. Use a contrasting color (green, orange, red) to make it pop.",
    autoFix: (element) => ({
      ...element,
      backgroundColor: "#10b981", // Green
      color: "#ffffff",
    }),
  },
  {
    id: "color-psychology",
    category: "color",
    severity: "tip",
    name: "Color Psychology",
    description: "Button colors affect conversion rates",
    benchmark: "Green: trust, Orange: urgency, Red: action",
    check: () => true, // Always show as tip
    suggestion:
      "TIP: Green buttons convey trust (12% higher conversions), orange conveys urgency, red conveys action.",
  },
];

/**
 * Copy & Content Rules
 */
export const copyRules: DesignRule[] = [
  {
    id: "weak-cta-text",
    category: "copy",
    severity: "warning",
    name: "Weak CTA Text",
    description: "CTA button text should be action-oriented and specific",
    benchmark: "'Get Started', 'Start Free Trial', 'Download Now'",
    check: (element) => {
      const weakWords = ["submit", "click here", "enter", "go"];
      const text = (element.text || "").toLowerCase();
      return !weakWords.some((word) => text.includes(word));
    },
    suggestion:
      "Your CTA is weak. Replace 'Submit' with action-oriented text like 'Get Instant Access' or 'Start Free Trial'.",
    autoFix: (element) => ({
      ...element,
      text: "Get Started Now",
    }),
  },
  {
    id: "headline-clarity",
    category: "copy",
    severity: "warning",
    name: "Headline Clarity",
    description: "Headline should clearly communicate the value proposition",
    check: (element) => {
      const text = (element.text || "").toLowerCase();
      // Check if headline is too vague
      const vagueWords = ["welcome", "hello", "untitled"];
      return !vagueWords.some((word) => text.includes(word));
    },
    suggestion:
      "Your headline is vague. State the specific benefit users will get (e.g., 'Double Your Sales in 30 Days').",
  },
  {
    id: "character-count",
    category: "copy",
    severity: "tip",
    name: "Headline Length",
    description: "Headlines should be 6-12 words for optimal impact",
    benchmark: "6-12 words",
    check: (element) => {
      const wordCount = (element.text || "").split(" ").length;
      return wordCount >= 6 && wordCount <= 12;
    },
    suggestion:
      "Your headline is too long/short. Aim for 6-12 words for maximum impact.",
  },
];

/**
 * Form Optimization Rules
 */
export const formRules: DesignRule[] = [
  {
    id: "form-fields-count",
    category: "forms",
    severity: "warning",
    name: "Form Fields Count",
    description: "Fewer fields = higher conversions (optimal: 3-5 fields)",
    benchmark: "3-5 fields",
    check: (element) => {
      const fieldCount = element.fields?.length || 0;
      return fieldCount <= 5;
    },
    suggestion:
      "Your form has too many fields. Reduce from 7 to 3-5 fields to improve conversions by 25%.",
    autoFix: (element) => ({
      ...element,
      fields: element.fields?.slice(0, 3) || [],
    }),
  },
  {
    id: "required-fields",
    category: "forms",
    severity: "tip",
    name: "Required Fields",
    description: "Only mark fields as required if absolutely necessary",
    check: (element) => {
      const requiredCount =
        element.fields?.filter((f: any) => f.required).length || 0;
      return requiredCount <= 3;
    },
    suggestion:
      "TIP: Remove 'required' markers from optional fields. Only email should be required.",
  },
  {
    id: "form-button-position",
    category: "forms",
    severity: "tip",
    name: "Form Button Position",
    description: "Submit button should be prominent and easy to click",
    check: (element) => {
      return element.buttonSize === "large";
    },
    suggestion:
      "Make your submit button larger and more prominent (min 48px height for easy clicking).",
    autoFix: (element) => ({
      ...element,
      buttonSize: "large",
      buttonHeight: "48px",
    }),
  },
];

/**
 * Social Proof Rules
 */
export const socialProofRules: DesignRule[] = [
  {
    id: "testimonials-exist",
    category: "social-proof",
    severity: "warning",
    name: "Testimonials",
    description: "Testimonials increase conversions by 15-30%",
    benchmark: "3-5 testimonials",
    check: (element, context) => {
      return context?.hasTestimonials === true;
    },
    suggestion:
      "Add customer testimonials before your CTA. Real testimonials increase trust and conversions by 15-30%.",
  },
  {
    id: "trust-badges",
    category: "social-proof",
    severity: "tip",
    name: "Trust Badges",
    description: "Security badges reduce friction in purchase decision",
    check: (element, context) => {
      return context?.hasTrustBadges === true;
    },
    suggestion:
      "TIP: Add trust badges (money-back guarantee, secure checkout, customer support) to reduce purchase anxiety.",
  },
  {
    id: "social-proof-numbers",
    category: "social-proof",
    severity: "tip",
    name: "Social Proof Numbers",
    description: "Specific numbers build credibility",
    benchmark: "'Join 10,000+ customers'",
    check: (element) => {
      const text = (element.text || "").toLowerCase();
      return /\d+/.test(text); // Contains numbers
    },
    suggestion:
      "TIP: Add specific numbers to build credibility (e.g., '10,000+ happy customers', '4.9/5 stars from 2,847 reviews').",
  },
];

/**
 * Image & Media Rules
 */
export const imageRules: DesignRule[] = [
  {
    id: "hero-image-exists",
    category: "images",
    severity: "warning",
    name: "Hero Image",
    description: "Hero image increases trust and engagement",
    check: (element, context) => {
      return context?.hasHeroImage === true;
    },
    suggestion:
      "Add a hero image at the top of your page. Images increase engagement and build trust.",
  },
  {
    id: "product-images-quality",
    category: "images",
    severity: "warning",
    name: "Image Quality",
    description: "High-quality images increase perceived value",
    check: (element) => {
      return element.imageQuality === "high";
    },
    suggestion:
      "Use high-quality product images (min 1200px width). Low-quality images reduce trust and conversions.",
  },
  {
    id: "alt-text",
    category: "images",
    severity: "tip",
    name: "Alt Text",
    description: "Alt text improves accessibility and SEO",
    check: (element) => {
      return element.alt && element.alt.length > 0;
    },
    suggestion:
      "TIP: Add descriptive alt text to all images for better accessibility and SEO.",
  },
];

/**
 * Conversion Optimization Rules
 */
export const conversionRules: DesignRule[] = [
  {
    id: "urgency-scarcity",
    category: "conversion",
    severity: "warning",
    name: "Urgency/Scarcity",
    description: "Urgency increases conversions by 8-15%",
    benchmark: "Countdown timer or limited stock indicator",
    check: (element, context) => {
      return context?.hasUrgency === true;
    },
    suggestion:
      "Add urgency with a countdown timer or 'Only 3 left in stock' message. Urgency increases conversions by 8-15%.",
  },
  {
    id: "value-proposition",
    category: "conversion",
    severity: "critical",
    name: "Value Proposition",
    description: "Clear value proposition is essential for conversions",
    check: (element, context) => {
      return context?.hasValueProposition === true;
    },
    suggestion:
      "CRITICAL: Your value proposition is unclear. State clearly: What do users get? Why should they care?",
  },
  {
    id: "friction-reduction",
    category: "conversion",
    severity: "warning",
    name: "Friction Reduction",
    description: "Remove unnecessary steps in conversion flow",
    check: (element, context) => {
      const steps = context?.conversionSteps || 0;
      return steps <= 3;
    },
    suggestion:
      "Your conversion flow has too many steps. Reduce from 5 to 3 steps to increase conversions by 20%.",
  },
];

/**
 * Performance Rules
 */
export const performanceRules: DesignRule[] = [
  {
    id: "page-load-speed",
    category: "performance",
    severity: "critical",
    name: "Page Load Speed",
    description: "Pages should load in under 3 seconds",
    benchmark: "< 3 seconds",
    check: (element, context) => {
      return (context?.loadTime || 0) < 3000;
    },
    suggestion:
      "CRITICAL: Your page loads too slowly. Optimize images and reduce JavaScript to load in under 3 seconds.",
  },
  {
    id: "mobile-speed",
    category: "performance",
    severity: "warning",
    name: "Mobile Speed",
    description: "Mobile pages should load in under 2 seconds",
    benchmark: "< 2 seconds",
    check: (element, context) => {
      return (context?.mobileLoadTime || 0) < 2000;
    },
    suggestion:
      "Your mobile page is slow. Optimize for mobile-first (50%+ of traffic is mobile).",
  },
];

/**
 * All Rules Combined
 */
export const allRules: DesignRule[] = [
  ...layoutRules,
  ...colorRules,
  ...copyRules,
  ...formRules,
  ...socialProofRules,
  ...imageRules,
  ...conversionRules,
  ...performanceRules,
];

/**
 * Industry Benchmarks
 */
export const industryBenchmarks = {
  conversionRate: {
    excellent: 0.1, // 10%+
    good: 0.05, // 5-10%
    average: 0.02, // 2-5%
    poor: 0.01, // < 2%
  },
  formFields: {
    optimal: 3,
    maximum: 5,
  },
  headlineSize: {
    minimum: 36,
    optimal: 48,
    maximum: 72,
  },
  ctaPosition: {
    aboveFold: true,
    maxScrollDepth: 800, // pixels
  },
  colorContrast: {
    minimum: 4.5, // WCAG AA
    optimal: 7.0, // WCAG AAA
  },
  pageLoadTime: {
    excellent: 1500, // < 1.5s
    good: 3000, // < 3s
    poor: 5000, // > 5s
  },
};

/**
 * A/B Test Winners
 */
export const abTestWinners = [
  {
    test: "CTA Button Color",
    winner: "Green buttons",
    improvement: "12% higher conversions",
    reason: "Green conveys trust and safety",
  },
  {
    test: "CTA Text",
    winner: "'Get Started' vs 'Submit'",
    improvement: "21% higher conversions",
    reason: "Action-oriented, specific benefit",
  },
  {
    test: "Form Fields",
    winner: "3 fields vs 7 fields",
    improvement: "25% higher conversions",
    reason: "Less friction, faster completion",
  },
  {
    test: "Testimonials Position",
    winner: "Before CTA vs After CTA",
    improvement: "18% higher conversions",
    reason: "Builds trust before purchase decision",
  },
  {
    test: "Headline Length",
    winner: "8 words vs 15 words",
    improvement: "14% higher engagement",
    reason: "Clear, scannable, memorable",
  },
  {
    test: "Urgency",
    winner: "Countdown timer vs no timer",
    improvement: "15% higher conversions",
    reason: "Creates FOMO (fear of missing out)",
  },
];

/**
 * Rule Presets by Page Type
 */
export const rulePresets = {
  "landing-page": [
    ...layoutRules,
    ...colorRules,
    ...copyRules,
    ...socialProofRules,
    ...imageRules,
    ...conversionRules,
  ],
  "sales-page": [
    ...layoutRules,
    ...colorRules,
    ...copyRules,
    ...socialProofRules,
    ...imageRules,
    ...conversionRules,
    ...performanceRules,
  ],
  "lead-capture": [...layoutRules, ...formRules, ...socialProofRules],
  "checkout": [...formRules, ...socialProofRules, ...performanceRules],
};
