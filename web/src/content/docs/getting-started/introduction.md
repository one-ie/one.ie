---
title: Introduction
description: Welcome to the ONE Platform documentation. Learn what ONE is and how to get started.
section: Getting Started
order: 0
tags:
  - getting-started
  - introduction
  - overview
---

# Make Your Ideas Real

> **Every intelligent system needs a coherent model of reality.**

ONE is an open-source platform that gives AI agents—and the humans who direct them—a complete, scalable architecture for understanding **who owns what, who can do what, what happened, and what it all means.**

Instead of reinventing data models for every project, ONE provides a **universal 6-dimension ontology** that models reality itself. This means:

- **98% AI code generation accuracy** (patterns converge, not diverge)
- **From idea to deployment in minutes** (not months)
- **Scales from 2 people to billions** without schema changes
- **100% type-safe, auditable, and intelligent**

## The 6-Dimension Ontology

Everything in ONE maps to six fundamental dimensions that model reality:

```
┌─────────────────────────────────────────────────────────────┐
│  Groups → People → Things → Connections → Events → Knowledge │
│                                                               │
│  Everything flows through these six dimensions.               │
│  Everything scales without schema changes.                   │
│  Everything is queryable, composable, and intelligent.        │
└─────────────────────────────────────────────────────────────┘
```

### 1. 👥 **Groups** - Who owns what at group level

- Multi-tenant isolation with hierarchical nesting
- From friend circles to governments
- Each group owns its own graph of data

### 2. 🙋 **People** - Authorization & governance

- Platform owner, org owner, org user, customer roles
- Every action traces back to human intent
- Clear authorization chains

### 3. 📦 **Things** - Every entity in your system

- 66+ typed entities (users, products, AI clones, tokens...)
- Flexible properties for type-specific data
- Status lifecycle management

### 4. 🔗 **Connections** - How things relate

- 25+ relationship types (owns, follows, teaches...)
- First-class relationships with metadata
- Bidirectional with temporal validity

### 5. ⚡ **Events** - Complete audit trail

- 67+ event types for every action
- Immutable records with timestamps
- Event-driven analytics and learning

### 6. 🧠 **Knowledge** - AI understanding

- Labels, chunks, and embeddings
- Powers RAG and semantic search
- Context for intelligent agent actions

## Quick Start

### Option 1: Bootstrap New Project (Recommended)

```bash
# Install ONE CLI and create new project
npx oneie

# Start Claude Code for AI-assisted development
claude

# Run the ONE command in Claude
/one
```

### Option 2: Clone and Develop

```bash
# Clone the repository
git clone https://github.com/one-ie/one
cd web

# Install dependencies
bun install

# Start development server
bun run dev
```

Visit `http://localhost:4321` to see your application.

## English → Code → Reality

Write features in plain English. The system validates against the ontology, generates TypeScript, and deploys to the edge.

### Example: Chat with AI Clone

```
FEATURE: Let fans chat with my AI clone

WHEN a fan sends a message
  CHECK they own tokens
  GET conversation history
  CALL OpenAI with my personality
  RECORD the interaction
  REWARD fan with 10 tokens
  GIVE AI response to fan
```

**This automatically generates:**

- Backend mutations and queries
- React components with real-time updates
- Complete test suite
- Edge deployment configuration

## Technology Stack

### Frontend

- **Astro 5** - Static site generation + SSR
- **React 19** - Islands architecture with selective hydration
- **Tailwind CSS v4** - CSS-based configuration
- **shadcn/ui** - 50+ pre-installed components
- **TypeScript 5.9+** - Strict mode with path aliases

### Backend

- **Convex** - Real-time database with typed functions
- **Effect.ts** - Type-safe business logic
- **Better Auth** - Multi-method authentication
- **Cloudflare Pages** - Global edge deployment

## Progressive Complexity Architecture

Start simple and add layers only when needed:

### Layer 1: Content + Pages (80% of features)

```astro
---
import { getCollection } from "astro:content";
const products = await getCollection("products");
---

<Layout>
  {products.map(product => (
    <ThingCard thing={product.data} type="product" />
  ))}
</Layout>
```

### Layer 2: + Validation (15% of features)

Add Effect.ts when you need business logic validation

### Layer 3: + State (4% of features)

Add Nanostores when components need to share state

### Layer 4: + Multiple Sources (1% of features)

Switch between Markdown/API with environment variables

### Layer 5: + Backend (<1% of features)

Add Convex for real-time data and complex operations

## Why ONE?

### For Developers

- **98% pattern reuse** - Every feature uses the same 6 dimensions
- **Zero boilerplate** - Ontology handles the complexity
- **Type-safe end-to-end** - From database to UI
- **Built-in best practices** - Authentication, authorization, audit trails

### For AI Agents

- **Consistent mental model** - Same ontology everywhere
- **Context-aware** - Understands organizational boundaries
- **Self-documenting** - Events create knowledge automatically
- **Protocol-agnostic** - Works with any external service

### For Organizations

- **Scales infinitely** - From 2 people to billions
- **100% auditable** - Every action traced to a person
- **Multi-tenant by design** - Perfect data isolation
- **Future-proof** - Technology changes, ontology stays

## Next Steps

### Essential Reading

1. [Core Concepts: Ontology](/docs/core-concepts/ontology) - Deep dive into the 6 dimensions
2. [Architecture Overview](/docs/core-concepts/architecture) - System design and patterns
3. [Quick Start Guide](/docs/getting-started/quick-start) - Build your first feature

### Learn by Example

- [Tutorials](/docs/tutorials/first-feature) - Step-by-step guides
- [Examples](/docs/tutorials/examples) - Reference implementations
- [Patterns](/docs/core-concepts/patterns) - Common use cases

### Get Help

- [Claude Code Integration](/docs/guides/claude-code) - AI-assisted development
- [Troubleshooting](/docs/troubleshooting/faq) - Common issues
- [GitHub Discussions](https://github.com/one-ie/web/discussions) - Community support

## Philosophy

**Simple enough for children. Powerful enough for enterprises.**

- Groups partition the space (hierarchical containers)
- People authorize and govern (role-based access)
- Things exist (entities with properties)
- Connections relate (relationships with metadata)
- Events record (complete audit trail)
- Knowledge understands (embeddings and vectors)

Everything else is just data. This ontology scales from friend circles (2 people) to global governments (billions) without schema changes.

---

<div align="center">

**ONE Ontology. Infinite Systems.**

_Built with clarity, simplicity, and infinite scale in mind._

[Explore the Platform](https://one.ie) • [View on GitHub](https://github.com/one-ie/one) • [Start Building](#quick-start)

</div>
