# Funnel Builder Services

This directory contains Effect.ts services and schemas for the ClickFunnels-style funnel builder.

## Structure

```
services/funnel/
├── README.md                      # This file
├── element-schemas.ts             # TypeScript schemas for all 37 element types (Cycle 027)
├── ELEMENT-TYPES-REFERENCE.md     # Quick reference guide for developers
├── funnel.ts                      # (Future) FunnelService - funnel CRUD logic
├── step.ts                        # (Future) StepService - step management
├── element.ts                     # (Future) ElementService - element operations
├── template.ts                    # (Future) TemplateService - template cloning
├── form.ts                        # (Future) FormService - form handling
├── analytics.ts                   # (Future) AnalyticsService - metrics calculation
└── payment.ts                     # (Future) PaymentService - Stripe integration
```

## Current Status (Cycle 027)

### ✅ Complete
- `element-schemas.ts` - All 37 element type interfaces and validation functions
- `ELEMENT-TYPES-REFERENCE.md` - Developer quick reference

### 🔄 In Progress
- None currently

### 📋 Planned (Cycles 028-090)
- Cycle 028: Connection records for funnel structure
- Cycle 029: Funnel sequence validation
- Cycle 030: Unit tests for services
- Cycles 31-50: Frontend page builder implementation
- Cycles 51-60: Template system
- Cycles 61-70: Form builder and lead capture
- Cycles 71-80: Analytics and conversion tracking
- Cycles 81-90: Payment integration

## Usage

### Import Element Schemas

```typescript
import {
  HeadlineProperties,
  ImageProperties,
  BuyButtonProperties,
  validateElement,
  elementDefaults
} from "../services/funnel/element-schemas";
```

### Create an Element

```typescript
const headline: HeadlineProperties = {
  elementType: "headline",
  name: "Hero Headline",
  settings: {
    ...elementDefaults.headline.settings,
    text: "Transform Your Business",
  },
  styling: elementDefaults.headline.styling,
  position: { x: 0, y: 0, width: "100%", height: "auto", zIndex: 1 },
  responsive: {},
  visibility: { hidden: false, mobile: true, tablet: true, desktop: true },
};
```

### Validate Element

```typescript
const validation = validateElement(headline);
if (!validation.isValid) {
  throw new Error(validation.errors[0].message);
}
```

## Design Principles

1. **Ontology-First:** All elements stored as `things` with `type: "page_element"`
2. **Type Safety:** Strong TypeScript interfaces for all element types
3. **Validation:** Client-side and server-side validation with clear error codes
4. **Responsive:** Mobile/tablet/desktop breakpoints for all elements
5. **Extensible:** Easy to add new element types without breaking changes

## Related Documentation

- **Ontology:** `/one/knowledge/ontology.md`
- **Cycle Plan:** `/one/things/plans/clickfunnels-builder-100-cycles.md`
- **Element Spec:** `/one/things/plans/cycle-005-page-element-types.md`
- **Implementation:** `/one/things/plans/cycle-027-implementation-summary.md`

## Element Categories

- **TEXT (5):** headline, subheadline, paragraph, bullet_list, testimonial_text
- **MEDIA (5):** image, video, audio_player, image_gallery, background_video
- **FORMS (7):** input_field, textarea, select_dropdown, checkbox, radio_buttons, submit_button, multi_step_form
- **COMMERCE (6):** pricing_table, buy_button, product_card, cart_summary, order_bump_checkbox, coupon_code_input
- **SOCIAL PROOF (5):** testimonial_card, review_stars, trust_badges, social_media_feed, customer_count_ticker
- **URGENCY (4):** countdown_timer, stock_counter, limited_offer_banner, exit_intent_popup
- **INTERACTIVE (6):** faq_accordion, tabs, progress_bar, quiz_survey, calendar_booking, live_chat_widget

**Total:** 37 element types

---

**Last Updated:** 2025-11-22 (Cycle 027)
