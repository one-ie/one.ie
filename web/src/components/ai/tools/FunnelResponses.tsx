/**
 * FunnelResponses - UI components for funnel builder tool responses
 *
 * Beautiful, conversion-optimized UI components for displaying funnel operations.
 * Uses ThingCard for consistency with the 6-dimension ontology.
 *
 * @see /web/src/components/ontology-ui/things/ThingCard.tsx - Thing renderer
 */

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThingCard } from "@/components/ontology-ui/things/ThingCard";
import {
  CheckCircle2,
  AlertCircle,
  Rocket,
  Eye,
  EyeOff,
  Pencil,
  Copy,
  Trash2,
  Sparkles,
} from "lucide-react";
import type { Thing } from "@/components/ontology-ui/types";

// ============================================================================
// Funnel Created Response
// ============================================================================

interface FunnelCreatedResponseProps {
  funnelId: string;
  name: string;
  description?: string;
  template?: string;
}

export function FunnelCreatedResponse({
  funnelId,
  name,
  description,
  template,
}: FunnelCreatedResponseProps) {
  return (
    <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400" />
          <CardTitle className="text-green-900 dark:text-green-100">
            Funnel Created Successfully!
          </CardTitle>
        </div>
        <CardDescription className="text-green-700 dark:text-green-300">
          Your new funnel "{name}" is ready to customize
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {description && (
          <div>
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              Description
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              {description}
            </p>
          </div>
        )}

        {template && (
          <div>
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              Template
            </p>
            <Badge variant="secondary" className="mt-1">
              {template}
            </Badge>
          </div>
        )}

        <div className="bg-white dark:bg-gray-950 rounded-lg p-3 border border-green-200 dark:border-green-800">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Funnel ID
          </p>
          <code className="text-xs font-mono bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">
            {funnelId}
          </code>
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            Next Steps
          </p>
          <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">1.</span>
              <span>Add steps to your funnel (landing page, form, thank you page)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">2.</span>
              <span>Customize colors, fonts, and branding</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">3.</span>
              <span>Add elements (text, images, buttons, forms)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">4.</span>
              <span>Preview and publish when ready</span>
            </li>
          </ul>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button size="sm" variant="default">
          <Pencil className="h-4 w-4 mr-2" />
          Edit Funnel
        </Button>
        <Button size="sm" variant="outline">
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
      </CardFooter>
    </Card>
  );
}

// ============================================================================
// Funnel List Response
// ============================================================================

interface FunnelListResponseProps {
  funnels: Thing[];
  status?: string;
}

