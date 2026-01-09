import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { ChatWidget } from "../ChatWidget";

// Mocked chat story avoids real network; renders static intro state.
const ChatWrapper = () =>
  ChatWidget.render({
    title: "Chat with IDSE Assistant",
    intro: "Mocked chat session. No network requests are made in this story.",
    placeholder: "Type a message...",
  });

const meta: Meta<typeof ChatWrapper> = {
  title: "Blocks/ChatWidget",
  component: ChatWrapper,
  parameters: {
    controls: { disable: true },
    docs: { description: { component: "Chat widget rendered in mocked/offline mode for Storybook." } },
  },
};

export default meta;
type Story = StoryObj<typeof ChatWrapper>;

export const Mocked: Story = {};
