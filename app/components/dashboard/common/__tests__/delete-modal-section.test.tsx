import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteModalSection } from "../delete-modal-section";

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
    }) => {
      if (!isOpen) return null;
      return (
        <div data-testid="confirmation-modal" data-variant={variant}>
          <h2>{title}</h2>
          <p>{message}</p>
          <button onClick={onConfirm}>{confirmLabel}</button>
          <button onClick={onClose}>{cancelLabel}</button>
        </div>
      );
    }
  ),
  FixedAlert: vi.fn(
    ({ alertMessage }: { alertMessage: { title: string; variant: string } | null }) => {
      if (!alertMessage) return null;
      return <div data-testid="fixed-alert">{alertMessage.title}</div>;
    }
  ),
}));

describe("DeleteModalSection", () => {
  const defaultProps = {
    isDeleteModalOpen: false,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: "Delete Item",
    message: "Are you sure you want to delete this item?",
    confirmLabel: "Delete",
    cancelLabel: "Cancel",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render ConfirmationModal when isDeleteModalOpen is true", () => {
    render(<DeleteModalSection {...defaultProps} isDeleteModalOpen={true} />);
    expect(screen.getByTestId("confirmation-modal")).toBeInTheDocument();
  });

  it("should not render ConfirmationModal when isDeleteModalOpen is false", () => {
    render(<DeleteModalSection {...defaultProps} isDeleteModalOpen={false} />);
    expect(screen.queryByTestId("confirmation-modal")).not.toBeInTheDocument();
  });

  it("should render FixedAlert when alertMessage is provided", () => {
    const alertMessage = { title: "Item deleted successfully", variant: "success" as const };
    render(<DeleteModalSection {...defaultProps} alertMessage={alertMessage} />);
    expect(screen.getByTestId("fixed-alert")).toBeInTheDocument();
    expect(screen.getByText("Item deleted successfully")).toBeInTheDocument();
  });

  it("should not render FixedAlert when alertMessage is null", () => {
    render(<DeleteModalSection {...defaultProps} alertMessage={null} />);
    expect(screen.queryByTestId("fixed-alert")).not.toBeInTheDocument();
  });

  it("should not render FixedAlert when alertMessage is undefined", () => {
    render(<DeleteModalSection {...defaultProps} />);
    expect(screen.queryByTestId("fixed-alert")).not.toBeInTheDocument();
  });

  it("should pass title to ConfirmationModal", () => {
    render(<DeleteModalSection {...defaultProps} isDeleteModalOpen={true} title="Custom Title" />);
    expect(screen.getByText("Custom Title")).toBeInTheDocument();
  });

  it("should pass message to ConfirmationModal", () => {
    render(
      <DeleteModalSection {...defaultProps} isDeleteModalOpen={true} message="Custom message" />
    );
    expect(screen.getByText("Custom message")).toBeInTheDocument();
  });

  it("should pass confirmLabel to ConfirmationModal", () => {
    render(
      <DeleteModalSection {...defaultProps} isDeleteModalOpen={true} confirmLabel="Yes, delete" />
    );
    expect(screen.getByText("Yes, delete")).toBeInTheDocument();
  });

  it("should pass cancelLabel to ConfirmationModal", () => {
    render(
      <DeleteModalSection {...defaultProps} isDeleteModalOpen={true} cancelLabel="No, keep" />
    );
    expect(screen.getByText("No, keep")).toBeInTheDocument();
  });

  it("should call onClose when cancel button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<DeleteModalSection {...defaultProps} isDeleteModalOpen={true} onClose={onClose} />);
    const cancelButton = screen.getByText("Cancel");
    await user.click(cancelButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should call onConfirm when confirm button is clicked", async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(<DeleteModalSection {...defaultProps} isDeleteModalOpen={true} onConfirm={onConfirm} />);
    const confirmButton = screen.getByText("Delete");
    await user.click(confirmButton);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("should render both FixedAlert and ConfirmationModal when both are provided", () => {
    const alertMessage = { title: "Success", variant: "success" as const };
    render(
      <DeleteModalSection {...defaultProps} isDeleteModalOpen={true} alertMessage={alertMessage} />
    );
    expect(screen.getByTestId("fixed-alert")).toBeInTheDocument();
    expect(screen.getByTestId("confirmation-modal")).toBeInTheDocument();
  });

  it("should pass variant danger to ConfirmationModal", () => {
    render(<DeleteModalSection {...defaultProps} isDeleteModalOpen={true} />);
    const modal = screen.getByTestId("confirmation-modal");
    expect(modal).toHaveAttribute("data-variant", "danger");
  });
});
