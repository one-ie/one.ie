import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Holder } from "./types";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface HolderDistributionProps {
	holders: Holder[];
	isLoading?: boolean;
}

const COLORS = [
	"#3b82f6",
	"#8b5cf6",
	"#ec4899",
	"#f59e0b",
	"#10b981",
	"#06b6d4",
	"#6366f1",
	"#f97316",
	"#14b8a6",
	"#a855f7",
];

export function HolderDistribution({
	holders,
	isLoading = false,
}: HolderDistributionProps) {
	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Holder Distribution</CardTitle>
				</CardHeader>
				<CardContent>
					<Skeleton className="h-[300px] w-full" />
				</CardContent>
			</Card>
		);
	}

	if (!holders || holders.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Holder Distribution</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex h-[300px] items-center justify-center text-muted-foreground">
						No holder data available
					</div>
				</CardContent>
			</Card>
		);
	}

	// Top 10 holders + "Others"
	const top10 = holders.slice(0, 10);
	const top10Percentage = top10.reduce((sum, h) => sum + h.percentage, 0);

	const chartData = [
		...top10.map((holder, index) => ({
			name: `Holder ${index + 1}`,
			value: holder.percentage,
			address: holder.walletAddress,
		})),
	];

	// Add "Others" if there are more holders
	if (holders.length > 10 && top10Percentage < 100) {
		chartData.push({
			name: "Others",
			value: 100 - top10Percentage,
			address: "other",
		});
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<span>Holder Distribution</span>
					<span className="text-sm font-medium text-muted-foreground">
						Top 10: {top10Percentage.toFixed(2)}%
					</span>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col gap-4">
					<ResponsiveContainer width="100%" height={250}>
						<PieChart>
							<Pie
								data={chartData}
								cx="50%"
								cy="50%"
								labelLine={false}
								label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
								outerRadius={80}
								fill="#8884d8"
								dataKey="value"
							>
								{chartData.map((entry, index) => (
									<Cell
										key={`cell-${entry.name}`}
										fill={COLORS[index % COLORS.length]}
									/>
								))}
							</Pie>
							<Tooltip
								contentStyle={{
									backgroundColor: "hsl(var(--card))",
									border: "1px solid hsl(var(--border))",
									borderRadius: "8px",
								}}
								formatter={(value: number) => [`${value.toFixed(2)}%`, "Share"]}
							/>
						</PieChart>
					</ResponsiveContainer>

					<div className="space-y-2">
						<div className="flex items-center justify-between text-sm">
							<span className="text-muted-foreground">Wallet Concentration</span>
							<span
								className={`font-medium ${
									top10Percentage > 70
										? "text-red-600"
										: top10Percentage > 40
											? "text-yellow-600"
											: "text-green-600"
								}`}
							>
								{top10Percentage > 70
									? "High Risk"
									: top10Percentage > 40
										? "Medium Risk"
										: "Low Risk"}
							</span>
						</div>
						<div className="text-xs text-muted-foreground">
							Top 10 holders control {top10Percentage.toFixed(2)}% of total
							supply
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
