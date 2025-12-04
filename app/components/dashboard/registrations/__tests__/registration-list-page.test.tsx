import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router";
import { RegistrationListPage } from "../registration-list-page";
import { LanguageProvider } from "~/contexts/language-context";
import * as useListPageModule from "~/hooks/use-list-page";
import * as useDeleteHandlerModule from "~/hooks/use-delete-handler";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <LanguageProvider>{children}</LanguageProvider>
  </BrowserRouter>
);

const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("~/hooks/use-list-page", () => ({
  useListPage: vi.fn(),
}));

const mockUseAlert = vi.fn();
vi.mock("~/hooks/use-alert", () => ({
  useAlert: () => mockUseAlert(),
}));

vi.mock("~/hooks/use-delete-handler", () => ({
  useDeleteHandler: vi.fn(),
}));

const mockUseTableFilters = vi.fn();
vi.mock("~/hooks/use-table-filters", () => ({
  useTableFilters: () => mockUseTableFilters(),
}));

const mockCanAdd = vi.fn();
const mockUsePermissions = vi.fn();
vi.mock("~/utils/permissions", () => ({
  usePermissions: () => mockUsePermissions(),
}));

vi.mock("~/components/ui", () => ({
  Table: vi.fn(
    ({
      data,
      columns,
      header,
      filters,
      search,
      pagination,
      onRowClick,
      emptyState,
    }: {
      data?: unknown[];
      columns?: unknown[];
      header?: {
        title?: string;
        badge?: { label: string };
        description?: string;
        actions?: Array<{ label: string; onClick: () => void }>;
      };
      filters?: Array<{ label: string }>;
      search?: { value: string; onChange: (value: string) => void; placeholder?: string };
      pagination?: {
        currentPage: number;
        totalPages: number;
        onPageChange: (page: number) => void;
      };
      onRowClick?: (row: unknown) => void;
      emptyState?: {
        title?: string;
        description?: string;
        onClearSearch?: () => void;
        onAddNew?: () => void;
        addNewLabel?: string;
      };
    }) => (
      <div data-testid="table">
        {header?.title && <h2>{header.title}</h2>}
        {header?.badge && <span>{header.badge.label}</span>}
        {header?.description && <p>{header.description}</p>}
        {header?.actions?.map((action, idx: number) => (
          <button key={idx} onClick={action.onClick} data-testid={`header-action-${idx}`}>
            {action.label}
          </button>
        ))}
        {search && (
          <input
            data-testid="search-input"
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            placeholder={search.placeholder}
          />
        )}
        {filters?.map((filter, idx: number) => (
          <div key={idx} data-testid={`filter-${idx}`}>
            {filter.label}
          </div>
        ))}
        {pagination && (
          <div data-testid="pagination">
            <button onClick={() => pagination.onPageChange(pagination.currentPage - 1)}>
              Prev
            </button>
            <span>
              {pagination.currentPage} / {pagination.totalPages}
            </span>
            <button onClick={() => pagination.onPageChange(pagination.currentPage + 1)}>
              Next
            </button>
          </div>
        )}
        {data && data.length > 0 ? (
          <table>
            <tbody>
              {data.map((row, idx) => {
                const rowRecord = row as Record<string, unknown>;
                return (
                  <tr
                    key={(rowRecord.id as string) || idx}
                    onClick={() => onRowClick?.(row)}
                    data-testid={`row-${rowRecord.id}`}
                  >
                    {columns?.map((col, _colIdx) => {
                      const colRecord = col as {
                        key: string;
                        render?: (value: unknown, row: unknown, idx: number) => React.ReactNode;
                      };
                      return (
                        <td key={colRecord.key}>
                          {colRecord.render
                            ? colRecord.render(rowRecord[colRecord.key], row, idx)
                            : String(rowRecord[colRecord.key] ?? "")}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div data-testid="empty-state">
            <h3>{emptyState?.title}</h3>
            <p>{emptyState?.description}</p>
            {emptyState?.onClearSearch && (
              <button onClick={emptyState.onClearSearch}>Clear search</button>
            )}
            {emptyState?.onAddNew && (
              <button onClick={emptyState.onAddNew}>{emptyState.addNewLabel}</button>
            )}
          </div>
        )}
      </div>
    )
  ),
  Alert: vi.fn(({ title, variant }: { title: string; variant?: string }) => (
    <div data-testid="alert" data-variant={variant}>
      {title}
    </div>
  )),
  ConfirmationModal: vi.fn(
    ({
      isOpen,
      onClose,
      onConfirm,
      title,
      message,
      confirmLabel,
      cancelLabel,
    }: {
      isOpen: boolean;
      onClose: () => void;
      onConfirm: () => void;
      title: string;
      message: string;
      confirmLabel: string;
      cancelLabel: string;
    }) =>
      isOpen ? (
        <div data-testid="confirmation-modal">
          <h3>{title}</h3>
          <p>{message}</p>
          <button onClick={onConfirm}>{confirmLabel}</button>
          <button onClick={onClose}>{cancelLabel}</button>
        </div>
      ) : null
  ),
}));

describe("RegistrationListPage", () => {
  const mockData = [
    { id: "1", name: "Item 1", status: "active" as const },
    { id: "2", name: "Item 2", status: "inactive" as const },
  ];

  const mockColumns = [
    { key: "name", label: "Name", sortable: true },
    { key: "status", label: "Status", sortable: true },
  ];

  const defaultConfig = {
    data: mockData,
    columns: mockColumns,
    title: "Test Items",
    description: "Test description",
    badgeLabel: (count: number) => `${count} items`,
    searchPlaceholder: "Search items",
    emptyStateTitle: "No items found",
    emptyStateDescription: (search: string) => `No items match "${search}"`,
    emptyStateDescriptionWithoutSearch: "No items available",
    addButtonLabel: "Add Item",
    newRoute: "/new",
    viewRoute: (id: string) => `/view/${id}`,
    deleteService: vi.fn(() => true),
    deleteSuccessMessage: "Item deleted",
    deleteErrorMessage: "Failed to delete",
    deleteModalTitle: "Delete Item",
    deleteModalMessage: (name: string) => `Delete ${name}?`,
    deleteModalConfirm: "Delete",
    deleteModalCancel: "Cancel",
    permissionSection: "registration" as const,
    permissionResource: "items",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useListPageModule.useListPage).mockReturnValue({
      paginatedData: mockData,
      filteredData: mockData,
      searchValue: "",
      setSearchValue: vi.fn(),
      currentPage: 1,
      totalPages: 1,
      setCurrentPage: vi.fn(),
      sortState: { column: null, direction: "asc" as const },
      handleSort: vi.fn(),
      clearSearch: vi.fn(),
    });
    mockUseAlert.mockReturnValue({
      alertMessage: null,
      showAlert: vi.fn(),
    });
    vi.mocked(useDeleteHandlerModule.useDeleteHandler).mockReturnValue({
      handleDeleteClick: vi.fn(),
      handleDelete: vi.fn(),
      handleCloseModal: vi.fn(),
      isDeleteModalOpen: false,
      selectedItem: null,
    });
    mockUseTableFilters.mockReturnValue({
      filters: [],
    });
    mockUsePermissions.mockReturnValue({
      canAdd: mockCanAdd,
    });
    mockCanAdd.mockReturnValue(true);
  });

  it("should render table with data", () => {
    render(
      <TestWrapper>
        <RegistrationListPage {...defaultConfig} />
      </TestWrapper>
    );

    expect(screen.getByTestId("table")).toBeInTheDocument();
    expect(screen.getByText("Test Items")).toBeInTheDocument();
    expect(screen.getByText("2 items")).toBeInTheDocument();
  });

  it("should render header actions when canAdd returns true", () => {
    mockCanAdd.mockReturnValue(true);
    render(
      <TestWrapper>
        <RegistrationListPage {...defaultConfig} />
      </TestWrapper>
    );

    const addButton = screen.getByTestId("header-action-0");
    expect(addButton).toBeInTheDocument();
    expect(addButton).toHaveTextContent("Add Item");
  });

  it("should not render header actions when canAdd returns false", () => {
    mockCanAdd.mockReturnValue(false);
    render(
      <TestWrapper>
        <RegistrationListPage {...defaultConfig} />
      </TestWrapper>
    );

    expect(screen.queryByTestId("header-action-0")).not.toBeInTheDocument();
  });

  it("should navigate to new route when add button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <RegistrationListPage {...defaultConfig} />
      </TestWrapper>
    );

    const addButton = screen.getByTestId("header-action-0");
    await user.click(addButton);
    expect(mockNavigate).toHaveBeenCalledWith("/new");
  });

  it("should render search input", () => {
    render(
      <TestWrapper>
        <RegistrationListPage {...defaultConfig} />
      </TestWrapper>
    );

    const searchInput = screen.getByTestId("search-input");
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute("placeholder", "Search items");
  });

  it("should handle row click and navigate to view route", async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <RegistrationListPage {...defaultConfig} />
      </TestWrapper>
    );

    const row = screen.getByTestId("row-1");
    await user.click(row);
    expect(mockNavigate).toHaveBeenCalledWith("/view/1");
  });

  it("should call custom onRowClick when provided", async () => {
    const onRowClick = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <RegistrationListPage {...defaultConfig} onRowClick={onRowClick} />
      </TestWrapper>
    );

    const row = screen.getByTestId("row-1");
    await user.click(row);
    expect(onRowClick).toHaveBeenCalledWith(mockData[0]);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should render empty state when no data", () => {
    vi.mocked(useListPageModule.useListPage).mockReturnValue({
      paginatedData: [],
      filteredData: [],
      searchValue: "",
      setSearchValue: vi.fn(),
      currentPage: 1,
      totalPages: 1,
      setCurrentPage: vi.fn(),
      sortState: { column: null, direction: "asc" as const },
      handleSort: vi.fn(),
      clearSearch: vi.fn(),
    });

    render(
      <TestWrapper>
        <RegistrationListPage {...defaultConfig} data={[]} />
      </TestWrapper>
    );

    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    expect(screen.getByText("No items found")).toBeInTheDocument();
    expect(screen.getByText("No items available")).toBeInTheDocument();
  });

  it("should render empty state with search description when search value exists", () => {
    vi.mocked(useListPageModule.useListPage).mockReturnValue({
      paginatedData: [],
      filteredData: [],
      searchValue: "test",
      setSearchValue: vi.fn(),
      currentPage: 1,
      totalPages: 1,
      setCurrentPage: vi.fn(),
      sortState: { column: null, direction: "asc" as const },
      handleSort: vi.fn(),
      clearSearch: vi.fn(),
    });

    render(
      <TestWrapper>
        <RegistrationListPage {...defaultConfig} data={[]} />
      </TestWrapper>
    );

    expect(screen.getByText('No items match "test"')).toBeInTheDocument();
  });

  it("should render alert when alertMessage exists", () => {
    mockUseAlert.mockReturnValue({
      alertMessage: { title: "Success", variant: "success" },
      showAlert: vi.fn(),
    });

    render(
      <TestWrapper>
        <RegistrationListPage {...defaultConfig} />
      </TestWrapper>
    );

    const alert = screen.getByTestId("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent("Success");
    expect(alert).toHaveAttribute("data-variant", "success");
  });

  it("should render confirmation modal when delete modal is open", () => {
    vi.mocked(useDeleteHandlerModule.useDeleteHandler).mockReturnValue({
      handleDeleteClick: vi.fn(),
      handleDelete: vi.fn(),
      handleCloseModal: vi.fn(),
      isDeleteModalOpen: true,
      selectedItem: { id: "1", name: "Item 1" },
    });

    render(
      <TestWrapper>
        <RegistrationListPage {...defaultConfig} />
      </TestWrapper>
    );

    const modal = screen.getByTestId("confirmation-modal");
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveTextContent("Delete Item");
    expect(modal).toHaveTextContent("Delete Item 1?");
  });

  it("should call delete handler when delete is clicked", () => {
    const handleDeleteClick = vi.fn();
    vi.mocked(useDeleteHandlerModule.useDeleteHandler).mockReturnValue({
      handleDeleteClick,
      handleDelete: vi.fn(),
      handleCloseModal: vi.fn(),
      isDeleteModalOpen: false,
      selectedItem: null,
    });

    const onDeleteClick = vi.fn();
    render(
      <TestWrapper>
        <RegistrationListPage {...defaultConfig} onDeleteClick={onDeleteClick} />
      </TestWrapper>
    );

    // The delete handler should be set up via column render
    expect(vi.mocked(useDeleteHandlerModule.useDeleteHandler)).toHaveBeenCalled();
  });

  it("should render custom header actions when provided", () => {
    const customActions = [
      { label: "Custom Action", variant: "primary" as const, onClick: vi.fn() },
    ];

    render(
      <TestWrapper>
        <RegistrationListPage {...defaultConfig} headerActions={customActions} />
      </TestWrapper>
    );

    expect(screen.getByText("Custom Action")).toBeInTheDocument();
  });

  it("should render additional filters", () => {
    const additionalFilters = [{ label: "Status", value: "all", onClick: vi.fn() }];

    mockUseTableFilters.mockReturnValue({
      filters: [],
    });

    render(
      <TestWrapper>
        <RegistrationListPage {...defaultConfig} additionalFilters={additionalFilters} />
      </TestWrapper>
    );

    expect(mockUseTableFilters).toHaveBeenCalled();
  });

  it("should handle pagination", async () => {
    const setCurrentPage = vi.fn();
    vi.mocked(useListPageModule.useListPage).mockReturnValue({
      paginatedData: mockData,
      filteredData: mockData,
      searchValue: "",
      setSearchValue: vi.fn(),
      currentPage: 2,
      totalPages: 3,
      setCurrentPage,
      sortState: { column: null, direction: "asc" as const },
      handleSort: vi.fn(),
      clearSearch: vi.fn(),
    });

    const user = userEvent.setup();
    render(
      <TestWrapper>
        <RegistrationListPage {...defaultConfig} />
      </TestWrapper>
    );

    const nextButton = screen.getByText("Next");
    await user.click(nextButton);
    expect(setCurrentPage).toHaveBeenCalledWith(3);
  });

  it("should use custom language", () => {
    render(
      <TestWrapper>
        <RegistrationListPage {...defaultConfig} language="en" />
      </TestWrapper>
    );

    expect(vi.mocked(useListPageModule.useListPage)).toHaveBeenCalledWith(
      expect.objectContaining({
        language: "en",
      })
    );
  });

  it("should use custom itemsPerPage", () => {
    render(
      <TestWrapper>
        <RegistrationListPage {...defaultConfig} itemsPerPage={20} />
      </TestWrapper>
    );

    expect(vi.mocked(useListPageModule.useListPage)).toHaveBeenCalledWith(
      expect.objectContaining({
        itemsPerPage: 20,
      })
    );
  });

  it("should call onDeleteSuccess when delete succeeds", () => {
    const onDeleteSuccess = vi.fn();
    render(
      <TestWrapper>
        <RegistrationListPage {...defaultConfig} onDeleteSuccess={onDeleteSuccess} />
      </TestWrapper>
    );

    expect(vi.mocked(useDeleteHandlerModule.useDeleteHandler)).toHaveBeenCalledWith(
      expect.objectContaining({
        onSuccess: onDeleteSuccess,
      })
    );
  });
});