export function FunnelListResponse({ funnels, status }: FunnelListResponseProps) {
  if (funnels.length === 0) {
    return (
      <Card className="border-gray-200 dark:border-gray-800">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            {status
              ? `No ${status} funnels found`
              : "No funnels found. Create your first funnel to get started!"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {status ? `${status.charAt(0).toUpperCase() + status.slice(1)} Funnels` : 'Your Funnels'}
        </h3>
        <Badge variant="secondary">{funnels.length} found</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {funnels.map((funnel) => (
          <ThingCard
            key={funnel._id}
            thing={funnel}
            showType={false}
            showTags={true}
            variant="default"
            size="md"
            interactive={true}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Funnel Details Response
// ============================================================================

interface FunnelDetailsResponseProps {
  funnel: Thing;
}

export function FunnelDetailsResponse({ funnel }: FunnelDetailsResponseProps) {
  const stepCount = funnel.properties?.stepCount || 0;
  const settings = funnel.properties?.settings || {};

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{funnel.name}</CardTitle>
            {funnel.properties?.description && (
              <CardDescription>{funnel.properties.description}</CardDescription>
            )}
          </div>
          <Badge
            variant={
              funnel.status === 'published'
                ? 'default'
                : funnel.status === 'draft'
                  ? 'secondary'
                  : 'outline'
            }
          >
            {funnel.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Funnel Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <p className="text-2xl font-bold">{stepCount}</p>
            <p className="text-xs text-muted-foreground">Steps</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">Visitors</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <p className="text-2xl font-bold">0%</p>
            <p className="text-xs text-muted-foreground">Conversion</p>
          </div>
        </div>

        <Separator />

        {/* Funnel Info */}
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Slug</p>
            <code className="text-sm font-mono bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">
              {funnel.properties?.slug || 'N/A'}
            </code>
          </div>

          {settings.seo && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">SEO</p>
              <div className="text-sm space-y-1">
                {settings.seo.title && <p>Title: {settings.seo.title}</p>}
                {settings.seo.description && <p>Description: {settings.seo.description}</p>}
              </div>
            </div>
          )}

          {settings.tracking && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tracking</p>
              <div className="text-sm space-y-1">
                {settings.tracking.googleAnalytics && (
                  <p>Google Analytics: {settings.tracking.googleAnalytics}</p>
                )}
                {settings.tracking.facebookPixel && (
                  <p>Facebook Pixel: {settings.tracking.facebookPixel}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Timestamps */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Created: {new Date(funnel.createdAt).toLocaleDateString()}</span>
          <span>Updated: {new Date(funnel.updatedAt).toLocaleDateString()}</span>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button size="sm" variant="default">
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button size="sm" variant="outline">
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
        {funnel.status === 'published' ? (
          <Button size="sm" variant="outline">
            <EyeOff className="h-4 w-4 mr-2" />
            Unpublish
          </Button>
        ) : (
          <Button size="sm" variant="outline">
            <Rocket className="h-4 w-4 mr-2" />
            Publish
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

// ============================================================================
// Funnel Published Response
// ============================================================================

interface FunnelPublishedResponseProps {
  funnelId: string;
  action: 'published' | 'unpublished';
}

export function FunnelPublishedResponse({
  funnelId,
  action,
}: FunnelPublishedResponseProps) {
  const isPublished = action === 'published';

  return (
    <Card
      className={
        isPublished
          ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
          : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/20'
      }
    >
      <CardHeader>
        <div className="flex items-center gap-2">
          {isPublished ? (
            <Rocket className="h-5 w-5 text-green-600 dark:text-green-400" />
          ) : (
            <EyeOff className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          )}
          <CardTitle
            className={
              isPublished
                ? 'text-green-900 dark:text-green-100'
                : 'text-gray-900 dark:text-gray-100'
            }
          >
            Funnel {isPublished ? 'Published' : 'Unpublished'} Successfully!
          </CardTitle>
        </div>
        <CardDescription
          className={
            isPublished
              ? 'text-green-700 dark:text-green-300'
              : 'text-gray-700 dark:text-gray-300'
          }
        >
          {isPublished
            ? 'Your funnel is now live and accessible to visitors'
            : 'Your funnel has been taken offline'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div
          className={
            isPublished
              ? 'bg-white dark:bg-gray-950 rounded-lg p-3 border border-green-200 dark:border-green-800'
              : 'bg-white dark:bg-gray-950 rounded-lg p-3 border border-gray-200 dark:border-gray-800'
          }
        >
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Funnel ID
          </p>
          <code className="text-xs font-mono bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">
            {funnelId}
          </code>
        </div>

        {isPublished && (
          <div className="space-y-2">
            <p
              className={
                isPublished
                  ? 'text-sm font-medium text-green-800 dark:text-green-200'
                  : 'text-sm font-medium text-gray-800 dark:text-gray-200'
              }
            >
              What's Next?
            </p>
            <ul
              className={
                isPublished
                  ? 'text-sm text-green-700 dark:text-green-300 space-y-1'
                  : 'text-sm text-gray-700 dark:text-gray-300 space-y-1'
              }
            >
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5" />
                <span>Share your funnel URL with your audience</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5" />
                <span>Monitor analytics and conversion rates</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5" />
                <span>A/B test different variations</span>
              </li>
            </ul>
          </div>
        )}
      </CardContent>

      {isPublished && (
        <CardFooter>
          <Button size="sm" variant="default" className="w-full">
            <Copy className="h-4 w-4 mr-2" />
            Copy Funnel URL
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

// ============================================================================
// Funnel Error Response
// ============================================================================

interface FunnelErrorResponseProps {
  operation: string;
  error: string;
}

export function FunnelErrorResponse({
  operation,
  error,
}: FunnelErrorResponseProps) {
  return (
    <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <CardTitle className="text-red-900 dark:text-red-100">
            Error {operation.charAt(0).toUpperCase() + operation.slice(1)}ing Funnel
          </CardTitle>
        </div>
        <CardDescription className="text-red-700 dark:text-red-300">
          Something went wrong with your request
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="bg-white dark:bg-gray-950 rounded-lg p-3 border border-red-200 dark:border-red-800">
          <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
            Error Details
          </p>
          <code className="text-xs font-mono text-red-700 dark:text-red-300">
            {error}
          </code>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            Common Solutions
          </p>
          <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Check that you have permission to {operation} funnels</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Verify the funnel ID is correct</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Ensure the funnel meets all requirements (e.g., has steps for publishing)</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Try refreshing the page and trying again</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
