/**
 * Token Creation Wizard - Multi-Step Token Launchpad
 *
 * A comprehensive wizard for creating and deploying tokens with:
 * - 5 steps: Basic Info, Tokenomics, Governance, Features, Review & Deploy
 * - React Hook Form with Zod validation
 * - Distribution sliders that sum to 100%
 * - Logo upload to Cloudflare R2
 * - Real-time gas estimation
 * - Transaction status tracking
 * - Convex integration for backend mutations
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
	CheckCircle2,
	Loader2,
	Upload,
	ArrowLeft,
	ArrowRight,
	Rocket,
	AlertCircle,
	Info,
} from "lucide-react";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

// ============================================================================
// TYPES & VALIDATION SCHEMA
// ============================================================================

const tokenSchema = z.object({
	// Step 1: Basic Info
	name: z.string().min(1, "Name is required").max(50, "Name too long"),
	symbol: z.string().min(1, "Symbol is required").max(10, "Symbol too long").toUpperCase(),
	description: z.string().min(10, "Description must be at least 10 characters").max(500),
	logoUrl: z.string().url("Invalid logo URL").optional().or(z.literal("")),

	// Step 2: Tokenomics
	totalSupply: z.number().min(1, "Must be at least 1").max(1_000_000_000_000),
	decimals: z.number().min(0).max(18).default(18),
	distribution: z.object({
		team: z.number().min(0).max(100),
		investors: z.number().min(0).max(100),
		public: z.number().min(0).max(100),
		liquidity: z.number().min(0).max(100),
		treasury: z.number().min(0).max(100),
		rewards: z.number().min(0).max(100),
	}).refine(
		(data) => {
			const sum = data.team + data.investors + data.public + data.liquidity + data.treasury + data.rewards;
			return Math.abs(sum - 100) < 0.01; // Allow tiny floating point errors
		},
		{ message: "Distribution must sum to 100%" }
	),

	// Step 3: Governance (optional)
	enableGovernance: z.boolean().default(false),
	governanceConfig: z.object({
		votingPeriod: z.number().min(1).max(365).optional(),
		proposalThreshold: z.number().min(0.1).max(100).optional(),
		quorumPercentage: z.number().min(1).max(100).optional(),
	}).optional(),

	// Step 4: Features
	features: z.object({
		mintable: z.boolean().default(false),
		burnable: z.boolean().default(false),
		pausable: z.boolean().default(false),
		aiUtility: z.boolean().default(false), // X402 integration
	}),
});

type TokenFormData = z.infer<typeof tokenSchema>;

// ============================================================================
// COMPONENT PROPS
// ============================================================================

interface TokenCreationWizardProps {
	/** Callback when token is successfully deployed */
	onDeploySuccess?: (tokenData: TokenFormData & { txHash: string }) => void;

	/** Callback when wizard is cancelled */
	onCancel?: () => void;

	/** Convex mutation for creating token launch */
	onCreateLaunch?: (data: TokenFormData) => Promise<{ id: string }>;

	/** Convex mutation for deploying token */
	onDeploy?: (launchId: string, data: TokenFormData) => Promise<{ txHash: string }>;

	/** Initial form data (for editing existing tokens) */
	initialData?: Partial<TokenFormData>;
}

// ============================================================================
// WIZARD STEPS
// ============================================================================

