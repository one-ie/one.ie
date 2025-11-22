---
title: "Cycle 004: Define Funnel Step Types"
dimension: things
category: plans
tags: funnel-builder, step-types, page-types, specifications, ontology
related_dimensions: connections, events, knowledge
scope: feature
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
ai_context: |
  Complete specification of all funnel step types (page types) for the ClickFunnels-style funnel builder.
  Defines core and advanced step types with complete ontology mapping.
  For each step type: purpose, required elements, conversion goals, connections, and events.
---

# Cycle 004: Define Funnel Step Types

**Objective:** Define all funnel step types (page types) that the funnel builder supports, with complete specifications mapping to the 6-dimension ontology.

**Status:** Complete - Design Document

---

## Overview

A **funnel step** (or **page**) is a `thing` with `type: "funnel_step"` that represents a single page in a sales funnel sequence. Each step type serves a specific purpose in guiding prospects toward conversion.

### Mapping to 6-Dimension Ontology

**THINGS:**
- Entity type: `funnel_step`
- Sub-types: landing_page, sales_page, upsell_page, downsell_page, thank_you_page, webinar_registration, opt_in_page, order_form, survey_page, vsl_page, countdown_timer_page, two_step_optin, membership_login_page

**CONNECTIONS:**
- `funnel_contains_step` - Funnel → FunnelStep (sequential)
- `step_contains_element` - FunnelStep → PageElement
- `step_based_on_template` - FunnelStep → PageTemplate
- `visitor_viewed_step` - Visitor → FunnelStep (tracking)
- `visitor_submitted_form` - Visitor → FormSubmission (on steps with forms)

**EVENTS:**
- `step_added` - New funnel step created
- `step_removed` - Step removed from funnel
- `step_reordered` - Funnel sequence changed
- `step_viewed` - Visitor viewed the step
- `form_submitted` - Lead captured from form on step

**KNOWLEDGE:**
- Labels: `funnel_category:lead-gen`, `funnel_category:ecommerce`, `funnel_category:webinar`, `funnel_category:membership`, etc.
- Categories by conversion stage: `awareness`, `consideration`, `decision`

---

## Core Step Types

### 1. Landing Page (Opt-In Page)

**Entity Definition:**
```typescript
{
  type: "funnel_step",
  subtype: "landing_page",
  name: string,           // e.g., "Lead Magnet Opt-In"
  slug: string,           // URL-safe identifier
  status: "draft" | "published" | "archived",
  sequence: number,       // Position in funnel (1, 2, 3...)
  properties: {
    headline: string,
    subheadline?: string,
    description?: string,
    cta_text: string,     // "Get Instant Access" | "Download Now" | "Sign Up"
    form_fields: {
      email: { required: true, label: "Email Address" },
      firstName?: { required: boolean, label: string },
      lastName?: { required: boolean, label: string },
      phone?: { required: boolean, label: string },
      // custom fields array
      custom: Array<{ name: string, type: string, required: boolean }>
    },
    redirect_after_submit?: string,  // URL to redirect after form submission
    background_type: "color" | "image" | "video",
    background_value: string,        // hex color, image URL, or video URL
    background_opacity?: number,      // 0-1
    section_layout: "single_column" | "two_column" | "asymmetric",
    color_scheme: {
      primary_color: string,    // hex
      secondary_color?: string,
      text_color: string,
      button_color: string,
    },
    seo: {
      meta_title?: string,
      meta_description?: string,
      og_title?: string,
      og_image?: string,
    },
    analytics: {
      pixel_ids?: string[],     // Facebook, Google Analytics, etc.
      utm_tracking?: boolean,
    }
  },
  settings: {
    allow_mobile: boolean,
    show_header: boolean,
    show_footer: boolean,
    custom_code?: string,
  }
}
```

**Primary Purpose:**
Build an email list by offering a valuable lead magnet (ebook, checklist, template, course, etc.) in exchange for email address.

**Required Elements:**
1. **Headline** - Compelling value proposition (should answer "What will I get?")
2. **Subheadline** - Supporting detail or benefit statement
3. **Description/Body Copy** - Details about the lead magnet
4. **Form Fields** - At minimum: email address; optionally first name, last name, phone
5. **Call-to-Action (CTA) Button** - Primary action (Get Access, Download, Sign Up)
6. **Lead Magnet Preview** - Image, PDF preview, or video showing what they'll get

**Typical Conversion Goals:**
- Email captures: 5-15% (varies by traffic source)
- Form completion rate: 20-40%
- Click-through to CTA: 30-50%

**Sequence Position:**
- Usually step 1 (entry point to funnel)
- Can appear after a webinar registration

**Connection Types Created:**
1. `visitor_entered_funnel` - Track when visitor first lands on landing page
2. `visitor_submitted_form` - Create form_submission thing when lead opts in
3. `funnel_contains_step` - Link from funnel to this landing page

**Events Triggered:**
1. `step_added` - When landing page created
2. `step_viewed` - When visitor lands on page
3. `form_submitted` - When visitor submits email
4. `element_added` - When elements added to page
5. `step_published` - When landing page goes live

**Analytics Tracked:**
- Page views
- Form submissions
- Conversion rate (views → submissions)
- Bounce rate
- Time on page

---

### 2. Sales Page (Product Presentation)

