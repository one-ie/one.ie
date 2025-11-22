/**
 * ContractInteraction Component
 *
 * Interact with smart contract functions.
 * Uses 6-token design system with function selector.
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ContractFunction {
  name: string;
  inputs: { name: string; type: string }[];
  outputs?: { name: string; type: string }[];
  stateMutability: "view" | "pure" | "nonpayable" | "payable";
}

interface ContractInteractionProps {
  contractName: string;
  functions: ContractFunction[];
  onExecute?: (func: ContractFunction, args: any[]) => Promise<any>;
  className?: string;
}

export function ContractInteraction({
  contractName,
  functions,
  onExecute,
  className,
}: ContractInteractionProps) {
  const [selectedFunction, setSelectedFunction] = useState<ContractFunction | null>(
    functions[0] || null
  );
  const [args, setArgs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecute = async () => {
    if (!selectedFunction || !onExecute) return;

    const argValues = selectedFunction.inputs.map((input) => args[input.name] || "");

    setIsExecuting(true);
    setResult(null);
    try {
      const output = await onExecute(selectedFunction, argValues);
      setResult(output);
    } catch (error: any) {
      setResult({ error: error.message || "Execution failed" });
    } finally {
      setIsExecuting(false);
    }
  };

  const isReadOnly =
    selectedFunction?.stateMutability === "view" ||
    selectedFunction?.stateMutability === "pure";

  return (
    <Card className={`bg-background p-1 shadow-sm rounded-md ${className || ""}`}>
      <CardContent className="bg-foreground p-4 rounded-md">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-font text-lg">
            Interact with {contractName}
          </CardTitle>
          <p className="text-font/60 text-sm">Call contract functions</p>
        </CardHeader>

        {/* Function Selector */}
        <div className="mb-4">
          <Label className="text-font text-sm mb-2 block">Select Function</Label>
          <Select
            value={selectedFunction?.name}
            onValueChange={(name) => {
              const func = functions.find((f) => f.name === name);
              setSelectedFunction(func || null);
              setArgs({});
              setResult(null);
            }}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Choose a function" />
            </SelectTrigger>
            <SelectContent>
              {functions.map((func) => (
                <SelectItem key={func.name} value={func.name}>
                  <div className="flex items-center gap-2">
                    <span>{func.name}</span>
                    <Badge
                      variant="secondary"
                      className={
                        isReadOnly ? "bg-tertiary text-white" : "bg-primary text-white"
                      }
                    >
                      {func.stateMutability}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedFunction && (
          <>
            {/* Function Inputs */}
            {selectedFunction.inputs.length > 0 && (
              <div className="space-y-3 mb-4">
                {selectedFunction.inputs.map((input) => (
                  <div key={input.name}>
                    <Label htmlFor={input.name} className="text-font text-sm mb-2 block">
                      {input.name} ({input.type})
                    </Label>
                    <Input
                      id={input.name}
                      placeholder={`Enter ${input.type}`}
                      value={args[input.name] || ""}
                      onChange={(e) =>
                        setArgs({ ...args, [input.name]: e.target.value })
                      }
                      className="bg-background font-mono"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Execute Button */}
            <Button
              variant="primary"
              className="w-full mb-4"
              onClick={handleExecute}
              disabled={isExecuting}
            >
              {isExecuting
                ? "Executing..."
                : isReadOnly
                ? "Query"
                : "Execute Transaction"}
            </Button>

            {/* Result */}
            {result && (
              <div
                className={`rounded-md p-3 ${
                  result.error
                    ? "bg-destructive/10 border border-destructive/20"
                    : "bg-tertiary/10 border border-tertiary/20"
                }`}
              >
                <div className="text-sm font-medium mb-2">
                  {result.error ? "Error" : "Result"}
                </div>
                <pre className="text-xs font-mono break-all">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </>
        )}

        {!selectedFunction && (
          <div className="bg-background rounded-md p-8 text-center">
            <p className="text-font/60">Select a function to interact</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
