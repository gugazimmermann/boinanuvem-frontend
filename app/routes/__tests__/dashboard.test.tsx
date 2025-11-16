import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import DashboardLayoutRoute from "../dashboard";

vi.mock("~/components/dashboard", () => ({
  DashboardLayout: () => <div data-testid="dashboard-layout">DashboardLayout</div>,
}));

describe("DashboardLayoutRoute", () => {
  const createRouter = () => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <DashboardLayoutRoute />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: ["/dashboard"],
      }
    );
  };

  it("should render dashboard layout", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId("dashboard-layout")).toBeInTheDocument();
  });
});
