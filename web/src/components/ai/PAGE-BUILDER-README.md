# Conversational Page Builder

**Build beautiful, high-converting funnel pages through natural conversation with AI.**

## Overview

The Conversational Page Builder allows users to create funnel pages by talking to an AI assistant instead of using traditional drag-and-drop interfaces. This creates a more intuitive, faster, and more accessible page building experience.

## Architecture

### Components

```
web/src/
├── types/
│   └── funnel-builder.ts              # TypeScript types for elements and funnels
├── stores/
│   └── pageBuilder.ts                 # Nanostore state management
├── lib/ai/
│   └── page-builder-prompts.ts        # AI system prompts and context
├── components/
│   ├── ai/
│   │   ├── PageBuilderChat.tsx        # Main chat interface
│   │   └── tools/
│   │       └── PageBuilderTools.tsx   # AI tool definitions
│   ├── funnel/
│   │   └── PageElementRenderer.tsx    # Renders page elements
│   └── demo/
│       └── PageBuilderDemo.tsx        # Interactive demo
└── pages/
    ├── api/chat/
    │   └── page-builder.ts            # Chat API endpoint
    └── demo/
        └── page-builder.astro         # Demo page
```

### State Management

Uses **nanostores** for lightweight, reactive state:

- `pageBuilderContext$` - Current step being edited
- `selectedElement$` - Currently selected element
- `historyStack$` - Undo/redo history
- `historyIndex$` - Current position in history

### Element Types

**Text Elements:**
- `headline` - H1/H2/H3 headings with customizable size, color, alignment
- `subheadline` - Supporting text below headlines
- `text` - Paragraph content with rich formatting

**Media Elements:**
- `image` - Photos, graphics, logos with alt text, sizing, borders
- `video` - Embedded videos with autoplay, controls, thumbnails

**Interactive Elements:**
- `button` - Call-to-action buttons with actions (link, scroll, submit)
- `form` - Multi-field lead capture forms with validation
- `countdown` - Urgency timers with customizable display

**Social Proof:**
- `testimonial` - Customer reviews with ratings, avatars, quotes

**Commerce:**
- `pricing-table` - Feature comparison with multiple plans

**Layout:**
- `divider` - Visual separators with style options
- `spacer` - Vertical spacing control

## Conversation Flow

### Example 1: Adding a Headline

```
User: "Add a headline"

AI: "Great! What should the headline say?"

User: "Transform Your Business in 30 Days"

AI: *calls add_element tool*
"Perfect! I've added your headline 'Transform Your Business in 30 Days'.
Would you like to:
- Change the size (currently h1 - largest)
- Adjust the color or alignment
- Add a subheadline below it
- Add a button for your call-to-action"
```

### Example 2: Adding a Countdown Timer

```
User: "Add a countdown timer"

AI: "Excellent choice for creating urgency! When should the countdown end?"

User: "December 25th at midnight"

AI: *calls add_element tool with endDate*
"Done! Your countdown timer will end on December 25, 2025 at 12:00 AM.
Would you like to:
- Add urgency text like 'Limited Time Offer!'
- Customize what time units to show (days, hours, minutes, seconds)
- Add a button below for 'Get Started Now'"
```

### Example 3: Editing Element Properties

```
User: "Make the headline bigger"

AI: "I can change it to h1 (largest), h2 (large), or h3 (medium).
Which would you prefer?"

User: "h1"

AI: *calls update_element tool*
"Updated! Your headline is now h1 - the largest size.
Anything else you'd like to adjust?"
```

## AI Tools

The AI has access to these tools:

### `add_element`
Adds a new element to the page.

**Parameters:**
- `elementType` - Type of element (headline, button, form, etc.)
- `properties` - Element-specific properties (text, color, size, etc.)
- `position` - Optional grid position (defaults to bottom)

**Example:**
```typescript
{
  elementType: "headline",
  properties: {
    text: "Welcome to Our Product",
    level: "h1",
    align: "center",
    color: "#1a202c"
  }
}
```

