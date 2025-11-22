/**
 * FunnelActionsExample - Example usage of FunnelActions component
 *
 * This file demonstrates how to integrate FunnelActions with:
 * 1. Convex mutations for real-time updates
 * 2. Router navigation
 * 3. Export functionality
 * 4. Error handling
 */

import { useState } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { FunnelActions } from "./FunnelActions";
import type { Thing } from "@/components/ontology-ui/types";
import type { Id } from "@/convex/_generated/dataModel";

// This would typically come from your Convex API
// import { api } from "@/convex/_generated/api";

interface FunnelActionsExampleProps {
  funnel: Thing;
}

export function FunnelActionsExample({ funnel }: FunnelActionsExampleProps) {
  const router = useRouter();

  // Convex mutations (uncomment when Convex is set up)
  // const updateFunnel = useMutation(api.mutations.funnels.update);
  // const deleteFunnel = useMutation(api.mutations.funnels.delete);
  // const duplicateFunnel = useMutation(api.mutations.funnels.duplicate);

  // Mock implementations for demonstration
  const handleEdit = async (funnel: Thing) => {
    // Navigate to edit page
    router.push(`/funnels/${funnel._id}/edit`);
  };

  const handleDuplicate = async (funnel: Thing) => {
    try {
      // Create duplicate with Convex
      // const newFunnel = await duplicateFunnel({
      //   funnelId: funnel._id as Id<"things">,
      //   name: `${funnel.name} (Copy)`,
      // });

      // Mock implementation
      console.log("Duplicating funnel:", funnel.name);

      // Navigate to new funnel
      // router.push(`/funnels/${newFunnel._id}`);
    } catch (error) {
      console.error("Failed to duplicate funnel:", error);
      throw error; // FunnelActions will show error toast
    }
  };

  const handlePublish = async (funnel: Thing) => {
    try {
      // Update funnel status with Convex
      // await updateFunnel({
      //   id: funnel._id as Id<"things">,
      //   status: "published",
      // });

      console.log("Publishing funnel:", funnel.name);
    } catch (error) {
      console.error("Failed to publish funnel:", error);
      throw error;
    }
  };

  const handleUnpublish = async (funnel: Thing) => {
    try {
      // await updateFunnel({
      //   id: funnel._id as Id<"things">,
      //   status: "draft",
      // });

      console.log("Unpublishing funnel:", funnel.name);
    } catch (error) {
      console.error("Failed to unpublish funnel:", error);
      throw error;
    }
  };

  const handleArchive = async (funnel: Thing) => {
    try {
      // await updateFunnel({
      //   id: funnel._id as Id<"things">,
      //   status: "archived",
      // });

      console.log("Archiving funnel:", funnel.name);
    } catch (error) {
      console.error("Failed to archive funnel:", error);
      throw error;
    }
  };

  const handleDelete = async (funnel: Thing) => {
    try {
      // await deleteFunnel({
      //   id: funnel._id as Id<"things">,
      // });

      console.log("Deleting funnel:", funnel.name);

      // Navigate back to funnels list
      router.push("/funnels");
    } catch (error) {
      console.error("Failed to delete funnel:", error);
      throw error;
    }
  };

  const handleExport = async (funnel: Thing) => {
    try {
      // Fetch funnel data with all steps
      // const funnelData = await getFunnelWithSteps(funnel._id);

      // Mock export data
      const exportData = {
        id: funnel._id,
        name: funnel.name,
        description: funnel.description,
        status: funnel.status,
        metadata: funnel.metadata,
        steps: [], // Would include all funnel steps
        createdAt: funnel.createdAt,
        updatedAt: funnel.updatedAt,
      };

      // Create downloadable JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${funnel.name.replace(/\s+/g, "-").toLowerCase()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log("Exported funnel:", funnel.name);
    } catch (error) {
      console.error("Failed to export funnel:", error);
      throw error;
    }
  };

  return (
    <FunnelActions
      funnel={funnel}
      onEdit={handleEdit}
      onDuplicate={handleDuplicate}
      onPublish={handlePublish}
      onUnpublish={handleUnpublish}
      onArchive={handleArchive}
      onDelete={handleDelete}
      onExport={handleExport}
      showShortcuts={true}
    />
  );
}

/**
 * Usage in a page component:
 *
 * ```tsx
 * import { FunnelActionsExample } from "@/components/funnel/FunnelActionsExample";
 *
 * export function FunnelDetailPage({ funnel }: { funnel: Thing }) {
 *   return (
 *     <div className="flex justify-between items-center">
 *       <h1>{funnel.name}</h1>
 *       <FunnelActionsExample funnel={funnel} />
 *     </div>
 *   );
 * }
 * ```
 *
 * Usage in Astro page:
 *
 * ```astro
 * ---
 * import { FunnelActionsExample } from '@/components/funnel/FunnelActionsExample';
 * const funnel = await getFunnel(Astro.params.id);
 * ---
 *
 * <Layout>
 *   <div class="flex justify-between items-center">
 *     <h1>{funnel.name}</h1>
 *     <FunnelActionsExample client:load funnel={funnel} />
 *   </div>
 * </Layout>
 * ```
 */
