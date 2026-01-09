import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Card } from "../Card";
import { GridBlock } from "../GridBlock";
import { TextBlock } from "../TextBlock";

const slugify = (text: string) => (text || "item").toLowerCase().replace(/\s+/g, "-");

const SampleCard = ({ title }: { title?: string }) =>
  Card.render({
    id: slugify(title ?? "Card"),
    title: title ?? "Card",
    description: "Demo content",
    icon: "⭐",
  });

const SampleText = (text: string) =>
  TextBlock.render({
    id: slugify(text),
    text,
    muted: false,
  });

type GridStoryProps = {
  columns: 1 | 2 | 3 | 4;
  gap: "sm" | "md" | "lg" | "xl";
};

const GridStory = ({ columns, gap }: GridStoryProps) =>
  GridBlock.render({
    id: "grid-story",
    columns,
    gap,
    col1: [SampleCard("Column 1 Card"), SampleText("Column 1 Text")],
    col2: [SampleCard("Column 2 Card")],
    col3: [SampleCard("Column 3 Card"), SampleText("Column 3 Text")],
    col4: [SampleText("Column 4 Text")],
  });

const meta: Meta<typeof GridStory> = {
  title: "Blocks/GridBlock",
  component: GridStory,
  args: {
    columns: 3,
    gap: "md",
  },
  argTypes: {
    columns: {
      control: "select",
      options: [1, 2, 3, 4],
      description: "Number of visible columns (slots)",
    },
    gap: {
      control: "radio",
      options: ["sm", "md", "lg", "xl"],
      description: "Gap between columns",
    },
  },
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof GridStory>;

export const Default: Story = {};
