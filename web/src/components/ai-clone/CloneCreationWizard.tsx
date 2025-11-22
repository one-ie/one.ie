/**
 * Clone Creation Wizard Component
 * Multi-step wizard for creating AI clones with progress tracking
 * Steps: Name → Sources → Voice → Photo → Personality → Review
 */

import { useStore } from "@nanostores/react";
import {
	$wizardData,
	$canProceed,
	$progressPercentage,
	wizardActions,
} from "@/stores/cloneWizard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	ChevronLeft,
	ChevronRight,
	Check,
	Sparkles,
	Upload,
	X,
	Clock,
} from "lucide-react";
import { SourceSelector } from "./SourceSelector";
import { useState } from "react";
import confetti from "canvas-confetti";

interface CloneCreationWizardProps {
	creatorName?: string;
	onComplete?: (cloneId: string) => void;
}

export function CloneCreationWizard({
	creatorName = "Creator",
	onComplete,
}: CloneCreationWizardProps) {
	const wizardData = useStore($wizardData);
	const canProceed = useStore($canProceed);
	const progressPercentage = useStore($progressPercentage);
	const [newTag, setNewTag] = useState("");

	const handleComplete = async () => {
		// Start processing
		wizardActions.startProcessing("Initializing clone creation...");

		// Simulate clone creation with progress updates
		const steps = [
			{ progress: 10, message: "Extracting content from sources..." },
			{ progress: 25, message: "Processing blog posts..." },
			{ progress: 40, message: "Analyzing courses..." },
			{ progress: 55, message: "Generating embeddings..." },
			{ progress: 70, message: "Training knowledge base..." },
			{ progress: 85, message: "Configuring personality..." },
			{ progress: 95, message: "Finalizing clone..." },
			{ progress: 100, message: "Clone created successfully!" },
		];

		for (const step of steps) {
			await new Promise((resolve) => setTimeout(resolve, 1000));
			const remaining = Math.max(0, (steps.length - steps.indexOf(step)) * 1);
			wizardActions.updateProgress(step.progress, step.message, remaining);
		}

		wizardActions.completeProcessing();

		// Fire confetti
		confetti({
			particleCount: 100,
			spread: 70,
			origin: { y: 0.6 },
		});

		// Call completion handler
		if (onComplete) {
			setTimeout(() => {
				onComplete("clone-" + Date.now());
			}, 1500);
		}
	};

	const renderStep = () => {
		switch (wizardData.currentStep) {
			case 1:
				return <Step1NameAndPersonality />;
			case 2:
				return <Step2Sources />;
			case 3:
				return <Step3Voice />;
			case 4:
				return <Step4Photo />;
			case 5:
				return <Step5Personality />;
			case 6:
				return <Step6Review creatorName={creatorName} />;
			default:
				return null;
		}
	};

	// If processing, show progress
	if (wizardData.isProcessing) {
		return (
			<div className="max-w-2xl mx-auto">
				<Card>
					<CardContent className="pt-6">
						<div className="text-center space-y-6">
							<div className="flex justify-center">
								<div className="relative">
									<Sparkles className="h-16 w-16 text-primary animate-pulse" />
									<div className="absolute inset-0 animate-ping">
										<Sparkles className="h-16 w-16 text-primary opacity-20" />
									</div>
								</div>
							</div>

							<div>
								<h2 className="text-2xl font-bold mb-2">
									Creating Your AI Clone
								</h2>
								<p className="text-muted-foreground">
									{wizardData.processingMessage}
								</p>
							</div>

							<div className="space-y-2">
								<Progress value={wizardData.processingProgress} />
								<div className="flex justify-between text-sm text-muted-foreground">
									<span>{wizardData.processingProgress}% complete</span>
									{wizardData.estimatedTimeRemaining !== undefined && (
										<span className="flex items-center gap-1">
											<Clock className="h-3 w-3" />
											~{wizardData.estimatedTimeRemaining}s remaining
										</span>
									)}
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto">
			{/* Progress Header */}
			<div className="mb-8">
				<div className="flex items-center justify-between mb-4">
					<h1 className="text-3xl font-bold">Create Your AI Clone</h1>
					<Badge variant="secondary">
						Step {wizardData.currentStep} of {wizardData.totalSteps}
					</Badge>
				</div>

				<Progress value={progressPercentage} className="mb-2" />

				{/* Step Indicators */}
				<div className="flex items-center justify-between text-sm">
					{STEPS.map((step, index) => {
						const stepNumber = index + 1;
						const isCompleted = wizardData.completedSteps.has(stepNumber);
						const isSkipped = wizardData.skippedSteps.has(stepNumber);
						const isCurrent = wizardData.currentStep === stepNumber;

						return (
							<div
								key={step.id}
								className={`flex items-center gap-2 ${
									isCurrent ? "text-primary font-medium" : "text-muted-foreground"
								}`}
							>
								<div
									className={`flex items-center justify-center w-6 h-6 rounded-full ${
										isCompleted
											? "bg-green-500 text-white"
											: isSkipped
												? "bg-gray-300 text-gray-600"
												: isCurrent
													? "bg-primary text-white"
													: "bg-gray-200 text-gray-500"
									}`}
								>
									{isCompleted ? (
										<Check className="h-4 w-4" />
									) : (
										<span className="text-xs">{stepNumber}</span>
									)}
								</div>
								<span className="hidden md:inline">{step.label}</span>
							</div>
						);
					})}
				</div>
			</div>

			{/* Current Step Content */}
			<div className="mb-8">{renderStep()}</div>

			{/* Navigation Buttons */}
			<div className="flex items-center justify-between">
				<Button
					variant="outline"
					onClick={() => wizardActions.previousStep()}
					disabled={wizardData.currentStep === 1}
				>
					<ChevronLeft className="h-4 w-4 mr-2" />
					Back
				</Button>

				<div className="flex gap-2">
					{/* Skip button for optional steps */}
					{[3, 4].includes(wizardData.currentStep) && (
						<Button
							variant="ghost"
							onClick={() => wizardActions.skipStep()}
						>
							Skip (Optional)
						</Button>
					)}

					{/* Next or Complete button */}
					{wizardData.currentStep < wizardData.totalSteps ? (
						<Button
							onClick={() => wizardActions.nextStep()}
							disabled={!canProceed}
						>
							Next
							<ChevronRight className="h-4 w-4 ml-2" />
						</Button>
					) : (
						<Button onClick={handleComplete} disabled={!canProceed}>
							<Sparkles className="h-4 w-4 mr-2" />
							Create Clone
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}

// Step Components

function Step1NameAndPersonality() {
	const wizardData = useStore($wizardData);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Name Your AI Clone</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="space-y-2">
					<Label htmlFor="clone-name">Clone Name</Label>
					<Input
						id="clone-name"
						placeholder="e.g., My AI Assistant, Business Coach, Tech Advisor"
						value={wizardData.name}
						onChange={(e) =>
							wizardActions.updateData({ name: e.target.value })
						}
					/>
					<p className="text-sm text-muted-foreground">
						Give your clone a memorable name (min. 3 characters)
					</p>
				</div>

				<Separator />

				<div className="space-y-2">
					<Label>Base Personality</Label>
					<div className="grid grid-cols-2 md:grid-cols-5 gap-2">
						{PERSONALITIES.map((personality) => (
							<Button
								key={personality.value}
								variant={
									wizardData.personality === personality.value
										? "default"
										: "outline"
								}
								onClick={() =>
									wizardActions.updateData({
										personality: personality.value,
									})
								}
								className="h-auto flex-col items-start p-4"
							>
								<span className="text-2xl mb-1">{personality.emoji}</span>
								<span className="font-medium">{personality.label}</span>
								<span className="text-xs text-muted-foreground mt-1">
									{personality.description}
								</span>
							</Button>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function Step2Sources() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Select Training Sources</CardTitle>
				<p className="text-sm text-muted-foreground">
					Choose the content your clone will learn from
				</p>
			</CardHeader>
			<CardContent>
				<SourceSelector />
			</CardContent>
		</Card>
	);
}

function Step3Voice() {
	const wizardData = useStore($wizardData);
	const [dragActive, setDragActive] = useState(false);

	const handleFiles = (files: FileList) => {
		const audioFiles = Array.from(files).filter((file) =>
			file.type.startsWith("audio/"),
		);
		wizardActions.updateData({
			voiceSamples: [...wizardData.voiceSamples, ...audioFiles],
		});
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Upload Voice Samples (Optional)</CardTitle>
				<p className="text-sm text-muted-foreground">
					Upload 3-5 minutes of clear audio for voice cloning
				</p>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* File Upload Area */}
				<div
					className={`border-2 border-dashed rounded-lg p-8 text-center ${
						dragActive ? "border-primary bg-primary/5" : "border-gray-300"
					}`}
					onDragOver={(e) => {
						e.preventDefault();
						setDragActive(true);
					}}
					onDragLeave={() => setDragActive(false)}
					onDrop={(e) => {
						e.preventDefault();
						setDragActive(false);
						if (e.dataTransfer.files) {
							handleFiles(e.dataTransfer.files);
						}
					}}
				>
					<Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
					<div className="space-y-2">
						<p className="font-medium">
							Drop audio files here or click to browse
						</p>
						<p className="text-sm text-muted-foreground">
							Supported: MP3, WAV, M4A (max 10MB each)
						</p>
					</div>
					<input
						type="file"
						accept="audio/*"
						multiple
						className="hidden"
						id="voice-upload"
						onChange={(e) => {
							if (e.target.files) {
								handleFiles(e.target.files);
							}
						}}
					/>
					<Button
						variant="outline"
						className="mt-4"
						onClick={() => document.getElementById("voice-upload")?.click()}
					>
						<Upload className="h-4 w-4 mr-2" />
						Choose Files
					</Button>
				</div>

				{/* Uploaded Files List */}
				{wizardData.voiceSamples.length > 0 && (
					<div className="space-y-2">
						<Label>Uploaded Samples ({wizardData.voiceSamples.length})</Label>
						{wizardData.voiceSamples.map((file, index) => (
							<div
								key={index}
								className="flex items-center justify-between p-3 border rounded-lg"
							>
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
										<span className="text-xs font-medium">
											{index + 1}
										</span>
									</div>
									<div>
										<p className="font-medium text-sm">{file.name}</p>
										<p className="text-xs text-muted-foreground">
											{(file.size / 1024 / 1024).toFixed(2)} MB
										</p>
									</div>
								</div>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => {
										wizardActions.updateData({
											voiceSamples: wizardData.voiceSamples.filter(
												(_, i) => i !== index,
											),
										});
									}}
								>
									<X className="h-4 w-4" />
								</Button>
							</div>
						))}
					</div>
				)}

				<div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
					<p className="text-sm text-blue-900 dark:text-blue-100">
						<strong>Tips for best results:</strong> Record in a quiet
						environment, speak naturally, and include a variety of
						emotions/tones. Total duration should be 3-5 minutes.
					</p>
				</div>
			</CardContent>
		</Card>
	);
}

function Step4Photo() {
	const wizardData = useStore($wizardData);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

	const handlePhotoUpload = (file: File) => {
		wizardActions.updateData({ photo: file });
		const reader = new FileReader();
		reader.onloadend = () => {
			setPreviewUrl(reader.result as string);
		};
		reader.readAsDataURL(file);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Upload Your Photo (Optional)</CardTitle>
				<p className="text-sm text-muted-foreground">
					For video avatar generation - shows your face when responding
				</p>
			</CardHeader>
			<CardContent className="space-y-4">
				{!previewUrl ? (
					<div className="border-2 border-dashed rounded-lg p-8 text-center">
						<Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
						<p className="font-medium mb-2">Upload a clear photo of yourself</p>
						<p className="text-sm text-muted-foreground mb-4">
							JPG or PNG, max 5MB
						</p>
						<input
							type="file"
							accept="image/jpeg,image/png"
							className="hidden"
							id="photo-upload"
							onChange={(e) => {
								if (e.target.files?.[0]) {
									handlePhotoUpload(e.target.files[0]);
								}
							}}
						/>
						<Button
							variant="outline"
							onClick={() => document.getElementById("photo-upload")?.click()}
						>
							<Upload className="h-4 w-4 mr-2" />
							Choose Photo
						</Button>
					</div>
				) : (
					<div className="space-y-4">
						<div className="relative max-w-sm mx-auto">
							<img
								src={previewUrl}
								alt="Preview"
								className="w-full rounded-lg border"
							/>
							<Button
								variant="destructive"
								size="sm"
								className="absolute top-2 right-2"
								onClick={() => {
									wizardActions.updateData({ photo: undefined });
									setPreviewUrl(null);
								}}
							>
								<X className="h-4 w-4 mr-1" />
								Remove
							</Button>
						</div>
						<p className="text-sm text-center text-muted-foreground">
							Photo uploaded successfully
						</p>
					</div>
				)}

				<div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
					<p className="text-sm text-blue-900 dark:text-blue-100">
						<strong>Tips:</strong> Use a high-quality photo with good
						lighting. Face should be clearly visible and centered.
					</p>
				</div>
			</CardContent>
		</Card>
	);
}

function Step5Personality() {
	const wizardData = useStore($wizardData);
	const [newTag, setNewTag] = useState("");

	return (
		<Card>
			<CardHeader>
				<CardTitle>Configure Personality</CardTitle>
				<p className="text-sm text-muted-foreground">
					Fine-tune how your clone responds
				</p>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Temperature Slider */}
				<div className="space-y-2">
					<div className="flex justify-between">
						<Label>Creativity (Temperature)</Label>
						<span className="text-sm text-muted-foreground">
							{wizardData.temperature.toFixed(1)}
						</span>
					</div>
					<Slider
						value={[wizardData.temperature]}
						onValueChange={([value]) =>
							wizardActions.updateData({ temperature: value })
						}
						min={0}
						max={1}
						step={0.1}
					/>
					<div className="flex justify-between text-xs text-muted-foreground">
						<span>Precise</span>
						<span>Balanced</span>
						<span>Creative</span>
					</div>
				</div>

				<Separator />

				{/* Tone Selection */}
				<div className="space-y-2">
					<Label>Response Tone</Label>
					<Select
						value={wizardData.tone}
						onValueChange={(value: typeof wizardData.tone) =>
							wizardActions.updateData({ tone: value })
						}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="formal">Formal</SelectItem>
							<SelectItem value="casual">Casual</SelectItem>
							<SelectItem value="enthusiastic">Enthusiastic</SelectItem>
							<SelectItem value="neutral">Neutral</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<Separator />

				{/* Expertise Tags */}
				<div className="space-y-2">
					<Label>Expertise Tags</Label>
					<div className="flex gap-2">
						<Input
							placeholder="Add expertise (e.g., React, AI, Design)"
							value={newTag}
							onChange={(e) => setNewTag(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && newTag.trim()) {
									wizardActions.addExpertiseTag(newTag.trim());
									setNewTag("");
								}
							}}
						/>
						<Button
							variant="outline"
							onClick={() => {
								if (newTag.trim()) {
									wizardActions.addExpertiseTag(newTag.trim());
									setNewTag("");
								}
							}}
						>
							Add
						</Button>
					</div>

					{/* Tag List */}
					{wizardData.expertiseTags.length > 0 && (
						<div className="flex flex-wrap gap-2 mt-3">
							{wizardData.expertiseTags.map((tag) => (
								<Badge key={tag} variant="secondary" className="gap-1">
									{tag}
									<button
										onClick={() => wizardActions.removeExpertiseTag(tag)}
										className="hover:text-destructive"
									>
										<X className="h-3 w-3" />
									</button>
								</Badge>
							))}
						</div>
					)}

					<p className="text-sm text-muted-foreground">
						Add at least one expertise tag to help users understand what your
						clone knows about
					</p>
				</div>
			</CardContent>
		</Card>
	);
}

function Step6Review({ creatorName }: { creatorName: string }) {
	const wizardData = useStore($wizardData);

	const selectedSourceCount =
		wizardData.selectedSources.blogPosts.length +
		wizardData.selectedSources.courses.length +
		wizardData.selectedSources.videos.length +
		wizardData.selectedSources.products.length;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Review and Create</CardTitle>
				<p className="text-sm text-muted-foreground">
					Double-check your settings before creating the clone
				</p>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Clone Name */}
				<div>
					<Label className="text-muted-foreground">Clone Name</Label>
					<p className="text-lg font-medium">{wizardData.name}</p>
				</div>

				<Separator />

				{/* Personality */}
				<div>
					<Label className="text-muted-foreground">Base Personality</Label>
					<p className="text-lg font-medium capitalize">
						{wizardData.personality}
					</p>
				</div>

				<Separator />

				{/* Training Sources */}
				<div>
					<Label className="text-muted-foreground">Training Sources</Label>
					<p className="text-lg font-medium">{selectedSourceCount} items</p>
					<div className="mt-2 space-y-1 text-sm">
						<div>Blog Posts: {wizardData.selectedSources.blogPosts.length}</div>
						<div>Courses: {wizardData.selectedSources.courses.length}</div>
						<div>Videos: {wizardData.selectedSources.videos.length}</div>
						<div>Products: {wizardData.selectedSources.products.length}</div>
					</div>
				</div>

				<Separator />

				{/* Voice & Photo */}
				<div className="grid grid-cols-2 gap-4">
					<div>
						<Label className="text-muted-foreground">Voice Cloning</Label>
						<p className="text-lg font-medium">
							{wizardData.voiceSamples.length > 0
								? `${wizardData.voiceSamples.length} samples`
								: "Not configured"}
						</p>
					</div>
					<div>
						<Label className="text-muted-foreground">Appearance</Label>
						<p className="text-lg font-medium">
							{wizardData.photo ? "Photo uploaded" : "Not configured"}
						</p>
					</div>
				</div>

				<Separator />

				{/* Personality Config */}
				<div>
					<Label className="text-muted-foreground">Configuration</Label>
					<div className="mt-2 space-y-1 text-sm">
						<div>Temperature: {wizardData.temperature.toFixed(1)}</div>
						<div>Tone: {wizardData.tone}</div>
						<div>Expertise: {wizardData.expertiseTags.join(", ")}</div>
					</div>
				</div>

				<Separator />

				<div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
					<p className="text-sm text-green-900 dark:text-green-100">
						<strong>Ready to create!</strong> Your AI clone will be trained on
						your selected content and configured with your personality
						settings. This process takes approximately 5-10 minutes.
					</p>
				</div>
			</CardContent>
		</Card>
	);
}

// Constants

const STEPS = [
	{ id: "name", label: "Name" },
	{ id: "sources", label: "Sources" },
	{ id: "voice", label: "Voice" },
	{ id: "photo", label: "Photo" },
	{ id: "personality", label: "Config" },
	{ id: "review", label: "Review" },
];

const PERSONALITIES = [
	{
		value: "professional" as const,
		label: "Professional",
		emoji: "💼",
		description: "Formal and expert",
	},
	{
		value: "friendly" as const,
		label: "Friendly",
		emoji: "😊",
		description: "Warm and approachable",
	},
	{
		value: "creative" as const,
		label: "Creative",
		emoji: "🎨",
		description: "Imaginative and unique",
	},
	{
		value: "technical" as const,
		label: "Technical",
		emoji: "⚙️",
		description: "Precise and detailed",
	},
	{
		value: "casual" as const,
		label: "Casual",
		emoji: "👋",
		description: "Relaxed and conversational",
	},
];
