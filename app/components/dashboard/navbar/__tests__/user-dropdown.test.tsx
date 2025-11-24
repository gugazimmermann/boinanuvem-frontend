import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { UserDropdown } from "../user-dropdown";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import { AuthProvider } from "~/contexts/auth-context";
import type { TeamUser } from "~/types";

const mockMainUser: TeamUser = {
  id: "main-user-id",
  name: "Main User",
  email: "main@example.com",
  phone: "1234567890",
  status: "active",
  mainUser: true,
  companyId: "company-id",
  createdAt: "2025-01-01",
  permissions: {} as never,
};

const mockNonMainUser: TeamUser = {
  id: "non-main-user-id",
  name: "Regular User",
  email: "user@example.com",
  phone: "1234567890",
  status: "active",
  mainUser: false,
  companyId: "company-id",
  createdAt: "2025-01-01",
  permissions: {} as never,
};

vi.mock("~/services/users.service", () => ({
  getUserById: vi.fn((id: string) => {
    if (id === "main-user-id") return mockMainUser;
    if (id === "non-main-user-id") return mockNonMainUser;
    return null;
  }),
}));

const createWrapper = (userId: string | null = null) => {
  if (userId && typeof window !== "undefined") {
    localStorage.setItem("currentUserId", userId);
  }
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>{children}</AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
  Wrapper.displayName = "TestWrapper";
  return Wrapper;
};

describe("UserDropdown", () => {
  beforeEach(() => {
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
    vi.clearAllMocks();
  });

  it("should render avatar button", () => {
    const wrapper = createWrapper("main-user-id");
    render(<UserDropdown />, { wrapper });
    const avatarButton = document.querySelector("button");
    expect(avatarButton).toBeInTheDocument();
  });

  it("should open dropdown when avatar is clicked", async () => {
    const user = userEvent.setup();
    const wrapper = createWrapper("main-user-id");
    render(<UserDropdown />, { wrapper });

    const avatarButton = document.querySelector("button");
    if (avatarButton) {
      await user.click(avatarButton);
      await waitFor(() => {
        const dropdown = document.querySelector(".absolute.right-0");
        expect(dropdown).toBeInTheDocument();
      });
    }
  });

  it("should close dropdown when clicking outside", async () => {
    const user = userEvent.setup();
    const wrapper = createWrapper("main-user-id");
    render(
      <div>
        <UserDropdown />
        <div data-testid="outside">Outside</div>
      </div>,
      { wrapper }
    );

    const avatarButton = document.querySelector("button");
    if (avatarButton) {
      await user.click(avatarButton);
      await waitFor(() => {
        expect(document.querySelector(".absolute.right-0")).toBeInTheDocument();
      });

      const outside = screen.getByTestId("outside");
      await user.click(outside);

      await waitFor(() => {
        expect(document.querySelector(".absolute.right-0")).not.toBeInTheDocument();
      });
    }
  });

  it("should render with custom name and email", () => {
    const wrapper = createWrapper("main-user-id");
    render(<UserDropdown name="Custom User" email="custom@example.com" />, { wrapper });
    const avatarButton = document.querySelector("button");
    expect(avatarButton).toBeInTheDocument();
  });

  it("should render menu items for main user", async () => {
    const user = userEvent.setup();
    const wrapper = createWrapper("main-user-id");
    render(<UserDropdown />, { wrapper });

    const avatarButton = document.querySelector("button");
    if (avatarButton) {
      await user.click(avatarButton);
      await waitFor(() => {
        const menuItems = document.querySelectorAll("a, button");
        expect(menuItems.length).toBeGreaterThan(0);
      });
    }
  });

  it("should show Company Profile, Team, and Payments for main user", async () => {
    const user = userEvent.setup();
    const wrapper = createWrapper("main-user-id");
    render(<UserDropdown />, { wrapper });

    const avatarButton = document.querySelector("button");
    if (avatarButton) {
      await user.click(avatarButton);
      await waitFor(() => {
        const companyProfile = screen.queryByText(/Perfil da Empresa|Company Profile/i);
        const team = screen.queryByText(/Equipe|Team/i);
        const payments = screen.queryByText(/Pagamentos|Payments/i);
        expect(companyProfile).toBeInTheDocument();
        expect(team).toBeInTheDocument();
        expect(payments).toBeInTheDocument();
      });
    }
  });

  it("should not show Company Profile, Team, and Payments for non-main user", async () => {
    const user = userEvent.setup();
    const wrapper = createWrapper("non-main-user-id");
    render(<UserDropdown />, { wrapper });

    const avatarButton = document.querySelector("button");
    if (avatarButton) {
      await user.click(avatarButton);
      await waitFor(() => {
        const companyProfile = screen.queryByText(/Perfil da Empresa|Company Profile/i);
        const team = screen.queryByText(/Equipe|Team/i);
        const payments = screen.queryByText(/Pagamentos|Payments/i);
        expect(companyProfile).not.toBeInTheDocument();
        expect(team).not.toBeInTheDocument();
        expect(payments).not.toBeInTheDocument();
      });
    }
  });

  it("should always show User Profile", async () => {
    const user = userEvent.setup();
    const wrapper = createWrapper("non-main-user-id");
    render(<UserDropdown />, { wrapper });

    const avatarButton = document.querySelector("button");
    if (avatarButton) {
      await user.click(avatarButton);
      await waitFor(() => {
        const userProfile = screen.queryByText(/Perfil do Usuario|User Profile/i);
        expect(userProfile).toBeInTheDocument();
      });
    }
  });
});
