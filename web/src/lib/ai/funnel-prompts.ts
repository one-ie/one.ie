/**
 * Funnel Builder AI System Prompts
 *
 * Conversational funnel creation with AI guidance through:
 * - Understanding goals and audience
 * - Suggesting optimal templates
 * - Customizing funnel design
 * - Building pages step-by-step
 * - Preview and publish workflow
 */

/**
 * Main system prompt for funnel builder AI
 */
export const FUNNEL_BUILDER_SYSTEM_PROMPT = `You are an expert funnel builder and conversion optimization specialist. Your goal is to help users create high-converting sales funnels through a conversational, guided process.

**Your Approach:**
1. **Understand First** - Ask about their product, audience, and goals
2. **Recommend Templates** - Suggest 3 proven funnel types based on their needs
3. **Guide Customization** - Help them personalize branding, colors, and content
4. **Build Together** - Create pages step-by-step with them
5. **Optimize** - Suggest improvements for conversion

**Conversation Flow:**

**Stage 1: Discovery (What are you selling?)**
- Ask about their product/service
- Understand their target audience
- Identify their main goal (leads, sales, signups, etc.)
- Ask about their experience level

**Stage 2: Template Selection (Best funnel for your needs)**
Based on their answers, suggest 3 templates from:

1. **Product Launch Funnel** (High conversion)
   - Best for: New product releases, courses, info products
   - Steps: Coming Soon → Early Bird → Launch Page → Thank You
   - Conversion rate: 8-12%

2. **Webinar Funnel** (Build trust first)
   - Best for: High-ticket coaching, B2B services, consultations
   - Steps: Registration → Reminder Sequence → Webinar → Offer → Thank You
   - Conversion rate: 20-30% (registrations), 5-10% (sales)

3. **Simple Sales Page** (Quick start)
   - Best for: Physical products, simple offers, low-ticket items
   - Steps: Landing Page → Checkout → Upsell → Thank You
   - Conversion rate: 2-5%

4. **Lead Magnet Funnel** (Build email list)
   - Best for: Free guides, templates, checklists
   - Steps: Landing Page → Opt-in → Delivery → Welcome Sequence
   - Conversion rate: 30-50%

5. **Book Launch Funnel** (Author platform)
   - Best for: Book pre-orders, author platform building
   - Steps: Pre-order Page → Bonus Offers → Countdown → Thank You
   - Conversion rate: 15-25%

6. **Membership Funnel** (Recurring revenue)
   - Best for: Subscriptions, communities, exclusive content
   - Steps: Sales Page → Trial Signup → Onboarding → Member Area
   - Conversion rate: 5-15%

7. **Summit/Event Funnel** (Virtual events)
   - Best for: Multi-speaker events, conferences, workshops
   - Steps: Registration → Schedule → Session Links → Replay Access
   - Conversion rate: 40-60% (registrations)

**Stage 3: Customization (Make it yours)**
- Funnel name and slug
- Brand colors (primary, secondary)
- Logo and imagery style
- Tone and voice (professional, casual, urgent)

**Stage 4: Build Pages (Step-by-step creation)**
For each page in the funnel:
- Page purpose and goal
- Headline and subheadline suggestions
- Key sections to include
- Call-to-action recommendations
- Design and layout options

**Stage 5: Review & Publish (Launch ready)**
- Preview funnel flow
- Check all pages are complete
- Suggest Stripe integration for payments
- Add tracking (Google Analytics, Facebook Pixel)
- Publish and get shareable link

**Tools Available:**
- create_funnel - Create a new funnel with settings
- add_funnel_step - Add a page to the funnel sequence
- customize_funnel - Update funnel branding and settings
- preview_funnel - Generate preview of funnel flow
- publish_funnel - Make funnel live

**Response Style:**
- Friendly and encouraging
- Ask one question at a time (don't overwhelm)
- Provide specific suggestions, not vague advice
- Use emojis sparingly for emphasis
- Show examples and previews when possible
- Always offer next steps

**Example Conversation:**

User: "I want to sell my online course"

You: "Excellent! I'll help you create a high-converting course sales funnel. First, let me understand your needs:

1. What's your course about?
2. Who is your target audience?
3. What's the price point?
4. Have you launched courses before?

This will help me suggest the perfect funnel template for you!"

User: "It's a productivity course for entrepreneurs, $497, first launch"

You: "Perfect! For a $497 course targeted at entrepreneurs, I recommend one of these proven funnels:

**1. Product Launch Funnel** ⭐ RECOMMENDED
   - Pre-launch buzz building
   - Early bird discount period
   - Launch day sales page
   - Post-purchase onboarding
   - Best for: First-time launches
   - Expected conversion: 8-12%

**2. Webinar Funnel**
   - Free webinar registration
   - Value-packed training
   - Pitch at the end
   - Limited-time offer
   - Best for: Building trust first
   - Expected conversion: 20-30% attend, 5-10% buy

**3. Simple Sales Page**
   - Direct to sales page
   - Clear value proposition
   - Social proof & testimonials
   - One-click checkout
   - Best for: Quick testing
   - Expected conversion: 2-5%

Which approach sounds best for your launch?"

**Key Principles:**
- Guide, don't dictate - Users make final decisions
- Show, don't tell - Use previews and examples
- Optimize for conversion - Suggest proven patterns
- Make it easy - Handle complexity behind the scenes
- Build confidence - Explain why recommendations work

Remember: You're building their business success, not just a funnel. Be their conversion optimization expert.`;

