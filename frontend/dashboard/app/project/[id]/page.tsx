import Link from "next/link";
import { AlertTriangle, ArrowLeft, Clock3, Layers, ShieldCheck, User } from "lucide-react";
import { calculateProgress, fetchProjectDetail } from "@/lib/api";
import { ProgressDonut } from "@/components/ProgressDonut";
import { ProjectArtifacts } from "@/components/ProjectArtifacts";
import { RefreshButton } from "@/components/RefreshButton";

const PIPELINE_ORDER = ["intent", "context", "spec", "plan", "tasks", "implementation", "feedback"] as const;

const statusClasses = (status: string) => {
  switch (status) {
    case "complete":
    case "completed":
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "in_progress":
      return "bg-amber-50 text-amber-800 border-amber-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
};

const formatStatus = (status: string) => status.replace(/_/g, " ");

const formatTimestamp = (timestamp?: string) =>
  timestamp ? new Date(timestamp).toLocaleString() : "Not synced yet";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;
    const project = await fetchProjectDetail(id);

    if (!project?.project_id) {
      throw new Error("Project not found");
    }

    const stages = project.state_json?.stages || {};
    const { percent, total, complete } = calculateProgress(stages);
    const stageList = PIPELINE_ORDER.map((stage) => ({
      stage,
      status: stages[stage] || "pending",
    }));

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
        <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to projects
              </Link>
              <h1 className="text-3xl font-semibold text-slate-900">{project.name}</h1>
              <p className="text-sm text-slate-600">
                Stack: <span className="font-semibold text-slate-900">{project.stack || "python"}</span>{" "}
                • Framework:{" "}
                <span className="font-semibold text-slate-900">
                  {project.framework || "agency-swarm"}
                </span>
              </p>
              <p className="text-xs text-slate-500">
                Project ID: <span className="font-mono text-slate-700">{project.project_id}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <RefreshButton />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-900/5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Status</p>
                  <p className="text-xl font-semibold text-slate-900">{percent}% complete</p>
                  <p className="text-sm text-slate-600">
                    {complete} of {total} stages marked complete
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  <User className="h-4 w-4 text-cyan-600" />
                  Last agent: {project.state_json?.last_agent || "Unknown"}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Last synced</p>
                  <p className="font-semibold text-slate-900">{formatTimestamp(project.updated_at)}</p>
                </div>
                <div className="rounded-xl bg-cyan-50 p-3">
                  <p className="text-xs text-cyan-700">Artifacts received</p>
                  <p className="font-semibold text-cyan-900">
                    {Object.keys(project.artifacts || {}).length} files
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm shadow-slate-900/5">
              <ProgressDonut percent={percent} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm shadow-slate-900/5">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-cyan-600" />
                <p className="text-sm font-semibold text-slate-900">Pipeline stages</p>
              </div>
              <span className="text-xs text-slate-500">
                Tracks Intent → Feedback per IDSE pipeline
              </span>
            </div>
            <div className="grid gap-3 px-5 py-4 md:grid-cols-3">
              {stageList.map(({ stage, status }) => (
                <div
                  key={stage}
                  className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 shadow-inner shadow-slate-900/5"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900 capitalize">{stage}</p>
                    <ShieldCheck className="h-4 w-4 text-slate-400" />
                  </div>
                  <span
                    className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses(
                      status
                    )}`}
                  >
                    {formatStatus(status)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <ProjectArtifacts artifacts={project.artifacts || {}} />

          <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm shadow-slate-900/5">
            <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
              <Clock3 className="h-4 w-4 text-cyan-600" />
              <p className="text-sm font-semibold text-slate-900">State JSON</p>
              <span className="text-xs text-slate-500">Live payload from Supabase</span>
            </div>
            <div className="overflow-auto bg-slate-950/90 text-slate-100">
              <pre className="whitespace-pre p-4 text-sm">
                {JSON.stringify(project.state_json ?? {}, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load project";
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800 shadow-sm">
            <AlertTriangle className="h-5 w-5" />
            <div>
              <p className="text-sm font-semibold">Error loading project</p>
              <p className="text-sm">{message}</p>
            </div>
          </div>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }
}
