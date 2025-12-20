import { SessionStatus } from "./types";

interface StatusPaneProps {
  sessionData: SessionStatus | null;
}

const stageLabels: Record<string, string> = {
  intent: "Intent",
  context: "Context",
  spec: "Spec",
  plan: "Plan",
  testPlan: "Test Plan",
  tasks: "Tasks",
  feedback: "Feedback",
};

export function StatusPane({ sessionData }: StatusPaneProps) {
  if (!sessionData) {
    return <div className="p-4 text-sm text-slate-500">Select a session to view status.</div>;
  }

  const stages = sessionData.stages || {};
  const validation = sessionData.validation;

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div>
        <div className="text-xs font-semibold text-slate-500 uppercase">Session</div>
        <div className="text-lg font-semibold text-slate-900">{sessionData.name || sessionData.session_id}</div>
        <div className="text-xs text-slate-500">
          {sessionData.owner ? `Owner: ${sessionData.owner}` : ""}
          {sessionData.created_at ? ` · ${new Date(sessionData.created_at * 1000).toLocaleString()}` : ""}
        </div>
      </div>

      <div className="border rounded-2xl border-slate-200/70 overflow-hidden bg-white/90 shadow-[0_18px_50px_-35px_rgba(15,23,42,0.35)]">
        <div className="bg-gradient-to-r from-slate-50 to-white px-3 py-2 text-xs font-semibold text-slate-600 uppercase">
          Stages
        </div>
        <table className="min-w-full text-sm">
          <thead className="border-b border-slate-200/70 bg-white">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Stage</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Status</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Requires Input</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(stageLabels).map(([key, label]) => {
              const st = stages[key];
              const exists = st?.exists;
              const reqCount = st?.requires_input_count ?? 0;
              return (
                <tr key={key} className="border-b border-slate-100/70">
                  <td className="px-3 py-2 text-slate-800">{label}</td>
                  <td className="px-3 py-2">
                    {exists ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700">
                        ✓ <span className="text-xs">Present</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-600">
                        ✗ <span className="text-xs">Missing</span>
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {exists ? (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
                          reqCount > 0 ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {reqCount} marker{reqCount === 1 ? "" : "s"}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="border rounded-2xl border-slate-200/70 overflow-hidden bg-white/90 shadow-[0_18px_50px_-35px_rgba(15,23,42,0.35)]">
        <div className="bg-gradient-to-r from-slate-50 to-white px-3 py-2 text-xs font-semibold text-slate-600 uppercase">
          Validation
        </div>
        {validation ? (
          <div className="p-3 space-y-1 text-sm">
            <div>
              Status:{" "}
              {validation.passed ? (
                <span className="text-emerald-700 font-semibold">Passed</span>
              ) : (
                <span className="text-red-600 font-semibold">Failed</span>
              )}
            </div>
            <div>Errors: {validation.errors}</div>
            <div>Warnings: {validation.warnings}</div>
            {validation.timestamp && <div>Last Run: {validation.timestamp}</div>}
          </div>
        ) : (
          <div className="p-3 text-sm text-slate-500">No validation summary available.</div>
        )}
      </div>
    </div>
  );
}
