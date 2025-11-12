/**
 * Premium Features Showcase
 * Demonstrates advanced AI capabilities available in premium tier
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Reasoning } from '@/components/ai/Reasoning';
import { ToolCall } from '@/components/ai/ToolCall';
import { Sparkles, Brain, Wrench, History, Zap } from 'lucide-react';

const DEMO_REASONING_STEPS = [
  {
    step: 1,
    title: 'Analyze user request',
    description: 'Understanding the context and requirements of the query',
    completed: true,
  },
  {
    step: 2,
    title: 'Break down into sub-tasks',
    description: 'Identifying the key components needed for the solution',
    completed: true,
  },
  {
    step: 3,
    title: 'Generate solution',
    description: 'Creating the code/content based on best practices',
    completed: true,
  },
  {
    step: 4,
    title: 'Validate and optimize',
    description: 'Checking for errors and improving performance',
    completed: false,
  },
];

const DEMO_TOOL_CALL = {
  name: 'searchDocumentation',
  args: {
    query: 'React hooks useEffect dependencies',
    maxResults: 5,
  },
  result: {
    results: [
      { title: 'useEffect Hook', url: 'https://react.dev/reference/react/useEffect' },
      { title: 'Rules of Hooks', url: 'https://react.dev/warnings/invalid-hook-call-warning' },
    ],
  },
  status: 'completed' as const,
};

export function PremiumFeaturesShowcase() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <Badge variant="outline" className="inline-flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Premium Features
        </Badge>
        <h2 className="text-3xl font-bold">Advanced AI Capabilities</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Upgrade to unlock powerful features like reasoning visualization, tool integration,
          persistent chat history, and more.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 mb-3">
              <Brain className="h-6 w-6 text-blue-500" />
            </div>
            <CardTitle className="text-lg">Agent Reasoning</CardTitle>
            <CardDescription className="text-sm">
              See how the AI thinks and approaches complex problems step-by-step
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10 mb-3">
              <Wrench className="h-6 w-6 text-purple-500" />
            </div>
            <CardTitle className="text-lg">Tool Integration</CardTitle>
            <CardDescription className="text-sm">
              AI can use external tools, APIs, and data sources to enhance responses
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10 mb-3">
              <History className="h-6 w-6 text-green-500" />
            </div>
            <CardTitle className="text-lg">Persistent History</CardTitle>
            <CardDescription className="text-sm">
              All conversations saved automatically and accessible across devices
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-500/10 mb-3">
              <Zap className="h-6 w-6 text-yellow-500" />
            </div>
            <CardTitle className="text-lg">Priority Processing</CardTitle>
            <CardDescription className="text-sm">
              Faster response times and access to the latest AI models
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Interactive Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Demo</CardTitle>
          <CardDescription>
            See premium features in action with live examples
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="reasoning" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="reasoning">
                <Brain className="h-4 w-4 mr-2" />
                Reasoning
              </TabsTrigger>
              <TabsTrigger value="tools">
                <Wrench className="h-4 w-4 mr-2" />
                Tool Calls
              </TabsTrigger>
            </TabsList>

            <TabsContent value="reasoning" className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Example: Code Generation Request</h4>
                <p className="text-sm text-muted-foreground">
                  Watch how the AI breaks down a coding task into logical steps
                </p>
              </div>
              <Reasoning steps={DEMO_REASONING_STEPS} />
            </TabsContent>

            <TabsContent value="tools" className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Example: Documentation Search</h4>
                <p className="text-sm text-muted-foreground">
                  The AI can search documentation and provide context-aware answers
                </p>
              </div>
              <ToolCall {...DEMO_TOOL_CALL} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border-2">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-xl font-bold">Ready to upgrade?</h3>
              <p className="text-sm text-muted-foreground">
                Get access to all premium features for $29/month
              </p>
            </div>
            <div className="flex gap-2">
              <a href="/upgrade" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6">
                Upgrade Now
              </a>
              <a href="/features" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-6">
                Learn More
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
