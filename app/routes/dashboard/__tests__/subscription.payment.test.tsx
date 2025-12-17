import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import SubscriptionPayment from "../subscription.payment";
import { fetchPlans } from "~/services/plans.service";
import { useLanguage } from "~/contexts/language-context";
import { useNavigate, useLocation } from "react-router";

vi.mock("~/services/plans.service");
vi.mock("~/contexts/language-context");
vi.mock("~/components/dashboard/payment-form", () => ({
  PaymentForm: () => <div data-testid="payment-form">PaymentForm</div>,
}));
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: vi.fn(),
    useLocation: vi.fn(),
  };
});

const mockPlan = {
  id: "plan-1",
  name: "Básico",
  description: "Plano básico",
  monthlyPrice: "R$ 100,00",
  annualPrice: "R$ 1.000,00",
  limits: {
    properties: 1,
    locations: 5,
    animals: 100,
    members: 3,
  },
  features: ["Feature 1"],
  popular: false,
};

describe("SubscriptionPayment", () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useLanguage).mockReturnValue({
      language: "pt",
      setLanguage: vi.fn(),
      languageInfo: { code: "pt", name: "Português" },
    });
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
  });

  it("should render loading state initially", () => {
    vi.mocked(useLocation).mockReturnValue({
      state: { planId: "plan-1", billingCycle: "monthly" },
    } as never);
    vi.mocked(fetchPlans).mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter>
        <SubscriptionPayment />
      </MemoryRouter>
    );

    expect(screen.getByText(/Carregando/i)).toBeInTheDocument();
  });

  it("should display error when planId is missing", async () => {
    vi.mocked(useLocation).mockReturnValue({ state: null } as never);

    render(
      <MemoryRouter>
        <SubscriptionPayment />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Plano não selecionado/i)).toBeInTheDocument();
    });
  });

  it("should display error when plan is not found", async () => {
    vi.mocked(useLocation).mockReturnValue({
      state: { planId: "non-existent", billingCycle: "monthly" },
    } as never);
    vi.mocked(fetchPlans).mockResolvedValue([mockPlan]);

    render(
      <MemoryRouter>
        <SubscriptionPayment />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Plano não encontrado/i)).toBeInTheDocument();
    });
  });

  it("should render payment form when plan is found", async () => {
    vi.mocked(useLocation).mockReturnValue({
      state: { planId: "plan-1", billingCycle: "monthly" },
    } as never);
    vi.mocked(fetchPlans).mockResolvedValue([mockPlan]);

    render(
      <MemoryRouter>
        <SubscriptionPayment />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Complete seu Pagamento/i)).toBeInTheDocument();
    });

    expect(screen.getByText("Básico")).toBeInTheDocument();
    expect(screen.getByTestId("payment-form")).toBeInTheDocument();
  });

  it("should display plan summary with correct billing cycle", async () => {
    vi.mocked(useLocation).mockReturnValue({
      state: { planId: "plan-1", billingCycle: "annual" },
    } as never);
    vi.mocked(fetchPlans).mockResolvedValue([mockPlan]);

    render(
      <MemoryRouter>
        <SubscriptionPayment />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Anual/i)).toBeInTheDocument();
    });
  });

  it("should render different text for different languages", async () => {
    vi.mocked(useLanguage).mockReturnValue({
      language: "en",
      setLanguage: vi.fn(),
      languageInfo: { code: "en", name: "English" },
    });
    vi.mocked(useLocation).mockReturnValue({
      state: { planId: "plan-1", billingCycle: "monthly" },
    } as never);
    vi.mocked(fetchPlans).mockResolvedValue([mockPlan]);

    render(
      <MemoryRouter>
        <SubscriptionPayment />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Complete Your Payment/i)).toBeInTheDocument();
    });
  });
});
