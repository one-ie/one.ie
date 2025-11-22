/**
 * RefundModal - Modal for processing refunds
 *
 * Features:
 * - Full refund option
 * - Partial refund with amount input
 * - Refund reason dropdown
 * - Notes/comments field
 * - Real-time validation
 *
 * @see /backend/convex/mutations/payments.ts - processRefund mutation
 */

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Alert, AlertDescription } from "../ui/alert";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId: Id<"things">;
  paymentAmount: number;
  currency: string;
  paymentName: string;
}

type RefundReason =
  | "duplicate"
  | "fraudulent"
  | "requested_by_customer"
  | "other";

export default function RefundModal({
  isOpen,
  onClose,
  paymentId,
  paymentAmount,
  currency,
  paymentName,
}: RefundModalProps) {
  const [refundType, setRefundType] = useState<"full" | "partial">("full");
  const [partialAmount, setPartialAmount] = useState("");
  const [reason, setReason] = useState<RefundReason>("requested_by_customer");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const processRefund = useMutation(api.mutations.payments.processRefund);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Stripe amounts are in cents
  };

  const validatePartialAmount = () => {
    const amount = parseFloat(partialAmount);
    if (isNaN(amount) || amount <= 0) {
      return "Amount must be greater than 0";
    }
    if (amount > paymentAmount / 100) {
      return `Amount cannot exceed ${formatCurrency(paymentAmount)}`;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validate partial amount if applicable
    if (refundType === "partial") {
      const validationError = validatePartialAmount();
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    try {
      const refundAmount =
        refundType === "partial"
          ? Math.round(parseFloat(partialAmount) * 100) // Convert to cents
          : undefined; // Full refund

      await processRefund({
        paymentId,
        amount: refundAmount,
        reason,
        notes: notes || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
        // Reset form
        setRefundType("full");
        setPartialAmount("");
        setReason("requested_by_customer");
        setNotes("");
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to process refund"
      );
    }
  };

  const handleClose = () => {
    if (!success) {
      setRefundType("full");
      setPartialAmount("");
      setReason("requested_by_customer");
      setNotes("");
      setError("");
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Process Refund</DialogTitle>
          <DialogDescription>
            Refund payment for: {paymentName}
            <br />
            Original amount: {formatCurrency(paymentAmount)}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Refund Type */}
          <div className="space-y-2">
            <Label>Refund Type</Label>
            <Select
              value={refundType}
              onValueChange={(value: "full" | "partial") =>
                setRefundType(value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">
                  Full Refund ({formatCurrency(paymentAmount)})
                </SelectItem>
                <SelectItem value="partial">Partial Refund</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Partial Amount Input */}
          {refundType === "partial" && (
            <div className="space-y-2">
              <Label htmlFor="partialAmount">Refund Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {currency.toUpperCase()}
                </span>
                <Input
                  id="partialAmount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={(paymentAmount / 100).toString()}
                  value={partialAmount}
                  onChange={(e) => setPartialAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-16"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Maximum: {formatCurrency(paymentAmount)}
              </p>
            </div>
          )}

          {/* Refund Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Select
              value={reason}
              onValueChange={(value: RefundReason) => setReason(value)}
            >
              <SelectTrigger id="reason">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="requested_by_customer">
                  Requested by Customer
                </SelectItem>
                <SelectItem value="duplicate">Duplicate Payment</SelectItem>
                <SelectItem value="fraudulent">Fraudulent</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes about this refund..."
              rows={3}
            />
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                Refund processed successfully!
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={success}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={success}>
              {success ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Refunded
                </>
              ) : (
                <>
                  {refundType === "full" ? "Refund " : "Refund "}
                  {refundType === "full"
                    ? formatCurrency(paymentAmount)
                    : partialAmount
                      ? formatCurrency(parseFloat(partialAmount) * 100)
                      : "Amount"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
