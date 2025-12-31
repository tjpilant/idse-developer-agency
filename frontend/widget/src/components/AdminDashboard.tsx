import { useState } from "react";
import { DashboardLayout } from "./DashboardLayout";
import { LeftNav } from "./LeftNav";
import { WelcomeView } from "./WelcomeView";
import { PuckWorkspace } from "./PuckWorkspace";
import { MDWorkspace } from "./MDWorkspace";
import { RightPanel } from "../puck/components/RightPanel";

const MILKDOWN_TOKEN = (import.meta as any).env?.VITE_MILKDOWN_AUTH_TOKEN;

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

    if (state.activeWorkspace === "puck" && state.puckSubView) {
      return (
        <div className="flex flex-col h-full">
          <PuckWorkspace activeSubView={state.puckSubView} />
        </div>
      );
    }

    if (state.activeWorkspace === "md") {
      return (
        <div className="flex flex-col h-full">
          <MDWorkspace
            activeSubView={state.mdSubView}
            project={state.currentSession.project}
            session={state.currentSession.session}
            token={MILKDOWN_TOKEN}
            role="owner"
          />
        </div>
      );
    }

    return <WelcomeView />;
  };

  // Generate context info for RightPanel based on active workspace
  const getContextInfo = () => {
    if (state.activeWorkspace === "puck") {
      return `Puck Editor - ${state.puckSubView || ""}`;
    }
    if (state.activeWorkspace === "md") {
      return `MD Editor - ${state.mdSubView || ""}`;
    }
    return undefined;
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
      rightPanel={
        <RightPanel
          project={state.currentSession.project}
          session={state.currentSession.session}
          contextInfo={getContextInfo()}
        />
      }
    />
  );
}
