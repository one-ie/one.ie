/**
 * Clone Tools Configuration Component
 *
 * Allows creators to:
 * - Enable/disable tools for their AI clone
 * - Configure tool permissions
 * - Set rate limits per tool
 * - View tool usage history
 *
 * Follows 6-dimension ontology and standard component patterns.
 */

import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Search,
  Edit,
  Calendar,
  Mail,
  CalendarCheck,
  BookOpen,
  ShoppingBag,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { toolMetadata, type CloneToolName } from '@/lib/ai/tools/clone-tools';

/**
 * Tool icon mapping
 */
const iconMap = {
  search: Search,
  edit: Edit,
  calendar: Calendar,
  mail: Mail,
  'calendar-check': CalendarCheck,
  'book-open': BookOpen,
  'shopping-bag': ShoppingBag,
};

interface CloneToolsConfigProps {
  cloneId: string;
  onUpdate?: () => void;
}

export function CloneToolsConfig({ cloneId, onUpdate }: CloneToolsConfigProps) {
  const [selectedTool, setSelectedTool] = useState<CloneToolName | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Query tool usage history
  const toolUsage = useQuery(api.mutations.cloneToolCalls.getToolUsageHistory, {
    cloneId,
    limit: 50,
  });

  // Mutation to update tool configuration
  // const updateToolConfig = useMutation(api.mutations.cloneToolCalls.updateToolConfig);

  // Local state for tool configuration
  const [toolConfig, setToolConfig] = useState<Record<string, any>>(() => {
    // Initialize with defaults from metadata
    const config: Record<string, any> = {};
    Object.entries(toolMetadata).forEach(([toolName, meta]) => {
      config[toolName] = {
        enabled: false,
        requiresApproval: meta.requiresApproval,
        rateLimitPerHour: meta.rateLimitPerHour,
      };
    });
    return config;
  });

  /**
   * Toggle tool enabled/disabled
   */
  const handleToggleTool = (toolName: string) => {
    setToolConfig((prev) => ({
      ...prev,
      [toolName]: {
        ...prev[toolName],
        enabled: !prev[toolName].enabled,
      },
    }));
  };

  /**
   * Update rate limit for a tool
   */
  const handleRateLimitChange = (toolName: string, limit: number) => {
    setToolConfig((prev) => ({
      ...prev,
      [toolName]: {
        ...prev[toolName],
        rateLimitPerHour: limit,
      },
    }));
  };

  /**
   * Toggle approval requirement for a tool
   */
  const handleToggleApproval = (toolName: string) => {
    setToolConfig((prev) => ({
      ...prev,
      [toolName]: {
        ...prev[toolName],
        requiresApproval: !prev[toolName].requiresApproval,
      },
    }));
  };

  /**
   * Save configuration to backend
   */
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Call mutation to save tool config
      // await updateToolConfig({ cloneId, config: toolConfig });

      // Placeholder success
      setTimeout(() => {
        setIsSaving(false);
        onUpdate?.();
      }, 1000);
    } catch (error) {
      console.error('Failed to save tool config:', error);
      setIsSaving(false);
    }
  };

  /**
   * Format timestamp for display
   */
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffMins < 1440) {
      return `${Math.floor(diffMins / 60)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Clone Tools Configuration</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure which tools your AI clone can use and set permissions.
        </p>
      </div>

      <Tabs defaultValue="tools" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="usage">Usage History</TabsTrigger>
        </TabsList>

        {/* Tools Configuration Tab */}
        <TabsContent value="tools" className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Tools marked as "Requires Approval" will need your confirmation before executing.
            </AlertDescription>
          </Alert>

          {/* Tools Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(toolMetadata).map(([toolName, meta]) => {
              const Icon = iconMap[meta.icon as keyof typeof iconMap] || Search;
              const config = toolConfig[toolName];

              return (
                <Card key={toolName} className={config.enabled ? 'border-primary' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{meta.name}</CardTitle>
                          <CardDescription className="text-xs">
                            {meta.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Switch
                        checked={config.enabled}
                        onCheckedChange={() => handleToggleTool(toolName)}
                      />
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-normal">Category</Label>
                      <Badge variant="outline" className="text-xs">
                        {meta.category}
                      </Badge>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`approval-${toolName}`} className="text-xs font-normal">
                          Requires Approval
                        </Label>
                        <Switch
                          id={`approval-${toolName}`}
                          checked={config.requiresApproval}
                          onCheckedChange={() => handleToggleApproval(toolName)}
                          disabled={!config.enabled}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor={`rate-${toolName}`} className="text-xs font-normal">
                          Rate Limit (per hour)
                        </Label>
                        <Input
                          id={`rate-${toolName}`}
                          type="number"
                          min={1}
                          max={1000}
                          value={config.rateLimitPerHour}
                          onChange={(e) =>
                            handleRateLimitChange(toolName, parseInt(e.target.value))
                          }
                          disabled={!config.enabled}
                          className="h-8"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </TabsContent>

        {/* Usage History Tab */}
        <TabsContent value="usage" className="space-y-4">
          {!toolUsage ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading usage history...
            </div>
          ) : toolUsage.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No tool usage yet. Enable tools to start tracking usage.
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Recent Tool Calls</CardTitle>
                <CardDescription>
                  Last {toolUsage.length} tool executions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tool</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {toolUsage.map((usage: any, index: number) => {
                      const meta = toolMetadata[usage.toolName as CloneToolName];
                      const Icon = meta
                        ? iconMap[meta.icon as keyof typeof iconMap]
                        : Search;

                      return (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                              <span className="font-medium">
                                {meta?.name || usage.toolName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {usage.success ? (
                              <Badge variant="default" className="gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Success
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="gap-1">
                                <XCircle className="h-3 w-3" />
                                Failed
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatTimestamp(usage.timestamp)}
                          </TableCell>
                          <TableCell className="text-sm text-destructive">
                            {usage.errorMessage || '—'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="text-2xl font-bold">
                {Object.values(toolConfig).filter((c) => c.enabled).length}
              </div>
              <p className="text-xs text-muted-foreground">Enabled Tools</p>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {toolUsage?.filter((u: any) => u.success).length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Successful Calls</p>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {toolUsage?.filter((u: any) => !u.success).length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Failed Calls</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Compact tool selector for clone chat interface
 */
interface ToolSelectorProps {
  cloneId: string;
  enabledTools: string[];
  onToolToggle: (toolName: string) => void;
}

export function ToolSelector({ cloneId, enabledTools, onToolToggle }: ToolSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(toolMetadata).map(([toolName, meta]) => {
        const Icon = iconMap[meta.icon as keyof typeof iconMap] || Search;
        const isEnabled = enabledTools.includes(toolName);

        return (
          <Badge
            key={toolName}
            variant={isEnabled ? 'default' : 'outline'}
            className="cursor-pointer gap-1 px-3 py-1"
            onClick={() => onToolToggle(toolName)}
          >
            <Icon className="h-3 w-3" />
            {meta.name}
          </Badge>
        );
      })}
    </div>
  );
}
