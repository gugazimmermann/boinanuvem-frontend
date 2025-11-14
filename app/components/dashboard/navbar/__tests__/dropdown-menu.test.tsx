import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DropdownMenu } from "../dropdown-menu";

describe("DropdownMenu", () => {
  it("should return null when isOpen is false", () => {
    const { container } = render(<DropdownMenu isOpen={false}>Content</DropdownMenu>);
    expect(container.firstChild).toBeNull();
  });

  it("should render children when isOpen is true", () => {
    render(<DropdownMenu isOpen={true}>Menu Content</DropdownMenu>);
    expect(screen.getByText("Menu Content")).toBeInTheDocument();
  });

  it("should have correct styling classes", () => {
    const { container } = render(<DropdownMenu isOpen={true}>Content</DropdownMenu>);
    const menu = container.querySelector(".absolute");
    expect(menu).toBeInTheDocument();
    expect(menu?.className).toContain("bg-white");
  });
});
