import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
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
});
