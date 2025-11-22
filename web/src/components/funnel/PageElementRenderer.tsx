/**
 * Page Element Renderer
 *
 * Renders different funnel page elements based on their type.
 */

import type { PageElement } from "@/types/funnel-builder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Star, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

interface PageElementRendererProps {
	element: PageElement;
	isSelected?: boolean;
	onSelect?: () => void;
}

export function PageElementRenderer({
	element,
	isSelected = false,
	onSelect,
}: PageElementRendererProps) {
	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onSelect?.();
	};

	const baseClasses = `
		relative transition-all
		${isSelected ? "ring-2 ring-primary ring-offset-2" : ""}
		${onSelect ? "cursor-pointer hover:ring-1 hover:ring-muted-foreground" : ""}
	`;

	switch (element.type) {
		case "headline": {
			const Tag = element.level;
			const fontSize = {
				h1: "text-4xl md:text-6xl",
				h2: "text-3xl md:text-5xl",
				h3: "text-2xl md:text-4xl",
			}[element.level];

			return (
				<Tag
					className={`${baseClasses} ${fontSize} font-bold text-${element.align}`}
					style={{ color: element.color }}
					onClick={handleClick}
				>
					{element.text}
				</Tag>
			);
		}

		case "subheadline":
			return (
				<p
					className={`${baseClasses} text-xl md:text-2xl text-${element.align} text-muted-foreground`}
					style={{ color: element.color }}
					onClick={handleClick}
				>
					{element.text}
				</p>
			);

		case "text":
			return (
				<p
					className={`${baseClasses} text-${element.align} leading-relaxed`}
					style={{ color: element.color, fontSize: element.fontSize }}
					onClick={handleClick}
				>
					{element.content}
				</p>
			);

		case "image":
			return (
				<div className={baseClasses} onClick={handleClick}>
					<img
						src={element.src}
						alt={element.alt}
						className={`
							w-full h-auto
							${element.rounded ? "rounded-lg" : ""}
							${element.shadow ? "shadow-lg" : ""}
						`}
						style={{
							objectFit: element.objectFit,
							width: element.width,
							height: element.height,
						}}
					/>
				</div>
			);

		case "video":
			return (
				<div className={baseClasses} onClick={handleClick}>
					<video
						src={element.src}
						poster={element.thumbnail}
						controls={element.controls}
						autoPlay={element.autoplay}
						muted={element.muted}
						loop={element.loop}
						className="w-full h-auto rounded-lg"
					/>
				</div>
			);

		case "button": {
			const handleButtonClick = (e: React.MouseEvent) => {
				e.stopPropagation();
				if (element.action === "link" && element.link) {
					window.location.href = element.link;
				} else if (element.action === "scroll" && element.scrollTo) {
					document.getElementById(element.scrollTo)?.scrollIntoView({
						behavior: "smooth",
					});
				}
			};

			return (
				<div className={baseClasses} onClick={handleClick}>
					<Button
						variant={element.variant}
						size={element.size}
						className={element.fullWidth ? "w-full" : ""}
						onClick={handleButtonClick}
					>
						{element.text}
					</Button>
				</div>
			);
		}

		case "form":
			return (
				<Card className={baseClasses} onClick={handleClick}>
					<CardHeader>
						{element.title && <CardTitle>{element.title}</CardTitle>}
						{element.description && (
							<p className="text-sm text-muted-foreground">
								{element.description}
							</p>
						)}
					</CardHeader>
					<CardContent>
						<form className="space-y-4">
							{element.fields.map((field) => (
								<div key={field.id} className="space-y-2">
									<Label htmlFor={field.id}>
										{field.label}
										{field.required && (
											<span className="text-destructive ml-1">*</span>
										)}
									</Label>
									{field.type === "textarea" ? (
										<Textarea
											id={field.id}
											placeholder={field.placeholder}
											required={field.required}
										/>
									) : field.type === "select" ? (
										<select
											id={field.id}
											className="w-full px-3 py-2 border rounded-md"
											required={field.required}
										>
											<option value="">Select...</option>
											{field.options?.map((option) => (
												<option key={option} value={option}>
													{option}
												</option>
											))}
										</select>
									) : (
										<Input
											id={field.id}
											type={field.type}
											placeholder={field.placeholder}
											required={field.required}
										/>
									)}
								</div>
							))}
							<Button type="submit" className="w-full">
								{element.submitText}
							</Button>
						</form>
					</CardContent>
				</Card>
			);

		case "countdown":
			return (
				<CountdownTimer
					element={element}
					className={baseClasses}
					onClick={handleClick}
				/>
			);

		case "testimonial":
			return (
				<Card className={baseClasses} onClick={handleClick}>
					<CardContent className="pt-6">
						<blockquote className="text-lg italic mb-4">
							"{element.quote}"
						</blockquote>
						<div className="flex items-center gap-3">
							{element.avatar && (
								<img
									src={element.avatar}
									alt={element.author}
									className="w-12 h-12 rounded-full"
								/>
							)}
							<div>
								<p className="font-semibold">{element.author}</p>
								{element.role && (
									<p className="text-sm text-muted-foreground">{element.role}</p>
								)}
								{element.rating && (
									<div className="flex gap-1 mt-1">
										{Array.from({ length: 5 }).map((_, i) => (
											<Star
												key={i}
												className={`h-4 w-4 ${
													i < element.rating!
														? "fill-yellow-400 text-yellow-400"
														: "text-gray-300"
												}`}
											/>
										))}
									</div>
								)}
							</div>
						</div>
					</CardContent>
				</Card>
			);

		case "pricing-table":
			return (
				<div
					className={`${baseClasses} grid md:grid-cols-${Math.min(
						element.plans.length,
						3
					)} gap-6`}
					onClick={handleClick}
				>
					{element.plans.map((plan, i) => (
						<Card
							key={i}
							className={plan.highlighted ? "border-primary shadow-lg" : ""}
						>
							<CardHeader>
								<CardTitle>{plan.name}</CardTitle>
								<div className="text-3xl font-bold">
									{plan.price}
									{plan.period && (
										<span className="text-sm font-normal text-muted-foreground ml-1">
											/ {plan.period}
										</span>
									)}
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								<ul className="space-y-2">
									{plan.features.map((feature, j) => (
										<li key={j} className="flex items-center gap-2">
											<CheckCircle2 className="h-4 w-4 text-green-500" />
											<span className="text-sm">{feature}</span>
										</li>
									))}
								</ul>
								<Button
									variant={plan.highlighted ? "default" : "outline"}
									className="w-full"
									onClick={() => {
										window.location.href = plan.buttonLink;
									}}
								>
									{plan.buttonText}
								</Button>
							</CardContent>
						</Card>
					))}
				</div>
			);

		case "divider":
			return (
				<Separator
					className={baseClasses}
					style={{
						borderStyle: element.style,
						borderColor: element.color,
						width: element.width,
					}}
					onClick={handleClick}
				/>
			);

		case "spacer":
			return (
				<div
					className={baseClasses}
					style={{ height: element.height }}
					onClick={handleClick}
				/>
			);

		default:
			return (
				<div className={baseClasses} onClick={handleClick}>
					Unknown element type: {(element as any).type}
				</div>
			);
	}
}

