# AI Chat Funnel Builder - FAQ

**Frequently asked questions and common issues.**

Version: 1.0.0
Last Updated: 2025-11-22

---

## General Questions

### What is the AI Chat Funnel Builder?

The AI Chat Funnel Builder creates complete sales funnels through natural conversation. Instead of manually configuring pages, you describe what you want to sell and the AI guides you through template selection, customization, and publishing.

**Key benefits:**
- 10-20 minute setup (vs 2-8 hours manually)
- AI-optimized conversion rates
- No technical skills required
- Step-by-step guidance

### How is this different from other funnel builders?

**Traditional funnel builders** (ClickFunnels, Leadpages, Unbounce):
- Drag-and-drop page builders
- Manual configuration of each element
- Requires design and copywriting skills
- 2-8 hours to build a funnel

**AI Chat Funnel Builder:**
- Conversational interface (just chat)
- AI recommends templates and copy
- No design skills needed
- 10-20 minutes to build a funnel

### What can I build with this?

**Supported funnel types:**
- Product launches (courses, info products)
- Webinar funnels (high-ticket coaching)
- Simple sales pages (physical products)
- Lead magnet funnels (email list building)
- Book launches (pre-orders)
- Membership funnels (subscriptions)
- Event/summit funnels (conferences)

### Do I need technical skills?

No. The AI handles everything:
- Template selection
- Page structure
- Element placement
- Conversion optimization
- Publishing

You just describe what you're selling and customize the copy.

### How much does it cost?

**Pricing:**
- **Free tier:** 1 funnel, 100 visitors/month, ONE subdomain
- **Pro tier:** Unlimited funnels, unlimited visitors, custom domains, Stripe integration ($29/month)
- **Enterprise:** White-label, API access, priority support (custom pricing)

### Can I use my own domain?

Yes (Pro tier and above). Add your custom domain in funnel settings:

1. Add domain: `launch.mysite.com`
2. Add DNS records at your domain provider
3. Verify domain (5-60 minutes)
4. SSL certificate auto-generated

---

## Technical Questions

### What tech stack is this built on?

**Frontend:**
- Astro 5 (static site generation)
- React 19 (interactive components)
- Tailwind v4 (styling)
- ChatClientV2 (AI chat interface)

**Backend:**
- Convex (real-time database)
- Effect.ts (business logic)
- Better Auth (authentication)

**AI:**
- OpenAI GPT-4 (conversation)
- Vercel AI SDK (streaming)
- Custom funnel-specific prompts

### Where is my data stored?

**Database:** Convex (real-time, encrypted at rest)
**Files:** Cloudflare R2 (images, videos)
**Backups:** Daily backups to S3
**Location:** US East (AWS us-east-1)

**Security:**
- All data encrypted in transit (TLS 1.3)
- All data encrypted at rest (AES-256)
- Multi-tenant isolation (groupId scoping)
- SOC 2 Type II compliant

### Can I export my funnel?

Yes. Export options:

1. **HTML/CSS export:** Download static site
2. **JSON export:** Funnel structure and data
3. **PDF export:** Printable funnel map
4. **API access:** Programmatic access to all data

### How do I integrate with other tools?

**Built-in integrations:**
- Stripe (payments)
- Google Analytics (tracking)
- Facebook Pixel (ads)
- Calendly (booking)
- Zapier (1000+ apps)

**Custom integrations:**
- REST API (full CRUD access)
- Webhooks (real-time events)
- Embed code (iframe)

### Is there an API?

Yes. Full REST API with:
- Funnel management (CRUD)
- Analytics access
- Webhook subscriptions
- Form submissions export

See [API Reference](/one/knowledge/funnel-builder/api-reference.md) for details.

---

## Funnel Creation Questions

### How long does it take to create a funnel?

**With AI Chat Builder:**
- Simple funnel (3 steps): 10 minutes
- Standard funnel (5 steps): 15-20 minutes
- Complex funnel (7+ steps): 25-30 minutes

**Manual builder (comparison):**
- Simple: 1-2 hours
- Standard: 3-5 hours
- Complex: 6-8 hours

### Can I customize the AI-generated copy?

Yes. The AI provides starting copy, but you can edit everything:

1. Click any element on the page
2. Edit text, images, settings
3. Changes auto-save every 5 seconds
4. Preview changes in real-time

