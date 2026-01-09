import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { AccordionBlock, type AccordionBlockProps } from "../AccordionBlock";

const AccordionWrapper = (args: AccordionBlockProps) => <div className="max-w-xl">{AccordionBlock.render(args)}</div>;

const meta: Meta<typeof AccordionWrapper> = {
  title: "Blocks/AccordionBlock",
  component: AccordionWrapper,
  args: {
    id: "accordion_story",
    type: "single",
    collapsible: true,
    items: [
      { id: "item-1", title: "Question 1", body: "Answer 1" },
      { id: "item-2", title: "Question 2", body: "Answer 2" },
    ],
  },
  argTypes: {
    type: {
      control: "radio",
      options: ["single", "multiple"],
      description: "Accordion type",
    },
    collapsible: {
      control: "boolean",
      description: "Allow closing all items",
    },
    items: { control: "object", description: "Accordion items (title + body)" },
  },
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;
type Story = StoryObj<typeof AccordionWrapper>;

export const Default: Story = {
  args: {
    items: [{
      "id": "item-1",
      "title": "Question 1",
      "body": "Answer is 1"
    }, {
      "id": "item-2",
      "title": "Question 2",
      "body": "Answer 2"
    }]
  }
};
