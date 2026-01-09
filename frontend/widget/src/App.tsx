import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { PuckRenderer } from "./puck/PuckRenderer";
import { AdminDashboard } from "./components/AdminDashboard";

const apiBase =
  (import.meta as any).env?.VITE_API_BASE ??
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:8000");

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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PuckRenderer pageSlug="index" />} />
        <Route path="/pages" element={<RendererLanding />} />
        <Route path="/:slug" element={<PuckRenderer />} />

        {/* Admin dashboard */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Legacy routes - redirect to /admin */}
        <Route path="/editor" element={<Navigate to="/admin" replace />} />
        <Route path="/editor-shell" element={<Navigate to="/admin" replace />} />
        <Route path="/workspace" element={<Navigate to="/admin" replace />} />
        <Route path="/landing" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
