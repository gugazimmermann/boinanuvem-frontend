import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ObservationField } from "../observation-field";
import { LanguageProvider } from "~/contexts/language-context";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

describe("ObservationField", () => {
  const defaultProps = {
    label: "Observations",
    value: "",
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render label", () => {
    render(
      <TestWrapper>
        <ObservationField {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText("Observations")).toBeInTheDocument();
  });

  it("should render textarea", () => {
    render(
      <TestWrapper>
        <ObservationField {...defaultProps} />
      </TestWrapper>
    );

    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeInTheDocument();
  });

  it("should display value", () => {
    render(
      <TestWrapper>
        <ObservationField {...defaultProps} value="Test observation" />
      </TestWrapper>
    );

    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.value).toBe("Test observation");
  });

  it("should call onChange when value changes", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <ObservationField {...defaultProps} onChange={onChange} />
      </TestWrapper>
    );

    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "New observation");
    expect(onChange).toHaveBeenCalled();
  });

  it("should display error message", () => {
    render(
      <TestWrapper>
        <ObservationField {...defaultProps} error="This field is required" />
      </TestWrapper>
    );

    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });

  it("should disable textarea when disabled is true", () => {
    render(
      <TestWrapper>
        <ObservationField {...defaultProps} disabled={true} />
      </TestWrapper>
    );

    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeDisabled();
  });

  it("should use custom placeholder", () => {
    render(
      <TestWrapper>
        <ObservationField {...defaultProps} placeholder="Enter observations here" />
      </TestWrapper>
    );

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("placeholder", "Enter observations here");
  });

  it("should use default placeholder when not provided", () => {
    render(
      <TestWrapper>
        <ObservationField {...defaultProps} />
      </TestWrapper>
    );

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("placeholder");
  });

  it("should use custom rows", () => {
    render(
      <TestWrapper>
        <ObservationField {...defaultProps} rows={6} />
      </TestWrapper>
    );

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("rows", "6");
  });

  it("should use default rows when not provided", () => {
    render(
      <TestWrapper>
        <ObservationField {...defaultProps} />
      </TestWrapper>
    );

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("rows", "4");
  });

  it("should show required indicator when required is true", () => {
    render(
      <TestWrapper>
        <ObservationField {...defaultProps} required={true} />
      </TestWrapper>
    );

    const requiredIndicator = screen.getByText("*");
    expect(requiredIndicator).toBeInTheDocument();
  });

  it("should not show required indicator when required is false", () => {
    render(
      <TestWrapper>
        <ObservationField {...defaultProps} required={false} />
      </TestWrapper>
    );

    const requiredIndicator = screen.queryByText("*");
    expect(requiredIndicator).not.toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <TestWrapper>
        <ObservationField {...defaultProps} className="custom-class" />
      </TestWrapper>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("custom-class");
  });

  it("should apply error styling when error exists", () => {
    const { container } = render(
      <TestWrapper>
        <ObservationField {...defaultProps} error="Error message" />
      </TestWrapper>
    );

    const textarea = container.querySelector("textarea");
    expect(textarea).toHaveClass("border-red-500");
  });
});
