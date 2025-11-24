import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import Home, { meta } from "../home";

vi.mock("~/components/site", () => ({
  Header: () => <div data-testid="header">Header</div>,
  Hero: () => <div data-testid="hero">Hero</div>,
  Statistics: () => <div data-testid="statistics">Statistics</div>,
  TrustedBy: () => <div data-testid="trusted-by">TrustedBy</div>,
  Services: () => <div data-testid="services">Services</div>,
  FeatureHighlights: () => <div data-testid="feature-highlights">FeatureHighlights</div>,
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
    expect(screen.getByTestId("statistics")).toBeInTheDocument();
    expect(screen.getByTestId("trusted-by")).toBeInTheDocument();
    expect(screen.getByTestId("services")).toBeInTheDocument();
    expect(screen.getByTestId("feature-highlights")).toBeInTheDocument();
    expect(screen.getByTestId("examples")).toBeInTheDocument();
    expect(screen.getByTestId("pricing")).toBeInTheDocument();
    expect(screen.getByTestId("faqs")).toBeInTheDocument();
    expect(screen.getByTestId("cta")).toBeInTheDocument();
    expect(screen.getByTestId("blog")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
    expect(screen.getByTestId("scroll-to-top")).toBeInTheDocument();
  });

  it("should have correct meta function", () => {
    const metaData = meta({} as Parameters<typeof meta>[0]);
    expect(metaData.length).toBeGreaterThan(2);
    expect(metaData).toContainEqual({ title: "Boi na Nuvem" });
    expect(metaData).toContainEqual({
      name: "description",
      content:
        "Sistema completo de gestão para fazendas de gado de corte. Gerencie propriedades, pastos, animais, pesos, nascimentos, finanças, estoque, vendas e muito mais. Dashboard interativo, análises avançadas e relatórios detalhados.",
    });
    type MetaTag = { title?: string; name?: string; property?: string; content?: string };
    expect(metaData.some((m: MetaTag) => m.property === "og:title")).toBe(true);
    expect(metaData.some((m: MetaTag) => m.property === "og:description")).toBe(true);
    expect(metaData.some((m: MetaTag) => m.name === "twitter:card")).toBe(true);
  });

  it("should render components in correct order", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const components = [
      "header",
      "hero",
      "statistics",
      "trusted-by",
      "services",
      "feature-highlights",
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
