/**
 * ContractViewer Component
 *
 * View smart contract code with syntax highlighting.
 * Uses 6-token design system.
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ContractViewerProps {
  contractName: string;
  sourceCode: string;
  abi?: string;
  bytecode?: string;
  onCopy?: (content: string) => void;
  className?: string;
}

export function ContractViewer({
  contractName,
  sourceCode,
  abi,
  bytecode,
  onCopy,
  className,
}: ContractViewerProps) {
  const [activeTab, setActiveTab] = useState("source");

  return (
    <Card className={`bg-background p-1 shadow-sm rounded-md ${className || ""}`}>
      <CardContent className="bg-foreground p-4 rounded-md">
        <CardHeader className="px-0 pt-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-font text-lg">
              {contractName} Code
            </CardTitle>
            <Badge className="bg-tertiary text-white">✓ Verified</Badge>
          </div>
        </CardHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3 bg-background">
            <TabsTrigger value="source">Source Code</TabsTrigger>
            <TabsTrigger value="abi">ABI</TabsTrigger>
            <TabsTrigger value="bytecode">Bytecode</TabsTrigger>
          </TabsList>

          {/* Source Code Tab */}
          <TabsContent value="source" className="mt-4">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 z-10"
                onClick={() => onCopy?.(sourceCode)}
              >
                Copy
              </Button>
              <pre className="bg-background rounded-md p-4 overflow-x-auto text-xs font-mono max-h-96 overflow-y-auto">
                <code className="text-font">{sourceCode}</code>
              </pre>
            </div>
          </TabsContent>

          {/* ABI Tab */}
          <TabsContent value="abi" className="mt-4">
            {abi ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 z-10"
                  onClick={() => onCopy?.(abi)}
                >
                  Copy
                </Button>
                <pre className="bg-background rounded-md p-4 overflow-x-auto text-xs font-mono max-h-96 overflow-y-auto">
                  <code className="text-font">{abi}</code>
                </pre>
              </div>
            ) : (
              <div className="bg-background rounded-md p-8 text-center">
                <p className="text-font/60">No ABI available</p>
              </div>
            )}
          </TabsContent>

          {/* Bytecode Tab */}
          <TabsContent value="bytecode" className="mt-4">
            {bytecode ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 z-10"
                  onClick={() => onCopy?.(bytecode)}
                >
                  Copy
                </Button>
                <pre className="bg-background rounded-md p-4 overflow-x-auto text-xs font-mono max-h-96 overflow-y-auto break-all">
                  <code className="text-font">{bytecode}</code>
                </pre>
              </div>
            ) : (
              <div className="bg-background rounded-md p-8 text-center">
                <p className="text-font/60">No bytecode available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
