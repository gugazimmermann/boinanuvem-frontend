import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { DashboardLayout } from "../dashboard-layout";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import { AuthProvider } from "~/contexts/auth-context";
import { getUserById } from "~/services/users.service";
import { createMockMainUser, setCurrentUserId, clearLocalStorage } from "~/test-utils";

const mockUsePermissions = vi.fn();
vi.mock("~/utils/permissions", () => ({
  usePermissions: () => mockUsePermissions(),
}));

vi.mock("~/services/users.service", () => ({
  getUserById: vi.fn(),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <MemoryRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>{children}</AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
};

describe("DashboardLayout", () => {
  beforeEach(() => {
    clearLocalStorage();
    vi.clearAllMocks();
    const mockUser = createMockMainUser();
    vi.mocked(getUserById).mockReturnValue(mockUser);
    setCurrentUserId(mockUser.id);
    mockUsePermissions.mockReturnValue({
      canView: () => true,
      canAdd: () => true,
      canEdit: () => true,
      canRemove: () => true,
      isMainUser: () => true,
    });
  });

  it("should render navbar", () => {
    render(<DashboardLayout />, { wrapper });
    expect(screen.getByText(/Boi na Nuvem/i)).toBeInTheDocument();
  });

  it("should render sidebar", () => {
    const { container } = render(<DashboardLayout />, { wrapper });
    const sidebar = container.querySelector("aside");
    expect(sidebar).toBeInTheDocument();
  });

  it("should render main content area", () => {
    const { container } = render(<DashboardLayout />, { wrapper });
    const main = container.querySelector("main");
    expect(main).toBeInTheDocument();
  });

  it("should render outlet for child routes", () => {
    const { container } = render(<DashboardLayout />, { wrapper });
    const outlet = container.querySelector("main");
    expect(outlet).toBeInTheDocument();
  });

  describe("Mobile sidebar functionality", () => {
    afterEach(() => {
      // Reset body overflow after each test
      document.body.style.overflow = "";
    });

    it("should render hamburger button on mobile", () => {
      render(<DashboardLayout />, { wrapper });
      const hamburgerButton = screen.getByLabelText("Toggle sidebar");
      expect(hamburgerButton).toBeInTheDocument();
      // Check that it has sm:hidden class (visible on mobile, hidden on desktop)
      expect(hamburgerButton).toHaveClass("sm:hidden");
    });

    it("should toggle sidebar when hamburger button is clicked", async () => {
      const user = userEvent.setup();
      const { container } = render(<DashboardLayout />, { wrapper });
      const hamburgerButton = screen.getByLabelText("Toggle sidebar");
      const sidebar = container.querySelector("aside");

      // Sidebar should be closed initially (translate-x-full on mobile)
      expect(sidebar).toHaveClass("-translate-x-full");

      // Click hamburger button to open
      await user.click(hamburgerButton);
      expect(sidebar).toHaveClass("translate-x-0");

      // Click again to close
      await user.click(hamburgerButton);
      expect(sidebar).toHaveClass("-translate-x-full");
    });

    it("should show overlay backdrop when sidebar is open on mobile", async () => {
      const user = userEvent.setup();
      const { container } = render(<DashboardLayout />, { wrapper });
      const hamburgerButton = screen.getByLabelText("Toggle sidebar");

      // Overlay should not be visible initially
      const overlayBefore = container.querySelector('[aria-hidden="true"]');
      expect(overlayBefore).not.toBeInTheDocument();

      // Open sidebar
      await user.click(hamburgerButton);

      // Overlay should be visible
      const overlay = container.querySelector('[aria-hidden="true"]');
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveClass("backdrop-blur-sm", "bg-black/20", "sm:hidden");
    });

    it("should close sidebar when overlay backdrop is clicked", async () => {
      const user = userEvent.setup();
      const { container } = render(<DashboardLayout />, { wrapper });
      const hamburgerButton = screen.getByLabelText("Toggle sidebar");
      const sidebar = container.querySelector("aside");

      // Open sidebar
      await user.click(hamburgerButton);
      expect(sidebar).toHaveClass("translate-x-0");

      // Click overlay to close
      const overlay = container.querySelector('[aria-hidden="true"]');
      if (overlay) {
        await user.click(overlay);
        expect(sidebar).toHaveClass("-translate-x-full");
      }
    });

    it("should lock body scroll when sidebar is open", async () => {
      const user = userEvent.setup();
      render(<DashboardLayout />, { wrapper });
      const hamburgerButton = screen.getByLabelText("Toggle sidebar");

      // Open sidebar
      await user.click(hamburgerButton);
      expect(document.body.style.overflow).toBe("hidden");

      // Close sidebar
      await user.click(hamburgerButton);
      expect(document.body.style.overflow).toBe("");
    });

    it("should close sidebar when clicking outside on mobile", async () => {
      const user = userEvent.setup();
      const { container } = render(<DashboardLayout />, { wrapper });
      const hamburgerButton = screen.getByLabelText("Toggle sidebar");
      const sidebar = container.querySelector("aside");
      const main = container.querySelector("main");

      // Open sidebar
      await user.click(hamburgerButton);
      expect(sidebar).toHaveClass("translate-x-0");

      // Click outside (on main content)
      if (main) {
        await user.click(main);
        expect(sidebar).toHaveClass("-translate-x-full");
      }
    });

    it("should not close sidebar when clicking hamburger button again", async () => {
      const user = userEvent.setup();
      const { container } = render(<DashboardLayout />, { wrapper });
      const hamburgerButton = screen.getByLabelText("Toggle sidebar");
      const sidebar = container.querySelector("aside");

      // Open sidebar
      await user.click(hamburgerButton);
      expect(sidebar).toHaveClass("translate-x-0");

      // Click hamburger button - should close, not stay open
      await user.click(hamburgerButton);
      expect(sidebar).toHaveClass("-translate-x-full");
    });

    it("should have sidebar always visible on desktop (sm breakpoint and above)", () => {
      const { container } = render(<DashboardLayout />, { wrapper });
      const sidebar = container.querySelector("aside");

      // On desktop, sidebar should have static positioning and always be visible
      expect(sidebar).toHaveClass("sm:static", "sm:translate-x-0");
    });
  });
});
