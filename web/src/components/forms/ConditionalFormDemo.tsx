/**
 * ConditionalFormDemo - Interactive demo of conditional logic system
 *
 * Shows:
 * - Rule builder interface
 * - Live form preview
 * - Real-time conditional evaluation
 */

import { useState } from "react";
import { ConditionalLogicBuilder } from "./ConditionalLogicBuilder";
import { ConditionalForm, type FormField } from "./ConditionalForm";
import type { ConditionalRule } from "@/lib/forms/conditional-logic";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { evaluateRules } from "@/lib/forms/conditional-logic";

export function ConditionalFormDemo() {
  // Sample form fields
  const [fields] = useState<FormField[]>([
    {
      name: "accountType",
      label: "Account Type",
      type: "select",
      required: true,
      options: [
        { label: "Personal", value: "personal" },
        { label: "Business", value: "business" },
        { label: "Enterprise", value: "enterprise" },
      ],
    },
    {
      name: "fullName",
      label: "Full Name",
      type: "text",
      required: true,
      placeholder: "Enter your full name",
    },
    {
      name: "companyName",
      label: "Company Name",
      type: "text",
      placeholder: "Enter your company name",
    },
    {
      name: "companySize",
      label: "Company Size",
      type: "select",
      options: [
        { label: "1-10 employees", value: "1-10" },
        { label: "11-50 employees", value: "11-50" },
        { label: "51-200 employees", value: "51-200" },
        { label: "200+ employees", value: "200+" },
      ],
    },
    {
      name: "employeeCount",
      label: "Number of Employees",
      type: "number",
      placeholder: "Enter exact number",
    },
    {
      name: "budget",
      label: "Monthly Budget",
      type: "number",
      placeholder: "Enter budget in USD",
    },
    {
      name: "email",
      label: "Email Address",
      type: "text",
      required: true,
      placeholder: "you@example.com",
    },
    {
      name: "phone",
      label: "Phone Number",
      type: "text",
      placeholder: "+1 (555) 000-0000",
    },
    {
      name: "premiumFeatures",
      label: "Enable Premium Features",
      type: "checkbox",
    },
  ]);

  // Sample conditional rules
  const [rules, setRules] = useState<ConditionalRule[]>([
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
          type: "show_field",
          target: "companySize",
        },
        {
          id: "action-3",
          type: "set_required",
          target: "companyName",
        },
      ],
      enabled: true,
    },
    {
      id: "rule-2",
      name: "Show enterprise fields for large companies",
      conditions: [
        {
          id: "cond-2",
          field: "accountType",
          operator: "equals",
          value: "enterprise",
        },
      ],
      logicOperator: "AND",
      actions: [
        {
          id: "action-4",
          type: "show_field",
          target: "companyName",
        },
        {
          id: "action-5",
          type: "show_field",
          target: "employeeCount",
        },
        {
          id: "action-6",
          type: "show_field",
          target: "budget",
        },
        {
          id: "action-7",
          type: "set_required",
          target: "companyName",
        },
        {
          id: "action-8",
          type: "set_required",
          target: "employeeCount",
        },
      ],
      enabled: true,
    },
    {
      id: "rule-3",
      name: "Require phone for premium features",
      conditions: [
        {
          id: "cond-3",
          field: "premiumFeatures",
          operator: "equals",
          value: true,
        },
      ],
      logicOperator: "AND",
      actions: [
        {
          id: "action-9",
          type: "show_field",
          target: "phone",
        },
        {
          id: "action-10",
          type: "set_required",
          target: "phone",
        },
      ],
      enabled: true,
    },
  ]);

  // Form data for preview
  const [formData, setFormData] = useState<Record<string, any>>({
    accountType: "personal",
    fullName: "",
    companyName: "",
    companySize: "",
    employeeCount: "",
    budget: "",
    email: "",
    phone: "",
    premiumFeatures: false,
  });

  // Evaluate rules for preview panel
  const evaluationResult = evaluateRules(
    rules,
    { formData },
    fields.map((f) => f.name)
  );

  const handleFormChange = (data: Record<string, any>) => {
    setFormData(data);
  };

  const handleSubmit = async (data: Record<string, any>) => {
    console.log("Form submitted:", data);
    alert("Form submitted successfully! Check the console for submitted data.");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Rule Builder */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Rule Builder
              <Badge variant="secondary">{rules.length} Rules</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ConditionalLogicBuilder
              rules={rules}
              onChange={setRules}
              availableFields={fields.map((f) => ({
                name: f.name,
                label: f.label,
                type: f.type,
              }))}
              showPreview={true}
              previewFormData={formData}
            />
          </CardContent>
        </Card>
      </div>

      {/* Live Form Preview */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Live Form Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="form">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="form">Form</TabsTrigger>
                <TabsTrigger value="data">Data</TabsTrigger>
              </TabsList>

              <TabsContent value="form" className="mt-4">
                <ConditionalForm
                  title="Account Setup"
                  description="Fill out the form to see conditional logic in action"
                  fields={fields}
                  conditionalRules={rules}
                  onSubmit={handleSubmit}
                  onChange={handleFormChange}
                  submitLabel="Create Account"
                />
              </TabsContent>

              <TabsContent value="data" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Current Form Data</h4>
                    <pre className="p-4 bg-muted rounded-lg text-xs overflow-auto">
                      {JSON.stringify(formData, null, 2)}
                    </pre>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Evaluation Result</h4>
                    <pre className="p-4 bg-muted rounded-lg text-xs overflow-auto">
                      {JSON.stringify(
                        {
                          visibleFields: Array.from(evaluationResult.visibleFields),
                          hiddenFields: Array.from(evaluationResult.hiddenFields),
                          requiredFields: Array.from(
                            evaluationResult.requiredFields
                          ),
                          fieldValues: evaluationResult.fieldValues,
                        },
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">How to Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Create rules in the left panel</p>
            <p>2. Add conditions (field + operator + value)</p>
            <p>3. Choose AND/OR for multiple conditions</p>
            <p>4. Add actions to show/hide fields</p>
            <p>5. Fill out the form to see rules in action</p>
            <p className="text-primary font-medium mt-4">
              Try changing "Account Type" to see different fields appear!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
