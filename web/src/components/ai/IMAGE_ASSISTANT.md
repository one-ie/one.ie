# AI Image Suggestion System

Complete AI-powered image suggestion and generation system for funnel pages.

## Features

- **Stock Photo Search** - Unsplash integration with 3M+ free photos
- **AI Image Generation** - Smart prompts for Stable Diffusion, DALL-E
- **Template Graphics** - Pre-designed graphics for common use cases
- **User Uploads** - Drag-and-drop file upload with preview
- **Smart Suggestions** - AI scores images by relevance
- **Color Extraction** - Automatic brand color extraction from images
- **Alt Text Generation** - Accessibility-friendly descriptions
- **Image Optimization** - WebP, lazy loading, responsive srcsets

## Quick Start

### 1. Setup Environment Variables

Add to `.env`:

```env
# Unsplash API (get free key at https://unsplash.com/developers)
PUBLIC_UNSPLASH_ACCESS_KEY=your_access_key_here
```

### 2. Basic Usage

```tsx
import { ImageAssistant } from '@/components/ai/ImageAssistant';

export function FunnelBuilder() {
  const [heroImage, setHeroImage] = useState<ImageSuggestion | null>(null);

  return (
    <ImageAssistant
      pageType="landing"
      industry="productivity software"
      onSelectImage={(image) => setHeroImage(image)}
      onGeneratePrompt={(prompt) => console.log('AI Prompt:', prompt)}
    />
  );
}
```

### 3. Example Conversation Flow

```
User: "I need a hero image for my landing page"
AI: "Great! What's your landing page about?"

User: "Productivity software for remote teams"
AI: "I've found 8 options for you:

     Stock Photos (4):
     - Team collaborating on laptops
     - Home office setup
     - Video call screenshot
     - Task board overview

     Templates (4):
     - Modern gradient background
     - Minimal clean design
     - Abstract productivity visualization
     - Workflow diagram art

     Which style fits your brand best?"

User: "Modern gradient"
AI: "Perfect! I've selected the modern gradient.

     Extracted colors: #6366f1, #8b5cf6, #ec4899

     Would you like me to:
     1. Apply these colors to your theme?
     2. Generate more images in this style?
     3. Create custom images with AI?"
```

## Components

### ImageAssistant

Main component for image selection and management.

**Props:**

```tsx
interface ImageAssistantProps {
  pageType: 'landing' | 'sales' | 'checkout' | 'thank-you';
  industry: string;
  onSelectImage?: (image: ImageSuggestion) => void;
  onGeneratePrompt?: (prompt: string) => void;
  className?: string;
}
```

**Example:**

```tsx
<ImageAssistant
  pageType="landing"
  industry="fitness coaching"
  onSelectImage={(image) => {
    // Use image in your funnel
    updateFunnelPage({ heroImage: image.url });
  }}
  onGeneratePrompt={(prompt) => {
    // Send to AI image generator (Stable Diffusion, DALL-E)
    generateImage(prompt);
  }}
/>
```

## API Functions

### Image Suggestions

```typescript
import {
  generateSearchKeywords,
  generateImagePrompt,
  generateAltText,
  extractImageColors,
  getOptimizedImageUrl,
} from '@/lib/ai/image-suggestions';

// Generate search keywords
const keywords = generateSearchKeywords('landing', 'fitness', 'modern');
// => ['hero', 'banner', 'fitness', 'modern', 'sleek']

// Generate AI image prompt
const prompt = generateImagePrompt('landing', 'fitness', 'modern', '16:9');
// => "Create a modern, sleek, contemporary design compelling hero image..."

// Generate alt text
const alt = generateAltText('landing', 'fitness', ['gym', 'workout']);
// => "fitness landing page featuring gym, workout"

// Extract colors from image
const colors = await extractImageColors('https://example.com/image.jpg');
// => ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']

// Optimize image URL
const optimized = getOptimizedImageUrl(imageUrl, {
  maxWidth: 1920,
  quality: 85,
  format: 'webp',
});
```

### Unsplash Integration

```typescript
import { unsplash, searchImages } from '@/lib/integrations/unsplash';

// Search for images
const images = await searchImages(['productivity', 'remote work'], {
  limit: 10,
  aspectRatio: '16:9',
});

// Get random image
const random = await unsplash.getRandom('nature');

// Trigger download tracking (required by Unsplash)
await unsplash.triggerDownload(image.downloadUrl);
```

## Image Sources

### 1. Stock Photos (Unsplash)

- 3M+ free high-quality photos
- Attribution required (handled automatically)
- Download tracking required (handled automatically)

**Setup:**

1. Create account at https://unsplash.com/developers
2. Create new app
3. Copy Access Key to `.env`

### 2. AI Generated Images

Generate prompts for:

