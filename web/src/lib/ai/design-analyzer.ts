/**
 * AI Design Analyzer
 *
 * Analyzes funnel designs and provides actionable suggestions
 * based on conversion optimization best practices.
 *
 * Part of Cycle 46: Add AI Design Suggestion System
 */

import {
  allRules,
  rulePresets,
  industryBenchmarks,
  type DesignRule,
  type DesignRuleCategory,
  type DesignRuleSeverity,
} from "./design-rules";

/**
 * Design Issue
 */
export interface DesignIssue {
  id: string;
  ruleId: string;
  category: DesignRuleCategory;
  severity: DesignRuleSeverity;
  message: string;
  element?: string;
  location?: string;
}

/**
 * Design Suggestion
 */
export interface DesignSuggestion {
  id: string;
  type: "critical" | "warning" | "tip";
  category: DesignRuleCategory;
  message: string;
  fix?: () => Promise<void>;
  autoFixable: boolean;
}

/**
 * Design Analysis Result
 */
export interface DesignAnalysis {
  score: number; // 0-100
  issues: DesignIssue[];
  suggestions: DesignSuggestion[];
  improvements: string[];
  benchmarks: {
    category: string;
    current: number | string;
    target: number | string;
    status: "excellent" | "good" | "poor";
  }[];
}

/**
 * Funnel Element (simplified structure for analysis)
 */
export interface FunnelElement {
  type:
    | "headline"
    | "button"
    | "form"
    | "image"
    | "text"
    | "testimonial"
    | "badge";
  text?: string;
  fontSize?: string;
  color?: string;
  backgroundColor?: string;
  position?: { x: number; y: number };
  padding?: string;
  margin?: string;
  contrastRatio?: number;
  standout?: boolean;
  responsive?: boolean;
  imageQuality?: "low" | "medium" | "high";
  alt?: string;
  fields?: Array<{ name: string; required: boolean }>;
  buttonSize?: "small" | "medium" | "large";
  buttonHeight?: string;
}

/**
 * Funnel Page (for analysis)
 */
export interface FunnelPage {
  id: string;
  name: string;
  type: "landing-page" | "sales-page" | "lead-capture" | "checkout";
  elements: FunnelElement[];
  metadata?: {
    hasHeroImage?: boolean;
    hasTestimonials?: boolean;
    hasTrustBadges?: boolean;
    hasUrgency?: boolean;
    hasValueProposition?: boolean;
    conversionSteps?: number;
    loadTime?: number;
    mobileLoadTime?: number;
  };
}

/**
 * Analyze Funnel Page
 */
export function analyzeFunnelPage(page: FunnelPage): DesignAnalysis {
  const rules = rulePresets[page.type] || allRules;
  const issues: DesignIssue[] = [];
  const suggestions: DesignSuggestion[] = [];
  const improvements: string[] = [];

  // Analyze each rule
  for (const rule of rules) {
    // Check page-level rules
    if (!rule.check({}, page.metadata)) {
      issues.push({
        id: `issue-${rule.id}`,
        ruleId: rule.id,
        category: rule.category,
        severity: rule.severity,
        message: rule.suggestion,
      });

      suggestions.push({
        id: `suggestion-${rule.id}`,
        type: rule.severity,
        category: rule.category,
        message: rule.suggestion,
        autoFixable: !!rule.autoFix,
      });
    }

    // Check element-level rules
    for (const element of page.elements) {
      if (!rule.check(element, page.metadata)) {
        issues.push({
          id: `issue-${rule.id}-${element.type}`,
          ruleId: rule.id,
          category: rule.category,
          severity: rule.severity,
          message: rule.suggestion,
          element: element.type,
        });

        // Avoid duplicate suggestions
        const exists = suggestions.some((s) => s.id === `suggestion-${rule.id}`);
        if (!exists) {
          suggestions.push({
            id: `suggestion-${rule.id}`,
            type: rule.severity,
            category: rule.category,
            message: rule.suggestion,
            autoFixable: !!rule.autoFix,
          });
        }
      }
    }
  }

  // Generate improvement recommendations
  if (issues.length > 0) {
    improvements.push(
      `Fix ${issues.filter((i) => i.severity === "critical").length} critical issues`
    );
    improvements.push(
      `Address ${issues.filter((i) => i.severity === "warning").length} warnings`
    );
    improvements.push(
      `Consider ${issues.filter((i) => i.severity === "tip").length} optimization tips`
    );
  }

  // Calculate benchmarks
  const benchmarks = calculateBenchmarks(page);

  // Calculate score (0-100)
  const score = calculateScore(issues, benchmarks);

  return {
    score,
    issues,
    suggestions,
    improvements,
    benchmarks,
  };
}

