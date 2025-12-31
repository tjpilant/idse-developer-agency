import { useEffect, useMemo, useState } from "react";
import { Puck, type Data } from "@measured/puck";
import { puckConfig } from "./config";
import { PublishDialog } from "./PublishDialog";
import { useSearchParams } from "react-router-dom";
import { ApplicationShell } from "./ApplicationShell";
import { RightPanel } from "./components/RightPanel";

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

export function PuckEditor({ hideEmbeddedChat = false }: { hideEmbeddedChat?: boolean } = {}) {
  const migrateZones = (page: any) => {
    if (!page || typeof page !== "object" || !page.zones) return page;
    const newZones: Record<string, any> = {};
    let changed = false;
    for (const [key, value] of Object.entries(page.zones)) {
      // Match keys like "FourColumnLayout-<id>:four-col-col1" and normalize to "...:col1"
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
  const sanitizeData = (raw: any): Data => {
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

  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<Data>(sanitizeData(seedContent));
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadNonce, setLoadNonce] = useState(0);
  type PageSummary = { slug: string; title?: string };
  const [pages, setPages] = useState<PageSummary[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [titleInput, setTitleInput] = useState<string>(seedContent.root?.props?.title ?? "Untitled");
  const [slugInput, setSlugInput] = useState<string>("");
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<"blocks" | "fields" | "outline">("blocks");

  const apiUrl = useMemo(() => `${apiBase.replace(/\/$/, "")}/api/status-pages`, []);

  // Load page from query param (?load=slug) or localStorage
  useEffect(() => {
    const load = async () => {
      const loadSlug = searchParams.get("load");
      const storedSlug = localStorage.getItem("puckPageSlug");
      const slugToLoad = loadSlug || storedSlug;

      if (!slugToLoad) return;

      try {
        setStatus(loadSlug ? "Loading requested page..." : "Loading last published page...");
        const res = await fetch(`${apiUrl}/${encodeURIComponent(slugToLoad)}`);
        if (!res.ok) {
          throw new Error(`Load failed (${res.status})`);
        }
        const raw = await res.json();
        const page = (raw as any).page ?? raw;
        const json = sanitizeData(page);
        setData(json as Data);
        const loadedTitle = (json as any).title ?? (json as any).root?.props?.title ?? "Untitled";
        const loadedSlug = (json as any).slug ?? slugToLoad;
        setTitleInput(loadedTitle);
        setSlugInput(loadedSlug);
        setLoadNonce((prev) => prev + 1);
        localStorage.setItem("puckPageSlug", loadedSlug);
        setStatus(null);

        // Clear the query parameter after loading
        if (loadSlug) {
          setSearchParams({});
        }
      } catch (err) {
        setStatus(err instanceof Error ? err.message : "Load failed");
      }
    };
    load();
  }, [apiUrl, searchParams, setSearchParams]);

  const refreshList = async () => {
    try {
      setLoadingList(true);
      const res = await fetch(apiUrl);
      if (!res.ok) {
        throw new Error(`List failed (${res.status})`);
      }
      const json = await res.json();
      setPages(json.pages ?? []);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "List failed");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    refreshList();
  }, [apiUrl]);

  const openPublishDialog = () => {
    // Pre-fill dialog with current values
    setShowPublishDialog(true);
  };

  const handleDialogPublish = async (title: string, slug: string) => {
    // Update state with dialog values
    setTitleInput(title);
    setSlugInput(slug);

    // Execute publish
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
        slug: finalSlugInput, // may be empty on first publish
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
      refreshList();
      setStatus(`Page published. Slug: ${savedSlug}`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Publish failed");
      throw err; // Re-throw so dialog can handle it
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

  const handleCopyLink = () => {
    const slug = (data as any).slug || slugInput;
    if (!slug) return;
    const link = `${window.location.origin}/${slug}`;
    navigator.clipboard?.writeText(link).then(
      () => setStatus(`Copied link: ${link}`),
      () => setStatus(`Link: ${link}`)
    );
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

  return (
    <>
      <ApplicationShell
        title={titleInput}
        slug={slugInput}
        status={status}
        saving={saving}
        pages={pages}
        onTitleChange={setTitleInput}
        onSlugChange={setSlugInput}
        onPublish={openPublishDialog}
        onOpenPages={refreshList}
        onCopyLink={handleCopyLink}
        onLoadPage={handleLoad}
        onCreateNewPage={handleCreateNew}
      >
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
          <div
            className="flex h-full min-h-0"
            style={{ height: "calc(100vh - 96px)" }} // keep all panels visible after rerenders
          >
            {/* Nav column (commands) */}
            <aside className="hidden lg:flex flex-col bg-white border-r border-slate-200 shadow-sm w-[146px] px-2 shrink-0">
              <div className="flex items-center justify-center h-16 border-b border-slate-200">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                  ID
                </div>
              </div>
              <nav className="px-2 py-3 space-y-1 text-sm font-medium text-slate-900">
                {[
                  { key: "blocks", label: "Blocks", icon: "🧱" },
                  { key: "fields", label: "Fields", icon: "💬" },
                  { key: "outline", label: "Outline", icon: "📦" },
                ].map((item) => (
                  <button
                    key={item.key}
                    className={`w-full flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-slate-50 transition ${
                      activeTab === item.key
                        ? "bg-slate-100 text-indigo-700 border border-indigo-100"
                        : "text-slate-900"
                    }`}
                    onClick={() => setActiveTab(item.key as typeof activeTab)}
                    title={item.label}
                  >
                    <span className="text-xl leading-none" style={{ color: "#0f172a" }}>
                      {item.icon}
                    </span>
                    <span className="text-sm font-semibold" style={{ color: "#0f172a" }}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </nav>
            </aside>

            {/* Controls panel */}
            <div className="w-[315px] min-w-[315px] shrink-0 bg-white border-r border-slate-200 overflow-y-auto">
              {activeTab === "blocks" && <Puck.Components />}
              {activeTab === "fields" && <Puck.Fields />}
              {activeTab === "outline" && <Puck.Outline />}
            </div>

            {/* Center Panel - Puck Canvas */}
            <main className="flex-1 min-w-0 bg-slate-50 overflow-auto min-h-0">
              <div className="mx-auto my-4 w-full">
                <Puck.Preview />
              </div>
            </main>

            {/* Right Panel - chat unless hidden */}
            {!hideEmbeddedChat && (
              <div className="w-[590px] min-w-[590px] shrink-0 bg-white border-l border-slate-200 overflow-y-auto">
                <RightPanel />
              </div>
            )}
          </div>
        </Puck>

      </ApplicationShell>

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
