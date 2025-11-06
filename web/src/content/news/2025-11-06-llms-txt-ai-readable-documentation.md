---
title: 'llms.txt: AI-Readable Documentation Standard'
description: "We've created minimal and comprehensive llms.txt files following the llmstxt.org standard, with transparent context about Google's assessment and real-world utility."
slug: 'llms-txt-ai-readable-documentation'
date: 2025-11-06
image: '/screenshots/llms-txt-preview.png'
author: 'ONE'
tags: ['documentation', 'ai', 'llm', 'standards', 'transparency']
category: 'news'
featured: false
---

We've created **two llms.txt files** for ONE Platform following the llmstxt.org standard—a minimal version and a comprehensive full reference. But here's the key: **we're transparent about what this standard actually delivers (and doesn't).**

## What is llms.txt?

llms.txt is a proposed standard using markdown format to present website content to AI agents in a clean, stripped-down manner—free of ads, navigation, and visual clutter. The idea: help AI systems understand your site without parsing HTML.

**The concept:**
```
website.com/llms.txt → Clean markdown for AI
website.com/llms-full.txt → Comprehensive reference
```

## What We Created

### 1. Minimal Version (`/llms.txt`)

**~250 lines covering:**
- Platform overview and 6-dimension ontology summary
- Technology stack (Astro, React, Convex, Cloudflare)
- Key concepts (groups, people, things, connections, events, knowledge)
- Getting started commands
- Documentation links

**Use case:** Quick AI understanding of platform fundamentals.

### 2. Comprehensive Version (`/llms-full.txt`)

**~800+ lines covering:**
- Complete 6-dimension ontology breakdown with examples
- Full architecture explanation (3-layer stack)
- Development workflow (all 6 phases)
- Cycle-based planning system (100-cycle sequence)
- Code patterns (Convex queries/mutations, React components)
- Authentication methods (6 approaches)
- File structure and installation folders
- Performance metrics and deployment
- AI specialist cascade description

**Use case:** Complete platform reference for AI agents or developers.

## Google's Assessment: The Reality Check

**Here's where we get honest.**

According to John Mueller (Google), llms.txt has significant limitations:

### The Core Issues

**1. Self-Reported Metadata**

Mueller compared llms.txt to the deprecated **keywords meta tag**:

> "This is what a site-owner claims their site is about... (Is the site really like that? well, you can check it. At that point, why not just check the site directly?)"

**Translation:** It's what you *say* your site does, not necessarily what it *actually* does.

**2. Verification Required Anyway**

If AI bots need to verify the content matches the llms.txt claims (which they do), the extra step becomes redundant. They might as well crawl the actual site.

**3. Spam/Cloaking Risk**

The system creates opportunities for mismatched content—essentially **cloaking for AI systems**. Your llms.txt could claim one thing while your actual site does something else entirely.

**4. Zero Adoption**

Mueller noted: **"Major AI services haven't adopted it."**

Server logs show bots aren't checking for it. OpenAI, Anthropic, Google—none have publicly integrated llms.txt into their crawling.

## Why We Created Them Anyway

Despite these limitations, we still created both files. Here's why:

### 1. Documentation Clarity

**Writing the llms.txt forced us to distill:**
- Core concepts to their essence
- Architecture to fundamental patterns
- Workflow to concrete steps

Even if AI bots don't use it, **the exercise clarifies thinking.**

### 2. Human Reference

The comprehensive version (`llms-full.txt`) serves as a **single-file platform reference** for:
- Developers onboarding to ONE
- AI assistants helping developers (Claude Code, GitHub Copilot)
- Documentation verification (does our claim match reality?)

### 3. Transparency Test

**If our llms.txt mismatches our codebase, we have a problem.**

