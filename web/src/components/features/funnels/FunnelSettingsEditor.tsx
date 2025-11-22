/**
 * FunnelSettingsEditor - Edit funnel metadata and settings
 *
 * Features:
 * - Real-time validation
 * - Auto-save on change
 * - Save status indicator
 * - Tabbed interface (Metadata, Settings, SEO, Tracking, Design)
 */

import { useState, useEffect, useCallback } from "react";
import type { Thing } from "@/components/ontology-ui/types";
import type { FunnelProperties } from "@/lib/schemas/funnel-schema";
import {
  funnelPropertiesSchema,
  generateSlugFromName,
  validateGoogleAnalyticsId,
  validateFacebookPixelId,
} from "@/lib/schemas/funnel-schema";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Check, Loader2, ExternalLink } from "lucide-react";

interface FunnelSettingsEditorProps {
  funnel: Thing & { properties: FunnelProperties };
  onSave?: (data: Partial<FunnelProperties>) => Promise<void>;
  autoSave?: boolean;
  autoSaveDelay?: number; // milliseconds
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function FunnelSettingsEditor({
  funnel,
  onSave,
  autoSave = true,
  autoSaveDelay = 1000,
}: FunnelSettingsEditorProps) {
  const [formData, setFormData] = useState<FunnelProperties>(funnel.properties);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveTimer, setSaveTimer] = useState<NodeJS.Timeout | null>(null);

  // Validate field
  const validateField = useCallback(
    (field: keyof FunnelProperties, value: any): string | null => {
      try {
        const fieldSchema = funnelPropertiesSchema.shape[field];
        if (fieldSchema) {
          fieldSchema.parse(value);
        }

        // Custom validations
        if (field === "googleAnalyticsId" && value && !validateGoogleAnalyticsId(value)) {
          return "Invalid Google Analytics ID format";
        }

        if (field === "facebookPixelId" && value && !validateFacebookPixelId(value)) {
          return "Invalid Facebook Pixel ID format";
        }

        return null;
      } catch (error: any) {
        return error.errors?.[0]?.message || "Invalid value";
      }
    },
    []
  );

  // Handle field change with validation
  const handleFieldChange = useCallback(
    (field: keyof FunnelProperties, value: any) => {
      // Update form data
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Validate field
      const error = validateField(field, value);
      setErrors((prev) => ({
        ...prev,
        [field]: error || "",
      }));

      // Trigger auto-save
      if (autoSave && !error) {
        if (saveTimer) {
          clearTimeout(saveTimer);
        }

        const timer = setTimeout(() => {
          handleSave({ [field]: value });
        }, autoSaveDelay);

        setSaveTimer(timer);
      }
    },
    [autoSave, autoSaveDelay, saveTimer, validateField]
  );

  // Auto-generate slug from name
  const handleNameChange = useCallback(
    (name: string) => {
      handleFieldChange("name", name);

      // Auto-generate slug if it hasn't been manually edited
      if (!formData.slug || formData.slug === generateSlugFromName(funnel.properties.name)) {
        const newSlug = generateSlugFromName(name);
        handleFieldChange("slug", newSlug);
      }
    },
    [formData.slug, funnel.properties.name, handleFieldChange]
  );