### What templates are available?

**7 templates:**
1. **Product Launch** - Courses, info products (8-12% conversion)
2. **Webinar** - High-ticket coaching (5-10% conversion)
3. **Simple Sales** - Physical products (2-5% conversion)
4. **Lead Magnet** - Email list building (30-50% conversion)
5. **Book Launch** - Pre-orders (15-25% conversion)
6. **Membership** - Subscriptions (5-15% conversion)
7. **Summit/Event** - Conferences (40-60% register, 10-20% upgrade)

### Can I create a custom template?

Yes (Pro tier). Create a custom template:

1. Build your funnel
2. Click **Save as Template**
3. Name your template
4. Reuse for future funnels

### How do I change the funnel flow?

**Reorder steps:**
1. Drag and drop in funnel flow
2. Order auto-updates
3. URLs remain the same

**Add steps:**
1. Click **Add Step**
2. Choose step type
3. Position in sequence

**Remove steps:**
1. Click **Delete** on step
2. Confirm removal
3. Analytics preserved

---

## Publishing Questions

### How do I publish my funnel?

1. Click **Publish** button
2. Choose domain (subdomain or custom)
3. Enable tracking (optional)
4. Enable payments (optional)
5. Click **Publish**

Funnel goes live immediately.

### Can I preview before publishing?

Yes. Click **Preview** to see:
- Desktop preview
- Mobile preview
- Tablet preview
- All steps in sequence

### What happens after I publish?

**Immediately:**
- Funnel goes live at your URL
- Analytics start tracking
- Forms start collecting leads
- Stripe payments enabled (if configured)

**Within 24 hours:**
- Search engines index pages
- Social media previews generated

### Can I unpublish a funnel?

Yes. Click **Unpublish** to:
- Take funnel offline
- Preserve all data and analytics
- Keep URL reserved
- Re-publish anytime

### How do I update a published funnel?

**All changes are live immediately:**
- Edit any element
- Changes save automatically
- No re-publishing needed

**To make major changes:**
1. Duplicate funnel
2. Edit duplicate
3. Test thoroughly
4. Publish when ready

---

## Analytics Questions

### What metrics can I track?

**Funnel-level:**
- Total visitors
- Total conversions
- Conversion rate
- Revenue
- Average order value

**Step-level:**
- Visitors per step
- Conversions per step
- Drop-off rate
- Time on page

**Timeseries:**
- Daily visitors
- Daily revenue
- Trends over time

### How accurate is the analytics?

**Very accurate:**
- Real-time tracking (updated every 5 minutes)
- No sampling (tracks 100% of visitors)
- Bot filtering (excludes known bots)
- Deduplication (unique visitors only)

### Can I integrate Google Analytics?

Yes. Add your Google Analytics ID in funnel settings:

1. Navigate to **Settings** → **Tracking**
2. Add Google Analytics ID (e.g., G-XXXXXXXXXX)
3. Click **Save**
4. Tracking starts immediately

### Can I track conversions in Facebook Ads?

Yes. Add your Facebook Pixel ID:

1. Navigate to **Settings** → **Tracking**
2. Add Facebook Pixel ID
3. Configure standard events (PageView, Purchase)
4. Track conversions in Ads Manager

### How do I export analytics?

**Export options:**
- CSV (all data)
- JSON (API format)
- PDF (printable report)
- Google Sheets (live sync)

---

## Payment Questions

### How do I accept payments?

**Stripe integration (Pro tier):**

1. Navigate to **Settings** → **Payments**
2. Click **Connect Stripe**
3. Authorize Stripe account
4. Add buy buttons to pages
5. Payments flow to your Stripe account

### Do you take a percentage of sales?

No. All revenue goes to your Stripe account. We only charge the monthly subscription fee ($29/month for Pro).

**Stripe fees:**
- 2.9% + 30¢ per transaction (standard Stripe pricing)

### Can I offer discounts and coupons?

Yes. Create coupon codes:

1. Navigate to **Settings** → **Coupons**
2. Click **Create Coupon**
3. Set discount (% or fixed amount)
4. Set expiration (optional)
5. Share code with customers

### Can I process refunds?

Yes. Refunds are processed through Stripe:

