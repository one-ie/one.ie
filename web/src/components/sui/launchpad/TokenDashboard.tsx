/**
 * TokenDashboard Component
 *
 * Comprehensive token information and management dashboard.
 * Displays stats, charts, transactions, vesting, staking, and admin actions.
 *
 * Features:
 * - Token Stats (price, market cap, holders, supply)
 * - Supply Distribution pie chart
 * - Recent Transactions table
 * - Vesting Schedule timeline
 * - Staking Pools list with APY
 * - Quick Actions (mint, transfer ownership, update metadata)
 *
 * @cycle 54
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Coins,
	TrendingUp,
	Users,
	Package,
	Send,
	Edit,
	Crown,
	Calendar,
	Percent,
	ArrowUpRight,
	ArrowDownRight,
	Clock,
	Lock,
} from "lucide-react";
import {
	PieChart,
	Pie,
	Cell,
	ResponsiveContainer,
	Tooltip,
	Legend,
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
} from "recharts";
import { formatDistanceToNow } from "date-fns";

interface TokenDashboardProps {
	tokenId: Id<"things">;
	groupId: Id<"groups">;
	userRole?: "platform_owner" | "org_owner" | "org_user" | "customer";
}

interface Transaction {
	_id: Id<"events">;
	type: string;
	from: string;
	to: string;
	amount: number;
	timestamp: number;
	hash: string;
}

interface VestingSchedule {
	_id: Id<"things">;
	beneficiary: string;
	totalAmount: number;
	releasedAmount: number;
	startTime: number;
	cliffDuration: number;
	vestingDuration: number;
	status: string;
}

interface StakingPool {
	_id: Id<"things">;
	name: string;
	apy: number;
	totalStaked: number;
	participants: number;
	lockPeriod: number;
	status: "active" | "paused" | "ended";
}

// Chart colors
const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];

export function TokenDashboard({
	tokenId,
	groupId,
	userRole = "customer",
}: TokenDashboardProps) {
	// Fetch token data
	const token = useQuery(api.queries.sui.tokens.get, {
		id: tokenId,
		groupId,
	});

	// Fetch token events/transactions
	const transactions = useQuery(api.queries.sui.tokens.getEvents, {
		tokenId,
		groupId,
		limit: 10,
	});

	// Fetch vesting schedules
	const vestingSchedules = useQuery(api.queries.sui.vesting.getByToken, {
		tokenId,
		groupId,
	});

	// Fetch staking pools
	const stakingPools = useQuery(api.queries.sui.staking.getByToken, {
		tokenId,
		groupId,
	});

	// Mutations for admin actions
	const mintTokens = useMutation(api.mutations.sui.tokens.mint);
	const transferOwnership = useMutation(
		api.mutations.sui.tokens.transferOwnership,
	);
	const updateMetadata = useMutation(api.mutations.sui.tokens.updateMetadata);

	// Dialog states
	const [mintDialogOpen, setMintDialogOpen] = useState(false);
	const [transferDialogOpen, setTransferDialogOpen] = useState(false);
	const [metadataDialogOpen, setMetadataDialogOpen] = useState(false);

	// Form states
	const [mintAmount, setMintAmount] = useState("");
	const [mintRecipient, setMintRecipient] = useState("");
	const [newOwner, setNewOwner] = useState("");
	const [newName, setNewName] = useState("");
	const [newSymbol, setNewSymbol] = useState("");

	// Loading state
	if (token === undefined) {
		return <TokenDashboardSkeleton />;
	}

	if (!token) {
		return (
			<div className="flex items-center justify-center h-64">
				<p className="text-muted-foreground">Token not found</p>
			</div>
		);
	}

	// Calculate stats
	const stats = {
		price: token.properties.price || 0,
		marketCap: token.properties.marketCap || 0,
		holders: token.properties.holders || 0,
		totalSupply: token.properties.totalSupply || 0,
		circulatingSupply: token.properties.circulatingSupply || 0,
		priceChange24h: token.properties.priceChange24h || 0,
	};

	// Supply distribution data
	const supplyDistribution = [
		{
			name: "Public",
			value: token.properties.publicAllocation || 0,
			percentage: ((token.properties.publicAllocation || 0) / stats.totalSupply) * 100,
		},
		{
			name: "Team",
			value: token.properties.teamAllocation || 0,
			percentage: ((token.properties.teamAllocation || 0) / stats.totalSupply) * 100,
		},
		{
			name: "Treasury",
			value: token.properties.treasuryAllocation || 0,
			percentage:
				((token.properties.treasuryAllocation || 0) / stats.totalSupply) * 100,
		},
		{
			name: "Ecosystem",
			value: token.properties.ecosystemAllocation || 0,
			percentage:
				((token.properties.ecosystemAllocation || 0) / stats.totalSupply) * 100,
		},
		{
			name: "Advisors",
			value: token.properties.advisorAllocation || 0,
			percentage:
				((token.properties.advisorAllocation || 0) / stats.totalSupply) * 100,
		},
	].filter((item) => item.value > 0);

	// Check permissions
	const canMint = userRole === "platform_owner" || userRole === "org_owner";
	const canTransfer = userRole === "platform_owner" || userRole === "org_owner";
	const canUpdateMetadata =
		userRole === "platform_owner" || userRole === "org_owner";

	// Handle mint
	const handleMint = async () => {
		try {
			await mintTokens({
				tokenId,
				groupId,
				amount: Number(mintAmount),
				recipient: mintRecipient,
			});
			setMintDialogOpen(false);
			setMintAmount("");
			setMintRecipient("");
		} catch (error) {
			console.error("Failed to mint tokens:", error);
		}
	};

	// Handle transfer ownership
	const handleTransferOwnership = async () => {
		try {
			await transferOwnership({
				tokenId,
				groupId,
				newOwner,
			});
			setTransferDialogOpen(false);
			setNewOwner("");
		} catch (error) {
			console.error("Failed to transfer ownership:", error);
		}
	};

	// Handle update metadata
	const handleUpdateMetadata = async () => {
		try {
			await updateMetadata({
				tokenId,
				groupId,
				name: newName || token.name,
				symbol: newSymbol || token.properties.symbol,
			});
			setMetadataDialogOpen(false);
			setNewName("");
			setNewSymbol("");
		} catch (error) {
			console.error("Failed to update metadata:", error);
		}
	};

	return (
		<div className="space-y-6">
			{/* Token Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">{token.name}</h1>
					<p className="text-muted-foreground">
						{token.properties.symbol} • {token.properties.network || "Sui"}
					</p>
				</div>
				<Badge
					variant={
						token.properties.status === "active" ? "default" : "secondary"
					}
				>
					{token.properties.status || "Active"}
				</Badge>
			</div>

			{/* Token Stats */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Price</CardTitle>
						<Coins className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							${stats.price.toLocaleString()}
						</div>
						<p
							className={`text-xs flex items-center gap-1 ${
								stats.priceChange24h >= 0
									? "text-green-600"
									: "text-red-600"
							}`}
						>
							{stats.priceChange24h >= 0 ? (
								<ArrowUpRight className="h-3 w-3" />
							) : (
								<ArrowDownRight className="h-3 w-3" />
							)}
							{Math.abs(stats.priceChange24h).toFixed(2)}% (24h)
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Market Cap</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							${(stats.marketCap / 1_000_000).toFixed(2)}M
						</div>
						<p className="text-xs text-muted-foreground">
							${stats.marketCap.toLocaleString()} total
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Holders</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{stats.holders.toLocaleString()}
						</div>
						<p className="text-xs text-muted-foreground">Unique addresses</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Supply</CardTitle>
						<Package className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{(stats.circulatingSupply / 1_000_000).toFixed(2)}M
						</div>
						<p className="text-xs text-muted-foreground">
							of {(stats.totalSupply / 1_000_000).toFixed(2)}M total
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Tabs for different views */}
			<Tabs defaultValue="overview" className="w-full">
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="transactions">Transactions</TabsTrigger>
					<TabsTrigger value="vesting">Vesting</TabsTrigger>
					<TabsTrigger value="staking">Staking</TabsTrigger>
				</TabsList>

				{/* Overview Tab */}
				<TabsContent value="overview" className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						{/* Supply Distribution */}
						<Card>
							<CardHeader>
								<CardTitle>Supply Distribution</CardTitle>
								<CardDescription>
									Token allocation across categories
								</CardDescription>
							</CardHeader>
							<CardContent>
								<ResponsiveContainer width="100%" height={300}>
									<PieChart>
										<Pie
											data={supplyDistribution}
											cx="50%"
											cy="50%"
											labelLine={false}
											label={(entry) => `${entry.name} ${entry.percentage.toFixed(1)}%`}
											outerRadius={80}
											fill="#8884d8"
											dataKey="value"
										>
											{supplyDistribution.map((entry, index) => (
												<Cell
													key={`cell-${index}`}
													fill={COLORS[index % COLORS.length]}
												/>
											))}
										</Pie>
										<Tooltip
											formatter={(value: number) => value.toLocaleString()}
										/>
										<Legend />
									</PieChart>
								</ResponsiveContainer>
							</CardContent>
						</Card>

						{/* Token Info */}
						<Card>
							<CardHeader>
								<CardTitle>Token Information</CardTitle>
								<CardDescription>
									Contract details and metadata
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex justify-between">
									<span className="text-sm text-muted-foreground">
										Contract Address
									</span>
									<code className="text-sm font-mono">
										{token.properties.contractAddress?.slice(0, 8)}...
										{token.properties.contractAddress?.slice(-6)}
									</code>
								</div>
								<div className="flex justify-between">
									<span className="text-sm text-muted-foreground">
										Decimals
									</span>
									<span className="text-sm font-medium">
										{token.properties.decimals || 9}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-sm text-muted-foreground">
										Created At
									</span>
									<span className="text-sm font-medium">
										{new Date(token.createdAt).toLocaleDateString()}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-sm text-muted-foreground">Owner</span>
									<code className="text-sm font-mono">
										{token.properties.owner?.slice(0, 8)}...
										{token.properties.owner?.slice(-6)}
									</code>
								</div>
								<div className="flex justify-between">
									<span className="text-sm text-muted-foreground">
										Transferable
									</span>
									<Badge variant={token.properties.transferable ? "default" : "secondary"}>
										{token.properties.transferable ? "Yes" : "No"}
									</Badge>
								</div>
								<div className="flex justify-between">
									<span className="text-sm text-muted-foreground">
										Mintable
									</span>
									<Badge variant={token.properties.mintable ? "default" : "secondary"}>
										{token.properties.mintable ? "Yes" : "No"}
									</Badge>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				{/* Transactions Tab */}
				<TabsContent value="transactions">
					<Card>
						<CardHeader>
							<CardTitle>Recent Transactions</CardTitle>
							<CardDescription>
								Last 10 token transactions
							</CardDescription>
						</CardHeader>
						<CardContent>
							{transactions === undefined ? (
								<Skeleton className="h-64" />
							) : transactions && transactions.length > 0 ? (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Type</TableHead>
											<TableHead>From</TableHead>
											<TableHead>To</TableHead>
											<TableHead className="text-right">Amount</TableHead>
											<TableHead>Time</TableHead>
											<TableHead>Hash</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{transactions.map((tx: Transaction) => (
											<TableRow key={tx._id}>
												<TableCell>
													<Badge variant="outline">{tx.type}</Badge>
												</TableCell>
												<TableCell>
													<code className="text-xs">
														{tx.from.slice(0, 6)}...{tx.from.slice(-4)}
													</code>
												</TableCell>
												<TableCell>
													<code className="text-xs">
														{tx.to.slice(0, 6)}...{tx.to.slice(-4)}
													</code>
												</TableCell>
												<TableCell className="text-right font-mono">
													{tx.amount.toLocaleString()}
												</TableCell>
												<TableCell className="text-xs text-muted-foreground">
													{formatDistanceToNow(new Date(tx.timestamp), {
														addSuffix: true,
													})}
												</TableCell>
												<TableCell>
													<code className="text-xs">
														{tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}
													</code>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							) : (
								<div className="flex items-center justify-center h-32">
									<p className="text-muted-foreground">No transactions yet</p>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Vesting Tab */}
				<TabsContent value="vesting">
					<Card>
						<CardHeader>
							<CardTitle>Vesting Schedules</CardTitle>
							<CardDescription>
								Active vesting schedules for this token
							</CardDescription>
						</CardHeader>
						<CardContent>
							{vestingSchedules === undefined ? (
								<Skeleton className="h-64" />
							) : vestingSchedules && vestingSchedules.length > 0 ? (
								<div className="space-y-4">
									{vestingSchedules.map((schedule: VestingSchedule) => {
										const percentReleased =
											(schedule.releasedAmount / schedule.totalAmount) * 100;
										return (
											<div
												key={schedule._id}
												className="border rounded-lg p-4 space-y-3"
											>
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2">
														<Lock className="h-4 w-4 text-muted-foreground" />
														<code className="text-sm font-mono">
															{schedule.beneficiary.slice(0, 8)}...
															{schedule.beneficiary.slice(-6)}
														</code>
													</div>
													<Badge
														variant={
															schedule.status === "active"
																? "default"
																: "secondary"
														}
													>
														{schedule.status}
													</Badge>
												</div>

												<div className="grid grid-cols-3 gap-4 text-sm">
													<div>
														<p className="text-muted-foreground">Total</p>
														<p className="font-medium">
															{schedule.totalAmount.toLocaleString()}
														</p>
													</div>
													<div>
														<p className="text-muted-foreground">Released</p>
														<p className="font-medium">
															{schedule.releasedAmount.toLocaleString()}
														</p>
													</div>
													<div>
														<p className="text-muted-foreground">Remaining</p>
														<p className="font-medium">
															{(
																schedule.totalAmount - schedule.releasedAmount
															).toLocaleString()}
														</p>
													</div>
												</div>

												<div className="space-y-2">
													<div className="flex justify-between text-xs text-muted-foreground">
														<span>Progress</span>
														<span>{percentReleased.toFixed(1)}%</span>
													</div>
													<div className="w-full bg-secondary rounded-full h-2">
														<div
															className="bg-primary h-2 rounded-full transition-all"
															style={{ width: `${percentReleased}%` }}
														/>
													</div>
												</div>

												<div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
													<div>
														<Clock className="h-3 w-3 inline mr-1" />
														Start: {new Date(schedule.startTime).toLocaleDateString()}
													</div>
													<div>
														<Calendar className="h-3 w-3 inline mr-1" />
														Cliff: {schedule.cliffDuration / 86400000} days
													</div>
													<div>
														<Calendar className="h-3 w-3 inline mr-1" />
														Duration: {schedule.vestingDuration / 86400000} days
													</div>
												</div>
											</div>
										);
									})}
								</div>
							) : (
								<div className="flex items-center justify-center h-32">
									<p className="text-muted-foreground">
										No vesting schedules
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Staking Tab */}
				<TabsContent value="staking">
					<Card>
						<CardHeader>
							<CardTitle>Staking Pools</CardTitle>
							<CardDescription>
								Available staking pools for this token
							</CardDescription>
						</CardHeader>
						<CardContent>
							{stakingPools === undefined ? (
								<Skeleton className="h-64" />
							) : stakingPools && stakingPools.length > 0 ? (
								<div className="grid gap-4 md:grid-cols-2">
									{stakingPools.map((pool: StakingPool) => (
										<Card key={pool._id}>
											<CardHeader>
												<div className="flex items-center justify-between">
													<CardTitle className="text-lg">{pool.name}</CardTitle>
													<Badge
														variant={
															pool.status === "active"
																? "default"
																: pool.status === "paused"
																	? "secondary"
																	: "outline"
														}
													>
														{pool.status}
													</Badge>
												</div>
											</CardHeader>
											<CardContent className="space-y-4">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2">
														<Percent className="h-4 w-4 text-green-600" />
														<span className="text-2xl font-bold text-green-600">
															{pool.apy.toFixed(2)}%
														</span>
													</div>
													<span className="text-sm text-muted-foreground">
														APY
													</span>
												</div>

												<div className="grid grid-cols-2 gap-4 text-sm">
													<div>
														<p className="text-muted-foreground">Total Staked</p>
														<p className="font-medium">
															{(pool.totalStaked / 1_000_000).toFixed(2)}M
														</p>
													</div>
													<div>
														<p className="text-muted-foreground">
															Participants
														</p>
														<p className="font-medium">
															{pool.participants.toLocaleString()}
														</p>
													</div>
												</div>

												<div className="text-sm">
													<p className="text-muted-foreground">Lock Period</p>
													<p className="font-medium">
														{pool.lockPeriod / 86400000} days
													</p>
												</div>

												{pool.status === "active" && (
													<Button className="w-full" variant="outline">
														Stake Tokens
													</Button>
												)}
											</CardContent>
										</Card>
									))}
								</div>
							) : (
								<div className="flex items-center justify-center h-32">
									<p className="text-muted-foreground">No staking pools</p>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Quick Actions */}
			{(canMint || canTransfer || canUpdateMetadata) && (
				<Card>
					<CardHeader>
						<CardTitle>Quick Actions</CardTitle>
						<CardDescription>
							Administrative actions for token management
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-wrap gap-2">
						{canMint && token.properties.mintable && (
							<Dialog open={mintDialogOpen} onOpenChange={setMintDialogOpen}>
								<DialogTrigger asChild>
									<Button variant="outline">
										<Coins className="h-4 w-4" />
										Mint Tokens
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Mint New Tokens</DialogTitle>
										<DialogDescription>
											Create new tokens and send them to a recipient
										</DialogDescription>
									</DialogHeader>
									<div className="space-y-4">
										<div className="space-y-2">
											<Label htmlFor="mint-amount">Amount</Label>
											<Input
												id="mint-amount"
												type="number"
												placeholder="1000000"
												value={mintAmount}
												onChange={(e) => setMintAmount(e.target.value)}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="mint-recipient">Recipient Address</Label>
											<Input
												id="mint-recipient"
												placeholder="0x..."
												value={mintRecipient}
												onChange={(e) => setMintRecipient(e.target.value)}
											/>
										</div>
									</div>
									<DialogFooter>
										<Button
											variant="outline"
											onClick={() => setMintDialogOpen(false)}
										>
											Cancel
										</Button>
										<Button onClick={handleMint}>Mint Tokens</Button>
									</DialogFooter>
								</DialogContent>
							</Dialog>
						)}

						{canTransfer && (
							<Dialog
								open={transferDialogOpen}
								onOpenChange={setTransferDialogOpen}
							>
								<DialogTrigger asChild>
									<Button variant="outline">
										<Crown className="h-4 w-4" />
										Transfer Ownership
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Transfer Ownership</DialogTitle>
										<DialogDescription>
											Transfer token ownership to a new address
										</DialogDescription>
									</DialogHeader>
									<div className="space-y-4">
										<div className="space-y-2">
											<Label htmlFor="new-owner">New Owner Address</Label>
											<Input
												id="new-owner"
												placeholder="0x..."
												value={newOwner}
												onChange={(e) => setNewOwner(e.target.value)}
											/>
										</div>
									</div>
									<DialogFooter>
										<Button
											variant="outline"
											onClick={() => setTransferDialogOpen(false)}
										>
											Cancel
										</Button>
										<Button onClick={handleTransferOwnership}>
											Transfer Ownership
										</Button>
									</DialogFooter>
								</DialogContent>
							</Dialog>
						)}

						{canUpdateMetadata && (
							<Dialog
								open={metadataDialogOpen}
								onOpenChange={setMetadataDialogOpen}
							>
								<DialogTrigger asChild>
									<Button variant="outline">
										<Edit className="h-4 w-4" />
										Update Metadata
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Update Token Metadata</DialogTitle>
										<DialogDescription>
											Update the token name and symbol
										</DialogDescription>
									</DialogHeader>
									<div className="space-y-4">
										<div className="space-y-2">
											<Label htmlFor="new-name">Token Name</Label>
											<Input
												id="new-name"
												placeholder={token.name}
												value={newName}
												onChange={(e) => setNewName(e.target.value)}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="new-symbol">Token Symbol</Label>
											<Input
												id="new-symbol"
												placeholder={token.properties.symbol}
												value={newSymbol}
												onChange={(e) => setNewSymbol(e.target.value)}
											/>
										</div>
									</div>
									<DialogFooter>
										<Button
											variant="outline"
											onClick={() => setMetadataDialogOpen(false)}
										>
											Cancel
										</Button>
										<Button onClick={handleUpdateMetadata}>
											Update Metadata
										</Button>
									</DialogFooter>
								</DialogContent>
							</Dialog>
						)}
					</CardContent>
				</Card>
			)}
		</div>
	);
}

// Loading skeleton
function TokenDashboardSkeleton() {
	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<Skeleton className="h-10 w-64" />
				<Skeleton className="h-4 w-48" />
			</div>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{[...Array(4)].map((_, i) => (
					<Skeleton key={i} className="h-32" />
				))}
			</div>
			<Skeleton className="h-96" />
		</div>
	);
}
