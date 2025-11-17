/**
 * EntityTable Component
 *
 * Display entities in a paginated table with sortable columns and filters.
 * Uses Effect services for mutations (delete, update status).
 */

import { Effect } from "effect";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getOrCreateDataProviderLayer } from "@/lib/effect-client";
import { ThingService } from "@/services/ThingService";

interface Thing {
  _id: string;
  type: string;
  name: string;
  status: "draft" | "active" | "published" | "archived";
  properties: any;
  createdAt: number;
  updatedAt: number;
}

interface EntityTableProps {
  entities: Thing[];
  page: number;
  totalPages: number;
  total: number;
}

export function EntityTable({ entities, page, totalPages, total }: EntityTableProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [localEntities, setLocalEntities] = useState(entities);

  const handleStatusChange = async (id: string, newStatus: Thing["status"]) => {
    setLoading(id);
    setError(null);

    const program = Effect.gen(function* () {
      yield* ThingService.changeStatus(id, newStatus);
      return true;
    });

    try {
      await Effect.runPromise(
        program.pipe(
          Effect.provide(getOrCreateDataProviderLayer()),
          Effect.catchAll((err) => {
            console.error("Status change failed:", err);
            return Effect.fail(err);
          })
        )
      );

      // Optimistic update
      setLocalEntities((prev) =>
        prev.map((entity) => (entity._id === id ? { ...entity, status: newStatus } : entity))
      );
    } catch (err) {
      setError("Failed to update status");
      console.error("Status change failed:", err);
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entity?")) {
      return;
    }

    setLoading(id);
    setError(null);

    const program = Effect.gen(function* () {
      yield* ThingService.delete(id);
      return true;
    });

    try {
      await Effect.runPromise(
        program.pipe(
          Effect.provide(getOrCreateDataProviderLayer()),
          Effect.catchAll((err) => {
            console.error("Delete failed:", err);
            return Effect.fail(err);
          })
        )
      );

      // Remove from local state
      setLocalEntities((prev) => prev.filter((entity) => entity._id !== id));
    } catch (err) {
      setError("Failed to delete entity");
      console.error("Delete failed:", err);
    } finally {
      setLoading(null);
    }
  };

  const _getStatusBadgeVariant = (status: Thing["status"]) => {
    switch (status) {
      case "published":
        return "default";
      case "active":
        return "secondary";
      case "draft":
        return "outline";
      case "archived":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {localEntities.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-gray-500">
                No entities found
              </TableCell>
            </TableRow>
          ) : (
            localEntities.map((entity) => (
              <TableRow key={entity._id}>
                <TableCell className="font-medium">
                  <a
                    href={`/dashboard/things/${entity._id}`}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {entity.name}
                  </a>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{entity.type}</Badge>
                </TableCell>
                <TableCell>
                  <select
                    value={entity.status}
                    onChange={(e) =>
                      handleStatusChange(entity._id, e.target.value as Thing["status"])
                    }
                    disabled={loading === entity._id}
                    className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </TableCell>
                <TableCell>{formatDate(entity.createdAt)}</TableCell>
                <TableCell>{formatDate(entity.updatedAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/dashboard/things/${entity._id}`}>View</a>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(entity._id)}
                      disabled={loading === entity._id}
                    >
                      {loading === entity._id ? "..." : "Delete"}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
