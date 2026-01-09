import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { ContainerBlock } from "../ContainerBlock";
import { Card } from "../Card";
import { TextBlock } from "../TextBlock";

const SampleCard = () =>
  Card.render({
    id: "container-card",
    title: "Inside Container",
    description: "Demo content",
    icon: "📦",
  });

const SampleText = () =>
  TextBlock.render({
    id: "container-text",
    heading: "Container heading",
    body: "Container body copy",
    align: "left",
    variant: "default",
  });

type ContainerStoryProps = {
  maxWidth: "sm" | "md" | "lg" | "xl" | "full";
  padding: "none" | "sm" | "md" | "lg";
};

const ContainerStory = ({ maxWidth, padding }: ContainerStoryProps) =>
  ContainerBlock.render({
    id: "container-story",
    maxWidth,
    padding,
    content: [SampleCard(), SampleText()],
  });

const meta: Meta<typeof ContainerStory> = {
  title: "Blocks/ContainerBlock",
  component: ContainerStory,
  args: {
    maxWidth: "xl",
    padding: "lg",
  },
  argTypes: {
    maxWidth: {
      control: "select",
      options: ["sm", "md", "lg", "xl", "full"],
      description: "Tailwind container width",
    },
    padding: {
      control: "select",
      options: ["none", "sm", "md", "lg"],
      description: "Inner padding scale",
    },
  },
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof ContainerStory>;

export const Default: Story = {};
