import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ObservationFormFields } from "../observation-form-fields";

vi.mock("~/components/ui", () => ({
  FileUpload: ({
    label,
    files: _files,
    onChange,
    disabled,
    helperText,
  }: {
    label: string;
    files: File[];
    onChange: (files: File[]) => void;
    disabled?: boolean;
    helperText?: string;
  }) => (
    <div data-testid="file-upload">
      <label>{label}</label>
      {helperText && <p>{helperText}</p>}
      <input
        type="file"
        multiple
        disabled={disabled}
        onChange={(e) => {
          const fileList = e.target.files;
          if (fileList) {
            onChange(Array.from(fileList));
          }
        }}
      />
    </div>
  ),
}));

describe("ObservationFormFields", () => {
  const defaultProps = {
    observation: "",
    onObservationChange: vi.fn(),
    observationFiles: [],
    onObservationFilesChange: vi.fn(),
    isSubmitting: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render observation textarea", () => {
    render(<ObservationFormFields {...defaultProps} />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeInTheDocument();
  });

  it("should render default label", () => {
    render(<ObservationFormFields {...defaultProps} />);
    expect(screen.getByText("Observação")).toBeInTheDocument();
  });

  it("should render custom label when provided", () => {
    render(<ObservationFormFields {...defaultProps} observationLabel="Custom Label" />);
    expect(screen.getByText("Custom Label")).toBeInTheDocument();
  });

  it("should call onObservationChange when textarea value changes", async () => {
    const user = userEvent.setup();
    const onObservationChange = vi.fn();
    render(<ObservationFormFields {...defaultProps} onObservationChange={onObservationChange} />);

    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "Test observation");

    expect(onObservationChange).toHaveBeenCalled();
  });

  it("should render FileUpload component", () => {
    render(<ObservationFormFields {...defaultProps} />);
    expect(screen.getByTestId("file-upload")).toBeInTheDocument();
  });

  it("should disable textarea when isSubmitting is true", () => {
    render(<ObservationFormFields {...defaultProps} isSubmitting={true} />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeDisabled();
  });

  it("should use custom placeholder when provided", () => {
    render(<ObservationFormFields {...defaultProps} observationPlaceholder="Custom placeholder" />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("placeholder", "Custom placeholder");
  });
});
