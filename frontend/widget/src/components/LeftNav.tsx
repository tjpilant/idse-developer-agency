import { ChevronDown, ChevronRight, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { SessionSelector } from "@/components/SessionSelector";

interface LeftNavProps {
  activeWorkspace: "welcome" | "puck" | "md" | "projects";
  activeSubView: string | null;
  currentProject: string;
  currentSession: string;
  onWorkspaceChange: (workspace: "puck" | "md" | "projects", subView?: string) => void;
  onSessionChange: (project: string, session: string) => void;
}

export function LeftNav({
  activeWorkspace,
  activeSubView,
  currentProject = "IDSE_Core",
  currentSession = "milkdown-crepe",
  onWorkspaceChange,
  onSessionChange = () => {}
}: LeftNavProps) {
  const [puckExpanded, setPuckExpanded] = useState(false);
  const [mdExpanded, setMdExpanded] = useState(activeWorkspace === "md");
  const [projectCount, setProjectCount] = useState<number | null>(null);
  const apiBase =
    ((import.meta as any).env?.VITE_API_BASE ??
      (typeof window !== "undefined" ? window.location.origin : ""))?.replace(/\/$/, "") || "";
  const chatApiBase =
    ((import.meta as any).env?.VITE_CHAT_API_BASE ??
      (import.meta as any).env?.VITE_API_BASE ??
      (typeof window !== "undefined" ? window.location.origin : ""))?.replace(/\/$/, "") || "";

  useEffect(() => {
    const loadCount = async () => {
      try {
        const res = await fetch(`${apiBase || ""}/sync/projects`);
        if (!res.ok) return;
        const data = await res.json();
        setProjectCount(data?.projects?.length ?? 0);
      } catch (err) {
        console.warn("[LeftNav] Failed to load project count", err);
      }
    };
    loadCount();
  }, [apiBase]);

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100">
      {/* Header */}
      <div className="p-4">
        <h1 className="text-xl font-bold text-white">IDSE Admin</h1>
        <p className="text-xs text-slate-400 mt-1">Developer Agency</p>
      </div>

      <Separator className="bg-slate-700" />

      {/* Session Selector */}
      <SessionSelector
        currentProject={currentProject}
        currentSession={currentSession}
        onSessionChange={(project, session) => {
          onSessionChange(project, session);
          // Persist the active session immediately so backend context follows the selector
          fetch(`${chatApiBase}/api/chat/active-session`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ project, session }),
          }).catch((err) => console.warn("[LeftNav] Failed to persist active session", err));
        }}
        onViewProjects={() => onWorkspaceChange("projects")}
        projectCount={projectCount ?? 0}
      />

      <Separator className="bg-slate-700" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {/* MD Editor */}
          <Collapsible open={mdExpanded} onOpenChange={setMdExpanded}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start text-slate-200 hover:bg-slate-800 hover:text-white"
              >
                {mdExpanded ? (
                  <ChevronDown className="h-4 w-4 mr-2" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-2" />
                )}
                MD Editor
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="ml-6 mt-1 space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className={`w-full justify-start text-sm ${
                  activeWorkspace === "md" && activeSubView === "open"
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
                onClick={() => onWorkspaceChange("md", "open")}
              >
                Open Document
              </Button>
              {currentSession === "__blueprint__" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={`w-full justify-start text-sm ${
                    activeWorkspace === "md" && activeSubView === "meta"
                      ? "bg-slate-800 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                  onClick={() => onWorkspaceChange("md", "meta")}
                >
                  Meta
                </Button>
              )}
              <Separator className="bg-slate-700 my-2" />
              <Button
                variant="ghost"
                size="sm"
                className={`w-full justify-start text-sm ${
                  activeWorkspace === "md" && activeSubView === "intent"
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
                onClick={() => onWorkspaceChange("md", "intent")}
              >
                Intent
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`w-full justify-start text-sm ${
                  activeWorkspace === "md" && activeSubView === "spec"
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
                onClick={() => onWorkspaceChange("md", "spec")}
              >
                Spec
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`w-full justify-start text-sm ${
                  activeWorkspace === "md" && activeSubView === "plan"
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
                onClick={() => onWorkspaceChange("md", "plan")}
              >
                Plan
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`w-full justify-start text-sm ${
                  activeWorkspace === "md" && activeSubView === "tasks"
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
                onClick={() => onWorkspaceChange("md", "tasks")}
              >
                Tasks
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`w-full justify-start text-sm ${
                  activeWorkspace === "md" && activeSubView === "context"
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
                onClick={() => onWorkspaceChange("md", "context")}
              >
                Context
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`w-full justify-start text-sm ${
                  activeWorkspace === "md" && activeSubView === "implementation"
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
                onClick={() => onWorkspaceChange("md", "implementation")}
              >
                Implementation
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`w-full justify-start text-sm ${
                  activeWorkspace === "md" && activeSubView === "feedback"
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
                onClick={() => onWorkspaceChange("md", "feedback")}
              >
                Feedback
              </Button>
            </CollapsibleContent>
          </Collapsible>

          <Separator className="bg-slate-700 my-2" />

          {/* Puck Editor */}
          <Collapsible open={puckExpanded} onOpenChange={setPuckExpanded}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start text-slate-200 hover:bg-slate-800 hover:text-white"
              >
                {puckExpanded ? (
                  <ChevronDown className="h-4 w-4 mr-2" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-2" />
                )}
                Puck Editor
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="ml-6 mt-1 space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className={`w-full justify-start text-sm ${
                  activeWorkspace === "puck" && activeSubView === "blocks"
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
                onClick={() => onWorkspaceChange("puck", "blocks")}
              >
                Blocks
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`w-full justify-start text-sm ${
                  activeWorkspace === "puck" && activeSubView === "fields"
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
                onClick={() => onWorkspaceChange("puck", "fields")}
              >
                Fields
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`w-full justify-start text-sm ${
                  activeWorkspace === "puck" && activeSubView === "outline"
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
                onClick={() => onWorkspaceChange("puck", "outline")}
              >
                Outline
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`w-full justify-start text-sm ${
                  activeWorkspace === "puck" && activeSubView === "pages"
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
                onClick={() => onWorkspaceChange("puck", "pages")}
              >
                Published Pages
              </Button>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center">
            <User className="h-4 w-4 text-slate-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Developer</p>
            <p className="text-xs text-slate-400 truncate">admin@idse.dev</p>
          </div>
        </div>
      </div>
    </div>
  );
}
