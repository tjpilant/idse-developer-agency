import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { ButtonBlock, type ButtonProps } from "../Button";
import { buttonArgTypes } from "../button.config";

const ButtonWrapper = (args: ButtonProps) => <>{ButtonBlock.render(args)}</>;

const meta: Meta<typeof ButtonWrapper> = {
  title: "Blocks/Button",
  component: ButtonWrapper,
  argTypes: {
    text: { control: "text", description: "Button label" },
    href: { control: "text", description: "Optional href" },
    ...buttonArgTypes,
  },
  args: {
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
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;
type Story = StoryObj<typeof ButtonWrapper>;

export const Default: Story = {};

export const Destructive: Story = {
  args: {
    text: "Delete",
    variant: "destructive",
  },
};

export const LinkVariant: Story = {
  args: {
    text: "Learn more",
    href: "https://example.com",
    variant: "link",
  },
};
