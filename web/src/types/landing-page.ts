/**
 * Landing Page Template Type Definitions
 * Supports flexible customization of page sections, branding, and content
 */

// Branding configuration for the landing page
export interface BrandingConfig {
  primaryColor?: string; // e.g., "#3b82f6"
  accentColor?: string; // e.g., "#f59e0b"
  logo?: string; // URL to logo
  favicon?: string; // URL to favicon
}

// Base section interface
export interface BaseSection {
  id: string;
  type: string;
  visible?: boolean;
  customClass?: string;
}

// Hero section with headline, subheadline, and CTA
export interface HeroSection extends BaseSection {
  type: "hero";
  headline: string;
  subheadline?: string;
  ctaText?: string;
  ctaLink?: string;
  ctaVariant?: "default" | "outline" | "secondary";
  backgroundImage?: string;
  backgroundVideo?: string;
  backgroundGradient?: string;
}

// Features section with grid of features
export interface Feature {
  id?: string;
  icon?: string; // Lucide icon name or emoji
  title: string;
  description: string;
}

export interface FeaturesSection extends BaseSection {
  type: "features";
  title?: string;
  subtitle?: string;
  features: Feature[];
  columns?: 2 | 3 | 4; // Default: 3
}

// Testimonials section
export interface Testimonial {
  id?: string;
  quote: string;
  author: string;
  role?: string;
  avatar?: string; // URL to image
  rating?: 1 | 2 | 3 | 4 | 5;
}

export interface TestimonialsSection extends BaseSection {
  type: "testimonials";
  title?: string;
  testimonials: Testimonial[];
  layout?: "carousel" | "grid"; // Default: grid
}

// How it works section with steps
export interface Step {
  id?: string;
  number?: number;
  title: string;
  description: string;
  image?: string; // Optional image/icon
}

export interface HowItWorksSection extends BaseSection {
  type: "how-it-works";
  title?: string;
  steps: Step[];
}

// FAQ section
export interface FAQ {
  id?: string;
  question: string;
  answer: string;
}

export interface FAQSection extends BaseSection {
  type: "faq";
  title?: string;
  faqs: FAQ[];
}

// Call-to-action section
export interface CTASection extends BaseSection {
  type: "cta";
  headline: string;
  description?: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  backgroundImage?: string;
}

// Form field definition
export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "textarea" | "select" | "checkbox";
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[]; // For select fields
}

// Contact form section
export interface FormSection extends BaseSection {
  type: "form";
  title?: string;
  description?: string;
  fields: FormField[];
  submitText?: string;
  successMessage?: string;
}

// Union type for all possible sections
export type PageSection =
  | HeroSection
  | FeaturesSection
  | TestimonialsSection
  | HowItWorksSection
  | FAQSection
  | CTASection
  | FormSection;

// Complete landing page configuration
export interface LandingPageConfig {
  id?: string;
  title: string;
  slug?: string;
  description?: string;
  branding?: BrandingConfig;
  sections: PageSection[];
  metadata?: {
    published?: boolean;
    publishedAt?: number;
    viewCount?: number;
    conversionRate?: number;
  };
}

// Props for individual components
export interface HeroSectionProps {
  section: HeroSection;
  branding?: BrandingConfig;
}

export interface FeaturesSectionProps {
  section: FeaturesSection;
  branding?: BrandingConfig;
}

export interface TestimonialsSectionProps {
  section: TestimonialsSection;
  branding?: BrandingConfig;
}

export interface HowItWorksSectionProps {
  section: HowItWorksSection;
  branding?: BrandingConfig;
}

export interface FAQSectionProps {
  section: FAQSection;
  branding?: BrandingConfig;
}

export interface CTASectionProps {
  section: CTASection;
  branding?: BrandingConfig;
}

export interface FormSectionProps {
  section: FormSection;
  branding?: BrandingConfig;
  onSubmit?: (data: Record<string, unknown>) => Promise<void>;
}
