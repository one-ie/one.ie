/**
 * Funnel Template Definitions
 *
 * Pre-built funnel templates that AI can suggest based on user goals.
 * Each template includes proven step sequences, element suggestions, and copy patterns.
 */

export interface ElementSuggestion {
  type: 'headline' | 'subheadline' | 'body' | 'form' | 'button' | 'image' | 'video' | 'testimonial' | 'bullet-list' | 'countdown' | 'social-proof' | 'guarantee';
  position: number; // Order on page
  content?: string; // Suggested copy
  placeholder?: string; // Placeholder for dynamic content
  notes?: string; // Best practice notes
}

export interface TemplateStep {
  id: string;
  name: string;
  type: 'landing' | 'opt-in' | 'thank-you' | 'sales' | 'upsell' | 'checkout' | 'confirmation' | 'webinar' | 'replay' | 'onboarding';
  description: string;
  elements: ElementSuggestion[];
  colorScheme?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  bestPractices: string[];
}

export interface FunnelTemplate {
  id: string;
  name: string;
  description: string;
  category: 'lead-gen' | 'product-launch' | 'webinar' | 'ecommerce' | 'membership' | 'summit';
  steps: TemplateStep[];
  suggestedFor: string[]; // Use cases
  conversionRate: number; // Benchmark percentage
  complexity: 'simple' | 'medium' | 'advanced';
  estimatedSetupTime: string; // e.g., "30 minutes"
  tags: string[];
}

// ============================================================================
// 1. LEAD GENERATION TEMPLATES
// ============================================================================

export const leadMagnetBasic: FunnelTemplate = {
  id: 'lead-magnet-basic',
  name: 'Simple Lead Magnet Funnel',
  description: 'Classic 2-step funnel for collecting email addresses in exchange for a free resource',
  category: 'lead-gen',
  complexity: 'simple',
  conversionRate: 35,
  estimatedSetupTime: '20 minutes',
  suggestedFor: [
    'Building an email list',
    'Offering a free PDF, checklist, or template',
    'Starting with lead generation',
    'Testing a new niche',
  ],
  tags: ['beginner-friendly', 'high-converting', 'quick-setup', 'email-list'],
  steps: [
    {
      id: 'opt-in-page',
      name: 'Opt-in Page',
      type: 'opt-in',
      description: 'Single-column page focused on getting email signup',
      colorScheme: {
        primary: '#2563eb', // Blue
        secondary: '#1e40af',
        accent: '#f59e0b', // Orange for CTA
        background: '#ffffff',
      },
      elements: [
        {
          type: 'headline',
          position: 1,
          content: 'Download Your Free [Lead Magnet Name]',
          notes: 'Use benefit-driven language. Make it specific and valuable.',
        },
        {
          type: 'subheadline',
          position: 2,
          content: 'Discover the exact [outcome] that [benefit] in just [timeframe]',
          notes: 'Expand on the promise. Address the transformation.',
        },
        {
          type: 'image',
          position: 3,
          placeholder: 'Lead magnet preview image (PDF cover, checklist screenshot)',
          notes: 'Visual representation builds credibility and desire',
        },
        {
          type: 'bullet-list',
          position: 4,
          content: `Inside you'll discover:
• [Benefit 1 - specific outcome]
• [Benefit 2 - specific outcome]
• [Benefit 3 - specific outcome]
• [Benefit 4 - specific outcome]
• [Benefit 5 - specific outcome]`,
          notes: 'Focus on benefits, not features. Use "you" language.',
        },
        {
          type: 'form',
          position: 5,
          placeholder: 'Email and Name fields',
          notes: 'Keep it minimal. Email only for highest conversions, add name if needed for personalization.',
        },
        {
          type: 'button',
          position: 6,
          content: 'Send Me The Free [Resource]',
          notes: 'Action-oriented, benefit-driven CTA. Avoid "Submit".',
        },
        {
          type: 'social-proof',
          position: 7,
          content: 'Join 10,000+ [target audience] who have already downloaded this',
          notes: 'Add credibility with numbers. Use real data.',
        },
      ],
      bestPractices: [
        'Remove navigation to eliminate distractions',
        'Use a single-column layout for focus',
        'Show preview of the lead magnet',
        'Keep form fields minimal (email only is best)',
        'Add social proof or testimonials if available',
        'Use contrasting color for CTA button',
      ],
    },
    {
      id: 'thank-you-page',
      name: 'Thank You Page',
      type: 'thank-you',
      description: 'Confirmation page with next steps and optional upsell',
      colorScheme: {
        primary: '#10b981', // Green for success
        secondary: '#059669',
        accent: '#2563eb',
        background: '#ffffff',
      },
      elements: [
        {
          type: 'headline',
          position: 1,
          content: 'Check Your Email!',
          notes: 'Clear confirmation that action was successful',
        },
        {
          type: 'subheadline',
          position: 2,
          content: 'Your free [resource] is on its way to [email@example.com]',
          notes: 'Personalize with their email address',
        },
        {
          type: 'body',
          position: 3,
          content: `Here's what to do next:
1. Check your inbox for an email from [Your Name/Company]
2. Click the link to download your [resource]
3. [Optional next action]`,
          notes: 'Give clear next steps to reduce confusion',
        },
        {
          type: 'video',
          position: 4,
          placeholder: 'Optional welcome video or product introduction',
          notes: 'Great place for a soft pitch or to build relationship',
        },
        {
          type: 'headline',
          position: 5,
          content: 'Want Even Better Results?',
          notes: 'Transition to optional upsell',
        },
        {
          type: 'body',
          position: 6,
          content: '[Optional upsell description - paid product, course, or consultation]',
          notes: 'Only include if you have a relevant paid offer',
        },
        {
          type: 'button',
          position: 7,
          content: 'Yes, Show Me [Paid Offer]',
          notes: 'Make it optional and low-pressure',
        },
      ],
      bestPractices: [
        'Confirm their action was successful',
        'Tell them exactly what to do next',
        'Set expectations (check inbox, might be in spam)',
        'Optional: Add a soft upsell or next step',
        'Include social sharing buttons',
        'Add a video welcome from you',
      ],
    },
  ],
};

