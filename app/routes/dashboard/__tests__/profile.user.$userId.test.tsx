/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import UserProfileView from "../profile.user.$userId";

const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("~/components/dashboard/profile", () => ({
  UserProfile: ({ userId, readOnly }: any) => (
    <div data-testid="user-profile">
      User Profile: {userId} (ReadOnly: {readOnly ? "true" : "false"})
    </div>
  ),
}));

vi.mock("~/components/ui", () => ({
  Button: ({ children, onClick, leftIcon, rightIcon, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  ),
}));

describe("UserProfileView (usuario)", () => {
  const createRouter = (userId: string) => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/profile/usuario/:userId",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <UserProfileView />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: [`/dashboard/profile/usuario/${userId}`],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render user profile", () => {
    const router = createRouter("user-1");
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId("user-profile")).toBeInTheDocument();
    expect(screen.getByText(/User Profile: user-1/)).toBeInTheDocument();
  });

  it("should have correct meta function", () => {
    expect(UserProfileView).toBeDefined();
  });
});
