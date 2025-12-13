import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { PuckEditor } from "./puck/PuckEditor";
import { PuckRenderer } from "./puck/PuckRenderer";

function Home() {
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
            to="/page/example"
            className="block rounded-2xl bg-white p-6 shadow-sm border border-slate-100 hover:shadow-md transition"
          >
            <div className="text-indigo-600 font-semibold">Renderer</div>
            <div className="text-slate-700 mt-2">
              Render a stored page by id. Replace{" "}
              <code className="px-1 py-0.5 bg-slate-100 rounded">example</code>{" "}
              with your saved page id.
            </div>
            <div className="mt-4 inline-flex items-center text-indigo-600 font-semibold">
              View renderer →
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
        <Route path="/" element={<Home />} />
        <Route path="/editor" element={<PuckEditor />} />
        <Route path="/page/:pageId" element={<PuckRenderer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
