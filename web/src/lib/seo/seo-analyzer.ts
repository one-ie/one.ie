/**
 * SEO Analyzer - Analyze pages and provide SEO scores
 *
 * Features:
 * - Meta tags analysis
 * - Content analysis (headings, word count, keywords)
 * - Image optimization analysis
 * - Schema.org structured data validation
 * - Performance metrics
 * - Mobile-friendliness
 * - Overall SEO score (0-100)
 */

export interface SEOAnalysisResult {
  score: number; // 0-100
  passed: number; // Number of passed checks
  total: number; // Total number of checks
  issues: SEOIssue[];
  suggestions: SEOSuggestion[];
  metrics: SEOMetrics;
}

export interface SEOIssue {
  severity: "critical" | "warning" | "info";
  category:
    | "meta"
    | "content"
    | "images"
    | "schema"
    | "performance"
    | "mobile";
  message: string;
  fix?: string;
}

export interface SEOSuggestion {
  priority: "high" | "medium" | "low";
  category: string;
  message: string;
  impact: string; // How this will improve SEO
}

export interface SEOMetrics {
  meta: {
    hasTitle: boolean;
    titleLength: number;
    hasDescription: boolean;
    descriptionLength: number;
    hasCanonical: boolean;
    hasOgTags: boolean;
    hasTwitterCard: boolean;
    hasKeywords: boolean;
  };
  content: {
    wordCount: number;
    headingCount: number;
    hasH1: boolean;
    h1Count: number;
    imageCount: number;
    imagesWithAlt: number;
    linkCount: number;
    internalLinks: number;
    externalLinks: number;
  };
  schema: {
    hasStructuredData: boolean;
    schemaTypes: string[];
    validSchema: boolean;
  };
  performance: {
    estimatedLoadTime: number; // milliseconds
    totalPageSize: number; // bytes
    imageSize: number; // bytes
    scriptSize: number; // bytes
  };
}

export interface SEOPageData {
  title?: string;
  metaDescription?: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
  content?: string; // HTML content
  images?: Array<{ src: string; alt?: string }>;
  links?: Array<{ href: string; text: string }>;
  structuredData?: any; // JSON-LD schema
}

/**
 * Analyze a page and return SEO score + recommendations
 */
export function analyzeSEO(data: SEOPageData): SEOAnalysisResult {
  const issues: SEOIssue[] = [];
  const suggestions: SEOSuggestion[] = [];
  let passedChecks = 0;
  const totalChecks = 25; // Total number of SEO checks

  // Meta tags analysis
  const metaAnalysis = analyzeMetaTags(data);
  issues.push(...metaAnalysis.issues);
  suggestions.push(...metaAnalysis.suggestions);
  passedChecks += metaAnalysis.passed;

  // Content analysis
  const contentAnalysis = analyzeContent(data);
  issues.push(...contentAnalysis.issues);
  suggestions.push(...contentAnalysis.suggestions);
  passedChecks += contentAnalysis.passed;

  // Image analysis
  const imageAnalysis = analyzeImages(data);
  issues.push(...imageAnalysis.issues);
  suggestions.push(...imageAnalysis.suggestions);
  passedChecks += imageAnalysis.passed;

  // Schema.org analysis
  const schemaAnalysis = analyzeSchema(data);
  issues.push(...schemaAnalysis.issues);
  suggestions.push(...schemaAnalysis.suggestions);
  passedChecks += schemaAnalysis.passed;

  // Calculate metrics
  const metrics = calculateMetrics(data);

  // Calculate overall score (0-100)
  const score = Math.round((passedChecks / totalChecks) * 100);

  return {
    score,
    passed: passedChecks,
    total: totalChecks,
    issues,
    suggestions,
    metrics,
  };
}

/**
 * Analyze meta tags
 */