### `update_element`
Updates properties of an existing element.

**Parameters:**
- `elementId` - ID of element to update
- `updates` - Properties to change

**Example:**
```typescript
{
  elementId: "headline-1234",
  updates: {
    color: "#3b82f6",
    fontSize: "48px"
  }
}
```

### `remove_element`
Removes an element from the page.

**Parameters:**
- `elementId` - ID of element to remove

### `reorder_elements`
Changes the order of elements.

**Parameters:**
- `elementIds` - Array of element IDs in new order (top to bottom)

### `duplicate_element`
Duplicates an existing element.

**Parameters:**
- `elementId` - ID of element to duplicate

### `get_suggestions`
Gets AI-powered suggestions for next steps based on current page state.

**Returns:**
- `suggestions` - Quick action suggestions
- `tips` - Conversion optimization tips

## Smart Suggestions

The AI provides context-aware suggestions based on page state:

### Element Suggestions

- **No headline?** → "Add a compelling headline"
- **Has headline, no subheadline?** → "Add a subheadline to support your headline"
- **Has headline, no button?** → "Add a call-to-action button"
- **Has button, no form?** → "Add a form to capture leads"
- **No testimonials (4+ elements)?** → "Add testimonials for social proof"
- **No countdown (3+ elements)?** → "Add a countdown timer for urgency"

### Optimization Tips

- **Headline without button** → "Add a button near your headline - clear CTAs increase conversions by 40%"
- **Button without form** → "Consider adding a lead form - capturing emails builds your audience"
- **No social proof** → "Add testimonials - 88% of consumers trust reviews as much as personal recommendations"
- **No urgency** → "Create urgency with a countdown timer - scarcity increases conversions"
- **Form without testimonial** → "Place testimonials near your form - social proof reduces hesitation"

## Undo/Redo System

Every change is tracked in a history stack:

- **Undo:** `Cmd/Ctrl + Z` or click Undo button
- **Redo:** `Cmd/Ctrl + Shift + Z` or click Redo button
- **History limit:** 50 changes
- **Automatic snapshots:** Every add, update, remove, or reorder

## Grid System

Elements are positioned on a **12-column responsive grid**:

- **Desktop:** 12 columns
- **Tablet:** Adapts to smaller screen
- **Mobile:** Stacks vertically

**Position properties:**
- `row` - Vertical position (0-based)
- `col` - Horizontal position (0-11)
- `width` - Element width in columns (1-12)
- `height` - Element height in rows

## Usage Examples

### Basic Setup

```tsx
import { PageBuilderChat } from "@/components/ai/PageBuilderChat";
import { setCurrentStep } from "@/stores/pageBuilder";

// Initialize with a funnel step
const step: FunnelStep = {
  id: "step-1",
  funnelId: "funnel-1",
  name: "Landing Page",
  slug: "landing",
  type: "landing",
  elements: [],
  settings: {},
  status: "draft",
};

setCurrentStep("funnel-1", "step-1", step);

// Render chat
<PageBuilderChat />
```

### With Canvas

```tsx
import { PageBuilderChat } from "@/components/ai/PageBuilderChat";
import { PageElementRenderer } from "@/components/funnel/PageElementRenderer";
import { useStore } from "@nanostores/react";
import { pageBuilderContext$, selectedElement$, selectElement } from "@/stores/pageBuilder";

function PageBuilder() {
  const context = useStore(pageBuilderContext$);
  const selected = useStore(selectedElement$);

  return (
    <div className="grid grid-cols-[1fr_400px]">
      {/* Canvas */}
      <div className="p-8 space-y-4">
        {context?.step.elements.map((element) => (
          <PageElementRenderer
            key={element.id}
            element={element}
            isSelected={selected?.id === element.id}
            onSelect={() => selectElement(element.id)}
          />
        ))}
      </div>

      {/* Chat */}
      <PageBuilderChat />
    </div>
  );
}
```

### Programmatic Element Addition

