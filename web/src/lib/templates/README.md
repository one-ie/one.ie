# Template Category System

**Cycle 53: Template categorization and filtering system**

## Overview

The template category system provides:
- **7 template categories**: Lead Gen, E-commerce, Webinar, Membership, Product Launch, Summit, Course Launch
- **10 industry tags**: SaaS, Coaching, Physical Products, Digital Products, Services, Consulting, Education, Fitness, Agency, E-Learning
- **ThingFilter integration**: Multi-select category and tag filtering
- **Navigation tabs**: Category-based navigation with icons and counts

## Quick Start

### 1. Import the System

```typescript
import {
  TEMPLATE_CATEGORIES,
  INDUSTRY_TAGS,
  CATEGORY_TABS,
  type TemplateCategory,
  type IndustryTag,
  categoryToFilter,
  combineFilters,
  applyFilters,
} from '@/lib/templates/categories';
```

### 2. Use Category Metadata

```typescript
// Get all categories
const categories = Object.values(TEMPLATE_CATEGORIES);

// Get specific category
const leadGen = TEMPLATE_CATEGORIES['lead-gen'];
console.log(leadGen.name); // "Lead Generation"
console.log(leadGen.icon); // "📧"
console.log(leadGen.avgConversion); // 40

// Get industries
const saas = INDUSTRY_TAGS['saas'];
console.log(saas.recommendedCategories); // ['membership', 'webinar', 'product-launch']
```

### 3. Filter Templates

```typescript
import { FUNNEL_TEMPLATES } from '@/lib/funnel-templates';

// Filter by category
const filtered = applyFilters(FUNNEL_TEMPLATES, {
  categories: ['lead-gen', 'webinar'],
  industries: ['saas', 'coaching'],
  tags: ['beginner-friendly'],
});
```

### 4. Create Navigation Tabs

```typescript
import { CATEGORY_TABS } from '@/lib/templates/categories';

export function CategoryNav({ activeCategory, onSelect }) {
  return (
    <div className="flex gap-2">
      {CATEGORY_TABS.map(tab => (
        <button
          key={tab.id}
          className={activeCategory === tab.id ? 'active' : ''}
          onClick={() => onSelect(tab.id)}
        >
          <span>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
```

## ThingFilter Integration

### Example Component

```typescript
import { useState } from 'react';
import { ThingFilter } from '@/components/ontology-ui/things/ThingFilter';
import { FUNNEL_TEMPLATES } from '@/lib/funnel-templates';
import {
  combineFilters,
  parseFilters,
  applyFilters,
  type TemplateCategory,
  type IndustryTag,
} from '@/lib/templates/categories';

export function TemplateGallery() {
  const [selectedCategories, setSelectedCategories] = useState<TemplateCategory[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<IndustryTag[]>([]);
  const [filters, setFilters] = useState<FilterConfig[]>([]);

  // Convert selections to filters
  const handleFilterChange = (newFilters: FilterConfig[]) => {
    setFilters(newFilters);

    // Parse filters back to selections
    const { categories, industries } = parseFilters(newFilters);
    setSelectedCategories(categories);
    setSelectedIndustries(industries);
  };

  // Apply filters to templates
  const filteredTemplates = applyFilters(FUNNEL_TEMPLATES, {
    categories: selectedCategories,
    industries: selectedIndustries,
  });

  return (
    <div className="grid grid-cols-[300px_1fr] gap-6">
      {/* Filter Sidebar */}
      <ThingFilter
        activeFilters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Template Grid */}
      <div className="grid grid-cols-3 gap-4">
        {filteredTemplates.map(template => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  );
}
```

### Custom Filter UI

```typescript
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TEMPLATE_CATEGORIES,
  INDUSTRY_TAGS,
  type TemplateCategory,
  type IndustryTag,
} from '@/lib/templates/categories';

export function CategoryFilter({
  selected,
  onSelect,
}: {
  selected: TemplateCategory[];
  onSelect: (categories: TemplateCategory[]) => void;
}) {
  const toggleCategory = (category: TemplateCategory) => {
    if (selected.includes(category)) {
      onSelect(selected.filter(c => c !== category));
    } else {
      onSelect([...selected, category]);
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Categories</h3>
      <div className="flex flex-wrap gap-2">
        {Object.values(TEMPLATE_CATEGORIES).map(category => (
          <Badge
            key={category.id}
            variant={selected.includes(category.id) ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => toggleCategory(category.id)}
          >
            <span>{category.icon}</span>
            <span>{category.name}</span>
          </Badge>
        ))}
      </div>
    </div>
  );
}
```

## Category Metadata

### Template Categories

