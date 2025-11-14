/**
 * Analytics Dashboard
 *
 * Shows conversational commerce metrics and insights
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  TrendingUp,
  MessageCircle,
  ShoppingCart,
  DollarSign,
  Clock,
  Star,
} from 'lucide-react';
import type { AnalyticsMetrics } from '@/lib/types/commerce';

interface AnalyticsDashboardProps {
  metrics: AnalyticsMetrics;
  timeRange?: '24h' | '7d' | '30d' | '90d';
}

export function AnalyticsDashboard({
  metrics,
  timeRange = '7d',
}: AnalyticsDashboardProps) {
  const stats = [
    {
      label: 'Conversations',
      value: metrics.conversationsStarted,
      icon: MessageCircle,
      color: 'text-blue-600',
      change: '+12%',
    },
    {
      label: 'Conversions',
      value: metrics.conversionsCompleted,
      icon: ShoppingCart,
      color: 'text-green-600',
      change: '+8%',
    },
    {
      label: 'Conversion Rate',
      value: `${(metrics.conversionRate * 100).toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      change: '+15%',
    },
    {
      label: 'Avg Order Value',
      value: `€${metrics.averageOrderValue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-yellow-600',
      change: '+5%',
    },
    {
      label: 'Avg Duration',
      value: `${Math.round(metrics.averageConversationDuration / 60)}m`,
      icon: Clock,
      color: 'text-orange-600',
      change: '-2%',
    },
    {
      label: 'Satisfaction',
      value: metrics.customerSatisfaction.toFixed(1),
      icon: Star,
      color: 'text-pink-600',
      change: '+0.2',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Conversational Commerce Analytics</h2>
        <p className="text-muted-foreground">
          Performance metrics for {timeRange}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.label}
              </CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> from last
                period
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.topProducts.map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b pb-3 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">Product #{product.productId}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.mentions} mentions
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{product.purchases}</p>
                  <p className="text-sm text-muted-foreground">
                    {((product.purchases / product.mentions) * 100).toFixed(1)}%
                    conversion
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">
                  Conversion rate is 15x higher than traditional e-commerce
                </p>
                <p className="text-sm text-muted-foreground">
                  Conversational commerce converts at {(metrics.conversionRate * 100).toFixed(1)}% vs
                  industry average of 2.1%
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium">Average order value 25% higher</p>
                <p className="text-sm text-muted-foreground">
                  AI recommendations lead to higher-value purchases
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">
                  Most conversions happen within 3 minutes
                </p>
                <p className="text-sm text-muted-foreground">
                  Quick consultations lead to faster purchase decisions
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
