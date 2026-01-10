"use client";

import { useMemo, useState } from "react";
import { FileText } from "lucide-react";

const ARTIFACT_ORDER = [
  { key: "intent_md", label: "Intent" },
  { key: "context_md", label: "Context" },
  { key: "spec_md", label: "Spec" },
  { key: "plan_md", label: "Plan" },
  { key: "tasks_md", label: "Tasks" },
  { key: "implementation_md", label: "Implementation" },
  { key: "feedback_md", label: "Feedback" },
] as const;

export function ProjectArtifacts({ artifacts }: { artifacts: Record<string, string> }) {
  const available = useMemo(
    () => ARTIFACT_ORDER.filter((entry) => artifacts[entry.key]),
    [artifacts]
  );

  const [active, setActive] = useState<string>(
    available[0]?.key ?? ARTIFACT_ORDER[0]?.key ?? "intent_md"
  );

  const content = artifacts[active] || "No content available for this artifact.";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 shadow-sm shadow-slate-900/5">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3">
        <FileText className="h-4 w-4 text-cyan-600" />
        <p className="text-sm font-semibold text-slate-900">Artifacts</p>
        <span className="text-xs text-slate-500">Click a tab to view content</span>
      </div>
      <div className="flex flex-wrap gap-2 px-4 py-3">
        {(available.length ? available : ARTIFACT_ORDER).map((entry) => (
          <button
            key={entry.key}
            onClick={() => setActive(entry.key)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              active === entry.key
                ? "bg-slate-900 text-slate-50 shadow-sm"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {entry.label}
          </button>
        ))}
      </div>
      <div className="overflow-auto border-t border-slate-100 bg-slate-950/90 text-slate-100">
        <pre className="whitespace-pre-wrap p-4 text-sm leading-relaxed">{content}</pre>
      </div>
    </div>
  );
}
