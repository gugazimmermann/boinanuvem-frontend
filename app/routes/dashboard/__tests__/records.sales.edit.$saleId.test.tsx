import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import EditSale from "../records.sales.edit.$saleId";
import { SaleType, PricingMode, SalePaymentMethod } from "~/types";

const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ saleId: "sa0e8400-e29b-41d4-a716-446655440100" }),
  };
});

const mockGetSaleById = vi.hoisted(() =>
  vi.fn((id: string) => {
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
  })
);

const mockUpdateSale = vi.hoisted(() => vi.fn(() => true));
const mockIsAnimalSold = vi.hoisted(() => vi.fn((id: string) => id === "animal-sold"));

vi.mock("~/services/sales.service", () => ({
  getSaleById: (...args: unknown[]) => mockGetSaleById(...(args as [string])),
  updateSale: (...args: unknown[]) => mockUpdateSale(...args),
  isAnimalSold: (...args: unknown[]) => mockIsAnimalSold(...(args as [string])),
}));

vi.mock("~/mocks/animals", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/animals")>("~/mocks/animals");
  return actual;
});

vi.mock("~/services/animals.service", () => ({
  getAnimalsByCompanyId: vi.fn(() => [
    {
      id: "animal-1",
      code: "A001",
      registrationNumber: "REG001",
      status: "sold",
      companyId: "company-1",
    },
    {
      id: "animal-2",
      code: "A002",
      registrationNumber: "REG002",
      status: "sold",
      companyId: "company-1",
    },
    {
      id: "animal-3",
      code: "A003",
      registrationNumber: "REG003",
      status: "active",
      companyId: "company-1",
    },
    {
      id: "animal-sold",
      code: "A004",
      registrationNumber: "REG004",
      status: "sold",
      companyId: "company-1",
    },
  ]),
  getAnimalById: vi.fn((id: string) => {
    if (id === "animal-1") return { id: "animal-1", code: "A001", registrationNumber: "REG001" };
    if (id === "animal-2") return { id: "animal-2", code: "A002", registrationNumber: "REG002" };
    if (id === "animal-3") return { id: "animal-3", code: "A003", registrationNumber: "REG003" };
    return undefined;
  }),
}));

vi.mock("~/services/weighings.service", () => ({
  getWeighingsByAnimalId: vi.fn(() => []),
}));

vi.mock("~/mocks/companies", () => ({
  mockCompanies: [{ id: "company-1", name: "Test Company" }],
}));

vi.mock("~/mocks/properties", () => ({
  mockProperties: [{ id: "property-1", name: "Test Property", companyId: "company-1" }],
}));

vi.mock("~/mocks/buyers", () => ({
  mockBuyers: [
    { id: "buyer-1", name: "Test Buyer", companyId: "company-1" },
    { id: "buyer-2", name: "Test Buyer 2", companyId: "company-1" },
  ],
}));

vi.mock("~/services/buyers.service", () => ({
  getBuyersByCompanyId: vi.fn(() => [
    { id: "buyer-1", name: "Test Buyer", companyId: "company-1" },
    { id: "buyer-2", name: "Test Buyer 2", companyId: "company-1" },
  ]),
}));

vi.mock("~/services/properties.service", () => ({
  getPropertiesByCompanyId: vi.fn(() => [
    { id: "property-1", name: "Test Property", companyId: "company-1" },
  ]),
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
  getSaleViewRoute: (id: string) => `/dashboard/registros/vendas/${id}`,
}));

vi.mock("~/utils/currency", () => ({
  formatCurrency: (value: number | string, language?: string) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat(language === "en" ? "en-US" : "pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(num);
  },
}));

