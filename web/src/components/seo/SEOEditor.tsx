/**
 * SEOEditor - Comprehensive SEO editor with analyzer and suggestions
 *
 * Features:
 * - Meta tags editor (title, description, keywords, OG image)
 * - Schema.org structured data editor
 * - SEO score analyzer (0-100)
 * - AI-powered suggestions
 * - Real-time validation
 * - Preview how page appears in Google/social media
 */

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Lightbulb,
  Search,
  Share2,
  Code,
  TrendingUp,
} from "lucide-react";
import {
  analyzeSEO,
  generateAISuggestions,
  type SEOPageData,
  type SEOAnalysisResult,
  type SEOIssue,
  type SEOSuggestion,
} from "@/lib/seo/seo-analyzer";
import {
  generateProductSchema,
  generateOrganizationSchema,
  generateFAQSchema,
  schemaToScriptTag,
  validateSchema,
  type ProductSchemaData,
  type OrganizationSchemaData,
  type FAQSchemaData,
} from "@/lib/seo/schema-generator";

interface SEOEditorProps {
  initialData?: SEOPageData;
  onChange?: (data: SEOPageData) => void;
  showAnalyzer?: boolean;
  showPreview?: boolean;
}

export function SEOEditor({
  initialData = {},
  onChange,
  showAnalyzer = true,
  showPreview = true,
}: SEOEditorProps) {
  const [data, setData] = useState<SEOPageData>(initialData);
  const [analysis, setAnalysis] = useState<SEOAnalysisResult | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<SEOSuggestion[]>([]);
  const [schemaType, setSchemaType] = useState<
    "Product" | "Organization" | "FAQ" | "None"
  >("None");

  // Update parent when data changes
  useEffect(() => {
    onChange?.(data);

    // Re-analyze when data changes
    if (showAnalyzer) {
      const result = analyzeSEO(data);
      setAnalysis(result);

      const suggestions = generateAISuggestions(data);
      setAiSuggestions(suggestions);
    }
  }, [data, onChange, showAnalyzer]);

  const handleFieldChange = (field: keyof SEOPageData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleKeywordsChange = (value: string) => {
    const keywords = value.split(",").map((k) => k.trim()).filter(Boolean);
    handleFieldChange("keywords", keywords);
  };

  // Generate schema based on type
  const generateSchema = () => {
    if (schemaType === "None") return;

    let schema: any;

    if (schemaType === "Product") {
      const productData: ProductSchemaData = {
        name: data.title || "",
        description: data.metaDescription || "",
        image: data.ogImage,
        price: 0, // User should fill this
        currency: "USD",
        availability: "InStock",
      };
      schema = generateProductSchema(productData);
    } else if (schemaType === "Organization") {
      const orgData: OrganizationSchemaData = {
        name: "Your Organization",
        url: data.canonicalUrl || "",
        logo: data.ogImage || "",
      };
      schema = generateOrganizationSchema(orgData);
    } else if (schemaType === "FAQ") {
      const faqData: FAQSchemaData = {
        questions: [
          { question: "Example question?", answer: "Example answer" },
        ],
      };
      schema = generateFAQSchema(faqData);
    }

    handleFieldChange("structuredData", schema);
  };

  const severityIcon = (severity: SEOIssue["severity"]) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case "warning":
        return <Info className="h-4 w-4 text-yellow-600" />;
      case "info":
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-destructive";
  };

  return (
    <div className="space-y-6">
      {/* SEO Score Overview */}
      {showAnalyzer && analysis && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  SEO Score
                </CardTitle>
                <CardDescription>
                  Overall SEO quality of your page
                </CardDescription>
              </div>
              <div className="text-right">
                <div className={`text-4xl font-bold ${scoreColor(analysis.score)}`}>
                  {analysis.score}
                </div>
                <div className="text-sm text-muted-foreground">
                  {analysis.passed} / {analysis.total} checks passed
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={analysis.score} className="h-2" />

            {/* Quick stats */}
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {analysis.issues.filter((i) => i.severity === "info").length}
                </div>
                <div className="text-xs text-muted-foreground">Passed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {analysis.issues.filter((i) => i.severity === "warning").length}
                </div>
                <div className="text-xs text-muted-foreground">Warnings</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-destructive">
                  {analysis.issues.filter((i) => i.severity === "critical").length}
                </div>
                <div className="text-xs text-muted-foreground">Critical</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main SEO Editor */}
      <Tabs defaultValue="meta" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="meta">Meta Tags</TabsTrigger>
          <TabsTrigger value="schema">Schema.org</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
        </TabsList>

        {/* Meta Tags Tab */}
        <TabsContent value="meta" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Engine Meta Tags
              </CardTitle>
              <CardDescription>
                Title and description shown in Google search results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seo-title">
                  Page Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="seo-title"
                  value={data.title || ""}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  placeholder="My Awesome Product - Buy Now"
                  maxLength={60}
                />
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    Optimal: 50-60 characters
                  </span>
                  <span
                    className={
                      (data.title?.length || 0) > 60
                        ? "text-destructive"
                        : "text-muted-foreground"
                    }
                  >
                    {data.title?.length || 0} / 60
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo-description">
                  Meta Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="seo-description"
                  value={data.metaDescription || ""}
                  onChange={(e) =>
                    handleFieldChange("metaDescription", e.target.value)
                  }
                  placeholder="A compelling description of your page for search results..."
                  rows={3}
                  maxLength={160}
                />
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    Optimal: 150-160 characters
                  </span>
                  <span
                    className={
                      (data.metaDescription?.length || 0) > 160
                        ? "text-destructive"
                        : "text-muted-foreground"
                    }
                  >
                    {data.metaDescription?.length || 0} / 160
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo-keywords">Keywords (comma-separated)</Label>
                <Input
                  id="seo-keywords"
                  value={data.keywords?.join(", ") || ""}
                  onChange={(e) => handleKeywordsChange(e.target.value)}
                  placeholder="product, buy, shop, online"
                />
                <p className="text-xs text-muted-foreground">
                  {data.keywords?.length || 0} keywords
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo-canonical">Canonical URL</Label>
                <Input
                  id="seo-canonical"
                  value={data.canonicalUrl || ""}
                  onChange={(e) =>
                    handleFieldChange("canonicalUrl", e.target.value)
                  }
                  placeholder="https://example.com/page"
                />
                <p className="text-xs text-muted-foreground">
                  Prevents duplicate content issues
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Social Media Tags
              </CardTitle>
              <CardDescription>
                How your page appears when shared on social media
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seo-og-image">Open Graph Image URL</Label>
                <Input
                  id="seo-og-image"
                  value={data.ogImage || ""}
                  onChange={(e) => handleFieldChange("ogImage", e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-muted-foreground">
                  Recommended: 1200x630px (Twitter, Facebook, LinkedIn)
                </p>
              </div>

              {data.ogImage && (
                <div className="border rounded-lg overflow-hidden">
                  <img
                    src={data.ogImage}
                    alt="OG preview"
                    className="w-full h-auto max-h-64 object-cover"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schema.org Tab */}
        <TabsContent value="schema" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Structured Data (Schema.org)
              </CardTitle>
              <CardDescription>
                Add structured data for better search appearance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="schema-type">Schema Type</Label>
                <Select
                  value={schemaType}
                  onValueChange={(value: any) => setSchemaType(value)}
                >
                  <SelectTrigger id="schema-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="Product">Product</SelectItem>
                    <SelectItem value="Organization">Organization</SelectItem>
                    <SelectItem value="FAQ">FAQ</SelectItem>
                  </SelectContent>
                </Select>
                {schemaType !== "None" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateSchema}
                    className="w-full"
                  >
                    Generate {schemaType} Schema
                  </Button>
                )}
              </div>

              {data.structuredData && (
                <div className="space-y-2">
                  <Label>Generated Schema (JSON-LD)</Label>
                  <Textarea
                    value={JSON.stringify(data.structuredData, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        handleFieldChange("structuredData", parsed);
                      } catch (error) {
                        // Invalid JSON, don't update
                      }
                    }}
                    rows={12}
                    className="font-mono text-xs"
                  />

                  {/* Validation */}
                  {(() => {
                    const validation = validateSchema(data.structuredData);
                    return (
                      <div>
                        {validation.valid ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Valid schema
                          </Badge>
                        ) : (
                          <div className="space-y-1">
                            <Badge variant="destructive" className="gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Invalid schema
                            </Badge>
                            {validation.errors.map((error, i) => (
                              <p key={i} className="text-xs text-destructive">
                                • {error}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  <div className="space-y-2">
                    <Label>HTML Script Tag</Label>
                    <Textarea
                      value={schemaToScriptTag(data.structuredData)}
                      readOnly
                      rows={6}
                      className="font-mono text-xs bg-muted"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          schemaToScriptTag(data.structuredData!)
                        );
                      }}
                    >
                      Copy to Clipboard
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Issues Tab */}
        <TabsContent value="issues" className="space-y-4">
          {analysis && (
            <Card>
              <CardHeader>
                <CardTitle>SEO Issues</CardTitle>
                <CardDescription>
                  {analysis.issues.length} issues found
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analysis.issues.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-600" />
                    <p>No SEO issues found! Great job!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {analysis.issues.map((issue, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 border rounded-lg"
                      >
                        {severityIcon(issue.severity)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm">
                              {issue.message}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {issue.category}
                            </Badge>
                          </div>
                          {issue.fix && (
                            <p className="text-xs text-muted-foreground">
                              Fix: {issue.fix}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Suggestions Tab */}
        <TabsContent value="suggestions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                AI-Powered Suggestions
              </CardTitle>
              <CardDescription>
                Recommendations to improve your SEO
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysis && (
                <div className="space-y-3">
                  {[...analysis.suggestions, ...aiSuggestions].map(
                    (suggestion, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 border rounded-lg"
                      >
                        <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm">
                              {suggestion.message}
                            </p>
                            <Badge
                              variant={
                                suggestion.priority === "high"
                                  ? "destructive"
                                  : suggestion.priority === "medium"
                                    ? "default"
                                    : "secondary"
                              }
                              className="text-xs"
                            >
                              {suggestion.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {suggestion.category}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Impact: {suggestion.impact}
                          </p>
                        </div>
                      </div>
                    )
                  )}

                  {[...analysis.suggestions, ...aiSuggestions].length ===
                    0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-600" />
                      <p>No suggestions at this time. Looking good!</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview */}
          {showPreview && (
            <Card>
              <CardHeader>
                <CardTitle>Search Preview</CardTitle>
                <CardDescription>
                  How your page appears in Google search results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-white dark:bg-slate-950">
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    {data.canonicalUrl || "https://example.com/page"}
                  </div>
                  <div className="text-xl text-blue-800 dark:text-blue-300 mt-1 font-medium">
                    {data.title || "Your Page Title"}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {data.metaDescription || "Your meta description appears here"}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
