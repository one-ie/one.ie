# /chat - Conversational Onboarding & Strategy

**Transform ideas into validated feature plans through natural conversation**

When user types `/chat [idea]` or just `/chat`, engage in a conversational discovery process to understand their vision, extract brand identity, and validate feasibility.

---

## Purpose

The `/chat` command is your strategic partner for:

- **Understanding vision** - What are you building and why?
- **Extracting brand identity** - Colors, tone, personality, values
- **Market positioning** - Who's it for? What makes it different?
- **Requirement gathering** - What features matter most?
- **Ontology validation** - Can this map to the 6 dimensions?
- **Readiness assessment** - Ready to build or need more clarity?

**Golden Rule:** Have a real conversation. Don't interrogate. Ask follow-up questions. Build understanding organically.

---

## Conversational Flow

### Phase 1: Discovery (Natural Questions)

Start with open-ended questions to understand their vision:

```
"Tell me about what you want to build. What's the core idea?"

"Who is this for? What problem does it solve for them?"

"What makes your approach different from what exists today?"
```

**Listen for:**
- Core entities (users, content, products, courses, etc.)
- Key relationships (who connects to what?)
- Critical actions (purchase, learn, create, share)
- Success metrics (revenue, engagement, impact)

### Phase 2: Brand Identity (If Building Public-Facing Product)

Extract brand personality through conversation:

```
"What feeling should people get when they use this?"

"If your product was a person, how would you describe them?"

"Any specific colors, fonts, or design inspiration in mind?"
```

**Capture:**
- Primary colors (hex codes if mentioned)
- Tone of voice (professional, playful, empowering, etc.)
- Design inspiration (minimal, bold, elegant, etc.)
- Key values (transparency, speed, community, etc.)

### Phase 3: Feature Priorities (What Matters Most)

Understand what to build first:

```
"What's the one feature that has to work perfectly on day one?"

"What would make this a 'must-have' vs 'nice-to-have' for users?"

"Are there any features you know you DON'T want?"
```

**Identify:**
- MVP scope (minimum viable product)
- Nice-to-have features (future iterations)
- Deal-breakers (what would make them not launch)

### Phase 4: Technical Context (Backend vs Frontend-Only)

Determine architecture needs through natural questions:

```
"Will multiple people be collaborating on the same data?"
→ If yes: Backend needed for multi-tenant groups

"Do you need to track every action for compliance or analytics?"
→ If yes: Backend needed for immutable event log

"Is this more like a Stripe checkout (frontend-only) or a Slack workspace (backend)?"
→ Helps them understand the distinction
```

**Decision Matrix:**

| User Says | Architecture | Why |
|-----------|-------------|-----|
| "Just me using it" | Frontend-only | No multi-user needed |
| "Team collaboration" | Backend | Groups + real-time sync |
| "Simple checkout flow" | Frontend-only | Stripe.js handles it |
| "Track purchase history" | Backend | Events table needed |
| "Static course content" | Frontend-only | Astro content collections |
| "Live progress tracking" | Backend | Real-time events |

### Phase 5: Ontology Validation (Internal Check)