- **Stable Diffusion** - Open source, self-hosted
- **DALL-E** - OpenAI's image generator
- **Midjourney** - Discord-based generator

**Example Integration:**

```tsx
const prompt = generateImagePrompt('landing', 'ecommerce', 'modern', '16:9');

// Send to Stable Diffusion API
const image = await fetch('https://api.stability.ai/v1/generation', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${STABILITY_API_KEY}`,
  },
  body: JSON.stringify({
    prompt,
    width: 1920,
    height: 1080,
  }),
});
```

### 3. Template Graphics

Pre-designed graphics stored in `/public/images/templates/`:

- Gradients
- Patterns
- Abstract designs
- Minimal backgrounds

**Add your own:**

1. Add images to `/public/images/templates/`
2. Update `getTemplateImages()` in `image-suggestions.ts`

### 4. User Uploads

Built-in file uploader with:

- Drag and drop
- Image preview
- Progress tracking
- File validation

**CDN Integration:**

```tsx
<FileUploader
  accept="image/*"
  onUpload={async (file) => {
    // Upload to your CDN (Cloudinary, S3, etc.)
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const { url } = await response.json();
    return url;
  }}
/>
```

## Advanced Features

### Color Extraction

Automatically extract brand colors from selected images:

```tsx
const colors = await extractImageColors(imageUrl);
// Apply to theme
updateTheme({
  primaryColor: colors[0],
  secondaryColor: colors[1],
});
```

### Smart Relevance Scoring

Images are scored by:

- Keyword matching (10 points per match)
- Source preference (5 points for professional/stock)
- Aspect ratio match (15 points)

```typescript
const scored = sortImagesByRelevance(images, {
  pageType: 'landing',
  industry: 'fitness',
  style: 'modern',
  aspectRatio: '16:9',
  keywords: ['gym', 'workout'],
});
```

### Responsive Images

Generate optimized srcsets for different screen sizes:

```typescript
import { generateSrcSet, getLazyLoadingAttributes } from '@/lib/ai/image-suggestions';

const srcset = generateSrcSet(imageUrl);
const lazyAttrs = getLazyLoadingAttributes();

<img
  src={imageUrl}
  srcSet={srcset}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  {...lazyAttrs}
/>;
```

## Integration with Funnel Builder

### Example: Landing Page Builder

```tsx
import { useState } from 'react';
import { ImageAssistant } from '@/components/ai/ImageAssistant';
import type { ImageSuggestion } from '@/lib/ai/image-suggestions';

export function LandingPageBuilder() {
  const [heroImage, setHeroImage] = useState<ImageSuggestion | null>(null);
  const [brandColors, setBrandColors] = useState<string[]>([]);

  const handleImageSelect = async (image: ImageSuggestion) => {
    setHeroImage(image);

    // Extract and apply colors
    const colors = await extractImageColors(image.url);
    setBrandColors(colors);

    // Update funnel
    updateFunnelPage({
      heroImage: image.url,
      heroImageAlt: image.alt,
      primaryColor: colors[0],
      secondaryColor: colors[1],
    });
  };

  return (
    <div>
      <ImageAssistant
        pageType="landing"
        industry="productivity software"
        onSelectImage={handleImageSelect}
      />

      {heroImage && (
        <div className="preview">
          <img src={heroImage.url} alt={heroImage.alt} />
          <div className="colors">
            {brandColors.map((color) => (
              <div key={color} style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

## Performance

- **Lazy Loading** - All images load lazily
- **WebP Format** - Modern format support
- **Responsive Images** - srcset for different sizes
- **Caching** - Unsplash CDN caching
- **Optimization** - Automatic width/height/quality optimization

## Accessibility

- **Alt Text** - Auto-generated descriptive alt text
- **ARIA Labels** - Proper labeling for screen readers
- **Keyboard Navigation** - Full keyboard support
- **Color Contrast** - WCAG AA compliant

## API Limits

### Unsplash Free Tier

- 50 requests/hour
- 5,000 requests/month
- Attribution required
- Download tracking required

**Upgrade for:**

- Unlimited requests
- No attribution
- Commercial use

## Next Steps

1. **Add Pexels Integration** - Another free stock photo API
2. **Add Stable Diffusion** - Self-hosted AI image generation
3. **Add Image Cropper** - In-browser image editing
4. **Add Filters** - Apply filters/effects to images
5. **Add Batch Upload** - Upload multiple images at once

## Support

- **Unsplash API Docs**: https://unsplash.com/documentation
- **Stable Diffusion**: https://stability.ai/
- **DALL-E API**: https://platform.openai.com/docs/guides/images

## License

- Code: MIT License
- Unsplash Photos: Unsplash License (free to use, attribution appreciated)
- Template Graphics: MIT License
