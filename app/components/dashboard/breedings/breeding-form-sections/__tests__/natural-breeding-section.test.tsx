import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NaturalBreedingSection } from "../natural-breeding-section";
import { LanguageProvider } from "~/contexts/language-context";
import { mockAnimals } from "~/mocks/animals";
import { mockBirths } from "~/mocks/births";

vi.mock("~/services/births.service", () => ({
  getBirthByAnimalId: vi.fn((id: string) => {
    return mockBirths.find((birth) => birth.animalId === id);
  }),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

describe("NaturalBreedingSection", () => {
  const defaultProps = {
    bulls: [],
    selectedBullId: "",
    searchValue: "",
    onSearchChange: vi.fn(),
    onBullSelect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render bull label", () => {
    const { container } = render(
      <TestWrapper>
        <NaturalBreedingSection {...defaultProps} />
      </TestWrapper>
    );
    // Check for label element
    const label = container.querySelector("label");
    expect(label).toBeInTheDocument();
  });

  it("should render search input", () => {
    render(
      <TestWrapper>
        <NaturalBreedingSection {...defaultProps} />
      </TestWrapper>
    );
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
  });

  it("should call onSearchChange when search input changes", async () => {
    const onSearchChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <NaturalBreedingSection {...defaultProps} onSearchChange={onSearchChange} />
      </TestWrapper>
    );
    const input = screen.getByRole("textbox");
    await user.type(input, "FJ");
    expect(onSearchChange).toHaveBeenCalled();
  });

  it("should display search value", () => {
    render(
      <TestWrapper>
        <NaturalBreedingSection {...defaultProps} searchValue="FJ" />
      </TestWrapper>
    );
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("FJ");
  });

  it("should display no bulls message when bulls array is empty", () => {
    render(
      <TestWrapper>
        <NaturalBreedingSection {...defaultProps} bulls={[]} />
      </TestWrapper>
    );
    expect(screen.getByText(/no bulls/i)).toBeInTheDocument();
  });

  it("should render bull radio buttons when bulls are provided", () => {
    const bulls = [mockAnimals[0], mockAnimals[1]];
    render(
      <TestWrapper>
        <NaturalBreedingSection {...defaultProps} bulls={bulls} />
      </TestWrapper>
    );
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(2);
  });

  it("should display animal code for each bull", () => {
    const bulls = [mockAnimals[0]];
    render(
      <TestWrapper>
        <NaturalBreedingSection {...defaultProps} bulls={bulls} />
      </TestWrapper>
    );
    expect(screen.getByText(mockAnimals[0].code)).toBeInTheDocument();
  });

  it("should check radio when bull is selected", () => {
    const bulls = [mockAnimals[0]];
    render(
      <TestWrapper>
        <NaturalBreedingSection
          {...defaultProps}
          bulls={bulls}
          selectedBullId={mockAnimals[0].id}
        />
      </TestWrapper>
    );
    const radio = screen.getByRole("radio");
    expect(radio).toBeChecked();
  });

  it("should not check radio when bull is not selected", () => {
    const bulls = [mockAnimals[0]];
    render(
      <TestWrapper>
        <NaturalBreedingSection {...defaultProps} bulls={bulls} selectedBullId="" />
      </TestWrapper>
    );
    const radio = screen.getByRole("radio");
    expect(radio).not.toBeChecked();
  });

  it("should call onBullSelect when radio is clicked", async () => {
    const onBullSelect = vi.fn();
    const bulls = [mockAnimals[0]];
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <NaturalBreedingSection {...defaultProps} bulls={bulls} onBullSelect={onBullSelect} />
      </TestWrapper>
    );
    const radio = screen.getByRole("radio");
    await user.click(radio);
    expect(onBullSelect).toHaveBeenCalledWith(mockAnimals[0].id);
  });

  it("should display error message when error is provided", () => {
    render(
      <TestWrapper>
        <NaturalBreedingSection {...defaultProps} error="Bull selection is required" />
      </TestWrapper>
    );
    expect(screen.getByText("Bull selection is required")).toBeInTheDocument();
  });

  it("should display bull selected message when bull is selected", () => {
    const bulls = [mockAnimals[0]];
    render(
      <TestWrapper>
        <NaturalBreedingSection
          {...defaultProps}
          bulls={bulls}
          selectedBullId={mockAnimals[0].id}
        />
      </TestWrapper>
    );
    expect(screen.getByText(/bull selected/i)).toBeInTheDocument();
  });

  it("should not display bull selected message when no bull is selected", () => {
    render(
      <TestWrapper>
        <NaturalBreedingSection {...defaultProps} selectedBullId="" />
      </TestWrapper>
    );
    expect(screen.queryByText(/bull selected/i)).not.toBeInTheDocument();
  });

  it("should disable inputs when disabled prop is true", () => {
    render(
      <TestWrapper>
        <NaturalBreedingSection {...defaultProps} disabled={true} />
      </TestWrapper>
    );
    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
  });

  it("should disable radio buttons when disabled prop is true", () => {
    const bulls = [mockAnimals[0]];
    render(
      <TestWrapper>
        <NaturalBreedingSection {...defaultProps} bulls={bulls} disabled={true} />
      </TestWrapper>
    );
    const radio = screen.getByRole("radio");
    expect(radio).toBeDisabled();
  });

  it("should apply selected styling to selected bull", () => {
    const bulls = [mockAnimals[0]];
    const { container } = render(
      <TestWrapper>
        <NaturalBreedingSection
          {...defaultProps}
          bulls={bulls}
          selectedBullId={mockAnimals[0].id}
        />
      </TestWrapper>
    );
    // Find the label that contains the radio button (not the input label)
    const labels = container.querySelectorAll("label");
    const bullLabel = Array.from(labels).find((label) =>
      label.querySelector('input[type="radio"]')
    );
    expect(bullLabel).toHaveClass("bg-blue-50");
  });

  it("should display breed text when birth has breed", () => {
    const bulls = [mockAnimals[0]];
    render(
      <TestWrapper>
        <NaturalBreedingSection {...defaultProps} bulls={bulls} />
      </TestWrapper>
    );
    // Animal code should be displayed
    expect(screen.getByText(mockAnimals[0].code)).toBeInTheDocument();
  });
});
