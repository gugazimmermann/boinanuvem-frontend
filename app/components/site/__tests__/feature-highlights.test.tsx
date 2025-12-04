import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FeatureHighlights } from "../feature-highlights";
import { FEATURE_HIGHLIGHTS } from "../constants";

describe("FeatureHighlights", () => {
  it("should render all feature highlights", () => {
    render(<FeatureHighlights />);

    FEATURE_HIGHLIGHTS.forEach((feature) => {
      expect(screen.getByText(feature.title)).toBeInTheDocument();
      expect(screen.getByText(feature.description)).toBeInTheDocument();
      expect(screen.getByText(feature.icon)).toBeInTheDocument();
    });
  });

  it("should render heading", () => {
    render(<FeatureHighlights />);
    expect(screen.getByText(/Funcionalidades/)).toBeInTheDocument();
    expect(screen.getByText(/Principais/)).toBeInTheDocument();
  });

  it("should render description", () => {
    render(<FeatureHighlights />);
    expect(screen.getByText(/Descubra as principais áreas de gestão/)).toBeInTheDocument();
  });

  it("should apply alternating styles for even/odd items", () => {
    const { container } = render(<FeatureHighlights />);
    const features = container.querySelectorAll(".p-6.lg\\:p-8");

    // First item (index 0, even) should have white background
    expect(features[0]).toHaveClass("bg-white");

    // Second item (index 1, odd) should have gray background
    expect(features[1]).toHaveClass("bg-gray-50");
  });

  it("should apply correct grid classes", () => {
    const { container } = render(<FeatureHighlights />);
    const grid = container.querySelector(".grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3");
    expect(grid).toBeInTheDocument();
  });
});
