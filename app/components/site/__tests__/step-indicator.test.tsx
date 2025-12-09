import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StepIndicator } from "../step-indicator";

describe("StepIndicator", () => {
  it("should render correct number of steps", () => {
    render(<StepIndicator currentStep={1} totalSteps={3} />);
    const steps = screen.getAllByText(/^[1-3]$/);
    expect(steps.length).toBe(3);
  });

  it("should mark steps as active up to currentStep", () => {
    const { container } = render(<StepIndicator currentStep={2} totalSteps={4} />);
    // Find the actual step circle divs - they have w-8 h-8 classes
    const allSteps = Array.from(container.querySelectorAll(".w-8.h-8"));
    expect(allSteps.length).toBe(4);
    // Steps 1 and 2 should be active (currentStep is 2, so steps <= 2 are active)
    expect(allSteps[0]).toHaveClass("bg-blue-500", "dark:bg-blue-600", "text-white");
    expect(allSteps[1]).toHaveClass("bg-blue-500", "dark:bg-blue-600", "text-white");
    // Steps 3 and 4 should be inactive
    expect(allSteps[2]).toHaveClass(
      "bg-gray-200",
      "dark:bg-gray-700",
      "text-gray-500",
      "dark:text-gray-400"
    );
    expect(allSteps[3]).toHaveClass(
      "bg-gray-200",
      "dark:bg-gray-700",
      "text-gray-500",
      "dark:text-gray-400"
    );
  });

  it("should render connectors between steps", () => {
    render(<StepIndicator currentStep={2} totalSteps={3} />);
    const connectors = screen
      .getAllByRole("generic")
      .filter((el) => el.className.includes("w-16") && el.className.includes("h-1"));
    expect(connectors.length).toBe(2);
  });

  it("should mark connectors as active for completed steps", () => {
    const { container } = render(<StepIndicator currentStep={3} totalSteps={4} />);
    // Find all connector divs (they have w-16 h-1 classes)
    const connectors = Array.from(container.querySelectorAll(".w-16.h-1"));
    expect(connectors.length).toBe(3);
    // When currentStep is 3, connectors before step 3 (connectors 0, 1, 2) should be active
    // Connector 0 is between step 1 and 2, connector 1 is between step 2 and 3, connector 2 is between step 3 and 4
    // Since currentStep is 3, steps 1, 2, and 3 are completed, so connectors 0, 1 should be active
    // Actually, looking at the component: step < currentStep means the connector is active
    // So connector 0 (between 1-2) is active if 1 < 3, connector 1 (between 2-3) is active if 2 < 3
    // Connector 2 (between 3-4) is inactive because 3 is not < 3
    expect(connectors[0]).toHaveClass("bg-blue-500", "dark:bg-blue-600");
    expect(connectors[1]).toHaveClass("bg-blue-500", "dark:bg-blue-600");
    // Connector 2 should be inactive because step 3 is not < currentStep (they're equal)
    expect(connectors[2]).toHaveClass("bg-gray-200", "dark:bg-gray-700");
  });

  it("should mark connectors as inactive for future steps", () => {
    render(<StepIndicator currentStep={1} totalSteps={3} />);
    const connectors = screen
      .getAllByRole("generic")
      .filter((el) => el.className.includes("w-16") && el.className.includes("h-1"));
    expect(connectors[0]).toHaveClass("bg-gray-200", "dark:bg-gray-700");
    expect(connectors[1]).toHaveClass("bg-gray-200", "dark:bg-gray-700");
  });

  it("should handle single step", () => {
    render(<StepIndicator currentStep={1} totalSteps={1} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    const connectors = screen
      .queryAllByRole("generic")
      .filter((el) => el.className.includes("w-16") && el.className.includes("h-1"));
    expect(connectors.length).toBe(0);
  });

  it("should handle currentStep equal to totalSteps", () => {
    const { container } = render(<StepIndicator currentStep={3} totalSteps={3} />);
    const allSteps = container.querySelectorAll(".w-8.h-8");
    expect(allSteps[2]).toHaveClass("bg-blue-500", "dark:bg-blue-600", "text-white");
  });

  it("should apply correct container classes", () => {
    const { container } = render(<StepIndicator currentStep={1} totalSteps={2} />);
    const rootContainer = container.firstChild as HTMLElement;
    expect(rootContainer).toHaveClass("flex", "items-center", "justify-center", "mb-6");
  });
});
