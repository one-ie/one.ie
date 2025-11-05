---
title: "Shop"
description: "Products, cart, checkout with collections"
project: "Shop"
organization: "ONE Platform"
personRole: "platform_owner"
ontologyDimensions: ["Things", "Connections", "Events"]
assignedSpecialist: "agent-backend"
status: "active"
priority: "critical"
level: "Beginner"
demoUrl: "/shop"
planUrl: "/plans/shop"
iconName: "ShoppingBag"
borderColor: "border-l-green-500"
bgColor: "bg-green-500/20"
levelColor: "text-green-600"
startDate: 2025-10-30
targetEndDate: 2026-03-31
progress: 0
totalCycles: 100
completedCycles: 0
features:
  - "Product showcase with images and descriptions"
  - "Shopping cart with quantity controls"
  - "Checkout flow with shipping options"
  - "Product categories and filtering"
  - "Customer testimonials and reviews"
  - "Inventory tracking"
  - "Order confirmation emails"
  - "Admin dashboard"
objectives:
  - "Build complete e-commerce platform with product catalog"
  - "Implement shopping cart with persistent storage"
  - "Create checkout flow with X402 payment integration"
  - "Build collection and category management system"
  - "Implement inventory tracking and order management"
  - "Create seller dashboard with analytics"
deliverables:
  - "Product catalog system"
  - "Shopping cart implementation"
  - "Checkout flow"
  - "Payment integration"
  - "Inventory system"
  - "Order management dashboard"
prerequisiteProjects:
  - "page"
learningPath:
  - "E-commerce data modeling"
  - "Shopping cart state management"
  - "Payment processing patterns"
  - "Order workflow automation"
  - "Inventory management"
technologies:
  - "Convex"
  - "React 19"
  - "Tailwind CSS v4"
  - "TypeScript"
  - "Stripe"
estimatedHours: 40
difficulty: "Intermediate"
createdAt: 2025-10-30
draft: false
---

A complete e-commerce solution perfect for creators, small businesses, and entrepreneurs. Build a fully functional online store with products, shopping cart, and checkout.

## Perfect For

- Online retailers
- Digital product sellers
- Marketplace founders
- Service-based businesses
- Dropshipping platforms

## What You'll Learn

- E-commerce data modeling
- Shopping cart management
- Payment processing integration
- Order fulfillment workflows
- Inventory tracking
- Customer management
- Analytics and reporting

## Get Started

Ready to build this project? Choose your path:

<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-6">
  <a href="/shop" class="flex items-center justify-center gap-2 px-6 py-4 bg-foreground text-background hover:bg-foreground/90 rounded-lg transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105">
    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
    <span>View Demo</span>
  </a>

  <a href="/plans/shop" class="flex items-center justify-center gap-2 px-6 py-4 bg-foreground text-background hover:bg-foreground/90 rounded-lg transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105">
    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
    <span>View Plan</span>
  </a>

  <button onclick="alert('Copy prompt functionality')" class="flex items-center justify-center gap-2 px-6 py-4 bg-foreground text-background hover:bg-foreground/90 rounded-lg transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105">
    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
    <span>Copy Prompt</span>
  </button>

  <a href="claude://new?prompt=Build%20Shop%20Project" class="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-2xl hover:scale-105">
    <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M13.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8.5L13.5 2z" />
    </svg>
    <span>Send to Claude</span>
  </a>
</div>

## Key Features

- **Product Catalog**: Showcase products with images, descriptions, and pricing
- **Shopping Cart**: Persistent cart with quantity controls and save-for-later
- **Checkout Flow**: Multi-step checkout with shipping and payment options
- **Collections**: Organize products into categories and custom collections
- **Reviews**: Customer testimonials and product ratings
- **Inventory**: Track stock levels and low-stock alerts
- **Orders**: Complete order management with customer communication

## Components Included

- Product grid with filtering
- Product detail pages
- Shopping cart drawer
- Checkout form with validation
- Order confirmation page
- Customer account dashboard
- Admin product management
- Order tracking interface

## Implementation Plan

This project follows a **100-cycle implementation plan** for systematic development.

**📋 View Full Plan:** [E-Commerce Frontend Store v1.0.0](/plans/shop)

**Progress:** 0/100 cycles complete (0%)

### Plan Overview

- **Cycle 1-10**: Foundation & Design (storefront structure, ontology mapping, design system)
- **Cycle 11-20**: Astro Pages & Layouts (home, products, cart, checkout)
- **Cycle 21-30**: React Components (product cards, cart, checkout flow)
- **Cycle 31-50**: Stripe Integration & Polish
- **Timeline**: 70-80 cycles for complete implementation

### Quick Start

```bash
# 1. View the implementation plan
/plan shop

# 2. Start with first cycle
/infer 1

# 3. Mark complete and advance
/done
```

## How to Use

1. Visit `/shop` to see the live demo
2. Review the [100-cycle implementation plan](/plans/shop)
3. Follow the cycle sequence step-by-step
4. Add your products in `src/content/products/`
5. Configure payment processing with Stripe
6. Customize branding and checkout flow
7. Deploy with real-time inventory sync
