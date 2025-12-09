import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "../input";
import { createRef } from "react";

vi.mock("~/i18n/use-translation", () => ({
  useTranslation: vi.fn(() => ({
    common: {
      showPassword: "Show password",
      hidePassword: "Hide password",
    },
  })),
}));

describe("Input", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render input element", () => {
    render(<Input />);
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
  });

  it("should render with label", () => {
    render(<Input label="Test Label" />);
    expect(screen.getByText("Test Label")).toBeInTheDocument();
    const input = screen.getByLabelText("Test Label");
    expect(input).toBeInTheDocument();
  });

  it("should render helper text", () => {
    render(<Input helperText="Helper text" />);
    expect(screen.getByText("Helper text")).toBeInTheDocument();
    expect(screen.getByText("Helper text")).toHaveClass("text-gray-400");
  });

  it("should render error message", () => {
    render(<Input error="Error message" />);
    expect(screen.getByText("Error message")).toBeInTheDocument();
    expect(screen.getByText("Error message")).toHaveClass("text-red-500");
  });

  it("should prioritize error over helper text", () => {
    render(<Input error="Error" helperText="Helper" />);
    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.queryByText("Helper")).not.toBeInTheDocument();
  });

  it("should apply error styles when error is present", () => {
    render(<Input error="Error" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("border-red-400");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("should have aria-describedby when helper text or error is present", () => {
    const { rerender } = render(<Input helperText="Helper" />);
    let input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-describedby");
    expect(input.getAttribute("aria-describedby")).toContain("-helper");

    rerender(<Input error="Error" />);
    input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-describedby");
  });

  it("should not have aria-describedby when no helper text or error", () => {
    render(<Input />);
    const input = screen.getByRole("textbox");
    expect(input).not.toHaveAttribute("aria-describedby");
  });

  it("should use provided id", () => {
    render(<Input id="custom-id" label="Label" />);
    const input = screen.getByLabelText("Label");
    expect(input).toHaveAttribute("id", "custom-id");
  });

  it("should generate id when not provided", () => {
    render(<Input label="Label" />);
    const input = screen.getByLabelText("Label");
    expect(input).toHaveAttribute("id");
    expect(input.getAttribute("id")).toBeTruthy();
  });

  it("should apply custom className", () => {
    const { container } = render(<Input className="custom-class" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("custom-class");
  });

  it("should apply custom inputClassName", () => {
    render(<Input inputClassName="custom-input-class" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("custom-input-class");
  });

  it("should handle text input", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<Input onChange={handleChange} />);
    const input = screen.getByRole("textbox");
    await user.type(input, "test");
    expect(handleChange).toHaveBeenCalled();
  });

  it("should handle number input", () => {
    render(<Input type="number" />);
    const input = screen.getByRole("spinbutton");
    expect(input).toHaveAttribute("type", "number");
  });

  it("should handle email input", () => {
    render(<Input type="email" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("type", "email");
  });

  it("should show password toggle when showPasswordToggle is true and type is password", () => {
    render(<Input type="password" showPasswordToggle />);
    const toggleButton = screen.getByRole("button");
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveAttribute("aria-label", "Show password");
  });

  it("should not show password toggle when showPasswordToggle is false", () => {
    render(<Input type="password" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("should not show password toggle for non-password types", () => {
    render(<Input type="text" showPasswordToggle />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("should toggle password visibility", async () => {
    const user = userEvent.setup();
    const { container } = render(<Input type="password" showPasswordToggle label="Password" />);
    const input = container.querySelector(
      'input[type="password"], input[type="text"]'
    ) as HTMLInputElement;
    const toggleButton = screen.getByRole("button");

    expect(input).toHaveAttribute("type", "password");
    await user.click(toggleButton);
    expect(input).toHaveAttribute("type", "text");
    expect(toggleButton).toHaveAttribute("aria-label", "Hide password");

    await user.click(toggleButton);
    expect(input).toHaveAttribute("type", "password");
    expect(toggleButton).toHaveAttribute("aria-label", "Show password");
  });

  it("should handle date input with ISO format", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<Input type="date" onChange={handleChange} />);
    const input = screen.getByRole("textbox");

    await user.type(input, "15/01/2024");
    expect(handleChange).toHaveBeenCalled();
    const lastCall = handleChange.mock.calls[handleChange.mock.calls.length - 1][0];
    expect(lastCall.target.value).toBeTruthy();
  });

  it("should display ISO date as DD/MM/YYYY format", () => {
    render(<Input type="date" value="2024-01-15" onChange={vi.fn()} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("15/01/2024");
  });

  it("should display non-ISO date as-is", () => {
    render(<Input type="date" value="15/01/2024" onChange={vi.fn()} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("15/01/2024");
  });

  it("should have placeholder for date input", () => {
    render(<Input type="date" onChange={vi.fn()} />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("placeholder", "dd/MM/yyyy");
  });

  it("should have maxLength of 10 for date input", () => {
    render(<Input type="date" onChange={vi.fn()} />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("maxLength", "10");
  });

  it("should forward ref to input element", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("should pass through input props", () => {
    render(<Input placeholder="Enter text" required />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("placeholder", "Enter text");
    expect(input).toBeRequired();
  });

  it("should have pr-10 class when password toggle is shown", () => {
    const { container } = render(<Input type="password" showPasswordToggle label="Password" />);
    const input = container.querySelector('input[type="password"]') as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input).toHaveClass("pr-10");
  });

  it("should handle controlled input value", () => {
    const { rerender } = render(<Input value="initial" onChange={vi.fn()} />);
    let input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("initial");

    rerender(<Input value="updated" onChange={vi.fn()} />);
    input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("updated");
  });

  it("should handle empty value", () => {
    render(<Input value="" onChange={vi.fn()} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("");
  });

  it("should handle null value for date input", () => {
    render(<Input type="date" value={undefined} onChange={vi.fn()} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("");
  });

  it("should handle non-string value for date input", () => {
    render(<Input type="date" value={123 as unknown as string} onChange={vi.fn()} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("");
  });
});