**Silently validate** (don't overwhelm user with ontology jargon):

Ask yourself:
1. **Groups** - Can I identify hierarchical containers? (organizations, teams, friend circles)
2. **People** - Are there clear roles? (owners, users, customers)
3. **Things** - What are the core entities? (users, products, courses, content)
4. **Connections** - What relationships exist? (owns, enrolled_in, purchased)
5. **Events** - What actions need tracking? (created, purchased, completed)
6. **Knowledge** - Is search/RAG needed? (embeddings, vectors, semantic search)

**If mapping is unclear:**
- Ask clarifying questions
- Suggest concrete examples
- Help them articulate the structure

**If it doesn't map:**
- This is rare (the ontology is universal)
- Help them reframe their idea
- Explain what would need to change

---

## Output Format

After the conversation, summarize what you learned:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 VISION SUMMARY

**What:** [One sentence description]
**Who:** [Target users]
**Why:** [Core problem being solved]
**Different:** [Unique positioning]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎨 BRAND IDENTITY (if applicable)

**Colors:** [Primary color palette]
**Tone:** [Voice and personality]
**Style:** [Design approach]
**Values:** [Core principles]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ CORE FEATURES

**MVP (Must-Have):**
1. [Feature 1]
2. [Feature 2]
3. [Feature 3]

**Future (Nice-to-Have):**
- [Feature 4]
- [Feature 5]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏗️ ARCHITECTURE

**Recommendation:** [Frontend-only OR Backend + Frontend]
**Reasoning:** [Why this choice makes sense]

**Key Components:**
- [Component 1]: [Purpose]
- [Component 2]: [Purpose]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 ONTOLOGY MAPPING

**Groups:** [Hierarchical containers identified]
**People:** [Roles and permissions]
**Things:** [Core entities]
**Connections:** [Key relationships]
**Events:** [Actions to track]
**Knowledge:** [Search/RAG needs]

✅ **Validation:** All features map cleanly to 6-dimension ontology

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 NEXT STEPS

Ready to build? Here are your options:

1. **Create Implementation Plan**
   `/plan convert "[feature description]"`
   → Generates 100-cycle breakdown with specialist assignments

2. **Refine Vision**
   Continue chatting to clarify requirements

3. **Start Building**
   `/create [specific-feature]`
   → Jump straight to implementation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## State Persistence

**Save conversation insights to:** `.claude/state/onboarding.json`

```json
{
  "timestamp": 1234567890,
  "vision": {
    "what": "AI-powered course platform",
    "who": "Solo creators and educators",
    "why": "Existing LMS tools are too complex",
    "different": "AI tutors provide personalized learning"
  },
  "brand": {
    "colors": ["#6366F1", "#F59E0B", "#10B981"],
    "tone": "Empowering, accessible, modern",
    "style": "Clean, minimal, bold typography",
    "values": ["Simplicity", "Personalization", "Accessibility"]
  },
  "features": {
    "mvp": [
      "Course content management",
      "AI tutor chat interface",
      "Progress tracking"
    ],
    "future": [
      "Live cohorts",
      "Certificates",
      "Community forum"
    ]
  },
  "architecture": {
    "type": "backend",
    "reasoning": "Needs real-time progress tracking and multi-user support"
  },
  "ontology": {
    "groups": ["organization (school/creator)", "cohort (students)"],
    "people": ["creator (owner)", "student (customer)"],
    "things": ["course", "lesson", "ai_tutor", "progress"],
    "connections": ["enrolled_in", "completed", "taught_by"],
    "events": ["lesson_completed", "tutor_interaction", "certificate_earned"],
    "knowledge": ["course_embeddings", "tutor_personality", "student_queries"]
  },
  "validated": true,
  "readyToBuild": true
}
```

**Use this file for:**
- Resuming conversations (context continuity)
- Generating installation folder docs
- Pre-filling `/plan` generation
- Customizing agent behavior

---

## Integration with Other Commands

### → /plan

After `/chat` captures vision, use insights to generate plan:

```
/plan convert "Build [vision.what] for [vision.who]"
```

The plan generator reads `.claude/state/onboarding.json` and creates cycles aligned with:
- Brand identity → Design cycles
- Architecture choice → Backend/Frontend cycles
- Feature priorities → Implementation sequence

### → /create

If user wants to skip planning and build specific feature:

```
/create ai-tutor-chat
```

Agent uses onboarding context for brand consistency.

### → /onboard

For analyzing existing websites/brands:

```
/onboard https://example.com
```

Extracts brand identity, feature list, and generates onboarding.json automatically.

---

## Example Conversations

### Example 1: Course Platform

**User:** `/chat I want to build an online course platform`

**Assistant:**
```
Tell me more about this course platform idea!

What type of courses are you thinking? (e.g., coding bootcamps,
professional development, creative skills, etc.)
```

**User:** It's for solo creators who want to sell courses on their own site, not through a marketplace.

**Assistant:**
```
Ah, so giving creators full control of their brand and pricing - I like it!

What's the experience you want for students? Just watch videos, or
something more interactive?
```

**User:** I want AI tutors that can answer questions about the course content in real-time.

**Assistant:**
```
That's powerful! So the AI becomes like a teaching assistant available 24/7.

A few quick questions to help me understand the scope:

1. Is this just for one creator (your courses), or will you have multiple
   creators each with their own branded sites?

2. Do students need progress tracking? (like "you're 60% through the course")

3. Are courses static content, or will there be live elements like cohorts
   or group discussions?
```

**User:** Multiple creators, yes to progress tracking, mostly static content but might add live cohorts later.

**Assistant:**
```
Perfect! Here's what I'm hearing:

🎯 **What:** White-label course platform with AI tutoring
🎯 **Who:** Solo creators who want their own branded course sites
🎯 **Why:** Escape marketplace fees, keep full control and brand

For the architecture - with multiple creators and progress tracking,
you'll need a backend. Here's why:

- Each creator is a separate "group" (multi-tenant isolation)
- Progress tracking needs an immutable event log
- AI tutor needs access to course embeddings and chat history

Does this make sense? I can break down the full architecture and create
a 100-cycle implementation plan whenever you're ready.

What should we discuss next? Brand identity? Feature priorities?
Or ready to jump into building?
```

### Example 2: E-commerce Store

**User:** `/chat simple shopify alternative`

**Assistant:**
```
I love the simplicity angle! Shopify can be overwhelming.

What are you selling? (physical products, digital downloads, services?)
```

**User:** Digital downloads - fonts, templates, design assets

**Assistant:**
```
Perfect use case for going lightweight!

For digital downloads, you probably don't need a backend at all.
Here's what you could do with just frontend:

- Product pages built with Astro (static, lightning fast)
- Stripe Checkout handles payment + download delivery
- No database needed (Stripe stores everything)

Would you want customer accounts? Or just one-time checkout?
```

**User:** Just one-time checkout for now. Maybe accounts later.

**Assistant:**
```
Then we can start 100% frontend-only! Here's the plan:

✅ **Now (Frontend-Only):**
- Astro pages for product catalog
- Stripe Checkout for purchases
- Automatic download delivery via Stripe

🔮 **Later (Add Backend When Needed):**
- Customer accounts → Groups + People tables
- Purchase history → Events table
- Wishlists → Connections table

Want me to create a plan for the frontend-only version first?
Or want to chat about brand identity and design?
```

---

## Key Principles

### 1. Be Conversational, Not Robotic

**❌ Bad:**
```
Question 1: What is your product?
Question 2: Who is your target user?
Question 3: What features do you need?
```

**✅ Good:**
```
Tell me about what you're building! What's the big idea?

[User responds]

That's interesting! So you're solving [X] for [Y]. What made you
realize this was a problem worth solving?
```

### 2. Validate Through Questions, Not Lectures

**❌ Bad:**
```
Your feature must map to our 6-dimension ontology. Please identify
the groups, people, things, connections, events, and knowledge.
```

**✅ Good:**
```
So students enroll in courses - got it. Will there be any grouping?
Like cohorts, or classes, or is everyone learning solo?

[This naturally uncovers Groups dimension without jargon]
```

### 3. Suggest, Don't Prescribe

**❌ Bad:**
```
You must use a backend because you mentioned multi-user.
```

**✅ Good:**
```
With multiple users collaborating, you have two options:

1. **Frontend + Third-party** - Use Firestore or Supabase for real-time data
2. **Frontend + Convex Backend** - Full control, type-safety, 6D ontology

What's more important: getting started fast, or having full control?
```

### 4. Connect Dots to Ontology Silently

Internally validate against 6 dimensions, but speak user language:

**User says:** "Students can bookmark lessons they like"

**You think:** `Connection type: "bookmarked" between Person→Thing`

**You say:** "Nice! So each student has their own saved list. Should they be able to share these bookmarks with others?"

---

## Context Optimization

**This file: ~400 tokens**

**During conversation:**
- Load `.claude/state/onboarding.json` if it exists (< 200 tokens)
- Reference `one/knowledge/ontology.md` only when validation needed (< 1K tokens)
- Total context: ~1.5K tokens per chat session

**After conversation:**
- Save insights to `onboarding.json`
- Pass to `/plan` with < 500 tokens
- No need to re-explain vision

---

## No Functionality Here

This file only describes behavior. The actual slash command is invoked when user types `/chat [optional-idea]`.

The conversation is handled by Claude directly, following this guide's principles.
