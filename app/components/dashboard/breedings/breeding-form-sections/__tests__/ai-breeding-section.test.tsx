import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AIBreedingSection } from "../ai-breeding-section";
import { LanguageProvider } from "~/contexts/language-context";

vi.mock("~/services/animals.service", () => {
  const mockAnimals = [
    { id: "animal-1", code: "FJ001", registrationNumber: "BR-2020-FJ0001" },
    { id: "animal-2", code: "FJ002", registrationNumber: "BR-2021-FJ0001" },
  ];
  return {
    getAnimalById: vi.fn((id: string) => {
      return mockAnimals.find((animal: { id: string }) => animal.id === id);
    }),
  };
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

describe("AIBreedingSection", () => {
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
  });

  it("should render semen code input", () => {
    render(
      <TestWrapper>
        <AIBreedingSection {...defaultProps} />
      </TestWrapper>
    );
    const input = screen.getByPlaceholderText(/semen code/i);
    expect(input).toBeInTheDocument();
  });

  it("should call onSemenCodeChange when semen code input changes", async () => {
    const onSemenCodeChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <AIBreedingSection {...defaultProps} onSemenCodeChange={onSemenCodeChange} />
      </TestWrapper>
    );
    const input = screen.getByPlaceholderText(/semen code/i);
    await user.type(input, "ABC123");
    expect(onSemenCodeChange).toHaveBeenCalled();
  });

  it("should display semen code value", () => {
    render(
      <TestWrapper>
        <AIBreedingSection {...defaultProps} semenCode="ABC123" />
      </TestWrapper>
    );
    const input = screen.getByPlaceholderText(/semen code/i) as HTMLInputElement;
    expect(input.value).toBe("ABC123");
  });

  it("should display error for semen code", () => {
    render(
      <TestWrapper>
        <AIBreedingSection {...defaultProps} errors={{ semenCode: "Semen code is required" }} />
      </TestWrapper>
    );
    expect(screen.getByText("Semen code is required")).toBeInTheDocument();
  });

  it("should not render attempt numbers section when no animals selected", () => {
    render(
      <TestWrapper>
        <AIBreedingSection {...defaultProps} selectedAnimalIds={[]} />
      </TestWrapper>
    );
    expect(screen.queryByText(/attempt number/i)).not.toBeInTheDocument();
  });

  it("should render attempt numbers section when animals are selected", () => {
    const selectedAnimalIds = ["animal-1"];
    render(
      <TestWrapper>
        <AIBreedingSection {...defaultProps} selectedAnimalIds={selectedAnimalIds} />
      </TestWrapper>
    );
    expect(screen.getByText(/attempt number/i)).toBeInTheDocument();
  });

  it("should render animal code display for selected animals", () => {
    const selectedAnimalIds = ["animal-1"];
    render(
      <TestWrapper>
        <AIBreedingSection {...defaultProps} selectedAnimalIds={selectedAnimalIds} />
      </TestWrapper>
    );
    expect(screen.getByText("FJ001")).toBeInTheDocument();
  });

  it("should render attempt number input for each selected animal", () => {
    const selectedAnimalIds = ["animal-1", "animal-2"];
    render(
      <TestWrapper>
        <AIBreedingSection {...defaultProps} selectedAnimalIds={selectedAnimalIds} />
      </TestWrapper>
    );
    const inputs = screen.getAllByRole("spinbutton");
    expect(inputs).toHaveLength(2);
  });

  it("should call onAttemptNumberChange when attempt number changes", async () => {
    const onAttemptNumberChange = vi.fn();
    const selectedAnimalIds = ["animal-1"];
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <AIBreedingSection
          {...defaultProps}
          selectedAnimalIds={selectedAnimalIds}
          onAttemptNumberChange={onAttemptNumberChange}
        />
      </TestWrapper>
    );
    const input = screen.getByRole("spinbutton");
    await user.type(input, "2");
    expect(onAttemptNumberChange).toHaveBeenCalledWith("animal-1", "2");
  });

  it("should display attempt number value", () => {
    const selectedAnimalIds = ["animal-1"];
    const attemptNumbers = { "animal-1": 3 };
    render(
      <TestWrapper>
        <AIBreedingSection
          {...defaultProps}
          selectedAnimalIds={selectedAnimalIds}
          attemptNumbers={attemptNumbers}
        />
      </TestWrapper>
    );
    const input = screen.getByRole("spinbutton") as HTMLInputElement;
    expect(input.value).toBe("3");
  });

  it("should display error for attempt number", () => {
    const selectedAnimalIds = ["animal-1"];
    const errors = { "attemptNumber_animal-1": "Attempt number is required" };
    render(
      <TestWrapper>
        <AIBreedingSection
          {...defaultProps}
          selectedAnimalIds={selectedAnimalIds}
          errors={errors}
        />
      </TestWrapper>
    );
    expect(screen.getByText("Attempt number is required")).toBeInTheDocument();
  });

  it("should disable inputs when disabled prop is true", () => {
    render(
      <TestWrapper>
        <AIBreedingSection {...defaultProps} disabled={true} />
      </TestWrapper>
    );
    const input = screen.getByPlaceholderText(/semen code/i);
    expect(input).toBeDisabled();
  });
});
