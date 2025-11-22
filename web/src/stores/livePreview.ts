import { atom, map } from "nanostores";
import { persistentAtom } from "@nanostores/persistent";

/**
 * Live Preview State Management
 *
 * Manages code editor, compilation, and preview state
 */

export type ViewportSize = "desktop" | "tablet" | "mobile";
export type Language = "astro" | "html" | "jsx" | "tsx";

export interface CompilationResult {
	html: string;
	compiledAt: Date;
}

export interface CompilationError {
	message: string;
	stack?: string;
	line?: number;
	column?: number;
}

export interface PreviewSettings {
	autoCompile: boolean;
	compileDelay: number;
	showConsole: boolean;
	useMonaco: boolean;
	theme: "vs-dark" | "vs-light";
}

// Current code in editor
export const code$ = atom<string>("");

// Compiled HTML result
export const compiledHTML$ = atom<string>("");

// Compilation status
export const isCompiling$ = atom<boolean>(false);

// Compilation error
export const compilationError$ = atom<CompilationError | null>(null);

// Last compilation time
export const lastCompileTime$ = atom<Date | null>(null);

// Viewport size
export const viewport$ = persistentAtom<ViewportSize>("viewport", "desktop", {
	encode: JSON.stringify,
	decode: JSON.parse,
});

// Current language
export const language$ = atom<Language>("html");

// Preview settings (persisted)
export const previewSettings$ = persistentAtom<PreviewSettings>(
	"previewSettings",
	{
		autoCompile: true,
		compileDelay: 500,
		showConsole: false,
		useMonaco: false,
		theme: "vs-dark",
	},
	{
		encode: JSON.stringify,
		decode: JSON.parse,
	}
);

// Console logs
export interface ConsoleLog {
	level: "log" | "warn" | "error";
	message: string;
	timestamp: Date;
}

export const consoleLogs$ = atom<ConsoleLog[]>([]);

/**
 * Actions
 */

export function setCode(newCode: string) {
	code$.set(newCode);
}

export function setCompiledHTML(html: string) {
	compiledHTML$.set(html);
	lastCompileTime$.set(new Date());
	compilationError$.set(null);
}

export function setCompilationError(error: CompilationError) {
	compilationError$.set(error);
}

export function setIsCompiling(isCompiling: boolean) {
	isCompiling$.set(isCompiling);
}

export function setViewport(size: ViewportSize) {
	viewport$.set(size);
}

export function setLanguage(lang: Language) {
	language$.set(lang);
}

export function updatePreviewSettings(
	settings: Partial<PreviewSettings>
) {
	const current = previewSettings$.get();
	previewSettings$.set({ ...current, ...settings });
}

export function addConsoleLog(level: ConsoleLog["level"], message: string) {
	const logs = consoleLogs$.get();
	consoleLogs$.set([
		...logs,
		{
			level,
			message,
			timestamp: new Date(),
		},
	]);
}

export function clearConsoleLogs() {
	consoleLogs$.set([]);
}

export function resetPreview() {
	code$.set("");
	compiledHTML$.set("");
	compilationError$.set(null);
	consoleLogs$.set([]);
	lastCompileTime$.set(null);
}

/**
 * Compilation Service
 */

export async function compileCode(sourceCode: string, lang: Language): Promise<void> {
	setIsCompiling(true);
	setCompilationError(null);

	try {
		let html: string;

		if (lang === "astro") {
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
			addConsoleLog("log", "✓ Astro compilation successful");
		} else {
			// For HTML/JSX, use directly
			html = wrapHTML(sourceCode);
			addConsoleLog("log", "✓ HTML rendered successfully");
		}

		setCompiledHTML(html);
	} catch (err) {
		const errorMsg = err instanceof Error ? err.message : "Unknown error";
		setCompilationError({
			message: errorMsg,
			stack: err instanceof Error ? err.stack : undefined,
		});
		addConsoleLog("error", `✗ Compilation failed: ${errorMsg}`);
		throw err;
	} finally {
		setIsCompiling(false);
	}
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
</body>
</html>`;
}
