"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Loader2, RefreshCw, Server, Sparkles, Waves } from "lucide-react";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectRecord, calculateProgress, fetchProjects } from "@/lib/api";

const POLL_INTERVAL = 10000;

export default function Home() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProjects();
      setProjects(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load projects";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        const data = await fetchProjects();
        if (active) {
          setProjects(data);
          setError(null);
        }
      } catch (err) {
        if (active) {
          const message = err instanceof Error ? err.message : "Unable to load projects";
          setError(message);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, POLL_INTERVAL);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const stats = useMemo(() => {
    const totalStages = projects.reduce((acc, project) => {
      const stages = project.state_json?.stages || {};
      const count = Object.keys(stages).length || 7;
      return acc + count;
    }, 0);

    const completed = projects.reduce((acc, project) => {
      const stages = project.state_json?.stages || {};
      return (
        acc +
        Object.values(stages).filter((status) =>
          ["complete", "completed"].includes(status)
        ).length
      );
    }, 0);

    const averageProgress =
      projects.length === 0
        ? 0
        : Math.round(
            projects
              .map((project) => calculateProgress(project.state_json?.stages).percent)
              .reduce((a, b) => a + b, 0) / projects.length
          );

    return {
      totalProjects: projects.length,
      completionRate: totalStages ? Math.round((completed / totalStages) * 100) : 0,
      averageProgress,
    };
  }, [projects]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-slate-50 px-3 py-1 text-xs font-semibold shadow-lg shadow-slate-900/10">
                <Waves className="h-4 w-4 text-cyan-200" />
              Live Supabase MCP Dashboard
            </div>
            <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
              IDSE Agency Core Projects
            </h1>
            <p className="max-w-2xl text-base text-slate-600">
              Monitor pipeline completion, track agent activity, and drill into project
              artifacts synced via the MCP backend at{" "}
              <span className="font-semibold text-slate-900">http://localhost:8000</span>.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={loadProjects}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-slate-50 px-4 py-2 text-sm font-semibold shadow-md shadow-slate-900/15 transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Refreshing
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </>
                )}
              </button>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 backdrop-blur">
                <Server className="h-4 w-4 text-cyan-600" />
                Target: http://localhost:8000
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-md shadow-slate-900/5 backdrop-blur">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Snapshot</p>
                <p className="text-3xl font-semibold text-slate-900">{stats.totalProjects}</p>
                <p className="text-sm text-slate-600">projects tracked</p>
              </div>
              <Sparkles className="h-6 w-6 text-cyan-600" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Avg. Progress</p>
                <p className="text-lg font-semibold text-slate-900">{stats.averageProgress}%</p>
              </div>
              <div className="rounded-xl bg-cyan-50 p-3">
                <p className="text-xs text-cyan-700">Completion Rate</p>
                <p className="text-lg font-semibold text-cyan-900">{stats.completionRate}%</p>
              </div>
            </div>
          </div>
        </header>

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 shadow-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {loading && projects.length === 0 ? (
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-6 py-8 shadow-sm">
            <Loader2 className="h-5 w-5 animate-spin text-cyan-600" />
            <div>
              <p className="text-sm font-medium text-slate-900">Loading projects</p>
              <p className="text-sm text-slate-600">Fetching latest data from Agency Core...</p>
            </div>
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-6 py-10 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-900">No projects found</p>
            <p className="mt-2 text-sm text-slate-600">
              Push a project from the CLI with <code className="rounded bg-slate-900/5 px-2 py-1">idse sync push</code>{" "}
              to see it appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
