import { useEffect, useState } from "react";
import { Render, type PuckValue } from "@measured/puck";
import { puckConfig } from "./config";
import { useParams } from "react-router-dom";

const apiBase = (import.meta as any).env?.VITE_API_BASE ?? "http://localhost:8000";

interface PuckRendererProps {
  pageId?: string;
  data?: PuckValue;
}

export function PuckRenderer({ pageId: propPageId, data: initialData }: PuckRendererProps) {
  const params = useParams();
  const pageId = propPageId ?? params.pageId;
  const [data, setData] = useState<PuckValue | undefined>(initialData);
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

  return (
    <div className="min-h-screen bg-white">
      <Render config={puckConfig} data={data} />
    </div>
  );
}
