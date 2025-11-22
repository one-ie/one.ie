---
title: "Cycle 005: Page Element Types Specification"
dimension: things
category: plans
tags: funnel-builder, page-elements, components, ui-schema, page-builder
related_dimensions: connections, knowledge, things
scope: cycle
cycle: 005
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
ai_context: |
  Complete specification for all page element types that can be used in funnel pages.
  Each element includes properties schema, validation rules, responsive behavior, and
  AI prompt patterns for natural language description in chat.
---

# Cycle 005: Page Element Types Specification

**Objective:** Define all UI component types that users can add to funnel pages, with complete property schemas, validation rules, and natural language patterns for AI-friendly interface design.

**Ontology Mapping:**
- Each element instance = `thing` with `type: "page_element"`
- Element type stored in `properties.elementType`
- Connection to parent step via `step_contains_element`
- Position tracked in connection metadata

---

## Architecture Overview

### Element Structure (Convex Schema)

```typescript
type PageElement = {
  _id: Id<"things">;
  type: "page_element";
  groupId: Id<"groups">;
  ownerId: Id<"things">; // creator
  properties: {
    elementType: ElementType; // "headline", "button", "form", etc.
    name: string; // "Main CTA Button"
    settings: ElementSettings; // type-specific properties
    styling: ElementStyling; // color, size, font, etc.
    position: PositionMetadata; // x, y, width, height, z-index
    responsive: ResponsiveRules; // mobile, tablet, desktop breakpoints
    visibility: VisibilityRules; // show/hide conditions
  };
  status: "active" | "archived" | "draft";
  createdAt: number;
  updatedAt: number;
};
```

### Element Types Taxonomy

```
PAGE_ELEMENTS
├── TEXT
│   ├── Headline (H1-H6)
│   ├── Subheadline
│   ├── Paragraph
│   ├── Bullet List
│   └── Quote / Testimonial Text
├── MEDIA
│   ├── Image
│   ├── Video (YouTube/Vimeo/Custom)
│   ├── Audio Player
│   ├── Image Gallery
│   └── Background Video
├── FORMS
│   ├── Input Field (text, email, phone, number)
│   ├── Textarea
│   ├── Select Dropdown
│   ├── Checkbox
│   ├── Radio Buttons
│   ├── Submit Button
│   └── Multi-step Form
├── COMMERCE
│   ├── Pricing Table
│   ├── Buy Button
│   ├── Product Card
│   ├── Cart Summary
│   ├── Order Bump Checkbox
│   └── Coupon Code Input
├── SOCIAL_PROOF
│   ├── Testimonial Card
│   ├── Review Stars
│   ├── Trust Badges
│   ├── Social Media Feed
│   └── Customer Count Ticker
├── URGENCY
│   ├── Countdown Timer
│   ├── Stock Counter
│   ├── Limited Offer Banner
│   └── Exit Intent Popup
└── INTERACTIVE
    ├── FAQ Accordion
    ├── Tabs
    ├── Progress Bar
    ├── Quiz / Survey
    ├── Calendar Booking
    └── Live Chat Widget
```

---

## 1. TEXT ELEMENTS

### 1.1 Headline (H1-H6)

**Element Type:** `headline`

**AI Prompt Patterns:**
- "Add a big title saying 'Your Main Message Here'"
- "Create an h1 heading at the top"
- "I need a large headline above the form"
- "Add a 50-character headline"

**Properties Schema:**

```typescript
interface HeadlineSettings {
  text: string; // max 255 characters
  level: 1 | 2 | 3 | 4 | 5 | 6; // h1-h6
  alignment: "left" | "center" | "right"; // text alignment
  maxWidth?: number; // in pixels
  lineHeight?: number; // 1.2 - 2.0
  letterSpacing?: number; // in em
  animation?: {
    type: "fade-in" | "slide-up" | "slide-down" | "bounce";
    duration: number; // milliseconds
    delay: number;
  };
}

interface HeadlineStyling {
  fontFamily: string; // "Inter", "Georgia", etc.
  fontSize: number; // in px
  fontWeight: 300 | 400 | 500 | 600 | 700 | 800 | 900;
  color: string; // hex color
  textShadow?: string;
  textDecoration: "none" | "underline" | "line-through";
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize";
  backgroundColor?: string;
  padding?: { top: number; right: number; bottom: number; left: number };
  margin?: { top: number; right: number; bottom: number; left: number };
}
```

**Default Values:**

```json
{
  "text": "Your Headline Here",
  "level": 1,
  "alignment": "center",
  "maxWidth": null,
  "fontFamily": "Inter",
  "fontSize": 48,
  "fontWeight": 700,
  "color": "#000000",
  "animation": null
}
```

**Validation Rules:**

- `text`: Required, 1-255 characters
- `level`: Required, must be 1-6
- `fontSize`: 16-120 px
- `fontWeight`: Must be valid weight
- `color`: Valid hex color format

**Responsive Behavior:**

```json
{
  "mobile": {
    "fontSize": 28,
    "fontWeight": 600,
    "margin": { "top": 16, "bottom": 12 }
  },
  "tablet": {
    "fontSize": 36,
    "fontWeight": 600,
    "margin": { "top": 20, "bottom": 16 }
  },
  "desktop": {
    "fontSize": 48,
    "fontWeight": 700,
    "margin": { "top": 32, "bottom": 24 }
  }
}
```

---

### 1.2 Subheadline

**Element Type:** `subheadline`

**AI Prompt Patterns:**
- "Add a smaller subtitle under the main headline"
- "Create a secondary heading with description text"
- "Add supporting text below the title"
- "Insert a subheading"

**Properties Schema:**

```typescript
interface SubheadlineSettings {
  text: string; // max 255 characters
  alignment: "left" | "center" | "right";
  maxWidth?: number;
  lineHeight?: number;
}

interface SubheadlineStyling {
  fontFamily: string;
  fontSize: number; // 18-48 px recommended
  fontWeight: 300 | 400 | 500 | 600;
  color: string;
  opacity?: number; // 0-1 for gray-out effect
  animation?: AnimationConfig;
}
```

**Default Values:**

```json
{
  "text": "Your supporting subtitle goes here",
  "alignment": "center",
  "fontSize": 24,
  "fontWeight": 400,
  "color": "#666666",
  "opacity": 0.9
}
```

**Validation Rules:**

