/**
 * EntityForm Component
 *
 * Form for creating and editing entities.
 * Uses Effect services with validation and error handling.
 */

import React, { useState } from "react";
import { Effect } from "effect";
import { ThingService } from "@/services/ThingService";
import { getOrCreateDataProviderLayer } from "@/lib/effect-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Thing {
  _id: string;
  type: string;
  name: string;
  status: "draft" | "active" | "published" | "archived";
  properties: any;
}

interface EntityFormProps {
  entity?: Thing;
}

export function EntityForm({ entity }: EntityFormProps) {
  const [formData, setFormData] = useState({
    name: entity?.name || "",
    type: entity?.type || "",
    status: entity?.status || "draft",
    properties: JSON.stringify(entity?.properties || {}, null, 2),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Parse properties JSON
    let properties;
    try {
      properties = JSON.parse(formData.properties);
    } catch (err) {
      setError("Invalid JSON in properties field");
      setLoading(false);
      return;
    }

    const program = entity
      ? // Update existing entity
        Effect.gen(function* () {
          yield* ThingService.update(entity._id, {
            name: formData.name,
            status: formData.status as Thing["status"],
            properties,
          });
          return true;
        })
      : // Create new entity
        Effect.gen(function* () {
          const id = yield* ThingService.create({
            type: formData.type,
            name: formData.name,
            status: formData.status as Thing["status"],
            properties,
          });
          return id;
        });

    try {
      await Effect.runPromise(
        program.pipe(
          Effect.provide(getOrCreateDataProviderLayer()),
          Effect.catchTag("ThingCreateError", (err) => {
            console.error("Create failed:", err);
            return Effect.fail(err);
          }),
          Effect.catchAll((err) => {
            console.error("Operation failed:", err);
            return Effect.fail(err);
          })
        )
      );

      setSuccess(true);

      // Redirect after short delay
      if (!entity) {
        setTimeout(() => {
          window.location.href = "/dashboard/things";
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || "Operation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
          <p className="text-sm text-green-800 dark:text-green-200">
            {entity ? "Entity updated successfully!" : "Entity created successfully!"}
          </p>
        </div>
      )}

      <div>
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          disabled={loading}
          placeholder="Entity name"
        />
      </div>

      <div>
        <Label htmlFor="type">Type *</Label>
        <Input
          id="type"
          type="text"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          required
          disabled={loading || !!entity}
          placeholder="e.g., product, course, creator"
        />
        {entity && (
          <p className="mt-1 text-xs text-gray-500">
            Type cannot be changed after creation
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          disabled={loading}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
        >
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div>
        <Label htmlFor="properties">Properties (JSON)</Label>
        <Textarea
          id="properties"
          value={formData.properties}
          onChange={(e) =>
            setFormData({ ...formData, properties: e.target.value })
          }
          disabled={loading}
          rows={10}
          className="font-mono text-xs"
          placeholder='{"key": "value"}'
        />
        <p className="mt-1 text-xs text-gray-500">
          Enter valid JSON for entity-specific properties
        </p>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : entity ? "Update Entity" : "Create Entity"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
