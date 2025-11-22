/**
 * Form Conditional Logic Engine
 *
 * Evaluates conditional rules to show/hide form fields dynamically.
 *
 * Features:
 * - Multiple operators: equals, not equals, contains, greater than, less than
 * - AND/OR logic for combining conditions
 * - Multiple actions: show field, hide field, skip to step
 * - Type-safe evaluation
 */

export type ConditionalOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "not_contains"
  | "greater_than"
  | "less_than"
  | "greater_than_or_equal"
  | "less_than_or_equal"
  | "is_empty"
  | "is_not_empty";

export type ConditionalAction =
  | "show_field"
  | "hide_field"
  | "skip_to_step"
  | "set_value"
  | "set_required"
  | "set_optional";

export type LogicOperator = "AND" | "OR";

export interface ConditionalRule {
  id: string;
  name?: string;
  conditions: Condition[];
  logicOperator: LogicOperator;
  actions: Action[];
  enabled?: boolean;
}

export interface Condition {
  id: string;
  field: string;
  operator: ConditionalOperator;
  value?: any;
}

export interface Action {
  id: string;
  type: ConditionalAction;
  target: string; // field name or step index
  value?: any;
}

export interface EvaluationContext {
  formData: Record<string, any>;
  currentStep?: number;
}

export interface EvaluationResult {
  visibleFields: Set<string>;
  hiddenFields: Set<string>;
  requiredFields: Set<string>;
  optionalFields: Set<string>;
  fieldValues: Record<string, any>;
  targetStep?: number;
}

/**
 * Evaluate a single condition
 */
export function evaluateCondition(
  condition: Condition,
  formData: Record<string, any>
): boolean {
  const fieldValue = formData[condition.field];
  const { operator, value } = condition;

  switch (operator) {
    case "equals":
      return fieldValue === value;

    case "not_equals":
      return fieldValue !== value;

    case "contains":
      if (typeof fieldValue === "string" && typeof value === "string") {
        return fieldValue.toLowerCase().includes(value.toLowerCase());
      }
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(value);
      }
      return false;

    case "not_contains":
      if (typeof fieldValue === "string" && typeof value === "string") {
        return !fieldValue.toLowerCase().includes(value.toLowerCase());
      }
      if (Array.isArray(fieldValue)) {
        return !fieldValue.includes(value);
      }
      return true;

    case "greater_than":
      return Number(fieldValue) > Number(value);

    case "less_than":
      return Number(fieldValue) < Number(value);

    case "greater_than_or_equal":
      return Number(fieldValue) >= Number(value);

    case "less_than_or_equal":
      return Number(fieldValue) <= Number(value);

    case "is_empty":
      return !fieldValue || fieldValue === "" || (Array.isArray(fieldValue) && fieldValue.length === 0);

    case "is_not_empty":
      return !!fieldValue && fieldValue !== "" && (!Array.isArray(fieldValue) || fieldValue.length > 0);

    default:
      console.warn(`Unknown operator: ${operator}`);
      return false;
  }
}

/**
 * Evaluate all conditions in a rule with AND/OR logic
 */
export function evaluateRule(
  rule: ConditionalRule,
  formData: Record<string, any>
): boolean {
  if (!rule.enabled) {
    return false;
  }

  if (rule.conditions.length === 0) {
    return false;
  }

  const results = rule.conditions.map((condition) =>
    evaluateCondition(condition, formData)
  );

  if (rule.logicOperator === "AND") {
    return results.every((result) => result === true);
  } else {
    // OR
    return results.some((result) => result === true);
  }
}

/**
 * Apply actions from a rule
 */
