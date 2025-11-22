/**
 * Color Utilities Example Component
 *
 * Demonstrates comprehensive usage of color utilities and useThingColors hook.
 * Shows real-world patterns for thing-level branding.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Thing } from "@/lib/ontology/types";
import { useThingColors, useThingColorStyles, useHasCustomColors } from "@/hooks/useThingColors";
import {
	colorPresets,
	validateColorScheme,
	checkContrast,
	lighten,
	darken,
	hexToHsl,
} from "@/lib/color-utils";

/**
 * Example: Product Card with Thing-Level Branding
 * Demonstrates how to apply thing colors to a component
 */
export function ProductCardExample({ product }: { product: Thing }) {
	const colors = useThingColors(product);
	const hasCustom = useHasCustomColors(product);

	return (
		<Card
			style={{
				"--color-background": colors.background,
				"--color-foreground": colors.foreground,
				"--color-font": colors.font,
				"--color-primary": colors.primary,
				"--color-secondary": colors.secondary,
				"--color-tertiary": colors.tertiary,
			} as React.CSSProperties}
			className="bg-background p-1 shadow-md"
		>
			<CardContent className="bg-foreground p-4 rounded-md">
				<div className="flex items-start justify-between mb-3">
					<h3 className="text-font text-lg font-semibold">{product.name}</h3>
					{hasCustom && (
						<Badge variant="outline" className="text-tertiary border-tertiary">
							Custom Brand
						</Badge>
					)}
				</div>

				<p className="text-font opacity-80 text-sm mb-4">
					{product.properties.description || "No description available"}
				</p>

				<Separator className="my-3" />

				<div className="flex gap-2">
					<Button
						className="bg-primary text-white hover:opacity-90"
						style={{ backgroundColor: `hsl(${colors.primary})` }}
					>
						Purchase
					</Button>
					<Button
						variant="outline"
						className="border-secondary text-secondary"
						style={{
							borderColor: `hsl(${colors.secondary})`,
							color: `hsl(${colors.secondary})`,
						}}
					>
						Learn More
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

/**
 * Example: Color Preset Switcher
 * Demonstrates applying different brand presets to a thing
 */
export function ColorPresetSwitcher() {
	const [selectedPreset, setSelectedPreset] = useState("platform");

	// Create a mock thing with selected preset colors
	const mockThing: Thing = {
		_id: "example-1",
		groupId: "group-1",
		type: "product",
		name: "Premium Course",
		properties: {
			description: "Learn advanced design patterns",
		},
		colors: colorPresets[selectedPreset],
		createdAt: Date.now(),
		updatedAt: Date.now(),
	};

	return (
		<div className="space-y-4">
			<div className="flex gap-2 flex-wrap">
				{Object.keys(colorPresets).map((preset) => (
					<Button
						key={preset}
						variant={selectedPreset === preset ? "default" : "outline"}
						size="sm"
						onClick={() => setSelectedPreset(preset)}
					>
						{preset}
					</Button>
				))}
			</div>

			<ProductCardExample product={mockThing} />
		</div>
	);
}

/**
 * Example: Color Validation Dashboard
 * Shows WCAG contrast validation in action
 */
export function ColorValidationDashboard({ thing }: { thing?: Thing }) {
	const colors = useThingColors(thing);
	const validation = validateColorScheme(colors);

	const fontOnForeground = checkContrast(colors.font, colors.foreground);
	const fontOnBackground = checkContrast(colors.font, colors.background);
	const primaryOnForeground = checkContrast(colors.primary, colors.foreground);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Color Validation Report</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Overall Status */}
				<div className="flex items-center gap-2">
					<Badge variant={validation.valid ? "default" : "destructive"}>
						{validation.valid ? "Valid" : "Invalid"}
					</Badge>
					<span className="text-sm text-muted-foreground">
						{validation.errors.length} errors, {validation.warnings.length} warnings
					</span>
				</div>

				{/* Errors */}
				{validation.errors.length > 0 && (
					<div className="space-y-2">
						<h4 className="text-sm font-medium text-destructive">Errors</h4>
						<ul className="space-y-1 text-xs text-muted-foreground">
							{validation.errors.map((error, i) => (
								<li key={i} className="text-destructive">
									{error}
								</li>
							))}
						</ul>
					</div>
				)}

				{/* Warnings */}
				{validation.warnings.length > 0 && (
					<div className="space-y-2">
						<h4 className="text-sm font-medium text-yellow-600">Warnings</h4>
						<ul className="space-y-1 text-xs text-muted-foreground">
							{validation.warnings.map((warning, i) => (
								<li key={i} className="text-yellow-600">
									{warning}
								</li>
							))}
						</ul>
					</div>
				)}

				<Separator />

				{/* Contrast Ratios */}
				<div className="space-y-2">
					<h4 className="text-sm font-medium">Contrast Ratios</h4>
					<div className="grid grid-cols-2 gap-2 text-xs">
						<ContrastBadge
							label="Font on Foreground"
							ratio={fontOnForeground}
							required={4.5}
						/>
						<ContrastBadge
							label="Font on Background"
							ratio={fontOnBackground}
							required={3.0}
						/>
						<ContrastBadge
							label="Primary on Foreground"
							ratio={primaryOnForeground}
							required={3.0}
						/>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

/**
 * Helper: Contrast Ratio Badge
 */
function ContrastBadge({
	label,
	ratio,
	required,
}: {
	label: string;
	ratio: number;
	required: number;
}) {
	const passes = ratio >= required;

	return (
		<div className="flex flex-col gap-1">
			<span className="text-muted-foreground">{label}</span>
			<Badge variant={passes ? "default" : "destructive"} className="w-fit">
				{ratio.toFixed(2)}:1 {passes ? "✓" : "✗"}
			</Badge>
		</div>
	);
}

/**
 * Example: Color Manipulation Showcase
 * Demonstrates lighten, darken, and variant generation
 */
export function ColorManipulationShowcase() {
	const [baseColor] = useState("216 55% 25%"); // Platform primary blue

	const lightened = lighten(baseColor, 20);
	const darkened = darken(baseColor, 20);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Color Manipulation</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-3 gap-4">
					{/* Darkened */}
					<div className="space-y-2">
						<div
							className="h-20 rounded-md"
							style={{ backgroundColor: `hsl(${darkened})` }}
						/>
						<p className="text-xs text-center text-muted-foreground">
							Darkened -20%
						</p>
					</div>

					{/* Base */}
					<div className="space-y-2">
						<div
							className="h-20 rounded-md border-2 border-primary"
							style={{ backgroundColor: `hsl(${baseColor})` }}
						/>
						<p className="text-xs text-center font-medium">Base Color</p>
					</div>

					{/* Lightened */}
					<div className="space-y-2">
						<div
							className="h-20 rounded-md"
							style={{ backgroundColor: `hsl(${lightened})` }}
						/>
						<p className="text-xs text-center text-muted-foreground">
							Lightened +20%
						</p>
					</div>
				</div>

				<div className="text-xs text-muted-foreground space-y-1">
					<p>Base: {baseColor}</p>
					<p>Darkened: {darkened}</p>
					<p>Lightened: {lightened}</p>
				</div>
			</CardContent>
		</Card>
	);
}

/**
 * Example: HEX to HSL Converter
 * Demonstrates color conversion utilities
 */
export function ColorConverterExample() {
	const [hexInput, setHexInput] = useState("#1a73e8");
	const [hslOutput, setHslOutput] = useState("");

	const handleConvert = () => {
		try {
			const hsl = hexToHsl(hexInput);
			setHslOutput(hsl);
		} catch (error) {
			setHslOutput("Invalid HEX color");
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>HEX to HSL Converter</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex gap-2">
					<input
						type="text"
						value={hexInput}
						onChange={(e) => setHexInput(e.target.value)}
						className="flex-1 px-3 py-2 border rounded-md text-sm"
						placeholder="#1a73e8"
					/>
					<Button onClick={handleConvert}>Convert</Button>
				</div>

				{hslOutput && (
					<div className="space-y-2">
						<p className="text-sm font-medium">HSL Output:</p>
						<div className="flex items-center gap-2">
							<div
								className="w-12 h-12 rounded border"
								style={{ backgroundColor: `hsl(${hslOutput})` }}
							/>
							<code className="text-sm bg-muted px-2 py-1 rounded">
								{hslOutput}
							</code>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

/**
 * Complete Example Page
 * Shows all color utilities in action
 */
export function ColorUtilsShowcase() {
	return (
		<div className="container mx-auto px-4 py-8 space-y-8">
			<div>
				<h1 className="text-4xl font-bold mb-2">Color Utilities Showcase</h1>
				<p className="text-muted-foreground">
					Comprehensive examples of color conversion, validation, and manipulation
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<ColorPresetSwitcher />
				<ColorManipulationShowcase />
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<ColorConverterExample />
				<ColorValidationDashboard />
			</div>
		</div>
	);
}
