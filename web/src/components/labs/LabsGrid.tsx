/**
 * LabsGrid Component
 *
 * Displays grid of all experimental features
 * Handles filtering, search, and interaction with experiments
 */

import React, { useState, useEffect } from 'react';
import { ExperimentCard } from './ExperimentCard';
import { Loader2 } from 'lucide-react';

// Mock data for the 7 experiments (will be replaced with Convex queries)
const EXPERIMENTS = [
  {
    id: 'exp-1',
    name: 'Multi-modal Clones',
    description:
      'Voice + video + text responses in a single conversation. Automatic mode switching based on user preference and context.',
    experimentType: 'multimodal',
    status: 'active' as const,
    isEnabled: false,
    usageCount: 127,
    feedbackCount: 23,
    avgRating: 4.2,
    properties: {
      icon: '🎭',
      category: 'multimodal',
      difficulty: 'medium' as const,
      estimatedTime: '5 min setup',
      tags: ['voice', 'video', 'ai', 'multimodal'],
    },
  },
  {
    id: 'exp-2',
    name: 'Real-time Voice Conversation',
    description:
      'WebRTC-powered phone-like conversations with sub-second latency. Interrupt handling and natural conversation flow.',
    experimentType: 'realtime',
    status: 'active' as const,
    isEnabled: false,
    usageCount: 89,
    feedbackCount: 15,
    avgRating: 4.7,
    properties: {
      icon: '📞',
      category: 'realtime',
      difficulty: 'hard' as const,
      estimatedTime: '10 min setup',
      tags: ['voice', 'webrtc', 'realtime', 'low-latency'],
    },
  },
  {
    id: 'exp-3',
    name: 'Clone Memory',
    description:
      'Remember past conversations across sessions. Personalize responses based on user history with privacy controls.',
    experimentType: 'memory',
    status: 'active' as const,
    isEnabled: false,
    usageCount: 234,
    feedbackCount: 47,
    avgRating: 4.5,
    properties: {
      icon: '🧠',
      category: 'memory',
      difficulty: 'easy' as const,
      estimatedTime: '2 min setup',
      tags: ['memory', 'personalization', 'privacy', 'context'],
    },
  },
  {
    id: 'exp-4',
    name: 'Clone Personality Evolution',
    description:
      'Learn from user feedback to improve responses. Adapt tone and style based on interactions. Track personality drift over time.',
    experimentType: 'learning',
    status: 'active' as const,
    isEnabled: false,
    usageCount: 67,
    feedbackCount: 12,
    avgRating: 3.9,
    properties: {
      icon: '🌱',
      category: 'learning',
      difficulty: 'medium' as const,
      estimatedTime: '3 min setup',
      tags: ['ai', 'learning', 'personality', 'adaptive'],
    },
  },
  {
    id: 'exp-5',
    name: 'Clone Swarm',
    description:
      'Multiple clones collaborate on complex tasks. Delegate subtasks to specialized clones and aggregate results into coherent response.',
    experimentType: 'collaboration',
    status: 'active' as const,
    isEnabled: false,
    usageCount: 45,
    feedbackCount: 8,
    avgRating: 4.1,
    properties: {
      icon: '🐝',
      category: 'collaboration',
      difficulty: 'hard' as const,
      estimatedTime: '15 min setup',
      tags: ['swarm', 'collaboration', 'multi-agent', 'delegation'],
    },
  },
  {
    id: 'exp-6',
    name: 'Clone API',
    description:
      'RESTful API for programmatic access to your clones. Authentication with API keys, rate limiting, and OpenAPI documentation.',
    experimentType: 'integration',
    status: 'active' as const,
    isEnabled: false,
    usageCount: 178,
    feedbackCount: 31,
    avgRating: 4.6,
    properties: {
      icon: '🔌',
      category: 'integration',
      difficulty: 'medium' as const,
      estimatedTime: '5 min setup',
      tags: ['api', 'rest', 'integration', 'developer'],
    },
  },
  {
    id: 'exp-7',
    name: 'Clone Marketplace',
    description:
      'List your trained clones for sale. Preview before purchase with revenue sharing. Reviews and ratings system.',
    experimentType: 'marketplace',
    status: 'active' as const,
    isEnabled: false,
    usageCount: 312,
    feedbackCount: 68,
    avgRating: 4.8,
    properties: {
      icon: '🏪',
      category: 'marketplace',
      difficulty: 'easy' as const,
      estimatedTime: '3 min setup',
      tags: ['marketplace', 'monetization', 'commerce', 'revenue'],
    },
  },
];

export default function LabsGrid() {
  const [experiments, setExperiments] = useState(EXPERIMENTS);
  const [filteredExperiments, setFilteredExperiments] = useState(EXPERIMENTS);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Listen for search/filter events from Astro page
  useEffect(() => {
    const handleSearch = (e: CustomEvent) => {
      setSearchQuery(e.detail.query);
    };

    const handleFilter = (e: CustomEvent) => {
      if (e.detail.category !== undefined) {
        setCategoryFilter(e.detail.category);
      }
      if (e.detail.status !== undefined) {
        setStatusFilter(e.detail.status);
      }
    };

    window.addEventListener('labs:search', handleSearch as EventListener);
    window.addEventListener('labs:filter', handleFilter as EventListener);

    return () => {
      window.removeEventListener('labs:search', handleSearch as EventListener);
      window.removeEventListener('labs:filter', handleFilter as EventListener);
    };
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...experiments];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (exp) =>
          exp.name.toLowerCase().includes(query) ||
          exp.description.toLowerCase().includes(query) ||
          exp.properties?.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(
        (exp) => exp.properties?.category === categoryFilter
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((exp) => exp.status === statusFilter);
    }

    setFilteredExperiments(filtered);
  }, [searchQuery, categoryFilter, statusFilter, experiments]);

  const handleToggle = async (experimentId: string, enabled: boolean) => {
    setIsLoading(true);
    try {
      // TODO: Call Convex mutation
      // await convex.mutation('mutations/feature-flags:setFeatureFlag', {
      //   experimentId,
      //   enabled,
      // });

      // Update local state
      setExperiments((prev) =>
        prev.map((exp) =>
          exp.id === experimentId ? { ...exp, isEnabled: enabled } : exp
        )
      );

      console.log(`Experiment ${experimentId} ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Failed to toggle experiment:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewResults = (experimentId: string) => {
    // TODO: Navigate to experiment results page
    console.log('Viewing results for experiment:', experimentId);
    window.location.href = `/labs/${experimentId}/results`;
  };

  const handleSubmitFeedback = async (
    experimentId: string,
    rating: number,
    feedback: string
  ) => {
    setIsLoading(true);
    try {
      // TODO: Call Convex mutation
      // await convex.mutation('mutations/feature-flags:submitExperimentFeedback', {
      //   experimentId,
      //   rating,
      //   feedback,
      // });

      console.log('Feedback submitted:', { experimentId, rating, feedback });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && experiments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading experiments...</span>
      </div>
    );
  }

  if (filteredExperiments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔬</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No experiments found
        </h3>
        <p className="text-gray-600">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredExperiments.map((experiment) => (
        <ExperimentCard
          key={experiment.id}
          experiment={experiment}
          onToggle={handleToggle}
          onViewResults={handleViewResults}
          onSubmitFeedback={handleSubmitFeedback}
        />
      ))}
    </div>
  );
}
