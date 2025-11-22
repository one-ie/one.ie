/**
 * Plugin Types
 * Type definitions for ElizaOS plugin integration
 */

export interface Plugin {
  _id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: PluginCategory;
  status: PluginStatus;
  npmPackage?: string;
  githubRepo?: string;
  registryUrl?: string;
  capabilities: string[];
  dependencies: string[];
  thumbnail?: string;
  rating?: number;
  reviewCount?: number;
  installCount?: number;
  tags: string[];
  settings?: PluginSetting[];
  actions?: PluginAction[];
}

export type PluginCategory =
  | "blockchain"
  | "knowledge"
  | "client"
  | "browser"
  | "llm"
  | "provider"
  | "evaluator"
  | "adapter"
  | "service";

export type PluginStatus = "available" | "installed" | "active" | "error";

export interface PluginSetting {
  id: string;
  name: string;
  description: string;
  type: "string" | "number" | "boolean" | "secret";
  required: boolean;
  defaultValue?: string | number | boolean;
}

export interface PluginAction {
  id: string;
  name: string;
  description: string;
  parameters: PluginActionParameter[];
}

export interface PluginActionParameter {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

export interface PluginInstance {
  _id: string;
  pluginId: string;
  groupId: string;
  installedAt: number;
  status: PluginStatus;
  config: Record<string, unknown>;
  lastUsed?: number;
  executionCount?: number;
  errorCount?: number;
}

export interface PluginDependency {
  pluginId: string;
  dependsOn: string[];
  requiredVersion?: string;
}

export interface PluginExecutionResult {
  success: boolean;
  result?: unknown;
  error?: string;
  executionTime: number;
  timestamp: number;
}
