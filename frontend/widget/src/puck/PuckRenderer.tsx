import { useEffect, useState } from "react";
import { Render, type Data } from "@measured/puck";
import { puckConfig } from "./config";
import { useParams, Link } from "react-router-dom";

const apiBase = (import.meta as any).env?.VITE_API_BASE ?? "http://localhost:8000";

interface PuckRendererProps {
  pageSlug?: string;
  data?: Data;
}

export function PuckRenderer({ pageSlug: propPageSlug, data: initialData }: PuckRendererProps) {
  const params = useParams();
  const rawSlug = propPageSlug ?? params.slug;
  const pageSlug = rawSlug ? rawSlug.toLowerCase() : undefined;
  const migrateZones = (page: any) => {
    if (!page || typeof page !== "object" || !page.zones) return page;
    const newZones: Record<string, any> = {};
    let changed = false;
    for (const [key, value] of Object.entries(page.zones)) {
      const match = key.match(/^(?<prefix>[^:]+:)(?:four-col-)?(?<col>col[1-4])$/);
      if (match?.groups) {
        const normalizedKey = `${match.groups.prefix}${match.groups.col}`;
        newZones[normalizedKey] = value;
        if (normalizedKey !== key) changed = true;
      } else {
        newZones[key] = value;
      }
    }
    if (!changed) return page;
    return { ...page, zones: newZones };
  };

  /**
   * Normalize legacy Puck data into the current schema:
   * - move root.* into root.props.*
   * - strip legacy zones (DropZone) to avoid drag crashes
   * - ensure ids and props exist on all components
   */
  const sanitizeData = (raw: any): Data | undefined => {
    if (!raw) return undefined;
    const page = migrateZones(raw) || {};

    // Normalize root
    const rootProps = { ...(page.root?.props ?? {}) };
    if (page.root) {
      for (const [k, v] of Object.entries(page.root)) {
        if (k !== "props") {
          (rootProps as any)[k] = v;
        }
      }
    }

    const contentArray = Array.isArray(page.content) ? page.content : [];
    const normalizedContent = contentArray.map((item: any, idx: number) => {
      const id = item?.id ?? `auto-${idx}-${Date.now()}`;
      const props = item?.props ?? {};
      return { ...item, id, props };
    });

    return {
      ...page,
      zones: undefined, // drop legacy drop-zone payloads
      content: normalizedContent,
      root: { props: rootProps },
      title: page.title ?? page.root?.title,
      slug: page.slug,
    } as Data;
  };

  const [data, setData] = useState<Data | undefined>(sanitizeData(initialData));
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!pageSlug || initialData) return;

    const load = async () => {
      try {
        setStatus("Loading...");
        const res = await fetch(`${apiBase.replace(/\/$/, "")}/api/status-pages/${pageSlug}`);
        if (!res.ok) {
          throw new Error(`Failed to load page (${res.status})`);
        }
        const raw = await res.json();
        const page = (raw as any).page ?? raw;
        const json = sanitizeData(page);
        setData(json as Data);
        setStatus(null);
      } catch (err) {
        setStatus(err instanceof Error ? err.message : "Load failed");
      }
    };

    load();
  }, [pageSlug, initialData]);

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
  const currentSlug = (data as any)?.slug || pageSlug;
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
        {currentSlug && (
          <Link
            to={`/editor?load=${currentSlug}`}
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
