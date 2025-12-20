import { useEffect, useMemo, useState } from "react";
import { ComponentConfig } from "@measured/puck";
import type { ProjectSessionsResponse, SessionStatus, StageStatus } from "./types";

interface StatusBrowserWidgetProps {
  projectId: string;
  sessionId?: string;
  title?: string;
  showValidation?: boolean;
  startOpen?: boolean;
  buttonLabel?: string;
}

const apiBase = (import.meta as any).env?.VITE_API_BASE ?? "http://localhost:8000";

const StageOrder = ["intent", "context", "spec", "plan", "testPlan", "tasks", "feedback"] as const;

export const StatusBrowserWidget: ComponentConfig<StatusBrowserWidgetProps> = {
  label: "Status Browser (Inline)",
  fields: {
    projectId: { type: "text", label: "Project ID" },
    sessionId: { type: "text", label: "Session ID (optional)" },
    title: { type: "text", label: "Title" },
    showValidation: { type: "checkbox", label: "Show validation summary" },
    startOpen: { type: "checkbox", label: "Start open" },
    buttonLabel: { type: "text", label: "Toggle button label" },
  },
  defaultProps: {
    projectId: "",
    sessionId: "",
    title: "Project Status",
    showValidation: true,
    startOpen: false,
    buttonLabel: "Status Browser",
  },
  render: ({ projectId, sessionId, title, showValidation, startOpen, buttonLabel }) => {
    const baseUrl = useMemo(() => apiBase.replace(/\/$/, ""), []);
    const [projects, setProjects] = useState<string[]>([]);
    const [session, setSession] = useState<SessionStatus | null>(null);
    const [effectiveProjectId, setEffectiveProjectId] = useState<string | null>(projectId || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(Boolean(startOpen));

    // Load project list
    useEffect(() => {
      const loadProjects = async () => {
        try {
          const res = await fetch(`${baseUrl}/api/projects/`);
          if (!res.ok) throw new Error(`Projects fetch failed (${res.status})`);
          const json = (await res.json()) as { projects?: string[] };
          const list = json.projects ?? [];
          setProjects(list);
          if (!effectiveProjectId && list.length > 0) {
            setEffectiveProjectId(list[0]);
          }
        } catch (e) {
          setProjects([]);
          setError(e instanceof Error ? e.message : "Failed to load projects");
        }
      };
      loadProjects();
    }, [baseUrl]);

    useEffect(() => {
      const load = async () => {
        setLoading(true);
        setError(null);

        let finalProjectId = projectId || effectiveProjectId;
        if (!finalProjectId) {
          setEffectiveProjectId(null);
          setError("Project ID required (no projects found)");
          setSession(null);
          setLoading(false);
          return;
        }

        setEffectiveProjectId(finalProjectId);

        try {
          const res = await fetch(`${baseUrl}/api/projects/${finalProjectId}/sessions`);
          if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
          const json = (await res.json()) as ProjectSessionsResponse;
          const sessions = json.sessions ?? [];
          let chosen: SessionStatus | undefined;
          if (sessionId) {
            chosen = sessions.find((s) => s.session_id === sessionId);
          }
          if (!chosen && sessions.length > 0) {
            // pick latest by created_at or fallback to first
            chosen =
              sessions
                .slice()
                .sort((a, b) => (b.created_at ?? 0) - (a.created_at ?? 0))[0] || sessions[0];
          }
          setSession(chosen ?? null);
          if (!chosen) {
            setError("No sessions found");
          }
        } catch (e) {
          setError(e instanceof Error ? e.message : "Failed to load status");
          setSession(null);
        } finally {
          setLoading(false);
        }
      };
      load();
    }, [baseUrl, projectId, effectiveProjectId, sessionId]);

    const renderStage = (key: string, st?: StageStatus) => {
      const exists = st?.exists;
      const req = st?.requires_input_count ?? 0;
      return (
        <div key={key} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
          <div className="text-sm text-slate-800">{key}</div>
          <div className="flex items-center gap-2">
            {exists ? (
              <span className="text-emerald-700 text-xs inline-flex items-center gap-1">✓ Present</span>
            ) : (
              <span className="text-red-600 text-xs inline-flex items-center gap-1">✗ Missing</span>
            )}
            {exists && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                  req > 0 ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {req} marker{req === 1 ? "" : "s"}
              </span>
            )}
          </div>
        </div>
      );
    };

    return (
      <div className="w-full rounded-2xl border border-slate-200/70 bg-white/90 shadow-[0_18px_50px_-35px_rgba(15,23,42,0.35)] overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200/70 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="text-xs font-semibold uppercase text-slate-500">Status Browser</div>
            <div className="text-sm font-semibold text-slate-800">{title || "Project Status"}</div>
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow"
          >
            {open ? "Hide" : buttonLabel || "Status Browser"}
          </button>
        </div>
        {!open && <div className="p-4 text-sm text-slate-500">Click the button to view status.</div>}

        {open && (
          <div className="p-4 space-y-3">
            {!effectiveProjectId && <div className="text-sm text-slate-500">Project not set. Choose one below.</div>}
            {effectiveProjectId && loading && <div className="text-sm text-slate-500">Loading status…</div>}
            {effectiveProjectId && error && <div className="text-sm text-red-600">Status error: {error}</div>}
            {effectiveProjectId && !loading && !error && !session && (
              <div className="text-sm text-slate-500">No session data available.</div>
            )}

            {session && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="text-xs font-semibold uppercase text-slate-500">Project</div>
                    <select
                      className="border border-slate-200/70 rounded-lg bg-white px-2 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 w-full"
                      value={effectiveProjectId ?? ""}
                      onChange={(e) => setEffectiveProjectId(e.target.value || null)}
                    >
                      {projects.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-semibold uppercase text-slate-500">Session</div>
                    <div className="text-sm text-slate-800">{session.name || session.session_id}</div>
                  </div>
                </div>

                <div className="text-xs font-semibold uppercase text-slate-500">Stages</div>
                <div className="border border-slate-200/70 rounded-xl divide-y divide-slate-200/70 bg-white/80">
                  {StageOrder.map((s) => renderStage(s, (session.stages as any)?.[s]))}
                </div>

                {showValidation && session.validation && (
                  <div className="pt-2">
                    <div className="text-xs font-semibold uppercase text-slate-500 mb-1">Validation</div>
                    <div className="text-sm text-slate-800">
                      Status:{" "}
                      {session.validation.passed ? (
                        <span className="text-emerald-700 font-semibold">Passed</span>
                      ) : (
                        <span className="text-red-600 font-semibold">Failed</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-600">
                      Errors: {session.validation.errors} · Warnings: {session.validation.warnings}
                      {session.validation.timestamp ? ` · ${session.validation.timestamp}` : ""}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  },
};
