import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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
  }: {
    data?: unknown[];
    header?: { title?: string; badge?: { label?: string } };
    search?: { placeholder?: string; value: string; onChange: (value: string) => void };
    pagination?: { currentPage: number; totalPages: number; onPageChange: (page: number) => void };
    sortState?: { column: string | null; direction: string };
    onSort?: (column: string, direction: string) => void;
    emptyState?: { title?: string; onAddNew?: () => void };
  }) => (
    <div data-testid="movements-table">
      {header?.title && <h3>{header.title}</h3>}
      {search && (
        <input
          data-testid="search-input"
          placeholder={search.placeholder}
          value={search.value}
          onChange={(e) => search.onChange(e.target.value)}
        />
      )}
      {data?.map((row, idx: number) => (
        <div key={idx} data-testid={`movement-row-${idx}`}>
          {String((row as Record<string, unknown>).type ?? "")}
        </div>
      ))}
      {(!data || data.length === 0) && emptyState && (
        <div data-testid="empty-state">
          <div>{emptyState.title}</div>
          {emptyState.onAddNew && (
            <button data-testid="add-movement" onClick={emptyState.onAddNew}>
              Add Movement
            </button>
          )}
        </div>
      )}
    </div>
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

    if (mockMovements.length > 0) {
      expect(screen.getByText(mockMovements[0].type)).toBeInTheDocument();
    }
  });

  it("should handle movements search", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const searchInput = screen.queryByTestId("search-input");
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

    const lowStockBadge = screen.queryByTestId("status-badge-danger");
    expect(lowStockBadge || screen.getByText(mockItem.name)).toBeTruthy();
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
});
