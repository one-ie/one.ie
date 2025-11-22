/**
 * TransactionBuilder Component
 *
 * Build and preview transactions before sending.
 * Uses 6-token design system with form validation.
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TransactionBuilderProps {
  onSubmit?: (tx: TransactionData) => Promise<void>;
  defaultRecipient?: string;
  defaultValue?: string;
  className?: string;
}

interface TransactionData {
  to: string;
  value: string;
  data?: string;
  gasLimit?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
}

export function TransactionBuilder({
  onSubmit,
  defaultRecipient = "",
  defaultValue = "",
  className,
}: TransactionBuilderProps) {
  const [txData, setTxData] = useState<TransactionData>({
    to: defaultRecipient,
    value: defaultValue,
    data: "",
    gasLimit: "21000",
    maxFeePerGas: "",
    maxPriorityFeePerGas: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const handleSubmit = async () => {
    if (!onSubmit) return;

    setIsSubmitting(true);
    try {
      await onSubmit(txData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = txData.to && txData.value;

  return (
    <Card className={`bg-background p-1 shadow-sm rounded-md ${className || ""}`}>
      <CardContent className="bg-foreground p-4 rounded-md">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-font text-lg">Build Transaction</CardTitle>
          <p className="text-font/60 text-sm">
            Configure your transaction parameters
          </p>
        </CardHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-background">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* Basic Tab */}
          <TabsContent value="basic" className="space-y-4 mt-4">
            {/* Recipient */}
            <div>
              <Label htmlFor="to" className="text-font text-sm mb-2 block">
                Recipient Address
              </Label>
              <Input
                id="to"
                placeholder="0x..."
                value={txData.to}
                onChange={(e) => setTxData({ ...txData, to: e.target.value })}
                className="bg-background text-font font-mono"
              />
            </div>

            {/* Value */}
            <div>
              <Label htmlFor="value" className="text-font text-sm mb-2 block">
                Amount (ETH)
              </Label>
              <Input
                id="value"
                type="number"
                step="0.000001"
                placeholder="0.0"
                value={txData.value}
                onChange={(e) =>
                  setTxData({ ...txData, value: e.target.value })
                }
                className="bg-background text-font"
              />
            </div>

            {/* Data (optional) */}
            <div>
              <Label htmlFor="data" className="text-font text-sm mb-2 block">
                Data (optional)
              </Label>
              <Textarea
                id="data"
                placeholder="0x..."
                value={txData.data}
                onChange={(e) => setTxData({ ...txData, data: e.target.value })}
                rows={3}
                className="bg-background text-font font-mono text-sm"
              />
              <p className="text-font/60 text-xs mt-1">
                Leave empty for simple transfers
              </p>
            </div>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-4 mt-4">
            {/* Gas Limit */}
            <div>
              <Label htmlFor="gasLimit" className="text-font text-sm mb-2 block">
                Gas Limit
              </Label>
              <Input
                id="gasLimit"
                type="number"
                placeholder="21000"
                value={txData.gasLimit}
                onChange={(e) =>
                  setTxData({ ...txData, gasLimit: e.target.value })
                }
                className="bg-background text-font font-mono"
              />
            </div>

            {/* Max Fee Per Gas */}
            <div>
              <Label
                htmlFor="maxFeePerGas"
                className="text-font text-sm mb-2 block"
              >
                Max Fee Per Gas (Gwei)
              </Label>
              <Input
                id="maxFeePerGas"
                type="number"
                step="0.1"
                placeholder="Auto"
                value={txData.maxFeePerGas}
                onChange={(e) =>
                  setTxData({ ...txData, maxFeePerGas: e.target.value })
                }
                className="bg-background text-font"
              />
            </div>

            {/* Max Priority Fee Per Gas */}
            <div>
              <Label
                htmlFor="maxPriorityFeePerGas"
                className="text-font text-sm mb-2 block"
              >
                Max Priority Fee (Gwei)
              </Label>
              <Input
                id="maxPriorityFeePerGas"
                type="number"
                step="0.1"
                placeholder="Auto"
                value={txData.maxPriorityFeePerGas}
                onChange={(e) =>
                  setTxData({ ...txData, maxPriorityFeePerGas: e.target.value })
                }
                className="bg-background text-font"
              />
              <p className="text-font/60 text-xs mt-1">
                Leave empty to use network recommendations
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="my-4" />

        {/* Preview */}
        <div className="bg-background rounded-md p-3 mb-4">
          <div className="text-font/60 text-xs mb-2">Transaction Summary</div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-font/60">Sending:</span>
              <Badge variant="secondary">
                {txData.value || "0"} ETH
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-font/60">To:</span>
              <span className="text-font font-mono text-xs truncate max-w-[200px]">
                {txData.to || "Not set"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-font/60">Estimated Gas:</span>
              <span className="text-font">
                ~{txData.gasLimit || "21000"} units
              </span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <Button
          variant="primary"
          className="w-full"
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? "Building..." : "Build & Send Transaction"}
        </Button>
      </CardContent>
    </Card>
  );
}
