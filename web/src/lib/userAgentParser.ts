/**
 * User Agent Parser (Cycle 82)
 *
 * Parses user agent strings to extract:
 * - Device type (desktop, mobile, tablet)
 * - Browser name and version
 * - Operating system
 */

export interface ParsedUserAgent {
  deviceType: "desktop" | "mobile" | "tablet" | "unknown";
  browser: string;
  browserVersion: string;
  os: string;
}

/**
 * Parse user agent string
 */
export function parseUserAgent(userAgent: string | undefined): ParsedUserAgent {
  if (!userAgent) {
    return {
      deviceType: "unknown",
      browser: "Unknown",
      browserVersion: "",
      os: "Unknown",
    };
  }

  const ua = userAgent.toLowerCase();

  // Detect device type
  let deviceType: ParsedUserAgent["deviceType"] = "desktop";
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(userAgent)) {
    deviceType = "tablet";
  } else if (
    /mobile|android|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop/i.test(
      userAgent
    )
  ) {
    deviceType = "mobile";
  }

  // Detect browser
  let browser = "Unknown";
  let browserVersion = "";

  if (ua.includes("edg/")) {
    browser = "Edge";
    browserVersion = extractVersion(ua, /edg\/([\d.]+)/);
  } else if (ua.includes("chrome/") && !ua.includes("edg/")) {
    browser = "Chrome";
    browserVersion = extractVersion(ua, /chrome\/([\d.]+)/);
  } else if (ua.includes("firefox/")) {
    browser = "Firefox";
    browserVersion = extractVersion(ua, /firefox\/([\d.]+)/);
  } else if (ua.includes("safari/") && !ua.includes("chrome/")) {
    browser = "Safari";
    browserVersion = extractVersion(ua, /version\/([\d.]+)/);
  } else if (ua.includes("opera/") || ua.includes("opr/")) {
    browser = "Opera";
    browserVersion = extractVersion(ua, /(?:opera|opr)\/([\d.]+)/);
  }

  // Detect OS
  let os = "Unknown";
  if (ua.includes("windows")) {
    os = "Windows";
    if (ua.includes("windows nt 10.0")) os = "Windows 10";
    else if (ua.includes("windows nt 6.3")) os = "Windows 8.1";
    else if (ua.includes("windows nt 6.2")) os = "Windows 8";
    else if (ua.includes("windows nt 6.1")) os = "Windows 7";
  } else if (ua.includes("mac os x")) {
    os = "macOS";
    const version = extractVersion(ua, /mac os x ([\d_]+)/);
    if (version) {
      os = `macOS ${version.replace(/_/g, ".")}`;
    }
  } else if (ua.includes("android")) {
    os = "Android";
    const version = extractVersion(ua, /android ([\d.]+)/);
    if (version) os = `Android ${version}`;
  } else if (ua.includes("iphone") || ua.includes("ipad")) {
    os = "iOS";
    const version = extractVersion(ua, /os ([\d_]+)/);
    if (version) {
      os = `iOS ${version.replace(/_/g, ".")}`;
    }
  } else if (ua.includes("linux")) {
    os = "Linux";
  }

  return {
    deviceType,
    browser,
    browserVersion,
    os,
  };
}

/**
 * Extract version from user agent using regex
 */
function extractVersion(ua: string, regex: RegExp): string {
  const match = ua.match(regex);
  if (match && match[1]) {
    // Return only major.minor version (not patch)
    const parts = match[1].split(".");
    return parts.slice(0, 2).join(".");
  }
  return "";
}

/**
 * Mask IP address for privacy
 * Example: 192.168.1.100 → 192.168.***.***
 */
export function maskIPAddress(ip: string | undefined): string {
  if (!ip) return "Unknown";

  const parts = ip.split(".");
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.***. ***`;
  }

  // IPv6 or invalid format
  if (ip.includes(":")) {
    const parts = ip.split(":");
    if (parts.length > 2) {
      return `${parts[0]}:${parts[1]}:***:***`;
    }
  }

  return ip;
}

/**
 * Get device icon name based on device type
 */
export function getDeviceIcon(deviceType: ParsedUserAgent["deviceType"]): string {
  switch (deviceType) {
    case "mobile":
      return "smartphone";
    case "tablet":
      return "tablet";
    case "desktop":
      return "monitor";
    default:
      return "help-circle";
  }
}
