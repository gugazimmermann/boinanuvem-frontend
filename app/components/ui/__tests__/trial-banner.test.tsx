import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { TrialBanner } from "../trial-banner";
import { LanguageProvider } from "~/contexts/language-context";

describe("TrialBanner", () => {
  let localStorageMock: {
    getItem: ReturnType<typeof vi.fn>;
    setItem: ReturnType<typeof vi.fn>;
    removeItem: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
    length: number;
    key: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // Setup localStorage mock
    localStorageMock = {
      getItem: vi.fn().mockReturnValue("en"),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    };
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock as Storage,
      writable: true,
    });
    vi.clearAllMocks();
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <MemoryRouter>
        <LanguageProvider>{component}</LanguageProvider>
      </MemoryRouter>
    );
  };

  it("should render with blue background when days >= 10", async () => {
    const { container } = renderWithProvider(<TrialBanner daysRemaining={10} />);
    await waitFor(() => {
      const banner = container.firstChild as HTMLElement;
      expect(banner).toHaveClass("bg-blue-500");
    });
  });

  it("should render with blue background when days > 10", async () => {
    const { container } = renderWithProvider(<TrialBanner daysRemaining={15} />);
    await waitFor(() => {
      const banner = container.firstChild as HTMLElement;
      expect(banner).toHaveClass("bg-blue-500");
    });
  });

  it("should render with orange background when days between 2 and 9", async () => {
    const { container } = renderWithProvider(<TrialBanner daysRemaining={5} />);
    await waitFor(() => {
      const banner = container.firstChild as HTMLElement;
      expect(banner).toHaveClass("bg-orange-500");
    });
  });

  it("should render with red background when days is 1", async () => {
    const { container } = renderWithProvider(<TrialBanner daysRemaining={1} />);
    await waitFor(() => {
      const banner = container.firstChild as HTMLElement;
      expect(banner).toHaveClass("bg-red-500");
    });
  });

  it("should render with red background when days is 0", async () => {
    const { container } = renderWithProvider(<TrialBanner daysRemaining={0} />);
    await waitFor(() => {
      const banner = container.firstChild as HTMLElement;
      expect(banner).toHaveClass("bg-red-500");
    });
  });

  it("should show correct message for >= 10 days", async () => {
    renderWithProvider(<TrialBanner daysRemaining={12} />);
    await waitFor(() => {
      expect(screen.getByText(/you have 12 days left in your trial/i)).toBeInTheDocument();
    });
  });

  it("should show correct message for 2-9 days", async () => {
    renderWithProvider(<TrialBanner daysRemaining={7} />);
    await waitFor(() => {
      expect(screen.getByText(/your trial ends in 7 days/i)).toBeInTheDocument();
    });
  });

  it("should show correct message for 1 day", async () => {
    renderWithProvider(<TrialBanner daysRemaining={1} />);
    await waitFor(() => {
      expect(screen.getByText(/your trial ends tomorrow/i)).toBeInTheDocument();
    });
  });

  it("should show correct message for 0 days", async () => {
    renderWithProvider(<TrialBanner daysRemaining={0} />);
    await waitFor(() => {
      expect(screen.getByText(/your trial has ended/i)).toBeInTheDocument();
    });
  });

  it("should render dismiss button", async () => {
    renderWithProvider(<TrialBanner daysRemaining={10} />);
    await waitFor(() => {
      const dismissButton = screen.getByRole("button", { name: /dismiss trial banner/i });
      expect(dismissButton).toBeInTheDocument();
    });
  });

  it("should hide banner when dismiss button is clicked", async () => {
    const user = userEvent.setup();
    const { container } = renderWithProvider(<TrialBanner daysRemaining={10} />);
    await waitFor(() => {
      const dismissButton = screen.getByRole("button", { name: /dismiss trial banner/i });
      expect(dismissButton).toBeInTheDocument();
    });
    const dismissButton = screen.getByRole("button", { name: /dismiss trial banner/i });
    await user.click(dismissButton);
    expect(container.firstChild).toBeNull();
  });

  it("should call onDismiss when dismiss button is clicked", async () => {
    const onDismiss = vi.fn();
    const user = userEvent.setup();
    renderWithProvider(<TrialBanner daysRemaining={10} onDismiss={onDismiss} />);
    await waitFor(() => {
      const dismissButton = screen.getByRole("button", { name: /dismiss trial banner/i });
      expect(dismissButton).toBeInTheDocument();
    });
    const dismissButton = screen.getByRole("button", { name: /dismiss trial banner/i });
    await user.click(dismissButton);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("should apply custom className", async () => {
    const { container } = renderWithProvider(
      <TrialBanner daysRemaining={10} className="custom-class" />
    );
    await waitFor(() => {
      const banner = container.firstChild as HTMLElement;
      expect(banner).toHaveClass("custom-class");
    });
  });

  it("should render checkmark icon", async () => {
    const { container } = renderWithProvider(<TrialBanner daysRemaining={10} />);
    await waitFor(() => {
      const icon = container.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });
  });

  it("should not render when dismissed", async () => {
    const user = userEvent.setup();
    const { container, rerender } = renderWithProvider(<TrialBanner daysRemaining={10} />);
    await waitFor(() => {
      const dismissButton = screen.getByRole("button", { name: /dismiss trial banner/i });
      expect(dismissButton).toBeInTheDocument();
    });
    const dismissButton = screen.getByRole("button", { name: /dismiss trial banner/i });
    await user.click(dismissButton);
    rerender(
      <MemoryRouter>
        <LanguageProvider>
          <TrialBanner daysRemaining={10} />
        </LanguageProvider>
      </MemoryRouter>
    );
    expect(container.firstChild).toBeNull();
  });

  it("should show Portuguese message when language is pt", async () => {
    localStorageMock.getItem.mockReturnValue("pt");
    renderWithProvider(<TrialBanner daysRemaining={12} />);
    await waitFor(() => {
      expect(screen.getByText(/você tem 12 dias restantes no seu teste/i)).toBeInTheDocument();
    });
  });

  it("should show Spanish message when language is es", async () => {
    localStorageMock.getItem.mockReturnValue("es");
    renderWithProvider(<TrialBanner daysRemaining={12} />);
    await waitFor(() => {
      expect(screen.getByText(/tienes 12 días restantes en tu prueba/i)).toBeInTheDocument();
    });
  });
});
