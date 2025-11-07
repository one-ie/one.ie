---
title: Claude Commands Reference
description: Complete guide to ONE Platform commands in Claude Code
section: Getting Started
order: 2
tags:
  - claude-code
  - commands
  - workflow
  - automation
---

# Claude Commands Reference

Complete guide to using Claude Code commands for building with the ONE Platform.

## Overview

ONE Platform integrates deeply with Claude Code to provide AI-assisted development through specialized commands and agents. This guide explains all available commands and how to use them effectively.

## The `/one` Command - Control Center

The main entry point for ONE Platform development.

```bash
/one
```

**What it does:**
- Checks dev server status (starts automatically if stopped)
- Displays available commands and workflow
- Lists all specialist agents
- Shows quick start guidance
- Provides context for current cycle

**When to use:**
- First command after opening Claude Code
- When you need to see available commands
- To check server status
- Starting any new work session

## Core Commands

### `/chat` - Onboard & Strategy

Start a conversation to understand your vision and requirements.

```bash
# Basic usage
/chat

# With specific idea
/chat "I want to build a course platform with AI tutors"

# For brand onboarding
/chat "Analyze my website at example.com"
```

**What it does:**
- Understands your idea and requirements
- Extracts brand identity (if URL provided)
- Defines market positioning
- Gathers feature requirements
- Validates against 6-dimension ontology

**When to use:**
- Starting a new project
- Onboarding existing websites
- Defining strategy and positioning
- Before creating implementation plans

**Calls:** `agent-director` for validation

### `/plan` - Create Implementation Plan

Generate a 100-cycle implementation plan from your idea.

```bash
# Convert idea to plan
/plan convert

# Show current plan
/plan show

# Filter by specialist
/plan filter --agent=agent-frontend
```

**What it does:**
- Creates structured 100-cycle sequence
- Assigns each cycle to appropriate specialist
- Identifies dependencies between cycles
- Maps to 6-dimension ontology
- Estimates parallel opportunities

**Plan Structure:**
- Cycles 1-10: Foundation & Setup
- Cycles 11-20: Backend Schema & Services
- Cycles 21-30: Frontend Pages & Components
- Cycles 31-40: Integration & Connections
- Cycles 41-50: Authentication & Authorization
- Cycles 51-60: Knowledge & RAG
- Cycles 61-70: Quality & Testing
- Cycles 71-80: Design & Wireframes
- Cycles 81-90: Performance & Optimization
- Cycles 91-100: Deployment & Documentation

**When to use:**
- After `/chat` when ready to implement
- Converting ideas to actionable plans
- Understanding full scope of work
- Seeing specialist assignments

**Delegates to:** `agent-director`

### `/create` - Build Features

Build specific features with specialist agents working in parallel.

```bash
# Create frontend feature
/create shop-page

# Create backend feature
/create AI-tutor-mutation

# Create design artifacts
/create design-tokens

# Multiple features in parallel
/create [feature1] [feature2] [feature3]
```

**What it does:**
- Auto-routes to appropriate specialist
- Builds feature aligned with ontology
- Runs in parallel when possible
- Updates cycle state
- Logs completion

**Auto-routing:**
- Pages/Components → `agent-frontend`
- Mutations/Queries → `agent-backend`
- Design/Wireframes → `agent-designer`
- Tests/Validation → `agent-quality`
- Deployments → `agent-ops`

**When to use:**
- Building specific features
- Implementing cycle tasks
- Parallel development
- Ad-hoc feature creation

### `/server` - Manage Dev Server

Control the development server.

```bash
# Check server status
/server status

# Start server
/server start

# Stop server
/server stop

# Restart server
/server restart
```

**What it does:**
- Manages `bun run dev` process
- Monitors port 4321
- Auto-installs dependencies if needed
- Shows server URL when running

**When to use:**
- Checking if server is running
- Troubleshooting server issues
- Manual server control

### `/push` - Commit & Push

Commit changes with smart commit messages and push to remote.

```bash
# Basic commit and push
/push

# With custom message
/push "Add course platform frontend"
```

**What it does:**
- Runs `git status` to check changes
- Views diffs to understand changes
- Generates smart commit message
- Creates commit with proper format
- Pushes to remote repository

