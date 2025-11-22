import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { PriceDataPoint } from "./types";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

interface PriceChartProps {
	data: PriceDataPoint[];
	isLoading?: boolean;
}

export function PriceChart({ data, isLoading = false }: PriceChartProps) {
	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Price History</CardTitle>
				</CardHeader>
				<CardContent>
					<Skeleton className="h-[300px] w-full" />
				</CardContent>
			</Card>
		);
	}

	if (!data || data.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Price History</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex h-[300px] items-center justify-center text-muted-foreground">
						No price data available
					</div>
				</CardContent>
			</Card>
		);
	}

	const priceChange =
		data.length > 1
			? ((data[data.length - 1].price - data[0].price) / data[0].price) * 100
			: 0;
	const isPositive = priceChange >= 0;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<span>Price History</span>
					<span
						className={`text-sm font-medium ${
							isPositive ? "text-green-600" : "text-red-600"
						}`}
					>
						{isPositive ? "+" : ""}
						{priceChange.toFixed(2)}%
					</span>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<ResponsiveContainer width="100%" height={300}>
					<AreaChart
						data={data}
						margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
					>
						<defs>
							<linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
								<stop
									offset="5%"
									stopColor={isPositive ? "#22c55e" : "#ef4444"}
									stopOpacity={0.3}
								/>
								<stop
									offset="95%"
									stopColor={isPositive ? "#22c55e" : "#ef4444"}
									stopOpacity={0}
								/>
							</linearGradient>
						</defs>
						<CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
						<XAxis
							dataKey="date"
							className="text-xs"
							tick={{ fill: "hsl(var(--muted-foreground))" }}
						/>
						<YAxis
							className="text-xs"
							tick={{ fill: "hsl(var(--muted-foreground))" }}
							tickFormatter={(value) => `$${value.toFixed(4)}`}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: "hsl(var(--card))",
								border: "1px solid hsl(var(--border))",
								borderRadius: "8px",
							}}
							formatter={(value: number) => [`$${value.toFixed(6)}`, "Price"]}
						/>
						<Area
							type="monotone"
							dataKey="price"
							stroke={isPositive ? "#22c55e" : "#ef4444"}
							strokeWidth={2}
							fill="url(#colorPrice)"
						/>
					</AreaChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
}
