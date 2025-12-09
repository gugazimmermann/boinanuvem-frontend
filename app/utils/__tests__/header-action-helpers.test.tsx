import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { createAddButtonAction } from "../header-action-helpers";

describe("createAddButtonAction", () => {
  it("should create add button action with label", () => {
    const onClick = vi.fn();
    const action = createAddButtonAction({
      label: "Add New",
      onClick,
    });

    expect(action.label).toBe("Add New");
    expect(action.variant).toBe("primary");
    expect(action.onClick).toBe(onClick);
  });

  it("should include left icon", () => {
    const onClick = vi.fn();
    const action = createAddButtonAction({
      label: "Add",
      onClick,
    });

    expect(action.leftIcon).toBeDefined();
    const { container } = render(action.leftIcon!);
    expect(container.querySelector("svg")).toBeDefined();
  });

  it("should call onClick when action is triggered", () => {
    const onClick = vi.fn();
    const action = createAddButtonAction({
      label: "Add",
      onClick,
    });

    if (action.onClick) {
      action.onClick();
    }
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should render SVG icon with correct attributes", () => {
    const onClick = vi.fn();
    const action = createAddButtonAction({
      label: "Add",
      onClick,
    });

    const { container } = render(action.leftIcon!);
    const svg = container.querySelector("svg");
    expect(svg).toBeDefined();
    expect(svg?.getAttribute("xmlns")).toBe("http://www.w3.org/2000/svg");
    expect(svg?.getAttribute("fill")).toBe("none");
  });
});
