/**
 * APIExplorer - Interactive API documentation
 *
 * Uses 6-token design system for API exploration.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "../utils";
import { Copy, Play, Code } from "lucide-react";

export interface APIEndpoint {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  description: string;
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  requestExample?: string;
  responseExample?: string;
}

export interface APIExplorerProps {
  endpoints: APIEndpoint[];
  baseUrl?: string;
  onExecute?: (endpoint: APIEndpoint, params: Record<string, string>) => Promise<any>;
  className?: string;
}

/**
 * APIExplorer - Explore and test API endpoints
 *
 * @example
 * ```tsx
 * <APIExplorer
 *   baseUrl="https://api.example.com"
 *   endpoints={[
 *     {
 *       method: "GET",
 *       path: "/api/products",
 *       description: "List all products",
 *       responseExample: '{"products": [...]}'
 *     }
 *   ]}
 *   onExecute={async (endpoint, params) => {
 *     return await fetch(`${baseUrl}${endpoint.path}`);
 *   }}
 * />
 * ```
 */
export function APIExplorer({
  endpoints,
  baseUrl = "",
  onExecute,
  className,
}: APIExplorerProps) {
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(
    endpoints[0] || null
  );
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const methodColors = {
    GET: "bg-blue-100 text-blue-700",
    POST: "bg-green-100 text-green-700",
    PUT: "bg-yellow-100 text-yellow-700",
    DELETE: "bg-red-100 text-red-700",
    PATCH: "bg-purple-100 text-purple-700",
  };

  const handleExecute = async () => {
    if (!selectedEndpoint || !onExecute) return;

    setLoading(true);
    try {
      const result = await onExecute(selectedEndpoint, {});
      setResponse(JSON.stringify(result, null, 2));
    } catch (error) {
      setResponse(JSON.stringify({ error: (error as Error).message }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-6", className)}>
      {/* Endpoint List */}
      <Card className="lg:col-span-1 bg-background p-1 shadow-sm rounded-md">
        <CardHeader>
          <CardTitle className="text-font">Endpoints</CardTitle>
        </CardHeader>
        <CardContent className="bg-foreground rounded-md p-4">
          <div className="space-y-2">
            {endpoints.map((endpoint, i) => (
              <button
                key={i}
                onClick={() => setSelectedEndpoint(endpoint)}
                className={cn(
                  "w-full text-left p-3 rounded-md border transition-colors",
                  selectedEndpoint === endpoint
                    ? "bg-background border-primary"
                    : "bg-foreground border-font/10 hover:bg-background"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={methodColors[endpoint.method]}>
                    {endpoint.method}
                  </Badge>
                  <code className="text-xs font-mono text-font/80">
                    {endpoint.path}
                  </code>
                </div>
                <p className="text-xs text-font/60 mt-1">
                  {endpoint.description}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Endpoint Details */}
      {selectedEndpoint && (
        <Card className="lg:col-span-2 bg-background p-1 shadow-sm rounded-md">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={methodColors[selectedEndpoint.method]}>
                    {selectedEndpoint.method}
                  </Badge>
                  <code className="text-sm font-mono text-font">
                    {baseUrl}{selectedEndpoint.path}
                  </code>
                </div>
                <p className="text-sm text-font/60">
                  {selectedEndpoint.description}
                </p>
              </div>
              {onExecute && (
                <Button
                  onClick={handleExecute}
                  disabled={loading}
                  variant="default"
                  size="sm"
                  className="gap-2"
                >
                  <Play className="h-4 w-4" />
                  {loading ? "Running..." : "Try it"}
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="bg-foreground rounded-md p-4">
            <Tabs defaultValue="params">
              <TabsList>
                <TabsTrigger value="params">Parameters</TabsTrigger>
                <TabsTrigger value="request">Request</TabsTrigger>
                <TabsTrigger value="response">Response</TabsTrigger>
              </TabsList>

              {/* Parameters */}
              <TabsContent value="params" className="space-y-3">
                {selectedEndpoint.parameters && selectedEndpoint.parameters.length > 0 ? (
                  selectedEndpoint.parameters.map((param, i) => (
                    <div key={i} className="border rounded-md p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-sm font-mono text-font">
                          {param.name}
                        </code>
                        <Badge variant="outline" className="text-xs">
                          {param.type}
                        </Badge>
                        {param.required && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-font/60">
                        {param.description}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-font/60">No parameters required</p>
                )}
              </TabsContent>

              {/* Request Example */}
              <TabsContent value="request">
                <div className="relative">
                  <pre className="bg-background p-4 rounded-md overflow-auto text-xs font-mono text-font">
                    {selectedEndpoint.requestExample || "No request body required"}
                  </pre>
                  {selectedEndpoint.requestExample && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(selectedEndpoint.requestExample!)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TabsContent>

              {/* Response Example */}
              <TabsContent value="response">
                <div className="relative">
                  <pre className="bg-background p-4 rounded-md overflow-auto text-xs font-mono text-font max-h-96">
                    {response || selectedEndpoint.responseExample || "Click 'Try it' to see response"}
                  </pre>
                  {(response || selectedEndpoint.responseExample) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(response || selectedEndpoint.responseExample!)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
