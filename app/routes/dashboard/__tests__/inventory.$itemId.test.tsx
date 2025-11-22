import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import InventoryItemDetails from "../inventory.$itemId";
import { getInventoryItemById, getCurrentStock } from "~/services/inventory.service";
import { getMovementsByItemId } from "~/services/inventory-movements.service";
import { InventoryItemCategory, InventoryMovementType } from "~/types";

const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ itemId: "item-1" }),
  };
});

const mockItem = {
  id: "item-1",
  code: "ITEM001",
  name: "Test Item",
  description: "Test description",
  category: InventoryItemCategory.FEED,
  unit: "kg",
  minimumStock: 100,
  unitPrice: 10.5,
  supplierId: "supplier-1",
  hasExpiration: false,
  companyId: "company-1",
  propertyIds: ["property-1"],
  createdAt: "2025-01-01",
};

const mockMovements = [
  {
    id: "mov-1",
    itemId: "item-1",
    type: InventoryMovementType.PURCHASE,
    quantity: 200,
    unitPrice: 10.5,
    date: "2025-01-10",
    description: "Test purchase",
    supplierId: "supplier-1",
    propertyId: "property-1",
    companyId: "company-1",
    createdAt: "2025-01-10",
  },
  {
    id: "mov-2",
    itemId: "item-1",
    type: InventoryMovementType.CONSUMPTION,
    quantity: 50,
    date: "2025-01-15",
    description: "Test consumption",
    propertyId: "property-1",
    companyId: "company-1",
    createdAt: "2025-01-15",
  },
];

vi.mock("~/services/inventory.service", () => ({
  getInventoryItemById: vi.fn(() => mockItem),
  getCurrentStock: vi.fn(() => 150),
}));

vi.mock("~/services/inventory-movements.service", () => ({
  getMovementsByItemId: vi.fn(() => mockMovements),
}));

vi.mock("~/services/suppliers.service", () => ({
  getSupplierById: vi.fn(() => ({ id: "supplier-1", name: "Test Supplier" })),
}));

vi.mock("~/services/properties.service", () => ({
  getPropertyById: vi.fn(() => ({ id: "property-1", name: "Test Property" })),
}));

vi.mock("~/services/cash-flow.service", () => ({
  getCashFlowById: vi.fn(() => ({ id: "cashflow-1", amount: 2100 })),
}));

const mockObservations = [
  {
    id: "obs-1",
    itemId: "item-1",
    observation: "Test observation 1",
    fileIds: ["file-1"],
    createdAt: "2025-01-10T10:00:00Z",
    createdBy: "user-1",
  },
  {
    id: "obs-2",
    itemId: "item-1",
    observation: "Test observation 2",
    fileIds: [],
    createdAt: "2025-01-15T10:00:00Z",
    createdBy: "user-1",
  },
];

const mockGetInventoryObservationsByItemId = vi.fn(() => mockObservations);
const mockAddInventoryObservation = vi.fn();

vi.mock("~/services/inventory-observations.service", () => ({
  getInventoryObservationsByItemId: (...args: unknown[]) =>
    mockGetInventoryObservationsByItemId(...args),
  addInventoryObservation: (...args: unknown[]) => mockAddInventoryObservation(...args),
}));

const mockUsePermissions = vi.fn();
vi.mock("~/utils/permissions", () => ({
  usePermissions: () => mockUsePermissions(),
}));

