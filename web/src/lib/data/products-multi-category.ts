/**
 * Multi-Category Product Database
 *
 * Example products across different verticals demonstrating
 * universal commerce architecture
 */

import type { Product } from '@/lib/types/commerce';

export const PRODUCTS_BY_CATEGORY: Record<string, Product[]> = {
  padel_racket: [
    {
      id: 'racket-1',
      name: 'StarVie Metheora Warrior',
      price: 139,
      currency: '€',
      description:
        'Perfect for aggressive players who also need elbow protection. Soft carbon-fiber core reduces vibration while maintaining excellent power.',
      image: '/images/products/metheora-warrior.jpg',
      category: 'padel_racket',
      rating: 4.9,
      reviewCount: 127,
      inStock: true,
      aiDescription:
        'A high-performance racket designed for aggressive players who need elbow protection. Features soft carbon-fiber core that reduces vibration by 40% while maintaining 95% power transfer.',
      aiUseCases: [
        'Aggressive baseline play',
        'Players with tennis elbow',
        'Intermediate to advanced players',
        'Hard-hitting with control needs',
      ],
      aiTargetAudience: [
        'Intermediate players',
        'Advanced players',
        'Players with elbow sensitivity',
        'Power-focused players',
      ],
      aiBestFor: 'Players who want power without sacrificing joint health',
      aiAvoidWhen: 'Complete beginners who need maximum forgiveness',
      aiComparisonPoints: {
        power: 'High (9/10)',
        control: 'Medium-High (7/10)',
        comfort: 'Excellent (9/10)',
        durability: 'Very Good (8/10)',
        weight: '365g (Medium)',
        sweetSpot: 'Large',
      },
      aiKeywords: [
        'power',
        'aggressive',
        'tennis elbow',
        'soft core',
        'intermediate',
        'advanced',
        'vibration dampening',
      ],
      aiSimilarProducts: ['racket-2', 'racket-3'],
      aiOftenBoughtWith: ['grip-1', 'bag-1'],
      aiUpgradeTo: ['racket-pro-1'],
      attributes: {
        shape: 'Diamond',
        balance: 'High',
        weight: 365,
        core: 'Soft EVA',
        face: 'Carbon Fiber',
      },
    },
    {
      id: 'racket-2',
      name: 'Bullpadel Vertex 03',
      price: 89,
      currency: '€',
      description:
        'Ideal for beginners and intermediate players. Great control with forgiving sweet spot. Lightweight design reduces fatigue.',
      image: '/images/products/vertex-03.jpg',
      category: 'padel_racket',
      rating: 4.7,
      reviewCount: 89,
      inStock: true,
      aiDescription:
        'Perfect beginner-to-intermediate racket with emphasis on control and forgiveness. Lightweight construction helps develop proper technique without arm fatigue.',
      aiUseCases: [
        'Learning proper technique',
        'Recreational play',
        'Defensive playing style',
        'Players building stamina',
      ],
      aiTargetAudience: [
        'Beginners',
        'Intermediate players',
        'Defensive players',
        'Players under €100 budget',
      ],
      aiBestFor: 'First-time padel players or those prioritizing control',
      aiAvoidWhen: 'Advanced players seeking maximum power',
      aiComparisonPoints: {
        power: 'Medium (6/10)',
        control: 'Excellent (9/10)',
        comfort: 'Very Good (8/10)',
        durability: 'Good (7/10)',
        weight: '355g (Light)',
        sweetSpot: 'Very Large',
      },
      aiKeywords: [
        'beginner',
        'control',
        'lightweight',
        'budget',
        'forgiving',
        'defensive',
      ],
      aiSimilarProducts: ['racket-1', 'racket-3'],
      aiOftenBoughtWith: ['balls-1', 'bag-2'],
      aiUpgradeTo: ['racket-1'],
      attributes: {
        shape: 'Round',
        balance: 'Low',
        weight: 355,
        core: 'Soft EVA',
        face: 'Fiberglass',
      },
    },
    {
      id: 'racket-3',
      name: 'Adidas Metalbone 3.2',
      price: 199,
      currency: '€',
      description:
        'Professional-grade racket for advanced players. Maximum power with octagonal frame structure. Requires good technique.',
      image: '/images/products/metalbone-32.jpg',
      category: 'padel_racket',
      rating: 4.8,
      reviewCount: 156,
      inStock: true,
      aiDescription:
        'Tournament-level racket designed for advanced players with solid technique. Octagonal frame provides exceptional rigidity and power transfer.',
      aiUseCases: [
        'Competitive tournament play',
        'Offensive baseline attacks',
        'Experienced players seeking maximum power',
        'Players with excellent technique',
      ],
      aiTargetAudience: [
        'Advanced players',
        'Competitive players',
        'Offensive players',
        'Players with strong technique',
      ],
      aiBestFor: 'Advanced players who can handle stiff rackets and want maximum power',
      aiAvoidWhen: 'Beginners, players with elbow issues, or those needing forgiveness',
      aiComparisonPoints: {
        power: 'Maximum (10/10)',
        control: 'Medium (6/10)',
        comfort: 'Low (5/10)',
        durability: 'Excellent (9/10)',
        weight: '375g (Heavy)',
        sweetSpot: 'Medium',
      },
      aiKeywords: [
        'advanced',
        'power',
        'tournament',
        'competitive',
        'offensive',
        'professional',
      ],
      aiSimilarProducts: ['racket-1'],
      aiOftenBoughtWith: ['overgrip-1', 'wristband-1'],
      aiUpgradeTo: [],
      attributes: {
        shape: 'Diamond',
        balance: 'Very High',
        weight: 375,
        core: 'Hard EVA',
        face: 'Carbon Aluminized',
      },
    },
  ],

  course: [
    {
      id: 'course-1',
      name: 'Complete Web Development Bootcamp 2024',
      price: 49,
      currency: '$',
      description:
        'Learn HTML, CSS, JavaScript, React, Node.js, and MongoDB. Build 15+ real projects. Perfect for complete beginners.',
      image: '/images/courses/web-bootcamp.jpg',
      category: 'course',
      rating: 4.8,
      reviewCount: 12453,
      inStock: true,
      aiDescription:
        'Comprehensive web development course covering frontend and backend. Self-paced with lifetime access. Includes 60 hours of video, coding exercises, and portfolio projects.',
      aiUseCases: [
        'Career change to web development',
        'Building freelance skills',
        'Starting tech startup',
        'Upgrading from basic HTML/CSS',
      ],
      aiTargetAudience: [
        'Complete beginners',
        'Career changers',
        'Freelancers',
        'Entrepreneurs',
      ],
      aiBestFor: 'Anyone starting from zero who wants full-stack skills',
      aiAvoidWhen: 'Already experienced developers seeking advanced topics',
      aiComparisonPoints: {
        skillLevel: 'Beginner to Intermediate',
        duration: '60 hours video + projects',
        support: 'Q&A forum + community',
        projects: '15 portfolio projects',
        updates: 'Lifetime free updates',
        certificate: 'Yes',
      },
      aiKeywords: [
        'beginner',
        'web development',
        'full-stack',
        'career change',
        'react',
        'node.js',
      ],
      aiSimilarProducts: ['course-2', 'course-3'],
      aiOftenBoughtWith: ['course-hosting-1'],
      aiUpgradeTo: ['course-advanced-react'],
      attributes: {
        format: 'Video + exercises',
        duration: '60 hours',
        level: 'Beginner',
        language: 'English',
        subtitles: ['Spanish', 'French', 'German'],
      },
    },
    {
      id: 'course-2',
      name: 'Advanced React & TypeScript Masterclass',
      price: 79,
      currency: '$',
      description:
        'Deep dive into React patterns, TypeScript, testing, and performance. For developers with React basics.',
      image: '/images/courses/react-advanced.jpg',
      category: 'course',
      rating: 4.9,
      reviewCount: 3421,
      inStock: true,
      aiDescription:
        'Advanced-level course focusing on production-ready React applications. Covers hooks patterns, TypeScript integration, testing strategies, and performance optimization.',
      aiUseCases: [
        'Leveling up React skills',
        'Building enterprise applications',
        'Improving code quality',
        'Learning TypeScript with React',
      ],
      aiTargetAudience: [
        'Intermediate React developers',
        'Frontend engineers',
        'Teams adopting TypeScript',
        'Developers seeking best practices',
      ],
      aiBestFor: 'React developers ready to write production-grade code',
      aiAvoidWhen: 'Complete beginners or those new to React',
      aiComparisonPoints: {
        skillLevel: 'Intermediate to Advanced',
        duration: '40 hours video + projects',
        support: 'Live Q&A + Discord',
        projects: '5 advanced projects',
        updates: 'Free updates for 2 years',
        certificate: 'Yes',
      },
      aiKeywords: [
        'advanced',
        'react',
        'typescript',
        'intermediate',
        'testing',
        'performance',
      ],
      aiSimilarProducts: ['course-3'],
      aiOftenBoughtWith: ['course-1'],
      aiUpgradeTo: [],
      attributes: {
        format: 'Video + live sessions',
        duration: '40 hours',
        level: 'Advanced',
        language: 'English',
        prerequisites: 'Basic React knowledge',
      },
    },
    {
      id: 'course-3',
      name: 'AI & Machine Learning for Beginners',
      price: 59,
      currency: '$',
      description:
        'Learn AI fundamentals, Python, and build ML models. No math PhD required. Practical, hands-on approach.',
      image: '/images/courses/ai-ml-beginners.jpg',
      category: 'course',
      rating: 4.7,
      reviewCount: 8976,
      inStock: true,
      aiDescription:
        'Beginner-friendly introduction to AI and machine learning using Python. Focuses on practical applications without requiring advanced mathematics.',
      aiUseCases: [
        'Understanding AI fundamentals',
        'Building simple ML models',
        'Adding AI to existing products',
        'Career pivot to AI field',
      ],
      aiTargetAudience: [
        'Python beginners',
        'Developers curious about AI',
        'Product managers',
        'Entrepreneurs',
      ],
      aiBestFor: 'Anyone wanting to understand and build with AI without deep math background',
      aiAvoidWhen: 'Seeking PhD-level theoretical AI knowledge',
      aiComparisonPoints: {
        skillLevel: 'Beginner',
        duration: '35 hours video + projects',
        support: 'Q&A + email support',
        projects: '8 ML projects',
        updates: 'Lifetime free updates',
        certificate: 'Yes',
      },
      aiKeywords: [
        'beginner',
        'ai',
        'machine learning',
        'python',
        'practical',
        'no math',
      ],
      aiSimilarProducts: ['course-1'],
      aiOftenBoughtWith: ['course-python-basics'],
      aiUpgradeTo: ['course-advanced-ml'],
      attributes: {
        format: 'Video + Jupyter notebooks',
        duration: '35 hours',
        level: 'Beginner',
        language: 'English',
        tools: ['Python', 'TensorFlow', 'scikit-learn'],
      },
    },
  ],

  software: [
    {
      id: 'software-1',
      name: 'ProjectHub Starter',
      price: 29,
      currency: '$',
      description:
        'Project management for small teams (up to 10 users). Kanban boards, time tracking, file sharing.',
      image: '/images/software/projecthub.jpg',
      category: 'software',
      rating: 4.6,
      reviewCount: 543,
      inStock: true,
      aiDescription:
        'Lightweight project management SaaS for startups and small teams. Easy setup, no training required. Monthly subscription with cancel anytime.',
      aiUseCases: [
        'Startup project tracking',
        'Small agency work',
        'Freelance client management',
        'Remote team coordination',
      ],
      aiTargetAudience: [
        'Startups (2-10 people)',
        'Freelancers',
        'Small agencies',
        'Remote teams',
      ],
      aiBestFor: 'Small teams wanting simple, affordable project management',
      aiAvoidWhen: 'Large enterprises needing complex workflows',
      aiComparisonPoints: {
        users: 'Up to 10 users',
        storage: '100GB',
        integrations: '15+ tools (Slack, GitHub, etc.)',
        support: 'Email support',
        uptime: '99.5% SLA',
        onboarding: 'Self-serve',
      },
      aiKeywords: [
        'project management',
        'small team',
        'startup',
        'affordable',
        'kanban',
      ],
      aiSimilarProducts: ['software-2'],
      aiOftenBoughtWith: [],
      aiUpgradeTo: ['software-2'],
      attributes: {
        billing: 'Monthly',
        users: 10,
        trial: '14 days',
        cancel: 'Anytime',
      },
    },
    {
      id: 'software-2',
      name: 'ProjectHub Business',
      price: 99,
      currency: '$',
      description:
        'Advanced project management for growing companies (up to 50 users). Custom workflows, API access, priority support.',
      image: '/images/software/projecthub-business.jpg',
      category: 'software',
      rating: 4.8,
      reviewCount: 234,
      inStock: true,
      aiDescription:
        'Professional-grade project management with advanced features. Custom workflows, API integrations, dedicated support. For teams scaling past startup phase.',
      aiUseCases: [
        'Growing companies',
        'Multiple departments',
        'Client project management',
        'Complex workflow needs',
      ],
      aiTargetAudience: [
        'Mid-size companies (10-50 people)',
        'Agencies with multiple clients',
        'Teams needing customization',
        'Companies with developers',
      ],
      aiBestFor: 'Growing teams needing more power and customization',
      aiAvoidWhen: 'Very small teams or those needing simplicity',
      aiComparisonPoints: {
        users: 'Up to 50 users',
        storage: '1TB',
        integrations: 'Unlimited + API',
        support: 'Priority email + chat',
        uptime: '99.9% SLA',
        onboarding: 'Guided setup call',
      },
      aiKeywords: [
        'business',
        'growing team',
        'custom workflows',
        'api',
        'priority support',
      ],
      aiSimilarProducts: ['software-1'],
      aiOftenBoughtWith: [],
      aiUpgradeTo: [],
      attributes: {
        billing: 'Monthly or Annual',
        users: 50,
        trial: '30 days',
        cancel: 'Anytime',
      },
    },
  ],
};

// Helper to get products by category
export function getProductsByCategory(category: string): Product[] {
  return PRODUCTS_BY_CATEGORY[category] || [];
}

// Helper to get product by ID across all categories
export function getProductById(productId: string): Product | undefined {
  for (const products of Object.values(PRODUCTS_BY_CATEGORY)) {
    const product = products.find((p) => p.id === productId);
    if (product) return product;
  }
  return undefined;
}

// Get all products
export function getAllProducts(): Product[] {
  return Object.values(PRODUCTS_BY_CATEGORY).flat();
}
