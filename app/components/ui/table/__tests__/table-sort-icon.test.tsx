import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { TableSortIcon } from "../table-sort-icon";

describe("TableSortIcon", () => {
  it("should render sort icon", () => {
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
    expect(svg).toBeInTheDocument();
    expect(svg?.getAttribute("class")).toContain("h-3");
  });
});
