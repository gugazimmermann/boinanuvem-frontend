import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormFieldGroup } from "../form-field-group";

describe("FormFieldGroup", () => {
  it("should render children", () => {
    render(
      <FormFieldGroup>
        <div>Child 1</div>
        <div>Child 2</div>
      </FormFieldGroup>
    );
    expect(screen.getByText("Child 1")).toBeInTheDocument();
    expect(screen.getByText("Child 2")).toBeInTheDocument();
  });

  it("should default to 2 columns", () => {
    const { container } = render(
      <FormFieldGroup>
        <div>Child</div>
      </FormFieldGroup>
    );
    const group = container.firstChild as HTMLElement;
    expect(group).toHaveClass("grid-cols-1", "md:grid-cols-2");
  });

  it("should render with 1 column", () => {
    const { container } = render(
      <FormFieldGroup columns={1}>
        <div>Child</div>
      </FormFieldGroup>
    );
    const group = container.firstChild as HTMLElement;
    expect(group).toHaveClass("grid-cols-1");
    expect(group).not.toHaveClass("md:grid-cols-2");
  });

  it("should render with 2 columns", () => {
    const { container } = render(
      <FormFieldGroup columns={2}>
        <div>Child</div>
      </FormFieldGroup>
    );
    const group = container.firstChild as HTMLElement;
    expect(group).toHaveClass("grid-cols-1", "md:grid-cols-2");
  });

  it("should render with 3 columns", () => {
    const { container } = render(
      <FormFieldGroup columns={3}>
        <div>Child</div>
      </FormFieldGroup>
    );
    const group = container.firstChild as HTMLElement;
    expect(group).toHaveClass("grid-cols-1", "md:grid-cols-3");
  });

  it("should render with 4 columns", () => {
    const { container } = render(
      <FormFieldGroup columns={4}>
        <div>Child</div>
      </FormFieldGroup>
    );
    const group = container.firstChild as HTMLElement;
    expect(group).toHaveClass("grid-cols-1", "md:grid-cols-2", "lg:grid-cols-4");
  });

  it("should apply custom className", () => {
    const { container } = render(
      <FormFieldGroup className="custom-class">
        <div>Child</div>
      </FormFieldGroup>
    );
    const group = container.firstChild as HTMLElement;
    expect(group).toHaveClass("custom-class");
  });

  it("should have gap-4 class", () => {
    const { container } = render(
      <FormFieldGroup>
        <div>Child</div>
      </FormFieldGroup>
    );
    const group = container.firstChild as HTMLElement;
    expect(group).toHaveClass("gap-4");
  });
});
