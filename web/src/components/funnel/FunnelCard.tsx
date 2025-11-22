/**
 * FunnelCard - Card component with integrated actions menu
 *
 * Example usage of FunnelActions in a ThingCard-style component
 */

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FunnelActions } from "./FunnelActions";
import type { Thing } from "@/components/ontology-ui/types";

interface FunnelCardProps {
  funnel: Thing;
  onEdit?: (funnel: Thing) => void | Promise<void>;
  onDuplicate?: (funnel: Thing) => void | Promise<void>;
  onPublish?: (funnel: Thing) => void | Promise<void>;
  onUnpublish?: (funnel: Thing) => void | Promise<void>;
  onArchive?: (funnel: Thing) => void | Promise<void>;
  onDelete?: (funnel: Thing) => void | Promise<void>;
  onExport?: (funnel: Thing) => void | Promise<void>;
  onClick?: (funnel: Thing) => void;
  className?: string;
}

export function FunnelCard({
  funnel,
  onEdit,
  onDuplicate,
  onPublish,
  onUnpublish,
  onArchive,
  onDelete,
  onExport,
  onClick,
  className,
}: FunnelCardProps) {
  const statusColors: Record<string, string> = {
    published: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    archived: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  };

  const handleClick = () => {
    if (onClick && funnel.status !== "archived") {
      onClick(funnel);
    }
  };

  return (
    <Card
      className={`hover:shadow-md transition-shadow ${
        onClick && funnel.status !== "archived" ? "cursor-pointer" : ""
      } ${className || ""}`}
      onClick={handleClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="truncate">{funnel.name}</CardTitle>
            {funnel.description && (
              <CardDescription className="line-clamp-2 mt-1">
                {funnel.description}
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2 ml-2">
            {funnel.status && (
              <Badge
                variant="outline"
                className={statusColors[funnel.status] || ""}
              >
                {funnel.status}
              </Badge>
            )}
            <FunnelActions
              funnel={funnel}
              onEdit={onEdit}
              onDuplicate={onDuplicate}
              onPublish={onPublish}
              onUnpublish={onUnpublish}
              onArchive={onArchive}
              onDelete={onDelete}
              onExport={onExport}
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click when opening actions menu
              }}
            />
          </div>
        </div>
      </CardHeader>

      {funnel.metadata && (
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-1">
            {funnel.metadata.steps && (
              <div>
                <span className="font-medium">Steps:</span>{" "}
                {funnel.metadata.steps}
              </div>
            )}
            {funnel.metadata.conversions !== undefined && (
              <div>
                <span className="font-medium">Conversions:</span>{" "}
                {funnel.metadata.conversions}
              </div>
            )}
            {funnel.metadata.conversionRate !== undefined && (
              <div>
                <span className="font-medium">Conversion Rate:</span>{" "}
                {(funnel.metadata.conversionRate * 100).toFixed(1)}%
              </div>
            )}
            {funnel.createdAt && (
              <div className="text-xs mt-2">
                Created {new Date(funnel.createdAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
