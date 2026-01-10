"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { RefreshCw } from "lucide-react";

export function RefreshButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => router.refresh())}
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-slate-50 px-4 py-2 text-sm font-semibold shadow-md shadow-slate-900/15 transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60"
    >
      <RefreshCw className={`h-4 w-4 ${pending ? "animate-spin" : ""}`} />
      {pending ? "Refreshing" : "Refresh data"}
    </button>
  );
}
