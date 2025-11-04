---
title: "Hooks System"
description: "Shell hooks that execute in response to Claude Code events like tool calls, file changes, and task completion."
featureId: "hooks"
category: "developer-tools"
status: "completed"
version: "1.1.0"
releaseDate: 2025-09-20T00:00:00Z
organization: "ONE Platform"
ontologyDimensions: ["Things", "Events"]
assignedSpecialist: "agent-backend"
specification:
  complexity: "moderate"
  estimatedHours: 24
  technologies: ["Bash", "Shell", "Node.js"]
ontologyMapping:
  things: "Hooks are automation things"
  events: "Hooks execute on events like tool_called, file_written"
useCases:
  - title: "Auto-format on Save"
    description: "Format code when files are edited"
    userType: "Developer"
  - title: "Run Tests on Commit"
    description: "Execute tests before committing code"
    userType: "Developer"
  - title: "Generate Types"
    description: "Auto-generate TypeScript types from schema"
    userType: "Developer"
features:
  - name: "Tool Call Hooks"
    description: "Execute code when specific tools are called"
    status: "completed"
  - name: "File Change Hooks"
    description: "Trigger on file write/edit events"
    status: "completed"
  - name: "Task Hooks"
    description: "Execute on task completion, error, etc."
    status: "completed"
  - name: "Environment Variables"
    description: "Access context via env vars"
    status: "completed"
  - name: "Hook Chaining"
    description: "Hooks can trigger other hooks"
    status: "in_development"
marketingPosition:
  tagline: "Automate everything."
  valueProposition: "Hooks make development faster and more consistent"
  targetAudience: ["Developers", "DevOps", "Build teams"]
  pricingImpact: "free"
metrics:
  testCoverage: 88
  performanceScore: 99
tags: ["automation", "hooks", "shell", "developer-tools"]
featured: false
priority: "medium"
createdAt: 2025-08-15T00:00:00Z
updatedAt: 2025-09-20T00:00:00Z
draft: false
---

## Overview

Hooks are shell scripts that execute automatically in response to Claude Code events. Use them to automate formatting, testing, type generation, and more.

## Hook Types

### Tool Call Hooks
Execute when specific Claude Code tools are called.

### File Write Hooks
Execute when files are written.

### Task Hooks
Execute on task events.

## Available Hooks

- `bash` - After bash command
- `read` - After reading file
- `write` - After writing file
- `edit` - After editing file
- `glob` - After globbing files
- `grep` - After grepping
- `todo` - Load current inference context
- `done` - Mark inference complete
- `submit` - When user submits prompt
- `error` - When operation fails

## Configuration

Hooks are discovered in `.claude/hooks/` directory. Name files after the event.

Make executable with `chmod +x .claude/hooks/*`
