import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthInput } from "../auth-input";
import { LanguageProvider } from "~/contexts/language-context";

const renderWithProvider = (component: React.ReactElement) => {
  return render(<LanguageProvider>{component}</LanguageProvider>);
};

describe("AuthInput", () => {
  it("should render input", () => {
    renderWithProvider(<AuthInput />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("should render with label", () => {
    renderWithProvider(<AuthInput label="Test Label" />);
    expect(screen.getByLabelText("Test Label")).toBeInTheDocument();
  });

  it("should render with helper text", () => {
    renderWithProvider(<AuthInput helperText="Helper text" />);
    expect(screen.getByText("Helper text")).toBeInTheDocument();
  });

  it("should render with error message", () => {
    renderWithProvider(<AuthInput error="Error message" />);
    expect(screen.getByText("Error message")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("should prioritize error over helper text", () => {
    renderWithProvider(<AuthInput error="Error" helperText="Helper" />);
    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.queryByText("Helper")).not.toBeInTheDocument();
  });

  it("should handle value changes", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    renderWithProvider(<AuthInput onChange={handleChange} />);
    const input = screen.getByRole("textbox");

    await user.type(input, "test");
    expect(handleChange).toHaveBeenCalled();
  });

  it("should apply custom className", () => {
    const { container } = renderWithProvider(<AuthInput className="custom-class" />);
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv.className).toContain("custom-class");
  });

  it("should apply inputClassName", () => {
    renderWithProvider(<AuthInput inputClassName="custom-input" />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("custom-input");
  });

  it("should handle password type with toggle", async () => {
    const user = userEvent.setup();
    renderWithProvider(<AuthInput type="password" showPasswordToggle />);
    const input = document.querySelector('input[type="password"]') as HTMLInputElement;
    expect(input).toBeInTheDocument();

    const toggleButton = screen.getByLabelText("Show password");
    await user.click(toggleButton);

    const textInput = document.querySelector('input[type="text"]') as HTMLInputElement;
    expect(textInput).toBeInTheDocument();
    expect(screen.getByLabelText("Hide password")).toBeInTheDocument();
  });

  it("should not show password toggle for non-password types", () => {
    renderWithProvider(<AuthInput type="text" showPasswordToggle />);
    expect(screen.queryByLabelText("Show password")).not.toBeInTheDocument();
  });

  it("should use provided id", () => {
    renderWithProvider(<AuthInput id="custom-id" label="Label" />);
    const input = screen.getByLabelText("Label");
    expect(input).toHaveAttribute("id", "custom-id");
  });

  it("should generate id when not provided", () => {
    renderWithProvider(<AuthInput label="Label" />);
    const input = screen.getByLabelText("Label");
    expect(input).toHaveAttribute("id");
  });
});
