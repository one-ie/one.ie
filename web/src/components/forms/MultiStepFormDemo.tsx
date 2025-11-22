/**
 * MultiStepFormDemo - Example Usage (Cycle 68)
 *
 * Demonstrates multi-step form with 3 steps:
 * 1. Personal Information
 * 2. Address Details
 * 3. Account Setup
 */

import { MultiStepForm, type FormStep } from "./MultiStepForm";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Form validation schemas
const validatePersonalInfo = async (
	data: Record<string, any>,
): Promise<string[]> => {
	const errors: string[] = [];

	if (!data.firstName?.trim()) {
		errors.push("First name is required");
	}

	if (!data.lastName?.trim()) {
		errors.push("Last name is required");
	}

	if (!data.email?.trim()) {
		errors.push("Email is required");
	} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
		errors.push("Please enter a valid email address");
	}

	if (!data.phone?.trim()) {
		errors.push("Phone number is required");
	}

	return errors;
};

const validateAddress = async (
	data: Record<string, any>,
): Promise<string[]> => {
	const errors: string[] = [];

	if (!data.street?.trim()) {
		errors.push("Street address is required");
	}

	if (!data.city?.trim()) {
		errors.push("City is required");
	}

	if (!data.state) {
		errors.push("State is required");
	}

	if (!data.zipCode?.trim()) {
		errors.push("ZIP code is required");
	} else if (!/^\d{5}(-\d{4})?$/.test(data.zipCode)) {
		errors.push("Please enter a valid ZIP code");
	}

	return errors;
};

const validateAccount = async (
	data: Record<string, any>,
): Promise<string[]> => {
	const errors: string[] = [];

	if (!data.username?.trim()) {
		errors.push("Username is required");
	} else if (data.username.length < 3) {
		errors.push("Username must be at least 3 characters");
	}

	if (!data.password?.trim()) {
		errors.push("Password is required");
	} else if (data.password.length < 8) {
		errors.push("Password must be at least 8 characters");
	}

	if (data.password !== data.confirmPassword) {
		errors.push("Passwords do not match");
	}

	if (!data.agreeToTerms) {
		errors.push("You must agree to the terms and conditions");
	}

	return errors;
};

// Form steps definition
const formSteps: FormStep[] = [
	{
		id: "personal",
		label: "Personal Info",
		description: "Tell us about yourself",
		fields: ["firstName", "lastName", "email", "phone"],
		validate: validatePersonalInfo,
	},
	{
		id: "address",
		label: "Address",
		description: "Where do you live?",
		fields: ["street", "city", "state", "zipCode"],
		validate: validateAddress,
	},
	{
		id: "account",
		label: "Account Setup",
		description: "Create your account",
		fields: ["username", "password", "confirmPassword", "agreeToTerms"],
		validate: validateAccount,
	},
];

