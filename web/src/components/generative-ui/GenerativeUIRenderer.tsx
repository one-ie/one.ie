import React from "react";
import { DynamicChart } from "./DynamicChart";
import { DynamicTable } from "./DynamicTable";
import { DynamicCard } from "./DynamicCard";
import { DynamicForm } from "./DynamicForm";
import { DynamicList } from "./DynamicList";
import { DynamicTimeline } from "./DynamicTimeline";
import { DynamicButton } from "./DynamicButton";
import { DynamicProduct } from "./DynamicProduct";

export interface UIPayload {
  component: "chart" | "table" | "card" | "form" | "list" | "timeline" | "button" | "product";
  data: any;
  layout?: any;
}

export function GenerativeUIRenderer({ payload }: { payload: UIPayload }) {
  switch (payload.component) {
    case "chart":
      return <DynamicChart data={payload.data} layout={payload.layout} />;
    case "table":
      return <DynamicTable data={payload.data} layout={payload.layout} />;
    case "card":
      return <DynamicCard data={payload.data} layout={payload.layout} />;
    case "form":
      return <DynamicForm data={payload.data} layout={payload.layout} />;
    case "list":
      return <DynamicList data={payload.data} layout={payload.layout} />;
    case "timeline":
      return <DynamicTimeline data={payload.data} layout={payload.layout} />;
    case "button":
      return <DynamicButton data={payload.data} layout={payload.layout} />;
    case "product":
      return <DynamicProduct data={payload.data} />;
    default:
      return <div className="rounded-lg border border-destructive bg-destructive/10 p-4">Unknown component: {payload.component}</div>;
  }
}
