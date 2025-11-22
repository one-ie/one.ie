# Quick Reference: All 25 Field Types

## Import Statement
```tsx
import {
  // Basic
  TextField, EmailField, PhoneField, NumberField, DateField, TimeField,
  
  // Advanced
  SelectField, MultiSelectField, RadioGroupField, CheckboxGroupField,
  
  // Rich
  TextareaField, RichTextField, FileUploadField, ImageUploadField,
  
  // Special
  CountryField, StateField, PostalCodeField, CreditCardField,
  
  // Custom
  RatingField, SliderField, ColorPickerField, SignatureField,
} from '@/components/forms/fields';
```

## Field Signatures

### Basic Fields
```tsx
<TextField name="username" label="Username" required minLength={3} maxLength={20} />
<EmailField name="email" label="Email" required />
<PhoneField name="phone" label="Phone" placeholder="+1 (555) 123-4567" />
<NumberField name="age" label="Age" min={18} max={100} required />
<DateField name="birthdate" label="Date of Birth" required />
<TimeField name="time" label="Time" />
```

### Advanced Fields
```tsx
<SelectField name="country" label="Country" options={[...]} required />
<MultiSelectField name="interests" label="Interests" options={[...]} maxSelections={3} />
<RadioGroupField name="plan" label="Plan" options={[...]} required />
<CheckboxGroupField name="features" label="Features" options={[...]} />
```

### Rich Fields
```tsx
<TextareaField name="bio" label="Bio" rows={4} maxLength={500} />
<RichTextField name="content" label="Content" />
<FileUploadField name="file" label="Upload" accept=".pdf" maxSize={5*1024*1024} />
<ImageUploadField name="image" label="Image" maxSize={2*1024*1024} />
```

### Special Fields
```tsx
<CountryField name="country" label="Country" required />
<StateField name="state" label="State" country="US" required />
<PostalCodeField name="zip" label="ZIP" country="US" required />
<CreditCardField name="card" label="Card Number" showCardType required />
```

### Custom Fields
```tsx
<RatingField name="rating" label="Rating" max={5} icon="star" required />
<SliderField name="price" label="Price" min={0} max={1000} step={10} showValue />
<ColorPickerField name="color" label="Color" placeholder="#FF5733" />
<SignatureField name="signature" label="Signature" required />
```

## Common Props (All Fields)

| Prop | Type | Description |
|------|------|-------------|
| `name` | `string` | **Required**. Field name in form data |
| `label` | `string` | Field label displayed above input |
| `description` | `string` | Help text displayed below input |
| `placeholder` | `string` | Placeholder text in input |
| `required` | `boolean` | Mark field as required |
| `disabled` | `boolean` | Disable field interaction |
| `className` | `string` | Additional Tailwind classes |

## Validation Props by Field Type

### TextField
- `minLength: number` - Minimum characters
- `maxLength: number` - Maximum characters
- `pattern: RegExp` - Pattern to match

### NumberField
- `min: number` - Minimum value
- `max: number` - Maximum value
- `step: number` - Increment step

### SelectField
- `options: SelectOption[]` - Array of `{ value, label, disabled? }`
- `searchable: boolean` - Enable search (future)

### MultiSelectField
- `options: SelectOption[]` - Array of options
- `maxSelections: number` - Max items to select

### FileUploadField
- `accept: string` - File types (e.g., `.pdf,.doc`)
- `maxSize: number` - Max file size in bytes
- `multiple: boolean` - Allow multiple files
- `maxFiles: number` - Max number of files

### RatingField
- `max: number` - Max rating value (default: 5)
- `icon: 'star' | 'heart' | 'circle'` - Icon type

### SliderField
- `min: number` - Minimum value
- `max: number` - Maximum value
- `step: number` - Value increment
- `showValue: boolean` - Display current value

## Examples by Use Case

### User Registration
```tsx
<TextField name="username" label="Username" required minLength={3} />
<EmailField name="email" label="Email" required />
<TextField name="password" label="Password" type="password" required minLength={8} />
<DateField name="birthdate" label="Date of Birth" required />
```

### Product Review
```tsx
<RatingField name="rating" label="Rate Product" max={5} icon="star" required />
<TextareaField name="review" label="Write Review" rows={4} maxLength={500} />
<ImageUploadField name="photos" label="Add Photos" multiple maxFiles={5} />
```

### Checkout Form
```tsx
<TextField name="fullName" label="Full Name" required />
<EmailField name="email" label="Email" required />
<CountryField name="country" label="Country" required />
<StateField name="state" label="State" country="US" required />
<PostalCodeField name="zip" label="ZIP Code" country="US" required />
<CreditCardField name="card" label="Card Number" showCardType required />
```

### Survey Form
```tsx
<RadioGroupField name="satisfaction" label="How satisfied are you?" options={[...]} required />
<CheckboxGroupField name="features" label="Which features do you use?" options={[...]} />
<SliderField name="nps" label="Net Promoter Score" min={0} max={10} showValue />
<TextareaField name="feedback" label="Additional Feedback" rows={6} />
```

### Settings Form
```tsx
<TextField name="displayName" label="Display Name" required />
<SelectField name="timezone" label="Timezone" options={[...]} required />
<ColorPickerField name="theme" label="Theme Color" />
<ImageUploadField name="avatar" label="Profile Picture" />
```
