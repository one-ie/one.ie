# Element Types Quick Reference

**Generated from Cycle 027 implementation**

This document provides a quick reference for all 37 element types available in the funnel builder.

---

## Element Type Registry

### TEXT ELEMENTS (5)

| Element Type | Key | Properties | Common Use Cases |
|--------------|-----|------------|------------------|
| Headline | `headline` | text, level (1-6), alignment, fontSize, fontWeight, color | Hero headlines, section titles |
| Subheadline | `subheadline` | text, alignment, fontSize, opacity | Supporting subtitles |
| Paragraph | `paragraph` | text, alignment, maxWidth, lineHeight, columns | Body text, descriptions |
| Bullet List | `bullet_list` | items[], icon, ordered, spacing | Feature lists, benefits |
| Testimonial Text | `testimonial_text` | quote, author, role, rating, photoUrl | Customer quotes |

### MEDIA ELEMENTS (5)

| Element Type | Key | Properties | Common Use Cases |
|--------------|-----|------------|------------------|
| Image | `image` | src, altText, aspectRatio, objectFit, loading | Product images, photos |
| Video | `video` | source, url/videoId, autoplay, controls, muted | Sales videos, demos |
| Audio Player | `audio_player` | src, controls, playbackRate, playlist | Podcasts, audio content |
| Image Gallery | `image_gallery` | images[], layout, columns, enableLightbox | Product galleries, portfolios |
| Background Video | `background_video` | url, autoplay, overlay, brightness | Hero sections |

### FORM ELEMENTS (7)

| Element Type | Key | Properties | Common Use Cases |
|--------------|-----|------------|------------------|
| Input Field | `input_field` | type, fieldName, label, placeholder, required | Email, name, phone inputs |
| Textarea | `textarea` | fieldName, rows, maxLength, resizable | Message boxes, comments |
| Select Dropdown | `select_dropdown` | options[], multiple, searchable | Country selector, categories |
| Checkbox | `checkbox` | fieldName, checked, required | Terms agreement, opt-ins |
| Radio Buttons | `radio_buttons` | options[], layout, defaultValue | Single-choice selections |
| Submit Button | `submit_button` | text, formId, action, loading | Form submission |
| Multi-step Form | `multi_step_form` | steps[], progressBarStyle, saveProgress | Wizards, long forms |

### COMMERCE ELEMENTS (6)

| Element Type | Key | Properties | Common Use Cases |
|--------------|-----|------------|------------------|
| Pricing Table | `pricing_table` | columns[], features[], billingPeriod | Plan comparisons |
| Buy Button | `buy_button` | text, price, currency, checkoutType | Checkout buttons |
| Product Card | `product_card` | productId, showPrice, showRating | Product displays |
| Cart Summary | `cart_summary` | showShipping, showTax, showCoupon | Order summaries |
| Order Bump Checkbox | `order_bump_checkbox` | productId, price, description | Upsells at checkout |
| Coupon Code Input | `coupon_code_input` | placeholder, buttonText, caseSensitive | Discount codes |

### SOCIAL PROOF ELEMENTS (5)

| Element Type | Key | Properties | Common Use Cases |
|--------------|-----|------------|------------------|
| Testimonial Card | `testimonial_card` | quote, author, photoUrl, verified | Customer testimonials |
| Review Stars | `review_stars` | rating, reviewCount, starSize | Product ratings |
| Trust Badges | `trust_badges` | badges[], layout, spacing | SSL, payment logos |
| Social Media Feed | `social_media_feed` | platform, accountHandle, postCount | Instagram embeds |
| Customer Count Ticker | `customer_count_ticker` | currentCount, label, animated | Live counters |

### URGENCY ELEMENTS (4)

| Element Type | Key | Properties | Common Use Cases |
|--------------|-----|------------|------------------|
| Countdown Timer | `countdown_timer` | endTime, format, onExpire | Limited offers |
| Stock Counter | `stock_counter` | currentStock, lowStockThreshold | Inventory displays |
| Limited Offer Banner | `limited_offer_banner` | text, endTime, closeable | Flash sale banners |
| Exit Intent Popup | `exit_intent_popup` | headingText, discountCode, triggerEvent | Exit offers |

### INTERACTIVE WIDGETS (6)

