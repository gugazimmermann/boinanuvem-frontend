import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tooltip } from "../tooltip";

describe("Tooltip", () => {
  it("should render children", () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );

    expect(screen.getByText("Hover me")).toBeInTheDocument();
  });

  it("should not show tooltip initially", () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );

    expect(screen.queryByText("Tooltip text")).not.toBeInTheDocument();
  });

  it("should show tooltip on mouse enter", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByText("Hover me");
    await user.hover(button);

    expect(screen.getByText("Tooltip text")).toBeInTheDocument();
  });

  it("should hide tooltip on mouse leave", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByText("Hover me");
    await user.hover(button);
    expect(screen.getByText("Tooltip text")).toBeInTheDocument();

    await user.unhover(button);
    expect(screen.queryByText("Tooltip text")).not.toBeInTheDocument();
  });

  it("should render tooltip content correctly", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Custom tooltip message">
        <span>Trigger</span>
      </Tooltip>
    );

    const trigger = screen.getByText("Trigger");
    await user.hover(trigger);

    expect(screen.getByText("Custom tooltip message")).toBeInTheDocument();
  });
});
