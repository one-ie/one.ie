/**
 * GovernanceInterface - Complete DAO governance system
 *
 * Features:
 * - DAO overview with stats (members, proposals, treasury, participation)
 * - Active proposals list with status badges
 * - Proposal details with voting breakdown
 * - Vote casting (For/Against/Abstain)
 * - Create proposal form
 * - Proposal history
 *
 * Ontology Mapping:
 * - Things: DAO proposals (type: "proposal")
 * - People: DAO members with voting power
 * - Events: Vote casting, proposal creation, execution
 * - Connections: member_of, voted_on
 */

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle2, Clock, XCircle, TrendingUp, Users, Coins, Activity, Vote, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Types
export type ProposalStatus = 'pending' | 'active' | 'succeeded' | 'defeated' | 'executed' | 'cancelled';
export type VoteType = 'for' | 'against' | 'abstain';

export interface Proposal {
  _id: string;
  title: string;
  description: string;
  proposer: string;
  status: ProposalStatus;
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  totalVotes: number;
  quorum: number;
  startTime: number;
  endTime: number;
  actions: ProposalAction[];
  executed: boolean;
}

export interface ProposalAction {
  type: 'transfer' | 'mint' | 'parameter_change' | 'custom';
  target: string;
  value?: number;
  data?: string;
  description: string;
}

export interface DAOStats {
  totalMembers: number;
  activeProposals: number;
  treasuryBalance: number;
  participationRate: number;
  totalProposals: number;
}

interface GovernanceInterfaceProps {
  daoId: string;
  groupId?: string;
  userAddress?: string;
  className?: string;
}

/**
 * Main DAO Governance Interface
 *
 * @example
 * ```tsx
 * <GovernanceInterface
 *   daoId="dao_123"
 *   groupId="group_456"
 *   userAddress="0x1234..."
 * />
 * ```
 */
