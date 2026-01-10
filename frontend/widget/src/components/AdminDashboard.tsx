import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "./DashboardLayout";
import { LeftNav } from "./LeftNav";
import { WelcomeView } from "./WelcomeView";
import { PuckWorkspace } from "./PuckWorkspace";
import { MDWorkspace } from "./MDWorkspace";
import { RightPanel } from "../puck/components/RightPanel";
import { IDSEProjectsDashboard } from "./IDSEProjectsDashboard";

const MILKDOWN_TOKEN = (import.meta as any).env?.VITE_MILKDOWN_AUTH_TOKEN;
const API_BASE = (import.meta as any).env?.VITE_API_BASE ?? "http://localhost:8000";

export interface DashboardState {
  activeWorkspace: "welcome" | "puck" | "md" | "projects";
  puckSubView: "blocks" | "fields" | "outline" | "pages" | null;
  mdSubView: "open" | "intent" | "spec" | "plan" | "tasks" | "context" | "implementation" | "feedback" | null;
  mdCurrentPath: string | null;
  currentSession: {
    project: string;
    session: string;
  };
}

interface AdminDashboardProps {
  initialWorkspace?: DashboardState["activeWorkspace"];
}

export function AdminDashboard({ initialWorkspace }: AdminDashboardProps) {
  const navigate = useNavigate();
  const [state, setState] = useState<DashboardState>({
    activeWorkspace: initialWorkspace ?? "puck",
    puckSubView: "blocks",
    mdSubView: null,
    mdCurrentPath: null,
    currentSession: {
      project: "IDSE_Core",
      session: "milkdown-crepe",
    },
  });

  const handleWorkspaceChange = (
    workspace: DashboardState["activeWorkspace"],
    subView?: string
  ) => {
    if (workspace === "projects") {
      navigate("/admin/projects");
    } else {
      navigate("/admin");
    }

    setState((prev) => ({
      ...prev,
      activeWorkspace: workspace,
      puckSubView: workspace === "puck" ? (subView as any) : null,
      mdSubView: workspace === "md" ? (subView as any) : null,
    }));
  };

  const handleSessionChange = useCallback(async (project: string, session: string) => {
    console.log("[AdminDashboard] Session change requested:", { project, session });

    // Update local state immediately for UI responsiveness
    setState((prev) => ({
      ...prev,
      currentSession: { project, session },
    }));

    // Persist to backend
    try {
      const url = `${API_BASE}/api/projects/active/session`;
      console.log("[AdminDashboard] Persisting session to:", url);
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project, session }),
      });

      console.log("[AdminDashboard] Persist response status:", response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("[AdminDashboard] Failed to persist session change:", errorText);
      } else {
        console.log("[AdminDashboard] Session persisted successfully");
      }
    } catch (error) {
      console.error("[AdminDashboard] Failed to persist session change:", error);
    }
  }, []);

  // Load active session on mount
  useEffect(() => {
    const loadActiveSession = async () => {
      try {
        const url = `${API_BASE}/api/projects/active/session`;
        console.log("[AdminDashboard] Loading active session from:", url);
        const response = await fetch(url);
        console.log("[AdminDashboard] Load response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("[AdminDashboard] Loaded session data:", data);
          setState((prev) => ({
            ...prev,
            currentSession: {
              project: data.project || "IDSE_Core",
              session: data.session_id || "milkdown-crepe",
            },
          }));
          console.log("[AdminDashboard] State updated with session:", data.project, "/", data.session_id);
        }
      } catch (error) {
        console.error("[AdminDashboard] Failed to load active session:", error);
        // Keep default values on error
      }
    };

    loadActiveSession();
  }, []);

  const renderCenterCanvas = () => {
    if (state.activeWorkspace === "welcome") {
      return <WelcomeView />;
    }

    if (state.activeWorkspace === "puck" && state.puckSubView) {
      return (
        <div className="flex flex-col h-full">
          <PuckWorkspace
            activeSubView={state.puckSubView}
            onChangeSubView={(view) =>
              setState((prev) => ({
                ...prev,
                puckSubView: view,
              }))
            }
          />
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
            onPathChange={handleMDPathChange}
          />
        </div>
      );
    }

    if (state.activeWorkspace === "projects") {
      return <IDSEProjectsDashboard apiBase={API_BASE} onProjectSelect={handleProjectSelect} />;
    }

    return <WelcomeView />;
  };

  // Generate context info for RightPanel based on active workspace
  const getContextInfo = () => {
    if (state.activeWorkspace === "puck") {
      return `Puck Editor - ${state.puckSubView || ""}`;
    }
    if (state.activeWorkspace === "md") {
      if (state.mdCurrentPath) {
        return `MD Editor - ${state.mdCurrentPath}`;
      }
      return `MD Editor - ${state.mdSubView || ""}`;
    }
    if (state.activeWorkspace === "projects") {
      return "IDSE Projects Dashboard";
    }
    return undefined;
  };

  const handleMDPathChange = useCallback((path: string | null) => {
    setState((prev) => ({ ...prev, mdCurrentPath: path }));
  }, []);

  const handleProjectSelect = useCallback(async (projectName: string, projectId: string) => {
    console.log("[AdminDashboard] Project selected from dashboard:", { projectName, projectId });

    // Look up the latest session for this project
    try {
      const response = await fetch(`${API_BASE}/api/chat/latest-session/${projectName}`);
      if (response.ok) {
        const data = await response.json();
        const sessionId = data.session_id || "default";
        console.log("[AdminDashboard] Latest session for project:", sessionId);

        // Update session state
        await handleSessionChange(projectName, sessionId);

        // Switch to MD workspace to show the chat
        setState((prev) => ({
          ...prev,
          activeWorkspace: "md",
          mdSubView: "intent",
        }));
      } else {
        console.error("[AdminDashboard] Failed to fetch latest session");
        // Fallback to "default" session
        await handleSessionChange(projectName, "default");
        setState((prev) => ({
          ...prev,
          activeWorkspace: "md",
          mdSubView: "intent",
        }));
      }
    } catch (error) {
      console.error("[AdminDashboard] Error fetching latest session:", error);
      // Fallback behavior
      await handleSessionChange(projectName, "default");
      setState((prev) => ({
        ...prev,
        activeWorkspace: "md",
        mdSubView: "intent",
      }));
    }
  }, [handleSessionChange]);

  return (
    <DashboardLayout
      leftNav={
        <LeftNav
          activeWorkspace={state.activeWorkspace}
          activeSubView={state.puckSubView || state.mdSubView}
          currentProject={state.currentSession.project}
          currentSession={state.currentSession.session}
          onWorkspaceChange={handleWorkspaceChange}
          onSessionChange={handleSessionChange}
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
