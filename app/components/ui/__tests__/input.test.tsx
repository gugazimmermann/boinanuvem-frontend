import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "../input";
import * as masks from "~/components/site/utils/masks";

vi.mock("~/i18n/use-translation", () => ({
  useTranslation: () => ({
    common: {
      showPassword: "Show password",
      hidePassword: "Hide password",
    },
  }),
}));

describe("Input", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render with label", () => {
    render(<Input label="Test Label" />);
    expect(screen.getByLabelText("Test Label")).toBeInTheDocument();
  });

  it("should render with helper text", () => {
    render(<Input helperText="Helper text" />);
    expect(screen.getByText("Helper text")).toBeInTheDocument();
  });

  it("should render with error message", () => {
    render(<Input error="Error message" />);
    expect(screen.getByText("Error message")).toBeInTheDocument();
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("should prioritize error over helper text", () => {
    render(<Input helperText="Helper" error="Error" />);
    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.queryByText("Helper")).not.toBeInTheDocument();
  });

  it("should generate id when not provided", () => {
    render(<Input label="Test" />);
    const input = screen.getByLabelText("Test");
    expect(input).toHaveAttribute("id");
  });

  it("should use custom id when provided", () => {
    render(<Input id="custom-id" label="Test" />);
    const input = screen.getByLabelText("Test");
    expect(input).toHaveAttribute("id", "custom-id");
  });

  it("should set aria-describedby when helper text or error exists", () => {
    const { rerender } = render(<Input helperText="Helper" id="test" />);
    let input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-describedby", "test-helper");

    rerender(<Input error="Error" id="test" />);
    input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-describedby", "test-helper");
  });

  it("should handle onChange events", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<Input onChange={handleChange} />);
    const input = screen.getByRole("textbox");
    await user.type(input, "test");
    expect(handleChange).toHaveBeenCalled();
  });

  it("should toggle password visibility when showPasswordToggle is true", async () => {
    const user = userEvent.setup();
    render(<Input type="password" showPasswordToggle />);
    const input = document.querySelector('input[type="password"]') as HTMLInputElement;
    expect(input).toHaveAttribute("type", "password");

    const toggleButton = screen.getByRole("button");
    await user.click(toggleButton);
    const textInput = document.querySelector('input[type="text"]') as HTMLInputElement;
    expect(textInput).toBeInTheDocument();
  });

  it("should show hide password label when password is visible", async () => {
    const user = userEvent.setup();
    render(<Input type="password" showPasswordToggle />);
    const toggleButton = screen.getByRole("button", { name: /show password/i });
    await user.click(toggleButton);
    expect(screen.getByRole("button", { name: /hide password/i })).toBeInTheDocument();
  });

  it("should not show password toggle for non-password types", () => {
    render(<Input type="text" showPasswordToggle />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("should mask date input", async () => {
    const handleChange = vi.fn();
    vi.spyOn(masks, "maskDate").mockReturnValue("12/31/2024");
    vi.spyOn(masks, "dateToISO").mockReturnValue("2024-12-31");

    const user = userEvent.setup();
    render(<Input type="date" onChange={handleChange} />);
    const input = screen.getByRole("textbox");
    await user.type(input, "12312024");

    expect(masks.maskDate).toHaveBeenCalled();
    expect(masks.dateToISO).toHaveBeenCalled();
  });

  it("should convert ISO date to display format", () => {
    vi.spyOn(masks, "isoToDate").mockReturnValue("31/12/2024");
    render(<Input type="date" value="2024-12-31" readOnly />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("31/12/2024");
  });

  it("should set placeholder for date inputs", () => {
    render(<Input type="date" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("placeholder", "dd/MM/yyyy");
  });

  it("should set maxLength for date inputs", () => {
    render(<Input type="date" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("maxLength", "10");
  });

  it("should not mask non-date inputs", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<Input type="text" onChange={handleChange} />);
    const input = screen.getByRole("textbox");
    await user.type(input, "test");
    expect(masks.maskDate).not.toHaveBeenCalled();
  });

  it("should apply error styles when error exists", () => {
    const { container } = render(<Input error="Error" />);
    const input = container.querySelector("input");
    expect(input).toHaveClass("border-red-400");
  });

  it("should apply custom className to wrapper", () => {
    const { container } = render(<Input className="wrapper-class" />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("wrapper-class");
  });

  it("should apply custom inputClassName", () => {
    const { container } = render(<Input inputClassName="input-class" />);
    const input = container.querySelector("input");
    expect(input).toHaveClass("input-class");
  });

  it("should handle value prop", () => {
    render(<Input value="test value" readOnly />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("test value");
  });

  it("should handle placeholder prop for non-date inputs", () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("placeholder", "Enter text");
  });

  it("should forward ref", () => {
    const ref = vi.fn();
    render(<Input ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });

  it("should handle date input with incomplete value", async () => {
    const handleChange = vi.fn();
    vi.spyOn(masks, "maskDate").mockReturnValue("12/31");
    vi.spyOn(masks, "dateToISO").mockReturnValue("12/31");

    const user = userEvent.setup();
    render(<Input type="date" onChange={handleChange} />);
    const input = screen.getByRole("textbox");
    await user.type(input, "1231");

    expect(masks.maskDate).toHaveBeenCalled();
  });
});