export function GovernanceInterface({
  daoId,
  groupId,
  userAddress,
  className,
}: GovernanceInterfaceProps) {
  const [selectedTab, setSelectedTab] = useState<'active' | 'history'>('active');
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);

  // Real-time Convex queries
  const daoStats = useQuery(api.dao.getStats, { daoId, groupId });
  const activeProposals = useQuery(api.dao.listProposals, {
    daoId,
    groupId,
    status: 'active',
  });
  const allProposals = useQuery(api.dao.listProposals, { daoId, groupId });
  const votingPower = useQuery(api.dao.getVotingPower, {
    daoId,
    userAddress: userAddress || '',
  });

  if (!daoStats || !activeProposals || !allProposals) {
    return <GovernanceInterfaceSkeleton />;
  }

  const historyProposals = allProposals.filter(
    (p) => p.status === 'succeeded' || p.status === 'defeated' || p.status === 'executed'
  );

  return (
    <div className={className}>
      {/* DAO Stats */}
      <DAOStats stats={daoStats} />

      <Separator className="my-6" />

      {/* Voting Power Badge */}
      {votingPower !== undefined && (
        <div className="mb-6">
          <VotingPowerBadge power={votingPower} />
        </div>
      )}

      {/* Proposals Tabs */}
      <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="active">
              Active ({activeProposals.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              History ({historyProposals.length})
            </TabsTrigger>
          </TabsList>

          {/* Create Proposal Button */}
          <CreateProposalDialog daoId={daoId} groupId={groupId} />
        </div>

        {/* Active Proposals */}
        <TabsContent value="active" className="space-y-4">
          {activeProposals.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No active proposals
              </CardContent>
            </Card>
          ) : (
            activeProposals.map((proposal) => (
              <ProposalCard
                key={proposal._id}
                proposal={proposal}
                votingPower={votingPower}
                daoId={daoId}
                groupId={groupId}
                userAddress={userAddress}
                onSelect={() => setSelectedProposal(proposal._id)}
              />
            ))
          )}
        </TabsContent>

        {/* Proposal History */}
        <TabsContent value="history" className="space-y-4">
          {historyProposals.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No past proposals
              </CardContent>
            </Card>
          ) : (
            historyProposals.map((proposal) => (
              <ProposalCard
                key={proposal._id}
                proposal={proposal}
                votingPower={votingPower}
                daoId={daoId}
                groupId={groupId}
                userAddress={userAddress}
                onSelect={() => setSelectedProposal(proposal._id)}
                readonly
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Proposal Detail Dialog */}
      {selectedProposal && (
        <ProposalDetailDialog
          proposalId={selectedProposal}
          daoId={daoId}
          groupId={groupId}
          userAddress={userAddress}
          votingPower={votingPower}
          onClose={() => setSelectedProposal(null)}
        />
      )}
    </div>
  );
}

/**
 * DAO Statistics Overview
 */
function DAOStats({ stats }: { stats: DAOStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalMembers.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">DAO participants</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Proposals</CardTitle>
          <Vote className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeProposals}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalProposals} total proposals
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Treasury</CardTitle>
          <Coins className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${stats.treasuryBalance.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">Available balance</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Participation</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.participationRate}%</div>
          <p className="text-xs text-muted-foreground">Average voter turnout</p>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Voting Power Badge
 */
function VotingPowerBadge({ power }: { power: number }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-lg border px-4 py-2">
      <TrendingUp className="h-4 w-4 text-primary" />
      <div>
        <span className="text-sm font-medium">Your Voting Power:</span>
        <span className="ml-2 text-lg font-bold text-primary">
          {power.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

/**
 * Proposal Card Component
 */
function ProposalCard({
  proposal,
  votingPower,
  daoId,
  groupId,
  userAddress,
  onSelect,
  readonly = false,
}: {
  proposal: Proposal;
  votingPower?: number;
  daoId: string;
  groupId?: string;
  userAddress?: string;
  onSelect: () => void;
  readonly?: boolean;
}) {
  const castVote = useMutation(api.dao.vote);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (voteType: VoteType) => {
    if (!userAddress || votingPower === undefined) return;

    setIsVoting(true);
    try {
      await castVote({
        daoId,
        groupId,
        proposalId: proposal._id,
        voteType,
        votingPower,
        voter: userAddress,
      });
    } finally {
      setIsVoting(false);
    }
  };

  const totalVotes = proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain;
  const forPercentage = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0;
  const againstPercentage = totalVotes > 0 ? (proposal.votesAgainst / totalVotes) * 100 : 0;
  const abstainPercentage = totalVotes > 0 ? (proposal.votesAbstain / totalVotes) * 100 : 0;
  const quorumProgress = (totalVotes / proposal.quorum) * 100;

  const timeRemaining = formatDistanceToNow(new Date(proposal.endTime), {
    addSuffix: true,
  });

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{proposal.title}</CardTitle>
            <CardDescription className="mt-1">
              Proposed by {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}
            </CardDescription>
          </div>
          <ProposalStatusBadge status={proposal.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {proposal.description}
        </p>

        {/* Voting Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-green-600 dark:text-green-400">
              For: {forPercentage.toFixed(1)}%
            </span>
            <span className="text-red-600 dark:text-red-400">
              Against: {againstPercentage.toFixed(1)}%
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              Abstain: {abstainPercentage.toFixed(1)}%
            </span>
          </div>

          <div className="relative h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="absolute h-full bg-green-500"
              style={{ width: `${forPercentage}%` }}
            />
            <div
              className="absolute h-full bg-red-500"
              style={{ left: `${forPercentage}%`, width: `${againstPercentage}%` }}
            />
            <div
              className="absolute h-full bg-gray-400"
              style={{
                left: `${forPercentage + againstPercentage}%`,
                width: `${abstainPercentage}%`,
              }}
            />
          </div>

          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{totalVotes.toLocaleString()} votes</span>
            <span>Quorum: {quorumProgress.toFixed(1)}%</span>
          </div>

          <Progress value={quorumProgress} className="h-1" />
        </div>

        {/* Timeline */}
        {proposal.status === 'active' && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Ends {timeRemaining}</span>
          </div>
        )}

        {/* Actions Count */}
        {proposal.actions.length > 0 && (
          <div className="text-sm text-muted-foreground">
            {proposal.actions.length} action{proposal.actions.length !== 1 ? 's' : ''}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        {!readonly && proposal.status === 'active' && votingPower !== undefined && (
          <>
            <VoteButton
              type="for"
              disabled={isVoting}
              onClick={() => handleVote('for')}
            />
            <VoteButton
              type="against"
              disabled={isVoting}
              onClick={() => handleVote('against')}
            />
            <VoteButton
              type="abstain"
              disabled={isVoting}
              onClick={() => handleVote('abstain')}
            />
          </>
        )}
        <Button variant="outline" onClick={onSelect} className="ml-auto">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}

/**
 * Vote Button Component
 */
function VoteButton({
  type,
  disabled,
  onClick,
}: {
  type: VoteType;
  disabled?: boolean;
  onClick: () => void;
}) {
  const config = {
    for: {
      label: 'For',
      variant: 'default' as const,
      className: 'bg-green-600 hover:bg-green-700 text-white',
    },
    against: {
      label: 'Against',
      variant: 'destructive' as const,
      className: '',
    },
    abstain: {
      label: 'Abstain',
      variant: 'outline' as const,
      className: '',
    },
  };

  const { label, variant, className } = config[type];

  return (
    <Button
      variant={variant}
      size="sm"
      disabled={disabled}
      onClick={onClick}
      className={className}
    >
      {label}
    </Button>
  );
}

/**
 * Proposal Status Badge
 */
function ProposalStatusBadge({ status }: { status: ProposalStatus }) {
  const config: Record<
    ProposalStatus,
    { label: string; icon: any; className: string }
  > = {
    pending: {
      label: 'Pending',
      icon: Clock,
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    },
    active: {
      label: 'Active',
      icon: Activity,
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    },
    succeeded: {
      label: 'Succeeded',
      icon: CheckCircle2,
      className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    },
    defeated: {
      label: 'Defeated',
      icon: XCircle,
      className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    },
    executed: {
      label: 'Executed',
      icon: CheckCircle2,
      className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    },
    cancelled: {
      label: 'Cancelled',
      icon: AlertCircle,
      className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    },
  };

  const { label, icon: Icon, className } = config[status];

  return (
    <Badge className={className}>
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  );
}

/**
 * Proposal Detail Dialog
 */
function ProposalDetailDialog({
  proposalId,
  daoId,
  groupId,
  userAddress,
  votingPower,
  onClose,
}: {
  proposalId: string;
  daoId: string;
  groupId?: string;
  userAddress?: string;
  votingPower?: number;
  onClose: () => void;
}) {
  const proposal = useQuery(api.dao.getProposal, { proposalId, daoId, groupId });

  if (!proposal) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent>
          <Skeleton className="h-64" />
        </DialogContent>
      </Dialog>
    );
  }

  const totalVotes = proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <DialogTitle className="text-xl">{proposal.title}</DialogTitle>
            <ProposalStatusBadge status={proposal.status} />
          </div>
          <DialogDescription>
            Proposed by {proposal.proposer}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Description */}
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {proposal.description}
            </p>
          </div>

          <Separator />

          {/* Actions */}
          {proposal.actions.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Actions</h4>
              <div className="space-y-2">
                {proposal.actions.map((action, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-sm">
                        Action {index + 1}: {action.type}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <div className="space-y-1">
                        <div>
                          <span className="font-medium">Target:</span> {action.target}
                        </div>
                        {action.value !== undefined && (
                          <div>
                            <span className="font-medium">Value:</span> {action.value}
                          </div>
                        )}
                        {action.description && (
                          <div>
                            <span className="font-medium">Description:</span>{' '}
                            {action.description}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Voting Breakdown */}
          <div>
            <h4 className="font-medium mb-4">Voting Results</h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-green-600 dark:text-green-400">For</span>
                  <span className="font-medium">
                    {proposal.votesFor.toLocaleString()} (
                    {totalVotes > 0 ? ((proposal.votesFor / totalVotes) * 100).toFixed(1) : 0}
                    %)
                  </span>
                </div>
                <Progress
                  value={totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0}
                  className="h-2 [&>div]:bg-green-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-red-600 dark:text-red-400">Against</span>
                  <span className="font-medium">
                    {proposal.votesAgainst.toLocaleString()} (
                    {totalVotes > 0 ? ((proposal.votesAgainst / totalVotes) * 100).toFixed(1) : 0}
                    %)
                  </span>
                </div>
                <Progress
                  value={totalVotes > 0 ? (proposal.votesAgainst / totalVotes) * 100 : 0}
                  className="h-2 [&>div]:bg-red-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Abstain</span>
                  <span className="font-medium">
                    {proposal.votesAbstain.toLocaleString()} (
                    {totalVotes > 0 ? ((proposal.votesAbstain / totalVotes) * 100).toFixed(1) : 0}
                    %)
                  </span>
                </div>
                <Progress
                  value={totalVotes > 0 ? (proposal.votesAbstain / totalVotes) * 100 : 0}
                  className="h-2 [&>div]:bg-gray-400"
                />
              </div>

              <div className="pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Quorum Progress</span>
                  <span>
                    {totalVotes.toLocaleString()} / {proposal.quorum.toLocaleString()} (
                    {((totalVotes / proposal.quorum) * 100).toFixed(1)}%)
                  </span>
                </div>
                <Progress
                  value={(totalVotes / proposal.quorum) * 100}
                  className="h-2 mt-2"
                />
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Start Time:</span>
              <div className="font-medium">
                {new Date(proposal.startTime).toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">End Time:</span>
              <div className="font-medium">
                {new Date(proposal.endTime).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          {proposal.status === 'active' && votingPower !== undefined && (
            <div className="flex gap-2 w-full">
              <VoteButton type="for" onClick={() => {}} />
              <VoteButton type="against" onClick={() => {}} />
              <VoteButton type="abstain" onClick={() => {}} />
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Create Proposal Dialog
 */
function CreateProposalDialog({ daoId, groupId }: { daoId: string; groupId?: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [actionType, setActionType] = useState<ProposalAction['type']>('transfer');
  const [actionTarget, setActionTarget] = useState('');
  const [actionValue, setActionValue] = useState('');
  const [actionDescription, setActionDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createProposal = useMutation(api.dao.createProposal);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const actions: ProposalAction[] = actionTarget
        ? [
            {
              type: actionType,
              target: actionTarget,
              value: actionValue ? parseFloat(actionValue) : undefined,
              description: actionDescription,
            },
          ]
        : [];

      await createProposal({
        daoId,
        groupId,
        title,
        description,
        actions,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setActionType('transfer');
      setActionTarget('');
      setActionValue('');
      setActionDescription('');
      setOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Proposal
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Proposal</DialogTitle>
          <DialogDescription>
            Submit a proposal for the DAO to vote on
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Proposal title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Detailed description of the proposal"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <Separator />

          {/* Action Configuration */}
          <div>
            <h4 className="font-medium mb-3">Action (Optional)</h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="actionType">Action Type</Label>
                <Select
                  value={actionType}
                  onValueChange={(v) => setActionType(v as ProposalAction['type'])}
                >
                  <SelectTrigger id="actionType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transfer">Transfer Funds</SelectItem>
                    <SelectItem value="mint">Mint Tokens</SelectItem>
                    <SelectItem value="parameter_change">Parameter Change</SelectItem>
                    <SelectItem value="custom">Custom Action</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="actionTarget">Target Address/Contract</Label>
                <Input
                  id="actionTarget"
                  placeholder="0x..."
                  value={actionTarget}
                  onChange={(e) => setActionTarget(e.target.value)}
                />
              </div>

              {(actionType === 'transfer' || actionType === 'mint') && (
                <div>
                  <Label htmlFor="actionValue">Amount</Label>
                  <Input
                    id="actionValue"
                    type="number"
                    placeholder="0.0"
                    value={actionValue}
                    onChange={(e) => setActionValue(e.target.value)}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="actionDescription">Action Description</Label>
                <Input
                  id="actionDescription"
                  placeholder="What will this action do?"
                  value={actionDescription}
                  onChange={(e) => setActionDescription(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title || !description || isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Proposal'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Loading Skeleton
 */
function GovernanceInterfaceSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
      </div>
      <Separator />
      <div className="space-y-4">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
      </div>
    </div>
  );
}
