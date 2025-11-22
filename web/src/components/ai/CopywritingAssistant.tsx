/**
 * AI Copywriting Assistant
 * Interactive UI for generating compelling funnel copy
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
	Lightbulb,
	Copy,
	Sparkles,
	Target,
	Zap,
	Check,
	TrendingUp
} from 'lucide-react';
import {
	generateHeadlines,
	generateCTA,
	generateFunnelCopy,
	analyzeHeadline,
	type Tone,
	type CTAAction,
	type Urgency,
} from '@/lib/ai/copywriting-tools';
import { FRAMEWORKS } from '@/lib/ai/copywriting-frameworks';

type GenerationMode = 'headline' | 'cta' | 'body' | 'complete';

export function CopywritingAssistant() {
	const [mode, setMode] = useState<GenerationMode>('headline');
	const [copied, setCopied] = useState<string | null>(null);

	// Form state
	const [audience, setAudience] = useState('');
	const [product, setProduct] = useState('');
	const [benefit, setBenefit] = useState('');
	const [painPoint, setPainPoint] = useState('');
	const [transformation, setTransformation] = useState('');
	const [uniqueValue, setUniqueValue] = useState('');
	const [tone, setTone] = useState<Tone>('professional');
	const [ctaAction, setCtaAction] = useState<CTAAction>('get_started');
	const [urgency, setUrgency] = useState<Urgency>('medium');
	const [framework, setFramework] = useState<keyof typeof FRAMEWORKS>('PAS');

	// Generated content
	const [headlines, setHeadlines] = useState<string[]>([]);
	const [ctas, setCtas] = useState<string[]>([]);
	const [bodyCopy, setBodyCopy] = useState<{ fullCopy: string; sections: Record<string, string> } | null>(null);
	const [analysis, setAnalysis] = useState<any>(null);

	// Handle generation
	const handleGenerate = () => {
		if (!audience || !product || !benefit) {
			alert('Please fill in at least: audience, product, and benefit');
			return;
		}

		switch (mode) {
			case 'headline':
				const generatedHeadlines = generateHeadlines({ audience, product, benefit, tone });
				setHeadlines(generatedHeadlines);
				// Analyze first headline
				if (generatedHeadlines[0]) {
					setAnalysis(analyzeHeadline(generatedHeadlines[0]));
				}
				break;

			case 'cta':
				const generatedCtas = generateCTA({ action: ctaAction, urgency, product });
				setCtas(generatedCtas);
				break;

			case 'body':
				// Body copy requires more fields
				if (!painPoint || !transformation || !uniqueValue) {
					alert('For body copy, please fill in: pain point, transformation, and unique value');
					return;
				}
				const result = generateFunnelCopy({
					audience,
					product,
					benefit,
					painPoint,
					transformation,
					uniqueValue,
					tone,
					ctaAction,
					urgency,
					framework
				});
				setBodyCopy(result.bodyCopy);
				break;

			case 'complete':
				// Complete funnel copy
				if (!painPoint || !transformation || !uniqueValue) {
					alert('For complete copy, please fill in all fields');
					return;
				}
				const complete = generateFunnelCopy({
					audience,
					product,
					benefit,
					painPoint,
					transformation,
					uniqueValue,
					tone,
					ctaAction,
					urgency,
					framework
				});
				setHeadlines(complete.headlines);
				setCtas(complete.ctas);
				setBodyCopy(complete.bodyCopy);
				break;
		}
	};

	// Copy to clipboard
	const copyToClipboard = (text: string, id: string) => {
		navigator.clipboard.writeText(text);
		setCopied(id);
		setTimeout(() => setCopied(null), 2000);
	};

	// Quick examples
	const loadExample = (type: 'freelance' | 'course' | 'saas') => {
		const examples = {
			freelance: {
				audience: 'freelancers',
				product: 'Client Attraction System',
				benefit: 'land high-paying clients consistently',
				painPoint: 'struggling to find quality clients who pay well',
				transformation: 'earn $10K/month with premium clients',
				uniqueValue: 'proven outreach templates and positioning strategies used by 7-figure freelancers'
			},
			course: {
				audience: 'aspiring developers',
				product: 'Full-Stack Bootcamp',
				benefit: 'become job-ready in 12 weeks',
				painPoint: 'learning to code but not building real projects',
				transformation: 'get hired as a developer',
				uniqueValue: 'hands-on projects, code reviews, and career coaching from senior engineers'
			},
			saas: {
				audience: 'small business owners',
				product: 'InvoiceFlow',
				benefit: 'get paid faster',
				painPoint: 'chasing late payments and managing invoices manually',
				transformation: 'automate invoicing and reduce payment delays by 50%',
				uniqueValue: 'automated reminders, one-click payments, and real-time tracking'
			}
		};

		const example = examples[type];
		setAudience(example.audience);
		setProduct(example.product);
		setBenefit(example.benefit);
		setPainPoint(example.painPoint);
		setTransformation(example.transformation);
		setUniqueValue(example.uniqueValue);
	};

	return (
		<div className="container max-w-6xl mx-auto p-6 space-y-6">
			{/* Header */}
			<div className="text-center space-y-2">
				<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 mb-4">
					<Sparkles className="h-8 w-8 text-white" />
				</div>
				<h1 className="text-3xl font-bold">AI Copywriting Assistant</h1>
				<p className="text-muted-foreground max-w-2xl mx-auto">
					Generate compelling headlines, CTAs, and body copy using proven conversion frameworks.
					Perfect for landing pages, sales funnels, and email campaigns.
				</p>
			</div>

			{/* Quick Examples */}
			<Card>
				<CardHeader>
					<CardTitle className="text-sm">Quick Start Examples</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex gap-2">
						<Button variant="outline" size="sm" onClick={() => loadExample('freelance')}>
							<Target className="h-4 w-4 mr-2" />
							Freelance Course
						</Button>
						<Button variant="outline" size="sm" onClick={() => loadExample('course')}>
							<Lightbulb className="h-4 w-4 mr-2" />
							Coding Bootcamp
						</Button>
						<Button variant="outline" size="sm" onClick={() => loadExample('saas')}>
							<Zap className="h-4 w-4 mr-2" />
							SaaS Product
						</Button>
					</div>
				</CardContent>
			</Card>

			<div className="grid md:grid-cols-2 gap-6">
				{/* Left: Input Form */}
				<Card>
					<CardHeader>
						<CardTitle>Tell Me About Your Product</CardTitle>
						<CardDescription>
							Fill in these details to generate compelling copy
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Generation Mode */}
						<div className="space-y-2">
							<Label>What do you need?</Label>
							<Tabs value={mode} onValueChange={(v) => setMode(v as GenerationMode)}>
								<TabsList className="grid grid-cols-4">
									<TabsTrigger value="headline">Headlines</TabsTrigger>
									<TabsTrigger value="cta">CTAs</TabsTrigger>
									<TabsTrigger value="body">Body</TabsTrigger>
									<TabsTrigger value="complete">All</TabsTrigger>
								</TabsList>
							</Tabs>
						</div>

						<Separator />

						{/* Required Fields */}
						<div className="space-y-2">
							<Label htmlFor="audience">
								Target Audience <span className="text-destructive">*</span>
							</Label>
							<Input
								id="audience"
								placeholder="e.g., freelancers, small business owners, developers"
								value={audience}
								onChange={(e) => setAudience(e.target.value)}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="product">
								Product/Service Name <span className="text-destructive">*</span>
							</Label>
							<Input
								id="product"
								placeholder="e.g., Premium Course, SaaS Platform, Coaching Program"
								value={product}
								onChange={(e) => setProduct(e.target.value)}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="benefit">
								Main Benefit <span className="text-destructive">*</span>
							</Label>
							<Input
								id="benefit"
								placeholder="e.g., earn more money, save time, get clients"
								value={benefit}
								onChange={(e) => setBenefit(e.target.value)}
							/>
						</div>

						{/* Optional Fields (shown for body/complete) */}
						{(mode === 'body' || mode === 'complete') && (
							<>
								<Separator />
								<p className="text-sm text-muted-foreground">
									For body copy, we need more context:
								</p>

								<div className="space-y-2">
									<Label htmlFor="painPoint">Pain Point</Label>
									<Textarea
										id="painPoint"
										placeholder="What problem does your audience face?"
										value={painPoint}
										onChange={(e) => setPainPoint(e.target.value)}
										rows={2}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="transformation">Transformation</Label>
									<Input
										id="transformation"
										placeholder="What transformation do they want?"
										value={transformation}
										onChange={(e) => setTransformation(e.target.value)}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="uniqueValue">Unique Value</Label>
									<Textarea
										id="uniqueValue"
										placeholder="What makes your solution unique?"
										value={uniqueValue}
										onChange={(e) => setUniqueValue(e.target.value)}
										rows={2}
									/>
								</div>
							</>
						)}

						<Separator />

						{/* Style Options */}
						<div className="grid grid-cols-2 gap-4">
							{(mode === 'headline' || mode === 'complete') && (
								<div className="space-y-2">
									<Label>Tone</Label>
									<Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="professional">Professional</SelectItem>
											<SelectItem value="casual">Casual</SelectItem>
											<SelectItem value="urgent">Urgent</SelectItem>
											<SelectItem value="friendly">Friendly</SelectItem>
										</SelectContent>
									</Select>
								</div>
							)}

							{(mode === 'cta' || mode === 'complete') && (
								<>
									<div className="space-y-2">
										<Label>CTA Action</Label>
										<Select value={ctaAction} onValueChange={(v) => setCtaAction(v as CTAAction)}>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="signup">Sign Up</SelectItem>
												<SelectItem value="purchase">Purchase</SelectItem>
												<SelectItem value="download">Download</SelectItem>
												<SelectItem value="register">Register</SelectItem>
												<SelectItem value="learn_more">Learn More</SelectItem>
												<SelectItem value="get_started">Get Started</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<Label>Urgency</Label>
										<Select value={urgency} onValueChange={(v) => setUrgency(v as Urgency)}>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="high">High</SelectItem>
												<SelectItem value="medium">Medium</SelectItem>
												<SelectItem value="low">Low</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</>
							)}

							{(mode === 'body' || mode === 'complete') && (
								<div className="space-y-2 col-span-2">
									<Label>Copywriting Framework</Label>
									<Select value={framework} onValueChange={(v) => setFramework(v as keyof typeof FRAMEWORKS)}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="PAS">PAS (Pain, Agitate, Solve)</SelectItem>
											<SelectItem value="AIDA">AIDA (Attention, Interest, Desire, Action)</SelectItem>
											<SelectItem value="FAB">FAB (Features, Advantages, Benefits)</SelectItem>
											<SelectItem value="BAB">BAB (Before, After, Bridge)</SelectItem>
											<SelectItem value="FourPs">4 Ps (Picture, Promise, Prove, Push)</SelectItem>
										</SelectContent>
									</Select>
								</div>
							)}
						</div>

						<Button onClick={handleGenerate} className="w-full" size="lg">
							<Sparkles className="h-4 w-4 mr-2" />
							Generate Copy
						</Button>
					</CardContent>
				</Card>

				{/* Right: Generated Results */}
				<div className="space-y-4">
					{/* Headlines */}
					{headlines.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Target className="h-5 w-5" />
									Headlines ({headlines.length} variations)
								</CardTitle>
								<CardDescription>
									Click any headline to copy
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-2">
								{headlines.map((headline, index) => (
									<div
										key={index}
										className="flex items-start gap-2 p-3 rounded-lg border hover:bg-muted cursor-pointer transition-colors"
										onClick={() => copyToClipboard(headline, `headline-${index}`)}
									>
										<div className="flex-1">
											<p className="font-medium">{headline}</p>
										</div>
										{copied === `headline-${index}` ? (
											<Check className="h-4 w-4 text-green-500" />
										) : (
											<Copy className="h-4 w-4 text-muted-foreground" />
										)}
									</div>
								))}

								{/* Headline Analysis */}
								{analysis && (
									<Card className="mt-4 bg-muted/50">
										<CardHeader>
											<CardTitle className="text-sm flex items-center gap-2">
												<TrendingUp className="h-4 w-4" />
												Headline Score: {analysis.score}/100
											</CardTitle>
										</CardHeader>
										<CardContent className="space-y-3 text-sm">
											{analysis.strengths.length > 0 && (
												<div>
													<p className="font-medium text-green-600">Strengths:</p>
													<ul className="list-disc list-inside space-y-1 text-muted-foreground">
														{analysis.strengths.map((s: string, i: number) => (
															<li key={i}>{s}</li>
														))}
													</ul>
												</div>
											)}
											{analysis.improvements.length > 0 && (
												<div>
													<p className="font-medium text-orange-600">Improvements:</p>
													<ul className="list-disc list-inside space-y-1 text-muted-foreground">
														{analysis.improvements.map((s: string, i: number) => (
															<li key={i}>{s}</li>
														))}
													</ul>
												</div>
											)}
											{analysis.emotionalTriggers.length > 0 && (
												<div>
													<p className="font-medium">Emotional Triggers:</p>
													<div className="flex gap-2 mt-2">
														{analysis.emotionalTriggers.map((trigger: string) => (
															<Badge key={trigger} variant="secondary">{trigger}</Badge>
														))}
													</div>
												</div>
											)}
										</CardContent>
									</Card>
								)}
							</CardContent>
						</Card>
					)}

					{/* CTAs */}
					{ctas.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Zap className="h-5 w-5" />
									Call-to-Action Buttons
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2">
								{ctas.map((cta, index) => (
									<div
										key={index}
										className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted cursor-pointer transition-colors"
										onClick={() => copyToClipboard(cta, `cta-${index}`)}
									>
										<Button variant="default" size="sm" className="pointer-events-none">
											{cta}
										</Button>
										<div className="flex-1" />
										{copied === `cta-${index}` ? (
											<Check className="h-4 w-4 text-green-500" />
										) : (
											<Copy className="h-4 w-4 text-muted-foreground" />
										)}
									</div>
								))}
							</CardContent>
						</Card>
					)}

					{/* Body Copy */}
					{bodyCopy && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Lightbulb className="h-5 w-5" />
									Body Copy ({framework} Framework)
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div
									className="p-4 rounded-lg bg-muted/50 whitespace-pre-wrap cursor-pointer hover:bg-muted transition-colors"
									onClick={() => copyToClipboard(bodyCopy.fullCopy, 'body-full')}
								>
									<div className="flex justify-between items-start mb-2">
										<p className="text-xs text-muted-foreground">Full Copy</p>
										{copied === 'body-full' ? (
											<Check className="h-4 w-4 text-green-500" />
										) : (
											<Copy className="h-4 w-4 text-muted-foreground" />
										)}
									</div>
									<p className="text-sm">{bodyCopy.fullCopy}</p>
								</div>

								<Separator />

								<div className="space-y-2">
									<p className="text-sm font-medium">Framework Sections:</p>
									{Object.entries(bodyCopy.sections).map(([key, value]) => (
										<div
											key={key}
											className="p-3 rounded-lg border hover:bg-muted cursor-pointer transition-colors"
											onClick={() => copyToClipboard(value, `section-${key}`)}
										>
											<div className="flex justify-between items-start mb-1">
												<p className="text-xs font-medium text-muted-foreground uppercase">{key}</p>
												{copied === `section-${key}` ? (
													<Check className="h-3 w-3 text-green-500" />
												) : (
													<Copy className="h-3 w-3 text-muted-foreground" />
												)}
											</div>
											<p className="text-sm">{value}</p>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}

					{/* Empty State */}
					{headlines.length === 0 && ctas.length === 0 && !bodyCopy && (
						<Card className="border-dashed">
							<CardContent className="flex flex-col items-center justify-center py-12 text-center">
								<Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
								<p className="text-lg font-medium">Ready to Generate Copy</p>
								<p className="text-sm text-muted-foreground max-w-sm mt-2">
									Fill in the form and click "Generate Copy" to create compelling headlines,
									CTAs, and body copy for your funnel.
								</p>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}
