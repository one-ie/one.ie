"use client";

import { Shimmer } from "@/components/ai/elements/shimmer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

/**
 * Shimmer Effect Examples
 *
 * Demonstrates various use cases for the Shimmer component:
 * - Headings and hero text
 * - Loading states
 * - CTAs and buttons
 * - AI streaming text
 * - Feature highlights
 */
const Example = () => (
  <div className="flex flex-col items-center justify-center gap-8 p-8 max-w-5xl mx-auto">
    {/* Hero Section */}
    <div className="text-center space-y-4">
      <Shimmer as="h1" className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text">
        Beautiful Shimmer Effects
      </Shimmer>
      <Shimmer as="p" className="text-xl text-muted-foreground" duration={3}>
        Create stunning animated text with smooth gradients
      </Shimmer>
    </div>

    <Separator className="my-4" />

    {/* Use Cases Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {/* Basic Usage */}
      <Card>
        <CardHeader>
          <Badge variant="secondary" className="w-fit">Basic</Badge>
          <CardTitle>Default Shimmer</CardTitle>
          <CardDescription>Standard animated gradient effect</CardDescription>
        </CardHeader>
        <CardContent>
          <Shimmer className="text-2xl font-semibold">
            Simple Text Effect
          </Shimmer>
        </CardContent>
      </Card>

      {/* Fast Shimmer */}
      <Card>
        <CardHeader>
          <Badge variant="secondary" className="w-fit">Fast</Badge>
          <CardTitle>Quick Animation</CardTitle>
          <CardDescription>Faster animation for urgency</CardDescription>
        </CardHeader>
        <CardContent>
          <Shimmer duration={1} className="text-2xl font-semibold text-orange-600">
            Limited Time Offer!
          </Shimmer>
        </CardContent>
      </Card>

      {/* Slow Shimmer */}
      <Card>
        <CardHeader>
          <Badge variant="secondary" className="w-fit">Slow</Badge>
          <CardTitle>Elegant Animation</CardTitle>
          <CardDescription>Slower animation for elegance</CardDescription>
        </CardHeader>
        <CardContent>
          <Shimmer duration={4} spread={3} className="text-2xl font-semibold">
            Premium Feature
          </Shimmer>
        </CardContent>
      </Card>

      {/* AI Streaming */}
      <Card>
        <CardHeader>
          <Badge variant="secondary" className="w-fit">AI</Badge>
          <CardTitle>Streaming Text</CardTitle>
          <CardDescription>Simulate AI response streaming</CardDescription>
        </CardHeader>
        <CardContent>
          <Shimmer duration={2.5} className="text-lg font-mono">
            Generating response...
          </Shimmer>
        </CardContent>
      </Card>

      {/* CTA Button Text */}
      <Card>
        <CardHeader>
          <Badge variant="secondary" className="w-fit">CTA</Badge>
          <CardTitle>Call to Action</CardTitle>
          <CardDescription>Attention-grabbing CTAs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 text-center">
            <Shimmer duration={1.5} className="text-white text-xl font-bold">
              Start Free Trial
            </Shimmer>
          </div>
        </CardContent>
      </Card>

      {/* Feature Highlight */}
      <Card>
        <CardHeader>
          <Badge variant="secondary" className="w-fit">Feature</Badge>
          <CardTitle>Highlight Features</CardTitle>
          <CardDescription>Draw attention to key features</CardDescription>
        </CardHeader>
        <CardContent>
          <Shimmer as="div" className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text">
            NEW ✨ Dark Mode
          </Shimmer>
        </CardContent>
      </Card>
    </div>

    <Separator className="my-4" />

    {/* Real-World Examples */}
    <div className="w-full space-y-6">
      <h2 className="text-3xl font-bold text-center">Real-World Use Cases</h2>

      {/* Landing Page Hero */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
        <CardHeader>
          <CardTitle>Landing Page Hero</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <Shimmer as="h1" className="text-5xl font-bold" duration={3}>
            Transform Your Workflow
          </Shimmer>
          <Shimmer as="p" className="text-xl text-muted-foreground" duration={2.5} spread={2}>
            The all-in-one platform for modern teams
          </Shimmer>
        </CardContent>
      </Card>

      {/* Loading State */}
      <Card>
        <CardHeader>
          <CardTitle>AI Processing Indicator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Shimmer duration={1.5} className="text-lg">
            🤖 Analyzing your request...
          </Shimmer>
          <Shimmer duration={2} className="text-sm text-muted-foreground">
            Processing with advanced AI models
          </Shimmer>
        </CardContent>
      </Card>

      {/* Pricing Feature */}
      <Card className="border-2 border-purple-500">
        <CardHeader>
          <CardTitle>Pricing Highlight</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <Shimmer as="div" className="text-4xl font-bold" duration={2}>
            $29/month
          </Shimmer>
          <Shimmer duration={1.8} spread={2} className="text-sm font-semibold text-green-600">
            🔥 50% OFF for early adopters
          </Shimmer>
        </CardContent>
      </Card>
    </div>

    <Separator className="my-4" />

    {/* Usage Guide */}
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Usage Guide</CardTitle>
        <CardDescription>How to use the Shimmer component</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-semibold">Basic Usage:</h4>
          <code className="block bg-muted p-3 rounded-lg text-sm">
            {`<Shimmer>Your text here</Shimmer>`}
          </code>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold">With Custom Element:</h4>
          <code className="block bg-muted p-3 rounded-lg text-sm">
            {`<Shimmer as="h1" className="text-4xl">Heading</Shimmer>`}
          </code>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold">Custom Animation:</h4>
          <code className="block bg-muted p-3 rounded-lg text-sm">
            {`<Shimmer duration={3} spread={4}>Slow shimmer</Shimmer>`}
          </code>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold">Props:</h4>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li><code>as</code> - HTML element type (default: "p")</li>
            <li><code>duration</code> - Animation duration in seconds (default: 2)</li>
            <li><code>spread</code> - Gradient spread multiplier (default: 2)</li>
            <li><code>className</code> - Additional Tailwind classes</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default Example;
