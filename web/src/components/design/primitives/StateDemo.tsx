import { useState } from "react";
import { MousePointer2, Hand, Eye, Ban } from "lucide-react";

export interface StateDemoProps {
	/** Button variant to demonstrate */
	variant?: "primary" | "secondary" | "tertiary" | "outline" | "ghost";
	/** Custom label for the button */
	label?: string;
}

/**
 * StateDemo component demonstrates all button states
 * (hover, active, focus, disabled)
 *
 * @example
 * <StateDemo variant="primary" label="Buy Now" />
 */
export function StateDemo({
	variant = "primary",
	label = "Button"
}: StateDemoProps) {
	const [activeState, setActiveState] = useState<"default" | "hover" | "active" | "focus" | "disabled">("default");

	// Variant styles
	const variantStyles = {
		primary: {
			base: "bg-[hsl(216_55%_25%)] text-white",
			hover: "bg-[hsl(216_55%_20%)]",
			active: "bg-[hsl(216_55%_18%)]"
		},
		secondary: {
			base: "bg-[hsl(219_14%_28%)] text-white",
			hover: "bg-[hsl(219_14%_23%)]",
			active: "bg-[hsl(219_14%_21%)]"
		},
		tertiary: {
			base: "bg-[hsl(105_22%_25%)] text-white",
			hover: "bg-[hsl(105_22%_20%)]",
			active: "bg-[hsl(105_22%_18%)]"
		},
		outline: {
			base: "border-2 border-[hsl(216_55%_25%)] bg-transparent text-[hsl(216_55%_25%)]",
			hover: "bg-[hsl(216_55%_25%/0.1)]",
			active: "bg-[hsl(216_55%_25%/0.15)]"
		},
		ghost: {
			base: "bg-transparent text-foreground",
			hover: "bg-[hsl(var(--color-font)/0.1)]",
			active: "bg-[hsl(var(--color-font)/0.15)]"
		}
	};

	const currentStyle = variantStyles[variant];

	// State configurations
	const states = [
		{
			name: "default",
			icon: MousePointer2,
			description: "Base state with shadow-lg",
			className: `${currentStyle.base} shadow-lg`
		},
		{
			name: "hover",
			icon: Hand,
			description: "Darken 5% + shadow-xl + scale-[1.02]",
			className: `${currentStyle.hover} shadow-xl scale-[1.02]`
		},
		{
			name: "active",
			icon: Eye,
			description: "Darken 7% + shadow-md + scale-[0.98]",
			className: `${currentStyle.active} shadow-md scale-[0.98]`
		},
		{
			name: "focus",
			icon: Eye,
			description: "2px primary ring with 2px offset",
			className: `${currentStyle.base} shadow-lg ring-2 ring-primary ring-offset-2`
		},
		{
			name: "disabled",
			icon: Ban,
			description: "55% opacity + cursor-not-allowed",
			className: `${currentStyle.base} shadow-lg opacity-55 cursor-not-allowed`
		}
	];

	return (
		<div className="space-y-4">
			{/* Interactive Button */}
			<div className="flex items-center justify-center rounded-lg border bg-background p-6">
				<button
					className={`
						rounded-md px-6 py-3 text-sm font-semibold transition-all duration-150
						${currentStyle.base}
						hover:${currentStyle.hover} hover:shadow-xl hover:scale-[1.02]
						active:${currentStyle.active} active:shadow-md active:scale-[0.98]
						focus:ring-2 focus:ring-primary focus:ring-offset-2
						disabled:opacity-55 disabled:cursor-not-allowed
					`}
					disabled={activeState === "disabled"}
				>
					{label} ({variant})
				</button>
			</div>

			{/* State Grid */}
			<div className="grid gap-2">
				{states.map((state) => {
					const Icon = state.icon;
					const isActive = activeState === state.name;

					return (
						<button
							key={state.name}
							onMouseEnter={() => setActiveState(state.name as any)}
							onMouseLeave={() => setActiveState("default")}
							className={`
								flex items-center gap-3 rounded-md border p-3 text-left transition-all
								${isActive ? "bg-primary/5 border-primary/30" : "bg-background hover:bg-muted"}
							`}
						>
							<div className={`
								flex h-8 w-8 items-center justify-center rounded-md
								${isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}
							`}>
								<Icon className="h-4 w-4" />
							</div>
							<div className="flex-1">
								<p className="text-sm font-medium capitalize">{state.name}</p>
								<p className="text-xs text-muted-foreground">{state.description}</p>
							</div>
							{isActive && (
								<span className="text-xs font-semibold text-primary">Active</span>
							)}
						</button>
					);
				})}
			</div>

			{/* Hint */}
			<p className="text-xs text-center text-muted-foreground">
				Hover over each state to see it applied to the button above
			</p>
		</div>
	);
}
