/**
 * Website Builder Component Library
 *
 * A comprehensive collection of 20+ production-ready components for building
 * modern websites and landing pages.
 *
 * All components:
 * - Built with React 19 + TypeScript
 * - Styled with Tailwind v4
 * - Use shadcn/ui primitives
 * - Support dark mode
 * - Fully responsive
 * - Accessible (WCAG compliant)
 *
 * @see /web/src/components/builder/README.md for full documentation
 */

// Hero Sections (6 variations)
export { HeroCentered } from './hero/HeroCentered';
export { HeroSplit } from './hero/HeroSplit';
export { HeroVideo } from './hero/HeroVideo';
export { HeroMinimal } from './hero/HeroMinimal';
export { HeroWithStats } from './hero/HeroWithStats';
export { HeroWithForm } from './hero/HeroWithForm';
export { HeroGradient } from './hero/HeroGradient';

// Features Sections (3 variations)
export { FeaturesGrid } from './features/FeaturesGrid';
export { FeaturesWithImages } from './features/FeaturesWithImages';
export { FeaturesComparison } from './features/FeaturesComparison';

// Pricing Tables (2 variations)
export { PricingThreeTier } from './pricing/PricingThreeTier';
export { PricingComparison } from './pricing/PricingComparison';

// Testimonials (2 variations)
export { TestimonialsGrid } from './testimonials/TestimonialsGrid';
export { TestimonialsCarousel } from './testimonials/TestimonialsCarousel';

// Call-to-Action (3 variations)
export { CTASimple } from './cta/CTASimple';
export { CTAWithForm } from './cta/CTAWithForm';
export { CTABanner } from './cta/CTABanner';

// Navigation (3 variations)
export { Header } from './navigation/Header';
export { Footer } from './navigation/Footer';
export { MegaMenu } from './navigation/MegaMenu';

// Type exports for convenience
export type { HeroCenteredProps } from './hero/HeroCentered';
export type { HeroSplitProps } from './hero/HeroSplit';
export type { HeroVideoProps } from './hero/HeroVideo';
export type { HeroMinimalProps } from './hero/HeroMinimal';
export type { HeroWithStatsProps } from './hero/HeroWithStats';
export type { HeroWithFormProps } from './hero/HeroWithForm';
export type { HeroGradientProps } from './hero/HeroGradient';

export type { FeaturesGridProps, Feature } from './features/FeaturesGrid';
export type { FeaturesWithImagesProps, FeatureWithImage } from './features/FeaturesWithImages';
export type { FeaturesComparisonProps, ComparisonItem } from './features/FeaturesComparison';

export type { PricingThreeTierProps, PricingTier } from './pricing/PricingThreeTier';
export type { PricingComparisonProps, ComparisonFeature, ComparisonPlan } from './pricing/PricingComparison';

export type { TestimonialsGridProps, Testimonial } from './testimonials/TestimonialsGrid';
export type { TestimonialsCarouselProps, CarouselTestimonial } from './testimonials/TestimonialsCarousel';

export type { CTASimpleProps } from './cta/CTASimple';
export type { CTAWithFormProps } from './cta/CTAWithForm';
export type { CTABannerProps } from './cta/CTABanner';

export type { HeaderProps, NavigationLink } from './navigation/Header';
export type { FooterProps, FooterLinkGroup, SocialLink } from './navigation/Footer';
export type { MegaMenuProps, MegaMenuCategory, MegaMenuItem } from './navigation/MegaMenu';
