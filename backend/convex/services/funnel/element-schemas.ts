/**
 * Element Property Schemas - Cycle 027
 *
 * TypeScript interfaces and validation functions for all 37 element types
 * used in the funnel builder page system.
 *
 * @see /one/things/plans/cycle-005-page-element-types.md
 */

import { v } from "convex/values";

// ============================================================================
// SHARED TYPES
// ============================================================================

export interface Spacing {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  all?: number;
}

export interface AnimationConfig {
  type: "fade-in" | "slide-up" | "slide-down" | "bounce";
  duration: number; // milliseconds
  delay: number;
}

export interface ResponsiveRules {
  mobile?: Record<string, any>;
  tablet?: Record<string, any>;
  desktop?: Record<string, any>;
}

export interface VisibilityRules {
  hidden: boolean;
  mobile: boolean;
  tablet: boolean;
  desktop: boolean;
}

export interface PositionMetadata {
  x: number;
  y: number;
  width: number | string; // px or percentage
  height: number | string;
  zIndex: number;
}

// ============================================================================
// 1. TEXT ELEMENTS
// ============================================================================

// 1.1 Headline
export interface HeadlineSettings {
  text: string; // max 255 characters
  level: 1 | 2 | 3 | 4 | 5 | 6; // h1-h6
  alignment: "left" | "center" | "right";
  maxWidth?: number;
  lineHeight?: number; // 1.2 - 2.0
  letterSpacing?: number;
  animation?: AnimationConfig;
}

export interface HeadlineStyling {
  fontFamily: string;
  fontSize: number; // in px
  fontWeight: 300 | 400 | 500 | 600 | 700 | 800 | 900;
  color: string; // hex color
  textShadow?: string;
  textDecoration: "none" | "underline" | "line-through";
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize";
  backgroundColor?: string;
  padding?: Spacing;
  margin?: Spacing;
}

export interface HeadlineProperties {
  elementType: "headline";
  name: string;
  settings: HeadlineSettings;
  styling: HeadlineStyling;
  position: PositionMetadata;
  responsive: ResponsiveRules;
  visibility: VisibilityRules;
}

// 1.2 Subheadline
export interface SubheadlineSettings {
  text: string; // max 255 characters
  alignment: "left" | "center" | "right";
  maxWidth?: number;
  lineHeight?: number;
}

export interface SubheadlineStyling {
  fontFamily: string;
  fontSize: number; // 18-48 px recommended
  fontWeight: 300 | 400 | 500 | 600;
  color: string;
  opacity?: number; // 0-1 for gray-out effect
  animation?: AnimationConfig;
  padding?: Spacing;
  margin?: Spacing;
}

export interface SubheadlineProperties {
  elementType: "subheadline";
  name: string;
  settings: SubheadlineSettings;
  styling: SubheadlineStyling;
  position: PositionMetadata;
  responsive: ResponsiveRules;
  visibility: VisibilityRules;
}

// 1.3 Paragraph
export interface ParagraphSettings {
  text: string; // max 5000 characters
  alignment: "left" | "center" | "right" | "justify";
  maxWidth?: number;
  columns?: 1 | 2 | 3;
  firstLetterCapital?: boolean;
}

export interface ParagraphStyling {
  fontFamily: string;
  fontSize: number; // 14-32 px
  fontWeight: 300 | 400 | 500;
  color: string;
  lineHeight: number; // 1.4-1.8 for readability
  letterSpacing?: number;
  backgroundColor?: string;
  padding?: Spacing;
  margin?: Spacing;
}

export interface ParagraphProperties {
  elementType: "paragraph";
  name: string;
  settings: ParagraphSettings;
  styling: ParagraphStyling;
  position: PositionMetadata;
  responsive: ResponsiveRules;
  visibility: VisibilityRules;
}

// 1.4 Bullet List
export interface BulletListSettings {
  items: {
    text: string;
    icon?: "bullet" | "checkmark" | "arrow" | "star" | "number" | "custom";
    customIcon?: string; // emoji or URL
  }[];
  ordered: boolean; // true = numbered, false = bulleted
  alignment: "left" | "center" | "right";
  spacing: "compact" | "normal" | "loose";
}

export interface BulletListStyling {
  fontFamily: string;
  fontSize: number; // 14-24 px
  fontWeight: 400 | 500;
  color: string;
  iconColor?: string;
  lineHeight: number;
  padding?: Spacing;
  margin?: Spacing;
}

export interface BulletListProperties {
  elementType: "bullet_list";
  name: string;
  settings: BulletListSettings;
  styling: BulletListStyling;
  position: PositionMetadata;
  responsive: ResponsiveRules;
  visibility: VisibilityRules;
}

// 1.5 Testimonial Text
export interface TestimonialTextSettings {
  quote: string; // max 500 characters
  author: string;
  role?: string;
  company?: string;
  alignment: "left" | "center" | "right";
  displayRating?: number; // 1-5 stars
  displayPhoto?: boolean;
  photoUrl?: string;
}

export interface TestimonialTextStyling {
  fontFamily: string;
  fontSize: number; // 16-32 px
  fontWeight: 400 | 500 | 600;
  color: string;
  quoteMarks?: boolean;
  backgroundColor?: string;
  borderLeft?: {
    width: number;
    color: string;
  };
  padding?: Spacing;
  margin?: Spacing;
}

