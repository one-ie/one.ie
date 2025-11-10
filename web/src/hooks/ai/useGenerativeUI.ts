import { useState } from "react";

export interface GenerativeComponent {
  id: string;
  component: string;
  data: any;
  layout?: any;
}

export function useGenerativeUI() {
  const [components, setComponents] = useState<GenerativeComponent[]>([]);

  const addComponent = (component: GenerativeComponent) => {
    setComponents((prev) => [...prev, component]);
  };

  const removeComponent = (id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
  };

  const clearComponents = () => {
    setComponents([]);
  };

  return {
    components,
    addComponent,
    removeComponent,
    clearComponents,
  };
}
