---
title: "Email"
description: "Production-ready real-time messaging system (Capstone)"
project: "Email"
organization: "ONE Platform"
personRole: "platform_owner"
ontologyDimensions: ["Things", "Connections", "Events", "Knowledge"]
assignedSpecialist: "agent-backend"
status: "active"
priority: "high"
level: "Advanced"
demoUrl: "/mail"
planUrl: "/plans/email"
iconName: "Users"
borderColor: "border-l-pink-600"
bgColor: "bg-pink-600/20"
levelColor: "text-pink-600"
startDate: 2025-10-30
targetEndDate: 2026-03-31
progress: 0
totalInferences: 100
completedInferences: 0
features:
  - "Email-like interface with conversation threads"
  - "Message search and filters"
  - "Starred and archived conversations"
  - "Real-time notifications"
  - "User status and typing indicators"
  - "Email forwarding and integrations"
  - "Rich text formatting"
  - "Attachment support"
objectives:
  - "Build email template builder with drag-and-drop"
  - "Implement email automation workflows"
  - "Create audience segmentation and targeting"
  - "Build A/B testing framework"
  - "Implement analytics and reporting"
  - "Create deliverability monitoring"
deliverables:
  - "Email template builder"
  - "Automation workflow engine"
  - "Segmentation system"
  - "A/B testing framework"
  - "Analytics dashboard"
  - "Deliverability tools"
prerequisiteProjects:
  - "page"
  - "blog"
  - "dashboard"
learningPath:
  - "Real-time database patterns"
  - "WebSocket implementation"
  - "State management at scale"
  - "Production monitoring"
technologies:
  - "Convex"
  - "React 19"
  - "Tailwind CSS v4"
  - "TypeScript"
estimatedHours: 80
difficulty: "Advanced"
createdAt: 2025-10-30
draft: false
---

A production-ready real-time messaging application with advanced features including conversation threads, search, notifications, and integrations. Perfect for building enterprise messaging systems.

## What You'll Learn

- Real-time synchronization with Convex
- Complex state management patterns
- User presence and typing indicators
- Search and filtering at scale
- Production-ready error handling
- Performance optimization

## Key Features

- **Conversation Management**: Thread-based messaging with full context
- **Search & Filters**: Full-text search with advanced filtering options
- **Real-time Presence**: See who's online and typing indicators
- **Notifications**: Instant alerts for new messages
- **Rich UI**: Professional messaging interface with dark mode

## Architecture

```
Frontend: React 19 Components + Astro SSR
├── ConversationList (real-time list)
├── MessageThread (infinite scroll, real-time sync)
├── UserStatus (presence indicators)
└── NotificationCenter (toast notifications)

Backend: Convex Mutations & Queries
├── messages (create, update, delete)
├── conversations (create, archive, search)
├── presence (user status tracking)
└── notifications (delivery and state)
```

## Get Started

Ready to build this project? Choose your path:

<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-6">
  <a href="/mail" class="flex items-center justify-center gap-2 px-6 py-4 bg-foreground text-background hover:bg-foreground/90 rounded-lg transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105">
    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
    <span>View Demo</span>
  </a>

  <a href="/plans/email" class="flex items-center justify-center gap-2 px-6 py-4 bg-foreground text-background hover:bg-foreground/90 rounded-lg transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105">
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

  <a href="claude://new?prompt=Build%20Email%20Application" class="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-2xl hover:scale-105">
    <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M13.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8.5L13.5 2z" />
    </svg>
    <span>Send to Claude</span>
  </a>
</div>

## Implementation Plan

This project follows a **100-inference implementation plan** for systematic development.

**📋 Full Plan:** [Email Application v1.0.0](/plans/email)

**Progress:** 0/100 inferences complete (0%)

### Plan Overview

- **Infer 1-10**: Foundation & Architecture (data model, UI patterns)
- **Infer 11-30**: React State & Components (email store, UI components)
- **Infer 31-40**: Astro Pages (layouts, routes)
- **Infer 41-50**: Mock Data & Integration (wire up components)
- **Infer 51-70**: Polish & Optimization (animations, accessibility, performance)
- **Timeline**: 70-75 inferences for complete implementation

### Quick Start Commands

```bash
# 1. View the implementation plan
/plan email

# 2. Start with first inference
/infer 1

# 3. Mark complete and advance
/done
```

## How to Use

1. Visit `/mail` to see the live demo
2. Review the [100-inference implementation plan](/plans/email)
3. Follow the inference sequence step-by-step
4. Track progress as you complete each inference
5. Use real-time sync for instant updates across devices