export interface TestimonialTextProperties {
  elementType: "testimonial_text";
  name: string;
  settings: TestimonialTextSettings;
  styling: TestimonialTextStyling;
  position: PositionMetadata;
  responsive: ResponsiveRules;
  visibility: VisibilityRules;
}

// ============================================================================
// 2. MEDIA ELEMENTS
// ============================================================================

// 2.1 Image
export interface ImageSettings {
  src: string;
  altText: string;
  width?: number;
  height?: number;
  aspectRatio?: "auto" | "square" | "16:9" | "4:3" | "3:2" | "custom";
  customAspectRatio?: string;
  objectFit: "contain" | "cover" | "fill" | "scale-down";
  objectPosition?: string;
  loading: "lazy" | "eager";
  placeholderUrl?: string;
  blur?: {
    amount: number; // 0-100
    trigger: "hover" | "always" | "never";
  };
  caption?: string;
  link?: {
    url: string;
    openInNewTab: boolean;
  };
}

export interface ImageStyling {
  borderRadius?: number; // 0-50 px
  borderWidth?: number;
  borderColor?: string;
  boxShadow?: string;
  opacity?: number; // 0-1
  filter?: {
    brightness?: number; // 0.5-1.5
    contrast?: number; // 0.5-1.5
    saturation?: number; // 0-1.5
    grayscale?: number; // 0-1
  };
  padding?: Spacing;
  margin?: Spacing;
}

export interface ImageProperties {
  elementType: "image";
  name: string;
  settings: ImageSettings;
  styling: ImageStyling;
  position: PositionMetadata;
  responsive: ResponsiveRules;
  visibility: VisibilityRules;
}

// 2.2 Video
export interface VideoSettings {
  source: "youtube" | "vimeo" | "custom" | "file";
  url?: string;
  videoId?: string;
  fileSize?: number;
  duration?: number;
  autoplay: boolean;
  controls: boolean;
  loop: boolean;
  muted: boolean;
  showThumbnail: boolean;
  customThumbnailUrl?: string;
  startTime?: number;
  endTime?: number;
  playbackRate?: number; // 0.5-2.0
  aspectRatio: "16:9" | "4:3" | "1:1" | "custom";
  customAspectRatio?: string;
  caption?: string;
  transcriptUrl?: string;
}

export interface VideoStyling {
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  boxShadow?: string;
  opacity?: number;
  padding?: Spacing;
  margin?: Spacing;
}

export interface VideoProperties {
  elementType: "video";
  name: string;
  settings: VideoSettings;
  styling: VideoStyling;
  position: PositionMetadata;
  responsive: ResponsiveRules;
  visibility: VisibilityRules;
}

// 2.3 Audio Player
export interface AudioSettings {
  src: string;
  fileName?: string;
  duration?: number;
  autoplay: boolean;
  controls: boolean;
  loop: boolean;
  preload: "none" | "metadata" | "auto";
  playbackRate: number; // 0.5-2.0
  displayWaveform?: boolean;
  displayDuration: boolean;
  displayPlaylist?: boolean;
  playlist?: {
    title: string;
    episodes: {
      title: string;
      src: string;
      duration?: number;
    }[];
  };
}

export interface AudioStyling {
  playerColor: string;
  backgroundColor?: string;
  borderRadius?: number;
  padding?: Spacing;
  margin?: Spacing;
}

export interface AudioProperties {
  elementType: "audio_player";
  name: string;
  settings: AudioSettings;
  styling: AudioStyling;
  position: PositionMetadata;
  responsive: ResponsiveRules;
  visibility: VisibilityRules;
}

// 2.4 Image Gallery
export interface ImageGallerySettings {
  images: {
    url: string;
    altText: string;
    caption?: string;
    thumbnail?: string;
  }[];
  layout: "grid" | "carousel" | "masonry" | "slider" | "before-after";
  columnsDesktop?: number; // 2-4
  columnsMobile?: number; // 1-2
  spacing?: number;
  showThumbnails: boolean;
  autoplay?: boolean;
  autoplayInterval?: number;
  enableZoom: boolean;
  enableLightbox: boolean;
  transitionDuration?: number;
}

export interface ImageGalleryStyling {
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  boxShadow?: string;
  padding?: Spacing;
  margin?: Spacing;
}

export interface ImageGalleryProperties {
  elementType: "image_gallery";
  name: string;
  settings: ImageGallerySettings;
  styling: ImageGalleryStyling;
  position: PositionMetadata;
  responsive: ResponsiveRules;
  visibility: VisibilityRules;
}

// 2.5 Background Video
export interface BackgroundVideoSettings {
  source: "youtube" | "custom" | "file";
  url?: string;
  videoId?: string;
  fallbackImageUrl?: string;
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  controls: boolean;
  playbackRate?: number;
  objectFit: "contain" | "cover";
  brightness?: number; // 0.2-1.0
  blur?: number; // 0-20 px
  overlay?: {
    color: string;
    opacity: number; // 0-1
  };
  contentAlignment: "top-left" | "center" | "bottom-right";
}

export interface BackgroundVideoStyling {
  minHeight: number;
  padding?: Spacing;
}

