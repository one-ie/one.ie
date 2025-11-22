/**
 * GroupPermissions Component
 *
 * Permission matrix for group access
 * Part of GROUPS dimension (ontology-ui)
 */

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import type { UserRole, Permission } from "../types";
import { cn, getRoleDisplay } from "../utils";

export interface GroupPermissionsProps {
  permissions: Record<UserRole, Permission[]>;
  onPermissionChange?: (role: UserRole, permission: Permission) => void;
  readOnly?: boolean;
  className?: string;
}

export function GroupPermissions({
  permissions,
  onPermissionChange,
  readOnly = false,
  className,
}: GroupPermissionsProps) {
  const resources = Array.from(
    new Set(
      Object.values(permissions).flatMap((perms) => perms.map((p) => p.resource))
    )
  );

  const actions: Permission["action"][] = ["create", "read", "update", "delete"];

  return (
    <Card className={cn("bg-background p-1 shadow-sm rounded-md", className)}>
      <div className="bg-foreground rounded-md p-4 text-font">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="flex items-center gap-2 text-font">
            <span>🔒</span>
            Group Permissions
          </CardTitle>
          <p className="text-sm text-font/60">
            Control what each role can do
          </p>
        </CardHeader>

        <CardContent className="p-0">
          <div className="space-y-6">
            {Object.entries(permissions).map(([role, perms]) => (
              <div key={role} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge>{getRoleDisplay(role as UserRole)}</Badge>
                  <span className="text-sm text-font/60">
                    {perms.filter((p) => p.granted).length} permissions granted
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="font-medium text-font">Resource</div>
                  {actions.map((action) => (
                    <div key={action} className="font-medium text-center capitalize text-font">
                      {action}
                    </div>
                  ))}

                  {resources.map((resource) => (
                    <React.Fragment key={resource}>
                      <div className="py-2 capitalize text-font">{resource}</div>
                      {actions.map((action) => {
                        const permission = perms.find(
                          (p) => p.resource === resource && p.action === action
                        );
                        return (
                          <div key={action} className="flex justify-center py-2">
                            <Switch
                              checked={permission?.granted || false}
                              onCheckedChange={(granted) => {
                                if (!readOnly && permission) {
                                  onPermissionChange?.(role as UserRole, {
                                    ...permission,
                                    granted,
                                  });
                                }
                              }}
                              disabled={readOnly}
                            />
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
