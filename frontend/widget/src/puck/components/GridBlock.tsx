import { ComponentConfig } from "@measured/puck";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface GridBlockProps {
  id: string;
  columns: 1 | 2 | 3 | 4;
  gap: "sm" | "md" | "lg" | "xl";
  col1?: ReactNode;
  col2?: ReactNode;
  col3?: ReactNode;
  col4?: ReactNode;
}

const gapClass = (gap: GridBlockProps["gap"]) => (gap === "sm" ? "gap-2" : gap === "md" ? "gap-4" : gap === "lg" ? "gap-6" : "gap-8");

export const GridBlock: ComponentConfig<{ props: GridBlockProps }> = {
  label: "Grid",
  fields: {
    id: { type: "text", label: "ID" },
    columns: {
      type: "select",
      label: "Columns",
      options: [
        { label: "1", value: 1 },
        { label: "2", value: 2 },
        { label: "3", value: 3 },
        { label: "4", value: 4 },
      ],
    },
    gap: {
      type: "radio",
      label: "Gap",
      options: [
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
        { label: "XL", value: "xl" },
      ],
    },
    col1: { type: "slot", label: "Column 1" },
    col2: { type: "slot", label: "Column 2" },
    col3: { type: "slot", label: "Column 3" },
    col4: { type: "slot", label: "Column 4" },
  },
  defaultProps: {
    id: "grid_1",
    columns: 3,
    gap: "md",
    col1: undefined,
    col2: undefined,
    col3: undefined,
    col4: undefined,
  },
  render: ({ columns, gap, col1, col2, col3, col4 }) => {
    const renderSlot = (slot: ReactNode, key: string) => {
      if (Array.isArray(slot)) return slot.map((child, idx) => <div key={`${key}-${idx}`}>{child}</div>);
      if (typeof slot === "function") return <div key={key}>{(slot as () => ReactNode)()}</div>;
      return <div key={key}>{slot}</div>;
    };

    const slots = [col1, col2, col3, col4].slice(0, columns);

    return (
      <div className={cn("grid", `grid-cols-${columns}`, gapClass(gap), "rounded-lg border border-dashed border-slate-200/80 bg-white/80 p-3")}>
        {slots.map((slot, idx) => (
          <div key={`col-${idx + 1}`} className="min-h-[140px] rounded-md border border-dashed border-slate-200/60 bg-white/60 p-3">
            {renderSlot(slot ?? <div className="text-center text-sm text-muted-foreground">Drag blocks here</div>, `col${idx + 1}`)}
          </div>
        ))}
      </div>
    );
  },
};
