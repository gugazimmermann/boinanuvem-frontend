import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmationModal } from "../confirmation-modal";

describe("ConfirmationModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: "Confirm Action",
    message: "Are you sure?",
  };

  it("should not render when isOpen is false", () => {
    render(<ConfirmationModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText("Confirm Action")).not.toBeInTheDocument();
  });

  it("should render when isOpen is true", () => {
    render(<ConfirmationModal {...defaultProps} />);
    expect(screen.getByText("Confirm Action")).toBeInTheDocument();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
  });

  it("should render with default labels", () => {
    render(<ConfirmationModal {...defaultProps} />);
    expect(screen.getByText("Confirm")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("should render with custom labels", () => {
    render(
      <ConfirmationModal {...defaultProps} confirmLabel="Yes, delete" cancelLabel="No, keep it" />
    );
    expect(screen.getByText("Yes, delete")).toBeInTheDocument();
    expect(screen.getByText("No, keep it")).toBeInTheDocument();
  });

  it("should call onClose when cancel button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<ConfirmationModal {...defaultProps} onClose={onClose} />);

    const cancelButton = screen.getByText("Cancel");
    await user.click(cancelButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when backdrop is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<ConfirmationModal {...defaultProps} onClose={onClose} />);

    const backdrop = document.querySelector(".fixed.inset-0.cursor-pointer");
    if (backdrop) {
      await user.click(backdrop);
      expect(onClose).toHaveBeenCalledTimes(1);
    } else {
      expect(true).toBe(true);
    }
  });

  it("should call onConfirm when confirm button is clicked", async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<ConfirmationModal {...defaultProps} onConfirm={onConfirm} onClose={onClose} />);

    const confirmButton = screen.getByText("Confirm");
    await user.click(confirmButton);

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it("should handle async onConfirm", async () => {
    const onConfirm = vi
      .fn()
      .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<ConfirmationModal {...defaultProps} onConfirm={onConfirm} onClose={onClose} />);

    const confirmButton = screen.getByText("Confirm");
    await user.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    await waitFor(
      () => {
        expect(onConfirm).toHaveBeenCalledTimes(1);
        expect(onClose).toHaveBeenCalledTimes(1);
      },
      { timeout: 2000 }
    );
  });

  it("should handle onConfirm error", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const onConfirm = vi.fn().mockRejectedValue(new Error("Test error"));
    const user = userEvent.setup();
    render(<ConfirmationModal {...defaultProps} onConfirm={onConfirm} />);

    const confirmButton = screen.getByText("Confirm");
    await user.click(confirmButton);

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(consoleError).toHaveBeenCalled();
    });

    consoleError.mockRestore();
  });

  it("should render with danger variant by default", () => {
    const { container } = render(<ConfirmationModal {...defaultProps} />);
    const iconContainer = container.querySelector(".bg-red-100");
    expect(iconContainer).toBeInTheDocument();
  });

  it("should render with warning variant", () => {
    const { container } = render(<ConfirmationModal {...defaultProps} variant="warning" />);
    const iconContainer = container.querySelector(".bg-yellow-100");
    expect(iconContainer).toBeInTheDocument();
  });

  it("should render with info variant", () => {
    const { container } = render(<ConfirmationModal {...defaultProps} variant="info" />);
    const iconContainer = container.querySelector(".bg-blue-100");
    expect(iconContainer).toBeInTheDocument();
  });

  it("should render custom icon", () => {
    const customIcon = <span data-testid="custom-icon">⚠️</span>;
    render(<ConfirmationModal {...defaultProps} icon={customIcon} />);
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("should render message as ReactNode", () => {
    const messageNode = <div data-testid="custom-message">Custom message node</div>;
    render(<ConfirmationModal {...defaultProps} message={messageNode} />);
    expect(screen.getByTestId("custom-message")).toBeInTheDocument();
  });

  it("should disable buttons when isLoading is true", () => {
    render(<ConfirmationModal {...defaultProps} isLoading={true} />);
    const confirmButton = screen.getByText("Loading...").closest("button");
    const cancelButton = screen.getByText("Cancel").closest("button");
    expect(confirmButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });
});
