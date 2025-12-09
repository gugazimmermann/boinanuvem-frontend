import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormPageLayout } from "../form-page-layout";

vi.mock("~/components/ui", () => ({
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  FixedAlert: ({ alertMessage }: { alertMessage: unknown }) =>
    alertMessage ? <div data-testid="alert">{String(alertMessage)}</div> : null,
}));

describe("FormPageLayout", () => {
  const defaultProps = {
    title: "Test Form",
    backButtonLabel: "Back",
    onBack: vi.fn(),
    isSubmitting: false,
    submitButtonLabel: "Submit",
    cancelButtonLabel: "Cancel",
    onSubmit: vi.fn(),
    children: <div>Form Content</div>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render title", () => {
    render(<FormPageLayout {...defaultProps} />);
    expect(screen.getByText("Test Form")).toBeInTheDocument();
  });

  it("should render description when provided", () => {
    render(<FormPageLayout {...defaultProps} description="Form description" />);
    expect(screen.getByText("Form description")).toBeInTheDocument();
  });

  it("should render children", () => {
    render(<FormPageLayout {...defaultProps} />);
    expect(screen.getByText("Form Content")).toBeInTheDocument();
  });

  it("should render back button", () => {
    render(<FormPageLayout {...defaultProps} />);
    expect(screen.getByText("Back")).toBeInTheDocument();
  });

  it("should call onBack when back button is clicked", async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    render(<FormPageLayout {...defaultProps} onBack={onBack} />);

    const backButton = screen.getByText("Back");
    await user.click(backButton);

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("should render submit and cancel buttons", () => {
    render(<FormPageLayout {...defaultProps} />);
    expect(screen.getByText("Submit")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("should disable buttons when isSubmitting is true", () => {
    render(<FormPageLayout {...defaultProps} isSubmitting={true} />);
    const submitButton = screen.getByText("Submit");
    const cancelButton = screen.getByText("Cancel");
    expect(submitButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it("should call onSubmit when form is submitted", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(<FormPageLayout {...defaultProps} onSubmit={onSubmit} />);

    const form = screen.getByText("Submit").closest("form");
    if (form) {
      await user.click(screen.getByText("Submit"));
      expect(onSubmit).toHaveBeenCalled();
    }
  });

  it("should call onCancel when cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<FormPageLayout {...defaultProps} onCancel={onCancel} />);

    const cancelButton = screen.getByText("Cancel");
    await user.click(cancelButton);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("should render alert when alertMessage is provided", () => {
    render(
      <FormPageLayout {...defaultProps} alertMessage={{ title: "Error", variant: "error" }} />
    );
    expect(screen.getByTestId("alert")).toBeInTheDocument();
  });

  it("should use 2xl title size by default", () => {
    const { container } = render(<FormPageLayout {...defaultProps} />);
    const title = container.querySelector("h1");
    expect(title).toHaveClass("text-2xl");
  });

  it("should use 3xl title size when specified", () => {
    const { container } = render(<FormPageLayout {...defaultProps} titleSize="3xl" />);
    const title = container.querySelector("h1");
    expect(title).toHaveClass("text-3xl");
  });
});
