import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AnimalRegistrationModal } from "../animal-registration-modal";

vi.mock("~/i18n", () => ({
  useTranslation: () => ({
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
  }),
}));

describe("AnimalRegistrationModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSelectBirth: vi.fn(),
    onSelectAcquisition: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render when isOpen is true", () => {
    render(<AnimalRegistrationModal {...defaultProps} />);
    expect(screen.getByText("Register Animal")).toBeInTheDocument();
    expect(screen.getByText("Choose registration type")).toBeInTheDocument();
  });

  it("should return null when isOpen is false", () => {
    const { container } = render(<AnimalRegistrationModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("should call onSelectBirth and onClose when birth button is clicked", async () => {
    const user = userEvent.setup();
    render(<AnimalRegistrationModal {...defaultProps} />);
    const birthButton = screen.getByRole("button", { name: "Births" });
    await user.click(birthButton);
    expect(defaultProps.onSelectBirth).toHaveBeenCalledTimes(1);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("should call onSelectAcquisition and onClose when acquisition button is clicked", async () => {
    const user = userEvent.setup();
    render(<AnimalRegistrationModal {...defaultProps} />);
    const acquisitionButton = screen.getByRole("button", { name: "Acquisitions" });
    await user.click(acquisitionButton);
    expect(defaultProps.onSelectAcquisition).toHaveBeenCalledTimes(1);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(<AnimalRegistrationModal {...defaultProps} />);
    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    await user.click(cancelButton);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when backdrop is clicked", async () => {
    const user = userEvent.setup();
    const { container } = render(<AnimalRegistrationModal {...defaultProps} />);
    const backdrop = container.querySelector('[aria-hidden="true"]');
    if (backdrop) {
      await user.click(backdrop as HTMLElement);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    }
  });

  it("should render birth button with icon", () => {
    render(<AnimalRegistrationModal {...defaultProps} />);
    const birthButton = screen.getByRole("button", { name: "Births" });
    const svg = birthButton.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should render acquisition button with icon", () => {
    render(<AnimalRegistrationModal {...defaultProps} />);
    const acquisitionButton = screen.getByRole("button", { name: "Acquisitions" });
    const svg = acquisitionButton.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should render all three buttons", () => {
    render(<AnimalRegistrationModal {...defaultProps} />);
    expect(screen.getByRole("button", { name: "Births" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Acquisitions" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });
});
