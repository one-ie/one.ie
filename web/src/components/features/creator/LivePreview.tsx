"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { CodeEditor, MonacoEditor } from "./CodeEditor";
import {
	WebPreview,
	WebPreviewNavigation,
	WebPreviewNavigationButton,
	WebPreviewBody,
	WebPreviewConsole,
} from "@/components/ai/elements/web-preview";
import {
	RefreshCwIcon,
	MonitorIcon,
	SmartphoneIcon,
	TabletIcon,
	AlertCircleIcon,
	CheckCircleIcon,
	ZoomInIcon,
	ZoomOutIcon,
	MaximizeIcon,
	ExternalLinkIcon,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LivePreviewProps {
	initialCode?: string;
	language?: "astro" | "html" | "jsx";
	useMonaco?: boolean;
	className?: string;
	autoCompile?: boolean;
	compileDelay?: number;
}

type ViewportSize = "desktop" | "tablet" | "mobile";

interface CompilationError {
	message: string;
	stack?: string;
}

interface ConsoleLog {
	level: "log" | "warn" | "error";
	message: string;
	timestamp: Date;
}

export function LivePreview({
	initialCode = DEFAULT_CODE,
	language = "html",
	useMonaco = false,
	className,
	autoCompile = true,
	compileDelay = 500,
}: LivePreviewProps) {
	const [code, setCode] = useState(initialCode);
	const [compiledHTML, setCompiledHTML] = useState("");
	const [isCompiling, setIsCompiling] = useState(false);
	const [error, setError] = useState<CompilationError | null>(null);
	const [viewport, setViewport] = useState<ViewportSize>("desktop");
	const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
	const [lastCompileTime, setLastCompileTime] = useState<Date | null>(null);
	const [zoom, setZoom] = useState(100);
	const iframeKey = useRef(0);
	const compileTimeoutRef = useRef<NodeJS.Timeout>();

	// Auto-compile on code change
	useEffect(() => {
		if (!autoCompile) return;

		// Clear existing timeout
		if (compileTimeoutRef.current) {
			clearTimeout(compileTimeoutRef.current);
		}

		// Set new timeout for compilation
		compileTimeoutRef.current = setTimeout(() => {
			compile(code);
		}, compileDelay);

		return () => {
			if (compileTimeoutRef.current) {
				clearTimeout(compileTimeoutRef.current);
			}
		};
	}, [code, autoCompile, compileDelay]);

	const compile = useCallback(async (sourceCode: string) => {
		setIsCompiling(true);
		setError(null);

		try {
			let html: string;

			if (language === "astro") {
				// Compile Astro via API
				const response = await fetch("/api/compile/astro", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ code: sourceCode }),
				});

				const data = await response.json();

				if (!response.ok || data.error) {
					throw new Error(data.error || "Compilation failed");
				}

				html = data.html;
			} else {
				// For HTML/JSX, use directly
				html = wrapHTML(sourceCode);
			}

			setCompiledHTML(html);
			setLastCompileTime(new Date());
			iframeKey.current += 1; // Force iframe reload

			// Add success log
			addConsoleLog("log", "✓ Compiled successfully");
		} catch (err) {
			const errorMsg = err instanceof Error ? err.message : "Unknown error";
			setError({
				message: errorMsg,
				stack: err instanceof Error ? err.stack : undefined,
			});
			addConsoleLog("error", `✗ Compilation failed: ${errorMsg}`);
		} finally {
			setIsCompiling(false);
		}
	}, [language]);

	const handleCodeChange = useCallback((newCode: string) => {
		setCode(newCode);
	}, []);

	const handleRun = useCallback((sourceCode: string) => {
		compile(sourceCode);
	}, [compile]);

	const handleRefresh = useCallback(() => {
		iframeKey.current += 1;
		addConsoleLog("log", "↻ Preview refreshed");
	}, []);

	const addConsoleLog = useCallback((level: ConsoleLog["level"], message: string) => {
		setConsoleLogs((prev) => [
			...prev,
			{ level, message, timestamp: new Date() },
		]);
	}, []);

	const handleZoomIn = useCallback(() => {
		setZoom((prev) => Math.min(prev + 10, 200));
	}, []);

	const handleZoomOut = useCallback(() => {
		setZoom((prev) => Math.max(prev - 10, 50));
	}, []);

	const handleZoomReset = useCallback(() => {
		setZoom(100);
	}, []);

	const handleOpenInNewTab = useCallback(() => {
		if (!compiledHTML) return;

		// Create a new window and write the HTML
		const newWindow = window.open();
		if (newWindow) {
			newWindow.document.write(compiledHTML);
			newWindow.document.close();
			addConsoleLog("log", "↗ Opened in new tab");
		}
	}, [compiledHTML, addConsoleLog]);

	const getViewportWidth = () => {
		switch (viewport) {
			case "mobile":
				return "375px";
			case "tablet":
				return "768px";
			default:
				return "100%";
		}
	};

	const Editor = useMonaco ? MonacoEditor : CodeEditor;

	return (
		<div className={cn("flex h-full gap-4", className)}>
			{/* Left: Code Editor */}
			<div className="flex w-1/2 flex-col">
				<Editor
					initialCode={initialCode}
					language={language}
					onChange={handleCodeChange}
					onRun={handleRun}
					className="h-full"
				/>

				{/* Compilation Status */}
				<div className="mt-2 flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-sm">
					<div className="flex items-center gap-2">
						{isCompiling ? (
							<>
								<RefreshCwIcon className="h-4 w-4 animate-spin text-muted-foreground" />
								<span className="text-muted-foreground">Compiling...</span>
							</>
						) : error ? (
							<>
								<AlertCircleIcon className="h-4 w-4 text-destructive" />
								<span className="text-destructive">Failed</span>
							</>
						) : lastCompileTime ? (
							<>
								<CheckCircleIcon className="h-4 w-4 text-green-600" />
								<span className="text-muted-foreground">
									Last compiled: {lastCompileTime.toLocaleTimeString()}
								</span>
							</>
						) : (
							<span className="text-muted-foreground">Ready</span>
						)}
					</div>

					{!autoCompile && (
						<Button
							size="sm"
							variant="outline"
							onClick={() => compile(code)}
							disabled={isCompiling}
						>
							Compile
						</Button>
					)}
				</div>
			</div>

			{/* Right: Live Preview */}
			<div className="flex w-1/2 flex-col">
				<WebPreview className="h-full">
					{/* Navigation */}
					<WebPreviewNavigation>
						<WebPreviewNavigationButton
							tooltip="Refresh"
							onClick={handleRefresh}
						>
							<RefreshCwIcon className="h-4 w-4" />
						</WebPreviewNavigationButton>

						<div className="mx-2 h-6 w-px bg-border" />

						{/* Viewport Size Buttons */}
						<WebPreviewNavigationButton
							tooltip="Desktop"
							onClick={() => setViewport("desktop")}
							className={viewport === "desktop" ? "bg-accent" : ""}
						>
							<MonitorIcon className="h-4 w-4" />
						</WebPreviewNavigationButton>
						<WebPreviewNavigationButton
							tooltip="Tablet"
							onClick={() => setViewport("tablet")}
							className={viewport === "tablet" ? "bg-accent" : ""}
						>
							<TabletIcon className="h-4 w-4" />
						</WebPreviewNavigationButton>
						<WebPreviewNavigationButton
							tooltip="Mobile"
							onClick={() => setViewport("mobile")}
							className={viewport === "mobile" ? "bg-accent" : ""}
						>
							<SmartphoneIcon className="h-4 w-4" />
						</WebPreviewNavigationButton>

						<div className="mx-2 h-6 w-px bg-border" />

						{/* Zoom Controls */}
						<WebPreviewNavigationButton
							tooltip="Zoom Out"
							onClick={handleZoomOut}
							disabled={zoom <= 50}
						>
							<ZoomOutIcon className="h-4 w-4" />
						</WebPreviewNavigationButton>
						<WebPreviewNavigationButton
							tooltip="Reset Zoom"
							onClick={handleZoomReset}
						>
							<span className="text-xs font-medium min-w-[2.5rem] text-center">
								{zoom}%
							</span>
						</WebPreviewNavigationButton>
						<WebPreviewNavigationButton
							tooltip="Zoom In"
							onClick={handleZoomIn}
							disabled={zoom >= 200}
						>
							<ZoomInIcon className="h-4 w-4" />
						</WebPreviewNavigationButton>

						<div className="mx-2 h-6 w-px bg-border" />

						{/* Open in New Tab */}
						<WebPreviewNavigationButton
							tooltip="Open in New Tab"
							onClick={handleOpenInNewTab}
							disabled={!compiledHTML}
						>
							<ExternalLinkIcon className="h-4 w-4" />
						</WebPreviewNavigationButton>
					</WebPreviewNavigation>

					{/* Preview Body */}
					<div className="flex-1 overflow-auto bg-muted/30 p-4">
						<div
							className="mx-auto h-full transition-all duration-300 origin-top"
							style={{
								width: getViewportWidth(),
								transform: `scale(${zoom / 100})`,
							}}
						>
							{error ? (
								<Alert variant="destructive" className="mt-4">
									<AlertCircleIcon className="h-4 w-4" />
									<AlertTitle>Compilation Error</AlertTitle>
									<AlertDescription className="mt-2">
										<pre className="overflow-x-auto text-xs">
											{error.message}
										</pre>
										{error.stack && (
											<details className="mt-2">
												<summary className="cursor-pointer text-xs">
													Stack trace
												</summary>
												<pre className="mt-1 overflow-x-auto text-xs">
													{error.stack}
												</pre>
											</details>
										)}
									</AlertDescription>
								</Alert>
							) : compiledHTML ? (
								<iframe
									key={iframeKey.current}
									srcDoc={compiledHTML}
									className="h-full w-full rounded-lg border bg-white shadow-sm"
									sandbox="allow-scripts"
									title="Preview"
								/>
							) : (
								<div className="flex h-full items-center justify-center text-muted-foreground">
									<div className="text-center">
										<MonitorIcon className="mx-auto h-12 w-12 opacity-50" />
										<p className="mt-2">Write some code to see the preview</p>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Console */}
					<WebPreviewConsole logs={consoleLogs}>
						<div className="mt-2 text-xs text-muted-foreground">
							Press ⌘↵ to compile and run
						</div>
					</WebPreviewConsole>
				</WebPreview>
			</div>
		</div>
	);
}

