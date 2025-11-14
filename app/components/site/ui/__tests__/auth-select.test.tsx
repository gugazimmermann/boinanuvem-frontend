import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthSelect } from "../auth-select";

describe("AuthSelect", () => {
  const options = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ];

  it("should render select", () => {
    render(<AuthSelect options={options} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("should render with label", () => {
    render(<AuthSelect label="Test Label" options={options} />);
    expect(screen.getByLabelText("Test Label")).toBeInTheDocument();
  });

  it("should render with helper text", () => {
    render(<AuthSelect helperText="Helper text" options={options} />);
    expect(screen.getByText("Helper text")).toBeInTheDocument();
  });

  it("should render with error message", () => {
    render(<AuthSelect error="Error message" options={options} />);
    expect(screen.getByText("Error message")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-invalid", "true");
  });

  it("should prioritize error over helper text", () => {
    render(<AuthSelect error="Error" helperText="Helper" options={options} />);
    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.queryByText("Helper")).not.toBeInTheDocument();
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

  it("should handle value changes", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<AuthSelect options={options} onChange={handleChange} />);
    const select = screen.getByRole("combobox");

    await user.selectOptions(select, "option1");
    expect(handleChange).toHaveBeenCalled();
  });

  it("should apply custom className", () => {
    const { container } = render(<AuthSelect className="custom-class" options={options} />);
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv.className).toContain("custom-class");
  });

  it("should apply selectClassName", () => {
    render(<AuthSelect selectClassName="custom-select" options={options} />);
    const select = screen.getByRole("combobox");
    expect(select.className).toContain("custom-select");
  });

  it("should use provided id", () => {
    render(<AuthSelect id="custom-id" label="Label" options={options} />);
    const select = screen.getByLabelText("Label");
    expect(select).toHaveAttribute("id", "custom-id");
  });

  it("should generate id when not provided", () => {
    render(<AuthSelect label="Label" options={options} />);
    const select = screen.getByLabelText("Label");
    expect(select).toHaveAttribute("id");
  });

  it("should render dropdown icon", () => {
    const { container } = render(<AuthSelect options={options} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});
