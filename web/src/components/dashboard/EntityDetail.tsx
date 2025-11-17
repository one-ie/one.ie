/**
 * EntityDetail Component
 *
 * Display entity properties in a readable format.
 */

interface Thing {
  _id: string;
  type: string;
  name: string;
  status: string;
  properties: any;
  createdAt: number;
  updatedAt: number;
}

interface EntityDetailProps {
  entity: Thing;
}

export function EntityDetail({ entity }: EntityDetailProps) {
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "—";
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    return String(value);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      {/* Core Properties */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Entity ID</dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-white font-mono">{entity._id}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-white">{entity.type}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-white capitalize">{entity.status}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-white">
            {formatDate(entity.createdAt)}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-white">
            {formatDate(entity.updatedAt)}
          </dd>
        </div>
      </div>

      {/* Custom Properties */}
      {Object.keys(entity.properties).length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Custom Properties
          </h4>
          <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
            <dl className="space-y-3">
              {Object.entries(entity.properties).map(([key, value]) => (
                <div key={key}>
                  <dt className="text-sm font-medium text-gray-700 dark:text-gray-300">{key}</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    <pre className="whitespace-pre-wrap font-mono text-xs">
                      {formatValue(value)}
                    </pre>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
