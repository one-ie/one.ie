# Cycle 56: Template Customization Wizard - Complete

## What Was Built

A comprehensive 5-step template customization wizard for the AI Chat Funnel Builder with real-time preview capabilities.

## Files Created

### 1. Core Component
**`/web/src/components/templates/TemplateCustomizationWizard.tsx`**
- 5-step wizard with progress tracking
- Real-time preview
- Form validation
- Color presets (5 pre-configured schemes)
- Image preview with error handling
- Type-safe TypeScript interfaces

### 2. Demo Component
**`/web/src/components/templates/FunnelCustomizerDemo.tsx`**
- Example implementation showing integration
- Success state with details display
- Export functionality
- JSON configuration preview

### 3. Demo Page
**`/web/src/pages/funnels/customize.astro`**
- Standalone demo page
- Client-side hydration
- Full layout integration

### 4. Supporting Files
- `/web/src/components/templates/index.ts` - Exports
- `/web/src/components/templates/README.md` - Documentation

## Features Implemented

### Step 1: Name Your Funnel
- Funnel name (required)
- Description (optional)
- Template type selection (product, course, service, event)
- Interactive cards with descriptions

### Step 2: Choose Brand Colors
- 5 quick color presets:
  - Ocean Blue (professional)
  - Forest Green (natural)
  - Sunset Orange (energetic)
  - Royal Purple (premium)
  - Modern Gray (minimal)
- Custom color pickers for:
  - Primary color
  - Secondary color
  - Accent color
  - Background color
  - Text color
- Live color input with hex values

### Step 3: Customize Copy
- Main headline (required)
- Subheadline (optional)
- Primary CTA (required)
- Secondary CTA (optional)
- Benefits list (3-5 items)
- Character validation

### Step 4: Select Images
- Hero image URL
- Logo image URL
- Product images (multiple)
- Live image preview
- Error handling for invalid URLs
- Fallback placeholders

### Step 5: Review & Create
- Full live preview with:
  - Applied brand colors
  - Custom headlines and CTAs
  - Benefit list with checkmarks
  - Images rendered
  - Interactive buttons
- Customization summary card
- Final validation before creation

## Technical Implementation

### React Patterns Used
```typescript
// State management
const [formData, setFormData] = useState<TemplateCustomization>({ ... });
const [currentStep, setCurrentStep] = useState(0);
const [errors, setErrors] = useState<Record<string, string>>({});

// Generic field updates
const updateField = <K extends keyof TemplateCustomization>(
  field: K,
  value: TemplateCustomization[K]
) => {
  setFormData(prev => ({ ...prev, [field]: value }));
};
```

### Validation System
```typescript
const validateStep = (): boolean => {
  const newErrors: Record<string, string> = {};

  switch (currentStep) {
    case 0: // Name validation
      if (!formData.name.trim()) {
        newErrors.name = "Funnel name is required";
      }
      break;
    // ... more steps
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### Progress Tracking
```typescript
const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;

// Visual progress bar
<div className="relative h-1 bg-muted rounded-full">
  <div
    className="absolute top-0 left-0 h-full bg-primary transition-all"
    style={{ width: `${progress}%` }}
  />
</div>
```

### Real-Time Preview
The review step renders a live preview using inline styles:

```tsx
<div style={{ backgroundColor: formData.backgroundColor }}>
  <h1 style={{ color: formData.textColor }}>
    {formData.headline}
  </h1>
  <button style={{
    backgroundColor: formData.primaryColor,
    color: "#ffffff"
  }}>
    {formData.ctaPrimary}
  </button>
</div>
```

## Usage Example

```tsx
import { TemplateCustomizationWizard } from '@/components/templates';

export function MyFunnelBuilder() {
  const handleComplete = async (data: TemplateCustomization) => {
    // Save to backend
    await saveFunnel(data);

    // Redirect to created funnel
    window.location.href = `/funnels/${data.name}`;
  };

  return (
    <TemplateCustomizationWizard
      templateId="product-landing"
      onComplete={handleComplete}
      onCancel={() => history.back()}
    />
  );
}
```

## Integration Points

### With Backend (Future)
```typescript
const handleComplete = async (data: TemplateCustomization) => {
  // Save to Convex
  const funnelId = await useMutation(api.mutations.funnels.create, {
    ...data,
    groupId: currentGroupId,
    ownerId: currentUserId,
  });

  // Generate pages from template
  await generateFunnelPages(funnelId, data);
};
```

### With Template System
The wizard outputs a `TemplateCustomization` object that can be used to:
1. Apply customizations to existing templates
2. Generate new pages with customized styling
3. Store preferences for future use
4. Export/import configurations

## Design System Compliance

All components use:
- shadcn/ui primitives (Card, Button, Input, etc.)
- Tailwind CSS utility classes
- HSL color system
- Consistent spacing and typography
- Dark mode support
- Responsive design

## Accessibility Features

- Keyboard navigation
- ARIA labels
- Focus management
- Error announcements
- Color contrast compliance
- Screen reader friendly

## Testing Recommendations

### Manual Testing Checklist
- [ ] Step navigation (Next/Previous)
- [ ] Form validation
- [ ] Color preset application
- [ ] Image URL validation
- [ ] Real-time preview updates
- [ ] Submit functionality
- [ ] Cancel functionality
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] Dark mode compatibility
- [ ] Keyboard navigation
- [ ] Error states

### Automated Testing
```typescript
// Example test with React Testing Library
describe('TemplateCustomizationWizard', () => {
  it('validates required fields', async () => {
    render(<TemplateCustomizationWizard onComplete={mockComplete} />);

    // Try to proceed without name
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    // Should show error
    expect(screen.getByText('Funnel name is required')).toBeInTheDocument();
  });
});
```

## Demo Page Access

Visit: **http://localhost:4321/funnels/customize**

This page demonstrates:
- Full wizard flow
- Success state
- Configuration export
- Real implementation example

## Next Steps (Suggested Enhancements)

1. **Template Library Integration**
   - Load actual templates instead of hardcoded data
   - Preview different template types
   - Template selection step

2. **Advanced Customization**
   - Font selection
   - Spacing/padding controls
   - Section reordering
   - Custom CSS injection

3. **AI Assistance**
   - Generate headlines with AI
   - Suggest color schemes from brand
   - Auto-write benefits from product description

4. **Backend Integration**
   - Save to Convex
   - Load existing funnels
   - Version history
   - Duplicate/clone functionality

5. **Page Generation**
   - Generate actual funnel pages from customization
   - Apply templates dynamically
   - Preview before publish

## Code Statistics

- **Lines of Code**: ~900 (TemplateCustomizationWizard.tsx)
- **Components**: 2 (Wizard + Demo)
- **Pages**: 1 (Demo page)
- **Steps**: 5 (all implemented)
- **Color Presets**: 5
- **Form Fields**: 15+
- **TypeScript Interfaces**: 2

## Related Cycles

- **Cycle 55**: Template selection
- **Cycle 57**: Page generation (planned)
- **Cycle 58**: AI assistance integration (planned)

---

**Status**: ✅ Complete

**Delivered**:
- Full 5-step wizard
- Real-time preview
- Color presets
- Image handling
- Form validation
- Demo implementation
- Documentation

**Output**: Return wizard component with all 5 steps ✓
