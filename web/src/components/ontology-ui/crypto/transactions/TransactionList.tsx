/**
 * TransactionList Component
 *
 * Displays a list of transactions with filtering and sorting.
 * Uses 6-token design system.
 */

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransactionCard, type Transaction } from "./TransactionCard";
import { Badge } from "@/components/ui/badge";

interface TransactionListProps {
  transactions: Transaction[];
  onViewDetails?: (hash: string) => void;
  className?: string;
}

export function TransactionList({
  transactions,
  onViewDetails,
  className,
}: TransactionListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.to.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || tx.status === statusFilter;
    const matchesType = typeFilter === "all" || tx.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Count by status
  const statusCounts = transactions.reduce(
    (acc, tx) => {
      acc[tx.status] = (acc[tx.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className={className}>
      {/* Header with filters */}
      <div className="bg-background p-4 rounded-md mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-font font-semibold text-xl">
            Transactions ({filteredTransactions.length})
          </h2>
          <div className="flex gap-2">
            {statusCounts.pending > 0 && (
              <Badge variant="secondary">
                {statusCounts.pending} pending
              </Badge>
            )}
            {statusCounts.failed > 0 && (
              <Badge className="bg-destructive text-white">
                {statusCounts.failed} failed
              </Badge>
            )}
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Search by hash or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-foreground font-mono text-sm"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-32 bg-foreground">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-32 bg-foreground">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="send">Send</SelectItem>
              <SelectItem value="receive">Receive</SelectItem>
              <SelectItem value="swap">Swap</SelectItem>
              <SelectItem value="approve">Approve</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Transaction List */}
      {filteredTransactions.length === 0 ? (
        <div className="bg-background p-8 rounded-md text-center">
          <p className="text-font/60">No transactions found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTransactions.map((tx) => (
            <TransactionCard
              key={tx.hash}
              transaction={tx}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
}
