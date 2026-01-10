import Link from "next/link";
import { ArrowUpRight, Clock3, FolderKanban, Sparkles } from "lucide-react";
import { ProjectRecord, calculateProgress } from "@/lib/api";

const PIPELINE_ORDER = ["intent", "context", "spec", "plan", "tasks", "implementation", "feedback"] as const;

const badgeColor = (status: string) => {
  switch (status) {
    case "complete":
    case "completed":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    case "in_progress":
      return "bg-amber-50 text-amber-700 border border-amber-200";
    default:
      return "bg-slate-50 text-slate-600 border border-slate-200";
  }
};

const formatUpdated = (timestamp?: string) => {
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
};

export function ProjectCard({ project }: { project: ProjectRecord }) {
  const stages = project.state_json?.stages || {};
  const { percent } = calculateProgress(stages);
  const orderedStages = PIPELINE_ORDER.map((stage) => ({
    stage,
    status: stages[stage] || "pending",
  }));

  return (
    <Link
      href={`/project/${project.id}`}
      className="group relative block overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-[0_10px_60px_rgba(15,23,42,0.08)] backdrop-blur transition hover:-translate-y-1 hover:shadow-[0_20px_80px_rgba(15,23,42,0.14)]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/70 via-white to-indigo-50/60 opacity-90" />
      <div className="relative flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-600/10 text-cyan-700">
              <FolderKanban className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{project.name}</h3>
              <p className="text-sm text-slate-600">
                {project.stack || "Unknown stack"} • {project.framework || "Unspecified framework"}
              </p>
            </div>
          </div>
          <span className="flex items-center gap-2 rounded-full bg-slate-900 text-slate-50 px-3 py-1 text-xs font-medium">
            <Sparkles className="h-4 w-4 text-cyan-200" />
            {percent}% complete
          </span>
        </div>

        <div className="h-2 w-full rounded-full bg-slate-200">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 transition-[width]"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {orderedStages.map(({ stage, status }) => (
            <span
              key={stage}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize shadow-sm ${badgeColor(status)}`}
            >
              {stage} · {status.replace(/_/g, " ")}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs font-medium text-slate-600">
          <span className="flex items-center gap-1.5">
            <Clock3 className="h-4 w-4 text-slate-400" />
            Updated {formatUpdated(project.updated_at)}
          </span>
          <span className="flex items-center gap-1.5 text-cyan-700">
            View details
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
