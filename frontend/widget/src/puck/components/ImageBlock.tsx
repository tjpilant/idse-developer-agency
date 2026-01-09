import { ComponentConfig } from "@measured/puck";
import { cn } from "@/lib/utils";

type Aspect = "square" | "16-9" | "4-3";

export interface ImageBlockProps {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  aspect: Aspect;
  lazy: boolean;
}

const aspectClass = (aspect: Aspect) =>
  aspect === "square" ? "aspect-square" : aspect === "16-9" ? "aspect-video" : "aspect-[4/3]";

export const ImageBlock: ComponentConfig<{ props: ImageBlockProps }> = {
  label: "Image",
  fields: {
    id: { type: "text", label: "ID" },
    src: { type: "text", label: "Image URL", placeholder: "https://…" },
    alt: { type: "text", label: "Alt text" },
    caption: { type: "text", label: "Caption" },
    aspect: {
      type: "select",
      label: "Aspect",
      options: [
        { label: "Square", value: "square" },
        { label: "16:9", value: "16-9" },
        { label: "4:3", value: "4-3" },
      ],
    },
    lazy: {
      type: "select",
      label: "Lazy load",
      options: [
        { label: "Yes (lazy)", value: true },
        { label: "No (eager)", value: false },
      ],
    },
  },
  defaultProps: {
    id: "image_1",
    src: "https://example.com/image.jpg",
    alt: "Descriptive alt text",
    aspect: "16-9",
    lazy: true,
  },
  render: ({ src, alt, caption, aspect, lazy }) => (
    <figure className="w-full">
      <div className={cn("overflow-hidden rounded-lg bg-muted", aspectClass(aspect))}>
        <img
          src={src}
          alt={alt}
          loading={lazy ? "lazy" : "eager"}
          className="h-full w-full object-cover"
        />
      </div>
      {caption && <figcaption className="mt-2 text-sm text-muted-foreground">{caption}</figcaption>}
    </figure>
  ),
};
