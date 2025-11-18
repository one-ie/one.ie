/**
 * TeamMembersList - Display pending and accepted team invitations
 *
 * Shows all team members and pending invitations with their status
 */

import { Check, Clock, Mail, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TeamMember {
	id: string;
	email: string;
	displayName?: string;
	role: "owner" | "editor" | "viewer";
	status: "accepted" | "pending" | "expired";
	joinedAt?: number;
	expiresAt?: number;
}

interface TeamMembersListProps {
	members: TeamMember[];
	owner?: TeamMember;
	onRemove?: (memberId: string) => void;
	loading?: boolean;
}

export function TeamMembersList({
	members,
	owner,
	onRemove,
	loading = false,
}: TeamMembersListProps) {
	const acceptedMembers = members.filter((m) => m.status === "accepted");
	const pendingMembers = members.filter((m) => m.status === "pending");
	const expiredMembers = members.filter((m) => m.status === "expired");

	const getInitials = (email: string) => {
		return email
			.split("@")[0]
			.split(".")
			.map((part) => part[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "accepted":
				return "bg-green-500/10 text-green-700 dark:text-green-400";
			case "pending":
				return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
			case "expired":
				return "bg-destructive/10 text-destructive";
			default:
				return "bg-muted text-muted-foreground";
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "accepted":
				return <Check className="w-3 h-3" />;
			case "pending":
				return <Clock className="w-3 h-3" />;
			case "expired":
				return <X className="w-3 h-3" />;
			default:
				return null;
		}
	};

	const getRoleLabel = (role: string) => {
		switch (role) {
			case "owner":
				return "Owner";
			case "editor":
				return "Editor";
			case "viewer":
				return "Viewer";
			default:
				return role;
		}
	};

	const MemberCard = ({ member }: { member: TeamMember }) => (
		<div className="flex items-center justify-between p-3 rounded-lg border bg-card">
			<div className="flex items-center gap-3 flex-1">
				<Avatar className="h-8 w-8">
					<AvatarFallback className="text-xs font-semibold">
						{getInitials(member.email)}
					</AvatarFallback>
				</Avatar>

				<div className="flex-1 min-w-0">
					<p className="text-sm font-medium truncate">
						{member.displayName || member.email}
					</p>
					<p className="text-xs text-muted-foreground truncate">
						{member.email}
					</p>
				</div>
			</div>

			<div className="flex items-center gap-2">
				<Badge
					variant="outline"
					className={`${getStatusColor(member.status)} border-0`}
				>
					<span className="mr-1">{getStatusIcon(member.status)}</span>
					{member.status === "accepted" ? "Joined" : "Pending"}
				</Badge>

				<Badge variant="outline">{getRoleLabel(member.role)}</Badge>

				{onRemove && member.status !== "accepted" && (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => onRemove(member.id)}
						disabled={loading}
					>
						Remove
					</Button>
				)}
			</div>
		</div>
	);

	return (
		<div className="space-y-4">
			{/* Owner Section */}
			{owner && (
				<div className="space-y-2">
					<h3 className="text-sm font-semibold flex items-center gap-2">
						<span>Owner</span>
						<Badge variant="secondary" className="ml-auto">
							You
						</Badge>
					</h3>
					<MemberCard member={owner} />
				</div>
			)}

			{/* Accepted Members */}
			{acceptedMembers.length > 0 && (
				<div className="space-y-2">
					<h3 className="text-sm font-semibold">
						Team Members ({acceptedMembers.length})
					</h3>
					<div className="space-y-2">
						{acceptedMembers.map((member) => (
							<MemberCard key={member.id} member={member} />
						))}
					</div>
				</div>
			)}

			{/* Pending Invitations */}
			{pendingMembers.length > 0 && (
				<div className="space-y-2">
					<h3 className="text-sm font-semibold">
						Pending Invitations ({pendingMembers.length})
					</h3>
					<div className="space-y-2">
						{pendingMembers.map((member) => (
							<MemberCard key={member.id} member={member} />
						))}
					</div>
				</div>
			)}

			{/* Expired Invitations */}
			{expiredMembers.length > 0 && (
				<div className="space-y-2">
					<h3 className="text-sm font-semibold text-muted-foreground">
						Expired Invitations ({expiredMembers.length})
					</h3>
					<div className="space-y-2">
						{expiredMembers.map((member) => (
							<MemberCard key={member.id} member={member} />
						))}
					</div>
				</div>
			)}

			{/* Empty State */}
			{acceptedMembers.length === 0 &&
				pendingMembers.length === 0 &&
				expiredMembers.length === 0 &&
				!owner && (
					<Alert>
						<Mail className="h-4 w-4" />
						<AlertDescription>
							No team members yet. Invite people to start collaborating!
						</AlertDescription>
					</Alert>
				)}
		</div>
	);
}
