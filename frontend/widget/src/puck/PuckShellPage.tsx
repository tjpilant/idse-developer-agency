import { PuckEditor } from "./PuckEditor";

export function PuckShellPage() {
  // Render the core editor in shell route; the internal Puck layout handles blocks/fields/outline.
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="absolute h-[200px] w-full top-0 left-0 bg-indigo-50 -z-10" />
      <PuckEditor hideEmbeddedChat={false} />
    </div>
  );
}
