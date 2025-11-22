/**
 * GroupSettings Component
 *
 * Settings panel for group configuration
 * Part of GROUPS dimension (ontology-ui)
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Group } from "../types";
import { cn } from "../utils";

export interface GroupSettingsProps {
  group: Group;
  onSave?: (settings: Partial<Group>) => void;
  onDelete?: () => void;
  className?: string;
}

export function GroupSettings({
  group,
  onSave,
  onDelete,
  className,
}: GroupSettingsProps) {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || "");
  const [isPublic, setIsPublic] = useState(group.settings?.isPublic || false);
  const [allowJoinRequests, setAllowJoinRequests] = useState(
    group.settings?.allowJoinRequests || false
  );

  const handleSave = () => {
    onSave?.({
      name,
      description,
      settings: {
        ...group.settings,
        isPublic,
        allowJoinRequests,
      },
    });
  };

  const isDirty =
    name !== group.name ||
    description !== (group.description || "") ||
    isPublic !== (group.settings?.isPublic || false) ||
    allowJoinRequests !== (group.settings?.allowJoinRequests || false);

  return (
    <Card className={cn("bg-background p-1 shadow-sm rounded-md", className)}>
      <div className="bg-foreground rounded-md text-font">
        <CardHeader className="p-6 pb-0">
          <CardTitle className="flex items-center gap-2 text-font">
            <span>⚙️</span>
            Group Settings
          </CardTitle>
        </CardHeader>

        <Tabs defaultValue="general">
          <TabsList className="mx-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="danger">Danger Zone</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <CardContent className="space-y-4 px-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-font">Group Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-foreground text-font border-font/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-font">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="bg-foreground text-font border-font/20"
                />
              </div>
            </CardContent>
          </TabsContent>

          <TabsContent value="privacy">
            <CardContent className="space-y-4 px-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-font">Public Group</Label>
                  <p className="text-sm text-font/60">
                    Allow anyone to view this group
                  </p>
                </div>
                <Switch checked={isPublic} onCheckedChange={setIsPublic} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-font">Allow Join Requests</Label>
                  <p className="text-sm text-font/60">
                    Users can request to join this group
                  </p>
                </div>
                <Switch
                  checked={allowJoinRequests}
                  onCheckedChange={setAllowJoinRequests}
                />
              </div>
            </CardContent>
          </TabsContent>

          <TabsContent value="danger">
            <CardContent className="space-y-4 px-6">
              <div className="border border-destructive/50 rounded-lg p-4 bg-destructive/5">
                <h3 className="font-semibold text-destructive mb-2">Delete Group</h3>
                <p className="text-sm text-font/60 mb-4">
                  Once you delete a group, there is no going back. Please be certain.
                </p>
                <Button variant="destructive" onClick={onDelete}>
                  Delete Group
                </Button>
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>

        <CardFooter className="flex justify-end gap-2 border-t border-font/10 p-6">
          <Button variant="ghost" disabled={!isDirty}>
            Reset
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={!isDirty}>
            Save Changes
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}
