import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DynamicForm({ data, layout }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{data.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          {data.fields?.map((field: any, i: number) => (
            <div key={i} className="space-y-2">
              <Label>{field.label}{field.required && <span className="text-destructive">*</span>}</Label>
              <Input type={field.type} name={field.name} required={field.required} defaultValue={field.defaultValue} />
            </div>
          ))}
          <Button type="submit">{data.submitLabel || "Submit"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
