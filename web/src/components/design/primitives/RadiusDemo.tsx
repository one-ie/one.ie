import { Circle } from "lucide-react";
import { useState } from "react";

export interface RadiusDemoProps {
	/** Whether to show interactive hover effects */
	interactive?: boolean;
}

/**
 * RadiusDemo component demonstrates different border radius options
 *
 * @example
 * <RadiusDemo interactive={true} />
 */
export function RadiusDemo({ interactive = true }: RadiusDemoProps) {
	const [hoveredRadius, setHoveredRadius] = useState<string | null>(null);

	const radiusOptions = [
		{
			name: "none",
			className: "rounded-none",
			pixels: "0px",
			usage: "Sharp edges, geometric designs"
		},
		{
			name: "sm",
			className: "rounded-sm",
			pixels: "6px",
			usage: "Pills, badges, tight components"
		},
		{
			name: "md",
			className: "rounded-md",
			pixels: "8px",
			usage: "Cards, buttons - DEFAULT",
			isDefault: true
		},
		{
			name: "lg",
			className: "rounded-lg",
			pixels: "12px",
			usage: "Large cards, containers"
		},
		{
			name: "xl",
			className: "rounded-xl",
			pixels: "16px",
			usage: "Modals, hero surfaces"
		},
		{
			name: "2xl",
			className: "rounded-2xl",
			pixels: "24px",
			usage: "Feature cards, standout elements"
		},
		{
			name: "full",
			className: "rounded-full",
			pixels: "9999px",
			usage: "Avatars, circular icons, pills"
		}
	];

	return (
		<div className="space-y-4">
			{/* Visual Comparison */}
			<div className="rounded-lg border bg-background p-6">
				<div className="grid grid-cols-2 md:grid-cols-3 gap-6">
					{radiusOptions.map((radius) => {
						const isHovered = hoveredRadius === radius.name;

						return (
							<div
								key={radius.name}
								onMouseEnter={() => interactive && setHoveredRadius(radius.name)}
								onMouseLeave={() => interactive && setHoveredRadius(null)}
								className="flex flex-col items-center gap-3"
							>
								<div
									className={`
										w-full h-24 bg-primary/10 border-2
										${radius.className}
										${interactive ? "transition-all duration-300 hover:bg-primary/20" : ""}
										${isHovered ? "border-primary shadow-lg" : "border-muted"}
									`}
								/>
								<div className="text-center">
									<div className="flex items-center justify-center gap-1">
										<code className="text-sm font-semibold">rounded-{radius.name}</code>
										{radius.isDefault && (
											<span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">
												default
											</span>
										)}
									</div>
									<p className="text-xs text-muted-foreground">{radius.pixels}</p>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* Usage Guide */}
			<div className="space-y-2">
				<div className="flex items-center gap-2 text-sm font-semibold">
					<Circle className="h-4 w-4 text-primary" />
					<span>Usage Guide</span>
				</div>
				<div className="grid gap-2">
					{radiusOptions.map((radius) => (
						<div
							key={radius.name}
							className={`
								border p-3
								${radius.className}
								${hoveredRadius === radius.name ? "bg-primary/5 border-primary/30" : "bg-background"}
								transition-colors
							`}
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<code className="text-sm font-semibold">rounded-{radius.name}</code>
									<span className="text-xs text-muted-foreground">({radius.pixels})</span>
									{radius.isDefault && (
										<span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">
											DEFAULT
										</span>
									)}
								</div>
								{hoveredRadius === radius.name && (
									<span className="text-xs font-semibold text-primary">Preview</span>
								)}
							</div>
							<p className="text-xs text-muted-foreground mt-1">{radius.usage}</p>
						</div>
					))}
				</div>
			</div>

			{/* Consistency Tip */}
			<div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
				<p className="text-xs font-semibold text-primary">✨ Consistency Matters</p>
				<p className="text-xs text-muted-foreground mt-1">
					rounded-md (8px) is the default for cards and buttons. Use larger radius for hero sections
					and feature cards. Use rounded-full for avatars and circular elements. Avoid mixing too many radius sizes.
				</p>
			</div>
		</div>
	);
}