/**
 * Calculate Design Score (0-100)
 */
function calculateScore(
  issues: DesignIssue[],
  benchmarks: DesignAnalysis["benchmarks"]
): number {
  let score = 100;

  // Deduct points for issues
  for (const issue of issues) {
    if (issue.severity === "critical") {
      score -= 15;
    } else if (issue.severity === "warning") {
      score -= 8;
    } else if (issue.severity === "tip") {
      score -= 3;
    }
  }

  // Adjust based on benchmarks
  const excellentCount = benchmarks.filter((b) => b.status === "excellent").length;
  const poorCount = benchmarks.filter((b) => b.status === "poor").length;

  score += excellentCount * 5;
  score -= poorCount * 10;

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate Benchmarks
 */
function calculateBenchmarks(
  page: FunnelPage
): DesignAnalysis["benchmarks"] {
  const benchmarks: DesignAnalysis["benchmarks"] = [];

  // Headline size benchmark
  const headline = page.elements.find((e) => e.type === "headline");
  if (headline) {
    const size = parseInt(headline.fontSize || "0", 10);
    benchmarks.push({
      category: "Headline Size",
      current: `${size}px`,
      target: `${industryBenchmarks.headlineSize.optimal}px`,
      status:
        size >= industryBenchmarks.headlineSize.optimal
          ? "excellent"
          : size >= industryBenchmarks.headlineSize.minimum
            ? "good"
            : "poor",
    });
  }

  // Form fields benchmark
  const form = page.elements.find((e) => e.type === "form");
  if (form) {
    const fieldCount = form.fields?.length || 0;
    benchmarks.push({
      category: "Form Fields",
      current: fieldCount,
      target: industryBenchmarks.formFields.optimal,
      status:
        fieldCount <= industryBenchmarks.formFields.optimal
          ? "excellent"
          : fieldCount <= industryBenchmarks.formFields.maximum
            ? "good"
            : "poor",
    });
  }

  // Page load time benchmark
  if (page.metadata?.loadTime) {
    benchmarks.push({
      category: "Load Time",
      current: `${page.metadata.loadTime}ms`,
      target: `${industryBenchmarks.pageLoadTime.excellent}ms`,
      status:
        page.metadata.loadTime <= industryBenchmarks.pageLoadTime.excellent
          ? "excellent"
          : page.metadata.loadTime <= industryBenchmarks.pageLoadTime.good
            ? "good"
            : "poor",
    });
  }

  // Conversion elements benchmark
  const hasTestimonials = page.metadata?.hasTestimonials || false;
  const hasUrgency = page.metadata?.hasUrgency || false;
  const hasCTA = page.elements.some((e) => e.type === "button");

  const conversionScore =
    (hasTestimonials ? 1 : 0) + (hasUrgency ? 1 : 0) + (hasCTA ? 1 : 0);

  benchmarks.push({
    category: "Conversion Elements",
    current: `${conversionScore}/3`,
    target: "3/3",
    status:
      conversionScore === 3 ? "excellent" : conversionScore >= 2 ? "good" : "poor",
  });

  return benchmarks;
}

/**
 * Get AI Conversation Response
 *
 * Formats analysis as natural AI conversation
 */
export function getAIResponse(analysis: DesignAnalysis, pageName: string): string {
  const { score, suggestions, improvements } = analysis;

  let response = `I've analyzed your funnel page "${pageName}" (score: ${score}/100).\n\n`;

  if (score >= 90) {
    response += `Excellent! Your design follows best practices. `;
  } else if (score >= 70) {
    response += `Good work! Here are some ways to improve:\n\n`;
  } else if (score >= 50) {
    response += `Your funnel has potential, but needs improvements:\n\n`;
  } else {
    response += `Let's improve this funnel. Here are critical issues:\n\n`;
  }

  // Group suggestions by severity
  const critical = suggestions.filter((s) => s.type === "critical");
  const warnings = suggestions.filter((s) => s.type === "warning");
  const tips = suggestions.filter((s) => s.type === "tip");

  let count = 1;

  if (critical.length > 0) {
    response += `CRITICAL ISSUES:\n`;
    for (const s of critical.slice(0, 3)) {
      response += `${count}. 🔴 ${s.message}\n`;
      count++;
    }
    response += `\n`;
  }

  if (warnings.length > 0) {
    response += `WARNINGS:\n`;
    for (const s of warnings.slice(0, 3)) {
      response += `${count}. 🟡 ${s.message}\n`;
      count++;
    }
    response += `\n`;
  }

  if (tips.length > 0 && count <= 5) {
    response += `OPTIMIZATION TIPS:\n`;
    for (const s of tips.slice(0, Math.min(3, 6 - count))) {
      response += `${count}. 💡 ${s.message}\n`;
      count++;
    }
    response += `\n`;
  }

  response += `Would you like me to:\n`;
  response += `1. Auto-fix issues (${suggestions.filter((s) => s.autoFixable).length} fixable)\n`;
  response += `2. Show detailed breakdown by category\n`;
  response += `3. Compare to industry benchmarks\n`;
  response += `4. Implement any specific suggestion`;

  return response;
}

/**
 * Auto-fix Issues
 *
 * Applies automatic fixes where available
 */
export async function autoFixIssues(
  page: FunnelPage,
  suggestionIds: string[]
): Promise<FunnelPage> {
  const rules = rulePresets[page.type] || allRules;
  const fixedPage = { ...page, elements: [...page.elements] };

  for (const suggestionId of suggestionIds) {
    const ruleId = suggestionId.replace("suggestion-", "");
    const rule = rules.find((r) => r.id === ruleId);

    if (rule && rule.autoFix) {
      for (let i = 0; i < fixedPage.elements.length; i++) {
        const element = fixedPage.elements[i];
        if (!rule.check(element, page.metadata)) {
          fixedPage.elements[i] = rule.autoFix(element);
        }
      }
    }
  }

  return fixedPage;
}

/**
 * Get Suggestions by Category
 */
export function getSuggestionsByCategory(
  analysis: DesignAnalysis
): Record<DesignRuleCategory, DesignSuggestion[]> {
  const grouped: Record<string, DesignSuggestion[]> = {};

  for (const suggestion of analysis.suggestions) {
    if (!grouped[suggestion.category]) {
      grouped[suggestion.category] = [];
    }
    grouped[suggestion.category].push(suggestion);
  }

  return grouped as Record<DesignRuleCategory, DesignSuggestion[]>;
}

/**
 * Get Priority Suggestions (top 5)
 */
export function getPrioritySuggestions(
  analysis: DesignAnalysis
): DesignSuggestion[] {
  const sorted = [...analysis.suggestions].sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, tip: 2 };
    return severityOrder[a.type] - severityOrder[b.type];
  });

  return sorted.slice(0, 5);
}

