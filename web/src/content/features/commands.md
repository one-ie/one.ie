---
title: "Slash Commands System"
description: "Custom slash commands (/build, /design, /deploy, /release) that orchestrate complex workflows and agent coordination."
featureId: "commands"
category: "developer-tools"
status: "completed"
version: "2.0.0"
releaseDate: 2025-10-15T00:00:00Z
organization: "ONE Platform"
ontologyDimensions: ["Things", "Connections"]
assignedSpecialist: "agent-director"
specification:
  complexity: "moderate"
  estimatedHours: 48
  technologies: ["Node.js", "TypeScript", "Shell", "Claude API"]
ontologyMapping:
  things: "Commands are automation things"
  connections: "Commands coordinate agents and tools"
useCases:
  - title: "Build Features"
    description: "Run /build to coordinate agents to build feature"
    userType: "Developer"
  - title: "Release Software"
    description: "Run /release to deploy to production"
    userType: "Operations"
  - title: "Design System"
    description: "Run /design to create wireframes and specs"
    userType: "Designer"
features:
  - name: "/now"
    description: "Show current cycle and task"
    status: "completed"
  - name: "/next"
    description: "Advance to next cycle"
    status: "completed"
  - name: "/done"
    description: "Mark cycle complete"
    status: "completed"
  - name: "/build"
    description: "Trigger feature build workflow"
    status: "completed"
  - name: "/design"
    description: "Trigger design workflow"
    status: "completed"
  - name: "/deploy"
    description: "Deploy to Cloudflare Pages"
    status: "completed"
  - name: "/release"
    description: "Release new version to npm"
    status: "completed"
  - name: "/plan"
    description: "Convert idea to 100-cycle plan"
    status: "completed"
marketingPosition:
  tagline: "One command. All the power."
  valueProposition: "Simple commands that orchestrate complex workflows"
  targetAudience: ["Developers", "Operators", "Team leads"]
  pricingImpact: "free"
metrics:
  testCoverage: 92
  performanceScore: 100
tags: ["commands", "automation", "workflow", "developer-tools"]
featured: true
priority: "high"
createdAt: 2025-08-01T00:00:00Z
updatedAt: 2025-10-15T00:00:00Z
draft: false
---

## Overview

Slash commands are shortcuts that trigger complex workflows. They orchestrate agents, manage task sequences, and coordinate deployments.

## Workflow Commands

### /now
Show current cycle and what you're working on

### /next
Advance to next cycle in the sequence

### /done
Mark current cycle complete and advance

### /plan
Convert an idea into a complete 100-cycle plan

## Build Commands

### /build
Trigger feature build workflow with agents

### /design
Generate wireframes and design tokens

## Deployment Commands

### /deploy
Deploy web application to Cloudflare Pages

### /release
Publish new version to npm and GitHub

## Security

Commands respect file permissions, environment variables, and sandboxed execution. Some commands require explicit confirmation.
