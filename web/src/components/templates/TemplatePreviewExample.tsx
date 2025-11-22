/**
 * Template Preview Modal - Usage Example
 *
 * This example demonstrates how to use the TemplatePreviewModal component
 * in your funnel marketplace or template selector.
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TemplatePreviewModal } from "./TemplatePreviewModal";
import { leadMagnetBasic } from "@/lib/funnel-templates/templates";

export function TemplatePreviewExample() {
	const [previewOpen, setPreviewOpen] = useState(false);

	const handleUseTemplate = () => {
		console.log("Using template:", leadMagnetBasic.id);
		// Your implementation here:
		// - Create funnel from template
		// - Navigate to builder
		// - Show success message
		setPreviewOpen(false);
	};

	return (
		<div className="space-y-4">
			<h2 className="text-2xl font-bold">Template Preview Example</h2>

			{/* Template Card with Preview Button */}
			<Card className="max-w-md">
				<CardHeader>
					<CardTitle>{leadMagnetBasic.name}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-sm text-muted-foreground">
						{leadMagnetBasic.description}
					</p>

					<div className="flex gap-2">
						<Button onClick={() => setPreviewOpen(true)} variant="outline">
							Preview Template
						</Button>
						<Button onClick={handleUseTemplate}>Use Template</Button>
					</div>
				</CardContent>
			</Card>

			{/* Preview Modal */}
			<TemplatePreviewModal
				template={leadMagnetBasic}
				open={previewOpen}
				onOpenChange={setPreviewOpen}
				onUseTemplate={handleUseTemplate}
				previewUrl="https://example.com/preview/lead-magnet-basic" // Optional
			/>
		</div>
	);
}