export interface BackgroundVideoProperties {
  elementType: "background_video";
  name: string;
  settings: BackgroundVideoSettings;
  styling: BackgroundVideoStyling;
  position: PositionMetadata;
  responsive: ResponsiveRules;
  visibility: VisibilityRules;
}

// ============================================================================
// 3. FORM ELEMENTS
// ============================================================================

// 3.1 Input Field
export interface InputFieldSettings {
  type: "text" | "email" | "phone" | "number" | "password" | "url" | "date";
  fieldName: string;
  label?: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string; // regex validation
  defaultValue?: string;
  autocomplete?: boolean;
  disabled: boolean;
  readonly: boolean;
  showCharacterCount?: boolean;
}

export interface InputFieldStyling {
  fontSize: number;
  color: string;
  backgroundColor: string;
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  padding?: Spacing;
  margin?: Spacing;
  focusColor?: string;
  errorColor?: string;
}

export interface InputFieldProperties {
  elementType: "input_field";
  name: string;
  settings: InputFieldSettings;
  styling: InputFieldStyling;
  position: PositionMetadata;
  responsive: ResponsiveRules;
  visibility: VisibilityRules;
}

// 3.2 Textarea
export interface TextareaSettings {
  fieldName: string;
  label?: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  maxLength?: number;
  minLength?: number;
  rows?: number;
  cols?: number;
  defaultValue?: string;
  disabled: boolean;
  readonly: boolean;
  resizable: boolean;
  showCharacterCount?: boolean;
}

export interface TextareaStyling {
  fontSize: number;
  color: string;
  backgroundColor: string;
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  padding?: Spacing;
  margin?: Spacing;
  lineHeight: number;
}

export interface TextareaProperties {
  elementType: "textarea";
  name: string;
  settings: TextareaSettings;
  styling: TextareaStyling;
  position: PositionMetadata;
  responsive: ResponsiveRules;
  visibility: VisibilityRules;
}

// 3.3 Select Dropdown
export interface SelectDropdownSettings {
  fieldName: string;
  label?: string;
  placeholder?: string;
  helpText?: string;
  options: {
    label: string;
    value: string;
  }[];
  required: boolean;
  multiple: boolean;
  defaultValue?: string | string[];
  searchable?: boolean;
  disabled: boolean;
  optionGrouping?: {
    group: string;
    options: { label: string; value: string }[];
  }[];
}

export interface SelectDropdownStyling {
  fontSize: number;
  color: string;
  backgroundColor: string;
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  padding?: Spacing;
}

export interface SelectDropdownProperties {
  elementType: "select_dropdown";
  name: string;
  settings: SelectDropdownSettings;
  styling: SelectDropdownStyling;
  position: PositionMetadata;
  responsive: ResponsiveRules;
  visibility: VisibilityRules;
}

// 3.4 Checkbox
export interface CheckboxSettings {
  fieldName: string;
  label?: string;
  helpText?: string;
  required: boolean;
  checked: boolean;
  disabled: boolean;
  value?: string;
  sublabel?: string;
}

export interface CheckboxStyling {
  checkboxSize?: number; // 16-32 px
  checkboxColor: string;
  labelFontSize: number;
  labelColor: string;
  padding?: Spacing;
  margin?: Spacing;
}

export interface CheckboxProperties {
  elementType: "checkbox";
  name: string;
  settings: CheckboxSettings;
  styling: CheckboxStyling;
  position: PositionMetadata;
  responsive: ResponsiveRules;
  visibility: VisibilityRules;
}

// 3.5 Radio Buttons
export interface RadioButtonsSettings {
  fieldName: string;
  label?: string;
  helpText?: string;
  options: {
    label: string;
    value: string;
    description?: string;
  }[];
  required: boolean;
  defaultValue?: string;
  disabled: boolean;
  layout: "vertical" | "horizontal";
}

export interface RadioButtonsStyling {
  radioSize?: number; // 16-32 px
  radioColor: string;
  labelFontSize: number;
  labelColor: string;
  spacing?: number;
  padding?: Spacing;
}

export interface RadioButtonsProperties {
  elementType: "radio_buttons";
  name: string;
  settings: RadioButtonsSettings;
  styling: RadioButtonsStyling;
  position: PositionMetadata;
  responsive: ResponsiveRules;
  visibility: VisibilityRules;
}

// 3.6 Submit Button
export interface SubmitButtonSettings {
  text: string;
  formId?: string;
  action?: "submit" | "reset" | "button";
  disabled: boolean;
  ariaLabel?: string;
  loading?: {
    enabled: boolean;
    text?: string;
    icon?: boolean;
  };
  analyticsEvent?: string;
}

export interface SubmitButtonStyling {
  fontSize: number;
  fontWeight: 600 | 700;
  color: string;
  backgroundColor: string;
  borderWidth?: number;
  borderColor?: string;
  borderRadius: number;
  padding?: Spacing;
  margin?: Spacing;
  hoverBackgroundColor?: string;
  hoverColor?: string;
  cursor: "pointer" | "not-allowed" | "default";
  boxShadow?: string;
  transition?: string;
}

export interface SubmitButtonProperties {
  elementType: "submit_button";
  name: string;
  settings: SubmitButtonSettings;
  styling: SubmitButtonStyling;
  position: PositionMetadata;
  responsive: ResponsiveRules;
  visibility: VisibilityRules;
}