export const leadMagnetQuiz: FunnelTemplate = {
  id: 'lead-magnet-quiz',
  name: 'Quiz Lead Funnel',
  description: 'Interactive quiz funnel that segments leads and provides personalized results',
  category: 'lead-gen',
  complexity: 'medium',
  conversionRate: 45,
  estimatedSetupTime: '1 hour',
  suggestedFor: [
    'Segmenting your audience',
    'Personalizing recommendations',
    'High engagement lead generation',
    'Qualifying leads before sales calls',
  ],
  tags: ['interactive', 'high-engagement', 'segmentation', 'personalization'],
  steps: [
    {
      id: 'quiz-intro',
      name: 'Quiz Introduction',
      type: 'landing',
      description: 'Introduce the quiz and its value proposition',
      colorScheme: {
        primary: '#8b5cf6', // Purple
        secondary: '#7c3aed',
        accent: '#f59e0b',
        background: '#ffffff',
      },
      elements: [
        {
          type: 'headline',
          position: 1,
          content: 'Take This 60-Second Quiz to Discover Your [Result Type]',
          notes: 'Create curiosity and promise quick completion',
        },
        {
          type: 'subheadline',
          position: 2,
          content: 'Answer 5 quick questions and get your personalized [outcome] roadmap',
          notes: 'Emphasize personalization and value',
        },
        {
          type: 'bullet-list',
          position: 3,
          content: `You'll discover:
• Your current [metric] level
• The biggest obstacle holding you back
• Your personalized action plan
• Recommended next steps`,
          notes: 'Show what they will learn from taking the quiz',
        },
        {
          type: 'button',
          position: 4,
          content: 'Start The Quiz Now',
          notes: 'Clear, action-oriented CTA',
        },
        {
          type: 'social-proof',
          position: 5,
          content: '5,247 people have taken this quiz',
          notes: 'Shows popularity and reduces hesitation',
        },
      ],
      bestPractices: [
        'Promise quick completion time (60 seconds, 5 questions)',
        'Emphasize personalization of results',
        'Show social proof of quiz takers',
        'Use engaging visuals',
        'Tease the value of the results',
      ],
    },
    {
      id: 'quiz-questions',
      name: 'Quiz Questions',
      type: 'landing',
      description: '5-7 multiple choice questions to segment leads',
      colorScheme: {
        primary: '#8b5cf6',
        secondary: '#7c3aed',
        accent: '#f59e0b',
        background: '#ffffff',
      },
      elements: [
        {
          type: 'headline',
          position: 1,
          placeholder: 'Question 1 of 5: [Question text]',
          notes: 'Show progress to encourage completion',
        },
        {
          type: 'body',
          position: 2,
          placeholder: 'Multiple choice answers (3-5 options)',
          notes: 'Make answers mutually exclusive and easy to choose',
        },
      ],
      bestPractices: [
        'Show progress bar or question counter',
        'Use 3-5 answer options per question',
        'Make questions relevant and engaging',
        'Allow going back to previous questions',
        'Auto-advance after selection (no "Next" button needed)',
        'Keep total questions to 5-7 maximum',
      ],
    },
    {
      id: 'quiz-opt-in',
      name: 'Email Opt-in for Results',
      type: 'opt-in',
      description: 'Collect email to deliver personalized quiz results',
      colorScheme: {
        primary: '#8b5cf6',
        secondary: '#7c3aed',
        accent: '#f59e0b',
        background: '#ffffff',
      },
      elements: [
        {
          type: 'headline',
          position: 1,
          content: 'Your Results Are Ready!',
          notes: 'Create anticipation for the results',
        },
        {
          type: 'subheadline',
          position: 2,
          content: 'Enter your email to get your personalized [result type] and action plan',
          notes: 'Emphasize the value of what they are getting',
        },
        {
          type: 'form',
          position: 3,
          placeholder: 'Email and Name fields',
          notes: 'Keep it simple - they have already invested time in the quiz',
        },
        {
          type: 'button',
          position: 4,
          content: 'Show Me My Results',
          notes: 'Benefit-driven CTA',
        },
        {
          type: 'body',
          position: 5,
          content: 'We respect your privacy. Unsubscribe at any time.',
          notes: 'Reduce anxiety about spam',
        },
      ],
      bestPractices: [
        'Request email AFTER they complete quiz (higher commitment)',
        'Emphasize personalization of results',
        'Show preview of what results look like',
        'Add privacy reassurance',
        'Make the value crystal clear',
      ],
    },
    {
      id: 'quiz-results',
      name: 'Personalized Results Page',
      type: 'thank-you',
      description: 'Display personalized results based on quiz answers',
      colorScheme: {
        primary: '#8b5cf6',
        secondary: '#7c3aed',
        accent: '#10b981',
        background: '#ffffff',
      },
      elements: [
        {
          type: 'headline',
          position: 1,
          content: 'Your [Result Type]: [Personalized Category]',
          notes: 'Show their specific result type based on quiz answers',
        },
        {
          type: 'body',
          position: 2,
          placeholder: 'Personalized analysis based on their answers',
          notes: 'Make them feel like this was truly personalized for them',
        },
        {
          type: 'bullet-list',
          position: 3,
          content: `Your personalized action plan:
• Step 1: [Specific recommendation]
• Step 2: [Specific recommendation]
• Step 3: [Specific recommendation]`,
          notes: 'Give actionable next steps',
        },
        {
          type: 'headline',
          position: 4,
          content: 'Want Help Implementing This?',
          notes: 'Transition to offer',
        },
        {
          type: 'body',
          position: 5,
          placeholder: 'Description of paid offer, course, or service',
          notes: 'Natural segue to paid solution',
        },
        {
          type: 'button',
          position: 6,
          content: 'Yes, I Want Help With This',
          notes: 'Clear call to action for paid offer',
        },
      ],
      bestPractices: [
        'Show results immediately on the page',
        'Also send results via email',
        'Use their specific quiz answers in the results',
        'Provide genuinely helpful insights',
        'Include actionable next steps',
        'Soft pitch relevant paid solution',
        'Allow social sharing of results',
      ],
    },
  ],
};

// ============================================================================
// 2. PRODUCT LAUNCH TEMPLATES
// ============================================================================

