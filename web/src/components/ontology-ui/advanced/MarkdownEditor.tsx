/**
 * MarkdownEditor - Markdown editor with live preview
 *
 * Uses 6-token design system with split-pane editing.
 */

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "../utils";
import { Eye, Code, Split } from "lucide-react";

export interface MarkdownEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  minHeight?: string;
  maxHeight?: string;
  className?: string;
}

/**
 * MarkdownEditor - Edit and preview markdown
 *
 * @example
 * ```tsx
 * <MarkdownEditor
 *   value={markdown}
 *   onChange={(newMarkdown) => setMarkdown(newMarkdown)}
 * />
 * ```
 */
export function MarkdownEditor({
  value = "",
  onChange,
  minHeight = "400px",
  maxHeight = "600px",
  className,
}: MarkdownEditorProps) {
  const [markdown, setMarkdown] = useState(value);
  const [mode, setMode] = useState<"edit" | "preview" | "split">("edit");

  const handleChange = (newValue: string) => {
    setMarkdown(newValue);
    onChange?.(newValue);
  };

  // Simple markdown to HTML conversion (use marked.js or remark for production)
  const renderMarkdown = (md: string) => {
    return md
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      .replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>")
      .replace(/\*(.*)\*/gim, "<em>$1</em>")
      .replace(/!\[(.*?)\]\((.*?)\)/gim, "<img alt='$1' src='$2' />")
      .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2'>$1</a>")
      .replace(/\n$/gim, "<br />");
  };

  return (
    <Card className={cn("bg-background p-1 shadow-sm rounded-md", className)}>
      <CardContent className="bg-foreground p-4 rounded-md">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1">
            <Button
              variant={mode === "edit" ? "default" : "ghost"}
              size="sm"
              onClick={() => setMode("edit")}
              className="gap-2"
            >
              <Code className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant={mode === "preview" ? "default" : "ghost"}
              size="sm"
              onClick={() => setMode("preview")}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>
            <Button
              variant={mode === "split" ? "default" : "ghost"}
              size="sm"
              onClick={() => setMode("split")}
              className="gap-2"
            >
              <Split className="h-4 w-4" />
              Split
            </Button>
          </div>

          <span className="text-xs text-font/60">
            {markdown.length} characters
          </span>
        </div>

        {/* Editor/Preview Area */}
        <div className="border rounded-md overflow-hidden">
          {mode === "edit" && (
            <textarea
              value={markdown}
              onChange={(e) => handleChange(e.target.value)}
              className={cn(
                "w-full p-4 bg-background text-font font-mono text-sm",
                "focus:outline-none resize-none"
              )}
              style={{ minHeight, maxHeight }}
              placeholder="# Start writing markdown..."
            />
          )}

          {mode === "preview" && (
            <div
              className="p-4 bg-background prose prose-sm max-w-none"
              style={{ minHeight, maxHeight, overflow: "auto" }}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
            />
          )}

          {mode === "split" && (
            <div className="grid grid-cols-2 divide-x">
              <textarea
                value={markdown}
                onChange={(e) => handleChange(e.target.value)}
                className={cn(
                  "p-4 bg-background text-font font-mono text-sm",
                  "focus:outline-none resize-none"
                )}
                style={{ minHeight, maxHeight }}
                placeholder="# Start writing markdown..."
              />
              <div
                className="p-4 bg-foreground prose prose-sm max-w-none overflow-auto"
                style={{ minHeight, maxHeight }}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
              />
            </div>
          )}
        </div>

        {/* Markdown Guide */}
        <details className="mt-4">
          <summary className="text-xs text-font/60 cursor-pointer hover:text-font">
            Markdown Guide
          </summary>
          <div className="mt-2 text-xs text-font/60 space-y-1 pl-4">
            <div># Heading 1</div>
            <div>## Heading 2</div>
            <div>### Heading 3</div>
            <div>**bold text**</div>
            <div>*italic text*</div>
            <div>[link text](url)</div>
            <div>![image alt](image-url)</div>
          </div>
        </details>
      </CardContent>
    </Card>
  );
}
