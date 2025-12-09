import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteUserModal } from "../delete-user-modal";
import { useTranslation } from "~/i18n";

vi.mock("~/i18n");
vi.mock("~/components/ui", () => ({
  ConfirmationModal: ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel,
    cancelLabel,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel: string;
  }) =>
    isOpen ? (
      <div data-testid="confirmation-modal">
        <h2>{title}</h2>
        <p>{message}</p>
        <button onClick={onClose}>{cancelLabel}</button>
        <button onClick={onConfirm}>{confirmLabel}</button>
      </div>
    ) : null,
}));

describe("DeleteUserModal", () => {
  const mockUseTranslation = vi.mocked(useTranslation);
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    userName: "John Doe",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTranslation.mockReturnValue({
      team: {
        deleteModal: {
          title: "Delete User",
          message: (name: string) => `Are you sure you want to delete ${name}?`,
          confirm: "Delete",
          cancel: "Cancel",
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
  });

  it("should render modal when open", () => {
    render(<DeleteUserModal {...defaultProps} />);
    expect(screen.getByTestId("confirmation-modal")).toBeInTheDocument();
  });

  it("should not render modal when closed", () => {
    render(<DeleteUserModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByTestId("confirmation-modal")).not.toBeInTheDocument();
  });

  it("should display user name in message", () => {
    render(<DeleteUserModal {...defaultProps} />);
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
  });

  it("should call onClose when cancel is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<DeleteUserModal {...defaultProps} onClose={onClose} />);

    const cancelButton = screen.getByText("Cancel");
    await user.click(cancelButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should call onConfirm when confirm is clicked", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<DeleteUserModal {...defaultProps} onConfirm={onConfirm} />);

    const confirmButton = screen.getByText("Delete");
    await user.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
