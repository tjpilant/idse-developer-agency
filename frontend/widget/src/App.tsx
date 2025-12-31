import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { PuckEditor } from "./puck/PuckEditor";
import { PuckRenderer } from "./puck/PuckRenderer";
import { PuckShellPage } from "./puck/PuckShellPage";
import { WorkspacePage } from "./components/WorkspacePage";
import { AdminDashboard } from "./components/AdminDashboard";

const apiBase = (import.meta as any).env?.VITE_API_BASE ?? "http://localhost:8000";

function RendererLanding() {
  const [pages, setPages] = useState<Array<{ slug: string; title?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${apiBase.replace(/\/$/, "")}/api/status-pages`);
        if (!res.ok) throw new Error(`List failed (${res.status})`);
        const json = await res.json();
        setPages(json.pages ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load pages");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <header className="mb-8">
          <p className="text-indigo-600 font-semibold uppercase tracking-[0.2em] mb-2">
            Renderer
          </p>
          <h1 className="text-3xl font-bold text-slate-900">View a published page</h1>
          <p className="mt-3 text-slate-600">
            Click a page to open <code className="px-1 bg-slate-100 rounded">/&lt;slug&gt;</code>.
          </p>
        </header>
        {loading ? (
          <div className="text-slate-600">Loading pages…</div>
        ) : error ? (
          <div className="text-red-600">Error: {error}</div>
        ) : pages.length === 0 ? (
          <div className="text-slate-600">
            No pages yet. Publish one from the <Link className="text-indigo-600 font-semibold" to="/editor">editor</Link>.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {pages.map((p) => (
              <Link
                key={p.slug}
                to={`/${p.slug}`}
                className="block rounded-xl bg-white p-4 border border-slate-100 shadow-sm hover:shadow-md transition"
              >
                <div className="text-indigo-600 font-semibold">{p.title || p.slug || "Untitled"}</div>
                <div className="text-slate-600 text-sm mt-1">Slug: {p.slug}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <header className="mb-12">
          <p className="text-indigo-600 font-semibold uppercase tracking-[0.2em] mb-2">
            IDSE Developer Agency
          </p>
          <h1 className="text-4xl font-bold text-slate-900">
            Build pages with Puck + CopilotKit
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl">
            Visual editor for landing pages, dashboards, and portals with an
            embedded AI chat widget styled by Pagedone.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <Link
            to="/editor"
            className="block rounded-2xl bg-white p-6 shadow-sm border border-slate-100 hover:shadow-md transition"
          >
            <div className="text-indigo-600 font-semibold">Puck Editor</div>
            <div className="text-slate-700 mt-2">
              Drag-and-drop pages, configure CopilotKit widget, publish to the
              backend.
            </div>
            <div className="mt-4 inline-flex items-center text-indigo-600 font-semibold">
              Open editor →
            </div>
          </Link>

          <Link
            to="/pages"
            className="block rounded-2xl bg-white p-6 shadow-sm border border-slate-100 hover:shadow-md transition"
          >
            <div className="text-indigo-600 font-semibold">Renderer</div>
            <div className="text-slate-700 mt-2">
              Browse your published pages by title/slug and open them in the renderer.
            </div>
            <div className="mt-4 inline-flex items-center text-indigo-600 font-semibold">
              View renderer →
            </div>
          </Link>

          <Link
            to="/workspace"
            className="block rounded-2xl bg-white p-6 shadow-sm border border-slate-100 hover:shadow-md transition md:col-span-2"
          >
            <div className="text-indigo-600 font-semibold">Pipeline Docs (Milkdown)</div>
            <div className="text-slate-700 mt-2">
              Edit IDSE pipeline markdown with the Milkdown/Crepe editor and file tree.
            </div>
            <div className="mt-4 inline-flex items-center text-indigo-600 font-semibold">
              Open workspace →
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PuckRenderer pageSlug="index" />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/editor" element={<PuckEditor />} />
        <Route path="/editor-shell" element={<PuckShellPage />} />
        <Route path="/pages" element={<RendererLanding />} />
        <Route path="/:slug" element={<PuckRenderer />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/workspace" element={<WorkspacePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