// 3.7 Multi-step Form
export interface MultiStepFormSettings {
  formName: string;
  steps: {
    stepNumber: number;
    title: string;
    description?: string;
    fields: string[];
    showProgressBar: boolean;
    allowSkip?: boolean;
  }[];
  submitButtonText: string;
  progressBarStyle: "dots" | "line" | "steps" | "none";
  saveProgress: boolean;
  allowGoBack: boolean;
}

export interface MultiStepFormStyling {
  progressBarColor: string;
  stepTitleFontSize: number;
  backgroundColor?: string;
  padding?: Spacing;
}

export interface MultiStepFormProperties {
  elementType: "multi_step_form";
  name: string;
  settings: MultiStepFormSettings;
  styling: MultiStepFormStyling;
  position: PositionMetadata;
  responsive: ResponsiveRules;
  visibility: VisibilityRules;
}

// ============================================================================
// 4. COMMERCE ELEMENTS
// ============================================================================

// 4.1 Pricing Table
export interface PricingTableSettings {
  columns: {
    name: string;
    description?: string;
    price: number;
    currency: string;
    billingPeriod?: "monthly" | "yearly" | "one-time";
    features: {
      text: string;
      included: boolean;
      tooltip?: string;
    }[];
    buttonText: string;
    buttonAction: "checkout" | "link" | "modal";
    buttonLink?: string;
    highlighted?: boolean;
    ribbonText?: string;
  }[];
  showAnnualDiscount?: boolean;
  discountPercentage?: number;
}

export interface PricingTableStyling {
  layout: "vertical" | "horizontal";
  columnWidth?: number;
  columnGap?: number;
  highlightedColumnColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  padding?: Spacing;
}

export interface PricingTableProperties {
  elementType: "pricing_table";
  name: string;
  settings: PricingTableSettings;
  styling: PricingTableStyling;
  position: PositionMetadata;
  responsive: ResponsiveRules;
  visibility: VisibilityRules;
}

// 4.2 Buy Button
export interface BuyButtonSettings {
  text: string;
  productId?: string;
  price: number;
  currency: string;
  quantity?: number;
  checkoutType: "stripe" | "paypal" | "custom";
  successRedirectUrl?: string;
  cancelRedirectUrl?: string;
  upsellProductId?: string;
  requiresEmail: boolean;
  requiresShipping: boolean;
  taxCalculation?: "auto" | "manual";
}

export interface BuyButtonStyling {
  fontSize: number;
  fontWeight: 600 | 700;
  color: string;
  backgroundColor: string;
  borderRadius: number;
  padding?: Spacing;
  hoverBackgroundColor?: string;
  showPrice: boolean;
}

export interface BuyButtonProperties {
  elementType: "buy_button";
  name: string;
  settings: BuyButtonSettings;
  styling: BuyButtonStyling;
  position: PositionMetadata;
  responsive: ResponsiveRules;
  visibility: VisibilityRules;
}

// 4.3 Product Card
export interface ProductCardSettings {
  productId: string;
  showImage: boolean;
  showPrice: boolean;
  showDescription: boolean;
  showRating: boolean;
  showQuantitySelector: boolean;
  buttonText: string;
  buttonAction: "checkout" | "view-details" | "add-to-cart";
  compactMode?: boolean;
}

export interface ProductCardStyling {
  imageHeight?: number;
  backgroundColor?: string;
  borderRadius?: number;
  boxShadow?: string;
  padding?: Spacing;
}

export interface ProductCardProperties {
  elementType: "product_card";
  name: string;
  settings: ProductCardSettings;
  styling: ProductCardStyling;
  position: PositionMetadata;
  responsive: ResponsiveRules;
  visibility: VisibilityRules;
}

// 4.4 Cart Summary
export interface CartSummarySettings {
  showShippingEstimate: boolean;
  showTaxEstimate: boolean;
  showCouponInput: boolean;
  showItemList: boolean;
}

export interface CartSummaryStyling {
  backgroundColor?: string;
  borderRadius?: number;
  padding?: Spacing;
}

export interface CartSummaryProperties {
  elementType: "cart_summary";
  name: string;
  settings: CartSummarySettings;
  styling: CartSummaryStyling;
  position: PositionMetadata;
  responsive: ResponsiveRules;
  visibility: VisibilityRules;
}

// 4.5 Order Bump Checkbox
export interface OrderBumpCheckboxSettings {
  productId: string;
  productName: string;
  price: number;
  originalPrice?: number;
  description?: string;
  checked: boolean;
  maxQuantity?: number;
}

export interface OrderBumpCheckboxStyling {
  backgroundColor?: string;
  borderRadius?: number;
  padding?: Spacing;
}

export interface OrderBumpCheckboxProperties {
  elementType: "order_bump_checkbox";
  name: string;
  settings: OrderBumpCheckboxSettings;
  styling: OrderBumpCheckboxStyling;
  position: PositionMetadata;
  responsive: ResponsiveRules;
  visibility: VisibilityRules;
}

// 4.6 Coupon Code Input
export interface CouponCodeInputSettings {
  placeholder?: string;
  buttonText: string;
  minLength?: number;
  maxLength?: number;
  caseSensitive: boolean;
  validationMessage?: string;
}

export interface CouponCodeInputStyling {
  fontSize: number;
  borderRadius?: number;
  padding?: Spacing;
}

