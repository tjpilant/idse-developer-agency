import { ComponentConfig } from "@measured/puck";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type MaxWidth = "sm" | "md" | "lg" | "xl" | "full";
type Padding = "none" | "sm" | "md" | "lg";

export interface ContainerBlockProps {
  id: string;
  maxWidth: MaxWidth;
  padding: Padding;
  content?: any;
}

const maxWidthClass = (mw: MaxWidth) =>
  mw === "full" ? "max-w-full" : mw === "sm" ? "max-w-screen-sm" : mw === "md" ? "max-w-screen-md" : mw === "lg" ? "max-w-screen-lg" : "max-w-screen-xl";
const paddingClass = (p: Padding) => (p === "none" ? "p-0" : p === "sm" ? "p-4" : p === "md" ? "p-6" : "p-8");

export const ContainerBlock: ComponentConfig<{ props: ContainerBlockProps }> = {
  label: "Container",
  fields: {
    id: { type: "text", label: "ID" },
    maxWidth: {
      type: "select",
      label: "Max width",
      options: [
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
        { label: "XL", value: "xl" },
        { label: "Full", value: "full" },
      ],
    },
    padding: {
      type: "select",
      label: "Padding",
      options: [
        { label: "None", value: "none" },
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
      ],
    },
    content: {
      type: "slot",
      label: "Content",
    },
  },
  defaultProps: {
    id: "container_1",
    maxWidth: "xl",
    padding: "lg",
    content: undefined,
  },
  render: ({ maxWidth, padding, content }) => {
    const renderSlot = (slot: ReactNode, key: string) => {
      if (Array.isArray(slot)) return slot.map((child, idx) => <div key={`${key}-${idx}`}>{child}</div>);
      if (typeof slot === "function") return <div key={key}>{(slot as () => ReactNode)()}</div>;
      return <div key={key}>{slot}</div>;
    };

    return (
      <div className={cn("mx-auto", maxWidthClass(maxWidth), paddingClass(padding))}>
        <div className="min-h-[160px] rounded-lg border border-dashed border-slate-200/80 bg-white/80 p-4">
          {renderSlot(content ?? <div className="text-center text-sm text-muted-foreground">Drag blocks here</div>, "content")}
        </div>
      </div>
    );
  },
};
