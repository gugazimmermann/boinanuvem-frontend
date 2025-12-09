import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmationModal } from "../confirmation-modal";

describe("ConfirmationModal", () => {
  it("should not render when isOpen is false", () => {
    const { container } = render(
      <ConfirmationModal
        isOpen={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Test"
        message="Test message"
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("should render when isOpen is true", async () => {
    render(
      <ConfirmationModal
        isOpen
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Test Title"
        message="Test message"
      />
    );
    await waitFor(() => {
      expect(screen.getByText("Test Title")).toBeInTheDocument();
    });
  });

  it("should render title", async () => {
    render(
      <ConfirmationModal
        isOpen
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Delete Item"
        message="Test message"
      />
    );
    await waitFor(() => {
      expect(screen.getByText("Delete Item")).toBeInTheDocument();
    });
  });

  it("should render string message", async () => {
    render(
      <ConfirmationModal
        isOpen
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Test"
        message="Are you sure?"
      />
    );
    await waitFor(() => {
      expect(screen.getByText("Are you sure?")).toBeInTheDocument();
    });
  });

  it("should render ReactNode message", async () => {
    render(
      <ConfirmationModal
        isOpen
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Test"
        message={<div data-testid="custom-message">Custom message</div>}
      />
    );
    await waitFor(() => {
      expect(screen.getByTestId("custom-message")).toBeInTheDocument();
    });
  });

  it("should render with danger variant by default", async () => {
    render(
      <ConfirmationModal
        isOpen
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Test"
        message="Test message"
      />
    );
    await waitFor(() => {
      expect(screen.getByText("Confirm")).toBeInTheDocument();
    });
    const confirmButton = screen.getByText("Confirm").closest("button");
    if (confirmButton) {
      const iconContainer = confirmButton
        .closest("div")
        ?.parentElement?.querySelector(".bg-red-100");
      expect(iconContainer).toBeTruthy();
    }
  });

  it("should render with warning variant", async () => {
    render(
      <ConfirmationModal
        isOpen
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Test"
        variant="warning"
        message="Test message"
      />
    );
    await waitFor(() => {
      expect(screen.getByText("Confirm")).toBeInTheDocument();
    });
    const confirmButton = screen.getByText("Confirm").closest("button");
    if (confirmButton) {
      const iconContainer = confirmButton
        .closest("div")
        ?.parentElement?.querySelector(".bg-yellow-100");
      expect(iconContainer).toBeTruthy();
    }
  });

  it("should render with info variant", async () => {
    render(
      <ConfirmationModal
        isOpen
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Test"
        variant="info"
        message="Test message"
      />
    );
    await waitFor(() => {
      expect(screen.getByText("Confirm")).toBeInTheDocument();
    });
    const confirmButton = screen.getByText("Confirm").closest("button");
    if (confirmButton) {
      const iconContainer = confirmButton
        .closest("div")
        ?.parentElement?.querySelector(".bg-blue-100");
      expect(iconContainer).toBeTruthy();
    }
  });

  it("should render custom icon", async () => {
    const customIcon = <span data-testid="custom-icon">Custom</span>;
    render(
      <ConfirmationModal
        isOpen
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Test"
        icon={customIcon}
        message="Test message"
      />
    );
    await waitFor(() => {
      expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    });
  });

  it("should render default icon when icon not provided", async () => {
    render(
      <ConfirmationModal
        isOpen
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Test"
        message="Test message"
      />
    );
    await waitFor(() => {
      expect(screen.getByText("Confirm")).toBeInTheDocument();
    });
    const confirmButton = screen.getByText("Confirm").closest("button");
    if (confirmButton) {
      const icon = confirmButton.closest("div")?.parentElement?.querySelector("svg");
      expect(icon).toBeInTheDocument();
    }
  });

  it("should call onClose when cancel button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <ConfirmationModal
        isOpen
        onClose={onClose}
        onConfirm={vi.fn()}
        title="Test"
        message="Test message"
      />
    );
    await waitFor(() => {
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });
    const cancelButton = screen.getByText("Cancel").closest("button");
    if (cancelButton) {
      await user.click(cancelButton);
    }
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when backdrop is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <ConfirmationModal
        isOpen
        onClose={onClose}
        onConfirm={vi.fn()}
        title="Test"
        message="Test message"
      />
    );
    await waitFor(() => {
      const dialog = container.querySelector("dialog");
      expect(dialog).toBeInTheDocument();
    });
    const dialog = container.querySelector("dialog");
    if (dialog) {
      // Click on the dialog element itself (which represents the backdrop when clicked directly)
      await user.click(dialog);
      expect(onClose).toHaveBeenCalled();
    }
  });

  it("should call onConfirm when confirm button is clicked", async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <ConfirmationModal
        isOpen
        onClose={onClose}
        onConfirm={onConfirm}
        title="Test"
        message="Test message"
      />
    );
    await waitFor(() => {
      expect(screen.getByText("Confirm")).toBeInTheDocument();
    });
    const confirmButton = screen.getByText("Confirm").closest("button");
    if (confirmButton) {
      await user.click(confirmButton);
    }
    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
  });

  it("should call onClose after successful onConfirm", async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <ConfirmationModal
        isOpen
        onClose={onClose}
        onConfirm={onConfirm}
        title="Test"
        message="Test message"
      />
    );
    await waitFor(() => {
      expect(screen.getByText("Confirm")).toBeInTheDocument();
    });
    const confirmButton = screen.getByText("Confirm").closest("button");
    if (confirmButton) {
      await user.click(confirmButton);
    }
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("should not call onClose if onConfirm throws error", async () => {
    const onConfirm = vi.fn().mockRejectedValue(new Error("Test error"));
    const onClose = vi.fn();
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const user = userEvent.setup();
    render(
      <ConfirmationModal
        isOpen
        onClose={onClose}
        onConfirm={onConfirm}
        title="Test"
        message="Test message"
      />
    );
    await waitFor(() => {
      expect(screen.getByText("Confirm")).toBeInTheDocument();
    });
    const confirmButton = screen.getByText("Confirm").closest("button");
    if (confirmButton) {
      await user.click(confirmButton);
    }
    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalled();
    });
    expect(onClose).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it("should show loading state when isLoading is true", async () => {
    const { container } = render(
      <ConfirmationModal
        isOpen
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Test"
        isLoading
        message="Test message"
      />
    );
    await waitFor(() => {
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThan(0);
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it("should show loading state during async onConfirm", async () => {
    const onConfirm = vi
      .fn()
      .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
    const user = userEvent.setup();
    render(
      <ConfirmationModal
        isOpen
        onClose={vi.fn()}
        onConfirm={onConfirm}
        title="Test"
        message="Test message"
      />
    );
    await waitFor(() => {
      expect(screen.getByText("Confirm")).toBeInTheDocument();
    });
    const confirmButton = screen.getByText("Confirm").closest("button");
    if (confirmButton) {
      await user.click(confirmButton);
    }
    await waitFor(() => {
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });

  it("should render custom confirm label", async () => {
    render(
      <ConfirmationModal
        isOpen
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Test"
        confirmLabel="Delete"
        message="Test message"
      />
    );
    await waitFor(() => {
      expect(screen.getByText("Delete")).toBeInTheDocument();
    });
  });

  it("should render custom cancel label", async () => {
    render(
      <ConfirmationModal
        isOpen
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Test"
        cancelLabel="No"
        message="Test message"
      />
    );
    await waitFor(() => {
      expect(screen.getByText("No")).toBeInTheDocument();
    });
  });

  it("should disable buttons during processing", async () => {
    const onConfirm = vi
      .fn()
      .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
    const user = userEvent.setup();
    const { container } = render(
      <ConfirmationModal
        isOpen
        onClose={vi.fn()}
        onConfirm={onConfirm}
        title="Test"
        message="Test message"
      />
    );
    await waitFor(() => {
      expect(screen.getByText("Confirm")).toBeInTheDocument();
    });
    const confirmButton = screen.getByText("Confirm").closest("button");
    if (confirmButton) {
      await user.click(confirmButton);
    }
    await waitFor(() => {
      const buttons = container.querySelectorAll("button");
      expect(buttons.length).toBeGreaterThan(0);
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });
  });
});
