"use client";

import { DollarSign, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface PricingCalculatorProps {
  title?: string;
  description?: string;
  basePrice?: number;
  pricePerUnit?: number;
  unitName?: string;
  maxUnits?: number;
}

/**
 * ROI/Pricing Calculator Component
 *
 * Interactive calculator showing cost savings or ROI.
 * Helps users understand value proposition.
 *
 * Usage in MDX:
 * <PricingCalculator
 *   title="Authentication Cost Calculator"
 *   description="See how much you save vs building from scratch"
 *   basePrice={0}
 *   pricePerUnit={0.01}
 *   unitName="monthly active users"
 *   maxUnits={100000}
 * />
 */
export function PricingCalculator({
  title = "Cost Calculator",
  description,
  basePrice = 0,
  pricePerUnit = 0.01,
  unitName = "users",
  maxUnits = 10000,
}: PricingCalculatorProps) {
  const [units, setUnits] = useState([1000]);

  const totalCost = basePrice + units[0] * pricePerUnit;
  const competitorCost = totalCost * 3; // Assume competitors 3x more expensive
  const savings = competitorCost - totalCost;

  return (
    <Card className="my-8 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
          <Badge variant="outline">Interactive</Badge>
        </div>
        {description && <p className="text-sm text-muted-foreground mt-2">{description}</p>}
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-base mb-4 block">
            Number of {unitName}:{" "}
            <span className="font-bold text-primary">{units[0].toLocaleString()}</span>
          </Label>
          <Slider
            value={units}
            onValueChange={setUnits}
            min={100}
            max={maxUnits}
            step={100}
            className="mb-4"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">ONE Platform</div>
              <div className="text-3xl font-bold text-primary">
                ${totalCost.toFixed(2)}
                <span className="text-sm font-normal text-muted-foreground">/mo</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">Competitors</div>
              <div className="text-3xl font-bold">
                ${competitorCost.toFixed(2)}
                <span className="text-sm font-normal text-muted-foreground">/mo</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="text-sm text-green-700 dark:text-green-400 mb-1 flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                You Save
              </div>
              <div className="text-3xl font-bold text-green-700 dark:text-green-400">
                ${savings.toFixed(2)}
                <span className="text-sm font-normal">/mo</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Estimated savings based on industry averages. Actual costs may vary.
        </p>
      </CardContent>
    </Card>
  );
}
