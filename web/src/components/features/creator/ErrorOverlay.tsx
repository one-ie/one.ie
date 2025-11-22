"use client";

import { XIcon, AlertTriangleIcon, AlertCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorOverlayProps {
	error: {
		message: string;
		stack?: string;
		line?: number;
		column?: number;
	};
	onDismiss?: () => void;
	className?: string;
}

export function ErrorOverlay({ error, onDismiss, className }: ErrorOverlayProps) {
	const errorType = getErrorType(error.message);

	return (
		<div
			className={cn(
				"absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm",
				className
			)}
		>
			<div className="w-full max-w-2xl rounded-lg border border-destructive bg-card shadow-2xl">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-destructive/20 bg-destructive/10 p-4">
					<div className="flex items-center gap-2">
						{errorType === "syntax" ? (
							<AlertCircleIcon className="h-5 w-5 text-destructive" />
						) : (
							<AlertTriangleIcon className="h-5 w-5 text-destructive" />
						)}
						<h3 className="font-bold text-destructive">
							{errorType === "syntax" ? "Syntax Error" : "Runtime Error"}
						</h3>
					</div>
					{onDismiss && (
						<Button
							variant="ghost"
							size="sm"
							onClick={onDismiss}
							className="h-8 w-8 p-0"
						>
							<XIcon className="h-4 w-4" />
						</Button>
					)}
				</div>

				{/* Error Message */}
				<div className="p-4">
					<div className="rounded-lg bg-destructive/10 p-4 font-mono text-sm">
						<p className="font-semibold text-destructive">{error.message}</p>

						{/* Location Info */}
						{(error.line || error.column) && (
							<p className="mt-2 text-xs text-muted-foreground">
								at line {error.line}
								{error.column && `:${error.column}`}
							</p>
						)}
					</div>

					{/* Stack Trace */}
					{error.stack && (
						<details className="mt-4">
							<summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
								Show stack trace
							</summary>
							<div className="mt-2 max-h-64 overflow-y-auto rounded-lg bg-muted p-3 font-mono text-xs">
								<pre className="whitespace-pre-wrap">{error.stack}</pre>
							</div>
						</details>
					)}

					{/* Suggestions */}
					<div className="mt-4 rounded-lg border bg-muted/50 p-3">
						<p className="text-sm font-medium">💡 Suggestions:</p>
						<ul className="mt-2 space-y-1 text-sm text-muted-foreground">
							{getSuggestions(error.message).map((suggestion, i) => (
								<li key={i}>• {suggestion}</li>
							))}
						</ul>
					</div>
				</div>

				{/* Footer */}
				<div className="border-t bg-muted/50 p-3 text-center">
					<p className="text-xs text-muted-foreground">
						Fix the error and the preview will update automatically
					</p>
				</div>
			</div>
		</div>
	);
}

/**
 * Determine error type from message
 */
function getErrorType(message: string): "syntax" | "runtime" {
	const syntaxKeywords = [
		"syntax",
		"unexpected",
		"expected",
		"token",
		"parse",
		"invalid",
	];

	const lowerMessage = message.toLowerCase();
	return syntaxKeywords.some((keyword) => lowerMessage.includes(keyword))
		? "syntax"
		: "runtime";
}

/**
 * Get helpful suggestions based on error message
 */
function getSuggestions(message: string): string[] {
	const lowerMessage = message.toLowerCase();
	const suggestions: string[] = [];

	if (lowerMessage.includes("unexpected token")) {
		suggestions.push("Check for missing or extra brackets, parentheses, or commas");
		suggestions.push("Ensure all strings are properly quoted");
	}

	if (lowerMessage.includes("undefined")) {
		suggestions.push("Check if the variable is declared before use");
		suggestions.push("Verify import statements are correct");
	}

	if (lowerMessage.includes("expected")) {
		suggestions.push("Look for missing closing tags or brackets");
		suggestions.push("Check if all JSX elements are properly closed");
	}

	if (lowerMessage.includes("cannot read property")) {
		suggestions.push("Check if the object exists before accessing properties");
		suggestions.push("Use optional chaining (?.) for safer property access");
	}

	if (lowerMessage.includes("not a function")) {
		suggestions.push("Verify the function name is spelled correctly");
		suggestions.push("Check if the function is imported or defined");
	}

	// Generic suggestions if no specific ones
	if (suggestions.length === 0) {
		suggestions.push("Check your syntax and formatting");
		suggestions.push("Review the documentation for correct usage");
		suggestions.push("Try simplifying the code to isolate the issue");
	}

	return suggestions;
}
