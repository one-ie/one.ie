/**
 * Page Builder Demo Component
 *
 * Interactive demo of the conversational page builder.
 */

import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageBuilderChat } from "@/components/ai/PageBuilderChat";
import { PageElementRenderer } from "@/components/funnel/PageElementRenderer";
import {
	pageBuilderContext$,
	selectedElement$,
	setCurrentStep,
	selectElement,
} from "@/stores/pageBuilder";
import type { FunnelStep } from "@/types/funnel-builder";

export function PageBuilderDemo() {
	const context = useStore(pageBuilderContext$);
	const selectedElement = useStore(selectedElement$);
	const [chatCollapsed, setChatCollapsed] = useState(false);
	const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

	// Initialize with a demo step
	useEffect(() => {
		const demoStep: FunnelStep = {
			id: "demo-step-1",
			funnelId: "demo-funnel",
			name: "Landing Page",
			slug: "landing",
			type: "landing",
			elements: [],
			settings: {
				seoTitle: "Demo Landing Page",
				backgroundColor: "#ffffff",
			},
			status: "draft",
		};

		setCurrentStep("demo-funnel", "demo-step-1", demoStep);
	}, []);

	const deviceWidths = {
		desktop: "w-full",
		tablet: "max-w-3xl mx-auto",
		mobile: "max-w-sm mx-auto",
	};

	return (
		<div className="grid lg:grid-cols-[1fr_400px] gap-4 h-[calc(100vh-200px)]">
			{/* Canvas Area */}
			<div className="flex flex-col border rounded-lg overflow-hidden">
				{/* Toolbar */}
				<div className="flex items-center justify-between p-4 border-b bg-muted/50">
					<div className="flex items-center gap-2">
						<Button
							variant={previewDevice === "desktop" ? "default" : "outline"}
							size="sm"
							onClick={() => setPreviewDevice("desktop")}
						>
							Desktop
						</Button>
						<Button
							variant={previewDevice === "tablet" ? "default" : "outline"}
							size="sm"
							onClick={() => setPreviewDevice("tablet")}
						>
							Tablet
						</Button>
						<Button
							variant={previewDevice === "mobile" ? "default" : "outline"}
							size="sm"
							onClick={() => setPreviewDevice("mobile")}
						>
							Mobile
						</Button>
					</div>

					<div className="flex items-center gap-2">
						<span className="text-sm text-muted-foreground">
							{context?.step.elements.length || 0} elements
						</span>
						<Button variant="outline" size="sm">
							<Eye className="h-4 w-4 mr-2" />
							Preview
						</Button>
					</div>
				</div>

				{/* Canvas */}
				<div className="flex-1 overflow-y-auto bg-gradient-to-br from-muted/20 to-muted/40 p-8">
					<div className={`${deviceWidths[previewDevice]} bg-background rounded-lg shadow-lg min-h-full`}>
						{context && context.step.elements.length === 0 ? (
							<div className="flex flex-col items-center justify-center h-full p-12 text-center">
								<div className="space-y-4">
									<h3 className="text-2xl font-semibold">Start Building</h3>
									<p className="text-muted-foreground">
										Use the AI chat on the right to add elements to your page.
									</p>
									<div className="flex flex-col gap-2 text-sm text-muted-foreground">
										<p>Try saying:</p>
										<ul className="space-y-1">
											<li>"Add a headline that says 'Welcome'"</li>
											<li>"Add a call-to-action button"</li>
											<li>"Add a lead capture form"</li>
										</ul>
									</div>
								</div>
							</div>
						) : (
							<div className="p-8 space-y-8">
								{context?.step.elements.map((element) => (
									<PageElementRenderer
										key={element.id}
										element={element}
										isSelected={selectedElement?.id === element.id}
										onSelect={() => selectElement(element.id)}
									/>
								))}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* AI Chat Panel */}
			<Card className="flex flex-col overflow-hidden">
				<Tabs defaultValue="chat" className="flex-1 flex flex-col">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="chat">AI Chat</TabsTrigger>
						<TabsTrigger value="properties">Properties</TabsTrigger>
					</TabsList>

					<TabsContent value="chat" className="flex-1 flex flex-col m-0">
						<PageBuilderChat
							collapsed={chatCollapsed}
							onToggleCollapse={() => setChatCollapsed(!chatCollapsed)}
						/>
					</TabsContent>

					<TabsContent value="properties" className="flex-1 p-4 overflow-y-auto">
						{selectedElement ? (
							<div className="space-y-4">
								<div>
									<h3 className="font-semibold mb-2">Element Properties</h3>
									<p className="text-sm text-muted-foreground mb-4">
										Type: {selectedElement.type}
									</p>
								</div>

								<div className="space-y-2">
									<pre className="text-xs bg-muted p-3 rounded overflow-auto">
										{JSON.stringify(selectedElement, null, 2)}
									</pre>
								</div>

								<div className="text-sm text-muted-foreground">
									<p>
										Tip: Use the AI chat to modify this element. Try saying
										"change the color to blue" or "make it bigger".
									</p>
								</div>
							</div>
						) : (
							<div className="flex items-center justify-center h-full text-center">
								<p className="text-muted-foreground">
									Select an element to view its properties
								</p>
							</div>
						)}
					</TabsContent>
				</Tabs>
			</Card>
		</div>
	);
}
