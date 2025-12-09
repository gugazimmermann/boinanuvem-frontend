import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Alert } from "../alert";

describe("Alert", () => {
  it("should render with default success variant", () => {
    render(<Alert title="Success message" />);
    expect(screen.getByText("Success message")).toBeInTheDocument();
  });

  it("should render with success variant", () => {
    const { container } = render(<Alert title="Success" variant="success" />);
    const alert = container.firstChild as HTMLElement;
    expect(alert).toHaveClass("bg-white");
    expect(screen.getByText("Success")).toHaveClass("text-emerald-500");
  });

  it("should render with error variant", () => {
    const { container } = render(<Alert title="Error" variant="error" />);
    const alert = container.firstChild as HTMLElement;
    expect(alert).toHaveClass("bg-white");
    expect(screen.getByText("Error")).toHaveClass("text-red-500");
  });

  it("should render with warning variant", () => {
    const { container } = render(<Alert title="Warning" variant="warning" />);
    const alert = container.firstChild as HTMLElement;
    expect(alert).toHaveClass("bg-white");
    expect(screen.getByText("Warning")).toHaveClass("text-yellow-500");
  });

  it("should render with info variant", () => {
    const { container } = render(<Alert title="Info" variant="info" />);
    const alert = container.firstChild as HTMLElement;
    expect(alert).toHaveClass("bg-white");
    expect(screen.getByText("Info")).toHaveClass("text-blue-500");
  });

  it("should render message when provided", () => {
    render(<Alert title="Title" message="Additional message" />);
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Additional message")).toBeInTheDocument();
  });

  it("should not render message when not provided", () => {
    const { container } = render(<Alert title="Title" />);
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(container.querySelector("p")).not.toBeInTheDocument();
  });

  it("should render custom icon when provided", () => {
    const customIcon = <span data-testid="custom-icon">Custom Icon</span>;
    render(<Alert title="Title" icon={customIcon} />);
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("should render default icon when custom icon not provided", () => {
    const { container } = render(<Alert title="Title" variant="success" />);
    const iconContainer = container.querySelector(".bg-emerald-500");
    expect(iconContainer).toBeInTheDocument();
    expect(iconContainer?.querySelector("svg")).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(<Alert title="Title" className="custom-class" />);
    const alert = container.firstChild as HTMLElement;
    expect(alert).toHaveClass("custom-class");
  });

  it("should have correct icon background for success variant", () => {
    const { container } = render(<Alert title="Title" variant="success" />);
    const iconContainer = container.querySelector(".bg-emerald-500");
    expect(iconContainer).toBeInTheDocument();
  });

  it("should have correct icon background for error variant", () => {
    const { container } = render(<Alert title="Title" variant="error" />);
    const iconContainer = container.querySelector(".bg-red-500");
    expect(iconContainer).toBeInTheDocument();
  });

  it("should have correct icon background for warning variant", () => {
    const { container } = render(<Alert title="Title" variant="warning" />);
    const iconContainer = container.querySelector(".bg-yellow-500");
    expect(iconContainer).toBeInTheDocument();
  });

  it("should have correct icon background for info variant", () => {
    const { container } = render(<Alert title="Title" variant="info" />);
    const iconContainer = container.querySelector(".bg-blue-500");
    expect(iconContainer).toBeInTheDocument();
  });

  it("should trim className correctly", () => {
    const { container } = render(<Alert title="Title" className="  custom-class  " />);
    const alert = container.firstChild as HTMLElement;
    expect(alert.className).not.toContain("  ");
  });
});
