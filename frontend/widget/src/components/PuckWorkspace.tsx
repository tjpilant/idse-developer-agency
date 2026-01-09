import { useEffect, useState, useMemo } from "react";
import { Puck, type Data } from "@measured/puck";
import { puckConfig } from "../puck/config";
import { PublishDialog } from "../puck/PublishDialog";
import { ControlPanel } from "./ControlPanel";
import { Button } from "@/components/ui/button";
import { Save, FileText, Plus, Copy } from "lucide-react";

const apiBase = (import.meta as any).env?.VITE_API_BASE ?? "http://localhost:8000";

const seedContent: Data = {
  content: [],
  root: {
    props: {
      title: "Untitled",
    },
  },
  slug: "",
};

type PuckSubView = "blocks" | "fields" | "outline" | "pages";

interface PuckWorkspaceProps {
  activeSubView: PuckSubView;
  onChangeSubView?: (view: PuckSubView) => void;
}

export function PuckWorkspace({ activeSubView, onChangeSubView }: PuckWorkspaceProps) {
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

  const sanitizeData = (raw: any): Data => {
    const page = migrateZones(raw) || {};
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
      zones: undefined,
      content: normalizedContent,
      root: { props: rootProps },
      title: page.title ?? page.root?.title,
      slug: page.slug,
    } as Data;
  };

  const [data, setData] = useState<Data>(sanitizeData(seedContent));
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadNonce, setLoadNonce] = useState(0);
  const [titleInput, setTitleInput] = useState<string>(seedContent.root?.props?.title ?? "Untitled");
  const [slugInput, setSlugInput] = useState<string>("");
  const [showPublishDialog, setShowPublishDialog] = useState(false);

  const apiUrl = useMemo(() => `${apiBase.replace(/\/$/, "")}/api/status-pages`, []);

  // Load last published page from localStorage on mount
  useEffect(() => {
    const load = async () => {
      const storedSlug = localStorage.getItem("puckPageSlug");
      if (!storedSlug) return;

      try {
        setStatus("Loading last published page...");
        const res = await fetch(`${apiUrl}/${encodeURIComponent(storedSlug)}`);
        if (!res.ok) {
          throw new Error(`Load failed (${res.status})`);
        }
        const raw = await res.json();
        const page = (raw as any).page ?? raw;
        const json = sanitizeData(page);
        setData(json as Data);
        const loadedTitle = (json as any).title ?? (json as any).root?.props?.title ?? "Untitled";
        const loadedSlug = (json as any).slug ?? storedSlug;
        setTitleInput(loadedTitle);
        setSlugInput(loadedSlug);
        setLoadNonce((prev) => prev + 1);
        setStatus(null);
      } catch (err) {
        setStatus(err instanceof Error ? err.message : "Load failed");
      }
    };
    load();
  }, [apiUrl]);

  const openPublishDialog = () => {
    setShowPublishDialog(true);
  };

  const handleDialogPublish = async (title: string, slug: string) => {
    setTitleInput(title);
    setSlugInput(slug);
    await handlePublish(title, slug);
  };

  const handlePublish = async (title?: string, slug?: string) => {
    setSaving(true);
    setStatus(null);
    try {
      const existingSlug = ((data as any).slug || "").toLowerCase();
      const finalTitle = title || titleInput || (data as any).title || "Untitled";
      const rawSlugInput = slug || slugInput || existingSlug || "";
      const finalSlugInput = rawSlugInput ? rawSlugInput.toLowerCase() : "";

      const payload = {
        ...data,
        title: finalTitle,
        slug: finalSlugInput,
        schemaVersion: (data as any).schemaVersion ?? 1,
        root: {
          ...(data as any).root,
          title: finalTitle,
        },
      };

      const hasExistingSlug = Boolean(existingSlug);
      const method = hasExistingSlug ? "PUT" : "POST";
      const targetUrl = hasExistingSlug ? `${apiUrl}/${encodeURIComponent(existingSlug)}` : apiUrl;

      const res = await fetch(targetUrl, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Publish failed (${res.status})`);
      }

      const rawResult = await res.json();
      const savedPage = (rawResult as any).page ?? rawResult;
      const savedSlug = ((savedPage.slug ?? finalSlugInput) || savedPage.id || "").toLowerCase();
      const merged = {
        ...(data as any),
        ...(savedPage as any),
        title: savedPage.title ?? finalTitle,
        slug: savedSlug,
        schemaVersion: (savedPage as any).schemaVersion ?? (data as any).schemaVersion ?? 1,
      };

      setData(sanitizeData(merged) as Data);
      setTitleInput(finalTitle);
      setSlugInput(savedSlug);
      if (savedSlug) {
        localStorage.setItem("puckPageSlug", savedSlug);
      }
      setStatus(`Page published: ${savedSlug}`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Publish failed");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleLoad = async (slug: string) => {
    if (!slug) return;
    try {
      setStatus(`Loading page ${slug}...`);
      const res = await fetch(`${apiUrl}/${encodeURIComponent(slug)}`);
      if (!res.ok) {
        throw new Error(`Load failed (${res.status})`);
      }
      const raw = await res.json();
      const page = (raw as any).page ?? raw;
      const json = sanitizeData(page);
      setData(json as Data);
      const loadedTitle = (json as any).title ?? (json as any).root?.props?.title ?? "Untitled";
      const loadedSlug = (json as any).slug ?? slug;
      setTitleInput(loadedTitle);
      setSlugInput(loadedSlug);
      setLoadNonce((prev) => prev + 1);
      localStorage.setItem("puckPageSlug", loadedSlug);
      setStatus(`Loaded page ${loadedSlug}`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Load failed");
    }
  };

  const handleCreateNew = () => {
    const fresh = sanitizeData(seedContent);
    setData(fresh);
    setTitleInput(fresh.root?.props?.title ?? "Untitled");
    setSlugInput(fresh.slug ?? "");
    setLoadNonce((prev) => prev + 1);
    localStorage.removeItem("puckPageSlug");
    setStatus("New page created");
  };

  const handleCopyLink = () => {
    const slug = slugInput || (data as any).slug;
    const base = window.location.origin;
    const url = slug ? `${base}/${slug}` : base;
    navigator.clipboard
      .writeText(url)
      .then(() => setStatus(`Copied link: ${url}`))
      .catch(() => setStatus("Copy failed"));
  };

  return (
    <>
      {/* Toolbar */}
      <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" />
            <div>
              <div className="font-semibold text-slate-900">{titleInput}</div>
              {slugInput && <div className="text-xs text-slate-500">/{slugInput}</div>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleCreateNew} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Page
          </Button>
          <Button onClick={() => onChangeSubView?.("pages")} variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Pages
          </Button>
          <Button onClick={handleCopyLink} variant="outline" size="sm">
            <Copy className="h-4 w-4 mr-2" />
            Copy Link
          </Button>
          <Button onClick={openPublishDialog} size="sm" disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </div>

      {/* Status bar */}
      {status && (
        <div className="bg-indigo-50 border-b border-indigo-200 px-4 py-2 text-sm text-indigo-800">
          {status}
        </div>
      )}

      {/* Puck Editor */}
      <div className="flex-1 overflow-hidden">
        <Puck
          key={`puck-editor-${loadNonce}`}
          config={puckConfig}
          data={data}
          onChange={setData}
          viewports={[
            { width: 360, label: "Mobile" },
            { width: 768, label: "Tablet" },
            { width: 1440, label: "Wide" },
            { width: 1920, label: "Full" },
          ]}
          iframe={{ enabled: false }}
        >
          <div className="flex h-full min-h-0">
            {/* Control Panel (left column) */}
            <ControlPanel activeTab={activeSubView} onLoadPage={handleLoad} />

            {/* Preview Canvas (center column) */}
            <main className="flex-1 min-w-0 bg-slate-50 overflow-auto min-h-0">
              <div className="mx-auto my-4 w-full">
                <Puck.Preview />
              </div>
            </main>
          </div>
        </Puck>
      </div>

      <PublishDialog
        isOpen={showPublishDialog}
        onClose={() => setShowPublishDialog(false)}
        onPublish={handleDialogPublish}
        initialTitle={titleInput || (data as any).root?.title || ""}
        initialSlug={slugInput || (data as any).slug || ""}
      />
    </>
  );
}
