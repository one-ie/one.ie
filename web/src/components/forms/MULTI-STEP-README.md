# Multi-Step Form System - Cycle 68

Complete multi-step form implementation with progress tracking, validation, save/resume functionality.

## Features

- ✅ **Progress Tracking** - Visual progress bar with step indicators
- ✅ **Step Validation** - Validate each step before proceeding
- ✅ **Navigation** - Next/Previous buttons, clickable step numbers
- ✅ **Save Progress** - Auto-save to localStorage
- ✅ **Resume Later** - Send email link to continue on another device
- ✅ **Error States** - Visual indicators for steps with errors
- ✅ **Type Safe** - Full TypeScript support

## Components

### FormProgressBar

Progress indicator showing current step, completed steps, and errors.

**Props:**
```typescript
interface FormProgressBarProps {
  steps: string[];              // Step labels
  currentStep: number;          // Current step index (0-based)
  completedSteps: number[];     // Completed step indices
  errorSteps?: number[];        // Steps with errors
  onStepClick?: (stepIndex: number) => void;
  clickable?: boolean;          // Allow clicking steps (default: true)
  variant?: 'horizontal' | 'vertical';
}
```

**Usage:**
```tsx
<FormProgressBar
  steps={['Personal Info', 'Address', 'Payment']}
  currentStep={0}
  completedSteps={[]}
  errorSteps={[]}
  onStepClick={(step) => goToStep(step)}
/>
```

### MultiStepForm

Main form component with complete multi-step functionality.

**Props:**
```typescript
interface MultiStepFormProps {
  formId: string;               // Unique form ID (for localStorage)
  title?: string;               // Form title
  description?: string;         // Form description
  steps: FormStep[];            // Array of step definitions
  renderStep: (
    step: FormStep,
    stepIndex: number,
    data: Record<string, any>,
    updateData: (data: Record<string, any>) => void
  ) => ReactNode;
  onStepSubmit?: (stepId: string, data: Record<string, any>) => Promise<void>;
  onComplete: (data: Record<string, any>) => Promise<void>;
  showSaveButton?: boolean;     // Show "Save & Resume Later" (default: true)
  progressVariant?: 'horizontal' | 'vertical';
  className?: string;
}

interface FormStep {
  id: string;                   // Unique step identifier
  label: string;                // Step display label
  description?: string;         // Step description
  fields: string[];             // Field names in this step
  validate?: (data: Record<string, any>) => Promise<string[]> | string[];
}
```

**Usage:**
```tsx
import { MultiStepForm } from '@/components/forms/MultiStepForm';

const steps = [
  {
    id: 'personal',
    label: 'Personal Info',
    fields: ['name', 'email'],
    validate: async (data) => {
      const errors = [];
      if (!data.name) errors.push('Name is required');
      if (!data.email) errors.push('Email is required');
      return errors;
    }
  },
  {
    id: 'address',
    label: 'Address',
    fields: ['street', 'city', 'state', 'zip']
  }
];

<MultiStepForm
  formId="user-registration"
  steps={steps}
  renderStep={(step, stepIndex, data, updateData) => {
    if (step.id === 'personal') {
      return (
        <div>
          <Input
            value={data.name || ''}
            onChange={(e) => updateData({ name: e.target.value })}
          />
        </div>
      );
    }
  }}
  onComplete={async (data) => {
    await submitForm(data);
  }}
/>
```

## State Management

### multiStepForm Store

Nanostores-based state management with localStorage persistence.

**Creating a store:**
```typescript
import { createMultiStepFormStore } from '@/stores/multiStepForm';

const store = createMultiStepFormStore('my-form-id', 3); // formId, totalSteps

// Access state
const formData = useStore(store.$formData);
const progress = useStore(store.$progress);
const isComplete = useStore(store.$isComplete);

// Use actions
store.actions.nextStep();
store.actions.previousStep();
store.actions.goToStep(1);
store.actions.updateStepData(0, { name: 'John' });
store.actions.setStepError(0, true);
store.actions.resetForm();
```

**Available actions:**
- `updateStepData(stepIndex, data)` - Update data for a step
- `nextStep()` - Move to next step (marks current as completed)
- `previousStep()` - Move to previous step
- `goToStep(stepIndex)` - Jump to specific step (if allowed)
- `setStepError(stepIndex, hasError)` - Mark step as having errors
- `saveResumeEmail(email)` - Save email for resume link
- `sendResumeLink(email)` - Send resume link via email
- `resetForm()` - Clear all data and reset to initial state
- `getAllData()` - Get all form data
- `isStepCompleted(stepIndex)` - Check if step is completed
- `hasStepErrors(stepIndex)` - Check if step has errors

## Complete Example

See `/web/src/components/forms/MultiStepFormDemo.tsx` for a complete working example with:

- 3-step registration form (Personal Info, Address, Account Setup)
- Field validation for each step
- Real-time error feedback
- Save & resume functionality
- Type-safe data handling

## Demo Page

Visit `/forms/multi-step-demo` to see the multi-step form in action.

## Validation Patterns

### Basic Validation

```typescript
const validateStep = async (data: Record<string, any>): Promise<string[]> => {
  const errors: string[] = [];

  if (!data.email) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Please enter a valid email');
  }

  return errors;
};
```

### Async Validation

```typescript
const validateEmail = async (data: Record<string, any>): Promise<string[]> => {
  const errors: string[] = [];

  // Check if email is already taken
  const response = await fetch(`/api/check-email?email=${data.email}`);
  const { available } = await response.json();

  if (!available) {
    errors.push('Email is already taken');
  }

  return errors;
};
```

