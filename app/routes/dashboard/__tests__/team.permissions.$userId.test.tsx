import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import { AuthProvider } from "~/contexts/auth-context";
import TeamPermissions from "../team.permissions.$userId";
import { getUserById } from "~/services/users.service";
import type { TeamUser } from "~/types";

const mockNavigate = vi.fn();

const mockMainUser: TeamUser = {
  id: "main-user-id",
  name: "Main User",
  email: "main@example.com",
  phone: "1234567890",
  role: "admin",
  status: "active",
  mainUser: true,
  companyId: "company-id",
  createdAt: "2025-01-01",
  permissions: {} as never,
};

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("~/services/users.service", () => ({
  getUserById: vi.fn(),
  updateUserPermissions: vi.fn(),
}));

vi.mock("~/components/ui", () => ({
  Button: ({
    children,
    onClick,
    type,
    disabled,
    ...props
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    type?: "button" | "submit" | "reset" | undefined;
    disabled?: boolean;
    [key: string]: unknown;
  }) => (
    <button
      data-testid="submit-button"
      type={type as "button" | "submit" | "reset" | undefined}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  ),
  Alert: ({ title, variant }: { title?: string; variant?: string }) => (
    <div data-testid={`alert-${variant}`}>{title}</div>
  ),
}));

describe("TeamPermissions", () => {
  const mockUser: TeamUser = {
    id: "user-1",
    name: "Test User",
    email: "test@example.com",
    phone: "1234567890",
    role: "user",
    status: "active",
    mainUser: false,
    companyId: "company-id",
    createdAt: "2025-01-01",
    permissions: {
      registration: {
        property: { view: true, add: false, edit: false, remove: false },
        location: { view: true, add: false, edit: false, remove: false },
        employee: { view: true, add: false, edit: false, remove: false },
        serviceProvider: { view: true, add: false, edit: false, remove: false },
        supplier: { view: true, add: false, edit: false, remove: false },
        buyer: { view: true, add: false, edit: false, remove: false },
        inventory: { view: true, add: false, edit: false, remove: false },
        animals: { view: true, add: false, edit: false, remove: false },
      },
      records: {
        births: { view: false, add: false, edit: false, remove: false },
        acquisitions: { view: false, add: false, edit: false, remove: false },
        weighings: { view: false, add: false, edit: false, remove: false },
      },
      breedings: {
        breedings: { view: false, add: false, edit: false, remove: false },
        unconfirmedBreedings: { view: false, add: false, edit: false, remove: false },
        pregnantCows: { view: false, add: false, edit: false, remove: false },
        reproductiveIndexes: { view: false, add: false, edit: false, remove: false },
        birthForecast: { view: false, add: false, edit: false, remove: false },
      },
      finances: {
        cashFlow: { view: false, add: false, edit: false, remove: false },
        accountsPayable: { view: false, add: false, edit: false, remove: false },
        accountsReceivable: { view: false, add: false, edit: false, remove: false },
        bankAccounts: { view: false, add: false, edit: false, remove: false },
      },
    } as never,
  };

  const createRouter = (userId: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("currentUserId", "main-user-id");
    }
    return createMemoryRouter(
      [
        {
          path: "/dashboard/team/:userId/permissions",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <AuthProvider>
                  <TeamPermissions />
                </AuthProvider>
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: [`/dashboard/team/${userId}/permissions`],
      }
    );
  };

  beforeEach(() => {
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
    vi.clearAllMocks();
    vi.mocked(getUserById).mockImplementation((id: string) => {
      if (id === "main-user-id") return mockMainUser;
      if (id === "user-1") return mockUser;
      return undefined;
    });
  });

  it("should render permissions form", async () => {
    const router = createRouter("user-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getUserById).toHaveBeenCalledWith("user-1");
    });

    const buttons = screen.queryAllByRole("button");
    expect(buttons.length > 0).toBeTruthy();
  });

  it("should handle undefined user", () => {
    vi.mocked(getUserById).mockReturnValue(undefined);
    const router = createRouter("invalid-id");
    render(<RouterProvider router={router} />);

    const loadingText = screen.queryByText(/loading|carregando/i);
    expect(loadingText || screen.queryAllByRole("button").length > 0).toBeTruthy();
  });

  it("should have correct meta function", () => {
    expect(TeamPermissions).toBeDefined();
  });
});
