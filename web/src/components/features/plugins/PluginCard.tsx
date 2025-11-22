/**
 * PluginCard Component
 * Displays a plugin in the registry with key information
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Plugin } from "@/types/plugin";
import { Download, Star, Users } from "lucide-react";

interface PluginCardProps {
  plugin: Plugin;
  onInstall?: (plugin: Plugin) => void;
  onView?: (plugin: Plugin) => void;
}

const categoryColors: Record<string, string> = {
  blockchain: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  knowledge: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  client: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  browser: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  llm: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  provider: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
  evaluator: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  adapter: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  service: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

export function PluginCard({ plugin, onInstall, onView }: PluginCardProps) {
  const isInstalled = plugin.status === "installed" || plugin.status === "active";

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-1">{plugin.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              by {plugin.author}
            </p>
          </div>
          <Badge className={categoryColors[plugin.category]}>
            {plugin.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {plugin.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {plugin.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {plugin.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{plugin.rating.toFixed(1)}</span>
            </div>
          )}
          {plugin.installCount && (
            <div className="flex items-center gap-1">
              <Download className="w-4 h-4" />
              <span>{plugin.installCount.toLocaleString()}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => onView?.(plugin)}
        >
          View Details
        </Button>
        {!isInstalled && (
          <Button
            className="flex-1"
            onClick={() => onInstall?.(plugin)}
          >
            Install
          </Button>
        )}
        {isInstalled && (
          <Badge variant="secondary" className="flex-1 justify-center py-2">
            Installed
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
}
