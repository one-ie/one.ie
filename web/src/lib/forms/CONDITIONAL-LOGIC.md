# Form Conditional Logic System - Cycle 67

Complete system for creating dynamic, intelligent forms with conditional logic that shows/hides fields, sets requirements, and auto-fills values based on user input.

## Features

### Conditional Logic Engine (`conditional-logic.ts`)

- ✅ **10 Operators**: equals, not equals, contains, greater than, less than, etc.
- ✅ **6 Actions**: show field, hide field, set required, set optional, set value, skip to step
- ✅ **AND/OR Logic**: Combine multiple conditions with boolean operators
- ✅ **Type-Safe**: Full TypeScript support with proper types
- ✅ **Real-Time**: Evaluates rules as user types

### Visual Rule Builder (`ConditionalLogicBuilder.tsx`)

- ✅ **No-code interface**: Dropdown selectors, no coding required
- ✅ **Multiple conditions**: AND/OR logic toggle
- ✅ **Multiple actions**: Apply several actions per rule
- ✅ **Real-time preview**: See rules in action with live form data
- ✅ **Rule validation**: Catches errors before submission
- ✅ **Rule management**: Enable/disable, duplicate, delete rules

### Smart Forms (`ConditionalForm.tsx`)

- ✅ **Dynamic visibility**: Fields appear/disappear based on rules
- ✅ **Dynamic requirements**: Required status changes based on conditions
- ✅ **Auto-fill**: Pre-populate fields based on other values
- ✅ **Multi-step support**: Skip to specific steps based on answers
- ✅ **Validation**: Client-side validation with error messages
- ✅ **State management**: Tracks form data and applies rules in real-time

## Quick Start

### 1. Define Your Form Fields

```typescript
import type { FormField } from '@/components/forms/ConditionalForm';

const fields: FormField[] = [
  {
    name: "accountType",
    label: "Account Type",
    type: "select",
    required: true,
    options: [
      { label: "Personal", value: "personal" },
      { label: "Business", value: "business" },
    ],
  },
  {
    name: "companyName",
    label: "Company Name",
    type: "text",
    placeholder: "Enter company name",
  },
];
```

### 2. Create Conditional Rules

```typescript
import type { ConditionalRule } from '@/lib/forms/conditional-logic';

const rules: ConditionalRule[] = [
  {
    id: "rule-1",
    name: "Show company fields for business accounts",
    conditions: [
      {
        id: "cond-1",
        field: "accountType",
        operator: "equals",
        value: "business",
      },
    ],
    logicOperator: "AND",
    actions: [
      {
        id: "action-1",
        type: "show_field",
        target: "companyName",
      },
      {
        id: "action-2",
        type: "set_required",
        target: "companyName",
      },
    ],
    enabled: true,
  },
];
```

### 3. Render the Form

```typescript
import { ConditionalForm } from '@/components/forms/ConditionalForm';

function MyForm() {
  const handleSubmit = async (data) => {
    console.log("Form data:", data);
    // Submit to your backend
  };

  return (
    <ConditionalForm
      title="Account Setup"
      description="Create your account"
      fields={fields}
      conditionalRules={rules}
      onSubmit={handleSubmit}
      submitLabel="Create Account"
    />
  );
}
```

### 4. Add Rule Builder (Optional)

```typescript
import { ConditionalLogicBuilder } from '@/components/forms/ConditionalLogicBuilder';

function FormBuilderPage() {
  const [rules, setRules] = useState<ConditionalRule[]>([]);

  return (
    <ConditionalLogicBuilder
      rules={rules}
      onChange={setRules}
      availableFields={fields.map(f => ({
        name: f.name,
        label: f.label,
        type: f.type,
      }))}
      showPreview={true}
      previewFormData={formData}
    />
  );
}
```

## Operators

### Comparison Operators

| Operator | Description | Example Use Case |
|----------|-------------|------------------|
| `equals` | Field value equals specified value | `age === 18` |
| `not_equals` | Field value does not equal | `status !== "pending"` |
| `greater_than` | Field value is greater than | `price > 100` |
| `less_than` | Field value is less than | `quantity < 10` |
| `greater_than_or_equal` | Field value is >= | `age >= 21` |
| `less_than_or_equal` | Field value is <= | `budget <= 1000` |

### String Operators

| Operator | Description | Example Use Case |
|----------|-------------|------------------|
| `contains` | String contains substring | `email contains "@gmail"` |
| `not_contains` | String does not contain | `name not contains "test"` |

### Validation Operators

| Operator | Description | Example Use Case |
|----------|-------------|------------------|
| `is_empty` | Field has no value | Check if optional field is empty |
| `is_not_empty` | Field has a value | Ensure field was filled |

## Actions

### Visibility Actions

| Action | Description | Example |
|--------|-------------|---------|
| `show_field` | Make field visible | Show "Company Name" for business accounts |
| `hide_field` | Make field hidden | Hide credit card fields for free plan |

### Requirement Actions