**Entity Definition:**
```typescript
{
  type: "funnel_step",
  subtype: "sales_page",
  name: string,           // e.g., "Main Sales Page"
  slug: string,
  status: "draft" | "published" | "archived",
  sequence: number,
  properties: {
    headline: string,     // Problem statement or benefit
    subheadline?: string,
    product_image?: string,
    product_description: string,
    price: number,
    currency: "USD" | "EUR" | "GBP" | string,
    original_price?: number,  // For showing discount
    discount_percentage?: number,
    payment_type: "one_time" | "subscription",
    subscription_interval?: "monthly" | "yearly" | "quarterly",
    features_list: Array<{
      icon?: string,
      title: string,
      description?: string,
    }>,
    pain_points: Array<string>,  // What problems it solves
    benefits: Array<string>,     // Desired outcomes
    social_proof: {
      testimonials: Array<{
        author: string,
        role?: string,
        text: string,
        rating?: number,  // 1-5
        image?: string,
      }>,
      case_studies?: Array<{
        title: string,
        result: string,
        url?: string,
      }>,
      user_count?: number,  // "Join 10,000+ customers"
      rating?: number,
      review_count?: number,
    },
    urgency_elements: {
      show_timer?: boolean,
      timer_label?: string,  // "Offer expires in..."
      limited_spots?: boolean,
      spots_remaining?: number,
      limited_time_offer?: boolean,
      offer_expires?: number,  // timestamp
    },
    guarantee: {
      show_guarantee?: boolean,
      guarantee_text?: string,  // "30-day money-back guarantee"
      guarantee_days?: number,
    },
    faq: Array<{
      question: string,
      answer: string,
    }>,
    cta_button: {
      text: string,  // "Buy Now" | "Add to Cart" | "Enroll Now"
      style: "primary" | "secondary",
    },
    color_scheme: {
      primary_color: string,
      secondary_color?: string,
      accent_color?: string,
      background_color?: string,
    },
    layout: "standard" | "long_form" | "video_sales_letter",
    seo: {
      meta_title?: string,
      meta_description?: string,
      og_title?: string,
      og_image?: string,
    }
  },
  settings: {
    allow_mobile: boolean,
    show_related_products?: boolean,
    enable_reviews?: boolean,
    custom_code?: string,
  }
}
```

**Primary Purpose:**
Present a product/service with full persuasive copy, social proof, and urgency to convert prospects into buyers.

**Required Elements:**
1. **Headline** - Problem statement or transformation promise
2. **Product Image/Video** - Visual representation of product
3. **Product Description** - What is it? Who is it for? How does it work?
4. **Price Display** - Clear pricing with optional discount
5. **Features List** - Specific deliverables/features
6. **Benefits Section** - Desired outcomes for customer
7. **Social Proof** - Testimonials, case studies, user counts, ratings
8. **FAQ Section** - Addresses common objections
9. **CTA Button** - "Buy Now" or "Enroll Now" with payment integration
10. **Guarantee/Risk Reversal** - 30-day money-back guarantee or similar

**Typical Conversion Goals:**
- Click-through to payment: 2-8% (depends on product and traffic quality)
- Actual purchases: 1-5%
- Cart abandonment rate: 70-80%

**Sequence Position:**
- Usually step 2-3 (after lead magnet or webinar)
- Can be standalone if direct to sales

**Connection Types Created:**
1. `visitor_viewed_step` - Track page views
2. `step_contains_element` - All product elements
3. `funnel_leads_to_product` - Link to actual product/service
4. `customer_purchased_via_funnel` - When purchase completes

**Events Triggered:**
1. `step_viewed` - Page visit
2. `element_clicked` - CTA button clicks
3. `purchase_completed` - Payment processed (with Stripe)
4. `step_published` - When page goes live

**Analytics Tracked:**
- Page views
- Time on page
- Scroll depth
- CTA click rate
- Purchase rate
- Average order value
- Revenue per visitor

---

### 3. Upsell Page

**Entity Definition:**
```typescript
{
  type: "funnel_step",
  subtype: "upsell_page",
  name: string,           // e.g., "Premium Upgrade Offer"
  slug: string,
  status: "draft" | "published" | "archived",
  sequence: number,
  properties: {
    headline: string,     // "Wait! Before you go..." | "One more thing..."
    related_product_id?: Id<'things'>,  // Reference to main product
    original_price?: number,
    upsell_price: number,
    discount_percent?: number,
    discount_expires?: number,  // timestamp
    upsell_description: string,  // Why upgrade now?
    upsell_benefits: Array<string>,
    comparison_table?: {
      standard: Array<{ feature: string, included: boolean }>,
      premium: Array<{ feature: string, included: boolean }>,
    },
    urgency: {
      limited_time?: boolean,
      timer_label?: string,
      time_remaining?: number,
    },
    cta_button: {
      text: string,  // "Yes, Upgrade Me!" | "Add to Order"
      style: "primary" | "secondary",
    },
    skip_button?: {
      text: string,  // "No Thanks, I'm Good"
      action: "next_step" | "redirect_url",
      redirect_url?: string,
    },
    color_scheme: {
      primary_color: string,
      accent_color?: string,
    }
  },
  settings: {
    show_original_price: boolean,
    show_savings?: boolean,
    custom_code?: string,
  }
}
```

**Primary Purpose:**
Offer a premium/enhanced version or complementary product immediately after a purchase to increase order value.

**Required Elements:**
1. **Attention-Grabber Headline** - "Wait!" or "One More Thing..."
2. **Upsell Product Description** - What's being offered?
3. **Upsell Benefits** - How does it enhance the main purchase?
4. **Price Display** - Usually discounted (today only)
5. **Comparison** - Optional: show how premium version differs
6. **Urgency** - Limited-time offer/limited quantity
7. **Accept CTA Button** - "Yes, Add This!" or "Upgrade My Order"
8. **Skip Button** - "No Thanks" to continue to next step

