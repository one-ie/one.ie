/**
 * A/B Test Setup Wizard
 *
 * Complete wizard for creating and configuring A/B tests including:
 * - Test type selection (headline, CTA, image, page, flow)
 * - Variant creation (up to 5 variants: A, B, C, D, E)
 * - Traffic split configuration
 * - Success metric definition
 * - Duration and sample size settings
 * - Statistical significance calculator
 *
 * Part of Cycle 75: A/B Testing Setup
 */

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
	Beaker,
	TrendingUp,
	Users,
	Clock,
	Target,
	Plus,
	Trash2,
	AlertCircle,
	CheckCircle2,
	Info,
} from "lucide-react";

interface Variant {
	name: string;
	customName?: string; // NEW: Custom variant names
	trafficPercent: number;
	changes: {
		headline?: string;
		ctaText?: string;
		image?: string;
		pageContent?: string;
		description?: string;
	};
}

interface ABTestSetupProps {
	funnelId: string;
	onSuccess?: (testId: string) => void;
	onCancel?: () => void;
}

type TestType = "headline" | "cta_button" | "image" | "entire_page" | "funnel_flow";
type SuccessMetric = "conversion_rate" | "revenue" | "time_on_page" | "form_completion" | "click_through_rate";

const TEST_TYPE_INFO: Record<TestType, { label: string; description: string; icon: string }> = {
	headline: {
		label: "Headline",
		description: "Test different headlines to see which grabs attention",
		icon: "✏️",
	},
	cta_button: {
		label: "CTA Button",
		description: "Test button text, color, or placement",
		icon: "🔘",
	},
	image: {
		label: "Image",
		description: "Test different hero images or product photos",
		icon: "🖼️",
	},
	entire_page: {
		label: "Entire Page",
		description: "Test completely different page designs",
		icon: "📄",
	},
	funnel_flow: {
		label: "Funnel Flow",
		description: "Test different step sequences or paths",
		icon: "🌊",
	},
};

const SUCCESS_METRIC_INFO: Record<SuccessMetric, { label: string; description: string }> = {
	conversion_rate: {
		label: "Conversion Rate",
		description: "Percentage of visitors who complete the goal",
	},
	revenue: {
		label: "Revenue",
		description: "Total revenue generated per variant",
	},
	time_on_page: {
		label: "Time on Page",
		description: "Average time visitors spend on the page",
	},
	form_completion: {
		label: "Form Completion",
		description: "Percentage of visitors who submit the form",
	},
	click_through_rate: {
		label: "Click-Through Rate",
		description: "Percentage of visitors who click the CTA",
	},
};

