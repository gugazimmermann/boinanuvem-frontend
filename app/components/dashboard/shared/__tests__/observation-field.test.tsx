import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ObservationField } from "../observation-field";
import { useTranslation } from "~/i18n";

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(),
}));

describe("ObservationField", () => {
  const mockUseTranslation = vi.mocked(useTranslation);
  const defaultProps = {
    label: "Observations",
    value: "",
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTranslation.mockReturnValue({
      properties: {
        details: {
          movements: {
            observationPlaceholder: "Add observations...",
          },
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
  });

  it("should render label", () => {
    render(<ObservationField {...defaultProps} />);
    expect(screen.getByText("Observations")).toBeInTheDocument();
  });

  it("should render required indicator when required is true", () => {
    render(<ObservationField {...defaultProps} required={true} />);
    const label = screen.getByText("Observations");
    expect(label.querySelector(".text-red-500")).toBeInTheDocument();
  });

  it("should not render required indicator when required is false", () => {
    render(<ObservationField {...defaultProps} required={false} />);
    const label = screen.getByText("Observations");
    expect(label.querySelector(".text-red-500")).not.toBeInTheDocument();
  });

  it("should render textarea with value", () => {
    render(<ObservationField {...defaultProps} value="Test observation" />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveValue("Test observation");
  });

  it("should call onChange when textarea value changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ObservationField {...defaultProps} onChange={onChange} />);

    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "New observation");

    expect(onChange).toHaveBeenCalled();
  });

  it("should render error message when error is provided", () => {
    render(<ObservationField {...defaultProps} error="This field is required" />);
    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });

  it("should not render error message when error is not provided", () => {
    const { container } = render(<ObservationField {...defaultProps} />);
    expect(container.querySelector(".text-red-500")).not.toBeInTheDocument();
  });

  it("should disable textarea when disabled is true", () => {
    render(<ObservationField {...defaultProps} disabled={true} />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeDisabled();
  });

  it("should use custom placeholder when provided", () => {
    render(<ObservationField {...defaultProps} placeholder="Custom placeholder" />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("placeholder", "Custom placeholder");
  });

  it("should use default placeholder when not provided", () => {
    render(<ObservationField {...defaultProps} />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("placeholder", "Add observations...");
  });

  it("should use default rows value", () => {
    render(<ObservationField {...defaultProps} />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("rows", "4");
  });

  it("should use custom rows value", () => {
    render(<ObservationField {...defaultProps} rows={6} />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("rows", "6");
  });

  it("should apply custom className", () => {
    const { container } = render(<ObservationField {...defaultProps} className="custom-class" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("custom-class");
  });
});
