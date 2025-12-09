import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DropdownMenu } from "../dropdown-menu";

describe("DropdownMenu", () => {
  it("should render children when isOpen is true", () => {
    render(
      <DropdownMenu isOpen={true}>
        <div>Menu Content</div>
      </DropdownMenu>
    );

    expect(screen.getByText("Menu Content")).toBeInTheDocument();
  });

  it("should not render when isOpen is false", () => {
    const { container } = render(
      <DropdownMenu isOpen={false}>
        <div>Menu Content</div>
      </DropdownMenu>
    );

    expect(container.firstChild).toBeNull();
  });

  it("should render multiple children", () => {
    render(
      <DropdownMenu isOpen={true}>
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </DropdownMenu>
    );

    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
    expect(screen.getByText("Item 3")).toBeInTheDocument();
  });
});
