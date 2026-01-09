import { Config } from "@measured/puck";
import { Hero } from "./components/Hero";
import { Card } from "./components/Card";
import { ChatWidget } from "./components/ChatWidget";
import { ChatPopupWidget } from "./components/ChatPopupWidget";
import { FourColumnLayout } from "./components/FourColumnLayout";
import { ButtonBlock } from "./components/Button";
import { GridBlock } from "./components/GridBlock";
import { ContainerBlock } from "./components/ContainerBlock";
import { TextBlock } from "./components/TextBlock";
import { ImageBlock } from "./components/ImageBlock";
import { AccordionBlock } from "./components/AccordionBlock";

export const puckConfig: Config = {
  components: {
    Hero,
    Card,
    ChatWidget,
    ChatPopupWidget,
    FourColumnLayout,
    Button: ButtonBlock,
    GridBlock,
    ContainerBlock,
    TextBlock,
    ImageBlock,
    AccordionBlock,
  },
  root: {
    fields: {
      title: {
        type: "text",
        label: "Page Title",
      },
    },
    render: ({ children, title }) => {
      return (
        <div className="min-h-screen">
          {title && <h1 className="sr-only">{title}</h1>}
          {children}
        </div>
      );
    },
  },
  categories: {
    Content: {
      components: ["Hero", "Card", "TextBlock", "ImageBlock", "AccordionBlock"],
    },
    Widgets: {
      components: [
        "ChatWidget",
        "ChatPopupWidget",
      ],
    },
    Layouts: {
      components: ["FourColumnLayout", "GridBlock", "ContainerBlock", "Button"],
    },
    Primitives: {
      components: ["Button"],
    },
  },
};
