import { useMemo, useState } from "react";
import { PuckEditor } from "../puck/PuckEditor";
import { SessionTabs } from "./SessionTabs";
import { MarkdownEditorModal } from "./MarkdownEditorModal";

interface WorkspacePageProps {
  project?: string;
  session?: string;
}

export function WorkspacePage({
  project = "IDSE_Core",
  session = "milkdown-crepe",
}: WorkspacePageProps) {
  const [tab, setTab] = useState<"puck" | "docs">("docs");
  const [editorOpen, setEditorOpen] = useState(false);
  const token = useMemo(
    () =>
      (typeof localStorage !== "undefined" && localStorage.getItem("auth_token")) ||
      (import.meta as any).env?.VITE_MILKDOWN_AUTH_TOKEN ||
      "",
    []
  );

  // Debug: Log token status on mount
  useMemo(() => {
    console.log('WorkspacePage token status:', {
      hasToken: !!token,
      tokenLength: token?.length,
      source: localStorage?.getItem("auth_token") ? 'localStorage' : 'env',
    });
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <SessionTabs active={tab} onChange={setTab} />
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          {tab === "docs" ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <button
                onClick={() => setEditorOpen(true)}
                className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 shadow-md"
              >
                Open Markdown Editor
              </button>
            </div>
          ) : (
            <div className="min-h-[60vh]">
              <PuckEditor hideEmbeddedChat={false} />
            </div>
          )}
        </div>
      </div>

      <MarkdownEditorModal
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        project={project}
        session={session}
        token={token}
        role="collaborator"
      />
    </div>
  );
}
