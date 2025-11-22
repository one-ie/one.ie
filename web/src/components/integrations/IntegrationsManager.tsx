/**
 * Integrations Manager Component (Cycle 66)
 *
 * Manage form integrations with external systems.
 *
 * Features:
 * - List all configured integrations
 * - Add new integrations (webhook, Zapier, email marketing, CRM)
 * - Test integrations
 * - Enable/disable integrations
 * - View integration logs
 * - See success rates and stats
 */

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Webhook,
  Zap,
  Mail,
  Users,
  Settings,
  Plus,
  TestTube,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  Activity
} from "lucide-react";

interface IntegrationsManagerProps {
  funnelId: string;
}

const INTEGRATION_TYPES = [
  { value: "webhook", label: "Custom Webhook", icon: Webhook, description: "POST data to any URL" },
  { value: "zapier", label: "Zapier", icon: Zap, description: "Trigger Zaps automatically" },
  { value: "mailchimp", label: "Mailchimp", icon: Mail, description: "Add to email lists" },
  { value: "convertkit", label: "ConvertKit", icon: Mail, description: "Add to email sequences" },
  { value: "activecampaign", label: "ActiveCampaign", icon: Mail, description: "Add to campaigns" },
  { value: "hubspot", label: "HubSpot", icon: Users, description: "Create CRM contacts" },
  { value: "salesforce", label: "Salesforce", icon: Users, description: "Create leads" },
  { value: "pipedrive", label: "Pipedrive", icon: Users, description: "Add to pipeline" },
] as const;