| Category | Icon | Avg Conversion | Ideal For |
|----------|------|----------------|-----------|
| Lead Generation | 📧 | 40% | Content creators, Bloggers, Coaches |
| E-commerce | 🛍️ | 30% | Product businesses, Store owners |
| Webinar | 🎥 | 40% | Coaches, Consultants, SaaS |
| Membership | 🔑 | 35% | Membership sites, Communities |
| Product Launch | 🚀 | 25% | Product businesses, Course creators |
| Summit | 🎤 | 50% | Event organizers, Network builders |
| Course Launch | 🎓 | 30% | Course creators, Educators |

### Industry Tags

| Industry | Icon | Recommended Categories |
|----------|------|------------------------|
| SaaS | 💻 | Membership, Webinar, Product Launch |
| Coaching | 🎯 | Webinar, Lead Gen, Membership |
| Physical Products | 📦 | E-commerce, Product Launch |
| Digital Products | 💾 | E-commerce, Product Launch, Lead Gen |
| Services | 🛠️ | Lead Gen, Webinar |
| Consulting | 💼 | Webinar, Lead Gen |
| Education | 📚 | Course Launch, Webinar, Summit |
| Fitness | 💪 | Membership, Course Launch, Webinar |
| Agency | 🎨 | Lead Gen, Webinar |
| E-Learning | 🎓 | Course Launch, Membership, Summit |

## Helper Functions

### Filter Conversion

```typescript
// Convert categories to FilterConfig
const filters = categoryToFilter(['lead-gen', 'webinar']);

// Convert industries to FilterConfig
const industryFilters = industryToFilter(['saas', 'coaching']);

// Combine all filters
const allFilters = combineFilters(
  ['lead-gen'],
  ['saas'],
  ['beginner-friendly']
);

// Parse filters back
const { categories, industries, tags } = parseFilters(allFilters);
```

### Template Filtering

```typescript
// Filter by category only
const leadGenTemplates = filterByCategory(templates, ['lead-gen']);

// Filter by industry only
const saasTemplates = filterByIndustry(templates, ['saas']);

// Filter by tags only
const beginnerTemplates = filterByTags(templates, ['beginner-friendly']);

// Apply all filters
const filtered = applyFilters(templates, {
  categories: ['lead-gen', 'webinar'],
  industries: ['saas'],
  tags: ['beginner-friendly'],
});
```

### Category Helpers

```typescript
// Get category metadata
const category = getCategoryMetadata('lead-gen');

// Get all categories
const allCategories = getAllCategories();

// Get all industries
const allIndustries = getAllIndustries();

// Get recommended categories for industry
const recommended = getRecommendedCategories('saas');
// Returns: ['membership', 'webinar', 'product-launch']

// Search categories
const results = searchCategories('email list');
// Returns categories matching query

// Get category styling
const colorClass = getCategoryColorClass('lead-gen');
// Returns: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"

const icon = getCategoryIcon('webinar');
// Returns: "🎥"

const name = getCategoryName('ecommerce');
// Returns: "E-commerce"
```

## Navigation Tabs

### Tab Structure

```typescript
const tabs = CATEGORY_TABS;
// [
//   { id: 'all', label: 'All Templates', icon: '📋', description: 'Browse all...' },
//   { id: 'lead-gen', label: 'Lead Gen', icon: '📧', description: 'Build your email list' },
//   ...
// ]
```

### Dynamic Tab Counts

```typescript
import { FUNNEL_TEMPLATES } from '@/lib/funnel-templates';

// Add template counts to tabs
const tabsWithCounts = CATEGORY_TABS.map(tab => ({
  ...tab,
  count: tab.id === 'all'
    ? FUNNEL_TEMPLATES.length
    : FUNNEL_TEMPLATES.filter(t => t.category === tab.id).length,
}));
```

### Tab Navigation Component

```typescript
export function CategoryTabs({ active, onChange }) {
  const tabsWithCounts = CATEGORY_TABS.map(tab => ({
    ...tab,
    count: FUNNEL_TEMPLATES.filter(t =>
      tab.id === 'all' || t.category === tab.id
    ).length,
  }));

  return (
    <div className="flex gap-1 border-b">
      {tabsWithCounts.map(tab => (
        <button
          key={tab.id}
          className={`px-4 py-2 ${active === tab.id ? 'border-b-2' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          <span>{tab.icon}</span>
          <span>{tab.label}</span>
          <Badge variant="secondary">{tab.count}</Badge>
        </button>
      ))}
    </div>
  );
}
```

## Type Definitions

```typescript
// Category type
type TemplateCategory =
  | 'lead-gen'
  | 'ecommerce'
  | 'webinar'
  | 'membership'
  | 'product-launch'
  | 'summit'
  | 'course-launch';

