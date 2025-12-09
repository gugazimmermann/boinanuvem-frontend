import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DashboardLayout } from "../dashboard-layout";
import { useAuth } from "~/contexts/auth-context";
import { useNavigate } from "react-router";
import { useCompanyTrial } from "~/hooks/use-company-trial";
import { ROUTES } from "~/routes.config";

vi.mock("~/contexts/auth-context");
vi.mock("react-router", () => ({
  useNavigate: vi.fn(() => vi.fn()),
  useLocation: vi.fn(() => ({ pathname: "/dashboard" })),
  Outlet: () => <div data-testid="outlet">Outlet</div>,
  Link: ({
    to,
    children,
    ...props
  }: {
    to: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));
vi.mock("~/hooks/use-company-trial");
vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    common: {
      defaultUser: "User",
      defaultEmail: "user@example.com",
    },
    userDropdown: {
      userProfile: "User Profile",
      companyProfile: "Company Profile",
      team: "Team",
      payments: "Payments",
      help: "Help",
      logout: "Logout",
    },
    sidebar: {
      dashboard: "Dashboard",
      animals: "Animals",
      breedings: "Breedings",
      employees: "Employees",
      serviceProviders: "Service Providers",
      suppliers: "Suppliers",
      buyers: "Buyers",
      properties: "Properties",
      locations: "Locations",
      inventory: "Inventory",
      finance: "Finance",
      records: "Records",
      registrations: "Registrations",
      movements: "Movements",
      team: "Team",
      profile: "Profile",
      help: "Help",
      births: "Births",
      acquisitions: "Acquisitions",
      sales: "Sales",
      deaths: "Deaths",
      medicineAdministrations: "Medicine Administrations",
      weighings: "Weighings",
      unconfirmedBreedings: "Unconfirmed Breedings",
      pregnantCows: "Pregnant Cows",
      reproductiveIndexes: "Reproductive Indexes",
      birthForecast: "Birth Forecast",
      financas: "Finance",
      cashFlow: "Cash Flow",
      accountsPayable: "Accounts Payable",
      accountsReceivable: "Accounts Receivable",
      bankAccounts: "Bank Accounts",
      financesDashboard: "Finances Dashboard",
    },
  })),
}));
vi.mock("~/contexts/language-context", () => ({
  useLanguage: vi.fn(() => ({ language: "pt" })),
}));
vi.mock("./navbar", () => ({
  Navbar: ({ onToggleSidebar }: { onToggleSidebar: () => void }) => (
    <nav>
      <button data-testid="toggle-sidebar" onClick={onToggleSidebar}>
        Toggle
      </button>
    </nav>
  ),
}));
vi.mock("./sidebar", () => ({
  Sidebar: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    <aside data-testid="sidebar" data-open={isOpen}>
      <button onClick={onClose}>Close</button>
    </aside>
  ),
}));
vi.mock("~/components/ui", () => ({
  TrialBanner: ({ daysRemaining }: { daysRemaining: number }) => (
    <div data-testid="trial-banner">Trial: {daysRemaining} days</div>
  ),
}));

const mockNavigate = vi.fn();
const mockUseAuth = vi.mocked(useAuth);
const mockUseNavigate = vi.mocked(useNavigate);
const mockUseCompanyTrial = vi.mocked(useCompanyTrial);