**Typical Conversion Goals:**
- Upsell attachment rate: 5-20% (of those who just purchased)
- Typical upsell lift: 15-30% increase in order value

**Sequence Position:**
- Step immediately after successful payment (usually shown on thank you page or separately)
- Only shown to customers who just purchased

**Connection Types Created:**
1. `visitor_viewed_step` - Track if upsell was shown
2. `customer_purchased_via_funnel` - If upsell accepted, create second purchase event

**Events Triggered:**
1. `step_viewed` - Upsell offer shown
2. `purchase_completed` - Additional purchase made

**Analytics Tracked:**
- Views (people offered upsell)
- Acceptance rate (% who buy)
- Additional revenue generated
- Average order value increase

---

### 4. Downsell Page

**Entity Definition:**
```typescript
{
  type: "funnel_step",
  subtype: "downsell_page",
  name: string,           // e.g., "Payment Plan Option"
  slug: string,
  status: "draft" | "published" | "archived",
  sequence: number,
  properties: {
    headline: string,     // "Unable to purchase today? Here's an alternative..."
    original_product_id?: Id<'things'>,
    downsell_product_id?: Id<'things'>,
    original_price: number,
    downsell_price: number,  // Lower price point
    downsell_type: "payment_plan" | "stripped_version" | "alternative_product",
    description: string,   // Why this alternative?
    benefits: Array<string>,
    what_youll_get: Array<string>,
    payment_plan?: {
      installments: number,
      payment_amount: number,
      frequency: "weekly" | "biweekly" | "monthly",
      total_with_plan: number,
    },
    cta_button: {
      text: string,  // "Yes, I'll take the payment plan!" | "Get the Starter Package"
    },
    skip_button?: {
      text: string,
    },
    color_scheme: {
      primary_color: string,
    }
  }
}
```

**Primary Purpose:**
Offer a lower-cost alternative or payment plan to prospects who declined the main offer, recovering lost sales.

**Required Elements:**
1. **Headline** - Acknowledge objection: "Price too high? Here's an alternative..."
2. **Alternative Description** - What's being offered?
3. **Lower Price** - Significantly lower than original (typically 30-50% discount)
4. **Benefits** - Why this version still delivers value
5. **Accept CTA** - "Yes, I'll take this deal"
6. **Skip Option** - Allow progression without purchase

**Typical Conversion Goals:**
- Downsell recovery rate: 5-15% (of those who declined original)
- Helps recover 10-20% of lost sales

**Sequence Position:**
- Only shown to visitors who were offered main product but didn't buy
- Usually after sales page "No Thanks" click

**Connection Types Created:**
1. `visitor_viewed_step` - Track downsell impression
2. `customer_purchased_via_funnel` - If downsell accepted

**Events Triggered:**
1. `step_viewed` - Downsell offer shown
2. `purchase_completed` - Downsell purchase

**Analytics Tracked:**
- Recovery rate
- Downsell revenue
- Comparison: recovered value vs main offer value

---

### 5. Thank You Page (Confirmation)

**Entity Definition:**
```typescript
{
  type: "funnel_step",
  subtype: "thank_you_page",
  name: string,           // e.g., "Thank You - Check Your Email"
  slug: string,
  status: "draft" | "published" | "archived",
  sequence: number,
  properties: {
    headline: string,     // "Success! Your [product] is on the way..."
    subheadline?: string,
    confirmation_message: string,
    action_instructions: Array<string>,  // "Check your email for..." | "Your login is..."
    what_happens_next: Array<{
      step_number: number,
      description: string,
    }>,
    show_upsell_section?: boolean,  // Sometimes upsell shown here
    product_access: {
      instant_access_url?: string,
      access_method: "email" | "account_login" | "instant_download" | "scheduled_delivery",
      delivery_time?: string,  // "within 15 minutes" or timestamp
    },
    next_action: {
      cta_text: string,
      cta_url?: string,
      cta_type: "internal_link" | "external_link" | "membership_login",
    },
    social_share?: {
      enabled: boolean,
      platforms: Array<"facebook" | "twitter" | "linkedin" | "email">,
      share_text?: string,
    },
    color_scheme: {
      primary_color: string,
      success_color?: string,  // Usually green
    }
  },
  settings: {
    custom_code?: string,
  }
}
```

**Primary Purpose:**
Confirm the purchase/signup, provide next steps, and optionally present follow-up offers (upsells).

**Required Elements:**
1. **Success Headline** - Positive confirmation message
2. **Confirmation Details** - Order number, email, product access info
3. **Next Steps** - What will they receive and when?
4. **Access Instructions** - How to access product (email link, login, etc.)
5. **Support Contact Info** - How to get help if needed
6. **Optional Upsell Section** - One-time offer for complementary product

**Typical Conversion Goals:**
- Thank you page is not a conversion point itself
- Upsell on thank you: 3-10% attachment rate
- Support ticket reduction if instructions are clear

**Sequence Position:**
- Final step in funnel (after purchase)
- Always immediately after successful payment

**Connection Types Created:**
1. `visitor_viewed_step` - Thank you page view
2. `funnel_sends_email` - Trigger delivery/confirmation email

**Events Triggered:**
1. `step_viewed` - Thank you page shown
2. `email_sent` - Confirmation email delivered
3. `purchase_completed` - Already logged, this confirms it

