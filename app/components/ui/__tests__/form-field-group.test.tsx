import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { FormFieldGroup } from "../form-field-group";

describe("FormFieldGroup", () => {
  it("should render with default 2 columns", () => {
    const { container } = render(
      <FormFieldGroup>
        <input />
        <input />
      </FormFieldGroup>
    );
    const group = container.firstChild as HTMLElement;
    expect(group).toHaveClass("grid-cols-1");
    expect(group).toHaveClass("md:grid-cols-2");
  });

  it("should render with 1 column", () => {
    const { container } = render(
      <FormFieldGroup columns={1}>
        <input />
      </FormFieldGroup>
    );
    const group = container.firstChild as HTMLElement;
    expect(group).toHaveClass("grid-cols-1");
    expect(group).not.toHaveClass("md:grid-cols-2");
  });

  it("should render with 2 columns", () => {
    const { container } = render(
      <FormFieldGroup columns={2}>
        <input />
        <input />
      </FormFieldGroup>
    );
    const group = container.firstChild as HTMLElement;
    expect(group).toHaveClass("grid-cols-1");
    expect(group).toHaveClass("md:grid-cols-2");
  });

  it("should render with 3 columns", () => {
    const { container } = render(
      <FormFieldGroup columns={3}>
        <input />
        <input />
        <input />
      </FormFieldGroup>
    );
    const group = container.firstChild as HTMLElement;
    expect(group).toHaveClass("grid-cols-1");
    expect(group).toHaveClass("md:grid-cols-3");
  });

  it("should render with 4 columns", () => {
    const { container } = render(
      <FormFieldGroup columns={4}>
        <input />
        <input />
        <input />
        <input />
      </FormFieldGroup>
    );
    const group = container.firstChild as HTMLElement;
    expect(group).toHaveClass("grid-cols-1");
    expect(group).toHaveClass("md:grid-cols-2");
    expect(group).toHaveClass("lg:grid-cols-4");
  });

  it("should apply custom className", () => {
    const { container } = render(
      <FormFieldGroup className="custom-class">
        <input />
      </FormFieldGroup>
    );
    const group = container.firstChild as HTMLElement;
    expect(group).toHaveClass("custom-class");
  });

  it("should render children", () => {
    const { container } = render(
      <FormFieldGroup>
        <input data-testid="input-1" />
        <input data-testid="input-2" />
      </FormFieldGroup>
    );
    expect(container.querySelector('[data-testid="input-1"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="input-2"]')).toBeInTheDocument();
  });

  it("should apply gap classes", () => {
    const { container } = render(
      <FormFieldGroup>
        <input />
      </FormFieldGroup>
    );
    const group = container.firstChild as HTMLElement;
    expect(group).toHaveClass("gap-4");
  });
});
