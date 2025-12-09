import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormFieldWrapper } from "../form-field-wrapper";

describe("FormFieldWrapper", () => {
  it("should render label", () => {
    render(
      <FormFieldWrapper label="Test Label">
        <input type="text" />
      </FormFieldWrapper>
    );
    expect(screen.getByText("Test Label")).toBeInTheDocument();
  });

  it("should render children", () => {
    render(
      <FormFieldWrapper label="Label">
        <input type="text" data-testid="child-input" />
      </FormFieldWrapper>
    );
    expect(screen.getByTestId("child-input")).toBeInTheDocument();
  });

  it("should not show required indicator by default", () => {
    render(
      <FormFieldWrapper label="Label">
        <input type="text" />
      </FormFieldWrapper>
    );
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  it("should show required indicator when required is true", () => {
    render(
      <FormFieldWrapper label="Label" required>
        <input type="text" />
      </FormFieldWrapper>
    );
    const asterisk = screen.getByText("*");
    expect(asterisk).toBeInTheDocument();
    expect(asterisk).toHaveClass("text-red-500");
  });

  it("should not render error message when error is not provided", () => {
    const { container } = render(
      <FormFieldWrapper label="Label">
        <input type="text" />
      </FormFieldWrapper>
    );
    expect(container.querySelector(".text-red-500")).not.toBeInTheDocument();
  });

  it("should render error message when error is provided", () => {
    render(
      <FormFieldWrapper label="Label" error="This field is required">
        <input type="text" />
      </FormFieldWrapper>
    );
    expect(screen.getByText("This field is required")).toBeInTheDocument();
    expect(screen.getByText("This field is required")).toHaveClass("text-red-500", "text-sm");
  });

  it("should apply custom className", () => {
    const { container } = render(
      <FormFieldWrapper label="Label" className="custom-class">
        <input type="text" />
      </FormFieldWrapper>
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("custom-class");
  });

  it("should have correct label styling", () => {
    render(
      <FormFieldWrapper label="Label">
        <input type="text" />
      </FormFieldWrapper>
    );
    const label = screen.getByText("Label");
    expect(label).toHaveClass("block", "text-sm", "font-medium");
  });
});
