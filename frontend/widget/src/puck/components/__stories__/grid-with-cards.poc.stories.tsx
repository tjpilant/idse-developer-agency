import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Card } from "../Card";

type GridStoryProps = {
  columns: 1 | 2 | 3 | 4;
  gap: "sm" | "md" | "lg" | "xl";
};

const gapClass = (gap: GridStoryProps["gap"]) =>
  gap === "sm" ? "gap-2" : gap === "md" ? "gap-4" : gap === "lg" ? "gap-6" : "gap-8";

const columnsClass = (columns: GridStoryProps["columns"]) =>
  columns === 1 ? "grid-cols-1" : columns === 2 ? "grid-cols-2" : columns === 3 ? "grid-cols-3" : "grid-cols-4";

const GridWithCards = ({ columns, gap }: GridStoryProps) => {
  const items = [
    Card.render({ id: "card_1", title: "Card One", description: "Body", icon: "✅" }),
    Card.render({ id: "card_2", title: "Card Two", description: "Body", icon: "⭐" }),
    Card.render({ id: "card_3", title: "Card Three", description: "Body", icon: "🔥" }),
  ];

  return <div className={`grid ${columnsClass(columns)} ${gapClass(gap)}`}>{items.map((item, idx) => <div key={idx}>{item}</div>)}</div>;
};

const meta: Meta<typeof GridWithCards> = {
  title: "POC/GridWithCards",
  component: GridWithCards,
  args: {
    columns: 3,
    gap: "md",
  },
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    columns: {
      control: "select",
      options: [1, 2, 3, 4],
      description: "Number of grid columns",
    },
    gap: {
      control: "radio",
      options: ["sm", "md", "lg", "xl"],
      description: "Grid gap size",
    },
  },
};

export default meta;
type Story = StoryObj<typeof GridWithCards>;

export const Default: Story = {};
