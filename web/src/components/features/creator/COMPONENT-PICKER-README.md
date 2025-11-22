# Component Picker - CYCLE 15

**Visual component library browser with AI-powered suggestions**

## Overview

The Component Picker provides a visual interface for browsing and inserting components into your project. It includes search, filtering, drag-and-drop, and AI-powered suggestions based on chat context.

## Features

### ✅ Implemented (CYCLE 15)

1. **Component Library Sidebar/Modal**
   - Full-screen modal dialog
   - Grid and list view modes
   - Responsive design

2. **Grid View with Previews**
   - Visual component cards
   - Live preview code snippets
   - Hover effects and animations

3. **Search Components**
   - Real-time search by name or description
   - Tag-based search
   - Prop-based search

4. **Filter by Category**
   - 9 categories: UI, Layout, Forms, Data Display, Feedback, Overlays, Navigation, Features, Ontology
   - Tab-based filtering
   - Combined search + filter

5. **Drag-and-Drop & Click to Insert**
   - Drag components into editor
   - Click "Insert" button
   - Custom `insertComponent` event

6. **AI Suggests Relevant Components**
   - Intent detection (create-page, add-form, show-data, etc.)
   - Keyword-based suggestions
   - Chat context analysis
   - Smart suggestions combining keyword + intent

7. **Preview Component Before Inserting**
   - Full component details
   - Usage examples
   - Props and variants
   - Copy code to clipboard
   - Link to documentation

## File Structure

```
web/src/
├── stores/
│   └── componentPicker.ts              # State management (nanostores)
├── lib/
│   ├── componentLibrary.ts             # Component catalog (50+ components)
│   └── ai/
│       └── componentSuggestions.ts     # AI suggestion engine
└── components/features/creator/
    ├── ComponentPicker.tsx             # Main picker modal
    ├── ComponentPickerTrigger.tsx      # Trigger buttons (normal + FAB)
    ├── ComponentSuggestions.tsx        # AI suggestions panel
    └── COMPONENT-PICKER-README.md      # This file
```

## Usage

### Basic Usage

```typescript
import { ComponentPicker } from '@/components/features/creator/ComponentPicker';
import { ComponentPickerTrigger } from '@/components/features/creator/ComponentPickerTrigger';

// Add trigger button
<ComponentPickerTrigger label="Add Component" />

// Add picker modal
<ComponentPicker client:only="react" />

// Listen for insert events
window.addEventListener('insertComponent', (e) => {
  console.log('Component inserted:', e.detail.component);
  // Handle component insertion
});
```

### Floating Action Button (FAB)

```typescript
import { ComponentPickerFAB } from '@/components/features/creator/ComponentPickerTrigger';

<ComponentPickerFAB />
```

### Programmatic Control

```typescript
import { openComponentPicker, closeComponentPicker } from '@/stores/componentPicker';

// Open picker
openComponentPicker();

// Close picker
closeComponentPicker();
```

### AI Suggestions Panel

```typescript
import { ComponentSuggestions } from '@/components/features/creator/ComponentSuggestions';

// With chat messages
<ComponentSuggestions
  messages={chatMessages}
  onInsert={handleInsert}
  limit={5}
/>

// With context string
<ComponentSuggestions
  context="I need a form with inputs and a submit button"
  onInsert={handleInsert}
/>
```

### Inline Suggestions

```typescript
import { InlineSuggestions } from '@/components/features/creator/ComponentSuggestions';

<InlineSuggestions
  context="Add a pricing table"
  onInsert={handleInsert}
  limit={3}
/>
```

## Component Catalog

### 50+ Components Available

**shadcn/ui Components (35+):**
- UI: Button, Card, Badge, Avatar, Skeleton, Separator
- Forms: Input, Select, Checkbox, Label, Form
- Data Display: Table, Chart, Carousel
- Feedback: Alert, Skeleton, Toast
- Overlays: Dialog, Tooltip, Dropdown, Drawer, HoverCard
- Navigation: Tabs, Breadcrumb, Menu
- Layout: Accordion, Collapsible

