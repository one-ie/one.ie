---
title: "Blog & Content Management"
description: "Markdown-based blog system with categories, tags, featured posts, and full-text search."
featureId: "blog"
category: "content"
status: "completed"
version: "1.3.0"
releaseDate: 2025-10-15T00:00:00Z
organization: "ONE Platform"
ontologyDimensions: ["Groups", "Things", "Connections", "Knowledge", "Events"]
assignedSpecialist: "agent-frontend"
specification:
  complexity: "moderate"
  estimatedHours: 32
  technologies: ["Astro", "Markdown", "React", "TailwindCSS"]
ontologyMapping:
  groups: "Blog scoped to organization groups"
  things: "Blog posts are things with type='blog_post'"
  connections: "Posts connect to categories and authors"
  knowledge: "Post content indexed for search"
  events: "post_published, post_updated events"
useCases:
  - title: "Creator Publishes Article"
    description: "Writer creates markdown post with metadata and publishes"
    userType: "Creator"
  - title: "Reader Discovers Content"
    description: "Users browse blog, filter by category/tag, read articles"
    userType: "Reader"
features:
  - name: "Markdown Editor"
    description: "Write posts in Markdown with live preview"
    status: "completed"
  - name: "Categories & Tags"
    description: "Organize posts with categories and tags"
    status: "completed"
  - name: "Featured Posts"
    description: "Highlight important posts on homepage"
    status: "completed"
  - name: "Search"
    description: "Full-text search across posts"
    status: "completed"
  - name: "Reading Time"
    description: "Estimated reading time calculation"
    status: "completed"
marketingPosition:
  tagline: "Share your story. Build your audience."
  valueProposition: "Markdown-based blogging that's fast, simple, and SEO-optimized"
  targetAudience: ["Content creators", "Technical writers", "Thought leaders"]
  pricingImpact: "starter"
metrics:
  testCoverage: 85
  performanceScore: 97
tags: ["blog", "content", "markdown", "publishing"]
featured: false
priority: "high"
createdAt: 2025-08-15T00:00:00Z
updatedAt: 2025-10-15T00:00:00Z
draft: false
---

## Overview

The Blog system is a markdown-based content management platform. Articles are stored as markdown files with YAML frontmatter, enabling version control and Git-based workflows.

## Features

### Markdown Posts
- Native markdown support
- YAML frontmatter for metadata
- Code syntax highlighting
- Math equation support

### Organization
- Multiple categories
- Tag-based filtering
- Featured posts collection
- Author attribution

### Discovery
- Full-text search
- Category browsing
- Tag filtering
- Related posts

### Metrics
- Reading time calculation
- View count tracking
- Comment moderation

## File Structure

Articles stored in content collections with automatic routing.
