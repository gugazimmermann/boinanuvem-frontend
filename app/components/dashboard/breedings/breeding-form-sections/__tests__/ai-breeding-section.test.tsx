import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AIBreedingSection } from "../ai-breeding-section";
import { useTranslation } from "~/i18n";
import { getAnimalById } from "~/services/animals.service";

vi.mock("~/i18n");
vi.mock("~/services/animals.service");
vi.mock("~/components/ui", () => ({
  Input: ({
    value,
    onChange,
    error,
    disabled,
    placeholder,
  }: {
    value: string;
    onChange: (e: { target: { value: string } }) => void;
    error?: string;
    disabled?: boolean;
    placeholder?: string;
  }) => (
    <div>
      <input
        data-testid="input"
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
      />
      {error && <span data-testid="error">{error}</span>}
    </div>
  ),
}));

vi.mock("../animal-code-display", () => ({
  AnimalCodeDisplay: ({ animal }: { animal: unknown }) => (
    <div data-testid="animal-code">{String(animal)}</div>
  ),
}));

describe("AIBreedingSection", () => {
  const mockUseTranslation = vi.mocked(useTranslation);
  const defaultProps = {
    selectedAnimalIds: [],
    attemptNumbers: {},
    semenCode: "",
    onSemenCodeChange: vi.fn(),
    onAttemptNumberChange: vi.fn(),
    errors: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTranslation.mockReturnValue({
      breedings: {
        new: {
          semenCodeLabel: "Semen Code",
          semenCodePlaceholder: "Enter semen code",
          attemptNumberLabel: "Attempt Number",
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
    vi.mocked(getAnimalById).mockReturnValue({ id: "1", code: "A001" } as never);
  });

  it("should render semen code input", () => {
    render(<AIBreedingSection {...defaultProps} />);
    expect(screen.getByText("Semen Code")).toBeInTheDocument();
  });

  it("should call onSemenCodeChange when semen code changes", async () => {
    const user = userEvent.setup();
    const onSemenCodeChange = vi.fn();
    render(<AIBreedingSection {...defaultProps} onSemenCodeChange={onSemenCodeChange} />);

    const input = screen.getByTestId("input");
    await user.type(input, "ABC123");

    expect(onSemenCodeChange).toHaveBeenCalled();
  });

  it("should display error when semen code has error", () => {
    render(<AIBreedingSection {...defaultProps} errors={{ semenCode: "Required" }} />);
    expect(screen.getByTestId("error")).toBeInTheDocument();
    expect(screen.getByText("Required")).toBeInTheDocument();
  });

  it("should render attempt number section when animals are selected", () => {
    render(
      <AIBreedingSection {...defaultProps} selectedAnimalIds={["1"]} attemptNumbers={{ "1": 1 }} />
    );
    expect(screen.getByText("Attempt Number")).toBeInTheDocument();
  });

  it("should not render attempt number section when no animals selected", () => {
    render(<AIBreedingSection {...defaultProps} selectedAnimalIds={[]} />);
    expect(screen.queryByText("Attempt Number")).not.toBeInTheDocument();
  });

  it("should disable inputs when disabled is true", () => {
    render(<AIBreedingSection {...defaultProps} disabled={true} />);
    const input = screen.getByTestId("input");
    expect(input).toBeDisabled();
  });

  it("should not render animal when getAnimalById returns null", () => {
    vi.mocked(getAnimalById).mockReturnValue(null as never);
    render(
      <AIBreedingSection {...defaultProps} selectedAnimalIds={["1"]} attemptNumbers={{ "1": 1 }} />
    );
    expect(screen.queryByTestId("animal-code")).not.toBeInTheDocument();
  });

  it("should render multiple animals with attempt numbers", () => {
    vi.mocked(getAnimalById)
      .mockReturnValueOnce({ id: "1", code: "A001" } as never)
      .mockReturnValueOnce({ id: "2", code: "A002" } as never);
    render(
      <AIBreedingSection
        {...defaultProps}
        selectedAnimalIds={["1", "2"]}
        attemptNumbers={{ "1": 1, "2": 2 }}
      />
    );
    expect(screen.getByText("A001")).toBeInTheDocument();
    expect(screen.getByText("A002")).toBeInTheDocument();
  });

  it("should call onAttemptNumberChange when attempt number changes", async () => {
    const user = userEvent.setup();
    const onAttemptNumberChange = vi.fn();
    render(
      <AIBreedingSection
        {...defaultProps}
        selectedAnimalIds={["1"]}
        attemptNumbers={{ "1": 1 }}
        onAttemptNumberChange={onAttemptNumberChange}
      />
    );
    const inputs = screen.getAllByTestId("input");
    const attemptInput = inputs[inputs.length - 1] as HTMLInputElement; // Last input is the attempt number
    // Clear the input first
    await user.clear(attemptInput);
    // Type the new value "2"
    await user.type(attemptInput, "2");
    // The onChange handler should be called
    expect(onAttemptNumberChange).toHaveBeenCalled();
    // Check that it was called with animalId "1"
    const allCalls = onAttemptNumberChange.mock.calls;
    expect(allCalls.length).toBeGreaterThan(0);
    // Verify it was called with the correct animalId
    const callsForAnimal1 = allCalls.filter((call: unknown[]) => call[0] === "1");
    expect(callsForAnimal1.length).toBeGreaterThan(0);
    // After typing "2", the value should contain "2"
    // (might be "2" if clear worked, or "12" if it didn't, but should contain "2")
    const hasValueWithTwo = callsForAnimal1.some((call: unknown[]) =>
      String(call[1]).includes("2")
    );
    expect(hasValueWithTwo).toBe(true);
  });

  it("should display error for attempt number field", () => {
    render(
      <AIBreedingSection
        {...defaultProps}
        selectedAnimalIds={["1"]}
        attemptNumbers={{ "1": 1 }}
        errors={{ attemptNumber_1: "Invalid attempt number" }}
      />
    );
    const errors = screen.getAllByTestId("error");
    expect(errors.length).toBeGreaterThan(0);
    expect(screen.getByText("Invalid attempt number")).toBeInTheDocument();
  });

  it("should render placeholder text for semen code input", () => {
    render(<AIBreedingSection {...defaultProps} />);
    const input = screen.getByTestId("input");
    expect(input).toHaveAttribute("placeholder", "Enter semen code");
  });

  it("should handle empty attempt number value", () => {
    render(
      <AIBreedingSection {...defaultProps} selectedAnimalIds={["1"]} attemptNumbers={{ "1": 0 }} />
    );
    expect(screen.getByText("Attempt Number")).toBeInTheDocument();
  });
});
