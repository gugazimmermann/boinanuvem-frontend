import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserDropdown } from "../user-dropdown";
import { useAuth } from "~/contexts/auth-context";
import { useTranslation } from "~/i18n";
import { useClickOutside } from "~/hooks/use-click-outside";
import { ThemeProvider } from "~/contexts/theme-context";
import { LanguageProvider } from "~/contexts/language-context";

vi.mock("~/contexts/auth-context");
vi.mock("~/i18n");
vi.mock("~/hooks/use-click-outside");

vi.mock("react-router", () => ({
  Link: ({
    to,
    children,
    onClick,
    className,
  }: {
    to: string;
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }) => (
    <a href={to} onClick={onClick} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("../avatar-button", () => ({
  AvatarButton: ({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) => (
    <button data-testid="avatar-button" onClick={onClick} data-open={isOpen}>
      Avatar
    </button>
  ),
}));

vi.mock("../dropdown-menu", () => ({
  DropdownMenu: ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) =>
    isOpen ? <div data-testid="dropdown-menu">{children}</div> : null,
}));

vi.mock("../user-info", () => ({
  UserInfo: ({ name, email }: { name: string; email: string }) => (
    <div data-testid="user-info">
      {name} - {email}
    </div>
  ),
}));

describe("UserDropdown", () => {
  const mockUseAuth = vi.mocked(useAuth);
  const mockUseTranslation = vi.mocked(useTranslation);
  const mockUseClickOutside = vi.mocked(useClickOutside);

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      currentUser: { id: "1", name: "Test User", email: "test@example.com", mainUser: false },
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      refreshToken: vi.fn(),
    });
    mockUseTranslation.mockReturnValue({
      common: {
        language: "Language",
        defaultUser: "User",
        defaultEmail: "user@example.com",
      },
      userDropdown: {
        companyProfile: "Company Profile",
        userProfile: "User Profile",
        team: "Team",
        payments: "Payments",
        help: "Help",
        logout: "Logout",
      },
    } as unknown as ReturnType<typeof useTranslation>);
    mockUseClickOutside.mockImplementation(() => {});
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <ThemeProvider>
        <LanguageProvider>{component}</LanguageProvider>
      </ThemeProvider>
    );
  };

  it("should render avatar button", () => {
    renderWithProviders(<UserDropdown />);
    expect(screen.getByTestId("avatar-button")).toBeInTheDocument();
  });

  it("should open dropdown when avatar button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<UserDropdown />);

    const avatarButton = screen.getByTestId("avatar-button");
    await user.click(avatarButton);

    await waitFor(() => {
      expect(screen.getByTestId("dropdown-menu")).toBeInTheDocument();
    });
  });

  it("should render user info when dropdown is open", async () => {
    const user = userEvent.setup();
    renderWithProviders(<UserDropdown name="John Doe" email="john@example.com" />);

    const avatarButton = screen.getByTestId("avatar-button");
    await user.click(avatarButton);

    await waitFor(() => {
      expect(screen.getByTestId("user-info")).toBeInTheDocument();
    });
  });

  it("should use default user info from auth context", async () => {
    const user = userEvent.setup();
    renderWithProviders(<UserDropdown />);

    const avatarButton = screen.getByTestId("avatar-button");
    await user.click(avatarButton);

    await waitFor(() => {
      expect(screen.getByText("Test User - test@example.com")).toBeInTheDocument();
    });
  });
});
