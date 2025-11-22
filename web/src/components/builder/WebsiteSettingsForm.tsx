"use client";

import * as React from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  Copy,
  Check,
  Globe,
  Settings,
  BarChart3,
  Code,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WebsiteSettings {
  name: string;
  domain: string;
  customDomain?: string;
  title: string;
  description: string;
  faviconUrl?: string;
  plausibleDomain?: string;
  googleAnalyticsId?: string;
  environment: "development" | "production";
  environmentVariables?: Record<string, string>;
}

interface WebsiteSettingsFormProps {
  websiteId: string;
}

export function WebsiteSettingsForm({ websiteId }: WebsiteSettingsFormProps) {
  const [settings, setSettings] = React.useState<WebsiteSettings>({
    name: websiteId,
    domain: `${websiteId}.pages.dev`,
    title: "My Website",
    description: "Welcome to my website",
    environment: "development",
  });

  const [isSaving, setIsSaving] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [copiedField, setCopiedField] = React.useState<string | null>(null);
  const [envVars, setEnvVars] = React.useState<Record<string, string>>({});

  // Fetch existing website settings
  const existingSettings = useQuery(api.queries.websites.getWebsiteSettings, {
    websiteId,
  });

  const saveWebsiteSettings = useMutation(api.mutations.ai_website_builder.saveWebsiteSettings);

  // Load existing settings when they're fetched
  React.useEffect(() => {
    if (existingSettings) {
      setSettings({
        name: existingSettings.websiteId || websiteId,
        domain: existingSettings.domain || `${websiteId}.pages.dev`,
        customDomain: existingSettings.customDomain,
        title: existingSettings.title || "My Website",
        description: existingSettings.description || "",
        faviconUrl: existingSettings.faviconUrl,
        plausibleDomain: existingSettings.plausibleDomain,
        googleAnalyticsId: existingSettings.googleAnalyticsId,
        environment: existingSettings.environment || "development",
      });

      if (existingSettings.environmentVariables) {
        setEnvVars(existingSettings.environmentVariables);
      }
    }
  }, [existingSettings, websiteId]);

  const handleInputChange = (
    field: keyof WebsiteSettings,
    value: string
  ) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
  };

  const handleEnvVarChange = (key: string, value: string) => {
    setEnvVars((prev) => ({ ...prev, [key]: value }));
  };

  const addEnvVar = () => {
    setEnvVars((prev) => ({ ...prev, [`NEW_VAR_${Date.now()}`]: "" }));
  };

  const removeEnvVar = (key: string) => {
    setEnvVars((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      await saveWebsiteSettings({
        websiteId,
        title: settings.title,
        description: settings.description,
        customDomain: settings.customDomain,
        faviconUrl: settings.faviconUrl,
        plausibleDomain: settings.plausibleDomain,
        googleAnalyticsId: settings.googleAnalyticsId,
        environment: settings.environment,
        environmentVariables: envVars,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save settings");
      console.error("Error saving settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (existingSettings === undefined) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-2">
                <p className="text-muted-foreground">Loading settings...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {saveSuccess && (
        <Alert className="border-green-500 bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Website settings saved successfully!
          </AlertDescription>
        </Alert>
      )}

      {saveError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="metadata" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Metadata</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="env" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            <span className="hidden sm:inline">Environment</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Domain Configuration</CardTitle>
              <CardDescription>
                Manage your website domain and custom domain settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Website Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Website Name</Label>
                <Input
                  id="name"
                  value={settings.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="my-website"
                  disabled
                />
                <p className="text-xs text-muted-foreground">
                  This is your website identifier and cannot be changed
                </p>
              </div>

              {/* Default Domain */}
              <div className="space-y-2">
                <Label htmlFor="domain">Pages.dev Domain</Label>
                <div className="flex gap-2">
                  <Input
                    id="domain"
                    value={settings.domain}
                    disabled
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(settings.domain, "domain")
                    }
                  >
                    {copiedField === "domain" ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your default website URL. This is always available.
                </p>
              </div>

              {/* Custom Domain */}
              <div className="space-y-2">
                <Label htmlFor="customDomain">Custom Domain (Optional)</Label>
                <Input
                  id="customDomain"
                  type="text"
                  value={settings.customDomain || ""}
                  onChange={(e) =>
                    handleInputChange("customDomain", e.target.value)
                  }
                  placeholder="example.com"
                />
                <p className="text-xs text-muted-foreground">
                  Point your custom domain to deploy your website. Leave empty to use
                  pages.dev domain only.
                </p>
              </div>

              {/* Environment */}
              <div className="space-y-2">
                <Label htmlFor="environment">Environment</Label>
                <select
                  id="environment"
                  value={settings.environment}
                  onChange={(e) =>
                    handleInputChange(
                      "environment",
                      e.target.value as "development" | "production"
                    )
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="development">Development</option>
                  <option value="production">Production</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  Select the environment for deployment and analytics tracking
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metadata */}
        <TabsContent value="metadata" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Site Metadata</CardTitle>
              <CardDescription>
                Configure SEO and site information displayed in browsers and
                search engines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Site Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Site Title</Label>
                <Input
                  id="title"
                  value={settings.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="My Awesome Website"
                />
                <p className="text-xs text-muted-foreground">
                  This appears in the browser tab and search engine results
                </p>
              </div>

              {/* Site Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Site Description</Label>
                <Textarea
                  id="description"
                  value={settings.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="A brief description of your website"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  This is shown in search engine results (max 160 characters)
                </p>
              </div>

              {/* Favicon URL */}
              <div className="space-y-2">
                <Label htmlFor="faviconUrl">Favicon URL</Label>
                <Input
                  id="faviconUrl"
                  type="url"
                  value={settings.faviconUrl || ""}
                  onChange={(e) =>
                    handleInputChange("faviconUrl", e.target.value)
                  }
                  placeholder="https://example.com/favicon.ico"
                />
                <p className="text-xs text-muted-foreground">
                  The icon displayed in the browser tab. Use an absolute URL.
                </p>
              </div>

              {/* Favicon Preview */}
              {settings.faviconUrl && (
                <div className="space-y-2">
                  <Label>Favicon Preview</Label>
                  <div className="p-4 border rounded-md bg-muted flex items-center gap-2">
                    <img
                      src={settings.faviconUrl}
                      alt="Favicon preview"
                      className="w-6 h-6"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <span className="text-sm text-muted-foreground">
                      Favicon preview
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Integration</CardTitle>
              <CardDescription>
                Configure analytics services to track visitor activity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Plausible Analytics */}
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <Label htmlFor="plausibleDomain" className="font-semibold">
                      Plausible Analytics
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Privacy-focused analytics. Set to your domain name to enable
                    tracking.
                  </p>
                </div>
                <Input
                  id="plausibleDomain"
                  type="text"
                  value={settings.plausibleDomain || ""}
                  onChange={(e) =>
                    handleInputChange("plausibleDomain", e.target.value)
                  }
                  placeholder="example.com"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to disable Plausible Analytics
                </p>
              </div>

              {/* Google Analytics */}
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <Label htmlFor="googleAnalyticsId" className="font-semibold">
                      Google Analytics ID
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your Google Analytics measurement ID (format: G-XXXXXXXXXX)
                  </p>
                </div>
                <Input
                  id="googleAnalyticsId"
                  type="text"
                  value={settings.googleAnalyticsId || ""}
                  onChange={(e) =>
                    handleInputChange("googleAnalyticsId", e.target.value)
                  }
                  placeholder="G-XXXXXXXXXX"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to disable Google Analytics
                </p>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Analytics code will be automatically injected into your website
                  pages.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Environment Variables */}
        <TabsContent value="env" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Environment Variables</CardTitle>
              <CardDescription>
                Configure environment-specific variables for your production
                deployment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Environment variables are injected during the build process.
                  Keep sensitive values secure and never commit them to version
                  control.
                </AlertDescription>
              </Alert>

              {Object.entries(envVars).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No environment variables configured yet
                  </p>
                  <Button variant="outline" onClick={addEnvVar}>
                    Add Environment Variable
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(envVars).map(([key, value]) => (
                    <div
                      key={key}
                      className="p-4 border rounded-lg space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="VARIABLE_NAME"
                          value={key}
                          disabled
                          className="flex-1 font-mono text-xs"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEnvVar(key)}
                        >
                          Remove
                        </Button>
                      </div>
                      <Input
                        placeholder="variable value"
                        value={value}
                        onChange={(e) =>
                          handleEnvVarChange(key, e.target.value)
                        }
                        type="password"
                        className="font-mono text-xs"
                      />
                    </div>
                  ))}

                  <Button variant="outline" onClick={addEnvVar} className="w-full">
                    Add Another Variable
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex gap-2">
        <Button
          size="lg"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
        <Button variant="outline" size="lg">
          Cancel
        </Button>
      </div>
    </div>
  );
}