| Action | Description | Example |
|--------|-------------|---------|
| `set_required` | Make field required | Require tax ID for business accounts |
| `set_optional` | Make field optional | Make phone optional for email-only users |

### Value Actions

| Action | Description | Example |
|--------|-------------|---------|
| `set_value` | Auto-fill field value | Set country to "US" for US zip codes |

### Navigation Actions

| Action | Description | Example |
|--------|-------------|---------|
| `skip_to_step` | Jump to specific step | Skip payment for free tier |

## Logic Operators

### AND Logic

All conditions must be true for actions to execute.

```typescript
{
  conditions: [
    { field: "age", operator: "greater_than", value: 18 },
    { field: "country", operator: "equals", value: "US" },
  ],
  logicOperator: "AND",
  actions: [
    { type: "show_field", target: "ssn" }
  ]
}
// Shows SSN field ONLY if age > 18 AND country is US
```

### OR Logic

At least one condition must be true.

```typescript
{
  conditions: [
    { field: "plan", operator: "equals", value: "premium" },
    { field: "plan", operator: "equals", value: "enterprise" },
  ],
  logicOperator: "OR",
  actions: [
    { type: "show_field", target: "priority_support" }
  ]
}
// Shows priority support if plan is premium OR enterprise
```

## Multi-Step Forms

### Define Steps

```typescript
const steps = [
  {
    title: "Account Info",
    fields: ["accountType", "fullName", "email"],
  },
  {
    title: "Company Details",
    fields: ["companyName", "companySize"],
  },
  {
    title: "Payment",
    fields: ["paymentMethod", "cardNumber"],
  },
];
```

### Skip Steps Conditionally

```typescript
{
  conditions: [
    { field: "accountType", operator: "equals", value: "free" }
  ],
  logicOperator: "AND",
  actions: [
    { type: "skip_to_step", target: "2" } // Skip to step 3 (0-indexed)
  ]
}
```

## Advanced Examples

### Complex Business Logic

```typescript
// Show enterprise features for large companies OR high budgets
{
  name: "Enterprise Features Eligibility",
  conditions: [
    { field: "employeeCount", operator: "greater_than", value: 200 },
    { field: "annualBudget", operator: "greater_than", value: 100000 },
  ],
  logicOperator: "OR", // Either condition triggers
  actions: [
    { type: "show_field", target: "dedicatedAccountManager" },
    { type: "show_field", target: "customIntegrations" },
    { type: "set_value", target: "tier", value: "enterprise" },
  ],
}
```

### Cascading Rules

```typescript
// Rule 1: Show company fields for business accounts
{
  conditions: [
    { field: "accountType", operator: "equals", value: "business" }
  ],
  actions: [
    { type: "show_field", target: "companySize" }
  ]
}

// Rule 2: Show employee count for large companies
{
  conditions: [
    { field: "companySize", operator: "equals", value: "200+" }
  ],
  actions: [
    { type: "show_field", target: "exactEmployeeCount" },
    { type: "set_required", target: "exactEmployeeCount" },
  ]
}
```

### Dynamic Validation

```typescript
// Require tax ID for US businesses
{
  conditions: [
    { field: "accountType", operator: "equals", value: "business" },
    { field: "country", operator: "equals", value: "US" },
  ],
  logicOperator: "AND",
  actions: [
    { type: "show_field", target: "taxId" },
    { type: "set_required", target: "taxId" },
  ]
}
```

## API Reference

### evaluateRules()

Evaluates all rules and returns visibility, requirements, and auto-fill values.

```typescript
function evaluateRules(
  rules: ConditionalRule[],
  context: EvaluationContext,
  allFields: string[]
): EvaluationResult
```

**Parameters:**
- `rules` - Array of conditional rules to evaluate
- `context` - Current form data and step
- `allFields` - All available field names

**Returns:**
```typescript
{
  visibleFields: Set<string>;      // Fields that should be visible
  hiddenFields: Set<string>;       // Fields that should be hidden
  requiredFields: Set<string>;     // Fields that are required
  optionalFields: Set<string>;     // Fields that are optional
  fieldValues: Record<string, any>; // Auto-fill values
  targetStep?: number;             // Step to navigate to
}
```

### evaluateCondition()

Evaluates a single condition.

```typescript
function evaluateCondition(
  condition: Condition,
  formData: Record<string, any>
): boolean
```

### validateRule()

Validates a rule configuration.

```typescript
function validateRule(rule: ConditionalRule): string[]
// Returns array of error messages (empty if valid)
```

### Helper Functions

```typescript
// Get human-readable operator label
getOperatorLabel(operator: ConditionalOperator): string

// Get human-readable action label
getActionLabel(action: ConditionalAction): string

// Check if operator needs a value input
operatorNeedsValue(operator: ConditionalOperator): boolean

// Create new empty rule
createEmptyRule(): ConditionalRule

// Create new empty condition
createEmptyCondition(): Condition

// Create new empty action
createEmptyAction(): Action
```

## Best Practices

