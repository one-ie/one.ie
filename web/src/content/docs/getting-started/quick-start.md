---
title: Quick Start
description: Get up and running with ONE in 5 minutes
section: Getting Started
order: 1
tags:
  - getting-started
  - setup
  - installation
  - 6-dimensions
  - ontology
---

# Quick Start Guide

Get your first ONE project running in just a few minutes and start building with the 6-dimension ontology.

## TL;DR - Get Started in 60 Seconds

```bash
# 1. Create project
npx oneie

# 2. Start Claude Code
claude

# 3. Use ONE command
/one

# 4. Start building
/chat "I want to build [your idea]"
```

That's it! Claude guides you through the rest.

## What is ONE?

ONE is a coherent model of reality built on a universal 6-dimension ontology:

- **Groups** - Hierarchical containers (friend circles → DAOs → governments)
- **People** - Authorization & governance (who can do what)
- **Things** - Every entity type (users, agents, products, courses, tokens)
- **Connections** - Every relationship (owns, follows, teaches, transacts)
- **Events** - Every action (created, purchased, viewed, completed)
- **Knowledge** - AI understanding (labels, embeddings, search)

Everything scales from a lemonade stand to a Fortune 500 company without schema changes.

## Prerequisites

- Node.js 18+ (or Bun 1.0+)
- Git
- A text editor

## Step 1: Create a New Project

```bash
# Option A: Using the ONE CLI (Recommended)
npx oneie

# This will:
# 1. Prompt for organization name and details
# 2. Create project structure
# 3. Install dependencies automatically
# 4. Set up environment variables

# Option B: Clone the repository
git clone https://github.com/one-ie/one.git
cd one
```

## Step 2: Start Claude Code

After running `npx oneie`, start Claude Code in your project directory:

```bash
# In your terminal
claude

# Or if using Claude Desktop
# Open the project folder in Claude Code
```

## Step 3: Use the `/one` Command

Once Claude Code is running, type:

```bash
/one
```

This displays the ONE Platform Control Center with all available commands and automatically starts your dev server at `http://localhost:4321`.

**What `/one` does:**
- Checks dev server status (starts it if needed)
- Shows available commands and workflow
- Lists specialist agents
- Provides quick start guidance

## Step 4: Your First Workflow

Now you're ready to build! The `/one` command shows you the complete workflow:

### Quick Workflow

```bash
# 1. Start a conversation about your idea
/chat "I want to build a course platform with AI tutors"

# 2. Create a 100-cycle implementation plan
/plan convert

# 3. View current cycle
/now

# 4. Build features (agents work in parallel)
/create [feature-name]

# 5. Mark cycle complete and advance
/done

# 6. Commit changes
/push

# 7. Deploy to production
/deploy
```

### Available Commands from `/one`

**Core Commands:**
- `/server` - Check/start/stop dev server
- `/chat` - Onboard, strategy, market positioning
- `/plan` - Create 100-cycle implementation plan
- `/create` - Build features with specialists
- `/push` - Commit & push changes
- `/deploy` - Ship to production (Cloudflare + Convex)

**Workflow Commands:**
- `/now` - View current cycle and context
- `/next` - Advance to next cycle
- `/done` - Mark complete, capture lessons
- `/reset` - Start new feature (reset to Cycle 1)

## Step 5: Configure Environment (Optional)

Create `.env.local` in the web directory if you need backend integration:

```bash
# Backend connection (optional - frontend works standalone)
PUBLIC_CONVEX_URL=https://shocking-falcon-870.convex.cloud
CONVEX_DEPLOYMENT=prod:shocking-falcon-870

# Authentication (optional)
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:4321
```

**Default mode:** Frontend-only with nanostores for state management. Backend integration is optional.

## Step 6: Build Your First Feature

ONE uses a **5-layer progressive architecture** - start simple, add complexity only when needed:

**Layer 1: Content + Pages (80% of features)**

```astro
---
// src/pages/products.astro
import { getCollection } from "astro:content";
const products = await getCollection("products");
---

<Layout>
  <h1>Products</h1>
  <div class="grid gap-4">
    {products.map(product => (
      <Card>
        <CardHeader>
          <CardTitle>{product.data.name}</CardTitle>
        </CardHeader>
      </Card>
    ))}
  </div>
</Layout>
```

**Layer 2: + Validation (when needed)**

Add Effect.ts services for business logic and type safety.

**Layer 3: + State (when islands need to communicate)**

Use nanostores for shared state between Astro islands.

**Layer 4: + Multiple Sources (when switching backend providers)**

Provider pattern enables one-line source switching (markdown → API → Convex).

**Layer 5: + Backend (when explicitly needed)**

Multi-tenant groups, event logging, real-time updates require backend integration.

