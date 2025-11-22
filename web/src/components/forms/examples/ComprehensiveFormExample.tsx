/**
 * ComprehensiveFormExample - Demonstrates all form field types
 *
 * This example shows every field type with validation and proper usage
 */

import * as React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

// Import all field types
import {
  TextField,
  EmailField,
  PhoneField,
  NumberField,
  DateField,
  TimeField,
  SelectField,
  MultiSelectField,
  RadioGroupField,
  CheckboxGroupField,
  TextareaField,
  RichTextField,
  FileUploadField,
  ImageUploadField,
  CountryField,
  StateField,
  PostalCodeField,
  CreditCardField,
  RatingField,
  SliderField,
  ColorPickerField,
  SignatureField,
} from '../fields';

export function ComprehensiveFormExample() {
  const form = useForm({
    mode: 'onChange',
    defaultValues: {
      // Basic fields
      fullName: '',
      email: '',
      phone: '',
      age: undefined,
      birthdate: '',
      appointmentTime: '',

      // Advanced fields
      country: '',
      interests: [],
      plan: '',
      features: [],

      // Rich fields
      bio: '',
      content: '',
      resume: null,
      avatar: null,

      // Special fields
      countrySelect: '',
      state: '',
      zipCode: '',
      cardNumber: '',

      // Custom fields
      rating: 0,
      price: 50,
      brandColor: '#FF5733',
      signature: '',
    },
  });

  const onSubmit = (data: any) => {
    console.log('Form submitted:', data);
    toast.success('Form submitted successfully!', {
      description: 'Check console for form data',
    });
  };

  const onError = (errors: any) => {
    console.error('Form errors:', errors);
    toast.error('Please fix the form errors', {
      description: Object.keys(errors).length + ' fields need attention',
    });
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="max-w-4xl mx-auto space-y-6 p-6"
      >
        {/* Basic Fields */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Fields</CardTitle>
            <CardDescription>
              Text, email, phone, number, date, and time inputs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <TextField
                name="fullName"
                label="Full Name"
                placeholder="John Doe"
                required
                minLength={2}
                maxLength={50}
              />

              <EmailField
                name="email"
                label="Email Address"
                description="We'll never share your email"
                required
              />

              <PhoneField
                name="phone"
                label="Phone Number"
                placeholder="+1 (555) 123-4567"
              />

              <NumberField
                name="age"
                label="Age"
                min={18}
                max={120}
                required
              />

              <DateField
                name="birthdate"
                label="Date of Birth"
                required
              />

              <TimeField
                name="appointmentTime"
                label="Appointment Time"
              />
            </div>
          </CardContent>
        </Card>

        {/* Advanced Fields */}
        <Card>
          <CardHeader>
            <CardTitle>Advanced Fields</CardTitle>
            <CardDescription>
              Dropdowns, multi-select, radio buttons, and checkboxes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SelectField
              name="country"
              label="Favorite Country"
              options={[
                { value: 'us', label: 'United States' },
                { value: 'ca', label: 'Canada' },
                { value: 'uk', label: 'United Kingdom' },
                { value: 'au', label: 'Australia' },
              ]}
              required
            />

            <MultiSelectField
              name="interests"
              label="Interests"
              description="Select up to 3 interests"
              options={[
                { value: 'tech', label: 'Technology' },
                { value: 'sports', label: 'Sports' },
                { value: 'music', label: 'Music' },
                { value: 'art', label: 'Art' },
                { value: 'travel', label: 'Travel' },
              ]}
              maxSelections={3}
            />

            <RadioGroupField
              name="plan"
              label="Subscription Plan"
              options={[
                { value: 'free', label: 'Free - $0/month' },
                { value: 'pro', label: 'Pro - $10/month' },
                { value: 'enterprise', label: 'Enterprise - Contact us' },
              ]}
              required
            />

            <CheckboxGroupField
              name="features"
              label="Additional Features"
              options={[
                { value: 'analytics', label: 'Analytics Dashboard' },
                { value: 'api', label: 'API Access' },
                { value: 'support', label: '24/7 Support' },
                { value: 'backup', label: 'Automated Backups' },
              ]}
            />
          </CardContent>
        </Card>

        {/* Rich Fields */}
        <Card>
          <CardHeader>
            <CardTitle>Rich Fields</CardTitle>
            <CardDescription>
              Textarea, rich text, and file uploads
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <TextareaField
              name="bio"
              label="Biography"
              placeholder="Tell us about yourself..."
              description="Maximum 500 characters"
              rows={4}
              maxLength={500}
            />

            <RichTextField
              name="content"
              label="Article Content"
              description="Rich text editor coming soon"
            />

            <div className="grid md:grid-cols-2 gap-4">
              <FileUploadField
                name="resume"
                label="Upload Resume"
                description="PDF or Word document (max 5MB)"
                accept=".pdf,.doc,.docx"
                maxSize={5 * 1024 * 1024}
              />

              <ImageUploadField
                name="avatar"
                label="Profile Picture"
                description="JPG, PNG or GIF (max 2MB)"
                maxSize={2 * 1024 * 1024}
              />
            </div>
          </CardContent>
        </Card>

        {/* Special Fields */}
        <Card>
          <CardHeader>
            <CardTitle>Special Fields</CardTitle>
            <CardDescription>
              Country, state, postal code, and credit card inputs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <CountryField
                name="countrySelect"
                label="Country"
                required
              />

              <StateField
                name="state"
                label="State/Province"
                country="US"
                required
              />

              <PostalCodeField
                name="zipCode"
                label="ZIP Code"
                country="US"
                required
              />

              <CreditCardField
                name="cardNumber"
                label="Card Number"
                description="For payment processing"
                showCardType
              />
            </div>
          </CardContent>
        </Card>

        {/* Custom Fields */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Fields</CardTitle>
            <CardDescription>
              Rating, slider, color picker, and signature
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RatingField
              name="rating"
              label="Rate Our Service"
              description="How satisfied are you?"
              max={5}
              icon="star"
              required
            />

            <SliderField
              name="price"
              label="Price Range"
              description="Select your budget"
              min={0}
              max={1000}
              step={10}
              showValue
            />

            <ColorPickerField
              name="brandColor"
              label="Brand Color"
              description="Choose your brand's primary color"
            />

            <SignatureField
              name="signature"
              label="Digital Signature"
              description="Please sign in the box above"
              required
            />
          </CardContent>
        </Card>

        {/* Form Actions */}
        <Card>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Reset Form
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => console.log(form.getValues())}
              >
                Log Values
              </Button>
              <Button type="submit">
                Submit Form
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Form State Display */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-sm font-mono">Form State</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto max-h-60">
              {JSON.stringify(form.watch(), null, 2)}
            </pre>
          </CardContent>
        </Card>
      </form>
    </FormProvider>
  );
}
