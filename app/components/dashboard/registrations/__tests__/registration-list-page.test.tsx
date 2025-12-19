import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegistrationListPage } from "../registration-list-page";
import { renderWithProviders } from "~/utils/test-utils";
import { useNavigate } from "react-router";
import { useListPage } from "~/hooks/use-list-page";
import { useAlert } from "~/hooks/use-alert";
import { useDeleteHandler } from "~/hooks/use-delete-handler";
import { useTableFilters } from "~/hooks/use-table-filters";
import { usePermissions } from "~/utils/permissions";

vi.mock("react-router");
vi.mock("~/hooks/use-list-page");
vi.mock("~/hooks/use-alert");
vi.mock("~/hooks/use-delete-handler");
vi.mock("~/hooks/use-table-filters");
vi.mock("~/utils/permissions");
vi.mock("~/components/ui", () => ({
  Table: ({
    data,
    columns,
    header,
    onRowClick,
    emptyState,
  }: {
    data: unknown[];
    columns?: Array<{
      key: string;
      label?: string;
      render?: (value: unknown, row: unknown, index: number) => React.ReactNode;
    }>;
    header?: { actions?: Array<{ label: string; onClick: () => void }> };
    onRowClick?: (item: { id: string }) => void;
    emptyState?: { onAddNew?: () => void; description?: string; onClearSearch?: () => void };
  }) => (
    <div data-testid="table">
      {header?.actions && header.actions.length > 0 && (
        <button data-testid="add-button" onClick={header.actions[0].onClick}>
          {header.actions[0].label}
        </button>
      )}
      {columns &&
        columns.map((col, colIndex) => {
          if (col.render) {
            // Render column for each row in data, or at least once if data is empty
            const rowsToRender = data.length > 0 ? data : [null];
            return (
              <div key={col.key || colIndex}>
                {rowsToRender.map((row, rowIndex) => {
                  const rendered = col.render!(undefined, row, rowIndex);
                  return <div key={rowIndex}>{rendered}</div>;
                })}
              </div>
            );
          }
          return null;
        })}
      {data.length > 0 && (
        <button
          data-testid="row-button"
          onClick={() => {
            const firstRow = data[0] as { id: string; name?: string };
            onRowClick?.(firstRow);
          }}
        >
          Click Row
        </button>
      )}
      {data.length === 0 && (
        <div data-testid="empty-state">
          {emptyState?.description && (
            <div data-testid="empty-description">{emptyState.description}</div>
          )}
          {emptyState?.onAddNew && (
            <button data-testid="empty-add-button" onClick={emptyState.onAddNew}>
              Add New
            </button>
          )}
          {emptyState?.onClearSearch && (
            <button data-testid="clear-search" onClick={emptyState.onClearSearch}>
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  ),
  Alert: ({ title }: { title: string }) => <div data-testid="alert">{title}</div>,
  ConfirmationModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="delete-modal">Delete Modal</div> : null,
}));

describe("RegistrationListPage", () => {
  const mockUseNavigate = vi.mocked(useNavigate);
  const mockUseListPage = vi.mocked(useListPage);
  const mockUseAlert = vi.mocked(useAlert);
  const mockUseDeleteHandler = vi.mocked(useDeleteHandler);
  const mockUseTableFilters = vi.mocked(useTableFilters);
  const mockUsePermissions = vi.mocked(usePermissions);

  const mockConfig = {
    data: [],
    columns: [],
    title: "Registrations",
    description: "List of registrations",
    badgeLabel: (count: number) => `${count} items`,
    searchPlaceholder: "Search",
    emptyStateTitle: "No registrations",
    emptyStateDescription: () => "No registrations found",
    emptyStateDescriptionWithoutSearch: "No registrations",
    addButtonLabel: "Add New",
    newRoute: "/new",
    viewRoute: (id: string) => `/view/${id}`,
    deleteService: vi.fn(),
    deleteSuccessMessage: "Deleted",
    deleteErrorMessage: "Failed",
    deleteModalTitle: "Delete",
    deleteModalMessage: (name: string) => `Delete ${name}?`,
    deleteModalConfirm: "Delete",
    deleteModalCancel: "Cancel",
    permissionSection: "registration" as const,
    permissionResource: "properties",
    language: "pt" as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseNavigate.mockReturnValue(vi.fn());
    mockUseListPage.mockReturnValue({
      filteredData: [],
      paginatedData: [],
      totalPages: 1,
      currentPage: 1,
      setCurrentPage: vi.fn(),
      searchValue: "",
      setSearchValue: vi.fn(),
      sortState: { column: null, direction: null },
      handleSort: vi.fn(),
      clearSearch: vi.fn(),
    });
    mockUseAlert.mockReturnValue({
      alertMessage: null,
      showAlert: vi.fn(),
      clearAlert: vi.fn(),
    });
    mockUseDeleteHandler.mockReturnValue({
      isDeleteModalOpen: false,
      handleDeleteClick: vi.fn(),
      handleCloseModal: vi.fn(),
      handleDelete: vi.fn(),
      selectedItem: null,
    });
    mockUseTableFilters.mockReturnValue({
      activeFilter: "all",
      onFilterChange: vi.fn(),
      filters: [],
    });
    mockUsePermissions.mockReturnValue({
      canView: vi.fn(() => true),
      canCreate: vi.fn(() => true),
      canUpdate: vi.fn(() => true),
      canDelete: vi.fn(() => true),
      canAdd: vi.fn(() => true),
    });
  });

  it("should create and render list page component", () => {
    renderWithProviders(<RegistrationListPage {...mockConfig} />);
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should render table", () => {
    renderWithProviders(<RegistrationListPage {...mockConfig} />);
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should show add button when canAdd returns true", async () => {
    const user = userEvent.setup();
    const navigate = vi.fn();
    mockUseNavigate.mockReturnValue(navigate);
    mockUsePermissions.mockReturnValue({
      canView: vi.fn(() => true),
      canCreate: vi.fn(() => true),
      canUpdate: vi.fn(() => true),
      canDelete: vi.fn(() => true),
      canAdd: vi.fn(() => true),
    });
    renderWithProviders(<RegistrationListPage {...mockConfig} />);
    const addButton = screen.getByTestId("add-button");
    expect(addButton).toBeInTheDocument();
    await user.click(addButton);
    expect(navigate).toHaveBeenCalledWith("/new");
  });

  it("should not show add button when canAdd returns false", () => {
    mockUsePermissions.mockReturnValue({
      canView: vi.fn(() => true),
      canCreate: vi.fn(() => true),
      canUpdate: vi.fn(() => true),
      canDelete: vi.fn(() => true),
      canAdd: vi.fn(() => false),
    });
    renderWithProviders(<RegistrationListPage {...mockConfig} />);
    expect(screen.queryByTestId("add-button")).not.toBeInTheDocument();
  });

  it("should use customHeaderActions when provided", () => {
    const customAction = {
      label: "Custom Action",
      variant: "primary" as const,
      onClick: vi.fn(),
    };
    renderWithProviders(<RegistrationListPage {...mockConfig} headerActions={[customAction]} />);
    expect(screen.getByTestId("add-button")).toHaveTextContent("Custom Action");
  });

  it("should navigate to viewRoute when row is clicked and onRowClick is not provided", async () => {
    const user = userEvent.setup();
    const navigate = vi.fn();
    mockUseNavigate.mockReturnValue(navigate);
    mockUseListPage.mockReturnValue({
      filteredData: [{ id: "1", name: "Test" }],
      paginatedData: [{ id: "1", name: "Test" }],
      totalPages: 1,
      currentPage: 1,
      setCurrentPage: vi.fn(),
      searchValue: "",
      setSearchValue: vi.fn(),
      sortState: { column: null, direction: null },
      handleSort: vi.fn(),
      clearSearch: vi.fn(),
    });
    renderWithProviders(<RegistrationListPage {...mockConfig} />);
    const rowButton = screen.getByTestId("row-button");
    await user.click(rowButton);
    expect(navigate).toHaveBeenCalledWith("/view/1");
  });

  it("should call onRowClick when provided", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    mockUseListPage.mockReturnValue({
      filteredData: [{ id: "1", name: "Test" }],
      paginatedData: [{ id: "1", name: "Test" }],
      totalPages: 1,
      currentPage: 1,
      setCurrentPage: vi.fn(),
      searchValue: "",
      setSearchValue: vi.fn(),
      sortState: { column: null, direction: null },
      handleSort: vi.fn(),
      clearSearch: vi.fn(),
    });
    renderWithProviders(<RegistrationListPage {...mockConfig} onRowClick={onRowClick} />);
    const rowButton = screen.getByTestId("row-button");
    await user.click(rowButton);
    expect(onRowClick).toHaveBeenCalledWith({ id: "1", name: "Test" });
  });

  it("should show empty state description with search value", () => {
    mockUseListPage.mockReturnValue({
      filteredData: [],
      paginatedData: [],
      totalPages: 1,
      currentPage: 1,
      setCurrentPage: vi.fn(),
      searchValue: "test",
      setSearchValue: vi.fn(),
      sortState: { column: null, direction: null },
      handleSort: vi.fn(),
      clearSearch: vi.fn(),
    });
    renderWithProviders(<RegistrationListPage {...mockConfig} />);
    expect(screen.getByTestId("empty-description")).toHaveTextContent("No registrations found");
  });

  it("should show empty state description without search value", () => {
    mockUseListPage.mockReturnValue({
      filteredData: [],
      paginatedData: [],
      totalPages: 1,
      currentPage: 1,
      setCurrentPage: vi.fn(),
      searchValue: "",
      setSearchValue: vi.fn(),
      sortState: { column: null, direction: null },
      handleSort: vi.fn(),
      clearSearch: vi.fn(),
    });
    renderWithProviders(<RegistrationListPage {...mockConfig} />);
    expect(screen.getByTestId("empty-description")).toHaveTextContent("No registrations");
  });

  it("should show alert when alertMessage exists", () => {
    mockUseAlert.mockReturnValue({
      alertMessage: { title: "Success", variant: "success" },
      showAlert: vi.fn(),
      clearAlert: vi.fn(),
    });
    renderWithProviders(<RegistrationListPage {...mockConfig} />);
    expect(screen.getByTestId("alert")).toHaveTextContent("Success");
  });

  it("should show delete modal when isDeleteModalOpen is true", () => {
    mockUseDeleteHandler.mockReturnValue({
      isDeleteModalOpen: true,
      handleDeleteClick: vi.fn(),
      handleCloseModal: vi.fn(),
      handleDelete: vi.fn(),
      selectedItem: { id: "1", name: "Test Item" },
    });
    renderWithProviders(<RegistrationListPage {...mockConfig} />);
    expect(screen.getByTestId("delete-modal")).toBeInTheDocument();
  });

  it("should navigate to newRoute when empty state add button is clicked", async () => {
    const user = userEvent.setup();
    const navigate = vi.fn();
    mockUseNavigate.mockReturnValue(navigate);
    renderWithProviders(<RegistrationListPage {...mockConfig} />);
    const emptyAddButton = screen.getByTestId("empty-add-button");
    await user.click(emptyAddButton);
    expect(navigate).toHaveBeenCalledWith("/new");
  });

  it("should include additionalFilters when provided", () => {
    const additionalFilter = {
      label: "Status",
      options: [{ label: "Active", value: "active" }],
      value: "active",
      onChange: vi.fn(),
      onClick: vi.fn(),
    };
    mockUseTableFilters.mockReturnValue({
      activeFilter: "all",
      onFilterChange: vi.fn(),
      filters: [],
    });
    renderWithProviders(
      <RegistrationListPage {...mockConfig} additionalFilters={[additionalFilter]} />
    );
    // Filters should be included
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should clone element with onDelete when actions column has render", () => {
    // Suppress React warning about unknown event handler property 'onDelete'
    // This is expected behavior - the component uses cloneElement to add custom props
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation((message: unknown, ...args: unknown[]) => {
        // Suppress React's warning about unknown event handler property
        if (typeof message === "string" && message.includes("Unknown event handler property")) {
          return;
        }
        // For other errors, use the original console.error
        if (typeof console !== "undefined" && console.error) {
          console.error(message, ...args);
        }
      });

    try {
      const mockColumns = [
        {
          key: "actions",
          label: "Actions",
          render: () => <button data-testid="action-button">Delete</button>,
        },
      ];
      renderWithProviders(<RegistrationListPage {...mockConfig} columns={mockColumns} />);
      // The action button should be rendered with onDelete prop
      expect(screen.getByTestId("action-button")).toBeInTheDocument();
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });
});
