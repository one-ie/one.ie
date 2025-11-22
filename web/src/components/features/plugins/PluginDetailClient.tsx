/**
 * PluginDetailClient Component
 * Client-side plugin detail with tabs and installation
 */

"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Plugin } from "@/types/plugin";
import { Download, Star, Users, Package, Zap } from "lucide-react";
import { PluginInstallModal } from "./PluginInstallModal";
import { PluginActionExecutor } from "./PluginActionExecutor";
import { mockDependencies } from "@/lib/mockPluginData";

interface PluginDetailClientProps {
  plugin: Plugin;
}

export function PluginDetailClient({ plugin }: PluginDetailClientProps) {
  const [installModalOpen, setInstallModalOpen] = useState(false);

  const isInstalled = plugin.status === "installed" || plugin.status === "active";
  const dependencies = mockDependencies.find((d) => d.pluginId === plugin._id);

  const handleInstall = async (
    plugin: Plugin,
    config: Record<string, unknown>
  ) => {
    console.log("Installing plugin:", plugin.name, "with config:", config);
    await new Promise((resolve) => setTimeout(resolve, 2000));
  };

  return (
    <div className="space-y-6">
      {/* Stats Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-6">
            {plugin.rating && (
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <div>
                  <p className="text-2xl font-bold">{plugin.rating.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">
                    {plugin.reviewCount} reviews
                  </p>
                </div>
              </div>
            )}
            {plugin.installCount && (
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">
                    {plugin.installCount.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">installs</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{plugin.dependencies.length}</p>
                <p className="text-sm text-muted-foreground">dependencies</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{plugin.capabilities.length}</p>
                <p className="text-sm text-muted-foreground">capabilities</p>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {!isInstalled && (
            <Button
              onClick={() => setInstallModalOpen(true)}
              size="lg"
              className="w-full md:w-auto"
            >
              <Download className="w-4 h-4 mr-2" />
              Install Plugin
            </Button>
          )}
          {isInstalled && (
            <Badge variant="secondary" className="px-4 py-2 text-base">
              Installed
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
          <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{plugin.description}</p>

              <div>
                <h4 className="font-medium mb-2">Category</h4>
                <Badge>{plugin.category}</Badge>
              </div>

              <div>
                <h4 className="font-medium mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {plugin.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {plugin.settings && plugin.settings.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Configuration Required</h4>
                  <p className="text-sm text-muted-foreground">
                    This plugin requires {plugin.settings.length} configuration
                    setting{plugin.settings.length !== 1 ? "s" : ""}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Capabilities Tab */}
        <TabsContent value="capabilities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Plugin Capabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plugin.capabilities.map((capability) => (
                  <div
                    key={capability}
                    className="flex items-center gap-3 p-3 border rounded-lg"
                  >
                    <Zap className="w-5 h-5 text-primary" />
                    <span className="font-medium">{capability}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dependencies Tab */}
        <TabsContent value="dependencies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dependencies</CardTitle>
            </CardHeader>
            <CardContent>
              {plugin.dependencies.length > 0 ? (
                <div className="space-y-3">
                  {plugin.dependencies.map((dep) => (
                    <div
                      key={dep}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-muted-foreground" />
                        <span className="font-medium">{dep}</span>
                      </div>
                      <Badge variant="outline">Required</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  No dependencies required
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-4">
          {isInstalled ? (
            <PluginActionExecutor plugin={plugin} />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Install this plugin to execute actions
                  </p>
                  <Button onClick={() => setInstallModalOpen(true)}>
                    <Download className="w-4 h-4 mr-2" />
                    Install Plugin
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Install Modal */}
      <PluginInstallModal
        plugin={plugin}
        open={installModalOpen}
        onOpenChange={setInstallModalOpen}
        onInstall={handleInstall}
      />
    </div>
  );
}
