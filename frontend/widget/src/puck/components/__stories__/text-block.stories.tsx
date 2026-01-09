import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { TextBlock } from "../TextBlock";

type TextArgs = {
  heading?: string;
  body: string;
  align: "left" | "center" | "right";
  variant: "default" | "muted" | "lead";
};

const TextBlockStory = ({ heading, body, align, variant }: TextArgs) =>
  TextBlock.render({
    id: "text-story",
    heading,
    body,
    align,
    variant,
  });

const meta: Meta<typeof TextBlockStory> = {
  title: "Blocks/TextBlock",
  component: TextBlockStory,
  args: {
    heading: "Section title",
    body: "Body copy goes here.",
    align: "left",
    variant: "default",
  },
  argTypes: {
    heading: { control: "text", description: "Optional heading" },
    body: { control: "text", description: "Body text" },
    align: {
      control: "radio",
      options: ["left", "center", "right"],
      description: "Text alignment",
    },
    variant: {
      control: "select",
      options: ["default", "muted", "lead"],
      description: "Typography variant",
    },
  },
};

export default meta;
type Story = StoryObj<typeof TextBlockStory>;

export const Default: Story = {};
