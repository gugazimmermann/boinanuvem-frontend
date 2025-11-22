import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import Acquisitions from "../records.acquisitions";
import { ROUTES } from "~/routes.config";
import { AcquisitionPaymentMethod } from "~/types";
import { PricingMode } from "~/types";

const mockNavigate = vi.fn();

const mockAcquisitionsData = [
  {
    id: "ac0e8400-e29b-41d4-a716-446655440100",
    companyId: "company-1",
    propertyId: "property-1",
    supplierId: "supplier-1",
    acquisitionDate: "2024-01-15",
    pricingMode: PricingMode.INDIVIDUAL,
    paymentMethod: AcquisitionPaymentMethod.CASH_FLOW,
    totalPrice: 5000,
    fees: [
      { id: "fee-1", name: "Transport", amount: 200 },
      { id: "fee-2", name: "Handling", amount: 100 },
    ],
    acquisitionItems: [
      { animalId: "animal-1", price: 2500, weight: 400, costPerArroba: 208.33 },
      { animalId: "animal-2", price: 2500, weight: 400, costPerArroba: 208.33 },
    ],
    linkedCashFlowId: "cashflow-1",
    createdAt: "2024-01-15",
  },
];

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("~/mocks/companies", () => ({
  mockCompanies: [{ id: "company-1", name: "Test Company" }],
}));

vi.mock("~/mocks/properties", () => ({
  mockProperties: [
    { id: "property-1", name: "Property 1", companyId: "company-1" },
    { id: "property-2", name: "Property 2", companyId: "company-1" },
  ],
}));

const mockGetAcquisitionsByCompanyId = vi.fn((companyId: string) => {
  return mockAcquisitionsData.filter(
    (acquisition: { companyId: string }) => acquisition.companyId === companyId
  );
});

const mockDeleteAcquisition = vi.fn(() => true);

vi.mock("~/services/acquisitions.service", () => ({
  getAcquisitionsByCompanyId: (...args: unknown[]) =>
    mockGetAcquisitionsByCompanyId(...(args as [string])),
  deleteAcquisition: (...args: unknown[]) => mockDeleteAcquisition(...args),
}));

vi.mock("~/services/suppliers.service", () => ({
  getSupplierById: vi.fn((id: string) => {
    if (id === "supplier-1") return { id: "supplier-1", name: "Supplier 1" };
    return undefined;
  }),
  getSuppliersByCompanyId: vi.fn(() => [{ id: "supplier-1", name: "Supplier 1" }]),
}));

vi.mock("~/services/properties.service", () => ({
  getPropertyById: vi.fn((id: string) => {
    if (id === "property-1") return { id: "property-1", name: "Property 1" };
    return undefined;
  }),
  getPropertiesByCompanyId: vi.fn(() => [
    { id: "property-1", name: "Property 1", companyId: "company-1" },
    { id: "property-2", name: "Property 2", companyId: "company-1" },
  ]),
}));

vi.mock("~/services/animals.service", () => ({
  getAnimalById: vi.fn((id: string) => {
    if (id === "animal-1") return { id: "animal-1", code: "A001" };
    if (id === "animal-2") return { id: "animal-2", code: "A002" };
    return undefined;
  }),
}));

vi.mock("~/utils/permissions", () => ({
  usePermissions: () => ({
    canAdd: () => true,
    canEdit: () => true,
    canRemove: () => true,
  }),
}));

vi.mock("~/components/ui", () => ({
  Table: ({
    data,
    header,
    search,
    pagination,
    onRowClick,
    rightContent,
  }: {
    data: unknown[];
    header?: { title?: string; actions?: Array<{ onClick?: () => void; label?: string }> };
    search?: { value: string; onChange: (value: string) => void; placeholder?: string };
    pagination?: { currentPage: number; totalPages: number; onPageChange: (page: number) => void };
    onRowClick?: (row: unknown) => void;
    rightContent?: React.ReactNode;
  }) => (
    <div data-testid="acquisitions-table">
      {header?.title && <h1>{header.title}</h1>}
      {header?.actions && header.actions.length > 0 && (
        <button data-testid="add-acquisition-button" onClick={header.actions[0]?.onClick}>
          Add Acquisition
        </button>
      )}
      {search && (
        <input
          data-testid="search-input"
          value={search.value}
          onChange={(e) => search.onChange(e.target.value)}
          placeholder={search.placeholder}
        />
      )}
      {rightContent && <div data-testid="right-content">{rightContent}</div>}
      <div data-testid="table-data">
        {data.map((row: unknown, index: number) => {
          const acquisitionRow = row as { id: string };
          return (
            <div
              key={acquisitionRow.id || index}
              data-testid={`acquisition-row-${acquisitionRow.id || index}`}
              onClick={() => onRowClick?.(acquisitionRow)}
            >
              Acquisition {index + 1}
            </div>
          );
        })}
      </div>
      {pagination && (
        <div data-testid="pagination">
          <button
            data-testid="prev-page"
            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
          >
            Prev
          </button>
          <span>
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            data-testid="next-page"
            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  ),
  StatusBadge: ({ label }: { label: string }) => <span data-testid="status-badge">{label}</span>,
  TableActionButtons: ({ onEdit, onDelete }: { onEdit?: () => void; onDelete?: () => void }) => (
    <div>
      {onEdit && (
        <button data-testid="edit-button" onClick={onEdit}>
          Edit
        </button>
      )}
      {onDelete && (
        <button data-testid="delete-button" onClick={onDelete}>
          Delete
        </button>
      )}
    </div>
  ),
  ConfirmationModal: ({
    isOpen,
    onClose,
    onConfirm,
    title,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
  }) =>
    isOpen ? (
      <div data-testid="confirmation-modal">
        <h2>{title}</h2>
        <button data-testid="confirm-button" onClick={onConfirm}>
          Confirm
        </button>
        <button data-testid="cancel-button" onClick={onClose}>
          Cancel
        </button>
      </div>
    ) : null,
  Alert: ({ title, variant }: { title?: string; variant?: string }) => (
    <div data-testid={`alert-${variant}`}>{title}</div>
  ),
}));

describe("Acquisitions", () => {
  const createRouter = () => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/registros/aquisicoes",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <Acquisitions />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/registros/aquisicoes"],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render acquisitions list page", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const table = screen.getByTestId("acquisitions-table");
    expect(table).toBeInTheDocument();
  });

  it("should display add acquisition button when user has permissions", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const addButton = screen.getByTestId("add-acquisition-button");
    expect(addButton).toBeInTheDocument();
  });

  it("should navigate to new acquisition page when add button is clicked", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const addButton = screen.getByTestId("add-acquisition-button");
    addButton.click();

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.ACQUISITIONS_NEW);
  });

  it("should display search input", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const searchInput = screen.getByTestId("search-input");
    expect(searchInput).toBeInTheDocument();
  });
});
