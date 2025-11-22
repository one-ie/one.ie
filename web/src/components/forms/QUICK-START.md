# Multi-Step Form - Quick Start Guide

## 🚀 Get Started in 3 Minutes

### 1. Import the Component

```tsx
import { MultiStepForm, type FormStep } from '@/components/forms/MultiStepForm';
```

### 2. Define Your Steps

```tsx
const steps: FormStep[] = [
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
  },
  {
    id: 'review',
    label: 'Review',
    fields: []
  }
];
```

### 3. Render Form Fields

```tsx
const renderStep = (step, stepIndex, data, updateData) => {
  if (step.id === 'personal') {
    return (
      <div className="space-y-4">
        <Input
          placeholder="Name"
          value={data.name || ''}
          onChange={(e) => updateData({ name: e.target.value })}
        />
        <Input
          type="email"
          placeholder="Email"
          value={data.email || ''}
          onChange={(e) => updateData({ email: e.target.value })}
        />
      </div>
    );
  }

  if (step.id === 'address') {
    return (
      <div className="space-y-4">
        <Input
          placeholder="Street"
          value={data.street || ''}
          onChange={(e) => updateData({ street: e.target.value })}
        />
        {/* More fields... */}
      </div>
    );
  }

  if (step.id === 'review') {
    return (
      <div>
        <p>Name: {data.name}</p>
        <p>Email: {data.email}</p>
        <p>Address: {data.street}, {data.city}</p>
      </div>
    );
  }
};
```

### 4. Handle Completion

```tsx
const handleComplete = async (data) => {
  // Submit to your backend
  const response = await fetch('/api/submit', {
    method: 'POST',
    body: JSON.stringify(data)
  });

  if (response.ok) {
    toast.success('Form submitted!');
    // Redirect or show success message
  }
};
```

### 5. Use the Component

```tsx
<MultiStepForm
  formId="my-registration"
  title="Register Now"
  description="Complete the form to create your account"
  steps={steps}
  renderStep={renderStep}
  onComplete={handleComplete}
/>
```

## 📝 Complete Example

```tsx
import { MultiStepForm, type FormStep } from '@/components/forms/MultiStepForm';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function MyRegistrationForm() {
  const steps: FormStep[] = [
    {
      id: 'personal',
      label: 'Personal Info',
      description: 'Tell us about yourself',
      fields: ['firstName', 'lastName', 'email'],
      validate: async (data) => {
        const errors = [];
        if (!data.firstName) errors.push('First name is required');
        if (!data.lastName) errors.push('Last name is required');
        if (!data.email) errors.push('Email is required');
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
          errors.push('Please enter a valid email');
        }
        return errors;
      }
    },
    {
      id: 'preferences',
      label: 'Preferences',
      fields: ['newsletter', 'notifications']
    }
  ];

  const renderStep = (step, stepIndex, data, updateData) => {
    if (step.id === 'personal') {
      return (
        <div className="space-y-4">
          <div>
            <Label>First Name</Label>
            <Input
              value={data.firstName || ''}
              onChange={(e) => updateData({ firstName: e.target.value })}
            />
          </div>
          <div>
            <Label>Last Name</Label>
            <Input
              value={data.lastName || ''}
              onChange={(e) => updateData({ lastName: e.target.value })}
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={data.email || ''}
              onChange={(e) => updateData({ email: e.target.value })}
            />
          </div>
        </div>
      );
    }

    if (step.id === 'preferences') {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.newsletter || false}
              onChange={(e) => updateData({ newsletter: e.target.checked })}
            />
            <Label>Subscribe to newsletter</Label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.notifications || false}
              onChange={(e) => updateData({ notifications: e.target.checked })}
            />
            <Label>Enable notifications</Label>
          </div>
        </div>
      );
    }
  };

  const handleComplete = async (data) => {
    try {
      await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      toast.success('Registration complete!');
    } catch (error) {
      toast.error('Registration failed');
    }
  };

  return (
    <MultiStepForm
      formId="user-registration"
      title="Create Account"
      description="Join us today"
      steps={steps}
      renderStep={renderStep}
      onComplete={handleComplete}
      showSaveButton={true}
    />
  );
}
```

## 🎯 Key Features

### Auto-Save
Form data is automatically saved to localStorage. Users can close the browser and return later - their progress is preserved.

### Validation
Each step can have its own validation function. The form won't proceed until validation passes.

### Resume Later
Users can click "Save & Resume Later" to receive an email link. They can continue on any device.

### Progress Tracking
Visual progress bar shows:
- Current step
- Completed steps (with checkmarks)
- Steps with errors (red indicators)
- Overall percentage complete

## 📱 Usage in Astro Pages

```astro
---
// src/pages/register.astro
import Layout from '@/layouts/Layout.astro';
import { MyRegistrationForm } from '@/components/forms/MyRegistrationForm';
---

<Layout title="Register">
  <div class="container mx-auto py-12">
    <MyRegistrationForm client:load />
  </div>
</Layout>
```

## 🔧 Advanced Features

### Custom Validation

```tsx
validate: async (data) => {
  // Check email availability
  const response = await fetch(`/api/check-email?email=${data.email}`);
  const { available } = await response.json();

  if (!available) {
    return ['Email is already taken'];
  }

  return [];
}
```

### Step Submission Callbacks

```tsx
<MultiStepForm
  steps={steps}
  renderStep={renderStep}
  onStepSubmit={async (stepId, stepData) => {
    // Save progress to backend after each step
    await fetch('/api/save-progress', {
      method: 'POST',
      body: JSON.stringify({ stepId, data: stepData })
    });
  }}
  onComplete={handleComplete}
/>
```

### Vertical Progress Bar

```tsx
<MultiStepForm
  steps={steps}
  renderStep={renderStep}
  onComplete={handleComplete}
  progressVariant="vertical"  // ← Shows sidebar with step list
/>
```

## 📚 More Info

- **Full Documentation**: `/web/src/components/forms/MULTI-STEP-README.md`
- **Demo Page**: `/forms/multi-step-demo`
- **Example Component**: `/web/src/components/forms/MultiStepFormDemo.tsx`

## 💡 Tips

1. **Keep steps focused** - 3-7 fields per step is optimal
2. **Validate important steps** - Prevent bad data early
3. **Use clear labels** - "Personal Info" not "Step 1"
4. **Test on mobile** - Forms are responsive by default
5. **Monitor analytics** - Track where users drop off

## ❓ Need Help?

Check the demo page at `/forms/multi-step-demo` for a working example!
