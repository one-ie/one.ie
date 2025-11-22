# Responsive Preview System

**Cycle 93 Implementation** - Mobile responsive preview for funnel builders.

## Overview

The responsive preview system allows you to test your funnels across multiple devices and screen sizes with real-time updates, warnings, and touch simulation.

## Features

### 1. Device Presets

Pre-configured devices with accurate dimensions and characteristics:

**Mobile Devices:**
- iPhone 14 Pro (393×852, 3x)
- iPhone SE (375×667, 2x)
- Google Pixel 7 (412×915, 2.625x)
- Samsung Galaxy S22 (360×800, 3x)

**Tablets:**
- iPad Pro 13" (1024×1366, 2x)
- iPad Mini (768×1024, 2x)
- Microsoft Surface Pro (912×1368, 2x)

**Desktop:**
- Desktop 1080p (1920×1080)
- Desktop 1440p (2560×1440)
- MacBook Air 13" (1280×800, 2x)

### 2. Custom Dimensions

Set any custom width × height for testing specific viewport sizes or unusual aspect ratios.

### 3. Orientation Toggle

Switch between portrait and landscape modes for mobile and tablet devices. Desktop devices don't support rotation.

### 4. Live Preview

Real-time updates as you edit your funnel. Changes appear instantly across all devices.

### 5. Responsive Warnings

Automatic detection of:
- **Horizontal scroll** - Content wider than viewport
- **Vertical scroll** - Content taller than viewport
- **Overflow** - Content significantly exceeds viewport (>150%)

### 6. Touch Simulation

Visual feedback when clicking/tapping on the preview:
- Animated touch points
- Ripple effects
- Touch interaction logging

### 7. SplitPane Integration

Resizable side-by-side layout:
- Drag to resize editor/preview panels
- Collapse/expand panels
- Persistent sizing (remembers your preference)

## Usage

### Basic Preview

```tsx
import { ResponsivePreview } from '@/components/editor/ResponsivePreview';

<ResponsivePreview
  htmlContent={yourHtml}
  defaultDevice="iphone_14_pro"
  defaultOrientation="portrait"
  showWarnings={true}
  enableTouchSimulation={true}
/>
```

### With Funnel Editor

```tsx
import { FunnelEditorWithPreview } from '@/components/editor/FunnelEditorWithPreview';

<FunnelEditorWithPreview
  initialFunnel={funnelData}
  showPreview={true}
  defaultDevice="iphone_14_pro"
/>
```

### Custom Integration

```tsx
import { ResponsivePreview } from '@/components/editor/ResponsivePreview';
import { DEVICE_PRESETS, getDeviceDimensions } from '@/lib/editor/device-presets';

function MyEditor() {
  const [device, setDevice] = useState(DEVICE_PRESETS.iphone_14_pro);
  const [orientation, setOrientation] = useState('portrait');

  return (
    <ResponsivePreview
      src="https://example.com/preview"
      onDeviceChange={setDevice}
      onOrientationChange={setOrientation}
    />
  );
}
```

## Props

### ResponsivePreview

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | - | URL to preview |
| `htmlContent` | `string` | - | HTML content to preview (alternative to src) |
| `defaultDevice` | `string` | `"iphone_14_pro"` | Initial device preset ID |
| `defaultOrientation` | `"portrait" \| "landscape"` | `"portrait"` | Initial orientation |
| `onDeviceChange` | `(device) => void` | - | Callback when device changes |
| `onOrientationChange` | `(orientation) => void` | - | Callback when orientation changes |
| `showWarnings` | `boolean` | `true` | Show responsive warnings |
| `enableTouchSimulation` | `boolean` | `true` | Enable touch point visualization |
| `className` | `string` | - | Additional CSS classes |

### FunnelEditorWithPreview

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialFunnel` | `FunnelProperties` | - | Initial funnel data |
| `showPreview` | `boolean` | `true` | Show responsive preview panel |
| `defaultDevice` | `string` | `"iphone_14_pro"` | Default preview device |

## Device Presets API

```typescript
import {
  DEVICE_PRESETS,
  ORIENTATIONS,
  getDeviceDimensions,
  getDevicesByType,
  getDeviceById,
  checkResponsiveWarnings,
  getBreakpointName,
} from '@/lib/editor/device-presets';

// Get device by ID
const device = DEVICE_PRESETS.iphone_14_pro;

// Get devices by type
const mobileDevices = getDevicesByType('mobile');
const tablets = getDevicesByType('tablet');
const desktops = getDevicesByType('desktop');

// Get dimensions with orientation
const dims = getDeviceDimensions(device, 'landscape');
// Returns: { width: 852, height: 393 }