export const productLaunchSeed: FunnelTemplate = {
  id: 'product-launch-seed',
  name: 'Product Launch Funnel (Seed Launch)',
  description: 'Pre-launch funnel to build anticipation and early buyer list before product is ready',
  category: 'product-launch',
  complexity: 'medium',
  conversionRate: 25,
  estimatedSetupTime: '45 minutes',
  suggestedFor: [
    'Launching a new product',
    'Building pre-launch buzz',
    'Validating product ideas',
    'Creating early buyer waitlist',
  ],
  tags: ['product-launch', 'pre-launch', 'waitlist', 'anticipation'],
  steps: [
    {
      id: 'coming-soon',
      name: 'Coming Soon Landing Page',
      type: 'landing',
      description: 'Build anticipation and collect early interest',
      colorScheme: {
        primary: '#dc2626', // Red
        secondary: '#b91c1c',
        accent: '#f59e0b',
        background: '#000000',
      },
      elements: [
        {
          type: 'headline',
          position: 1,
          content: 'Something Big Is Coming...',
          notes: 'Create curiosity and anticipation',
        },
        {
          type: 'subheadline',
          position: 2,
          content: '[Product Name] launches on [Date] and will help you [specific outcome]',
          notes: 'Reveal just enough to create interest',
        },
        {
          type: 'countdown',
          position: 3,
          placeholder: 'Countdown timer to launch date',
          notes: 'Create urgency and specific timeline',
        },
        {
          type: 'bullet-list',
          position: 4,
          content: `Get early access and you'll:
• Be the first to [benefit 1]
• Get [exclusive bonus]
• Save [discount amount] off regular price
• Get [additional benefit]`,
          notes: 'Reward early adopters',
        },
        {
          type: 'form',
          position: 5,
          placeholder: 'Email field for waitlist',
          notes: 'Collect emails for launch notification',
        },
        {
          type: 'button',
          position: 6,
          content: 'Get Early Access',
          notes: 'Make them feel special',
        },
        {
          type: 'social-proof',
          position: 7,
          content: 'Join 1,247 people on the early access list',
          notes: 'Show growing interest (update number regularly)',
        },
      ],
      bestPractices: [
        'Use countdown timer to create urgency',
        'Tease benefits without revealing everything',
        'Offer early bird incentive (discount, bonuses)',
        'Update waitlist number regularly',
        'Use dark/dramatic design for impact',
        'Send regular updates to waitlist',
      ],
    },
    {
      id: 'waitlist-confirmation',
      name: 'Waitlist Confirmation',
      type: 'thank-you',
      description: 'Confirm signup and build relationship pre-launch',
      colorScheme: {
        primary: '#10b981',
        secondary: '#059669',
        accent: '#dc2626',
        background: '#000000',
      },
      elements: [
        {
          type: 'headline',
          position: 1,
          content: 'You\'re On The List!',
          notes: 'Confirm successful signup',
        },
        {
          type: 'subheadline',
          position: 2,
          content: 'We\'ll notify you at [email] when [Product Name] launches on [Date]',
          notes: 'Set clear expectations',
        },
        {
          type: 'countdown',
          position: 3,
          placeholder: 'Countdown to launch',
          notes: 'Maintain excitement',
        },
        {
          type: 'body',
          position: 4,
          content: `What happens next:
• [Date]: First look at the product
• [Date]: Behind-the-scenes content
• [Date]: Early bird pricing announced
• [Launch Date]: Doors open (24 hours only)`,
          notes: 'Create anticipation with specific timeline',
        },
        {
          type: 'headline',
          position: 5,
          content: 'Want to guarantee your spot?',
          notes: 'Transition to pre-order option',
        },
        {
          type: 'body',
          position: 6,
          content: 'Reserve your copy now with our no-risk pre-order. Pay nothing until launch day.',
          notes: 'Optional pre-order for validation',
        },
        {
          type: 'button',
          position: 7,
          content: 'Reserve My Spot Now',
          notes: 'Optional pre-order CTA',
        },
      ],
      bestPractices: [
        'Send immediate confirmation email',
        'Provide timeline of what to expect',
        'Keep them engaged with pre-launch content',
        'Optional: Offer pre-order to validate demand',
        'Build relationship before the sale',
        'Share behind-the-scenes content',
      ],
    },
    {
      id: 'launch-sales-page',
      name: 'Launch Sales Page',
      type: 'sales',
      description: 'Full sales page when product launches',
      colorScheme: {
        primary: '#dc2626',
        secondary: '#b91c1c',
        accent: '#f59e0b',
        background: '#ffffff',
      },
      elements: [
        {
          type: 'headline',
          position: 1,
          content: '[Product Name] Is Finally Here',
          notes: 'Payoff the anticipation',
        },
        {
          type: 'subheadline',
          position: 2,
          content: '[Specific transformation] in [timeframe] - Guaranteed',
          notes: 'Bold promise with guarantee',
        },
        {
          type: 'countdown',
          position: 3,
          placeholder: 'Limited-time launch offer countdown',
          notes: 'Create launch urgency (24-72 hours)',
        },
        {
          type: 'video',
          position: 4,
          placeholder: 'Product demo or pitch video',
          notes: 'Show the product in action',
        },
        {
          type: 'button',
          position: 5,
          content: 'Get [Product Name] Now - $[Price]',
          notes: 'Clear pricing and CTA',
        },
        {
          type: 'bullet-list',
          position: 6,
          content: `Inside [Product Name]:
• Module 1: [Specific outcome]
• Module 2: [Specific outcome]
• Module 3: [Specific outcome]
• Bonus 1: [Value]
• Bonus 2: [Value]`,
          notes: 'Show complete value stack',
        },
        {
          type: 'testimonial',
          position: 7,
          placeholder: 'Early user testimonials or case studies',
          notes: 'Social proof from beta testers',
        },
        {
          type: 'guarantee',
          position: 8,
          content: '30-Day Money-Back Guarantee',
          notes: 'Remove risk',
        },
        {
          type: 'button',
          position: 9,
          content: 'Get [Product Name] Now - $[Price]',
          notes: 'Repeat CTA after value stack',
        },
      ],
      bestPractices: [
        'Create 24-72 hour launch window',
        'Offer launch discount or bonuses',
        'Show product demo video',
        'Include testimonials from beta users',
        'Add strong guarantee',
        'Use scarcity (limited spots/time)',
        'Multiple CTAs throughout page',
        'FAQ section at bottom',
      ],
    },
  ],
};

// ============================================================================
// 3. WEBINAR TEMPLATES
// ============================================================================