**Analytics Tracked:**
- Page views
- Upsell acceptance rate (if shown)
- Support inquiries (inverse metric)

---

### 6. Webinar Registration Page

**Entity Definition:**
```typescript
{
  type: "funnel_step",
  subtype: "webinar_registration",
  name: string,           // e.g., "Free Webinar: Facebook Ads Mastery"
  slug: string,
  status: "draft" | "published" | "archived",
  sequence: number,
  properties: {
    headline: string,     // "Join us for: [Webinar Title]"
    subheadline?: string,
    webinar_title: string,
    webinar_description: string,
    webinar_date: number,  // timestamp
    webinar_time: string,  // "2:00 PM EST"
    webinar_duration_minutes: number,  // 45, 60, 90
    presenter_info: {
      name: string,
      title?: string,
      bio?: string,
      image?: string,
    },
    what_youll_learn: Array<string>,  // Learning outcomes
    form_fields: {
      email: { required: true },
      firstName?: { required: boolean },
      lastName?: { required: boolean },
      phone?: { required: boolean },
      company?: { required: boolean },
      role?: { required: boolean },
      custom: Array<{ name: string, required: boolean }>
    },
    deadline: {
      show_countdown?: boolean,
      registration_closes?: number,  // timestamp
    },
    confirmation: {
      send_calendar_invite: boolean,
      send_reminder_emails: number,  // 1 day, 1 hour before
      zoom_link_delivery: "email" | "account_dashboard",
    },
    cta_button: {
      text: string,  // "Register Now" | "Claim Your Spot"
    },
    color_scheme: {
      primary_color: string,
    }
  }
}
```

**Primary Purpose:**
Register prospects for a live or automated webinar where they'll be pitched or educated on a product/service.

**Required Elements:**
1. **Webinar Title & Description** - What is this about?
2. **Presenter Bio** - Who's teaching? Why should they trust them?
3. **Learning Outcomes** - 3-5 things they'll learn
4. **Date & Time** - Clear timezone
5. **Registration Form** - Email minimum; optionally more fields for lead qualification
6. **Urgency** - Limited spots or countdown timer
7. **Confirmation Details** - What happens after registering?
8. **CTA Button** - "Register Now" or "Claim Your Spot"

**Typical Conversion Goals:**
- Registration conversion: 5-15% (depends on traffic quality)
- Webinar attendance rate: 40-60% of registrants
- Post-webinar sales: 5-10% of attendees

**Sequence Position:**
- Usually step 1 or early in funnel (before sales offer)
- Leads eventually to sales page or product offer

**Connection Types Created:**
1. `visitor_viewed_step` - Registration page view
2. `visitor_submitted_form` - Webinar registration
3. `funnel_sends_email` - Registration confirmation & reminders

**Events Triggered:**
1. `step_viewed` - Registration page shown
2. `form_submitted` - Webinar registration
3. `email_sent` - Confirmation and reminder emails

**Analytics Tracked:**
- Registration rate
- No-show rate
- Attendance rate
- Lead quality (by field values)
- Post-webinar conversion rate

---

### 7. Opt-In Page (Lead Magnet)

**Note:** This is very similar to Landing Page (type 1), but optimized for maximum email capture with minimal friction.

**Entity Definition:**
```typescript
{
  type: "funnel_step",
  subtype: "opt_in_page",
  name: string,           // e.g., "Free Guide Opt-In"
  slug: string,
  status: "draft" | "published" | "archived",
  sequence: number,
  properties: {
    headline: string,     // Promise of value (e.g., "Get Our Free Marketing Checklist")
    subheadline?: string,
    form_fields: {
      email: { required: true },
      firstName?: { required: boolean },
      // minimal fields for max conversions
    },
    lead_magnet: {
      title: string,      // "The Complete Social Media Marketing Checklist"
      description?: string,
      image?: string,     // Cover image
      format: "pdf" | "video" | "email_course" | "template" | "tool" | "checklist",
      delivery_method: "instant_download" | "email" | "account_access",
    },
    urgency?: {
      show_scarcity: boolean,
      spots_available?: number,
      limited_time: boolean,
    },
    cta_button: {
      text: string,  // "Get Free Access" | "Download Now"
    },
    color_scheme: {
      primary_color: string,
    }
  }
}
```

**Primary Purpose:**
Maximum email list building with friction-free form and immediate lead magnet delivery.

**Required Elements:**
1. **Compelling Headline** - Clear value statement
2. **Lead Magnet Preview** - Image/preview of what they're getting
3. **Email Form** - Email only (first name optional)
4. **CTA Button** - "Get Free Access"
5. **Instant Confirmation** - Email or download immediately

**Typical Conversion Goals:**
- Email opt-in rate: 10-25% (higher than sales pages)
- Form completion: 80-90% (because form is so simple)

**Sequence Position:**
- Usually funnel entry point (step 1)
- Leads to nurture email sequence

**Connection Types Created:**
1. `visitor_submitted_form` - Email capture
2. `funnel_sends_email` - Lead magnet delivery

**Events Triggered:**
1. `step_viewed` - Page view
2. `form_submitted` - Email captured

---

## Advanced Step Types

### 8. Order Form (Checkout)

