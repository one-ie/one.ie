import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

export interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function PromptInput({ value, onChange, onSubmit, isLoading = false, placeholder = "Type..." }: PromptInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Ensure value is always a string
  const safeValue = value || '';

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
      textareaRef.current.style.height = newHeight + "px";
    }
  }, [safeValue]);

  const handleSubmit = () => {
    if (safeValue.trim() && !isLoading) {
      onSubmit(safeValue.trim());
      onChange("");
    }
  };

  return (
    <div className="flex gap-2">
      <Textarea
        ref={textareaRef}
        value={safeValue}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        placeholder={placeholder}
        disabled={isLoading}
        className="min-h-[44px] resize-none"
        rows={1}
      />
      <Button onClick={handleSubmit} disabled={isLoading || !safeValue.trim()} size="icon">
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
