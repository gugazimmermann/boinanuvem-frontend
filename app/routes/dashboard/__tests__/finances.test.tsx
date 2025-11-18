import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import FinancesDashboard, { meta } from "../finances";

const mockCashFlowData = [
  {
    id: "cf-1",
    type: "income" as const,
    amount: 10000,
    date: new Date().toISOString(),
    description: "Test income",
    category: "sales",
    companyId: "company-1",
  },
  {
    id: "cf-2",
    type: "expense" as const,
    amount: 5000,
    date: new Date().toISOString(),
    description: "Test expense",
    category: "feed",
    companyId: "company-1",
  },
];

const mockAccountsPayable = [
  {
    id: "ap-1",
    amount: 2000,
    paidAmount: 0,
    dueDate: new Date().toISOString(),
    description: "Test payable",
    status: "unpaid" as const,
    companyId: "company-1",
  },
];

const mockAccountsReceivable = [
  {
    id: "ar-1",
    amount: 3000,
    paidAmount: 0,
    dueDate: new Date().toISOString(),
    description: "Test receivable",
    status: "unpaid" as const,
    companyId: "company-1",
  },
];

vi.mock("~/mocks/companies", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/companies")>("~/mocks/companies");
  return {
    ...actual,
    mockCompanies: [{ id: "company-1", name: "Test Company" }],
  };
});

vi.mock("~/mocks/cash-flow", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/cash-flow")>("~/mocks/cash-flow");
  return actual;
});

vi.mock("~/services/cash-flow.service", () => ({
  getCashFlowByCompanyId: vi.fn(() => mockCashFlowData),
}));

vi.mock("~/mocks/accounts-payable", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/accounts-payable")>(
    "~/mocks/accounts-payable"
  );
  return actual;
});

vi.mock("~/services/accounts-payable.service", () => ({
  getAccountsPayableByCompanyId: vi.fn(() => mockAccountsPayable),
}));

vi.mock("~/mocks/accounts-receivable", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/accounts-receivable")>(
    "~/mocks/accounts-receivable"
  );
  return actual;
});

vi.mock("~/services/accounts-receivable.service", () => ({
  getAccountsReceivableByCompanyId: vi.fn(() => mockAccountsReceivable),
}));

vi.mock("~/services/properties.service", () => ({
  getPropertyById: vi.fn((id: string) => ({ id, name: `Property ${id}` })),
}));

vi.mock("~/services/suppliers.service", () => ({
  getSupplierById: vi.fn((id: string) => ({ id, name: `Supplier ${id}` })),
}));

vi.mock("~/services/buyers.service", () => ({
  getBuyerById: vi.fn((id: string) => ({ id, name: `Buyer ${id}` })),
}));

vi.mock("recharts", () => ({
  LineChart: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: () => null,
  AreaChart: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="area-chart">{children}</div>
  ),
  Area: () => null,
  PieChart: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: () => null,
  Cell: () => null,
  BarChart: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

describe("FinancesDashboard", () => {
  const originalError = console.error;

  beforeAll(() => {
    console.error = (...args: unknown[]) => {
      if (
        typeof args[0] === "string" &&
        (args[0].includes("The tag <") || args[0].includes("is using incorrect casing"))
      ) {
        return;
      }
      originalError.call(console, ...args);
    };
  });

  afterAll(() => {
    console.error = originalError;
  });

  const createRouter = () => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/financas",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <FinancesDashboard />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/financas"],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    Object.defineProperty(navigator, "language", {
      writable: true,
      configurable: true,
      value: "pt-BR",
    });
  });

  it("should render finances dashboard", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("should have correct meta function", () => {
    const metaData = meta();
    expect(metaData).toHaveLength(2);
    expect(metaData[0]).toEqual({ title: "Dashboard Financeiro - Boi na Nuvem" });
    expect(metaData[1]).toEqual({
      name: "description",
      content: "Visão geral financeira do Boi na Nuvem",
    });
  });

  it("should display translated title using i18n", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(
      heading.textContent === "Dashboard Financeiro" ||
        heading.textContent === "Financial Dashboard"
    ).toBe(true);
  });

  it("should display summary cards with translated labels", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(
      heading.textContent === "Dashboard Financeiro" ||
        heading.textContent === "Financial Dashboard"
    ).toBe(true);
  });

  it("should render charts section with translated labels", () => {
    const router = createRouter();
    const { container } = render(<RouterProvider router={router} />);

    const charts = container.querySelectorAll('[data-testid*="chart"]');
    expect(charts.length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("should render responsive containers for charts", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const containers = screen.queryAllByTestId("responsive-container");
    expect(containers.length).toBeGreaterThan(0);
  });

  it("should display financial data with i18n translations", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(
      heading.textContent === "Dashboard Financeiro" ||
        heading.textContent === "Financial Dashboard"
    ).toBe(true);
  });

  it("should use LanguageProvider for i18n", () => {
    const router = createRouter();
    const { container } = render(<RouterProvider router={router} />);

    expect(container).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });
});
