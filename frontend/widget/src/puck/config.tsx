import { Config } from "@measured/puck";
import { ChatWidget } from "./components/ChatWidget";
import { Hero } from "./components/Hero";
import { Card } from "./components/Card";

export const puckConfig: Config = {
  components: {
    ChatWidget,
    Hero,
    Card,
  },
  categories: {
    Widgets: {
      components: ["ChatWidget"],
    },
    Content: {
      components: ["Hero", "Card"],
    },
  },
};