**Entity Definition:**
```typescript
{
  type: "funnel_step",
  subtype: "order_form",
  name: string,           // e.g., "Checkout - Order Details"
  slug: string,
  status: "draft" | "published" | "archived",
  sequence: number,
  properties: {
    headline: string,     // "Complete Your Order"
    form_sections: {
      billing_address: {
        required: boolean,
        fields: Array<"firstName" | "lastName" | "company" | "address" | "city" | "state" | "zip" | "country">
      },
      shipping_address: {
        required: boolean,
        same_as_billing: boolean,
      },
      contact_info: {
        email: { required: true },
        phone: { required: boolean },
      },
      payment_method: {
        types: Array<"credit_card" | "paypal" | "apple_pay" | "google_pay" | "stripe">,
      },
      custom_fields: Array<{
        name: string,
        type: "text" | "textarea" | "select" | "checkbox",
        required: boolean,
      }>
    },
    billing: {
      show_order_summary: boolean,
      show_discounts: boolean,
      show_taxes: boolean,
      shipping_options?: Array<{
        name: string,
        price: number,
        estimated_delivery: string,
      }>,
    },
    cta_button: {
      text: string,  // "Complete Purchase" | "Place Order"
    },
    color_scheme: {
      primary_color: string,
    }
  },
  settings: {
    require_phone: boolean,
    require_company: boolean,
    accept_po_numbers: boolean,
  }
}
```

**Primary Purpose:**
Collect billing/shipping information and process payment for orders.

**Required Elements:**
1. **Order Summary** - Items, quantities, prices
2. **Billing Address Form** - Name, address, etc.
3. **Shipping Address Option** - Same as billing or different
4. **Contact Info** - Email and optionally phone
5. **Payment Method** - Credit card, PayPal, etc.
6. **Order Total** - Subtotal, taxes, shipping, total
7. **Submit Button** - "Complete Purchase"

**Typical Conversion Goals:**
- Form completion rate: 60-80% (many abandon at checkout)
- Cart abandonment rate: 70%+

**Sequence Position:**
- Usually after sales page when product is in cart
- Before thank you page

**Connection Types Created:**
1. `customer_purchased_via_funnel` - When order placed
2. `visitor_submitted_form` - Checkout form submission

**Events Triggered:**
1. `form_submitted` - Checkout form
2. `purchase_completed` - Payment processed

**Analytics Tracked:**
- Form abandonment rate (by field)
- Checkout completion time
- Payment method distribution
- Failed payment attempts

---

### 9. Survey Page

**Entity Definition:**
```typescript
{
  type: "funnel_step",
  subtype: "survey_page",
  name: string,           // e.g., "Quick Feedback Survey"
  slug: string,
  status: "draft" | "published" | "archived",
  sequence: number,
  properties: {
    headline: string,     // "Help us improve..."
    description?: string,
    survey_type: "nps" | "satisfaction" | "product_feedback" | "content_survey" | "demographic",
    estimated_time: string,  // "2 minutes"
    questions: Array<{
      question_id: string,
      question_text: string,
      question_type: "multiple_choice" | "nps" | "rating" | "text" | "ranking",
      options?: Array<string>,  // For multiple choice
      required: boolean,
      logic?: {  // Conditional questions
        depends_on: string,  // question_id
        if_answer_is: string | number,
        show_question: string,
      }
    }>,
    incentive?: {
      offer_incentive: boolean,
      incentive_type: "entry" | "discount" | "points",
      incentive_description: string,
    },
    cta_button: {
      text: string,  // "Submit Survey" | "See Results"
    },
    color_scheme: {
      primary_color: string,
    }
  }
}
```

**Primary Purpose:**
Collect customer feedback, product research, or lead qualification through surveys.

**Required Elements:**
1. **Survey Title** - What is this about?
2. **Estimated Time** - Set expectations (2-5 minutes typical)
3. **Survey Questions** - Mix of question types
4. **Optional Incentive** - Entry into drawing, discount code, etc.
5. **Submit Button** - "Submit Survey"
6. **Progress Indicator** - Show how far through survey

**Typical Conversion Goals:**
- Completion rate: 40-70% (depends on length and incentive)
- Used to gather intelligence, not for direct sales

**Sequence Position:**
- Can appear at end of funnel (thank you page replacement)
- Or middle of funnel to qualify leads

**Connection Types Created:**
1. `visitor_submitted_form` - Survey submission
2. `funnel_sends_email` - Incentive delivery or results

**Events Triggered:**
1. `form_submitted` - Survey completion
2. `email_sent` - Incentive or results delivered

**Analytics Tracked:**
- Completion rate
- Time to complete
- Question-by-question drop-off
- Response distribution by question

---

### 10. Video Sales Letter (VSL) Page

**Entity Definition:**
```typescript
{
  type: "funnel_step",
  subtype: "vsl_page",
  name: string,           // e.g., "Product Demo Video"
  slug: string,
  status: "draft" | "published" | "archived",
  sequence: number,
  properties: {
    headline: string,     // "Watch how this works..." (above video)
    video: {
      video_id: string,   // YouTube or Vimeo ID
      video_provider: "youtube" | "vimeo" | "wistia" | "custom",
      duration_seconds: number,
      autoplay: boolean,
      show_controls: boolean,
      thumbnail_image?: string,
    },
    video_type: "sales_pitch" | "demo" | "testimonial" | "educational",
    below_video: {
      headline?: string,
      description?: string,
      cta_button: {
        text: string,  // "Buy Now" | "Start Free Trial"
      },
      trust_badges?: Array<string>,  // "30-day money back" etc.
    },
    side_by_side?: {
      show_form: boolean,  // Email capture form next to video
      form_fields: Array<{
        name: string,
        type: string,
        required: boolean,
      }>,
    },
    engagement: {
      show_transcript: boolean,
      show_captions: boolean,
      enable_comments: boolean,
    },
    color_scheme: {
      primary_color: string,
    }
  }
}
```

