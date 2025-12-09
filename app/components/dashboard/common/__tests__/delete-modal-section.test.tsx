import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteModalSection } from "../delete-modal-section";

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
  FixedAlert: ({ alertMessage }: { alertMessage: unknown }) =>
    alertMessage ? <div data-testid="fixed-alert">{String(alertMessage)}</div> : null,
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

  it("should render confirmation modal when open", () => {
    render(<DeleteModalSection {...defaultProps} isDeleteModalOpen={true} />);

    expect(screen.getByTestId("confirmation-modal")).toBeInTheDocument();
    expect(screen.getByText("Delete Item")).toBeInTheDocument();
    expect(screen.getByText("Are you sure you want to delete this item?")).toBeInTheDocument();
  });

  it("should not render confirmation modal when closed", () => {
    render(<DeleteModalSection {...defaultProps} isDeleteModalOpen={false} />);

    expect(screen.queryByTestId("confirmation-modal")).not.toBeInTheDocument();
  });

  it("should call onClose when cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<DeleteModalSection {...defaultProps} isDeleteModalOpen={true} onClose={onClose} />);

    const cancelButton = screen.getByText("Cancel");
    await user.click(cancelButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should call onConfirm when confirm button is clicked", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<DeleteModalSection {...defaultProps} isDeleteModalOpen={true} onConfirm={onConfirm} />);

    const confirmButton = screen.getByText("Delete");
    await user.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("should render FixedAlert when alertMessage is provided", () => {
    const alertMessage = { title: "Error occurred", variant: "error" as const };
    render(<DeleteModalSection {...defaultProps} alertMessage={alertMessage} />);

    expect(screen.getByTestId("fixed-alert")).toBeInTheDocument();
  });

  it("should not render FixedAlert when alertMessage is null", () => {
    render(<DeleteModalSection {...defaultProps} alertMessage={null} />);

    expect(screen.queryByTestId("fixed-alert")).not.toBeInTheDocument();
  });

  it("should not render FixedAlert when alertMessage is undefined", () => {
    render(<DeleteModalSection {...defaultProps} />);

    expect(screen.queryByTestId("fixed-alert")).not.toBeInTheDocument();
  });

  it("should render with custom labels", () => {
    render(
      <DeleteModalSection
        {...defaultProps}
        isDeleteModalOpen={true}
        confirmLabel="Yes, Delete"
        cancelLabel="No, Keep"
      />
    );

    expect(screen.getByText("Yes, Delete")).toBeInTheDocument();
    expect(screen.getByText("No, Keep")).toBeInTheDocument();
  });
});
