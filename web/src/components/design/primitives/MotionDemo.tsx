import { Pause, Play, Waves } from "lucide-react";
import { useState } from "react";

export interface MotionDemoProps {
	/** Whether to show controls */
	showControls?: boolean;
}

/**
 * MotionDemo component demonstrates animation timing functions
 *
 * @example
 * <MotionDemo showControls={true} />
 */
export function MotionDemo({ showControls = true }: MotionDemoProps) {
	const [isAnimating, setIsAnimating] = useState(false);

	const startAnimation = () => {
		setIsAnimating(true);
		setTimeout(() => setIsAnimating(false), 3000);
	};

	const timings = [
		{
			name: "instant",
			duration: "0ms",
			className: "transition-none",
			usage: "No animation, immediate changes"
		},
		{
			name: "fast",
			duration: "150ms",
			className: "transition-all duration-150 ease-in-out",
			usage: "Hovers, quick feedback, button states"
		},
		{
			name: "normal",
			duration: "300ms",
			className: "transition-all duration-300 ease-in-out",
			usage: "Default transitions, component changes",
			isDefault: true
		},
		{
			name: "slow",
			duration: "500ms",
			className: "transition-all duration-500 ease-in-out",
			usage: "Page transitions, modals, drawers"
		}
	];

	return (
		<div className="space-y-4">
			{/* Control Button */}
			{showControls && (
				<div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-3">
					<div>
						<p className="text-xs font-semibold text-primary">✨ Motion Demo</p>
						<p className="text-xs text-muted-foreground mt-1">
							Watch all timing speeds animate simultaneously
						</p>
					</div>
					<button
						onClick={startAnimation}
						disabled={isAnimating}
						className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary/90 disabled:opacity-50 transition-all"
					>
						{isAnimating ? (
							<>
								<Pause className="h-3 w-3" />
								Playing...
							</>
						) : (
							<>
								<Play className="h-3 w-3" />
								Play Demo
							</>
						)}
					</button>
				</div>
			)}

			{/* Animated Boxes */}
			<div className="rounded-lg border bg-background p-4">
				<div className="space-y-3">
					{timings.map((timing) => (
						<div key={timing.name} className="space-y-1">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<code className="text-sm font-semibold">{timing.name}</code>
									<span className="text-xs text-muted-foreground">({timing.duration})</span>
									{timing.isDefault && (
										<span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">
											default
										</span>
									)}
								</div>
							</div>
							<div className="rounded-md bg-muted p-2">
								<div
									className={`h-2 rounded-full bg-primary ${timing.className} ${
										isAnimating ? "translate-x-full" : "translate-x-0"
									}`}
									style={{ width: "40px" }}
								/>
							</div>
							<p className="text-xs text-muted-foreground">{timing.usage}</p>
						</div>
					))}
				</div>
			</div>

			{/* Easing Function */}
			<div className="rounded-lg border bg-background p-4 space-y-3">
				<div className="flex items-center gap-2 text-sm font-semibold">
					<Waves className="h-4 w-4 text-primary" />
					<span>Easing Function</span>
				</div>
				<div className="space-y-2">
					<code className="text-sm font-mono bg-muted px-2 py-1 rounded">
						ease-in-out
					</code>
					<p className="text-xs text-muted-foreground">
						All animations use ease-in-out easing for natural, smooth motion that
						accelerates at the start and decelerates at the end. This creates a more
						organic feel compared to linear timing.
					</p>
				</div>
			</div>

			{/* Motion Preferences */}
			<div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
				<p className="text-xs font-semibold text-primary">♿ Accessibility: Reduced Motion</p>
				<p className="text-xs text-muted-foreground mt-1">
					Always wrap transitions in <code className="bg-white/50 px-1 rounded">motion-safe:</code> classes
					and respect <code className="bg-white/50 px-1 rounded">prefers-reduced-motion</code>.
					Provide alternatives like color or elevation changes for users who prefer less motion.
				</p>
			</div>

			{/* Timing Reference */}
			<div className="text-xs text-center text-muted-foreground">
				All durations use milliseconds (ms) with ease-in-out timing
			</div>
		</div>
	);
}
