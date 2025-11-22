/**
 * Onboarding Checklist Component
 *
 * Displays a checklist of onboarding tasks with progress tracking.
 * Helps users complete setup and learn key features.
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Circle, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action?: {
    label: string;
    href: string;
  };
  category: "setup" | "learn" | "customize" | "integrate";
}

const INITIAL_CHECKLIST: ChecklistItem[] = [
  {
    id: "complete-profile",
    title: "Complete your profile",
    description: "Add your business information and branding",
    completed: false,
    action: {
      label: "Go to Settings",
      href: "/settings/profile",
    },
    category: "setup",
  },
  {
    id: "create-funnel",
    title: "Create your first funnel",
    description: "Build a funnel using our templates or from scratch",
    completed: false,
    action: {
      label: "Create Funnel",
      href: "/funnels/create",
    },
    category: "setup",
  },
  {
    id: "customize-domain",
    title: "Set up custom domain",
    description: "Connect your own domain for professional branding",
    completed: false,
    action: {
      label: "Add Domain",
      href: "/settings/domains",
    },
    category: "customize",
  },
  {
    id: "watch-tutorial",
    title: "Watch funnel builder tutorial",
    description: "Learn how to use the drag-and-drop builder",
    completed: false,
    action: {
      label: "Watch Video",
      href: "/help/tutorials/builder",
    },
    category: "learn",
  },
  {
    id: "add-payment",
    title: "Connect payment provider",
    description: "Set up Stripe or PayPal to accept payments",
    completed: false,
    action: {
      label: "Connect",
      href: "/settings/integrations",
    },
    category: "integrate",
  },
  {
    id: "setup-email",
    title: "Configure email integration",
    description: "Connect your email service for automated follow-ups",
    completed: false,
    action: {
      label: "Setup Email",
      href: "/settings/integrations",
    },
    category: "integrate",
  },
  {
    id: "publish-funnel",
    title: "Publish your first funnel",
    description: "Make your funnel live and start collecting leads",
    completed: false,
    action: {
      label: "Publish",
      href: "/funnels",
    },
    category: "setup",
  },
  {
    id: "invite-team",
    title: "Invite team members",
    description: "Collaborate with your team on funnel creation",
    completed: false,
    action: {
      label: "Invite",
      href: "/settings/team",
    },
    category: "customize",
  },
];

const CATEGORY_LABELS = {
  setup: "Getting Started",
  learn: "Learn the Basics",
  customize: "Customization",
  integrate: "Integrations",
};

export function OnboardingChecklist() {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);

  // Load checklist from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("onboardingChecklist");
    if (saved) {
      setChecklist(JSON.parse(saved));
    } else {
      setChecklist(INITIAL_CHECKLIST);
    }
  }, []);

  // Save checklist to localStorage whenever it changes
  useEffect(() => {
    if (checklist.length > 0) {
      localStorage.setItem("onboardingChecklist", JSON.stringify(checklist));
    }
  }, [checklist]);

  const toggleItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const completedCount = checklist.filter((item) => item.completed).length;
  const totalCount = checklist.length;
  const progress = (completedCount / totalCount) * 100;

  // Group items by category
  const groupedItems = checklist.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  return (
    <Card className="w-full">
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle>Onboarding Checklist</CardTitle>
              <Badge variant={progress === 100 ? "default" : "secondary"}>
                {completedCount}/{totalCount}
              </Badge>
            </div>
            <CardDescription className="mt-2">
              Complete these tasks to get the most out of ONE Funnels
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
              </h3>
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-start gap-3 rounded-lg border p-4 transition-colors ${
                      item.completed
                        ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950"
                        : "border-border bg-card"
                    }`}
                  >
                    <Checkbox
                      id={item.id}
                      checked={item.completed}
                      onCheckedChange={() => toggleItem(item.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-1">
                      <label
                        htmlFor={item.id}
                        className={`cursor-pointer text-sm font-medium ${
                          item.completed ? "line-through" : ""
                        }`}
                      >
                        {item.title}
                      </label>
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    {item.action && !item.completed && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = item.action.href}
                      >
                        {item.action.label}
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </Button>
                    )}
                    {item.completed && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {progress === 100 && (
            <div className="rounded-lg bg-primary/10 p-4 text-center">
              <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-primary" />
              <p className="font-medium text-primary">
                Congratulations! You've completed onboarding 🎉
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                You're all set to build amazing funnels
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
