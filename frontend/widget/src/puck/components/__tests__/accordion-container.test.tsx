import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { AccordionBlock, type AccordionBlockProps } from "../AccordionBlock";
import { ContainerBlock, type ContainerBlockProps } from "../ContainerBlock";

const renderAccordion = (props?: Partial<AccordionBlockProps>) => {
  const merged: AccordionBlockProps = {
    id: "acc_1",
    type: "single",
    collapsible: true,
    items: [
      { id: "item-1", title: "One", body: "Answer 1" },
      { id: "item-2", title: "Two", body: "Answer 2" },
      { id: "item-3", title: "Three", body: "Answer 3" },
    ],
    ...props,
  };
  return render(<>{AccordionBlock.render(merged)}</>);
};

const renderContainer = (props?: Partial<ContainerBlockProps>) => {
  const merged: ContainerBlockProps = {
    id: "container_1",
    maxWidth: "md",
    padding: "md",
    content: [<p key="child">Hello</p>],
    ...props,
  };
  return render(<>{ContainerBlock.render(merged)}</>);
};

describe("AccordionBlock", () => {
  it("shows only one open panel in single mode", async () => {
    const user = userEvent.setup();
    renderAccordion({ type: "single" });

    // Initially closed
    expect(screen.queryByText("Answer 1")).toBeNull();

    // Open second item
    await user.click(screen.getByRole("button", { name: /two/i }));
    expect(screen.getByText("Answer 2")).toBeInTheDocument();
    expect(screen.queryByText("Answer 1")).toBeNull();

    // Open third item, second should close
    await user.click(screen.getByRole("button", { name: /three/i }));
    expect(screen.getByText("Answer 3")).toBeInTheDocument();
    expect(screen.queryByText("Answer 2")).toBeNull();
  });

  it("allows multiple open panels in multiple mode", async () => {
    const user = userEvent.setup();
    renderAccordion({ type: "multiple" });

    await user.click(screen.getByRole("button", { name: /one/i }));
    await user.click(screen.getByRole("button", { name: /two/i }));

    expect(screen.getByText("Answer 1")).toBeInTheDocument();
    expect(screen.getByText("Answer 2")).toBeInTheDocument();
  });
});

describe("ContainerBlock", () => {
  it("renders children content", () => {
    renderContainer();
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
