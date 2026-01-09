import { ComponentConfig } from "@measured/puck";
import { ReactNode } from "react";

export interface FourColumnLayoutProps {
  col1?: ReactNode;
  col2?: ReactNode;
  col3?: ReactNode;
  col4?: ReactNode;
  col1Width: string;
  col2Width: string;
  col3Width: string;
  col4Width: string;
  gap: string;
}

export const FourColumnLayout: ComponentConfig<{ props: FourColumnLayoutProps }> = {
  label: "Four Column Layout",
  fields: {
    // Slots require Puck v0.19+. Each slot is its own drop target.
    col1: { type: "slot", label: "Column 1" },
    col2: { type: "slot", label: "Column 2" },
    col3: { type: "slot", label: "Column 3" },
    col4: { type: "slot", label: "Column 4" },
    col1Width: { type: "text", label: "Column 1 width (e.g. 15%)" },
    col2Width: { type: "text", label: "Column 2 width (e.g. 25%)" },
    col3Width: { type: "text", label: "Column 3 width (e.g. 30%)" },
    col4Width: { type: "text", label: "Column 4 width (e.g. 30%)" },
    gap: { type: "text", label: "Gap (e.g. 16px)" },
  },
  defaultProps: {
    col1Width: "15%",
    col2Width: "25%",
    col3Width: "30%",
    col4Width: "30%",
    gap: "16px",
  },
  render: ({ col1, col2, col3, col4, col1Width, col2Width, col3Width, col4Width, gap }) => {
    const renderSlot = (slot: ReactNode, key: string) => {
      // Slots can be arrays or functions; normalize for React rendering
      if (Array.isArray(slot)) {
        return slot.map((child, idx) => <div key={`${key}-${idx}`}>{child}</div>);
      }
      if (typeof slot === "function") {
        const rendered = (slot as () => ReactNode)();
        return <div key={key}>{rendered}</div>;
      }
      return <div key={key}>{slot}</div>;
    };

    return (
      <div
        className="w-full rounded-3xl border border-slate-200/70 bg-white/80 p-4 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.2)]"
        style={{
          display: "grid",
          gridTemplateColumns: `${col1Width} ${col2Width} ${col3Width} ${col4Width}`,
          gap,
          minHeight: "300px",
        }}
      >
        <div className="min-h-[120px] rounded-2xl border border-dashed border-slate-200/80 bg-white/80 p-3">
          {renderSlot(col1, "col1")}
        </div>
        <div className="min-h-[120px] rounded-2xl border border-dashed border-slate-200/80 bg-white/80 p-3">
          {renderSlot(col2, "col2")}
        </div>
        <div className="min-h-[120px] rounded-2xl border border-dashed border-slate-200/80 bg-white/80 p-3">
          {renderSlot(col3, "col3")}
        </div>
        <div className="min-h-[120px] rounded-2xl border border-dashed border-slate-200/80 bg-white/80 p-3">
          {renderSlot(col4, "col4")}
        </div>
      </div>
    );
  },
};