/**
 * Mock Funnel Page for Testing
 */
export function createMockFunnelPage(): FunnelPage {
  return {
    id: "funnel-1",
    name: "Product Launch Funnel",
    type: "sales-page",
    elements: [
      {
        type: "headline",
        text: "Welcome",
        fontSize: "24px", // Too small
        color: "#333",
        position: { x: 0, y: 100 },
      },
      {
        type: "button",
        text: "Submit", // Weak CTA
        backgroundColor: "#cccccc", // Low contrast
        color: "#999999",
        standout: false,
        position: { x: 0, y: 1200 }, // Below fold
      },
      {
        type: "form",
        fields: [
          { name: "firstName", required: true },
          { name: "lastName", required: true },
          { name: "email", required: true },
          { name: "phone", required: true },
          { name: "company", required: true },
          { name: "role", required: true },
          { name: "employees", required: true },
        ], // Too many fields
        buttonSize: "small",
      },
      {
        type: "image",
        imageQuality: "low",
        alt: "", // Missing alt text
      },
    ],
    metadata: {
      hasHeroImage: false,
      hasTestimonials: false,
      hasTrustBadges: false,
      hasUrgency: false,
      hasValueProposition: false,
      conversionSteps: 5,
      loadTime: 4500, // Slow
    },
  };
}
