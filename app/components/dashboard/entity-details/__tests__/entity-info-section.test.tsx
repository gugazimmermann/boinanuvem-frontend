import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EntityInfoSection } from "../entity-info-section";

describe("EntityInfoSection", () => {
  const mockFields = [
    { label: "Name", value: "John Doe" },
    { label: "Email", value: "john@example.com" },
    { label: "Phone", value: "+1234567890" },
  ];

  it("should render title", () => {
    render(<EntityInfoSection title="Information" fields={[]} />);
    expect(screen.getByText("Information")).toBeInTheDocument();
  });

  it("should render fields", () => {
    render(<EntityInfoSection title="Information" fields={mockFields} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("+1234567890")).toBeInTheDocument();
  });

  it("should render field labels", () => {
    render(<EntityInfoSection title="Information" fields={mockFields} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Phone")).toBeInTheDocument();
  });

  it("should render with default blue color", () => {
    const { container } = render(<EntityInfoSection title="Information" fields={mockFields} />);
    const colorBar = container.querySelector(".bg-blue-500");
    expect(colorBar).toBeInTheDocument();
  });

  it("should render with green color", () => {
    const { container } = render(
      <EntityInfoSection title="Information" fields={mockFields} color="green" />
    );
    const colorBar = container.querySelector(".bg-green-500");
    expect(colorBar).toBeInTheDocument();
  });

  it("should render with purple color", () => {
    const { container } = render(
      <EntityInfoSection title="Information" fields={mockFields} color="purple" />
    );
    const colorBar = container.querySelector(".bg-purple-500");
    expect(colorBar).toBeInTheDocument();
  });

  it("should render with orange color", () => {
    const { container } = render(
      <EntityInfoSection title="Information" fields={mockFields} color="orange" />
    );
    const colorBar = container.querySelector(".bg-orange-500");
    expect(colorBar).toBeInTheDocument();
  });

  it("should render with teal color", () => {
    const { container } = render(
      <EntityInfoSection title="Information" fields={mockFields} color="teal" />
    );
    const colorBar = container.querySelector(".bg-teal-500");
    expect(colorBar).toBeInTheDocument();
  });

  it("should render ReactNode values", () => {
    const nodeValue = <span data-testid="node-value">Node Value</span>;
    const fieldsWithNode = [{ label: "Custom", value: nodeValue }];
    render(<EntityInfoSection title="Information" fields={fieldsWithNode} />);
    expect(screen.getByTestId("node-value")).toBeInTheDocument();
  });

  it("should render empty state when no fields", () => {
    render(<EntityInfoSection title="Information" fields={[]} />);
    expect(screen.getByText("Information")).toBeInTheDocument();
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
  });

  it("should render with correct styling classes", () => {
    const { container } = render(<EntityInfoSection title="Information" fields={mockFields} />);
    const section = container.firstChild as HTMLElement;
    expect(section).toHaveClass("bg-white");
    expect(section).toHaveClass("dark:bg-gray-800");
    expect(section).toHaveClass("rounded-lg");
  });
});
