import { ComponentConfig } from "@measured/puck";
import { cvaVariantsToPuckFields } from "../utils/cva-to-puck";
import { cardVariantOptions, cardVariants, type CardVariant } from "./card.config";
import { cn } from "@/lib/utils";

export interface CardProps {
  id: string;
  title: string;
  description: string;
  icon?: string;
  variant: CardVariant;
}

export const Card: ComponentConfig<{ props: CardProps }> = {
  fields: {
    id: { type: "text", label: "ID" },
    title: { type: "text", label: "Title" },
    description: { type: "textarea", label: "Description" },
    icon: { type: "text", label: "Icon (emoji or URL)" },
    ...cvaVariantsToPuckFields({ variants: cardVariantOptions }, {
      variant: { label: "Variant", type: "select" },
    }),
  },
  defaultProps: {
    id: "card_1",
    title: "Feature Title",
    description: "Describe what this feature unlocks for the user.",
    icon: "🚀",
    variant: "default",
  },
  render: ({ title, description, icon, variant }) => (
    <div className={cn(cardVariants({ variant }))}>
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
