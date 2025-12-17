import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import Subscription from "../subscription";
import { fetchPlans } from "~/services/plans.service";
import { useLanguage } from "~/contexts/language-context";
import { useNavigate } from "react-router";

vi.mock("~/services/plans.service");
vi.mock("~/contexts/language-context");
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

const mockPlans = [
  {
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
    features: ["Feature 1", "Feature 2"],
    popular: false,
  },
  {
    id: "plan-2",
    name: "Avançado",
    description: "Plano avançado",
    monthlyPrice: "R$ 200,00",
    annualPrice: "R$ 2.000,00",
    limits: {
      properties: 5,
      locations: 20,
      animals: 500,
      members: 10,
    },
    features: ["Feature 1", "Feature 2", "Feature 3"],
    popular: true,
  },
];

describe("Subscription", () => {
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

  it("should render loading state initially", () => {
    vi.mocked(fetchPlans).mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter>
        <Subscription />
      </MemoryRouter>
    );

    expect(screen.getByText(/Carregando planos/i)).toBeInTheDocument();
  });

  it("should render plans when loaded", async () => {
    vi.mocked(fetchPlans).mockResolvedValue(mockPlans);

    render(
      <MemoryRouter>
        <Subscription />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Básico")).toBeInTheDocument();
    });

    expect(screen.getByText("Avançado")).toBeInTheDocument();
  });

  it("should toggle between monthly and annual billing", async () => {
    vi.mocked(fetchPlans).mockResolvedValue(mockPlans);

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Subscription />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Básico")).toBeInTheDocument();
    });

    const annualButton = screen.getByText("Anual");
    await user.click(annualButton);

    expect(screen.getByText(/R\$ 1.000,00/i)).toBeInTheDocument();
  });

  it("should navigate to payment page when subscribe button is clicked", async () => {
    vi.mocked(fetchPlans).mockResolvedValue(mockPlans);

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Subscription />
      </MemoryRouter>
    );

    const subscribeButtons = await screen.findAllByRole("button", { name: /Assinar Agora/i });
    await user.click(subscribeButtons[0]);

    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );
  });

  it("should display error message when plans fail to load", async () => {
    const errorMessage = "Failed to load plans";
    vi.mocked(fetchPlans).mockRejectedValue(new Error(errorMessage));

    render(
      <MemoryRouter>
        <Subscription />
      </MemoryRouter>
    );

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
    vi.mocked(fetchPlans).mockResolvedValue(mockPlans);

    render(
      <MemoryRouter>
        <Subscription />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Choose Your Plan/i)).toBeInTheDocument();
    });
  });
});