**Primary Purpose:**
Use video (sales pitch, product demo, or testimonial) as primary selling tool with optional email capture or CTA.

**Required Elements:**
1. **Headline** - Introduce the video
2. **Video Player** - Embedded video with controls
3. **CTA Below Video** - "Buy Now" or other action
4. **Optional Form** - Email capture while watching
5. **Transcripts/Captions** - Accessibility + SEO

**Typical Conversion Goals:**
- Video completion rate: 30-60%
- Click-through on CTA: 5-15% (varies by video quality)
- Email captures (if form shown): 2-5%

**Sequence Position:**
- Usually early-to-mid funnel (step 1-2)
- Can replace sales page entirely

**Connection Types Created:**
1. `visitor_viewed_step` - Video page view
2. `visitor_submitted_form` - Email capture (if form present)
3. `step_contains_element` - Video element

**Events Triggered:**
1. `step_viewed` - Page load
2. `form_submitted` - Email captured (if applicable)
3. `element_clicked` - CTA button click

**Analytics Tracked:**
- Video views
- Video completion rate
- Play/pause/seek behavior
- CTA click rate (and timing)
- Email capture rate (if form shown)

---

### 11. Countdown Timer Page

**Entity Definition:**
```typescript
{
  type: "funnel_step",
  subtype: "countdown_timer_page",
  name: string,           // e.g., "Limited Time Offer - Clock Running"
  slug: string,
  status: "draft" | "published" | "archived",
  sequence: number,
  properties: {
    headline: string,     // "This offer expires in..."
    countdown_timer: {
      end_time: number,  // timestamp
      timer_format: "hh:mm:ss" | "days_hours_minutes" | "minutes_seconds",
      show_timer: boolean,
      timer_position: "header" | "floating" | "inline",
      timer_color: string,
      timer_background?: string,
    },
    urgency_copy: {
      above_timer: string,
      below_timer: string,
      after_expiration: string,  // What shows when timer ends
    },
    product_info: {
      name: string,
      image?: string,
      price: number,
      original_price?: number,
    },
    benefits: Array<string>,
    cta_button: {
      text: string,  // "Claim Your Discount Now"
      action: "purchase" | "redirect_url",
      redirect_url?: string,
    },
    expired_action: {
      show_expired_message: boolean,
      expired_message: string,
      show_alternative_offer: boolean,
      alternative_offer_id?: Id<'things'>,
    },
    color_scheme: {
      primary_color: string,
      timer_color: string,
    }
  },
  settings: {
    timer_behavior: "global" | "per_visitor",  // Same for all or resets per person?
    timezone: string,
  }
}
```

**Primary Purpose:**
Create artificial scarcity and urgency with a countdown timer to drive immediate action.

**Required Elements:**
1. **Countdown Timer** - Visible timer showing time remaining
2. **Urgency Headline** - "This offer expires in..."
3. **Product Information** - What are they buying?
4. **Pricing** - Original and discounted price
5. **CTA Button** - "Claim Now" or similar action-oriented text
6. **Expired State** - What shows when time runs out

**Typical Conversion Goals:**
- Urgency lift: 10-30% increase in conversion rate
- Effectiveness peaks in final 5 minutes of countdown

**Sequence Position:**
- Usually after sales page or in parallel as scarcity message
- Can be on any step to add urgency

**Connection Types Created:**
1. `visitor_viewed_step` - Timer page view
2. `customer_purchased_via_funnel` - Purchase before expiration

**Events Triggered:**
1. `step_viewed` - Page load
2. `purchase_completed` - Before timer expires
3. Analytics: visits before/after timer expires

**Analytics Tracked:**
- Conversion rate (before vs after expiration)
- Click rate by time remaining
- Bounce rate after expiration
- Revenue impact of urgency

---

### 12. Two-Step Opt-In Page

**Entity Definition:**
```typescript
{
  type: "funnel_step",
  subtype: "two_step_optin",
  name: string,           // e.g., "Two-Step Email Opt-In"
  slug: string,
  status: "draft" | "published" | "archived",
  sequence: number,
  properties: {
    step_one: {
      headline: string,
      subheadline?: string,
      cta_button: {
        text: string,  // "Yes, I Want It!"
      },
      color_scheme: {
        primary_color: string,
      }
    },
    step_two: {
      headline: string,  // "Just one more thing..."
      description?: string,
      form_fields: {
        email: { required: true },
        firstName?: { required: boolean },
        // Additional fields asked in step 2
      },
      cta_button: {
        text: string,  // "Send Me The [Product]"
      },
      back_button: {
        text: string,  // "Go Back"
      }
    },
    lead_magnet: {
      title: string,
      delivery: "email" | "instant_download" | "account_access",
    },
    color_scheme: {
      primary_color: string,
    }
  }
}
```

**Primary Purpose:**
Reduce form friction by asking for email in step 1, then collecting additional fields in step 2 for better lead qualification.

**Required Elements:**
1. **Step 1: CTA Button** - "Yes, I Want It!" (no form friction)
2. **Step 2: Email Form** - Email capture
3. **Step 2: Additional Fields** - Optional additional info (name, company, etc.)
4. **Back Button** - Allow returning to step 1

**Typical Conversion Goals:**
- Step 1 CTR: 40-70%
- Step 2 completion: 60-80%
- Overall conversion: 24-56% (higher than single-form)

