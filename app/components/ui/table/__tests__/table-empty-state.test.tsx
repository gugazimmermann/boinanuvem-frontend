import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TableEmptyState } from "../table-empty-state";
import { LanguageProvider } from "~/contexts/language-context";

const renderWithProvider = (component: React.ReactElement) => {
  return render(<LanguageProvider>{component}</LanguageProvider>);
};

describe("TableEmptyState", () => {
  it("should render with default title", () => {
    renderWithProvider(<TableEmptyState />);
    expect(screen.getByText("No vendors found")).toBeInTheDocument();
  });

  it("should render with custom title", () => {
    renderWithProvider(<TableEmptyState title="No items found" />);
    expect(screen.getByText("No items found")).toBeInTheDocument();
  });

  it("should render default description when no search query", () => {
    renderWithProvider(<TableEmptyState />);
    expect(screen.getByText(/No data available/i)).toBeInTheDocument();
  });

  it("should render search-specific description when search query exists", () => {
    renderWithProvider(<TableEmptyState searchQuery="test" />);
    expect(screen.getByText(/Your search "test"/i)).toBeInTheDocument();
  });

  it("should render custom description", () => {
    renderWithProvider(<TableEmptyState description="Custom description" />);
    expect(screen.getByText("Custom description")).toBeInTheDocument();
  });

  it("should call onClearSearch when clear search button is clicked", async () => {
    const onClearSearch = vi.fn();
    const user = userEvent.setup();
    renderWithProvider(<TableEmptyState searchQuery="test" onClearSearch={onClearSearch} />);

    const clearButton = screen.getByText(/Clear Search/i);
    await user.click(clearButton);

    expect(onClearSearch).toHaveBeenCalledTimes(1);
  });

  it("should call onAddNew when add new button is clicked", async () => {
    const onAddNew = vi.fn();
    const user = userEvent.setup();
    renderWithProvider(<TableEmptyState onAddNew={onAddNew} />);

    const addButton = screen.getByText(/Add vendor|Add new/i);
    await user.click(addButton);

    expect(onAddNew).toHaveBeenCalledTimes(1);
  });

  it("should render custom labels", () => {
    renderWithProvider(
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
    renderWithProvider(<TableEmptyState icon={customIcon} />);
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("should not render buttons when callbacks are not provided", () => {
    renderWithProvider(<TableEmptyState />);
    expect(screen.queryByText(/Clear Search/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Add vendor/i)).not.toBeInTheDocument();
  });
});
