import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PaymentForm } from "../payment-form";
import type { Plan } from "~/types/plan";
import { useStripe, useElements } from "@stripe/react-stripe-js";
import { createSubscriptionWithPaymentMethod } from "~/services/subscriptions.service";
import { useLanguage } from "~/contexts/language-context";
import { useTheme } from "~/contexts/theme-context";

vi.mock("@stripe/stripe-js", () => ({
  loadStripe: vi.fn(() => Promise.resolve({})),
}));

vi.mock("@stripe/react-stripe-js", () => ({
  Elements: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="stripe-elements">{children}</div>
  ),
  CardElement: () => <div data-testid="card-element">Card Element</div>,
  useStripe: vi.fn(),
  useElements: vi.fn(),
}));

vi.mock("~/services/subscriptions.service");
vi.mock("~/contexts/language-context");
vi.mock("~/contexts/theme-context");

// Mock environment variable
Object.defineProperty(import.meta, "env", {
  value: {
    VITE_STRIPE_PUBLISHABLE_KEY: "pk_test_123",
  },
  writable: true,
});

const mockPlan: Plan = {
  id: "plan-1",
  name: "Básico",
  description: "Plano básico",
  monthlyPrice: "R$ 100,00",
  annualPrice: "R$ 1.000,00",
  limits: {
    properties: "1",
    locations: "5",
    animals: "100",
    members: "3",
  },
  features: ["Feature 1"],
  popular: false,
  status: "active",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

const mockCardElement = {
  mount: vi.fn(),
  unmount: vi.fn(),
  on: vi.fn(),
};

const mockElements = {
  getElement: vi.fn(() => mockCardElement),
};

const mockStripe = {
  createPaymentMethod: vi.fn(),
};

describe("PaymentForm", () => {
  const mockOnSuccess = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset element mocks (some tests override getElement)
    mockElements.getElement = vi.fn(() => mockCardElement);
    vi.mocked(useLanguage).mockReturnValue({
      language: "pt",
      setLanguage: vi.fn(),
      languageInfo: { code: "pt", name: "Português" },
    });
    vi.mocked(useTheme).mockReturnValue({
      theme: "light",
      setTheme: vi.fn(),
      toggleTheme: vi.fn(),
    });
    vi.mocked(useStripe).mockReturnValue(mockStripe as never);
    vi.mocked(useElements).mockReturnValue(mockElements as never);
  });

  it("should render loading state when Stripe is not initialized", () => {
    vi.mocked(useStripe).mockReturnValue(null);
    vi.mocked(useElements).mockReturnValue(null);

    render(
      <PaymentForm
        plan={mockPlan}
        billingCycle="monthly"
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    );

    expect(screen.getByText(/Carregando formulário/i)).toBeInTheDocument();
  });

  it("should render payment form when Stripe is initialized", async () => {
    render(
      <PaymentForm
        plan={mockPlan}
        billingCycle="monthly"
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("stripe-elements")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/Detalhes do Cartão/i)).toBeInTheDocument();
    });
  });

  it("should call onSuccess when payment is successful", async () => {
    const mockPaymentMethod = { id: "pm_123" };
    vi.mocked(mockStripe.createPaymentMethod).mockResolvedValue({
      error: null,
      paymentMethod: mockPaymentMethod,
    });
    vi.mocked(createSubscriptionWithPaymentMethod).mockResolvedValue(undefined);

    const user = userEvent.setup();
    render(
      <PaymentForm
        plan={mockPlan}
        billingCycle="monthly"
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Confirmar Assinatura/i)).toBeInTheDocument();
    });

    const submitButton = screen.getByText(/Confirmar Assinatura/i);
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockStripe.createPaymentMethod).toHaveBeenCalled();
      expect(createSubscriptionWithPaymentMethod).toHaveBeenCalledWith({
        planId: "plan-1",
        billingCycle: "monthly",
        paymentMethodId: "pm_123",
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it("should display error when card element is not found", async () => {
    vi.mocked(mockElements.getElement).mockReturnValue(null);

    const user = userEvent.setup();
    render(
      <PaymentForm
        plan={mockPlan}
        billingCycle="monthly"
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Confirmar Assinatura/i)).toBeInTheDocument();
    });

    const submitButton = screen.getByText(/Confirmar Assinatura/i);
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Elemento de cartão não encontrado/i)).toBeInTheDocument();
    });
  });

  it("should display error when payment method creation fails", async () => {
    vi.mocked(mockStripe.createPaymentMethod).mockResolvedValue({
      error: { message: "Card declined", type: "card_error", code: "card_declined" },
      paymentMethod: null,
    });

    const user = userEvent.setup();
    render(
      <PaymentForm
        plan={mockPlan}
        billingCycle="monthly"
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Confirmar Assinatura/i)).toBeInTheDocument();
    });

    const submitButton = screen.getByText(/Confirmar Assinatura/i);
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Card declined")).toBeInTheDocument();
    });
  });

  it("should render different text for different languages", async () => {
    vi.mocked(useLanguage).mockReturnValue({
      language: "en",
      setLanguage: vi.fn(),
      languageInfo: { code: "en", name: "English" },
    });

    render(
      <PaymentForm
        plan={mockPlan}
        billingCycle="monthly"
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("stripe-elements")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("Card Details")).toBeInTheDocument();
    });
  });
});
