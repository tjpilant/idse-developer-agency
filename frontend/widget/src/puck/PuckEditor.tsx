import { useEffect, useMemo, useState } from "react";
import { Puck, type Data } from "@measured/puck";
import { puckConfig } from "./config";
import { PublishDialog } from "./PublishDialog";
import { useSearchParams } from "react-router-dom";
import { ApplicationShell } from "./ApplicationShell";
import { RightPanel } from "./components/RightPanel";
import { SessionList } from "./components/SessionList";
import { StatusPane } from "./components/StatusPane";
import type { SessionStatus } from "./components/types";

const apiBase = (import.meta as any).env?.VITE_API_BASE ?? "http://localhost:8000";

const seedContent: Data = {
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
    // ChatWidget removed from seed - add it manually via Puck if needed
  ],
  root: {
    title: "IDSE Landing Page",
  },
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

  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<Data>(seedContent);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pages, setPages] = useState<Array<{ id: string; title: string; slug?: string }>>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [titleInput, setTitleInput] = useState<string>(seedContent.root?.title ?? "Untitled");
  const [slugInput, setSlugInput] = useState<string>("");
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const statusBrowserEnabled = (import.meta as any).env?.VITE_STATUS_BROWSER_ENABLED !== "false";
  const [activeTab, setActiveTab] = useState<"blocks" | "fields" | "outline" | "status">("blocks");
  const [selectedSession, setSelectedSession] = useState<SessionStatus | null>(null);

  // Use trailing slash to avoid FastAPI redirect for POST (307)
  const apiUrl = useMemo(() => `${apiBase.replace(/\/$/, "")}/api/pages/`, []);

  // Load page from query param (?load=id) or localStorage
  useEffect(() => {
    const load = async () => {
      // Check for ?load=pageId query parameter first
      const loadPageId = searchParams.get("load");
      const storedId = localStorage.getItem("puckPageId");
      const pageIdToLoad = loadPageId || storedId;

      if (!pageIdToLoad) return;

      try {
        setStatus(loadPageId ? "Loading requested page..." : "Loading last published page...");
        const res = await fetch(`${apiUrl}${pageIdToLoad}`);
        if (!res.ok) {
          throw new Error(`Load failed (${res.status})`);
        }
        const json = migrateZones(await res.json());
        setData(json as Data);
        setTitleInput((json as any).title ?? json?.root?.title ?? "Untitled");
        setSlugInput((json as any).slug ?? "");
        localStorage.setItem("puckPageId", pageIdToLoad);
        setStatus(null);

        // Clear the query parameter after loading
        if (loadPageId) {
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

  // Save without changing slug: requires an existing id
  const handleSaveExisting = async () => {
    if (!(data as any).id) {
      // If no id yet, fallback to normal publish/create
      await handlePublish();
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      const pageId = (data as any).id;
      const finalTitle = titleInput || (data as any).title || (data as any).root?.title || "Untitled";
      const finalSlug = slugInput || (data as any).slug || "";
      const payload = {
        ...data,
        title: finalTitle,
        slug: finalSlug,
        overwrite: true,
        root: {
          ...(data as any).root,
          title: finalTitle,
        },
      };

      const res = await fetch(`${apiUrl}${pageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(`Save failed (${res.status})`);
      }
      const result = await res.json();
      setData((prev) => ({
        ...(prev as any),
        id: result.id,
        title: finalTitle,
        slug: result.slug ?? finalSlug,
        root: { ...(prev as any).root, title: finalTitle },
      }));
      setSlugInput(result.slug ?? finalSlug);
      setTitleInput(finalTitle);
      setStatus("Saved");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (title?: string, slug?: string) => {
    setSaving(true);
    setStatus(null);
    try {
      const hasId = Boolean((data as any).id);
      const targetUrl = hasId ? `${apiUrl}${(data as any).id}` : apiUrl;
      const method = hasId ? "PUT" : "POST";

      // Use provided params or fall back to state
      const finalTitle = title || titleInput || (data as any).title || "Untitled";
      const finalSlug = slug || slugInput || (data as any).slug || "";

      const payload = {
        ...data,
        title: finalTitle,
        slug: finalSlug,
        root: {
          ...(data as any).root,
          title: finalTitle,
        },
      };

      const res = await fetch(targetUrl, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Publish failed (${res.status})`);
      }

      const result = await res.json();
      // Persist the page id locally so reloads keep the current page
      if (result.id) {
        localStorage.setItem("puckPageId", result.id);
        refreshList();
      }
      setData((prev) => ({
        ...(prev as any),
        id: result.id,
        title: finalTitle,
        slug: result.slug ?? finalSlug,
        root: {
          ...(prev as any).root,
          title: finalTitle,
        },
      }));
      setSlugInput(result.slug ?? finalSlug);
      setTitleInput(finalTitle);
      setStatus(`Page published. Slug: ${result.slug ?? finalSlug ?? result.id}`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Publish failed");
      throw err; // Re-throw so dialog can handle it
    } finally {
      setSaving(false);
    }
  };

  const handleLoad = async (id: string) => {
    if (!id) return;
    try {
      setStatus(`Loading page ${id}...`);
      const res = await fetch(`${apiUrl}${id}`);
      if (!res.ok) {
        throw new Error(`Load failed (${res.status})`);
      }
      const json = migrateZones(await res.json());
      setData(json as Data);
      setTitleInput((json as any).title ?? json?.root?.title ?? "Untitled");
      setSlugInput((json as any).slug ?? "");
      localStorage.setItem("puckPageId", id);
      setStatus(`Loaded page ${(json as any).slug ?? id}`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Load failed");
    }
  };

  const handleCopyLink = () => {
    const id = (data as any).id;
    const slug = (data as any).slug;
    if (!id && !slug) return;
    const link = `${window.location.origin}/page/${slug || id}`;
    navigator.clipboard?.writeText(link).then(
      () => setStatus(`Copied link: ${link}`),
      () => setStatus(`Link: ${link}`)
    );
  };

  const handleCreateNew = () => {
    setData(seedContent);
    setTitleInput("Untitled");
    setSlugInput("");
    localStorage.removeItem("puckPageId");
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
        onTitleChange={(value) => setTitleInput(value)}
        onSlugChange={(value) => setSlugInput(value)}
        onPublish={openPublishDialog}
        onSave={handleSaveExisting}
        onOpenPages={refreshList}
        onCopyLink={handleCopyLink}
        onLoadPage={handleLoad}
        onCreateNewPage={handleCreateNew}
      >
        <Puck
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
              <nav className="px-2 py-3 space-y-1 text-sm font-medium text-slate-600">
                {[
                  { key: "blocks", label: "Blocks", icon: "🧱" },
                  { key: "fields", label: "Fields", icon: "💬" },
                  { key: "outline", label: "Outline", icon: "📦" },
                  ...(statusBrowserEnabled ? [{ key: "status", label: "Status Browser", icon: "📊" }] : []),
                ].map((item) => (
                  <button
                    key={item.key}
                    className={`w-full flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-slate-50 transition ${
                      activeTab === item.key ? "bg-slate-100 text-indigo-700 border border-indigo-100" : "text-slate-700"
                    }`}
                    onClick={() => setActiveTab(item.key as typeof activeTab)}
                    title={item.label}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="hidden xl:inline">{item.label}</span>
                  </button>
                ))}
              </nav>
            </aside>

            {/* Controls panel */}
            <div className="w-[315px] min-w-[315px] shrink-0 bg-white border-r border-slate-200 overflow-y-auto">
              {activeTab === "blocks" && <Puck.Components />}
              {activeTab === "fields" && <Puck.Fields />}
              {activeTab === "outline" && <Puck.Outline />}
              {activeTab === "status" && statusBrowserEnabled && (
                <SessionList
                  apiBase={apiBase}
                  onSelectSession={(_, session) => setSelectedSession(session)}
                  selectedSessionId={selectedSession?.session_id}
                />
              )}
            </div>

            {/* Center Panel - Puck Canvas */}
            <main className="flex-1 min-w-0 bg-slate-50 overflow-auto min-h-0">
              <div className="mx-auto my-4 w-full">
                {activeTab === "status" && statusBrowserEnabled ? <StatusPane sessionData={selectedSession} /> : <Puck.Preview />}
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