/**
 * Countdown Timer Component
 */
function CountdownTimer({
	element,
	className,
	onClick,
}: {
	element: any;
	className?: string;
	onClick?: () => void;
}) {
	const [timeLeft, setTimeLeft] = useState<{
		days: number;
		hours: number;
		minutes: number;
		seconds: number;
	}>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

	useEffect(() => {
		const calculateTimeLeft = () => {
			const endTime = new Date(element.endDate).getTime();
			const now = new Date().getTime();
			const difference = endTime - now;

			if (difference > 0) {
				setTimeLeft({
					days: Math.floor(difference / (1000 * 60 * 60 * 24)),
					hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
					minutes: Math.floor((difference / 1000 / 60) % 60),
					seconds: Math.floor((difference / 1000) % 60),
				});
			}
		};

		calculateTimeLeft();
		const interval = setInterval(calculateTimeLeft, 1000);

		return () => clearInterval(interval);
	}, [element.endDate]);

	return (
		<Card className={className} onClick={onClick}>
			<CardContent className="pt-6 text-center">
				{element.title && (
					<h3 className="text-2xl font-bold mb-2">{element.title}</h3>
				)}
				{element.urgencyText && (
					<p className="text-destructive font-semibold mb-4">
						{element.urgencyText}
					</p>
				)}
				<div className="flex justify-center gap-4">
					{element.showDays && (
						<TimeUnit value={timeLeft.days} label="Days" />
					)}
					{element.showHours && (
						<TimeUnit value={timeLeft.hours} label="Hours" />
					)}
					{element.showMinutes && (
						<TimeUnit value={timeLeft.minutes} label="Minutes" />
					)}
					{element.showSeconds && (
						<TimeUnit value={timeLeft.seconds} label="Seconds" />
					)}
				</div>
			</CardContent>
		</Card>
	);
}

function TimeUnit({ value, label }: { value: number; label: string }) {
	return (
		<div className="flex flex-col items-center">
			<div className="text-4xl font-bold">{value.toString().padStart(2, "0")}</div>
			<div className="text-sm text-muted-foreground">{label}</div>
		</div>
	);
}
