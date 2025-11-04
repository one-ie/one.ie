---
title: "AI Agent System"
description: "Specialized AI agents for different tasks: backend, frontend, design, documentation, quality assurance, and more."
featureId: "agents"
category: "ai-agents"
status: "completed"
version: "1.0.0"
releaseDate: 2025-09-15T00:00:00Z
organization: "ONE Platform"
ontologyDimensions: ["Groups", "Things", "Connections", "Events"]
assignedSpecialist: "agent-director"
specification:
  complexity: "expert"
  estimatedHours: 200
  technologies: ["Claude API", "Effect.ts", "Convex", "TypeScript"]
ontologyMapping:
  groups: "Each agent belongs to a group with specific permissions"
  things: "Agents are things with type='intelligence_agent'"
  connections: "Agents delegate work to other agents"
  events: "Agent actions logged as events"
useCases:
  - title: "Feature Implementation"
    description: "agents work together to plan, design, build, test, and document features"
    userType: "Platform Owner"
  - title: "Code Review"
    description: "Code review agent analyzes pull requests"
    userType: "Developer"
  - title: "Documentation"
    description: "Documentation agent writes and updates docs automatically"
    userType: "Technical Writer"
features:
  - name: "Agent Director"
    description: "Orchestrates other agents for feature implementation"
    status: "completed"
  - name: "Backend Specialist"
    description: "Implements Convex backend, schema, mutations, queries"
    status: "completed"
  - name: "Frontend Specialist"
    description: "Builds Astro pages and React components"
    status: "completed"
  - name: "Designer"
    description: "Creates wireframes and design tokens"
    status: "completed"
  - name: "Quality Assurance"
    description: "Writes tests and validates quality"
    status: "completed"
  - name: "Documenter"
    description: "Writes guides and API documentation"
    status: "completed"
  - name: "Operations"
    description: "DevOps and CI/CD"
    status: "completed"
  - name: "Problem Solver"
    description: "Analyzes failures and proposes fixes"
    status: "completed"
marketingPosition:
  tagline: "AI agents that build AI platforms."
  valueProposition: "AI-powered development that scales to unlimited features"
  targetAudience: ["Platform teams", "Startups", "Enterprises"]
  pricingImpact: "enterprise"
metrics:
  testCoverage: 92
  performanceScore: 95
tags: ["ai", "agents", "automation", "development"]
featured: true
priority: "critical"
createdAt: 2025-07-15T00:00:00Z
updatedAt: 2025-09-15T00:00:00Z
draft: false
---

## Overview

Specialized AI agents that work together to build the ONE Platform. Each agent has specific expertise and can communicate with other agents.

## Agent Specialties

### Agent Director
- Validates feature ideas
- Plans 100-inference sequences
- Assigns work to specialists
- Orchestrates execution

### Agent Backend
- Designs Convex schema
- Implements mutations/queries
- Creates services in Effect.ts
- Handles data migrations

### Agent Frontend
- Creates Astro pages
- Builds React components
- Implements UI/UX
- Optimizes performance

### Agent Designer
- Creates wireframes
- Defines design tokens
- Generates component specs
- Ensures accessibility

### Agent Quality
- Defines test suites
- Validates implementations
- Measures metrics
- Predicts issues

### Agent Documenter
- Writes API documentation
- Creates guides
- Captures lessons learned
- Updates knowledge base

### Agent Operations
- Sets up CI/CD
- Configures deployments
- Manages infrastructure
- Monitors production

### Agent Problem Solver
- Analyzes test failures
- Identifies root causes
- Proposes specific fixes
- Validates solutions

## Inter-Agent Communication

Agents communicate via ACP Protocol, Convex Mutations, Event Queues, and Shared Context.

## Running Agents

Use slash commands to trigger agent workflows. Agents run automatically and communicate as needed.

## Parallel Execution

Agents run in parallel when possible, resulting in 5x faster feature delivery.