- `text`: Required, 1-255 characters
- `fontSize`: 14-48 px
- `opacity`: 0.5-1.0 (minimum readability)

**Responsive Behavior:**

```json
{
  "mobile": { "fontSize": 16, "margin": { "bottom": 12 } },
  "desktop": { "fontSize": 24, "margin": { "bottom": 20 } }
}
```

---

### 1.3 Paragraph

**Element Type:** `paragraph`

**AI Prompt Patterns:**
- "Add a paragraph of body text"
- "Insert description text explaining the benefits"
- "Add a longer section of text content"
- "Create a paragraph with this copy"

**Properties Schema:**

```typescript
interface ParagraphSettings {
  text: string; // max 5000 characters
  alignment: "left" | "center" | "right" | "justify";
  maxWidth?: number; // ideal reading line length
  columns?: 1 | 2 | 3; // multi-column layout
  firstLetterCapital?: boolean; // large drop cap effect
}

interface ParagraphStyling {
  fontFamily: string;
  fontSize: number; // 14-32 px
  fontWeight: 300 | 400 | 500;
  color: string;
  lineHeight: number; // 1.4-1.8 for readability
  letterSpacing?: number;
  backgroundColor?: string;
  padding?: Spacing;
  margin?: Spacing;
}
```

**Default Values:**

```json
{
  "text": "Enter your paragraph text here...",
  "alignment": "left",
  "maxWidth": null,
  "fontSize": 16,
  "fontWeight": 400,
  "color": "#333333",
  "lineHeight": 1.6
}
```

**Validation Rules:**

- `text`: Required, 1-5000 characters
- `fontSize`: 12-32 px
- `lineHeight`: 1.2-2.0 (minimum 1.4 recommended)

**Responsive Behavior:**

```json
{
  "mobile": {
    "fontSize": 14,
    "lineHeight": 1.6,
    "maxWidth": "100%"
  },
  "desktop": {
    "fontSize": 16,
    "lineHeight": 1.8,
    "maxWidth": 600
  }
}
```

---

### 1.4 Bullet List

**Element Type:** `bullet_list`

**AI Prompt Patterns:**
- "Add a bullet list with benefits"
- "Create a list of 5 features"
- "Add checkmarks for features"
- "Insert numbered list"
- "Add list of features in bullets"

**Properties Schema:**

```typescript
interface BulletListSettings {
  items: {
    text: string;
    icon?: "bullet" | "checkmark" | "arrow" | "star" | "number" | "custom";
    customIcon?: string; // emoji or URL
  }[];
  ordered: boolean; // true = numbered, false = bulleted
  alignment: "left" | "center" | "right";
  spacing: "compact" | "normal" | "loose";
}

interface BulletListStyling {
  fontFamily: string;
  fontSize: number; // 14-24 px
  fontWeight: 400 | 500;
  color: string;
  iconColor?: string;
  lineHeight: number;
  padding?: Spacing;
  margin?: Spacing;
}
```

**Default Values:**

```json
{
  "items": [
    { "text": "First item", "icon": "checkmark" },
    { "text": "Second item", "icon": "checkmark" },
    { "text": "Third item", "icon": "checkmark" }
  ],
  "ordered": false,
  "alignment": "left",
  "spacing": "normal",
  "fontSize": 16,
  "fontWeight": 500,
  "color": "#333333"
}
```

**Validation Rules:**

- `items`: Required, 1-50 items
- Each item `text`: 1-200 characters
- `fontSize`: 12-32 px

**Responsive Behavior:**

```json
{
  "mobile": {
    "fontSize": 14,
    "spacing": "compact"
  },
  "desktop": {
    "fontSize": 16,
    "spacing": "normal"
  }
}
```

---

### 1.5 Quote / Testimonial Text

**Element Type:** `testimonial_text`

**AI Prompt Patterns:**
- "Add a customer quote"
- "Insert testimonial"
- "Add this customer review"
- "Create a quote box with attribution"
- "Add a pull quote"

**Properties Schema:**

```typescript
interface TestimonialTextSettings {
  quote: string; // max 500 characters
  author: string; // author name
  role?: string; // job title
  company?: string;
  alignment: "left" | "center" | "right";
  displayRating?: number; // 1-5 stars
  displayPhoto?: boolean; // show author photo
  photoUrl?: string;
}

interface TestimonialTextStyling {
  fontFamily: string;
  fontSize: number; // 16-32 px
  fontWeight: 400 | 500 | 600;
  color: string;
  quoteMarks?: boolean; // large quotation marks
  backgroundColor?: string;
  borderLeft?: {
    width: number;
    color: string;
  };
  padding?: Spacing;
  margin?: Spacing;
}
```

**Default Values:**

```json
{
  "quote": "This is an amazing product!",
  "author": "Happy Customer",
  "role": null,
  "company": null,
  "alignment": "center",
  "displayRating": 5,
  "displayPhoto": true,
  "fontSize": 18,
  "fontWeight": 500,
  "color": "#333333",
  "backgroundColor": "#f9f9f9",
  "borderLeft": { "width": 4, "color": "#3b82f6" }
}
```

**Validation Rules:**

- `quote`: Required, 1-500 characters
- `author`: Required, 1-100 characters
- `displayRating`: 0-5 (integer)
- `fontSize`: 14-36 px

**Responsive Behavior:**

```json
{
  "mobile": {
    "fontSize": 16,
    "padding": { "all": 16 }
  },
  "desktop": {
    "fontSize": 20,
    "padding": { "all": 32 }
  }
}
```

---

## 2. MEDIA ELEMENTS

### 2.1 Image

**Element Type:** `image`

**AI Prompt Patterns:**
- "Add an image here"
- "Upload a product photo"
- "Insert screenshot"
- "Add a background image"
- "Upload this product image"

**Properties Schema:**