/**
 * Template descriptions for AI context
 */
export const FUNNEL_TEMPLATES = {
	"product-launch": {
		name: "Product Launch Funnel",
		description: "High-converting funnel for new product releases",
		bestFor: ["Courses", "Info products", "Software", "Physical products"],
		steps: [
			{
				name: "Coming Soon",
				purpose: "Build anticipation and collect early interest",
				elements: ["Countdown timer", "Email signup", "Benefits list"],
			},
			{
				name: "Early Bird Offer",
				purpose: "Reward early adopters with special pricing",
				elements: ["Limited quantity", "Discount timer", "Bonuses"],
			},
			{
				name: "Launch Day Sales Page",
				purpose: "Main sales page with full offer details",
				elements: ["Video sales letter", "Features", "Testimonials", "FAQ", "Guarantee"],
			},
			{
				name: "Thank You",
				purpose: "Confirm purchase and set expectations",
				elements: ["Order confirmation", "Next steps", "Upsell opportunity"],
			},
		],
		conversionRate: "8-12%",
		timeline: "2-4 weeks from launch",
	},
	"webinar": {
		name: "Webinar Funnel",
		description: "Build trust through education, then make your offer",
		bestFor: ["High-ticket coaching", "B2B services", "Consultations", "Complex products"],
		steps: [
			{
				name: "Registration Page",
				purpose: "Sign up attendees for the webinar",
				elements: ["Webinar topic", "What they'll learn", "Speaker bio", "Time options"],
			},
			{
				name: "Confirmation Page",
				purpose: "Confirm registration and build anticipation",
				elements: ["Calendar link", "Reminder setup", "Pre-webinar content"],
			},
			{
				name: "Webinar Page",
				purpose: "Deliver value and present offer",
				elements: ["Video player", "Chat", "Offer reveal", "Limited-time bonus"],
			},
			{
				name: "Replay Page",
				purpose: "Catch those who missed it live",
				elements: ["Video replay", "Offer details", "Countdown timer"],
			},
			{
				name: "Thank You",
				purpose: "Confirm purchase and next steps",
				elements: ["Access details", "Onboarding schedule", "Support info"],
			},
		],
		conversionRate: "20-30% attend, 5-10% buy",
		timeline: "1-2 weeks preparation",
	},
	"simple-sales": {
		name: "Simple Sales Page",
		description: "Direct approach for straightforward offers",
		bestFor: ["Physical products", "Low-ticket items", "Simple services", "Quick testing"],
		steps: [
			{
				name: "Landing Page",
				purpose: "Present offer and drive to checkout",
				elements: ["Hero image", "Benefits", "Social proof", "Clear CTA"],
			},
			{
				name: "Checkout",
				purpose: "Collect payment information",
				elements: ["Order form", "Security badges", "Money-back guarantee"],
			},
			{
				name: "Order Bump",
				purpose: "Add complementary product at checkout",
				elements: ["Related product", "One-click add", "Savings message"],
			},
			{
				name: "Thank You",
				purpose: "Confirm order and deliver product",
				elements: ["Order details", "Delivery timeline", "Support contact"],
			},
		],
		conversionRate: "2-5%",
		timeline: "Launch in 1-3 days",
	},
	"lead-magnet": {
		name: "Lead Magnet Funnel",
		description: "Build your email list with valuable free content",
		bestFor: ["Free guides", "Templates", "Checklists", "Email list building"],
		steps: [
			{
				name: "Landing Page",
				purpose: "Offer free resource in exchange for email",
				elements: ["Headline", "What they get", "Opt-in form", "Preview image"],
			},
			{
				name: "Delivery Page",
				purpose: "Deliver the free resource immediately",
				elements: ["Download link", "Next steps", "Quick win tip"],
			},
			{
				name: "Welcome Email",
				purpose: "Start relationship and introduce paid offer",
				elements: ["Thank you", "How to use resource", "Soft pitch"],
			},
		],
		conversionRate: "30-50%",
		timeline: "Launch in 1 day",
	},
	"book-launch": {
		name: "Book Launch Funnel",
		description: "Pre-order campaign with bonuses and urgency",
		bestFor: ["Book launches", "Author platform", "Pre-orders", "Crowdfunding"],
		steps: [
			{
				name: "Pre-Order Page",
				purpose: "Drive pre-orders before publication",
				elements: ["Book cover", "Synopsis", "Author bio", "Pre-order CTA"],
			},
			{
				name: "Bonus Offers",
				purpose: "Increase pre-order value with exclusive bonuses",
				elements: ["Bonus chapters", "Templates", "Workbook", "Community access"],
			},
			{
				name: "Launch Day",
				purpose: "Create urgency on publication day",
				elements: ["Countdown timer", "Limited bonuses", "Reviews", "Buy now CTA"],
			},
			{
				name: "Thank You",
				purpose: "Deliver book and bonuses",
				elements: ["Download links", "Reading guide", "Review request"],
			},
		],
		conversionRate: "15-25%",
		timeline: "2-8 weeks pre-launch",
	},
	"membership": {
		name: "Membership Funnel",
		description: "Recurring revenue from subscriptions",
		bestFor: ["Subscriptions", "Communities", "Exclusive content", "SaaS"],
		steps: [
			{
				name: "Sales Page",
				purpose: "Present membership benefits and pricing",
				elements: ["What's included", "Testimonials", "Pricing tiers", "FAQ"],
			},
			{
				name: "Trial Signup",
				purpose: "Low-risk trial to reduce barrier",
				elements: ["Trial details", "Easy signup", "Cancel anytime", "What to expect"],
			},
			{
				name: "Onboarding",
				purpose: "Welcome and activate new members",
				elements: ["Welcome video", "Quick start guide", "Community intro"],
			},
			{
				name: "Member Area",
				purpose: "Deliver ongoing value to retain members",
				elements: ["Content library", "Community forum", "New releases", "Support"],
			},
		],
		conversionRate: "5-15%",
		timeline: "Ongoing recurring revenue",
	},
	"summit": {
		name: "Summit/Event Funnel",
		description: "Virtual event with multiple speakers",
		bestFor: ["Virtual summits", "Conferences", "Multi-day workshops", "Speaker series"],
		steps: [
			{
				name: "Registration",
				purpose: "Sign up attendees for the event",
				elements: ["Event overview", "Speaker lineup", "Schedule", "Free registration"],
			},
			{
				name: "Schedule Page",
				purpose: "Show full agenda and sessions",
				elements: ["Day-by-day schedule", "Speaker bios", "Session topics"],
			},
			{
				name: "Session Links",
				purpose: "Access to live or recorded sessions",
				elements: ["Video player", "Speaker resources", "Q&A chat"],
			},
			{
				name: "All-Access Pass",
				purpose: "Upsell to replays and bonuses",
				elements: ["Lifetime access", "Transcripts", "Bonuses", "Certificate"],
			},
		],
		conversionRate: "40-60% register, 10-20% upgrade",
		timeline: "1-3 months preparation",
	},
};

/**
 * Conversation stage prompts
 */
export const STAGE_PROMPTS = {
	discovery: "Ask about their product, audience, and goals. Be curious and helpful.",
	template: "Recommend 3 specific templates based on what they shared. Explain why each fits.",
	customize: "Help them personalize the funnel with branding, colors, and tone.",
	build: "Guide them through creating each page in the funnel sequence.",
	preview: "Show them the complete funnel flow and suggest improvements.",
	publish: "Help them launch with tracking, Stripe, and final checks.",
};

/**
 * Example suggestions for funnel builder
 */
export const FUNNEL_SUGGESTIONS = [
	"I want to sell an online course about productivity",
	"Create a webinar funnel for my coaching program",
	"Build a lead magnet funnel to grow my email list",
	"Set up a product launch funnel for my new book",
	"Create a membership funnel for my community",
	"Design a summit registration funnel",
	"Build a simple sales page for my physical product",
];
