# ONE Platform News System

Fast, feedback-driven news curation system that turns your interests into published articles in 7-10 minutes.

## What's New

✅ **Content Collection** - `web/src/content/news/` for Astro content API
✅ **News Page** - `/news/` displays all published articles with filtering
✅ **News Agent** - Asks questions, searches web, rewrites in your voice
✅ **Sample Articles** - 2 examples showing the format and voice
✅ **Quick Start Guide** - Step-by-step workflow with timing

## Files Created

```
web/src/
├── content/
│   └── config.ts (updated - added news collection)
│       └── news/ (new)
│           ├── 2025-10-30-ai-agents-breakthrough.md
│           └── 2025-10-28-astro-5-released.md
│
└── pages/
    └── news/
        └── index.astro (new)

.claude/agents/
├── agent-news.md (new - full agent specification)
├── NEWS-QUICKSTART.md (new - quick reference)
└── NEWS-README.md (this file)
```

## Quick Start

### For Users (You)

```bash
# Start curation workflow
/news "AI agents"

# Agent will:
1. Ask clarifying questions (30 sec)
2. Search web for sources (1-2 min)
3. Crawl top articles (2-3 min)
4. Rewrite in your voice (2-3 min)
5. Show preview & ask approval (1 min)
6. Publish to /news page & get feedback (< 1 min)

# Total time: 7-10 minutes to published article
```

### For Claude Code

The agent (`agent-news.md`) provides:
- **Input:** Topic request + user preferences
- **Process:** Web search → crawl → evaluate → rewrite → publish
- **Output:** Markdown file in `web/src/content/news/`
- **Feedback:** Quality ratings to improve future articles

## System Architecture

### Content Collection (Astro)

```typescript
// Type-safe schema for news articles
interface NewsArticle {
  title: string;
  description: string;
  date: Date;
  author: string;
  category: 'AI' | 'Platform' | 'Technology' | 'Business' | 'Community';
  source?: string; // Original article URL
  tags: string[];
  image?: string;
  draft: boolean;
  readingTime?: number;
  featured: boolean;
  relevanceScore: number; // 0-100
  // Content in markdown body
}
```

### News Page (`/news/`)

- ✅ Featured articles at top
- ✅ Articles grouped by category
- ✅ Filtering, sorting, tags
- ✅ Reading time estimates
- ✅ Relevance scores shown
- ✅ Links to original sources
- ✅ Dark mode support

### News Agent Workflow

```
1. ASK & UNDERSTAND
   └─ What topics? How technical? What angle?

2. SEARCH WEB
   └─ Find 10+ sources, rank by relevance

3. RANK SOURCES
   └─ 90-100: Direct relevance
   └─ 70-90: Adjacent (AI, infrastructure)
   └─ 50-70: Interesting but tangential
   └─ <50: Archive

4. CRAWL & EVALUATE
   └─ Get full content, check quality, relevance > 60?

5. REWRITE
   └─ Original voice → ONE Platform voice
   └─ Add "why it matters" section
   └─ Keep practical angle

6. PREVIEW & APPROVE
   └─ You review, approve, edit, or skip

7. PUBLISH
   └─ Create markdown file in web/src/content/news/

8. FEEDBACK
   └─ Quality rating + preferences for next batch
```

## Writing Style

### What We Write

✅ Clear explanations of complex topics
✅ Connection to ONE Platform and users
✅ Practical implications
✅ Original sources linked
✅ Professional, knowledgeable tone

### What We Avoid

❌ Sensationalism or clickbait
❌ Unverified claims
❌ Oversimplification
❌ Self-promotion
❌ Academic jargon
❌ Unsourced statements

### Tone

- **Conversational** - Like talking to a knowledgeable friend
- **Helpful** - Focus on "how does this help me?"
- **Balanced** - Report facts, not opinions
- **Concise** - Scannable paragraphs, bullet points

## Key Features

### Speed
- **7-10 minutes** from topic request to published article
- **Parallel workflow** - Search while user answers questions
- **Smart evaluation** - Only publish relevance > 60

### Quality
- **Hand-curated** - You approve before publishing
- **Your voice** - Rewritten in ONE Platform style
- **Fact-checked** - Links to original sources
- **Relevant** - Filtered for platform connection

### Feedback Loop
- **Quality ratings** - Improve writing with each article
- **Preference learning** - Remember your style choices
- **Performance tracking** - See which topics resonate
- **Continuous improvement** - Better articles over time

