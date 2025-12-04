import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DropdownMenu } from "../dropdown-menu";

describe("DropdownMenu", () => {
  it("should not render when isOpen is false", () => {
    const { container } = render(
      <DropdownMenu isOpen={false}>
        <div>Test Content</div>
      </DropdownMenu>
    );
    expect(container.firstChild).toBeNull();
  });

  it("should render when isOpen is true", () => {
    render(
      <DropdownMenu isOpen={true}>
        <div>Test Content</div>
      </DropdownMenu>
    );
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("should render children when open", () => {
    render(
      <DropdownMenu isOpen={true}>
        <div>Child 1</div>
        <div>Child 2</div>
      </DropdownMenu>
    );
    expect(screen.getByText("Child 1")).toBeInTheDocument();
    expect(screen.getByText("Child 2")).toBeInTheDocument();
  });
});