```typescript
interface ImageSettings {
  src: string; // image URL or path
  altText: string; // SEO alt text
  width?: number; // in pixels
  height?: number; // in pixels
  aspectRatio?: "auto" | "square" | "16:9" | "4:3" | "3:2" | "custom";
  customAspectRatio?: string; // e.g., "5:4"
  objectFit: "contain" | "cover" | "fill" | "scale-down";
  objectPosition?: string; // "center", "top-left", etc.
  loading: "lazy" | "eager";
  placeholderUrl?: string; // low-quality preview
  blur?: {
    amount: number; // 0-100
    trigger: "hover" | "always" | "never";
  };
  caption?: string;
  link?: {
    url: string;
    openInNewTab: boolean;
  };
}

interface ImageStyling {
  borderRadius?: number; // 0-50 px
  borderWidth?: number;
  borderColor?: string;
  boxShadow?: string;
  opacity?: number; // 0-1
  filter?: {
    brightness?: number; // 0.5-1.5
    contrast?: number; // 0.5-1.5
    saturation?: number; // 0-1.5
    grayscale?: number; // 0-1
  };
  padding?: Spacing;
  margin?: Spacing;
}
```

**Default Values:**

```json
{
  "src": "",
  "altText": "Product image",
  "aspectRatio": "auto",
  "objectFit": "cover",
  "loading": "lazy",
  "borderRadius": 8,
  "borderWidth": 0,
  "opacity": 1
}
```

**Validation Rules:**

- `src`: Required, valid image URL/path
- `altText`: Required, 1-200 characters
- `width`/`height`: 1-4000 px
- `borderRadius`: 0-50 px
- Accepted formats: jpg, png, webp, svg, gif

**Responsive Behavior:**

```json
{
  "mobile": {
    "width": "100%",
    "height": "auto",
    "maxWidth": 400,
    "borderRadius": 4
  },
  "desktop": {
    "width": "100%",
    "height": "auto",
    "maxWidth": 800,
    "borderRadius": 8
  }
}
```

---

### 2.2 Video (YouTube/Vimeo/Custom)

**Element Type:** `video`

**AI Prompt Patterns:**
- "Add a YouTube video"
- "Embed a sales video"
- "Insert Vimeo video"
- "Add video from URL"
- "Embed this video player"

**Properties Schema:**

```typescript
interface VideoSettings {
  source: "youtube" | "vimeo" | "custom" | "file";
  url?: string; // YouTube/Vimeo URL or video URL
  videoId?: string; // YouTube/Vimeo ID
  fileSize?: number; // bytes for file uploads
  duration?: number; // seconds
  autoplay: boolean;
  controls: boolean;
  loop: boolean;
  muted: boolean; // required if autoplay=true
  showThumbnail: boolean;
  customThumbnailUrl?: string;
  startTime?: number; // seconds
  endTime?: number; // seconds
  playbackRate?: number; // 0.5-2.0
  aspectRatio: "16:9" | "4:3" | "1:1" | "custom";
  customAspectRatio?: string;
  caption?: string;
  transcriptUrl?: string;
}

interface VideoStyling {
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  boxShadow?: string;
  opacity?: number;
  padding?: Spacing;
  margin?: Spacing;
}
```

**Default Values:**

```json
{
  "source": "youtube",
  "autoplay": false,
  "controls": true,
  "loop": false,
  "muted": false,
  "showThumbnail": true,
  "aspectRatio": "16:9",
  "borderRadius": 8
}
```

**Validation Rules:**

- `url`: Required, valid video URL
- `videoId`: Required for YouTube/Vimeo
- `aspectRatio`: Must be valid ratio
- `startTime`/`endTime`: Valid seconds range
- `playbackRate`: 0.5-2.0

**Responsive Behavior:**

```json
{
  "mobile": {
    "maxWidth": "100%",
    "height": "auto",
    "borderRadius": 4
  },
  "desktop": {
    "maxWidth": "100%",
    "height": "auto",
    "borderRadius": 8
  }
}
```

---

### 2.3 Audio Player

**Element Type:** `audio_player`

**AI Prompt Patterns:**
- "Add an audio player"
- "Embed podcast episode"
- "Insert audio file"
- "Add music player"

**Properties Schema:**

```typescript
interface AudioSettings {
  src: string; // audio file URL
  fileName?: string;
  duration?: number; // seconds
  autoplay: boolean;
  controls: boolean;
  loop: boolean;
  preload: "none" | "metadata" | "auto";
  playbackRate: number; // 0.5-2.0
  displayWaveform?: boolean;
  displayDuration: boolean;
  displayPlaylist?: boolean;
  playlist?: {
    title: string;
    episodes: {
      title: string;
      src: string;
      duration?: number;
    }[];
  };
}

interface AudioStyling {
  playerColor: string;
  backgroundColor?: string;
  borderRadius?: number;
  padding?: Spacing;
  margin?: Spacing;
}
```

**Default Values:**

```json
{
  "autoplay": false,
  "controls": true,
  "loop": false,
  "preload": "metadata",
  "playbackRate": 1.0,
  "displayDuration": true,
  "playerColor": "#3b82f6"
}
```

**Validation Rules:**

- `src`: Required, valid audio URL (mp3, wav, ogg, m4a)
- `playbackRate`: 0.5-2.0
- `duration`: positive integer (seconds)

**Responsive Behavior:**

```json
{
  "mobile": {
    "maxWidth": "100%",
    "minHeight": 50
  },
  "desktop": {
    "maxWidth": 600,
    "minHeight": 60
  }
}
```

---

### 2.4 Image Gallery

**Element Type:** `image_gallery`

**AI Prompt Patterns:**
- "Add an image gallery with thumbnails"
- "Create photo carousel"
- "Add before/after image slider"
- "Insert product gallery"
- "Create gallery with 4 images"

**Properties Schema:**

```typescript
interface ImageGallerySettings {
  images: {
    url: string;
    altText: string;
    caption?: string;
    thumbnail?: string;
  }[];
  layout: "grid" | "carousel" | "masonry" | "slider" | "before-after";
  columnsDesktop?: number; // 2-4
  columnsMobile?: number; // 1-2
  spacing?: number; // gap between images
  showThumbnails: boolean;
  autoplay?: boolean;
  autoplayInterval?: number; // milliseconds
  enableZoom: boolean;
  enableLightbox: boolean;
  transitionDuration?: number; // milliseconds
}

interface ImageGalleryStyling {
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  boxShadow?: string;
  padding?: Spacing;
  margin?: Spacing;
}
```

**Default Values:**

```json
{
  "images": [],
  "layout": "grid",
  "columnsDesktop": 3,
  "columnsMobile": 1,
  "spacing": 12,
  "showThumbnails": true,
  "enableZoom": true,
  "enableLightbox": true,
  "borderRadius": 8
}
```

**Validation Rules:**

