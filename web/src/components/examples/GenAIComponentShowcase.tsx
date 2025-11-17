/**
 * GenAI Component Showcase
 * Demonstrates all available AI components with live examples
 */

import { Brain, Code, Lightbulb, MessageSquare, Sparkles, Wrench } from "lucide-react";
import { useState } from "react";
// Basic Components
import { CodeBlock } from "@/components/ai/CodeBlock";
import { LoadingIndicator } from "@/components/ai/LoadingIndicator";
import { Message } from "@/components/ai/Message";
import { MessageList } from "@/components/ai/MessageList";
import { PromptInput } from "@/components/ai/PromptInput";
// Premium Components
import { Reasoning } from "@/components/ai/Reasoning";
import { Suggestions } from "@/components/ai/Suggestions";
import { ToolCall } from "@/components/ai/ToolCall";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Demo data
const DEMO_CODE = `function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // 55`;

const DEMO_MESSAGES = [
  {
    id: "1",
    role: "user" as const,
    content: "Can you explain how async/await works in JavaScript?",
    timestamp: Date.now() - 60000,
  },
  {
    id: "2",
    role: "assistant" as const,
    content:
      "Async/await is syntactic sugar built on top of Promises that makes asynchronous code look and behave more like synchronous code. Here's how it works...",
    timestamp: Date.now() - 30000,
  },
  {
    id: "3",
    role: "user" as const,
    content: "That makes sense! Can you show me an example?",
    timestamp: Date.now() - 10000,
  },
];

const DEMO_SUGGESTIONS = [
  "Explain quantum computing in simple terms",
  "Write a Python function to sort a list",
  "What are the best practices for REST APIs?",
  "Help me debug this TypeScript error",
];

const DEMO_REASONING_STEPS = [
  {
    step: 1,
    title: "Analyze the problem",
    description: "Understanding the core requirements and constraints",
    completed: true,
  },
  {
    step: 2,
    title: "Design the solution",
    description: "Planning the implementation approach",
    completed: true,
  },
  {
    step: 3,
    title: "Write the code",
    description: "Implementing the solution with best practices",
    completed: true,
  },
  {
    step: 4,
    title: "Test and validate",
    description: "Ensuring correctness and edge case handling",
    completed: false,
  },
];

const DEMO_TOOL_CALL = {
  name: "searchDocs",
  args: {
    query: "React useEffect cleanup",
    maxResults: 3,
  },
  result: {
    results: [
      { title: "useEffect Hook", url: "https://react.dev/reference/react/useEffect" },
      {
        title: "Cleanup Function",
        url: "https://react.dev/learn/synchronizing-with-effects#cleanup",
      },
    ],
  },
  status: "completed" as const,
};

