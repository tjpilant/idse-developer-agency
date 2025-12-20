import { useState, useEffect } from "react";

interface PublishDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (title: string, slug: string) => Promise<void>;
  initialTitle?: string;
  initialSlug?: string;
}

export function PublishDialog({
  isOpen,
  onClose,
  onPublish,
  initialTitle = "",
  initialSlug = "",
}: PublishDialogProps) {
  const [title, setTitle] = useState(initialTitle);
  const [slug, setSlug] = useState(initialSlug);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Update when props change
  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
      setSlug(initialSlug);
      setError("");
      setSaved(false);
    }
  }, [isOpen, initialTitle, initialSlug]);

  // Auto-generate slug from title
  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setError("");

    // Auto-generate slug if it's empty or was auto-generated
    if (!slug || slug === slugify(title)) {
      setSlug(slugify(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate title
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onPublish(title.trim(), slug.trim());
      setSaved(true);
      setSaving(false);
      // Give the user a moment to see the confirmation before closing
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish");
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  const previewUrl = `/${slug || slugify(title) || "untitled"}`;

  return (
    <div className="fixed inset-0 z-50" onKeyDown={handleKeyDown}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="bg-white/95 rounded-2xl shadow-[0_30px_80px_-40px_rgba(15,23,42,0.6)] max-w-md w-full p-6 space-y-5 border border-slate-200/70">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Publish Page</h2>
            <p className="text-sm text-slate-600 mt-1">
              Enter a title and optional slug for your page
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Page Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full rounded-2xl border border-slate-200/70 bg-white px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent"
                placeholder="Enter page title..."
                autoFocus
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                This will be displayed as the page name
              </p>
            </div>

            {/* Slug Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                URL Slug (optional)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full rounded-2xl border border-slate-200/70 bg-white px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent font-mono"
                placeholder="auto-generated-from-title"
              />
              <p className="text-xs text-slate-500 mt-1">
                Leave empty to auto-generate from title
              </p>
            </div>

            {/* Preview URL */}
            <div className="bg-slate-50/80 border border-slate-200/70 rounded-2xl p-3">
              <p className="text-xs font-semibold text-slate-600 mb-1">Preview URL</p>
              <code className="text-sm text-indigo-600 break-all">
                {window.location.origin}{previewUrl}
              </code>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {saved && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-3 flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-ping" aria-hidden="true" />
                <p className="text-sm font-semibold text-green-800">Saved</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="flex-1 px-4 py-2.5 rounded-full border border-slate-200/70 bg-white text-slate-700 font-semibold shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !title.trim()}
                className="flex-1 px-4 py-2.5 rounded-full bg-indigo-600 text-white font-semibold shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Publishing..." : "Publish"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
