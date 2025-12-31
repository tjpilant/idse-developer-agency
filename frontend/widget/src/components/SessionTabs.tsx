interface SessionTabsProps {
  active: "puck" | "docs";
  onChange: (tab: "puck" | "docs") => void;
}

export function SessionTabs({ active, onChange }: SessionTabsProps) {
  return (
    <div className="flex gap-2 border-b border-slate-200 mb-4">
      {[
        { key: "puck" as const, label: "Page Builder" },
        { key: "docs" as const, label: "Pipeline Docs" },
      ].map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-4 py-2 rounded-t-md text-sm font-semibold ${
            active === tab.key
              ? "bg-white border border-slate-200 border-b-0 text-indigo-700"
              : "text-slate-600 hover:text-slate-800"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