## Examples

### Article 1: AI Agents
```
Title: "AI Agents Are Getting Smarter at Multi-Step Reasoning"
Category: AI
Relevance: 85%
Length: 4 min read
Featured: Yes
```

**Why published:**
- Direct relevance to ONE Platform (agent-driven architecture)
- Practical implications (multi-step coordination)
- High quality writing
- User approval

### Article 2: Astro 5
```
Title: "Astro 5 Ships with Streaming SSR and Edge Runtime Improvements"
Category: Platform
Relevance: 88%
Length: 5 min read
Featured: No
```

**Why published:**
- Direct impact (ONE is built on Astro 5)
- Performance improvements benefit platform
- Actionable (Astro version updates)
- User approval

## Using the News Page

### View All News
```
http://localhost:4321/news
```

### By Category
Articles automatically grouped:
- **AI** - Machine learning, agents, reasoning
- **Platform** - Astro, Convex, tools we use
- **Technology** - Web dev, infrastructure, performance
- **Business** - Platform economics, startups
- **Community** - User stories, integrations

### Filter & Search
- By tags
- By date (newest first)
- By reading time
- Relevance score
- Featured articles

## Integration with ONE Platform

### How News Connects to Ontology

**Things:** News articles are `thing_type: 'news_article'`
- `properties.source` - Original URL
- `properties.relevanceScore` - Platform relevance
- `properties.content` - Article markdown

**Connections:** Links to related topics
- `published_by` → person (NEWS agent/curator)
- `references` → other news/articles
- `category_of` → category (AI, Platform, etc.)

**Events:** Track news activity
- `news_published` - Article went live
- `news_viewed` - User read article
- `news_shared` - User shared article
- `feedback_given` - Quality rating submitted

**Knowledge:** RAG for news search
- Articles chunked and embedded
- Vector search for semantic matching
- Recommendations based on reading history

### Future Integration

1. **Convex Backend** - Store articles, track reads, comments
2. **Email Digest** - Weekly newsletter of curated news
3. **Feeds** - Subscribe by category/tag
4. **Analytics** - Which articles perform best
5. **Notifications** - Alert on new articles in topic
6. **AI Summaries** - One-paragraph summaries for scanning
7. **Multi-language** - Translate to 5+ languages

## Getting Started

### 1. Run the Dev Server
```bash
cd web
bun run dev
# Visit http://localhost:4321/news
```

### 2. Start Your First Curation
```bash
/news "AI agents"
```

### 3. Follow the Workflow
- Answer agent's questions (30 sec)
- Review search results (1-2 min)
- Read article preview (1 min)
- Approve & publish (1 min)

### 4. Give Feedback
- Rate quality (1-5 stars)
- Comment on writing style
- Suggest topics

### 5. Iterate
- Agent learns your preferences
- Each article better than last
- Build library of great content

## Commands

```bash
/news "topic"           # Start curation
/news-batch "a,b,c"    # Multiple topics
/news-check            # View recent articles
/news-list             # All published news
/news-settings         # Configure preferences
/news-feedback "msg"   # Give feedback
/news-archive [date]   # Archive old articles
```

## Documentation

- **agent-news.md** - Complete agent specification with workflow
- **NEWS-QUICKSTART.md** - Quick reference for users
- **NEWS-README.md** - This file

## Success Metrics

### Performance
- ✅ 7-10 min to publish
- ✅ 2-3 articles per session
- ✅ User approval rate > 90%

### Quality
- ✅ Average relevance score > 75
- ✅ User rating > 4/5 stars
- ✅ Original sources always linked
- ✅ Factually accurate

### Engagement
- ✅ Readers visit `/news` regularly
- ✅ Articles shared in community
- ✅ Feedback shapes future topics
- ✅ Growing library of content

## Philosophy

**Keep it simple and fast:**
- One question at a time
- Quick feedback loop
- Ship first, iterate with user input
- Focus on quality over quantity
- Publish 2-3 great articles/week

**Build on strong foundation:**
- Use Astro content collections (proven)
- Follow ONE Platform voice (consistent)
- Link to original sources (credible)
- Explain platform relevance (valuable)
- Iterate based on feedback (improving)

**Think long-term:**
- Build library of evergreen content
- Each article improves your voice
- Community learns from curated news
- Positions ONE as knowledgeable resource

---

**Status:** ✅ Ready to use
**Created:** 2025-10-30
**Next:** Start first news curation → `/news "your topic"`