**Golden Rule:** Start at Layer 1. Add layers only when you feel the pain.

## Step 7: Understand Cycle-Based Workflow

ONE plans in **cycles** (not days). Every feature follows a 100-cycle sequence managed automatically by Claude:

### The Cycle System

```bash
# Start: Create a plan from your idea
/chat "Build a course platform"    # Understand requirements
/plan convert                       # Generate 100-cycle plan

# Execute: Work through cycles
/now                                # See current cycle & assigned agent
/create [feature]                   # Build specific feature
/done                               # Complete cycle, capture lessons

# Repeat: Advance through plan
/next                               # Move to next cycle
/now                                # Check new cycle & agent
```

### 100-Cycle Template Structure

Every feature automatically maps to this sequence:

- **Cycles 1-10:** Foundation & Setup
- **Cycles 11-20:** Backend Schema & Services
- **Cycles 21-30:** Frontend Pages & Components
- **Cycles 31-40:** Integration & Connections
- **Cycles 41-50:** Authentication & Authorization
- **Cycles 51-60:** Knowledge & RAG
- **Cycles 61-70:** Quality & Testing
- **Cycles 71-80:** Design & Wireframes
- **Cycles 81-90:** Performance & Optimization
- **Cycles 91-100:** Deployment & Documentation

### Specialist Agents (Auto-Assigned)

Each cycle is automatically assigned to the right specialist:

- **agent-director** - Orchestrates plan and validates ontology
- **agent-backend** - Convex schema, mutations, queries
- **agent-frontend** - Astro pages, React components
- **agent-designer** - Wireframes, design tokens, UI specs
- **agent-quality** - Tests, validation, acceptance criteria
- **agent-ops** - Deployments, CI/CD, infrastructure
- **agent-clean** - Refactoring, code quality
- **agent-documenter** - Documentation, knowledge capture

**Why cycles work:** 98% context reduction (150k → 3k tokens), 5x faster execution, agents work in parallel when dependencies allow.

## Step 8: Understand the 6 Dimensions

Every feature maps to the same 6 dimensions:

```
groups → Multi-tenant isolation (friend circles → governments)
people → Authorization & governance (4 roles)
things → All entities (66+ types: users, products, courses, tokens)
connections → Relationships (25+ types: owns, follows, teaches)
events → Actions & audit trail (67+ types: created, purchased, viewed)
knowledge → AI understanding (labels, embeddings, vectors)
```

**Ask before coding:**
1. Which **group** owns this?
2. Which **people** (roles) can access it?
3. What **things** (entities) are involved?
4. What **connections** (relationships) exist?
5. What **events** (actions) need logging?
6. What **knowledge** should be learned?

## Next Steps

**Learn the Architecture:**
- Read `/one/knowledge/ontology.md` - Complete 6-dimension specification
- Read `/one/knowledge/architecture.md` - Platform architecture
- Read `/one/knowledge/astro-effect-simple-architecture.md` - Progressive complexity

**Build Features:**
- `/build` - Start building with AI specialists
- `/design` - Create wireframes and UI components
- `/deploy` - Ship to production

**Browse Documentation:**
- 41 docs organized in 8 layers in `/one/` directory
- Installation-specific docs in `/<installation-name>/` (if configured)
- Frontend patterns in `/web/CLAUDE.md`
- Backend patterns in `/backend/CLAUDE.md`

**Join the Community:**
- Website: https://one.ie
- CLI: `npx oneie`
- GitHub: https://github.com/one-ie

**Common Commands:**

```bash
# ONE Platform Workflow (use these in Claude Code)
/one                     # Show control center
/chat [idea]             # Start conversation & onboard
/plan convert            # Create 100-cycle plan
/now                     # View current cycle
/create [feature]        # Build with specialists
/done                    # Complete cycle
/push                    # Commit & push
/deploy                  # Deploy to production

# Direct Development (terminal)
bun run dev              # Start dev server (localhost:4321)
bun run build            # Build for production
bunx astro check         # Type checking
```

## What Makes ONE Different?

**Pattern Convergence:** Every feature reinforces the same 6 patterns. AI accuracy compounds from 85% → 98% over time (traditional systems degrade from 95% → 30%).

**No Schema Changes:** Scale from lemonade stand (2 people) to Fortune 500 (millions) without modifying the ontology.

**Frontend-First:** 80% of features work standalone with nanostores. Backend integration is optional.

**Cycle-Based Planning:** Plan in sequence positions (Cycle 1-100), not time estimates. 98% less context, 5x faster execution.

**Universal Ontology:** Same 6 dimensions model reality itself - groups partition space, people authorize, things exist, connections relate, events record, knowledge understands.

Ready to build? Start with `/now` to see your current cycle.
