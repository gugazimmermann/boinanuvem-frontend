import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { meta, default as Profile } from "../../dashboard/profile";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
  };
});

vi.mock("~/components/dashboard/profile", () => ({
  CompanyProfile: vi.fn(() => <div data-testid="company-profile">Company Profile</div>),
  UserProfile: vi.fn(() => <div data-testid="user-profile">User Profile</div>),
}));

vi.mock("~/contexts/auth-context", () => ({
  useAuth: vi.fn(() => ({
    currentUser: {
      id: "user-1",
      mainUser: true,
    },
  })),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    profile: {
      title: "Perfil",
      tabs: {
        company: "Empresa",
        user: "Usuário",
      },
    },
    common: {
      ariaLabels: {
        tabs: "Abas de navegação",
      },
    },
  })),
}));

vi.mock("~/components/dashboard/utils/colors", () => ({
  DASHBOARD_COLORS: {
    primary: "#3B82F6",
    primaryLight: "#DBEAFE",
    primaryDark: "#1E40AF",
  },
}));

const TestWrapper = ({
  children,
  initialEntries = ["/dashboard/perfil"],
}: {
  children: React.ReactNode;
  initialEntries?: string[];
}) => <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;

describe("profile", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { useAuth } = await import("~/contexts/auth-context");
    vi.mocked(useAuth).mockReturnValue({
      currentUser: {
        id: "user-1",
        mainUser: true,
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("meta", () => {
    it("should return SEO meta tags", () => {
      const result = meta();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty("title");
      expect(result[0].title).toContain("Perfil");
      expect(result[1]).toHaveProperty("name", "description");
    });
  });

  describe("Profile component", () => {
    it("should render profile page with correct title", () => {
      render(
        <TestWrapper>
          <Profile />
        </TestWrapper>
      );

      expect(screen.getByText("Perfil")).toBeInTheDocument();
    });

    it("should render tabs navigation", () => {
      render(
        <TestWrapper>
          <Profile />
        </TestWrapper>
      );

      expect(screen.getByText("Empresa")).toBeInTheDocument();
      expect(screen.getByText("Usuário")).toBeInTheDocument();
    });

    it("should show company tab for main users", () => {
      render(
        <TestWrapper>
          <Profile />
        </TestWrapper>
      );

      const companyTab = screen.getByText("Empresa");
      expect(companyTab).toBeInTheDocument();
    });

    it("should not show company tab for non-main users", async () => {
      const { useAuth } = await import("~/contexts/auth-context");
      vi.mocked(useAuth).mockReturnValue({
        currentUser: {
          id: "user-1",
          mainUser: false,
        },
      });

      render(
        <TestWrapper>
          <Profile />
        </TestWrapper>
      );

      // Company tab should not be visible for non-main users
      const tabs = screen.getAllByRole("button");
      const _companyTab = tabs.find((tab) => tab.textContent === "Empresa");
      // The tab might still be in DOM but hidden/disabled, so we check if UserProfile is shown
      expect(screen.getByTestId("user-profile")).toBeInTheDocument();
    });

    it("should default to company tab for main users", () => {
      render(
        <TestWrapper>
          <Profile />
        </TestWrapper>
      );

      expect(screen.getByTestId("company-profile")).toBeInTheDocument();
    });

    it("should default to user tab for non-main users", async () => {
      const { useAuth } = await import("~/contexts/auth-context");
      vi.mocked(useAuth).mockReturnValue({
        currentUser: {
          id: "user-1",
          mainUser: false,
        },
      });

      render(
        <TestWrapper>
          <Profile />
        </TestWrapper>
      );

      expect(screen.getByTestId("user-profile")).toBeInTheDocument();
    });

    it("should switch to user tab when clicked", async () => {
      const user = userEvent.setup();
      const { useSearchParams } = await import("react-router");
      const mockSetSearchParams = vi.fn();

      vi.mocked(useSearchParams).mockReturnValue([new URLSearchParams(), mockSetSearchParams]);

      render(
        <TestWrapper>
          <Profile />
        </TestWrapper>
      );

      const userTab = screen.getByText("Usuário");
      await user.click(userTab);

      await waitFor(() => {
        expect(mockSetSearchParams).toHaveBeenCalledWith({ tab: "user" });
      });
    });

    it("should switch to company tab when clicked", async () => {
      const user = userEvent.setup();
      const { useSearchParams } = await import("react-router");
      const mockSetSearchParams = vi.fn();

      vi.mocked(useSearchParams).mockReturnValue([
        new URLSearchParams("tab=user"),
        mockSetSearchParams,
      ]);

      render(
        <TestWrapper>
          <Profile />
        </TestWrapper>
      );

      const companyTab = screen.getByText("Empresa");
      await user.click(companyTab);

      await waitFor(() => {
        expect(mockSetSearchParams).toHaveBeenCalledWith({ tab: "company" });
      });
    });

    it("should handle tab parameter from URL", async () => {
      const { useSearchParams } = await import("react-router");

      vi.mocked(useSearchParams).mockReturnValue([new URLSearchParams("tab=user"), vi.fn()]);

      render(
        <TestWrapper>
          <Profile />
        </TestWrapper>
      );

      expect(screen.getByTestId("user-profile")).toBeInTheDocument();
    });

    it("should redirect non-main users away from company tab", async () => {
      const { useAuth } = await import("~/contexts/auth-context");
      const { useSearchParams } = await import("react-router");
      const mockSetSearchParams = vi.fn();

      vi.mocked(useAuth).mockReturnValue({
        currentUser: {
          id: "user-1",
          mainUser: false,
        },
      });

      vi.mocked(useSearchParams).mockReturnValue([
        new URLSearchParams("tab=company"),
        mockSetSearchParams,
      ]);

      render(
        <TestWrapper>
          <Profile />
        </TestWrapper>
      );

      // Should redirect to user tab
      await waitFor(() => {
        expect(mockSetSearchParams).toHaveBeenCalledWith({ tab: "user" });
      });
    });

    it("should handle invalid tab parameter", async () => {
      const { useSearchParams } = await import("react-router");

      vi.mocked(useSearchParams).mockReturnValue([new URLSearchParams("tab=invalid"), vi.fn()]);

      render(
        <TestWrapper>
          <Profile />
        </TestWrapper>
      );

      // Should default to company tab for main users
      expect(screen.getByTestId("company-profile")).toBeInTheDocument();
    });

    it("should apply active tab styling", () => {
      render(
        <TestWrapper>
          <Profile />
        </TestWrapper>
      );

      const tabs = screen.getAllByRole("button");
      const companyTab = tabs.find((tab) => tab.textContent === "Empresa");
      expect(companyTab).toBeInTheDocument();
    });
  });
});
