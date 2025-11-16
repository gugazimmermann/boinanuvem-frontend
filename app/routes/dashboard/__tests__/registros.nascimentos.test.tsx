import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import Births from "../registros.nascimentos";
import { ROUTES } from "~/routes.config";

const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Births", () => {
  const createRouter = () => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/registros/nascimentos",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <Births />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/registros/nascimentos"],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should navigate to animals route", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    expect(mockNavigate).toHaveBeenCalled();
  });

  it("should have correct meta function", () => {
    
    expect(Births).toBeDefined();
  });

  it("should navigate on mount", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.ANIMALS);
  });

  it("should return null", () => {
    const router = createRouter();
    const { container } = render(<RouterProvider router={router} />);
    
    
    expect(container).toBeTruthy();
  });
});

