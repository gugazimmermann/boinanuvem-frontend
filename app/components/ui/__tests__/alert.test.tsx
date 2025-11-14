import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Alert } from "../alert";

describe("Alert", () => {
  it("should render alert with title", () => {
    render(<Alert title="Test Alert" />);
    expect(screen.getByText("Test Alert")).toBeInTheDocument();
  });

  it("should render alert with message", () => {
    render(<Alert title="Test Alert" message="Test message" />);
    expect(screen.getByText("Test message")).toBeInTheDocument();
  });

  it("should render success variant by default", () => {
    render(<Alert title="Success" />);
    const titleSpan = screen.getByText("Success");
    expect(titleSpan.className).toContain("text-emerald-500");
  });

  it("should render error variant", () => {
    render(<Alert title="Error" variant="error" />);
    const titleSpan = screen.getByText("Error");
    expect(titleSpan.className).toContain("text-red-500");
  });

  it("should render warning variant", () => {
    render(<Alert title="Warning" variant="warning" />);
    const titleSpan = screen.getByText("Warning");
    expect(titleSpan.className).toContain("text-yellow-500");
  });

  it("should render info variant", () => {
    render(<Alert title="Info" variant="info" />);
    const titleSpan = screen.getByText("Info");
    expect(titleSpan.className).toContain("text-blue-500");
  });

  it("should render custom icon", () => {
    const customIcon = <span data-testid="custom-icon">Custom</span>;
    render(<Alert title="Custom Icon" icon={customIcon} />);
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(<Alert title="Custom Class" className="custom-alert" />);
    const alertDiv = container.firstChild as HTMLElement;
    expect(alertDiv.className).toContain("custom-alert");
  });

  it("should not render message when not provided", () => {
    render(<Alert title="No Message" />);
    const messageParagraph = screen.queryByText("Test message");
    expect(messageParagraph).not.toBeInTheDocument();
    expect(screen.queryByText(/^Test message$/)).not.toBeInTheDocument();
  });
});