export interface CouponCodeInputProperties {
  elementType: "coupon_code_input";
  name: string;
  settings: CouponCodeInputSettings;
  styling: CouponCodeInputStyling;
  position: PositionMetadata;
  responsive: ResponsiveRules;
  visibility: VisibilityRules;
}

// ============================================================================
// 5. SOCIAL PROOF ELEMENTS
// ============================================================================

// 5.1 Testimonial Card
export interface TestimonialCardSettings {
  quote: string;
  author: string;
  role?: string;
  company?: string;
  photoUrl?: string;
  rating?: number; // 1-5
  verified: boolean;
}

export interface TestimonialCardStyling {
  backgroundColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  boxShadow?: string;
  padding?: Spacing;
  photoSize?: number;
}

export interface TestimonialCardProperties {
  elementType: "testimonial_card";
  name: string;
  settings: TestimonialCardSettings;
  styling: TestimonialCardStyling;
  position: PositionMetadata;
  responsive: ResponsiveRules;
  visibility: VisibilityRules;
}

// 5.2 Review Stars
export interface ReviewStarsSettings {
  rating: number; // 0-5 (decimal)
  maxRating: number;
  reviewCount?: number;
  displayText: boolean;
}

export interface ReviewStarsStyling {
  starSize: number; // 16-48 px
  starColor: string;
  emptyStarColor?: string;
  textFontSize?: number;
}

export interface ReviewStarsProperties {
  elementType: "review_stars";
  name: string;
  settings: ReviewStarsSettings;
  styling: ReviewStarsStyling;
  position: PositionMetadata;
  responsive: ResponsiveRules;
  visibility: VisibilityRules;
}

// 5.3 Trust Badges
export interface TrustBadgesSettings {
  badges: {
    type: "ssl" | "payment" | "custom" | "certification";
    label?: string;
    iconUrl?: string;
    url?: string;
  }[];
  layout: "horizontal" | "vertical";
  spacing: number;
}

export interface TrustBadgesStyling {
  badgeSize?: number;
  backgroundColor?: string;
  padding?: Spacing;
}

export interface TrustBadgesProperties {
  elementType: "trust_badges";
  name: string;
  settings: TrustBadgesSettings;
  styling: TrustBadgesStyling;
  position: PositionMetadata;
  responsive: ResponsiveRules;
  visibility: VisibilityRules;
}

// 5.4 Social Media Feed
export interface SocialMediaFeedSettings {
  platform: "instagram" | "twitter" | "tiktok" | "facebook" | "linkedin";
  accountHandle?: string;
  accessToken?: string;
  postCount?: number; // 3-12
  displayType: "embed" | "api" | "iframe";
  hashtag?: string;
  showLikes: boolean;
  showComments: boolean;
}

export interface SocialMediaFeedStyling {
  columnCount?: number;
  spacing?: number;
}

export interface SocialMediaFeedProperties {
  elementType: "social_media_feed";
  name: string;
  settings: SocialMediaFeedSettings;
  styling: SocialMediaFeedStyling;
  position: PositionMetadata;
  responsive: ResponsiveRules;
  visibility: VisibilityRules;
}

// 5.5 Customer Count Ticker
export interface CustomerCountTickerSettings {
  currentCount: number;
  label: string;
  animateToNumber?: boolean;
  animationDuration?: number;
  prefix?: string;
  suffix?: string;
  updateFrequency?: number;
  dataSource?: "static" | "api" | "real-time";
}

export interface CustomerCountTickerStyling {
  fontSize: number;
  fontWeight: 600 | 700;
  color: string;
  numberSize?: number;
}

export interface CustomerCountTickerProperties {
  elementType: "customer_count_ticker";
  name: string;
  settings: CustomerCountTickerSettings;
  styling: CustomerCountTickerStyling;
  position: PositionMetadata;
  responsive: ResponsiveRules;
  visibility: VisibilityRules;
}

// ============================================================================
// 6. URGENCY ELEMENTS
// ============================================================================

// 6.1 Countdown Timer
export interface CountdownTimerSettings {
  endTime: number; // unix timestamp
  format: "hms" | "hm" | "ms" | "d:h:m:s";
  showDays: boolean;
  showHours: boolean;
  showMinutes: boolean;
  showSeconds: boolean;
  onExpire: "hide" | "show-message" | "redirect";
  expireMessage?: string;
  expireRedirectUrl?: string;
  timezone?: string;
}

export interface CountdownTimerStyling {
  fontSize: number;
  fontWeight: 600 | 700;
  color: string;
  backgroundColor?: string;
  borderRadius?: number;
  padding?: Spacing;
  displayStyle: "inline" | "card" | "banner";
}

export interface CountdownTimerProperties {
  elementType: "countdown_timer";
  name: string;
  settings: CountdownTimerSettings;
  styling: CountdownTimerStyling;
  position: PositionMetadata;
  responsive: ResponsiveRules;
  visibility: VisibilityRules;
}

// 6.2 Stock Counter
export interface StockCounterSettings {
  currentStock: number;
  totalStock?: number;
  showProgressBar?: boolean;
  lowStockThreshold?: number;
  label?: string;
  dataSource?: "static" | "api" | "real-time";
}

export interface StockCounterStyling {
  fontSize: number;
  color: string;
  lowStockColor?: string;
  backgroundColor?: string;
}

