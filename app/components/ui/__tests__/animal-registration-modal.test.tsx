import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AnimalRegistrationModal } from "../animal-registration-modal";

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    animals: {
      registrationModal: {
        title: "Register Animal",
        description: "Choose registration type",
      },
    },
    sidebar: {
      births: "Births",
      acquisitions: "Acquisitions",
    },
    common: {
      cancel: "Cancel",
    },
  })),
}));

describe("AnimalRegistrationModal", () => {
  it("should not render when isOpen is false", () => {
    const { container } = render(
      <AnimalRegistrationModal
        isOpen={false}
        onClose={vi.fn()}
        onSelectBirth={vi.fn()}
        onSelectAcquisition={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("should render when isOpen is true", async () => {
    render(
      <AnimalRegistrationModal
        isOpen
        onClose={vi.fn()}
        onSelectBirth={vi.fn()}
        onSelectAcquisition={vi.fn()}
      />
    );
    await waitFor(() => {
      expect(screen.getByText("Register Animal")).toBeInTheDocument();
    });
  });

  it("should render title", async () => {
    render(
      <AnimalRegistrationModal
        isOpen
        onClose={vi.fn()}
        onSelectBirth={vi.fn()}
        onSelectAcquisition={vi.fn()}
      />
    );
    await waitFor(() => {
      expect(screen.getByText("Register Animal")).toBeInTheDocument();
    });
  });

  it("should render description", async () => {
    render(
      <AnimalRegistrationModal
        isOpen
        onClose={vi.fn()}
        onSelectBirth={vi.fn()}
        onSelectAcquisition={vi.fn()}
      />
    );
    await waitFor(() => {
      expect(screen.getByText("Choose registration type")).toBeInTheDocument();
    });
  });

  it("should call onSelectBirth and onClose when birth button is clicked", async () => {
    const onSelectBirth = vi.fn();
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <AnimalRegistrationModal
        isOpen
        onClose={onClose}
        onSelectBirth={onSelectBirth}
        onSelectAcquisition={vi.fn()}
      />
    );
    await waitFor(() => {
      expect(screen.getByText("Births")).toBeInTheDocument();
    });
    const birthButton = screen.getByText("Births").closest("button");
    if (birthButton) {
      await user.click(birthButton);
    }
    expect(onSelectBirth).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should call onSelectAcquisition and onClose when acquisition button is clicked", async () => {
    const onSelectAcquisition = vi.fn();
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <AnimalRegistrationModal
        isOpen
        onClose={onClose}
        onSelectBirth={vi.fn()}
        onSelectAcquisition={onSelectAcquisition}
      />
    );
    await waitFor(() => {
      expect(screen.getByText("Acquisitions")).toBeInTheDocument();
    });
    const acquisitionButton = screen.getByText("Acquisitions").closest("button");
    if (acquisitionButton) {
      await user.click(acquisitionButton);
    }
    expect(onSelectAcquisition).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when cancel button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <AnimalRegistrationModal
        isOpen
        onClose={onClose}
        onSelectBirth={vi.fn()}
        onSelectAcquisition={vi.fn()}
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
      <AnimalRegistrationModal
        isOpen
        onClose={onClose}
        onSelectBirth={vi.fn()}
        onSelectAcquisition={vi.fn()}
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

  it("should render birth button with icon", async () => {
    render(
      <AnimalRegistrationModal
        isOpen
        onClose={vi.fn()}
        onSelectBirth={vi.fn()}
        onSelectAcquisition={vi.fn()}
      />
    );
    await waitFor(() => {
      expect(screen.getByText("Births")).toBeInTheDocument();
    });
    const birthButton = screen.getByText("Births").closest("button");
    if (birthButton) {
      const icon = birthButton.querySelector("svg");
      expect(icon).toBeInTheDocument();
    }
  });

  it("should render acquisition button with icon", async () => {
    render(
      <AnimalRegistrationModal
        isOpen
        onClose={vi.fn()}
        onSelectBirth={vi.fn()}
        onSelectAcquisition={vi.fn()}
      />
    );
    await waitFor(() => {
      expect(screen.getByText("Acquisitions")).toBeInTheDocument();
    });
    const acquisitionButton = screen.getByText("Acquisitions").closest("button");
    if (acquisitionButton) {
      const icon = acquisitionButton.querySelector("svg");
      expect(icon).toBeInTheDocument();
    }
  });
});
