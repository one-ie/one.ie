/**
 * Feature Recommender Service
 *
 * Recommends features based on website analysis
 */

import { Effect } from "effect";
import type { DetectedFeatures } from "./websiteAnalyzer";

export interface Feature {
  id: string;
  name: string;
  category: 'foundation' | 'content' | 'monetization' | 'community' | 'ai' | 'platform';
  description: string;
  cycleRange: string;
  estimatedMinutes: number;
  required: boolean;
  dependencies?: string[];
}

export interface FeatureRecommendation {
  feature: Feature;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Feature catalog
 */
const FEATURES: Record<string, Feature> = {
  'landing-page': {
    id: 'landing-page',
    name: 'Landing Page',
    category: 'foundation',
    description: 'Responsive landing page with hero, features, and CTA',
    cycleRange: 'Infer 1-10',
    estimatedMinutes: 5,
    required: true
  },
  'authentication': {
    id: 'authentication',
    name: 'Authentication',
    category: 'foundation',
    description: 'Email/password, OAuth, magic links, 2FA',
    cycleRange: 'Infer 11-20',
    estimatedMinutes: 10,
    required: true
  },
  'multi-tenant': {
    id: 'multi-tenant',
    name: 'Multi-Tenant Groups',
    category: 'foundation',
    description: 'Hierarchical group structure with isolation',
    cycleRange: 'Infer 21-30',
    estimatedMinutes: 10,
    required: true
  },
  'blog-cms': {
    id: 'blog-cms',
    name: 'Blog CMS',
    category: 'content',
    description: 'Create, edit, and publish blog posts',
    cycleRange: 'Infer 31-40',
    estimatedMinutes: 15,
    required: false,
    dependencies: ['authentication', 'multi-tenant']
  },
  'video-library': {
    id: 'video-library',
    name: 'Video Library',
    category: 'content',
    description: 'Upload, organize, and stream videos',
    cycleRange: 'Infer 41-50',
    estimatedMinutes: 20,
    required: false,
    dependencies: ['authentication', 'multi-tenant']
  },
  'course-platform': {
    id: 'course-platform',
    name: 'Course Platform',
    category: 'content',
    description: 'Create courses with lessons, enrollment, progress tracking',
    cycleRange: 'Infer 51-60',
    estimatedMinutes: 25,
    required: false,
    dependencies: ['authentication', 'multi-tenant']
  },
  'membership-tiers': {
    id: 'membership-tiers',
    name: 'Membership Tiers',
    category: 'monetization',
    description: 'Multiple membership levels with different benefits',
    cycleRange: 'Infer 61-70',
    estimatedMinutes: 15,
    required: false,
    dependencies: ['authentication', 'multi-tenant']
  },
  'product-store': {
    id: 'product-store',
    name: 'Product Store',
    category: 'monetization',
    description: 'Sell digital products and downloads',
    cycleRange: 'Infer 71-80',
    estimatedMinutes: 20,
    required: false,
    dependencies: ['authentication', 'multi-tenant']
  },
  'discord-integration': {
    id: 'discord-integration',
    name: 'Discord Integration',
    category: 'community',
    description: 'Connect Discord for community management',
    cycleRange: 'Infer 81-90',
    estimatedMinutes: 10,
    required: false,
    dependencies: ['authentication', 'multi-tenant']
  },
  'real-time-sync': {
    id: 'real-time-sync',
    name: 'Real-Time Sync',
    category: 'platform',
    description: 'WebSocket-based real-time data synchronization',
    cycleRange: 'Infer 11-20',
    estimatedMinutes: 15,
    required: false,
    dependencies: ['multi-tenant']
  },
  'ai-agents': {
    id: 'ai-agents',
    name: 'AI Agents',
    category: 'ai',
    description: '10 business agents (strategy, marketing, sales, etc.)',
    cycleRange: 'Infer 61-70',
    estimatedMinutes: 20,
    required: false,
    dependencies: ['authentication', 'multi-tenant']
  },
  'rag-knowledge': {
    id: 'rag-knowledge',
    name: 'RAG Knowledge Base',
    category: 'ai',
    description: 'Vector embeddings and semantic search',
    cycleRange: 'Infer 71-80',
    estimatedMinutes: 15,
    required: false,
    dependencies: ['multi-tenant']
  }
};

/**
 * Recommend features based on detected features
 */
export const recommendFeatures = (
  detected: DetectedFeatures
): Effect.Effect<FeatureRecommendation[], never> =>
  Effect.sync(() => {
    const recommendations: FeatureRecommendation[] = [];

    // Always recommend foundation
    recommendations.push({
      feature: FEATURES['landing-page'],
      reason: 'Essential foundation for any platform',
      priority: 'high'
    });

    recommendations.push({
      feature: FEATURES['authentication'],
      reason: 'Required for user management and security',
      priority: 'high'
    });

    recommendations.push({
      feature: FEATURES['multi-tenant'],
      reason: 'Core architecture for scalable multi-tenant platform',
      priority: 'high'
    });

    // Content-based recommendations
    if (detected.contentTypes.includes('blog')) {
      recommendations.push({
        feature: FEATURES['blog-cms'],
        reason: 'Detected blog content on your website',
        priority: 'high'
      });
    }

    if (detected.contentTypes.includes('video')) {
      recommendations.push({
        feature: FEATURES['video-library'],
        reason: 'Detected video content on your website',
        priority: 'high'
      });
    }

    if (detected.contentTypes.includes('courses')) {
      recommendations.push({
        feature: FEATURES['course-platform'],
        reason: 'Detected courses on your website',
        priority: 'high'
      });
    }

    // Monetization-based recommendations
    if (detected.monetization.includes('subscriptions')) {
      recommendations.push({
        feature: FEATURES['membership-tiers'],
        reason: 'Detected subscription business model',
        priority: 'medium'
      });
    }

    if (detected.monetization.includes('one-time-sales')) {
      recommendations.push({
        feature: FEATURES['product-store'],
        reason: 'Detected product sales on your website',
        priority: 'medium'
      });
    }

    // Community-based recommendations
    if (detected.community.includes('discord')) {
      recommendations.push({
        feature: FEATURES['discord-integration'],
        reason: 'Detected Discord community',
        priority: 'medium'
      });
    }

    // Tech stack-based recommendations
    if (detected.techStack?.backend === 'Convex') {
      recommendations.push({
        feature: FEATURES['real-time-sync'],
        reason: 'Convex enables powerful real-time features',
        priority: 'medium'
      });
    }

    // AI recommendations (always suggest)
    recommendations.push({
      feature: FEATURES['ai-agents'],
      reason: 'AI agents can automate business operations',
      priority: 'low'
    });

    recommendations.push({
      feature: FEATURES['rag-knowledge'],
      reason: 'Semantic search improves content discoverability',
      priority: 'low'
    });

    return recommendations;
  });

/**
 * Calculate total estimated time
 */
export const calculateTotalTime = (
  features: Feature[]
): number => {
  return features.reduce((sum, f) => sum + f.estimatedMinutes, 0);
};

/**
 * Run feature recommendation pipeline
 */
export const runFeatureRecommendation = async (
  detected: DetectedFeatures
): Promise<FeatureRecommendation[]> => {
  return await Effect.runPromise(
    recommendFeatures(detected)
  );
};
