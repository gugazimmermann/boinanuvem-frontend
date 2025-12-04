import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormPageLayout } from "../form-page-layout";

vi.mock("~/components/ui", () => ({
  Button: vi.fn(
    ({
      children,
      onClick,
      disabled,
      variant,
      type,
    }: {
      children: React.ReactNode;
      onClick?: () => void;
      disabled?: boolean;
      variant?: string;
      type?: "button" | "submit" | "reset";
    }) => (
      <button onClick={onClick} disabled={disabled} data-variant={variant} type={type}>
        {children}
      </button>
    )
  ),
  FixedAlert: vi.fn(({ alertMessage }: { alertMessage: unknown }) => {
    if (!alertMessage) return null;
    return <div data-testid="fixed-alert">Alert</div>;
  }),
}));

describe("FormPageLayout", () => {
  const defaultProps = {
    title: "Form Title",
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
    expect(screen.getByText("Form Title")).toBeInTheDocument();
  });

  it("should render description when provided", () => {
    render(<FormPageLayout {...defaultProps} description="Form description" />);
    expect(screen.getByText("Form description")).toBeInTheDocument();
  });

  it("should not render description when not provided", () => {
    render(<FormPageLayout {...defaultProps} />);
    expect(screen.queryByText("Form description")).not.toBeInTheDocument();
  });

  it("should render back button", () => {
    render(<FormPageLayout {...defaultProps} />);
    expect(screen.getByText("Back")).toBeInTheDocument();
  });

  it("should call onBack when back button is clicked", async () => {
    const onBack = vi.fn();
    const user = userEvent.setup();
    render(<FormPageLayout {...defaultProps} onBack={onBack} />);
    const backButton = screen.getByText("Back");
    await user.click(backButton);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("should render submit button", () => {
    render(<FormPageLayout {...defaultProps} />);
    expect(screen.getByText("Submit")).toBeInTheDocument();
  });

  it("should render cancel button", () => {
    render(<FormPageLayout {...defaultProps} />);
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("should call onSubmit when form is submitted", async () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    const user = userEvent.setup();
    render(<FormPageLayout {...defaultProps} onSubmit={onSubmit} />);
    const form = screen.getByText("Submit").closest("form");
    if (form) {
      await user.click(screen.getByText("Submit"));
      expect(onSubmit).toHaveBeenCalled();
    }
  });

  it("should call onCancel when cancel button is clicked", async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(<FormPageLayout {...defaultProps} onCancel={onCancel} />);
    const cancelButton = screen.getByText("Cancel");
    await user.click(cancelButton);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("should call onBack when cancel button is clicked if onCancel not provided", async () => {
    const onBack = vi.fn();
    const user = userEvent.setup();
    render(<FormPageLayout {...defaultProps} onBack={onBack} />);
    const cancelButton = screen.getByText("Cancel");
    await user.click(cancelButton);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("should render children", () => {
    render(<FormPageLayout {...defaultProps} />);
    expect(screen.getByText("Form Content")).toBeInTheDocument();
  });

  it("should disable buttons when isSubmitting is true", () => {
    render(<FormPageLayout {...defaultProps} isSubmitting={true} />);
    const backButton = screen.getByText("Back");
    const submitButton = screen.getByText("Submit");
    const cancelButton = screen.getByText("Cancel");
    expect(backButton).toBeDisabled();
    expect(submitButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it("should render FixedAlert when alertMessage is provided", () => {
    const alertMessage = { title: "Success", variant: "success" as const };
    render(<FormPageLayout {...defaultProps} alertMessage={alertMessage} />);
    expect(screen.getByTestId("fixed-alert")).toBeInTheDocument();
  });

  it("should not render FixedAlert when alertMessage is null", () => {
    render(<FormPageLayout {...defaultProps} alertMessage={null} />);
    expect(screen.queryByTestId("fixed-alert")).not.toBeInTheDocument();
  });

  it("should render with default title size", () => {
    const { container } = render(<FormPageLayout {...defaultProps} />);
    const title = container.querySelector("h1");
    expect(title).toHaveClass("text-2xl");
  });

  it("should render with 3xl title size", () => {
    const { container } = render(<FormPageLayout {...defaultProps} titleSize="3xl" />);
    const title = container.querySelector("h1");
    expect(title).toHaveClass("text-3xl");
  });

  it("should apply custom formClassName", () => {
    const { container } = render(
      <FormPageLayout {...defaultProps} formClassName="custom-form-class" />
    );
    const formContainer = container.querySelector(".custom-form-class");
    expect(formContainer).toBeInTheDocument();
  });

  it("should apply custom containerClassName", () => {
    const { container } = render(
      <FormPageLayout {...defaultProps} containerClassName="custom-container-class" />
    );
    expect(container.firstChild).toHaveClass("custom-container-class");
  });

  it("should apply custom formSpacing", () => {
    const { container } = render(<FormPageLayout {...defaultProps} formSpacing="custom-spacing" />);
    const form = container.querySelector("form");
    expect(form).toHaveClass("custom-spacing");
  });
});
