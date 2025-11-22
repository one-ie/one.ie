import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Package, Star, Download, Clock, CheckCircle2 } from "lucide-react";

interface Plugin {
  id: string;
  name: string;
  description: string;
  category: string;
  rating: number;
  installTime: number; // in seconds
  installed?: boolean;
}

export interface PluginCollectionData {
  id: string;
  name: string;
  description: string;
  icon: string;
  plugins: Plugin[];
  totalInstallTime: number;
  averageRating: number;
  installCount: number;
  featured?: boolean;
}

interface PluginCollectionProps {
  collection: PluginCollectionData;
  onInstallCollection?: (
    collectionId: string,
    selectedPlugins: string[]
  ) => Promise<void>;
  onViewCollection?: (collectionId: string) => void;
}

export function PluginCollection({
  collection,
  onInstallCollection,
  onViewCollection,
}: PluginCollectionProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedPlugins, setSelectedPlugins] = useState<string[]>(
    collection.plugins.map((p) => p.id)
  );
  const [installing, setInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);

  const togglePlugin = (pluginId: string) => {
    setSelectedPlugins((prev) =>
      prev.includes(pluginId)
        ? prev.filter((id) => id !== pluginId)
        : [...prev, pluginId]
    );
  };

  const handleInstall = async () => {
    if (!onInstallCollection) return;

    setInstalling(true);
    setInstallProgress(0);

    try {
      // Simulate progress
      const totalPlugins = selectedPlugins.length;
      for (let i = 0; i < totalPlugins; i++) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setInstallProgress(((i + 1) / totalPlugins) * 100);
      }

      await onInstallCollection(collection.id, selectedPlugins);
      setShowDialog(false);
    } catch (error) {
      console.error("Failed to install collection:", error);
    } finally {
      setInstalling(false);
      setInstallProgress(0);
    }
  };

  const formatInstallTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  const allInstalled = collection.plugins.every((p) => p.installed);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <span className="text-2xl">{collection.icon}</span>
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl">{collection.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {collection.description}
              </p>
            </div>
          </div>
          {collection.featured && (
            <Badge variant="secondary">Featured</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Collection Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Package className="w-4 h-4" />
              <span>Plugins</span>
            </div>
            <p className="text-lg font-semibold mt-1">
              {collection.plugins.length}
            </p>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="w-4 h-4" />
              <span>Rating</span>
            </div>
            <p className="text-lg font-semibold mt-1">
              {collection.averageRating.toFixed(1)}
            </p>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Install Time</span>
            </div>
            <p className="text-lg font-semibold mt-1">
              {formatInstallTime(collection.totalInstallTime)}
            </p>
          </div>
        </div>

        {/* Included Plugins Preview */}
        <div>
          <p className="text-sm font-medium mb-2">Included Plugins:</p>
          <div className="flex flex-wrap gap-2">
            {collection.plugins.slice(0, 5).map((plugin) => (
              <Badge key={plugin.id} variant="outline">
                {plugin.name}
              </Badge>
            ))}
            {collection.plugins.length > 5 && (
              <Badge variant="secondary">
                +{collection.plugins.length - 5} more
              </Badge>
            )}
          </div>
        </div>

        {/* Installation Count */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Download className="w-4 h-4" />
          <span>{collection.installCount.toLocaleString()} installations</span>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => onViewCollection?.(collection.id)}
        >
          View Details
        </Button>

        {allInstalled ? (
          <Badge variant="secondary" className="flex-1 justify-center py-2">
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Installed
          </Badge>
        ) : (
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button className="flex-1">Install Collection</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Install {collection.name}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Collection Summary */}
                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <span className="text-3xl">{collection.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold">{collection.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {collection.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span>{selectedPlugins.length} plugins selected</span>
                      <span>
                        Est. {formatInstallTime(collection.totalInstallTime)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Plugin Selection */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {collection.plugins.map((plugin) => (
                    <div
                      key={plugin.id}
                      className="flex items-start gap-3 p-3 border rounded-lg"
                    >
                      <Checkbox
                        id={plugin.id}
                        checked={selectedPlugins.includes(plugin.id)}
                        onCheckedChange={() => togglePlugin(plugin.id)}
                        disabled={plugin.installed}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <label
                            htmlFor={plugin.id}
                            className="font-medium cursor-pointer"
                          >
                            {plugin.name}
                          </label>
                          {plugin.installed && (
                            <Badge variant="secondary" className="text-xs">
                              Installed
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {plugin.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{plugin.rating.toFixed(1)}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {plugin.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Installation Progress */}
                {installing && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Installing plugins...</span>
                      <span>{Math.round(installProgress)}%</span>
                    </div>
                    <Progress value={installProgress} />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowDialog(false)}
                    disabled={installing}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleInstall}
                    disabled={selectedPlugins.length === 0 || installing}
                  >
                    {installing
                      ? "Installing..."
                      : `Install ${selectedPlugins.length} Plugin${
                          selectedPlugins.length === 1 ? "" : "s"
                        }`}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardFooter>
    </Card>
  );
}

// Predefined collections export
export const PLUGIN_COLLECTIONS: PluginCollectionData[] = [
  {
    id: "essential-ai",
    name: "Essential AI Tools",
    description: "Core plugins for AI agent development",
    icon: "🤖",
    plugins: [],
    totalInstallTime: 120,
    averageRating: 4.7,
    installCount: 1523,
    featured: true,
  },
  {
    id: "blockchain-starter",
    name: "Blockchain Starter Pack",
    description: "Everything you need for blockchain integration",
    icon: "⛓️",
    plugins: [],
    totalInstallTime: 180,
    averageRating: 4.5,
    installCount: 892,
    featured: true,
  },
  {
    id: "social-media",
    name: "Social Media Suite",
    description: "Connect to Discord, Twitter, Telegram, and more",
    icon: "💬",
    plugins: [],
    totalInstallTime: 150,
    averageRating: 4.6,
    installCount: 1245,
  },
  {
    id: "web-scraping",
    name: "Web Scraping Tools",
    description: "Browser automation and content extraction",
    icon: "🕷️",
    plugins: [],
    totalInstallTime: 90,
    averageRating: 4.4,
    installCount: 678,
  },
];