export function GenAIComponentShowcase() {
  const [input, setInput] = useState("");
  const [demoMessages, setDemoMessages] = useState(DEMO_MESSAGES);

  const handlePromptSubmit = (value: string) => {
    if (!value.trim()) return;

    const newMessage = {
      id: String(Date.now()),
      role: "user" as const,
      content: value,
      timestamp: Date.now(),
    };

    setDemoMessages([...demoMessages, newMessage]);
    setInput("");
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <Badge variant="outline" className="inline-flex items-center gap-2">
          <Code className="h-4 w-4" />
          Component Library
        </Badge>
        <h2 className="text-3xl font-bold">GenAI Components Showcase</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          All available AI components for building intelligent chat interfaces and agent experiences
        </p>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">
            <Sparkles className="h-4 w-4 mr-2" />
            Basic Components
          </TabsTrigger>
          <TabsTrigger value="premium">
            <Brain className="h-4 w-4 mr-2" />
            Premium Components
          </TabsTrigger>
        </TabsList>

        {/* Basic Components Tab */}
        <TabsContent value="basic" className="space-y-6 mt-6">
          {/* Message Component */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Message Component
              </CardTitle>
              <CardDescription>
                Individual message bubble for user and assistant messages with timestamps
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Message content="Hello! Can you help me with React hooks?" timestamp={Date.now()} />
              <Message
                content="Of course! I'd be happy to help you understand React hooks. What specific aspect would you like to learn about?"
                timestamp={Date.now()}
              />
              <Separator />
              <div className="text-xs text-muted-foreground font-mono bg-muted p-3 rounded">
                {`<Message role="user" content="Your message" timestamp={Date.now()} />`}
              </div>
            </CardContent>
          </Card>

          {/* MessageList Component */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                MessageList Component
              </CardTitle>
              <CardDescription>
                Scrollable list of messages with auto-scroll and loading state
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4 max-h-[300px] overflow-y-auto">
                <MessageList messages={DEMO_MESSAGES} isLoading={false} />
              </div>
              <Separator />
              <div className="text-xs text-muted-foreground font-mono bg-muted p-3 rounded">
                {`<MessageList messages={messages} isLoading={false} />`}
              </div>
            </CardContent>
          </Card>

          {/* PromptInput Component */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                PromptInput Component
              </CardTitle>
              <CardDescription>
                Auto-expanding textarea with submit button and loading state
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <PromptInput
                value={input}
                onChange={setInput}
                onSubmit={handlePromptSubmit}
                isLoading={false}
                placeholder="Type your message..."
              />
              <Separator />
              <div className="text-xs text-muted-foreground font-mono bg-muted p-3 rounded">
                {`<PromptInput value={input} onChange={setInput} onSubmit={handleSubmit} />`}
              </div>
            </CardContent>
          </Card>

          {/* Suggestions Component */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Suggestions Component
              </CardTitle>
              <CardDescription>
                Clickable prompt suggestions to help users get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Suggestions
                suggestions={DEMO_SUGGESTIONS}
                onSuggestionClick={(suggestion) => alert(`Selected: ${suggestion}`)}
              />
              <Separator />
              <div className="text-xs text-muted-foreground font-mono bg-muted p-3 rounded">
                {`<Suggestions suggestions={prompts} onSuggestionClick={handleClick} />`}
              </div>
            </CardContent>
          </Card>

          {/* CodeBlock Component */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                CodeBlock Component
              </CardTitle>
              <CardDescription>Syntax-highlighted code display with copy button</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CodeBlock code={DEMO_CODE} language="typescript" />
              <Separator />
              <div className="text-xs text-muted-foreground font-mono bg-muted p-3 rounded">
                {`<CodeBlock code={code} language="typescript" />`}
              </div>
            </CardContent>
          </Card>

          {/* LoadingIndicator Component */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                LoadingIndicator Component
              </CardTitle>
              <CardDescription>Animated loading indicator for AI thinking state</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <LoadingIndicator message="AI is thinking..." />
              <LoadingIndicator message="Generating response..." />
              <LoadingIndicator message="Processing your request..." />
              <Separator />
              <div className="text-xs text-muted-foreground font-mono bg-muted p-3 rounded">
                {`<LoadingIndicator message="AI is thinking..." />`}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Premium Components Tab */}
        <TabsContent value="premium" className="space-y-6 mt-6">
          {/* Reasoning Component */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Reasoning Component
              </CardTitle>
              <CardDescription>
                Visualize AI's step-by-step thinking process with completion status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Reasoning steps={DEMO_REASONING_STEPS} />
              <Separator />
              <div className="text-xs text-muted-foreground font-mono bg-muted p-3 rounded">
                {`<Reasoning steps={reasoningSteps} />`}
              </div>
            </CardContent>
          </Card>

          {/* ToolCall Component */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                ToolCall Component
              </CardTitle>
              <CardDescription>
                Display function/tool calls made by the AI with arguments and results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ToolCall {...DEMO_TOOL_CALL} />
              <Separator />
              <div className="text-xs text-muted-foreground font-mono bg-muted p-3 rounded">
                {`<ToolCall name="functionName" args={args} result={result} status="completed" />`}
              </div>
            </CardContent>
          </Card>

          {/* Complete Chat Demo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Complete Chat Interface
              </CardTitle>
              <CardDescription>
                Combination of components creating a full chat experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4 min-h-[400px] flex flex-col">
                <div className="flex-1 overflow-y-auto mb-4">
                  <MessageList messages={demoMessages} isLoading={false} />
                </div>
                <Separator className="mb-4" />
                <PromptInput
                  value={input}
                  onChange={setInput}
                  onSubmit={handlePromptSubmit}
                  isLoading={false}
                  placeholder="Try sending a message..."
                />
              </div>
              <div className="text-xs text-muted-foreground">
                This demo combines MessageList and PromptInput to create a functional chat interface
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Component Index */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>Component Index</CardTitle>
          <CardDescription>Quick reference for all available components</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Basic Components</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>
                  • <code className="text-xs bg-muted px-1 py-0.5 rounded">Message</code> -
                  Individual message bubble
                </li>
                <li>
                  • <code className="text-xs bg-muted px-1 py-0.5 rounded">MessageList</code> -
                  Scrollable message container
                </li>
                <li>
                  • <code className="text-xs bg-muted px-1 py-0.5 rounded">PromptInput</code> -
                  Auto-expanding input field
                </li>
                <li>
                  • <code className="text-xs bg-muted px-1 py-0.5 rounded">Suggestions</code> -
                  Clickable prompt suggestions
                </li>
                <li>
                  • <code className="text-xs bg-muted px-1 py-0.5 rounded">CodeBlock</code> -
                  Syntax-highlighted code
                </li>
                <li>
                  • <code className="text-xs bg-muted px-1 py-0.5 rounded">LoadingIndicator</code> -
                  Animated loading state
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Premium Components</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>
                  • <code className="text-xs bg-muted px-1 py-0.5 rounded">Reasoning</code> - AI
                  thinking visualization
                </li>
                <li>
                  • <code className="text-xs bg-muted px-1 py-0.5 rounded">ToolCall</code> -
                  Function call display
                </li>
                <li>
                  • <code className="text-xs bg-muted px-1 py-0.5 rounded">AgentMessage</code> -
                  Multi-type agent message
                </li>
                <li>
                  • <code className="text-xs bg-muted px-1 py-0.5 rounded">Chatbot</code> - Complete
                  chat interface
                </li>
                <li>
                  • <code className="text-xs bg-muted px-1 py-0.5 rounded">SimpleChatClient</code> -
                  Full chat client
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
