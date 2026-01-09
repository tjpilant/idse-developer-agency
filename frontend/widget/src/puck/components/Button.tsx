import { ComponentConfig } from "@measured/puck";
import React from "react";
import { buttonArgTypes, buttonPuckFields, buttonVariants, type ButtonVariant } from "./button.config";
import { cn } from "@/lib/utils";

export type ButtonProps = {
  id: string;
  text: string;
  variant: ButtonVariant["variant"];
  tone: ButtonVariant["tone"];
  size: ButtonVariant["size"];
  radius: ButtonVariant["radius"];
  align: ButtonVariant["align"];
  weight: ButtonVariant["weight"];
  iconPlacement: ButtonVariant["iconPlacement"];
  href?: string;
};

export const ButtonBlock: ComponentConfig<{ props: ButtonProps }> = {
  label: "Button",
  fields: {
    id: { type: "text", label: "ID" },
    text: { type: "text", label: "Label" },
    href: { type: "text", label: "Href (optional)" },
    ...buttonPuckFields,
  },
  defaultProps: {
    id: "button_1",
    text: "Click me",
    variant: "solid",
    tone: "primary",
    size: "md",
    radius: "md",
    align: "center",
    weight: "semibold",
    iconPlacement: "none",
  },
  render: ({ text, href, align, ...rest }) => {
    const classes = cn(buttonVariants({ align, ...rest }));
    const wrapperAlign =
      align === "left" ? "justify-start" : align === "right" ? "justify-end" : "justify-center";

    const content = href ? (
      <a className={classes} href={href}>
        {text}
      </a>
    ) : (
      <button className={classes}>{text}</button>
    );

    // Wrap in a flex container so left/center/right alignment is visible across the block width.
    return <div className={cn("flex w-full", wrapperAlign)}>{content}</div>;
  },
};
