import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import SubscriptionSuccess from "../subscription.success";
import { confirmSubscription } from "~/services/subscriptions.service";
import { useLanguage } from "~/contexts/language-context";
import { useNavigate, useSearchParams } from "react-router";

vi.mock("~/services/subscriptions.service");
vi.mock("~/contexts/language-context");
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: vi.fn(),
    useSearchParams: vi.fn(),
  };
});

describe("SubscriptionSuccess", () => {
  const mockNavigate = vi.fn();
  const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useLanguage).mockReturnValue({
      language: "pt",
      setLanguage: vi.fn(),
      languageInfo: { code: "pt", name: "Português" },
    });
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    consoleErrorSpy.mockClear();
  });

  it("should render loading state initially", async () => {
    vi.mocked(useSearchParams).mockReturnValue([
      new URLSearchParams("?session_id=test-session"),
    ] as never);
    // Keep the request pending so the component stays in loading state (and avoid extra updates)
    vi.mocked(confirmSubscription).mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter>
        <SubscriptionSuccess />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Confirmando sua assinatura/i)).toBeInTheDocument();
  });

  it("should display error when session_id is missing", async () => {
    vi.mocked(useSearchParams).mockReturnValue([new URLSearchParams()] as never);

    render(
      <MemoryRouter>
        <SubscriptionSuccess />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/ID de sessão não encontrado/i)).toBeInTheDocument();
    });
  });

  it("should display success message when subscription is confirmed", async () => {
    vi.mocked(useSearchParams).mockReturnValue([
      new URLSearchParams("?session_id=test-session"),
    ] as never);
    vi.mocked(confirmSubscription).mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <SubscriptionSuccess />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(confirmSubscription).toHaveBeenCalledWith({ sessionId: "test-session" });
    });

    await waitFor(
      () => {
        expect(screen.getByText(/Assinatura Confirmada!/i)).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("should display error message when confirmation fails", async () => {
    const errorMessage = "Failed to confirm";
    vi.mocked(useSearchParams).mockReturnValue([
      new URLSearchParams("?session_id=test-session"),
    ] as never);
    vi.mocked(confirmSubscription).mockRejectedValue(new Error(errorMessage));

    render(
      <MemoryRouter>
        <SubscriptionSuccess />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Erro ao Confirmar Assinatura/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it("should render different text for different languages", async () => {
    vi.mocked(useLanguage).mockReturnValue({
      language: "en",
      setLanguage: vi.fn(),
      languageInfo: { code: "en", name: "English" },
    });
    vi.mocked(useSearchParams).mockReturnValue([
      new URLSearchParams("?session_id=test-session"),
    ] as never);
    vi.mocked(confirmSubscription).mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <SubscriptionSuccess />
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByText(/Confirming your subscription/i)).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });
});
