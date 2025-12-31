import { Puck } from "@measured/puck";
import { PageListView } from "./PageListView";

interface ControlPanelProps {
  activeTab: "blocks" | "fields" | "outline" | "pages";
  onLoadPage: (slug: string) => void;
}

export function ControlPanel({ activeTab, onLoadPage }: ControlPanelProps) {
  return (
    <div className="w-[315px] min-w-[315px] shrink-0 bg-white border-r border-slate-200 overflow-y-auto">
      {activeTab === "blocks" && <Puck.Components />}
      {activeTab === "fields" && <Puck.Fields />}
      {activeTab === "outline" && <Puck.Outline />}
      {activeTab === "pages" && <PageListView onLoadPage={onLoadPage} />}
    </div>
  );
}
