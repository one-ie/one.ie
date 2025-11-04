---
title: "SEO & Social Metadata"
description: "Built-in SEO optimization with structured data, Open Graph, and automatic meta tags."
featureId: "seo"
category: "infrastructure"
status: "completed"
version: "1.2.0"
releaseDate: 2025-10-10T00:00:00Z
organization: "ONE Platform"
ontologyDimensions: ["Things", "Knowledge"]
assignedSpecialist: "agent-frontend"
specification:
  complexity: "simple"
  estimatedHours: 16
  technologies: ["Astro", "Schema.org", "JSON-LD"]
ontologyMapping:
  things: "Each page/product has SEO metadata"
  knowledge: "Structured data helps search engines understand content"
useCases:
  - title: "Search Engine Indexing"
    description: "Pages automatically optimized for Google indexing"
    userType: "Business Owner"
  - title: "Social Media Sharing"
    description: "Rich previews when links shared on Twitter, Facebook, LinkedIn"
    userType: "All Users"
features:
  - name: "Meta Tags"
    description: "Auto-generated title, description, canonical URL"
    status: "completed"
  - name: "Open Graph"
    description: "Social media rich previews (Twitter, Facebook, LinkedIn)"
    status: "completed"
  - name: "Structured Data"
    description: "JSON-LD schema.org markup for search engines"
    status: "completed"
  - name: "XML Sitemap"
    description: "Auto-generated sitemap.xml"
    status: "completed"
  - name: "Robots.txt"
    description: "Search engine crawler instructions"
    status: "completed"
marketingPosition:
  tagline: "Rank higher. Share smarter."
  valueProposition: "SEO optimization built-in. No plugins needed."
  targetAudience: ["Content creators", "E-commerce stores", "Marketers"]
  pricingImpact: "free"
metrics:
  testCoverage: 90
  performanceScore: 100
tags: ["seo", "search", "social", "metadata"]
featured: false
priority: "high"
createdAt: 2025-09-01T00:00:00Z
updatedAt: 2025-10-10T00:00:00Z
draft: false
---

## Overview

Automatic SEO optimization for every page. All pages get proper meta tags, Open Graph data, and structured JSON-LD schema for search engines.

## What's Optimized

### Page Metadata
- Title tag (50-60 chars)
- Meta description (150-160 chars)
- Canonical URL
- Language tags

### Social Media
- Open Graph (og:title, og:description, og:image)
- Twitter Card (twitter:card, twitter:title, twitter:description)
- Facebook domain verification

### Search Engines
- JSON-LD structured data
- Article schema
- Product schema
- Organization schema
- FAQ schema

### Performance
- Automatic image optimization
- Link prefetch hints
- Critical CSS inlining
- Resource hints

## Usage

Every page automatically gets SEO tags via the Layout component. No configuration needed.