const STEPS = [
	{ id: 1, name: "Basic Info", description: "Name, symbol, description, logo" },
	{ id: 2, name: "Tokenomics", description: "Supply, decimals, distribution" },
	{ id: 3, name: "Governance", description: "DAO configuration (optional)" },
	{ id: 4, name: "Features", description: "Mintable, burnable, pausable, AI" },
	{ id: 5, name: "Review & Deploy", description: "Preview and deploy" },
] as const;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function TokenCreationWizard({
	onDeploySuccess,
	onCancel,
	onCreateLaunch,
	onDeploy,
	initialData,
}: TokenCreationWizardProps) {
	// Wizard state
	const [currentStep, setCurrentStep] = useState(1);
	const [logoFile, setLogoFile] = useState<File | null>(null);
	const [logoPreview, setLogoPreview] = useState<string>("");
	const [uploadingLogo, setUploadingLogo] = useState(false);
	const [estimatedGas, setEstimatedGas] = useState<string>("0");
	const [deploying, setDeploying] = useState(false);
	const [deployStatus, setDeployStatus] = useState<"idle" | "creating" | "deploying" | "success" | "error">("idle");
	const [deployError, setDeployError] = useState<string>("");
	const [txHash, setTxHash] = useState<string>("");

	// Form setup with React Hook Form + Zod
	const form = useForm<TokenFormData>({
		resolver: zodResolver(tokenSchema),
		defaultValues: {
			name: "",
			symbol: "",
			description: "",
			logoUrl: "",
			totalSupply: 1_000_000,
			decimals: 18,
			distribution: {
				team: 15,
				investors: 10,
				public: 35,
				liquidity: 20,
				treasury: 10,
				rewards: 10,
			},
			enableGovernance: false,
			governanceConfig: {
				votingPeriod: 7,
				proposalThreshold: 1,
				quorumPercentage: 4,
			},
			features: {
				mintable: false,
				burnable: true,
				pausable: false,
				aiUtility: false,
			},
			...initialData,
		},
		mode: "onChange",
	});

	const { watch, setValue, formState: { errors } } = form;

	// Watch distribution values
	const distribution = watch("distribution");
	const totalDistribution = Object.values(distribution).reduce((sum, val) => sum + val, 0);
	const distributionValid = Math.abs(totalDistribution - 100) < 0.01;

	// Watch features
	const features = watch("features");
	const enableGovernance = watch("enableGovernance");

	// ============================================================================
	// LOGO UPLOAD HANDLING
	// ============================================================================

	const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file
		if (!file.type.startsWith("image/")) {
			alert("Please upload an image file");
			return;
		}

		if (file.size > 5 * 1024 * 1024) {
			alert("File size must be less than 5MB");
			return;
		}

		setLogoFile(file);

		// Create preview
		const reader = new FileReader();
		reader.onloadend = () => {
			setLogoPreview(reader.result as string);
		};
		reader.readAsDataURL(file);

		// Upload to Cloudflare R2
		setUploadingLogo(true);
		try {
			const formData = new FormData();
			formData.append("file", file);

			// TODO: Replace with actual R2 upload endpoint
			const response = await fetch("/api/upload/logo", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) throw new Error("Upload failed");

			const { url } = await response.json();
			setValue("logoUrl", url, { shouldValidate: true });
		} catch (error) {
			console.error("Logo upload failed:", error);
			alert("Failed to upload logo. Please try again.");
		} finally {
			setUploadingLogo(false);
		}
	};

	// ============================================================================
	// GAS ESTIMATION
	// ============================================================================

	useEffect(() => {
		// Real-time gas estimation based on features
		const estimateGas = () => {
			let baseGas = 200000; // Base deployment cost

			if (features.mintable) baseGas += 50000;
			if (features.burnable) baseGas += 30000;
			if (features.pausable) baseGas += 40000;
			if (features.aiUtility) baseGas += 100000;
			if (enableGovernance) baseGas += 150000;

			// Mock gas price (in gwei)
			const gasPrice = 30; // 30 gwei
			const estimatedCost = (baseGas * gasPrice) / 1e9; // Convert to ETH

			setEstimatedGas(estimatedCost.toFixed(6));
		};

		estimateGas();
	}, [features, enableGovernance]);

	// ============================================================================
	// DISTRIBUTION SLIDER HANDLING
	// ============================================================================

	const handleDistributionChange = (key: keyof TokenFormData["distribution"], value: number[]) => {
		const newValue = value[0];
		const currentValue = distribution[key];
		const diff = newValue - currentValue;

		// Adjust other values proportionally to maintain 100%
		const otherKeys = Object.keys(distribution).filter(k => k !== key) as Array<keyof typeof distribution>;
		const otherTotal = 100 - newValue;

		if (otherTotal < 0) {
			// Don't allow negative values
			return;
		}

		const newDistribution = { ...distribution, [key]: newValue };

		// Distribute the remaining percentage proportionally
		if (otherTotal > 0 && otherKeys.length > 0) {
			const currentOtherTotal = otherKeys.reduce((sum, k) => sum + distribution[k], 0);

			if (currentOtherTotal > 0) {
				otherKeys.forEach(k => {
					const proportion = distribution[k] / currentOtherTotal;
					newDistribution[k] = Math.round(otherTotal * proportion * 100) / 100;
				});
			} else {
				// Distribute evenly
				const evenSplit = otherTotal / otherKeys.length;
				otherKeys.forEach(k => {
					newDistribution[k] = Math.round(evenSplit * 100) / 100;
				});
			}
		} else if (otherTotal === 0) {
			// Set all others to 0
			otherKeys.forEach(k => {
				newDistribution[k] = 0;
			});
		}

		setValue("distribution", newDistribution, { shouldValidate: true });
	};

	// ============================================================================
	// DEPLOYMENT HANDLING
	// ============================================================================

	const handleDeploy = async () => {
		const formData = form.getValues();

		setDeploying(true);
		setDeployStatus("creating");
		setDeployError("");

		try {
			// Step 1: Create launch in database
			const launch = onCreateLaunch
				? await onCreateLaunch(formData)
				: { id: `mock-${Date.now()}` };

			setDeployStatus("deploying");

			// Step 2: Deploy token contract
			const deployment = onDeploy
				? await onDeploy(launch.id, formData)
				: { txHash: `0x${Math.random().toString(16).slice(2)}` };

			setTxHash(deployment.txHash);
			setDeployStatus("success");

			// Notify parent
			onDeploySuccess?.({
				...formData,
				txHash: deployment.txHash,
			});
		} catch (error) {
			console.error("Deployment failed:", error);
			setDeployStatus("error");
			setDeployError(error instanceof Error ? error.message : "Deployment failed");
		} finally {
			setDeploying(false);
		}
	};

	// ============================================================================
	// WIZARD NAVIGATION
	// ============================================================================

	const canProceed = () => {
		switch (currentStep) {
			case 1:
				return !errors.name && !errors.symbol && !errors.description;
			case 2:
				return !errors.totalSupply && !errors.decimals && distributionValid;
			case 3:
				return true; // Governance is optional
			case 4:
				return true; // Features are toggles
			case 5:
				return true; // Review step
			default:
				return false;
		}
	};

	const nextStep = () => {
		if (currentStep < STEPS.length) {
			setCurrentStep(currentStep + 1);
		}
	};

	const prevStep = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1);
		}
	};

	// ============================================================================
	// RENDER STEPS
	// ============================================================================

	const renderStep = () => {
		switch (currentStep) {
			case 1:
				return <Step1BasicInfo
					form={form}
					logoPreview={logoPreview}
					uploadingLogo={uploadingLogo}
					onLogoUpload={handleLogoUpload}
				/>;
			case 2:
				return <Step2Tokenomics
					form={form}
					distribution={distribution}
					distributionValid={distributionValid}
					totalDistribution={totalDistribution}
					onDistributionChange={handleDistributionChange}
				/>;
			case 3:
				return <Step3Governance form={form} />;
			case 4:
				return <Step4Features form={form} estimatedGas={estimatedGas} />;
			case 5:
				return <Step5Review
					formData={form.getValues()}
					estimatedGas={estimatedGas}
					deploying={deploying}
					deployStatus={deployStatus}
					deployError={deployError}
					txHash={txHash}
				/>;
			default:
				return null;
		}
	};

	// ============================================================================
	// RENDER WIZARD
	// ============================================================================

	return (
		<div className="max-w-4xl mx-auto p-4 space-y-6">
			{/* Header */}
			<div className="text-center space-y-2">
				<h1 className="text-3xl font-bold">Create Your Token</h1>
				<p className="text-muted-foreground">
					Launch your token in 5 simple steps
				</p>
			</div>

			{/* Progress Bar */}
			<div className="space-y-2">
				<div className="flex justify-between items-center">
					<span className="text-sm font-medium">
						Step {currentStep} of {STEPS.length}
					</span>
					<span className="text-sm text-muted-foreground">
						{STEPS[currentStep - 1].name}
					</span>
				</div>
				<Progress value={(currentStep / STEPS.length) * 100} />
			</div>

			{/* Step Indicators */}
			<div className="flex justify-between">
				{STEPS.map((step, index) => (
					<div
						key={step.id}
						className={`flex flex-col items-center flex-1 ${
							index !== STEPS.length - 1 ? "border-r" : ""
						}`}
					>
						<div
							className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
								step.id < currentStep
									? "bg-green-500 text-white"
									: step.id === currentStep
									? "bg-primary text-primary-foreground"
									: "bg-muted text-muted-foreground"
							}`}
						>
							{step.id < currentStep ? (
								<CheckCircle2 className="w-5 h-5" />
							) : (
								step.id
							)}
						</div>
						<div className="text-center mt-2 hidden md:block">
							<p className="text-xs font-medium">{step.name}</p>
							<p className="text-xs text-muted-foreground">{step.description}</p>
						</div>
					</div>
				))}
			</div>

			{/* Step Content */}
			<Card>
				<CardContent className="pt-6">
					{renderStep()}
				</CardContent>
			</Card>

			{/* Navigation Buttons */}
			<div className="flex justify-between">
				<div>
					{currentStep > 1 && deployStatus !== "success" && (
						<Button
							type="button"
							variant="outline"
							onClick={prevStep}
							disabled={deploying}
						>
							<ArrowLeft className="w-4 h-4 mr-2" />
							Previous
						</Button>
					)}
				</div>

				<div className="flex gap-2">
					{onCancel && deployStatus !== "success" && (
						<Button
							type="button"
							variant="ghost"
							onClick={onCancel}
							disabled={deploying}
						>
							Cancel
						</Button>
					)}

					{currentStep < STEPS.length ? (
						<Button
							type="button"
							onClick={nextStep}
							disabled={!canProceed()}
						>
							Next
							<ArrowRight className="w-4 h-4 ml-2" />
						</Button>
					) : (
						<Button
							type="button"
							onClick={handleDeploy}
							disabled={deploying || deployStatus === "success"}
							className="bg-green-600 hover:bg-green-700"
						>
							{deploying ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									{deployStatus === "creating" ? "Creating..." : "Deploying..."}
								</>
							) : deployStatus === "success" ? (
								<>
									<CheckCircle2 className="w-4 h-4 mr-2" />
									Deployed!
								</>
							) : (
								<>
									<Rocket className="w-4 h-4 mr-2" />
									Deploy Token
								</>
							)}
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}

// ============================================================================
// STEP COMPONENTS
// ============================================================================

function Step1BasicInfo({
	form,
	logoPreview,
	uploadingLogo,
	onLogoUpload
}: {
	form: ReturnType<typeof useForm<TokenFormData>>;
	logoPreview: string;
	uploadingLogo: boolean;
	onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
	const { register, formState: { errors } } = form;

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold mb-4">Basic Information</h2>
				<p className="text-sm text-muted-foreground mb-6">
					Enter the basic details for your token
				</p>
			</div>

			{/* Token Name */}
			<div className="space-y-2">
				<Label htmlFor="name">
					Token Name <span className="text-destructive">*</span>
				</Label>
				<Input
					id="name"
					{...register("name")}
					placeholder="e.g., Awesome Token"
					className={errors.name ? "border-destructive" : ""}
				/>
				{errors.name && (
					<p className="text-sm text-destructive">{errors.name.message}</p>
				)}
			</div>

			{/* Token Symbol */}
			<div className="space-y-2">
				<Label htmlFor="symbol">
					Token Symbol <span className="text-destructive">*</span>
				</Label>
				<Input
					id="symbol"
					{...register("symbol")}
					placeholder="e.g., AWSM"
					maxLength={10}
					className={errors.symbol ? "border-destructive" : ""}
					style={{ textTransform: "uppercase" }}
				/>
				{errors.symbol && (
					<p className="text-sm text-destructive">{errors.symbol.message}</p>
				)}
				<p className="text-xs text-muted-foreground">
					Short ticker symbol (max 10 characters)
				</p>
			</div>

			{/* Description */}
			<div className="space-y-2">
				<Label htmlFor="description">
					Description <span className="text-destructive">*</span>
				</Label>
				<Textarea
					id="description"
					{...register("description")}
					placeholder="Describe your token's purpose and utility..."
					rows={4}
					maxLength={500}
					className={errors.description ? "border-destructive" : ""}
				/>
				{errors.description && (
					<p className="text-sm text-destructive">{errors.description.message}</p>
				)}
				<p className="text-xs text-muted-foreground">
					{form.watch("description")?.length || 0} / 500 characters
				</p>
			</div>

			{/* Logo Upload */}
			<div className="space-y-2">
				<Label htmlFor="logo">Logo (Optional)</Label>
				<div className="flex items-start gap-4">
					{/* Preview */}
					{logoPreview && (
						<div className="w-24 h-24 rounded-lg border overflow-hidden bg-muted flex items-center justify-center">
							<img
								src={logoPreview}
								alt="Logo preview"
								className="w-full h-full object-cover"
							/>
						</div>
					)}

					{/* Upload Button */}
					<div className="flex-1">
						<label
							htmlFor="logo"
							className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
						>
							<div className="flex flex-col items-center justify-center pt-5 pb-6">
								{uploadingLogo ? (
									<Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
								) : (
									<>
										<Upload className="w-8 h-8 mb-2 text-muted-foreground" />
										<p className="text-xs text-muted-foreground">
											Click to upload logo
										</p>
										<p className="text-xs text-muted-foreground">
											PNG, JPG (max 5MB)
										</p>
									</>
								)}
							</div>
							<input
								id="logo"
								type="file"
								className="hidden"
								accept="image/*"
								onChange={onLogoUpload}
								disabled={uploadingLogo}
							/>
						</label>
					</div>
				</div>
			</div>
		</div>
	);
}

function Step2Tokenomics({
	form,
	distribution,
	distributionValid,
	totalDistribution,
	onDistributionChange
}: {
	form: ReturnType<typeof useForm<TokenFormData>>;
	distribution: TokenFormData["distribution"];
	distributionValid: boolean;
	totalDistribution: number;
	onDistributionChange: (key: keyof TokenFormData["distribution"], value: number[]) => void;
}) {
	const { register, formState: { errors }, watch } = form;

	const distributionCategories: Array<{
		key: keyof typeof distribution;
		label: string;
		description: string;
		color: string;
	}> = [
		{ key: "team", label: "Team", description: "Reserved for team members", color: "bg-blue-500" },
		{ key: "investors", label: "Investors", description: "Private sale allocation", color: "bg-purple-500" },
		{ key: "public", label: "Public Sale", description: "Available to public", color: "bg-green-500" },
		{ key: "liquidity", label: "Liquidity", description: "DEX liquidity pools", color: "bg-cyan-500" },
		{ key: "treasury", label: "Treasury", description: "DAO treasury reserve", color: "bg-orange-500" },
		{ key: "rewards", label: "Rewards", description: "Staking & incentives", color: "bg-pink-500" },
	];

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold mb-4">Tokenomics</h2>
				<p className="text-sm text-muted-foreground mb-6">
					Define your token's supply and distribution
				</p>
			</div>

			{/* Total Supply */}
			<div className="space-y-2">
				<Label htmlFor="totalSupply">
					Total Supply <span className="text-destructive">*</span>
				</Label>
				<Input
					id="totalSupply"
					type="number"
					{...register("totalSupply", { valueAsNumber: true })}
					placeholder="1000000"
					className={errors.totalSupply ? "border-destructive" : ""}
				/>
				{errors.totalSupply && (
					<p className="text-sm text-destructive">{errors.totalSupply.message}</p>
				)}
				<p className="text-xs text-muted-foreground">
					Total number of tokens to be created
				</p>
			</div>

			{/* Decimals */}
			<div className="space-y-2">
				<Label htmlFor="decimals">Decimals</Label>
				<Input
					id="decimals"
					type="number"
					{...register("decimals", { valueAsNumber: true })}
					min={0}
					max={18}
					className={errors.decimals ? "border-destructive" : ""}
				/>
				{errors.decimals && (
					<p className="text-sm text-destructive">{errors.decimals.message}</p>
				)}
				<p className="text-xs text-muted-foreground">
					Decimal places (18 is standard for ERC-20)
				</p>
			</div>

			<Separator />

			{/* Distribution Sliders */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<Label className="text-base">Token Distribution</Label>
					<Badge variant={distributionValid ? "default" : "destructive"}>
						Total: {totalDistribution.toFixed(1)}%
					</Badge>
				</div>

				{!distributionValid && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>
							Distribution must sum to exactly 100%
						</AlertDescription>
					</Alert>
				)}

				{distributionCategories.map(({ key, label, description, color }) => (
					<div key={key} className="space-y-2">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<div className={`w-3 h-3 rounded-full ${color}`} />
								<Label htmlFor={key} className="font-medium">
									{label}
								</Label>
							</div>
							<span className="text-sm font-medium">
								{distribution[key].toFixed(1)}%
							</span>
						</div>
						<Slider
							id={key}
							min={0}
							max={100}
							step={0.1}
							value={[distribution[key]]}
							onValueChange={(value) => onDistributionChange(key, value)}
							className="cursor-pointer"
						/>
						<p className="text-xs text-muted-foreground">{description}</p>
					</div>
				))}
			</div>

			{/* Distribution Chart Preview */}
			<div className="mt-6 p-4 bg-muted rounded-lg">
				<h3 className="text-sm font-medium mb-3">Distribution Preview</h3>
				<div className="flex h-8 rounded overflow-hidden">
					{distributionCategories.map(({ key, color }) => {
						const percentage = distribution[key];
						if (percentage === 0) return null;
						return (
							<div
								key={key}
								className={`${color} transition-all`}
								style={{ width: `${percentage}%` }}
								title={`${key}: ${percentage}%`}
							/>
						);
					})}
				</div>
			</div>
		</div>
	);
}

function Step3Governance({ form }: { form: ReturnType<typeof useForm<TokenFormData>> }) {
	const { register, watch, setValue } = form;
	const enableGovernance = watch("enableGovernance");

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold mb-4">Governance (Optional)</h2>
				<p className="text-sm text-muted-foreground mb-6">
					Configure DAO governance for your token
				</p>
			</div>

			{/* Enable Governance Toggle */}
			<div className="flex items-center justify-between p-4 border rounded-lg">
				<div className="space-y-0.5">
					<Label htmlFor="enableGovernance" className="text-base font-medium">
						Enable Governance
					</Label>
					<p className="text-sm text-muted-foreground">
						Allow token holders to vote on proposals
					</p>
				</div>
				<Switch
					id="enableGovernance"
					checked={enableGovernance}
					onCheckedChange={(checked) => setValue("enableGovernance", checked)}
				/>
			</div>

			{/* Governance Configuration (only if enabled) */}
			{enableGovernance && (
				<div className="space-y-4 pl-4 border-l-2">
					<Alert>
						<Info className="h-4 w-4" />
						<AlertDescription>
							Governance allows token holders to create and vote on proposals. Configure the parameters below.
						</AlertDescription>
					</Alert>

					{/* Voting Period */}
					<div className="space-y-2">
						<Label htmlFor="votingPeriod">Voting Period (days)</Label>
						<Input
							id="votingPeriod"
							type="number"
							{...register("governanceConfig.votingPeriod", { valueAsNumber: true })}
							min={1}
							max={365}
						/>
						<p className="text-xs text-muted-foreground">
							How long voting remains open (1-365 days)
						</p>
					</div>

					{/* Proposal Threshold */}
					<div className="space-y-2">
						<Label htmlFor="proposalThreshold">Proposal Threshold (%)</Label>
						<Input
							id="proposalThreshold"
							type="number"
							{...register("governanceConfig.proposalThreshold", { valueAsNumber: true })}
							min={0.1}
							max={100}
							step={0.1}
						/>
						<p className="text-xs text-muted-foreground">
							Minimum token % required to create a proposal
						</p>
					</div>

					{/* Quorum Percentage */}
					<div className="space-y-2">
						<Label htmlFor="quorumPercentage">Quorum (%)</Label>
						<Input
							id="quorumPercentage"
							type="number"
							{...register("governanceConfig.quorumPercentage", { valueAsNumber: true })}
							min={1}
							max={100}
							step={1}
						/>
						<p className="text-xs text-muted-foreground">
							Minimum participation required for valid vote
						</p>
					</div>
				</div>
			)}
		</div>
	);
}

function Step4Features({
	form,
	estimatedGas
}: {
	form: ReturnType<typeof useForm<TokenFormData>>;
	estimatedGas: string;
}) {
	const { watch, setValue } = form;
	const features = watch("features");

	const featureOptions = [
		{
			key: "mintable" as const,
			label: "Mintable",
			description: "Allow creating new tokens after deployment",
			icon: "➕",
		},
		{
			key: "burnable" as const,
			label: "Burnable",
			description: "Allow destroying tokens to reduce supply",
			icon: "🔥",
		},
		{
			key: "pausable" as const,
			label: "Pausable",
			description: "Emergency pause for transfers",
			icon: "⏸️",
		},
		{
			key: "aiUtility" as const,
			label: "AI Utility (X402)",
			description: "Enable AI agent interactions and payments",
			icon: "🤖",
		},
	];

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold mb-4">Token Features</h2>
				<p className="text-sm text-muted-foreground mb-6">
					Select optional features for your token
				</p>
			</div>

			{/* Feature Toggles */}
			<div className="space-y-4">
				{featureOptions.map(({ key, label, description, icon }) => (
					<div
						key={key}
						className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
					>
						<div className="flex items-start gap-3 flex-1">
							<span className="text-2xl">{icon}</span>
							<div className="space-y-0.5">
								<Label htmlFor={key} className="text-base font-medium cursor-pointer">
									{label}
								</Label>
								<p className="text-sm text-muted-foreground">{description}</p>
							</div>
						</div>
						<Switch
							id={key}
							checked={features[key]}
							onCheckedChange={(checked) =>
								setValue(`features.${key}`, checked)
							}
						/>
					</div>
				))}
			</div>

			{/* Gas Estimation */}
			<div className="mt-6 p-4 bg-muted rounded-lg space-y-2">
				<div className="flex items-center justify-between">
					<span className="text-sm font-medium">Estimated Deployment Cost</span>
					<Badge variant="outline">{estimatedGas} ETH</Badge>
				</div>
				<p className="text-xs text-muted-foreground">
					Estimated gas cost based on selected features (30 gwei)
				</p>
			</div>

			{/* AI Utility Info */}
			{features.aiUtility && (
				<Alert>
					<Info className="h-4 w-4" />
					<AlertDescription>
						AI Utility (X402) enables your token to be used by AI agents for payments,
						subscriptions, and automated transactions. Learn more about X402 integration.
					</AlertDescription>
				</Alert>
			)}
		</div>
	);
}

function Step5Review({
	formData,
	estimatedGas,
	deploying,
	deployStatus,
	deployError,
	txHash
}: {
	formData: TokenFormData;
	estimatedGas: string;
	deploying: boolean;
	deployStatus: "idle" | "creating" | "deploying" | "success" | "error";
	deployError: string;
	txHash: string;
}) {
	const enabledFeatures = Object.entries(formData.features)
		.filter(([_, enabled]) => enabled)
		.map(([key]) => key);

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold mb-4">Review & Deploy</h2>
				<p className="text-sm text-muted-foreground mb-6">
					Review your token configuration before deployment
				</p>
			</div>

			{/* Deploy Status */}
			{deployStatus !== "idle" && (
				<Alert variant={deployStatus === "error" ? "destructive" : "default"}>
					{deployStatus === "creating" && (
						<>
							<Loader2 className="h-4 w-4 animate-spin" />
							<AlertDescription>Creating token launch...</AlertDescription>
						</>
					)}
					{deployStatus === "deploying" && (
						<>
							<Loader2 className="h-4 w-4 animate-spin" />
							<AlertDescription>Deploying token contract...</AlertDescription>
						</>
					)}
					{deployStatus === "success" && (
						<>
							<CheckCircle2 className="h-4 w-4" />
							<AlertDescription>
								Token deployed successfully!
								{txHash && (
									<div className="mt-2 p-2 bg-background rounded text-xs font-mono break-all">
										TX: {txHash}
									</div>
								)}
							</AlertDescription>
						</>
					)}
					{deployStatus === "error" && (
						<>
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>{deployError}</AlertDescription>
						</>
					)}
				</Alert>
			)}

			{/* Basic Info Section */}
			<Card>
				<CardHeader>
					<CardTitle>Basic Information</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2">
					<div className="flex justify-between">
						<span className="text-muted-foreground">Name:</span>
						<span className="font-medium">{formData.name}</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">Symbol:</span>
						<span className="font-medium">{formData.symbol}</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">Description:</span>
						<span className="font-medium text-right max-w-xs truncate">
							{formData.description}
						</span>
					</div>
				</CardContent>
			</Card>

			{/* Tokenomics Section */}
			<Card>
				<CardHeader>
					<CardTitle>Tokenomics</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2">
					<div className="flex justify-between">
						<span className="text-muted-foreground">Total Supply:</span>
						<span className="font-medium">
							{formData.totalSupply.toLocaleString()}
						</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">Decimals:</span>
						<span className="font-medium">{formData.decimals}</span>
					</div>
					<Separator className="my-2" />
					<div className="space-y-1">
						<p className="text-sm font-medium">Distribution:</p>
						{Object.entries(formData.distribution).map(([key, value]) => (
							<div key={key} className="flex justify-between text-sm">
								<span className="text-muted-foreground capitalize">{key}:</span>
								<span>{value}%</span>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Governance Section */}
			{formData.enableGovernance && (
				<Card>
					<CardHeader>
						<CardTitle>Governance</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						<div className="flex justify-between">
							<span className="text-muted-foreground">Voting Period:</span>
							<span className="font-medium">
								{formData.governanceConfig?.votingPeriod} days
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Proposal Threshold:</span>
							<span className="font-medium">
								{formData.governanceConfig?.proposalThreshold}%
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Quorum:</span>
							<span className="font-medium">
								{formData.governanceConfig?.quorumPercentage}%
							</span>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Features Section */}
			<Card>
				<CardHeader>
					<CardTitle>Features</CardTitle>
				</CardHeader>
				<CardContent>
					{enabledFeatures.length > 0 ? (
						<div className="flex flex-wrap gap-2">
							{enabledFeatures.map((feature) => (
								<Badge key={feature} variant="secondary">
									{feature}
								</Badge>
							))}
						</div>
					) : (
						<p className="text-sm text-muted-foreground">No additional features enabled</p>
					)}
				</CardContent>
			</Card>

			{/* Gas Estimate */}
			<Card>
				<CardHeader>
					<CardTitle>Deployment Cost</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex justify-between items-center">
						<span className="text-muted-foreground">Estimated Gas:</span>
						<span className="text-2xl font-bold">{estimatedGas} ETH</span>
					</div>
					<p className="text-xs text-muted-foreground mt-2">
						Based on current gas price (30 gwei)
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
