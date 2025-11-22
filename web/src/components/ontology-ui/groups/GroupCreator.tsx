/**
 * GroupCreator Component
 *
 * Form for creating new groups
 * Part of GROUPS dimension (ontology-ui)
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { GroupSelector } from "./GroupSelector";
import type { Group, FormProps } from "../types";
import { cn } from "../utils";

export interface GroupCreatorProps extends FormProps {
  parentGroups?: Group[];
  allowNesting?: boolean;
}

export function GroupCreator({
  parentGroups = [],
  allowNesting = true,
  onSubmit,
  onCancel,
  className,
}: GroupCreatorProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentGroupId, setParentGroupId] = useState<string | undefined>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.({
      name,
      description,
      parentGroupId,
    });
  };

  const isValid = name.trim().length > 0;

  return (
    <Card className={cn("bg-background p-1 shadow-sm rounded-md", className)}>
      <div className="bg-foreground rounded-md p-6 text-font">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="flex items-center gap-2 text-font">
            <span>🏢</span>
            Create New Group
          </CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 p-0">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-font">Group Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter group name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-foreground text-font border-font/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-font">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe this group"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="bg-foreground text-font border-font/20"
              />
            </div>

            {allowNesting && parentGroups.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="parent" className="text-font">Parent Group (optional)</Label>
                <GroupSelector
                  groups={parentGroups}
                  value={parentGroupId}
                  onChange={setParentGroupId}
                  placeholder="Select parent group"
                />
                <p className="text-xs text-font/60">
                  Leave empty to create a root-level group
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-end gap-2 p-0 pt-6 border-t border-font/10">
            {onCancel && (
              <Button type="button" variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" variant="primary" disabled={!isValid}>
              Create Group
            </Button>
          </CardFooter>
        </form>
      </div>
    </Card>
  );
}
