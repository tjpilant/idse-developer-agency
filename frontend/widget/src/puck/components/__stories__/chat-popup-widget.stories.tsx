import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { ChatPopupWidget } from "../ChatPopupWidget";

// Mocked popup chat; no live API calls.
const ChatPopupWrapper = () =>
  ChatPopupWidget.render({
    title: "Popup Chat",
    intro: "Mocked popup chat. Network calls are disabled in Storybook.",
    placeholder: "Ask a question...",
  });

const meta: Meta<typeof ChatPopupWrapper> = {
  title: "Blocks/ChatPopupWidget",
  component: ChatPopupWrapper,
  parameters: {
    controls: { disable: true },
    docs: { description: { component: "Popup chat widget in mocked mode (no backend required)." } },
  },
};

export default meta;
type Story = StoryObj<typeof ChatPopupWrapper>;

export const Mocked: Story = {};