export const webinarBasic: FunnelTemplate = {
  id: 'webinar-basic',
  name: 'Automated Webinar Funnel',
  description: 'Registration funnel for live or evergreen webinar with post-webinar sales sequence',
  category: 'webinar',
  complexity: 'medium',
  conversionRate: 40,
  estimatedSetupTime: '1 hour',
  suggestedFor: [
    'Selling high-ticket products ($497+)',
    'Building authority',
    'Teaching and selling',
    'Automated sales presentations',
  ],
  tags: ['webinar', 'high-ticket', 'automated', 'authority-building'],
  steps: [
    {
      id: 'webinar-registration',
      name: 'Webinar Registration Page',
      type: 'landing',
      description: 'Registration page for live or automated webinar',
      colorScheme: {
        primary: '#0ea5e9', // Sky blue
        secondary: '#0284c7',
        accent: '#f59e0b',
        background: '#ffffff',
      },
      elements: [
        {
          type: 'headline',
          position: 1,
          content: 'Free Live Training: How to [Achieve Specific Result]',
          notes: 'Use "free" and specify it is a training/workshop',
        },
        {
          type: 'subheadline',
          position: 2,
          content: 'Discover the proven [method/system] that helped [social proof] achieve [specific result]',
          notes: 'Include social proof and specific outcomes',
        },
        {
          type: 'bullet-list',
          position: 3,
          content: `In this free training you'll discover:
• The #1 mistake keeping you from [result]
• The 3-step framework to [outcome]
• How to [specific benefit] in just [timeframe]
• Real case studies of people getting [results]`,
          notes: 'Focus on what they will learn, not product features',
        },
        {
          type: 'form',
          position: 4,
          placeholder: 'Name, Email, and Phone (optional) fields + Date/Time selector',
          notes: 'Show multiple date/time options if evergreen',
        },
        {
          type: 'button',
          position: 5,
          content: 'Save My Free Spot Now',
          notes: 'Imply scarcity with "save spot"',
        },
        {
          type: 'social-proof',
          position: 6,
          content: '4,892 people have registered for this training',
          notes: 'Show popularity',
        },
        {
          type: 'testimonial',
          position: 7,
          placeholder: '2-3 short testimonials from previous attendees',
          notes: 'Testimonials about the training, not just the product',
        },
        {
          type: 'image',
          position: 8,
          placeholder: 'Your photo or previous webinar screenshot',
          notes: 'Build trust and show this is real',
        },
      ],
      bestPractices: [
        'Call it a "training" or "workshop" not "webinar"',
        'Show multiple time slots if evergreen',
        'Use social proof (# registered)',
        'Include testimonials from past attendees',
        'Show your face/credibility',
        'Make it feel exclusive',
        'Add urgency (limited spots)',
      ],
    },
    {
      id: 'webinar-confirmation',
      name: 'Registration Confirmation',
      type: 'thank-you',
      description: 'Confirm registration and build anticipation',
      colorScheme: {
        primary: '#10b981',
        secondary: '#059669',
        accent: '#0ea5e9',
        background: '#ffffff',
      },
      elements: [
        {
          type: 'headline',
          position: 1,
          content: 'You\'re Registered!',
          notes: 'Clear confirmation',
        },
        {
          type: 'subheadline',
          position: 2,
          content: 'Your free training is on [Date] at [Time] [Timezone]',
          notes: 'Show their specific date/time',
        },
        {
          type: 'button',
          position: 3,
          content: 'Add to Calendar',
          notes: 'Make it easy to remember',
        },
        {
          type: 'body',
          position: 4,
          content: `What to do now:
1. Check your email for your calendar invite
2. Mark [Date/Time] on your calendar
3. Show up live for the best experience`,
          notes: 'Clear next steps',
        },
        {
          type: 'video',
          position: 5,
          placeholder: 'Short welcome video or pre-training content',
          notes: 'Build relationship and anticipation',
        },
        {
          type: 'body',
          position: 6,
          content: 'IMPORTANT: Check your email for the webinar link. Add our email to your contacts so you don\'t miss it.',
          notes: 'Deliverability instructions',
        },
      ],
      bestPractices: [
        'Send immediate confirmation email',
        'Provide calendar download (.ics file)',
        'Show exact date/time/timezone',
        'Reminder email sequence (24h, 1h, 15min before)',
        'Optional: Pre-webinar content to increase show-up rate',
        'Build anticipation',
      ],
    },
    {
      id: 'webinar-replay',
      name: 'Webinar Replay Page',
      type: 'replay',
      description: 'Replay page with limited-time offer',
      colorScheme: {
        primary: '#0ea5e9',
        secondary: '#0284c7',
        accent: '#dc2626',
        background: '#ffffff',
      },
      elements: [
        {
          type: 'headline',
          position: 1,
          content: 'Watch The Training Replay',
          notes: 'Simple and clear',
        },
        {
          type: 'countdown',
          position: 2,
          placeholder: 'Countdown to replay expiration (48-72 hours)',
          notes: 'Create urgency for replay access',
        },
        {
          type: 'body',
          position: 3,
          content: 'This replay is only available for 48 hours. Watch now before it\'s gone.',
          notes: 'Emphasize limited availability',
        },
        {
          type: 'video',
          position: 4,
          placeholder: 'Webinar replay video',
          notes: 'Full webinar recording',
        },
        {
          type: 'headline',
          position: 5,
          content: 'Ready to Get Started?',
          notes: 'CTA section after video',
        },
        {
          type: 'body',
          position: 6,
          content: '[Product pitch from webinar - brief summary]',
          notes: 'Recap the offer',
        },
        {
          type: 'button',
          position: 7,
          content: 'Get [Product Name] Now',
          notes: 'Direct link to checkout',
        },
        {
          type: 'countdown',
          position: 8,
          placeholder: 'Countdown to special offer expiration',
          notes: 'Separate countdown for pricing',
        },
      ],
      bestPractices: [
        'Limit replay availability (48-72 hours)',
        'Use countdown timer',
        'Link to offer throughout page',
        'Make video the focus',
        'Send reminder emails about expiration',
        'Include special replay-only bonus',
      ],
    },
    {
      id: 'webinar-checkout',
      name: 'Special Offer Checkout',
      type: 'checkout',
      description: 'Order form for webinar special offer',
      colorScheme: {
        primary: '#10b981',
        secondary: '#059669',
        accent: '#dc2626',
        background: '#ffffff',
      },
      elements: [
        {
          type: 'headline',
          position: 1,
          content: 'Complete Your Order',
          notes: 'Assumptive close',
        },
        {
          type: 'countdown',
          position: 2,
          placeholder: 'Order deadline countdown',
          notes: 'Maintain urgency',
        },
        {
          type: 'body',
          position: 3,
          content: `Today you're getting:
✓ [Main product]
✓ Bonus 1: [Name] ($[Value])
✓ Bonus 2: [Name] ($[Value])
✓ Bonus 3: [Name] ($[Value])

Total Value: $[Total Value]
Today's Price: $[Discounted Price]
You Save: $[Savings]`,
          notes: 'Value stack with pricing',
        },
        {
          type: 'form',
          position: 4,
          placeholder: 'Order form (name, email, payment)',
          notes: 'Simple checkout form',
        },
        {
          type: 'guarantee',
          position: 5,
          content: '30-Day Money-Back Guarantee',
          notes: 'Remove risk',
        },
        {
          type: 'button',
          position: 6,
          content: 'Complete My Order - $[Price]',
          notes: 'Show price on button',
        },
      ],
      bestPractices: [
        'Keep checkout simple',
        'Show value stack',
        'Display countdown timer',
        'Add guarantee prominently',
        'Use trust badges',
        'Single-column layout',
        'Remove navigation',
      ],
    },
  ],
};

// ============================================================================
// 4. E-COMMERCE TEMPLATES
// ============================================================================

