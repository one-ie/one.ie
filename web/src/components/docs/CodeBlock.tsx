import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CodeBlockProps {
	code: string;
	language?: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(code);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy:", err);
		}
	};

	return (
		<div className="relative bg-slate-950 text-slate-50 rounded-lg overflow-hidden group">
			{language && (
				<div className="absolute top-0 right-0 px-3 py-1 text-xs font-mono text-slate-400 bg-slate-900">
					{language}
				</div>
			)}
			<pre className="p-4 overflow-x-auto">
				<code className="text-sm">{code}</code>
			</pre>
			<Button
				onClick={handleCopy}
				size="sm"
				variant="ghost"
				className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 hover:bg-slate-700 text-slate-50"
			>
				{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
			</Button>
		</div>
	);
}