export function IntegrationsManager({ funnelId }: IntegrationsManagerProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("webhook");
  const [integrationName, setIntegrationName] = useState("");
  const [config, setConfig] = useState<Record<string, any>>({});

  // Queries
  const integrations = useQuery(api.queries.integrations.getIntegrations, {
    funnelId: funnelId as Id<"things">,
  });

  const stats = useQuery(api.queries.integrations.getIntegrationStats, {
    funnelId: funnelId as Id<"things">,
    days: 30,
  });

  const logs = useQuery(api.queries.integrations.getIntegrationLogs, {
    funnelId: funnelId as Id<"things">,
    limit: 50,
  });

  // Mutations
  const configureIntegration = useMutation(api.mutations.integrations.configureIntegration);
  const deleteIntegration = useMutation(api.mutations.integrations.deleteIntegration);
  const testIntegration = useMutation(api.mutations.integrations.testIntegration);

  // Handlers
  const handleAdd = async () => {
    if (!integrationName.trim()) {
      toast.error("Please enter an integration name");
      return;
    }

    try {
      await configureIntegration({
        funnelId: funnelId as Id<"things">,
        type: selectedType as any,
        name: integrationName,
        enabled: true,
        config,
      });

      toast.success("Integration added successfully");
      setShowAddDialog(false);
      setIntegrationName("");
      setConfig({});
    } catch (error: any) {
      toast.error(error.message || "Failed to add integration");
    }
  };

  const handleTest = async (integrationId: Id<"things">) => {
    try {
      const result = await testIntegration({ id: integrationId });

      if (result.success) {
        toast.success("Integration test successful!");
      } else {
        toast.error(`Integration test failed: ${result.error}`);
      }
    } catch (error: any) {
      toast.error(error.message || "Test failed");
    }
  };

  const handleDelete = async (integrationId: Id<"things">) => {
    if (!confirm("Are you sure you want to delete this integration?")) {
      return;
    }

    try {
      await deleteIntegration({ id: integrationId });
      toast.success("Integration deleted");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
    }
  };

  if (integrations === undefined || stats === undefined) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIntegrations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeIntegrations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Triggers (30d)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTriggers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalTriggers > 0 ? Math.round(stats.successRate * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.successfulTriggers} / {stats.totalTriggers} successful
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="integrations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4">
          {/* Add Integration Button */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Configured Integrations</h2>
              <p className="text-sm text-muted-foreground">
                Connect your funnel to external services
              </p>
            </div>

            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Integration
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Integration</DialogTitle>
                  <DialogDescription>
                    Connect your funnel to external services
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Integration Type */}
                  <div className="space-y-2">
                    <Label>Integration Type</Label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {INTEGRATION_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className="h-4 w-4" />
                              <span>{type.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Integration Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="My Webhook"
                      value={integrationName}
                      onChange={(e) => setIntegrationName(e.target.value)}
                    />
                  </div>

                  {/* Type-Specific Configuration */}
                  <IntegrationConfigForm
                    type={selectedType}
                    config={config}
                    onChange={setConfig}
                  />
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAdd}>Add Integration</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Integrations List */}
          {integrations.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Webhook className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">No integrations yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Connect external services to automate your workflow
                  </p>
                  <Button className="mt-4" onClick={() => setShowAddDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Integration
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {integrations.map((integration) => {
                const typeInfo = INTEGRATION_TYPES.find(
                  (t) => t.value === integration.properties?.integrationType
                );
                const Icon = typeInfo?.icon || Webhook;

                return (
                  <Card key={integration._id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="rounded-md bg-primary/10 p-2">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{integration.name}</CardTitle>
                            <CardDescription className="text-xs mt-1">
                              {typeInfo?.label || integration.properties?.integrationType}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant={integration.status === "active" ? "default" : "secondary"}>
                          {integration.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Success Rate */}
                        {integration.totalEvents > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Success Rate:</span>
                            <span className="font-medium">
                              {Math.round(integration.successRate * 100)}%
                            </span>
                          </div>
                        )}

                        {/* Recent Events Count */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Recent Events:</span>
                          <span className="font-medium">{integration.totalEvents || 0}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleTest(integration._id)}
                      >
                        <TestTube className="mr-2 h-4 w-4" />
                        Test
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(integration._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Activity</CardTitle>
              <CardDescription>
                Recent integration triggers and their results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {logs === undefined ? (
                <LoadingSkeleton />
              ) : logs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No activity yet
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div
                      key={log._id}
                      className="flex items-center justify-between border-b pb-2 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        {log.metadata?.action === "triggered_succeeded" ||
                        log.metadata?.action === "test_succeeded" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <div>
                          <div className="text-sm font-medium">
                            {log.integrationName || "Unknown Integration"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {log.metadata?.action?.replace(/_/g, " ")}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Configuration Form for Different Integration Types
function IntegrationConfigForm({
  type,
  config,
  onChange,
}: {
  type: string;
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}) {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  switch (type) {
    case "webhook":
      return (
        <>
          <div className="space-y-2">
            <Label htmlFor="webhookUrl">Webhook URL</Label>
            <Input
              id="webhookUrl"
              type="url"
              placeholder="https://example.com/webhook"
              value={config.webhookUrl || ""}
              onChange={(e) => updateConfig("webhookUrl", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="webhookMethod">HTTP Method</Label>
            <Select
              value={config.webhookMethod || "POST"}
              onValueChange={(v) => updateConfig("webhookMethod", v)}
            >
              <SelectTrigger id="webhookMethod">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="GET">GET</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      );

    case "zapier":
      return (
        <div className="space-y-2">
          <Label htmlFor="zapierHookUrl">Zapier Hook URL</Label>
          <Input
            id="zapierHookUrl"
            type="url"
            placeholder="https://hooks.zapier.com/hooks/catch/..."
            value={config.zapierHookUrl || ""}
            onChange={(e) => updateConfig("zapierHookUrl", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Get this URL from your Zapier webhook trigger
          </p>
        </div>
      );

    case "mailchimp":
      return (
        <>
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Your Mailchimp API key"
              value={config.apiKey || ""}
              onChange={(e) => updateConfig("apiKey", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="audienceId">Audience ID</Label>
            <Input
              id="audienceId"
              placeholder="abc123"
              value={config.audienceId || ""}
              onChange={(e) => updateConfig("audienceId", e.target.value)}
            />
          </div>
        </>
      );

    case "convertkit":
      return (
        <>
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Your ConvertKit API key"
              value={config.apiKey || ""}
              onChange={(e) => updateConfig("apiKey", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="listId">Form/List ID</Label>
            <Input
              id="listId"
              placeholder="123456"
              value={config.listId || ""}
              onChange={(e) => updateConfig("listId", e.target.value)}
            />
          </div>
        </>
      );

    case "activecampaign":
      return (
        <>
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Your ActiveCampaign API key"
              value={config.apiKey || ""}
              onChange={(e) => updateConfig("apiKey", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="crmDomain">Account Domain</Label>
            <Input
              id="crmDomain"
              placeholder="yourcompany"
              value={config.crmDomain || ""}
              onChange={(e) => updateConfig("crmDomain", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              From yourcompany.api-us1.com
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="listId">List ID</Label>
            <Input
              id="listId"
              placeholder="1"
              value={config.listId || ""}
              onChange={(e) => updateConfig("listId", e.target.value)}
            />
          </div>
        </>
      );

    case "hubspot":
      return (
        <div className="space-y-2">
          <Label htmlFor="apiKey">API Key/Access Token</Label>
          <Input
            id="apiKey"
            type="password"
            placeholder="Your HubSpot API key"
            value={config.apiKey || ""}
            onChange={(e) => updateConfig("apiKey", e.target.value)}
          />
        </div>
      );

    case "salesforce":
      return (
        <>
          <div className="space-y-2">
            <Label htmlFor="apiKey">Access Token</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Your Salesforce access token"
              value={config.apiKey || ""}
              onChange={(e) => updateConfig("apiKey", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="crmDomain">Instance Domain</Label>
            <Input
              id="crmDomain"
              placeholder="na1"
              value={config.crmDomain || ""}
              onChange={(e) => updateConfig("crmDomain", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              From na1.salesforce.com
            </p>
          </div>
        </>
      );

    case "pipedrive":
      return (
        <>
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Token</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Your Pipedrive API token"
              value={config.apiKey || ""}
              onChange={(e) => updateConfig("apiKey", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="crmDomain">Company Domain</Label>
            <Input
              id="crmDomain"
              placeholder="yourcompany"
              value={config.crmDomain || ""}
              onChange={(e) => updateConfig("crmDomain", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              From yourcompany.pipedrive.com
            </p>
          </div>
        </>
      );

    default:
      return null;
  }
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-1/3" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