Creating it forces alignment between:
- What we say we do (llms.txt)
- What our docs claim (one/*.md)
- What our code actually does (web/*, backend/*)

### 4. Future-Proofing

**Maybe adoption comes later.**

If major AI providers eventually implement llms.txt (OpenAI ChatGPT search, Google AI Overviews, Anthropic Claude), we're ready.

**But we're not betting on it.**

## Our Implementation: Transparent Disclaimers

Both files include **explicit warnings:**

```markdown
## Note on AI Training & llms.txt

This file follows the **llmstxt.org standard**. Per Google's November 2024
assessment (via John Mueller):
- llms.txt is "self-reported metadata" comparable to deprecated keywords meta tags
- Major AI services haven't adopted it yet
- Such files can enable cloaking/spam if content mismatches actual site
- Bots must verify content anyway, making the extra step potentially redundant

**Recommendation:** Use this file as a reference, but always verify against:
- Actual source code in the repository
- Running code at https://one.ie
- Documentation in `/one/*` directory
- Live API behavior in `backend/convex/`
```

**Why the disclaimer?**

Because **truth matters more than hype.**

## What Actually Helps AI Understand Your Site

Based on Google's feedback and real-world AI crawling behavior, here's what **actually works:**

### 1. Semantic HTML

```html
<!-- Good: AI understands structure -->
<article>
  <h1>Title</h1>
  <p>Content</p>
</article>

<!-- Bad: AI confused -->
<div class="article">
  <div class="title">Title</div>
  <div class="content">Content</div>
</div>
```

### 2. Structured Data

```html
<!-- JSON-LD for products, articles, organizations -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "ONE Platform",
  "description": "AI-native platform..."
}
</script>
```

### 3. Clean URLs

```
✅ one.ie/products/courses
✅ one.ie/docs/architecture
❌ one.ie/index.php?page=products&id=123
```

### 4. Readable Content

**AI bots parse actual content.** If your documentation is clear, comprehensive, and well-structured, bots will understand it.

**Our approach:**
- 41 markdown files in `/one/*`
- Organized by 6-dimension ontology
- Semantic HTML throughout
- Structured data on key pages

**Result:** AI understands ONE from actual content, not llms.txt.

## Real-World Utility: Mixed

### Where llms.txt Helps

**1. Internal Documentation**

Our `llms-full.txt` is **actually useful for humans** as a single-file reference. Developers can read it top-to-bottom to understand the entire platform.

**2. AI Assistant Context**

When using Claude Code, GitHub Copilot, or ChatGPT to help with ONE Platform code, pasting `llms-full.txt` provides **complete context in one shot**.

**3. Alignment Check**

Comparing llms.txt claims against actual code reveals **documentation drift**. If they mismatch, something's wrong.

### Where llms.txt Fails

**1. Zero Bot Adoption**

Check server logs: no major bots request `/llms.txt`. They rely on traditional crawling.

**2. No SEO Benefit**

Google doesn't use it for ranking. Structured data + semantic HTML work better.

**3. Maintenance Burden**

Every architectural change requires updating llms.txt, docs, and code. **Triple maintenance for zero measurable benefit.**

## Should You Create llms.txt?

**Honest recommendation:**

### Create it if:

✅ You want to clarify your platform's core concepts (writing exercise)
✅ You need a single-file reference for AI assistants (Claude Code, etc.)
✅ You want to test documentation alignment (claim vs. reality)
✅ You're future-proofing (maybe adoption comes later)

### Skip it if:

❌ You expect immediate SEO benefits (won't happen)
❌ You think bots will use it today (they won't)
❌ You can't maintain it (outdated llms.txt worse than none)
❌ Your documentation is already excellent (focus there instead)

## Our Takeaway

**llms.txt is a documentation exercise, not a breakthrough.**

**What we learned:**
1. Writing it forced architectural clarity
2. The comprehensive version has human utility
3. But bots don't use it yet (maybe ever)
4. Traditional SEO + structured data work better

**What we recommend:**
1. Focus on **great documentation** in `/one/*`
2. Use **semantic HTML** throughout your site
3. Add **structured data** (JSON-LD) for key entities
4. Create **clean URLs** and sitemaps
5. *Optionally* create llms.txt for internal reference

## Try It Yourself

**View our implementations:**
- Minimal: https://one.ie/llms.txt
- Full: https://one.ie/llms-full.txt

**Source files:**
- `/llms.txt` (250 lines)
- `/llms-full.txt` (800+ lines)

**Compare against:**
- Live site: https://one.ie
- Documentation: `/one/*` (41 files)
- Source code: https://github.com/one-ie

**Question to ask:** Does llms.txt match reality?

## Key Takeaways

1. 📝 **llms.txt is a proposed standard** for AI-readable documentation
2. 🚫 **Google says it's comparable to keywords meta tag** (deprecated, self-reported)
3. 🤖 **Major AI services haven't adopted it** (zero bot requests in logs)
4. ✅ **We created both versions anyway** (documentation exercise + human reference)
5. ⚠️ **We included transparent disclaimers** (truth over hype)
6. 🎯 **Real SEO value comes from** semantic HTML, structured data, great content
7. 📚 **Primary utility:** Single-file reference for AI assistants and onboarding
8. 🔮 **Maybe useful later** if major providers adopt (but don't bet on it)

## Further Reading

- **llmstxt.org** - Official standard specification
- **Google's Assessment** - https://www.searchenginejournal.com/google-says-llms-txt-comparable-to-keywords-meta-tag/544804/
- **ONE Documentation** - `/one/knowledge/` (41 comprehensive files)
- **Structured Data Guide** - https://schema.org

---

**The Bottom Line:** llms.txt is interesting but unproven. We created it for documentation clarity and potential future use, but we're **transparent about its limitations**. Focus on great content, semantic HTML, and structured data—those work today.

**Try our implementation:** https://one.ie/llms.txt

🚀 **[Get Started with ONE](/download)** | 📖 **[Read the Docs](/docs)** | 💬 **[Join Discord](/discord)**
