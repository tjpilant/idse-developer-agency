import { ComponentConfig } from "@measured/puck";
import { cn } from "@/lib/utils";

type Align = "left" | "center" | "right";
type Variant = "default" | "muted" | "lead";

export interface TextBlockProps {
  id: string;
  heading?: string;
  body: string;
  align: Align;
  variant: Variant;
}

const alignClass = (align: Align) => (align === "left" ? "text-left" : align === "center" ? "text-center" : "text-right");

export const TextBlock: ComponentConfig<{ props: TextBlockProps }> = {
  label: "Text",
  fields: {
    id: { type: "text", label: "ID" },
    heading: { type: "text", label: "Heading" },
    body: { type: "textarea", label: "Body" },
    align: {
      type: "radio",
      label: "Alignment",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
      ],
    },
    variant: {
      type: "select",
      label: "Variant",
      options: [
        { label: "Default", value: "default" },
        { label: "Muted", value: "muted" },
        { label: "Lead", value: "lead" },
      ],
    },
  },
  defaultProps: {
    id: "text_1",
    heading: "Section title",
    body: "Body copy goes here.",
    align: "left",
    variant: "default",
  },
  render: ({ heading, body, align, variant }) => (
    <div className={cn(alignClass(align))}>
      {heading && (
        <h3
          className={cn(
            "text-xl font-semibold",
            variant === "muted" && "text-muted-foreground"
          )}
        >
          {heading}
        </h3>
      )}
      <p
        className={cn(
          "mt-2 text-base leading-relaxed",
          variant === "muted" && "text-muted-foreground",
          variant === "lead" && "text-lg"
        )}
      >
        {body}
      </p>
    </div>
  ),
};
