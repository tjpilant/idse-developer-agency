import { Config } from "@measured/puck";
import { Hero } from "./components/Hero";
import { Card } from "./components/Card";
import { ChatWidget } from "./components/ChatWidget";
import { ChatPopupWidget } from "./components/ChatPopupWidget";
import { FourColumnLayout } from "./components/FourColumnLayout";
import { StatusBrowserWidget } from "./components/StatusBrowserWidget";
import { StatusBrowserRowWidget } from "./components/StatusBrowserRowWidget";

export const puckConfig: Config = {
  components: {
    Hero,
    Card,
    ChatWidget,
    ChatPopupWidget,
    FourColumnLayout,
    StatusBrowserWidget,
    StatusBrowserRowWidget,
  },
  categories: {
    Content: {
      components: ["Hero", "Card"],
    },
    Widgets: {
      components: ["ChatWidget", "ChatPopupWidget", "StatusBrowserWidget", "StatusBrowserRowWidget"],
    },
    Layouts: {
      components: ["FourColumnLayout"],
    },
  },
};
