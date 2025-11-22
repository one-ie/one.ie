import React from "react";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function DynamicChart({ data, layout }: any) {
	// Simple CSS-based chart (works instantly without Recharts context issues)
	const datasets = data.datasets || [];
	const labels = data.labels || [];

	// Find max value for scaling
	const allValues = datasets.flatMap((ds: any) => ds.data || []);
	const maxValue = Math.max(...allValues, 1);

	const renderSimpleChart = () => {
		if (data.chartType === "bar") {
			return (
				<div className="space-y-4">
					{labels.map((label: string, i: number) => (
						<div key={i}>
							<div className="text-sm font-medium mb-2">{label}</div>
							<div className="space-y-1">
								{datasets.map((dataset: any, dsIndex: number) => {
									const value = dataset.data[i] || 0;
									const percentage = (value / maxValue) * 100;

									return (
										<div key={dsIndex} className="flex items-center gap-2">
											<div className="w-20 text-xs text-muted-foreground">
												{dataset.label}
											</div>
											<div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
												<div
													className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
													style={{
														width: `${percentage}%`,
														backgroundColor: dataset.color || "#3b82f6",
													}}
												>
													<span className="text-xs font-medium text-white">
														{value.toLocaleString()}
													</span>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					))}
				</div>
			);
		}

		// Line chart (area visualization)
		return (
			<div className="space-y-6">
				{datasets.map((dataset: any, dsIndex: number) => (
					<div key={dsIndex}>
						<div className="flex items-center gap-2 mb-2">
							<div
								className="w-3 h-3 rounded-full"
								style={{ backgroundColor: dataset.color || "#3b82f6" }}
							/>
							<span className="text-sm font-medium">{dataset.label}</span>
						</div>
						<div className="h-32 flex items-end gap-1">
							{dataset.data.map((value: number, i: number) => {
								const height = (value / maxValue) * 100;
								return (
									<div
										key={i}
										className="flex-1 flex flex-col items-center gap-1"
									>
										<div className="text-xs font-medium text-muted-foreground">
											{value.toLocaleString()}
										</div>
										<div
											className="w-full rounded-t transition-all duration-500"
											style={{
												height: `${height}%`,
												backgroundColor: dataset.color || "#3b82f6",
												opacity: 0.8,
											}}
										/>
										<div className="text-xs text-muted-foreground mt-1">
											{labels[i]}
										</div>
									</div>
								);
							})}
						</div>
					</div>
				))}
			</div>
		);
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle>{data.title}</CardTitle>
					<Badge variant="outline" className="text-xs">
						{data.chartType === "line" ? "Line Chart" : "Bar Chart"}
					</Badge>
				</div>
				{data.description && (
					<CardDescription>{data.description}</CardDescription>
				)}
			</CardHeader>
			<CardContent>{renderSimpleChart()}</CardContent>
		</Card>
	);
}
