# Form Validation System - Cycle 63

Comprehensive form validation with Zod schemas, real-time feedback, and visual indicators.

## Features

- ✅ Client-side validation with Zod schemas
- ✅ Real-time validation (on blur, on change, on submit)
- ✅ Visual feedback (red borders for errors, green for valid)
- ✅ Success indicators (green checkmarks)
- ✅ Custom validators (sync and async)
- ✅ Common field types (email, phone, URL, password, etc.)
- ✅ Pre-built form schemas (contact, registration, product, etc.)
- ✅ TypeScript type safety throughout

## Quick Start

### 1. Import Schema and Hook

```typescript
import { useFormValidation } from '@/lib/forms/validation';
import { productFormSchema, type ProductFormData } from '@/lib/forms/schemas';
```

### 2. Initialize Form

```typescript
const form = useFormValidation<ProductFormData>({
  schema: productFormSchema,
  mode: 'onBlur', // Validate when field loses focus
  revalidateMode: 'onChange', // Re-validate on every change after first validation
  defaultValues: {
    name: '',
    price: 0,
    // ... other fields
  },
});
```

### 3. Use in Form

```tsx
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Product Name</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    <Button type="submit">Submit</Button>
  </form>
</Form>
```

## Validation Modes

| Mode | Behavior |
|------|----------|
| `onBlur` | Validate when field loses focus (default) |
| `onChange` | Validate on every keystroke |
| `onSubmit` | Validate only when form is submitted |
| `onTouched` | Validate after field is touched |
| `all` | Validate on all events |

## Common Schemas

### Primitive Fields

```typescript
import {
  requiredTextSchema,
  optionalTextSchema,
  emailSchema,
  phoneSchema,
  urlSchema,
  passwordSchema,
  numberSchema,
  priceSchema,
  percentageSchema,
  textareaSchema,
  slugSchema,
  hexColorSchema,
} from '@/lib/forms/schemas';
```

### Composite Forms

```typescript
import {
  contactFormSchema,
  registrationFormSchema,
  loginFormSchema,
  productFormSchema,
  profileFormSchema,
  addressFormSchema,
  courseFormSchema,
} from '@/lib/forms/schemas';
```

## Visual Feedback

### Red Border for Errors

```tsx
<Input
  {...field}
  className={cn(
    errors.name && "border-red-500 focus-visible:ring-red-500"
  )}
/>
```

### Green Border for Valid Fields

```tsx
<Input
  {...field}
  className={cn(
    !errors.name &&
    dirtyFields.name &&
    touchedFields.name &&
    "border-green-500"
  )}
/>
```

### Validation Indicator Icons

```tsx
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { getValidationState } from '@/lib/forms/validation';

<div className="absolute right-3 top-1/2 -translate-y-1/2">
  {getValidationState(!!errors.name, isValidating.name, dirtyFields.name, touchedFields.name) === 'valid' && (
    <CheckCircle2 className="h-4 w-4 text-green-600" />
  )}
  {getValidationState(...) === 'invalid' && (
    <XCircle className="h-4 w-4 text-red-600" />
  )}
  {getValidationState(...) === 'validating' && (
    <Loader2 className="h-4 w-4 animate-spin" />
  )}
</div>
```

## Custom Validators

### Synchronous Validation

```typescript
import { z } from 'zod';

const customSchema = z.object({
  username: z.string()
    .min(3, 'Minimum 3 characters')
    .refine(
      (value) => /^[a-zA-Z0-9_]+$/.test(value),
      'Only letters, numbers, and underscores allowed'
    ),
});
```

### Asynchronous Validation

```typescript
import { createAsyncValidator } from '@/lib/forms/schemas';

const emailSchema = z.string()
  .email()
  .refine(
    async (email) => {
      const response = await fetch(`/api/check-email?email=${email}`);
      const data = await response.json();
      return data.available;
    },
    { message: 'Email is already taken' }
  );
```

### Debounced Async Validation

```typescript
import { debounceValidation } from '@/lib/forms/validation';

const debouncedValidate = debounceValidation(
  async (value) => validateField(emailSchema, value),
  500 // Wait 500ms after typing stops
);
```

## Field Types

### Text Input

```tsx
<FormField
  control={form.control}
  name="name"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Name *</FormLabel>
      <FormControl>
        <Input placeholder="Enter name" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Email Input

```tsx
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email *</FormLabel>
      <FormControl>
        <Input type="email" placeholder="you@example.com" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Password Input

```tsx
<FormField
  control={form.control}
  name="password"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Password *</FormLabel>
      <FormControl>
        <Input type="password" {...field} />
      </FormControl>
      <FormDescription>
        At least 8 characters with uppercase, lowercase, number, and special character
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Number Input

```tsx
<FormField
  control={form.control}
  name="price"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Price *</FormLabel>
      <FormControl>
        <Input
          type="number"
          step="0.01"
          {...field}
          onChange={(e) => field.onChange(parseFloat(e.target.value))}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Textarea

```tsx
<FormField
  control={form.control}
  name="description"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Description *</FormLabel>
      <FormControl>
        <Textarea placeholder="Enter description..." {...field} />
      </FormControl>
      <FormDescription>
        {field.value?.length || 0} / 2000 characters
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Select Dropdown

```tsx
<FormField
  control={form.control}
  name="category"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Category *</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="electronics">Electronics</SelectItem>
          <SelectItem value="clothing">Clothing</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Checkbox

