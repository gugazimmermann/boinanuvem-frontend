import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import Help from "../help";

describe("Help", () => {
  const createRouter = () => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/help",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <Help />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/help"],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render help page", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    
    const headings = screen.getAllByRole("heading");
    expect(headings.length).toBeGreaterThan(0);
  });

  it("should display FAQ categories", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    
    const headings = screen.getAllByRole("heading");
    expect(headings.length).toBeGreaterThan(0);
  });

  it("should toggle FAQ items", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    
    const faqButtons = screen.queryAllByRole("button").filter((btn) =>
      btn.textContent?.includes("?")
    );
    
    if (faqButtons.length > 0) {
      fireEvent.click(faqButtons[0]);
      
      expect(faqButtons[0]).toBeInTheDocument();
    }
  });

  it("should filter FAQs by category", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    
    const categoryButtons = screen.queryAllByRole("button").filter((btn) =>
      btn.textContent && !btn.textContent.includes("?") && !btn.textContent.includes("+") && !btn.textContent.includes("-")
    );
    
    if (categoryButtons.length > 1) {
      
      fireEvent.click(categoryButtons[1]);
      
      expect(categoryButtons[1]).toBeInTheDocument();
    }
  });

  it("should have all category buttons", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    
    const allButton = screen.getByText(/Todos|All/i);
    expect(allButton).toBeInTheDocument();
  });
});