// Industry type
type IndustryTag =
  | 'saas'
  | 'coaching'
  | 'physical-products'
  | 'digital-products'
  | 'services'
  | 'consulting'
  | 'education'
  | 'fitness'
  | 'agency'
  | 'elearning';

// Template tag type
type TemplateTag =
  | 'beginner-friendly'
  | 'high-converting'
  | 'quick-setup'
  | 'advanced'
  | 'automated'
  | 'interactive'
  | 'high-ticket'
  | 'recurring-revenue'
  | 'list-building'
  | 'partnerships';

// Metadata interfaces
interface CategoryMetadata {
  id: TemplateCategory;
  name: string;
  description: string;
  icon: string;
  color: string;
  useCases: string[];
  avgConversion: number;
  idealFor: string[];
}

interface IndustryMetadata {
  id: IndustryTag;
  name: string;
  description: string;
  icon: string;
  recommendedCategories: TemplateCategory[];
}

interface CategoryTab {
  id: TemplateCategory | 'all';
  label: string;
  icon: string;
  description: string;
  count?: number;
}
```

## Usage Examples

### Example 1: Basic Filtering

```typescript
import { FUNNEL_TEMPLATES } from '@/lib/funnel-templates';
import { applyFilters } from '@/lib/templates/categories';

// Show only lead gen templates
const leadGenTemplates = applyFilters(FUNNEL_TEMPLATES, {
  categories: ['lead-gen'],
});

// Show SaaS-related templates
const saasTemplates = applyFilters(FUNNEL_TEMPLATES, {
  industries: ['saas'],
});

// Show beginner-friendly templates
const beginnerTemplates = applyFilters(FUNNEL_TEMPLATES, {
  tags: ['beginner-friendly'],
});
```

### Example 2: Multi-Select Filtering

```typescript
// Combine multiple filters
const filtered = applyFilters(FUNNEL_TEMPLATES, {
  categories: ['lead-gen', 'webinar'],
  industries: ['saas', 'coaching'],
  tags: ['beginner-friendly', 'high-converting'],
});
```

### Example 3: Industry Recommendations

```typescript
import { getRecommendedCategories, TEMPLATE_CATEGORIES } from '@/lib/templates/categories';

// User selects "SaaS" industry
const recommended = getRecommendedCategories('saas');
// Returns: ['membership', 'webinar', 'product-launch']

// Show recommended categories to user
const recommendedMetadata = recommended.map(cat => TEMPLATE_CATEGORIES[cat]);
```

## Integration with Existing Code

### With Funnel Templates

```typescript
import { FUNNEL_TEMPLATES, TEMPLATES_BY_CATEGORY } from '@/lib/funnel-templates';
import { TEMPLATE_CATEGORIES } from '@/lib/templates/categories';

// Enhanced category metadata
const enhancedCategories = Object.entries(TEMPLATES_BY_CATEGORY).map(([id, templates]) => ({
  ...TEMPLATE_CATEGORIES[id as TemplateCategory],
  templates,
  count: templates.length,
}));
```

### With ThingFilter Component

```typescript
import { ThingFilter } from '@/components/ontology-ui/things/ThingFilter';
import { combineFilters, parseFilters } from '@/lib/templates/categories';

// Component state
const [categories, setCategories] = useState<TemplateCategory[]>([]);
const [industries, setIndustries] = useState<IndustryTag[]>([]);

// Convert to filters for ThingFilter
const filters = combineFilters(categories, industries, []);

// Handle filter changes from ThingFilter
const handleFilterChange = (newFilters: FilterConfig[]) => {
  const { categories: newCats, industries: newInds } = parseFilters(newFilters);
  setCategories(newCats);
  setIndustries(newInds);
};
```

## Best Practices

1. **Multi-select filtering**: Allow users to select multiple categories and industries
2. **Clear active filters**: Show badges for active filters with remove buttons
3. **Filter persistence**: Save filter state to URL params or localStorage
4. **Smart recommendations**: Suggest categories based on selected industries
5. **Empty state**: Show helpful message when no templates match filters
6. **Filter reset**: Provide "Clear all" button to reset filters
7. **Mobile optimization**: Stack filters vertically on mobile devices

## File Structure

```
web/src/lib/templates/
├── categories.ts          # This file - category system and helpers
└── README.md             # This documentation
```

## Related Files

- **Template definitions**: `/web/src/lib/funnel-templates/templates.ts`
- **Template suggestions**: `/web/src/lib/funnel-templates/suggestions.ts`
- **ThingFilter component**: `/web/src/components/ontology-ui/things/ThingFilter.tsx`
- **Ontology types**: `/web/src/components/ontology-ui/types/index.ts`

---

**Cycle 53: Template Category System - Complete**
