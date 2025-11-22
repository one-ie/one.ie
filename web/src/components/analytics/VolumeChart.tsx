import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { VolumeDataPoint } from "./types";
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

interface VolumeChartProps {
	data: VolumeDataPoint[];
	isLoading?: boolean;
}

export function VolumeChart({ data, isLoading = false }: VolumeChartProps) {
	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Trading Volume</CardTitle>
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
					<CardTitle>Trading Volume</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex h-[300px] items-center justify-center text-muted-foreground">
						No volume data available
					</div>
				</CardContent>
			</Card>
		);
	}

	const totalVolume = data.reduce((sum, item) => sum + item.volume, 0);
	const averageVolume = totalVolume / data.length;

	const formatVolume = (value: number) => {
		if (value >= 1000000) {
			return `$${(value / 1000000).toFixed(2)}M`;
		}
		if (value >= 1000) {
			return `$${(value / 1000).toFixed(2)}K`;
		}
		return `$${value.toFixed(2)}`;
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<span>Trading Volume</span>
					<span className="text-sm font-medium text-muted-foreground">
						Avg: {formatVolume(averageVolume)}
					</span>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<ResponsiveContainer width="100%" height={300}>
					<BarChart
						data={data}
						margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
					>
						<CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
						<XAxis
							dataKey="date"
							className="text-xs"
							tick={{ fill: "hsl(var(--muted-foreground))" }}
						/>
						<YAxis
							className="text-xs"
							tick={{ fill: "hsl(var(--muted-foreground))" }}
							tickFormatter={formatVolume}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: "hsl(var(--card))",
								border: "1px solid hsl(var(--border))",
								borderRadius: "8px",
							}}
							formatter={(value: number) => [formatVolume(value), "Volume"]}
						/>
						<Bar dataKey="volume" fill="#3b82f6" radius={[4, 4, 0, 0]} />
					</BarChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
}
