interface ShellHeaderProps {
  title: string;
  slug: string;
  status: string | null;
  saving: boolean;
  onTitleChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onPublish: () => void;
  onOpenPages: () => void;
  onCopyLink: () => void;
}

export function ShellHeader({
  title,
  slug,
  status,
  saving,
  onTitleChange,
  onSlugChange,
  onPublish,
  onOpenPages,
  onCopyLink,
}: ShellHeaderProps) {
  return (
    <header className="px-6 py-4 border-b border-slate-200/70 bg-white/90 backdrop-blur flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-slate-700">Title</label>
          <input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="rounded-xl border border-slate-200/70 bg-white px-3 py-2 text-sm w-56 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="Page title"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-slate-700">Slug</label>
          <input
            value={slug}
            onChange={(e) => onSlugChange(e.target.value)}
            className="rounded-xl border border-slate-200/70 bg-white px-3 py-2 text-sm w-44 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="auto-generated"
          />
        </div>
      </div>
      <div className="flex gap-3 items-center">
        <button
          onClick={onOpenPages}
          className="inline-flex items-center rounded-full bg-slate-100 text-slate-800 px-4 py-2 font-semibold shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-200"
        >
          Load page
        </button>
        <button
          onClick={onPublish}
          disabled={saving}
          className="inline-flex items-center rounded-full bg-indigo-600 text-white px-4 py-2 font-semibold shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? "Publishing..." : "Publish page"}
        </button>
        <button
          onClick={onCopyLink}
          className="inline-flex items-center rounded-full bg-slate-200 text-slate-800 px-3 py-2 font-semibold shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-300 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Copy link
        </button>
        {status && <span className="text-sm text-slate-700">{status}</span>}
      </div>
    </header>
  );
}
