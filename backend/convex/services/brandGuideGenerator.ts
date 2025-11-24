/**
 * Brand Guide Generator Service
 *
 * Creates brand guide documentation from website analysis
 */

import { Effect } from "effect";
import type { BrandIdentity } from "./websiteAnalyzer";

/**
 * Simplified brand structure from website analysis
 */
export interface SimpleBrand {
  name: string;
  colors: string[];
  fonts: string[];
  logo?: string;
}

export interface BrandGuide {
  organizationName: string;
  sourceUrl: string;
  generatedAt: number;
  brand: BrandIdentity;
}

/**
 * Generate brand guide markdown
 */
export const generateBrandGuideMarkdown = (
  guide: BrandGuide
): string => {
  return `# ${guide.organizationName} Brand Guide

**Generated:** ${new Date(guide.generatedAt).toISOString()}
**Source:** ${guide.sourceUrl}

## Brand Colors

### Primary Color
\`\`\`
${guide.brand.colors.primary}
\`\`\`

### Secondary Color
\`\`\`
${guide.brand.colors.secondary}
\`\`\`

${guide.brand.colors.accent ? `### Accent Color
\`\`\`
${guide.brand.colors.accent}
\`\`\`
` : ''}

## Logo

- **URL:** ${guide.brand.logo.url}
- **Format:** ${guide.brand.logo.format.toUpperCase()}

## Typography

### Heading Font
\`\`\`
${guide.brand.fonts.heading}
\`\`\`

### Body Font
\`\`\`
${guide.brand.fonts.body}
\`\`\`

## Brand Voice

### Tone
${guide.brand.voice.tone}

### Target Audience
${guide.brand.voice.audience}

---

## Usage Guidelines

### Colors in CSS

\`\`\`css
:root {
  --color-primary: ${guide.brand.colors.primary};
  --color-secondary: ${guide.brand.colors.secondary};${guide.brand.colors.accent ? `
  --color-accent: ${guide.brand.colors.accent};` : ''}
}
\`\`\`

### Colors in Tailwind Config

\`\`\`css
@theme {
  /* Convert hex to HSL for Tailwind v4 */
  --color-primary: /* ${guide.brand.colors.primary} as HSL */;
  --color-secondary: /* ${guide.brand.colors.secondary} as HSL */;${guide.brand.colors.accent ? `
  --color-accent: /* ${guide.brand.colors.accent} as HSL */;` : ''}
}
\`\`\`

### Typography in CSS

\`\`\`css
:root {
  --font-heading: ${guide.brand.fonts.heading};
  --font-body: ${guide.brand.fonts.body};
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
}

body {
  font-family: var(--font-body);
}
\`\`\`

---

**This brand guide was automatically generated from your website.**
**You can customize it by editing this file directly.**
`;
};

/**
 * Transform SimpleBrand to BrandIdentity with sensible defaults
 */
export const transformBrandToIdentity = (brand: SimpleBrand): BrandIdentity => {
  // Extract primary/secondary colors with fallbacks
  const primary = brand.colors[0] || "#000000";
  const secondary = brand.colors[1] || "#FFFFFF";
  const accent = brand.colors[2];

  // Extract heading/body fonts with fallbacks
  const heading = brand.fonts[0] || "Inter";
  const body = brand.fonts[1] || brand.fonts[0] || "Inter";

  // Determine logo format from URL or default to SVG
  const logoFormat = brand.logo
    ? brand.logo.split('.').pop()?.toLowerCase() || "svg"
    : "svg";

  return {
    colors: {
      primary,
      secondary,
      accent,
    },
    logo: {
      url: brand.logo || "/logo.svg",
      format: logoFormat,
    },
    fonts: {
      heading,
      body,
    },
    voice: {
      tone: "Professional and approachable",
      audience: "General audience",
    },
  };
};

/**
 * Create brand guide from website analysis
 */
export const createBrandGuide = (
  brand: BrandIdentity,
  organizationName: string,
  sourceUrl: string
): Effect.Effect<BrandGuide, never> =>
  Effect.succeed({
    organizationName,
    sourceUrl,
    generatedAt: Date.now(),
    brand
  });

/**
 * Run brand guide generation pipeline
 * Accepts SimpleBrand from website analysis and transforms it
 */
export const runBrandGuideGeneration = async (
  simpleBrand: SimpleBrand,
  organizationName: string,
  sourceUrl: string
): Promise<{ guide: BrandGuide; markdown: string }> => {
  // Transform SimpleBrand to BrandIdentity
  const brand = transformBrandToIdentity(simpleBrand);

  const guide = await Effect.runPromise(
    createBrandGuide(brand, organizationName, sourceUrl)
  );

  const markdown = generateBrandGuideMarkdown(guide);

  return { guide, markdown };
};