**Custom Feature Components:**
- ThingCard (ontology)
- PersonCard (ontology)
- EventItem (ontology)
- ProductGallery
- ChatClient
- LivePreview

## AI Suggestion Engine

### Intent Detection

The AI analyzes user input and detects intent:

```typescript
import { detectIntent } from '@/lib/ai/componentSuggestions';

const intent = detectIntent("I need a form with email and password");
// Returns: { type: "add-form", confidence: 0.8 }
```

**Supported Intents:**
- `create-page` - Creating a new page
- `add-form` - Adding a form
- `show-data` - Displaying data
- `user-profile` - User profile/account
- `e-commerce` - E-commerce features
- `dashboard` - Dashboard/analytics
- `chat` - Chat/messaging
- `other` - General

### Smart Suggestions

Combines keyword matching + intent detection:

```typescript
import { getSmartSuggestions } from '@/lib/ai/componentSuggestions';

const suggestions = getSmartSuggestions(
  "Create a pricing page with cards and buttons",
  5 // limit
);
// Returns: [Card, Button, Badge, Separator, ...]
```

### Keyword Mapping

50+ keyword patterns for accurate suggestions:

```typescript
// Examples:
"button" → Button component
"pricing table" → Card, Table components
"user avatar" → Avatar, PersonCard components
"form" → Input, Select, Button components
"chat" → ChatClient component
```

## State Management

### Nanostores

```typescript
import {
  isComponentPickerOpen$,      // boolean
  componentView$,               // "grid" | "list"
  componentSearchQuery$,        // string
  selectedCategory$,            // ComponentCategory
  selectedComponent$,           // ComponentItem | null
  showComponentPreview$,        // boolean
  recentComponents$,            // string[] (persisted)
} from '@/stores/componentPicker';
```

### Actions

```typescript
import {
  openComponentPicker,
  closeComponentPicker,
  toggleComponentPicker,
  setComponentView,
  setComponentSearchQuery,
  setSelectedCategory,
  selectComponent,
  closeComponentPreview,
  addRecentComponent,
  clearRecentComponents,
} from '@/stores/componentPicker';
```

## Events

### insertComponent Event

Fired when a component is inserted:

```typescript
window.addEventListener('insertComponent', (e: CustomEvent) => {
  const component = e.detail.component;

  // Component data:
  component.id          // "button"
  component.name        // "Button"
  component.category    // "ui"
  component.path        // "@/components/ui/button"
  component.example     // "import { Button } from ..."
  component.previewCode // "<Button>Click</Button>"
});
```

## Integration with Code Editor

### Example: Insert into Monaco Editor

```typescript
import { editor as monacoEditor } from 'monaco-editor';

window.addEventListener('insertComponent', (e: CustomEvent) => {
  const component = e.detail.component;
  const editor = monacoEditor.getModels()[0]; // Get active editor

  if (editor && component.example) {
    // Insert component code at cursor
    const position = editor.getPosition();
    const range = new monaco.Range(
      position.lineNumber,
      position.column,
      position.lineNumber,
      position.column
    );

    editor.executeEdits('insertComponent', [{
      range,
      text: component.example,
    }]);
  }
});
```

### Example: Insert into Textarea

```typescript
window.addEventListener('insertComponent', (e: CustomEvent) => {
  const component = e.detail.component;
  const textarea = document.querySelector('textarea');

  if (textarea && component.example) {
    // Insert at cursor position
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    textarea.value =
      text.substring(0, start) +
      component.example +
      text.substring(end);

    // Move cursor to end of inserted text
    const newPosition = start + component.example.length;
    textarea.setSelectionRange(newPosition, newPosition);
  }
});
```

## Customization

### Add Custom Components

Edit `/web/src/lib/componentLibrary.ts`:

```typescript
export const FEATURE_COMPONENTS: ComponentItem[] = [
  // ... existing components
  {
    id: "my-component",
    name: "MyComponent",
    category: "features",
    path: "@/components/features/MyComponent",
    description: "Custom component description",
    props: ["prop1", "prop2"],
    tags: ["custom", "feature"],
    previewCode: `<MyComponent prop1="value" />`,
    example: `import { MyComponent } from '@/components/features/MyComponent';

