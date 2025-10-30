# News Curation System - Quick Start

**Speed:** 7-10 minutes from topic request to published article
**Quality:** 2-3 carefully curated articles per session
**Feedback:** Real-time improvement based on user input

---

## How It Works (5 Simple Steps)

### 1️⃣ **You Ask for News Topic**
```
User: "I want news about AI agents and multi-agent systems"
```

Agent asks clarifying questions:
- "Any specific angle? (building, research, business, deployment)"
- "How technical should it be?"
- "Any platforms you want to focus on?"

### 2️⃣ **Agent Searches the Web**
```
Search: "AI agents multi-agent systems news 2025"
         "Agent architecture breakthroughs"
         "Multi-agent deployment patterns"
```

Returns ranked list (top 5-10 sources):
- OpenAI Blog (95% relevant)
- Anthropic Research (92% relevant)
- Hacker News (75% relevant)
- Dev.to (70% relevant)
- Medium (65% relevant)

### 3️⃣ **Agent Crawls Top Articles**
For each source:
- Fetch full article content
- Extract key points (3-5 bullets)
- Check relevance (must be > 60/100)
- Grab image if available

Typical decision: Include top 3-5 articles that meet relevance threshold

### 4️⃣ **Agent Rewrites in Your Voice**
Takes original article and rewrites:
- Shorter, punchier headlines
- Emphasis on "why it matters" to ONE Platform
- Platform terminology used naturally
- Practical implications highlighted
- Original source linked

**Voice:** Professional, knowledgeable, helpful (not sensational)

### 5️⃣ **You Review & Approve**
Agent shows you the draft:
```markdown
---
title: "AI Agents Getting Smarter at Multi-Step Reasoning"
description: "..."
date: 2025-10-30
category: AI
relevanceScore: 85
---

[Article content]
```

**You choose:**
- ✅ **Publish** - Great! Goes live immediately
- ✏️ **Edit** - Give specific feedback for improvement
- ❌ **Skip** - Not the right fit, try next one

**Quick Feedback:**
- "This is great! Style like this going forward"
- "Too technical, make it more business-focused"
- "Love this one!"

---

## File Structure

```
web/src/
├── content/
│   └── news/
│       ├── 2025-10-30-ai-agents-breakthrough.md
│       ├── 2025-10-28-astro-5-released.md
│       └── [more articles...]
└── pages/
    └── news/
        └── index.astro  ← Displays all news articles
```

## Content Collection Schema

```yaml
title: String (required)
description: String (required)
date: Date (required)
author: String (default: "ONE News")
category: AI | Platform | Technology | Business | Community
source: String (optional - original URL)
tags: String[] (optional)
image: String (optional - image URL)
draft: Boolean (default: false)
readingTime: Number (optional - minutes)
featured: Boolean (default: false)
relevanceScore: Number (0-100)
```

---

## Writing Style Guide

### ONE Platform Voice

✅ **Write like this:**
> "AI agents are getting better at multi-step reasoning. This matters for ONE Platform because our architecture is fundamentally agent-driven. As agents improve at coordinating across the 6-dimension ontology..."

❌ **Don't write like this:**
> "SHOCKING: AI agents undergo MAJOR TRANSFORMATION. Industry observers are STUNNED by the new capabilities..."

### Structure

1. **Headline** - Clear, benefit-focused
2. **What Happened** - 2-3 sentences of context
3. **Why It Matters** - Connection to ONE Platform/users
4. **Key Points** - 3-5 bullets of actionable insight
5. **Read More** - Link to original source

### Tone

- **Clear** - Explain complex topics simply
- **Direct** - Get to the point quickly
- **Practical** - Focus on implications, not just news
- **Balanced** - Report facts, not hype
- **Helpful** - Assume reader wants to apply this

---

## Speed Checklist

| Step | Time | Checklist |
|------|------|-----------|
| **Ask & Clarify** | 1 min | ✅ Understand topic, angle, depth |
| **Search Web** | 1-2 min | ✅ Find 10+ sources, rank top 5 |
| **Crawl Articles** | 2-3 min | ✅ Read abstracts, check relevance |
| **Evaluate** | 1 min | ✅ Pick best 3-5 articles (>60 score) |
| **Rewrite 1st** | 2-3 min | ✅ Original → ONE voice, preview |
| **Approve & Publish** | 1 min | ✅ You approve, file created |
| **Get Feedback** | < 1 min | ✅ "How was that? Any improvements?" |
| **TOTAL** | **7-10 min** | ✅ Live on `/news` page |