- `images`: Required, 1-100 images
- Each image `url`: Valid image URL
- `columnsDesktop`: 2-4
- `columnsMobile`: 1-2
- `spacing`: 0-50 px

**Responsive Behavior:**

Auto-adjusts columns and spacing for mobile/tablet/desktop breakpoints.

---

### 2.5 Background Video

**Element Type:** `background_video`

**AI Prompt Patterns:**
- "Add a background video for this section"
- "Set a video background"
- "Create hero section with video background"

**Properties Schema:**

```typescript
interface BackgroundVideoSettings {
  source: "youtube" | "custom" | "file";
  url?: string;
  videoId?: string; // YouTube
  fallbackImageUrl?: string;
  autoplay: boolean;
  muted: boolean; // required for autoplay
  loop: boolean;
  controls: boolean;
  playbackRate?: number;
  objectFit: "contain" | "cover";
  brightness?: number; // 0.2-1.0 for overlay effect
  blur?: number; // 0-20 px
  overlay?: {
    color: string;
    opacity: number; // 0-1
  };
  contentAlignment: "top-left" | "center" | "bottom-right"; // content over video
}

interface BackgroundVideoStyling {
  minHeight: number; // px
  padding?: Spacing;
}
```

**Default Values:**

```json
{
  "autoplay": true,
  "muted": true,
  "loop": true,
  "controls": false,
  "objectFit": "cover",
  "brightness": 0.6,
  "overlay": { "color": "#000000", "opacity": 0.3 },
  "minHeight": 600
}
```

**Validation Rules:**

- `url`/`videoId`: Required
- `brightness`: 0.2-1.0
- `blur`: 0-20 px
- `minHeight`: 200-1000 px

---

## 3. FORM ELEMENTS

### 3.1 Input Field

**Element Type:** `input_field`

**AI Prompt Patterns:**
- "Add an email input field"
- "Create a name field"
- "Add phone number input"
- "Insert text input for email"
- "Add required email field"

**Properties Schema:**

```typescript
interface InputFieldSettings {
  type: "text" | "email" | "phone" | "number" | "password" | "url" | "date";
  fieldName: string; // form submission key
  label?: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string; // regex validation
  defaultValue?: string;
  autocomplete?: boolean;
  disabled: boolean;
  readonly: boolean;
  showCharacterCount?: boolean;
}

interface InputFieldStyling {
  fontSize: number;
  color: string;
  backgroundColor: string;
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  padding?: Spacing;
  margin?: Spacing;
  focusColor?: string; // border color on focus
  errorColor?: string; // red for validation errors
}
```

**Default Values:**

```json
{
  "type": "text",
  "fieldName": "field_1",
  "label": "Field Label",
  "placeholder": "Enter value...",
  "required": false,
  "disabled": false,
  "readonly": false,
  "fontSize": 14,
  "color": "#333333",
  "backgroundColor": "#ffffff",
  "borderWidth": 1,
  "borderColor": "#cccccc",
  "borderRadius": 4
}
```

**Validation Rules:**

- `fieldName`: Required, unique per form, alphanumeric
- `label`: 1-100 characters
- `maxLength`: 1-1000
- `minLength`: 0-`maxLength`
- `pattern`: Valid regex
- `type`: Must be supported type

**Responsive Behavior:**

```json
{
  "mobile": {
    "fontSize": 12,
    "padding": { "all": 8 }
  },
  "desktop": {
    "fontSize": 14,
    "padding": { "all": 12 }
  }
}
```

---

### 3.2 Textarea

**Element Type:** `textarea`

**AI Prompt Patterns:**
- "Add a textarea for message"
- "Create a large text input"
- "Add message box"
- "Insert comment field"

**Properties Schema:**

```typescript
interface TextareaSettings {
  fieldName: string;
  label?: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  maxLength?: number;
  minLength?: number;
  rows?: number; // height
  cols?: number; // width
  defaultValue?: string;
  disabled: boolean;
  readonly: boolean;
  resizable: boolean;
  showCharacterCount?: boolean;
}

interface TextareaStyling {
  fontSize: number;
  color: string;
  backgroundColor: string;
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  padding?: Spacing;
  margin?: Spacing;
  lineHeight: number;
}
```

**Default Values:**

```json
{
  "fieldName": "message",
  "label": "Message",
  "placeholder": "Enter your message...",
  "required": false,
  "rows": 4,
  "resizable": true,
  "fontSize": 14,
  "lineHeight": 1.5
}
```

**Validation Rules:**

- `fieldName`: Required, unique per form
- `maxLength`: 1-10000
- `minLength`: 0-`maxLength`
- `rows`: 1-20

---

### 3.3 Select Dropdown

**Element Type:** `select_dropdown`

**AI Prompt Patterns:**
- "Add a dropdown menu"
- "Create select field for country"
- "Add dropdown with options"
- "Insert category selector"

**Properties Schema:**

```typescript
interface SelectDropdownSettings {
  fieldName: string;
  label?: string;
  placeholder?: string;
  helpText?: string;
  options: {
    label: string;
    value: string;
  }[];
  required: boolean;
  multiple: boolean; // multi-select
  defaultValue?: string | string[];
  searchable?: boolean; // filter options
  disabled: boolean;
  optionGrouping?: {
    group: string;
    options: { label: string; value: string }[];
  }[];
}

interface SelectDropdownStyling {
  fontSize: number;
  color: string;
  backgroundColor: string;
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  padding?: Spacing;
}
```

**Default Values:**

```json
{
  "fieldName": "select_1",
  "label": "Select an option",
  "placeholder": "Choose...",
  "options": [
    { "label": "Option 1", "value": "opt1" },
    { "label": "Option 2", "value": "opt2" }
  ],
  "required": false,
  "multiple": false,
  "searchable": false
}
```

**Validation Rules:**

- `fieldName`: Required, unique
- `options`: At least 1 option
- `defaultValue`: Must exist in options

---

### 3.4 Checkbox

**Element Type:** `checkbox`

**AI Prompt Patterns:**
- "Add a checkbox"
- "Create checkbox to agree to terms"
- "Add checkbox option"
- "Insert 'I agree' checkbox"

**Properties Schema:**