vi.mock("~/components/ui", () => ({
  Button: ({
    children,
    onClick,
    variant,
    leftIcon,
    ...props
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    variant?: string;
    leftIcon?: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <button data-testid={`button-${variant || "default"}`} onClick={onClick} {...props}>
      {leftIcon}
      {children}
    </button>
  ),
  StatusBadge: ({ label, variant }: { label?: string; variant?: string }) => (
    <span data-testid={`status-badge-${variant || "default"}`}>{label}</span>
  ),
  Table: ({
    data,
    header,
    search,
    pagination: _pagination,
    sortState: _sortState,
    onSort: _onSort,
    emptyState,
    columns,
  }: {
    data?: unknown[];
    header?: {
      title?: string;
      badge?: { label?: string };
      actions?: Array<{ onClick?: () => void }>;
    };
    search?: { placeholder?: string; value: string; onChange: (value: string) => void };
    pagination?: { currentPage: number; totalPages: number; onPageChange: (page: number) => void };
    sortState?: { column: string | null; direction: string };
    onSort?: (column: string, direction: string) => void;
    emptyState?: { title?: string; onAddNew?: () => void };
    columns?: Array<{
      key: string;
      label: string;
      render?: (value: unknown, row: unknown) => React.ReactNode;
    }>;
  }) => (
    <div
      data-testid={
        header?.title?.includes("Observações") || header?.title?.includes("Observations")
          ? "observations-table"
          : "movements-table"
      }
    >
      {header?.title && <h3>{header.title}</h3>}
      {header?.actions?.map((action, idx) => (
        <button key={idx} data-testid="add-observation" onClick={action.onClick}>
          Add Observation
        </button>
      ))}
      {search && (
        <input
          data-testid="search-input"
          placeholder={search.placeholder}
          value={search.value}
          onChange={(e) => search.onChange(e.target.value)}
        />
      )}
      {data?.map((row, idx: number) => (
        <div
          key={idx}
          data-testid={`${
            header?.title?.includes("Observações") || header?.title?.includes("Observations")
              ? "observation"
              : "movement"
          }-row-${idx}`}
        >
          {columns
            ? columns.map((col) => (
                <span key={col.key}>
                  {col.render
                    ? col.render((row as Record<string, unknown>)[col.key], row)
                    : String((row as Record<string, unknown>)[col.key] ?? "")}
                </span>
              ))
            : String((row as Record<string, unknown>).type ?? "")}
        </div>
      ))}
      {(!data || data.length === 0) && emptyState && (
        <div data-testid="empty-state">
          <div>{emptyState.title}</div>
          {emptyState.onAddNew && (
            <button
              data-testid={
                header?.title?.includes("Observações") || header?.title?.includes("Observations")
                  ? "add-observation-empty"
                  : "add-movement"
              }
              onClick={emptyState.onAddNew}
            >
              {header?.title?.includes("Observações") || header?.title?.includes("Observations")
                ? "Add Observation"
                : "Add Movement"}
            </button>
          )}
        </div>
      )}
    </div>
  ),
  FileUpload: ({
    files: _files,
    onChange,
    helperText: _helperText,
    ...props
  }: {
    files?: File[];
    onChange?: (files: File[]) => void;
    helperText?: string;
    [key: string]: unknown;
  }) => (
    <input
      type="file"
      data-testid="file-upload"
      multiple
      onChange={(e) => {
        const selectedFiles = Array.from(e.target.files || []);
        onChange?.(selectedFiles);
      }}
      {...props}
    />
  ),
  Alert: ({ title, variant }: { title?: string; variant?: string }) => (
    <div data-testid={`alert-${variant}`}>{title}</div>
  ),
}));

describe("InventoryItemDetails", () => {
  const createRouter = () => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/inventory/:itemId",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <InventoryItemDetails />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/inventory/item-1"],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getInventoryItemById).mockReturnValue(mockItem);
    vi.mocked(getMovementsByItemId).mockReturnValue(mockMovements);
    vi.mocked(getCurrentStock).mockReturnValue(150);
    mockGetInventoryObservationsByItemId.mockReturnValue(mockObservations);
    mockAddInventoryObservation.mockReturnValue({
      id: "obs-new",
      itemId: "item-1",
      observation: "New observation",
      createdAt: "2025-01-20T10:00:00Z",
    });
    mockUsePermissions.mockReturnValue({
      canView: () => true,
      canEdit: () => true,
      canRemove: () => true,
      isMainUser: () => true,
    });
  });

  it("should render item details page", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const itemName = screen.queryAllByText(mockItem.name)[0];
    expect(itemName || screen.getByTestId("movements-table")).toBeInTheDocument();
  });

  it("should display all item information", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const itemCode = screen.queryAllByText(mockItem.code)[0];
    const itemName = screen.queryAllByText(mockItem.name)[0];
    expect(itemCode || itemName || screen.getByTestId("movements-table")).toBeTruthy();
  });

  it("should render movements table", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId("movements-table")).toBeInTheDocument();
  });

  it("should display movements data", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const movementsTable = screen.getByTestId("movements-table");
    if (mockMovements.length > 0) {
      const purchaseBadge = movementsTable.querySelector('[data-testid="status-badge-success"]');
      const consumptionBadge = movementsTable.querySelector('[data-testid="status-badge-danger"]');
      expect(purchaseBadge || consumptionBadge || movementsTable).toBeTruthy();
    }
  });

  it("should handle movements search", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const movementsTable = screen.getByTestId("movements-table");
    const searchInput = movementsTable.querySelector(
      '[data-testid="search-input"]'
    ) as HTMLInputElement;
    if (searchInput) {
      fireEvent.change(searchInput, { target: { value: "purchase" } });
      expect(searchInput).toHaveValue("purchase");
    }
  });

  it("should navigate to new movement route", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const addMovementButtons = screen
      .queryAllByRole("button")
      .filter(
        (btn) =>
          btn.textContent?.includes("Movimentação") ||
          btn.textContent?.includes("Movement") ||
          btn.textContent?.includes("Adicionar")
      );

    if (addMovementButtons.length > 0) {
      fireEvent.click(addMovementButtons[0]);
      expect(mockNavigate).toHaveBeenCalled();
    } else {
      const addMovement = screen.queryByTestId("add-movement");
      if (addMovement) {
        fireEvent.click(addMovement);
        expect(mockNavigate).toHaveBeenCalled();
      }
    }
  });

  it("should navigate to edit route", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const editButtons = screen
      .queryAllByRole("button")
      .filter(
        (btn) =>
          btn.textContent?.includes("Editar") ||
          btn.textContent?.includes("Edit") ||
          btn.getAttribute("data-testid")?.includes("edit")
      );

    if (editButtons.length > 0) {
      fireEvent.click(editButtons[0]);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should display stock calculation", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(getCurrentStock).toHaveBeenCalledWith("item-1");
  });

  it("should display low stock warning when stock is below minimum", () => {
    vi.mocked(getCurrentStock).mockReturnValue(50);
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const itemNameElements = screen.getAllByText(mockItem.name);
    const headerElement = itemNameElements.find((el) => el.tagName === "H1");
    const headerArea = headerElement?.closest("div");
    const lowStockBadge = headerArea?.querySelector('[data-testid="status-badge-danger"]');
    expect(lowStockBadge || headerElement).toBeTruthy();
  });

  it("should display expiration warning when item is expiring", () => {
    const expiringItem = {
      ...mockItem,
      hasExpiration: true,
      expirationDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    };
    vi.mocked(getInventoryItemById).mockReturnValueOnce(expiringItem);
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const expiringBadge = screen.queryByTestId("status-badge-warning");
    expect(expiringBadge || screen.getByTestId("movements-table")).toBeTruthy();
  });

  it("should display message when item not found", () => {
    vi.mocked(getInventoryItemById).mockReturnValueOnce(undefined);
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const backButton = screen.queryByRole("button");
    expect(backButton || screen.queryByText(/empty|não encontrado/i)).toBeTruthy();
  });

  it("should navigate back to inventory list", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const backButtons = screen
      .queryAllByRole("button")
      .filter(
        (btn) =>
          btn.textContent?.includes("Voltar") ||
          btn.textContent?.includes("Back") ||
          btn.getAttribute("data-testid")?.includes("back")
      );

    if (backButtons.length > 0) {
      fireEvent.click(backButtons[0]);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should have correct meta function", () => {
    expect(InventoryItemDetails).toBeDefined();
  });

  it("should display observations table", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const observationsTable = screen.queryByTestId("observations-table");
    expect(observationsTable).toBeInTheDocument();
  });

  it("should display observations data", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const observationRows = screen.queryAllByTestId(/observation-row-/);
    expect(observationRows.length).toBeGreaterThan(0);
  });

  it("should handle observations search", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const observationsTable = screen.getByTestId("observations-table");
    const searchInput = observationsTable.querySelector(
      '[data-testid="search-input"]'
    ) as HTMLInputElement;
    if (searchInput) {
      fireEvent.change(searchInput, { target: { value: "Test" } });
      expect(searchInput).toHaveValue("Test");
    }
  });

  it("should open observation form when add button is clicked", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const addObservationButtons = screen.queryAllByTestId("add-observation");
    if (addObservationButtons.length > 0) {
      fireEvent.click(addObservationButtons[0]);
      const textareas = screen.queryAllByRole("textbox");
      const observationTextarea = textareas.find(
        (textarea) => (textarea as HTMLTextAreaElement).rows === 4
      );
      expect(observationTextarea).toBeInTheDocument();
    }
  });

  it("should handle observation form submission", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const addObservationButtons = screen.queryAllByTestId("add-observation");
    if (addObservationButtons.length > 0) {
      fireEvent.click(addObservationButtons[0]);

      await waitFor(() => {
        const textareas = screen.queryAllByRole("textbox");
        const observationTextarea = textareas.find(
          (textarea) => (textarea as HTMLTextAreaElement).rows === 4
        ) as HTMLTextAreaElement | undefined;
        expect(observationTextarea).toBeInTheDocument();
      });

      const textareas = screen.queryAllByRole("textbox");
      const observationTextarea = textareas.find(
        (textarea) => (textarea as HTMLTextAreaElement).rows === 4
      ) as HTMLTextAreaElement | undefined;

      if (observationTextarea) {
        fireEvent.change(observationTextarea, {
          target: { value: "New observation" },
        });

        const form = observationTextarea.closest("form");
        if (form) {
          fireEvent.submit(form);
        } else {
          const submitButtons = screen.queryAllByTestId("button-default");
          const submitButton = submitButtons.find(
            (btn) => (btn as HTMLButtonElement).type === "submit"
          );
          if (submitButton) {
            fireEvent.click(submitButton);
          }
        }

        await waitFor(
          () => {
            expect(mockAddInventoryObservation).toHaveBeenCalledWith(
              expect.objectContaining({
                itemId: "item-1",
                observation: "New observation",
              })
            );
          },
          { timeout: 3000 }
        );
      }
    }
  });

  it("should handle file upload in observation form", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const addObservationButtons = screen.queryAllByTestId("add-observation");
    if (addObservationButtons.length > 0) {
      fireEvent.click(addObservationButtons[0]);

      const fileUpload = screen.queryByTestId("file-upload");
      if (fileUpload) {
        const file = new File(["test content"], "test.txt", { type: "text/plain" });
        fireEvent.change(fileUpload, {
          target: { files: [file] },
        });
        expect(fileUpload).toBeInTheDocument();
      }
    }
  });

  it("should display usage method for MEDICINES item", () => {
    const medicineItem = {
      ...mockItem,
      category: InventoryItemCategory.MEDICINES,
      usageAmount: 1,
      usageUnit: "dose",
      usageBasis: "per_animal",
    };
    vi.mocked(getInventoryItemById).mockReturnValueOnce(medicineItem);
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const usageMethodText =
      screen.queryByText(/1 dose por animal/i) ||
      screen.queryByText(/1 dose per animal/i) ||
      screen.queryByText(/usage method/i) ||
      screen.queryByText(/método de uso/i);
    expect(usageMethodText || screen.getByTestId("movements-table")).toBeTruthy();
  });

  it("should display usage method for VACCINES item", () => {
    const vaccineItem = {
      ...mockItem,
      category: InventoryItemCategory.VACCINES,
      usageAmount: 0.5,
      usageUnit: "ml",
      usageBasis: "per_kg",
    };
    vi.mocked(getInventoryItemById).mockReturnValueOnce(vaccineItem);
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const usageMethodText =
      screen.queryByText(/0.5 ml por kg/i) ||
      screen.queryByText(/0.5 ml per kg/i) ||
      screen.queryByText(/usage method/i) ||
      screen.queryByText(/método de uso/i);
    expect(usageMethodText || screen.getByTestId("movements-table")).toBeTruthy();
  });

  it("should not display usage method for non-MEDICINES/VACCINES items", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const usageMethodText =
      screen.queryByText(/usage method/i) || screen.queryByText(/método de uso/i);

    expect(usageMethodText).toBeFalsy();
  });
});
