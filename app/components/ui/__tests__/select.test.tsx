import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Select } from "../select";
import { createRef } from "react";

vi.mock("~/i18n/use-translation", () => ({
  useTranslation: vi.fn(() => ({
    common: {
      select: "Select...",
    },
  })),
}));

describe("Select", () => {
  const mockOptions = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render select element", () => {
    render(<Select options={mockOptions} />);
    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
  });

  it("should render with label", () => {
    render(<Select label="Test Label" options={mockOptions} />);
    expect(screen.getByText("Test Label")).toBeInTheDocument();
    const select = screen.getByLabelText("Test Label");
    expect(select).toBeInTheDocument();
  });

  it("should render all options", () => {
    render(<Select options={mockOptions} />);
    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
    expect(screen.getByText("Option 3")).toBeInTheDocument();
  });

  it("should render placeholder by default", () => {
    render(<Select options={mockOptions} />);
    expect(screen.getByText("Select...")).toBeInTheDocument();
  });

  it("should render custom placeholder", () => {
    render(<Select options={mockOptions} placeholder="Choose an option" />);
    expect(screen.getByText("Choose an option")).toBeInTheDocument();
  });

  it("should not render placeholder when showPlaceholder is false", () => {
    render(<Select options={mockOptions} showPlaceholder={false} />);
    expect(screen.queryByText("Select...")).not.toBeInTheDocument();
  });

  it("should render helper text", () => {
    render(<Select options={mockOptions} helperText="Helper text" />);
    expect(screen.getByText("Helper text")).toBeInTheDocument();
    expect(screen.getByText("Helper text")).toHaveClass("text-gray-400");
  });

  it("should render error message", () => {
    render(<Select options={mockOptions} error="Error message" />);
    expect(screen.getByText("Error message")).toBeInTheDocument();
    expect(screen.getByText("Error message")).toHaveClass("text-red-500");
  });

  it("should prioritize error over helper text", () => {
    render(<Select options={mockOptions} error="Error" helperText="Helper" />);
    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.queryByText("Helper")).not.toBeInTheDocument();
  });

  it("should apply error styles when error is present", () => {
    render(<Select options={mockOptions} error="Error" />);
    const select = screen.getByRole("combobox");
    expect(select).toHaveClass("border-red-400");
    expect(select).toHaveAttribute("aria-invalid", "true");
  });

  it("should use provided id", () => {
    render(<Select id="custom-id" label="Label" options={mockOptions} />);
    const select = screen.getByLabelText("Label");
    expect(select).toHaveAttribute("id", "custom-id");
  });

  it("should generate id when not provided", () => {
    render(<Select label="Label" options={mockOptions} />);
    const select = screen.getByLabelText("Label");
    expect(select).toHaveAttribute("id");
    expect(select.getAttribute("id")).toBeTruthy();
  });

  it("should apply custom className", () => {
    const { container } = render(<Select options={mockOptions} className="custom-class" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("custom-class");
  });

  it("should apply custom selectClassName", () => {
    render(<Select options={mockOptions} selectClassName="custom-select-class" />);
    const select = screen.getByRole("combobox");
    expect(select).toHaveClass("custom-select-class");
  });

  it("should handle value change", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<Select options={mockOptions} onChange={handleChange} />);
    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "option2");
    expect(handleChange).toHaveBeenCalled();
  });

  it("should display selected value", () => {
    render(<Select options={mockOptions} value="option2" onChange={vi.fn()} />);
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("option2");
  });

  it("should forward ref to select element", () => {
    const ref = createRef<HTMLSelectElement>();
    render(<Select options={mockOptions} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLSelectElement);
  });

  it("should pass through select props", () => {
    render(<Select options={mockOptions} required disabled />);
    const select = screen.getByRole("combobox");
    expect(select).toBeRequired();
    expect(select).toBeDisabled();
  });

  it("should render dropdown icon", () => {
    const { container } = render(<Select options={mockOptions} />);
    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("should have correct base styles", () => {
    render(<Select options={mockOptions} />);
    const select = screen.getByRole("combobox");
    expect(select).toHaveClass("mt-2", "block", "w-full", "rounded-lg");
  });

  it("should handle empty options array", () => {
    render(<Select options={[]} />);
    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
    const options = select.querySelectorAll("option");
    // Only placeholder option should be present
    expect(options.length).toBe(1);
  });

  it("should handle multiple options with same value", () => {
    const duplicateOptions = [
      { value: "option1", label: "Option 1" },
      { value: "option1", label: "Option 1 Duplicate" },
    ];
    render(<Select options={duplicateOptions} />);
    const options = screen.getAllByText(/Option 1/);
    expect(options.length).toBeGreaterThan(0);
  });
});
