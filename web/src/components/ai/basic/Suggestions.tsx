import React from "react";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";

export interface SuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

export function Suggestions({ suggestions, onSuggestionClick }: SuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Lightbulb className="h-4 w-4" />
        <span>Suggested prompts:</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {suggestions.map((suggestion, i) => (
          <Button
            key={i}
            variant="outline"
            className="h-auto justify-start whitespace-normal text-left"
            onClick={() => onSuggestionClick(suggestion)}
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
}
