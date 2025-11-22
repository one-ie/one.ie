/**
 * Device Presets for Responsive Preview
 *
 * Common device screen sizes and configurations for testing
 * responsive funnel designs across different viewports.
 */

export interface DevicePreset {
  id: string;
  name: string;
  width: number;
  height: number;
  pixelRatio: number;
  userAgent: string;
  type: "mobile" | "tablet" | "desktop";
  hasTouch: boolean;
  icon: string;
}

export interface Orientation {
  id: "portrait" | "landscape";
  label: string;
  icon: string;
}

/**
 * Device Presets - Popular Devices
 */
export const DEVICE_PRESETS: Record<string, DevicePreset> = {
  // Mobile Devices
  iphone_14_pro: {
    id: "iphone_14_pro",
    name: "iPhone 14 Pro",
    width: 393,
    height: 852,
    pixelRatio: 3,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
    type: "mobile",
    hasTouch: true,
    icon: "📱",
  },
  iphone_se: {
    id: "iphone_se",
    name: "iPhone SE",
    width: 375,
    height: 667,
    pixelRatio: 2,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
    type: "mobile",
    hasTouch: true,
    icon: "📱",
  },
  pixel_7: {
    id: "pixel_7",
    name: "Google Pixel 7",
    width: 412,
    height: 915,
    pixelRatio: 2.625,
    userAgent:
      "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
    type: "mobile",
    hasTouch: true,
    icon: "📱",
  },
  galaxy_s22: {
    id: "galaxy_s22",
    name: "Samsung Galaxy S22",
    width: 360,
    height: 800,
    pixelRatio: 3,
    userAgent:
      "Mozilla/5.0 (Linux; Android 12; SM-S906U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
    type: "mobile",
    hasTouch: true,
    icon: "📱",
  },

  // Tablets
  ipad_pro_13: {
    id: "ipad_pro_13",
    name: 'iPad Pro 13"',
    width: 1024,
    height: 1366,
    pixelRatio: 2,
    userAgent:
      "Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
    type: "tablet",
    hasTouch: true,
    icon: "📱",
  },
  ipad_mini: {
    id: "ipad_mini",
    name: "iPad Mini",
    width: 768,
    height: 1024,
    pixelRatio: 2,
    userAgent:
      "Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
    type: "tablet",
    hasTouch: true,
    icon: "📱",
  },
  surface_pro: {
    id: "surface_pro",
    name: "Microsoft Surface Pro",
    width: 912,
    height: 1368,
    pixelRatio: 2,
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 Edg/116.0.0.0",
    type: "tablet",
    hasTouch: true,
    icon: "💻",
  },

  // Desktop
  desktop_1080p: {
    id: "desktop_1080p",
    name: "Desktop 1080p",
    width: 1920,
    height: 1080,
    pixelRatio: 1,
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
    type: "desktop",
    hasTouch: false,
    icon: "🖥️",
  },
  desktop_1440p: {
    id: "desktop_1440p",
    name: "Desktop 1440p",
    width: 2560,
    height: 1440,
    pixelRatio: 1,
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
    type: "desktop",
    hasTouch: false,
    icon: "🖥️",
  },
  laptop_13: {
    id: "laptop_13",
    name: 'MacBook Air 13"',
    width: 1280,
    height: 800,
    pixelRatio: 2,
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
    type: "desktop",
    hasTouch: false,
    icon: "💻",
  },
};

/**
 * Orientation Presets
 */
export const ORIENTATIONS: Record<Orientation["id"], Orientation> = {
  portrait: {
    id: "portrait",
    label: "Portrait",
    icon: "📱",
  },
  landscape: {
    id: "landscape",
    label: "Landscape",
    icon: "📱",
  },
};

/**
 * Get device dimensions with orientation applied
 */
export function getDeviceDimensions(
  device: DevicePreset,
  orientation: Orientation["id"]
): { width: number; height: number } {
  if (orientation === "landscape") {
    return {
      width: Math.max(device.width, device.height),
      height: Math.min(device.width, device.height),
    };
  }

  return {
    width: Math.min(device.width, device.height),
    height: Math.max(device.width, device.height),
  };
}