/**
 * Wrap HTML code in a complete document
 */
function wrapHTML(html: string): string {
	// Check if already a complete HTML document
	if (html.includes("<!DOCTYPE") || html.includes("<html")) {
		return html;
	}

	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Preview</title>
	<script src="https://cdn.tailwindcss.com"></script>
	<style>
		body {
			margin: 0;
			padding: 1rem;
			font-family: system-ui, -apple-system, sans-serif;
		}
	</style>
</head>
<body>
${html}
<script>
	// Console interception for preview
	const originalConsole = {
		log: console.log,
		warn: console.warn,
		error: console.error,
	};

	['log', 'warn', 'error'].forEach(level => {
		console[level] = (...args) => {
			originalConsole[level](...args);
			// Could send to parent window for console display
			window.parent.postMessage({
				type: 'console',
				level,
				message: args.join(' '),
			}, '*');
		};
	});

	// Error handling
	window.addEventListener('error', (event) => {
		window.parent.postMessage({
			type: 'console',
			level: 'error',
			message: event.message + ' at ' + event.filename + ':' + event.lineno,
		}, '*');
	});
</script>
</body>
</html>`;
}

const DEFAULT_CODE = `<div class="max-w-2xl mx-auto">
	<h1 class="text-4xl font-bold mb-4">Hello, World!</h1>
	<p class="text-lg text-gray-600 mb-6">
		This is a live preview editor. Edit the code on the left to see changes here.
	</p>

	<div class="grid grid-cols-2 gap-4">
		<div class="p-4 bg-blue-100 rounded-lg">
			<h3 class="font-bold">Feature 1</h3>
			<p class="text-sm">Build amazing things</p>
		</div>
		<div class="p-4 bg-green-100 rounded-lg">
			<h3 class="font-bold">Feature 2</h3>
			<p class="text-sm">Ship faster</p>
		</div>
	</div>

	<button class="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
		onclick="alert('Hello from the preview!')">
		Click Me
	</button>
</div>`;
