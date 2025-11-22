# AI Chat Funnel Builder - Documentation

**Complete documentation for creating high-converting sales funnels through AI conversation.**

Version: 1.0.0
Last Updated: 2025-11-22
Status: Complete

---

## Quick Links

**For Users:**
- [User Guide](./user-guide.md) - Step-by-step tutorials for all features
- [FAQ](./faq.md) - Common questions and answers
- [Troubleshooting](./troubleshooting.md) - Solve common issues

**For Developers:**
- [API Reference](./api-reference.md) - REST API and webhook documentation
- [Feature Specification](/one/things/features/3-1-ai-funnel-builder.md) - Technical implementation details

---

## What is the AI Chat Funnel Builder?

The AI Chat Funnel Builder creates complete sales funnels through natural conversation. Instead of manually configuring pages in a drag-and-drop builder, you describe what you're selling and the AI guides you through template selection, customization, and publishing.

**Key benefits:**
- **10-20 minute setup** (vs 2-8 hours with traditional builders)
- **AI-optimized templates** (proven conversion rates)
- **No technical skills required** (AI handles configuration)
- **Built-in analytics** (track every visitor and conversion)

---

## Documentation Structure

### 1. User Guide ([user-guide.md](./user-guide.md))

**Comprehensive guide for end users.**

**Topics covered:**
- Quick start (3-step funnel creation)
- Getting started (account setup, access)
- 5-stage conversation flow (Discovery → Template → Customization → Build → Publish)
- 7 funnel templates (with conversion rates and use cases)
- Customizing funnels (colors, branding, content)
- Publishing process (domains, tracking, payments)
- Analytics dashboard (metrics, visualization, exports)
- Common use cases (courses, products, lead magnets, coaching)

**Best for:** First-time users, learning the platform

**Read time:** 30 minutes

### 2. API Reference ([api-reference.md](./api-reference.md))

**Complete REST API and webhook documentation.**

**Topics covered:**
- Authentication (API keys, scopes)
- All endpoints (funnels, steps, elements, analytics, forms)
- Webhooks (events, payloads, verification)
- Data models (TypeScript interfaces)
- Error handling (status codes, error types)
- Rate limits (100 req/min, 10k req/day)
- Code examples (cURL, JavaScript, Python)

**Best for:** Developers integrating with external tools

**Read time:** 45 minutes

### 3. FAQ ([faq.md](./faq.md))

**Frequently asked questions organized by topic.**

**Categories:**
- General questions (What is it? How is it different? Cost?)
- Technical questions (Tech stack, data storage, API access)
- Funnel creation (Time to create, templates, customization)
- Publishing (Process, previews, custom domains)
- Analytics (Metrics, accuracy, exports)
- Payments (Stripe integration, refunds, fees)
- Troubleshooting (Quick fixes for common issues)
- Billing (Pricing, upgrades, cancellation)
- Support (Channels, response times, training)

**Best for:** Quick answers to specific questions

**Read time:** 10-15 minutes (skim to your question)

### 4. Troubleshooting ([troubleshooting.md](./troubleshooting.md))

**Solutions to common problems.**

