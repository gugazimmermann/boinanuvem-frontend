import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Select } from "../select";

vi.mock("~/i18n/use-translation", () => ({
  useTranslation: () => ({
    common: {
      select: "Select...",
    },
  }),
}));

describe("Select", () => {
  const options = [
    { value: "1", label: "Option 1" },
    { value: "2", label: "Option 2" },
    { value: "3", label: "Option 3" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
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
    const select = screen.getByRole("combobox");
    expect(select).toHaveAttribute("aria-invalid", "true");
  });

  it("should prioritize error over helper text", () => {
    render(<Select helperText="Helper" error="Error" options={options} />);
    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.queryByText("Helper")).not.toBeInTheDocument();
  });

  it("should render all options", () => {
    render(<Select options={options} />);
    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
    expect(screen.getByText("Option 3")).toBeInTheDocument();
  });

  it("should render placeholder option by default", () => {
    render(<Select options={options} />);
    expect(screen.getByText("Select...")).toBeInTheDocument();
  });

  it("should render custom placeholder", () => {
    render(<Select options={options} placeholder="Choose..." />);
    expect(screen.getByText("Choose...")).toBeInTheDocument();
  });

  it("should not render placeholder when showPlaceholder is false", () => {
    render(<Select options={options} showPlaceholder={false} />);
    expect(screen.queryByText("Select...")).not.toBeInTheDocument();
  });

  it("should generate id when not provided", () => {
    render(<Select label="Test" options={options} />);
    const select = screen.getByLabelText("Test");
    expect(select).toHaveAttribute("id");
  });

  it("should use custom id when provided", () => {
    render(<Select id="custom-id" label="Test" options={options} />);
    const select = screen.getByLabelText("Test");
    expect(select).toHaveAttribute("id", "custom-id");
  });

  it("should set aria-invalid when error exists", () => {
    render(<Select error="Error" options={options} />);
    const select = screen.getByRole("combobox");
    expect(select).toHaveAttribute("aria-invalid", "true");
  });

  it("should handle onChange events", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<Select options={options} onChange={handleChange} />);
    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "1");
    expect(handleChange).toHaveBeenCalled();
  });

  it("should apply error styles when error exists", () => {
    const { container } = render(<Select error="Error" options={options} />);
    const select = container.querySelector("select");
    expect(select).toHaveClass("border-red-400");
  });

  it("should apply custom className to wrapper", () => {
    const { container } = render(<Select className="wrapper-class" options={options} />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("wrapper-class");
  });

  it("should apply custom selectClassName", () => {
    const { container } = render(<Select selectClassName="select-class" options={options} />);
    const select = container.querySelector("select");
    expect(select).toHaveClass("select-class");
  });

  it("should handle value prop", () => {
    render(<Select options={options} value="2" onChange={() => {}} />);
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("2");
  });

  it("should forward ref", () => {
    const ref = vi.fn();
    render(<Select ref={ref} options={options} />);
    expect(ref).toHaveBeenCalled();
  });

  it("should render dropdown icon", () => {
    const { container } = render(<Select options={options} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should handle empty options array", () => {
    render(<Select options={[]} />);
    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
  });

  it("should pass through other select props", () => {
    render(<Select options={options} disabled />);
    const select = screen.getByRole("combobox");
    expect(select).toBeDisabled();
  });
});
