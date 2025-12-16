import { useEffect, useMemo, useState } from "react";
import { ProjectSessionsResponse, SessionStatus } from "./types";

interface SessionListProps {
  onSelectSession: (projectId: string, session: SessionStatus) => void;
  selectedSessionId?: string;
  apiBase?: string;
}

export function SessionList({ onSelectSession, selectedSessionId, apiBase }: SessionListProps) {
  const baseUrl = useMemo(() => (apiBase || "http://localhost:8000").replace(/\/$/, ""), [apiBase]);
  const [projects, setProjects] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setError(null);
        const res = await fetch(`${baseUrl}/api/projects/`);
        if (!res.ok) throw new Error(`List projects failed (${res.status})`);
        const json = await res.json();
        const list = Array.isArray(json.projects) ? json.projects : [];
        setProjects(list);
        if (list.length > 0) {
          setSelectedProject((prev) => prev ?? list[0]);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load projects");
      }
    };
    loadProjects();
  }, [baseUrl]);

  useEffect(() => {
    if (!selectedProject) {
      setSessions([]);
      return;
    }
    const loadSessions = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${baseUrl}/api/projects/${selectedProject}/sessions`);
        if (!res.ok) throw new Error(`List sessions failed (${res.status})`);
        const json = (await res.json()) as ProjectSessionsResponse;
        setSessions(json.sessions ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load sessions");
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };
    loadSessions();
  }, [baseUrl, selectedProject]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-slate-200">
        <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Projects</div>
        {projects.length > 0 ? (
          <select
            className="w-full rounded-md border border-slate-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={selectedProject ?? ""}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            {projects.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        ) : (
          <div className="text-sm text-slate-500">No projects found</div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-500 uppercase">Sessions</div>
          {loading && <span className="text-xs text-indigo-600">Loading…</span>}
        </div>
        {error && <div className="p-3 text-sm text-red-600">{error}</div>}
        {!error && sessions.length === 0 && !loading && (
          <div className="p-3 text-sm text-slate-500">No sessions</div>
        )}
        <ul className="divide-y divide-slate-200">
          {sessions.map((s) => (
            <li key={s.session_id}>
              <button
                className={`w-full text-left px-3 py-2 transition ${
                  selectedSessionId === s.session_id ? "bg-indigo-50 text-indigo-700" : "hover:bg-slate-50"
                }`}
                onClick={() => onSelectSession(selectedProject ?? "", s)}
              >
                <div className="text-sm font-semibold">{s.name || s.session_id}</div>
                <div className="text-xs text-slate-500">
                  {s.owner ? `Owner: ${s.owner}` : ""}
                  {s.created_at ? ` · ${new Date(s.created_at * 1000).toLocaleString()}` : ""}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
