"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Code } from "lucide-react";

interface CodeExample {
  language: string;
  code: string;
  label?: string;
}

interface CodePlaygroundProps {
  title?: string;
  description?: string;
  examples: CodeExample[];
  runnable?: boolean;
}

/**
 * Live Code Playground Component
 *
 * Interactive code examples with syntax highlighting.
 * Shows implementation in multiple languages.
 *
 * Usage in MDX:
 * <CodePlayground
 *   title="Sign In with Magic Link"
 *   description="Copy and paste this code to add magic link authentication"
 *   examples={[
 *     {
 *       language: "typescript",
 *       label: "TypeScript",
 *       code: `const result = await auth.magicLink.send({ email });`
 *     },
 *     {
 *       language: "javascript",
 *       label: "JavaScript",
 *       code: `const result = await auth.magicLink.send({ email });`
 *     }
 *   ]}
 * />
 */
export function CodePlayground({
  title = "Code Example",
  description,
  examples,
  runnable = false
}: CodePlaygroundProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="my-8 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
          {runnable && <Badge variant="outline">Live Preview</Badge>}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground mt-2">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        {examples.length === 1 ? (
          <div className="relative">
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-2 top-2 z-10"
              onClick={() => handleCopy(examples[0].code)}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs leading-relaxed">
              <code>{examples[0].code}</code>
            </pre>
          </div>
        ) : (
          <Tabs defaultValue={examples[0].language}>
            <TabsList>
              {examples.map((example) => (
                <TabsTrigger key={example.language} value={example.language}>
                  {example.label || example.language}
                </TabsTrigger>
              ))}
            </TabsList>
            {examples.map((example) => (
              <TabsContent key={example.language} value={example.language}>
                <div className="relative">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute right-2 top-2 z-10"
                    onClick={() => handleCopy(example.code)}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs leading-relaxed">
                    <code>{example.code}</code>
                  </pre>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