export interface StockCounterProperties {
  elementType: "stock_counter";
  name: string;
  settings: StockCounterSettings;
  styling: StockCounterStyling;
  position: PositionMetadata;
  responsive: ResponsiveRules;
  visibility: VisibilityRules;
}

// 6.3 Limited Offer Banner
export interface LimitedOfferBannerSettings {
  text: string;
  description?: string;
  endTime?: number;
  backgroundColor: string;
  textColor: string;
  closeable: boolean;
  position: "top" | "bottom" | "sticky";
  importance: "low" | "medium" | "high";
}

export interface LimitedOfferBannerStyling {
  fontSize: number;
  fontWeight: 600 | 700;
  padding?: Spacing;
  borderRadius?: number;
  animation?: "none" | "pulse" | "blink";
}

export interface LimitedOfferBannerProperties {
  elementType: "limited_offer_banner";
  name: string;
  settings: LimitedOfferBannerSettings;
  styling: LimitedOfferBannerStyling;
  position: PositionMetadata;
  responsive: ResponsiveRules;
  visibility: VisibilityRules;
}

// 6.4 Exit Intent Popup
export interface ExitIntentPopupSettings {
  headingText: string;
  bodyText: string;
  discountCode?: string;
  discountPercentage?: number;
  triggerEvent: "exit-intent" | "time-delay" | "scroll-depth";
  timeDelaySeconds?: number;
  scrollDepthPercent?: number;
  showOncePerSession: boolean;
  showOncePerUser: boolean;
  cookieDuration?: number;
  acceptButtonText: string;
  declineButtonText?: string;
  onAccept?: "apply-coupon" | "redirect" | "add-to-cart";
}

export interface ExitIntentPopupStyling {
  width?: number;
  backgroundColor: string;
  borderRadius?: number;
  padding?: Spacing;
  boxShadow?: string;
  overlayColor?: string;
  overlayOpacity?: number;
}

export interface ExitIntentPopupProperties {
  elementType: "exit_intent_popup";
  name: string;
  settings: ExitIntentPopupSettings;
  styling: ExitIntentPopupStyling;
  position: PositionMetadata;
  responsive: ResponsiveRules;
  visibility: VisibilityRules;
}

// ============================================================================
// 7. INTERACTIVE WIDGETS
// ============================================================================

// 7.1 FAQ Accordion
export interface FAQAccordionSettings {
  items: {
    question: string;
    answer: string;
    category?: string;
  }[];
  allowMultipleOpen: boolean;
  defaultOpen?: number;
  searchable?: boolean;
  analytics?: boolean;
}

export interface FAQAccordionStyling {
  backgroundColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  padding?: Spacing;
  spacing?: number;
  questionFontSize?: number;
  questionFontWeight?: 600 | 700;
  answerFontSize?: number;
  expandIconColor?: string;
}

export interface FAQAccordionProperties {
  elementType: "faq_accordion";
  name: string;
  settings: FAQAccordionSettings;
  styling: FAQAccordionStyling;
  position: PositionMetadata;
  responsive: ResponsiveRules;
  visibility: VisibilityRules;
}

// 7.2 Tabs
export interface TabsSettings {
  tabs: {
    label: string;
    content: string;
    icon?: string;
  }[];
  defaultActiveTab?: number;
  layout: "horizontal" | "vertical";
  tabStyle: "underline" | "pills" | "cards" | "buttons";
  allowDeepLink?: boolean;
}

export interface TabsStyling {
  backgroundColor?: string;
  activeTabColor?: string;
  inactiveTabColor?: string;
  borderRadius?: number;
  padding?: Spacing;
}

export interface TabsProperties {
  elementType: "tabs";
  name: string;
  settings: TabsSettings;
  styling: TabsStyling;
  position: PositionMetadata;
  responsive: ResponsiveRules;
  visibility: VisibilityRules;
}

// 7.3 Progress Bar
export interface ProgressBarSettings {
  value: number; // 0-100
  maximum?: number;
  label?: string;
  showPercentage: boolean;
  animated: boolean;
  striped?: boolean;
  dataSource?: "static" | "dynamic";
}

export interface ProgressBarStyling {
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  borderRadius?: number;
}

export interface ProgressBarProperties {
  elementType: "progress_bar";
  name: string;
  settings: ProgressBarSettings;
  styling: ProgressBarStyling;
  position: PositionMetadata;
  responsive: ResponsiveRules;
  visibility: VisibilityRules;
}

// 7.4 Quiz / Survey
export interface QuizSurveySettings {
  title: string;
  description?: string;
  questions: {
    question: string;
    type: "multiple-choice" | "true-false" | "rating" | "text";
    options?: {
      label: string;
      value: string;
      resultMessage?: string;
    }[];
    scoring?: number;
  }[];
  showResults: boolean;
  resultsMessage?: string;
  leadCapture?: boolean;
  redirectOnComplete?: string;
}

export interface QuizSurveyStyling {
  backgroundColor?: string;
  borderRadius?: number;
  padding?: Spacing;
}

export interface QuizSurveyProperties {
  elementType: "quiz_survey";
  name: string;
  settings: QuizSurveySettings;
  styling: QuizSurveyStyling;
  position: PositionMetadata;
  responsive: ResponsiveRules;
  visibility: VisibilityRules;
}

