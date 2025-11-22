/**
 * InstalledPluginsClient Component
 * Dashboard for managing installed plugins with real-time status
 * CYCLE-037: Real-time plugin status with Convex subscriptions (simulated)
 */

"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Plugin, PluginInstance } from "@/types/plugin";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  PlayCircle,
  Settings,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { mockPlugins, mockInstalledPlugins, mockDependencies } from "@/lib/mockPluginData";
import { PluginDependencyGraph } from "./PluginDependencyGraph";

export function InstalledPluginsClient() {
  const [instances] = useState<PluginInstance[]>(mockInstalledPlugins);

  // Get full plugin data for installed plugins
  const installedPlugins = instances.map((instance) => {
    const plugin = mockPlugins.find((p) => p._id === instance.pluginId);
    return { instance, plugin: plugin! };
  });

  const totalExecutions = instances.reduce((sum, i) => sum + (i.executionCount || 0), 0);
  const totalErrors = instances.reduce((sum, i) => sum + (i.errorCount || 0), 0);
  const activePlugins = instances.filter((i) => i.status === "active").length;

  const handleConfigure = (instanceId: string) => {
    console.log("Configure plugin instance:", instanceId);
  };

  const handleUninstall = (instanceId: string) => {
    console.log("Uninstall plugin instance:", instanceId);
  };

  const handleToggleStatus = (instanceId: string) => {
    console.log("Toggle plugin status:", instanceId);
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{instances.length}</p>
                <p className="text-sm text-muted-foreground">Total Installed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activePlugins}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {totalExecutions.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Executions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalErrors}</p>
                <p className="text-sm text-muted-foreground">Errors</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">Plugin List</TabsTrigger>
          <TabsTrigger value="graph">Dependency Graph</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* List View */}
        <TabsContent value="list" className="space-y-4">
          {installedPlugins.length > 0 ? (
            installedPlugins.map(({ instance, plugin }) => (
              <Card key={instance._id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <CardTitle>{plugin.name}</CardTitle>
                        <Badge
                          variant={
                            instance.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {instance.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {plugin.description}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleConfigure(instance._id)}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleStatus(instance._id)}
                      >
                        <PlayCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUninstall(instance._id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <Separator className="mb-4" />

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Version</p>
                      <p className="font-medium">{plugin.version}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Installed</p>
                      <p className="font-medium">
                        {Math.floor(
                          (Date.now() - instance.installedAt) /
                            (1000 * 60 * 60 * 24)
                        )}{" "}
                        days ago
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Executions</p>
                      <p className="font-medium">
                        {instance.executionCount?.toLocaleString() || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Error Rate</p>
                      <p className="font-medium">
                        {instance.executionCount
                          ? (
                              ((instance.errorCount || 0) /
                                instance.executionCount) *
                              100
                            ).toFixed(1)
                          : 0}
                        %
                      </p>
                    </div>
                  </div>

                  {instance.lastUsed && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>
                        Last used{" "}
                        {Math.floor(
                          (Date.now() - instance.lastUsed) / (1000 * 60)
                        )}{" "}
                        minutes ago
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No plugins installed yet
                  </p>
                  <Button asChild>
                    <a href="/plugins">Browse Plugins</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Dependency Graph */}
        <TabsContent value="graph">
          <PluginDependencyGraph
            plugins={installedPlugins.map((p) => p.plugin)}
            dependencies={mockDependencies.filter((d) =>
              installedPlugins.some((p) => p.plugin._id === d.pluginId)
            )}
            onPluginClick={(plugin) => {
              window.location.href = `/plugins/${plugin._id}`;
            }}
          />
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {installedPlugins.map(({ instance, plugin }) => (
                  <div key={instance._id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{plugin.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {instance.executionCount?.toLocaleString() || 0} executions
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2 transition-all"
                        style={{
                          width: `${
                            totalExecutions > 0
                              ? ((instance.executionCount || 0) /
                                  totalExecutions) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Error Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {installedPlugins
                  .filter((p) => (p.instance.errorCount || 0) > 0)
                  .map(({ instance, plugin }) => (
                    <div
                      key={instance._id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-destructive" />
                        <div>
                          <p className="font-medium">{plugin.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {instance.errorCount} errors
                          </p>
                        </div>
                      </div>
                      <Badge variant="destructive">
                        {instance.executionCount
                          ? (
                              ((instance.errorCount || 0) /
                                instance.executionCount) *
                              100
                            ).toFixed(1)
                          : 0}
                        %
                      </Badge>
                    </div>
                  ))}
                {installedPlugins.filter((p) => (p.instance.errorCount || 0) > 0)
                  .length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <p>No errors detected</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
