import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CopyButtonProps {
  text: string;
  className?: string;
  children?: React.ReactNode;
}

export function CopyButton({
  text,
  className = "",
  children,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      // Show success toast
      toast.success("Prompt copied! ✨", {
        description: "Paste it into Claude Code to start building →",
        duration: 3000,
        position: "top-center",
      });

      // Reset button state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);

      // Show error toast
      toast.error("Failed to copy", {
        description: "Try copying manually or refresh the page",
        duration: 3000,
        position: "top-center",
      });
    }
  };

  return (
    <Button
      onClick={handleCopy}
      className={`focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 ${className}`}
      size="lg"
      variant={copied ? "default" : "outline"}
      aria-label={
        copied ? "Prompt copied to clipboard" : "Copy prompt to clipboard"
      }
    >
      {children ? (
        children
      ) : copied ? (
        <>
          <Check className="h-5 w-5 mr-2" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="h-5 w-5 mr-2" />
          Copy Prompt
        </>
      )}
    </Button>
  );
}
