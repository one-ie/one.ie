import { Copy, Check } from "lucide-react";
import { useState } from "react";

export interface ColorSwatchProps {
	/** Name of the color token (e.g., "primary", "background") */
	name: string;
	/** HSL value (e.g., "216 55% 25%") */
	value: string;
	/** Description of the color's usage */
	description?: string;
	/** Whether this color adapts in dark mode */
	adaptive?: boolean;
	/** Dark mode value (if adaptive) */
	darkValue?: string;
}

/**
 * ColorSwatch component displays a color token with its value
 *
 * @example
 * <ColorSwatch
 *   name="primary"
 *   value="216 55% 25%"
 *   description="Main CTA buttons"
 * />
 */
export function ColorSwatch({
	name,
	value,
	description,
	adaptive = false,
	darkValue
}: ColorSwatchProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(`hsl(${value})`);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const colorStyle = {
		backgroundColor: `hsl(${value})`
	};

	const darkColorStyle = darkValue ? {
		backgroundColor: `hsl(${darkValue})`
	} : undefined;

	return (
		<div className="group rounded-lg border bg-card p-3 hover:shadow-md transition-shadow">
			<div className="flex items-center gap-3">
				{/* Color Preview */}
				<div className="flex gap-1">
					<div
						className="h-12 w-12 rounded-md shadow-inner ring-1 ring-border"
						style={colorStyle}
						title={adaptive ? "Light mode" : "Color preview"}
					/>
					{adaptive && darkColorStyle && (
						<div
							className="h-12 w-12 rounded-md shadow-inner ring-1 ring-border"
							style={darkColorStyle}
							title="Dark mode"
						/>
					)}
				</div>

				{/* Color Info */}
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2">
						<p className="text-sm font-semibold">{name}</p>
						{adaptive && (
							<span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">
								adaptive
							</span>
						)}
					</div>
					{description && (
						<p className="text-xs text-muted-foreground">{description}</p>
					)}
				</div>

				{/* Copy Button */}
				<button
					onClick={handleCopy}
					className="opacity-0 group-hover:opacity-100 p-2 rounded-md hover:bg-muted transition-all"
					title="Copy HSL value"
				>
					{copied ? (
						<Check className="h-4 w-4 text-green-600" />
					) : (
						<Copy className="h-4 w-4 text-muted-foreground" />
					)}
				</button>
			</div>

			{/* HSL Values */}
			<div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground font-mono">
				<code>{value}</code>
				{adaptive && darkValue && (
					<>
						<span>→</span>
						<code>{darkValue}</code>
					</>
				)}
			</div>
		</div>
	);
}
