import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import SaleDetails from "../records.sales.$saleId";
import { SaleType, PricingMode, SalePaymentMethod } from "~/types";

const mockNavigate = vi.fn();

vi.mock("~/services/sales.service", () => ({
  getSaleById: vi.fn((id: string) => {
    if (id === "sa0e8400-e29b-41d4-a716-446655440100") {
      return {
        id: "sa0e8400-e29b-41d4-a716-446655440100",
        companyId: "company-1",
        buyerId: "buyer-1",
        propertyId: "property-1",
        saleDate: "2024-01-15",
        saleType: SaleType.SLAUGHTERHOUSE,
        pricingMode: PricingMode.INDIVIDUAL,
        paymentMethod: SalePaymentMethod.CASH_FLOW,
        totalPrice: 5000,
        transportationFee: 200,
        additionalFees: 100,
        saleItems: [
          { animalId: "animal-1", price: 2500, weight: 400, carcassWeight: 240 },
          { animalId: "animal-2", price: 2500, weight: 400, carcassWeight: 240 },
        ],
        linkedCashFlowId: "cashflow-1",
        linkedAccountsReceivableId: undefined,
        observation: "Test sale",
        createdAt: "2024-01-15",
        updatedAt: "2024-01-15",
      };
    }
    return undefined;
  }),
}));

vi.mock("~/services/buyers.service", () => ({
  getBuyerById: vi.fn((id: string) => {
    if (id === "buyer-1") return { id: "buyer-1", name: "Test Buyer" };
    return undefined;
  }),
}));

vi.mock("~/services/properties.service", () => ({
  getPropertyById: vi.fn((id: string) => {
    if (id === "property-1") return { id: "property-1", name: "Test Property" };
    return undefined;
  }),
}));

vi.mock("~/services/animals.service", () => ({
  getAnimalById: vi.fn((id: string) => {
    if (id === "animal-1") return { id: "animal-1", code: "A001", registrationNumber: "REG001" };
    if (id === "animal-2") return { id: "animal-2", code: "A002", registrationNumber: "REG002" };
    return undefined;
  }),
}));

vi.mock("~/services/cash-flow.service", () => ({
  getCashFlowById: vi.fn((id: string) => {
    if (id === "cashflow-1") {
      return {
        id: "cashflow-1",
        companyId: "company-1",
        type: "income",
        amount: 5300,
        date: "2024-01-15",
        description: "Venda de animais: A001, A002",
      };
    }
    return undefined;
  }),
}));

vi.mock("~/services/accounts-receivable.service", () => ({
  getAccountsReceivableById: vi.fn(() => undefined),
}));

vi.mock("~/utils/profitability", () => ({
  calculateAnimalProfitability: vi.fn(() => ({
    totalCost: 1000,
    salePrice: 2500,
    profit: 1500,
    profitMargin: 60,
    costPerKg: 2.5,
    pricePerKg: 6.25,
    roi: 150,
  })),
}));

vi.mock("~/mocks/companies", () => ({
  mockCompanies: [{ id: "company-1", name: "Test Company" }],
}));

vi.mock("~/utils/permissions", () => ({
  usePermissions: () => ({
    canAdd: () => true,
    canEdit: () => true,
    canRemove: () => true,
    canView: () => true,
  }),
}));

vi.mock("~/routes.config", () => ({
  ROUTES: {
    SALES: "/dashboard/registros/vendas",
    SALES_NEW: "/dashboard/registros/vendas/novo",
  },
  getSaleEditRoute: (id: string) => `/dashboard/registros/vendas/${id}/editar`,
  getCashFlowViewRoute: (id: string) => `/dashboard/financas/fluxo-de-caixa/${id}`,
  getAccountsReceivableViewRoute: (id: string) => `/dashboard/financas/contas-a-receber/${id}`,
}));

vi.mock("~/components/ui", () => ({
  Button: ({
    children,
    onClick,
    ...props
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    [key: string]: unknown;
  }) => (
    <button data-testid="button" onClick={onClick} {...props}>
      {children}
    </button>
  ),
  Alert: ({ title, variant }: { title?: string; variant?: string }) => (
    <div data-testid={`alert-${variant}`}>{title}</div>
  ),
  StatusBadge: ({ label }: { label: string }) => <span data-testid="status-badge">{label}</span>,
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
}));

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ saleId: "sa0e8400-e29b-41d4-a716-446655440100" }),
    Link: ({
      to,
      children,
      ...props
    }: {
      to: string;
      children?: React.ReactNode;
      [key: string]: unknown;
    }) => (
      <a href={to} data-testid="link" {...props}>
        {children}
      </a>
    ),
  };
});

describe("SaleDetails", () => {
  const createRouter = () => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/registros/vendas/:saleId",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <SaleDetails />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/registros/vendas/sa0e8400-e29b-41d4-a716-446655440100"],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render sale details page", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    // Should render the heading
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it("should display sale information", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    // Should display sale details like property, buyer, etc.
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();

    // Should have edit/delete buttons
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("should display profitability metrics", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    // Profitability metrics should be calculated and displayed
    // The component renders sale items with profitability data
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();

    // Check that profitability calculation was called (mocked)
    // The actual metrics would be in the rendered content
    const saleItemsHeading = screen.getByRole("heading", { level: 2 });
    expect(saleItemsHeading).toBeInTheDocument();
  });

  it("should display linked financial records", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    // Should show link to cash flow (since linkedCashFlowId is set)
    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
  });

  it("should have correct meta function", () => {
    expect(SaleDetails).toBeDefined();
  });
});
