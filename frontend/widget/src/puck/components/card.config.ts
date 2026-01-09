import { cva, type VariantProps } from "class-variance-authority";

export const cardVariantOptions = {
  variant: {
    default:
      "border-slate-200/70 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)] hover:-translate-y-0.5 hover:shadow-[0_28px_70px_-45px_rgba(15,23,42,0.5)]",
    outline: "border-slate-300 hover:-translate-y-0.5 hover:shadow-md",
    elevated: "border-slate-100 shadow-lg hover:-translate-y-0.5 hover:shadow-xl",
  },
};

export const cardVariants = cva(
  "group relative overflow-hidden rounded-2xl border bg-white/90 p-6 transition",
  {
    variants: cardVariantOptions,
    defaultVariants: {
      variant: "default",
    },
  }
);

export type CardVariant = NonNullable<VariantProps<typeof cardVariants>["variant"]>;

export const cardVariantClasses: Record<CardVariant, string> = {
  default:
    "border-slate-200/70 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)] hover:-translate-y-0.5 hover:shadow-[0_28px_70px_-45px_rgba(15,23,42,0.5)]",
  outline: "border-slate-300 hover:-translate-y-0.5 hover:shadow-md",
  elevated: "border-slate-100 shadow-lg hover:-translate-y-0.5 hover:shadow-xl",
};
