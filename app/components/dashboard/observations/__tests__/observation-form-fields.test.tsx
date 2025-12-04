import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ObservationFormFields } from "../observation-form-fields";

vi.mock("~/components/ui", () => ({
  FileUpload: vi.fn(
    ({
      label,
      files: _files,
      onChange,
      disabled,
      multiple,
      helperText,
    }: {
      label?: string;
      files?: File[];
      onChange?: (files: File[]) => void;
      disabled?: boolean;
      multiple?: boolean;
      helperText?: string;
    }) => (
      <div data-testid="file-upload">
        <label>{label}</label>
        <input
          type="file"
          multiple={multiple}
          onChange={(e) => onChange?.(Array.from(e.target.files || []))}
          disabled={disabled}
          data-helper={helperText}
        />
      </div>
    )
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
    const textarea = screen.getByPlaceholderText("Adicione uma observação (opcional)");
    expect(textarea).toBeInTheDocument();
  });

  it("should render FileUpload component", () => {
    render(<ObservationFormFields {...defaultProps} />);
    expect(screen.getByTestId("file-upload")).toBeInTheDocument();
  });

  it("should call onObservationChange when textarea value changes", async () => {
    const onObservationChange = vi.fn();
    const user = userEvent.setup();
    render(<ObservationFormFields {...defaultProps} onObservationChange={onObservationChange} />);
    const textarea = screen.getByPlaceholderText("Adicione uma observação (opcional)");
    await user.type(textarea, "Test observation");
    expect(onObservationChange).toHaveBeenCalled();
  });

  it("should disable textarea when isSubmitting is true", () => {
    render(<ObservationFormFields {...defaultProps} isSubmitting={true} />);
    const textarea = screen.getByPlaceholderText("Adicione uma observação (opcional)");
    expect(textarea).toBeDisabled();
  });

  it("should use custom labels when provided", () => {
    render(
      <ObservationFormFields
        {...defaultProps}
        observationLabel="Custom Observation"
        observationPlaceholder="Custom placeholder"
        filesLabel="Custom Files"
        filesHelperText="Custom helper"
      />
    );
    expect(screen.getByText("Custom Observation")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Custom placeholder")).toBeInTheDocument();
    expect(screen.getByText("Custom Files")).toBeInTheDocument();
  });

  it("should display observation value", () => {
    render(<ObservationFormFields {...defaultProps} observation="Existing observation" />);
    const textarea = screen.getByPlaceholderText("Adicione uma observação (opcional)");
    expect(textarea).toHaveValue("Existing observation");
  });
});
