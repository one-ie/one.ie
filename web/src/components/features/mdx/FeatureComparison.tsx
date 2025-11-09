import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

interface ComparisonRow {
  feature: string;
  one: boolean | string;
  competitor?: boolean | string;
}

interface FeatureComparisonProps {
  title?: string;
  description?: string;
  rows: ComparisonRow[];
  competitorName?: string;
}

/**
 * Feature Comparison Table Component
 *
 * Side-by-side comparison with competitors.
 * Shows ONE's advantages clearly.
 *
 * Usage in MDX:
 * <FeatureComparison
 *   title="ONE vs Competitors"
 *   competitorName="Other Auth Providers"
 *   rows={[
 *     { feature: "Magic Links", one: true, competitor: false },
 *     { feature: "2FA Methods", one: "SMS + TOTP + Backup", competitor: "SMS only" },
 *     { feature: "OAuth Providers", one: "6+ providers", competitor: "2 providers" }
 *   ]}
 * />
 */
export function FeatureComparison({
  title = "Feature Comparison",
  description,
  rows,
  competitorName = "Competitors"
}: FeatureComparisonProps) {
  const renderCell = (value: boolean | string) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="h-5 w-5 text-green-600 mx-auto" />
      ) : (
        <X className="h-5 w-5 text-red-600 mx-auto" />
      );
    }
    return <span className="text-sm">{value}</span>;
  };

  return (
    <Card className="my-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <Badge variant="outline">Comparison</Badge>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground mt-2">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold">Feature</th>
                <th className="text-center py-3 px-4 font-semibold">
                  <Badge className="bg-primary">ONE Platform</Badge>
                </th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                  {competitorName}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="py-3 px-4 font-medium">{row.feature}</td>
                  <td className="py-3 px-4 text-center">{renderCell(row.one)}</td>
                  <td className="py-3 px-4 text-center text-muted-foreground">
                    {row.competitor !== undefined ? renderCell(row.competitor) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
