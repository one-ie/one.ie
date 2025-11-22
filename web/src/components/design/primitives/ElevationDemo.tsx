import { Layers } from "lucide-react";
import { useState } from "react";

export interface ElevationDemoProps {
	/** Whether to show interactive hover effects */
	interactive?: boolean;
}

/**
 * ElevationDemo component demonstrates different shadow levels
 *
 * @example
 * <ElevationDemo interactive={true} />
 */
export function ElevationDemo({ interactive = true }: ElevationDemoProps) {
	const [hoveredLevel, setHoveredLevel] = useState<string | null>(null);

	const elevations = [
		{
			name: "none",
			className: "shadow-none",
			usage: "Flat surfaces, nested cards",
			description: "No shadow elevation"
		},
		{
			name: "sm",
			className: "shadow-sm",
			usage: "Cards, inputs, subtle depth",
			description: "Subtle elevation (0 1px 2px)"
		},
		{
			name: "md",
			className: "shadow-md",
			usage: "Dropdowns, active states",
			description: "Medium depth (0 4px 6px)"
		},
		{
			name: "lg",
			className: "shadow-lg",
			usage: "Buttons, important cards",
			description: "Strong depth (0 10px 15px)"
		},
		{
			name: "xl",
			className: "shadow-xl",
			usage: "Hover states, modals",
			description: "Maximum depth (0 20px 25px)"
		},
		{
			name: "2xl",
			className: "shadow-2xl",
			usage: "Modals, popovers",
			description: "Floating elements (0 25px 50px)"
		}
	];

	return (
		<div className="space-y-4">
			{/* Visual Comparison */}
			<div className="rounded-lg border bg-background p-6">
				<div className="grid grid-cols-2 md:grid-cols-3 gap-6">
					{elevations.map((elevation) => {
						const isHovered = hoveredLevel === elevation.name;

						return (
							<div
								key={elevation.name}
								onMouseEnter={() => interactive && setHoveredLevel(elevation.name)}
								onMouseLeave={() => interactive && setHoveredLevel(null)}
								className="flex flex-col items-center gap-3"
							>
								<div
									className={`
										w-full h-24 rounded-lg bg-primary/10
										${elevation.className}
										${interactive ? "transition-all duration-300 hover:scale-105" : ""}
										${isHovered ? "ring-2 ring-primary ring-offset-2" : ""}
									`}
								/>
								<div className="text-center">
									<p className="text-sm font-semibold">shadow-{elevation.name}</p>
									<p className="text-xs text-muted-foreground">{elevation.description}</p>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* Usage Guide */}
			<div className="space-y-2">
				<div className="flex items-center gap-2 text-sm font-semibold">
					<Layers className="h-4 w-4 text-primary" />
					<span>Usage Guide</span>
				</div>
				<div className="grid gap-2">
					{elevations.map((elevation) => (
						<div
							key={elevation.name}
							className={`
								rounded-md border p-3
								${elevation.className}
								${hoveredLevel === elevation.name ? "bg-primary/5 border-primary/30" : "bg-background"}
								transition-colors
							`}
						>
							<div className="flex items-center justify-between">
								<div>
									<code className="text-sm font-semibold">shadow-{elevation.name}</code>
									<p className="text-xs text-muted-foreground mt-1">{elevation.usage}</p>
								</div>
								{hoveredLevel === elevation.name && (
									<span className="text-xs font-semibold text-primary">Preview</span>
								)}
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Hierarchy Tip */}
			<div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
				<p className="text-xs font-semibold text-primary">✨ Elevation Hierarchy</p>
				<p className="text-xs text-muted-foreground mt-1">
					Use elevation to create visual hierarchy. Cards use shadow-sm, buttons use shadow-lg,
					and modals use shadow-2xl. Hover states typically increase elevation by one level.
				</p>
			</div>
		</div>
	);
}