export const ecommerceTripwire: FunnelTemplate = {
  id: 'ecommerce-tripwire',
  name: 'E-commerce Tripwire Funnel',
  description: 'Low-price frontend offer with upsells and order bumps to maximize customer value',
  category: 'ecommerce',
  complexity: 'medium',
  conversionRate: 30,
  estimatedSetupTime: '45 minutes',
  suggestedFor: [
    'Physical or digital products',
    'Acquiring customers profitably',
    'Building buyer list',
    'Maximizing cart value',
  ],
  tags: ['ecommerce', 'tripwire', 'upsells', 'aov-optimization'],
  steps: [
    {
      id: 'tripwire-offer',
      name: 'Tripwire Product Page',
      type: 'sales',
      description: 'Low-price offer ($7-$37) to convert prospects to buyers',
      colorScheme: {
        primary: '#10b981',
        secondary: '#059669',
        accent: '#f59e0b',
        background: '#ffffff',
      },
      elements: [
        {
          type: 'headline',
          position: 1,
          content: 'Get [Product Name] for Just $[Low Price]',
          notes: 'Lead with price for tripwire offers',
        },
        {
          type: 'subheadline',
          position: 2,
          content: 'Limited-time offer: Save [X]% and get [benefit]',
          notes: 'Emphasize discount and urgency',
        },
        {
          type: 'image',
          position: 3,
          placeholder: 'Product image or demo',
          notes: 'High-quality product imagery',
        },
        {
          type: 'countdown',
          position: 4,
          placeholder: 'Offer expiration countdown',
          notes: 'Create urgency (15-30 minute timer)',
        },
        {
          type: 'bullet-list',
          position: 5,
          content: `You're getting:
✓ [Feature/Benefit 1]
✓ [Feature/Benefit 2]
✓ [Feature/Benefit 3]
✓ [Bonus item]`,
          notes: 'Focus on benefits over features',
        },
        {
          type: 'button',
          position: 6,
          content: 'Add to Cart - Only $[Price]',
          notes: 'Show price on CTA',
        },
        {
          type: 'guarantee',
          position: 7,
          content: '60-Day Money-Back Guarantee',
          notes: 'Longer guarantee for physical products',
        },
        {
          type: 'testimonial',
          position: 8,
          placeholder: '3-5 customer reviews with photos',
          notes: 'Social proof from real customers',
        },
        {
          type: 'button',
          position: 9,
          content: 'Add to Cart - Only $[Price]',
          notes: 'Repeat CTA',
        },
      ],
      bestPractices: [
        'Price at $7-$37 for easy impulse purchase',
        'Use countdown timer (15-30 minutes)',
        'Show before/after or product in use',
        'Include real customer photos',
        'Add FAQ section',
        'Remove navigation to reduce exits',
        'Emphasize value vs regular price',
      ],
    },
    {
      id: 'checkout-order-bump',
      name: 'Checkout with Order Bump',
      type: 'checkout',
      description: 'Order form with checkbox upsell (order bump)',
      colorScheme: {
        primary: '#10b981',
        secondary: '#059669',
        accent: '#f59e0b',
        background: '#ffffff',
      },
      elements: [
        {
          type: 'headline',
          position: 1,
          content: 'Complete Your Order',
          notes: 'Simple, assumptive language',
        },
        {
          type: 'body',
          position: 2,
          content: `Order Summary:
[Product Name] - $[Price]`,
          notes: 'Clear order summary',
        },
        {
          type: 'form',
          position: 3,
          placeholder: 'Billing and shipping information',
          notes: 'Keep form fields minimal',
        },
        {
          type: 'body',
          position: 4,
          content: `🎁 SPECIAL ONE-TIME OFFER
☑️ YES! Add [Complementary Product] to my order for just $[Price]!

Normally $[Regular Price], today only $[Discount Price]

This offer is only available on this page and won't be shown again.`,
          notes: 'Order bump - checkbox upsell on checkout page',
        },
        {
          type: 'button',
          position: 5,
          content: 'Complete My Order',
          notes: 'Final checkout button',
        },
        {
          type: 'social-proof',
          position: 6,
          content: '🔒 Secure checkout • 2,847 orders this week',
          notes: 'Trust and social proof',
        },
      ],
      bestPractices: [
        'Add order bump (20-40% take rate)',
        'Make order bump complementary to main product',
        'Price order bump at 30-50% of main product',
        'Use checkbox for easy addition',
        'Emphasize one-time nature',
        'Add trust badges',
        'Show security indicators',
      ],
    },
    {
      id: 'upsell-oto1',
      name: 'One-Time Offer #1',
      type: 'upsell',
      description: 'Post-purchase upsell page',
      colorScheme: {
        primary: '#f59e0b',
        secondary: '#d97706',
        accent: '#dc2626',
        background: '#ffffff',
      },
      elements: [
        {
          type: 'headline',
          position: 1,
          content: 'Wait! Your Order Is Not Complete...',
          notes: 'Pattern interrupt to keep them on page',
        },
        {
          type: 'subheadline',
          position: 2,
          content: 'Special One-Time Offer: Add [Premium Version/Upgrade] for 50% Off',
          notes: 'Emphasize discount and exclusivity',
        },
        {
          type: 'video',
          position: 3,
          placeholder: 'Short upsell video (1-2 minutes)',
          notes: 'Quick video explaining upgrade value',
        },
        {
          type: 'body',
          position: 4,
          content: `Because you just purchased [Product], you're eligible for this exclusive upgrade:

✓ [Premium benefit 1]
✓ [Premium benefit 2]
✓ [Premium benefit 3]

Regular Price: $[Regular]
Today Only: $[Discounted] (SAVE $[Savings])

This is a ONE-TIME offer. If you leave this page, this deal is gone forever.`,
          notes: 'Emphasize exclusivity and scarcity',
        },
        {
          type: 'button',
          position: 5,
          content: 'YES! Upgrade My Order - Just $[Price]',
          notes: 'Positive acceptance button',
        },
        {
          type: 'button',
          position: 6,
          content: 'No thanks, I don\'t want this upgrade',
          notes: 'Negative decline button (smaller, different style)',
        },
      ],
      bestPractices: [
        'Show IMMEDIATELY after checkout',
        'No header/footer navigation',
        'Price at 1.5-3x main product',
        'Make it logical upgrade',
        '50-70% discount from "regular" price',
        'Emphasize one-time nature',
        'Use video for higher conversions',
        'Make "No" button less prominent',
      ],
    },
    {
      id: 'downsell-oto2',
      name: 'Downsell Offer',
      type: 'upsell',
      description: 'Lower-priced alternative if they decline first upsell',
      colorScheme: {
        primary: '#3b82f6',
        secondary: '#2563eb',
        accent: '#10b981',
        background: '#ffffff',
      },
      elements: [
        {
          type: 'headline',
          position: 1,
          content: 'Okay, I Understand...',
          notes: 'Acknowledge their decision',
        },
        {
          type: 'subheadline',
          position: 2,
          content: 'But before you go, let me offer you a special deal on [Lower-priced Product]',
          notes: 'Different, lower-priced product',
        },
        {
          type: 'body',
          position: 3,
          content: `I get it - [First Upsell] might be too much right now.

But you can still get [benefit] with [Downsell Product] for just $[Lower Price].

This is 70% off the regular price of $[Regular Price].`,
          notes: 'Empathize and offer alternative',
        },
        {
          type: 'bullet-list',
          position: 4,
          content: `You're getting:
✓ [Benefit 1]
✓ [Benefit 2]
✓ [Benefit 3]`,
          notes: 'Show value of downsell',
        },
        {
          type: 'button',
          position: 5,
          content: 'YES! Add This to My Order - $[Price]',
          notes: 'Acceptance CTA',
        },
        {
          type: 'button',
          position: 6,
          content: 'No thanks, continue to my purchase',
          notes: 'Final decline option',
        },
      ],
      bestPractices: [
        'Show only if they declined first upsell',
        'Price at 30-50% of first upsell',
        'Different product, not just cheaper version',
        'Still valuable and relevant',
        'Last chance messaging',
        'Simpler page than first upsell',
      ],
    },
    {
      id: 'order-confirmation',
      name: 'Order Confirmation',
      type: 'confirmation',
      description: 'Final confirmation with receipt and next steps',
      colorScheme: {
        primary: '#10b981',
        secondary: '#059669',
        accent: '#3b82f6',
        background: '#ffffff',
      },
      elements: [
        {
          type: 'headline',
          position: 1,
          content: 'Thank You! Your Order Is Confirmed',
          notes: 'Clear confirmation message',
        },
        {
          type: 'body',
          position: 2,
          content: `Order #[Order Number]
Confirmation email sent to: [Email]

Order Summary:
• [Product 1] - $[Price]
• [Product 2] - $[Price] (if applicable)
• [Product 3] - $[Price] (if applicable)

Total: $[Total Amount]`,
          notes: 'Complete order details',
        },
        {
          type: 'body',
          position: 3,
          content: `What happens next:
1. You'll receive a confirmation email within 5 minutes
2. [Physical product: Ships within 2-3 business days]
   [Digital product: Access your product immediately below]
3. Track your order at [link]`,
          notes: 'Set expectations',
        },
        {
          type: 'button',
          position: 4,
          placeholder: 'Access Your Product Now (for digital products)',
          notes: 'Immediate access for digital products',
        },
        {
          type: 'body',
          position: 5,
          content: 'Questions? Contact us at [email] or [phone]',
          notes: 'Support information',
        },
      ],
      bestPractices: [
        'Send confirmation email immediately',
        'Show complete order summary',
        'Provide access to digital products instantly',
        'Give tracking for physical products',
        'Set clear expectations for delivery',
        'Offer customer support contact',
        'Optional: Affiliate/referral program invitation',
      ],
    },
  ],
};

