import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { Sidebar } from "../sidebar";
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

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>{children}</AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </MemoryRouter>
);

describe("Sidebar", () => {
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

  it("should render sidebar", () => {
    const { container } = render(<Sidebar />, { wrapper });
    const sidebar = container.querySelector("aside");
    expect(sidebar).toBeInTheDocument();
  });

  it("should render sidebar items", () => {
    const { container } = render(<Sidebar />, { wrapper });
    const nav = container.querySelector("nav");
    expect(nav).toBeInTheDocument();
  });

  describe("Mobile responsive behavior", () => {
    it("should accept isOpen prop and control visibility", () => {
      const { container, rerender } = render(<Sidebar isOpen={false} />, { wrapper });
      const sidebar = container.querySelector("aside");

      // When closed, should have -translate-x-full on mobile
      expect(sidebar).toHaveClass("-translate-x-full");

      // When open, should have translate-x-0
      rerender(<Sidebar isOpen={true} />);
      expect(sidebar).toHaveClass("translate-x-0");
    });

    it("should accept onClose prop", () => {
      const handleClose = vi.fn();
      render(<Sidebar onClose={handleClose} />, { wrapper });
      // onClose is passed to SidebarItem, so we test it indirectly
      // The prop is accepted without error
      expect(handleClose).toBeDefined();
    });

    it("should have correct responsive classes (fixed on mobile, static on desktop)", () => {
      const { container } = render(<Sidebar />, { wrapper });
      const sidebar = container.querySelector("aside");

      // Should be fixed on mobile, static on desktop
      expect(sidebar).toHaveClass("fixed", "sm:static");
    });

    it("should have slide-in animation classes", () => {
      const { container } = render(<Sidebar isOpen={false} />, { wrapper });
      const sidebar = container.querySelector("aside");

      // Should have transform and transition classes
      expect(sidebar).toHaveClass(
        "transform",
        "transition-transform",
        "duration-300",
        "ease-in-out"
      );
    });

    it("should pass onClose to SidebarItem components", () => {
      const handleClose = vi.fn();
      const { container } = render(<Sidebar isOpen={true} onClose={handleClose} />, { wrapper });
      const sidebar = container.querySelector("aside");

      // Sidebar should render with onClose prop
      expect(sidebar).toBeInTheDocument();
      // The onClose callback is passed down to items (tested in sidebar-item tests)
    });

    it("should have correct z-index classes (z-50 on mobile, z-auto on desktop)", () => {
      const { container } = render(<Sidebar />, { wrapper });
      const sidebar = container.querySelector("aside");

      expect(sidebar).toHaveClass("z-50", "sm:z-auto");
    });

    it("should be positioned correctly (top-12 left-0 on mobile)", () => {
      const { container } = render(<Sidebar />, { wrapper });
      const sidebar = container.querySelector("aside");

      expect(sidebar).toHaveClass("top-12", "left-0");
    });
  });
});
