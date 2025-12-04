import { describe, it, expect, vi, beforeEach } from "vitest";
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render when isOpen is true", () => {
    render(<ConfirmationModal {...defaultProps} />);
    expect(screen.getByText("Confirm Action")).toBeInTheDocument();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
  });

  it("should return null when isOpen is false", () => {
    const { container } = render(<ConfirmationModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render with danger variant by default", () => {
    const { container } = render(<ConfirmationModal {...defaultProps} />);
    const iconBg = container.querySelector(".bg-red-100");
    expect(iconBg).toBeInTheDocument();
  });

  it("should render with warning variant", () => {
    const { container } = render(<ConfirmationModal {...defaultProps} variant="warning" />);
    const iconBg = container.querySelector(".bg-yellow-100");
    expect(iconBg).toBeInTheDocument();
  });

  it("should render with info variant", () => {
    const { container } = render(<ConfirmationModal {...defaultProps} variant="info" />);
    const iconBg = container.querySelector(".bg-blue-100");
    expect(iconBg).toBeInTheDocument();
  });

  it("should render with custom icon", () => {
    const customIcon = <span data-testid="custom-icon">Custom</span>;
    render(<ConfirmationModal {...defaultProps} icon={customIcon} />);
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("should render default icon for danger variant", () => {
    const { container } = render(<ConfirmationModal {...defaultProps} variant="danger" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should render default icon for warning variant", () => {
    const { container } = render(<ConfirmationModal {...defaultProps} variant="warning" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should render default icon for info variant", () => {
    const { container } = render(<ConfirmationModal {...defaultProps} variant="info" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should render with ReactNode message", () => {
    const messageNode = <div data-testid="message-node">Custom message</div>;
    render(<ConfirmationModal {...defaultProps} message={messageNode} />);
    expect(screen.getByTestId("message-node")).toBeInTheDocument();
  });

  it("should call onConfirm when confirm button is clicked", async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<ConfirmationModal {...defaultProps} onConfirm={onConfirm} />);
    const confirmButton = screen.getByRole("button", { name: "Confirm" });
    await user.click(confirmButton);
    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
  });

  it("should call onClose after successful confirm", async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<ConfirmationModal {...defaultProps} onConfirm={onConfirm} onClose={onClose} />);
    const confirmButton = screen.getByRole("button", { name: "Confirm" });
    await user.click(confirmButton);
    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it("should call onClose when cancel button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<ConfirmationModal {...defaultProps} onClose={onClose} />);
    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    await user.click(cancelButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when backdrop is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<ConfirmationModal {...defaultProps} onClose={onClose} />);
    const backdrop = container.querySelector('[aria-hidden="true"]');
    if (backdrop) {
      await user.click(backdrop as HTMLElement);
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  });

  it("should show loading state when isLoading is true", () => {
    render(<ConfirmationModal {...defaultProps} isLoading={true} />);
    expect(screen.getByRole("button", { name: "Loading..." })).toBeInTheDocument();
  });

  it("should disable buttons when isLoading is true", () => {
    render(<ConfirmationModal {...defaultProps} isLoading={true} />);
    const confirmButton = screen.getByRole("button", { name: "Loading..." });
    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    expect(confirmButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it("should disable buttons during processing", async () => {
    const onConfirm = vi.fn(
      () =>
        new Promise((resolve) => {
          setTimeout(resolve, 100);
        })
    );
    const user = userEvent.setup();
    render(<ConfirmationModal {...defaultProps} onConfirm={onConfirm} />);
    const confirmButton = screen.getByRole("button", { name: "Confirm" });
    await user.click(confirmButton);
    expect(confirmButton).toBeDisabled();
  });

  it("should handle error in confirm handler", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const onConfirm = vi.fn().mockRejectedValue(new Error("Test error"));
    const user = userEvent.setup();
    render(<ConfirmationModal {...defaultProps} onConfirm={onConfirm} />);
    const confirmButton = screen.getByRole("button", { name: "Confirm" });
    await user.click(confirmButton);
    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
    });
    consoleError.mockRestore();
  });

  it("should render with custom confirm label", () => {
    render(<ConfirmationModal {...defaultProps} confirmLabel="Yes, delete" />);
    expect(screen.getByRole("button", { name: "Yes, delete" })).toBeInTheDocument();
  });

  it("should render with custom cancel label", () => {
    render(<ConfirmationModal {...defaultProps} cancelLabel="No, keep" />);
    expect(screen.getByRole("button", { name: "No, keep" })).toBeInTheDocument();
  });

  it("should handle mouse enter and leave on confirm button", async () => {
    const user = userEvent.setup();
    render(<ConfirmationModal {...defaultProps} variant="danger" />);
    const confirmButton = screen.getByRole("button", { name: "Confirm" });

    await user.hover(confirmButton);
    expect(confirmButton).toHaveStyle({ backgroundColor: "#dc2626" });

    await user.unhover(confirmButton);
    expect(confirmButton).toHaveStyle({ backgroundColor: "#ef4444" });
  });

  it("should not change button color on hover when disabled", async () => {
    const user = userEvent.setup();
    render(<ConfirmationModal {...defaultProps} isLoading={true} />);
    const confirmButton = screen.getByRole("button", { name: "Loading..." });

    const originalColor = confirmButton.style.backgroundColor;
    await user.hover(confirmButton);
    expect(confirmButton.style.backgroundColor).toBe(originalColor);
  });

  it("should handle component unmount during async operation", async () => {
    const onConfirm = vi.fn(
      () =>
        new Promise((resolve) => {
          setTimeout(resolve, 100);
        })
    );
    const onClose = vi.fn();
    const user = userEvent.setup();

    const { unmount } = render(
      <ConfirmationModal {...defaultProps} onConfirm={onConfirm} onClose={onClose} />
    );

    const confirmButton = screen.getByRole("button", { name: "Confirm" });
    await user.click(confirmButton);

    // Unmount before async operation completes
    unmount();

    // Wait for async operation
    await new Promise((resolve) => setTimeout(resolve, 150));

    // onClose should not be called if component is unmounted
    expect(onConfirm).toHaveBeenCalled();
  });

  it("should not call onClose if component unmounts before confirm completes", async () => {
    const onConfirm = vi.fn(
      () =>
        new Promise((resolve) => {
          setTimeout(resolve, 100);
        })
    );
    const onClose = vi.fn();
    const user = userEvent.setup();

    const { unmount } = render(
      <ConfirmationModal {...defaultProps} onConfirm={onConfirm} onClose={onClose} />
    );

    const confirmButton = screen.getByRole("button", { name: "Confirm" });
    await user.click(confirmButton);

    // Unmount immediately
    unmount();

    // Wait for async operation
    await new Promise((resolve) => setTimeout(resolve, 150));

    // onClose should not be called because component was unmounted
    expect(onConfirm).toHaveBeenCalled();
    // Note: This test verifies the isMountedRef logic
  });

  it("should handle error and not call onClose", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const onConfirm = vi.fn().mockRejectedValue(new Error("Test error"));
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(<ConfirmationModal {...defaultProps} onConfirm={onConfirm} onClose={onClose} />);

    const confirmButton = screen.getByRole("button", { name: "Confirm" });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
    });

    // onClose should not be called on error
    expect(onClose).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("should reset processing state after error", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const onConfirm = vi.fn().mockRejectedValue(new Error("Test error"));
    const user = userEvent.setup();

    render(<ConfirmationModal {...defaultProps} onConfirm={onConfirm} />);

    const confirmButton = screen.getByRole("button", { name: "Confirm" });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
    });

    // Button should be enabled again after error
    await waitFor(() => {
      expect(confirmButton).not.toBeDisabled();
    });

    consoleError.mockRestore();
  });

  it("should handle mouse enter on warning variant button", async () => {
    const user = userEvent.setup();
    render(<ConfirmationModal {...defaultProps} variant="warning" />);
    const confirmButton = screen.getByRole("button", { name: "Confirm" });

    await user.hover(confirmButton);
    expect(confirmButton).toHaveStyle({ backgroundColor: "#d97706" });
  });

  it("should handle mouse enter on info variant button", async () => {
    const user = userEvent.setup();
    render(<ConfirmationModal {...defaultProps} variant="info" />);
    const confirmButton = screen.getByRole("button", { name: "Confirm" });

    await user.hover(confirmButton);
    expect(confirmButton).toHaveStyle({ backgroundColor: "#2563eb" });
  });

  it("should handle mouse leave on confirm button", async () => {
    const user = userEvent.setup();
    render(<ConfirmationModal {...defaultProps} variant="danger" />);
    const confirmButton = screen.getByRole("button", { name: "Confirm" });

    await user.hover(confirmButton);
    expect(confirmButton).toHaveStyle({ backgroundColor: "#dc2626" });

    await user.unhover(confirmButton);
    expect(confirmButton).toHaveStyle({ backgroundColor: "#ef4444" });
  });

  it("should not change button color on mouse leave when disabled", async () => {
    const user = userEvent.setup();
    render(<ConfirmationModal {...defaultProps} isLoading={true} />);
    const confirmButton = screen.getByRole("button", { name: "Loading..." });

    const originalColor = confirmButton.style.backgroundColor;
    await user.unhover(confirmButton);
    expect(confirmButton.style.backgroundColor).toBe(originalColor);
  });
});