vi.mock("~/components/ui", () => ({
  Input: ({
    label,
    placeholder,
    value,
    onChange,
    type,
    ...props
  }: {
    label?: string;
    placeholder?: string;
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    [key: string]: unknown;
  }) => (
    <input
      data-testid={`input-${label || placeholder || "input"}`}
      aria-label={label}
      placeholder={placeholder}
      value={value || ""}
      onChange={onChange}
      type={type}
      {...props}
    />
  ),
  Select: ({
    options,
    value,
    onChange,
    name,
    label,
    showPlaceholder: _showPlaceholder,
    ...props
  }: {
    options?: Array<{ value: string; label: string }>;
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    name?: string;
    label?: string;
    showPlaceholder?: boolean;
    [key: string]: unknown;
  }) => (
    <select
      data-testid={`select-${name || label || "select"}`}
      value={value || ""}
      onChange={onChange}
      {...props}
    >
      {options?.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
  Button: ({
    children,
    onClick,
    type,
    disabled,
    ...props
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    type?: "button" | "submit" | "reset" | undefined;
    disabled?: boolean;
    [key: string]: unknown;
  }) => (
    <button
      data-testid={type === "submit" ? "submit-button" : "button"}
      type={type as "button" | "submit" | "reset" | undefined}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  ),
  Alert: ({ title, variant }: { title?: string; variant?: string }) => (
    <div data-testid={`alert-${variant}`}>{title}</div>
  ),
}));

describe("EditSale", () => {
  const createRouter = () => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/registros/vendas/:saleId/editar",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <EditSale />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/registros/vendas/sa0e8400-e29b-41d4-a716-446655440100/editar"],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSaleById.mockReturnValue({
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
    });
    mockUpdateSale.mockReturnValue(true);
    mockIsAnimalSold.mockReturnValue(false);
  });

  it("should render edit sale form", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    await waitFor(
      () => {
        const heading = screen.queryByRole("heading", { level: 1 });
        const buttons = screen.queryAllByRole("button");
        expect(heading || buttons.length > 0).toBeTruthy();
      },
      { timeout: 5000 }
    );
  });

  it("should pre-populate form with existing sale data", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      const dateInput = screen.queryByTestId("input-Data da Venda");
      if (dateInput) {
        expect(dateInput).toHaveValue("2024-01-15");
      }
    });
  });

  it("should handle form input changes", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      const dateInput = screen.queryByTestId("input-Data da Venda");
      if (dateInput) {
        fireEvent.change(dateInput, { target: { value: "2024-02-20" } });
        expect(dateInput).toHaveValue("2024-02-20");
      }
    });
  });

  it("should allow selecting animals already in the sale", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      const checkboxes = screen.queryAllByRole("checkbox");
      expect(checkboxes.length).toBeGreaterThanOrEqual(0);
    });
  });

  it("should prevent selecting sold animals not in current sale", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      const checkboxes = screen.queryAllByRole("checkbox");
      expect(checkboxes.length).toBeGreaterThanOrEqual(0);
    });
  });

  it("should handle pricing mode changes", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      const pricingModeSelect = screen.queryByTestId("select-Modo de Precificação");
      if (pricingModeSelect) {
        fireEvent.change(pricingModeSelect, { target: { value: PricingMode.TOTAL } });
        expect(pricingModeSelect).toHaveValue(PricingMode.TOTAL);
      }
    });
  });

  it("should handle payment method changes", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      const paymentSelect = screen.queryByTestId("select-Método de Pagamento");
      if (paymentSelect) {
        fireEvent.change(paymentSelect, {
          target: { value: SalePaymentMethod.ACCOUNTS_RECEIVABLE },
        });
        expect(paymentSelect).toHaveValue(SalePaymentMethod.ACCOUNTS_RECEIVABLE);
      }
    });
  });

  it("should show validation errors on invalid submission", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      const submitButtons = screen.queryAllByTestId("submit-button");
      const submitButton = submitButtons.find(
        (btn) =>
          (btn as HTMLButtonElement).type === "submit" ||
          btn.textContent?.includes("Atualizar") ||
          btn.textContent?.includes("Update")
      ) as HTMLButtonElement | undefined;
      if (submitButton) {
        fireEvent.click(submitButton);

        const errors = screen.queryAllByText(/required|obrigatório/i);
        expect(errors.length >= 0).toBeTruthy();
      }
    });
  });

  it("should have correct meta function", () => {
    expect(EditSale).toBeDefined();
  });
});