// ============================================================================
// 5. MEMBERSHIP TEMPLATES
// ============================================================================

export const membershipTrial: FunnelTemplate = {
  id: 'membership-trial',
  name: 'Membership Trial Funnel',
  description: '$1 trial or free trial funnel for subscription/membership sites',
  category: 'membership',
  complexity: 'medium',
  conversionRate: 35,
  estimatedSetupTime: '45 minutes',
  suggestedFor: [
    'Membership sites',
    'Subscription services',
    'Online courses',
    'Software/SaaS trials',
  ],
  tags: ['membership', 'trial', 'subscription', 'recurring-revenue'],
  steps: [
    {
      id: 'trial-landing',
      name: 'Trial Offer Landing Page',
      type: 'sales',
      description: 'Landing page promoting trial membership',
      colorScheme: {
        primary: '#6366f1', // Indigo
        secondary: '#4f46e5',
        accent: '#10b981',
        background: '#ffffff',
      },
      elements: [
        {
          type: 'headline',
          position: 1,
          content: 'Get Full Access to [Membership Name] for Just $1',
          notes: 'Lead with trial price',
        },
        {
          type: 'subheadline',
          position: 2,
          content: 'Try everything risk-free for 14 days. Cancel anytime.',
          notes: 'Emphasize trial period and easy cancellation',
        },
        {
          type: 'video',
          position: 3,
          placeholder: 'Video tour of membership area',
          notes: 'Show what is inside the membership',
        },
        {
          type: 'bullet-list',
          position: 4,
          content: `Your $1 trial includes:
✓ Access to all [X] training modules
✓ Private community access
✓ Weekly live coaching calls
✓ Resource library ($[Value])
✓ [Bonus feature]
✓ Priority email support`,
          notes: 'Complete feature list',
        },
        {
          type: 'body',
          position: 5,
          content: `Here's how it works:
• Today: Pay just $1 for 14-day trial
• Days 1-14: Full access to everything
• Day 15: Only if you love it, $[Monthly Price]/month
• Anytime: Cancel with 1 click, no questions asked`,
          notes: 'Clear trial mechanics',
        },
        {
          type: 'button',
          position: 6,
          content: 'Start My $1 Trial Now',
          notes: 'Emphasize low barrier',
        },
        {
          type: 'testimonial',
          position: 7,
          placeholder: '4-6 member testimonials with photos',
          notes: 'Social proof from current members',
        },
        {
          type: 'headline',
          position: 8,
          content: 'What Our Members Are Saying',
          notes: 'Testimonial section header',
        },
        {
          type: 'body',
          position: 9,
          content: 'See real results from [X] members inside',
          notes: 'Social proof introduction',
        },
        {
          type: 'guarantee',
          position: 10,
          content: 'Try It Risk-Free: Cancel Anytime During Your Trial',
          notes: 'Reduce risk',
        },
        {
          type: 'button',
          position: 11,
          content: 'Start My $1 Trial Now',
          notes: 'Repeat CTA',
        },
      ],
      bestPractices: [
        '$1 trial converts better than "free" (higher commitment)',
        'Be crystal clear about trial terms',
        'Show what is inside (screenshots/video)',
        'Emphasize easy cancellation',
        'Display member results/testimonials',
        'Add FAQ section about billing',
        'Show community activity if applicable',
      ],
    },
    {
      id: 'trial-checkout',
      name: 'Trial Checkout',
      type: 'checkout',
      description: 'Checkout for trial membership signup',
      colorScheme: {
        primary: '#10b981',
        secondary: '#059669',
        accent: '#6366f1',
        background: '#ffffff',
      },
      elements: [
        {
          type: 'headline',
          position: 1,
          content: 'Start Your 14-Day Trial',
          notes: 'Reinforce trial nature',
        },
        {
          type: 'body',
          position: 2,
          content: `Your order:
14-Day Trial Access to [Membership Name]

Today: $1.00
After trial (Day 15): $[Monthly Price]/month

Cancel anytime before Day 15 and you won't be charged again.`,
          notes: 'Crystal clear pricing',
        },
        {
          type: 'form',
          position: 3,
          placeholder: 'Name, Email, Password, Payment Info',
          notes: 'Create account + payment in one step',
        },
        {
          type: 'body',
          position: 4,
          content: '✓ By starting your trial, you agree to our Terms and understand you can cancel anytime.',
          notes: 'Legal disclosure',
        },
        {
          type: 'button',
          position: 5,
          content: 'Start My Trial - $1 Today',
          notes: 'Show today charge',
        },
        {
          type: 'social-proof',
          position: 6,
          content: '🔒 Secure checkout • Cancel anytime',
          notes: 'Trust and reassurance',
        },
      ],
      bestPractices: [
        'Make trial terms extremely clear',
        'Show exactly what they pay today vs later',
        'Allow easy cancellation',
        'Send immediate welcome email',
        'Create account + process payment in one step',
        'Add trust badges',
        'Disclose trial-to-paid clearly',
      ],
    },
    {
      id: 'trial-welcome',
      name: 'Trial Welcome / Onboarding',
      type: 'thank-you',
      description: 'Welcome page with onboarding steps',
      colorScheme: {
        primary: '#10b981',
        secondary: '#059669',
        accent: '#6366f1',
        background: '#ffffff',
      },
      elements: [
        {
          type: 'headline',
          position: 1,
          content: 'Welcome to [Membership Name]! 🎉',
          notes: 'Warm welcome',
        },
        {
          type: 'subheadline',
          position: 2,
          content: 'Your 14-day trial starts now. Here\'s how to get the most out of your membership:',
          notes: 'Set expectations',
        },
        {
          type: 'body',
          position: 3,
          content: `Quick Start Checklist:
☐ Step 1: Complete your profile
☐ Step 2: Watch the welcome video
☐ Step 3: Download the quick-start guide
☐ Step 4: Join the private community
☐ Step 5: Attend the next live coaching call`,
          notes: 'Action-oriented onboarding',
        },
        {
          type: 'video',
          position: 4,
          placeholder: 'Welcome video from founder',
          notes: 'Personal connection',
        },
        {
          type: 'button',
          position: 5,
          content: 'Access Your Member Dashboard',
          notes: 'Direct access to membership',
        },
        {
          type: 'body',
          position: 6,
          content: `Important dates:
• Today: Your trial starts
• Day 7: Check-in email from our team
• Day 13: Trial ending reminder
• Day 15: First monthly payment (unless you cancel)

Manage your subscription anytime in your account settings.`,
          notes: 'Timeline transparency',
        },
      ],
      bestPractices: [
        'Give clear onboarding steps',
        'Immediate access to member area',
        'Send welcome email series',
        'Show quick wins',
        'Build engagement early',
        'Make cancellation easy to find',
        'Set trial-end expectations',
        'Personal welcome video from founder',
      ],
    },
  ],
};

