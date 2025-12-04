import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AnimalCodeDisplay } from "../animal-code-display";
import type { Animal } from "~/types";

describe("AnimalCodeDisplay", () => {
  const mockAnimal: Animal = {
    id: "test-id",
    code: "FJ001",
    registrationNumber: "BR-2020-FJ0001",
    status: "active",
    createdAt: "2020-01-15",
    companyId: "company-id",
    propertyId: "property-id",
  };

  it("should render animal code", () => {
    render(<AnimalCodeDisplay animal={mockAnimal} />);
    expect(screen.getByText("FJ001")).toBeInTheDocument();
  });

  it("should render registration number when showRegistration is true", () => {
    render(<AnimalCodeDisplay animal={mockAnimal} showRegistration={true} />);
    expect(screen.getByText("BR-2020-FJ0001")).toBeInTheDocument();
  });

  it("should render registration number by default", () => {
    render(<AnimalCodeDisplay animal={mockAnimal} />);
    expect(screen.getByText("BR-2020-FJ0001")).toBeInTheDocument();
  });

  it("should not render registration number when showRegistration is false", () => {
    render(<AnimalCodeDisplay animal={mockAnimal} showRegistration={false} />);
    expect(screen.getByText("FJ001")).toBeInTheDocument();
    expect(screen.queryByText("BR-2020-FJ0001")).not.toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <AnimalCodeDisplay animal={mockAnimal} className="custom-class" />
    );
    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass("custom-class");
  });

  it("should render with empty className when not provided", () => {
    const { container } = render(<AnimalCodeDisplay animal={mockAnimal} />);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toBe("");
  });

  it("should render code with correct styling", () => {
    const { container } = render(<AnimalCodeDisplay animal={mockAnimal} />);
    const heading = container.querySelector("h2");
    expect(heading).toHaveClass("font-medium");
    expect(heading).toHaveClass("text-gray-800");
    expect(heading).toHaveClass("dark:text-gray-200");
  });

  it("should render registration number with correct styling", () => {
    const { container } = render(<AnimalCodeDisplay animal={mockAnimal} />);
    const paragraph = container.querySelector("p");
    expect(paragraph).toHaveClass("text-sm");
    expect(paragraph).toHaveClass("font-normal");
    expect(paragraph).toHaveClass("text-gray-600");
    expect(paragraph).toHaveClass("dark:text-gray-400");
  });
});
