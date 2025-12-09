import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { AuthSelect } from "../auth-select";

describe("AuthSelect", () => {
  const options = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ];

  it("should render select element", () => {
    render(<AuthSelect options={options} />);
    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
  });

  it("should render all options", () => {
    render(<AuthSelect options={options} />);
    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
    expect(screen.getByText("Option 3")).toBeInTheDocument();
  });

  it("should render default placeholder option", () => {
    render(<AuthSelect options={options} />);
    expect(screen.getByText("Selecione...")).toBeInTheDocument();
  });

  it("should render label when provided", () => {
    render(<AuthSelect label="Select Label" options={options} />);
    expect(screen.getByText("Select Label")).toBeInTheDocument();
  });

  it("should not render label when not provided", () => {
    render(<AuthSelect options={options} />);
    expect(screen.queryByText("Select Label")).not.toBeInTheDocument();
  });

  it("should render helper text when provided", () => {
    render(<AuthSelect helperText="Helper text" options={options} />);
    expect(screen.getByText("Helper text")).toBeInTheDocument();
  });

  it("should render error message when error is provided", () => {
    render(<AuthSelect error="Error message" options={options} />);
    expect(screen.getByText("Error message")).toBeInTheDocument();
  });

  it("should prioritize error over helper text", () => {
    render(<AuthSelect error="Error" helperText="Helper" options={options} />);
    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.queryByText("Helper")).not.toBeInTheDocument();
  });

  it("should apply error styles when error is provided", () => {
    render(<AuthSelect error="Error" options={options} />);
    const select = screen.getByRole("combobox");
    expect(select).toHaveClass("border-red-400", "focus:border-red-400", "focus:ring-red-300");
    expect(select).toHaveAttribute("aria-invalid", "true");
  });

  it("should apply custom className", () => {
    render(<AuthSelect className="custom-class" options={options} />);
    const container = screen.getByRole("combobox").parentElement?.parentElement;
    expect(container).toHaveClass("custom-class");
  });

  it("should apply custom selectClassName", () => {
    render(<AuthSelect selectClassName="custom-select" options={options} />);
    const select = screen.getByRole("combobox");
    expect(select).toHaveClass("custom-select");
  });

  it("should forward ref", () => {
    const ref = createRef<HTMLSelectElement>();
    render(<AuthSelect ref={ref} options={options} />);
    expect(ref.current).toBeInstanceOf(HTMLSelectElement);
  });

  it("should use provided id", () => {
    render(<AuthSelect id="custom-id" options={options} />);
    const select = screen.getByRole("combobox");
    expect(select).toHaveAttribute("id", "custom-id");
  });

  it("should generate id when not provided", () => {
    render(<AuthSelect options={options} />);
    const select = screen.getByRole("combobox");
    expect(select).toHaveAttribute("id");
  });

  it("should associate label with select", () => {
    render(<AuthSelect label="Select Label" options={options} />);
    const select = screen.getByRole("combobox");
    const label = screen.getByText("Select Label");
    expect(label).toHaveAttribute("for", select.id);
  });

  it("should handle value change", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<AuthSelect options={options} onChange={handleChange} />);
    const select = screen.getByRole("combobox");

    await user.selectOptions(select, "option2");

    expect(handleChange).toHaveBeenCalled();
  });

  it("should render dropdown icon", () => {
    const { container } = render(<AuthSelect options={options} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should create test id from aria-label", () => {
    render(<AuthSelect aria-label="State Select" options={options} />);
    const select = screen.getByRole("combobox");
    expect(select).toHaveAttribute("data-testid", "auth-select-State-Select");
  });
});
