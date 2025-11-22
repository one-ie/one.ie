/**
 * ClaimHistoryTable Component
 *
 * Table displaying past claim transactions with links to blockchain explorer.
 */

import type { ClaimRecord } from "./types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface ClaimHistoryTableProps {
	claims: ClaimRecord[];
	tokenSymbol: string;
	blockExplorerUrl?: string;
}

export function ClaimHistoryTable({
	claims,
	tokenSymbol,
	blockExplorerUrl = "https://etherscan.io/tx",
}: ClaimHistoryTableProps) {
	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getStatusBadge = (status: ClaimRecord["status"]) => {
		switch (status) {
			case "completed":
				return <Badge>Completed</Badge>;
			case "pending":
				return <Badge variant="secondary">Pending</Badge>;
			case "failed":
				return <Badge variant="destructive">Failed</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	const truncateTxHash = (hash: string) => {
		if (hash.length <= 13) return hash;
		return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
	};

	if (claims.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Claim History</CardTitle>
					<CardDescription>No claims yet</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground text-center py-8">
						Your claim history will appear here once you start claiming vested tokens.
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Claim History</CardTitle>
				<CardDescription>
					{claims.length} claim{claims.length !== 1 ? "s" : ""} total
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Date</TableHead>
							<TableHead>Amount</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="hidden sm:table-cell">
								Transaction
							</TableHead>
							<TableHead className="text-right">Action</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{claims.map((claim) => (
							<TableRow key={claim._id}>
								<TableCell className="font-medium">
									{formatDate(claim.timestamp)}
								</TableCell>
								<TableCell>
									{claim.amount.toLocaleString()} {tokenSymbol}
								</TableCell>
								<TableCell>{getStatusBadge(claim.status)}</TableCell>
								<TableCell className="hidden sm:table-cell font-mono text-xs">
									{claim.txHash ? (
										<span className="text-muted-foreground">
											{truncateTxHash(claim.txHash)}
										</span>
									) : (
										<span className="text-muted-foreground">-</span>
									)}
								</TableCell>
								<TableCell className="text-right">
									{claim.txHash && claim.status === "completed" && (
										<Button
											variant="ghost"
											size="sm"
											asChild
										>
											<a
												href={`${blockExplorerUrl}/${claim.txHash}`}
												target="_blank"
												rel="noopener noreferrer"
											>
												View
											</a>
										</Button>
									)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
