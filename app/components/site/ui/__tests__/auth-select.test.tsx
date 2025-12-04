import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthSelect } from "../auth-select";

describe("AuthSelect", () => {
  const defaultOptions = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ];

  it("should render select element", () => {
    render(<AuthSelect options={defaultOptions} />);
    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
  });

  it("should render with label", () => {
    render(<AuthSelect label="Select Label" options={defaultOptions} />);
    expect(screen.getByText("Select Label")).toBeInTheDocument();
    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
  });

  it("should render with helper text", () => {
    render(<AuthSelect helperText="Helper text" options={defaultOptions} />);
    expect(screen.getByText("Helper text")).toBeInTheDocument();
  });

  it("should render with error message", () => {
    render(<AuthSelect error="Error message" options={defaultOptions} />);
    expect(screen.getByText("Error message")).toBeInTheDocument();
    const select = screen.getByRole("combobox");
    expect(select).toHaveAttribute("aria-invalid", "true");
  });

  it("should prioritize error over helper text", () => {
    render(<AuthSelect error="Error message" helperText="Helper text" options={defaultOptions} />);
    expect(screen.getByText("Error message")).toBeInTheDocument();
    expect(screen.queryByText("Helper text")).not.toBeInTheDocument();
  });

  it("should render all options", () => {
    render(<AuthSelect options={defaultOptions} />);
    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
    expect(screen.getByText("Option 3")).toBeInTheDocument();
  });

  it("should render default placeholder option", () => {
    render(<AuthSelect options={defaultOptions} />);
    expect(screen.getByText("Selecione...")).toBeInTheDocument();
  });

  it("should handle value change", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<AuthSelect options={defaultOptions} onChange={handleChange} />);

    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "option2");

    expect(handleChange).toHaveBeenCalled();
    expect(select).toHaveValue("option2");
  });

  it("should apply error styles when error is present", () => {
    const { container } = render(<AuthSelect error="Error" options={defaultOptions} />);
    const select = container.querySelector("select");
    expect(select).toHaveClass("border-red-400");
  });

  it("should not apply error styles when error is not present", () => {
    const { container } = render(<AuthSelect options={defaultOptions} />);
    const select = container.querySelector("select");
    expect(select).not.toHaveClass("border-red-400");
  });

  it("should apply custom className", () => {
    const { container } = render(<AuthSelect className="custom-class" options={defaultOptions} />);
    const wrapper = container.querySelector("div");
    expect(wrapper).toHaveClass("custom-class");
  });

  it("should apply custom selectClassName", () => {
    const { container } = render(
      <AuthSelect selectClassName="custom-select" options={defaultOptions} />
    );
    const select = container.querySelector("select");
    expect(select).toHaveClass("custom-select");
  });

  it("should use provided id", () => {
    render(<AuthSelect id="custom-id" options={defaultOptions} />);
    const select = screen.getByRole("combobox");
    expect(select).toHaveAttribute("id", "custom-id");
  });

  it("should generate id when not provided", () => {
    render(<AuthSelect options={defaultOptions} />);
    const select = screen.getByRole("combobox");
    expect(select).toHaveAttribute("id");
  });

  it("should associate label with select using id", () => {
    render(<AuthSelect label="Select Label" id="test-id" options={defaultOptions} />);
    const label = screen.getByText("Select Label");
    const select = screen.getByRole("combobox");
    expect(label).toHaveAttribute("for", "test-id");
    expect(select).toHaveAttribute("id", "test-id");
  });

  it("should render dropdown icon", () => {
    const { container } = render(<AuthSelect options={defaultOptions} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should pass through other select props", () => {
    render(<AuthSelect options={defaultOptions} name="test-select" required />);
    const select = screen.getByRole("combobox");
    expect(select).toHaveAttribute("name", "test-select");
    expect(select).toBeRequired();
  });

  it("should handle disabled state", () => {
    render(<AuthSelect options={defaultOptions} disabled />);
    const select = screen.getByRole("combobox");
    expect(select).toBeDisabled();
  });

  it("should handle multiple options", () => {
    const manyOptions = Array.from({ length: 10 }, (_, i) => ({
      value: `option${i}`,
      label: `Option ${i}`,
    }));

    render(<AuthSelect options={manyOptions} />);

    manyOptions.forEach((option) => {
      expect(screen.getByText(option.label)).toBeInTheDocument();
    });
  });

  it("should handle empty options array", () => {
    render(<AuthSelect options={[]} />);
    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
    expect(screen.getByText("Selecione...")).toBeInTheDocument();
  });

  it("should generate testId from aria-label", () => {
    render(<AuthSelect options={defaultOptions} aria-label="Test Select" />);
    const select = screen.getByRole("combobox");
    expect(select).toHaveAttribute("data-testid", "auth-select-Test-Select");
  });

  it("should handle aria-label with spaces in testId", () => {
    render(<AuthSelect options={defaultOptions} aria-label="Test Select Label" />);
    const select = screen.getByRole("combobox");
    expect(select).toHaveAttribute("data-testid", "auth-select-Test-Select-Label");
  });

  it("should not have testId when aria-label is not provided", () => {
    render(<AuthSelect options={defaultOptions} />);
    const select = screen.getByRole("combobox");
    expect(select).not.toHaveAttribute("data-testid");
  });

  it("should display error text in red", () => {
    const { container } = render(<AuthSelect error="Error message" options={defaultOptions} />);
    const errorText = container.querySelector(".text-red-500");
    expect(errorText).toBeInTheDocument();
    expect(errorText).toHaveTextContent("Error message");
  });

  it("should display helper text in gray", () => {
    const { container } = render(<AuthSelect helperText="Helper text" options={defaultOptions} />);
    const helperText = container.querySelector("p.text-gray-400");
    expect(helperText).toBeInTheDocument();
    expect(helperText).toHaveTextContent("Helper text");
  });
});
