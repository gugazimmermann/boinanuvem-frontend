import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ObservationForm } from "../observation-form";

vi.mock("~/components/ui", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    type,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    type?: string;
  }) => (
    <button
      type={type as "submit" | "reset" | "button" | undefined}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  ),
  FileUpload: () => <div data-testid="file-upload">File Upload</div>,
}));

describe("ObservationForm", () => {
  const defaultProps = {
    title: "Add Observation",
    observationText: "",
    onObservationTextChange: vi.fn(),
    observationFiles: [],
    onObservationFilesChange: vi.fn(),
    isSubmitting: false,
    onSubmit: vi.fn((e: React.FormEvent) => e.preventDefault()),
    onCancel: vi.fn(),
    translationKeys: {
      observation: "Observation",
      files: "Files",
      cancel: "Cancel",
      save: "Save",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render title", () => {
    render(<ObservationForm {...defaultProps} />);
    expect(screen.getByText("Add Observation")).toBeInTheDocument();
  });

  it("should render close button", () => {
    const { container } = render(<ObservationForm {...defaultProps} />);
    const closeButton = container.querySelector("svg");
    expect(closeButton).toBeInTheDocument();
  });

  it("should call onCancel when close button is clicked", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const { container } = render(<ObservationForm {...defaultProps} onCancel={onCancel} />);

    const closeButton = container.querySelector("button");
    if (closeButton) {
      await user.click(closeButton);
      expect(onCancel).toHaveBeenCalledTimes(1);
    }
  });

  it("should render observation textarea", () => {
    render(<ObservationForm {...defaultProps} />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeInTheDocument();
  });

  it("should call onObservationTextChange when textarea value changes", async () => {
    const user = userEvent.setup();
    const onObservationTextChange = vi.fn();
    render(<ObservationForm {...defaultProps} onObservationTextChange={onObservationTextChange} />);

    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "Test");

    expect(onObservationTextChange).toHaveBeenCalled();
  });

  it("should render FileUpload component", () => {
    render(<ObservationForm {...defaultProps} />);
    expect(screen.getByTestId("file-upload")).toBeInTheDocument();
  });

  it("should render save and cancel buttons", () => {
    render(<ObservationForm {...defaultProps} />);
    expect(screen.getByText("Save")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("should call onSubmit when form is submitted", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((e: React.FormEvent) => {
      e.preventDefault();
    });
    render(
      <ObservationForm {...defaultProps} onSubmit={onSubmit} observationText="Test observation" />
    );

    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "Test observation");

    const submitButton = screen.getByText("Save");
    await user.click(submitButton);
    // Form submission should trigger onSubmit
    expect(onSubmit).toHaveBeenCalled();
  });

  it("should disable form when isSubmitting is true", () => {
    render(<ObservationForm {...defaultProps} isSubmitting={true} />);
    const textarea = screen.getByRole("textbox");
    const saveButton = screen.getByText("Save");
    expect(textarea).toBeDisabled();
    expect(saveButton).toBeDisabled();
  });
});
