/**
 * FunnelBuilderTools - AI tool definitions for conversational funnel building
 *
 * Integrates with ChatClientV2 to enable conversational funnel creation.
 * Uses Convex mutations for backend operations and GenerativeUI for responses.
 *
 * @see /web/src/components/ai/ChatClientV2.tsx - Chat client integration
 * @see /backend/convex/mutations/funnels.ts - Backend mutations
 */

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  FunnelCreatedResponse,
  FunnelListResponse,
  FunnelDetailsResponse,
  FunnelPublishedResponse,
  FunnelErrorResponse,
} from "./FunnelResponses";

// ============================================================================
// System Prompt
// ============================================================================

export const FUNNEL_BUILDER_SYSTEM_PROMPT = `You are a funnel builder assistant. Help users create high-converting sales funnels through conversation.

You can:
1. Create funnels from templates or from scratch
2. Add/edit/remove steps and elements
3. Configure properties and settings
4. Show previews and analytics
5. Publish funnels when ready

Always show visual previews using the provided UI components. Be conversational and guide users through the funnel building process step by step.

Available templates:
- lead-gen: Lead generation funnel (landing page → form → thank you)
- product-launch: Product launch funnel (sales page → checkout → upsell)
- webinar: Webinar registration funnel (registration → confirmation → reminder)
- ecommerce: E-commerce funnel (product page → cart → checkout → confirmation)

When creating funnels, ask clarifying questions about:
- Target audience
- Goals (conversions, sales, leads)
- Branding preferences
- Integration needs (payment, email, analytics)`;

// ============================================================================
// Tool Definitions
// ============================================================================

export interface FunnelTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  execute: (args: any) => Promise<React.ReactNode>;
}

/**
 * Create funnel tool definition
 *
 * Creates a new funnel with optional template
 */
export function createFunnelTool(
  createMutation: ReturnType<typeof useMutation<typeof api.mutations.funnels.create>>
): FunnelTool {
  return {
    name: 'create_funnel',
    description: 'Create a new sales funnel with a name and optional description',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'The name of the funnel (e.g., "Summer Product Launch")',
        },
        description: {
          type: 'string',
          description: 'Optional description of the funnel purpose',
        },
        template: {
          type: 'string',
          enum: ['lead-gen', 'product-launch', 'webinar', 'ecommerce'],
          description: 'Optional template to start from',
        },
      },
      required: ['name'],
    },
    execute: async (args: { name: string; description?: string; template?: string }) => {
      try {
        const funnelId = await createMutation({
          name: args.name,
          description: args.description,
        });

        return (
          <FunnelCreatedResponse
            funnelId={funnelId}
            name={args.name}
            description={args.description}
            template={args.template}
          />
        );
      } catch (error) {
        return (
          <FunnelErrorResponse
            operation="create"
            error={error instanceof Error ? error.message : 'Unknown error'}
          />
        );
      }
    },
  };
}

/**
 * List funnels tool definition
 *
 * Lists all funnels for the current organization
 */
export function listFunnelsTool(
  listQuery: any // Query result from useQuery
): FunnelTool {
  return {
    name: 'list_funnels',
    description: 'List all funnels in the organization, optionally filtered by status',
    parameters: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['draft', 'active', 'published', 'archived'],
          description: 'Filter funnels by status',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of funnels to return (default: 10)',
        },
      },
    },
    execute: async (args: { status?: string; limit?: number }) => {
      const funnels = listQuery || [];
      const filtered = args.status
        ? funnels.filter((f: any) => f.status === args.status)
        : funnels;
      const limited = filtered.slice(0, args.limit || 10);

      return <FunnelListResponse funnels={limited} status={args.status} />;
    },
  };
}

/**
 * Get funnel details tool definition
 *
 * Gets detailed information about a specific funnel
 */
export function getFunnelTool(
  getQuery: (id: Id<"things">) => any
): FunnelTool {
  return {
    name: 'get_funnel',
    description: 'Get detailed information about a specific funnel by ID',
    parameters: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The funnel ID',
        },
      },
      required: ['id'],
    },
    execute: async (args: { id: string }) => {
      try {
        const funnel = await getQuery(args.id as Id<"things">);

        if (!funnel) {
          return (
            <FunnelErrorResponse
              operation="get"
              error="Funnel not found"
            />
          );
        }

        return <FunnelDetailsResponse funnel={funnel} />;
      } catch (error) {
        return (
          <FunnelErrorResponse
            operation="get"
            error={error instanceof Error ? error.message : 'Unknown error'}
          />
        );
      }
    },
  };
}

/**
 * Update funnel tool definition
 *
 * Updates funnel properties
 */
export function updateFunnelTool(
  updateMutation: ReturnType<typeof useMutation<typeof api.mutations.funnels.update>>
): FunnelTool {
  return {
    name: 'update_funnel',
    description: 'Update funnel name, description, or settings',
    parameters: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The funnel ID',
        },
        name: {
          type: 'string',
          description: 'New funnel name',
        },
        description: {
          type: 'string',
          description: 'New funnel description',
        },
        settings: {
          type: 'object',
          description: 'Funnel settings (SEO, tracking, branding)',
        },
      },
      required: ['id'],
    },
    execute: async (args: {
      id: string;
      name?: string;
      description?: string;
      settings?: any;
    }) => {
      try {
        await updateMutation({
          id: args.id as Id<"things">,
          name: args.name,
          description: args.description,
          settings: args.settings,
        });

        return (
          <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span className="font-medium">Funnel updated successfully</span>
            </div>
            {args.name && (
              <p className="text-sm text-muted-foreground mt-2">
                Updated name to: {args.name}
              </p>
            )}
          </div>
        );
      } catch (error) {
        return (
          <FunnelErrorResponse
            operation="update"
            error={error instanceof Error ? error.message : 'Unknown error'}
          />
        );
      }
    },
  };
}

