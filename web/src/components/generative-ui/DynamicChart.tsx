import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { LineChart, BarChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export function DynamicChart({ data, layout }: any) {
  const chartData = data.labels?.map((label: string, i: number) => ({
    name: label,
    ...(data.datasets?.reduce((acc: any, dataset: any) => ({
      ...acc,
      [dataset.label]: dataset.data[i],
    }), {}) || {}),
  })) || [];

  const renderChart = () => {
    const ChartComponent = data.chartType === "line" ? LineChart : BarChart;
    const DataComponent = data.chartType === "line" ? Line : Bar;
    
    return (
      <ChartComponent data={chartData} width={600} height={300}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        {data.datasets?.map((dataset: any, i: number) => (
          <DataComponent key={i} dataKey={dataset.label} fill={dataset.color} stroke={dataset.color} />
        ))}
      </ChartComponent>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{data.title}</CardTitle>
        {data.description && <CardDescription>{data.description}</CardDescription>}
      </CardHeader>
      <CardContent>{renderChart()}</CardContent>
    </Card>
  );
}
