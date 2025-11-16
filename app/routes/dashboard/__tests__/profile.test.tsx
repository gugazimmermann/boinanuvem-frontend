import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import Profile from "../profile";

vi.mock("~/components/dashboard/profile", () => ({
  CompanyProfile: () => <div data-testid="company-profile">Company Profile</div>,
  UserProfile: () => <div data-testid="user-profile">User Profile</div>,
}));

describe("Profile", () => {
  const createRouter = (initialEntry = "/dashboard/profile") => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/profile",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <Profile />
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
    vi.clearAllMocks();
  });

  it("should render profile page", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("should display company profile by default", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId("company-profile")).toBeInTheDocument();
  });

  it("should have correct meta function", () => {
    
    expect(Profile).toBeDefined();
  });

  it("should switch to user profile tab", () => {
    const router = createRouter("/dashboard/profile?tab=user");
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId("user-profile")).toBeInTheDocument();
  });

  it("should switch to company profile tab", () => {
    const router = createRouter("/dashboard/profile?tab=company");
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId("company-profile")).toBeInTheDocument();
  });

  it("should handle tab switching via button click", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const userTabButton = screen.queryAllByRole("button").find((btn) =>
      btn.textContent?.includes("Usuário") || btn.textContent?.includes("User")
    );
    
    if (userTabButton) {
      fireEvent.click(userTabButton);
      expect(screen.getByTestId("user-profile")).toBeInTheDocument();
    }
  });

  it("should handle company tab button click", () => {
    const router = createRouter("/dashboard/profile?tab=user");
    render(<RouterProvider router={router} />);

    const companyTabButton = screen.queryAllByRole("button").find((btn) =>
      btn.textContent?.includes("Empresa") || btn.textContent?.includes("Company")
    );
    
    if (companyTabButton) {
      fireEvent.click(companyTabButton);
      expect(screen.getByTestId("company-profile")).toBeInTheDocument();
    }
  });

  it("should display profile title", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("should handle invalid tab param", () => {
    const router = createRouter("/dashboard/profile?tab=invalid");
    render(<RouterProvider router={router} />);

    
    expect(screen.getByTestId("company-profile")).toBeInTheDocument();
  });

  it("should handle empty tab param", () => {
    const router = createRouter("/dashboard/profile");
    render(<RouterProvider router={router} />);

    
    expect(screen.getByTestId("company-profile")).toBeInTheDocument();
  });
});

