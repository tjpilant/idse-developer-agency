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
      className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-900 py-20 text-white shadow-[0_32px_80px_-45px_rgba(15,23,42,0.9)]"
      style={
        backgroundImage
          ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" }
          : {}
      }
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/30 to-transparent" aria-hidden />
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl" aria-hidden />
      <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-violet-500/30 blur-3xl" aria-hidden />
      <div className="relative max-w-4xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-semibold mb-4 drop-shadow-sm">{heading}</h1>
        <p className="text-lg md:text-xl text-indigo-50/90 max-w-2xl mb-8 leading-relaxed">{subheading}</p>
        <a
          href={ctaLink}
          className="inline-flex items-center gap-2 rounded-full bg-white/90 text-indigo-700 px-6 py-3 font-semibold shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
        >
          {ctaText} <span aria-hidden>→</span>
        </a>
      </div>
    </section>
  ),
};
