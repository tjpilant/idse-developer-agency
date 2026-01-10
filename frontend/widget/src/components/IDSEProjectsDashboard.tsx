import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, Clock3, Loader2, RefreshCw, Sparkles } from "lucide-react";

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

type ProjectStatus = {
  project_id: string;
  project_name: string;
  last_synced?: string;
  created_at?: string;
  state?: StageState;
  last_agent?: string;
};

const STAGE_ORDER = ["intent", "context", "spec", "plan", "tasks", "implementation", "feedback"];
const DEFAULT_API_BASE = (import.meta as any)?.env?.VITE_API_BASE ?? "http://localhost:8000";

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
  onProjectSelect?: (projectName: string, projectId: string) => void;
}

export function IDSEProjectsDashboard({
  apiBase = DEFAULT_API_BASE,
  onProjectSelect
}: IDSEProjectsDashboardProps) {
  const baseUrl = (apiBase || DEFAULT_API_BASE).replace(/\/$/, "");
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus | null>(null);
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
        const res = await fetch(`${baseUrl}/sync/status/${projectId}`);
        if (!res.ok) {
          throw new Error(`Failed to load project status (${res.status})`);
        }
        const data = (await res.json()) as ProjectStatus;
        setSelectedStatus(data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unable to load project status";
        setError(msg);
      } finally {
        setStatusLoading(false);
      }
    },
    [baseUrl]
  );

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    if (selectedId) {
      loadStatus(selectedId);
    }
  }, [selectedId, loadStatus]);

  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const averageProgress =
      totalProjects === 0
        ? 0
        : Math.round(
            projects.reduce((acc, project) => {
              const { percent } = calculateProgress(project.state_json?.stages);
              return acc + percent;
            }, 0) / totalProjects
          );
    return { totalProjects, averageProgress };
  }, [projects]);

  const selectedProject = projects.find((p) => p.id === selectedId) || null;
  const stages =
    selectedStatus?.state || selectedProject?.state_json?.stages || ({} as StageState);
  const progress = calculateProgress(stages);

  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">MCP Sync</p>
            <h1 className="text-2xl font-semibold text-slate-900">IDSE Projects Dashboard</h1>
            <p className="text-sm text-slate-600">
              Live data from {baseUrl}/sync using Supabase as the source of truth.
            </p>
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
            <div className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200">
              <Sparkles className="h-4 w-4 text-cyan-600" />
              {stats.totalProjects} projects
            </div>
          </div>
        </header>

        {error && (
          <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {loading && projects.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3 text-slate-700">
                <Loader2 className="h-4 w-4 animate-spin text-cyan-600" />
                Loading projects…
              </div>
            </div>
          ) : projects.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-700">No projects found.</p>
              <p className="text-xs text-slate-500 mt-1">
                Push a project with <code className="px-1 bg-slate-100 rounded">idse sync push</code> to see it here.
              </p>
            </div>
          ) : (
            projects.map((project) => {
              const { percent } = calculateProgress(project.state_json?.stages);
              return (
                <button
                  key={project.id}
                  onClick={() => {
                    setSelectedId(project.id);
                    // Trigger navigation to chat with this project
                    if (onProjectSelect) {
                      onProjectSelect(project.name, project.id);
                    }
                  }}
                  className={`group w-full rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${
                    selectedId === project.id ? "border-cyan-500 shadow-lg" : "border-slate-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{project.name}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {project.stack || "unknown stack"} • {project.framework || "agency-swarm"}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-700">
                      {percent}% <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-[width]"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="mt-3 text-xs text-slate-600 flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-slate-400" />
                    Updated {formatUpdated(project.updated_at)}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {selectedProject && (
          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Status</p>
                  <p className="text-lg font-semibold text-slate-900">{selectedProject.name}</p>
                  <p className="text-xs text-slate-500">
                    Last agent: {selectedStatus?.last_agent || selectedProject.state_json?.last_agent || "Unknown"}
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
                  const status = stages[stage] || "pending";
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
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">Sync status</p>
                {statusLoading && <Loader2 className="h-4 w-4 animate-spin text-cyan-600" />}
              </div>
              <dl className="mt-3 space-y-2 text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <dt>Project ID</dt>
                  <dd className="font-mono text-xs text-slate-600 truncate max-w-[200px]">{selectedProject.id}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt>Last synced</dt>
                  <dd>{selectedStatus?.last_synced ? new Date(selectedStatus.last_synced).toLocaleString() : "Unknown"}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt>Created</dt>
                  <dd>
                    {selectedStatus?.created_at
                      ? new Date(selectedStatus.created_at).toLocaleString()
                      : formatUpdated(selectedProject.created_at)}
                  </dd>
                </div>
              </dl>
              <div className="mt-4 text-xs text-slate-500">
                {"Data reflects the `/sync/status/{project_id}` endpoint. Refresh to pull the latest from Supabase."}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