export function MultiStepFormDemo() {
	// Render step content
	const renderStep = (
		step: FormStep,
		stepIndex: number,
		data: Record<string, any>,
		updateData: (newData: Record<string, any>) => void,
	) => {
		// Step 1: Personal Information
		if (step.id === "personal") {
			return (
				<div className="space-y-4">
					<div className="grid md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="firstName">
								First Name <span className="text-destructive">*</span>
							</Label>
							<Input
								id="firstName"
								placeholder="John"
								value={data.firstName || ""}
								onChange={(e) => updateData({ firstName: e.target.value })}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="lastName">
								Last Name <span className="text-destructive">*</span>
							</Label>
							<Input
								id="lastName"
								placeholder="Doe"
								value={data.lastName || ""}
								onChange={(e) => updateData({ lastName: e.target.value })}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="email">
							Email <span className="text-destructive">*</span>
						</Label>
						<Input
							id="email"
							type="email"
							placeholder="john@example.com"
							value={data.email || ""}
							onChange={(e) => updateData({ email: e.target.value })}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="phone">
							Phone Number <span className="text-destructive">*</span>
						</Label>
						<Input
							id="phone"
							type="tel"
							placeholder="(555) 123-4567"
							value={data.phone || ""}
							onChange={(e) => updateData({ phone: e.target.value })}
						/>
					</div>
				</div>
			);
		}

		// Step 2: Address Details
		if (step.id === "address") {
			return (
				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="street">
							Street Address <span className="text-destructive">*</span>
						</Label>
						<Input
							id="street"
							placeholder="123 Main St"
							value={data.street || ""}
							onChange={(e) => updateData({ street: e.target.value })}
						/>
					</div>

					<div className="grid md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="city">
								City <span className="text-destructive">*</span>
							</Label>
							<Input
								id="city"
								placeholder="San Francisco"
								value={data.city || ""}
								onChange={(e) => updateData({ city: e.target.value })}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="state">
								State <span className="text-destructive">*</span>
							</Label>
							<Select
								value={data.state || ""}
								onValueChange={(value) => updateData({ state: value })}
							>
								<SelectTrigger id="state">
									<SelectValue placeholder="Select state" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="CA">California</SelectItem>
									<SelectItem value="NY">New York</SelectItem>
									<SelectItem value="TX">Texas</SelectItem>
									<SelectItem value="FL">Florida</SelectItem>
									<SelectItem value="WA">Washington</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="zipCode">
							ZIP Code <span className="text-destructive">*</span>
						</Label>
						<Input
							id="zipCode"
							placeholder="94102"
							value={data.zipCode || ""}
							onChange={(e) => updateData({ zipCode: e.target.value })}
						/>
					</div>
				</div>
			);
		}

		// Step 3: Account Setup
		if (step.id === "account") {
			return (
				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="username">
							Username <span className="text-destructive">*</span>
						</Label>
						<Input
							id="username"
							placeholder="johndoe"
							value={data.username || ""}
							onChange={(e) => updateData({ username: e.target.value })}
						/>
						<p className="text-xs text-muted-foreground">
							At least 3 characters
						</p>
					</div>

					<div className="space-y-2">
						<Label htmlFor="password">
							Password <span className="text-destructive">*</span>
						</Label>
						<Input
							id="password"
							type="password"
							placeholder="••••••••"
							value={data.password || ""}
							onChange={(e) => updateData({ password: e.target.value })}
						/>
						<p className="text-xs text-muted-foreground">
							At least 8 characters
						</p>
					</div>

					<div className="space-y-2">
						<Label htmlFor="confirmPassword">
							Confirm Password <span className="text-destructive">*</span>
						</Label>
						<Input
							id="confirmPassword"
							type="password"
							placeholder="••••••••"
							value={data.confirmPassword || ""}
							onChange={(e) => updateData({ confirmPassword: e.target.value })}
						/>
					</div>

					<div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
						<Checkbox
							id="agreeToTerms"
							checked={data.agreeToTerms || false}
							onCheckedChange={(checked) =>
								updateData({ agreeToTerms: checked })
							}
						/>
						<div className="space-y-1 leading-none">
							<Label
								htmlFor="agreeToTerms"
								className="text-sm font-normal cursor-pointer"
							>
								I agree to the{" "}
								<a href="/terms" className="underline hover:text-primary">
									Terms and Conditions
								</a>{" "}
								<span className="text-destructive">*</span>
							</Label>
						</div>
					</div>
				</div>
			);
		}

		return null;
	};

	// Handle step submission
	const handleStepSubmit = async (
		stepId: string,
		stepData: Record<string, any>,
	) => {
		// Simulate API call to save step data
		await new Promise((resolve) => setTimeout(resolve, 500));
		console.log(`Step ${stepId} submitted:`, stepData);
	};

	// Handle form completion
	const handleComplete = async (data: Record<string, any>) => {
		// Simulate API call to create account
		await new Promise((resolve) => setTimeout(resolve, 1000));

		console.log("Registration complete:", data);
		toast.success(
			`Welcome, ${data.firstName}! Your account has been created.`,
		);

		// In a real app, you would redirect to dashboard or login
		// window.location.href = '/dashboard';
	};

	return (
		<MultiStepForm
			formId="user-registration"
			title="User Registration"
			description="Complete the form to create your account"
			steps={formSteps}
			renderStep={renderStep}
			onStepSubmit={handleStepSubmit}
			onComplete={handleComplete}
			showSaveButton={true}
			progressVariant="horizontal"
		/>
	);
}
