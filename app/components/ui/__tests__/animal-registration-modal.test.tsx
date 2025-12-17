import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AnimalRegistrationModal } from "../animal-registration-modal";

vi.mock("~/i18n", () => ({
  useTranslation: () => ({
    animals: {
      registrationModal: {
        title: "Animal Registration",
        description: "Choose how you want to register the animal",
      },
    },
    sidebar: {
      births: "Births",
      acquisitions: "Acquisitions",
    },
    common: {
      cancel: "Cancel",
    },
  }),
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
      expect(screen.getByText("Animal Registration")).toBeInTheDocument();
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
      expect(screen.getByText("Animal Registration")).toBeInTheDocument();
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
      expect(screen.getByText("Choose how you want to register the animal")).toBeInTheDocument();
    });
  });

  it("should call onSelectBirth and onClose when birth button is clicked", async () => {
    const onClose = vi.fn();
    const onSelectBirth = vi.fn();
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
    const onClose = vi.fn();
    const onSelectAcquisition = vi.fn();
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
      expect(container.querySelector("dialog")).toBeInTheDocument();
    });

    const backdrop = container.querySelector('div[aria-hidden="true"]');
    expect(backdrop).toBeInTheDocument();
    if (backdrop) {
      await user.click(backdrop);
    }

    expect(onClose).toHaveBeenCalled();
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
    expect(birthButton?.querySelector("svg")).toBeInTheDocument();
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
    expect(acquisitionButton?.querySelector("svg")).toBeInTheDocument();
  });
});
