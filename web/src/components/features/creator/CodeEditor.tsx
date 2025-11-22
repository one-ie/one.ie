"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlayIcon, AlertCircleIcon, Loader2Icon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface CodeEditorProps {
	initialCode?: string;
	language?: string;
	onChange?: (code: string) => void;
	onRun?: (code: string) => void;
	className?: string;
}

export function CodeEditor({
	initialCode = "",
	language = "html",
	onChange,
	onRun,
	className,
}: CodeEditorProps) {
	const [code, setCode] = useState(initialCode);
	const [error, setError] = useState<string | null>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		if (textareaRef.current) {
			// Auto-resize textarea
			textareaRef.current.style.height = "auto";
			textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
		}
	}, [code]);

	const handleChange = (newCode: string) => {
		setCode(newCode);
		setError(null);
		onChange?.(newCode);
	};

	const handleRun = () => {
		try {
			onRun?.(code);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unknown error");
		}
	};

	// Handle keyboard shortcuts
	const handleKeyDown = (e: React.KeyboardEvent) => {
		// Cmd/Ctrl + Enter to run
		if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
			e.preventDefault();
			handleRun();
		}

		// Tab key support
		if (e.key === "Tab") {
			e.preventDefault();
			const start = e.currentTarget.selectionStart;
			const end = e.currentTarget.selectionEnd;
			const newCode = code.substring(0, start) + "\t" + code.substring(end);
			setCode(newCode);
			// Restore cursor position after state update
			setTimeout(() => {
				if (textareaRef.current) {
					textareaRef.current.selectionStart = start + 1;
					textareaRef.current.selectionEnd = start + 1;
				}
			}, 0);
		}
	};

	return (
		<div className={cn("flex flex-col gap-2", className)}>
			{/* Toolbar */}
			<div className="flex items-center justify-between rounded-t-lg border border-b-0 bg-muted/50 px-3 py-2">
				<div className="flex items-center gap-2">
					<div className="flex gap-1.5">
						<div className="h-3 w-3 rounded-full bg-red-500" />
						<div className="h-3 w-3 rounded-full bg-yellow-500" />
						<div className="h-3 w-3 rounded-full bg-green-500" />
					</div>
					<span className="ml-2 text-sm font-medium text-muted-foreground">
						{language}
					</span>
				</div>
				<Button
					size="sm"
					onClick={handleRun}
					className="h-8 gap-2"
				>
					<PlayIcon className="h-4 w-4" />
					Run
					<kbd className="ml-1 rounded bg-muted px-1.5 py-0.5 text-xs">
						⌘↵
					</kbd>
				</Button>
			</div>

			{/* Editor */}
			<textarea
				ref={textareaRef}
				value={code}
				onChange={(e) => handleChange(e.target.value)}
				onKeyDown={handleKeyDown}
				className={cn(
					"min-h-[300px] w-full resize-none rounded-b-lg border border-t-0 bg-card p-4 font-mono text-sm",
					"focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
					"placeholder:text-muted-foreground"
				)}
				placeholder="Enter your code here..."
				spellCheck={false}
			/>

			{/* Error Display */}
			{error && (
				<Alert variant="destructive">
					<AlertCircleIcon className="h-4 w-4" />
					<AlertTitle>Compilation Error</AlertTitle>
					<AlertDescription className="font-mono text-xs">
						{error}
					</AlertDescription>
				</Alert>
			)}
		</div>
	);
}

/**
 * Monaco Editor Component (Premium)
 *
 * For advanced features like syntax highlighting, IntelliSense, etc.
 * Uses Monaco Editor (VS Code engine)
 */
interface MonacoEditorProps {
	initialCode?: string;
	language?: string;
	onChange?: (code: string) => void;
	onRun?: (code: string) => void;
	className?: string;
	theme?: "vs-dark" | "vs-light";
}

export function MonacoEditor({
	initialCode = "",
	language = "html",
	onChange,
	onRun,
	className,
	theme = "vs-dark",
}: MonacoEditorProps) {
	const [code, setCode] = useState(initialCode);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const editorRef = useRef<HTMLDivElement>(null);
	const monacoRef = useRef<any>(null);

	useEffect(() => {
		let mounted = true;

		// Dynamically load Monaco Editor
		const loadMonaco = async () => {
			try {
				// Load Monaco from CDN
				const script = document.createElement("script");
				script.src =
					"https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.js";
				script.async = true;

				script.onload = () => {
					// @ts-expect-error Monaco global
					const require = window.require;

					require.config({
						paths: {
							vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs",
						},
					});

					require(["vs/editor/editor.main"], () => {
						if (!mounted || !editorRef.current) return;

						// @ts-expect-error Monaco global
						const monaco = window.monaco;

						const editor = monaco.editor.create(editorRef.current, {
							value: initialCode,
							language,
							theme,
							automaticLayout: true,
							minimap: { enabled: false },
							fontSize: 14,
							lineNumbers: "on",
							scrollBeyondLastLine: false,
							wordWrap: "on",
						});

						// Listen for changes
						editor.onDidChangeModelContent(() => {
							const value = editor.getValue();
							setCode(value);
							onChange?.(value);
						});

						// Add keyboard shortcut for run
						editor.addCommand(
							monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
							() => {
								onRun?.(editor.getValue());
							}
						);

						monacoRef.current = editor;
						setIsLoading(false);
					});
				};

				script.onerror = () => {
					setError("Failed to load Monaco Editor");
					setIsLoading(false);
				};

				document.head.appendChild(script);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Unknown error");
				setIsLoading(false);
			}
		};

		loadMonaco();

		return () => {
			mounted = false;
			if (monacoRef.current) {
				monacoRef.current.dispose();
			}
		};
	}, []);

	const handleRun = () => {
		onRun?.(code);
	};

	if (error) {
		return (
			<Alert variant="destructive">
				<AlertCircleIcon className="h-4 w-4" />
				<AlertTitle>Editor Error</AlertTitle>
				<AlertDescription>{error}</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className={cn("flex flex-col gap-2", className)}>
			{/* Toolbar */}
			<div className="flex items-center justify-between rounded-t-lg border border-b-0 bg-muted/50 px-3 py-2">
				<div className="flex items-center gap-2">
					<span className="text-sm font-medium text-muted-foreground">
						{language}
					</span>
				</div>
				<Button size="sm" onClick={handleRun} className="h-8 gap-2">
					<PlayIcon className="h-4 w-4" />
					Run
					<kbd className="ml-1 rounded bg-muted px-1.5 py-0.5 text-xs">
						⌘↵
					</kbd>
				</Button>
			</div>

			{/* Editor Container */}
			<div className="relative min-h-[400px] rounded-b-lg border border-t-0">
				{isLoading && (
					<div className="absolute inset-0 flex items-center justify-center bg-muted/50">
						<Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
					</div>
				)}
				<div ref={editorRef} className="h-[400px] w-full" />
			</div>
		</div>
	);
}
