import { render, screen } from "@testing-library/react";
import React from "react";
import { Card, type CardProps } from "../Card";

const renderCard = (props?: Partial<CardProps>) => {
  const merged: CardProps = {
    title: "Card One",
    description: "Card body content.",
    icon: "✅",
    ...props,
  };
  return render(<>{Card.render(merged)}</>);
};

describe("CardBlock POC", () => {
  it("renders title and description", () => {
    renderCard();
    expect(screen.getByText("Card One")).toBeInTheDocument();
    expect(screen.getByText("Card body content.")).toBeInTheDocument();
  });

  it("supports image icon urls", () => {
    renderCard({ icon: "https://example.com/icon.png" });
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://example.com/icon.png");
    expect(img).toHaveAttribute("alt", "Card One");
  });
});