```typescript
interface CheckboxSettings {
  fieldName: string;
  label?: string;
  helpText?: string;
  required: boolean;
  checked: boolean; // default state
  disabled: boolean;
  value?: string; // form submission value
  sublabel?: string; // smaller text below label
}

interface CheckboxStyling {
  checkboxSize?: number; // 16-32 px
  checkboxColor: string;
  labelFontSize: number;
  labelColor: string;
  padding?: Spacing;
  margin?: Spacing;
}
```

**Default Values:**

```json
{
  "fieldName": "checkbox_1",
  "label": "I agree to terms",
  "required": false,
  "checked": false,
  "checkboxSize": 20,
  "checkboxColor": "#3b82f6",
  "labelFontSize": 14
}
```

**Validation Rules:**

- `fieldName`: Required, unique
- `label`: 1-200 characters
- If `required: true`, must be checked to submit

---

### 3.5 Radio Buttons

**Element Type:** `radio_buttons`

**AI Prompt Patterns:**
- "Add radio buttons for selection"
- "Create radio button options"
- "Add selection between options"

**Properties Schema:**

```typescript
interface RadioButtonsSettings {
  fieldName: string;
  label?: string;
  helpText?: string;
  options: {
    label: string;
    value: string;
    description?: string; // helper text for option
  }[];
  required: boolean;
  defaultValue?: string;
  disabled: boolean;
  layout: "vertical" | "horizontal"; // option arrangement
}

interface RadioButtonsStyling {
  radioSize?: number; // 16-32 px
  radioColor: string;
  labelFontSize: number;
  labelColor: string;
  spacing?: number; // between options
  padding?: Spacing;
}
```

**Default Values:**

```json
{
  "fieldName": "radio_1",
  "label": "Choose one",
  "options": [
    { "label": "Option 1", "value": "opt1" },
    { "label": "Option 2", "value": "opt2" }
  ],
  "required": false,
  "layout": "vertical",
  "radioColor": "#3b82f6"
}
```

---

### 3.6 Submit Button

**Element Type:** `submit_button`

**AI Prompt Patterns:**
- "Add a submit button"
- "Create green 'Buy Now' button"
- "Add call-to-action button"
- "Insert submit button"

**Properties Schema:**

```typescript
interface SubmitButtonSettings {
  text: string;
  formId?: string; // which form to submit
  action?: "submit" | "reset" | "button";
  disabled: boolean;
  ariaLabel?: string;
  loading?: {
    enabled: boolean;
    text?: string; // text while loading
    icon?: boolean;
  };
  analyticsEvent?: string; // event to track
}

interface SubmitButtonStyling {
  fontSize: number;
  fontWeight: 600 | 700;
  color: string;
  backgroundColor: string;
  borderWidth?: number;
  borderColor?: string;
  borderRadius: number;
  padding?: Spacing;
  margin?: Spacing;
  hoverBackgroundColor?: string;
  hoverColor?: string;
  cursor: "pointer" | "not-allowed" | "default";
  boxShadow?: string;
  transition?: string; // "smooth", "instant"
}
```

**Default Values:**

```json
{
  "text": "Submit",
  "action": "submit",
  "disabled": false,
  "fontSize": 16,
  "fontWeight": 700,
  "color": "#ffffff",
  "backgroundColor": "#3b82f6",
  "borderRadius": 6,
  "padding": { "top": 12, "right": 32, "bottom": 12, "left": 32 },
  "hoverBackgroundColor": "#2563eb"
}
```

**Validation Rules:**

- `text`: Required, 1-50 characters
- `fontSize`: 12-32 px
- `borderRadius`: 0-50 px

---

### 3.7 Multi-step Form

**Element Type:** `multi_step_form`

**AI Prompt Patterns:**
- "Create a 3-step form"
- "Add multi-page form"
- "Create form wizard"
- "Add step-by-step form"

**Properties Schema:**

```typescript
interface MultiStepFormSettings {
  formName: string;
  steps: {
    stepNumber: number;
    title: string;
    description?: string;
    fields: string[]; // field IDs in this step
    showProgressBar: boolean;
    allowSkip?: boolean;
  }[];
  submitButtonText: string;
  progressBarStyle: "dots" | "line" | "steps" | "none";
  saveProgress: boolean; // save to local storage
  allowGoBack: boolean;
}

interface MultiStepFormStyling {
  progressBarColor: string;
  stepTitleFontSize: number;
  backgroundColor?: string;
  padding?: Spacing;
}
```

**Default Values:**

```json
{
  "formName": "form_wizard",
  "steps": [],
  "submitButtonText": "Complete",
  "progressBarStyle": "dots",
  "saveProgress": true,
  "allowGoBack": true
}
```

---

## 4. COMMERCE ELEMENTS

### 4.1 Pricing Table

**Element Type:** `pricing_table`

**AI Prompt Patterns:**
- "Add a pricing table with 3 plans"
- "Create pricing comparison table"
- "Add pricing options"
- "Insert tiered pricing table"

**Properties Schema:**

```typescript
interface PricingTableSettings {
  columns: {
    name: string;
    description?: string;
    price: number;
    currency: string; // "USD", "EUR", etc.
    billingPeriod?: "monthly" | "yearly" | "one-time";
    features: {
      text: string;
      included: boolean; // checkmark or x
      tooltip?: string;
    }[];
    buttonText: string;
    buttonAction: "checkout" | "link" | "modal";
    buttonLink?: string;
    highlighted?: boolean; // "recommended" style
    ribbonText?: string; // "Best Value"
  }[];
  showAnnualDiscount?: boolean;
  discountPercentage?: number;
}

interface PricingTableStyling {
  layout: "vertical" | "horizontal";
  columnWidth?: number;
  columnGap?: number;
  highlightedColumnColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  padding?: Spacing;
}
```

**Default Values:**

```json
{
  "columns": [
    {
      "name": "Plan 1",
      "price": 29,
      "currency": "USD",
      "billingPeriod": "monthly",
      "features": [],
      "buttonText": "Get Started",
      "buttonAction": "checkout",
      "highlighted": false
    }
  ],
  "layout": "vertical",
  "showAnnualDiscount": false
}
```

**Validation Rules:**

- `columns`: At least 1 column
- `price`: Non-negative number
- `currency`: Valid ISO currency code
- `features`: 1-20 features per column

---

### 4.2 Buy Button

**Element Type:** `buy_button`

**AI Prompt Patterns:**
- "Add a buy button"
- "Create checkout button"
- "Add purchase button for $X"
- "Insert 'Add to Cart' button"

