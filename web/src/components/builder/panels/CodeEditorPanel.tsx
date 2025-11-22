"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code2, FileCode, Palette } from "lucide-react";

interface CodeEditorPanelProps {
	websiteId: string;
	pageId: string;
}

export function CodeEditorPanel({
	websiteId,
	pageId,
}: CodeEditorPanelProps) {
	const [activeTab, setActiveTab] = useState("html");

	// Placeholder code - will be replaced with actual code from backend
	const [html, setHtml] = useState(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website</title>
</head>
<body>
    <h1>Welcome to My Website</h1>
    <p>Built with AI assistance</p>
</body>
</html>`);

	const [css, setCss] = useState(`body {
    font-family: system-ui, sans-serif;
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

h1 {
    color: #333;
    font-size: 2rem;
}`);

	const [js, setJs] = useState(`// Add your JavaScript here
console.log('Website loaded!');`);

	return (
		<div className="h-full flex flex-col bg-background">
			{/* Header */}
			<div className="border-b px-4 py-3 flex items-center justify-between">
				<div>
					<h2 className="text-lg font-semibold">Code Editor</h2>
					<p className="text-sm text-muted-foreground">
						View and edit your code
					</p>
				</div>
				<Button variant="outline" size="sm">
					<Code2 className="h-4 w-4 mr-2" />
					Format
				</Button>
			</div>

			{/* Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
				<TabsList className="mx-4 mt-2 w-fit">
					<TabsTrigger value="html" className="gap-2">
						<FileCode className="h-4 w-4" />
						HTML
					</TabsTrigger>
					<TabsTrigger value="css" className="gap-2">
						<Palette className="h-4 w-4" />
						CSS
					</TabsTrigger>
					<TabsTrigger value="js" className="gap-2">
						<Code2 className="h-4 w-4" />
						JavaScript
					</TabsTrigger>
				</TabsList>

				<TabsContent value="html" className="flex-1 m-4 mt-2">
					<textarea
						value={html}
						onChange={(e) => setHtml(e.target.value)}
						className="w-full h-full font-mono text-sm p-4 bg-muted rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-ring"
						spellCheck={false}
					/>
				</TabsContent>

				<TabsContent value="css" className="flex-1 m-4 mt-2">
					<textarea
						value={css}
						onChange={(e) => setCss(e.target.value)}
						className="w-full h-full font-mono text-sm p-4 bg-muted rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-ring"
						spellCheck={false}
					/>
				</TabsContent>

				<TabsContent value="js" className="flex-1 m-4 mt-2">
					<textarea
						value={js}
						onChange={(e) => setJs(e.target.value)}
						className="w-full h-full font-mono text-sm p-4 bg-muted rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-ring"
						spellCheck={false}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}
