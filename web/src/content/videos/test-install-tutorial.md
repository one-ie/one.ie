---
title: "ONE Platform Installation Tutorial"
description: "Step-by-step guide to installing and setting up the ONE Platform with all dependencies and configuration"
videoUrl: "/media/install.mov"
thumbnail: "/images/videos/install-tutorial.jpg"
duration: 180
publishedAt: 2025-11-08
author: "ONE Platform"
categories: ["tutorial", "getting-started"]
tags: ["installation", "setup", "quickstart", "beginner"]
featured: true
---

# ONE Platform Installation Tutorial

This tutorial walks you through the complete installation process for the ONE Platform, including all dependencies, configuration, and verification steps.

## What You'll Learn

- Installing Node.js, Bun, and required dependencies
- Cloning the ONE Platform repository
- Setting up the frontend (Astro + React)
- Configuring the backend (Convex)
- Running the development servers
- Verifying your installation

## Prerequisites

Before starting this tutorial, make sure you have:

- macOS, Linux, or Windows with WSL2
- Terminal/command line access
- GitHub account (for cloning the repository)
- Basic understanding of command line operations

## Installation Steps

### 1. Install Dependencies (0:00 - 0:30)

We'll start by installing the core dependencies:
- Node.js 20+ (for Convex backend)
- Bun 1.1+ (for frontend development)
- Git (for version control)

### 2. Clone Repository (0:30 - 1:00)

Learn how to clone the ONE Platform repository and navigate the project structure:
```bash
git clone https://github.com/yourusername/ONE
cd ONE
```

### 3. Frontend Setup (1:00 - 2:00)

Set up the Astro + React frontend:
```bash
cd web
bun install
bun run dev
```

### 4. Backend Setup (2:00 - 2:30)

Configure and start the Convex backend:
```bash
cd backend
npm install
npx convex dev
```

### 5. Verification (2:30 - 3:00)

Verify everything is working correctly:
- Check http://localhost:4321 for the frontend
- Verify Convex dashboard connection
- Test authentication flow
- Explore example features

## Next Steps

After completing this installation:

1. Read the [Architecture Guide](/docs/develop/architecture)
2. Learn about the [6-Dimension Ontology](/docs/develop/ontology)
3. Build your first feature with [Quick Start](/docs/develop/quickstart)
4. Explore [Example Projects](/examples)

## Troubleshooting

If you encounter issues:

- **Port conflicts:** Change ports in configuration files
- **Permission errors:** Use `sudo` for global npm packages
- **Dependency issues:** Clear node_modules and reinstall
- **Convex connection:** Check your internet connection and API keys

## Resources

- [GitHub Repository](https://github.com/yourusername/ONE)
- [Full Documentation](/docs)
- [Community Discord](https://discord.gg/one-platform)
- [Video Playlist](/videos?category=getting-started)

---

*Ready to build with ONE Platform? Let's get started!*
