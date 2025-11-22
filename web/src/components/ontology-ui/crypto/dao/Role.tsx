/**
 * Role Component
 *
 * Displays and manages DAO roles and permissions.
 * Uses 6-token design system.
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: "governance" | "treasury" | "members" | "settings";
}

export interface RoleData {
  id: string;
  name: string;
  description: string;
  color?: string;
  memberCount: number;
  permissions: string[];
  isDefault?: boolean;
}

interface RoleProps {
  role: RoleData;
  allPermissions: Permission[];
  onUpdatePermissions?: (roleId: string, permissions: string[]) => void;
  onDeleteRole?: (roleId: string) => void;
  isEditable?: boolean;
  className?: string;
}

export function Role({
  role,
  allPermissions,
  onUpdatePermissions,
  onDeleteRole,
  isEditable = true,
  className,
}: RoleProps) {
  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>(
    role.permissions
  );

  const handlePermissionToggle = (permissionId: string) => {
    const updated = selectedPermissions.includes(permissionId)
      ? selectedPermissions.filter((id) => id !== permissionId)
      : [...selectedPermissions, permissionId];

    setSelectedPermissions(updated);
    onUpdatePermissions?.(role.id, updated);
  };

  // Group permissions by category
  const groupedPermissions = allPermissions.reduce(
    (acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    },
    {} as Record<string, Permission[]>
  );

  return (
    <Card className={`bg-background p-1 shadow-sm rounded-md ${className || ""}`}>
      <CardContent className="bg-foreground p-4 rounded-md">
        <CardHeader className="px-0 pt-0">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-font text-lg">{role.name}</CardTitle>
              <p className="text-font/60 text-sm mt-1">{role.description}</p>
            </div>
            <Badge
              variant="secondary"
              className="font-semibold"
              style={
                role.color
                  ? { backgroundColor: role.color, color: "white" }
                  : undefined
              }
            >
              {role.memberCount} members
            </Badge>
          </div>
        </CardHeader>

        <Separator className="my-4" />

        {/* Permissions by Category */}
        <div className="space-y-4">
          {Object.entries(groupedPermissions).map(([category, permissions]) => (
            <div key={category}>
              <h4 className="text-font font-medium text-sm mb-3 capitalize">
                {category} Permissions
              </h4>
              <div className="space-y-2">
                {permissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-start gap-3 p-2 rounded-md hover:bg-background transition-colors"
                  >
                    <Checkbox
                      id={`${role.id}-${permission.id}`}
                      checked={selectedPermissions.includes(permission.id)}
                      onCheckedChange={() =>
                        isEditable && handlePermissionToggle(permission.id)
                      }
                      disabled={!isEditable || role.isDefault}
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={`${role.id}-${permission.id}`}
                        className="text-font text-sm font-medium cursor-pointer"
                      >
                        {permission.name}
                      </Label>
                      <p className="text-font/60 text-xs mt-0.5">
                        {permission.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        {isEditable && !role.isDefault && (
          <>
            <Separator className="my-4" />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onDeleteRole?.(role.id)}
              >
                Delete Role
              </Button>
            </div>
          </>
        )}

        {role.isDefault && (
          <div className="bg-background rounded-md p-3 mt-4">
            <p className="text-font/60 text-xs">
              This is a default role and cannot be deleted or modified.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
