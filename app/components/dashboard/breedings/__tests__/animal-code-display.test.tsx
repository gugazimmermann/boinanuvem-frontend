import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AnimalCodeDisplay } from "../animal-code-display";
import type { Animal } from "~/types";

describe("AnimalCodeDisplay", () => {
  const mockAnimal: Animal = {
    id: "1",
    code: "A001",
    registrationNumber: "BR-12345",
  } as Animal;

  it("should render animal code", () => {
    render(<AnimalCodeDisplay animal={mockAnimal} />);
    expect(screen.getByText("A001")).toBeInTheDocument();
  });

  it("should render registration number when showRegistration is true", () => {
    render(<AnimalCodeDisplay animal={mockAnimal} showRegistration={true} />);
    expect(screen.getByText("BR-12345")).toBeInTheDocument();
  });

  it("should not render registration number when showRegistration is false", () => {
    render(<AnimalCodeDisplay animal={mockAnimal} showRegistration={false} />);
    expect(screen.queryByText("BR-12345")).not.toBeInTheDocument();
  });

  it("should render registration number by default", () => {
    render(<AnimalCodeDisplay animal={mockAnimal} />);
    expect(screen.getByText("BR-12345")).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <AnimalCodeDisplay animal={mockAnimal} className="custom-class" />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("custom-class");
  });
});