function analyzeMetaTags(
  data: SEOPageData
): { issues: SEOIssue[]; suggestions: SEOSuggestion[]; passed: number } {
  const issues: SEOIssue[] = [];
  const suggestions: SEOSuggestion[] = [];
  let passed = 0;

  // Title tag
  if (!data.title) {
    issues.push({
      severity: "critical",
      category: "meta",
      message: "Missing title tag",
      fix: "Add a unique, descriptive title (50-60 characters)",
    });
  } else {
    passed++;

    if (data.title.length < 30) {
      issues.push({
        severity: "warning",
        category: "meta",
        message: `Title is too short (${data.title.length} characters)`,
        fix: "Expand title to 50-60 characters for better SEO",
      });
    } else if (data.title.length > 60) {
      issues.push({
        severity: "warning",
        category: "meta",
        message: `Title is too long (${data.title.length} characters)`,
        fix: "Shorten title to 50-60 characters to avoid truncation",
      });
    } else {
      passed++;
    }
  }

  // Meta description
  if (!data.metaDescription) {
    issues.push({
      severity: "critical",
      category: "meta",
      message: "Missing meta description",
      fix: "Add a compelling description (150-160 characters)",
    });
  } else {
    passed++;

    if (data.metaDescription.length < 120) {
      issues.push({
        severity: "warning",
        category: "meta",
        message: `Description is too short (${data.metaDescription.length} characters)`,
        fix: "Expand description to 150-160 characters",
      });
    } else if (data.metaDescription.length > 160) {
      issues.push({
        severity: "warning",
        category: "meta",
        message: `Description is too long (${data.metaDescription.length} characters)`,
        fix: "Shorten description to 150-160 characters",
      });
    } else {
      passed++;
    }
  }

  // Keywords
  if (!data.keywords || data.keywords.length === 0) {
    suggestions.push({
      priority: "medium",
      category: "meta",
      message: "Add meta keywords",
      impact: "Helps categorize content (minor ranking factor)",
    });
  } else {
    passed++;
  }

  // Canonical URL
  if (!data.canonicalUrl) {
    issues.push({
      severity: "warning",
      category: "meta",
      message: "Missing canonical URL",
      fix: "Add canonical tag to prevent duplicate content issues",
    });
  } else {
    passed++;
  }

  // Open Graph tags
  if (!data.ogImage) {
    suggestions.push({
      priority: "high",
      category: "meta",
      message: "Add Open Graph image",
      impact: "Improves social media sharing appearance (1200x630px recommended)",
    });
  } else {
    passed++;
  }

  return { issues, suggestions, passed };
}

/**
 * Analyze content quality
 */
function analyzeContent(
  data: SEOPageData
): { issues: SEOIssue[]; suggestions: SEOSuggestion[]; passed: number } {
  const issues: SEOIssue[] = [];
  const suggestions: SEOSuggestion[] = [];
  let passed = 0;

  if (!data.content) {
    issues.push({
      severity: "critical",
      category: "content",
      message: "No content to analyze",
      fix: "Add meaningful content to the page",
    });
    return { issues, suggestions, passed: 0 };
  }

  // Word count
  const wordCount = countWords(data.content);
  if (wordCount < 300) {
    issues.push({
      severity: "warning",
      category: "content",
      message: `Content is too short (${wordCount} words)`,
      fix: "Add more content (aim for 300+ words)",
    });
  } else {
    passed++;
  }

  // H1 heading
  const h1Count = (data.content.match(/<h1/gi) || []).length;
  if (h1Count === 0) {
    issues.push({
      severity: "critical",
      category: "content",
      message: "Missing H1 heading",
      fix: "Add a single H1 heading with main keyword",
    });
  } else if (h1Count > 1) {
    issues.push({
      severity: "warning",
      category: "content",
      message: `Multiple H1 headings (${h1Count})`,
      fix: "Use only one H1 heading per page",
    });
  } else {
    passed++;
  }

  // Heading hierarchy
  const headingCount = (data.content.match(/<h[2-6]/gi) || []).length;
  if (headingCount === 0) {
    suggestions.push({
      priority: "medium",
      category: "content",
      message: "Add subheadings (H2-H6)",
      impact: "Improves content structure and readability",
    });
  } else {
    passed++;
  }

  // Keywords in content
  if (data.keywords && data.keywords.length > 0) {
    const hasKeywords = data.keywords.some((keyword) =>
      data.content!.toLowerCase().includes(keyword.toLowerCase())
    );

    if (!hasKeywords) {
      issues.push({
        severity: "warning",
        category: "content",
        message: "Keywords not found in content",
        fix: "Include target keywords naturally in content",
      });
    } else {
      passed++;
    }
  }

  return { issues, suggestions, passed };
}

