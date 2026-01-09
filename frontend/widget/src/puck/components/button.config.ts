import { cva, type VariantProps } from "class-variance-authority";
import {
  cvaVariantsToArgTypes,
  cvaVariantsToPuckFields,
  cvaVariantsToSafelist,
} from "../utils";

export const buttonVariantOptions = {
  variant: {
    solid: "",
    outline: "border",
    ghost: "",
    link: "underline-offset-4",
    destructive: "",
  },
  tone: {
    primary: "",
    secondary: "",
    neutral: "",
    success: "",
    warning: "",
    danger: "",
  },
  size: {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-5 text-base",
    icon: "h-10 w-10 p-0 justify-center",
  },
  radius: {
    none: "rounded-none",
    sm: "rounded",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  },
  align: {
    left: "justify-start text-left",
    center: "justify-center",
    right: "justify-end text-right",
  },
  weight: {
    normal: "font-normal",
    semibold: "font-semibold",
    bold: "font-bold",
  },
  iconPlacement: {
    none: "",
    left: "",
    right: "",
  },
};

const toneClasses = {
  solid: {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-slate-700 text-white hover:bg-slate-800",
    neutral: "bg-gray-200 text-gray-900 hover:bg-gray-300",
    success: "bg-emerald-600 text-white hover:bg-emerald-700",
    warning: "bg-amber-500 text-gray-900 hover:bg-amber-600",
    danger: "bg-red-600 text-white hover:bg-red-700",
  },
  outline: {
    primary: "border-blue-600 text-blue-700 hover:bg-blue-50",
    secondary: "border-slate-600 text-slate-700 hover:bg-slate-100",
    neutral: "border-gray-300 text-gray-800 hover:bg-gray-100",
    success: "border-emerald-600 text-emerald-700 hover:bg-emerald-50",
    warning: "border-amber-500 text-amber-700 hover:bg-amber-50",
    danger: "border-red-600 text-red-700 hover:bg-red-50",
  },
  ghost: {
    primary: "text-blue-700 hover:bg-blue-50",
    secondary: "text-slate-700 hover:bg-slate-100",
    neutral: "text-gray-800 hover:bg-gray-100",
    success: "text-emerald-700 hover:bg-emerald-50",
    warning: "text-amber-700 hover:bg-amber-50",
    danger: "text-red-700 hover:bg-red-50",
  },
  link: {
    primary: "text-blue-700 hover:underline",
    secondary: "text-slate-700 hover:underline",
    neutral: "text-gray-800 hover:underline",
    success: "text-emerald-700 hover:underline",
    warning: "text-amber-700 hover:underline",
    danger: "text-red-700 hover:underline",
  },
  destructive: {
    danger: "bg-red-600 text-white hover:bg-red-700",
  },
};

const base =
  "inline-flex items-center gap-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

export const buttonVariants = cva(base, {
  variants: buttonVariantOptions,
  compoundVariants: [
    // solid tones
    ...Object.entries(toneClasses.solid).map(([tone, cls]) => ({
      variant: "solid" as const,
      tone: tone as keyof typeof toneClasses.solid,
      className: cls,
    })),
    // outline tones
    ...Object.entries(toneClasses.outline).map(([tone, cls]) => ({
      variant: "outline" as const,
      tone: tone as keyof typeof toneClasses.outline,
      className: cls,
    })),
    // ghost tones
    ...Object.entries(toneClasses.ghost).map(([tone, cls]) => ({
      variant: "ghost" as const,
      tone: tone as keyof typeof toneClasses.ghost,
      className: cls,
    })),
    // link tones
    ...Object.entries(toneClasses.link).map(([tone, cls]) => ({
      variant: "link" as const,
      tone: tone as keyof typeof toneClasses.link,
      className: cls,
    })),
    // destructive tone (danger only)
    {
      variant: "destructive",
      tone: "danger",
      className: toneClasses.destructive.danger,
    },
  ],
  defaultVariants: {
    variant: "solid",
    tone: "primary",
    size: "md",
    radius: "md",
    align: "center",
    weight: "semibold",
    iconPlacement: "none",
  },
});

export type ButtonVariant = VariantProps<typeof buttonVariants>;

// Generated helpers
export const buttonPuckFields = cvaVariantsToPuckFields({ variants: buttonVariantOptions });
export const buttonArgTypes = cvaVariantsToArgTypes({ variants: buttonVariantOptions });
export const buttonSafelist = cvaVariantsToSafelist(
  ...Object.values(buttonVariantOptions),
  toneClasses.solid,
  toneClasses.outline,
  toneClasses.ghost,
  toneClasses.link,
  toneClasses.destructive
);
