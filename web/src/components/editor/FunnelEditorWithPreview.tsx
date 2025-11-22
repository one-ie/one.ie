/**
 * Funnel Editor with Responsive Preview
 *
 * Complete editor component showing side-by-side editing and responsive preview
 * using SplitPane for resizable layout.
 */

import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { SplitPane } from "@/components/ontology-ui/enhanced/SplitPane";
import { ResponsivePreview } from "./ResponsivePreview";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { currentFunnel$ } from "@/stores/funnelHistory";
import { trackUserChange } from "@/lib/ai/history-tools";
import type { FunnelProperties } from "@/lib/schemas/funnel-schema";
import type { DevicePreset } from "@/lib/editor/device-presets";
import { MonitorIcon, CodeIcon, EyeIcon, SettingsIcon } from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface FunnelEditorWithPreviewProps {
  /** Initial funnel data */
  initialFunnel?: FunnelProperties;
  /** Show responsive preview */
  showPreview?: boolean;
  /** Default device for preview */
  defaultDevice?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function FunnelEditorWithPreview({
  initialFunnel,
  showPreview = true,
  defaultDevice = "iphone_14_pro",
}: FunnelEditorWithPreviewProps) {
  // State
  const currentFunnel = useStore(currentFunnel$);
  const [activeTab, setActiveTab] = useState<"content" | "design" | "settings">("content");
  const [previewDevice, setPreviewDevice] = useState<DevicePreset | null>(null);
  const [previewHtml, setPreviewHtml] = useState("");

  // Form state
  const [name, setName] = useState(currentFunnel?.name || "");
  const [slug, setSlug] = useState(currentFunnel?.slug || "");
  const [description, setDescription] = useState(currentFunnel?.description || "");
  const [headline, setHeadline] = useState(currentFunnel?.headline || "");
  const [subheadline, setSubheadline] = useState(currentFunnel?.subheadline || "");
  const [ctaText, setCtaText] = useState(currentFunnel?.ctaText || "Get Started");
  const [primaryColor, setPrimaryColor] = useState(currentFunnel?.primaryColor || "#667eea");
  const [theme, setTheme] = useState<"light" | "dark">(currentFunnel?.theme || "light");

  // Sync with current funnel
  useEffect(() => {
    if (currentFunnel) {
      setName(currentFunnel.name);
      setSlug(currentFunnel.slug);
      setDescription(currentFunnel.description || "");
      setHeadline(currentFunnel.headline || "");
      setSubheadline(currentFunnel.subheadline || "");
      setCtaText(currentFunnel.ctaText || "Get Started");
      setPrimaryColor(currentFunnel.primaryColor || "#667eea");
      setTheme(currentFunnel.theme || "light");
    }
  }, [currentFunnel]);

  // Generate preview HTML whenever form changes
  useEffect(() => {
    const html = generatePreviewHtml({
      name,
      headline,
      subheadline,
      ctaText,
      primaryColor,
      theme,
    });
    setPreviewHtml(html);
  }, [name, headline, subheadline, ctaText, primaryColor, theme]);

  // Handle field changes with history tracking
  const handleNameChange = (newName: string) => {
    if (!currentFunnel) return;
    const before = currentFunnel;
    const after = { ...currentFunnel, name: newName };
    trackUserChange("Changed funnel name", before, after);
    setName(newName);
  };

  const handleHeadlineChange = (newHeadline: string) => {
    if (!currentFunnel) return;
    const before = currentFunnel;
    const after = { ...currentFunnel, headline: newHeadline };
    trackUserChange("Changed headline", before, after);
    setHeadline(newHeadline);
  };

  const handleSubheadlineChange = (newSubheadline: string) => {
    if (!currentFunnel) return;
    const before = currentFunnel;
    const after = { ...currentFunnel, subheadline: newSubheadline };
    trackUserChange("Changed subheadline", before, after);
    setSubheadline(newSubheadline);
  };

  const handleCtaTextChange = (newCtaText: string) => {
    if (!currentFunnel) return;
    const before = currentFunnel;
    const after = { ...currentFunnel, ctaText: newCtaText };
    trackUserChange("Changed CTA text", before, after);
    setCtaText(newCtaText);
  };

  const handlePrimaryColorChange = (newColor: string) => {
    if (!currentFunnel) return;
    const before = currentFunnel;
    const after = { ...currentFunnel, primaryColor: newColor };
    trackUserChange("Changed primary color", before, after);
    setPrimaryColor(newColor);
  };

  const handleThemeChange = (newTheme: "light" | "dark") => {
    if (!currentFunnel) return;
    const before = currentFunnel;
    const after = { ...currentFunnel, theme: newTheme };
    trackUserChange("Changed theme", before, after);
    setTheme(newTheme);
  };

  // Editor panel
  const editorPanel = (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Funnel Editor</h2>
            <p className="text-sm text-muted-foreground">
              Edit your funnel and see changes in real-time
            </p>
          </div>
          {previewDevice && (
            <Badge variant="outline" className="flex items-center gap-1">
              <MonitorIcon className="h-3 w-3" />
              Preview: {previewDevice.name}
            </Badge>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
        <div className="border-b px-4">
          <TabsList>
            <TabsTrigger value="content" className="gap-2">
              <CodeIcon className="h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="design" className="gap-2">
              <EyeIcon className="h-4 w-4" />
              Design
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <SettingsIcon className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6 m-0">
            <Card>
              <CardHeader>
                <CardTitle>Page Content</CardTitle>
                <CardDescription>
                  The main content visitors will see
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="headline">Headline</Label>
                  <Input
                    id="headline"
                    value={headline}
                    onChange={(e) => handleHeadlineChange(e.target.value)}
                    placeholder="Your compelling headline"
                    className="text-lg font-semibold"
                  />
                </div>

                <div>
                  <Label htmlFor="subheadline">Subheadline</Label>
                  <Textarea
                    id="subheadline"
                    value={subheadline}
                    onChange={(e) => handleSubheadlineChange(e.target.value)}
                    placeholder="Supporting text that explains the value"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="cta-text">Call to Action Text</Label>
                  <Input
                    id="cta-text"
                    value={ctaText}
                    onChange={(e) => handleCtaTextChange(e.target.value)}
                    placeholder="Get Started"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Design Tab */}
          <TabsContent value="design" className="space-y-6 m-0">
            <Card>
              <CardHeader>
                <CardTitle>Visual Design</CardTitle>
                <CardDescription>
                  Customize colors and theme
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      id="primary-color"
                      value={primaryColor}
                      onChange={(e) => handlePrimaryColorChange(e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => handlePrimaryColorChange(e.target.value)}
                      placeholder="#667eea"
                      className="flex-1 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={theme} onValueChange={handleThemeChange}>
                    <SelectTrigger id="theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6 m-0">
            <Card>
              <CardHeader>
                <CardTitle>Funnel Settings</CardTitle>
                <CardDescription>
                  Basic configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Funnel Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="My Awesome Funnel"
                  />
                </div>

                <div>
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="my-funnel"
                    className="font-mono"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Internal description for your reference"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );

  // Preview panel
  const previewPanel = (
    <ResponsivePreview
      htmlContent={previewHtml}
      defaultDevice={defaultDevice}
      defaultOrientation="portrait"
      onDeviceChange={setPreviewDevice}
      showWarnings={true}
      enableTouchSimulation={true}
      className="h-full"
    />
  );

  // Single panel (editor only)
  if (!showPreview) {
    return <div className="h-full">{editorPanel}</div>;
  }

  // Split panel layout
  return (
    <div className="h-full">
      <SplitPane
        left={editorPanel}
        right={previewPanel}
        direction="horizontal"
        defaultSize={40}
        minSize={30}
        maxSize={70}
        persistKey="funnel-editor-preview"
        className="h-full"
      />
    </div>
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate preview HTML from funnel properties
 */
function generatePreviewHtml(props: {
  name: string;
  headline: string;
  subheadline: string;
  ctaText: string;
  primaryColor: string;
  theme: "light" | "dark";
}): string {
  const bgColor = props.theme === "dark" ? "#1a202c" : "#ffffff";
  const textColor = props.theme === "dark" ? "#ffffff" : "#1a202c";
  const mutedColor = props.theme === "dark" ? "#a0aec0" : "#4a5568";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${props.name || "Funnel Preview"}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: ${bgColor};
      color: ${textColor};
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .container {
      max-width: 600px;
      text-align: center;
    }

    h1 {
      font-size: 2.5rem;
      font-weight: 800;
      margin-bottom: 16px;
      line-height: 1.2;
    }

    p {
      font-size: 1.25rem;
      color: ${mutedColor};
      line-height: 1.6;
      margin-bottom: 32px;
    }

    .cta-button {
      display: inline-block;
      background-color: ${props.primaryColor};
      color: white;
      font-size: 1.125rem;
      font-weight: 600;
      padding: 16px 48px;
      border-radius: 8px;
      text-decoration: none;
      transition: all 0.2s;
      box-shadow: 0 4px 12px ${props.primaryColor}40;
    }

    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px ${props.primaryColor}60;
    }

    .cta-button:active {
      transform: translateY(0);
    }

    @media (max-width: 640px) {
      h1 {
        font-size: 2rem;
      }

      p {
        font-size: 1rem;
      }

      .cta-button {
        width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${props.headline || "Your Compelling Headline Here"}</h1>
    <p>${props.subheadline || "Add supporting text that explains the value of your offer and why visitors should take action."}</p>
    <a href="#" class="cta-button">${props.ctaText || "Get Started"}</a>
  </div>

  <script>
    document.querySelector('.cta-button').addEventListener('click', (e) => {
      e.preventDefault();
      console.log('CTA clicked!');
    });
  </script>
</body>
</html>
  `.trim();
}