/**
 * Analyze images
 */
function analyzeImages(
  data: SEOPageData
): { issues: SEOIssue[]; suggestions: SEOSuggestion[]; passed: number } {
  const issues: SEOIssue[] = [];
  const suggestions: SEOSuggestion[] = [];
  let passed = 0;

  if (!data.images || data.images.length === 0) {
    suggestions.push({
      priority: "low",
      category: "images",
      message: "No images found",
      impact: "Images improve engagement and can rank in image search",
    });
    return { issues, suggestions, passed };
  }

  // Alt text
  const imagesWithoutAlt = data.images.filter(
    (img) => !img.alt || img.alt.trim() === ""
  );

  if (imagesWithoutAlt.length > 0) {
    issues.push({
      severity: "warning",
      category: "images",
      message: `${imagesWithoutAlt.length} images missing alt text`,
      fix: "Add descriptive alt text to all images for accessibility and SEO",
    });
  } else {
    passed++;
  }

  // Image optimization
  const largeImages = data.images.filter((img) => {
    // Check if image URL suggests it's unoptimized (no format conversion)
    return !img.src.match(/\.(webp|avif)$/i);
  });

  if (largeImages.length > 0) {
    suggestions.push({
      priority: "high",
      category: "images",
      message: `${largeImages.length} images could be optimized`,
      impact: "Convert to WebP/AVIF format to reduce page load time",
    });
  } else {
    passed++;
  }

  return { issues, suggestions, passed };
}

/**
 * Analyze structured data (Schema.org)
 */
function analyzeSchema(
  data: SEOPageData
): { issues: SEOIssue[]; suggestions: SEOSuggestion[]; passed: number } {
  const issues: SEOIssue[] = [];
  const suggestions: SEOSuggestion[] = [];
  let passed = 0;

  if (!data.structuredData) {
    suggestions.push({
      priority: "high",
      category: "schema",
      message: "No structured data found",
      impact:
        "Add JSON-LD schema for better search appearance (Product, Offer, Review, etc.)",
    });
    return { issues, suggestions, passed: 0 };
  }

  // Validate schema has @type
  if (!data.structuredData["@type"]) {
    issues.push({
      severity: "critical",
      category: "schema",
      message: "Invalid structured data (missing @type)",
      fix: 'Add @type field (e.g., "Product", "Article", "Organization")',
    });
  } else {
    passed++;
  }

  // Check for required fields based on type
  const schemaType = data.structuredData["@type"];

  if (schemaType === "Product") {
    if (!data.structuredData.name) {
      issues.push({
        severity: "warning",
        category: "schema",
        message: "Product schema missing name",
      });
    } else {
      passed++;
    }

    if (!data.structuredData.offers) {
      suggestions.push({
        priority: "high",
        category: "schema",
        message: "Add offers to Product schema",
        impact: "Shows price and availability in search results",
      });
    } else {
      passed++;
    }

    if (!data.structuredData.aggregateRating && !data.structuredData.review) {
      suggestions.push({
        priority: "medium",
        category: "schema",
        message: "Add reviews to Product schema",
        impact: "Shows star ratings in search results",
      });
    } else {
      passed++;
    }
  }

  return { issues, suggestions, passed };
}

/**
 * Calculate SEO metrics
 */
