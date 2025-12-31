import { ReactNode } from "react";

interface DashboardLayoutProps {
  leftNav: ReactNode;
  centerCanvas: ReactNode;
  rightPanel: ReactNode;
}

export function DashboardLayout({
  leftNav,
  centerCanvas,
  rightPanel,
}: DashboardLayoutProps) {
  return (
    <div className="grid grid-cols-[240px_1fr_590px] h-screen overflow-hidden">
      {/* Left Navigation */}
      <div className="border-r border-slate-200 overflow-y-auto">
        {leftNav}
      </div>

      {/* Center Canvas */}
      <div className="bg-slate-50 overflow-y-auto">
        {centerCanvas}
      </div>

      {/* Right Panel (Chat) */}
      <div className="bg-white border-l border-slate-200 overflow-y-auto">
        {rightPanel}
      </div>
    </div>
  );
}
