---
title: "Introduction to ONE Platform: AI-Native Multi-Tenant Architecture"
description: "Discover how ONE Platform combines the power of Astro, React, and Convex to build scalable AI-native applications with a universal 6-dimension ontology"
youtubeId: "dQw4w9WgXcQ"
thumbnail: "/images/videos/one-platform-intro.jpg"
duration: 420
publishedAt: 2025-01-08
author: "ONE Platform"
categories: ["platform", "tutorial"]
tags: ["one-platform", "astro", "react", "convex", "ai", "multi-tenant"]
---

# Introduction to ONE Platform

Welcome to ONE Platform - the AI-native multi-tenant platform that simplifies building scalable applications with a universal data model.

## What is ONE Platform?

ONE Platform is built on a revolutionary **6-dimension ontology** that models reality itself:

1. **GROUPS** - Multi-tenant containers with infinite nesting
2. **PEOPLE** - Authorization and roles across the platform
3. **THINGS** - All entities (66+ types: products, courses, agents, tokens)
4. **CONNECTIONS** - Relationships between entities (25+ types)
5. **EVENTS** - Complete audit trail (67+ event types)
6. **KNOWLEDGE** - Labels, vectors, and AI-powered search

## Technology Stack

### Frontend
- **Astro 5** - Fast, content-focused framework with islands architecture
- **React 19** - Modern UI components with hooks and suspense
- **Tailwind v4** - Utility-first CSS with modern theming
- **shadcn/ui** - 50+ pre-built, accessible components

### Backend
- **Convex** - Real-time database with automatic subscriptions
- **Effect.ts** - Type-safe business logic and error handling
- **Better Auth** - Modern authentication with social providers

### Deployment
- **Cloudflare Pages** - Global edge network for frontend
- **Convex Cloud** - Managed backend infrastructure
- **GitHub Actions** - Automated CI/CD pipeline

## Key Features

### Progressive Complexity Architecture
Start simple and add layers only when needed:
- **Layer 1**: Static content collections (80% of features)
- **Layer 2**: Validation with Effect.ts (15% of features)
- **Layer 3**: State management with nanostores (4% of features)
- **Layer 4**: Provider pattern for source switching (1% of features)
- **Layer 5**: Backend integration with Convex (<1% of features)

### Cycle-Based Planning
Plan in cycles (1-100), not days:
- Each cycle = concrete step under 3k tokens
- 98% context reduction (150k → 3k tokens)
- 5x faster execution
- Flawless execution through "do the next thing, perfectly"

### AI Agent Coordination
Specialized agents for every task:
- **agent-director** - Project orchestration and planning
- **agent-frontend** - React and Astro components
- **agent-backend** - Convex database and services
- **agent-quality** - Testing and code review
- **agent-ops** - Deployment and infrastructure

## Getting Started

### Quick Start
```bash
# Clone the repository
git clone https://github.com/yourusername/ONE

# Install dependencies
cd ONE/web && bun install
cd ONE/backend && npm install

# Start development servers
cd web && bun run dev
cd backend && npx convex dev
```

### Build Your First Feature
1. Map to 6-dimension ontology
2. Create content collection schema
3. Build React components
4. Add Convex queries (if needed)
5. Deploy to production

## Why ONE Platform?

- **Universal Data Model** - One ontology for all features
- **Type-Safe Throughout** - TypeScript + Zod + Effect.ts
- **Real-Time by Default** - Convex automatic subscriptions
- **AI-Native Design** - Built for agent coordination
- **Production Ready** - Complete examples and patterns

---

*Start building with [ONE Platform](https://one.ie) today!*
