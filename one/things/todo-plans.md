# Plans Content Collection & 100-Inference Task Management

## Overview

The **Plans content collection** is a structured system for managing feature implementation plans using the **100-inference paradigm**. Instead of traditional time-based planning (days/weeks), plans are broken into 100 discrete inference passes, each representing a concrete step.

**Location:** `web/src/content/plans/`

## Schema Structure

```typescript
PlanSchema {
  title: string                           // Plan title
  description: string                     // Brief description
  feature: string                         // Feature name
  organization?: string                   // Organization name
  personRole?: enum                       // User's role
  ontologyDimensions?: string[]          // Mapped to 6-dimension ontology
  assignedSpecialist?: string            // Agent/specialist assigned
  totalInferences: number                 // Always 100 (default)
  completedInferences: number            // How many completed

  // Standard 100-inference phase breakdown
  inferenceTemplate?: {
    range: string                        // e.g., "1-10"
    phase: string                        // e.g., "Foundation & Setup"
    description: string
    tasks?: string[]
  }[]

  // Individual task tracking
  tasks?: {
    inferenceNumber: number              // 1-100
    content: string                      // Task description
    status: 'pending'|'in_progress'|'completed'
    activeForm: string                   // Present continuous form
    dependencies?: number[]              // Other inference numbers
  }[]

  // Metrics
  dependenciesMet: number
  totalDependencies: number

  // Learning tracking
  lessonsLearned?: {
    inference: number
    lesson: string
  }[]

  // Timestamps
  createdAt?: date
  updatedAt?: date
  startedAt?: date
  completedAt?: date
  draft?: boolean
}
```

## 100-Inference Breakdown

Every feature follows this standard 100-inference sequence:

### **Infer 1-10: Foundation & Setup**
- Understand requirements and constraints
- Map feature to 6-dimension ontology (Groups, People, Things, Connections, Events, Knowledge)
- Read relevant documentation and code patterns
- Create implementation plan
- Identify dependencies and risks

### **Infer 11-20: Backend Schema & Services**
- Design/update database schema (groups, things, connections, events, knowledge)
- Create Effect.ts services (pure business logic)
- Implement Convex mutations and queries
- Add proper error handling and validation

### **Infer 21-30: Frontend Pages & Components**
- Create React components with proper props/hooks
- Build Astro pages with SSR data fetching
- Implement loading and error states
- Use shadcn/ui components for consistency

### **Infer 31-40: Integration & Connections**
- Implement external system integrations
- Connect protocols (A2A, ACP, AP2, X402, AG-UI)
- Manage cross-platform data flows
- Ensure bidirectional synchronization

### **Infer 41-50: Authentication & Authorization**
- Implement security layers
- Define role-based access control (RBAC)
- Add permission validation
- Audit logging for sensitive operations

### **Infer 51-60: Knowledge & RAG**
- Create vector embeddings
- Implement semantic search
- Build RAG (Retrieval-Augmented Generation) features
- Add knowledge categorization and tagging

### **Infer 61-70: Quality & Testing**
- Write unit tests for services
- Create integration tests for full flows
- Implement end-to-end (E2E) tests
- Achieve target code coverage (80%+)

### **Infer 71-80: Design & Wireframes**
- Create UI/UX wireframes and mockups
- Design component library additions
- Ensure WCAG accessibility compliance
- Apply brand identity and design tokens

### **Infer 81-90: Performance & Optimization**
- Optimize database queries and indexes
- Implement caching strategies
- Reduce JavaScript bundle size
- Profile and optimize rendering

### **Infer 91-100: Deployment & Documentation**
- Write comprehensive documentation
- Prepare changelog and release notes
- Configure deployment pipelines
- Deploy to production
- Monitor and collect feedback

## Usage

### Creating a New Plan

1. **Create markdown file** in `web/src/content/plans/`

```markdown
---
title: "Feature Name"
description: "Brief description"
feature: "Feature Name"
organization: "Org Name"
personRole: "platform_owner"
ontologyDimensions: ["Things", "Knowledge"]
assignedSpecialist: "Agent Name"
totalInferences: 100
completedInferences: 0
createdAt: 2025-10-30
draft: false
---

# Feature Plan

Content here...
```

2. **Track tasks** with inference numbers and status:

```yaml
tasks:
  - inferenceNumber: 1
    content: "Understand requirements"
    status: pending
    activeForm: "Understanding requirements"

  - inferenceNumber: 2
    content: "Design schema"
    status: pending
    activeForm: "Designing schema"
    dependencies: [1]
```

3. **Record lessons** after each completed inference:

```yaml
lessonsLearned:
  - inference: 5
    lesson: "X pattern works better than Y approach"
  - inference: 10
    lesson: "Need additional validation for edge case Z"
```

### Viewing Plans

Plans are available in the web application:
- **Collection:** `/plans` - List all plans
- **Individual:** `/plans/[slug]` - View specific plan with task breakdown
- **Dashboard:** `/plans/dashboard` - Analytics and progress tracking

### Integration with CLI Workflow

Plans integrate with ONE CLI commands:
- `/now` - Display current inference and context
- `/next` - Advance to next inference
- `/todo` - View complete plan
- `/done` - Mark inference complete and record lesson

## Key Features

✅ **Dependency Tracking** - Tasks can declare dependencies on other inferences
✅ **Progress Metrics** - Track completed inferences, dependencies met
✅ **Lesson Capture** - Record learning after each step
✅ **Type Safety** - Full TypeScript support via Zod schema
✅ **Ontology Mapping** - All plans map to 6-dimension ontology
✅ **Multi-tenancy** - Plans can be org/group specific

## Examples

### Simple Linear Plan
Inferences with no dependencies, sequential execution

### Complex Plan
Inferences with dependencies enabling parallel work after foundation phase:
- Infer 1-10: Foundation (sequential)
- Infer 11-30: Backend + Frontend (parallel)
- Infer 31+: Integration (depends on Backend + Frontend)

### Lightweight Plan
Minimal tasks for well-understood features:
- Skip irrelevant inferences
- Combine related inferences
- Mark as draft and iterate

## Benefits

| Aspect | Traditional Planning | Inference-Based |
|--------|----------------------|-----------------|
| Unit | Days/weeks (variable) | Inference passes (fixed) |
| Accuracy | Low (depends on estimation) | High (concrete steps) |
| Parallelism | Sequential bias | Natural parallelism |
| Context | Heavy (150k tokens) | Light (3k tokens) |
| Speed | Slow (115s avg) | Fast (20s avg) |
| Learning | Lost after project | Captured per inference |

## Related Files

- **Schema:** `web/src/content/config.ts` - PlanSchema definition
- **Pages:** `web/src/pages/plans/` - Collection pages and routes
- **CLI:** `.claude/commands/done.md` - Mark inference complete
- **Ontology:** `one/knowledge/ontology.md` - 6-dimension reference
- **Workflow:** `one/connections/workflow.md` - 6-phase development process

## Future Enhancements

- [ ] Real-time collaboration on plans
- [ ] Inference timeline visualization
- [ ] Dependency graph visualization
- [ ] AI-powered lesson extraction
- [ ] Plan templates for common feature types
- [ ] Integration with GitHub issues and PRs
- [ ] Automated progress updates from commits
- [ ] Cross-team plan aggregation and analytics
