import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormActions } from "../form-actions";
import { useTranslation } from "~/i18n";

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(),
}));

vi.mock("~/components/ui", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    type,
    variant,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    type?: string;
    variant?: string;
  }) => (
    <button
      type={type as "submit" | "reset" | "button" | undefined}
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
    >
      {children}
    </button>
  ),
}));

describe("FormActions", () => {
  const mockUseTranslation = vi.mocked(useTranslation);
  const defaultProps = {
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTranslation.mockReturnValue({
      common: {
        cancel: "Cancel",
        save: "Save",
        loading: "Loading...",
      },
    } as unknown as ReturnType<typeof useTranslation>);
  });

  it("should render cancel and submit buttons by default", () => {
    render(<FormActions {...defaultProps} />);
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  it("should call onCancel when cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<FormActions {...defaultProps} onCancel={onCancel} />);

    const cancelButton = screen.getByText("Cancel");
    await user.click(cancelButton);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("should disable buttons when isSubmitting is true", () => {
    render(<FormActions {...defaultProps} isSubmitting={true} />);
    const cancelButton = screen.getByText("Cancel").closest("button");
    const submitButton = screen.getByText("Loading...").closest("button");

    expect(cancelButton).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it("should show loading label when isSubmitting is true", () => {
    render(<FormActions {...defaultProps} isSubmitting={true} />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByText("Save")).not.toBeInTheDocument();
  });

  it("should use custom cancel label", () => {
    render(<FormActions {...defaultProps} cancelLabel="Go Back" />);
    expect(screen.getByText("Go Back")).toBeInTheDocument();
  });

  it("should use custom submit label", () => {
    render(<FormActions {...defaultProps} submitLabel="Create" />);
    expect(screen.getByText("Create")).toBeInTheDocument();
  });

  it("should use custom loading label", () => {
    render(<FormActions {...defaultProps} isSubmitting={true} loadingLabel="Saving..." />);
    expect(screen.getByText("Saving...")).toBeInTheDocument();
  });

  it("should apply primary variant to submit button by default", () => {
    render(<FormActions {...defaultProps} />);
    const submitButton = screen.getByText("Save");
    expect(submitButton).toBeInTheDocument();
  });

  it("should apply danger variant to submit button when specified", () => {
    render(<FormActions {...defaultProps} submitVariant="danger" />);
    const submitButton = screen.getByText("Save");
    expect(submitButton).toBeInTheDocument();
  });

  it("should hide cancel button when showCancel is false", () => {
    render(<FormActions {...defaultProps} showCancel={false} />);
    expect(screen.queryByText("Cancel")).not.toBeInTheDocument();
  });

  it("should hide submit button when showSubmit is false", () => {
    render(<FormActions {...defaultProps} showSubmit={false} />);
    expect(screen.queryByText("Save")).not.toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(<FormActions {...defaultProps} className="custom-class" />);
    const actionsDiv = container.firstChild as HTMLElement;
    expect(actionsDiv).toHaveClass("custom-class");
  });
});
