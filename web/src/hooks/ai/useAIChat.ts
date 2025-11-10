import { useChat } from "ai/react";

export function useAIChat(agentId: string) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    body: { agentId },
  });

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
  };
}