function calculateMetrics(data: SEOPageData): SEOMetrics {
  const content = data.content || "";

  return {
    meta: {
      hasTitle: !!data.title,
      titleLength: data.title?.length || 0,
      hasDescription: !!data.metaDescription,
      descriptionLength: data.metaDescription?.length || 0,
      hasCanonical: !!data.canonicalUrl,
      hasOgTags: !!data.ogImage,
      hasTwitterCard: !!data.ogImage, // Assumes Twitter card if OG image exists
      hasKeywords: (data.keywords?.length || 0) > 0,
    },
    content: {
      wordCount: countWords(content),
      headingCount: (content.match(/<h[1-6]/gi) || []).length,
      hasH1: /<h1/i.test(content),
      h1Count: (content.match(/<h1/gi) || []).length,
      imageCount: data.images?.length || 0,
      imagesWithAlt:
        data.images?.filter((img) => img.alt && img.alt.trim() !== "").length ||
        0,
      linkCount: data.links?.length || 0,
      internalLinks:
        data.links?.filter(
          (link) => !link.href.startsWith("http") || link.href.includes("one.ie")
        ).length || 0,
      externalLinks:
        data.links?.filter(
          (link) => link.href.startsWith("http") && !link.href.includes("one.ie")
        ).length || 0,
    },
    schema: {
      hasStructuredData: !!data.structuredData,
      schemaTypes: data.structuredData
        ? [data.structuredData["@type"]]
        : [],
      validSchema: !!(
        data.structuredData && data.structuredData["@type"]
      ),
    },
    performance: {
      estimatedLoadTime: estimateLoadTime(data),
      totalPageSize: estimatePageSize(data),
      imageSize: estimateImageSize(data),
      scriptSize: 0, // Would need actual script analysis
    },
  };
}

/**
 * Count words in HTML content
 */
function countWords(html: string): number {
  // Remove HTML tags
  const text = html.replace(/<[^>]*>/g, " ");
  // Remove extra whitespace
  const cleanText = text.replace(/\s+/g, " ").trim();
  // Count words
  return cleanText ? cleanText.split(" ").length : 0;
}

/**
 * Estimate page load time based on content
 */
function estimateLoadTime(data: SEOPageData): number {
  const pageSize = estimatePageSize(data);
  // Assume 5 Mbps connection (typical mobile)
  const bytesPerSecond = (5 * 1024 * 1024) / 8;
  return Math.round((pageSize / bytesPerSecond) * 1000);
}

/**
 * Estimate total page size
 */
function estimatePageSize(data: SEOPageData): number {
  let size = 0;

  // HTML content (rough estimate)
  if (data.content) {
    size += data.content.length;
  }

  // Images (estimate 100KB per image)
  if (data.images) {
    size += data.images.length * 100 * 1024;
  }

  return size;
}

/**
 * Estimate image size
 */
function estimateImageSize(data: SEOPageData): number {
  if (!data.images) return 0;
  // Rough estimate: 100KB per image
  return data.images.length * 100 * 1024;
}

/**
 * Generate AI-powered SEO suggestions
 */
export function generateAISuggestions(data: SEOPageData): SEOSuggestion[] {
  const suggestions: SEOSuggestion[] = [];

  // Title improvements
  if (data.title) {
    if (!data.title.match(/[0-9]/)) {
      suggestions.push({
        priority: "medium",
        category: "meta",
        message: "Add numbers to title for higher CTR",
        impact: "Titles with numbers get 36% more clicks",
      });
    }

    if (!data.title.match(/\?|!|:/)) {
      suggestions.push({
        priority: "low",
        category: "meta",
        message: "Add punctuation for emotional impact",
        impact: "Questions and exclamations increase engagement",
      });
    }
  }

  // Content improvements
  if (data.content) {
    const wordCount = countWords(data.content);

    if (wordCount < 1000) {
      suggestions.push({
        priority: "high",
        category: "content",
        message: "Expand content to 1000+ words",
        impact: "Longer content typically ranks higher in search results",
      });
    }

    // Check for FAQ section
    if (!data.content.toLowerCase().includes("frequently asked")) {
      suggestions.push({
        priority: "medium",
        category: "content",
        message: "Add FAQ section",
        impact: "Helps rank for question-based searches and featured snippets",
      });
    }
  }

  // Schema improvements
  if (data.structuredData?.["@type"] === "Product") {
    if (!data.structuredData.video) {
      suggestions.push({
        priority: "medium",
        category: "schema",
        message: "Add product video to schema",
        impact: "Video results get 41% more clicks than text-only",
      });
    }

    if (!data.structuredData.brand) {
      suggestions.push({
        priority: "low",
        category: "schema",
        message: "Add brand to Product schema",
        impact: "Helps with brand search visibility",
      });
    }
  }

  return suggestions;
}
