import { useEffect, useState } from "react";
import { Render, type Data } from "@measured/puck";
import { puckConfig } from "./config";
import { useParams, Link } from "react-router-dom";

const apiBase = (import.meta as any).env?.VITE_API_BASE ?? "http://localhost:8000";

interface PuckRendererProps {
  pageId?: string;
  data?: Data;
}

export function PuckRenderer({ pageId: propPageId, data: initialData }: PuckRendererProps) {
  const params = useParams();
  const pageId = propPageId ?? params.pageId;
  const [data, setData] = useState<Data | undefined>(initialData);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!pageId || initialData) return;

    const load = async () => {
      try {
        setStatus("Loading...");
        const res = await fetch(`${apiBase.replace(/\/$/, "")}/api/pages/${pageId}`);
        if (!res.ok) {
          throw new Error(`Failed to load page (${res.status})`);
        }
        const json = await res.json();
        setData(json);
        setStatus(null);
      } catch (err) {
        setStatus(err instanceof Error ? err.message : "Load failed");
      }
    };

    load();
  }, [pageId, initialData]);

  if (status) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-700">
        {status}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-700">
        No data loaded.
      </div>
    );
  }

  // Extract page ID from data if available
  const currentPageId = (data as any)?.id || pageId;
  const pageTitle = (data as any)?.title || (data as any)?.root?.title || "Untitled";

  return (
    <div className="min-h-screen bg-white">
      {/* Edit button bar */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <Link
          to="/"
          className="px-4 py-2 rounded-lg bg-slate-700 text-white font-semibold hover:bg-slate-800 shadow-lg transition-colors"
        >
          ← Home
        </Link>
        {currentPageId && (
          <Link
            to={`/editor?load=${currentPageId}`}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-lg transition-colors"
          >
            ✏️ Edit "{pageTitle}"
          </Link>
        )}
      </div>

      {/* Page content */}
      <Render config={puckConfig} data={data} />
    </div>
  );
}
