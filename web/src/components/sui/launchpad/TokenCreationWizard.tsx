/**
 * TokenCreationWizard - Multi-step wizard for creating Sui tokens
 *
 * A comprehensive token creation flow with:
 * - 5 steps: Basic Info, Tokenomics, Vesting, Governance, Review
 * - Template selector for different token types
 * - Distribution pie chart preview
 * - Form validation with React Hook Form + Zod
 * - Convex mutations for token creation
 * - Loading states and error handling
 *
 * @component
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// Icons
import {
  Coins,
  PieChartIcon,
  Lock,
  Vote,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Info,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

// Types
type TokenTemplate =
  | "standard"
  | "team-vesting"
  | "fair-launch"
  | "dao"
  | "ai-agent"
  | "revenue-share";

interface DistributionItem {
  name: string;
  percentage: number;
  amount: string;
  color: string;
}

interface TokenFormData {
  // Step 1: Basic Info
  name: string;
  symbol: string;
  decimals: number;
  description?: string;
  logoUrl?: string;
  website?: string;
  twitter?: string;
  telegram?: string;

  // Step 2: Tokenomics
  totalSupply: string;
  template: TokenTemplate;
  distribution: DistributionItem[];

  // Step 3: Vesting (optional)
  vestingEnabled: boolean;
  teamAllocation?: string;
  cliffDuration?: number;
  vestingDuration?: number;

  // Step 4: Governance (optional)
  daoEnabled: boolean;
  votingPeriod?: number;
  quorum?: string;
  threshold?: string;

  // Network
  network: "mainnet" | "testnet" | "devnet";
}

// Zod validation schema
const tokenFormSchema = z.object({
  // Step 1
  name: z.string().min(1, "Token name is required").max(100),
  symbol: z.string().min(1, "Symbol is required").max(10).toUpperCase(),
  decimals: z.number().min(0).max(18).default(9),
  description: z.string().optional(),
  logoUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  twitter: z.string().optional(),
  telegram: z.string().optional(),

  // Step 2
  totalSupply: z.string().min(1, "Total supply is required"),
  template: z.enum([
    "standard",
    "team-vesting",
    "fair-launch",
    "dao",
    "ai-agent",
    "revenue-share",
  ]),
  distribution: z.array(
    z.object({
      name: z.string(),
      percentage: z.number().min(0).max(100),
      amount: z.string(),
      color: z.string(),
    })
  ),

  // Step 3
  vestingEnabled: z.boolean().default(false),
  teamAllocation: z.string().optional(),
  cliffDuration: z.number().optional(),
  vestingDuration: z.number().optional(),

  // Step 4
  daoEnabled: z.boolean().default(false),
  votingPeriod: z.number().optional(),
  quorum: z.string().optional(),
  threshold: z.string().optional(),

  network: z.enum(["mainnet", "testnet", "devnet"]).default("testnet"),
});

// Template configurations
const TEMPLATES: Record<
  TokenTemplate,
  {
    name: string;
    description: string;
    distribution: Omit<DistributionItem, "amount">[];
    vestingEnabled: boolean;
    daoEnabled: boolean;
  }
> = {
  standard: {
    name: "Standard Token",
    description: "Basic token with simple distribution",
    distribution: [
      { name: "Public Sale", percentage: 40, color: "#3b82f6" },
      { name: "Team", percentage: 20, color: "#8b5cf6" },
      { name: "Treasury", percentage: 30, color: "#10b981" },
      { name: "Marketing", percentage: 10, color: "#f59e0b" },
    ],
    vestingEnabled: false,
    daoEnabled: false,
  },
  "team-vesting": {
    name: "Team Vesting",
    description: "Token with team allocation and vesting schedule",
    distribution: [
      { name: "Public Sale", percentage: 50, color: "#3b82f6" },
      { name: "Team (Vested)", percentage: 25, color: "#8b5cf6" },
      { name: "Advisors (Vested)", percentage: 15, color: "#ec4899" },
      { name: "Treasury", percentage: 10, color: "#10b981" },
    ],
    vestingEnabled: true,
    daoEnabled: false,
  },
  "fair-launch": {
    name: "Fair Launch",
    description: "100% public distribution, no team allocation",
    distribution: [
      { name: "Public Sale", percentage: 70, color: "#3b82f6" },
      { name: "Liquidity Pool", percentage: 20, color: "#10b981" },
      { name: "Community Treasury", percentage: 10, color: "#f59e0b" },
    ],
    vestingEnabled: false,
    daoEnabled: true,
  },
  dao: {
    name: "DAO Governed",
    description: "Community-governed token with voting",
    distribution: [
      { name: "Public Sale", percentage: 45, color: "#3b82f6" },
      { name: "DAO Treasury", percentage: 35, color: "#10b981" },
      { name: "Team", percentage: 15, color: "#8b5cf6" },
      { name: "Liquidity", percentage: 5, color: "#f59e0b" },
    ],
    vestingEnabled: true,
    daoEnabled: true,
  },
  "ai-agent": {
    name: "AI Agent Token",
    description: "Token for AI agent marketplace",
    distribution: [
      { name: "Public Sale", percentage: 30, color: "#3b82f6" },
      { name: "Agent Rewards", percentage: 40, color: "#8b5cf6" },
      { name: "Development", percentage: 20, color: "#10b981" },
      { name: "Marketing", percentage: 10, color: "#f59e0b" },
    ],
    vestingEnabled: true,
    daoEnabled: true,
  },
  "revenue-share": {
    name: "Revenue Share",
    description: "Token with revenue distribution mechanism",
    distribution: [
      { name: "Public Sale", percentage: 40, color: "#3b82f6" },
      { name: "Revenue Pool", percentage: 30, color: "#10b981" },
      { name: "Team", percentage: 20, color: "#8b5cf6" },
      { name: "Operations", percentage: 10, color: "#f59e0b" },
    ],
    vestingEnabled: true,
    daoEnabled: false,
  },
};

// Chart colors
const CHART_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#06b6d4",
];

interface TokenCreationWizardProps {
  groupId: string;
  onSuccess?: (tokenId: string) => void;
  onCancel?: () => void;
}

export function TokenCreationWizard({
  groupId,
  onSuccess,
  onCancel,
}: TokenCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdTokenId, setCreatedTokenId] = useState<string>("");

  // Convex mutations
  const createToken = useMutation(api.mutations.sui.tokens.create);

  // Form state
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TokenFormData>({
    resolver: zodResolver(tokenFormSchema),
    defaultValues: {
      decimals: 9,
      network: "testnet",
      template: "standard",
      distribution: TEMPLATES.standard.distribution.map((d) => ({
        ...d,
        amount: "0",
      })),
      vestingEnabled: false,
      daoEnabled: false,
    },
  });

  const formData = watch();

  // Calculate distribution amounts based on total supply
  const calculateDistribution = (totalSupply: string, template: TokenTemplate) => {
    const supply = BigInt(totalSupply || "0");
    const templateConfig = TEMPLATES[template];

    return templateConfig.distribution.map((item) => ({
      ...item,
      amount: ((supply * BigInt(item.percentage)) / BigInt(100)).toString(),
    }));
  };

  // Update distribution when supply or template changes
  const handleTemplateChange = (template: TokenTemplate) => {
    setValue("template", template);
    const templateConfig = TEMPLATES[template];
    setValue("vestingEnabled", templateConfig.vestingEnabled);
    setValue("daoEnabled", templateConfig.daoEnabled);

    if (formData.totalSupply) {
      const distribution = calculateDistribution(formData.totalSupply, template);
      setValue("distribution", distribution);
    }
  };

  const handleSupplyChange = (supply: string) => {
    setValue("totalSupply", supply);
    if (formData.template) {
      const distribution = calculateDistribution(supply, formData.template);
      setValue("distribution", distribution);
    }
  };

  // Form submission
  const onSubmit = async (data: TokenFormData) => {
    try {
      const tokenId = await createToken({
        groupId: groupId as any,
        name: data.name,
        symbol: data.symbol,
        decimals: data.decimals,
        totalSupply: data.totalSupply,
        network: data.network,
        description: data.description,
        logoUrl: data.logoUrl,
        website: data.website,
        twitter: data.twitter,
        telegram: data.telegram,
      });

      setCreatedTokenId(tokenId);
      setShowSuccess(true);
      toast.success("Token created successfully!");

      if (onSuccess) {
        onSuccess(tokenId);
      }
    } catch (error: any) {
      console.error("Token creation failed:", error);
      toast.error(error.message || "Failed to create token");
    }
  };

  // Step navigation
  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.symbol && formData.decimals !== undefined;
      case 2:
        return formData.totalSupply && formData.template;
      case 3:
        return true; // Optional step
      case 4:
        return true; // Optional step
      case 5:
        return true;
      default:
        return false;
    }
  };

  const stepTitles = [
    { number: 1, title: "Basic Info", icon: Coins },
    { number: 2, title: "Tokenomics", icon: PieChartIcon },
    { number: 3, title: "Vesting", icon: Lock },
    { number: 4, title: "Governance", icon: Vote },
    { number: 5, title: "Review", icon: CheckCircle2 },
  ];

  const progressPercentage = (currentStep / 5) * 100;

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-2xl">Create Token</CardTitle>
            <Badge variant="outline">{formData.network}</Badge>
          </div>

          {/* Progress bar */}
          <Progress value={progressPercentage} className="h-2" />

          {/* Step indicators */}
          <div className="flex justify-between mt-6">
            {stepTitles.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isComplete = currentStep > step.number;

              return (
                <div
                  key={step.number}
                  className={`flex flex-col items-center gap-2 ${
                    isActive ? "opacity-100" : "opacity-50"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isComplete
                        ? "bg-green-500 text-white"
                        : isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className="text-xs font-medium">{step.title}</span>
                </div>
              );
            })}
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {/* STEP 1: Basic Info */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Token Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="My Token"
                      {...register("name")}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="symbol">
                        Symbol <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="symbol"
                        placeholder="MTK"
                        maxLength={10}
                        {...register("symbol")}
                        onChange={(e) => {
                          e.target.value = e.target.value.toUpperCase();
                          register("symbol").onChange(e);
                        }}
                      />
                      {errors.symbol && (
                        <p className="text-sm text-destructive">
                          {errors.symbol.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="decimals">
                        Decimals <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="decimals"
                        type="number"
                        min={0}
                        max={18}
                        {...register("decimals", { valueAsNumber: true })}
                      />
                      {errors.decimals && (
                        <p className="text-sm text-destructive">
                          {errors.decimals.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your token..."
                      rows={3}
                      {...register("description")}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold">Social Links (Optional)</h3>

                    <div className="space-y-2">
                      <Label htmlFor="logoUrl">Logo URL</Label>
                      <Input
                        id="logoUrl"
                        type="url"
                        placeholder="https://example.com/logo.png"
                        {...register("logoUrl")}
                      />
                      {errors.logoUrl && (
                        <p className="text-sm text-destructive">
                          {errors.logoUrl.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        placeholder="https://example.com"
                        {...register("website")}
                      />
                      {errors.website && (
                        <p className="text-sm text-destructive">
                          {errors.website.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="twitter">Twitter Handle</Label>
                        <Input
                          id="twitter"
                          placeholder="@mytoken"
                          {...register("twitter")}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="telegram">Telegram</Label>
                        <Input
                          id="telegram"
                          placeholder="@mytokenchat"
                          {...register("telegram")}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Tokenomics */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <Label htmlFor="totalSupply">
                      Total Supply <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="totalSupply"
                      placeholder="1000000000000000000"
                      {...register("totalSupply")}
                      onChange={(e) => handleSupplyChange(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter total supply in smallest unit (with decimals)
                    </p>
                    {errors.totalSupply && (
                      <p className="text-sm text-destructive">
                        {errors.totalSupply.message}
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label>Distribution Template</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(TEMPLATES).map(([key, template]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleTemplateChange(key as TokenTemplate)}
                          className={`p-4 border rounded-lg text-left hover:border-primary transition-colors ${
                            formData.template === key
                              ? "border-primary bg-primary/5"
                              : "border-border"
                          }`}
                        >
                          <h4 className="font-semibold text-sm">{template.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {template.description}
                          </p>
                          <div className="flex gap-2 mt-2">
                            {template.vestingEnabled && (
                              <Badge variant="secondary" className="text-xs">
                                Vesting
                              </Badge>
                            )}
                            {template.daoEnabled && (
                              <Badge variant="secondary" className="text-xs">
                                DAO
                              </Badge>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {formData.distribution && formData.distribution.length > 0 && (
                    <>
                      <Separator />

                      <div className="space-y-4">
                        <Label>Distribution Preview</Label>

                        <div className="grid grid-cols-2 gap-6">
                          {/* Pie Chart */}
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={formData.distribution}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={(entry) => `${entry.percentage}%`}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="percentage"
                                >
                                  {formData.distribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Distribution Table */}
                          <div className="space-y-2">
                            {formData.distribution.map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 rounded bg-muted/50"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                  />
                                  <span className="text-sm font-medium">
                                    {item.name}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-semibold">
                                    {item.percentage}%
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {item.amount}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {/* STEP 3: Vesting */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-200">
                        Token Vesting (Optional)
                      </h4>
                      <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
                        Vesting locks tokens for a period and releases them gradually.
                        Recommended for team and advisor allocations.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Enable Vesting Schedule</Label>
                      <Button
                        type="button"
                        variant={formData.vestingEnabled ? "default" : "outline"}
                        size="sm"
                        onClick={() => setValue("vestingEnabled", !formData.vestingEnabled)}
                      >
                        {formData.vestingEnabled ? "Enabled" : "Disabled"}
                      </Button>
                    </div>

                    {formData.vestingEnabled && (
                      <>
                        <Separator />

                        <div className="space-y-2">
                          <Label htmlFor="teamAllocation">Team Allocation</Label>
                          <Input
                            id="teamAllocation"
                            placeholder="Amount to vest"
                            {...register("teamAllocation")}
                          />
                          <p className="text-xs text-muted-foreground">
                            Amount in smallest unit
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="cliffDuration">Cliff Duration (days)</Label>
                            <Input
                              id="cliffDuration"
                              type="number"
                              min={0}
                              placeholder="180"
                              {...register("cliffDuration", { valueAsNumber: true })}
                            />
                            <p className="text-xs text-muted-foreground">
                              No tokens released during cliff
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="vestingDuration">
                              Vesting Duration (days)
                            </Label>
                            <Input
                              id="vestingDuration"
                              type="number"
                              min={0}
                              placeholder="365"
                              {...register("vestingDuration", { valueAsNumber: true })}
                            />
                            <p className="text-xs text-muted-foreground">
                              Total vesting period
                            </p>
                          </div>
                        </div>

                        {formData.cliffDuration && formData.vestingDuration && (
                          <div className="p-4 bg-muted rounded-lg">
                            <h4 className="text-sm font-semibold mb-2">
                              Vesting Schedule Summary
                            </h4>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                              <li>
                                • Cliff: {formData.cliffDuration} days (no releases)
                              </li>
                              <li>
                                • Linear vesting: {formData.vestingDuration} days total
                              </li>
                              <li>
                                • Daily release:{" "}
                                {formData.teamAllocation
                                  ? (
                                      Number(formData.teamAllocation) /
                                      formData.vestingDuration
                                    ).toFixed(0)
                                  : "0"}{" "}
                                tokens
                              </li>
                            </ul>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              )}

              {/* STEP 4: Governance */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Info className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sm text-purple-900 dark:text-purple-200">
                        DAO Governance (Optional)
                      </h4>
                      <p className="text-sm text-purple-800 dark:text-purple-300 mt-1">
                        Enable on-chain governance for token holders to vote on proposals
                        and control the treasury.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Enable DAO Governance</Label>
                      <Button
                        type="button"
                        variant={formData.daoEnabled ? "default" : "outline"}
                        size="sm"
                        onClick={() => setValue("daoEnabled", !formData.daoEnabled)}
                      >
                        {formData.daoEnabled ? "Enabled" : "Disabled"}
                      </Button>
                    </div>

                    {formData.daoEnabled && (
                      <>
                        <Separator />

                        <div className="space-y-2">
                          <Label htmlFor="votingPeriod">Voting Period (hours)</Label>
                          <Input
                            id="votingPeriod"
                            type="number"
                            min={1}
                            placeholder="72"
                            {...register("votingPeriod", { valueAsNumber: true })}
                          />
                          <p className="text-xs text-muted-foreground">
                            How long proposals remain open for voting
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="quorum">Quorum (tokens)</Label>
                            <Input
                              id="quorum"
                              placeholder="1000000"
                              {...register("quorum")}
                            />
                            <p className="text-xs text-muted-foreground">
                              Minimum tokens needed to vote
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="threshold">Approval Threshold (%)</Label>
                            <Input
                              id="threshold"
                              type="number"
                              min={1}
                              max={100}
                              placeholder="51"
                              {...register("threshold")}
                            />
                            <p className="text-xs text-muted-foreground">
                              % of votes needed to pass
                            </p>
                          </div>
                        </div>

                        <div className="p-4 bg-muted rounded-lg">
                          <h4 className="text-sm font-semibold mb-2">
                            Governance Rules Summary
                          </h4>
                          <ul className="text-sm space-y-1 text-muted-foreground">
                            <li>
                              • Voting period: {formData.votingPeriod || 72} hours
                            </li>
                            <li>• Quorum: {formData.quorum || "1000000"} tokens</li>
                            <li>
                              • Threshold: {formData.threshold || "51"}% approval
                              required
                            </li>
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}

              {/* STEP 5: Review & Deploy */}
              {currentStep === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sm text-green-900 dark:text-green-200">
                        Review Your Token
                      </h4>
                      <p className="text-sm text-green-800 dark:text-green-300 mt-1">
                        Please review all details before deploying to the blockchain.
                        This action cannot be undone.
                      </p>
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Token Name</p>
                        <p className="font-medium">{formData.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Symbol</p>
                        <p className="font-medium">{formData.symbol}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Decimals</p>
                        <p className="font-medium">{formData.decimals}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Network</p>
                        <Badge variant="outline">{formData.network}</Badge>
                      </div>
                    </div>
                    {formData.description && (
                      <div>
                        <p className="text-xs text-muted-foreground">Description</p>
                        <p className="text-sm">{formData.description}</p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Tokenomics */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm">Tokenomics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Total Supply</p>
                        <p className="font-medium">{formData.totalSupply}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Template</p>
                        <p className="font-medium">
                          {TEMPLATES[formData.template]?.name}
                        </p>
                      </div>
                    </div>
                    {formData.distribution && formData.distribution.length > 0 && (
                      <div className="space-y-2">
                        {formData.distribution.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 rounded bg-muted/50 text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                              <span>{item.name}</span>
                            </div>
                            <span className="font-medium">{item.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {formData.vestingEnabled && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <h3 className="font-semibold text-sm">Vesting Schedule</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Team Allocation
                            </p>
                            <p className="font-medium">{formData.teamAllocation}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Cliff Duration
                            </p>
                            <p className="font-medium">
                              {formData.cliffDuration} days
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Vesting Duration
                            </p>
                            <p className="font-medium">
                              {formData.vestingDuration} days
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {formData.daoEnabled && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <h3 className="font-semibold text-sm">Governance</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Voting Period
                            </p>
                            <p className="font-medium">
                              {formData.votingPeriod} hours
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Quorum</p>
                            <p className="font-medium">{formData.quorum} tokens</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Threshold</p>
                            <p className="font-medium">{formData.threshold}%</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sm text-yellow-900 dark:text-yellow-200">
                        Important
                      </h4>
                      <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
                        Once deployed, token details cannot be changed. Please verify
                        all information is correct.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={currentStep === 1 ? onCancel : prevStep}
              disabled={isSubmitting}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentStep === 1 ? "Cancel" : "Previous"}
            </Button>

            {currentStep < 5 ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!canProceed() || isSubmitting}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Token...
                  </>
                ) : (
                  <>
                    <Coins className="h-4 w-4 mr-2" />
                    Deploy Token
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-center text-xl">
              Token Created Successfully!
            </DialogTitle>
            <DialogDescription className="text-center">
              Your token has been deployed to the {formData.network} network.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{formData.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Symbol:</span>
                <span className="font-medium">{formData.symbol}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Supply:</span>
                <span className="font-medium">{formData.totalSupply}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Token ID:</span>
                <span className="font-mono text-xs">{createdTokenId}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" asChild>
                <a href={`/sui/tokens/${createdTokenId}`} target="_blank">
                  View Token
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
              <Button variant="outline" className="flex-1">
                Share
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowSuccess(false)} className="w-full">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
