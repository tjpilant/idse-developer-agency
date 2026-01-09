import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Card } from "../Card";
import { FourColumnLayout } from "../FourColumnLayout";
import { TextBlock } from "../TextBlock";

const slugify = (text: string) => (text || "item").toLowerCase().replace(/\s+/g, "-");

const SampleCard = (title: string) =>
  Card.render({
    id: slugify(title),
    title,
    description: "Demo card content",
    icon: "⭐",
  });

const SampleText = (text: string) =>
  TextBlock.render({
    id: slugify(text),
    body: text,
    align: "left",
    variant: "default",
  });

type FourColArgs = {
  col1Width: string;
  col2Width: string;
  col3Width: string;
  col4Width: string;
  gap: string;
};

const FourColumnStory = ({ col1Width, col2Width, col3Width, col4Width, gap }: FourColArgs) =>
  FourColumnLayout.render({
    col1Width,
    col2Width,
    col3Width,
    col4Width,
    gap,
    col1: [SampleCard("Column 1"), SampleText("Additional copy 1")],
    col2: [SampleCard("Column 2")],
    col3: [SampleText("Column 3 text")],
    col4: [SampleCard("Column 4"), SampleText("Column 4 extra")],
  });

const meta: Meta<typeof FourColumnStory> = {
  title: "Layouts/FourColumnLayout",
  component: FourColumnStory,
  args: {
    col1Width: "15%",
    col2Width: "25%",
    col3Width: "30%",
    col4Width: "30%",
    gap: "16px",
  },
  argTypes: {
    col1Width: { control: "text", description: "Column 1 width (e.g. 15%)" },
    col2Width: { control: "text", description: "Column 2 width (e.g. 25%)" },
    col3Width: { control: "text", description: "Column 3 width (e.g. 30%)" },
    col4Width: { control: "text", description: "Column 4 width (e.g. 30%)" },
    gap: { control: "text", description: "Gap between columns" },
  },
};

export default meta;
type Story = StoryObj<typeof FourColumnStory>;

export const Default: Story = {};
