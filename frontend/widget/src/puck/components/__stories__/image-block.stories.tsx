import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { ImageBlock, type ImageBlockProps } from "../ImageBlock";

const ImageWrapper = (args: ImageBlockProps) => <div className="max-w-xl">{ImageBlock.render(args)}</div>;

const meta: Meta<typeof ImageWrapper> = {
  title: "Blocks/ImageBlock",
  component: ImageWrapper,
  args: {
    id: "image_story",
    src: "https://placehold.co/800x450/png",
    alt: "Demo image",
    aspectRatio: "16:9",
    lazy: true,
  },
  argTypes: {
    src: { control: "text", description: "Image URL" },
    alt: { control: "text", description: "Alt text" },
    aspectRatio: {
      control: "radio",
      options: ["16:9", "4:3", "1:1", "3:4"],
      description: "Aspect ratio token",
    },
    lazy: { control: "boolean", description: "Use loading='lazy'" },
  },
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;
type Story = StoryObj<typeof ImageWrapper>;

export const Default: Story = {};
