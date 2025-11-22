/**
 * AgentCard - Card for AI agents and automated systems
 *
 * Displays agent information with status, model, capabilities, and activity.
 * Supports thing-level branding for different AI platforms.
 */

import type { Thing } from "@/lib/ontology/types";
import { ThingCard } from "../universal/ThingCard";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "../utils";

interface AgentCardProps {
  agent: Thing;
  status?: "active" | "idle" | "offline";
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function AgentCard({
  agent,
  status,
  variant = "default",
  size = "md",
  interactive = true,
  onClick,
  className,
}: AgentCardProps) {
  const agentStatus = status ?? (agent.properties?.status as "active" | "idle" | "offline") ?? "idle";
  const capabilities = agent.properties?.capabilities as string[] | undefined;
  const model = agent.properties?.model as string;
  const tasks = agent.properties?.tasks as number;
  const lastActive = agent.properties?.lastActive as number;

  const statusColors: Record<string, string> = {
    active: "bg-tertiary/10 text-tertiary border-tertiary/30",
    idle: "bg-secondary/10 text-secondary border-secondary/30",
    offline: "bg-font/10 text-font border-font/30",
  };

  const statusIcons: Record<string, string> = {
    active: "🟢",
    idle: "🟡",
    offline: "⚫",
  };

  const contentPadding = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <ThingCard
      thing={agent}
      className={cn(
        interactive && "cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300",
        className
      )}
    >
      <div
        onClick={onClick}
        className={cn("bg-foreground rounded-md", contentPadding[size])}
      >
        <CardHeader className="px-0 pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className={cn(
                "flex items-center gap-2 text-font",
                size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg"
              )}>
                <span className="text-2xl">🤖</span>
                <span className="line-clamp-1">{agent.name}</span>
              </CardTitle>
              {agent.properties.description && (
                <CardDescription className="mt-1 line-clamp-2 text-font/70">
                  {agent.properties.description}
                </CardDescription>
              )}
            </div>
            <div className="flex items-center gap-2 ml-2">
              <span>{statusIcons[agentStatus]}</span>
              <Badge
                variant="outline"
                className={statusColors[agentStatus]}
              >
                {agentStatus}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 px-0">
          {model && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-font/60">Model:</span>
              <code className="text-xs font-mono bg-background px-2 py-1 rounded text-primary">
                {model}
              </code>
            </div>
          )}

          {tasks !== undefined && (
            <div className="flex items-center justify-between p-3 bg-background rounded-md">
              <span className="text-sm text-font/60">Tasks Completed</span>
              <span className="font-bold text-primary">{tasks}</span>
            </div>
          )}

          {capabilities && capabilities.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs text-font/60">Capabilities</span>
              <div className="flex flex-wrap gap-1">
                {capabilities.slice(0, 6).map((capability, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs border-font/20 text-font"
                  >
                    {capability}
                  </Badge>
                ))}
                {capabilities.length > 6 && (
                  <Badge
                    variant="outline"
                    className="text-xs border-font/20 text-font"
                  >
                    +{capabilities.length - 6} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {lastActive && (
            <div className="flex items-center gap-2 text-xs text-font/50 border-t border-font/10 pt-2">
              <span>⏱️</span>
              <span>Last active: {new Date(lastActive).toLocaleString()}</span>
            </div>
          )}

          {interactive && (
            <div className="text-xs text-font/40 opacity-0 group-hover:opacity-100 transition-opacity border-t border-font/10 pt-2">
              View agent details →
            </div>
          )}
        </CardContent>
      </div>
    </ThingCard>
  );
}
