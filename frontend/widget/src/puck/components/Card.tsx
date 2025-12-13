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
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
      {icon && (
        <div className="text-3xl mb-4">
          {icon.startsWith("http") ? (
            <img src={icon} alt={title} className="w-10 h-10" />
          ) : (
            icon
          )}
        </div>
      )}
      <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  ),
};
