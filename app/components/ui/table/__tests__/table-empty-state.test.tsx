import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TableEmptyState } from "../table-empty-state";

vi.mock("~/i18n/use-translation", () => ({
  useTranslation: () => ({
    common: {
      clearSearch: "Clear search",
    },
  }),
}));

describe("TableEmptyState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render with default title", () => {
    render(<TableEmptyState />);
    expect(screen.getByText("No vendors found")).toBeInTheDocument();
  });

  it("should render with custom title", () => {
    render(<TableEmptyState title="No items" />);
    expect(screen.getByText("No items")).toBeInTheDocument();
  });

  it("should render with description", () => {
    render(<TableEmptyState description="Custom description" />);
    expect(screen.getByText("Custom description")).toBeInTheDocument();
  });

  it("should render default description when no search query", () => {
    render(<TableEmptyState />);
    expect(
      screen.getByText(/No data available. Please try again or create add a new vendor./i)
    ).toBeInTheDocument();
  });

  it("should render search-specific description when searchQuery provided", () => {
    render(<TableEmptyState searchQuery="test search" />);
    expect(
      screen.getByText(/Your search "test search" did not match any vendors/i)
    ).toBeInTheDocument();
  });

  it("should render clear search button when onClearSearch provided", () => {
    const handleClearSearch = vi.fn();
    render(<TableEmptyState onClearSearch={handleClearSearch} />);
    expect(screen.getByRole("button", { name: /clear search/i })).toBeInTheDocument();
  });

  it("should call onClearSearch when clear search button clicked", async () => {
    const handleClearSearch = vi.fn();
    const user = userEvent.setup();
    render(<TableEmptyState onClearSearch={handleClearSearch} />);
    await user.click(screen.getByRole("button", { name: /clear search/i }));
    expect(handleClearSearch).toHaveBeenCalledTimes(1);
  });

  it("should render with custom clearSearchLabel", () => {
    const handleClearSearch = vi.fn();
    render(<TableEmptyState onClearSearch={handleClearSearch} clearSearchLabel="Reset" />);
    expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();
  });

  it("should render add new button when onAddNew provided", () => {
    const handleAddNew = vi.fn();
    render(<TableEmptyState onAddNew={handleAddNew} />);
    expect(screen.getByRole("button", { name: /add vendor/i })).toBeInTheDocument();
  });

  it("should call onAddNew when add new button clicked", async () => {
    const handleAddNew = vi.fn();
    const user = userEvent.setup();
    render(<TableEmptyState onAddNew={handleAddNew} />);
    await user.click(screen.getByRole("button", { name: /add vendor/i }));
    expect(handleAddNew).toHaveBeenCalledTimes(1);
  });

  it("should render with custom addNewLabel", () => {
    const handleAddNew = vi.fn();
    render(<TableEmptyState onAddNew={handleAddNew} addNewLabel="Create Item" />);
    expect(screen.getByRole("button", { name: "Create Item" })).toBeInTheDocument();
  });

  it("should render custom icon", () => {
    const customIcon = <span data-testid="custom-icon">Custom</span>;
    render(<TableEmptyState icon={customIcon} />);
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("should render default icon when not provided", () => {
    const { container } = render(<TableEmptyState />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should render both clear search and add new buttons", () => {
    const handleClearSearch = vi.fn();
    const handleAddNew = vi.fn();
    render(<TableEmptyState onClearSearch={handleClearSearch} onAddNew={handleAddNew} />);
    expect(screen.getByRole("button", { name: /clear search/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add vendor/i })).toBeInTheDocument();
  });

  it("should not render buttons when handlers not provided", () => {
    render(<TableEmptyState />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
