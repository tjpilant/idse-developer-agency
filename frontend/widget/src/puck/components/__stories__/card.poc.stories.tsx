import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Card, type CardProps } from "../Card";
import { cardVariantOptions } from "../card.config";
import { cvaVariantsToArgTypes } from "../../utils/cva-to-storybook";

const CardWrapper = (args: CardProps) => <>{Card.render(args)}</>;

const meta: Meta<typeof CardWrapper> = {
  title: "POC/CardBlock",
  component: CardWrapper,
  parameters: {
    controls: { expanded: true },
  },
  argTypes: {
    title: { control: "text", description: "Card title" },
    description: { control: "text", description: "Card body content" },
    icon: { control: "text", description: "Icon (emoji or URL)" },
    ...cvaVariantsToArgTypes({ variants: cardVariantOptions }, { variant: "radio" }),
  },
};

export default meta;

type Story = StoryObj<typeof CardWrapper>;

export const Preview: Story = {
  args: {
    id: "card_1",
    title: "Card One",
    description: "Card body content.",
    icon: "✅",
    variant: "default",
  },
};

export const WithImage: Story = {
  args: {
    id: "card_1",
    title: "Card One",
    description: "Card body content.",
    icon: "https://example.com/icon.png",
    variant: "default",
  },
};
