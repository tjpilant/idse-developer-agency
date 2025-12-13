import { ComponentConfig } from "@measured/puck";

export interface HeroProps {
  heading: string;
  subheading: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage?: string;
}

export const Hero: ComponentConfig<HeroProps> = {
  fields: {
    heading: { type: "text", label: "Heading" },
    subheading: { type: "textarea", label: "Subheading" },
    ctaText: { type: "text", label: "CTA Text" },
    ctaLink: { type: "text", label: "CTA Link" },
    backgroundImage: { type: "text", label: "Background Image URL" },
  },
  defaultProps: {
    heading: "Welcome to IDSE Developer Agency",
    subheading: "Build better software with intent-driven guidance and AI copilots.",
    ctaText: "Open the editor",
    ctaLink: "/editor",
  },
  render: ({ heading, subheading, ctaText, ctaLink, backgroundImage }) => (
    <section
      className="relative overflow-hidden py-20 rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover" } : {}}
    >
      <div className="absolute inset-0 bg-black/30" aria-hidden />
      <div className="relative max-w-4xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-sm">{heading}</h1>
        <p className="text-lg md:text-xl text-indigo-50 max-w-2xl mb-8">{subheading}</p>
        <a
          href={ctaLink}
          className="inline-flex items-center gap-2 rounded-full bg-white text-indigo-700 px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition"
        >
          {ctaText} <span aria-hidden>→</span>
        </a>
      </div>
    </section>
  ),
};
