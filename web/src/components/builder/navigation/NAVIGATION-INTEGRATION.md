# Navigation Integration (Cycle 7)

**Goal:** Seamless navigation between chat, builder, component library, and preview

## Components

### 1. UnifiedNav (Main Navigation Component)
Provides a unified navigation bar used across chat, builder, and preview screens.

**Features:**
- Breadcrumb navigation (Chat → Builder → Preview → Deploy)
- Quick actions menu (context-aware)
- Keyboard shortcuts support
- Mobile responsive menu
- Progress indicator

**Usage:**
```tsx
<UnifiedNav
  currentStep="builder"
  onNavigate={(step) => navigate(`/${step}`)}
  context="builder"
  websiteId="my-site"
  pageId="home"
  quickActions={{
    onAskAI: () => openChat(),
    onBrowseComponents: () => openComponentPicker(),
    onPreview: () => openPreview(),
  }}
/>
```

### 2. Breadcrumbs
Displays navigation path with clickable steps.

**Features:**
- Shows progress (Step X of Y)
- Clickable completed steps
- Disabled future steps
- Home button to go to chat

**Usage:**
```tsx
<Breadcrumbs
  currentStep="builder"
  onNavigate={(step) => navigate(`/${step}`)}
/>
```

### 3. QuickActions
Context-aware quick action buttons.

**Features:**
- Different buttons per context (chat, builder, preview)
- Keyboard shortcut hints
- Dropdown menu for more actions
- Dark mode toggle

**Contexts:**
- **Chat:** Generate Code (⌘↵)
- **Builder:** Ask AI (⌘K), Components (⌘P), Preview (⌘⇧P)
- **Preview:** View Code (⌘E)

**Usage:**
```tsx
<QuickActions
  context="builder"
  onAskAI={() => openChat()}
  onBrowseComponents={() => openComponentPicker()}
  onPreview={() => openPreview()}
/>
```

### 4. KeyboardShortcuts
Dialog showing available keyboard shortcuts.

**Features:**
- Press `?` to open shortcuts dialog
- Organized by category (Navigation, Actions, Editor)
- Mobile responsive
- Fixed help button in corner

**Usage:**
```tsx
<KeyboardShortcuts />
```

### 5. NavigationButtons
Context-specific navigation buttons for different screens.

**Contexts:**
- **Chat:** "Open in Builder" button after code generation
- **Builder:** "Ask AI", "Browse Components", "Preview" buttons
- **Preview:** "Edit Code", "Ask AI" buttons

**Usage:**
```tsx
<NavigationButtons
  context="chat"
  onOpenInBuilder={() => navigate('/builder')}
  orientation="vertical"
/>
```

## Keyboard Shortcuts

### Navigation Shortcuts
| Shortcut | Action |
|----------|--------|
| ⌘K (Ctrl+K) | Open chat / command palette |
| ⌘B (Ctrl+B) | Open builder |
| ⌘P (Ctrl+P) | Open component picker |
| ⌘⇧P (Ctrl+Shift+P) | Open preview |

### Action Shortcuts
| Shortcut | Action |
|----------|--------|
| ⌘↵ (Ctrl+Enter) | Generate / Compile code |
| ⌘S (Ctrl+S) | Save changes |
| ⌘Z (Ctrl+Z) | Undo |
| ⌘⇧Z (Ctrl+Shift+Z) | Redo |

### Editor Shortcuts
| Shortcut | Action |
|----------|--------|
| ⌘/ (Ctrl+/) | Toggle comment |
| ⌘A (Ctrl+A) | Select all |
| ⌘F (Ctrl+F) | Find and replace |
| ? | Show shortcuts dialog |

## Integration Examples

### Example 1: Chat Page with Navigation
```astro
---
// /web/src/pages/chat/builder.astro
import Layout from '@/layouts/Layout.astro';
import { WebsiteBuilderChat } from '@/components/ai/WebsiteBuilderChat';
---

<Layout title="AI Website Builder" sidebarInitialCollapsed={true}>
  <WebsiteBuilderChat client:only="react" />
</Layout>
```

