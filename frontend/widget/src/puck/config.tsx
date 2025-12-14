import { Config } from "@measured/puck";
import { Hero } from "./components/Hero";
import { Card } from "./components/Card";

export const puckConfig: Config = {
  components: {
    Hero,
    Card,
  },
  categories: {
    Content: {
      components: ["Hero", "Card"],
    },
  },
};
