---
title: Quick Start Guide
description: Get up and running with ONE in 5 minutes
section: Getting Started
order: 2
tags:
  - getting-started
  - setup
  - installation
---

# Quick Start Guide

Get your first ONE project running in just a few minutes.

## Prerequisites

- Node.js 18+ (or Bun 1.0+)
- Git
- A text editor

## Step 1: Create a New Project

```bash
# Option A: Using the ONE CLI
npx oneie create my-app

# Option B: Clone the web repository
git clone https://github.com/one-ie/web.git my-app
cd my-app
```

## Step 2: Install Dependencies

```bash
# Using Bun (recommended)
bun install

# Or using npm
npm install

# Or using pnpm
pnpm install
```

## Step 3: Start Development Server

```bash
bun run dev
```

Your site will be available at `http://localhost:4321`

## Step 4: Create Your First Page

Create a new file `src/pages/hello.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
---

<Layout title="Hello World">
  <div class="container mx-auto py-12">
    <h1 class="text-4xl font-bold">Welcome to ONE!</h1>
    <p class="text-lg text-muted-foreground mt-4">
      You're ready to start building.
    </p>
  </div>
</Layout>
```

Visit `http://localhost:4321/hello` to see your page.

## Step 5: Add Content

Create a new markdown file in `src/content/blog/first-post.md`:

```markdown
---
title: My First Post
description: A simple blog post
date: 2024-01-01
author: Your Name
category: welcome
---

# My First Post

This is my first blog post on ONE!
```

## Next Steps

- Explore the [Architecture](/docs/core-concepts/architecture) guide
- Learn about [Content Collections](/docs/core-concepts/collections)
- Check out [shadcn/ui Components](/docs/tutorials/components)

## Troubleshooting

**Port 4321 already in use?**

```bash
bun run dev -- --port 3000
```

**Import errors?**

```bash
bunx astro check
```

**Build failing?**

Clear the build cache:

```bash
rm -rf dist .astro
bun run build
```

You're all set! Happy building.
