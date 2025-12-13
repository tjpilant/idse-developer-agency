import { useMemo, useState } from "react";
import { Puck, type PuckValue } from "@measured/puck";
import { puckConfig } from "./config";

const apiBase = (import.meta as any).env?.VITE_API_BASE ?? "http://localhost:8000";

const seedContent: PuckValue = {
  content: [
    {
      type: "Hero",
      props: {
        heading: "IDSE Developer Agency",
        subheading: "Visual page builder + embedded AI chat widget.",
        ctaText: "Open chat",
        ctaLink: "#chat",
      },
    },
    {
      type: "Card",
      props: {
        title: "Intent-driven",
        description: "Guide every step with IDSE pipeline stages.",
        icon: "🎯",
      },
    },
    {
      type: "ChatWidget",
      props: {
        apiBase,
        position: "bottom-right",
        primaryColor: "#4F46E5",
        title: "IDSE Assistant",
        placeholder: "Ask about IDSE or your codebase...",
      },
    },
  ],
  root: {
    title: "IDSE Landing Page",
  },
};

export function PuckEditor() {
  const [data, setData] = useState<PuckValue>(seedContent);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Use trailing slash to avoid FastAPI redirect for POST (307)
  const apiUrl = useMemo(() => `${apiBase.replace(/\/$/, "")}/api/pages/`, []);

  const handlePublish = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error(`Publish failed (${res.status})`);
      }

      const result = await res.json();
      setStatus(`Page published. ID: ${result.id}`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-indigo-600 font-semibold">
            Puck Visual Editor
          </p>
          <h1 className="text-xl font-semibold text-slate-900">
            Drag-and-drop builder with CopilotKit widget
          </h1>
          <p className="text-sm text-slate-500">
            API base: <code className="bg-slate-100 px-2 py-1 rounded">{apiUrl}</code>
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handlePublish}
            disabled={saving}
            className="inline-flex items-center rounded-lg bg-indigo-600 text-white px-4 py-2 font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Publishing..." : "Publish page"}
          </button>
          {status && <span className="text-sm text-slate-700">{status}</span>}
        </div>
      </header>

      <div className="h-[calc(100vh-80px)]">
        <Puck
          config={puckConfig}
          data={data}
          onChange={setData}
          onPublish={handlePublish}
        />
      </div>
    </div>
  );
}
