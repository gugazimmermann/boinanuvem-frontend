import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TableFilters } from "../table-filters";

describe("TableFilters", () => {
  it("should return null when no filters and no search", () => {
    const { container } = render(<TableFilters />);
    expect(container.firstChild).toBeNull();
  });

  it("should render filters", () => {
    const filters = [
      { value: "all", label: "All", active: true, onClick: vi.fn() },
      { value: "active", label: "Active", active: false, onClick: vi.fn() },
    ];

    render(<TableFilters filters={filters} />);
    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("should call onClick when filter is clicked", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    const filters = [{ value: "all", label: "All", active: false, onClick }];

    render(<TableFilters filters={filters} />);

    const filterButton = screen.getByText("All");
    await user.click(filterButton);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should render search input", () => {
    const search = {
      value: "",
      onChange: vi.fn(),
      placeholder: "Search items",
    };

    render(<TableFilters search={search} />);
    expect(screen.getByPlaceholderText("Search items")).toBeInTheDocument();
  });

  it("should handle search input change", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const search = {
      value: "",
      onChange,
      placeholder: "Search",
    };

    render(<TableFilters search={search} />);

    const input = screen.getByPlaceholderText("Search");
    await user.type(input, "test");

    expect(onChange).toHaveBeenCalled();
  });

  it("should render both filters and search", () => {
    const filters = [{ value: "all", label: "All", active: true, onClick: vi.fn() }];
    const search = { value: "", onChange: vi.fn() };

    render(<TableFilters filters={filters} search={search} />);
    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
  });
});
