---
title: "ONE Platform Installation with Chapters"
description: "Step-by-step installation guide with navigable chapters for quick access to each section"
videoUrl: "/media/install.mov"
thumbnail: "/images/videos/install-tutorial.jpg"
duration: 180
publishedAt: 2025-11-08
author: "ONE Platform"
categories: ["tutorial", "getting-started"]
tags: ["installation", "setup", "quickstart", "beginner", "chapters"]
featured: true
chapters:
  - startTime: 0
    endTime: 30
    text: "Installing Dependencies"
  - startTime: 30
    endTime: 60
    text: "Cloning Repository"
  - startTime: 60
    endTime: 120
    text: "Frontend Setup"
  - startTime: 120
    endTime: 150
    text: "Backend Configuration"
  - startTime: 150
    text: "Verification & Testing"
---

# ONE Platform Installation with Chapters

This is the same installation tutorial, but enhanced with **chapter markers** that allow you to jump directly to any section using the native video controls.

## How to Use Chapters

When you play the video, you'll see chapter markers in the video timeline:

1. **Installing Dependencies (0:00)** - Node.js, Bun, and Git setup
2. **Cloning Repository (0:30)** - Getting the code from GitHub
3. **Frontend Setup (1:00)** - Astro + React configuration
4. **Backend Configuration (2:00)** - Convex database setup
5. **Verification & Testing (2:30)** - Making sure everything works

Click on any chapter in the video controls to jump directly to that section!

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

## Chapter Details

### Chapter 1: Installing Dependencies (0:00 - 0:30)

Install the core tools:
```bash
# Install Bun (macOS/Linux)
curl -fsSL https://bun.sh/install | bash

# Install Node.js 20+
# Download from https://nodejs.org/

# Verify installations
bun --version
node --version
```

### Chapter 2: Cloning Repository (0:30 - 1:00)

Get the code:
```bash
git clone https://github.com/yourusername/ONE
cd ONE
ls -la
```

### Chapter 3: Frontend Setup (1:00 - 2:00)

Configure Astro + React:
```bash
cd web
bun install
bun run dev
# Visit http://localhost:4321
```

### Chapter 4: Backend Configuration (2:00 - 2:30)

Set up Convex:
```bash
cd backend
npm install
npx convex dev
# Follow prompts to create account
```

### Chapter 5: Verification & Testing (2:30 - 3:00)

Verify installation:
- ✅ Frontend at http://localhost:4321
- ✅ Convex dashboard connected
- ✅ Authentication working
- ✅ Example features accessible

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

---

*Try clicking the chapters in the video player to jump between sections!*
