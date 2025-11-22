/**
 * Embed Code Generator
 *
 * Generates embed code for AI clone chat widget.
 * Allows creators to customize appearance and behavior.
 *
 * Features:
 * - Generate iframe embed code
 * - Generate script tag embed code
 * - Customization options (colors, position, initial message)
 * - Live preview of widget
 * - Copy to clipboard
 * - Installation instructions
 * - Usage tracking setup
 *
 * Ontology Mapping:
 * - Reads ai_clone thing (for clone metadata)
 * - Creates external_connection (for tracking embed installations)
 * - Logs communication_event (when code is generated)
 */

import { useState } from 'react';
import { Check, Copy, Code2, Eye, Settings, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface EmbedCodeGeneratorProps {
  cloneId: string;
  cloneName: string;
  baseUrl?: string;
}

export function EmbedCodeGenerator({
  cloneId,
  cloneName,
  baseUrl = 'https://one.ie',
}: EmbedCodeGeneratorProps) {
  // Customization options
  const [primaryColor, setPrimaryColor] = useState('#000000');
  const [position, setPosition] = useState<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'>('bottom-right');
  const [initialMessage, setInitialMessage] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [compact, setCompact] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [copiedType, setCopiedType] = useState<'iframe' | 'script' | null>(null);

  // Generate embed URL with params
  const generateEmbedUrl = () => {
    const params = new URLSearchParams({
      color: primaryColor,
      position,
      theme,
      compact: compact.toString(),
    });

    if (initialMessage) {
      params.append('message', initialMessage);
    }

    return `${baseUrl}/embed/clone/${cloneId}?${params.toString()}`;
  };

  // Generate iframe embed code
  const generateIframeCode = () => {
    const url = generateEmbedUrl();
    return `<!-- AI Clone Chat Widget - ${cloneName} -->
<iframe
  src="${url}"
  width="100%"
  height="100%"
  frameborder="0"
  allow="microphone; camera"
  style="position: fixed; ${position.includes('bottom') ? 'bottom' : 'top'}: 20px; ${position.includes('right') ? 'right' : 'left'}: 20px; width: 400px; height: 600px; border: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 9999;"
  title="${cloneName} Chat"
></iframe>`;
  };

  // Generate script tag embed code
  const generateScriptCode = () => {
    const url = generateEmbedUrl();
    return `<!-- AI Clone Chat Widget - ${cloneName} -->
<div id="clone-chat-widget"></div>
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = '${url}';
    iframe.style.cssText = 'position: fixed; ${position.includes('bottom') ? 'bottom' : 'top'}: 20px; ${position.includes('right') ? 'right' : 'left'}: 20px; width: 400px; height: 600px; border: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 9999;';
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allow', 'microphone; camera');
    iframe.setAttribute('title', '${cloneName} Chat');

    // Wait for DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        document.body.appendChild(iframe);
      });
    } else {
      document.body.appendChild(iframe);
    }

    // Listen for messages from widget
    window.addEventListener('message', function(event) {
      if (event.data.type && event.data.type.startsWith('CLONE_EMBED_')) {
        console.log('Widget event:', event.data.type, event.data);
      }
    });
  })();
</script>`;
  };

  // Generate WordPress shortcode
  const generateWordPressCode = () => {
    return `<!-- Add to functions.php -->
add_shortcode('ai_clone_chat', function($atts) {
  return '${generateIframeCode().replace(/\n/g, ' ')}';
});

<!-- Use in posts/pages -->
[ai_clone_chat]`;
  };

  // Copy to clipboard
  const copyToClipboard = async (code: string, type: 'iframe' | 'script') => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Embed Your AI Clone</h2>
        <p className="text-muted-foreground">
          Add <strong>{cloneName}</strong> to your website in 2 minutes.
          Customize the appearance and copy the code below.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Customization Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="size-5" />
              Customize Widget
            </CardTitle>
            <CardDescription>
              Configure how your AI clone appears on your website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Primary Color */}
            <div className="space-y-2">
              <Label htmlFor="color">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-20 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>

            {/* Position */}
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Select value={position} onValueChange={(v: any) => setPosition(v)}>
                <SelectTrigger id="position">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                  <SelectItem value="top-right">Top Right</SelectItem>
                  <SelectItem value="top-left">Top Left</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Theme */}
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select value={theme} onValueChange={(v: any) => setTheme(v)}>
                <SelectTrigger id="theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Initial Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Initial Message (Optional)</Label>
              <Textarea
                id="message"
                value={initialMessage}
                onChange={(e) => setInitialMessage(e.target.value)}
                placeholder="Hi! How can I help you today?"
                className="min-h-[80px]"
              />
            </div>

            {/* Compact Mode */}
            <div className="flex items-center justify-between">
              <Label htmlFor="compact">Start Minimized</Label>
              <Button
                id="compact"
                variant={compact ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCompact(!compact)}
              >
                {compact ? 'Yes' : 'No'}
              </Button>
            </div>

            <Separator />

            {/* Preview Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="size-4 mr-2" />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
          </CardContent>
        </Card>

        {/* Embed Code Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="size-5" />
              Embed Code
            </CardTitle>
            <CardDescription>
              Copy and paste this code into your website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="iframe" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="iframe">iFrame</TabsTrigger>
                <TabsTrigger value="script">Script</TabsTrigger>
                <TabsTrigger value="wordpress">WordPress</TabsTrigger>
              </TabsList>

              {/* iFrame Code */}
              <TabsContent value="iframe" className="space-y-3">
                <div className="relative">
                  <pre className="p-4 rounded-lg bg-muted text-xs overflow-x-auto max-h-[300px]">
                    <code>{generateIframeCode()}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(generateIframeCode(), 'iframe')}
                  >
                    {copiedType === 'iframe' ? (
                      <>
                        <Check className="size-4 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="size-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>Best for:</strong> Simple integration, no dependencies</p>
                  <p><strong>Pros:</strong> Works everywhere, isolated styles</p>
                  <p><strong>Cons:</strong> Fixed size, limited customization</p>
                </div>
              </TabsContent>

              {/* Script Code */}
              <TabsContent value="script" className="space-y-3">
                <div className="relative">
                  <pre className="p-4 rounded-lg bg-muted text-xs overflow-x-auto max-h-[300px]">
                    <code>{generateScriptCode()}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(generateScriptCode(), 'script')}
                  >
                    {copiedType === 'script' ? (
                      <>
                        <Check className="size-4 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="size-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>Best for:</strong> Dynamic loading, event tracking</p>
                  <p><strong>Pros:</strong> Programmatic control, async loading</p>
                  <p><strong>Cons:</strong> Requires JavaScript enabled</p>
                </div>
              </TabsContent>

              {/* WordPress Code */}
              <TabsContent value="wordpress" className="space-y-3">
                <div className="relative">
                  <pre className="p-4 rounded-lg bg-muted text-xs overflow-x-auto max-h-[300px]">
                    <code>{generateWordPressCode()}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(generateWordPressCode(), 'script')}
                  >
                    {copiedType === 'script' ? (
                      <>
                        <Check className="size-4 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="size-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>Best for:</strong> WordPress sites</p>
                  <p><strong>Installation:</strong> Add to functions.php, then use shortcode</p>
                  <p><strong>Note:</strong> Requires theme editing access</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Installation Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-5" />
            Installation Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Badge variant="outline" className="mb-2">Step 1</Badge>
              <h4 className="font-semibold">Customize Widget</h4>
              <p className="text-sm text-muted-foreground">
                Use the customization panel to set colors, position, and initial message
              </p>
            </div>
            <div className="space-y-2">
              <Badge variant="outline" className="mb-2">Step 2</Badge>
              <h4 className="font-semibold">Copy Code</h4>
              <p className="text-sm text-muted-foreground">
                Choose iframe or script tag, then copy the generated code
              </p>
            </div>
            <div className="space-y-2">
              <Badge variant="outline" className="mb-2">Step 3</Badge>
              <h4 className="font-semibold">Paste on Site</h4>
              <p className="text-sm text-muted-foreground">
                Add the code before closing &lt;/body&gt; tag on your website
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-semibold">Platform-Specific Guides</h4>
            <div className="grid sm:grid-cols-2 gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href="/docs/embed/wordpress" target="_blank">
                  WordPress Guide
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="/docs/embed/shopify" target="_blank">
                  Shopify Guide
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="/docs/embed/webflow" target="_blank">
                  Webflow Guide
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="/docs/embed/custom" target="_blank">
                  Custom HTML Guide
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Tracking & Monetization */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Tracking & Billing</CardTitle>
          <CardDescription>
            Track conversations and set usage limits for your embedded clone
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">Conversations Today</div>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold">Unlimited</div>
              <div className="text-sm text-muted-foreground">Monthly Limit</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
            <div className="space-y-1">
              <h4 className="font-semibold">Upgrade to Track Usage</h4>
              <p className="text-sm text-muted-foreground">
                Get detailed analytics and set conversation limits
              </p>
            </div>
            <Button>Upgrade Plan</Button>
          </div>
        </CardContent>
      </Card>

      {/* Live Preview */}
      {showPreview && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
            <CardDescription>
              This is how your widget will appear on your website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative h-[400px] rounded-lg border-2 border-dashed bg-muted/30 overflow-hidden">
              <iframe
                src={generateEmbedUrl()}
                className="absolute inset-0 w-full h-full"
                title="Widget Preview"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
