import { Config } from "@measured/puck";
import { Hero } from "./components/Hero";
import { Card } from "./components/Card";
import { ChatWidget } from "./components/ChatWidget";
import { ChatPopupWidget } from "./components/ChatPopupWidget";
import { FourColumnLayout } from "./components/FourColumnLayout";

export const puckConfig: Config = {
  components: {
    Hero,
    Card,
    ChatWidget,
    ChatPopupWidget,
    FourColumnLayout,
  },
  categories: {
    Content: {
      components: ["Hero", "Card"],
    },
    Widgets: {
      components: [
        "ChatWidget",
        "ChatPopupWidget",
      ],
    },
    Layouts: {
      components: ["FourColumnLayout"],
    },
  },
};
