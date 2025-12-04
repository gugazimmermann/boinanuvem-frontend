import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserDropdown } from "../user-dropdown";
import { BrowserRouter } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <LanguageProvider>{children}</LanguageProvider>
  </BrowserRouter>
);

const mockNavigate = vi.fn();
const mockLogout = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("~/contexts/auth-context", () => ({
  useAuth: vi.fn(() => ({
    currentUser: {
      id: "user-1",
      name: "Test User",
      email: "test@example.com",
      mainUser: true,
    },
    logout: mockLogout,
  })),
}));

vi.mock("~/hooks/use-click-outside", () => ({
  useClickOutside: vi.fn(),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    common: {
      defaultUser: "User",
      defaultEmail: "email@example.com",
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

vi.mock("../avatar-button", () => ({
  AvatarButton: vi.fn(
    ({
      onClick,
      isOpen,
      initial,
    }: {
      onClick?: () => void;
      isOpen?: boolean;
      initial?: string;
    }) => (
      <button onClick={onClick} data-testid="avatar-button" data-open={isOpen}>
        {initial}
      </button>
    )
  ),
}));

vi.mock("../dropdown-menu", () => ({
  DropdownMenu: vi.fn(({ isOpen, children }: { isOpen?: boolean; children?: React.ReactNode }) =>
    isOpen ? <div data-testid="dropdown-menu">{children}</div> : null
  ),
}));

vi.mock("../user-info", () => ({
  UserInfo: vi.fn(({ name, email }: { name?: string; email?: string }) => (
    <div data-testid="user-info">
      {name} - {email}
    </div>
  )),
}));

vi.mock("../theme-toggle-menu-item", () => ({
  ThemeToggleMenuItem: vi.fn(() => <div data-testid="theme-toggle">Theme Toggle</div>),
}));

vi.mock("../language-selector-menu-item", () => ({
  LanguageSelectorMenuItem: vi.fn(() => (
    <div data-testid="language-selector">Language Selector</div>
  )),
}));

vi.mock("../dropdown-menu-item", () => ({
  DropdownMenuItem: vi.fn(
    ({
      href,
      onClick,
      children,
    }: {
      href?: string;
      onClick?: () => void;
      children?: React.ReactNode;
    }) => (
      <a href={href} onClick={onClick} data-testid={`menu-item-${children}`}>
        {children}
      </a>
    )
  ),
}));

vi.mock("../../../routes.config", () => ({
  ROUTES: {
    PROFILE: "/profile",
    TEAM: "/team",
    PAYMENTS: "/payments",
    HELP: "/help",
    LOGIN: "/login",
  },
}));

describe("UserDropdown", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render avatar button", () => {
    render(
      <TestWrapper>
        <UserDropdown />
      </TestWrapper>
    );
    expect(screen.getByTestId("avatar-button")).toBeInTheDocument();
  });

  it("should open dropdown when avatar is clicked", async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <UserDropdown />
      </TestWrapper>
    );
    const avatarButton = screen.getByTestId("avatar-button");
    await user.click(avatarButton);
    expect(screen.getByTestId("dropdown-menu")).toBeInTheDocument();
  });

  it("should render user info", async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <UserDropdown />
      </TestWrapper>
    );
    const avatarButton = screen.getByTestId("avatar-button");
    await user.click(avatarButton);
    expect(screen.getByTestId("user-info")).toBeInTheDocument();
  });

  it("should render menu items for main user", async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <UserDropdown />
      </TestWrapper>
    );
    const avatarButton = screen.getByTestId("avatar-button");
    await user.click(avatarButton);
    expect(screen.getByTestId("menu-item-Company Profile")).toBeInTheDocument();
    expect(screen.getByTestId("menu-item-Team")).toBeInTheDocument();
  });

  it("should call logout and navigate when logout is clicked", async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <UserDropdown />
      </TestWrapper>
    );
    const avatarButton = screen.getByTestId("avatar-button");
    await user.click(avatarButton);
    const logoutItem = screen.getByTestId("menu-item-Logout");
    await user.click(logoutItem);
    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalled();
  });

  it("should use custom name and email when provided", async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <UserDropdown name="Custom Name" email="custom@example.com" />
      </TestWrapper>
    );
    const avatarButton = screen.getByTestId("avatar-button");
    await user.click(avatarButton);
    expect(screen.getByText(/Custom Name/)).toBeInTheDocument();
    expect(screen.getByText(/custom@example.com/)).toBeInTheDocument();
  });

  it("should use custom initial when provided", () => {
    render(
      <TestWrapper>
        <UserDropdown initial="CN" />
      </TestWrapper>
    );
    const avatarButton = screen.getByTestId("avatar-button");
    expect(avatarButton).toHaveTextContent("CN");
  });

  it("should generate initials from name", () => {
    render(
      <TestWrapper>
        <UserDropdown name="John Doe" />
      </TestWrapper>
    );
    const avatarButton = screen.getByTestId("avatar-button");
    expect(avatarButton).toHaveTextContent("JD");
  });

  it("should generate initial from single name", () => {
    render(
      <TestWrapper>
        <UserDropdown name="John" />
      </TestWrapper>
    );
    const avatarButton = screen.getByTestId("avatar-button");
    expect(avatarButton).toHaveTextContent("J");
  });

  it("should use custom menu items when provided", async () => {
    const user = userEvent.setup();
    const customMenuItems = [
      { label: "Custom Item", href: "/custom" },
      { divider: true as const },
      { label: "Custom Action", onClick: vi.fn() as () => void },
    ];
    render(
      <TestWrapper>
        <UserDropdown menuItems={customMenuItems} />
      </TestWrapper>
    );
    const avatarButton = screen.getByTestId("avatar-button");
    await user.click(avatarButton);
    expect(screen.getByTestId("menu-item-Custom Item")).toBeInTheDocument();
    expect(screen.getByTestId("menu-item-Custom Action")).toBeInTheDocument();
  });
});