**Sequence Position:**
- Entry point (step 1)
- Alternative to traditional opt-in page

**Connection Types Created:**
1. `visitor_viewed_step` - Page view (step 1)
2. `visitor_submitted_form` - Step 2 email capture

**Events Triggered:**
1. `step_viewed` - Step 1 and Step 2
2. `form_submitted` - Step 2 completion

**Analytics Tracked:**
- Step 1 CTR
- Step 2 completion rate
- Drop-off between steps
- Form field completion (which fields cause abandonment?)

---

### 13. Membership Login/Access Page

**Entity Definition:**
```typescript
{
  type: "funnel_step",
  subtype: "membership_login_page",
  name: string,           // e.g., "Member Dashboard Access"
  slug: string,
  status: "draft" | "published" | "archived",
  sequence: number,
  properties: {
    headline: string,     // "Access Your Member Dashboard"
    membership_info: {
      name: string,      // "VIP Access Club"
      description?: string,
    },
    login_form: {
      username_type: "email" | "username",  // What they log in with
      show_signup_link: boolean,
      forgot_password_link: boolean,
      social_login?: Array<"google" | "facebook" | "apple">,
    },
    post_login: {
      redirect_to: string,  // URL or internal dashboard path
      show_welcome_message: boolean,
    },
    signup_cta: {
      text: string,      // "Don't have access? Join here"
      target_page?: string,  // Link to membership signup page
    },
    color_scheme: {
      primary_color: string,
    }
  },
  settings: {
    require_verification: boolean,
    two_factor_auth: boolean,
  }
}
```

**Primary Purpose:**
Gate content/products behind membership login; provide dashboard access to members.

**Required Elements:**
1. **Login Form** - Email/username and password fields
2. **"Forgot Password" Link** - Password recovery
3. **"Sign Up" Link** - For non-members to join
4. **Post-Login Redirect** - Send to dashboard or specific page

**Typical Conversion Goals:**
- Login success rate: 85-95% (for returning members)
- New signup conversion: 5-15% (from "Join" link)

**Sequence Position:**
- Not part of initial sales funnel
- Separate flow for returning members
- Often accessed outside the funnel via direct link

**Connection Types Created:**
1. `visitor_viewed_step` - Login page view
2. `visitor_entered_funnel` - If redirecting to funnel after login

**Events Triggered:**
1. `user_login` - Successful authentication
2. `form_submitted` - Login attempt

**Analytics Tracked:**
- Login success rate
- Failed login attempts
- New signup rate (from signup link)
- Password reset requests

---

## Property Schema Patterns

### Common Properties Across All Step Types

**Metadata:**
```typescript
{
  type: "funnel_step",
  subtype: string,  // One of the types above
  funnelId: Id<'things'>,
  name: string,
  slug: string,
  status: "draft" | "published" | "archived",
  sequence: number,
  groupId: Id<'groups'>,  // For multi-tenancy
  createdBy: Id<'people'>,
  createdAt: number,
  updatedAt: number,
  publishedAt?: number,
}
```

**Layout & Design:**
```typescript
{
  properties: {
    color_scheme: {
      primary_color: string,      // Hex color
      secondary_color?: string,
      text_color?: string,
      background_color?: string,
    },
    layout: "single_column" | "two_column" | "custom",
    responsive: {
      mobile: boolean,
      tablet: boolean,
      desktop: boolean,
    },
    custom_css?: string,
    custom_html?: string,
  }
}
```

**Analytics & Tracking:**
```typescript
{
  properties: {
    analytics: {
      pixel_ids?: string[],  // Facebook, Google Analytics
      utm_tracking?: boolean,
      custom_events?: Array<{
        event_name: string,
        trigger: string,  // Scroll depth, click, etc.
      }>,
    }
  }
}
```

**SEO:**
```typescript
{
  properties: {
    seo: {
      meta_title?: string,
      meta_description?: string,
      og_title?: string,
      og_description?: string,
      og_image?: string,
      schema_markup?: string,
    }
  }
}
```

---

## Connection Types Created by Step Types

| Step Type | Primary Connections | Optional Connections |
|-----------|-------------------|----------------------|
| **Landing Page** | `funnel_contains_step`, `visitor_viewed_step`, `visitor_submitted_form` | `step_based_on_template` |
| **Sales Page** | `funnel_contains_step`, `visitor_viewed_step`, `funnel_leads_to_product` | `customer_purchased_via_funnel` |
| **Upsell Page** | `funnel_contains_step`, `visitor_viewed_step` | `customer_purchased_via_funnel` |
| **Downsell Page** | `funnel_contains_step`, `visitor_viewed_step` | `customer_purchased_via_funnel` |
| **Thank You Page** | `funnel_contains_step`, `visitor_viewed_step`, `funnel_sends_email` | None |
| **Webinar Registration** | `funnel_contains_step`, `visitor_viewed_step`, `visitor_submitted_form`, `funnel_sends_email` | None |
| **Opt-In Page** | `funnel_contains_step`, `visitor_viewed_step`, `visitor_submitted_form` | None |
| **Order Form** | `funnel_contains_step`, `visitor_submitted_form` | `customer_purchased_via_funnel` |
| **Survey Page** | `funnel_contains_step`, `visitor_viewed_step`, `visitor_submitted_form` | None |
| **VSL Page** | `funnel_contains_step`, `visitor_viewed_step`, `step_contains_element` | `visitor_submitted_form`, `customer_purchased_via_funnel` |
| **Countdown Timer** | `funnel_contains_step`, `visitor_viewed_step` | `customer_purchased_via_funnel` |
| **Two-Step Opt-In** | `funnel_contains_step`, `visitor_viewed_step`, `visitor_submitted_form` | None |
| **Membership Login** | `funnel_contains_step`, `visitor_viewed_step` | `visitor_entered_funnel` |

