/**
 * Template Category System - Example Usage
 *
 * Complete example showing how to integrate the category system
 * with ThingFilter and template display.
 *
 * Cycle 53: Template Category System
 */

import { useState } from 'react';
import type { FilterConfig } from '@/components/ontology-ui/types';
import { ThingFilter } from '@/components/ontology-ui/things/ThingFilter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FUNNEL_TEMPLATES } from '@/lib/funnel-templates';
import {
  TEMPLATE_CATEGORIES,
  INDUSTRY_TAGS,
  CATEGORY_TABS,
  type TemplateCategory,
  type IndustryTag,
  combineFilters,
  parseFilters,
  applyFilters,
  getCategoryIcon,
  getCategoryName,
} from './categories';

// ============================================================================
// EXAMPLE 1: Complete Template Gallery with Filters
// ============================================================================

export function TemplateGalleryExample() {
  const [selectedCategories, setSelectedCategories] = useState<TemplateCategory[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<IndustryTag[]>([]);
  const [activeTab, setActiveTab] = useState<TemplateCategory | 'all'>('all');

  // Combine selections into FilterConfig array
  const filters = combineFilters(selectedCategories, selectedIndustries, []);

  // Handle filter changes from ThingFilter
  const handleFilterChange = (newFilters: FilterConfig[]) => {
    const { categories, industries } = parseFilters(newFilters);
    setSelectedCategories(categories);
    setSelectedIndustries(industries);
  };

  // Apply filters to templates
  const filteredTemplates = applyFilters(FUNNEL_TEMPLATES, {
    categories: activeTab === 'all' ? selectedCategories : [activeTab],
    industries: selectedIndustries,
  });

  return (
    <div className="space-y-6">
      {/* Category Navigation Tabs */}
      <CategoryTabs active={activeTab} onChange={setActiveTab} />

      <div className="grid grid-cols-[300px_1fr] gap-6">
        {/* Filter Sidebar */}
        <div className="space-y-4">
          <ThingFilter
            activeFilters={filters}
            onFilterChange={handleFilterChange}
          />

          {/* Active Filters Summary */}
          <ActiveFiltersSummary
            categories={selectedCategories}
            industries={selectedIndustries}
            onClearCategories={() => setSelectedCategories([])}
            onClearIndustries={() => setSelectedIndustries([])}
          />
        </div>

        {/* Template Grid */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredTemplates.length} of {FUNNEL_TEMPLATES.length} templates
            </p>
            {filteredTemplates.length === 0 && (
              <Button variant="outline" onClick={() => {
                setSelectedCategories([]);
                setSelectedIndustries([]);
                setActiveTab('all');
              }}>
                Clear Filters
              </Button>
            )}
          </div>

          {filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map(template => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: Category Navigation Tabs
// ============================================================================

interface CategoryTabsProps {
  active: TemplateCategory | 'all';
  onChange: (category: TemplateCategory | 'all') => void;
}

export function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  // Add template counts to tabs
  const tabsWithCounts = CATEGORY_TABS.map(tab => ({
    ...tab,
    count: tab.id === 'all'
      ? FUNNEL_TEMPLATES.length
      : FUNNEL_TEMPLATES.filter(t => t.category === tab.id).length,
  }));

  return (
    <div className="border-b">
      <div className="flex gap-1 overflow-x-auto">
        {tabsWithCounts.map(tab => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 text-sm font-medium
              border-b-2 transition-colors whitespace-nowrap
              ${active === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
              }
            `}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
            <Badge variant="secondary" className="ml-1">
              {tab.count}
            </Badge>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: Category Filter Selector
// ============================================================================

interface CategorySelectorProps {
  selected: TemplateCategory[];
  onChange: (categories: TemplateCategory[]) => void;
}

export function CategorySelector({ selected, onChange }: CategorySelectorProps) {
  const toggleCategory = (category: TemplateCategory) => {
    if (selected.includes(category)) {
      onChange(selected.filter(c => c !== category));
    } else {
      onChange([...selected, category]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {Object.values(TEMPLATE_CATEGORIES).map(category => (
            <Badge
              key={category.id}
              variant={selected.includes(category.id) ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-primary/80"
              onClick={() => toggleCategory(category.id)}
            >
              <span className="mr-1">{category.icon}</span>
              <span>{category.name}</span>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// EXAMPLE 4: Industry Filter Selector
// ============================================================================

interface IndustrySelectorProps {
  selected: IndustryTag[];
  onChange: (industries: IndustryTag[]) => void;
}

export function IndustrySelector({ selected, onChange }: IndustrySelectorProps) {
  const toggleIndustry = (industry: IndustryTag) => {
    if (selected.includes(industry)) {
      onChange(selected.filter(i => i !== industry));
    } else {
      onChange([...selected, industry]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Industries</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {Object.values(INDUSTRY_TAGS).map(industry => (
            <Badge
              key={industry.id}
              variant={selected.includes(industry.id) ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-primary/80"
              onClick={() => toggleIndustry(industry.id)}
            >
              <span className="mr-1">{industry.icon}</span>
              <span>{industry.name}</span>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// EXAMPLE 5: Active Filters Summary
// ============================================================================

interface ActiveFiltersSummaryProps {
  categories: TemplateCategory[];
  industries: IndustryTag[];
  onClearCategories: () => void;
  onClearIndustries: () => void;
}

export function ActiveFiltersSummary({
  categories,
  industries,
  onClearCategories,
  onClearIndustries,
}: ActiveFiltersSummaryProps) {
  const hasFilters = categories.length > 0 || industries.length > 0;

  if (!hasFilters) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            No active filters
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Active Filters</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onClearCategories();
              onClearIndustries();
            }}
          >
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {categories.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Categories</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearCategories}
              >
                Clear
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {categories.map(cat => (
                <Badge key={cat} variant="secondary">
                  {getCategoryIcon(cat)} {getCategoryName(cat)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {industries.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Industries</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearIndustries}
              >
                Clear
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {industries.map(ind => (
                <Badge key={ind} variant="secondary">
                  {INDUSTRY_TAGS[ind].icon} {INDUSTRY_TAGS[ind].name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// SUPPORTING COMPONENTS
// ============================================================================

function TemplateCard({ template }: { template: any }) {
  const category = TEMPLATE_CATEGORIES[template.category as TemplateCategory];

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{template.name}</CardTitle>
          <Badge variant="outline">
            {category.icon} {category.name}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {template.description}
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Conversion:</span>
            <span className="font-medium">{template.conversionRate}%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Setup Time:</span>
            <span className="font-medium">{template.estimatedSetupTime}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Steps:</span>
            <span className="font-medium">{template.steps.length} pages</span>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-1">
          {template.tags?.slice(0, 3).map((tag: string) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card className="p-12">
      <div className="text-center space-y-4">
        <div className="text-6xl">🔍</div>
        <h3 className="text-xl font-semibold">No templates found</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Try adjusting your filters or clearing them to see more templates.
        </p>
      </div>
    </Card>
  );
}
