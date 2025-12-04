import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TableFilters } from "../table-filters";

describe("TableFilters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render with filters", () => {
    const filters = [
      { label: "All", value: "all", active: true, onClick: vi.fn() },
      { label: "Active", value: "active", active: false, onClick: vi.fn() },
    ];
    render(<TableFilters filters={filters} />);
    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("should call filter onClick when clicked", async () => {
    const handleFilter = vi.fn();
    const filters = [{ label: "All", value: "all", active: false, onClick: handleFilter }];
    const user = userEvent.setup();
    render(<TableFilters filters={filters} />);
    await user.click(screen.getByText("All"));
    expect(handleFilter).toHaveBeenCalledTimes(1);
  });

  it("should apply active styles to active filter", () => {
    const filters = [{ label: "Active", value: "active", active: true, onClick: vi.fn() }];
    const { container } = render(<TableFilters filters={filters} />);
    const button = container.querySelector("button");
    expect(button).toHaveClass("bg-gray-100");
  });

  it("should apply inactive styles to inactive filter", () => {
    const filters = [{ label: "Inactive", value: "inactive", active: false, onClick: vi.fn() }];
    const { container } = render(<TableFilters filters={filters} />);
    const button = container.querySelector("button");
    expect(button).toHaveClass("hover:bg-gray-100");
  });

  it("should render with search input", () => {
    const search = {
      value: "",
      onChange: vi.fn(),
      placeholder: "Search...",
    };
    render(<TableFilters search={search} />);
    const input = screen.getByPlaceholderText("Search...");
    expect(input).toBeInTheDocument();
  });

  it("should call search onChange when typing", async () => {
    const handleSearchChange = vi.fn();
    const search = {
      value: "",
      onChange: handleSearchChange,
    };
    const user = userEvent.setup();
    render(<TableFilters search={search} />);
    const input = screen.getByRole("textbox");
    await user.type(input, "test");
    expect(handleSearchChange).toHaveBeenCalled();
  });

  it("should display search value", () => {
    const search = {
      value: "test query",
      onChange: vi.fn(),
    };
    render(<TableFilters search={search} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("test query");
  });

  it("should render with selectedCountLabel", () => {
    render(<TableFilters selectedCountLabel="3 selected" />);
    expect(screen.getByText("3 selected")).toBeInTheDocument();
  });

  it("should render with selectedActionButton", () => {
    const actionButton = <button>Delete Selected</button>;
    render(<TableFilters selectedActionButton={actionButton} />);
    expect(screen.getByRole("button", { name: "Delete Selected" })).toBeInTheDocument();
  });

  it("should render with additionalContent", () => {
    const additionalContent = <div data-testid="additional">Additional</div>;
    render(<TableFilters additionalContent={additionalContent} />);
    expect(screen.getByTestId("additional")).toBeInTheDocument();
  });

  it("should render with middleContent", () => {
    const middleContent = <div data-testid="middle">Middle</div>;
    render(<TableFilters middleContent={middleContent} />);
    expect(screen.getByTestId("middle")).toBeInTheDocument();
  });

  it("should render with rightContent", () => {
    const rightContent = <div data-testid="right">Right</div>;
    render(<TableFilters rightContent={rightContent} />);
    expect(screen.getByTestId("right")).toBeInTheDocument();
  });

  it("should render with belowContent", () => {
    const belowContent = <div data-testid="below">Below</div>;
    render(<TableFilters belowContent={belowContent} />);
    expect(screen.getByTestId("below")).toBeInTheDocument();
  });

  it("should return null when no content provided", () => {
    const { container } = render(<TableFilters />);
    expect(container.firstChild).toBeNull();
  });

  it("should return null when filters is empty and no other content", () => {
    const { container } = render(<TableFilters filters={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render search icon", () => {
    const search = {
      value: "",
      onChange: vi.fn(),
    };
    const { container } = render(<TableFilters search={search} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should use default placeholder when not provided", () => {
    const search = {
      value: "",
      onChange: vi.fn(),
    };
    render(<TableFilters search={search} />);
    const input = screen.getByPlaceholderText("Search");
    expect(input).toBeInTheDocument();
  });
});