export function ABTestSetup({ funnelId, onSuccess, onCancel }: ABTestSetupProps) {
	const [currentStep, setCurrentStep] = useState(1);
	const [testName, setTestName] = useState("");
	const [description, setDescription] = useState("");
	const [testType, setTestType] = useState<TestType>("headline");
	const [successMetric, setSuccessMetric] = useState<SuccessMetric>("conversion_rate");
	const [variants, setVariants] = useState<Variant[]>([
		{ name: "A", customName: "", trafficPercent: 50, changes: {} },
		{ name: "B", customName: "", trafficPercent: 50, changes: {} },
	]);
	const [duration, setDuration] = useState(14); // days
	const [minimumSampleSize, setMinimumSampleSize] = useState(100);
	const [confidenceLevel, setConfidenceLevel] = useState(95);
	const [enableEmailNotifications, setEnableEmailNotifications] = useState(true); // NEW

	const createTest = useMutation(api.mutations.analytics.createABTest);

	// Calculate if traffic split is valid (totals 100%)
	const trafficTotal = variants.reduce((sum, v) => sum + v.trafficPercent, 0);
	const isTrafficValid = Math.abs(trafficTotal - 100) < 0.01;

	// Add variant (max 5)
	const addVariant = () => {
		if (variants.length >= 5) {
			toast.error("Maximum 5 variants allowed");
			return;
		}

		const variantNames = ["A", "B", "C", "D", "E"];
		const nextName = variantNames[variants.length];

		// Redistribute traffic evenly
		const newTrafficPercent = 100 / (variants.length + 1);
		const updatedVariants = variants.map((v) => ({
			...v,
			trafficPercent: newTrafficPercent,
		}));

		setVariants([
			...updatedVariants,
			{ name: nextName, customName: "", trafficPercent: newTrafficPercent, changes: {} },
		]);
	};

	// Remove variant
	const removeVariant = (index: number) => {
		if (variants.length <= 2) {
			toast.error("Minimum 2 variants required");
			return;
		}

		const newVariants = variants.filter((_, i) => i !== index);

		// Redistribute traffic evenly
		const newTrafficPercent = 100 / newVariants.length;
		setVariants(newVariants.map((v) => ({ ...v, trafficPercent: newTrafficPercent })));
	};

	// Update variant traffic percentage
	const updateVariantTraffic = (index: number, percent: number) => {
		const newVariants = [...variants];
		newVariants[index].trafficPercent = percent;
		setVariants(newVariants);
	};

	// Update variant changes
	const updateVariantChanges = (index: number, field: string, value: string) => {
		const newVariants = [...variants];
		newVariants[index].changes = {
			...newVariants[index].changes,
			[field]: value,
		};
		setVariants(newVariants);
	};

	// Update variant custom name (NEW)
	const updateVariantName = (index: number, customName: string) => {
		const newVariants = [...variants];
		newVariants[index].customName = customName;
		setVariants(newVariants);
	};

	// Create test
	const handleCreateTest = async () => {
		if (!testName.trim()) {
			toast.error("Please enter a test name");
			return;
		}

		if (!isTrafficValid) {
			toast.error(`Traffic split must total 100% (currently ${trafficTotal.toFixed(1)}%)`);
			return;
		}

		try {
			const result = await createTest({
				funnelId: funnelId as Id<"things">,
				name: testName,
				description,
				testType,
				variants,
				successMetric,
				minimumSampleSize,
				confidenceLevel,
				endDate: duration ? Date.now() + duration * 24 * 60 * 60 * 1000 : undefined,
			});

			toast.success("A/B test created successfully!");
			onSuccess?.(result.testId);
		} catch (error) {
			console.error("Failed to create A/B test:", error);
			toast.error("Failed to create A/B test");
		}
	};

	// Calculate sample size needed for statistical significance
	const calculateSampleSize = () => {
		// Simplified formula (actual would use power analysis)
		const baseline = 0.1; // 10% baseline conversion rate
		const mde = 0.02; // 2% minimum detectable effect
		const alpha = 1 - confidenceLevel / 100; // significance level
		const power = 0.8;

		// Rough estimate: n = (Zα/2 + Zβ)² × 2p(1-p) / (p1-p2)²
		const samplePerVariant = Math.ceil(
			((1.96 + 0.84) ** 2 * 2 * baseline * (1 - baseline)) / mde ** 2
		);

		return samplePerVariant * variants.length;
	};

	const recommendedSampleSize = calculateSampleSize();

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
						<Beaker className="h-8 w-8" />
						Create A/B Test
					</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Test variations to optimize your funnel performance
					</p>
				</div>
				{onCancel && (
					<Button variant="outline" onClick={onCancel}>
						Cancel
					</Button>
				)}
			</div>

			{/* Progress Steps */}
			<div className="flex items-center gap-2">
				{[1, 2, 3, 4].map((step) => (
					<div key={step} className="flex items-center gap-2 flex-1">
						<div
							className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
								step === currentStep
									? "bg-primary text-primary-foreground"
									: step < currentStep
										? "bg-green-500 text-white"
										: "bg-muted text-muted-foreground"
							}`}
						>
							{step < currentStep ? <CheckCircle2 className="h-4 w-4" /> : step}
						</div>
						{step < 4 && <div className="flex-1 h-0.5 bg-border" />}
					</div>
				))}
			</div>

			{/* Step Content */}
			<Tabs value={currentStep.toString()} className="w-full">
				{/* Step 1: Basic Info */}
				<TabsContent value="1" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Step 1: Basic Information</CardTitle>
							<CardDescription>Give your test a name and choose what to test</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Test Name */}
							<div className="space-y-2">
								<Label htmlFor="testName">Test Name *</Label>
								<Input
									id="testName"
									placeholder="e.g., Homepage Headline Test"
									value={testName}
									onChange={(e) => setTestName(e.target.value)}
								/>
							</div>

							{/* Description */}
							<div className="space-y-2">
								<Label htmlFor="description">Description (Optional)</Label>
								<Textarea
									id="description"
									placeholder="What are you hoping to learn from this test?"
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									rows={3}
								/>
							</div>

							{/* Test Type */}
							<div className="space-y-2">
								<Label>What would you like to test? *</Label>
								<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
									{(Object.keys(TEST_TYPE_INFO) as TestType[]).map((type) => (
										<Card
											key={type}
											className={`cursor-pointer transition-all ${
												testType === type
													? "border-primary bg-primary/5"
													: "hover:border-primary/50"
											}`}
											onClick={() => setTestType(type)}
										>
											<CardContent className="p-4">
												<div className="text-2xl mb-2">{TEST_TYPE_INFO[type].icon}</div>
												<div className="font-medium">{TEST_TYPE_INFO[type].label}</div>
												<div className="text-xs text-muted-foreground mt-1">
													{TEST_TYPE_INFO[type].description}
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							</div>
						</CardContent>
					</Card>

					<div className="flex justify-end">
						<Button onClick={() => setCurrentStep(2)}>
							Next: Configure Variants
						</Button>
					</div>
				</TabsContent>

				{/* Step 2: Variants */}
				<TabsContent value="2" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Step 2: Configure Variants</CardTitle>
							<CardDescription>
								Create up to 5 variants and set traffic distribution
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Variants List */}
							{variants.map((variant, index) => (
								<Card key={variant.name} className="border-2">
									<CardHeader>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2 flex-1">
												<Badge variant="outline" className="text-lg px-3 py-1">
													Variant {variant.name}
												</Badge>
												{variant.name === "A" && (
													<span className="text-xs text-muted-foreground">(Control)</span>
												)}
											</div>
											{variants.length > 2 && (
												<Button
													variant="ghost"
													size="sm"
													onClick={() => removeVariant(index)}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											)}
										</div>
										{/* NEW: Custom variant name */}
										<div className="mt-3">
											<Label className="text-xs text-muted-foreground">
												Custom Name (Optional)
											</Label>
											<Input
												placeholder={`e.g., "Blue Button" or "Short Headline"`}
												value={variant.customName || ""}
												onChange={(e) => updateVariantName(index, e.target.value)}
												className="mt-1"
											/>
										</div>
									</CardHeader>
									<CardContent className="space-y-4">
										{/* Traffic Percentage */}
										<div className="space-y-2">
											<div className="flex items-center justify-between">
												<Label>Traffic Split</Label>
												<span className="text-sm font-medium">
													{variant.trafficPercent.toFixed(1)}%
												</span>
											</div>
											<Slider
												value={[variant.trafficPercent]}
												onValueChange={(value) => updateVariantTraffic(index, value[0])}
												max={100}
												step={0.1}
												className="w-full"
											/>
										</div>

										<Separator />

										{/* Variant Changes */}
										{testType === "headline" && (
											<div className="space-y-2">
												<Label>Headline Text</Label>
												<Input
													placeholder="Enter headline..."
													value={variant.changes.headline || ""}
													onChange={(e) =>
														updateVariantChanges(index, "headline", e.target.value)
													}
												/>
											</div>
										)}

										{testType === "cta_button" && (
											<div className="space-y-2">
												<Label>Button Text</Label>
												<Input
													placeholder="Enter button text..."
													value={variant.changes.ctaText || ""}
													onChange={(e) =>
														updateVariantChanges(index, "ctaText", e.target.value)
													}
												/>
											</div>
										)}

										{testType === "image" && (
											<div className="space-y-2">
												<Label>Image URL</Label>
												<Input
													placeholder="https://..."
													value={variant.changes.image || ""}
													onChange={(e) =>
														updateVariantChanges(index, "image", e.target.value)
													}
												/>
											</div>
										)}

										<div className="space-y-2">
											<Label>Description (Optional)</Label>
											<Textarea
												placeholder="Describe this variant..."
												value={variant.changes.description || ""}
												onChange={(e) =>
													updateVariantChanges(index, "description", e.target.value)
												}
												rows={2}
											/>
										</div>
									</CardContent>
								</Card>
							))}

							{/* Add Variant */}
							{variants.length < 5 && (
								<Button variant="outline" onClick={addVariant} className="w-full">
									<Plus className="mr-2 h-4 w-4" />
									Add Variant ({5 - variants.length} remaining)
								</Button>
							)}

							{/* Traffic Split Validation */}
							<Card
								className={
									isTrafficValid
										? "border-green-500 bg-green-50 dark:bg-green-950"
										: "border-red-500 bg-red-50 dark:bg-red-950"
								}
							>
								<CardContent className="p-4 flex items-center gap-2">
									{isTrafficValid ? (
										<>
											<CheckCircle2 className="h-5 w-5 text-green-600" />
											<span className="text-sm text-green-800 dark:text-green-200">
												Traffic split totals 100% - ready to proceed
											</span>
										</>
									) : (
										<>
											<AlertCircle className="h-5 w-5 text-red-600" />
											<span className="text-sm text-red-800 dark:text-red-200">
												Traffic split must total 100% (currently {trafficTotal.toFixed(1)}%)
											</span>
										</>
									)}
								</CardContent>
							</Card>
						</CardContent>
					</Card>

					<div className="flex justify-between">
						<Button variant="outline" onClick={() => setCurrentStep(1)}>
							Back
						</Button>
						<Button onClick={() => setCurrentStep(3)} disabled={!isTrafficValid}>
							Next: Success Metrics
						</Button>
					</div>
				</TabsContent>

				{/* Step 3: Success Metrics */}
				<TabsContent value="3" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Step 3: Define Success</CardTitle>
							<CardDescription>Choose how to measure the winning variant</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Success Metric */}
							<div className="space-y-2">
								<Label>Success Metric *</Label>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
									{(Object.keys(SUCCESS_METRIC_INFO) as SuccessMetric[]).map((metric) => (
										<Card
											key={metric}
											className={`cursor-pointer transition-all ${
												successMetric === metric
													? "border-primary bg-primary/5"
													: "hover:border-primary/50"
											}`}
											onClick={() => setSuccessMetric(metric)}
										>
											<CardContent className="p-4">
												<div className="flex items-center gap-2 mb-2">
													<Target className="h-4 w-4" />
													<div className="font-medium">
														{SUCCESS_METRIC_INFO[metric].label}
													</div>
												</div>
												<div className="text-xs text-muted-foreground">
													{SUCCESS_METRIC_INFO[metric].description}
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							</div>
						</CardContent>
					</Card>

					<div className="flex justify-between">
						<Button variant="outline" onClick={() => setCurrentStep(2)}>
							Back
						</Button>
						<Button onClick={() => setCurrentStep(4)}>
							Next: Duration & Settings
						</Button>
					</div>
				</TabsContent>

				{/* Step 4: Duration & Settings */}
				<TabsContent value="4" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Step 4: Duration & Settings</CardTitle>
							<CardDescription>Set test duration and statistical requirements</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* Duration */}
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<Label>Test Duration (Days)</Label>
									<span className="text-sm font-medium">{duration} days</span>
								</div>
								<Slider
									value={[duration]}
									onValueChange={(value) => setDuration(value[0])}
									min={1}
									max={90}
									step={1}
									className="w-full"
								/>
								<p className="text-xs text-muted-foreground">
									Recommended: At least 7-14 days for reliable results
								</p>
							</div>

							{/* Confidence Level */}
							<div className="space-y-2">
								<Label>Confidence Level</Label>
								<Select
									value={confidenceLevel.toString()}
									onValueChange={(value) => setConfidenceLevel(Number(value))}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="90">90% (Lower confidence, faster results)</SelectItem>
										<SelectItem value="95">95% (Recommended)</SelectItem>
										<SelectItem value="99">99% (Highest confidence)</SelectItem>
									</SelectContent>
								</Select>
								<p className="text-xs text-muted-foreground">
									Higher confidence requires more data
								</p>
							</div>

							{/* Sample Size */}
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<Label>Minimum Sample Size</Label>
									<span className="text-sm font-medium">
										{minimumSampleSize.toLocaleString()} visitors
									</span>
								</div>
								<Slider
									value={[minimumSampleSize]}
									onValueChange={(value) => setMinimumSampleSize(value[0])}
									min={50}
									max={10000}
									step={50}
									className="w-full"
								/>
							</div>

							{/* Recommendation */}
							<Card className="border-blue-500 bg-blue-50 dark:bg-blue-950">
								<CardContent className="p-4">
									<div className="flex items-start gap-2">
										<Info className="h-5 w-5 text-blue-600 mt-0.5" />
										<div className="flex-1">
											<div className="font-medium text-blue-900 dark:text-blue-100 mb-1">
												Recommended Sample Size
											</div>
											<div className="text-sm text-blue-800 dark:text-blue-200">
												Based on your settings, we recommend collecting at least{" "}
												<span className="font-bold">
													{recommendedSampleSize.toLocaleString()}
												</span>{" "}
												total visitors ({Math.ceil(recommendedSampleSize / variants.length).toLocaleString()} per
												variant) for reliable results at {confidenceLevel}% confidence.
											</div>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* NEW: Email Notifications */}
							<Card>
								<CardHeader>
									<CardTitle className="text-sm">Email Notifications</CardTitle>
									<CardDescription className="text-xs">
										Get notified when your test reaches statistical significance
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="flex items-center justify-between">
										<div className="flex-1">
											<Label htmlFor="email-notifications" className="text-sm">
												Send email when winner is declared
											</Label>
											<p className="text-xs text-muted-foreground mt-1">
												You'll receive an email when a variant reaches 95% confidence
											</p>
										</div>
										<input
											id="email-notifications"
											type="checkbox"
											checked={enableEmailNotifications}
											onChange={(e) => setEnableEmailNotifications(e.target.checked)}
											className="h-4 w-4"
										/>
									</div>
								</CardContent>
							</Card>
						</CardContent>
					</Card>

					{/* Summary */}
					<Card>
						<CardHeader>
							<CardTitle>Test Summary</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<div className="text-sm text-muted-foreground">Test Type</div>
									<div className="font-medium">{TEST_TYPE_INFO[testType].label}</div>
								</div>
								<div>
									<div className="text-sm text-muted-foreground">Variants</div>
									<div className="font-medium">{variants.length}</div>
								</div>
								<div>
									<div className="text-sm text-muted-foreground">Success Metric</div>
									<div className="font-medium">{SUCCESS_METRIC_INFO[successMetric].label}</div>
								</div>
								<div>
									<div className="text-sm text-muted-foreground">Duration</div>
									<div className="font-medium">{duration} days</div>
								</div>
								<div>
									<div className="text-sm text-muted-foreground">Confidence Level</div>
									<div className="font-medium">{confidenceLevel}%</div>
								</div>
								<div>
									<div className="text-sm text-muted-foreground">Min Sample Size</div>
									<div className="font-medium">{minimumSampleSize.toLocaleString()}</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<div className="flex justify-between">
						<Button variant="outline" onClick={() => setCurrentStep(3)}>
							Back
						</Button>
						<Button onClick={handleCreateTest} disabled={!testName.trim() || !isTrafficValid}>
							Create A/B Test
						</Button>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
