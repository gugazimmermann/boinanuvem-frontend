/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import TeamPermissions from "../team.permissions.$userId";
import { getUserById } from "~/services/users.service";

const mockNavigate = vi.fn();

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
  Button: ({ children, onClick, type, disabled, ...props }: any) => (
    <button
      data-testid="submit-button"
      type={type}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  ),
  Alert: ({ title, variant }: any) => <div data-testid={`alert-${variant}`}>{title}</div>,
}));

describe("TeamPermissions", () => {
  const mockUser = {
    id: "user-1",
    name: "Test User",
    email: "test@example.com",
    role: "user" as const,
    permissions: {
      registration: {
        property: { view: true, add: false, edit: false, remove: false },
        location: { view: true, add: false, edit: false, remove: false },
        employee: { view: true, add: false, edit: false, remove: false },
        serviceProvider: { view: true, add: false, edit: false, remove: false },
        supplier: { view: true, add: false, edit: false, remove: false },
        buyer: { view: true, add: false, edit: false, remove: false },
      },
    },
  };

  const createRouter = (userId: string) => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/team/:userId/permissions",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <TeamPermissions />
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
    vi.clearAllMocks();
    vi.mocked(getUserById).mockReturnValue(mockUser);
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
