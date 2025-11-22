/**
 * CodeEditor - Code editor with syntax highlighting
 *
 * Uses 6-token design system. For production, consider Monaco Editor or CodeMirror.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "../utils";
import { Copy, Download, Code } from "lucide-react";

export interface CodeEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  language?: "javascript" | "typescript" | "python" | "json" | "html" | "css";
  readOnly?: boolean;
  showLineNumbers?: boolean;
  minHeight?: string;
  maxHeight?: string;
  className?: string;
}

/**
 * CodeEditor - Simple code editor (use Monaco for production)
 *
 * @example
 * ```tsx
 * <CodeEditor
 *   language="typescript"
 *   value={code}
 *   onChange={(newCode) => setCode(newCode)}
 *   showLineNumbers
 * />
 * ```
 */
export function CodeEditor({
  value = "",
  onChange,
  language = "javascript",
  readOnly = false,
  showLineNumbers = true,
  minHeight = "300px",
  maxHeight = "600px",
  className,
}: CodeEditorProps) {
  const [code, setCode] = useState(value);
  const [selectedLanguage, setSelectedLanguage] = useState(language);

  const handleChange = (newValue: string) => {
    setCode(newValue);
    onChange?.(newValue);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code.${selectedLanguage}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className={cn("bg-background p-1 shadow-sm rounded-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4 text-font/60" />
          <Select
            value={selectedLanguage}
            onValueChange={(val) => setSelectedLanguage(val as typeof language)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="typescript">TypeScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="html">HTML</SelectItem>
              <SelectItem value="css">CSS</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            title="Copy to clipboard"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={downloadCode}
            title="Download code"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="bg-foreground p-0 rounded-md overflow-hidden">
        <div className="flex">
          {/* Line Numbers */}
          {showLineNumbers && (
            <div className="bg-background text-font/40 p-4 pr-3 select-none font-mono text-sm">
              {code.split("\n").map((_, i) => (
                <div key={i} className="text-right">
                  {i + 1}
                </div>
              ))}
            </div>
          )}

          {/* Editor */}
          <textarea
            value={code}
            onChange={(e) => handleChange(e.target.value)}
            readOnly={readOnly}
            className={cn(
              "flex-1 p-4 bg-foreground text-font font-mono text-sm",
              "focus:outline-none resize-none",
              "placeholder:text-font/40"
            )}
            style={{
              minHeight,
              maxHeight,
            }}
            placeholder={`Enter ${selectedLanguage} code...`}
            spellCheck={false}
          />
        </div>

        {/* Footer */}
        <div className="bg-background px-4 py-2 border-t flex items-center justify-between text-xs text-font/60">
          <span>
            {code.split("\n").length} lines, {code.length} characters
          </span>
          <span className="uppercase">{selectedLanguage}</span>
        </div>
      </CardContent>
    </Card>
  );
}
