import { ComponentConfig } from "@measured/puck";

export interface CardProps {
  title: string;
  description: string;
  icon?: string;
}

export const Card: ComponentConfig<CardProps> = {
  fields: {
    title: { type: "text", label: "Title" },
    description: { type: "textarea", label: "Description" },
    icon: { type: "text", label: "Icon (emoji or URL)" },
  },
  defaultProps: {
    title: "Feature Title",
    description: "Describe what this feature unlocks for the user.",
    icon: "🚀",
  },
  render: ({ title, description, icon }) => (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_28px_70px_-45px_rgba(15,23,42,0.5)]">
      {icon && (
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
          {icon.startsWith("http") ? (
            <img src={icon} alt={title} className="h-10 w-10 rounded-xl object-cover" />
          ) : (
            icon
          )}
        </div>
      )}
      <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  ),
};
