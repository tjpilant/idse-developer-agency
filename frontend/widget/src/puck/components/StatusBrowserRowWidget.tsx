import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ComponentConfig } from "@measured/puck";
import type { ProjectSessionsResponse, SessionStatus, StageStatus } from "./types";

interface StatusBrowserRowProps {
  projectId?: string;
  sessionId?: string;
  title?: string;
}

const apiBase = (import.meta as any).env?.VITE_API_BASE ?? "http://localhost:8000";
const StageOrder = ["intent", "context", "spec", "plan", "testPlan", "tasks", "feedback"] as const;
const TOGGLE_EVENT = "idse:status-browser-toggle";

export const StatusBrowserRowWidget: ComponentConfig<StatusBrowserRowProps> = {
  label: "Status Browser (Row)",
  fields: {},
  defaultProps: {
    title: "Status Browser",
    projectId: "",
    sessionId: "",
  },
  render: ({ title, projectId, sessionId }) => {
    const baseUrl = useMemo(() => apiBase.replace(/\/$/, ""), []);
    const [open, setOpen] = useState(false);
    const [anchorRect, setAnchorRect] = useState<{
      top: number;
      left: number;
      right: number;
      bottom: number;
      width: number;
      height: number;
    } | null>(null);
    const [projects, setProjects] = useState<string[]>([]);
    const [selectedProject, setSelectedProject] = useState<string | null>(projectId || null);
    const [sessions, setSessions] = useState<SessionStatus[]>([]);
    const [selectedSession, setSelectedSession] = useState<string | null>(sessionId || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load projects once
    useEffect(() => {
      const loadProjects = async () => {
        try {
          const res = await fetch(`${baseUrl}/api/projects/`);
          if (!res.ok) throw new Error(`Projects fetch failed (${res.status})`);
          const json = (await res.json()) as { projects?: string[] };
          const list = json.projects ?? [];
          setProjects(list);
          if (!selectedProject && list.length > 0) {
            setSelectedProject(list[0]);
          }
        } catch (e) {
          setProjects([]);
          setError(e instanceof Error ? e.message : "Failed to load projects");
        }
      };
      loadProjects();
    }, [baseUrl, selectedProject]);

    // Load sessions for selected project
    useEffect(() => {
      const loadSessions = async () => {
        if (!selectedProject) return;
        setLoading(true);
        setError(null);
        try {
          const res = await fetch(`${baseUrl}/api/projects/${selectedProject}/sessions`);
          if (!res.ok) throw new Error(`Sessions fetch failed (${res.status})`);
          const json = (await res.json()) as ProjectSessionsResponse;
          const list = json.sessions ?? [];
          setSessions(list);
          // pick session
          let chosenId: string | null = selectedSession;
          if (chosenId) {
            const exists = list.find((s) => s.session_id === chosenId);
            if (!exists) {
              chosenId = null;
            }
          }
          if (!chosenId && list.length > 0) {
            // latest by created_at
            const sorted = list
              .slice()
              .sort((a, b) => (b.created_at ?? 0) - (a.created_at ?? 0));
            chosenId = sorted[0]?.session_id ?? null;
          }
          setSelectedSession(chosenId);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Failed to load sessions");
          setSessions([]);
          setSelectedSession(null);
        } finally {
          setLoading(false);
        }
      };
      loadSessions();
    }, [baseUrl, selectedProject]);

    const currentSession = sessions.find((s) => s.session_id === selectedSession) || null;

    const renderStage = (key: string, st?: StageStatus) => {
      const exists = st?.exists;
      const req = st?.requires_input_count ?? 0;
      const statusBadge = exists ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[11px]">
          ✓ Present
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 text-red-700 px-2 py-0.5 text-[11px]">
          ✗ Missing
        </span>
      );

      const markerBadge = exists ? (
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${
            req > 0 ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {req} marker{req === 1 ? "" : "s"}
        </span>
      ) : null;

      return (
        <div
          key={key}
          className="grid grid-cols-3 items-center gap-2 py-1.5 border-b border-slate-100 last:border-0 text-xs text-slate-700"
        >
          <div className="capitalize">{key}</div>
          <div className="flex items-center">{statusBadge}</div>
          <div className="flex items-center justify-end">{markerBadge}</div>
        </div>
      );
    };

    const panelContent = (
      <div className="rounded-2xl border border-slate-200/70 bg-white/90 shadow-[0_18px_50px_-35px_rgba(15,23,42,0.35)] p-4 w-full max-w-md">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-xs font-semibold uppercase text-slate-500">Status Browser</div>
            <div className="text-sm font-semibold text-slate-900">{title || "Status Browser"}</div>
          </div>
          {loading && <div className="text-xs text-slate-500">Loading…</div>}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/70 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <div className="text-xs font-semibold uppercase text-slate-500">Project</div>
            <select
              className="border border-slate-200/70 rounded-lg bg-white px-2 py-1 text-sm w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={selectedProject ?? ""}
              onChange={(e) => setSelectedProject(e.target.value || null)}
            >
              {projects.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase text-slate-500">Session</div>
            <select
              className="border border-slate-200/70 rounded-lg bg-white px-2 py-1 text-sm w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={selectedSession ?? ""}
              onChange={(e) => setSelectedSession(e.target.value || null)}
            >
              {sessions.map((s) => (
                <option key={s.session_id} value={s.session_id}>
                  {s.name || s.session_id}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className="text-xs text-red-600 mb-2">{error}</div>}

        <div className="text-xs font-semibold uppercase text-slate-500 mb-1">Status</div>
        {!currentSession && (
          <div className="text-sm text-slate-500">Select a project/session to view status.</div>
        )}
        {currentSession && (
          <div className="border border-slate-200/70 rounded-xl divide-y divide-slate-200/70 bg-white/80">
            {StageOrder.map((s) => renderStage(s, (currentSession.stages as any)?.[s]))}
            {currentSession.validation && (
              <div className="p-2 text-xs text-slate-700">
                Validation:{" "}
                {currentSession.validation.passed ? (
                  <span className="text-emerald-700 font-semibold">Passed</span>
                ) : (
                  <span className="text-red-600 font-semibold">Failed</span>
                )}
                {" · "}Errors {currentSession.validation.errors} · Warnings {currentSession.validation.warnings}
              </div>
            )}
          </div>
        )}
      </div>
    );

    const drawer = open
      ? createPortal(
          <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setOpen(false)}>
            <div
              className="absolute bg-white/95 border border-slate-200/70 rounded-2xl shadow-[0_30px_80px_-40px_rgba(15,23,42,0.6)] p-4"
              style={{
                top: Math.max(12, anchorRect ? anchorRect.top : 80),
                left: anchorRect ? Math.min(anchorRect.right + 12, window.innerWidth - 420) : undefined,
                right: anchorRect ? undefined : 12,
                width: 400,
                maxWidth: "90vw",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {panelContent}
            </div>
          </div>,
          document.body
        )
      : null;

    return (
      <>
        <div className="w-full space-y-3">
          <button
            className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-800 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-28px_rgba(15,23,42,0.45)]"
            type="button"
            onClick={(e) => {
              const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
              setAnchorRect({
                top: rect.top,
                left: rect.left,
                right: rect.right,
                bottom: rect.bottom,
                width: rect.width,
                height: rect.height,
              });
              setOpen((v) => !v);
            }}
          >
            {title || "Status Browser"}
          </button>
        </div>
        {drawer}
      </>
    );
  },
};
