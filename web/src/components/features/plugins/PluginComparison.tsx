import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Star,
  Download,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
} from "lucide-react";

interface PluginComparisonData {
  id: string;
  name: string;
  category: string;
  description: string;
  rating: number;
  reviewCount: number;
  installCount: number;
  license: string;
  version: string;
  avgExecutionTime: number; // in ms
  successRate: number; // percentage
  errorRate: number; // percentage
  pricing?: {
    type: "free" | "paid" | "freemium";
    price?: string;
  };
  features: {
    [key: string]: boolean | string;
  };
  dependencies: string[];
  lastUpdated: Date;
}

interface PluginComparisonProps {
  plugins: PluginComparisonData[];
  onRemove?: (pluginId: string) => void;
  onInstall?: (pluginId: string) => void;
}

export function PluginComparison({
  plugins,
  onRemove,
  onInstall,
}: PluginComparisonProps) {
  const [sortBy, setSortBy] = useState<"rating" | "installs" | "performance">(
    "rating"
  );

  if (plugins.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            No plugins selected for comparison
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Select 2-3 plugins from the marketplace to compare
          </p>
        </CardContent>
      </Card>
    );
  }

  if (plugins.length > 3) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
          <p className="text-muted-foreground">
            You can only compare up to 3 plugins at a time
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Please remove some plugins to continue
          </p>
        </CardContent>
      </Card>
    );
  }

  // Get all unique features across plugins
  const allFeatures = Array.from(
    new Set(plugins.flatMap((p) => Object.keys(p.features)))
  );

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
  };

  return (
    <div className="space-y-6">
      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Plugin Comparison</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Button
                variant={sortBy === "rating" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("rating")}
              >
                Rating
              </Button>
              <Button
                variant={sortBy === "installs" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("installs")}
              >
                Popularity
              </Button>
              <Button
                variant={sortBy === "performance" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("performance")}
              >
                Performance
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-48">Feature</TableHead>
                  {plugins.map((plugin) => (
                    <TableHead key={plugin.id} className="text-center">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{plugin.name}</span>
                          {onRemove && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => onRemove(plugin.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <Badge variant="outline">{plugin.category}</Badge>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Overall Rating */}
                <TableRow>
                  <TableCell className="font-medium">Overall Rating</TableCell>
                  {plugins.map((plugin) => (
                    <TableCell key={plugin.id} className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">
                            {plugin.rating.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {plugin.reviewCount} reviews
                        </span>
                      </div>
                    </TableCell>
                  ))}
                </TableRow>

                {/* Installation Count */}
                <TableRow>
                  <TableCell className="font-medium">Popularity</TableCell>
                  {plugins.map((plugin) => (
                    <TableCell key={plugin.id} className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1">
                          <Download className="w-4 h-4" />
                          <span>{plugin.installCount.toLocaleString()}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          installations
                        </span>
                      </div>
                    </TableCell>
                  ))}
                </TableRow>

                <TableRow>
                  <TableCell colSpan={plugins.length + 1}>
                    <Separator />
                  </TableCell>
                </TableRow>

                {/* Performance Metrics */}
                <TableRow className="bg-muted/50">
                  <TableCell className="font-semibold" colSpan={plugins.length + 1}>
                    Performance Metrics
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Avg Execution Time</TableCell>
                  {plugins.map((plugin) => (
                    <TableCell key={plugin.id} className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{plugin.avgExecutionTime}ms</span>
                      </div>
                    </TableCell>
                  ))}
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Success Rate</TableCell>
                  {plugins.map((plugin) => (
                    <TableCell key={plugin.id} className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div
                          className="h-2 w-24 bg-muted rounded-full overflow-hidden"
                        >
                          <div
                            className={`h-full ${
                              plugin.successRate >= 95
                                ? "bg-green-500"
                                : plugin.successRate >= 85
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${plugin.successRate}%` }}
                          />
                        </div>
                        <span className="text-sm">{plugin.successRate}%</span>
                      </div>
                    </TableCell>
                  ))}
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Error Rate</TableCell>
                  {plugins.map((plugin) => (
                    <TableCell key={plugin.id} className="text-center">
                      <span
                        className={
                          plugin.errorRate < 5
                            ? "text-green-600"
                            : plugin.errorRate < 10
                            ? "text-yellow-600"
                            : "text-red-600"
                        }
                      >
                        {plugin.errorRate}%
                      </span>
                    </TableCell>
                  ))}
                </TableRow>

                <TableRow>
                  <TableCell colSpan={plugins.length + 1}>
                    <Separator />
                  </TableCell>
                </TableRow>

                {/* Pricing */}
                <TableRow className="bg-muted/50">
                  <TableCell className="font-semibold" colSpan={plugins.length + 1}>
                    Pricing & License
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Pricing</TableCell>
                  {plugins.map((plugin) => (
                    <TableCell key={plugin.id} className="text-center">
                      <Badge
                        variant={
                          plugin.pricing?.type === "free" ? "secondary" : "default"
                        }
                      >
                        {plugin.pricing?.type === "free"
                          ? "Free"
                          : plugin.pricing?.type === "freemium"
                          ? `Freemium ${plugin.pricing.price || ""}`
                          : plugin.pricing?.price || "Paid"}
                      </Badge>
                    </TableCell>
                  ))}
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">License</TableCell>
                  {plugins.map((plugin) => (
                    <TableCell key={plugin.id} className="text-center">
                      <Badge variant="outline">{plugin.license}</Badge>
                    </TableCell>
                  ))}
                </TableRow>

                <TableRow>
                  <TableCell colSpan={plugins.length + 1}>
                    <Separator />
                  </TableCell>
                </TableRow>

                {/* Features Comparison */}
                <TableRow className="bg-muted/50">
                  <TableCell className="font-semibold" colSpan={plugins.length + 1}>
                    Features
                  </TableCell>
                </TableRow>

                {allFeatures.map((feature) => (
                  <TableRow key={feature}>
                    <TableCell className="font-medium">{feature}</TableCell>
                    {plugins.map((plugin) => {
                      const value = plugin.features[feature];
                      return (
                        <TableCell key={plugin.id} className="text-center">
                          {typeof value === "boolean" ? (
                            value ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <XCircle className="w-5 h-5 text-muted-foreground mx-auto" />
                            )
                          ) : (
                            <span className="text-sm">{value || "—"}</span>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}

                <TableRow>
                  <TableCell colSpan={plugins.length + 1}>
                    <Separator />
                  </TableCell>
                </TableRow>

                {/* Dependencies */}
                <TableRow className="bg-muted/50">
                  <TableCell className="font-semibold" colSpan={plugins.length + 1}>
                    Additional Information
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Dependencies</TableCell>
                  {plugins.map((plugin) => (
                    <TableCell key={plugin.id} className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-semibold">
                          {plugin.dependencies.length}
                        </span>
                        {plugin.dependencies.length > 0 && (
                          <div className="flex flex-wrap gap-1 justify-center">
                            {plugin.dependencies.slice(0, 2).map((dep) => (
                              <Badge key={dep} variant="outline" className="text-xs">
                                {dep}
                              </Badge>
                            ))}
                            {plugin.dependencies.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{plugin.dependencies.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Last Updated</TableCell>
                  {plugins.map((plugin) => (
                    <TableCell key={plugin.id} className="text-center">
                      <span className="text-sm">
                        {formatDate(plugin.lastUpdated)}
                      </span>
                    </TableCell>
                  ))}
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Version</TableCell>
                  {plugins.map((plugin) => (
                    <TableCell key={plugin.id} className="text-center">
                      <Badge variant="outline">{plugin.version}</Badge>
                    </TableCell>
                  ))}
                </TableRow>

                {/* Action Row */}
                <TableRow>
                  <TableCell className="font-medium">Action</TableCell>
                  {plugins.map((plugin) => (
                    <TableCell key={plugin.id} className="text-center">
                      {onInstall && (
                        <Button
                          className="w-full"
                          onClick={() => onInstall(plugin.id)}
                        >
                          Install
                        </Button>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Recommendation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recommendation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Based on the comparison, the best choice depends on your priorities:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>
              <strong>Highest rated:</strong>{" "}
              {plugins.sort((a, b) => b.rating - a.rating)[0].name}
            </li>
            <li>
              <strong>Most popular:</strong>{" "}
              {plugins.sort((a, b) => b.installCount - a.installCount)[0].name}
            </li>
            <li>
              <strong>Best performance:</strong>{" "}
              {plugins.sort((a, b) => a.avgExecutionTime - b.avgExecutionTime)[0].name}
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