/**
 * Publish funnel tool definition
 *
 * Publishes a funnel (makes it live)
 */
export function publishFunnelTool(
  publishMutation: ReturnType<typeof useMutation<typeof api.mutations.funnels.publish>>
): FunnelTool {
  return {
    name: 'publish_funnel',
    description: 'Publish a funnel to make it live (requires at least one step)',
    parameters: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The funnel ID to publish',
        },
      },
      required: ['id'],
    },
    execute: async (args: { id: string }) => {
      try {
        await publishMutation({ id: args.id as Id<"things"> });

        return (
          <FunnelPublishedResponse
            funnelId={args.id}
            action="published"
          />
        );
      } catch (error) {
        return (
          <FunnelErrorResponse
            operation="publish"
            error={error instanceof Error ? error.message : 'Unknown error'}
          />
        );
      }
    },
  };
}

/**
 * Unpublish funnel tool definition
 *
 * Unpublishes a funnel (takes it offline)
 */
export function unpublishFunnelTool(
  unpublishMutation: ReturnType<typeof useMutation<typeof api.mutations.funnels.unpublish>>
): FunnelTool {
  return {
    name: 'unpublish_funnel',
    description: 'Unpublish a funnel to take it offline',
    parameters: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The funnel ID to unpublish',
        },
      },
      required: ['id'],
    },
    execute: async (args: { id: string }) => {
      try {
        await unpublishMutation({ id: args.id as Id<"things"> });

        return (
          <FunnelPublishedResponse
            funnelId={args.id}
            action="unpublished"
          />
        );
      } catch (error) {
        return (
          <FunnelErrorResponse
            operation="unpublish"
            error={error instanceof Error ? error.message : 'Unknown error'}
          />
        );
      }
    },
  };
}

/**
 * Archive funnel tool definition
 *
 * Archives a funnel (soft delete)
 */
export function archiveFunnelTool(
  archiveMutation: ReturnType<typeof useMutation<typeof api.mutations.funnels.archive>>
): FunnelTool {
  return {
    name: 'archive_funnel',
    description: 'Archive a funnel (soft delete)',
    parameters: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The funnel ID to archive',
        },
      },
      required: ['id'],
    },
    execute: async (args: { id: string }) => {
      try {
        await archiveMutation({ id: args.id as Id<"things"> });

        return (
          <div className="rounded-lg bg-gray-50 dark:bg-gray-900/20 p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-400">📦</span>
              <span className="font-medium">Funnel archived</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              The funnel has been archived and is no longer active.
            </p>
          </div>
        );
      } catch (error) {
        return (
          <FunnelErrorResponse
            operation="archive"
            error={error instanceof Error ? error.message : 'Unknown error'}
          />
        );
      }
    },
  };
}

/**
 * Duplicate funnel tool definition
 *
 * Duplicates an existing funnel
 */
export function duplicateFunnelTool(
  duplicateMutation: ReturnType<typeof useMutation<typeof api.mutations.funnels.duplicate>>
): FunnelTool {
  return {
    name: 'duplicate_funnel',
    description: 'Create a copy of an existing funnel',
    parameters: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The funnel ID to duplicate',
        },
        name: {
          type: 'string',
          description: 'Name for the duplicated funnel (optional, defaults to "[Original Name] (Copy)")',
        },
      },
      required: ['id'],
    },
    execute: async (args: { id: string; name?: string }) => {
      try {
        const newFunnelId = await duplicateMutation({
          id: args.id as Id<"things">,
          name: args.name,
        });

        return (
          <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <span className="text-blue-600 dark:text-blue-400">📋</span>
              <span className="font-medium">Funnel duplicated successfully</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              New funnel ID: {newFunnelId}
            </p>
            {args.name && (
              <p className="text-sm text-muted-foreground">
                Name: {args.name}
              </p>
            )}
          </div>
        );
      } catch (error) {
        return (
          <FunnelErrorResponse
            operation="duplicate"
            error={error instanceof Error ? error.message : 'Unknown error'}
          />
        );
      }
    },
  };
}

// ============================================================================
// Hook for all funnel tools
// ============================================================================

/**
 * Hook to get all funnel builder tools
 *
 * Usage in ChatClientV2:
 * ```tsx
 * const funnelTools = useFunnelBuilderTools();
 * const allTools = [...funnelTools, ...otherTools];
 * ```
 */
export function useFunnelBuilderTools() {
  const createFunnel = useMutation(api.mutations.funnels.create);
  const updateFunnel = useMutation(api.mutations.funnels.update);
  const publishFunnel = useMutation(api.mutations.funnels.publish);
  const unpublishFunnel = useMutation(api.mutations.funnels.unpublish);
  const archiveFunnel = useMutation(api.mutations.funnels.archive);
  const duplicateFunnel = useMutation(api.mutations.funnels.duplicate);

  // For queries, we'll need to pass these in or use a different pattern
  // Since queries need to be called with useQuery at component level

  return {
    create_funnel: createFunnelTool(createFunnel),
    update_funnel: updateFunnelTool(updateFunnel),
    publish_funnel: publishFunnelTool(publishFunnel),
    unpublish_funnel: unpublishFunnelTool(unpublishFunnel),
    archive_funnel: archiveFunnelTool(archiveFunnel),
    duplicate_funnel: duplicateFunnelTool(duplicateFunnel),
  };
}
