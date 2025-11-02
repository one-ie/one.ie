import { useState } from 'react';
import { ExternalLink, Code2, Copy, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProjectDetailViewProps {
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  demoUrl: string;
  prompt: string;
  features?: string[];
  learningPath?: string[];
  technologies?: string[];
  estimatedHours?: number;
  difficulty?: string;
}

export function ProjectDetailView({
  title,
  description,
  level,
  demoUrl,
  prompt,
  features = [],
  learningPath = [],
  technologies = [],
  estimatedHours,
  difficulty,
}: ProjectDetailViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">{title}</h1>
            <p className="text-base text-muted-foreground max-w-2xl">{description}</p>
          </div>
          <Badge variant="secondary" className="flex-shrink-0">
            {level}
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          <a
            href={demoUrl}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-primary"
          >
            <ExternalLink className="h-4 w-4" />
            View Demo
          </a>
          <button
            onClick={handleCopyPrompt}
            className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-primary"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Prompt
              </>
            )}
          </button>
          <button className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-primary">
            <Code2 className="h-4 w-4" />
            Send to Claude Code
          </button>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        {estimatedHours && (
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">Estimated Time</p>
            <p className="text-lg font-semibold">{estimatedHours}h</p>
          </div>
        )}
        {difficulty && (
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">Difficulty</p>
            <p className="text-lg font-semibold">{difficulty}</p>
          </div>
        )}
        {technologies.length > 0 && (
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">Tech Stack</p>
            <div className="flex flex-wrap gap-1">
              {technologies.slice(0, 3).map((tech) => (
                <Badge key={tech} variant="secondary" className="text-xs">
                  {tech}
                </Badge>
              ))}
              {technologies.length > 3 && (
                <span className="text-xs text-muted-foreground">+{technologies.length - 3}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Features */}
      {features.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Key Features</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3 rounded-lg border border-border/50 p-3">
                <span className="text-primary font-bold flex-shrink-0">✓</span>
                <span className="text-sm text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learning Path */}
      {learningPath.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">What You'll Learn</h2>
          <ul className="space-y-2">
            {learningPath.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm">
                <span className="text-primary mt-1 flex-shrink-0">→</span>
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Prompt Display */}
      <div className="mt-8 pt-8 border-t">
        <h2 className="text-xl font-bold mb-4">Project Prompt</h2>
        <div className="relative">
          <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-xs whitespace-pre-wrap text-foreground mb-4">
            {prompt}
          </pre>
          <button
            onClick={handleCopyPrompt}
            className="absolute top-4 right-4 p-2 rounded bg-primary/20 hover:bg-primary/30 transition-colors"
          >
            {copied ? (
              <Check className="h-4 w-4 text-primary" />
            ) : (
              <Copy className="h-4 w-4 text-primary" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
