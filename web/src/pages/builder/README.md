# Website Builder - Main Editor Interface

## Overview

The Website Builder provides a comprehensive AI-powered interface for building websites with:
- **Left Panel**: AI Chat for natural language commands
- **Center Panel**: Live Preview with responsive viewport controls
- **Right Panel**: Code Editor for direct code editing (optional)

## Routes

### Main Editor
```
/builder/[websiteId]/[pageId]
```
Opens the full three-panel editor interface for the specified website and page.

**Example**: `/builder/my-website/home`

### Preview (iframe content)
```
/preview/[websiteId]/[pageId]
```
Renders just the page content (no editor UI) for display in the preview iframe.

**Example**: `/preview/my-website/home`

### Index
```
/builder
```
Landing page with quick start and demo builder access.

## Components

### Main Components

**WebsiteBuilder** (`/web/src/components/builder/WebsiteBuilder.tsx`)
- Main container component
- Handles desktop/mobile layout switching
- Manages panel show/hide state
- Provides resizable panel layout

### Panel Components

**ChatPanel** (`/web/src/components/builder/panels/ChatPanel.tsx`)
- Integrates ChatClientV2 for AI conversations
- Header with title and description

**PreviewPanel** (`/web/src/components/builder/panels/PreviewPanel.tsx`)
- Viewport controls (desktop, tablet, mobile)
- Refresh button
- iframe preview of `/preview/[websiteId]/[pageId]`
- Responsive viewport sizing

**CodeEditorPanel** (`/web/src/components/builder/panels/CodeEditorPanel.tsx`)
- Tabbed interface (HTML, CSS, JavaScript)
- Textarea-based code editor (will be enhanced with Monaco later)
- Format button placeholder

## Features

### Desktop Layout
- Three resizable panels with drag handles
- Panel show/hide toggles in header
- Persistent layout saved to localStorage
- Minimum/maximum panel sizes enforced

### Mobile Layout
- Single panel view with tab navigation
- Bottom navigation bar to switch between Chat, Preview, Code
- Full-screen experience optimized for mobile

### Responsive
- Automatically switches between desktop/mobile layouts at 768px breakpoint
- Uses `useMediaQuery` hook for responsive detection

## Layout Configuration

The builder uses the Layout component with special configuration:

```astro
<Layout
  title={title}
  description={description}
  sidebarInitialCollapsed={true}  // Maximize horizontal space
  hideHeader={true}                // Full-screen builder experience
  fullHeight={true}                // Fill viewport height
>
```

## Panel Resizing

Powered by `react-resizable-panels`:
- Drag handles between panels to resize
- Minimum width: 300px per panel (desktop)
- Layout persisted to localStorage as `builder-layout`
- Smooth animations and transitions

## Next Steps

### Planned Enhancements

1. **Backend Integration**
   - Fetch actual website/page data from Convex
   - Save code changes to database
   - Real-time sync between chat and code

2. **Code Editor**
   - Replace textarea with Monaco Editor
   - Syntax highlighting
   - Auto-completion
   - Error detection

3. **Preview**
   - Live reload on code changes
   - Hot module replacement
   - Error overlay for compile errors

4. **AI Chat**
   - Context-aware suggestions based on current page
   - Code generation from chat commands
   - Visual component picker

5. **Publishing**
   - Deploy to production
   - Custom domain support
   - Version history

## File Structure

```
/web/src/
├── pages/
│   ├── builder/
│   │   ├── index.astro              # Landing page
│   │   └── [websiteId]/
│   │       └── [pageId].astro       # Main editor route
│   └── preview/
│       └── [websiteId]/
│           └── [pageId].astro       # Preview content route
└── components/
    └── builder/
        ├── WebsiteBuilder.tsx       # Main container
        └── panels/
            ├── ChatPanel.tsx        # AI chat interface
            ├── PreviewPanel.tsx     # Live preview
            └── CodeEditorPanel.tsx  # Code editor
```

## Usage

### Access the Builder

1. **Demo Builder**: Visit `/builder` and click "Try Demo Builder"
2. **Direct Link**: Navigate to `/builder/[websiteId]/[pageId]`
3. **Custom Website**: Create a new website (coming soon)

### Keyboard Shortcuts (Planned)

- `Cmd/Ctrl + B` - Toggle chat panel
- `Cmd/Ctrl + E` - Toggle code panel
- `Cmd/Ctrl + P` - Toggle preview size
- `Cmd/Ctrl + S` - Save changes
- `Cmd/Ctrl + Shift + P` - Publish

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android 90+)

---

**Built with:**
- Astro 5
- React 19
- react-resizable-panels
- shadcn/ui components
- Tailwind CSS v4