### 1. Keep Rules Simple

Bad:
```typescript
// 10 conditions in one rule - hard to maintain
{
  conditions: [/* 10 conditions */],
  logicOperator: "AND",
  actions: [/* many actions */]
}
```

Good:
```typescript
// Multiple focused rules
{
  name: "Show business fields",
  conditions: [
    { field: "accountType", operator: "equals", value: "business" }
  ],
  actions: [
    { type: "show_field", target: "companyName" }
  ]
}
```

### 2. Name Your Rules

```typescript
{
  id: "rule-1",
  name: "Show company fields for business accounts", // ✓ Clear name
  // vs
  name: "Rule 1", // ✗ Not descriptive
}
```

### 3. Use Cascading Rules

Instead of complex nested conditions, create sequential rules that build on each other.

### 4. Validate Early

Use the `validateRule()` function before saving rules:

```typescript
const errors = validateRule(rule);
if (errors.length > 0) {
  console.error("Rule validation failed:", errors);
}
```

### 5. Test Rules with Preview

Always enable preview mode to see rules in action:

```typescript
<ConditionalLogicBuilder
  rules={rules}
  onChange={setRules}
  showPreview={true}        // Enable preview
  previewFormData={testData} // Test with sample data
/>
```

## Performance

- Rules are evaluated using `useMemo` - only re-evaluated when form data or rules change
- Set-based operations for O(1) field visibility lookups
- Minimal re-renders with React optimization
- Efficient condition evaluation (short-circuit logic)

## TypeScript Support

All types are fully typed:

```typescript
import type {
  ConditionalRule,
  Condition,
  Action,
  ConditionalOperator,
  ConditionalAction,
  LogicOperator,
  EvaluationResult,
  EvaluationContext,
} from '@/lib/forms/conditional-logic';
```

## Demo

See the complete interactive demo at:
```
/demo/conditional-forms
```

The demo includes:
- Visual rule builder with real-time preview
- Live form that updates as you create rules
- Example rules for common use cases
- Full source code for reference

## Integration with Existing Forms

### Option 1: Use ConditionalForm Component

Replace your existing form with `ConditionalForm`:

```typescript
// Before
<DynamicForm
  fields={fields}
  onSubmit={handleSubmit}
/>

// After
<ConditionalForm
  fields={fields}
  conditionalRules={rules}
  onSubmit={handleSubmit}
  onChange={handleChange}
/>
```

### Option 2: Add Logic to Existing Forms

Use the evaluation engine directly:

```typescript
import { evaluateRules } from '@/lib/forms/conditional-logic';

function MyForm() {
  const [formData, setFormData] = useState({});
  const [rules, setRules] = useState<ConditionalRule[]>([]);

  const result = evaluateRules(
    rules,
    { formData },
    fields.map(f => f.name)
  );

  const visibleFields = fields.filter(f =>
    result.visibleFields.has(f.name)
  );

  return (
    <form>
      {visibleFields.map(field => (
        <Field
          key={field.name}
          {...field}
          required={result.requiredFields.has(field.name)}
        />
      ))}
    </form>
  );
}
```

## File Structure

```
/web/src/lib/forms/
├── conditional-logic.ts          # Logic engine and types
└── CONDITIONAL-LOGIC.md          # This documentation

/web/src/components/forms/
├── ConditionalForm.tsx           # Smart form with logic support
├── ConditionalLogicBuilder.tsx   # Visual rule builder UI
└── ConditionalFormDemo.tsx       # Complete demo with examples

/web/src/pages/demo/
└── conditional-forms.astro       # Demo page
```

## Future Enhancements

- [ ] Drag-and-drop rule ordering
- [ ] Rule templates library
- [ ] Import/export rules as JSON
- [ ] Visual flow diagram
- [ ] Rule testing suite
- [ ] Performance metrics
- [ ] A/B testing support
- [ ] Analytics integration
- [ ] Rule versioning
- [ ] Undo/redo support

## Troubleshooting

### Rules Not Working

1. Check that rules are enabled: `rule.enabled === true`
2. Verify field names match exactly
3. Check operator and value types
4. Test conditions individually

### Fields Not Hiding

1. Ensure field is not in `visibleFields` set
2. Check that actions are being applied
3. Verify rule conditions are met
4. Check for conflicting rules

### Performance Issues

1. Reduce number of rules
2. Simplify complex conditions
3. Use `useMemo` for expensive computations
4. Check browser console for errors

### Preview Not Updating

1. Ensure `previewFormData` is being updated
2. Check that `showPreview` is true
3. Verify rules have valid conditions and actions

## Support

For questions or issues:
1. Check the demo page: `/demo/conditional-forms`
2. Review this documentation
3. Examine the source code comments
4. Create an issue in the repository

## Related Documentation

- Form Validation: `/web/src/lib/forms/README.md`
- Dynamic Forms: `/web/src/components/ontology-ui/generative/README.md`
- shadcn/ui Forms: https://ui.shadcn.com/docs/components/form