1. Navigate to **Payments** → **Transactions**
2. Find transaction
3. Click **Refund**
4. Choose full or partial refund
5. Refund processed immediately

### What payment methods are supported?

**Via Stripe:**
- Credit cards (Visa, Mastercard, Amex)
- Debit cards
- Apple Pay
- Google Pay
- ACH bank transfers (US only)
- SEPA Direct Debit (EU only)

---

## Troubleshooting

### My funnel isn't loading

**Check:**
1. Is funnel published? (Check status in dashboard)
2. Is custom domain configured correctly? (Check DNS records)
3. Is SSL certificate active? (Takes 5-60 minutes after domain verification)

**Fix:**
- Unpublish and re-publish
- Verify DNS records
- Wait 60 minutes for SSL provisioning

### Forms aren't submitting

**Check:**
1. Is form element added to page?
2. Is submit button connected to form?
3. Is email service connected? (Settings → Integrations)

**Fix:**
- Re-add form element
- Connect email service (e.g., ConvertKit)
- Check spam folder for test submissions

### Stripe payments failing

**Check:**
1. Is Stripe connected? (Settings → Payments)
2. Is Stripe in live mode? (Test mode won't charge real cards)
3. Are buy buttons configured with correct prices?

**Fix:**
- Reconnect Stripe
- Switch to live mode
- Update buy button prices

### Analytics not tracking

**Check:**
1. Is funnel published?
2. Is tracking code installed? (View source and search for "one-analytics")
3. Are you blocking analytics in your browser?

**Fix:**
- Publish funnel
- Reinstall tracking code
- Test in incognito mode

### Custom domain not working

**Check:**
1. Are DNS records correct?
   - CNAME: `www` → `one.ie`
   - A: `@` → `76.76.21.21`
2. Has DNS propagated? (Takes 5-60 minutes)
3. Is SSL certificate active?

**Fix:**
- Verify DNS at dnschecker.org
- Wait 60 minutes
- Contact support if still failing

---

## Billing Questions

### How does billing work?

**Monthly subscription:**
- Charged on the 1st of each month
- Pay as you go (cancel anytime)
- No long-term contracts

**Free tier:**
- 1 funnel
- 100 visitors/month
- ONE subdomain only
- No credit card required

### Can I upgrade/downgrade?

**Upgrade:**
- Immediate access to Pro features
- Prorated charge for current month

**Downgrade:**
- Access to Pro features until end of billing cycle
- Switch to Free tier at next renewal

### What happens if I cancel?

**Immediate effects:**
- Funnels remain published until end of billing cycle
- No new charges

**After billing cycle ends:**
- Funnels unpublished
- Data preserved for 90 days
- Re-subscribe anytime to restore

### Do you offer refunds?

**30-day money-back guarantee:**
- Full refund if not satisfied
- No questions asked
- Contact support@one.ie

---

## Support Questions

### How do I get help?

**Support channels:**
- **Live chat:** Click chat icon (bottom right) - response in < 5 minutes
- **Email:** support@one.ie - response in < 24 hours
- **Documentation:** /docs/funnel-builder - comprehensive guides
- **Community:** Discord server - peer support

### Is there a knowledge base?

Yes. Comprehensive documentation:
- [User Guide](/one/knowledge/funnel-builder/user-guide.md)
- [API Reference](/one/knowledge/funnel-builder/api-reference.md)
- [Developer Guide](/one/knowledge/funnel-builder/developer-guide.md)
- [Troubleshooting](/one/knowledge/funnel-builder/troubleshooting.md)

### Do you offer training?

**Free resources:**
- Video tutorials (YouTube)
- Written guides (documentation)
- Webinars (monthly)

**Paid training:**
- 1-on-1 onboarding ($199)
- Custom workshops (enterprise)

### Can I request features?

Yes! We love feedback. Submit feature requests:
- **Feedback form:** /feedback
- **Email:** features@one.ie
- **Discord:** #feature-requests channel

---

**Still have questions?** Contact us at support@one.ie or use live chat.

---

**Related documentation:**
- [User Guide](/one/knowledge/funnel-builder/user-guide.md)
- [Troubleshooting](/one/knowledge/funnel-builder/troubleshooting.md)
- [API Reference](/one/knowledge/funnel-builder/api-reference.md)
