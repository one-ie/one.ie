/**
 * PermissionMatrix Component
 *
 * Grid showing permissions across roles
 * Part of PEOPLE dimension (ontology-ui)
 */

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { UserRole, Permission } from "../types";
import { cn, getRoleDisplay } from "../utils";

export interface PermissionMatrixProps {
  permissions: Record<UserRole, Permission[]>;
  resources: string[];
  className?: string;
}

export function PermissionMatrix({
  permissions,
  resources,
  className,
}: PermissionMatrixProps) {
  const roles: UserRole[] = ["platform_owner", "org_owner", "org_user", "customer"];

  // Helper to check if a role has permission for a resource and action
  const hasPermission = (role: UserRole, resource: string, action: Permission["action"]): boolean => {
    const rolePermissions = permissions[role] || [];
    return rolePermissions.some(
      (p) => p.resource === resource && p.action === action && p.granted
    );
  };

  // Get all unique actions from permissions
  const actions: Permission["action"][] = ["create", "read", "update", "delete"];

  return (
    <Card className={cn("overflow-hidden bg-background p-1 shadow-sm rounded-md", className)}>
      <div className="bg-foreground rounded-md text-font">
        <CardHeader>
          <CardTitle className="text-font">Permission Matrix</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-font/10">
                  <TableHead className="w-48 font-bold text-font">Resource</TableHead>
                  {roles.map((role) => (
                    <TableHead key={role} className="text-center font-bold text-font">
                      {getRoleDisplay(role)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {resources.map((resource) => (
                  <React.Fragment key={resource}>
                    {/* Resource name row */}
                    <TableRow className="bg-background/50 border-b border-font/10">
                      <TableCell colSpan={roles.length + 1} className="font-semibold text-font">
                        {resource}
                      </TableCell>
                    </TableRow>

                    {/* Permission rows for each action */}
                    {actions.map((action) => (
                      <TableRow key={`${resource}-${action}`} className="border-b border-font/10 hover:bg-background transition-colors duration-150">
                        <TableCell className="pl-8 text-sm text-font/60">
                          {action}
                        </TableCell>
                        {roles.map((role) => (
                          <TableCell key={`${role}-${action}`} className="text-center">
                            {hasPermission(role, resource, action) ? (
                              <span className="text-green-600 dark:text-green-400 text-lg">✓</span>
                            ) : (
                              <span className="text-red-500 dark:text-red-400 text-lg">✗</span>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