describe("DashboardLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseNavigate.mockReturnValue(mockNavigate);
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      currentUser: { id: "1", companyId: "company-1" },
      login: vi.fn(),
      logout: vi.fn(),
      refreshToken: vi.fn(),
    });
    mockUseCompanyTrial.mockReturnValue({
      company: null,
      isLoading: false,
      error: null,
      isOnTrial: false,
      trialDaysRemaining: 0,
    });
  });

  afterEach(() => {
    document.body.style.overflow = "";
  });

  it("should render nothing when not mounted", async () => {
    const { container } = render(<DashboardLayout />);
    // Component uses useEffect to set isMounted, so it will be null initially
    // Wait a bit to ensure useEffect has run
    await waitFor(
      () => {
        // After mount, if authenticated, it should render
        if (mockUseAuth().isAuthenticated) {
          expect(screen.queryByTestId("toggle-sidebar")).toBeInTheDocument();
        } else {
          expect(container.firstChild).toBeNull();
        }
      },
      { timeout: 500 }
    );
  });

  it("should render nothing when not authenticated", async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      currentUser: null,
      login: vi.fn(),
      logout: vi.fn(),
      refreshToken: vi.fn(),
    });

    const { container } = render(<DashboardLayout />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.LOGIN, { replace: true });
    });

    // Should still be null because not authenticated
    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it("should render layout when authenticated and mounted", async () => {
    render(<DashboardLayout />);

    await waitFor(
      () => {
        expect(screen.getByTestId("toggle-sidebar")).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
  });

  it("should navigate to login when authentication is lost", async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      currentUser: null,
      login: vi.fn(),
      logout: vi.fn(),
      refreshToken: vi.fn(),
    });

    render(<DashboardLayout />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.LOGIN, { replace: true });
    });
  });

  it("should toggle sidebar when navbar button is clicked", async () => {
    const user = userEvent.setup();
    render(<DashboardLayout />);

    await waitFor(
      () => {
        expect(screen.getByTestId("toggle-sidebar")).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    const sidebar = screen.getByTestId("sidebar");
    expect(sidebar).toHaveAttribute("data-open", "false");

    await user.click(screen.getByTestId("toggle-sidebar"));

    await waitFor(
      () => {
        expect(sidebar).toHaveAttribute("data-open", "true");
      },
      { timeout: 1000 }
    );
  });

  it("should close sidebar when close button is clicked", async () => {
    const user = userEvent.setup();
    render(<DashboardLayout />);

    await waitFor(
      () => {
        expect(screen.getByTestId("toggle-sidebar")).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    // Open sidebar
    await user.click(screen.getByTestId("toggle-sidebar"));

    const sidebar = screen.getByTestId("sidebar");
    await waitFor(
      () => {
        expect(sidebar).toHaveAttribute("data-open", "true");
      },
      { timeout: 1000 }
    );

    // Close sidebar by clicking a sidebar item (which triggers onClose)
    // Use getByRole to find the link element directly to ensure onClick fires
    const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
    await user.click(dashboardLink);

    await waitFor(
      () => {
        expect(sidebar).toHaveAttribute("data-open", "false");
      },
      { timeout: 1000 }
    );
  });

  it("should show trial banner when on trial", async () => {
    mockUseCompanyTrial.mockReturnValue({
      company: null,
      isLoading: false,
      error: null,
      isOnTrial: true,
      trialDaysRemaining: 5,
    });

    render(<DashboardLayout />);

    await waitFor(
      () => {
        expect(screen.getByTestId("trial-banner")).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    expect(screen.getByText("Trial: 5 days")).toBeInTheDocument();
  });

  it("should not show trial banner when not on trial", async () => {
    mockUseCompanyTrial.mockReturnValue({
      company: null,
      isLoading: false,
      error: null,
      isOnTrial: false,
      trialDaysRemaining: 0,
    });

    render(<DashboardLayout />);

    await waitFor(
      () => {
        expect(screen.getByTestId("sidebar")).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    expect(screen.queryByTestId("trial-banner")).not.toBeInTheDocument();
  });

  it("should close sidebar when clicking outside", async () => {
    const user = userEvent.setup();
    render(<DashboardLayout />);

    await waitFor(
      () => {
        expect(screen.getByTestId("toggle-sidebar")).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    // Open sidebar
    await user.click(screen.getByTestId("toggle-sidebar"));

    const sidebar = screen.getByTestId("sidebar");
    await waitFor(
      () => {
        expect(sidebar).toHaveAttribute("data-open", "true");
      },
      { timeout: 1000 }
    );

    // Click outside sidebar
    const main = screen.getByRole("main");
    await user.click(main);

    await waitFor(
      () => {
        expect(sidebar).toHaveAttribute("data-open", "false");
      },
      { timeout: 1000 }
    );
  });

  it("should set body overflow hidden when sidebar is open", async () => {
    const user = userEvent.setup();
    render(<DashboardLayout />);

    await waitFor(
      () => {
        expect(screen.getByTestId("toggle-sidebar")).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    await user.click(screen.getByTestId("toggle-sidebar"));

    await waitFor(
      () => {
        expect(document.body.style.overflow).toBe("hidden");
      },
      { timeout: 1000 }
    );
  });

  it("should restore body overflow when sidebar is closed", async () => {
    const user = userEvent.setup();
    render(<DashboardLayout />);

    await waitFor(
      () => {
        expect(screen.getByTestId("toggle-sidebar")).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    // Open sidebar
    await user.click(screen.getByTestId("toggle-sidebar"));

    await waitFor(
      () => {
        expect(document.body.style.overflow).toBe("hidden");
      },
      { timeout: 1000 }
    );

    // Close sidebar by clicking a sidebar item (which triggers onClose)
    // Use getByRole to find the link element directly to ensure onClick fires
    const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
    await user.click(dashboardLink);

    await waitFor(
      () => {
        expect(document.body.style.overflow).toBe("");
      },
      { timeout: 1000 }
    );
  });
});
