import { Puck } from "@measured/puck";

export function CenterPanel() {
  return (
    <main className="col-span-12 lg:col-span-7 bg-slate-50/80 overflow-y-auto border-r border-slate-200/70">
      <div className="h-full">
        <Puck.Preview />
      </div>
    </main>
  );
}
