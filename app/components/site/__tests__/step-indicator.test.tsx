import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StepIndicator } from "../step-indicator";

describe("StepIndicator", () => {
  it("should render correct number of steps", () => {
    render(<StepIndicator currentStep={2} totalSteps={5} />);
    const steps = screen.getAllByText(/^[1-5]$/);
    expect(steps).toHaveLength(5);
    // container is used implicitly by screen queries
  });

  it("should highlight current step and previous steps", () => {
    render(<StepIndicator currentStep={3} totalSteps={5} />);
    const step3 = screen.getByText("3");
    const step2 = screen.getByText("2");
    const step1 = screen.getByText("1");
    const step4 = screen.getByText("4");
    const step5 = screen.getByText("5");

    // Steps 1, 2, 3 should be active
    expect(step1.closest("div")).toHaveClass("bg-blue-500");
    expect(step2.closest("div")).toHaveClass("bg-blue-500");
    expect(step3.closest("div")).toHaveClass("bg-blue-500");

    // Steps 4, 5 should not be active
    expect(step4.closest("div")).toHaveClass("bg-gray-200");
    expect(step5.closest("div")).toHaveClass("bg-gray-200");
  });

  it("should render connectors between steps", () => {
    const { container } = render(<StepIndicator currentStep={2} totalSteps={4} />);
    // Should have 3 connectors for 4 steps
    const connectors = container.querySelectorAll(".w-16.h-1");
    expect(connectors).toHaveLength(3);
  });

  it("should highlight connectors for completed steps", () => {
    const { container } = render(<StepIndicator currentStep={3} totalSteps={5} />);
    const connectors = container.querySelectorAll(".w-16.h-1");

    // First two connectors (between 1-2 and 2-3) should be blue
    expect(connectors[0]).toHaveClass("bg-blue-500");
    expect(connectors[1]).toHaveClass("bg-blue-500");

    // Remaining connectors should be gray
    expect(connectors[2]).toHaveClass("bg-gray-200");
    expect(connectors[3]).toHaveClass("bg-gray-200");
  });

  it("should handle single step", () => {
    const { container } = render(<StepIndicator currentStep={1} totalSteps={1} />);
    const step = screen.getByText("1");
    expect(step).toBeInTheDocument();
    // No connectors for single step
    const connectors = container.querySelectorAll(".w-16.h-1");
    expect(connectors).toHaveLength(0);
  });

  it("should handle first step", () => {
    render(<StepIndicator currentStep={1} totalSteps={4} />);
    const step1 = screen.getByText("1");
    expect(step1.closest("div")).toHaveClass("bg-blue-500");

    const step2 = screen.getByText("2");
    expect(step2.closest("div")).toHaveClass("bg-gray-200");
  });

  it("should handle last step", () => {
    const { container } = render(<StepIndicator currentStep={4} totalSteps={4} />);
    const step4 = screen.getByText("4");
    expect(step4.closest("div")).toHaveClass("bg-blue-500");

    // All connectors should be blue
    const connectors = container.querySelectorAll(".w-16.h-1");
    connectors.forEach((connector) => {
      expect(connector).toHaveClass("bg-blue-500");
    });
  });

  it("should apply correct container classes", () => {
    const { container } = render(<StepIndicator currentStep={2} totalSteps={3} />);
    const wrapper = container.querySelector("div.flex.items-center.justify-center");
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass("mb-6");
  });
});
