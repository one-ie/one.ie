/**
 * EntityOverview Component
 *
 * Display recent entities with type grouping.
 */

import { Badge } from "@/components/ui/badge";

interface Thing {
  _id: string;
  type: string;
  name: string;
  status: "draft" | "active" | "published" | "archived";
  createdAt: number;
}

interface EntityOverviewProps {
  entities: Thing[];
}

export function EntityOverview({ entities }: EntityOverviewProps) {
  // Group entities by type
  const groupedByType = entities.reduce(
    (acc, entity) => {
      if (!acc[entity.type]) {
        acc[entity.type] = [];
      }
      acc[entity.type].push(entity);
      return acc;
    },
    {} as Record<string, Thing[]>
  );

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedByType).map(([type, items]) => (
        <div
          key={type}
          className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold capitalize text-gray-900 dark:text-white">
              {type}s
            </h3>
            <Badge variant="secondary">{items.length}</Badge>
          </div>
          <div className="space-y-2">
            {items.slice(0, 5).map((entity) => (
              <div
                key={entity._id}
                className="flex items-center justify-between rounded-md border border-gray-100 dark:border-gray-700 p-2 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="flex items-center gap-2">
                  <a
                    href={`/dashboard/things/${entity._id}`}
                    className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {entity.name}
                  </a>
                  <Badge
                    variant={
                      entity.status === "published"
                        ? "default"
                        : entity.status === "active"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {entity.status}
                  </Badge>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(entity.createdAt)}
                </span>
              </div>
            ))}
            {items.length > 5 && (
              <a
                href={`/dashboard/things?type=${type}`}
                className="block text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                View all {items.length} {type}s →
              </a>
            )}
          </div>
        </div>
      ))}

      {entities.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No entities found. Create your first entity to get started.
        </div>
      )}
    </div>
  );
}
