import { useState } from "react";
import { Copy, Check, X, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SendToClaudeCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: string;
  projectTitle: string;
}

export function SendToClaudeCodeModal({
  isOpen,
  onClose,
  prompt,
  projectTitle,
}: SendToClaudeCodeModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      toast.success("Copied to clipboard!", {
        description: "Ready to paste into Claude Code",
        duration: 2000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy");
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
        role="presentation"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-background border rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-background">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary">
                <Code2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Send to Claude Code</h2>
                <p className="text-sm text-muted-foreground">{projectTitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Instructions */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
                    1
                  </span>
                  Copy the prompt below
                </h3>
                <Button
                  onClick={handleCopy}
                  size="sm"
                  className="w-full"
                  variant={copied ? "default" : "outline"}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied to Clipboard!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Prompt
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-muted p-4 rounded-lg border font-mono text-xs overflow-auto max-h-48 whitespace-pre-wrap break-words">
                {prompt}
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
                    2
                  </span>
                  Open Claude Code
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  If you don't have Claude Code installed yet, get it from the{" "}
                  <a
                    href="https://github.com/one-ie/cli"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    Claude Code GitHub
                  </a>
                  {" "}or via npm:
                </p>
                <div className="bg-muted p-3 rounded border font-mono text-xs">
                  npx oneie --project
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
                    3
                  </span>
                  Paste & Start Building
                </h3>
                <p className="text-sm text-muted-foreground">
                  Paste the prompt you copied into Claude Code's chat. It will set up the project scaffolding and help you build it step-by-step.
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>What's Next:</strong> Claude Code will guide you through building the project with real-time code suggestions, testing, and deployment help.
                </p>
              </div>
            </div>

            {/* Learn More Link */}
            <div className="pt-4 border-t">
              <a
                href="/quick-start"
                className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
              >
                Learn more in our Quick Start guide →
              </a>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t bg-muted/30">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Close
            </Button>
            <Button onClick={handleCopy} className="flex-1">
              {copied ? "Copied!" : "Copy Prompt"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
