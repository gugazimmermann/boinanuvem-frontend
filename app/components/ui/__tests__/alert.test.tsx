import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Alert } from "../alert";

describe("Alert", () => {
  it("should render with title only", () => {
    render(<Alert title="Test Alert" />);
    expect(screen.getByText("Test Alert")).toBeInTheDocument();
  });

  it("should render with title and message", () => {
    render(<Alert title="Test Alert" message="Test message" />);
    expect(screen.getByText("Test Alert")).toBeInTheDocument();
    expect(screen.getByText("Test message")).toBeInTheDocument();
  });

  it("should render with success variant by default", () => {
    const { container } = render(<Alert title="Success Alert" />);
    const iconBg = container.querySelector(".bg-emerald-500");
    expect(iconBg).toBeInTheDocument();
  });

  it("should render with error variant", () => {
    const { container } = render(<Alert title="Error Alert" variant="error" />);
    const iconBg = container.querySelector(".bg-red-500");
    expect(iconBg).toBeInTheDocument();
  });

  it("should render with warning variant", () => {
    const { container } = render(<Alert title="Warning Alert" variant="warning" />);
    const iconBg = container.querySelector(".bg-yellow-500");
    expect(iconBg).toBeInTheDocument();
  });

  it("should render with info variant", () => {
    const { container } = render(<Alert title="Info Alert" variant="info" />);
    const iconBg = container.querySelector(".bg-blue-500");
    expect(iconBg).toBeInTheDocument();
  });

  it("should render with custom icon", () => {
    const customIcon = <span data-testid="custom-icon">Custom Icon</span>;
    render(<Alert title="Custom Icon Alert" icon={customIcon} />);
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("should apply correct variant styles for success", () => {
    const { container } = render(<Alert title="Success" variant="success" />);
    const textElement = container.querySelector(".text-emerald-500");
    expect(textElement).toBeInTheDocument();
  });

  it("should apply correct variant styles for error", () => {
    const { container } = render(<Alert title="Error" variant="error" />);
    const textElement = container.querySelector(".text-red-500");
    expect(textElement).toBeInTheDocument();
  });

  it("should apply correct variant styles for warning", () => {
    const { container } = render(<Alert title="Warning" variant="warning" />);
    const textElement = container.querySelector(".text-yellow-500");
    expect(textElement).toBeInTheDocument();
  });

  it("should apply correct variant styles for info", () => {
    const { container } = render(<Alert title="Info" variant="info" />);
    const textElement = container.querySelector(".text-blue-500");
    expect(textElement).toBeInTheDocument();
  });

  it("should display default success icon", () => {
    const { container } = render(<Alert title="Success" variant="success" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should display default error icon", () => {
    const { container } = render(<Alert title="Error" variant="error" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should display default warning icon", () => {
    const { container } = render(<Alert title="Warning" variant="warning" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should display default info icon", () => {
    const { container } = render(<Alert title="Info" variant="info" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(<Alert title="Test" className="custom-class" />);
    const alert = container.firstChild as HTMLElement;
    expect(alert).toHaveClass("custom-class");
  });
});
