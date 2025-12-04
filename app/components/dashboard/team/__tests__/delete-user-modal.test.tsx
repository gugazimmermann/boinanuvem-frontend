import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteUserModal } from "../delete-user-modal";
import { LanguageProvider } from "~/contexts/language-context";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

vi.mock("~/components/ui", () => ({
  ConfirmationModal: vi.fn(
    ({
      isOpen,
      onClose,
      onConfirm,
      title,
      message,
      confirmLabel,
      cancelLabel,
      variant,
    }: {
      isOpen: boolean;
      onClose: () => void;
      onConfirm: () => void;
      title: string;
      message: string;
      confirmLabel: string;
      cancelLabel: string;
      variant?: string;
    }) =>
      isOpen ? (
        <div data-testid="confirmation-modal" data-variant={variant}>
          <h3>{title}</h3>
          <p>{message}</p>
          <button onClick={onConfirm}>{confirmLabel}</button>
          <button onClick={onClose}>{cancelLabel}</button>
        </div>
      ) : null
  ),
}));

describe("DeleteUserModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    userName: "John Doe",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render modal when isOpen is true", () => {
    render(
      <TestWrapper>
        <DeleteUserModal {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByTestId("confirmation-modal")).toBeInTheDocument();
  });

  it("should not render modal when isOpen is false", () => {
    render(
      <TestWrapper>
        <DeleteUserModal {...defaultProps} isOpen={false} />
      </TestWrapper>
    );

    expect(screen.queryByTestId("confirmation-modal")).not.toBeInTheDocument();
  });

  it("should display user name in message", () => {
    render(
      <TestWrapper>
        <DeleteUserModal {...defaultProps} userName="Jane Smith" />
      </TestWrapper>
    );

    expect(screen.getByText(/jane smith/i)).toBeInTheDocument();
  });

  it("should call onConfirm when confirm button is clicked", async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <DeleteUserModal {...defaultProps} onConfirm={onConfirm} />
      </TestWrapper>
    );

    const confirmButton = screen.getByRole("button", { name: /confirm|delete/i });
    await user.click(confirmButton);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when cancel button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <DeleteUserModal {...defaultProps} onClose={onClose} />
      </TestWrapper>
    );

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should use danger variant", () => {
    render(
      <TestWrapper>
        <DeleteUserModal {...defaultProps} />
      </TestWrapper>
    );

    const modal = screen.getByTestId("confirmation-modal");
    expect(modal).toHaveAttribute("data-variant", "danger");
  });

  it("should display title", () => {
    render(
      <TestWrapper>
        <DeleteUserModal {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByRole("heading")).toBeInTheDocument();
  });
});
