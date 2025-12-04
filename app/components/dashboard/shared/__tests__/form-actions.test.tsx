import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormActions } from "../form-actions";
import { LanguageProvider } from "~/contexts/language-context";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

vi.mock("~/components/ui", () => ({
  Button: vi.fn(
    ({
      children,
      onClick,
      disabled,
      type,
      variant,
    }: {
      children: React.ReactNode;
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

describe("FormActions", () => {
  const defaultProps = {
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render cancel and submit buttons", () => {
    render(
      <TestWrapper>
        <FormActions {...defaultProps} />
      </TestWrapper>
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it("should call onCancel when cancel button is clicked", async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <FormActions onCancel={onCancel} />
      </TestWrapper>
    );

    const cancelButton = screen.getByText(/cancel/i);
    await user.click(cancelButton);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("should disable buttons when isSubmitting is true", () => {
    render(
      <TestWrapper>
        <FormActions {...defaultProps} isSubmitting={true} />
      </TestWrapper>
    );

    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it("should show loading label when isSubmitting is true", () => {
    render(
      <TestWrapper>
        <FormActions {...defaultProps} isSubmitting={true} />
      </TestWrapper>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("should use custom cancel label", () => {
    render(
      <TestWrapper>
        <FormActions {...defaultProps} cancelLabel="Close" />
      </TestWrapper>
    );

    expect(screen.getByText("Close")).toBeInTheDocument();
  });

  it("should use custom submit label", () => {
    render(
      <TestWrapper>
        <FormActions {...defaultProps} submitLabel="Create" />
      </TestWrapper>
    );

    expect(screen.getByText("Create")).toBeInTheDocument();
  });

  it("should use custom loading label", () => {
    render(
      <TestWrapper>
        <FormActions {...defaultProps} isSubmitting={true} loadingLabel="Saving..." />
      </TestWrapper>
    );

    expect(screen.getByText("Saving...")).toBeInTheDocument();
  });

  it("should use custom submit variant", () => {
    render(
      <TestWrapper>
        <FormActions {...defaultProps} submitVariant="danger" />
      </TestWrapper>
    );

    const submitButton = screen.getByRole("button", { name: /save/i });
    expect(submitButton).toHaveAttribute("data-variant", "danger");
  });

  it("should hide cancel button when showCancel is false", () => {
    render(
      <TestWrapper>
        <FormActions {...defaultProps} showCancel={false} />
      </TestWrapper>
    );

    const cancelButton = screen.queryByText(/cancel/i);
    expect(cancelButton).not.toBeInTheDocument();
  });

  it("should hide submit button when showSubmit is false", () => {
    render(
      <TestWrapper>
        <FormActions {...defaultProps} showSubmit={false} />
      </TestWrapper>
    );

    const submitButton = screen.queryByRole("button", { name: /save/i });
    expect(submitButton).not.toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <TestWrapper>
        <FormActions {...defaultProps} className="custom-class" />
      </TestWrapper>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("custom-class");
  });

  it("should render submit button with type submit", () => {
    render(
      <TestWrapper>
        <FormActions {...defaultProps} />
      </TestWrapper>
    );

    const submitButton = screen.getByRole("button", { name: /save/i });
    expect(submitButton).toHaveAttribute("type", "submit");
  });

  it("should render cancel button with type button", () => {
    render(
      <TestWrapper>
        <FormActions {...defaultProps} />
      </TestWrapper>
    );

    const cancelButton = screen.getByText(/cancel/i);
    expect(cancelButton).toHaveAttribute("type", "button");
  });
});