**Properties Schema:**

```typescript
interface BuyButtonSettings {
  text: string;
  productId?: string; // linked product
  price: number;
  currency: string;
  quantity?: number; // default qty
  checkoutType: "stripe" | "paypal" | "custom";
  successRedirectUrl?: string;
  cancelRedirectUrl?: string;
  upsellProductId?: string; // show after purchase
  requiresEmail: boolean;
  requiresShipping: boolean;
  taxCalculation?: "auto" | "manual";
}

interface BuyButtonStyling {
  fontSize: number;
  fontWeight: 600 | 700;
  color: string;
  backgroundColor: string;
  borderRadius: number;
  padding?: Spacing;
  hoverBackgroundColor?: string;
  showPrice: boolean; // display "$29" on button
}
```

**Default Values:**

```json
{
  "text": "Buy Now",
  "price": 0,
  "currency": "USD",
  "quantity": 1,
  "checkoutType": "stripe",
  "requiresEmail": false,
  "requiresShipping": false,
  "fontSize": 16,
  "fontWeight": 700,
  "backgroundColor": "#10b981",
  "showPrice": true
}
```

---

### 4.3 Product Card

**Element Type:** `product_card`

**AI Prompt Patterns:**
- "Add a product card"
- "Create product display with image and price"
- "Add product showcase"

**Properties Schema:**

```typescript
interface ProductCardSettings {
  productId: string;
  showImage: boolean;
  showPrice: boolean;
  showDescription: boolean;
  showRating: boolean;
  showQuantitySelector: boolean;
  buttonText: string;
  buttonAction: "checkout" | "view-details" | "add-to-cart";
  compactMode?: boolean; // small card vs. full
}

interface ProductCardStyling {
  imageHeight?: number;
  backgroundColor?: string;
  borderRadius?: number;
  boxShadow?: string;
  padding?: Spacing;
}
```

---

### 4.4 Cart Summary

**Element Type:** `cart_summary`

**AI Prompt Patterns:**
- "Add cart summary section"
- "Show order total"
- "Add checkout summary"

**Properties Schema:**

```typescript
interface CartSummarySettings {
  showShippingEstimate: boolean;
  showTaxEstimate: boolean;
  showCouponInput: boolean;
  showItemList: boolean; // items in cart
}

interface CartSummaryStyling {
  backgroundColor?: string;
  borderRadius?: number;
  padding?: Spacing;
}
```

---

### 4.5 Order Bump Checkbox

**Element Type:** `order_bump_checkbox`

**AI Prompt Patterns:**
- "Add order bump checkbox"
- "Add 'Add X to order' checkbox"
- "Create upsell checkbox during checkout"

**Properties Schema:**

```typescript
interface OrderBumpCheckboxSettings {
  productId: string;
  productName: string;
  price: number;
  originalPrice?: number; // strikethrough
  description?: string;
  checked: boolean; // default state
  maxQuantity?: number;
}

interface OrderBumpCheckboxStyling {
  backgroundColor?: string;
  borderRadius?: number;
  padding?: Spacing;
}
```

---

### 4.6 Coupon Code Input

**Element Type:** `coupon_code_input`

**AI Prompt Patterns:**
- "Add coupon code field"
- "Add promo code input"
- "Create discount code entry"

**Properties Schema:**

```typescript
interface CouponCodeInputSettings {
  placeholder?: string;
  buttonText: string;
  minLength?: number;
  maxLength?: number;
  caseSensitive: boolean;
  validationMessage?: string;
}

interface CouponCodeInputStyling {
  fontSize: number;
  borderRadius?: number;
  padding?: Spacing;
}
```

---

## 5. SOCIAL PROOF ELEMENTS

### 5.1 Testimonial Card

**Element Type:** `testimonial_card`

**AI Prompt Patterns:**
- "Add customer testimonial card"
- "Create review card with photo"
- "Add testimonial with rating"

**Properties Schema:**

```typescript
interface TestimonialCardSettings {
  quote: string; // max 500 characters
  author: string;
  role?: string;
  company?: string;
  photoUrl?: string;
  rating?: number; // 1-5
  verified: boolean; // purchased badge
}

interface TestimonialCardStyling {
  backgroundColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  boxShadow?: string;
  padding?: Spacing;
  photoSize?: number; // avatar size
}
```

---

### 5.2 Review Stars

**Element Type:** `review_stars`

**AI Prompt Patterns:**
- "Add star rating display"
- "Show 5 stars"
- "Add average rating"
- "Display number of reviews"

**Properties Schema:**

```typescript
interface ReviewStarsSettings {
  rating: number; // 0-5 (decimal)
  maxRating: number; // usually 5
  reviewCount?: number;
  displayText: boolean; // show "4.8/5"
}

interface ReviewStarsStyling {
  starSize: number; // 16-48 px
  starColor: string;
  emptyStarColor?: string;
  textFontSize?: number;
}
```

---

### 5.3 Trust Badges

**Element Type:** `trust_badges`

**AI Prompt Patterns:**
- "Add trust badges"
- "Add SSL badge"
- "Show payment badges (Visa, PayPal)"
- "Add security badges"

**Properties Schema:**

```typescript
interface TrustBadgesSettings {
  badges: {
    type: "ssl" | "payment" | "custom" | "certification";
    label?: string;
    iconUrl?: string;
    url?: string; // click through link
  }[];
  layout: "horizontal" | "vertical";
  spacing: number;
}

interface TrustBadgesStyling {
  badgeSize?: number;
  backgroundColor?: string;
  padding?: Spacing;
}
```

---

### 5.4 Social Media Feed

**Element Type:** `social_media_feed`

**AI Prompt Patterns:**
- "Add Instagram feed"
- "Embed Twitter timeline"
- "Add TikTok embed"
- "Show social media posts"

**Properties Schema:**

```typescript
interface SocialMediaFeedSettings {
  platform: "instagram" | "twitter" | "tiktok" | "facebook" | "linkedin";
  accountHandle?: string;
  accessToken?: string; // for authenticated access
  postCount?: number; // 3-12
  displayType: "embed" | "api" | "iframe";
  hashtag?: string; // filter by hashtag
  showLikes: boolean;
  showComments: boolean;
}

interface SocialMediaFeedStyling {
  columnCount?: number;
  spacing?: number;
}
```

---

### 5.5 Customer Count Ticker

