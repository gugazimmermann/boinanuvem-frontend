import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TableEmptyState } from "../table-empty-state";

describe("TableEmptyState", () => {
  it("should render with default title", () => {
    render(<TableEmptyState />);
    expect(screen.getByText("No vendors found")).toBeInTheDocument();
  });

  it("should render with custom title", () => {
    render(<TableEmptyState title="No items found" />);
    expect(screen.getByText("No items found")).toBeInTheDocument();
  });

  it("should render default description when no search query", () => {
    render(<TableEmptyState />);
    expect(screen.getByText(/No data available/i)).toBeInTheDocument();
  });

  it("should render search-specific description when search query exists", () => {
    render(<TableEmptyState searchQuery="test" />);
    expect(screen.getByText(/Your search "test"/i)).toBeInTheDocument();
  });

  it("should render custom description", () => {
    render(<TableEmptyState description="Custom description" />);
    expect(screen.getByText("Custom description")).toBeInTheDocument();
  });

  it("should call onClearSearch when clear search button is clicked", async () => {
    const onClearSearch = vi.fn();
    const user = userEvent.setup();
    render(<TableEmptyState searchQuery="test" onClearSearch={onClearSearch} />);

    const clearButton = screen.getByText(/Clear Search/i);
    await user.click(clearButton);

    expect(onClearSearch).toHaveBeenCalledTimes(1);
  });

  it("should call onAddNew when add new button is clicked", async () => {
    const onAddNew = vi.fn();
    const user = userEvent.setup();
    render(<TableEmptyState onAddNew={onAddNew} />);

    const addButton = screen.getByText(/Add vendor|Add new/i);
    await user.click(addButton);

    expect(onAddNew).toHaveBeenCalledTimes(1);
  });

  it("should render custom labels", () => {
    render(
      <TableEmptyState
        clearSearchLabel="Limpar busca"
        addNewLabel="Adicionar novo"
        onClearSearch={vi.fn()}
        onAddNew={vi.fn()}
      />
    );
    expect(screen.getByText("Limpar busca")).toBeInTheDocument();
    expect(screen.getByText("Adicionar novo")).toBeInTheDocument();
  });

  it("should render custom icon", () => {
    const customIcon = <span data-testid="custom-icon">📦</span>;
    render(<TableEmptyState icon={customIcon} />);
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("should not render buttons when callbacks are not provided", () => {
    render(<TableEmptyState />);
    expect(screen.queryByText(/Clear Search/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Add vendor/i)).not.toBeInTheDocument();
  });
});
