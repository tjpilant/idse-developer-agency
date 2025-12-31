import { useState } from "react";
import { DashboardLayout } from "./DashboardLayout";
import { LeftNav } from "./LeftNav";
import { WelcomeView } from "./WelcomeView";
import { RightPanel } from "../puck/components/RightPanel";

export interface DashboardState {
  activeWorkspace: "welcome" | "puck" | "md";
  puckSubView: "blocks" | "fields" | "outline" | "pages" | null;
  mdSubView: "open" | "intent" | "spec" | "plan" | "tasks" | "context" | null;
  currentSession: {
    project: string;
    session: string;
  };
}

export function AdminDashboard() {
  const [state, setState] = useState<DashboardState>({
    activeWorkspace: "welcome",
    puckSubView: null,
    mdSubView: null,
    currentSession: {
      project: "IDSE_Core",
      session: "milkdown-crepe",
    },
  });

  const handleWorkspaceChange = (
    workspace: "puck" | "md",
    subView?: string
  ) => {
    setState((prev) => ({
      ...prev,
      activeWorkspace: workspace,
      puckSubView: workspace === "puck" ? (subView as any) : null,
      mdSubView: workspace === "md" ? (subView as any) : null,
    }));
  };

  const renderCenterCanvas = () => {
    if (state.activeWorkspace === "welcome") {
      return <WelcomeView />;
    }

    if (state.activeWorkspace === "puck") {
      // Placeholder for Puck workspace
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900">Puck Editor</h2>
            <p className="text-slate-600 mt-2">
              Active view: {state.puckSubView}
            </p>
            <p className="text-sm text-slate-500 mt-4">
              (Workspace will be implemented in Phase 2)
            </p>
          </div>
        </div>
      );
    }

    if (state.activeWorkspace === "md") {
      // Placeholder for MD workspace
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900">MD Editor</h2>
            <p className="text-slate-600 mt-2">
              Active view: {state.mdSubView}
            </p>
            <p className="text-sm text-slate-500 mt-4">
              (Workspace will be implemented in Phase 3)
            </p>
          </div>
        </div>
      );
    }

    return <WelcomeView />;
  };

  return (
    <DashboardLayout
      leftNav={
        <LeftNav
          activeWorkspace={state.activeWorkspace}
          activeSubView={state.puckSubView || state.mdSubView}
          onWorkspaceChange={handleWorkspaceChange}
        />
      }
      centerCanvas={renderCenterCanvas()}
      rightPanel={<RightPanel />}
    />
  );
}