```tsx
<FormField
  control={form.control}
  name="terms"
  render={({ field }) => (
    <FormItem className="flex flex-row items-start space-x-3">
      <FormControl>
        <Checkbox
          checked={field.value}
          onCheckedChange={field.onChange}
        />
      </FormControl>
      <div className="space-y-1 leading-none">
        <FormLabel>Accept terms and conditions *</FormLabel>
        <FormDescription>
          You agree to our Terms of Service and Privacy Policy
        </FormDescription>
      </div>
      <FormMessage />
    </FormItem>
  )}
/>
```

## Complete Example

See `/web/src/components/forms/ValidatedForm.tsx` for a comprehensive example showing:

- All field types
- Real-time validation
- Visual feedback (red/green borders)
- Success indicators (checkmarks)
- Custom validation
- Auto-slug generation
- Character counting
- Submit handling

## Common Patterns

### Required Field Indicator

```tsx
<FormLabel>
  Field Name
  <span className="text-destructive ml-1">*</span>
</FormLabel>
```

### Character Counter

```tsx
<FormDescription>
  {field.value?.length || 0} / {maxLength} characters
</FormDescription>
```

### Conditional Validation

```tsx
const schema = z.object({
  type: z.enum(['physical', 'digital']),
  weight: z.number().optional(),
}).refine(
  (data) => {
    if (data.type === 'physical') {
      return data.weight !== undefined && data.weight > 0;
    }
    return true;
  },
  {
    message: 'Weight is required for physical products',
    path: ['weight'],
  }
);
```

### Auto-Generate Slug

```tsx
<Input
  {...field}
  onChange={(e) => {
    field.onChange(e);
    const slug = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    form.setValue('slug', slug);
  }}
/>
```

## Error Handling

### Display First Error

```typescript
import { getFirstError } from '@/lib/forms/validation';

const firstError = getFirstError(form.formState.errors);
if (firstError) {
  toast.error(firstError);
}
```

### Format All Errors

```typescript
import { formatValidationErrors } from '@/lib/forms/validation';

const errors = formatValidationErrors(form.formState.errors);
errors.forEach(error => {
  console.log(`${error.field}: ${error.message}`);
});
```

## API Integration

### Submit Handler

```typescript
async function onSubmit(data: ProductFormData) {
  try {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create product');
    }

    toast.success('Product created successfully!');
    form.reset();
  } catch (error) {
    toast.error('Failed to create product');
  }
}
```

### Server-Side Validation

```typescript
// API endpoint
import { productFormSchema } from '@/lib/forms/schemas';

export async function POST(request: Request) {
  const body = await request.json();

  // Validate with same schema
  const result = productFormSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      { errors: result.error.errors },
      { status: 400 }
    );
  }

  // Process valid data
  const product = await createProduct(result.data);
  return Response.json({ product });
}
```

## Best Practices

1. **Use `onBlur` mode by default** - Better UX than validating every keystroke
2. **Show visual feedback** - Red borders for errors, green for valid fields
3. **Provide helpful error messages** - Be specific about what's wrong
4. **Use async validation sparingly** - Debounce to reduce API calls
5. **Validate on both client and server** - Never trust client-side validation alone
6. **Reset form after successful submission** - Clear all fields
7. **Show loading state** - Disable submit button during submission
8. **Use TypeScript** - Full type safety from schema to component

## Testing

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ValidatedForm } from './ValidatedForm';

test('shows error for invalid email', async () => {
  render(<ValidatedForm />);

  const emailInput = screen.getByLabelText(/email/i);
  await userEvent.type(emailInput, 'invalid-email');
  await userEvent.tab(); // Trigger onBlur

  await waitFor(() => {
    expect(screen.getByText(/valid email/i)).toBeInTheDocument();
  });
});

test('shows success indicator for valid field', async () => {
  render(<ValidatedForm />);

  const emailInput = screen.getByLabelText(/email/i);
  await userEvent.type(emailInput, 'valid@example.com');
  await userEvent.tab();

  await waitFor(() => {
    expect(screen.getByRole('img', { name: /check/i })).toBeInTheDocument();
  });
});
```

## Troubleshooting

### Error: "Cannot find module '@hookform/resolvers/zod'"

Install the package:
```bash
bun add @hookform/resolvers
```

### Validation not triggering

Make sure you're using the correct validation mode:
```typescript
const form = useFormValidation({
  schema: mySchema,
  mode: 'onBlur', // or 'onChange', 'onSubmit'
});
```

### Green border not showing

Check that all three conditions are met:
```typescript
!errors.field && dirtyFields.field && touchedFields.field
```

### Async validation too slow

Add debouncing:
```typescript
const debouncedValidate = debounceValidation(validateFn, 500);
```

## Files

- **`/web/src/lib/forms/schemas.ts`** - Zod schemas for all field types
- **`/web/src/lib/forms/validation.ts`** - Validation utilities and hooks
- **`/web/src/components/forms/ValidatedForm.tsx`** - Complete example component
- **`/web/src/components/ui/form.tsx`** - shadcn/ui form components

## Learn More

- [Zod Documentation](https://zod.dev/)
- [React Hook Form](https://react-hook-form.com/)
- [shadcn/ui Forms](https://ui.shadcn.com/docs/components/form)