**Commit format:**
```
[action] Short description

Longer explanation of changes.

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

**When to use:**
- After completing features
- Before deploying
- Regular checkpoints
- Cycle completion

### `/deploy` - Ship to Production

Deploy to production environments.

```bash
# Deploy everything
/deploy

# Deploy web only
/deploy web

# Deploy backend only
/deploy backend
```

**What it does:**
- Builds production assets
- Deploys web to Cloudflare Pages
- Deploys backend to Convex Cloud
- Runs pre-deployment checks
- Verifies deployment success

**Deployment targets:**
- Web: Cloudflare Pages (edge network)
- Backend: Convex Cloud (real-time database)

**When to use:**
- After completing features
- Cycle 91-100 (deployment phase)
- Releasing to production
- Testing in production environment

**Requires:** Valid credentials in `.env`

## Workflow Commands

### `/now` - View Current Cycle

See current cycle, assigned agent, and context.

```bash
/now
```

**What it shows:**
- Current cycle number (N/100)
- Phase (Foundation, Backend, Frontend, etc.)
- Assigned specialist agent
- Task description
- Dependencies
- Progress percentage

**When to use:**
- Starting work session
- Checking what to work on
- Understanding current context
- Seeing assigned specialist

**Reads from:** `.claude/state/cycle.json`

### `/next` - Advance to Next Cycle

Move to next cycle in the plan.

```bash
/next
```

**What it does:**
- Marks previous cycle as in_progress
- Loads next cycle from plan
- Shows assigned specialist
- Loads agent context
- Updates state file

**When to use:**
- Skipping cycles (if not applicable)
- Moving forward in plan
- After completing current cycle

### `/done` - Mark Cycle Complete

Mark current cycle complete and capture lessons learned.

```bash
/done
```

**What it does:**
- Updates cycle state to completed
- Captures lessons learned
- Calls `agent-documenter` to save knowledge
- Advances to next cycle automatically
- Logs completion event

**When to use:**
- After completing cycle task
- Capturing important learnings
- Moving to next cycle with context

**Updates:** `.claude/state/cycle.json`

### `/reset` - Start New Feature

Reset to Cycle 1 for a new feature.

```bash
/reset
```

**What it does:**
- Resets cycle counter to 1
- Clears current plan
- Ready for new `/plan convert`
- Preserves previous lessons learned

**When to use:**
- Starting completely new feature
- After completing 100-cycle plan
- Pivoting to different project

## Specialist Agents

Each command may invoke specialist agents automatically. Here's what each agent does:

### agent-director
**Orchestrates plans and validates ontology alignment**

- Creates 100-cycle plans
- Validates features against 6 dimensions
- Assigns cycles to specialists
- Manages dependencies

**Invoked by:** `/plan`, `/chat`

### agent-backend
**Builds Convex backend features**

- Schema design (groups, people, things, connections, events, knowledge)
- Mutations (write operations)
- Queries (read operations)
- Services (business logic with Effect.ts)
- Multi-tenant scoping (groupId)

**Invoked by:** `/create [backend-feature]`

### agent-frontend
**Builds Astro + React frontend**

- Astro pages (file-based routing)
- React components (islands architecture)
- shadcn/ui integration
- Nanostores state management
- Progressive complexity (5 layers)

**Invoked by:** `/create [frontend-feature]`

### agent-designer
**Creates design artifacts**

- Wireframes
- Component definitions
- Design tokens
- WCAG accessibility compliance
- Brand alignment

**Invoked by:** `/create [design-feature]`

### agent-quality
**Defines tests and validates**

- Test definitions (unit, integration, e2e)
- Acceptance criteria
- Ontology alignment checks
- Quality insights

**Invoked by:** `/create [test-feature]`

### agent-ops
**Manages deployments and infrastructure**

- CI/CD pipelines
- Cloudflare Pages deployment
- Convex Cloud deployment
- Infrastructure automation

**Invoked by:** `/deploy`

### agent-clean
**Maintains code quality**

- Technical debt detection
- Refactoring without breaking functionality
- Ontology compliance
- Code quality metrics

**Invoked by:** Automatic on certain cycles

### agent-documenter
**Captures knowledge**

- Documentation updates
- Lessons learned
- Knowledge dimension updates
- AI semantic search enablement

**Invoked by:** `/done`

### agent-clone
**Migrates and creates AI clones**

- Legacy system migration
- Data import to ontology
- AI clone creation from creator content

**Invoked by:** `/create [migration-feature]`

## Command Workflow Examples

### Example 1: Building a Course Platform

```bash
# Step 1: Start conversation
/chat "I want to build a course platform with AI tutors"

