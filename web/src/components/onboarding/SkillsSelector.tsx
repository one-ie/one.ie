/**
 * SkillsSelector - Multi-select skills and expertise
 *
 * Allows creators to select relevant skills and expertise areas
 * with suggested options and custom input
 */

import { AlertCircle, Plus, X } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useAddSkills } from "@/hooks/useOnboarding";

const SUGGESTED_SKILLS = [
	// Technical
	"React",
	"TypeScript",
	"Node.js",
	"Python",
	"JavaScript",
	"Web Development",
	"Backend Development",
	"Data Science",
	"Machine Learning",
	"Cloud Architecture",

	// Design
	"UI/UX Design",
	"Product Design",
	"Graphic Design",
	"Motion Design",
	"Figma",
	"Web Design",

	// Marketing
	"Content Marketing",
	"Social Media Marketing",
	"Email Marketing",
	"SEO",
	"Growth Marketing",
	"Brand Strategy",

	// Business
	"Product Management",
	"Project Management",
	"Business Strategy",
	"Entrepreneurship",
	"Sales",
	"Leadership",

	// Other
	"Writing",
	"Video Production",
	"Photography",
	"Public Speaking",
	"Coaching",
	"Consulting",
];

const CATEGORIES = [
	{ value: "technical", label: "Technical" },
	{ value: "design", label: "Design" },
	{ value: "marketing", label: "Marketing" },
	{ value: "business", label: "Business" },
	{ value: "creative", label: "Creative" },
	{ value: "other", label: "Other" },
];

interface SkillsSelectorProps {
	userId: string;
	onSuccess: () => void;
	onSkip?: () => void;
}

export function SkillsSelector({
	userId,
	onSuccess,
	onSkip,
}: SkillsSelectorProps) {
	const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
	const [customSkill, setCustomSkill] = useState("");
	const [category, setCategory] = useState("technical");
	const [searchTerm, setSearchTerm] = useState("");
	const [error, setError] = useState("");
	const { mutate: addSkills, loading } = useAddSkills();

	const filteredSkills = SUGGESTED_SKILLS.filter(
		(skill) =>
			skill.toLowerCase().includes(searchTerm.toLowerCase()) &&
			!selectedSkills.includes(skill),
	);

	const handleAddSkill = (skill: string) => {
		if (!selectedSkills.includes(skill) && selectedSkills.length < 50) {
			setSelectedSkills([...selectedSkills, skill]);
			setSearchTerm("");
			setError("");
		}
	};

	const handleRemoveSkill = (skill: string) => {
		setSelectedSkills(selectedSkills.filter((s) => s !== skill));
		setError("");
	};

	const handleAddCustomSkill = (e: React.FormEvent) => {
		e.preventDefault();

		const skill = customSkill.trim();
		if (!skill) return;

		if (skill.length > 50) {
			setError("Skill must be 50 characters or less");
			return;
		}

		if (!selectedSkills.includes(skill)) {
			if (selectedSkills.length >= 50) {
				setError("Maximum 50 skills allowed");
				return;
			}
			handleAddSkill(skill);
			setCustomSkill("");
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (selectedSkills.length === 0) {
			setError("Please select at least one skill");
			return;
		}

		try {
			const result = await addSkills({
				userId,
				skills: selectedSkills,
				category,
			});

			if (result.success) {
				toast.success("Skills added!", {
					description: "Your profile skills have been saved.",
				});
				onSuccess();
			}
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to add skills";
			setError(message);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{/* Category Selection */}
			<div className="space-y-2">
				<Label htmlFor="category">Primary Category</Label>
				<Select value={category} onValueChange={setCategory} disabled={loading}>
					<SelectTrigger id="category">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{CATEGORIES.map((cat) => (
							<SelectItem key={cat.value} value={cat.value}>
								{cat.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<p className="text-xs text-muted-foreground">
					Select the category that best describes your main expertise
				</p>
			</div>

			{/* Skill Search & Selection */}
			<div className="space-y-2">
				<Label htmlFor="search">Search Skills</Label>
				<div className="relative">
					<Input
						id="search"
						type="text"
						placeholder="Start typing a skill..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						disabled={loading}
						autoComplete="off"
					/>
				</div>

				{/* Suggestions */}
				{searchTerm && filteredSkills.length > 0 && (
					<div className="border rounded-lg p-2 space-y-1 max-h-40 overflow-y-auto bg-muted/50">
						{filteredSkills.slice(0, 10).map((skill) => (
							<button
								key={skill}
								type="button"
								onClick={() => handleAddSkill(skill)}
								className="w-full text-left text-sm p-2 rounded hover:bg-background transition-colors"
								disabled={loading}
							>
								{skill}
							</button>
						))}
					</div>
				)}
			</div>

			{/* Custom Skill Input */}
			<form onSubmit={handleAddCustomSkill} className="space-y-2">
				<Label htmlFor="custom-skill">Add Custom Skill</Label>
				<div className="flex gap-2">
					<Input
						id="custom-skill"
						type="text"
						placeholder="Enter a custom skill..."
						value={customSkill}
						onChange={(e) => setCustomSkill(e.target.value)}
						disabled={loading}
						maxLength={50}
					/>
					<Button
						type="submit"
						size="icon"
						disabled={loading || !customSkill.trim()}
					>
						<Plus className="w-4 h-4" />
					</Button>
				</div>
			</form>

			{/* Selected Skills */}
			{selectedSkills.length > 0 && (
				<div className="space-y-2">
					<Label>
						Selected Skills ({selectedSkills.length}/{50})
					</Label>
					<div className="flex flex-wrap gap-2">
						{selectedSkills.map((skill) => (
							<Badge
								key={skill}
								variant="secondary"
								className="gap-1 cursor-pointer hover:bg-secondary/80"
								onClick={() => handleRemoveSkill(skill)}
							>
								{skill}
								<X className="w-3 h-3" />
							</Badge>
						))}
					</div>
				</div>
			)}

			{/* Error Alert */}
			{error && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{/* Info Alert */}
			<Alert>
				<AlertCircle className="h-4 w-4" />
				<AlertDescription className="text-sm">
					Your skills help creators discover you and find collaboration
					opportunities. You can update these anytime in your profile settings.
				</AlertDescription>
			</Alert>

			{/* Action Buttons */}
			<div className="space-y-2">
				<Button
					type="submit"
					className="w-full"
					disabled={loading || selectedSkills.length === 0}
				>
					{loading ? "Saving..." : "Complete Onboarding"}
				</Button>

				{onSkip && (
					<Button
						type="button"
						variant="outline"
						className="w-full"
						onClick={onSkip}
						disabled={loading}
					>
						Skip for Now
					</Button>
				)}
			</div>
		</form>
	);
}