// Check for responsive issues
const warnings = checkResponsiveWarnings(
  contentWidth,
  contentHeight,
  deviceWidth,
  deviceHeight
);

// Get breakpoint name
const breakpoint = getBreakpointName(768);
// Returns: 'tablet'
```

## Touch Simulation

The preview supports touch interaction visualization:

1. **Click/Tap** - Shows animated ripple at touch point
2. **Visual Feedback** - Blue pulsing circle appears
3. **Auto-fade** - Touch points disappear after 1 second
4. **Multiple touches** - Supports multiple simultaneous touch points

## Breakpoints

Standard breakpoints for reference:

```typescript
const BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  laptop: 1024,
  desktop: 1280,
  wide: 1536,
};
```

## Demo Pages

**Responsive Preview Only:**
- `/editor/responsive-preview-demo` - Standalone preview component

**Full Editor with Preview:**
- `/editor/funnel-builder-demo` - Complete funnel builder with side-by-side editing

## Keyboard Shortcuts

(When integrated with FunnelEditorWithHistory)

- `Cmd/Ctrl + Z` - Undo
- `Cmd/Ctrl + Shift + Z` - Redo
- `Cmd/Ctrl + Y` - Redo (alternative)
- `Cmd/Ctrl + H` - Toggle history panel
- `Cmd/Ctrl + R` - Rotate orientation (suggested addition)

## Files Created

### Core Components
- `/web/src/lib/editor/device-presets.ts` - Device configurations and helpers
- `/web/src/components/editor/ResponsivePreview.tsx` - Main preview component
- `/web/src/components/editor/FunnelEditorWithPreview.tsx` - Complete editor integration

### Demo Pages
- `/web/src/pages/editor/responsive-preview-demo.astro` - Preview demo
- `/web/src/pages/editor/funnel-builder-demo.astro` - Full editor demo

### Documentation
- `/web/src/components/editor/RESPONSIVE-PREVIEW.md` - This file

## Architecture

```
┌─────────────────────────────────────────────────────┐
│ FunnelEditorWithPreview                             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐          ┌──────────────────┐   │
│  │              │          │                  │   │
│  │   Editor     │  Split   │  Responsive      │   │
│  │   Panel      │  Pane    │  Preview         │   │
│  │              │          │                  │   │
│  │  - Content   │          │  - Device picker │   │
│  │  - Design    │          │  - Orientation   │   │
│  │  - Settings  │          │  - Live preview  │   │
│  │              │          │  - Warnings      │   │
│  │              │          │  - Touch points  │   │
│  │              │          │                  │   │
│  └──────────────┘          └──────────────────┘   │
│                                                     │
│  Uses: trackUserChange() for history tracking      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Best Practices

1. **Always test mobile first** - Start with iPhone/Android, then scale up
2. **Check all orientations** - Mobile and tablet should work in portrait AND landscape
3. **Watch for warnings** - Fix horizontal scroll issues immediately
4. **Use real content** - Test with actual copy length, not lorem ipsum
5. **Test touch interactions** - Ensure buttons are large enough (min 44×44px)
6. **Verify across device types** - Don't just test one phone model
7. **Check breakpoint transitions** - Ensure smooth layout shifts at breakpoints

## Performance

- **Iframe isolation** - Preview runs in isolated iframe (no style bleed)
- **Auto-scaling** - Preview scales to fit container automatically
- **Lazy rendering** - Only active device is rendered
- **Debounced updates** - Changes batched to prevent excessive re-renders

## Security

- **URL sanitization** - All URLs sanitized before rendering
- **Sandbox attributes** - Iframes sandboxed with restricted permissions
- **Content Security Policy** - CSP headers prevent XSS attacks

## Future Enhancements

Potential additions for future cycles:

- [ ] Screenshot capture for each device
- [ ] Network throttling simulation (3G, 4G, 5G)
- [ ] Console log viewer for debugging
- [ ] Performance metrics (LCP, FID, CLS)
- [ ] Accessibility checker (WCAG compliance)
- [ ] Multi-device preview grid (show 4+ devices at once)
- [ ] Device rotation animation
- [ ] Custom device presets (save your own devices)
- [ ] A/B test comparison (side-by-side variants)
- [ ] Annotation tools (markup issues directly on preview)

## Support

For issues or questions:
- Check demo pages first: `/editor/funnel-builder-demo`
- Review device presets: `/web/src/lib/editor/device-presets.ts`
- Inspect component props: Type definitions in component files

---

**Built for Cycle 93** - Mobile responsive preview for the funnel builder.