**Categories:**
- Publishing issues (Won't publish, not loading, custom domain)
- Form submission issues (Not submitting, not appearing in dashboard)
- Payment issues (Stripe failures, refunds not processing)
- Analytics issues (Not tracking, conversions not working, data incorrect)
- Element/page builder issues (Won't save, drag-and-drop, overlapping)
- Performance issues (Slow loading, mobile performance)
- Integration issues (Zapier, calendar booking)

**Each issue includes:**
- Symptom description
- Common causes
- Step-by-step solutions
- Testing instructions

**Best for:** Resolving specific technical problems

**Read time:** 5-10 minutes per issue

### 5. Feature Specification ([/one/things/features/3-1-ai-funnel-builder.md](/one/things/features/3-1-ai-funnel-builder.md))

**Technical implementation details.**

**Topics covered:**
- Ontology mapping (14 thing types, 12 connection types, 18 event types)
- Architecture overview (frontend + backend)
- Data structures (TypeScript interfaces)
- Backend patterns (Effect.ts services, Convex mutations)
- Frontend patterns (React components, AI chat integration)
- Event logging (complete audit trail)

**Best for:** Developers extending the platform, understanding internals

**Read time:** 20 minutes

---

## Quick Start

**Create your first funnel in 3 steps:**

### Step 1: Start the AI Chat

1. Log into your ONE Platform account
2. Navigate to **Funnels** in the sidebar
3. Click **Create Funnel** or go to `/funnels/builder`
4. Start chatting with the AI

### Step 2: Describe What You're Selling

```
You: "I want to sell my online course about productivity for $497"

AI: "Excellent! I'll help you create a high-converting course funnel.

     Quick questions:
     1. What's your course about?
     2. Who is your target audience?
     3. Have you launched courses before?"

You: "Productivity for entrepreneurs, first launch"

AI: "Perfect! For a $497 course, I recommend the Product Launch Funnel:

     - Pre-launch buzz building
     - Early bird discount
     - Launch day sales page
     - Expected conversion: 8-12%

     Sound good?"

You: "Yes, let's do it!"
```

### Step 3: Customize and Publish

```
AI: "Great! Let's personalize your funnel:

     1. Funnel name?
     2. Brand colors (hex codes)?
     3. Logo upload?"

You: "Productivity Mastery Launch, #2563eb and #7c3aed"

AI: "Creating your funnel now..."
    [Builds 4 pages: Coming Soon, Early Bird, Launch, Thank You]
    "Your funnel is ready! Ready to publish?"

You: "Yes, publish it!"

AI: "Published! Your funnel is live at:
     https://one.ie/f/productivity-mastery"
```

**Total time:** 10-15 minutes

---

## Common Use Cases

### Selling an Online Course

**Template:** Product Launch Funnel
**Expected conversion:** 8-12%
**Revenue estimate:** $5,000-$15,000 (1,000 visitors)

**Funnel steps:**
1. Coming Soon (14 days before launch)
2. Early Bird ($397, save $100)
3. Launch Day ($497 full price)
4. Thank You (course access)

**Read more:** [User Guide - Common Use Cases](./user-guide.md#common-use-cases)

### Building an Email List

**Template:** Lead Magnet Funnel
**Expected conversion:** 30-50%
**List growth:** 300-500 subscribers (1,000 visitors)

**Funnel steps:**
1. Landing (free PDF checklist)
2. Delivery (download page)
3. Welcome Email (sequence)

**Read more:** [User Guide - Lead Magnet Funnel](./user-guide.md#4-lead-magnet-funnel)

### High-Ticket Coaching

**Template:** Webinar Funnel
**Expected conversion:** 20-30% attend, 5-10% buy
**Revenue estimate:** $10,000-$30,000 (200 attendees, $2,000 coaching)

**Funnel steps:**
1. Registration (sign up)
2. Webinar (90-minute training)
3. Replay (24-hour access)
4. Thank You (onboarding call)

**Read more:** [User Guide - Webinar Funnel](./user-guide.md#2-webinar-funnel)

---

## Features

### Conversational Creation

**No technical skills required:**
- Describe what you're selling
- AI recommends templates
- AI generates copy and structure
- Customize with natural language

### 7 Proven Templates

**Optimized for conversion:**
1. Product Launch (8-12%)
2. Webinar (5-10%)
3. Simple Sales (2-5%)
4. Lead Magnet (30-50%)
5. Book Launch (15-25%)
6. Membership (5-15%)
7. Summit/Event (40-60% register, 10-20% upgrade)

### 37 Element Types

**Build any page:**
- Text (headline, paragraph, bullets, testimonials)
- Media (images, videos, galleries, background video)
- Forms (inputs, dropdowns, checkboxes, multi-step)
- Commerce (pricing tables, buy buttons, cart, order bumps)
- Social Proof (testimonials, reviews, trust badges, customer count)
- Urgency (countdown timers, stock counters, limited offers, exit popups)
- Interactive (FAQs, tabs, progress bars, quizzes, booking, live chat)

### Built-in Analytics

**Track everything:**
- Visitors per funnel
- Conversions per step
- Drop-off analysis
- Revenue tracking
- Real-time metrics

### Stripe Integration

**Accept payments:**
- One-click Stripe connection
- Test mode for development
- Automatic webhook configuration
- Refund processing

### Custom Domains

**Professional branding:**
- Use your own domain
- Automatic SSL certificates
- DNS verification
- Subdomain support

---

## Pricing

**Free Tier:**
- 1 funnel
- 100 visitors/month
- ONE subdomain (e.g., yourfunnel.one.ie)
- Basic analytics

**Pro Tier ($29/month):**
- Unlimited funnels
- Unlimited visitors
- Custom domains
- Stripe integration
- Advanced analytics
- Priority support

**Enterprise (Custom pricing):**
- White-label
- API access
- Dedicated support
- Custom integrations
- SLA guarantees

---

## Support

**Need help?**

**Live chat:**
- Click chat icon (bottom right)
- Response time: < 5 minutes
- Available 24/7

**Email:**
- support@one.ie
- Response time: < 24 hours
- Include funnel ID and screenshots

**Documentation:**
- [User Guide](./user-guide.md)
- [FAQ](./faq.md)
- [Troubleshooting](./troubleshooting.md)

**Community:**
- Discord server: [Join Discord](https://discord.gg/one-platform)
- #funnel-builder channel
- Peer support and tips

---

## Roadmap

### Phase 1 (Complete) ✅
- AI chat funnel builder
- 7 templates
- 37 element types
- Basic analytics
- Stripe integration

### Phase 2 (Q1 2025)
- Video tutorials
- A/B testing
- Email sequence builder
- Zapier integration
- Mobile app

### Phase 3 (Q2 2025)
- AI-generated copy
- Industry-specific templates
- Advanced analytics (funnel flow visualization)
- White-label for agencies

### Phase 4 (Q3 2025)
- Multi-language support
- Funnel marketplace
- Collaboration features
- API v2

---

## Technical Architecture

**Frontend:**
- Astro 5 (static site generation)
- React 19 (interactive components)
- Tailwind v4 (styling)
- ChatClientV2 (AI interface)

**Backend:**
- Convex (real-time database)
- Effect.ts (business logic)
- Better Auth (authentication)
- OpenAI GPT-4 (AI conversation)

**Infrastructure:**
- Cloudflare Pages (hosting)
- Cloudflare R2 (file storage)
- Convex Cloud (database)
- Stripe (payments)

**Read more:** [Feature Specification](/one/things/features/3-1-ai-funnel-builder.md)

---

## Contributing

**Found a bug?**
- Open issue on GitHub
- Or email bugs@one.ie

**Have a feature request?**
- Submit via /feedback
- Or email features@one.ie

**Want to contribute?**
- Check CONTRIBUTING.md
- Join #contributors on Discord

---

## Changelog

### Version 1.0.0 (2025-11-22)

**Features:**
- AI chat funnel builder
- 7 funnel templates
- 37 element types
- Real-time analytics
- Stripe integration
- Custom domain support
- Webhook API
- REST API

**Documentation:**
- User Guide (20+ pages)
- API Reference (comprehensive)
- FAQ (50+ questions)
- Troubleshooting guide

---

## License

**ONE Platform License**
- Platform features: Proprietary
- Documentation: CC BY 4.0
- Code examples: MIT License

---

**Built with ONE Platform's 6-dimension ontology.**

**Questions?** Contact us at support@one.ie or use live chat.