// ============================================================================
// 6. SUMMIT/EVENT TEMPLATES
// ============================================================================

export const virtualSummit: FunnelTemplate = {
  id: 'virtual-summit',
  name: 'Virtual Summit Funnel',
  description: 'Multi-day virtual summit with free registration and all-access pass upsell',
  category: 'summit',
  complexity: 'advanced',
  conversionRate: 50,
  estimatedSetupTime: '90 minutes',
  suggestedFor: [
    'Virtual summits and conferences',
    'Multi-speaker events',
    'List building at scale',
    'Building authority and partnerships',
  ],
  tags: ['summit', 'event', 'list-building', 'partnerships'],
  steps: [
    {
      id: 'summit-registration',
      name: 'Summit Registration Page',
      type: 'landing',
      description: 'Free registration page for virtual summit',
      colorScheme: {
        primary: '#7c3aed', // Purple
        secondary: '#6d28d9',
        accent: '#f59e0b',
        background: '#ffffff',
      },
      elements: [
        {
          type: 'headline',
          position: 1,
          content: '[Summit Name]: Free Online Summit',
          notes: 'Clear event name and "free"',
        },
        {
          type: 'subheadline',
          position: 2,
          content: 'Join [X] world-class experts teaching [topic] • [Dates]',
          notes: 'Show value (speaker count) and specific dates',
        },
        {
          type: 'countdown',
          position: 3,
          placeholder: 'Countdown to summit start',
          notes: 'Create urgency for registration',
        },
        {
          type: 'video',
          position: 4,
          placeholder: 'Summit promo video with speaker highlights',
          notes: 'Show snippets from speakers',
        },
        {
          type: 'form',
          position: 5,
          placeholder: 'Name and Email',
          notes: 'Simple registration',
        },
        {
          type: 'button',
          position: 6,
          content: 'Save My Free Spot',
          notes: 'Imply scarcity',
        },
        {
          type: 'body',
          position: 7,
          content: `Meet your speakers:
[Speaker 1 - Photo, Name, Credentials, Topic]
[Speaker 2 - Photo, Name, Credentials, Topic]
[Speaker 3 - Photo, Name, Credentials, Topic]
... [List all speakers with photos]`,
          notes: 'Speaker showcase - this is your main value prop',
        },
        {
          type: 'bullet-list',
          position: 8,
          content: `You'll learn:
• [Key learning 1]
• [Key learning 2]
• [Key learning 3]
• [Key learning 4]
• [Key learning 5]`,
          notes: 'Learning outcomes',
        },
        {
          type: 'body',
          position: 9,
          content: `How it works:
• Register free above
• Get the full schedule via email
• Watch sessions live during [dates]
• Each session available for 24 hours
• Q&A with speakers (live attendees only)`,
          notes: 'Clear event mechanics',
        },
        {
          type: 'social-proof',
          position: 10,
          content: '[X] people registered • [Past summit stats if applicable]',
          notes: 'Show growing registrations',
        },
        {
          type: 'button',
          position: 11,
          content: 'Save My Free Spot',
          notes: 'Repeat CTA',
        },
      ],
      bestPractices: [
        'Lead with speaker headshots and credentials',
        'Update registration count regularly',
        'Create video montage of speakers',
        'Show specific dates and schedule',
        'Emphasize "free" registration',
        'Show previous summit success if applicable',
        'Mobile-optimized speaker grid',
      ],
    },
    {
      id: 'summit-confirmation-upsell',
      name: 'Registration Confirmation + All-Access Upsell',
      type: 'thank-you',
      description: 'Confirm registration and offer all-access pass upgrade',
      colorScheme: {
        primary: '#10b981',
        secondary: '#059669',
        accent: '#7c3aed',
        background: '#ffffff',
      },
      elements: [
        {
          type: 'headline',
          position: 1,
          content: 'You\'re Registered! 🎉',
          notes: 'Confirm successful registration',
        },
        {
          type: 'body',
          position: 2,
          content: `Check your email at [email] for:
• Full summit schedule
• Speaker session links
• Bonus resources
• Zoom links for live Q&A`,
          notes: 'Set expectations',
        },
        {
          type: 'headline',
          position: 3,
          content: 'Wait! Want LIFETIME Access to Everything?',
          notes: 'Transition to upsell',
        },
        {
          type: 'subheadline',
          position: 4,
          content: 'Upgrade to the All-Access Pass and get permanent access to all sessions, transcripts, and bonuses',
          notes: 'Explain upgrade benefits',
        },
        {
          type: 'body',
          position: 5,
          content: `Free Registration includes:
✓ Live access to all sessions
✓ 24-hour replays
✓ Live Q&A with speakers

All-Access Pass adds:
✓ LIFETIME access to all recordings
✓ Downloadable video + audio files
✓ Full transcripts of every session
✓ Speaker slide decks and resources
✓ Private All-Access community
✓ Monthly bonus training ($[Value])
✓ [X] exclusive bonus interviews

Total Value: $[Total Value]
Today Only: $[Price]
You Save: $[Savings]`,
          notes: 'Clear value comparison',
        },
        {
          type: 'countdown',
          position: 6,
          placeholder: 'Early bird pricing countdown',
          notes: 'Urgency for upgrade pricing',
        },
        {
          type: 'button',
          position: 7,
          content: 'Upgrade to All-Access Pass - $[Price]',
          notes: 'Upgrade CTA',
        },
        {
          type: 'testimonial',
          position: 8,
          placeholder: 'Testimonials from past All-Access members',
          notes: 'Social proof for the upgrade',
        },
        {
          type: 'button',
          position: 9,
          content: 'No thanks, I\'ll stick with free access',
          notes: 'Decline option',
        },
      ],
      bestPractices: [
        'Offer All-Access immediately after registration',
        'Price at $97-$297 depending on speaker count',
        'Early bird discount (first 100, first 24 hours, etc.)',
        'Use countdown timer for early bird pricing',
        'Show clear free vs paid comparison',
        'Add testimonials from previous All-Access buyers',
        'Make upgrade available throughout summit',
      ],
    },
    {
      id: 'summit-access',
      name: 'Summit Access Page',
      type: 'landing',
      description: 'Daily access page for free registrants',
      colorScheme: {
        primary: '#7c3aed',
        secondary: '#6d28d9',
        accent: '#f59e0b',
        background: '#ffffff',
      },
      elements: [
        {
          type: 'headline',
          position: 1,
          content: 'Day [X] Sessions - Available for 24 Hours',
          notes: 'Show current day',
        },
        {
          type: 'countdown',
          position: 2,
          placeholder: 'Countdown to session expiration',
          notes: 'Create urgency to watch',
        },
        {
          type: 'body',
          position: 3,
          content: `Today's Sessions:
[Session 1 - Speaker Name, Topic, Watch Time]
[Session 2 - Speaker Name, Topic, Watch Time]
[Session 3 - Speaker Name, Topic, Watch Time]`,
          notes: 'Current day schedule',
        },
        {
          type: 'video',
          position: 4,
          placeholder: 'Embedded video player for sessions',
          notes: 'Session video players',
        },
        {
          type: 'body',
          position: 5,
          content: '⚠️ These sessions expire in [X] hours. Upgrade to All-Access for lifetime viewing.',
          notes: 'Reminder of limited access',
        },
        {
          type: 'button',
          position: 6,
          content: 'Get Lifetime Access - All-Access Pass',
          notes: 'Upgrade reminder CTA',
        },
      ],
      bestPractices: [
        'Send daily email with access links',
        'Show countdown for session availability',
        'Remind about All-Access upgrade',
        'Show next day teaser',
        'Enable commenting/discussion',
        'Track viewing completion',
        'Reminder emails before expiration',
      ],
    },
    {
      id: 'summit-replay',
      name: 'Post-Summit Replay Offer',
      type: 'sales',
      description: 'Last chance offer for all-access after summit ends',
      colorScheme: {
        primary: '#dc2626',
        secondary: '#b91c1c',
        accent: '#f59e0b',
        background: '#000000',
      },
      elements: [
        {
          type: 'headline',
          position: 1,
          content: 'Last Chance for Lifetime Access',
          notes: 'Create urgency post-summit',
        },
        {
          type: 'countdown',
          position: 2,
          placeholder: 'Final offer expiration (48-72 hours)',
          notes: 'Strict deadline',
        },
        {
          type: 'body',
          position: 3,
          content: `[Summit Name] is over, but you can still get:

✓ Lifetime access to all [X] sessions
✓ Downloadable recordings
✓ Transcripts and resources
✓ Bonus interviews
✓ Private community access

This is your LAST CHANCE to get lifetime access.
After [Date/Time], this offer disappears forever.

Regular Price: $[Regular]
Final Discount: $[Price]
You Save: $[Savings]`,
          notes: 'Final urgency push',
        },
        {
          type: 'button',
          position: 4,
          content: 'Get Lifetime Access Now - $[Price]',
          notes: 'Final CTA',
        },
        {
          type: 'testimonial',
          position: 5,
          placeholder: 'Testimonials from All-Access members',
          notes: 'Social proof',
        },
        {
          type: 'guarantee',
          position: 6,
          content: '30-Day Money-Back Guarantee',
          notes: 'Remove risk',
        },
        {
          type: 'button',
          position: 7,
          content: 'Get Lifetime Access Now - $[Price]',
          notes: 'Repeat CTA',
        },
      ],
      bestPractices: [
        'Send immediately after summit ends',
        'Strict 48-72 hour deadline',
        'Higher price than early bird',
        'Emphasize "last chance"',
        'Show what they will miss',
        'Remove access to free replays',
        'Final email sequence (24h, 12h, 1h, last call)',
      ],
    },
  ],
};

// ============================================================================
// TEMPLATE REGISTRY
// ============================================================================

export const FUNNEL_TEMPLATES: FunnelTemplate[] = [
  // Lead Generation
  leadMagnetBasic,
  leadMagnetQuiz,

  // Product Launch
  productLaunchSeed,

  // Webinar
  webinarBasic,

  // E-commerce
  ecommerceTripwire,

  // Membership
  membershipTrial,

  // Summit
  virtualSummit,
];

// Export by category
export const TEMPLATES_BY_CATEGORY = {
  'lead-gen': [leadMagnetBasic, leadMagnetQuiz],
  'product-launch': [productLaunchSeed],
  'webinar': [webinarBasic],
  'ecommerce': [ecommerceTripwire],
  'membership': [membershipTrial],
  'summit': [virtualSummit],
};

// Export by complexity
export const TEMPLATES_BY_COMPLEXITY = {
  simple: [leadMagnetBasic],
  medium: [leadMagnetQuiz, productLaunchSeed, webinarBasic, ecommerceTripwire, membershipTrial],
  advanced: [virtualSummit],
};
