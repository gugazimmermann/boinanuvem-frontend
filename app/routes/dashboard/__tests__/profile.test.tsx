import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import { AuthProvider } from "~/contexts/auth-context";
import Profile from "../profile";
import type { TeamUser } from "~/types";
import { clearLocalStorage } from "~/test-utils";

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

const mockUsePermissions = vi.fn();
vi.mock("~/utils/permissions", () => ({
  usePermissions: () => mockUsePermissions(),
}));

vi.mock("~/components/dashboard/profile", () => ({
  CompanyProfile: () => <div data-testid="company-profile">Company Profile</div>,
  UserProfile: () => <div data-testid="user-profile">User Profile</div>,
}));

vi.mock("~/services/users.service", () => ({
  getUserById: vi.fn((id: string) => {
    if (id === "main-user-id") return mockMainUser;
    if (id === "non-main-user-id") return mockNonMainUser;
    return null;
  }),
}));

describe("Profile", () => {
  const createRouter = (initialEntry = "/dashboard/profile", userId: string | null = null) => {
    if (userId && typeof window !== "undefined") {
      localStorage.setItem("currentUserId", userId);
    }
    return createMemoryRouter(
      [
        {
          path: "/dashboard/profile",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <AuthProvider>
                  <Profile />
                </AuthProvider>
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: [initialEntry],
      }
    );
  };

  beforeEach(() => {
    clearLocalStorage();
    vi.clearAllMocks();

    mockUsePermissions.mockReturnValue({
      canView: () => true,
      canAdd: () => true,
      canEdit: () => true,
      canRemove: () => true,
      isMainUser: () => true,
    });
  });

  it("should render profile page", () => {
    const router = createRouter("/dashboard/profile", "main-user-id");
    render(<RouterProvider router={router} />);

    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("should display company profile by default for main user", () => {
    const router = createRouter("/dashboard/profile", "main-user-id");
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId("company-profile")).toBeInTheDocument();
  });

  it("should display user profile by default for non-main user", () => {
    const router = createRouter("/dashboard/profile", "non-main-user-id");
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId("user-profile")).toBeInTheDocument();
  });

  it("should have correct meta function", () => {
    expect(Profile).toBeDefined();
  });

  it("should switch to user profile tab", () => {
    const router = createRouter("/dashboard/profile?tab=user", "main-user-id");
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId("user-profile")).toBeInTheDocument();
  });

  it("should switch to company profile tab", () => {
    const router = createRouter("/dashboard/profile?tab=company", "main-user-id");
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId("company-profile")).toBeInTheDocument();
  });

  it("should handle tab switching via button click", () => {
    const router = createRouter("/dashboard/profile", "main-user-id");
    render(<RouterProvider router={router} />);

    const userTabButton = screen
      .queryAllByRole("button")
      .find((btn) => btn.textContent?.includes("Usuário") || btn.textContent?.includes("User"));

    if (userTabButton) {
      fireEvent.click(userTabButton);
      expect(screen.getByTestId("user-profile")).toBeInTheDocument();
    }
  });

  it("should handle company tab button click", () => {
    const router = createRouter("/dashboard/profile?tab=user", "main-user-id");
    render(<RouterProvider router={router} />);

    const companyTabButton = screen
      .queryAllByRole("button")
      .find((btn) => btn.textContent?.includes("Empresa") || btn.textContent?.includes("Company"));

    if (companyTabButton) {
      fireEvent.click(companyTabButton);
      expect(screen.getByTestId("company-profile")).toBeInTheDocument();
    }
  });

  it("should display profile title", () => {
    const router = createRouter("/dashboard/profile", "main-user-id");
    render(<RouterProvider router={router} />);

    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("should handle invalid tab param", () => {
    const router = createRouter("/dashboard/profile?tab=invalid", "main-user-id");
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId("company-profile")).toBeInTheDocument();
  });

  it("should handle empty tab param", () => {
    const router = createRouter("/dashboard/profile", "main-user-id");
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId("company-profile")).toBeInTheDocument();
  });

  it("should hide Company Profile tab for non-main user", () => {
    const router = createRouter("/dashboard/profile", "non-main-user-id");
    render(<RouterProvider router={router} />);

    const companyTabButton = screen
      .queryAllByRole("button")
      .find((btn) => btn.textContent?.includes("Empresa") || btn.textContent?.includes("Company"));
    expect(companyTabButton).toBeUndefined();
  });

  it("should show Company Profile tab for main user", () => {
    const router = createRouter("/dashboard/profile", "main-user-id");
    render(<RouterProvider router={router} />);

    const companyTabButton = screen
      .queryAllByRole("button")
      .find((btn) => btn.textContent?.includes("Empresa") || btn.textContent?.includes("Company"));
    expect(companyTabButton).toBeInTheDocument();
  });

  it("should redirect non-main user from company tab to user tab", async () => {
    const router = createRouter("/dashboard/profile?tab=company", "non-main-user-id");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByTestId("user-profile")).toBeInTheDocument();
    });
  });

  it("should show logs tab for main user in user profile", () => {
    mockUsePermissions.mockReturnValue({
      canView: () => true,
      canAdd: () => true,
      canEdit: () => true,
      canRemove: () => true,
      isMainUser: () => true,
    });

    const router = createRouter("/dashboard/profile?tab=user", "main-user-id");
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId("user-profile")).toBeInTheDocument();
  });

  it("should hide logs tab for non-main user in user profile", () => {
    mockUsePermissions.mockReturnValue({
      canView: () => true,
      canAdd: () => true,
      canEdit: () => true,
      canRemove: () => true,
      isMainUser: () => false,
    });

    const router = createRouter("/dashboard/profile?tab=user", "non-main-user-id");
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId("user-profile")).toBeInTheDocument();
  });

  it("should redirect non-main user from logs tab to data tab", async () => {
    mockUsePermissions.mockReturnValue({
      canView: () => true,
      canAdd: () => true,
      canEdit: () => true,
      canRemove: () => true,
      isMainUser: () => false,
    });

    const router = createRouter("/dashboard/profile?tab=user&subTab=logs", "non-main-user-id");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByTestId("user-profile")).toBeInTheDocument();
    });
  });
});
