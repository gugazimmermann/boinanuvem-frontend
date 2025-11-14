import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Select } from "../select";

const options = [
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" },
];

describe("Select", () => {
  it("should render select", () => {
    render(<Select options={options} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("should render with label", () => {
    render(<Select label="Test Label" options={options} />);
    expect(screen.getByLabelText("Test Label")).toBeInTheDocument();
  });

  it("should render with helper text", () => {
    render(<Select helperText="Helper text" options={options} />);
    expect(screen.getByText("Helper text")).toBeInTheDocument();
  });

  it("should render with error message", () => {
    render(<Select error="Error message" options={options} />);
    expect(screen.getByText("Error message")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-invalid", "true");
  });

  it("should prioritize error over helper text", () => {
    render(<Select error="Error" helperText="Helper" options={options} />);
    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.queryByText("Helper")).not.toBeInTheDocument();
  });

  it("should render all options", () => {
    render(<Select options={options} />);
    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
    expect(screen.getByText("Option 3")).toBeInTheDocument();
  });

  it("should render default option", () => {
    render(<Select options={options} />);
    expect(screen.getByText("Selecione...")).toBeInTheDocument();
  });

  it("should handle value changes", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Select options={options} onChange={handleChange} />);
    const select = screen.getByRole("combobox");

    await user.selectOptions(select, "option1");
    expect(handleChange).toHaveBeenCalled();
  });

  it("should apply custom className", () => {
    const { container } = render(<Select className="custom-class" options={options} />);
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv.className).toContain("custom-class");
  });

  it("should apply selectClassName", () => {
    render(<Select selectClassName="custom-select" options={options} />);
    const select = screen.getByRole("combobox");
    expect(select.className).toContain("custom-select");
  });

  it("should forward ref", () => {
    const ref = vi.fn();
    render(<Select ref={ref} options={options} />);
    expect(ref).toHaveBeenCalled();
  });

  it("should pass through other select props", () => {
    render(<Select options={options} required />);
    const select = screen.getByRole("combobox");
    expect(select).toBeRequired();
  });

  it("should handle empty options array", () => {
    render(<Select options={[]} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText("Selecione...")).toBeInTheDocument();
  });
});
