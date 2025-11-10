import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function DynamicCard({ data, layout }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{data.title}</CardTitle>
        {data.description && <CardDescription>{data.description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {typeof data.content === "string" ? (
          <p className="text-sm">{data.content}</p>
        ) : (
          <pre className="text-xs">{JSON.stringify(data.content, null, 2)}</pre>
        )}
      </CardContent>
      {data.actions && (
        <CardFooter className="flex gap-2">
          {data.actions.map((action: any, i: number) => (
            <Button key={i} variant={action.variant || "default"} size="sm">
              {action.label}
            </Button>
          ))}
        </CardFooter>
      )}
    </Card>
  );
}