  // Save changes
  const handleSave = useCallback(
    async (changes?: Partial<FunnelProperties>) => {
      if (!onSave) return;

      setSaveStatus("saving");

      try {
        await onSave(changes || formData);
        setSaveStatus("saved");

        // Reset to idle after 2 seconds
        setTimeout(() => {
          setSaveStatus("idle");
        }, 2000);
      } catch (error: any) {
        setSaveStatus("error");
        console.error("Save error:", error);
      }
    },
    [formData, onSave]
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimer) {
        clearTimeout(saveTimer);
      }
    };
  }, [saveTimer]);

  // Save status indicator
  const SaveStatusIndicator = () => {
    switch (saveStatus) {
      case "saving":
        return (
          <Badge variant="secondary" className="gap-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            Saving...
          </Badge>
        );
      case "saved":
        return (
          <Badge variant="default" className="gap-2 bg-green-600">
            <Check className="h-3 w-3" />
            Saved
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive" className="gap-2">
            <AlertCircle className="h-3 w-3" />
            Error saving
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with save status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{formData.name}</h2>
          <p className="text-sm text-muted-foreground">
            Edit funnel settings and configuration
          </p>
        </div>
        <SaveStatusIndicator />
      </div>

      {/* Tabbed settings interface */}
      <Tabs defaultValue="metadata" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="tracking">Tracking</TabsTrigger>
          <TabsTrigger value="design">Design</TabsTrigger>
        </TabsList>

        {/* Metadata Tab */}
        <TabsContent value="metadata" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Funnel name, slug, and description
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Funnel Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="My Awesome Funnel"
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">
                  Slug <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleFieldChange("slug", e.target.value)}
                    placeholder="my-awesome-funnel"
                    className={errors.slug ? "border-destructive" : ""}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFieldChange("slug", generateSlugFromName(formData.name))}
                  >
                    Generate
                  </Button>
                </div>
                {errors.slug && (
                  <p className="text-sm text-destructive">{errors.slug}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  URL: /{formData.slug}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => handleFieldChange("description", e.target.value)}
                  placeholder="Describe your funnel..."
                  rows={4}
                  className={errors.description ? "border-destructive" : ""}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formData.description?.length || 0} / 500 characters
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Domain Settings</CardTitle>
              <CardDescription>Configure your funnel's domain</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="domain">Default Domain</Label>
                <Input
                  id="domain"
                  value={formData.domain || ""}
                  onChange={(e) => handleFieldChange("domain", e.target.value)}
                  placeholder="example.com"
                  className={errors.domain ? "border-destructive" : ""}
                />
                {errors.domain && (
                  <p className="text-sm text-destructive">{errors.domain}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customDomain">Custom Domain</Label>
                <Input
                  id="customDomain"
                  value={formData.customDomain || ""}
                  onChange={(e) => handleFieldChange("customDomain", e.target.value)}
                  placeholder="my-funnel.com"
                  className={errors.customDomain ? "border-destructive" : ""}
                />
                {errors.customDomain && (
                  <p className="text-sm text-destructive">{errors.customDomain}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feature Toggles</CardTitle>
              <CardDescription>Enable or disable funnel features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Comments</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow visitors to leave comments
                  </p>
                </div>
                <Switch
                  checked={formData.enableComments || false}
                  onCheckedChange={(checked) => handleFieldChange("enableComments", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Analytics</Label>
                  <p className="text-sm text-muted-foreground">
                    Track visitor analytics
                  </p>
                </div>
                <Switch
                  checked={formData.enableAnalytics ?? true}
                  onCheckedChange={(checked) => handleFieldChange("enableAnalytics", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Visitors must sign in to view
                  </p>
                </div>
                <Switch
                  checked={formData.requireAuth || false}
                  onCheckedChange={(checked) => handleFieldChange("requireAuth", checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
              <CardDescription>Funnel publication status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="status">Publication Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleFieldChange("status", value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                {formData.publishedAt && (
                  <p className="text-sm text-muted-foreground">
                    Published: {new Date(formData.publishedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Engine Optimization</CardTitle>
              <CardDescription>
                Improve your funnel's visibility in search results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle || ""}
                  onChange={(e) => handleFieldChange("metaTitle", e.target.value)}
                  placeholder="Your awesome funnel - Convert visitors"
                  maxLength={60}
                  className={errors.metaTitle ? "border-destructive" : ""}
                />
                {errors.metaTitle && (
                  <p className="text-sm text-destructive">{errors.metaTitle}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formData.metaTitle?.length || 0} / 60 characters (recommended)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription || ""}
                  onChange={(e) => handleFieldChange("metaDescription", e.target.value)}
                  placeholder="A brief description of your funnel for search engines..."
                  rows={3}
                  maxLength={160}
                  className={errors.metaDescription ? "border-destructive" : ""}
                />
                {errors.metaDescription && (
                  <p className="text-sm text-destructive">{errors.metaDescription}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formData.metaDescription?.length || 0} / 160 characters (recommended)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ogImage">Open Graph Image URL</Label>
                <Input
                  id="ogImage"
                  value={formData.ogImage || ""}
                  onChange={(e) => handleFieldChange("ogImage", e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className={errors.ogImage ? "border-destructive" : ""}
                />
                {errors.ogImage && (
                  <p className="text-sm text-destructive">{errors.ogImage}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Image shown when shared on social media (1200x630px recommended)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tracking Tab */}
        <TabsContent value="tracking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics & Tracking</CardTitle>
              <CardDescription>
                Add tracking codes for analytics platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                <Input
                  id="googleAnalyticsId"
                  value={formData.googleAnalyticsId || ""}
                  onChange={(e) => handleFieldChange("googleAnalyticsId", e.target.value)}
                  placeholder="G-XXXXXXXXXX or UA-XXXXXXXX-X"
                  className={errors.googleAnalyticsId ? "border-destructive" : ""}
                />
                {errors.googleAnalyticsId && (
                  <p className="text-sm text-destructive">{errors.googleAnalyticsId}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Find your tracking ID in Google Analytics
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="facebookPixelId">Facebook Pixel ID</Label>
                <Input
                  id="facebookPixelId"
                  value={formData.facebookPixelId || ""}
                  onChange={(e) => handleFieldChange("facebookPixelId", e.target.value)}
                  placeholder="123456789012345"
                  className={errors.facebookPixelId ? "border-destructive" : ""}
                />
                {errors.facebookPixelId && (
                  <p className="text-sm text-destructive">{errors.facebookPixelId}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  15-16 digit numeric ID from Facebook Events Manager
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customHeadCode">Custom Head Code</Label>
                <Textarea
                  id="customHeadCode"
                  value={formData.customHeadCode || ""}
                  onChange={(e) => handleFieldChange("customHeadCode", e.target.value)}
                  placeholder="<script>/* Your custom code */</script>"
                  rows={6}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Code injected into the &lt;head&gt; section
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customBodyCode">Custom Body Code</Label>
                <Textarea
                  id="customBodyCode"
                  value={formData.customBodyCode || ""}
                  onChange={(e) => handleFieldChange("customBodyCode", e.target.value)}
                  placeholder="<script>/* Your custom code */</script>"
                  rows={6}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Code injected at the end of &lt;body&gt; section
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Design Tab */}
        <TabsContent value="design" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize your funnel's visual design
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={formData.theme || "light"}
                  onValueChange={(value) => handleFieldChange("theme", value)}
                >
                  <SelectTrigger id="theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto (System)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={formData.primaryColor || "#000000"}
                    onChange={(e) => handleFieldChange("primaryColor", e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    value={formData.primaryColor || "#000000"}
                    onChange={(e) => handleFieldChange("primaryColor", e.target.value)}
                    placeholder="#000000"
                    className={errors.primaryColor ? "border-destructive" : ""}
                  />
                </div>
                {errors.primaryColor && (
                  <p className="text-sm text-destructive">{errors.primaryColor}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={formData.secondaryColor || "#666666"}
                    onChange={(e) => handleFieldChange("secondaryColor", e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    value={formData.secondaryColor || "#666666"}
                    onChange={(e) => handleFieldChange("secondaryColor", e.target.value)}
                    placeholder="#666666"
                    className={errors.secondaryColor ? "border-destructive" : ""}
                  />
                </div>
                {errors.secondaryColor && (
                  <p className="text-sm text-destructive">{errors.secondaryColor}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Manual save button (if auto-save disabled) */}
      {!autoSave && (
        <div className="flex justify-end">
          <Button onClick={() => handleSave()} disabled={saveStatus === "saving"}>
            {saveStatus === "saving" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
