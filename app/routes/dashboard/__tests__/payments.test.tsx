import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { getPaymentsByCompanyId } from "~/services/payments.service";
import { useLanguage } from "~/contexts/language-context";
import { useAuth } from "~/contexts/auth-context";
import { useCompanyTrial } from "~/hooks/use-company-trial";
import { useListPage } from "~/hooks/use-list-page";
import { useTranslation } from "~/i18n";
import { useNavigate } from "react-router";

vi.mock("~/services/payments.service");
vi.mock("~/services/companies.service");
vi.mock("~/contexts/language-context");
vi.mock("~/contexts/auth-context");
vi.mock("~/hooks/use-company-trial");
vi.mock("~/hooks/use-list-page");
vi.mock("~/i18n");
vi.mock("~/utils/translation-helpers", () => ({
  t: (language: string, pt: string, es: string, en: string) =>
    language === "pt" ? pt : language === "es" ? es : en,
}));
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: vi.fn(),
    Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
      <a href={to}>{children}</a>
    ),
  };
});

const mockPayments = [
  {
    id: "payment-1",
    plan: "Básico",
    month: "2024-01",
    amount: 100,
    status: "paid" as const,
    invoiceId: "inv-1",
  },
];

describe("Payments", () => {
  const mockNavigate = vi.fn();
  const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useLanguage).mockReturnValue({
      language: "pt",
      setLanguage: vi.fn(),
      languageInfo: { code: "pt", name: "Português" },
    });
    vi.mocked(useAuth).mockReturnValue({
      currentUser: { id: "user-1", companyId: "company-1" },
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      refreshToken: vi.fn(),
    } as never);
    vi.mocked(useCompanyTrial).mockReturnValue({
      company: null,
      isOnTrial: false,
      isLoading: false,
    } as never);
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(useTranslation).mockReturnValue({
      payments: {
        title: "Pagamentos",
        description: "Lista de pagamentos",
        table: {
          month: "Mês",
          plan: "Plano",
          amount: "Valor",
          status: "Status",
          actions: "Ações",
        },
        status: { paid: "Pago", pending: "Pendente", failed: "Falhou" },
        filters: { all: "Todos", paid: "Pago", pending: "Pendente", failed: "Falhou" },
        downloadInvoice: "Baixar fatura",
        badge: { payments: (count: number) => `${count} pagamentos` },
        searchPlaceholder: "Buscar pagamentos",
        emptyState: {
          title: "Sem pagamentos",
          descriptionWithSearch: (q: string) => `Sem resultados para ${q}`,
          descriptionWithoutSearch: "Nenhum pagamento ainda",
        },
        meta: { title: "Pagamentos", description: "Pagamentos" },
      },
      common: { loading: "Carregando..." },
    } as never);
    vi.mocked(useListPage).mockReturnValue({
      searchValue: "",
      setSearchValue: vi.fn(),
      activeFilter: "all",
      setActiveFilter: vi.fn(),
      sortState: { column: "month", direction: "desc" },
      handleSort: vi.fn(),
      currentPage: 1,
      setCurrentPage: vi.fn(),
      filteredData: [],
      paginatedData: [],
      totalPages: 1,
    } as never);
  });

  afterEach(() => {
    consoleErrorSpy.mockClear();
  });

  it("should render loading state initially", async () => {
    vi.mocked(getPaymentsByCompanyId).mockImplementation(() => new Promise(() => {}));
    const Payments = (await import("../payments")).default;

    render(
      <MemoryRouter>
        <Payments />
      </MemoryRouter>
    );

    expect(screen.getByText(/Carregando/i)).toBeInTheDocument();
  });

  it("should render payments when loaded", async () => {
    vi.mocked(getPaymentsByCompanyId).mockResolvedValue(mockPayments);
    vi.mocked(useListPage).mockReturnValue({
      searchValue: "",
      setSearchValue: vi.fn(),
      activeFilter: "all",
      setActiveFilter: vi.fn(),
      sortState: { column: "month", direction: "desc" },
      handleSort: vi.fn(),
      currentPage: 1,
      setCurrentPage: vi.fn(),
      filteredData: mockPayments,
      paginatedData: mockPayments,
      totalPages: 1,
    } as never);
    const Payments = (await import("../payments")).default;

    render(
      <MemoryRouter>
        <Payments />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Básico")).toBeInTheDocument();
    });
  });

  it("should display error message when payments fail to load", async () => {
    const errorMessage = "Failed to load payments";
    vi.mocked(getPaymentsByCompanyId).mockRejectedValue(new Error(errorMessage));
    const Payments = (await import("../payments")).default;

    render(
      <MemoryRouter>
        <Payments />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it("should render page when trial is expired", async () => {
    vi.mocked(useCompanyTrial).mockReturnValue({
      company: { trial: { isTrialExpired: true } },
      isOnTrial: false,
      isLoading: false,
    } as never);
    vi.mocked(getPaymentsByCompanyId).mockResolvedValue([]);
    const Payments = (await import("../payments")).default;

    render(
      <MemoryRouter>
        <Payments />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Sem pagamentos/i, {}, { timeout: 3000 })).toBeInTheDocument();
  });

  it("should render subscription card when subscription exists", async () => {
    const mockSubscription = {
      id: "sub-1",
      planId: "plan-1",
      billingCycle: "monthly" as const,
      status: "active",
      isActive: true,
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      plan: {
        id: "plan-1",
        name: "Básico",
        description: "Plano básico",
        monthlyPrice: "R$ 100,00",
        annualPrice: "R$ 1.000,00",
        limits: { properties: 1, locations: 5, animals: 100, members: 3 },
        features: ["Feature 1"],
        popular: false,
      },
    };

    vi.mocked(useCompanyTrial).mockReturnValue({
      company: { currentSubscription: mockSubscription },
      isOnTrial: false,
      isLoading: false,
    } as never);
    vi.mocked(getPaymentsByCompanyId).mockResolvedValue([]);
    const Payments = (await import("../payments")).default;

    render(
      <MemoryRouter>
        <Payments />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Básico")).toBeInTheDocument();
    });
  });
});
