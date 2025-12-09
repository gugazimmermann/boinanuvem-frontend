import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { TableSortIcon } from "../table-sort-icon";

describe("TableSortIcon", () => {
  it("should render SVG icon", () => {
    const { container } = render(<TableSortIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should have correct viewBox", () => {
    const { container } = render(<TableSortIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("viewBox", "0 0 10 11");
  });

  it("should have correct height class", () => {
    const { container } = render(<TableSortIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("h-3");
  });

  it("should render path elements", () => {
    const { container } = render(<TableSortIcon />);
    const paths = container.querySelectorAll("path");
    expect(paths.length).toBeGreaterThan(0);
  });
});