export function applyActions(
  actions: Action[],
  result: EvaluationResult
): void {
  actions.forEach((action) => {
    switch (action.type) {
      case "show_field":
        result.visibleFields.add(action.target);
        result.hiddenFields.delete(action.target);
        break;

      case "hide_field":
        result.hiddenFields.add(action.target);
        result.visibleFields.delete(action.target);
        break;

      case "skip_to_step":
        result.targetStep = Number(action.target);
        break;

      case "set_value":
        result.fieldValues[action.target] = action.value;
        break;

      case "set_required":
        result.requiredFields.add(action.target);
        result.optionalFields.delete(action.target);
        break;

      case "set_optional":
        result.optionalFields.add(action.target);
        result.requiredFields.delete(action.target);
        break;

      default:
        console.warn(`Unknown action type: ${action.type}`);
    }
  });
}

/**
 * Evaluate all rules and return the combined result
 */
export function evaluateRules(
  rules: ConditionalRule[],
  context: EvaluationContext,
  allFields: string[]
): EvaluationResult {
  const result: EvaluationResult = {
    visibleFields: new Set(allFields), // Start with all fields visible
    hiddenFields: new Set(),
    requiredFields: new Set(),
    optionalFields: new Set(),
    fieldValues: {},
  };

  // Evaluate each rule
  rules.forEach((rule) => {
    const ruleMatches = evaluateRule(rule, context.formData);

    if (ruleMatches) {
      applyActions(rule.actions, result);
    }
  });

  return result;
}

/**
 * Get operator display name
 */
export function getOperatorLabel(operator: ConditionalOperator): string {
  const labels: Record<ConditionalOperator, string> = {
    equals: "equals",
    not_equals: "does not equal",
    contains: "contains",
    not_contains: "does not contain",
    greater_than: "is greater than",
    less_than: "is less than",
    greater_than_or_equal: "is greater than or equal to",
    less_than_or_equal: "is less than or equal to",
    is_empty: "is empty",
    is_not_empty: "is not empty",
  };

  return labels[operator];
}

/**
 * Get action display name
 */
export function getActionLabel(action: ConditionalAction): string {
  const labels: Record<ConditionalAction, string> = {
    show_field: "Show field",
    hide_field: "Hide field",
    skip_to_step: "Skip to step",
    set_value: "Set value",
    set_required: "Make required",
    set_optional: "Make optional",
  };

  return labels[action];
}

/**
 * Validate a conditional rule
 */
export function validateRule(rule: ConditionalRule): string[] {
  const errors: string[] = [];

  if (!rule.conditions || rule.conditions.length === 0) {
    errors.push("Rule must have at least one condition");
  }

  if (!rule.actions || rule.actions.length === 0) {
    errors.push("Rule must have at least one action");
  }

  rule.conditions.forEach((condition, index) => {
    if (!condition.field) {
      errors.push(`Condition ${index + 1}: Field is required`);
    }
    if (!condition.operator) {
      errors.push(`Condition ${index + 1}: Operator is required`);
    }
    // Value is optional for is_empty and is_not_empty operators
    if (
      condition.value === undefined &&
      condition.operator !== "is_empty" &&
      condition.operator !== "is_not_empty"
    ) {
      errors.push(`Condition ${index + 1}: Value is required`);
    }
  });

  rule.actions.forEach((action, index) => {
    if (!action.type) {
      errors.push(`Action ${index + 1}: Type is required`);
    }
    if (!action.target) {
      errors.push(`Action ${index + 1}: Target is required`);
    }
  });

  return errors;
}

/**
 * Create a new empty rule
 */
export function createEmptyRule(): ConditionalRule {
  return {
    id: crypto.randomUUID(),
    name: "New Rule",
    conditions: [],
    logicOperator: "AND",
    actions: [],
    enabled: true,
  };
}

/**
 * Create a new empty condition
 */
export function createEmptyCondition(): Condition {
  return {
    id: crypto.randomUUID(),
    field: "",
    operator: "equals",
    value: "",
  };
}

/**
 * Create a new empty action
 */
export function createEmptyAction(): Action {
  return {
    id: crypto.randomUUID(),
    type: "show_field",
    target: "",
  };
}

/**
 * Check if an operator needs a value input
 */
export function operatorNeedsValue(operator: ConditionalOperator): boolean {
  return operator !== "is_empty" && operator !== "is_not_empty";
}