```tsx
// In WebsiteBuilderChat component
<UnifiedNav
  currentStep="chat"
  context="chat"
  quickActions={{
    onGenerateCode: handleGenerate,
  }}
/>
```

### Example 2: Builder Page with All Navigation
```tsx
// /web/src/components/builder/WebsiteBuilder.tsx
import { UnifiedNav } from './navigation/UnifiedNav';

export function WebsiteBuilder({ websiteId, pageId }) {
  const [currentStep, setCurrentStep] = React.useState<BreadcrumbStep>("builder");

  return (
    <div className="h-full flex flex-col">
      <UnifiedNav
        currentStep={currentStep}
        onNavigate={setCurrentStep}
        context="builder"
        websiteId={websiteId}
        pageId={pageId}
        quickActions={{
          onAskAI: () => navigate('/chat'),
          onBrowseComponents: () => openComponentPicker(),
          onPreview: () => setCurrentStep('preview'),
          onGenerateCode: handleGenerate,
        }}
      />

      {/* Three-panel layout */}
      <ResizablePanelGroup>
        {/* chat, preview, code panels */}
      </ResizablePanelGroup>
    </div>
  );
}
```

### Example 3: Chat Component with Open in Builder Button
```tsx
// In message display logic
import { InlineNavigationButton } from '@/components/builder/navigation/NavigationButtons';

function CodeMessage({ code }) {
  return (
    <div className="space-y-3">
      <CodeBlock code={code} />
      <InlineNavigationButton
        label="Open in Builder"
        onClick={() => navigate('/builder')}
      />
    </div>
  );
}
```

## File Structure

```
web/src/components/builder/navigation/
├── Breadcrumbs.tsx                 # Breadcrumb navigation component
├── QuickActions.tsx                # Quick action buttons
├── UnifiedNav.tsx                  # Main navigation bar
├── KeyboardShortcuts.tsx           # Shortcuts dialog
├── NavigationButtons.tsx           # Context-specific nav buttons
├── Header.tsx                      # Page header (existing)
├── Footer.tsx                      # Page footer (existing)
├── MegaMenu.tsx                    # Mega menu (existing)
├── index.ts                        # Barrel export
└── NAVIGATION-INTEGRATION.md       # This file
```

## Styling

All navigation components use:
- **Tailwind CSS v4** for styling
- **shadcn/ui** for UI primitives
- **Design system colors** (background, foreground, primary, secondary)
- **Responsive design** with mobile/desktop variants

## Mobile Responsiveness

- **Desktop (≥768px):** Full breadcrumbs + quick actions
- **Mobile (<768px):** Hamburger menu + collapsed breadcrumbs

## Accessibility

- Keyboard navigation support
- ARIA labels on buttons
- Tooltip hints for all actions
- Focus management in dialogs
- Semantic HTML structure

## Future Enhancements

1. **Advanced Component Picker**
   - Visual component browser with search
   - Category filtering (Crypto, Streaming, Things, People, etc.)
   - Drag-and-drop to preview

2. **Command Palette**
   - Fuzzy search for all actions
   - Recent actions history
   - Smart suggestions based on context

3. **Collaborative Navigation**
   - Show other user's current location
   - Real-time collaboration indicators
   - Presence awareness

4. **Analytics Integration**
   - Track navigation patterns
   - User journey analysis
   - Feature usage metrics

5. **History/Undo**
   - Navigation history breadcrumb
   - Time-based undo/redo
   - Checkpoint system

## Testing

```tsx
// Test keyboard shortcuts
fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
expect(onNavigate).toHaveBeenCalledWith('chat');

// Test breadcrumb navigation
const link = screen.getByText('Builder');
fireEvent.click(link);
expect(onNavigate).toHaveBeenCalledWith('builder');

// Test quick actions context switching
render(<QuickActions context="chat" />);
expect(screen.getByText('Generate Code')).toBeInTheDocument();
```

## References

- Architecture: `/one/knowledge/architecture.md`
- Integration Plan: `/one/things/plans/integration-10-cycle-plan.md`
- Design System: `/one/things/design-system.md`
- Component Patterns: `/web/src/components/CLAUDE.md`
