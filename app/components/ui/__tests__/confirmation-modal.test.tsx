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
      expect(container.querySelector("dialog")).toBeInTheDocument();
    });

    const backdrop = container.querySelector('div[aria-hidden="true"]');
    expect(backdrop).toBeInTheDocument();
    if (backdrop) {
      await user.click(backdrop);
    }

    expect(onClose).toHaveBeenCalled();
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
});