---

## Events Triggered by Step Types

| Step Type | Events Triggered | Optional Events |
|-----------|-----------------|-----------------|
| **All Types** | `step_added`, `step_viewed`, `step_published`, `step_updated`, `element_added` | `step_reordered`, `step_archived` |
| **Form-Based** | `form_submitted`, `form_field_abandoned` | `email_sent` (confirmation) |
| **Purchase-Based** | `purchase_completed`, `payment_processed` | `purchase_refunded`, `subscription_activated` |
| **Email-Based** | `email_sent`, `email_opened`, `email_clicked` | None |

---

## Funnel Journey Mapping

### Typical E-Commerce Funnel
```
1. Landing Page (opt-in) → Email capture
   ↓
2. Nurture (email sequence, 3-7 days)
   ↓
3. Sales Page → Product pitch
   ↓
4. Order Form → Payment collection
   ↓
5. Downsell (if declined) → Alternative offer
   ↓
6. Thank You Page → Confirmation + Upsell
   ↓
7. Membership Login → Customer area access
```

### Typical Lead Generation Funnel
```
1. Opt-In Page → Email capture
   ↓
2. Webinar Registration → Event signup
   ↓
3. Webinar (external) → Live presentation
   ↓
4. Sales Page → Post-webinar offer
   ↓
5. Order Form → Payment
   ↓
6. Thank You Page → Delivery
```

### Typical Information/Digital Product Funnel
```
1. Landing Page → Lead magnet opt-in
   ↓
2. VSL Page → Video sales letter
   ↓
3. Sales Page → Full product details
   ↓
4. Order Form → Checkout
   ↓
5. Thank You Page → Instant access + upsell
   ↓
6. Membership Login → Course/content access
```

---

## Step Type Selection Guide

**Use Landing Page when:**
- Building email list
- Need minimal friction
- Offering free lead magnet

**Use Sales Page when:**
- Selling product/service
- Need detailed persuasion
- Have social proof available

**Use Upsell Page when:**
- Customer just purchased
- Offering premium/complementary product
- Want to increase order value

**Use Downsell Page when:**
- Customer declined main offer
- Have lower-cost alternative
- Want to recover lost sale

**Use Thank You Page when:**
- Confirming any action
- Providing next steps
- Delivering immediate value

**Use Webinar Registration when:**
- Building authority/trust first
- Educating before selling
- Hosting live events

**Use Order Form when:**
- Collecting detailed info
- Selling higher-ticket items
- Need complete billing address

**Use Survey Page when:**
- Gathering research data
- Qualifying leads
- Collecting feedback

**Use VSL Page when:**
- Have compelling video
- Want to reduce reading
- Maximize engagement

**Use Countdown Timer when:**
- Creating artificial scarcity
- Have limited-time offer
- Want urgency boost

**Use Two-Step Opt-In when:**
- Email capture critical
- Have high form friction
- Want better conversions

**Use Membership Login when:**
- Gating premium content
- Managing member access
- Building community

---

## Implementation Checklist

For each step type added to a funnel:

- [ ] Define name and slug (URL-safe)
- [ ] Set sequence number (position in funnel)
- [ ] Select required elements for step type
- [ ] Configure form fields (if applicable)
- [ ] Set color scheme and styling
- [ ] Configure redirect/next step behavior
- [ ] Enable/disable analytics pixels
- [ ] Add SEO metadata
- [ ] Configure email triggers (if applicable)
- [ ] Test on mobile/tablet/desktop
- [ ] Publish step to funnel
- [ ] Log `step_added` event
- [ ] Create connections to related things/products
- [ ] Update funnel sequence visualization

---

## Success Metrics per Step Type

**Landing Page:**
- Email opt-in rate: 10-15%
- Form completion rate: 80-90%
- Bounce rate: < 30%

**Sales Page:**
- Click-through to purchase: 2-5%
- Bounce rate: < 40%
- Scroll depth: 60%+

**Upsell Page:**
- Upsell acceptance: 5-15%
- Order value lift: 15-30%

**Webinar Registration:**
- Registration rate: 5-15%
- Attendance rate: 40-60%
- Post-webinar conversion: 5-10%

**Thank You Page:**
- Bounce rate: < 10%
- Secondary CTA click: 10-20%

**Survey Page:**
- Completion rate: 40-70%
- Average time: 2-5 minutes

**Opt-In Page:**
- Email capture: 15-25%
- Form completion: 85-95%

---

## Ontology Compliance Checklist

- ✅ All steps are `things` with `type: "funnel_step"`
- ✅ Step subtypes map to specific page types
- ✅ All steps scoped by `groupId` (multi-tenant isolation)
- ✅ All sequences tracked via `funnel_contains_step` connections
- ✅ All form submissions create `visitor_submitted_form` connections
- ✅ All purchases create `customer_purchased_via_funnel` connections
- ✅ All actions logged in `events` table
- ✅ Step categorization via `knowledge` labels (e.g., `funnel_stage:awareness`)
- ✅ Properties stored in JSON schema (flexible, no migrations needed)

---

**Next Cycle:** Cycle 005 will map page element types (headline, button, form, image, video, etc.) and their properties.