| Element Type | Key | Properties | Common Use Cases |
|--------------|-----|------------|------------------|
| FAQ Accordion | `faq_accordion` | items[], allowMultipleOpen, searchable | Q&A sections |
| Tabs | `tabs` | tabs[], defaultActiveTab, tabStyle | Tabbed content |
| Progress Bar | `progress_bar` | value, maximum, showPercentage, animated | Visual progress |
| Quiz / Survey | `quiz_survey` | questions[], showResults, leadCapture | Interactive quizzes |
| Calendar Booking | `calendar_booking` | provider, calendarUrl, timeSlotDuration | Appointments |
| Live Chat Widget | `live_chat_widget` | provider, apiKey, position | Customer support |

---

## Import Usage

```typescript
import {
  // Type imports
  HeadlineProperties,
  ImageProperties,
  BuyButtonProperties,

  // Validation
  validateElement,
  validateHeadline,
  validateImage,

  // Defaults
  elementDefaults,

  // Validators
  elementValidators,

  // Union type
  ElementProperties,
} from "./element-schemas";
```

---

## Element Type String Constants

```typescript
// For type-checking element types
export type ElementType =
  // Text
  | "headline"
  | "subheadline"
  | "paragraph"
  | "bullet_list"
  | "testimonial_text"
  // Media
  | "image"
  | "video"
  | "audio_player"
  | "image_gallery"
  | "background_video"
  // Forms
  | "input_field"
  | "textarea"
  | "select_dropdown"
  | "checkbox"
  | "radio_buttons"
  | "submit_button"
  | "multi_step_form"
  // Commerce
  | "pricing_table"
  | "buy_button"
  | "product_card"
  | "cart_summary"
  | "order_bump_checkbox"
  | "coupon_code_input"
  // Social Proof
  | "testimonial_card"
  | "review_stars"
  | "trust_badges"
  | "social_media_feed"
  | "customer_count_ticker"
  // Urgency
  | "countdown_timer"
  | "stock_counter"
  | "limited_offer_banner"
  | "exit_intent_popup"
  // Interactive
  | "faq_accordion"
  | "tabs"
  | "progress_bar"
  | "quiz_survey"
  | "calendar_booking"
  | "live_chat_widget";
```

---

## Common Properties Pattern

Every element follows this structure:

```typescript
{
  elementType: ElementType,
  name: string,
  settings: {
    // Element-specific settings
  },
  styling: {
    // Visual styling properties
  },
  position: {
    x: number,
    y: number,
    width: number | string,
    height: number | string,
    zIndex: number
  },
  responsive: {
    mobile?: { ... },
    tablet?: { ... },
    desktop?: { ... }
  },
  visibility: {
    hidden: boolean,
    mobile: boolean,
    tablet: boolean,
    desktop: boolean
  }
}
```

---

## Validation Example

```typescript
import { validateElement } from "./element-schemas";

const result = validateElement(elementProperties);

if (!result.isValid) {
  result.errors.forEach(error => {
    console.error(`${error.field}: ${error.message} (${error.code})`);
  });
}
```

---

## Default Values Pattern

```typescript
import { elementDefaults } from "./element-schemas";

// Start with defaults
const newHeadline = {
  elementType: "headline",
  name: "My Headline",
  settings: {
    ...elementDefaults.headline.settings,
    text: "Custom headline text", // Override
  },
  styling: elementDefaults.headline.styling,
  // ... position, responsive, visibility
};
```

---

## Responsive Breakpoints

Standard breakpoints used across all elements:

```typescript
{
  mobile: { maxWidth: 640 },    // 0-640px
  tablet: { minWidth: 641, maxWidth: 1024 },  // 641-1024px
  desktop: { minWidth: 1025 }   // 1025px+
}
```

---

## Element Categories Summary

- **TEXT (5):** Content and typography elements
- **MEDIA (5):** Images, video, audio, galleries
- **FORMS (7):** Input fields, buttons, multi-step forms
- **COMMERCE (6):** Pricing, checkout, cart elements
- **SOCIAL PROOF (5):** Testimonials, reviews, trust signals
- **URGENCY (4):** Timers, stock counters, exit popups
- **INTERACTIVE (6):** FAQs, tabs, quizzes, calendars

**Total:** 37 element types

---

## File Location

**Schema File:** `/home/user/one.ie/backend/convex/services/funnel/element-schemas.ts`

**Documentation:**
- `/home/user/one.ie/one/things/plans/cycle-005-page-element-types.md` (Specification)
- `/home/user/one.ie/one/things/plans/cycle-027-implementation-summary.md` (Implementation)
- `/home/user/one.ie/backend/convex/services/funnel/ELEMENT-TYPES-REFERENCE.md` (This file)

---

**Last Updated:** 2025-11-22 (Cycle 027)
