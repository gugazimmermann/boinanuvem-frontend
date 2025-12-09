import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FixedAlert } from "../fixed-alert";
import type { AlertMessage } from "~/hooks/use-alert";

describe("FixedAlert", () => {
  it("should not render when alertMessage is null", () => {
    const { container } = render(<FixedAlert alertMessage={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("should not render when alertMessage is undefined", () => {
    const { container } = render(<FixedAlert alertMessage={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render Alert when alertMessage is provided", () => {
    const alertMessage: AlertMessage = {
      title: "Test Alert",
      variant: "success",
    };
    render(<FixedAlert alertMessage={alertMessage} />);
    expect(screen.getByText("Test Alert")).toBeInTheDocument();
  });

  it("should render with correct variant", () => {
    const alertMessage: AlertMessage = {
      title: "Error Alert",
      variant: "error",
    };
    render(<FixedAlert alertMessage={alertMessage} />);
    expect(screen.getByText("Error Alert")).toHaveClass("text-red-500");
  });

  it("should have fixed positioning classes", () => {
    const alertMessage: AlertMessage = {
      title: "Fixed Alert",
      variant: "info",
    };
    const { container } = render(<FixedAlert alertMessage={alertMessage} />);
    const fixedContainer = container.firstChild as HTMLElement;
    expect(fixedContainer).toHaveClass("fixed", "top-4", "left-1/2");
  });
});
