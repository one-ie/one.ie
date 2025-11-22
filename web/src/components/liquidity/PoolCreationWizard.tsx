import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Check, ChevronLeft, ChevronRight, Info } from "lucide-react";

interface Token {
  id: string;
  symbol: string;
  name: string;
  icon?: string;
  balance: number;
  decimals: number;
}

interface PoolCreationWizardProps {
  tokens: Token[];
  onCreatePool?: (tokenA: string, tokenB: string, initialPriceA: string, amountA: string, amountB: string) => Promise<void>;
  onCancel?: () => void;
}

type Step = 1 | 2 | 3 | 4;

export function PoolCreationWizard({ tokens, onCreatePool, onCancel }: PoolCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isCreating, setIsCreating] = useState(false);

  // Step 1: Token Selection
  const [tokenA, setTokenA] = useState<Token | null>(null);
  const [tokenB, setTokenB] = useState<Token | null>(null);

  // Step 2: Initial Price
  const [initialPrice, setInitialPrice] = useState("");

  // Step 3: Initial Liquidity
  const [liquidityA, setLiquidityA] = useState("");
  const [liquidityB, setLiquidityB] = useState("");

  const steps = [
    { number: 1, title: "Select Tokens", description: "Choose token pair" },
    { number: 2, title: "Set Price", description: "Initial exchange rate" },
    { number: 3, title: "Add Liquidity", description: "Initial pool funding" },
    { number: 4, title: "Confirm", description: "Review and create" },
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handleCreatePool = async () => {
    if (!tokenA || !tokenB || !initialPrice || !liquidityA || !liquidityB) return;

    setIsCreating(true);
    try {
      await onCreatePool?.(tokenA.id, tokenB.id, initialPrice, liquidityA, liquidityB);
    } finally {
      setIsCreating(false);
    }
  };

  // Validation
  const canProceedStep1 = tokenA && tokenB && tokenA.id !== tokenB.id;
  const canProceedStep2 = initialPrice && parseFloat(initialPrice) > 0;
  const canProceedStep3 = liquidityA && liquidityB &&
    parseFloat(liquidityA) > 0 && parseFloat(liquidityB) > 0 &&
    parseFloat(liquidityA) <= (tokenA?.balance || 0) &&
    parseFloat(liquidityB) <= (tokenB?.balance || 0);

  // Calculate liquidity B based on price
  const updateLiquidityB = (amountA: string) => {
    setLiquidityA(amountA);
    if (initialPrice && amountA) {
      const price = parseFloat(initialPrice);
      const amount = parseFloat(amountA);
      if (!isNaN(price) && !isNaN(amount)) {
        setLiquidityB((amount * price).toFixed(6));
      }
    }
  };

  const progress = (currentStep / 4) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="space-y-4">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`flex items-center gap-2 ${
                currentStep >= step.number ? "opacity-100" : "opacity-40"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep > step.number
                    ? "bg-green-500 text-white"
                    : currentStep === step.number
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {currentStep > step.number ? <Check className="h-4 w-4" /> : step.number}
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-medium">{step.title}</div>
                <div className="text-xs text-muted-foreground">{step.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].title}</CardTitle>
        </CardHeader>

        <CardContent className="min-h-[300px]">
          {/* Step 1: Select Tokens */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Select two tokens to create a liquidity pool. Users will be able to swap between these tokens.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Token A</Label>
                  <Select
                    value={tokenA?.id}
                    onValueChange={(id) => setTokenA(tokens.find(t => t.id === id) || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select first token">
                        {tokenA && (
                          <div className="flex items-center gap-2">
                            {tokenA.icon && <img src={tokenA.icon} alt="" className="w-5 h-5" />}
                            <span className="font-medium">{tokenA.symbol}</span>
                            <span className="text-muted-foreground text-sm">— {tokenA.name}</span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {tokens.map((token) => (
                        <SelectItem key={token.id} value={token.id} disabled={token.id === tokenB?.id}>
                          <div className="flex items-center gap-2">
                            {token.icon && <img src={token.icon} alt="" className="w-5 h-5" />}
                            <div>
                              <div className="font-medium">{token.symbol}</div>
                              <div className="text-xs text-muted-foreground">{token.name}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Token B</Label>
                  <Select
                    value={tokenB?.id}
                    onValueChange={(id) => setTokenB(tokens.find(t => t.id === id) || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select second token">
                        {tokenB && (
                          <div className="flex items-center gap-2">
                            {tokenB.icon && <img src={tokenB.icon} alt="" className="w-5 h-5" />}
                            <span className="font-medium">{tokenB.symbol}</span>
                            <span className="text-muted-foreground text-sm">— {tokenB.name}</span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {tokens.map((token) => (
                        <SelectItem key={token.id} value={token.id} disabled={token.id === tokenA?.id}>
                          <div className="flex items-center gap-2">
                            {token.icon && <img src={token.icon} alt="" className="w-5 h-5" />}
                            <div>
                              <div className="font-medium">{token.symbol}</div>
                              <div className="text-xs text-muted-foreground">{token.name}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {tokenA && tokenB && (
                  <div className="p-4 rounded-lg border bg-muted/50">
                    <div className="text-sm font-medium mb-2">Pool Pair</div>
                    <Badge variant="outline" className="text-base">
                      {tokenA.symbol} / {tokenB.symbol}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Set Initial Price */}
          {currentStep === 2 && tokenA && tokenB && (
            <div className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Set the initial exchange rate for your pool. This determines how many {tokenB.symbol} tokens equal one {tokenA.symbol} token.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Initial Price</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">1 {tokenA.symbol} =</span>
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={initialPrice}
                      onChange={(e) => setInitialPrice(e.target.value)}
                      className="max-w-[200px]"
                    />
                    <span className="text-sm text-muted-foreground">{tokenB.symbol}</span>
                  </div>
                </div>

                {initialPrice && parseFloat(initialPrice) > 0 && (
                  <>
                    <Separator />
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 space-y-2">
                      <div className="text-sm font-medium text-blue-900 dark:text-blue-100">Exchange Rates</div>
                      <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                        <div>1 {tokenA.symbol} = {parseFloat(initialPrice).toFixed(6)} {tokenB.symbol}</div>
                        <div>1 {tokenB.symbol} = {(1 / parseFloat(initialPrice)).toFixed(6)} {tokenA.symbol}</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Add Initial Liquidity */}
          {currentStep === 3 && tokenA && tokenB && initialPrice && (
            <div className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Add initial liquidity to your pool. The amounts must match the price ratio you set.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Amount {tokenA.symbol}</Label>
                    <span className="text-xs text-muted-foreground">
                      Balance: {tokenA.balance.toFixed(4)}
                    </span>
                  </div>
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={liquidityA}
                    onChange={(e) => updateLiquidityB(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Amount {tokenB.symbol}</Label>
                    <span className="text-xs text-muted-foreground">
                      Balance: {tokenB.balance.toFixed(4)}
                    </span>
                  </div>
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={liquidityB}
                    readOnly
                    className="bg-muted/50"
                  />
                </div>

                {liquidityA && liquidityB && (
                  <>
                    <Separator />
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price per {tokenA.symbol}</span>
                        <span className="font-medium">{parseFloat(initialPrice).toFixed(6)} {tokenB.symbol}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Your share</span>
                        <span className="font-medium">100%</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Confirm */}
          {currentStep === 4 && tokenA && tokenB && initialPrice && liquidityA && liquidityB && (
            <div className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Review your pool details before creating. This action cannot be undone.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="p-4 rounded-lg border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pool Pair</span>
                    <Badge variant="outline">{tokenA.symbol} / {tokenB.symbol}</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Initial Price</span>
                    <span className="font-medium">
                      1 {tokenA.symbol} = {parseFloat(initialPrice).toFixed(6)} {tokenB.symbol}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Initial {tokenA.symbol}</span>
                    <span className="font-medium">{parseFloat(liquidityA).toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Initial {tokenB.symbol}</span>
                    <span className="font-medium">{parseFloat(liquidityB).toFixed(6)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Your pool share</span>
                    <span className="font-medium">100%</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900">
                  <p className="text-sm text-yellow-900 dark:text-yellow-100">
                    Once created, the pool will be available for trading immediately. Make sure all details are correct.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? onCancel : handleBack}
            disabled={isCreating}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {currentStep === 1 ? "Cancel" : "Back"}
          </Button>

          <Button
            onClick={currentStep === 4 ? handleCreatePool : handleNext}
            disabled={
              isCreating ||
              (currentStep === 1 && !canProceedStep1) ||
              (currentStep === 2 && !canProceedStep2) ||
              (currentStep === 3 && !canProceedStep3)
            }
          >
            {isCreating ? (
              "Creating Pool..."
            ) : currentStep === 4 ? (
              "Create Pool"
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
