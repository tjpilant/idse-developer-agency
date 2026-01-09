import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Loader2, RefreshCw } from "lucide-react";

const apiBase =
  (import.meta as any).env?.VITE_API_BASE ??
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:8000");

interface PageSummary {
  slug: string;
  title?: string;
}

interface PageListViewProps {
  onLoadPage: (slug: string) => void;
}

export function PageListView({ onLoadPage }: PageListViewProps) {
  const [pages, setPages] = useState<PageSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPages = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${apiBase.replace(/\/$/, "")}/api/status-pages`);
      if (!res.ok) {
        throw new Error(`Failed to fetch pages (${res.status})`);
      }
      const json = await res.json();
      if (Array.isArray((json as any).pages)) {
        setPages((json as any).pages);
      } else if ((json as any).page) {
        setPages([(json as any).page]);
      } else {
        setPages([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load pages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-3" />
          <p className="text-slate-600">Loading pages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchPages} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Published Pages</CardTitle>
            <CardDescription>
              No pages have been published yet. Create and publish a page using the editor.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchPages} variant="outline" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Published Pages</h2>
            <p className="text-sm text-slate-600 mt-1">
              {pages.length} {pages.length === 1 ? "page" : "pages"} available
            </p>
          </div>
          <Button onClick={fetchPages} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {pages.map((page) => (
            <Card
              key={page.slug}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onLoadPage(page.slug)}
            >
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">
                      {page.title || page.slug || "Untitled"}
                    </CardTitle>
                    <CardDescription className="truncate">
                      Slug: {page.slug}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
