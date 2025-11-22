/**
 * FunnelFlowExample - Example implementation of FunnelFlowGraph
 *
 * This component demonstrates how to use the FunnelFlowGraph with:
 * - Mock data (replace with Convex queries)
 * - Click handlers
 * - Reorder handlers
 * - Delete handlers
 */

import React, { useState } from "react";
import { FunnelFlowGraph } from "./FunnelFlowGraph";
import type { Thing } from "@/components/ontology-ui/types";
import type { Id } from "convex/_generated/dataModel";
import { toast } from "sonner";

interface FunnelStep extends Thing {
  order: number;
  conversionRate?: number;
  visitors?: number;
  conversions?: number;
}

interface FunnelFlowExampleProps {
  funnelId?: string;
}

export function FunnelFlowExample({ funnelId }: FunnelFlowExampleProps) {
  // Mock data - Replace with Convex useQuery
  const [steps, setSteps] = useState<FunnelStep[]>([
    {
      _id: "step1" as Id<"things">,
      _creationTime: Date.now(),
      type: "content",
      name: "Landing Page",
      description: "Homepage with main CTA",
      groupId: "g_default" as Id<"groups">,
      ownerId: "owner1" as Id<"things">,
      createdAt: Date.now(),
      order: 1,
      visitors: 10000,
      conversions: 5000,
      conversionRate: 50.0,
    },
    {
      _id: "step2" as Id<"things">,
      _creationTime: Date.now(),
      type: "content",
      name: "Product Page",
      description: "Product details and features",
      groupId: "g_default" as Id<"groups">,
      ownerId: "owner1" as Id<"things">,
      createdAt: Date.now(),
      order: 2,
      visitors: 5000,
      conversions: 2500,
      conversionRate: 50.0,
    },
    {
      _id: "step3" as Id<"things">,
      _creationTime: Date.now(),
      type: "content",
      name: "Checkout Page",
      description: "Shopping cart and payment",
      groupId: "g_default" as Id<"groups">,
      ownerId: "owner1" as Id<"things">,
      createdAt: Date.now(),
      order: 3,
      visitors: 2500,
      conversions: 1250,
      conversionRate: 50.0,
    },
    {
      _id: "step4" as Id<"things">,
      _creationTime: Date.now(),
      type: "content",
      name: "Thank You Page",
      description: "Order confirmation",
      groupId: "g_default" as Id<"groups">,
      ownerId: "owner1" as Id<"things">,
      createdAt: Date.now(),
      order: 4,
      visitors: 1250,
      conversions: 1250,
      conversionRate: 100.0,
    },
  ]);

  // Handlers

  const handleStepClick = (step: FunnelStep) => {
    console.log("Step clicked:", step);
    toast.info(`Clicked: ${step.name}`);
    // TODO: Open edit modal or navigate to step editor
  };

  const handleStepReorder = (fromIndex: number, toIndex: number) => {
    console.log("Reorder:", fromIndex, "→", toIndex);

    const newSteps = [...steps];
    const [movedStep] = newSteps.splice(fromIndex, 1);
    newSteps.splice(toIndex, 0, movedStep);

    // Update order property
    const reorderedSteps = newSteps.map((step, index) => ({
      ...step,
      order: index + 1,
    }));

    setSteps(reorderedSteps);
    toast.success("Step reordered");

    // TODO: Save new order to Convex
    // await convexMutation(api.mutations.funnels.reorderSteps, {
    //   funnelId,
    //   steps: reorderedSteps.map((s, i) => ({ id: s._id, order: i + 1 }))
    // });
  };

  const handleStepDelete = (stepId: string) => {
    console.log("Delete step:", stepId);

    const stepName = steps.find((s) => s._id === stepId)?.name;
    const confirmed = window.confirm(
      `Delete step "${stepName}"? This cannot be undone.`
    );

    if (confirmed) {
      setSteps((prev) => prev.filter((s) => s._id !== stepId));
      toast.success("Step deleted");

      // TODO: Delete from Convex
      // await convexMutation(api.mutations.funnels.deleteStep, { stepId });
    }
  };

  const handleAddStep = () => {
    console.log("Add step clicked");
    toast.info("Add step functionality coming soon");

    // TODO: Open add step modal
    // const newStep = {
    //   name: "New Step",
    //   order: steps.length + 1,
    //   ...
    // };
    // await convexMutation(api.mutations.funnels.createStep, newStep);
  };

  return (
    <div className="space-y-6">
      <FunnelFlowGraph
        steps={steps}
        onStepClick={handleStepClick}
        onStepReorder={handleStepReorder}
        onStepDelete={handleStepDelete}
        onAddStep={handleAddStep}
        showMetrics={true}
        editable={true}
      />

      {/* Developer notes */}
      <div className="p-4 border rounded-lg bg-muted/50">
        <h4 className="font-semibold mb-2 text-sm">Integration Notes:</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>
            • Replace mock data with Convex query:{" "}
            <code className="bg-background px-1 rounded">
              useQuery(api.queries.funnels.getSteps, &#123; funnelId &#125;)
            </code>
          </li>
          <li>
            • Implement step editor modal for click handler
          </li>
          <li>
            • Save reorder changes with:{" "}
            <code className="bg-background px-1 rounded">
              useMutation(api.mutations.funnels.reorderSteps)
            </code>
          </li>
          <li>
            • Implement delete confirmation with mutation
          </li>
          <li>• Add step creation modal with form</li>
        </ul>
      </div>
    </div>
  );
}
