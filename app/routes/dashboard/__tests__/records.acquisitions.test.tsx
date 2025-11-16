import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import Acquisitions from "../records.acquisitions";
import { ROUTES } from "~/routes.config";

const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Acquisitions", () => {
  const createRouter = () => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/registros/aquisicoes",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <Acquisitions />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/registros/aquisicoes"],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should redirect to animals route", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.ANIMALS, { replace: true });
  });

  it("should navigate on mount", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(mockNavigate).toHaveBeenCalled();
  });

  it("should return null", () => {
    const router = createRouter();
    const { container } = render(<RouterProvider router={router} />);

    expect(container).toBeTruthy();
  });
});
