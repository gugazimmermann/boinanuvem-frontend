import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "../input";
import { LanguageProvider } from "~/contexts/language-context";

const renderWithProvider = (component: React.ReactElement) => {
  return render(<LanguageProvider>{component}</LanguageProvider>);
};

describe("Input", () => {
  it("should render input", () => {
    renderWithProvider(<Input />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("should render with label", () => {
    renderWithProvider(<Input label="Test Label" />);
    expect(screen.getByLabelText("Test Label")).toBeInTheDocument();
  });

  it("should render with helper text", () => {
    renderWithProvider(<Input helperText="Helper text" />);
    expect(screen.getByText("Helper text")).toBeInTheDocument();
  });

  it("should render with error message", () => {
    renderWithProvider(<Input error="Error message" />);
    expect(screen.getByText("Error message")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("should prioritize error over helper text", () => {
    renderWithProvider(<Input error="Error" helperText="Helper" />);
    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.queryByText("Helper")).not.toBeInTheDocument();
  });

  it("should handle value changes", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    renderWithProvider(<Input onChange={handleChange} />);
    const input = screen.getByRole("textbox");

    await user.type(input, "test");
    expect(handleChange).toHaveBeenCalled();
  });

  it("should apply custom className", () => {
    const { container } = renderWithProvider(<Input className="custom-class" />);
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv.className).toContain("custom-class");
  });

  it("should apply inputClassName", () => {
    renderWithProvider(<Input inputClassName="custom-input" />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("custom-input");
  });

  it("should handle password type with toggle", async () => {
    const user = userEvent.setup();
    renderWithProvider(<Input type="password" showPasswordToggle />);

    const input = document.querySelector('input[type="password"]') as HTMLInputElement;
    expect(input).toHaveAttribute("type", "password");

    const toggleButton = screen.getByLabelText("Show password");
    await user.click(toggleButton);

    const textInput = document.querySelector('input[type="text"]') as HTMLInputElement;
    expect(textInput).toBeInTheDocument();
    expect(screen.getByLabelText("Hide password")).toBeInTheDocument();
  });

  it("should mask date input", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    renderWithProvider(<Input type="date" onChange={handleChange} />);
    const input = screen.getByRole("textbox");

    await user.type(input, "01012024");
    expect(handleChange).toHaveBeenCalled();
  });

  it("should convert ISO date to display format", () => {
    const handleChange = vi.fn();
    renderWithProvider(<Input type="date" value="2024-01-01" onChange={handleChange} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("01/01/2024");
  });

  it("should display placeholder for date input", () => {
    renderWithProvider(<Input type="date" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("placeholder", "dd/MM/yyyy");
  });

  it("should set maxLength for date input", () => {
    renderWithProvider(<Input type="date" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("maxLength", "10");
  });

  it("should forward ref", () => {
    const ref = vi.fn();
    renderWithProvider(<Input ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });

  it("should pass through other input props", () => {
    renderWithProvider(<Input placeholder="Enter text" required />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("placeholder", "Enter text");
    expect(input).toBeRequired();
  });
});
