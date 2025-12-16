import { useEffect, useState } from "react";

interface PagesDialogProps {
  isOpen: boolean;
  pages: Array<{ id: string; title: string; slug?: string }>;
  onClose: () => void;
  onLoad: (id: string) => void;
  onCreateNew: () => void;
}

export function PagesDialog({ isOpen, pages, onClose, onLoad, onCreateNew }: PagesDialogProps) {
  const [selectedId, setSelectedId] = useState<string>("");

  // When dialog opens or pages change, default-select the first page (if any)
  useEffect(() => {
    if (isOpen && pages.length > 0) {
      setSelectedId(pages[0].id);
    } else if (!isOpen) {
      setSelectedId("");
    }
  }, [isOpen, pages]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Load Page</h2>

        <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
          {pages.map((p) => (
            <label
              key={p.id}
              className="flex items-center gap-2 p-2 hover:bg-slate-50 cursor-pointer rounded"
            >
              <input
                type="radio"
                checked={selectedId === p.id}
                onChange={() => setSelectedId(p.id)}
              />
              <span className="text-sm text-slate-800">
                {p.title || "Untitled"} {p.slug ? `(${p.slug})` : ""}
              </span>
            </label>
          ))}
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onCreateNew}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-600"
          >
            + New Page
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onLoad(selectedId);
            }}
            disabled={!selectedId}
            className="rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Load Selected
          </button>
        </div>
      </div>
    </div>
  );
}