// 7.5 Calendar Booking
export interface CalendarBookingSettings {
  provider: "calendly" | "google-calendar" | "stripe-payments" | "custom";
  calendarUrl?: string;
  minNotice?: number; // hours
  maxDaysAhead?: number;
  showTimezone?: boolean;
  timeSlotDuration?: number; // minutes
  showAvailabilityCount?: boolean;
}

export interface CalendarBookingStyling {
  backgroundColor?: string;
  borderRadius?: number;
  padding?: Spacing;
}

export interface CalendarBookingProperties {
  elementType: "calendar_booking";
  name: string;
  settings: CalendarBookingSettings;
  styling: CalendarBookingStyling;
  position: PositionMetadata;
  responsive: ResponsiveRules;
  visibility: VisibilityRules;
}

// 7.6 Live Chat Widget
export interface LiveChatWidgetSettings {
  provider: "intercom" | "drift" | "zendesk" | "custom";
  apiKey?: string;
  position: "bottom-right" | "bottom-left";
  showBadge?: boolean;
  offlineMessage?: string;
  headerTitle?: string;
}

export interface LiveChatWidgetStyling {
  themeColor?: string;
}

export interface LiveChatWidgetProperties {
  elementType: "live_chat_widget";
  name: string;
  settings: LiveChatWidgetSettings;
  styling: LiveChatWidgetStyling;
  position: PositionMetadata;
  responsive: ResponsiveRules;
  visibility: VisibilityRules;
}

// ============================================================================
// UNION TYPE FOR ALL ELEMENTS
// ============================================================================

export type ElementProperties =
  // Text
  | HeadlineProperties
  | SubheadlineProperties
  | ParagraphProperties
  | BulletListProperties
  | TestimonialTextProperties
  // Media
  | ImageProperties
  | VideoProperties
  | AudioProperties
  | ImageGalleryProperties
  | BackgroundVideoProperties
  // Forms
  | InputFieldProperties
  | TextareaProperties
  | SelectDropdownProperties
  | CheckboxProperties
  | RadioButtonsProperties
  | SubmitButtonProperties
  | MultiStepFormProperties
  // Commerce
  | PricingTableProperties
  | BuyButtonProperties
  | ProductCardProperties
  | CartSummaryProperties
  | OrderBumpCheckboxProperties
  | CouponCodeInputProperties
  // Social Proof
  | TestimonialCardProperties
  | ReviewStarsProperties
  | TrustBadgesProperties
  | SocialMediaFeedProperties
  | CustomerCountTickerProperties
  // Urgency
  | CountdownTimerProperties
  | StockCounterProperties
  | LimitedOfferBannerProperties
  | ExitIntentPopupProperties
  // Interactive
  | FAQAccordionProperties
  | TabsProperties
  | ProgressBarProperties
  | QuizSurveyProperties
  | CalendarBookingProperties
  | LiveChatWidgetProperties;

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: {
    field: string;
    message: string;
    code: string; // "required", "invalid-format", "out-of-range"
  }[];
}

/**
 * Validate headline element settings
 */
