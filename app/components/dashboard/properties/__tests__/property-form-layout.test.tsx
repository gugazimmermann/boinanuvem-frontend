import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PropertyFormLayout } from "../property-form-layout";

vi.mock("~/components/ui", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    type,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    type?: string;
  }) => (
    <button
      type={type as "submit" | "reset" | "button" | undefined}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
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
    submitButtonLabel: "Save",
    isSubmitting: false,
    onSubmit: vi.fn((e: React.FormEvent) => e.preventDefault()),
    formContent: <div>Form Content</div>,
    alertDisplay: () => null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render title", () => {
    render(<PropertyFormLayout {...defaultProps} />);
    expect(screen.getByText("Property Form")).toBeInTheDocument();
  });

  it("should render description", () => {
    render(<PropertyFormLayout {...defaultProps} />);
    expect(screen.getByText("Form description")).toBeInTheDocument();
  });

  it("should render form content", () => {
    render(<PropertyFormLayout {...defaultProps} />);
    expect(screen.getByText("Form Content")).toBeInTheDocument();
  });

  it("should call onBack when back button is clicked", async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    render(<PropertyFormLayout {...defaultProps} onBack={onBack} />);

    const backButton = screen.getByText("Back");
    await user.click(backButton);

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("should call onCancel when cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<PropertyFormLayout {...defaultProps} onCancel={onCancel} />);

    const cancelButton = screen.getByText("Cancel");
    await user.click(cancelButton);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("should call onSubmit when form is submitted", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(<PropertyFormLayout {...defaultProps} onSubmit={onSubmit} />);

    const form = screen.getByText("Save").closest("form");
    if (form) {
      await user.click(screen.getByText("Save"));
      expect(onSubmit).toHaveBeenCalled();
    }
  });

  it("should disable buttons when isSubmitting is true", () => {
    render(<PropertyFormLayout {...defaultProps} isSubmitting={true} />);
    const backButton = screen.getByText("Back").closest("button");
    const saveButton = screen.getByText("Carregando...").closest("button");
    expect(backButton).toBeDisabled();
    expect(saveButton).toBeDisabled();
  });

  it("should show loading label when isSubmitting is true", () => {
    render(<PropertyFormLayout {...defaultProps} isSubmitting={true} loadingLabel="Saving..." />);
    expect(screen.getByText("Saving...")).toBeInTheDocument();
  });
});
