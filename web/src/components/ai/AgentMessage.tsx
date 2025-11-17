import { GenerativeUIRenderer } from "@/components/generative-ui/GenerativeUIRenderer";
import { Button } from "@/components/ui/button";
import { Message } from "./Message";
import { Reasoning } from "./Reasoning";
import { ToolCall } from "./ToolCall";

interface ActionPayload {
  actions: Array<{ id: string; label: string }>;
}

interface UIPayload {
  [key: string]: unknown;
}

interface ReasoningPayload {
  steps: Array<{ step: number; title: string; description: string; completed: boolean }>;
}

interface ToolCallPayload {
  name: string;
  args: Record<string, unknown>;
  result?: unknown;
  status?: "pending" | "running" | "completed" | "failed";
}

type MessagePayload =
  | { text: string }
  | UIPayload
  | ActionPayload
  | ReasoningPayload
  | ToolCallPayload
  | { message: string };

export interface AgentUIMessage {
  type: "text" | "ui" | "action" | "reasoning" | "tool_call" | "error";
  payload: MessagePayload;
  timestamp: number;
}

export interface AgentMessageProps {
  message: AgentUIMessage;
}

export function AgentMessage({ message }: AgentMessageProps) {
  switch (message.type) {
    case "text":
      return <Message content={message.payload.text} timestamp={message.timestamp} />;
    case "ui":
      return (
        <div className="p-4">
          <GenerativeUIRenderer payload={message.payload} />
        </div>
      );
    case "action": {
      const actionPayload = message.payload as ActionPayload;
      return (
        <div className="space-y-2 p-4">
          <p className="text-sm font-medium">Suggested actions:</p>
          <div className="flex flex-wrap gap-2">
            {actionPayload.actions.map((action) => (
              <Button key={action.id} variant="outline" size="sm">
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      );
    }
    case "reasoning":
      return (
        <div className="p-4">
          <Reasoning steps={message.payload.steps} />
        </div>
      );
    case "tool_call":
      return (
        <div className="p-4">
          <ToolCall {...message.payload} />
        </div>
      );
    default:
      return <Message content="Unknown message type" timestamp={message.timestamp} />;
  }
}