# Step 2: Create implementation plan
/plan convert

# Step 3: Check current cycle
/now
# Shows: Cycle 1/100 - Foundation & Setup
# Agent: agent-director

# Step 4: Build specific features
/create course-schema       # Backend: agent-backend
/create course-list-page    # Frontend: agent-frontend
/create course-card-design  # Design: agent-designer

# Step 5: Complete cycle
/done

# Step 6: Advance
/next

# Step 7: Continue building
/now
/create [next-features]

# Step 8: Commit progress
/push

# Step 9: Deploy when ready
/deploy
```

### Example 2: Quick Feature Addition

```bash
# Already have a project running
/one

# Just build the feature directly
/create shopping-cart
/create checkout-flow

# Commit when done
/push "Add shopping cart and checkout"

# Deploy
/deploy web
```

### Example 3: Onboarding Existing Website

```bash
# Analyze existing website
/chat "Onboard my website at example.com"

# System extracts:
# - Brand identity (colors, logos, fonts, tone)
# - Features and capabilities
# - Content structure
# - Technical stack

# Create migration plan
/plan convert "Migrate example.com to ONE Platform"

# Execute migration cycles
/now
/create [migration-features]
/done
/next
```

## Best Practices

### Command Sequence

**Recommended order for new projects:**

1. `/one` - Orient yourself
2. `/chat` - Understand requirements
3. `/plan convert` - Create roadmap
4. `/now` → `/create` → `/done` - Execute cycles
5. `/push` - Save progress
6. `/deploy` - Ship to production

### Parallel Execution

Use `/create` for multiple features simultaneously:

```bash
# These run in parallel
/create user-profile-page
/create user-settings-page
/create user-avatar-upload

# Backend and frontend in parallel
/create user-mutations
/create user-profile-component
```

### Context Management

Commands are designed for minimal context usage:

- `/one` display: ~300 tokens
- `/chat` flow: ~500 tokens
- `/plan` flow: ~2K tokens
- `/now` + agent: ~1-3K tokens
- `/create` + specialist: ~3K tokens

**Result:** 98% context reduction vs traditional approaches (150K → 3K tokens)

### State Persistence

All workflow state is persisted:

- `.claude/state/cycle.json` - Current cycle
- `.claude/state/plan.json` - 100-cycle plan
- `.onboarding.json` - Brand & requirements
- `one/events/` - Lessons learned

You can close and reopen Claude Code without losing context.

## Troubleshooting

### Server Won't Start

```bash
# Check if port is already in use
lsof -ti:4321

# Kill existing process
lsof -ti:4321 | xargs kill

# Start fresh
/server start
```

### Command Not Found

```bash
# Verify you're in Claude Code (not regular terminal)
# Commands starting with / only work in Claude Code

# List available commands
/one
```

### Agent Not Responding

```bash
# Check current cycle state
/now

# Reset if stuck
/reset

# Start fresh plan
/plan convert
```

### Deployment Failing

```bash
# Check environment variables
cat .env

# Verify credentials
# - CLOUDFLARE_API_TOKEN or CLOUDFLARE_GLOBAL_API_KEY
# - CONVEX_DEPLOYMENT

# Run manual deployment
cd web && bun run build && wrangler pages deploy dist
```

## Learn More

**Documentation:**
- [Quick Start](/getting-started/quick-start) - Get started in 60 seconds
- [Architecture Overview](/overview/architecture) - Platform architecture
- [6-Dimension Ontology](/overview/ontology) - Core data model

**Files:**
- `.claude/commands/*.md` - Command definitions
- `.claude/agents/*.md` - Agent specifications
- `CLAUDE.md` - Root instructions for Claude

**Community:**
- Website: https://one.ie
- GitHub: https://github.com/one-ie
- CLI: `npx oneie`

---

**Transform ideas into production code in minutes with Claude commands.**
