import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PropertyFormLayout } from "../property-form-layout";

vi.mock("~/components/ui", () => ({
  Button: vi.fn(
    ({
      children,
      onClick,
      disabled,
      type,
      variant,
    }: {
      children?: React.ReactNode;
      onClick?: () => void;
      disabled?: boolean;
      type?: "button" | "submit" | "reset";
      variant?: string;
    }) => (
      <button onClick={onClick} disabled={disabled} type={type} data-variant={variant}>
        {children}
      </button>
    )
  ),
}));

describe("PropertyFormLayout", () => {
  const defaultProps = {
    title: "Property Form",
    description: "Form description",
    backButtonLabel: "Back",
    onBack: vi.fn(),
    cancelButtonLabel: "Cancel",
    onCancel: vi.fn(),
    submitButtonLabel: "Submit",
    isSubmitting: false,
    onSubmit: vi.fn((e: React.FormEvent) => e.preventDefault()),
    formContent: <div>Form Content</div>,
    alertDisplay: () => null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render title and description", () => {
    render(<PropertyFormLayout {...defaultProps} />);
    expect(screen.getByText("Property Form")).toBeInTheDocument();
    expect(screen.getByText("Form description")).toBeInTheDocument();
  });

  it("should render back button", async () => {
    const onBack = vi.fn();
    const user = userEvent.setup();
    render(<PropertyFormLayout {...defaultProps} onBack={onBack} />);
    const backButton = screen.getByText("Back");
    await user.click(backButton);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("should render form content", () => {
    render(<PropertyFormLayout {...defaultProps} />);
    expect(screen.getByText("Form Content")).toBeInTheDocument();
  });

  it("should call onSubmit when form is submitted", async () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    const { container } = render(<PropertyFormLayout {...defaultProps} onSubmit={onSubmit} />);
    const form = container.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      expect(onSubmit).toHaveBeenCalledTimes(1);
    }
  });

  it("should call onCancel when cancel button is clicked", async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(<PropertyFormLayout {...defaultProps} onCancel={onCancel} />);
    const cancelButton = screen.getByText("Cancel");
    await user.click(cancelButton);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("should disable buttons when isSubmitting is true", () => {
    render(<PropertyFormLayout {...defaultProps} isSubmitting={true} />);
    const backButton = screen.getByText("Back");
    const cancelButton = screen.getByText("Cancel");
    expect(backButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
    // When isSubmitting is true, submit button shows loading label instead of "Submit"
    expect(screen.getByText("Carregando...")).toBeInTheDocument();
  });

  it("should display loading label when isSubmitting is true", () => {
    render(<PropertyFormLayout {...defaultProps} isSubmitting={true} loadingLabel="Saving..." />);
    expect(screen.getByText("Saving...")).toBeInTheDocument();
  });

  it("should render alert display", () => {
    const alertDisplay = () => <div data-testid="alert">Alert</div>;
    render(<PropertyFormLayout {...defaultProps} alertDisplay={alertDisplay} />);
    expect(screen.getByTestId("alert")).toBeInTheDocument();
  });
});