/**
 * Get devices by type
 */
export function getDevicesByType(type: DevicePreset["type"]): DevicePreset[] {
  return Object.values(DEVICE_PRESETS).filter((device) => device.type === type);
}

/**
 * Get device preset by ID
 */
export function getDeviceById(id: string): DevicePreset | undefined {
  return DEVICE_PRESETS[id];
}

/**
 * Check if content fits within device viewport
 */
export function checkResponsiveWarnings(
  contentWidth: number,
  contentHeight: number,
  deviceWidth: number,
  deviceHeight: number
): Array<{ type: "overflow" | "horizontal-scroll" | "vertical-scroll"; message: string }> {
  const warnings: Array<{
    type: "overflow" | "horizontal-scroll" | "vertical-scroll";
    message: string;
  }> = [];

  // Check horizontal overflow
  if (contentWidth > deviceWidth) {
    warnings.push({
      type: "horizontal-scroll",
      message: `Content width (${contentWidth}px) exceeds viewport width (${deviceWidth}px). Users will need to scroll horizontally.`,
    });
  }

  // Check vertical overflow
  if (contentHeight > deviceHeight) {
    warnings.push({
      type: "vertical-scroll",
      message: `Content height (${contentHeight}px) exceeds viewport height (${deviceHeight}px). Page will scroll vertically.`,
    });
  }

  // Check if content is significantly wider than viewport (bad mobile UX)
  if (contentWidth > deviceWidth * 1.5) {
    warnings.push({
      type: "overflow",
      message: `Content is ${Math.round(
        (contentWidth / deviceWidth - 1) * 100
      )}% wider than viewport. Consider using responsive design.`,
    });
  }

  return warnings;
}

/**
 * Popular breakpoints for reference
 */
export const BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  laptop: 1024,
  desktop: 1280,
  wide: 1536,
} as const;

/**
 * Get breakpoint name for width
 */
export function getBreakpointName(width: number): keyof typeof BREAKPOINTS {
  if (width < BREAKPOINTS.mobile) return "mobile";
  if (width < BREAKPOINTS.tablet) return "mobile";
  if (width < BREAKPOINTS.laptop) return "tablet";
  if (width < BREAKPOINTS.desktop) return "laptop";
  if (width < BREAKPOINTS.wide) return "desktop";
  return "wide";
}

/**
 * Touch event simulation helpers
 */
export interface TouchPoint {
  x: number;
  y: number;
  id: number;
}

export type TouchGesture =
  | { type: "tap"; point: TouchPoint }
  | { type: "double-tap"; point: TouchPoint }
  | { type: "long-press"; point: TouchPoint }
  | { type: "swipe"; start: TouchPoint; end: TouchPoint; direction: "up" | "down" | "left" | "right" }
  | { type: "pinch"; center: TouchPoint; scale: number }
  | { type: "rotate"; center: TouchPoint; angle: number };

/**
 * Detect swipe direction
 */
export function detectSwipeDirection(
  startX: number,
  startY: number,
  endX: number,
  endY: number
): "up" | "down" | "left" | "right" | null {
  const dx = endX - startX;
  const dy = endY - startY;
  const threshold = 50; // Minimum distance for swipe

  if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) {
    return null; // Not a swipe
  }

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? "right" : "left";
  } else {
    return dy > 0 ? "down" : "up";
  }
}

/**
 * Calculate pinch scale
 */
export function calculatePinchScale(
  touch1Start: { x: number; y: number },
  touch2Start: { x: number; y: number },
  touch1End: { x: number; y: number },
  touch2End: { x: number; y: number }
): number {
  const startDistance = Math.hypot(
    touch2Start.x - touch1Start.x,
    touch2Start.y - touch1Start.y
  );
  const endDistance = Math.hypot(touch2End.x - touch1End.x, touch2End.y - touch1End.y);

  return endDistance / startDistance;
}
