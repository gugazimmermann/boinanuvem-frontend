import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Navbar } from "../navbar";

vi.mock("react-router", () => ({
  Link: ({
    to,
    children,
    className,
    style,
  }: {
    to: string;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
  }) => (
    <a href={to} className={className} style={style}>
      {children}
    </a>
  ),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    common: {
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
  })),
}));

vi.mock("~/contexts/auth-context", () => ({
  useAuth: vi.fn(() => ({
    currentUser: { id: "1", name: "Test User", email: "test@example.com", mainUser: false },
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn(),
  })),
}));

vi.mock("~/contexts/language-context", () => ({
  useLanguage: vi.fn(() => ({ language: "pt" })),
}));

vi.mock("~/hooks/use-click-outside", () => ({
  useClickOutside: vi.fn(),
}));

vi.mock("./theme-toggle-menu-item", () => ({
  ThemeToggleMenuItem: () => <div>Theme Toggle</div>,
}));

vi.mock("./language-selector-menu-item", () => ({
  LanguageSelectorMenuItem: () => <div>Language Selector</div>,
}));

vi.mock("./avatar-button", () => ({
  AvatarButton: ({ onClick }: { onClick: () => void }) => (
    <button data-testid="avatar-button" onClick={onClick}>
      Avatar
    </button>
  ),
}));

vi.mock("./dropdown-menu", () => ({
  DropdownMenu: ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) =>
    isOpen ? <div data-testid="dropdown-menu">{children}</div> : null,
}));

vi.mock("./user-info", () => ({
  UserInfo: () => <div data-testid="user-info">User Info</div>,
}));

vi.mock("./dropdown-menu-item", () => ({
  DropdownMenuItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("Navbar", () => {
  const defaultProps = {
    onToggleSidebar: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render navbar", () => {
    render(<Navbar {...defaultProps} />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("should render brand link", () => {
    render(<Navbar {...defaultProps} />);
    const brandLink = screen.getByText("Boi na Nuvem");
    expect(brandLink).toBeInTheDocument();
    expect(brandLink.closest("a")).toHaveAttribute("href", "/dashboard");
  });

  it("should render hamburger button", () => {
    render(<Navbar {...defaultProps} />);
    const hamburgerButton = screen.getByLabelText("Toggle sidebar");
    expect(hamburgerButton).toBeInTheDocument();
  });

  it("should call onToggleSidebar when hamburger button is clicked", async () => {
    const user = userEvent.setup();
    const onToggleSidebar = vi.fn();
    render(<Navbar onToggleSidebar={onToggleSidebar} />);

    const hamburgerButton = screen.getByLabelText("Toggle sidebar");
    await user.click(hamburgerButton);

    expect(onToggleSidebar).toHaveBeenCalledTimes(1);
  });

  it("should render UserDropdown", () => {
    render(<Navbar {...defaultProps} />);
    // UserDropdown is rendered, check for any element from it
    // The AvatarButton should render a button with the user initial
    const buttons = screen.getAllByRole("button");
    // Should have hamburger button and avatar button
    expect(buttons.length).toBeGreaterThan(1);
  });
});
