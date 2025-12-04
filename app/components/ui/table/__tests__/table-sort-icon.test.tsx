import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { TableSortIcon } from "../table-sort-icon";

describe("TableSortIcon", () => {
  it("should render sort icon SVG", () => {
    const { container } = render(<TableSortIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should have correct SVG attributes", () => {
    const { container } = render(<TableSortIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("viewBox", "0 0 10 11");
    expect(svg).toHaveAttribute("fill", "none");
  });

  it("should have correct height class", () => {
    const { container } = render(<TableSortIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("h-3");
  });

  it("should render all path elements", () => {
    const { container } = render(<TableSortIcon />);
    const paths = container.querySelectorAll("path");
    expect(paths.length).toBeGreaterThan(0);
  });
});