<MyComponent prop1="value" />`,
  },
];
```

### Add Custom Categories

Edit `/web/src/stores/componentPicker.ts`:

```typescript
export type ComponentCategory =
  | "all"
  | "ui"
  | "custom-category" // Add here
  | ...
```

Edit `/web/src/lib/componentLibrary.ts`:

```typescript
export const CATEGORY_LABELS: Record<ComponentCategory, string> = {
  // ... existing labels
  "custom-category": "Custom Category",
};
```

## Performance

- **Lazy Loading**: Picker only loads when opened
- **Search Debouncing**: 300ms debounce on search input
- **Virtual Scrolling**: Handles 50+ components efficiently
- **Persistent State**: Recent components saved to localStorage

## Accessibility

- **Keyboard Navigation**: Arrow keys, Enter, Escape
- **Screen Reader Support**: ARIA labels and roles
- **Focus Management**: Focus trap in modal
- **High Contrast**: Supports dark mode

## Testing

### Manual Testing

1. Open picker → Click "Add Component" button
2. Search → Type "button" in search
3. Filter → Click "Forms" category tab
4. Preview → Click "Preview" on any component
5. Insert → Click "Insert" or drag component
6. Recent → Check recently used section

### Automated Testing

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentPicker } from './ComponentPicker';

test('opens component picker', () => {
  render(<ComponentPicker />);
  fireEvent.click(screen.getByText('Add Component'));
  expect(screen.getByText('Component Library')).toBeInTheDocument();
});

test('searches components', () => {
  render(<ComponentPicker />);
  fireEvent.change(screen.getByPlaceholderText('Search...'), {
    target: { value: 'button' },
  });
  expect(screen.getByText('Button')).toBeInTheDocument();
});
```

## Demo Page

Visit `/creator/component-picker` to see the component picker in action.

## Future Enhancements

- [ ] Component templates (e.g., "Hero Section" with multiple components)
- [ ] Custom component collections
- [ ] Component favorites/bookmarks
- [ ] Drag reordering in recent components
- [ ] Component version history
- [ ] Export/import custom component libraries
- [ ] Component usage analytics
- [ ] Multi-select insert
- [ ] Batch operations

## Troubleshooting

### Picker doesn't open

Check that ComponentPicker is mounted:

```typescript
<ComponentPicker client:only="react" />
```

### Search not working

Verify componentSearchQuery$ is connected:

```typescript
import { componentSearchQuery$ } from '@/stores/componentPicker';
const query = useStore(componentSearchQuery$);
```

### Insert event not firing

Check event listener:

```typescript
window.addEventListener('insertComponent', (e) => {
  console.log('Event:', e.detail);
});
```

### AI suggestions not showing

Provide context or messages:

```typescript
<ComponentSuggestions
  context="I need a form"
  onInsert={handleInsert}
/>
```

## Architecture Decisions

### Why nanostores?

- ✅ Tiny (334 bytes)
- ✅ Persistent state (localStorage)
- ✅ Works with React, Astro, vanilla JS
- ✅ Type-safe
- ✅ No boilerplate

### Why separate trigger + picker?

- ✅ Modularity (use trigger anywhere)
- ✅ Lazy loading (picker loads on demand)
- ✅ Flexibility (custom triggers)

### Why custom event for insert?

- ✅ Decoupling (picker doesn't know about editor)
- ✅ Flexibility (any editor can listen)
- ✅ Testability (easy to mock)

## Related Documentation

- `/web/CLAUDE.md` - Frontend development patterns
- `/web/src/components/CLAUDE.md` - Component development
- `/web/src/pages/creator/live-code.astro` - Live code editor
- `/web/src/lib/ai/tools/searchComponents.ts` - Component search tool

---

**Built for CYCLE 15 of the Creator Platform System**

Component Picker delivers visual component discovery with AI-powered suggestions, making it 10x faster to build UIs.
