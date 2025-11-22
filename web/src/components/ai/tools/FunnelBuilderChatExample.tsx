/**
 * FunnelBuilderChatExample - Example integration with ChatClientV2
 *
 * Shows how to integrate funnel builder tools with the chat interface.
 * This example can be copied and adapted for production use.
 *
 * @see /web/src/components/ai/ChatClientV2.tsx - Chat client
 * @see /web/src/components/ai/tools/INTEGRATION.md - Full integration guide
 */

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  useFunnelBuilderTools,
  FUNNEL_BUILDER_SYSTEM_PROMPT,
  listFunnelsTool,
  getFunnelTool,
} from "./index";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

/**
 * Example: Funnel Builder Chat Interface
 *
 * Integrates funnel builder tools with ChatClientV2 for conversational funnel creation.
 */
export function FunnelBuilderChatExample() {
  // Query funnels for list_funnels tool
  const funnelsQuery = useQuery(api.queries.funnels.list, {});

  // Get all funnel builder tools
  const funnelMutationTools = useFunnelBuilderTools();

  // Add query-based tools
  const queryTools = {
    list_funnels: listFunnelsTool(funnelsQuery),
    get_funnel: getFunnelTool((id) => {
      // In production, use useQuery with the ID
      // For example purposes, return null
      return null;
    }),
  };

  // Combine all tools
  const allTools = {
    ...funnelMutationTools,
    ...queryTools,
  };

  // Convert to array format for AI SDK
  const toolsArray = Object.entries(allTools).map(([name, tool]) => ({
    name,
    description: tool.description,
    parameters: tool.parameters,
    execute: tool.execute,
  }));

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            <div>
              <CardTitle className="text-2xl">
                AI Funnel Builder
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Create high-converting funnels through conversation
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Badge variant="secondary">
              {Object.keys(allTools).length} Tools Available
            </Badge>
            <Badge variant="outline">
              Powered by Convex
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Chat Interface */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* System Prompt Preview */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                System Prompt
              </p>
              <p className="text-sm text-muted-foreground">
                {FUNNEL_BUILDER_SYSTEM_PROMPT.split('\n')[0]}
              </p>
            </div>

            {/* Available Tools */}
            <div>
              <p className="text-sm font-medium mb-3">Available Tools</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(allTools).map(([name, tool]) => (
                  <div
                    key={name}
                    className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50 border"
                  >
                    <Badge variant="outline" className="text-xs">
                      {name}
                    </Badge>
                    <span className="text-xs text-muted-foreground truncate">
                      {tool.description.split('.')[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Example Prompts */}
            <div>
              <p className="text-sm font-medium mb-3">Try These Commands</p>
              <div className="space-y-2">
                <ExamplePrompt
                  prompt='Create a funnel called "Summer Sale 2024"'
                  tool="create_funnel"
                />
                <ExamplePrompt
                  prompt="Show me all my funnels"
                  tool="list_funnels"
                />
                <ExamplePrompt
                  prompt="Publish my summer sale funnel"
                  tool="publish_funnel"
                />
                <ExamplePrompt
                  prompt="Make a copy of my lead gen funnel"
                  tool="duplicate_funnel"
                />
              </div>
            </div>

            {/* Integration Code */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Integration Code
              </p>
              <pre className="text-xs overflow-x-auto">
                <code>{`import { useFunnelBuilderTools } from '@/components/ai/tools';

const tools = useFunnelBuilderTools();
const toolsArray = Object.entries(tools).map(([name, tool]) => ({
  name,
  description: tool.description,
  parameters: tool.parameters,
  execute: tool.execute,
}));

<ChatClientV2
  systemPrompt={FUNNEL_BUILDER_SYSTEM_PROMPT}
  tools={toolsArray}
/>`}</code>
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Production Note */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
        <CardContent className="p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Production Setup:</strong> Replace this example component with ChatClientV2
            and pass the tools array. The AI will automatically handle tool selection and execution
            based on user conversation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Example prompt display
 */
function ExamplePrompt({ prompt, tool }: { prompt: string; tool: string }) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-gray-950 border hover:border-purple-300 dark:hover:border-purple-700 transition-colors cursor-pointer">
      <Badge variant="secondary" className="text-xs shrink-0">
        {tool}
      </Badge>
      <span className="text-sm text-muted-foreground">"{prompt}"</span>
    </div>
  );
}

/**
 * Production Integration Example
 *
 * Use this pattern in your actual chat page:
 */
export function FunnelBuilderChatProduction() {
  const funnelsQuery = useQuery(api.queries.funnels.list, {});
  const funnelTools = useFunnelBuilderTools();

  const allTools = {
    ...funnelTools,
    list_funnels: listFunnelsTool(funnelsQuery),
  };

  const toolsArray = Object.entries(allTools).map(([name, tool]) => ({
    name,
    description: tool.description,
    parameters: tool.parameters,
    execute: tool.execute,
  }));

  // In production, replace this with actual ChatClientV2
  return (
    <div className="h-screen flex flex-col">
      {/* Chat Interface Would Go Here */}
      {/* <ChatClientV2 */}
      {/*   systemPrompt={FUNNEL_BUILDER_SYSTEM_PROMPT} */}
      {/*   tools={toolsArray} */}
      {/* /> */}

      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card>
          <CardContent className="p-8 text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-purple-600 dark:text-purple-400" />
            <h2 className="text-2xl font-bold mb-2">
              Funnel Builder Chat
            </h2>
            <p className="text-muted-foreground mb-4">
              {toolsArray.length} tools ready for conversational funnel building
            </p>
            <Badge variant="secondary">
              Replace this with ChatClientV2
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
