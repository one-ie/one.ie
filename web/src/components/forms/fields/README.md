# Form Field Types Library

Comprehensive, production-ready form field components built with react-hook-form, shadcn/ui, and TypeScript.

## Features

- **25+ field types** covering basic, advanced, rich, special, and custom inputs
- **Built-in validation** using react-hook-form rules
- **Accessible** with proper ARIA attributes and labels
- **Type-safe** with full TypeScript support
- **Consistent styling** using shadcn/ui components
- **Framework agnostic** - works anywhere React works

## Installation

All dependencies are already installed. Import from `@/components/forms/fields`:

```tsx
import { TextField, EmailField, SelectField } from '@/components/forms/fields';
```

## Usage

### Basic Example

```tsx
import { useForm, FormProvider } from 'react-hook-form';
import { TextField, EmailField } from '@/components/forms/fields';
import { Button } from '@/components/ui/button';

export function MyForm() {
  const form = useForm();

  const onSubmit = (data: any) => {
    console.log(data);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <TextField
          name="fullName"
          label="Full Name"
          placeholder="John Doe"
          required
        />

        <EmailField
          name="email"
          label="Email Address"
          required
        />

        <Button type="submit">Submit</Button>
      </form>
    </FormProvider>
  );
}
```

## Field Types Reference

### Basic Fields

#### TextField
```tsx
<TextField
  name="username"
  label="Username"
  placeholder="Enter username"
  required
  minLength={3}
  maxLength={20}
/>
```

#### EmailField
```tsx
<EmailField
  name="email"
  label="Email Address"
  required
/>
```

#### PhoneField
```tsx
<PhoneField
  name="phone"
  label="Phone Number"
  placeholder="+1 (555) 123-4567"
/>
```

#### NumberField
```tsx
<NumberField
  name="age"
  label="Age"
  min={18}
  max={100}
  required
/>
```

#### DateField
```tsx
<DateField
  name="birthdate"
  label="Date of Birth"
  required
/>
```

#### TimeField
```tsx
<TimeField
  name="appointmentTime"
  label="Appointment Time"
/>
```

### Advanced Fields

#### SelectField
```tsx
<SelectField
  name="country"
  label="Country"
  options={[
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' },
  ]}
  required
/>
```

#### MultiSelectField
```tsx
<MultiSelectField
  name="interests"
  label="Interests"
  options={[
    { value: 'tech', label: 'Technology' },
    { value: 'sports', label: 'Sports' },
    { value: 'music', label: 'Music' },
  ]}
  maxSelections={3}
/>
```

#### RadioGroupField
```tsx
<RadioGroupField
  name="plan"
  label="Subscription Plan"
  options={[
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro - $10/month' },
    { value: 'enterprise', label: 'Enterprise - Contact us' },
  ]}
  required
/>
```

#### CheckboxGroupField
```tsx
<CheckboxGroupField
  name="features"
  label="Select Features"
  options={[
    { value: 'analytics', label: 'Analytics Dashboard' },
    { value: 'api', label: 'API Access' },
    { value: 'support', label: '24/7 Support' },
  ]}
/>
```

### Rich Fields

#### TextareaField
```tsx
<TextareaField
  name="bio"
  label="Biography"
  placeholder="Tell us about yourself..."
  rows={6}
  maxLength={500}
/>
```

#### RichTextField
```tsx
<RichTextField
  name="content"
  label="Article Content"
  description="Rich text editor (markdown supported)"
/>
```

#### FileUploadField
```tsx
<FileUploadField
  name="resume"
  label="Upload Resume"
  accept=".pdf,.doc,.docx"
  maxSize={5 * 1024 * 1024} // 5MB
  required
/>
```

#### ImageUploadField
```tsx
<ImageUploadField
  name="avatar"
  label="Profile Picture"
  maxSize={2 * 1024 * 1024} // 2MB
/>
```

### Special Fields

#### CountryField
```tsx
<CountryField
  name="country"
  label="Country"
  required
/>
```

#### StateField
```tsx
<StateField
  name="state"
  label="State"
  country="US" // or "CA" for Canadian provinces
  required
/>
```

#### PostalCodeField
```tsx
<PostalCodeField
  name="zipCode"
  label="ZIP Code"
  country="US" // "US", "CA", "GB", or "INTL"
  required
/>
```

#### CreditCardField
```tsx
<CreditCardField
  name="cardNumber"
  label="Card Number"
  showCardType
  required
/>
```

### Custom Fields

#### RatingField
```tsx
<RatingField
  name="rating"
  label="Rate this product"
  max={5}
  icon="star" // "star", "heart", or "circle"
  required
/>
```

#### SliderField
```tsx
<SliderField
  name="price"
  label="Price Range"
  min={0}
  max={1000}
  step={10}
  showValue
/>
```

#### ColorPickerField
```tsx
<ColorPickerField
  name="brandColor"
  label="Brand Color"
  placeholder="#FF5733"
/>
```

#### SignatureField
```tsx
<SignatureField
  name="signature"
  label="Sign Here"
  description="Draw your signature in the box above"
  required
/>
```

## Validation

All fields support react-hook-form validation rules:

```tsx
<TextField
  name="username"
  label="Username"
  required // Built-in required validation
  minLength={3}
  maxLength={20}
  pattern={/^[a-zA-Z0-9_]+$/}
/>

// Or use custom validation in FormProvider rules:
const form = useForm({
  mode: 'onChange',
  defaultValues: {
    username: '',
  },
});
```

## Accessibility

All fields include:
- Proper ARIA labels
- Error state indicators (`aria-invalid`)
- Keyboard navigation support
- Screen reader friendly
- Focus management

## TypeScript Support

Full type definitions included:

```tsx
import type {
  TextFieldProps,
  SelectFieldProps,
  FileUploadFieldProps,
  // ... other types
} from '@/components/forms/fields';
```

## Styling

Fields use shadcn/ui theming and support custom className:

```tsx
<TextField
  name="email"
  className="max-w-md" // Custom Tailwind classes
/>
```

## Best Practices

1. **Always wrap in FormProvider:**
```tsx
const form = useForm();

return (
  <FormProvider {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Your fields */}
    </form>
  </FormProvider>
);
```

2. **Use proper validation:**
```tsx
<EmailField name="email" required /> // Email validation built-in
<NumberField name="age" min={18} max={100} /> // Range validation
<FileUploadField name="file" maxSize={5 * 1024 * 1024} /> // Size validation
```

3. **Provide helpful descriptions:**
```tsx
<TextField
  name="password"
  label="Password"
  description="Must be at least 8 characters with uppercase, lowercase, and numbers"
  minLength={8}
/>
```

4. **Handle errors gracefully:**
```tsx
const onSubmit = async (data: any) => {
  try {
    await submitForm(data);
  } catch (error) {
    form.setError('root', {
      message: 'Submission failed. Please try again.'
    });
  }
};
```

## Examples

See the complete example form at:
`/web/src/components/forms/examples/ComprehensiveFormExample.tsx`

## Contributing

To add a new field type:

1. Create field component in `/web/src/components/forms/fields/`
2. Follow the pattern of existing fields
3. Use `FormFieldWrapper` for consistent styling
4. Add TypeScript types to `types.ts`
5. Export from `index.ts`
6. Document in this README

## License

Part of the ONE Platform. See LICENSE.md for details.
