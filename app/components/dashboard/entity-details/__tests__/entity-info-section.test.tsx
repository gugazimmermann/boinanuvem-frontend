import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EntityInfoSection } from "../entity-info-section";

describe("EntityInfoSection", () => {
  const mockFields = [
    { label: "Field 1", value: "Value 1" },
    { label: "Field 2", value: "Value 2" },
  ];

  it("should render title", () => {
    render(<EntityInfoSection title="Information" fields={mockFields} />);
    expect(screen.getByText("Information")).toBeInTheDocument();
  });

  it("should render all fields", () => {
    render(<EntityInfoSection title="Information" fields={mockFields} />);
    expect(screen.getByText("Field 1")).toBeInTheDocument();
    expect(screen.getByText("Value 1")).toBeInTheDocument();
    expect(screen.getByText("Field 2")).toBeInTheDocument();
    expect(screen.getByText("Value 2")).toBeInTheDocument();
  });

  it("should render ReactNode values", () => {
    const fieldsWithNode = [
      { label: "Field 1", value: <span data-testid="custom-value">Custom</span> },
    ];
    render(<EntityInfoSection title="Information" fields={fieldsWithNode} />);
    expect(screen.getByTestId("custom-value")).toBeInTheDocument();
  });

  it("should apply blue color by default", () => {
    const { container } = render(<EntityInfoSection title="Information" fields={mockFields} />);
    const colorBar = container.querySelector(".bg-blue-500");
    expect(colorBar).toBeInTheDocument();
  });

  it("should apply green color when specified", () => {
    const { container } = render(
      <EntityInfoSection title="Information" fields={mockFields} color="green" />
    );
    const colorBar = container.querySelector(".bg-green-500");
    expect(colorBar).toBeInTheDocument();
  });

  it("should apply purple color when specified", () => {
    const { container } = render(
      <EntityInfoSection title="Information" fields={mockFields} color="purple" />
    );
    const colorBar = container.querySelector(".bg-purple-500");
    expect(colorBar).toBeInTheDocument();
  });

  it("should apply orange color when specified", () => {
    const { container } = render(
      <EntityInfoSection title="Information" fields={mockFields} color="orange" />
    );
    const colorBar = container.querySelector(".bg-orange-500");
    expect(colorBar).toBeInTheDocument();
  });

  it("should apply teal color when specified", () => {
    const { container } = render(
      <EntityInfoSection title="Information" fields={mockFields} color="teal" />
    );
    const colorBar = container.querySelector(".bg-teal-500");
    expect(colorBar).toBeInTheDocument();
  });

  it("should render empty fields array", () => {
    render(<EntityInfoSection title="Information" fields={[]} />);
    expect(screen.getByText("Information")).toBeInTheDocument();
  });
});
