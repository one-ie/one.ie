/**
 * ConditionalLogicBuilder - Visual rule builder for form conditional logic
 *
 * Features:
 * - Drag-and-drop rule ordering (future)
 * - Visual condition builder with dropdowns
 * - AND/OR logic toggle
 * - Multiple actions per rule
 * - Real-time preview
 * - Rule validation
 */

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Trash2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react";
import type {
  ConditionalRule,
  Condition,
  Action,
  ConditionalOperator,
  ConditionalAction,
  LogicOperator,
} from "@/lib/forms/conditional-logic";
import {
  createEmptyRule,
  createEmptyCondition,
  createEmptyAction,
  getOperatorLabel,
  getActionLabel,
  validateRule,
  operatorNeedsValue,
  evaluateRules,
} from "@/lib/forms/conditional-logic";

interface ConditionalLogicBuilderProps {
  rules: ConditionalRule[];
  onChange: (rules: ConditionalRule[]) => void;
  availableFields: Array<{ name: string; label: string; type: string }>;
  steps?: Array<{ title: string; index: number }>;
  showPreview?: boolean;
  previewFormData?: Record<string, any>;
}

export function ConditionalLogicBuilder({
  rules,
  onChange,
  availableFields,
  steps = [],
  showPreview = true,
  previewFormData = {},
}: ConditionalLogicBuilderProps) {
  const [expandedRules, setExpandedRules] = useState<Set<string>>(
    new Set(rules.map((r) => r.id))
  );
  const [previewEnabled, setPreviewEnabled] = useState(false);

  // All available operators
  const operators: ConditionalOperator[] = [
    "equals",
    "not_equals",
    "contains",
    "not_contains",
    "greater_than",
    "less_than",
    "greater_than_or_equal",
    "less_than_or_equal",
    "is_empty",
    "is_not_empty",
  ];

  // All available actions
  const actionTypes: ConditionalAction[] = [
    "show_field",
    "hide_field",
    "set_required",
    "set_optional",
    "set_value",
    ...(steps.length > 0 ? (["skip_to_step"] as ConditionalAction[]) : []),
  ];

  const toggleRuleExpanded = (ruleId: string) => {
    setExpandedRules((prev) => {
      const next = new Set(prev);
      if (next.has(ruleId)) {
        next.delete(ruleId);
      } else {
        next.add(ruleId);
      }
      return next;
    });
  };

  const addRule = () => {
    const newRule = createEmptyRule();
    onChange([...rules, newRule]);
    setExpandedRules((prev) => new Set([...prev, newRule.id]));
  };

  const duplicateRule = (ruleIndex: number) => {
    const rule = rules[ruleIndex];
    const duplicated: ConditionalRule = {
      ...rule,
      id: crypto.randomUUID(),
      name: `${rule.name || "Rule"} (Copy)`,
      conditions: rule.conditions.map((c) => ({ ...c, id: crypto.randomUUID() })),
      actions: rule.actions.map((a) => ({ ...a, id: crypto.randomUUID() })),
    };
    onChange([...rules, duplicated]);
  };

  const deleteRule = (ruleIndex: number) => {
    const newRules = rules.filter((_, i) => i !== ruleIndex);
    onChange(newRules);
  };

  const updateRule = (ruleIndex: number, updates: Partial<ConditionalRule>) => {
    const newRules = [...rules];
    newRules[ruleIndex] = { ...newRules[ruleIndex], ...updates };
    onChange(newRules);
  };

  const addCondition = (ruleIndex: number) => {
    const rule = rules[ruleIndex];
    const newCondition = createEmptyCondition();
    updateRule(ruleIndex, {
      conditions: [...rule.conditions, newCondition],
    });
  };

  const updateCondition = (
    ruleIndex: number,
    conditionIndex: number,
    updates: Partial<Condition>
  ) => {
    const rule = rules[ruleIndex];
    const newConditions = [...rule.conditions];
    newConditions[conditionIndex] = { ...newConditions[conditionIndex], ...updates };
    updateRule(ruleIndex, { conditions: newConditions });
  };

  const deleteCondition = (ruleIndex: number, conditionIndex: number) => {
    const rule = rules[ruleIndex];
    const newConditions = rule.conditions.filter((_, i) => i !== conditionIndex);
    updateRule(ruleIndex, { conditions: newConditions });
  };

  const addAction = (ruleIndex: number) => {
    const rule = rules[ruleIndex];
    const newAction = createEmptyAction();
    updateRule(ruleIndex, {
      actions: [...rule.actions, newAction],
    });
  };

  const updateAction = (
    ruleIndex: number,
    actionIndex: number,
    updates: Partial<Action>
  ) => {
    const rule = rules[ruleIndex];
    const newActions = [...rule.actions];
    newActions[actionIndex] = { ...newActions[actionIndex], ...updates };
    updateRule(ruleIndex, { actions: newActions });
  };

  const deleteAction = (ruleIndex: number, actionIndex: number) => {
    const rule = rules[ruleIndex];
    const newActions = rule.actions.filter((_, i) => i !== actionIndex);
    updateRule(ruleIndex, { actions: newActions });
  };

  // Get field type for proper input rendering
  const getFieldType = (fieldName: string): string => {
    const field = availableFields.find((f) => f.name === fieldName);
    return field?.type || "text";
  };

  // Preview evaluation
  const previewResult = previewEnabled
    ? evaluateRules(
        rules,
        { formData: previewFormData },
        availableFields.map((f) => f.name)
      )
    : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Conditional Logic</h3>
          <p className="text-sm text-muted-foreground">
            Show or hide fields based on user input
          </p>
        </div>
        <div className="flex items-center gap-2">
          {showPreview && (
            <div className="flex items-center gap-2">
              <Label htmlFor="preview-toggle" className="text-sm">
                Preview
              </Label>
              <Switch
                id="preview-toggle"
                checked={previewEnabled}
                onCheckedChange={setPreviewEnabled}
              />
            </div>
          )}
          <Button onClick={addRule} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Rule
          </Button>
        </div>
      </div>

      {rules.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground text-center">
              No conditional rules yet.
              <br />
              Click "Add Rule" to create your first rule.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {rules.map((rule, ruleIndex) => {
          const isExpanded = expandedRules.has(rule.id);
          const errors = validateRule(rule);
          const hasErrors = errors.length > 0;

          return (
            <Card key={rule.id} className={hasErrors ? "border-destructive" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRuleExpanded(rule.id)}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                    <div className="flex-1">
                      <Input
                        value={rule.name || ""}
                        onChange={(e) =>
                          updateRule(ruleIndex, { name: e.target.value })
                        }
                        placeholder="Rule name"
                        className="font-medium"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.enabled !== false}
                        onCheckedChange={(enabled) =>
                          updateRule(ruleIndex, { enabled })
                        }
                      />
                      <span className="text-sm text-muted-foreground">
                        {rule.enabled !== false ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => duplicateRule(ruleIndex)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteRule(ruleIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {hasErrors && !isExpanded && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {errors.length} error{errors.length > 1 ? "s" : ""} in this rule
                    </AlertDescription>
                  </Alert>
                )}
              </CardHeader>

              {isExpanded && (
                <CardContent className="space-y-4 pt-0">
                  {/* Conditions */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Conditions</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Match</span>
                        <Select
                          value={rule.logicOperator}
                          onValueChange={(value: LogicOperator) =>
                            updateRule(ruleIndex, { logicOperator: value })
                          }
                        >
                          <SelectTrigger className="w-24 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AND">ALL</SelectItem>
                            <SelectItem value="OR">ANY</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {rule.conditions.map((condition, conditionIndex) => (
                        <div
                          key={condition.id}
                          className="flex items-center gap-2 p-3 rounded-lg border bg-muted/50"
                        >
                          {/* Field selector */}
                          <Select
                            value={condition.field}
                            onValueChange={(value) =>
                              updateCondition(ruleIndex, conditionIndex, {
                                field: value,
                              })
                            }
                          >
                            <SelectTrigger className="w-[200px]">
                              <SelectValue placeholder="Select field" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableFields.map((field) => (
                                <SelectItem key={field.name} value={field.name}>
                                  {field.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {/* Operator selector */}
                          <Select
                            value={condition.operator}
                            onValueChange={(value: ConditionalOperator) =>
                              updateCondition(ruleIndex, conditionIndex, {
                                operator: value,
                              })
                            }
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {operators.map((op) => (
                                <SelectItem key={op} value={op}>
                                  {getOperatorLabel(op)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {/* Value input (conditional) */}
                          {operatorNeedsValue(condition.operator) && (
                            <Input
                              value={condition.value || ""}
                              onChange={(e) =>
                                updateCondition(ruleIndex, conditionIndex, {
                                  value: e.target.value,
                                })
                              }
                              placeholder="Value"
                              className="flex-1"
                              type={
                                getFieldType(condition.field) === "number"
                                  ? "number"
                                  : "text"
                              }
                            />
                          )}

                          {/* Delete button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteCondition(ruleIndex, conditionIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addCondition(ruleIndex)}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Condition
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Actions */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Then...</Label>

                    <div className="space-y-2">
                      {rule.actions.map((action, actionIndex) => (
                        <div
                          key={action.id}
                          className="flex items-center gap-2 p-3 rounded-lg border bg-muted/50"
                        >
                          {/* Action type selector */}
                          <Select
                            value={action.type}
                            onValueChange={(value: ConditionalAction) =>
                              updateAction(ruleIndex, actionIndex, { type: value })
                            }
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {actionTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {getActionLabel(type)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {/* Target selector */}
                          {action.type === "skip_to_step" ? (
                            <Select
                              value={action.target}
                              onValueChange={(value) =>
                                updateAction(ruleIndex, actionIndex, { target: value })
                              }
                            >
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Select step" />
                              </SelectTrigger>
                              <SelectContent>
                                {steps.map((step) => (
                                  <SelectItem
                                    key={step.index}
                                    value={String(step.index)}
                                  >
                                    {step.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Select
                              value={action.target}
                              onValueChange={(value) =>
                                updateAction(ruleIndex, actionIndex, { target: value })
                              }
                            >
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Select field" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableFields.map((field) => (
                                  <SelectItem key={field.name} value={field.name}>
                                    {field.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}

                          {/* Value input for set_value action */}
                          {action.type === "set_value" && (
                            <Input
                              value={action.value || ""}
                              onChange={(e) =>
                                updateAction(ruleIndex, actionIndex, {
                                  value: e.target.value,
                                })
                              }
                              placeholder="Value"
                              className="w-[200px]"
                            />
                          )}

                          {/* Delete button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteAction(ruleIndex, actionIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addAction(ruleIndex)}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Action
                      </Button>
                    </div>
                  </div>

                  {/* Validation errors */}
                  {hasErrors && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <ul className="list-disc list-inside space-y-1">
                          {errors.map((error, index) => (
                            <li key={index} className="text-sm">
                              {error}
                            </li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Preview panel */}
      {previewEnabled && previewResult && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </CardTitle>
            <CardDescription>
              Based on current form values, this is what would happen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {previewResult.hiddenFields.size > 0 && (
              <div>
                <Label className="text-sm font-medium">Hidden Fields</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {Array.from(previewResult.hiddenFields).map((fieldName) => {
                    const field = availableFields.find((f) => f.name === fieldName);
                    return (
                      <Badge key={fieldName} variant="secondary">
                        <EyeOff className="h-3 w-3 mr-1" />
                        {field?.label || fieldName}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {previewResult.requiredFields.size > 0 && (
              <div>
                <Label className="text-sm font-medium">Required Fields</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {Array.from(previewResult.requiredFields).map((fieldName) => {
                    const field = availableFields.find((f) => f.name === fieldName);
                    return (
                      <Badge key={fieldName} variant="destructive">
                        {field?.label || fieldName}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {Object.keys(previewResult.fieldValues).length > 0 && (
              <div>
                <Label className="text-sm font-medium">Auto-filled Values</Label>
                <div className="space-y-1 mt-2">
                  {Object.entries(previewResult.fieldValues).map(([fieldName, value]) => {
                    const field = availableFields.find((f) => f.name === fieldName);
                    return (
                      <div
                        key={fieldName}
                        className="text-sm p-2 bg-muted rounded flex justify-between"
                      >
                        <span className="font-medium">{field?.label || fieldName}:</span>
                        <span className="text-muted-foreground">{String(value)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {previewResult.targetStep !== undefined && (
              <div>
                <Label className="text-sm font-medium">Navigation</Label>
                <Badge className="mt-2">
                  Skip to step {previewResult.targetStep + 1}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
