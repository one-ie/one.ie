/**
 * PluginActionExecutor Component
 * Manual execution of plugin actions with parameter input
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { Plugin, PluginAction, PluginExecutionResult } from "@/types/plugin";
import { AlertCircle, CheckCircle2, Loader2, Play } from "lucide-react";
import { useState } from "react";

interface PluginActionExecutorProps {
  plugin: Plugin;
  onExecute?: (actionId: string, params: Record<string, unknown>) => Promise<PluginExecutionResult>;
}

export function PluginActionExecutor({
  plugin,
  onExecute,
}: PluginActionExecutorProps) {
  const [selectedAction, setSelectedAction] = useState<PluginAction | null>(
    plugin.actions?.[0] || null
  );
  const [params, setParams] = useState<Record<string, unknown>>({});
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<PluginExecutionResult | null>(null);

  if (!plugin.actions || plugin.actions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <p>This plugin has no executable actions</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleActionChange = (actionId: string) => {
    const action = plugin.actions?.find((a) => a.id === actionId);
    setSelectedAction(action || null);
    setParams({});
    setResult(null);
  };

  const handleParamChange = (name: string, value: unknown) => {
    setParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleExecute = async () => {
    if (!selectedAction || !onExecute) return;

    setExecuting(true);
    setResult(null);

    try {
      const executionResult = await onExecute(selectedAction.id, params);
      setResult(executionResult);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Execution failed",
        executionTime: 0,
        timestamp: Date.now(),
      });
    } finally {
      setExecuting(false);
    }
  };

  const requiredParamsMissing = selectedAction?.parameters.some(
    (p) => p.required && !params[p.name]
  );

  return (
    <div className="space-y-4">
      {/* Action Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Action</CardTitle>
          <CardDescription>Choose an action to execute</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedAction?.id}
            onValueChange={handleActionChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an action" />
            </SelectTrigger>
            <SelectContent>
              {plugin.actions?.map((action) => (
                <SelectItem key={action.id} value={action.id}>
                  {action.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedAction && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium">{selectedAction.name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedAction.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Parameters */}
      {selectedAction && selectedAction.parameters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Parameters</CardTitle>
            <CardDescription>
              Configure action parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedAction.parameters.map((param) => (
              <div key={param.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={param.name} className="font-medium">
                    {param.name}
                  </Label>
                  <Badge variant={param.required ? "destructive" : "outline"} className="text-xs">
                    {param.required ? "Required" : "Optional"}
                  </Badge>
                </div>
                {param.description && (
                  <p className="text-sm text-muted-foreground">
                    {param.description}
                  </p>
                )}
                <Input
                  id={param.name}
                  value={(params[param.name] as string) || ""}
                  onChange={(e) => handleParamChange(param.name, e.target.value)}
                  placeholder={`Enter ${param.name}...`}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Execute Button */}
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={handleExecute}
            disabled={executing || requiredParamsMissing}
            className="w-full"
            size="lg"
          >
            {executing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Execute Action
              </>
            )}
          </Button>
          {requiredParamsMissing && (
            <p className="text-sm text-muted-foreground text-center mt-2">
              Please fill in all required parameters
            </p>
          )}
        </CardContent>
      </Card>

      {/* Result */}
      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              {result.success ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <CardTitle>Execution Successful</CardTitle>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  <CardTitle>Execution Failed</CardTitle>
                </>
              )}
            </div>
            <CardDescription>
              Completed in {result.executionTime}ms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Separator className="mb-4" />
            {result.success && result.result && (
              <div className="space-y-2">
                <Label>Result</Label>
                <Textarea
                  value={JSON.stringify(result.result, null, 2)}
                  readOnly
                  className="font-mono text-sm"
                  rows={10}
                />
              </div>
            )}
            {!result.success && result.error && (
              <div className="space-y-2">
                <Label className="text-destructive">Error</Label>
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive font-mono">
                    {result.error}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
