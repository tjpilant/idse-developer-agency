import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Hero } from "../Hero";

type HeroArgs = {
  heading: string;
  subheading: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage?: string;
};

const HeroStory = ({ heading, subheading, ctaText, ctaLink, backgroundImage }: HeroArgs) =>
  Hero.render({
    heading,
    subheading,
    ctaText,
    ctaLink,
    backgroundImage,
  });

const meta: Meta<typeof HeroStory> = {
  title: "Blocks/Hero",
  component: HeroStory,
  args: {
    heading: "Welcome to IDSE Developer Agency",
    subheading: "Build better software with intent-driven guidance and AI copilots.",
    ctaText: "Open the editor",
    ctaLink: "/editor",
    backgroundImage: "",
  },
  argTypes: {
    heading: { control: "text", description: "Main headline" },
    subheading: { control: "text", description: "Supporting copy" },
    ctaText: { control: "text", description: "CTA button text" },
    ctaLink: { control: "text", description: "CTA href" },
    backgroundImage: { control: "text", description: "Optional background image URL" },
  },
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof HeroStory>;

export const Default: Story = {};
