import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";

type StageState = Record<string, string>;

type ProjectRecord = {
  id: string;
  name: string;
  stack?: string;
  framework?: string;
  state_json?: {
    stages?: StageState;
    last_agent?: string;
    [key: string]: unknown;
  };
  updated_at?: string;
  created_at?: string;
};

interface SessionStatus {
  project_id: string;
  project_name: string;
  session_id: string;
  session_name: string;
  is_blueprint: boolean;
  last_synced?: string;
  created_at?: string;
  state: StageState;
  last_agent?: string;
  progress_percent: number;
}

const STAGE_ORDER = ["intent", "context", "spec", "plan", "tasks", "implementation", "feedback"];
const DEFAULT_API_BASE =
  ((import.meta as any)?.env?.VITE_API_BASE ??
    (typeof window !== "undefined" ? window.location.origin : ""))?.replace(/\/$/, "") || "";

function calculateProgress(stages?: StageState) {
  const values = Object.values(stages ?? {});
  const total = values.length || STAGE_ORDER.length;
  const complete = values.filter((s) => s === "complete" || s === "completed").length;
  const percent = Math.round((complete / total) * 100);
  return { percent: Number.isFinite(percent) ? percent : 0, complete, total };
}

function formatUpdated(timestamp?: string) {
  if (!timestamp) return "Not synced yet";
  const updated = new Date(timestamp);
  const diff = Date.now() - updated.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface IDSEProjectsDashboardProps {
  apiBase?: string;
  currentProject?: string;
  currentSession?: string;
  onProjectSelect?: (projectName: string, projectId: string) => void;
}

export function IDSEProjectsDashboard({
  apiBase = DEFAULT_API_BASE,
  currentProject,
  currentSession,
}: IDSEProjectsDashboardProps) {
  const baseUrl = (apiBase || DEFAULT_API_BASE).replace(/\/$/, "");
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [blueprintStatus, setBlueprintStatus] = useState<SessionStatus | null>(null);
  const [selectedSessionStatus, setSelectedSessionStatus] = useState<SessionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/sync/projects`);
      if (!res.ok) {
        throw new Error(`Failed to load projects (${res.status})`);
      }
      const data = await res.json();
      const list: ProjectRecord[] = data?.projects ?? [];
      setProjects(list);
      if (list.length && !selectedId) {
        setSelectedId(list[0].id);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to load projects";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [baseUrl, selectedId]);

  const loadStatus = useCallback(
    async (projectId: string) => {
      setStatusLoading(true);
      try {
        const res = await fetch(`${baseUrl}/sync/status/${projectId}/__blueprint__`);
        if (!res.ok) {
          throw new Error(`Failed to load blueprint status (${res.status})`);
        }
        const data = (await res.json()) as SessionStatus;
        setBlueprintStatus(data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unable to load blueprint status";
        setError(msg);
      } finally {
        setStatusLoading(false);
      }
    },
    [baseUrl]
  );

  const loadSessionStatus = useCallback(
    async (projectId: string, sessionId: string) => {
      if (!sessionId) {
        setSelectedSessionStatus(null);
        return;
      }

      setStatusLoading(true);
      try {
        const res = await fetch(`${baseUrl}/sync/status/${projectId}/${sessionId}`);
        if (!res.ok) {
          if (res.status === 404) {
            setSelectedSessionStatus({
              project_id: projectId,
              project_name: currentProject || "",
              session_id: sessionId,
              session_name: sessionId,
              is_blueprint: false,
              state: {},
              progress_percent: 0,
            });
            return;
          }
          throw new Error(`Failed to load session status (${res.status})`);
        }
        const data = (await res.json()) as SessionStatus;
        setSelectedSessionStatus(data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unable to load session status";
        setError(msg);
        setSelectedSessionStatus(null);
      } finally {
        setStatusLoading(false);
      }
    },
    [baseUrl, currentProject]
  );

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Sync selected project with sidebar selection
  useEffect(() => {
    if (!projects.length) return;

    // Accept project selection by id, by name, or inferred from currentSession (e.g., "Project/Session" or "Project:Session").
    const inferredProject =
      currentSession?.includes("/") ? currentSession.split("/")[0] :
      currentSession?.includes(":") ? currentSession.split(":")[0] :
      undefined;

    const key = currentProject || inferredProject;

    const proj =
      projects.find((p) => p.id === key) ||
      projects.find((p) => p.name === key);

    if (proj) {
      setSelectedId(proj.id);
    }
  }, [currentProject, currentSession, projects]);

  useEffect(() => {
    if (selectedId) {
      loadStatus(selectedId);
    }
  }, [selectedId, loadStatus]);

  useEffect(() => {
    if (selectedId && currentSession) {
      loadSessionStatus(selectedId, currentSession);
    } else {
      setSelectedSessionStatus(null);
    }
  }, [selectedId, currentSession, loadSessionStatus]);

  const selectedProject = projects.find((p) => p.id === selectedId) || null;
  const blueprintStages = blueprintStatus?.state || ({} as StageState);
  const progress = calculateProgress(blueprintStages);
  const sessionStages = selectedSessionStatus?.state || {};
  const sessionProgress = calculateProgress(sessionStages);

  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">MCP Sync</p>
            <h1 className="text-2xl font-semibold text-slate-900">IDSE Project & Session</h1>
            <p className="text-sm text-slate-600">Driven by sidebar selection.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadProjects}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow hover:-translate-y-0.5 hover:shadow-md transition disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </button>
          </div>
        </header>

        {error && (
          <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        )}

        {loading && projects.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3 text-slate-700">
              <Loader2 className="h-4 w-4 animate-spin text-cyan-600" />
              Loading projects…
            </div>
          </div>
        )}
        {projects.length === 0 && !loading && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-700">No projects found.</p>
            <p className="text-xs text-slate-500 mt-1">
              Push a project with <code className="px-1 bg-slate-100 rounded">idse sync push</code> to see it here.
            </p>
          </div>
        )}

        {selectedProject && (
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Project Status Card (Blueprint) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Project Blueprint Status</p>
                  <p className="text-lg font-semibold text-slate-900">{selectedProject.name}</p>
                  <p className="text-xs text-slate-500">
                    Last agent: {blueprintStatus?.last_agent || "Unknown"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-cyan-700">{progress.percent}% complete</p>
                  <p className="text-xs text-slate-500">
                    {progress.complete} of {progress.total} stages
                  </p>
                </div>
              </div>
              <div className="mt-4 grid gap-2 md:grid-cols-3">
                {STAGE_ORDER.map((stage) => {
                  const status = blueprintStages[stage] || "pending";
                  const badge =
                    status === "complete" || status === "completed"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : status === "in_progress"
                      ? "bg-amber-50 text-amber-800 border-amber-200"
                      : "bg-slate-50 text-slate-700 border-slate-200";
                  return (
                    <div
                      key={stage}
                      className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 shadow-inner shadow-slate-900/5"
                    >
                      <p className="text-sm font-semibold text-slate-900 capitalize">{stage}</p>
                      <span className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${badge}`}>
                        {status.replace(/_/g, " ")}
                      </span>
                    </div>
                  );
                })}
              </div>
              <dl className="mt-4 pt-4 border-t border-slate-200 space-y-2 text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <dt className="text-xs text-slate-500">Project ID</dt>
                  <dd className="font-mono text-xs text-slate-600 truncate max-w-[200px]">{selectedProject.id}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-xs text-slate-500">Last synced</dt>
                  <dd className="text-xs">{blueprintStatus?.last_synced ? new Date(blueprintStatus.last_synced).toLocaleString() : "Unknown"}</dd>
                </div>
              </dl>
            </div>

            {/* Session Status Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    {selectedSessionStatus?.is_blueprint ? "Blueprint Status" : "Session Status"}
                  </p>
                  <p className="text-lg font-semibold text-slate-900">
                    {selectedSessionStatus?.session_name || currentSession || "No session selected"}
                  </p>
                  <p className="text-xs text-slate-500">
                    Project: {currentProject || "Unknown"}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${sessionProgress.percent > 0 ? "text-cyan-700" : "text-slate-400"}`}>
                    {sessionProgress.percent}% complete
                  </p>
                  <p className="text-xs text-slate-500">
                    {sessionProgress.complete} of {sessionProgress.total} stages
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-2 md:grid-cols-3">
                {STAGE_ORDER.map((stage) => {
                  const status = sessionStages[stage] || "pending";
                  const badge =
                    status === "complete" || status === "completed"
                      ? "mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border-emerald-200"
                      : status === "in_progress"
                      ? "mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold bg-blue-50 text-blue-700 border-blue-200"
                      : "mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold bg-slate-50 text-slate-700 border-slate-200";

                  return (
                    <div
                      key={stage}
                      className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 shadow-inner shadow-slate-900/5"
                    >
                      <p className="text-sm font-semibold text-slate-900 capitalize">{stage}</p>
                      <span className={badge}>{status.replace(/_/g, " ")}</span>
                    </div>
                  );
                })}
              </div>

              <dl className="mt-4 pt-4 border-t border-slate-200 space-y-2 text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <dt className="text-xs text-slate-500">Session ID</dt>
                  <dd className="font-mono text-xs text-slate-600 truncate max-w-[200px]">
                    {selectedSessionStatus?.session_id || "N/A"}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-xs text-slate-500">Last synced</dt>
                  <dd className="text-xs">
                    {selectedSessionStatus?.last_synced
                      ? new Date(selectedSessionStatus.last_synced).toLocaleString()
                      : "Not synced"}
                  </dd>
                </div>
                {selectedSessionStatus?.is_blueprint && (
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-lg">📘</span>
                    <span className="text-xs text-slate-600">
                      This is the project-level blueprint tracking meta-planning
                    </span>
                  </div>
                )}
              </dl>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