```tsx
import { addElement } from "@/stores/pageBuilder";
import { createDefaultElement } from "@/components/ai/tools/PageBuilderTools";

// Add a headline
const headline = createDefaultElement("headline", {
  text: "Welcome!",
  level: "h1",
  align: "center",
});
addElement(headline);

// Add a button
const button = createDefaultElement("button", {
  text: "Get Started",
  variant: "primary",
  size: "lg",
  action: "link",
  link: "/signup",
});
addElement(button);
```

## API Integration

### Chat Endpoint

**URL:** `POST /api/chat/page-builder`

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "Add a headline" }
  ],
  "context": {
    "funnelId": "funnel-1",
    "stepId": "step-1",
    "step": {
      "name": "Landing Page",
      "type": "landing",
      "elements": []
    }
  }
}
```

**Response:** Streaming AI response with tool calls

## Design Principles

### Conversation Over Configuration

Instead of:
```
User clicks "Add Element" → Selects "Headline" → Types text → Adjusts size → Changes color → Sets alignment
```

We have:
```
User: "Add a big centered headline that says Welcome"
AI: *creates headline with all properties in one step*
```

### Progressive Disclosure

The AI guides users through complex features step-by-step:

1. Add basic element (headline)
2. Suggest enhancements (color, size)
3. Recommend next steps (add button, subheadline)
4. Provide optimization tips (conversion best practices)

### Context-Aware Suggestions

The AI understands page state and makes intelligent suggestions:

- New page → Suggest headline
- Has headline → Suggest subheadline and button
- Has button → Suggest form
- Has form → Suggest testimonials for social proof

### Conversion Optimization

Every suggestion is designed to increase conversions:

- Headlines above body text
- Clear CTAs (buttons)
- Social proof (testimonials)
- Urgency (countdown timers)
- Lead capture (forms with minimal friction)

## Performance

- **Bundle size:** ~15KB (gzipped) for chat component
- **Initial load:** Renders empty canvas immediately
- **Element rendering:** Virtual scrolling for 100+ elements
- **History tracking:** Efficient diffing with 50-change limit
- **Real-time updates:** Instant UI updates via nanostores

## Accessibility

- **Keyboard navigation:** Full keyboard support in chat
- **Screen readers:** ARIA labels on all interactive elements
- **Focus management:** Proper focus handling in chat and canvas
- **Color contrast:** WCAG AA compliant colors
- **Form validation:** Clear error messages and field labels

## Testing

```bash
# Run tests
bun test

# Watch mode
bun test --watch

# Coverage
bun test --coverage
```

## Future Enhancements

### Phase 1 (Current)
- ✅ Basic element types (headline, button, form, etc.)
- ✅ Conversational interface
- ✅ Undo/redo
- ✅ Smart suggestions
- ✅ Element rendering

### Phase 2 (Next)
- [ ] Image upload and AI-generated images
- [ ] Video embedding (YouTube, Vimeo, custom)
- [ ] Advanced form validation
- [ ] Multi-step forms
- [ ] Conditional logic (show/hide elements)

### Phase 3 (Future)
- [ ] A/B testing interface
- [ ] Analytics integration
- [ ] Template library
- [ ] Collaboration (multi-user editing)
- [ ] Version history

### Phase 4 (Advanced)
- [ ] AI-powered copy generation
- [ ] AI design suggestions
- [ ] AI conversion optimization
- [ ] Natural language analytics queries

## Troubleshooting

### Chat not responding
- Check `OPENAI_API_KEY` environment variable
- Verify API endpoint is accessible
- Check browser console for errors

### Elements not rendering
- Verify `pageBuilderContext$` is set
- Check element data structure matches types
- Ensure element renderer supports the type

### Undo/redo not working
- Check `historyStack$` contains entries
- Verify `historyIndex$` is within bounds
- Ensure changes are calling `pushHistory()`

## Contributing

See main project CONTRIBUTING.md for guidelines.

## License

See main project LICENSE for details.

---

**Built with ONE Platform's 6-dimension ontology for infinite scalability.**
