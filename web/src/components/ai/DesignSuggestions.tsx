/**
 * Design Suggestions Component
 *
 * Displays AI-powered design suggestions with auto-fix capabilities.
 *
 * Part of Cycle 46: Add AI Design Suggestion System
 */

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertCircle,
  AlertTriangle,
  Lightbulb,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  analyzeFunnelPage,
  getAIResponse,
  getSuggestionsByCategory,
  getPrioritySuggestions,
  autoFixIssues,
  createMockFunnelPage,
  type DesignAnalysis,
  type DesignSuggestion,
  type FunnelPage,
} from "@/lib/ai/design-analyzer";
import type { DesignRuleCategory } from "@/lib/ai/design-rules";

interface DesignSuggestionsProps {
  funnelPage?: FunnelPage;
  onApplyFix?: (fixedPage: FunnelPage) => void;
}

export function DesignSuggestions({
  funnelPage,
  onApplyFix,
}: DesignSuggestionsProps) {
  const [analysis, setAnalysis] = useState<DesignAnalysis | null>(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(
    new Set()
  );
  const [isFixing, setIsFixing] = useState(false);
  const [showByCategory, setShowByCategory] = useState(false);

  // Analyze funnel page on mount
  useEffect(() => {
    const page = funnelPage || createMockFunnelPage();
    const result = analyzeFunnelPage(page);
    setAnalysis(result);
  }, [funnelPage]);

  if (!analysis) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-pulse">Analyzing design...</div>
        </CardContent>
      </Card>
    );
  }

  const prioritySuggestions = getPrioritySuggestions(analysis);
  const suggestionsByCategory = getSuggestionsByCategory(analysis);

  const handleToggleSuggestion = (id: string) => {
    const newSelected = new Set(selectedSuggestions);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedSuggestions(newSelected);
  };

  const handleApplyFixes = async () => {
    setIsFixing(true);
    try {
      const page = funnelPage || createMockFunnelPage();
      const fixedPage = await autoFixIssues(page, Array.from(selectedSuggestions));
      onApplyFix?.(fixedPage);

      // Re-analyze after fixes
      const newAnalysis = analyzeFunnelPage(fixedPage);
      setAnalysis(newAnalysis);
      setSelectedSuggestions(new Set());
    } catch (error) {
      console.error("Failed to apply fixes:", error);
    } finally {
      setIsFixing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Needs Work";
    return "Critical";
  };

  return (
    <div className="space-y-4">
      {/* Score Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Design Analysis
              </CardTitle>
              <CardDescription>
                AI-powered suggestions to improve conversions
              </CardDescription>
            </div>
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(analysis.score)}`}>
                {analysis.score}
              </div>
              <div className="text-sm text-muted-foreground">
                {getScoreLabel(analysis.score)}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Score breakdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                Critical Issues
              </span>
              <Badge variant="destructive">
                {analysis.issues.filter((i) => i.severity === "critical").length}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                Warnings
              </span>
              <Badge variant="outline">
                {analysis.issues.filter((i) => i.severity === "warning").length}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-blue-500" />
                Optimization Tips
              </span>
              <Badge variant="secondary">
                {analysis.issues.filter((i) => i.severity === "tip").length}
              </Badge>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Auto-fix button */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {selectedSuggestions.size} fixes selected
            </div>
            <Button
              onClick={handleApplyFixes}
              disabled={selectedSuggestions.size === 0 || isFixing}
              size="sm"
            >
              {isFixing ? "Applying..." : "Apply Selected Fixes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* View toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Suggestions</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowByCategory(!showByCategory)}
        >
          {showByCategory ? "Show Priority" : "Show by Category"}
        </Button>
      </div>

      {/* Priority view */}
      {!showByCategory && (
        <div className="space-y-3">
          {prioritySuggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              selected={selectedSuggestions.has(suggestion.id)}
              onToggle={handleToggleSuggestion}
            />
          ))}
        </div>
      )}

      {/* Category view */}
      {showByCategory && (
        <div className="space-y-3">
          {Object.entries(suggestionsByCategory).map(([category, suggestions]) => (
            <CategoryCard
              key={category}
              category={category as DesignRuleCategory}
              suggestions={suggestions}
              selectedSuggestions={selectedSuggestions}
              onToggle={handleToggleSuggestion}
            />
          ))}
        </div>
      )}

      {/* Benchmarks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Benchmarks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {analysis.benchmarks.map((benchmark, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{benchmark.category}</div>
                <div className="text-xs text-muted-foreground">
                  Current: {benchmark.current} → Target: {benchmark.target}
                </div>
              </div>
              <Badge
                variant={
                  benchmark.status === "excellent"
                    ? "default"
                    : benchmark.status === "good"
                      ? "secondary"
                      : "destructive"
                }
              >
                {benchmark.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* AI Conversation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap rounded-lg bg-muted/50 p-4 text-sm">
            {getAIResponse(
              analysis,
              funnelPage?.name || "Product Launch Funnel"
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Individual Suggestion Card
 */
interface SuggestionCardProps {
  suggestion: DesignSuggestion;
  selected: boolean;
  onToggle: (id: string) => void;
}

function SuggestionCard({ suggestion, selected, onToggle }: SuggestionCardProps) {
  const getIcon = () => {
    switch (suggestion.type) {
      case "critical":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "tip":
        return <Lightbulb className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBadgeVariant = () => {
    switch (suggestion.type) {
      case "critical":
        return "destructive";
      case "warning":
        return "outline";
      case "tip":
        return "secondary";
    }
  };

  return (
    <Card
      className={`cursor-pointer transition-colors ${
        selected ? "ring-2 ring-primary" : ""
      }`}
      onClick={() => suggestion.autoFixable && onToggle(suggestion.id)}
    >
      <CardContent className="flex items-start gap-3 p-4">
        {getIcon()}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <Badge variant={getBadgeVariant()} className="mb-2">
                {suggestion.category}
              </Badge>
              <p className="text-sm">{suggestion.message}</p>
            </div>
            {suggestion.autoFixable && (
              <div className="flex items-center gap-2">
                {selected && <CheckCircle2 className="h-5 w-5 text-primary" />}
                <Badge variant="outline" className="text-xs">
                  Auto-fix
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Category Card (Collapsible)
 */
interface CategoryCardProps {
  category: DesignRuleCategory;
  suggestions: DesignSuggestion[];
  selectedSuggestions: Set<string>;
  onToggle: (id: string) => void;
}

function CategoryCard({
  category,
  suggestions,
  selectedSuggestions,
  onToggle,
}: CategoryCardProps) {
  const [isOpen, setIsOpen] = useState(true);

  const categoryLabels: Record<DesignRuleCategory, string> = {
    layout: "Layout",
    color: "Colors & Contrast",
    copy: "Copy & Messaging",
    conversion: "Conversion Optimization",
    images: "Images & Media",
    forms: "Forms",
    "social-proof": "Social Proof",
    performance: "Performance",
  };

  const criticalCount = suggestions.filter((s) => s.type === "critical").length;

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-accent/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle className="text-base">
                  {categoryLabels[category]}
                </CardTitle>
                <Badge variant="outline">{suggestions.length}</Badge>
                {criticalCount > 0 && (
                  <Badge variant="destructive">{criticalCount} critical</Badge>
                )}
              </div>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-2 pt-0">
            {suggestions.map((suggestion) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                selected={selectedSuggestions.has(suggestion.id)}
                onToggle={onToggle}
              />
            ))}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