**Element Type:** `customer_count_ticker`

**AI Prompt Patterns:**
- "Add customer count display"
- "Show '5000+ happy customers'"
- "Add counter that increments"
- "Display live customer count"

**Properties Schema:**

```typescript
interface CustomerCountTickerSettings {
  currentCount: number;
  label: string; // "Happy Customers"
  animateToNumber?: boolean;
  animationDuration?: number; // milliseconds
  prefix?: string; // "Over ", "Join "
  suffix?: string; // " customers", " members"
  updateFrequency?: number; // milliseconds to update
  dataSource?: "static" | "api" | "real-time";
}

interface CustomerCountTickerStyling {
  fontSize: number;
  fontWeight: 600 | 700;
  color: string;
  numberSize?: number; // larger than label
}
```

---

## 6. URGENCY ELEMENTS

### 6.1 Countdown Timer

**Element Type:** `countdown_timer`

**AI Prompt Patterns:**
- "Add countdown timer to offer"
- "Create timer until deadline"
- "Add 24-hour timer"
- "Show time remaining"

**Properties Schema:**

```typescript
interface CountdownTimerSettings {
  endTime: number; // unix timestamp
  format: "hms" | "hm" | "ms" | "d:h:m:s"; // hours:minutes:seconds
  showDays: boolean;
  showHours: boolean;
  showMinutes: boolean;
  showSeconds: boolean;
  onExpire: "hide" | "show-message" | "redirect";
  expireMessage?: string;
  expireRedirectUrl?: string;
  timezone?: string; // user timezone or specific
}

interface CountdownTimerStyling {
  fontSize: number;
  fontWeight: 600 | 700;
  color: string;
  backgroundColor?: string;
  borderRadius?: number;
  padding?: Spacing;
  displayStyle: "inline" | "card" | "banner";
}
```

**Default Values:**

```json
{
  "format": "hms",
  "showDays": false,
  "showHours": true,
  "showMinutes": true,
  "showSeconds": true,
  "onExpire": "hide",
  "fontSize": 24,
  "fontWeight": 700,
  "color": "#ef4444",
  "displayStyle": "inline"
}
```

---

### 6.2 Stock Counter

**Element Type:** `stock_counter`

**AI Prompt Patterns:**
- "Add 'Only 5 left in stock'"
- "Show inventory count"
- "Display stock level indicator"
- "Add low stock warning"

**Properties Schema:**

```typescript
interface StockCounterSettings {
  currentStock: number;
  totalStock?: number;
  showProgressBar?: boolean;
  lowStockThreshold?: number; // show warning color
  label?: string; // "In Stock", "Units Available"
  dataSource?: "static" | "api" | "real-time";
}

interface StockCounterStyling {
  fontSize: number;
  color: string;
  lowStockColor?: string; // red when low
  backgroundColor?: string;
}
```

---

### 6.3 Limited Offer Banner

**Element Type:** `limited_offer_banner`

**AI Prompt Patterns:**
- "Add limited time offer banner"
- "Create flash sale banner"
- "Add discount alert banner"

**Properties Schema:**

```typescript
interface LimitedOfferBannerSettings {
  text: string; // "50% OFF - Limited Time"
  description?: string;
  endTime?: number; // unix timestamp
  backgroundColor: string;
  textColor: string;
  closeable: boolean;
  position: "top" | "bottom" | "sticky";
  importance: "low" | "medium" | "high"; // affects styling
}

interface LimitedOfferBannerStyling {
  fontSize: number;
  fontWeight: 600 | 700;
  padding?: Spacing;
  borderRadius?: number;
  animation?: "none" | "pulse" | "blink";
}
```

---

### 6.4 Exit Intent Popup

**Element Type:** `exit_intent_popup`

**AI Prompt Patterns:**
- "Add exit popup with discount"
- "Show offer when user leaves"
- "Create exit intent modal"

**Properties Schema:**

```typescript
interface ExitIntentPopupSettings {
  headingText: string;
  bodyText: string;
  discountCode?: string;
  discountPercentage?: number;
  triggerEvent: "exit-intent" | "time-delay" | "scroll-depth";
  timeDelaySeconds?: number; // if time-delay
  scrollDepthPercent?: number; // if scroll-depth
  showOncePerSession: boolean;
  showOncePerUser: boolean;
  cookieDuration?: number; // days
  acceptButtonText: string;
  declineButtonText?: string;
  onAccept?: "apply-coupon" | "redirect" | "add-to-cart";
}

interface ExitIntentPopupStyling {
  width?: number; // max px
  backgroundColor: string;
  borderRadius?: number;
  padding?: Spacing;
  boxShadow?: string;
  overlayColor?: string;
  overlayOpacity?: number; // 0-1
}
```

---

## 7. INTERACTIVE WIDGETS

### 7.1 FAQ Accordion

**Element Type:** `faq_accordion`

**AI Prompt Patterns:**
- "Add FAQ section with accordion"
- "Create collapsible Q&A"
- "Add frequently asked questions"

**Properties Schema:**

```typescript
interface FAQAccordionSettings {
  items: {
    question: string;
    answer: string;
    category?: string; // for filtering
  }[];
  allowMultipleOpen: boolean; // one or many open at once
  defaultOpen?: number; // which item opens by default
  searchable?: boolean; // filter questions
  analytics?: boolean; // track which questions are clicked
}

interface FAQAccordionStyling {
  backgroundColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  padding?: Spacing;
  spacing?: number; // between items
  questionFontSize?: number;
  questionFontWeight?: 600 | 700;
  answerFontSize?: number;
  expandIconColor?: string;
}
```

---

### 7.2 Tabs

**Element Type:** `tabs`

**AI Prompt Patterns:**
- "Add tabbed content"
- "Create tab navigation"
- "Add sections with tabs"
- "Insert tabs for features"

**Properties Schema:**

```typescript
interface TabsSettings {
  tabs: {
    label: string;
    content: string; // HTML or text
    icon?: string; // emoji or URL
  }[];
  defaultActiveTab?: number;
  layout: "horizontal" | "vertical";
  tabStyle: "underline" | "pills" | "cards" | "buttons";
  allowDeepLink?: boolean; // URL hash for tabs
}

interface TabsStyling {
  backgroundColor?: string;
  activeTabColor?: string;
  inactiveTabColor?: string;
  borderRadius?: number;
  padding?: Spacing;
}
```

