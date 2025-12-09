import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TableEmptyState } from "../table-empty-state";

vi.mock("~/i18n/use-translation", () => ({
  useTranslation: vi.fn(() => ({
    common: {
      clearSearch: "Clear search",
    },
  })),
}));

describe("TableEmptyState", () => {
  it("should render default title", () => {
    render(<TableEmptyState />);
    expect(screen.getByText("No vendors found")).toBeInTheDocument();
  });

  it("should render custom title", () => {
    render(<TableEmptyState title="No items found" />);
    expect(screen.getByText("No items found")).toBeInTheDocument();
  });

  it("should render default description when no search query", () => {
    render(<TableEmptyState />);
    expect(screen.getByText(/no data available/i)).toBeInTheDocument();
  });

  it("should render search-specific description when searchQuery is provided", () => {
    render(<TableEmptyState searchQuery="test search" />);
    expect(screen.getByText(/your search "test search"/i)).toBeInTheDocument();
  });

  it("should render custom description", () => {
    render(<TableEmptyState description="Custom description" />);
    expect(screen.getByText("Custom description")).toBeInTheDocument();
  });

  it("should render clear search button when onClearSearch is provided", async () => {
    const onClearSearch = vi.fn();
    const user = userEvent.setup();
    render(<TableEmptyState searchQuery="test" onClearSearch={onClearSearch} />);
    const clearButton = screen.getByRole("button", { name: /clear search/i });
    expect(clearButton).toBeInTheDocument();
    await user.click(clearButton);
    expect(onClearSearch).toHaveBeenCalledTimes(1);
  });

  it("should render custom clear search label", () => {
    render(
      <TableEmptyState
        searchQuery="test"
        onClearSearch={vi.fn()}
        clearSearchLabel="Remove filter"
      />
    );
    expect(screen.getByRole("button", { name: /remove filter/i })).toBeInTheDocument();
  });

  it("should render add new button when onAddNew is provided", async () => {
    const onAddNew = vi.fn();
    const user = userEvent.setup();
    render(<TableEmptyState onAddNew={onAddNew} />);
    const addButton = screen.getByRole("button", { name: /add vendor/i });
    expect(addButton).toBeInTheDocument();
    await user.click(addButton);
    expect(onAddNew).toHaveBeenCalledTimes(1);
  });

  it("should render custom add new label", () => {
    render(<TableEmptyState onAddNew={vi.fn()} addNewLabel="Create new item" />);
    expect(screen.getByRole("button", { name: /create new item/i })).toBeInTheDocument();
  });

  it("should render custom icon", () => {
    const customIcon = <span data-testid="custom-icon">Custom</span>;
    render(<TableEmptyState icon={customIcon} />);
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("should render default icon when icon not provided", () => {
    const { container } = render(<TableEmptyState />);
    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("should render both clear search and add new buttons", () => {
    render(<TableEmptyState searchQuery="test" onClearSearch={vi.fn()} onAddNew={vi.fn()} />);
    expect(screen.getByRole("button", { name: /clear search/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add vendor/i })).toBeInTheDocument();
  });
});