export function validateHeadline(settings: HeadlineSettings): ValidationResult {
  const errors = [];

  if (!settings.text || settings.text.length === 0) {
    errors.push({ field: "text", message: "Text is required", code: "required" });
  }

  if (settings.text && settings.text.length > 255) {
    errors.push({ field: "text", message: "Text exceeds 255 characters", code: "max-length" });
  }

  if (![1, 2, 3, 4, 5, 6].includes(settings.level)) {
    errors.push({ field: "level", message: "Invalid heading level", code: "invalid-value" });
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate image element settings
 */
export function validateImage(settings: ImageSettings): ValidationResult {
  const errors = [];

  if (!settings.src || settings.src.length === 0) {
    errors.push({ field: "src", message: "Image source is required", code: "required" });
  }

  if (!settings.altText || settings.altText.length === 0) {
    errors.push({ field: "altText", message: "Alt text is required for accessibility", code: "required" });
  }

  if (settings.altText && settings.altText.length > 200) {
    errors.push({ field: "altText", message: "Alt text exceeds 200 characters", code: "max-length" });
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate video element settings
 */
export function validateVideo(settings: VideoSettings): ValidationResult {
  const errors = [];

  if (!settings.url && !settings.videoId) {
    errors.push({ field: "url", message: "Video URL or video ID is required", code: "required" });
  }

  if (settings.playbackRate && (settings.playbackRate < 0.5 || settings.playbackRate > 2.0)) {
    errors.push({ field: "playbackRate", message: "Playback rate must be between 0.5 and 2.0", code: "out-of-range" });
  }

  if (settings.autoplay && !settings.muted) {
    errors.push({ field: "muted", message: "Autoplay videos must be muted", code: "invalid-combination" });
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate input field settings
 */
export function validateInputField(settings: InputFieldSettings): ValidationResult {
  const errors = [];

  if (!settings.fieldName || settings.fieldName.length === 0) {
    errors.push({ field: "fieldName", message: "Field name is required", code: "required" });
  }

  if (settings.fieldName && !/^[a-zA-Z0-9_]+$/.test(settings.fieldName)) {
    errors.push({ field: "fieldName", message: "Field name must be alphanumeric", code: "invalid-format" });
  }

  if (settings.maxLength && settings.minLength && settings.minLength > settings.maxLength) {
    errors.push({ field: "minLength", message: "Min length cannot exceed max length", code: "invalid-range" });
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate pricing table settings
 */
export function validatePricingTable(settings: PricingTableSettings): ValidationResult {
  const errors = [];

  if (!settings.columns || settings.columns.length === 0) {
    errors.push({ field: "columns", message: "At least one pricing column is required", code: "required" });
  }

  settings.columns.forEach((column, index) => {
    if (column.price < 0) {
      errors.push({ field: `columns[${index}].price`, message: "Price cannot be negative", code: "invalid-value" });
    }

    if (column.features.length === 0) {
      errors.push({ field: `columns[${index}].features`, message: "At least one feature is required", code: "required" });
    }
  });

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate countdown timer settings
 */
export function validateCountdownTimer(settings: CountdownTimerSettings): ValidationResult {
  const errors = [];

  if (!settings.endTime) {
    errors.push({ field: "endTime", message: "End time is required", code: "required" });
  }

  if (settings.endTime && settings.endTime < Date.now()) {
    errors.push({ field: "endTime", message: "End time must be in the future", code: "invalid-value" });
  }

  if (settings.onExpire === "redirect" && !settings.expireRedirectUrl) {
    errors.push({ field: "expireRedirectUrl", message: "Redirect URL is required when onExpire is 'redirect'", code: "required" });
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Generic validation function that routes to specific validators
 */
export function validateElement(properties: ElementProperties): ValidationResult {
  switch (properties.elementType) {
    case "headline":
      return validateHeadline(properties.settings);
    case "image":
      return validateImage(properties.settings);
    case "video":
      return validateVideo(properties.settings);
    case "input_field":
      return validateInputField(properties.settings);
    case "pricing_table":
      return validatePricingTable(properties.settings);
    case "countdown_timer":
      return validateCountdownTimer(properties.settings);
    // Add more validators as needed
    default:
      return { isValid: true, errors: [] };
  }
}

/**
 * Convex validators for element properties
 * Used in mutations to validate incoming data
 */
export const elementValidators = {
  // Shared validators
  spacing: v.optional(
    v.object({
      top: v.optional(v.number()),
      right: v.optional(v.number()),
      bottom: v.optional(v.number()),
      left: v.optional(v.number()),
      all: v.optional(v.number()),
    })
  ),

  position: v.object({
    x: v.number(),
    y: v.number(),
    width: v.union(v.number(), v.string()),
    height: v.union(v.number(), v.string()),
    zIndex: v.number(),
  }),

  visibility: v.object({
    hidden: v.boolean(),
    mobile: v.boolean(),
    tablet: v.boolean(),
    desktop: v.boolean(),
  }),

  responsive: v.optional(v.any()), // Type-specific responsive rules

  // Element-specific validators (examples)
  headlineSettings: v.object({
    text: v.string(),
    level: v.union(v.literal(1), v.literal(2), v.literal(3), v.literal(4), v.literal(5), v.literal(6)),
    alignment: v.union(v.literal("left"), v.literal("center"), v.literal("right")),
    maxWidth: v.optional(v.number()),
    lineHeight: v.optional(v.number()),
    letterSpacing: v.optional(v.number()),
    animation: v.optional(v.any()),
  }),

  imageSettings: v.object({
    src: v.string(),
    altText: v.string(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    aspectRatio: v.optional(v.union(
      v.literal("auto"),
      v.literal("square"),
      v.literal("16:9"),
      v.literal("4:3"),
      v.literal("3:2"),
      v.literal("custom")
    )),
    customAspectRatio: v.optional(v.string()),
    objectFit: v.union(v.literal("contain"), v.literal("cover"), v.literal("fill"), v.literal("scale-down")),
    objectPosition: v.optional(v.string()),
    loading: v.union(v.literal("lazy"), v.literal("eager")),
    placeholderUrl: v.optional(v.string()),
    blur: v.optional(v.any()),
    caption: v.optional(v.string()),
    link: v.optional(v.any()),
  }),
};

/**
 * Default values for element types
 */
export const elementDefaults = {
  headline: {
    settings: {
      text: "Your Headline Here",
      level: 1 as const,
      alignment: "center" as const,
      maxWidth: undefined,
    },
    styling: {
      fontFamily: "Inter",
      fontSize: 48,
      fontWeight: 700 as const,
      color: "#000000",
      textDecoration: "none" as const,
      textTransform: "none" as const,
    },
  },

  image: {
    settings: {
      src: "",
      altText: "Product image",
      aspectRatio: "auto" as const,
      objectFit: "cover" as const,
      loading: "lazy" as const,
    },
    styling: {
      borderRadius: 8,
      borderWidth: 0,
      opacity: 1,
    },
  },

  buy_button: {
    settings: {
      text: "Buy Now",
      price: 0,
      currency: "USD",
      quantity: 1,
      checkoutType: "stripe" as const,
      requiresEmail: false,
      requiresShipping: false,
      disabled: false,
    },
    styling: {
      fontSize: 16,
      fontWeight: 700 as const,
      color: "#ffffff",
      backgroundColor: "#10b981",
      borderRadius: 6,
      showPrice: true,
    },
  },
};
