/**
 * ConversionFunnel Component
 *
 * Visualizes step-by-step conversion funnel with drop-off rates
 * and session journey tracking.
 *
 * Features:
 * - Funnel flow visualization
 * - Step-by-step conversion rates
 * - Drop-off analysis
 * - Attribution breakdown
 * - Session journey explorer
 *
 * Part of Cycle 72: Conversion Tracking System
 *
 * @see /backend/convex/services/analytics/conversion-tracking.ts
 * @see /backend/convex/queries/analytics.ts (getConversions, getFunnelFlow, getDropoffAnalysis)
 */

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

// ============================================================================
// Types
// ============================================================================

interface ConversionFunnelProps {
  funnelId: Id<"things">;
  startDate?: number;
  endDate?: number;
}

interface AttributionSourceData {
  source: string;
  visitors: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  averageValue: number;
}

interface FunnelFlowStepData {
  stepId: string;
  stepName: string;
  sequence: number;
  visitors: number;
  conversions: number;
  conversionRate: number;
  dropoffRate: number;
  averageTimeOnStep: number;
}

// ============================================================================
// Component
// ============================================================================

export function ConversionFunnel({
  funnelId,
  startDate,
  endDate,
}: ConversionFunnelProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "flow" | "dropoff" | "attribution">("overview");

  // Fetch conversion data
  const conversions = useQuery(api.queries.analytics.getConversions, {
    funnelId,
    startDate,
    endDate,
  });

  // Fetch funnel flow data
  const funnelFlow = useQuery(api.queries.analytics.getFunnelFlow, {
    funnelId,
    startDate,
    endDate,
  });

  // Fetch drop-off analysis
  const dropoffAnalysis = useQuery(api.queries.analytics.getDropoffAnalysis, {
    funnelId,
    startDate,
    endDate,
  });

  if (!conversions || !funnelFlow || !dropoffAnalysis) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-gray-500">Loading conversion data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {conversions.funnelName}
        </h2>
        <p className="text-sm text-gray-500 mt-1">Conversion Tracking & Analysis</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: "overview", label: "Overview" },
            { id: "flow", label: "Funnel Flow" },
            { id: "dropoff", label: "Drop-off Analysis" },
            { id: "attribution", label: "Attribution" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "overview" && (
          <OverviewTab conversions={conversions} funnelFlow={funnelFlow} />
        )}

        {activeTab === "flow" && <FunnelFlowTab funnelFlow={funnelFlow} />}

        {activeTab === "dropoff" && (
          <DropoffTab dropoffAnalysis={dropoffAnalysis} />
        )}

        {activeTab === "attribution" && (
          <AttributionTab attribution={conversions.attribution} />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Overview Tab
// ============================================================================

function OverviewTab({ conversions, funnelFlow }: any) {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard
          label="Total Visitors"
          value={conversions.totalVisitors.toLocaleString()}
          icon="👥"
        />
        <KPICard
          label="Total Conversions"
          value={conversions.totalConversions.toLocaleString()}
          icon="✅"
        />
        <KPICard
          label="Conversion Rate"
          value={`${(conversions.conversionRate * 100).toFixed(2)}%`}
          icon="📈"
        />
        <KPICard
          label="Total Revenue"
          value={`$${conversions.revenue.toLocaleString()}`}
          icon="💰"
        />
      </div>

      {/* Quick Metrics */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Metrics
        </h3>
        <div className="space-y-3">
          <MetricRow
            label="Average Time to Convert"
            value={formatDuration(funnelFlow.averageTimeToConvert)}
          />
          <MetricRow
            label="Total Steps"
            value={funnelFlow.steps.length.toString()}
          />
          <MetricRow
            label="Overall Completion Rate"
            value={`${(funnelFlow.overallConversionRate * 100).toFixed(2)}%`}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Funnel Flow Tab
// ============================================================================

function FunnelFlowTab({ funnelFlow }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Step-by-Step Flow
        </h3>

        <div className="space-y-4">
          {funnelFlow.steps.map((step: FunnelFlowStepData, index: number) => (
            <FunnelStepVisualization
              key={step.stepId}
              step={step}
              isFirst={index === 0}
              isLast={index === funnelFlow.steps.length - 1}
              previousVisitors={
                index > 0 ? funnelFlow.steps[index - 1].visitors : null
              }
            />
          ))}
        </div>
      </div>

      {/* Step Comparison Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Step Comparison
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Step
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visitors
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conv. Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Drop-off Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg. Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {funnelFlow.steps.map((step: FunnelFlowStepData) => (
                <tr key={step.stepId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {step.stepName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {step.visitors.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {step.conversions.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(step.conversionRate * 100).toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        step.dropoffRate > 0.5
                          ? "bg-red-100 text-red-800"
                          : step.dropoffRate > 0.3
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {(step.dropoffRate * 100).toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDuration(step.averageTimeOnStep)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Drop-off Tab
// ============================================================================

function DropoffTab({ dropoffAnalysis }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Drop-off Points
        </h3>

        <div className="space-y-6">
          {dropoffAnalysis.dropoffPoints.map((point: any) => (
            <div
              key={point.stepId}
              className="border-l-4 border-red-500 pl-4 pb-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{point.stepName}</h4>
                <span className="text-sm text-gray-500">
                  Step {point.sequence}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-sm text-gray-500">Drop-off Count</p>
                  <p className="text-2xl font-bold text-red-600">
                    {point.dropoffCount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Drop-off Rate</p>
                  <p className="text-2xl font-bold text-red-600">
                    {(point.dropoffRate * 100).toFixed(2)}%
                  </p>
                </div>
              </div>

              {point.topExitPages.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Top Exit Pages:
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {point.topExitPages.map((page: string, idx: number) => (
                      <li key={idx}>{page}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Attribution Tab
// ============================================================================

function AttributionTab({ attribution }: any) {
  if (!attribution) {
    return (
      <div className="text-gray-500 text-center py-12">
        No attribution data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* By Source */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">By Source</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visitors
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conv. Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg. Value
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attribution.sources
                .sort((a: AttributionSourceData, b: AttributionSourceData) => b.revenue - a.revenue)
                .map((source: AttributionSourceData) => (
                  <tr key={source.source}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                      {source.source}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {source.visitors.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {source.conversions.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(source.conversionRate * 100).toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${source.revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${source.averageValue.toFixed(2)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* By Campaign */}
      {attribution.campaigns.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            By Campaign
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visitors
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conv. Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attribution.campaigns
                  .sort((a: any, b: any) => b.revenue - a.revenue)
                  .map((campaign: any) => (
                    <tr key={campaign.campaign}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {campaign.campaign}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {campaign.visitors.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {campaign.conversions.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(campaign.conversionRate * 100).toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${campaign.revenue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Helper Components
// ============================================================================

function KPICard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

function FunnelStepVisualization({
  step,
  isFirst,
  isLast,
  previousVisitors,
}: {
  step: FunnelFlowStepData;
  isFirst: boolean;
  isLast: boolean;
  previousVisitors: number | null;
}) {
  const visitorPercentage = previousVisitors
    ? (step.visitors / previousVisitors) * 100
    : 100;

  return (
    <div>
      {!isFirst && (
        <div className="flex items-center justify-center py-2">
          <div className="text-sm text-gray-500">
            ⬇ {visitorPercentage.toFixed(1)}% continued
          </div>
        </div>
      )}

      <div className="relative">
        <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">
              Step {step.sequence}: {step.stepName}
            </h4>
            <span className="text-sm text-gray-500">
              {step.visitors.toLocaleString()} visitors
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Conversions</p>
              <p className="font-semibold text-gray-900">
                {step.conversions.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Conv. Rate</p>
              <p className="font-semibold text-gray-900">
                {(step.conversionRate * 100).toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-gray-500">Avg. Time</p>
              <p className="font-semibold text-gray-900">
                {formatDuration(step.averageTimeOnStep)}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 rounded-full h-2 transition-all"
                style={{ width: `${step.conversionRate * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Drop-off indicator */}
        {!isLast && step.dropoffRate > 0 && (
          <div className="absolute -right-4 top-1/2 transform -translate-y-1/2">
            <div className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
              {(step.dropoffRate * 100).toFixed(0)}% drop
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Utilities
// ============================================================================

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}
