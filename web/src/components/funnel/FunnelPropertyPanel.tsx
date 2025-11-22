/**
 * FunnelPropertyPanel - Property inspector for funnel editor
 *
 * Displays funnel metadata in organized, collapsible sections
 * Uses ThingMetadata pattern for consistency with ontology UI
 */

import type { Thing } from "@/components/ontology-ui/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { formatDate, formatDateTime, formatNumber, formatCurrency } from "@/components/ontology-ui/utils";
import { useState } from "react";
import { FunnelStatusToggle } from "./FunnelStatusToggle";

interface FunnelPropertyPanelProps {
  funnel: Thing;
  className?: string;
}

interface PropertyRowProps {
  label: string;
  value: React.ReactNode;
}

function PropertyRow({ label, value }: PropertyRowProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export function FunnelPropertyPanel({
  funnel,
  className,
}: FunnelPropertyPanelProps) {
  const [basicInfoOpen, setBasicInfoOpen] = useState(true);
  const [statsOpen, setStatsOpen] = useState(true);
  const [metaOpen, setMetaOpen] = useState(false);

  // Extract funnel-specific metadata
  const metadata = funnel.metadata || {};
  const viewCount = metadata.viewCount as number || 0;
  const conversionRate = metadata.conversionRate as number || 0;
  const revenue = metadata.revenue as number || 0;
  const stepCount = metadata.stepCount as number || 0;
  const publishedAt = metadata.publishedAt as number;
  const lastPublishedAt = metadata.lastPublishedAt as number;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">Properties</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Basic Information Section */}
        <Collapsible open={basicInfoOpen} onOpenChange={setBasicInfoOpen}>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-3 py-2 hover:bg-accent">
            <h3 className="text-sm font-medium">Basic Information</h3>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                basicInfoOpen ? "rotate-180" : ""
              }`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 px-3 pt-2">
            <PropertyRow label="Name" value={funnel.name} />
            <PropertyRow
              label="Description"
              value={
                funnel.description ? (
                  <span className="max-w-[200px] truncate text-right">
                    {funnel.description}
                  </span>
                ) : (
                  <span className="text-muted-foreground">None</span>
                )
              }
            />
            <PropertyRow label="Steps" value={stepCount} />
            {funnel.tags && funnel.tags.length > 0 && (
              <div className="flex items-start justify-between py-2">
                <span className="text-sm text-muted-foreground">Tags</span>
                <div className="flex flex-wrap justify-end gap-1">
                  {funnel.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Publish/Unpublish Status Toggle */}
        <div className="px-3">
          <h3 className="mb-3 text-sm font-medium">Publish Status</h3>
          <FunnelStatusToggle
            funnelId={funnel._id}
            status={funnel.status as "draft" | "active" | "published" | "archived"}
            stepCount={stepCount}
            updatedAt={funnel.updatedAt || funnel._creationTime}
          />
        </div>

        <Separator />

        {/* Statistics Section */}
        <Collapsible open={statsOpen} onOpenChange={setStatsOpen}>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-3 py-2 hover:bg-accent">
            <h3 className="text-sm font-medium">Statistics</h3>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                statsOpen ? "rotate-180" : ""
              }`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 px-3 pt-2">
            <PropertyRow label="Total Views" value={formatNumber(viewCount)} />
            <PropertyRow
              label="Conversion Rate"
              value={`${(conversionRate * 100).toFixed(2)}%`}
            />
            <PropertyRow
              label="Revenue"
              value={formatCurrency(revenue)}
            />
            {publishedAt && (
              <PropertyRow
                label="Published"
                value={formatDate(publishedAt)}
              />
            )}
            {lastPublishedAt && (
              <PropertyRow
                label="Last Published"
                value={formatDate(lastPublishedAt)}
              />
            )}
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* System Metadata Section */}
        <Collapsible open={metaOpen} onOpenChange={setMetaOpen}>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-3 py-2 hover:bg-accent">
            <h3 className="text-sm font-medium">System Metadata</h3>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                metaOpen ? "rotate-180" : ""
              }`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 px-3 pt-2">
            <PropertyRow
              label="Thing ID"
              value={
                <span className="font-mono text-xs text-muted-foreground">
                  {funnel._id}
                </span>
              }
            />
            <PropertyRow
              label="Group ID"
              value={
                <span className="font-mono text-xs text-muted-foreground">
                  {funnel.groupId}
                </span>
              }
            />
            <PropertyRow
              label="Owner ID"
              value={
                <span className="font-mono text-xs text-muted-foreground">
                  {funnel.ownerId}
                </span>
              }
            />
            <Separator className="my-2" />
            <PropertyRow
              label="Created"
              value={formatDate(funnel.createdAt)}
            />
            {funnel.updatedAt && (
              <PropertyRow
                label="Updated"
                value={formatDate(funnel.updatedAt)}
              />
            )}
            <PropertyRow
              label="Creation Time"
              value={formatDateTime(funnel._creationTime)}
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Custom Metadata (if any additional fields exist) */}
        {metadata && Object.keys(metadata).length > 0 && (
          <>
            <Separator />
            <div className="space-y-1 px-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                Custom Metadata
              </h3>
              {Object.entries(metadata)
                .filter(([key]) => !['viewCount', 'conversionRate', 'revenue', 'stepCount', 'publishedAt', 'lastPublishedAt'].includes(key))
                .map(([key, value]) => (
                  <PropertyRow
                    key={key}
                    label={key}
                    value={
                      typeof value === "object"
                        ? JSON.stringify(value)
                        : String(value)
                    }
                  />
                ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
