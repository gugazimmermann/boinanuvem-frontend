import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TableFilters } from "../table-filters";
import type { TableFilter } from "../types";

describe("TableFilters", () => {
  const mockFilters: TableFilter[] = [
    { value: "all", label: "All", active: true, onClick: vi.fn() },
    { value: "active", label: "Active", active: false, onClick: vi.fn() },
    { value: "inactive", label: "Inactive", active: false, onClick: vi.fn() },
  ];

  it("should return null when no filters, search, or content", () => {
    const { container } = render(<TableFilters />);
    expect(container.firstChild).toBeNull();
  });

  it("should render filters", () => {
    render(<TableFilters filters={mockFilters} />);
    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });

  it("should highlight active filter", () => {
    render(<TableFilters filters={mockFilters} />);
    const allButton = screen.getByText("All").closest("button");
    expect(allButton).toHaveClass("bg-gray-100");
  });

  it("should call filter onClick when clicked", async () => {
    const onClick = vi.fn();
    const filters: TableFilter[] = [{ value: "test", label: "Test", active: false, onClick }];
    const user = userEvent.setup();
    render(<TableFilters filters={filters} />);
    await user.click(screen.getByText("Test"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should render search input when search is provided", () => {
    const search = {
      value: "test query",
      onChange: vi.fn(),
      placeholder: "Search...",
    };
    render(<TableFilters search={search} />);
    const input = screen.getByPlaceholderText("Search...");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("test query");
  });

  it("should call search onChange when typing", async () => {
    const onChange = vi.fn();
    const search = {
      value: "",
      onChange,
      placeholder: "Search...",
    };
    const user = userEvent.setup();
    render(<TableFilters search={search} />);
    const input = screen.getByPlaceholderText("Search...");
    await user.type(input, "new query");
    expect(onChange).toHaveBeenCalled();
  });

  it("should render selected count label", () => {
    render(<TableFilters selectedCountLabel="3 selected" />);
    expect(screen.getByText("3 selected")).toBeInTheDocument();
  });

  it("should render selected action button", () => {
    render(<TableFilters selectedActionButton={<button>Delete Selected</button>} />);
    expect(screen.getByRole("button", { name: /delete selected/i })).toBeInTheDocument();
  });

  it("should render additional content", () => {
    render(<TableFilters additionalContent={<div data-testid="additional">Additional</div>} />);
    expect(screen.getByTestId("additional")).toBeInTheDocument();
  });

  it("should render middle content", () => {
    render(<TableFilters middleContent={<div data-testid="middle">Middle</div>} />);
    expect(screen.getByTestId("middle")).toBeInTheDocument();
  });

  it("should render right content", () => {
    render(<TableFilters rightContent={<div data-testid="right">Right</div>} />);
    expect(screen.getByTestId("right")).toBeInTheDocument();
  });

  it("should render below content", () => {
    render(<TableFilters belowContent={<div data-testid="below">Below</div>} />);
    expect(screen.getByTestId("below")).toBeInTheDocument();
  });

  it("should render with default search placeholder", () => {
    const search = {
      value: "",
      onChange: vi.fn(),
    };
    render(<TableFilters search={search} />);
    expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
  });
});
