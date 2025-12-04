import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormFieldWrapper } from "../form-field-wrapper";

describe("FormFieldWrapper", () => {
  it("should render with label", () => {
    render(
      <FormFieldWrapper label="Test Label">
        <input />
      </FormFieldWrapper>
    );
    expect(screen.getByText("Test Label")).toBeInTheDocument();
  });

  it("should render with required indicator", () => {
    render(
      <FormFieldWrapper label="Required Field" required>
        <input />
      </FormFieldWrapper>
    );
    const asterisk = screen.getByText("*");
    expect(asterisk).toBeInTheDocument();
    expect(asterisk).toHaveClass("text-red-500");
  });

  it("should not show required indicator when required is false", () => {
    render(
      <FormFieldWrapper label="Optional Field" required={false}>
        <input />
      </FormFieldWrapper>
    );
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  it("should render with error message", () => {
    render(
      <FormFieldWrapper label="Field" error="Error message">
        <input />
      </FormFieldWrapper>
    );
    expect(screen.getByText("Error message")).toBeInTheDocument();
    expect(screen.getByText("Error message")).toHaveClass("text-red-500");
  });

  it("should not show error message when error is not provided", () => {
    render(
      <FormFieldWrapper label="Field">
        <input />
      </FormFieldWrapper>
    );
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  it("should render children", () => {
    render(
      <FormFieldWrapper label="Field">
        <input data-testid="child-input" />
      </FormFieldWrapper>
    );
    expect(screen.getByTestId("child-input")).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <FormFieldWrapper label="Field" className="custom-class">
        <input />
      </FormFieldWrapper>
    );
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("custom-class");
  });

  it("should render label with correct styling", () => {
    const { container } = render(
      <FormFieldWrapper label="Field">
        <input />
      </FormFieldWrapper>
    );
    const label = container.querySelector("label");
    expect(label).toHaveClass("block");
    expect(label).toHaveClass("text-sm");
    expect(label).toHaveClass("font-medium");
  });
});