### Using Zod Schemas

```typescript
import { z } from 'zod';

const personalInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().regex(/^\d{10}$/, 'Please enter a valid phone number')
});

const validatePersonalInfo = async (data: Record<string, any>): Promise<string[]> => {
  try {
    personalInfoSchema.parse(data);
    return [];
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors.map(e => e.message);
    }
    return ['Validation failed'];
  }
};
```

## Save & Resume Later

The system automatically saves progress to localStorage. Users can also:

1. Click "Save & Resume Later" button
2. Enter their email
3. Receive an email with a resume link
4. Click link to continue on any device

**Resume URL format:**
```
https://yoursite.com/forms/your-form?resumeForm=form-id
```

**Backend integration needed:**
```typescript
// POST /api/send-resume-link
{
  email: string;
  formId: string;
  resumeUrl: string;
  formData: MultiStepFormData;
}
```

## localStorage Structure

Data is saved to localStorage with key:
```
multi-step-form-${formId}
```

**Stored data:**
```typescript
{
  formId: string;
  currentStep: number;
  completedSteps: number[];
  errorSteps: number[];
  data: Record<string, any>;
  updatedAt: number;
  resumeEmail?: string;
}
```

## Best Practices

### 1. Keep Steps Focused

Each step should have 3-7 fields maximum. Break complex forms into more steps.

```typescript
// ✅ Good - focused steps
const steps = [
  { id: 'personal', label: 'Personal Info', fields: ['name', 'email', 'phone'] },
  { id: 'address', label: 'Address', fields: ['street', 'city', 'state', 'zip'] },
  { id: 'preferences', label: 'Preferences', fields: ['newsletter', 'notifications'] }
];

// ❌ Bad - too many fields in one step
const steps = [
  {
    id: 'all-info',
    label: 'Information',
    fields: ['name', 'email', 'phone', 'street', 'city', 'state', 'zip', 'newsletter', 'notifications']
  }
];
```

### 2. Validate Each Step

Always provide validation for critical steps to prevent incomplete data.

```typescript
const step = {
  id: 'payment',
  label: 'Payment',
  fields: ['cardNumber', 'cvv', 'expiry'],
  validate: async (data) => {
    // Validate before proceeding to next step
    return validatePaymentInfo(data);
  }
};
```

### 3. Save Progress Frequently

The system auto-saves on every step change, but you can manually save:

```typescript
const handleFieldChange = (field: string, value: any) => {
  updateData({ [field]: value });
  // Data is automatically saved to localStorage
};
```

### 4. Provide Clear Error Messages

```typescript
// ✅ Good - specific error
if (!data.email) {
  errors.push('Email address is required');
} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
  errors.push('Please enter a valid email address (e.g., john@example.com)');
}

// ❌ Bad - generic error
if (!data.email || !isValidEmail(data.email)) {
  errors.push('Invalid input');
}
```

### 5. Use Proper Step Labels

```typescript
// ✅ Good - clear and descriptive
const steps = [
  { id: 'personal', label: 'Personal Information' },
  { id: 'business', label: 'Business Details' },
  { id: 'billing', label: 'Billing & Payment' }
];

// ❌ Bad - vague labels
const steps = [
  { id: 'step1', label: 'Step 1' },
  { id: 'step2', label: 'Step 2' },
  { id: 'step3', label: 'Step 3' }
];
```

## Integration with Existing Forms

You can integrate the multi-step system with existing form validation:

```typescript
import { useFormValidation } from '@/lib/forms/validation';
import { productFormSchema } from '@/lib/forms/schemas';

const renderStep = (step, stepIndex, data, updateData) => {
  const form = useFormValidation({
    schema: productFormSchema,
    mode: 'onBlur'
  });

  return (
    <Form {...form}>
      {/* Your form fields */}
    </Form>
  );
};
```

## Accessibility

The multi-step form components follow accessibility best practices:

- ✅ Proper ARIA labels and roles
- ✅ Keyboard navigation support
- ✅ Screen reader announcements for step changes
- ✅ Focus management between steps
- ✅ Error announcements
- ✅ Progress indicators

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

Requires:
- localStorage support (for save/resume)
- ES2020+ JavaScript features

## Performance

- **Lightweight**: ~5KB gzipped (components + store)
- **Fast**: No re-renders between steps (isolated state)
- **Efficient**: Only active step is rendered
- **Optimized**: localStorage updates are debounced

## Troubleshooting

### Form data not persisting

Check that localStorage is enabled:
```typescript
if (typeof window !== 'undefined') {
  console.log(localStorage.getItem('multi-step-form-your-form-id'));
}
```

### Validation not working

Ensure validation function returns array of strings:
```typescript
// ✅ Correct
const validate = async (data) => {
  return ['Error 1', 'Error 2'];
};

// ❌ Wrong - returns boolean
const validate = async (data) => {
  return false;
};
```

### Resume link not working

Backend integration needed for email sending. Implement:
```
POST /api/send-resume-link
```

## Related Documentation

- Form Validation: `/web/src/lib/forms/validation.ts`
- Form Components: `/web/src/components/ui/form.tsx`
- Nanostores: `/web/src/stores/`
- shadcn/ui: https://ui.shadcn.com

## Support

For questions or issues:
1. Check demo: `/forms/multi-step-demo`
2. Review example: `/web/src/components/forms/MultiStepFormDemo.tsx`
3. Read source: `/web/src/components/forms/MultiStepForm.tsx`

---

**Built for Cycle 68 - Multi-Step Forms**
