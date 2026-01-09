import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Card, type CardProps } from "../Card";
import { cardVariantOptions } from "../card.config";
import { cvaVariantsToArgTypes } from "../../utils/cva-to-storybook";

const CardWrapper = (args: CardProps) => <div className="max-w-md">{Card.render(args)}</div>;

const meta: Meta<typeof CardWrapper> = {
  title: "Blocks/Card",
  component: CardWrapper,
  args: {
    id: "card_story",
    title: "Feature Title",
    description: "Describe what this feature unlocks for the user.",
    icon: "🚀",
    variant: "default",
  },
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    icon: { control: "text", description: "Emoji or image URL" },
    ...cvaVariantsToArgTypes({ variants: cardVariantOptions }, { variant: "select" }),
  },
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;
type Story = StoryObj<typeof CardWrapper>;

export const Default: Story = {};

export const Outline: Story = {
  args: {
    variant: "outline",
  },
};

export const Elevated: Story = {
  args: {
    variant: "elevated",
  },
};
