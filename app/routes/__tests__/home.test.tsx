import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { loader, meta, links, default as Home } from "../home";
import { fetchPlans } from "~/services/plans.service";
import type { Plan } from "~/types/plan";

vi.mock("~/services/plans.service", () => ({
  fetchPlans: vi.fn(),
}));

vi.mock("~/components/site", () => ({
  Header: vi.fn(() => <div data-testid="header">Header</div>),
  Hero: vi.fn(() => <div data-testid="hero">Hero</div>),
  Statistics: vi.fn(() => <div data-testid="statistics">Statistics</div>),
  TrustedBy: vi.fn(() => <div data-testid="trusted-by">TrustedBy</div>),
  Services: vi.fn(() => <div data-testid="services">Services</div>),
  FeatureHighlights: vi.fn(() => <div data-testid="feature-highlights">FeatureHighlights</div>),
  Examples: vi.fn(() => <div data-testid="examples">Examples</div>),
  Pricing: vi.fn(({ plans }: { plans: Plan[] }) => (
    <div data-testid="pricing">Pricing: {plans.length} plans</div>
  )),
  FAQs: vi.fn(() => <div data-testid="faqs">FAQs</div>),
  Cta: vi.fn(() => <div data-testid="cta">Cta</div>),
  Blog: vi.fn(() => <div data-testid="blog">Blog</div>),
  Footer: vi.fn(() => <div data-testid="footer">Footer</div>),
  ScrollToTop: vi.fn(() => <div data-testid="scroll-to-top">ScrollToTop</div>),
}));

const mockPlans: Plan[] = [
  {
    id: "plan-1",
    name: "Basic Plan",
    description: "Basic plan description",
    monthlyPrice: "100",
    annualPrice: "1000",
    limits: {
      properties: "1",
      locations: "10",
      animals: "100",
      members: "1",
    },
    features: [],
    popular: false,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("home", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loader", () => {
    it("should fetch and return plans", async () => {
      vi.mocked(fetchPlans).mockResolvedValue(mockPlans);

      const result = await loader();

      expect(fetchPlans).toHaveBeenCalledWith({ status: "active" });
      expect(result).toEqual({ plans: mockPlans });
    });

    it("should handle fetch error and throw", async () => {
      const error = new Error("Network error");
      vi.mocked(fetchPlans).mockRejectedValue(error);

      await expect(loader()).rejects.toThrow(
        "Failed to load pricing plans. Please try again later."
      );
      expect(console.error).toHaveBeenCalledWith("Failed to load plans:", error);
    });
  });

  describe("meta", () => {
    it("should return SEO meta tags", () => {
      const result = meta({} as never);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should include correct title", () => {
      const result = meta({} as never);
      const titleTag = result.find((tag) => "title" in tag);
      expect(titleTag).toBeDefined();
      if (titleTag && "title" in titleTag) {
        expect(titleTag.title).toContain("Boi na Nuvem");
      }
    });
  });

  describe("links", () => {
    it("should return canonical link", () => {
      const result = links();
      expect(result).toHaveLength(1);
      expect(result[0].rel).toBe("canonical");
      expect(result[0].href).toBe("https://boinanuvem.com.br/");
    });
  });

  describe("Home component", () => {
    it("should render all site components", () => {
      render(
        <TestWrapper>
          <Home loaderData={{ plans: mockPlans }} params={{}} matches={[] as never} />
        </TestWrapper>
      );

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

    it("should pass plans to Pricing component", () => {
      render(
        <TestWrapper>
          <Home loaderData={{ plans: mockPlans }} params={{}} matches={[] as never} />
        </TestWrapper>
      );

      expect(screen.getByText("Pricing: 1 plans")).toBeInTheDocument();
    });

    it("should include structured data script", () => {
      const { container } = render(
        <TestWrapper>
          <Home loaderData={{ plans: mockPlans }} params={{}} matches={[] as never} />
        </TestWrapper>
      );

      const script = container.querySelector('script[type="application/ld+json"]');
      expect(script).toBeInTheDocument();
      if (script) {
        const data = JSON.parse(script.textContent || "{}");
        expect(data["@context"]).toBe("https://schema.org");
        expect(data["@graph"]).toBeDefined();
      }
    });

    it("should render with empty plans array", () => {
      render(
        <TestWrapper>
          <Home loaderData={{ plans: [] }} params={{}} matches={[] as never} />
        </TestWrapper>
      );

      expect(screen.getByText("Pricing: 0 plans")).toBeInTheDocument();
    });
  });
});
