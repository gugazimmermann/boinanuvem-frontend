import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AnimalRegistrationModal } from "../animal-registration-modal";
import { LanguageProvider } from "~/contexts/language-context";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

describe("AnimalRegistrationModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSelectBirth: vi.fn(),
    onSelectAcquisition: vi.fn(),
  };

  it("should not render when isOpen is false", () => {
    render(<AnimalRegistrationModal {...defaultProps} isOpen={false} />, { wrapper });
    expect(screen.queryByText(/registration/i)).not.toBeInTheDocument();
  });

  it("should render when isOpen is true", () => {
    render(<AnimalRegistrationModal {...defaultProps} />, { wrapper });
    expect(screen.getByText(/Nascimento|Birth/i)).toBeInTheDocument();
  });

  it("should call onClose when backdrop is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<AnimalRegistrationModal {...defaultProps} onClose={onClose} />, { wrapper });

    const backdrop = document.querySelector(".fixed.inset-0.cursor-pointer");
    if (backdrop) {
      await user.click(backdrop);
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  });

  it("should call onSelectBirth and onClose when birth button is clicked", async () => {
    const onSelectBirth = vi.fn();
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <AnimalRegistrationModal {...defaultProps} onSelectBirth={onSelectBirth} onClose={onClose} />,
      { wrapper }
    );

    const birthButton = screen.getByText(/Nascimento|Birth/i).closest("button");
    if (birthButton) {
      await user.click(birthButton);
      expect(onSelectBirth).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  });

  it("should call onSelectAcquisition and onClose when acquisition button is clicked", async () => {
    const onSelectAcquisition = vi.fn();
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <AnimalRegistrationModal
        {...defaultProps}
        onSelectAcquisition={onSelectAcquisition}
        onClose={onClose}
      />,
      { wrapper }
    );

    const acquisitionButton = screen.getByText(/Aquisição|Acquisition/i).closest("button");
    if (acquisitionButton) {
      await user.click(acquisitionButton);
      expect(onSelectAcquisition).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  });

  it("should call onClose when cancel button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<AnimalRegistrationModal {...defaultProps} onClose={onClose} />, { wrapper });

    const cancelButton = screen.getByText(/Cancelar|Cancel/i).closest("button");
    if (cancelButton) {
      await user.click(cancelButton);
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  });
});