---

## Quality Targets

### Relevance Score (0-100)

```
90-100: Direct to ONE Platform, ontology, architecture
70-90:  Adjacent (AI, infrastructure, web dev)
50-70:  Interesting but tangential
<50:    Archive or skip
```

Target: **Publish articles with 70+ relevance score**

### Reading Time

- **Best:** 3-5 minutes
- **Min:** 2 minutes
- **Max:** 8 minutes

---

## Feedback Loop

### After Publishing

**Ask User:**
1. "How was the writing quality? (1-5 stars)"
2. "Anything to improve next time?"
3. "Should I find more like this?"

**Collect Feedback:**
- Quality rating (→ improves writing style)
- Style preferences (→ technical/business/creative)
- Topic interests (→ topics to focus on)
- Length/depth preferences (→ article structure)

### Improve Next Batch

**Remember preferences:**
- If user gives 5 stars on technical article → write more technical
- If feedback: "too long" → shorter articles next time
- If interested in AI → prioritize AI topics

**Track performance:**
- Which topics get most engagement?
- Which writing styles resonate?
- Which sources are most reliable?

---

## Commands to Use

```bash
# Start news curation
/news "AI agents"

# Multiple topics at once
/news "AI agents, Astro, DevOps"

# Check recent articles
/news-check

# Get feedback on writing
/news-feedback "Great article! Love the practical angle"

# Configure preferences
/news-settings

# See all published news
/news-list

# Archive old articles
/news-archive [date]
```

---

## Example: Complete Workflow

**You:** "I want news about AI agents"

**Agent:**
> Great! A few quick questions:
> - Any specific angle? (research/tools/deployment/business)
> - How technical? (beginner/intermediate/advanced)
> - How long should articles be? (quick/medium/deep)

**You:** "Research and deployment, intermediate, medium length"

**Agent:**
> Searching for AI agent news...
>
> Found 15 relevant articles. Top 5:
> 1. OpenAI Blog - "Agent Tools Release" (95%)
> 2. Anthropic - "Constitutional AI Advances" (92%)
> 3. Hacker News - "Agent Discussion Thread" (78%)
> 4. Dev.to - "Building Agents" (72%)
> 5. Medium - "Agent Architecture" (68%)
>
> Crawling top articles...
>
> ## Preview
>
> **Title:** "AI Agents Get Better at Multi-Step Reasoning"
>
> *[article preview]*
>
> Ready to publish? (Yes/Edit/Skip)

**You:** "Yes"

**Agent:**
> ✅ Published: `/news/2025-10-30-ai-agents-breakthrough.md`
>
> Quality feedback? (1-5 stars, comments)

**You:** "5 stars! Love the practical angle connecting to ONE"

**Agent:**
> 🎯 Noted! Will write more articles connecting to platform architecture.
>
> Want another topic? Or more about AI agents?

---

## Tips for Best Results

1. **Be Specific** - "AI agents" not just "AI"
2. **Mix Breadth & Depth** - 1-2 deep dives, 2-3 quick updates per session
3. **Regular Feedback** - Quality ratings help improve future articles
4. **Check Results** - Visit `/news` page to see published articles
5. **Share Favorites** - Link people to articles that resonate

---

## Troubleshooting

**Q: Articles taking too long?**
A: Agent is crawling too many sources. Ask for "top 3 articles" instead of "all relevant articles"

**Q: Articles not relevant enough?**
A: Provide more specific topic. Instead of "technology", try "web development frameworks" or "cloud infrastructure"

**Q: Writing style off?**
A: Provide immediate feedback. "Less technical" / "More business-focused" helps agent calibrate

**Q: Want different length?**
A: Tell agent upfront. "Quick 2-min reads" vs "Deep 5-min dives" changes structure

---

## Next Level

Once you're comfortable with basic curation:

- **Batch Processing** - "Give me 5 articles on different AI topics"
- **Auto-Publish** - Mark certain sources as "always publish" (lower review)
- **Email Digest** - Weekly newsletter of curated news
- **Trending Topics** - Agent identifies what's trending, you approve
- **Multi-language** - Translate articles to other languages

---

**Bottom Line:** 7-10 minutes to curated, published news article in your voice. Fast feedback loop for continuous improvement. Start simple, scale as you like.

Get started: `/news "your topic"`
