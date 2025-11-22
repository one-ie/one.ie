/**
 * Template Marketplace Component
 *
 * Browse and search funnel templates with real-time filtering.
 * Enhanced with ThingSearch from ontology-ui for consistent search UX.
 *
 * Features:
 * - Real-time search with ThingSearch component
 * - Search by name, description, tags, category
 * - Recent searches tracked in localStorage
 * - Search suggestions (popular templates)
 * - Category filtering
 * - Clear search functionality
 * - Sort options (popularity, conversion, newest, name)
 *
 * Part of Cycle 54: Template Search
 */

import { useState, useMemo, useEffect } from 'react';
import type { FunnelTemplate } from '@/lib/funnel-templates';
import { FUNNEL_TEMPLATES, CATEGORIES } from '@/lib/funnel-templates';
import { TemplateCard } from './TemplateCard';
import { TemplatePreviewModal } from './TemplatePreviewModal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const RECENT_SEARCHES_KEY = 'funnel-template-recent-searches';
const MAX_RECENT_SEARCHES = 5;

interface TemplateMarketplaceProps {
  onCreateFromTemplate: (templateId: string) => void;
  templates?: any[];
  suggestions?: string[];
}

type SortOption = 'popularity' | 'conversion' | 'newest' | 'name';

export function TemplateMarketplace({
  onCreateFromTemplate,
  templates: propTemplates,
  suggestions = [
    'lead magnet',
    'webinar',
    'product launch',
    'ecommerce',
    'membership',
    'coaching',
  ]
}: TemplateMarketplaceProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [previewTemplate, setPreviewTemplate] = useState<FunnelTemplate | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Use provided templates or default templates
  const templates = propTemplates || FUNNEL_TEMPLATES;

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  }, []);

  // Save search to recent searches
  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;

    const updated = [
      query,
      ...recentSearches.filter((s) => s !== query),
    ].slice(0, MAX_RECENT_SEARCHES);

    setRecentSearches(updated);

    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save recent search:', error);
    }
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (error) {
      console.error('Failed to clear recent searches:', error);
    }
  };

  // Handle search query change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setShowSuggestions(false);
    if (value.trim()) {
      saveRecentSearch(value);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setShowSuggestions(false);
  };

  // Apply suggestion
  const applySuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    saveRecentSearch(suggestion);
  };

  // Mock usage counts (would come from backend in production)
  const usageCounts: Record<string, number> = {
    'lead-magnet-basic': 1247,
    'lead-magnet-quiz': 892,
    'product-launch-seed': 654,
    'webinar-basic': 1893,
    'ecommerce-tripwire': 2341,
    'membership-trial': 567,
    'virtual-summit': 234,
  };

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    let filtered = templates;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        (t.tags && t.tags.some((tag: string) => tag.toLowerCase().includes(query))) ||
        (t.metadata?.category && t.metadata.category.toLowerCase().includes(query))
      );
    }

    // Sort templates
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return (usageCounts[b.id] || b.metadata?.uses || 0) - (usageCounts[a.id] || a.metadata?.uses || 0);
        case 'conversion':
          return (b.conversionRate || b.metadata?.conversionRate || 0) - (a.conversionRate || a.metadata?.conversionRate || 0);
        case 'newest':
          return (b._creationTime || 0) - (a._creationTime || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [templates, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Funnel Templates</h1>
          <p className="text-muted-foreground mt-1">
            Choose from {templates.length} proven templates to get started quickly
          </p>
        </div>
        <Button onClick={() => window.location.href = '/funnels/builder'}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Start from Scratch
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        {/* Search Box with Suggestions */}
        <div className="relative flex-1">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="search"
                placeholder="Search templates by name, description, tags, or category..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="pr-20"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7"
                >
                  Clear
                </Button>
              )}
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">Most Popular</SelectItem>
                <SelectItem value="conversion">Highest Converting</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="name">Alphabetical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Suggestions Dropdown */}
          {showSuggestions && !searchQuery && (
            <div className="absolute z-10 mt-2 w-full rounded-md border bg-background p-4 shadow-lg">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">Recent Searches</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearRecentSearches}
                      className="h-auto p-0 text-xs"
                    >
                      Clear
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-secondary/80"
                        onClick={() => applySuggestion(search)}
                      >
                        {search}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Suggestions */}
              {suggestions.length > 0 && (
                <div>
                  <span className="mb-2 block text-sm font-medium">Popular Templates</span>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => applySuggestion(suggestion)}
                      >
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
        >
          All Templates
          <Badge variant="secondary" className="ml-2">
            {templates.length}
          </Badge>
        </Button>
        {Object.entries(CATEGORIES).map(([key, category]) => (
          <Button
            key={key}
            variant={selectedCategory === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(key)}
          >
            <span className="mr-1">{category.icon}</span>
            {category.name}
            <Badge variant="secondary" className="ml-2">
              {category.templates}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
        </span>
        {(searchQuery || selectedCategory !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              clearSearch();
              setSelectedCategory('all');
            }}
          >
            Reset filters
          </Button>
        )}
      </div>

      {/* Template Grid */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => (
            <TemplateCard
              key={template.id || template._id}
              template={template}
              usageCount={usageCounts[template.id] || template.metadata?.uses || 0}
              onUseTemplate={onCreateFromTemplate}
              onPreview={setPreviewTemplate}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold mb-2">No templates found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters or search query
          </p>
          <Button variant="outline" onClick={() => {
            setSearchQuery('');
            setSelectedCategory('all');
          }}>
            Reset Filters
          </Button>
        </div>
      )}

      {/* Preview Modal */}
      <TemplatePreviewModal
        template={previewTemplate}
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onUseTemplate={onCreateFromTemplate}
      />
    </div>
  );
}
