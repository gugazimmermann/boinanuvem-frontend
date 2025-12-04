import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BreedingMethodBadge } from "../breeding-method-badge";
import { LanguageProvider } from "~/contexts/language-context";

vi.mock("~/utils/breeding", () => ({
  getBreedingMethodLabel: vi.fn((method: string, _t: unknown) => {
    if (method === "natural") return "Natural";
    if (method === "artificial_insemination") return "Artificial Insemination";
    return "Unknown";
  }),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

describe("BreedingMethodBadge", () => {
  it("should render natural method label", () => {
    render(
      <TestWrapper>
        <BreedingMethodBadge method="natural" />
      </TestWrapper>
    );
    expect(screen.getByText("Natural")).toBeInTheDocument();
  });

  it("should render artificial insemination method label", () => {
    render(
      <TestWrapper>
        <BreedingMethodBadge method="artificial_insemination" />
      </TestWrapper>
    );
    expect(screen.getByText("Artificial Insemination")).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <TestWrapper>
        <BreedingMethodBadge method="natural" className="custom-class" />
      </TestWrapper>
    );
    const span = container.querySelector("span");
    expect(span).toHaveClass("custom-class");
  });

  it("should render with default className when not provided", () => {
    const { container } = render(
      <TestWrapper>
        <BreedingMethodBadge method="natural" />
      </TestWrapper>
    );
    const span = container.querySelector("span");
    expect(span).toHaveClass("text-gray-700");
    expect(span).toHaveClass("dark:text-gray-300");
  });

  it("should render with correct styling classes", () => {
    const { container } = render(
      <TestWrapper>
        <BreedingMethodBadge method="natural" />
      </TestWrapper>
    );
    const span = container.querySelector("span");
    expect(span).toHaveClass("text-gray-700");
    expect(span).toHaveClass("dark:text-gray-300");
  });
});
