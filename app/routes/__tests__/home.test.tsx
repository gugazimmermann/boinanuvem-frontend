import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import Home, { meta } from "../home";

vi.mock("~/components/site", () => ({
  Header: () => <div data-testid="header">Header</div>,
  Hero: () => <div data-testid="hero">Hero</div>,
  TrustedBy: () => <div data-testid="trusted-by">TrustedBy</div>,
  Services: () => <div data-testid="services">Services</div>,
  Examples: () => <div data-testid="examples">Examples</div>,
  Pricing: () => <div data-testid="pricing">Pricing</div>,
  FAQs: () => <div data-testid="faqs">FAQs</div>,
  CTA: () => <div data-testid="cta">CTA</div>,
  Blog: () => <div data-testid="blog">Blog</div>,
  Footer: () => <div data-testid="footer">Footer</div>,
  ScrollToTop: () => <div data-testid="scroll-to-top">ScrollToTop</div>,
}));

describe("Home", () => {
  const createRouter = () => {
    return createMemoryRouter(
      [
        {
          path: "/",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <Home />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: ["/"],
      }
    );
  };

  it("should render all home page components", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("hero")).toBeInTheDocument();
    expect(screen.getByTestId("trusted-by")).toBeInTheDocument();
    expect(screen.getByTestId("services")).toBeInTheDocument();
    expect(screen.getByTestId("examples")).toBeInTheDocument();
    expect(screen.getByTestId("pricing")).toBeInTheDocument();
    expect(screen.getByTestId("faqs")).toBeInTheDocument();
    expect(screen.getByTestId("cta")).toBeInTheDocument();
    expect(screen.getByTestId("blog")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
    expect(screen.getByTestId("scroll-to-top")).toBeInTheDocument();
  });

  it("should have correct meta function", () => {
    const metaData = meta({} as any);
    expect(metaData).toHaveLength(2);
    expect(metaData[0]).toEqual({ title: "Boi na Nuvem" });
    expect(metaData[1]).toEqual({
      name: "description",
      content:
        "Boi na Nuvem - Sistema completo de gestão para fazendas de gado de corte. Gerencie propriedades, pastos, animais, pesos, nascimentos e muito mais.",
    });
  });

  it("should render components in correct order", () => {
    const router = createRouter();
    const { container } = render(<RouterProvider router={router} />);

    const components = [
      "header",
      "hero",
      "trusted-by",
      "services",
      "examples",
      "pricing",
      "faqs",
      "cta",
      "blog",
      "footer",
      "scroll-to-top",
    ];

    components.forEach((testId) => {
      expect(screen.getByTestId(testId)).toBeInTheDocument();
    });
  });

  it("should have min-h-screen class on main container", () => {
    const router = createRouter();
    const { container } = render(<RouterProvider router={router} />);

    const mainDiv = container.querySelector("div.min-h-screen");
    expect(mainDiv).toBeInTheDocument();
  });

  it("should have bg-white class on main container", () => {
    const router = createRouter();
    const { container } = render(<RouterProvider router={router} />);

    const mainDiv = container.querySelector("div.bg-white");
    expect(mainDiv).toBeInTheDocument();
  });
});

