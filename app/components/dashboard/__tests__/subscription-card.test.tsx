import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SubscriptionCard } from "../subscription-card";
import type { Subscription, SubscriptionStatus } from "~/types/subscription";
import { cancelSubscription, createCustomerPortalSession } from "~/services/subscriptions.service";

vi.mock("~/services/subscriptions.service");
vi.mock("~/utils/date", () => ({
  getDateLocale: vi.fn(() => ({ code: "pt" })),
}));

const mockSubscription: Subscription = {
  id: "sub-1",
  companyId: "company-1",
  planId: "plan-1",
  billingCycle: "monthly",
  status: "active",
  isActive: true,
  isTrial: false,
  trialEndDate: null,
  stripeSubscriptionId: null,
  stripeCustomerId: null,
  stripePriceId: null,
  startDate: "2024-01-01",
  endDate: "2024-12-31",
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
  plan: {
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
    features: ["Feature 1", "Feature 2"],
    popular: false,
    status: "active",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
};

describe("SubscriptionCard", () => {
  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.location = { href: "" } as Location;
  });

  it("should render subscription details", () => {
    render(
      <SubscriptionCard subscription={mockSubscription} onUpdate={mockOnUpdate} language="pt" />
    );

    expect(screen.getByText("Básico")).toBeInTheDocument();
  });

  it("should render manage and cancel buttons for active subscription", () => {
    render(
      <SubscriptionCard subscription={mockSubscription} onUpdate={mockOnUpdate} language="pt" />
    );

    expect(screen.getByText(/Gerenciar Assinatura/i)).toBeInTheDocument();
    expect(screen.getByText(/Cancelar Assinatura/i)).toBeInTheDocument();
  });

  it("should not render buttons for inactive subscription", () => {
    const inactiveSubscription: Subscription = {
      ...mockSubscription,
      isActive: false,
      status: "cancelled" as SubscriptionStatus,
    };

    render(
      <SubscriptionCard subscription={inactiveSubscription} onUpdate={mockOnUpdate} language="pt" />
    );

    expect(screen.queryByText(/Gerenciar Assinatura/i)).not.toBeInTheDocument();
  });

  it("should open cancel dialog when cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <SubscriptionCard subscription={mockSubscription} onUpdate={mockOnUpdate} language="pt" />
    );

    const cancelButton = screen.getByText(/Cancelar Assinatura/i);
    await user.click(cancelButton);

    expect(screen.getByText(/Como você deseja cancelar/i)).toBeInTheDocument();
  });

  it("should call createCustomerPortalSession when manage button is clicked", async () => {
    const mockSession = { url: "https://portal.example.com" };
    vi.mocked(createCustomerPortalSession).mockResolvedValue(mockSession);

    const user = userEvent.setup();
    render(
      <SubscriptionCard subscription={mockSubscription} onUpdate={mockOnUpdate} language="pt" />
    );

    const manageButton = screen.getByText(/Gerenciar Assinatura/i);
    await user.click(manageButton);

    await waitFor(() => {
      expect(createCustomerPortalSession).toHaveBeenCalled();
    });
  });

  it("should call cancelSubscription when confirm cancellation is clicked", async () => {
    vi.mocked(cancelSubscription).mockResolvedValue(undefined);

    const user = userEvent.setup();
    render(
      <SubscriptionCard subscription={mockSubscription} onUpdate={mockOnUpdate} language="pt" />
    );

    const cancelButton = screen.getByText(/Cancelar Assinatura/i);
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.getByText(/Confirmar Cancelamento/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByText(/Confirmar Cancelamento/i);
    await user.click(confirmButton);

    await waitFor(() => {
      expect(cancelSubscription).toHaveBeenCalledWith("sub-1", {
        cancelImmediately: false,
      });
    });
  });

  it("should display error message when cancellation fails", async () => {
    const errorMessage = "Failed to cancel";
    vi.mocked(cancelSubscription).mockRejectedValue(new Error(errorMessage));

    const user = userEvent.setup();
    render(
      <SubscriptionCard subscription={mockSubscription} onUpdate={mockOnUpdate} language="pt" />
    );

    const cancelButton = screen.getByText(/Cancelar Assinatura/i);
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.getByText(/Confirmar Cancelamento/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByText(/Confirmar Cancelamento/i);
    await user.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it("should render different status labels for different languages", () => {
    const { rerender } = render(
      <SubscriptionCard subscription={mockSubscription} onUpdate={mockOnUpdate} language="en" />
    );

    expect(screen.getByText("Active")).toBeInTheDocument();

    rerender(
      <SubscriptionCard subscription={mockSubscription} onUpdate={mockOnUpdate} language="es" />
    );

    expect(screen.getByText("Activa")).toBeInTheDocument();
  });
});
