---
title: "Landing Pages"
description: "High-converting landing page builder with hero sections, features, testimonials, and CTA sections."
featureId: "landing-pages"
category: "content"
status: "completed"
version: "1.4.0"
releaseDate: 2025-10-18T00:00:00Z
organization: "ONE Platform"
ontologyDimensions: ["Groups", "Things"]
assignedSpecialist: "agent-frontend"
specification:
  complexity: "moderate"
  estimatedHours: 40
  technologies: ["Astro", "React", "Tailwind", "shadcn/ui"]
ontologyMapping:
  groups: "Landing pages scoped to organization groups"
  things: "Each landing page is a thing with type='landing_page'"
useCases:
  - title: "Create Product Landing Page"
    description: "Marketer designs landing page to promote new product"
    userType: "Marketer"
  - title: "A/B Testing"
    description: "Test different headlines and CTAs"
    userType: "Growth Manager"
features:
  - name: "Hero Section"
    description: "Attention-grabbing headline, subheading, and CTA"
    status: "completed"
  - name: "Features Section"
    description: "Showcase key features with icons and descriptions"
    status: "completed"
  - name: "Testimonials"
    description: "Social proof with customer quotes and photos"
    status: "completed"
  - name: "Pricing Table"
    description: "Show pricing tiers and feature comparison"
    status: "completed"
  - name: "FAQ Section"
    description: "Accordion-style frequently asked questions"
    status: "completed"
  - name: "Analytics"
    description: "Track page views, CTR, and conversions"
    status: "in_development"
marketingPosition:
  tagline: "Launch campaigns in minutes. Not months."
  valueProposition: "Pre-built sections you can customize instantly"
  targetAudience: ["Marketing teams", "Product managers", "Growth hackers"]
  pricingImpact: "pro"
metrics:
  testCoverage: 82
  performanceScore: 96
tags: ["landing-pages", "marketing", "conversion", "templates"]
featured: true
priority: "high"
createdAt: 2025-08-20T00:00:00Z
updatedAt: 2025-10-18T00:00:00Z
draft: false
---

## Overview

Pre-built landing page sections that convert. Hero sections, feature highlights, social proof, pricing tables, and CTAs - all responsive and optimized for mobile.

## Sections

### Hero
- Headline and subheading
- Hero image or video
- Primary and secondary CTA buttons
- Supported browser badge

### Features
- Icon + title + description layout
- 2-4 column grid
- Optional feature images
- Animated on scroll

### Testimonials
- Customer quotes
- Name, title, photo
- 3-column carousel
- Star ratings

### Pricing
- Pricing tier cards
- Feature comparison matrix
- Annual/monthly toggle
- Popular badge

### FAQ
- Accordion-style
- Searchable questions
- Category filtering
- Open by default option

### Contact
- Email signup form
- Contact form fields
- Integration with email service
- Validation
