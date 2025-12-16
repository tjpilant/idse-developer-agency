import { ComponentConfig, DropZone } from "@measured/puck";
import { useId, useState } from "react";

export interface FourColumnLayoutProps {
  layoutId: string;
  col1Width: string;
  col2Width: string;
  col3Width: string;
  col4Width: string;
  gap: string;
}

/**
 * Four evenly spaced drop zones. This uses Puck's DropZone API (compatible with v0.17.x)
 * so users can drag any component into each column without hitting the unsupported
 * "component" field type that caused defaultFields errors.
 */
export const FourColumnLayout: ComponentConfig<FourColumnLayoutProps> = {
  label: "Four Column Layout",
  fields: {
    layoutId: { type: "text", label: "Layout ID (unique per instance)" },
    col1Width: { type: "text", label: "Column 1 width (e.g. 15%)" },
    col2Width: { type: "text", label: "Column 2 width (e.g. 25%)" },
    col3Width: { type: "text", label: "Column 3 width (e.g. 30%)" },
    col4Width: { type: "text", label: "Column 4 width (e.g. 30%)" },
    gap: { type: "text", label: "Gap (e.g. 16px)" },
  },
  defaultProps: {
    layoutId: "four-col",
    col1Width: "15%",
    col2Width: "25%",
    col3Width: "30%",
    col4Width: "30%",
    gap: "16px",
  },
  render: ({ layoutId, col1Width, col2Width, col3Width, col4Width, gap }) => {
    // Ensure each instance gets a stable, unique base id to keep DropZone keys unique even if layoutId is reused
    const reactId = useId();
    const [baseId] = useState(() => `four-col-${reactId}`);
    // Use simple zone names (col1..col4); Puck will prefix with component id internally
    const zone = (suffix: string) => suffix;

    return (
      <div
        className="w-full"
        style={{
          display: "grid",
          gridTemplateColumns: `${col1Width} ${col2Width} ${col3Width} ${col4Width}`,
          gap,
          minHeight: "300px",
        }}
      >
        <div className="min-h-[120px] border border-dashed border-slate-200 rounded-md p-2">
          <DropZone key={`${baseId}-col1`} zone={zone("col1")} />
        </div>
        <div className="min-h-[120px] border border-dashed border-slate-200 rounded-md p-2">
          <DropZone key={`${baseId}-col2`} zone={zone("col2")} />
        </div>
        <div className="min-h-[120px] border border-dashed border-slate-200 rounded-md p-2">
          <DropZone key={`${baseId}-col3`} zone={zone("col3")} />
        </div>
        <div className="min-h-[120px] border border-dashed border-slate-200 rounded-md p-2">
          <DropZone key={`${baseId}-col4`} zone={zone("col4")} />
        </div>
      </div>
    );
  },
};
