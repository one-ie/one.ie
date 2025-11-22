"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone, Tablet, RefreshCw } from "lucide-react";

type ViewportSize = "desktop" | "tablet" | "mobile";

interface PreviewPanelProps {
	websiteId: string;
	pageId: string;
}

export function PreviewPanel({ websiteId, pageId }: PreviewPanelProps) {
	const [viewport, setViewport] = useState<ViewportSize>("desktop");
	const [key, setKey] = useState(0);

	const viewportSizes = {
		desktop: "w-full",
		tablet: "w-[768px]",
		mobile: "w-[375px]",
	};

	const handleRefresh = () => {
		setKey((prev) => prev + 1);
	};

	return (
		<div className="h-full flex flex-col bg-muted/30">
			{/* Toolbar */}
			<div className="border-b bg-background px-4 py-2 flex items-center justify-between gap-4">
				<div className="flex items-center gap-2">
					<h2 className="text-lg font-semibold">Live Preview</h2>
				</div>

				{/* Viewport Controls */}
				<div className="flex items-center gap-2">
					<Button
						variant={viewport === "desktop" ? "default" : "ghost"}
						size="sm"
						onClick={() => setViewport("desktop")}
					>
						<Monitor className="h-4 w-4" />
					</Button>
					<Button
						variant={viewport === "tablet" ? "default" : "ghost"}
						size="sm"
						onClick={() => setViewport("tablet")}
					>
						<Tablet className="h-4 w-4" />
					</Button>
					<Button
						variant={viewport === "mobile" ? "default" : "ghost"}
						size="sm"
						onClick={() => setViewport("mobile")}
					>
						<Smartphone className="h-4 w-4" />
					</Button>

					<div className="w-px h-6 bg-border mx-2" />

					<Button variant="ghost" size="sm" onClick={handleRefresh}>
						<RefreshCw className="h-4 w-4" />
					</Button>
				</div>
			</div>

			{/* Preview Area */}
			<div className="flex-1 overflow-auto p-4 flex justify-center">
				<div
					className={`${viewportSizes[viewport]} h-full transition-all duration-300 mx-auto`}
				>
					<div className="w-full h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
						<iframe
							key={key}
							src={`/preview/${websiteId}/${pageId}`}
							className="w-full h-full border-0"
							title="Website Preview"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