---

### 7.3 Progress Bar

**Element Type:** `progress_bar`

**AI Prompt Patterns:**
- "Add progress bar"
- "Show step progress"
- "Add visual completion indicator"

**Properties Schema:**

```typescript
interface ProgressBarSettings {
  value: number; // 0-100
  maximum?: number; // if not 100
  label?: string;
  showPercentage: boolean;
  animated: boolean;
  striped?: boolean;
  dataSource?: "static" | "dynamic";
}

interface ProgressBarStyling {
  height?: number; // px
  backgroundColor?: string;
  progressColor?: string;
  borderRadius?: number;
}
```

---

### 7.4 Quiz / Survey

**Element Type:** `quiz_survey`

**AI Prompt Patterns:**
- "Add a quiz"
- "Create product recommendation quiz"
- "Add survey to page"
- "Insert interactive quiz"

**Properties Schema:**

```typescript
interface QuizSurveySettings {
  title: string;
  description?: string;
  questions: {
    question: string;
    type: "multiple-choice" | "true-false" | "rating" | "text";
    options?: {
      label: string;
      value: string;
      resultMessage?: string; // if this is correct
    }[];
    scoring?: number; // points for this question
  }[];
  showResults: boolean;
  resultsMessage?: string; // based on score
  leadCapture?: boolean; // email before quiz
  redirectOnComplete?: string;
}

interface QuizSurveyStyling {
  backgroundColor?: string;
  borderRadius?: number;
  padding?: Spacing;
}
```

---

### 7.5 Calendar Booking

**Element Type:** `calendar_booking`

**AI Prompt Patterns:**
- "Add calendar for booking"
- "Create appointment selector"
- "Add Calendly embed"
- "Insert calendar booking widget"

**Properties Schema:**

```typescript
interface CalendarBookingSettings {
  provider: "calendly" | "google-calendar" | "stripe-payments" | "custom";
  calendarUrl?: string;
  minNotice?: number; // hours before booking allowed
  maxDaysAhead?: number; // how far in future
  showTimezone?: boolean;
  timeSlotDuration?: number; // minutes
  showAvailabilityCount?: boolean; // "3 slots available"
}

interface CalendarBookingStyling {
  backgroundColor?: string;
  borderRadius?: number;
  padding?: Spacing;
}
```

---

### 7.6 Live Chat Widget

**Element Type:** `live_chat_widget`

**AI Prompt Patterns:**
- "Add live chat"
- "Add chat support widget"
- "Insert Intercom / Drift chat"

**Properties Schema:**

```typescript
interface LiveChatWidgetSettings {
  provider: "intercom" | "drift" | "zendesk" | "custom";
  apiKey?: string;
  position: "bottom-right" | "bottom-left";
  showBadge?: boolean;
  offlineMessage?: string;
  headerTitle?: string;
}

interface LiveChatWidgetStyling {
  themeColor?: string;
}
```

---

## Validation Framework

All elements must validate:

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: {
    field: string;
    message: string;
    code: string; // "required", "invalid-format", "out-of-range"
  }[];
}

// Example validation for Headline:
function validateHeadline(settings: HeadlineSettings): ValidationResult {
  const errors = [];

  if (!settings.text || settings.text.length === 0) {
    errors.push({ field: "text", message: "Text is required", code: "required" });
  }

  if (settings.text.length > 255) {
    errors.push({ field: "text", message: "Text exceeds 255 characters", code: "max-length" });
  }

  if (![1, 2, 3, 4, 5, 6].includes(settings.level)) {
    errors.push({ field: "level", message: "Invalid heading level", code: "invalid-value" });
  }

  return { isValid: errors.length === 0, errors };
}
```

---

## Responsive Breakpoints

**Standard breakpoints:**

```json
{
  "mobile": { "maxWidth": 640 },
  "tablet": { "minWidth": 641, "maxWidth": 1024 },
  "desktop": { "minWidth": 1025 }
}
```

**All elements automatically responsive unless `responsive: false` in properties.**

---

## Ontology Integration

### Thing Records

```typescript
// Example: Headline element instance
{
  _id: "thing_headline_xyz",
  type: "page_element",
  groupId: "group_acme",
  ownerId: "creator_john",
  properties: {
    elementType: "headline",
    name: "Hero Headline",
    settings: { text: "Transform Your Business", level: 1, ... },
    styling: { fontSize: 48, color: "#000000", ... },
    position: { x: 0, y: 0, width: 100, height: 10, zIndex: 1 },
    responsive: { mobile: {...}, tablet: {...}, desktop: {...} },
    visibility: { hidden: false, mobile: true, tablet: true, desktop: true }
  },
  status: "active",
  createdAt: 1700686800000,
  updatedAt: 1700686800000
}
```

### Connections

```typescript
// Element belongs to step
{
  type: "step_contains_element",
  from: "funnel_step_abc", // parent step
  to: "thing_headline_xyz", // element
  metadata: {
    position: 1, // order on page
    x: 0, y: 100, // coordinates
    sequence: 1
  }
}
```

### Events

```typescript
// Element operations logged as events
{
  type: "element_added",
  groupId: "group_acme",
  thingId: "thing_headline_xyz",
  metadata: {
    elementType: "headline",
    stepId: "funnel_step_abc",
    position: 1
  }
}

{
  type: "element_updated",
  thingId: "thing_headline_xyz",
  metadata: {
    changes: {
      "settings.text": "New headline text",
      "styling.fontSize": 52
    }
  }
}
```

---

## AI-Friendly Patterns

**Element creation via natural language:**

- "Add a headline that says..."
- "Create a form with email and phone fields"
- "Insert testimonial from [customer name]"
- "Add countdown timer until [date]"
- "Create pricing table with 3 plans"

**Element deletion:**

- "Remove the button"
- "Delete the testimonial"
- "Take out the form"

**Element modification:**

- "Make the headline bigger"
- "Change the button color to green"
- "Update the form fields"
- "Move the image to the top"

---

## Implementation Priority

**Phase 1 (Cycles 005-010):** Text + Media + Forms (16 elements)
**Phase 2 (Cycles 011-020):** Commerce + Social Proof (11 elements)
**Phase 3 (Cycles 021-030):** Urgency + Interactive (10 elements)

---

**Status:** Specification Complete | Next Cycle: [CYCLE-006] Multi-tenant Isolation
