import { useEffect, useState } from "react";

interface PagesDialogProps {
  isOpen: boolean;
  pages: Array<{ slug: string; title?: string }>;
  onClose: () => void;
  onLoad: (slug: string) => void;
  onCreateNew: () => void;
}

export function PagesDialog({ isOpen, pages, onClose, onLoad, onCreateNew }: PagesDialogProps) {
  const [selectedSlug, setSelectedSlug] = useState<string>("");

  // When dialog opens or pages change, default-select the first page (if any)
  useEffect(() => {
    if (isOpen && pages.length > 0) {
      setSelectedSlug(pages[0].slug);
    } else if (!isOpen) {
      setSelectedSlug("");
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
              key={p.slug}
              className="flex items-center gap-2 p-2 hover:bg-slate-50 cursor-pointer rounded"
            >
              <input
                type="radio"
                checked={selectedSlug === p.slug}
                onChange={() => setSelectedSlug(p.slug)}
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
              onLoad(selectedSlug);
            }}
            disabled={!selectedSlug}
            className="rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Load Selected
          </button>
        </div>
      </div>
    </div>
  );
}
