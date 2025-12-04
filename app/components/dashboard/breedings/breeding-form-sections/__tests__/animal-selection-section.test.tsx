import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AnimalSelectionSection } from "../animal-selection-section";
import { LanguageProvider } from "~/contexts/language-context";
import { mockAnimals } from "~/mocks/animals";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

describe("AnimalSelectionSection", () => {
  const defaultProps = {
    animals: [],
    selectedAnimalIds: [],
    searchValue: "",
    onSearchChange: vi.fn(),
    onToggleAnimal: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render title", () => {
    render(
      <TestWrapper>
        <AnimalSelectionSection {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText(/animal selection/i)).toBeInTheDocument();
  });

  it("should render search input", () => {
    render(
      <TestWrapper>
        <AnimalSelectionSection {...defaultProps} />
      </TestWrapper>
    );
    const input = screen.getByPlaceholderText(/search/i);
    expect(input).toBeInTheDocument();
  });

  it("should call onSearchChange when search input changes", async () => {
    const onSearchChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <AnimalSelectionSection {...defaultProps} onSearchChange={onSearchChange} />
      </TestWrapper>
    );
    const input = screen.getByPlaceholderText(/search/i);
    await user.type(input, "FJ");
    expect(onSearchChange).toHaveBeenCalled();
  });

  it("should display search value", () => {
    render(
      <TestWrapper>
        <AnimalSelectionSection {...defaultProps} searchValue="FJ" />
      </TestWrapper>
    );
    const input = screen.getByPlaceholderText(/search/i) as HTMLInputElement;
    expect(input.value).toBe("FJ");
  });

  it("should display no animals message when animals array is empty", () => {
    const { container } = render(
      <TestWrapper>
        <AnimalSelectionSection {...defaultProps} animals={[]} />
      </TestWrapper>
    );
    // Check for the message paragraph that appears when no animals
    const message = container.querySelector(".text-sm.text-gray-500");
    expect(message).toBeInTheDocument();
  });

  it("should render animal checkboxes when animals are provided", () => {
    const animals = [mockAnimals[0], mockAnimals[1]];
    render(
      <TestWrapper>
        <AnimalSelectionSection {...defaultProps} animals={animals} />
      </TestWrapper>
    );
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(2);
  });

  it("should display animal code for each animal", () => {
    const animals = [mockAnimals[0]];
    render(
      <TestWrapper>
        <AnimalSelectionSection {...defaultProps} animals={animals} />
      </TestWrapper>
    );
    expect(screen.getByText(mockAnimals[0].code)).toBeInTheDocument();
  });

  it("should check checkbox when animal is selected", () => {
    const animals = [mockAnimals[0]];
    const selectedAnimalIds = [mockAnimals[0].id];
    render(
      <TestWrapper>
        <AnimalSelectionSection
          {...defaultProps}
          animals={animals}
          selectedAnimalIds={selectedAnimalIds}
        />
      </TestWrapper>
    );
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  it("should not check checkbox when animal is not selected", () => {
    const animals = [mockAnimals[0]];
    render(
      <TestWrapper>
        <AnimalSelectionSection {...defaultProps} animals={animals} selectedAnimalIds={[]} />
      </TestWrapper>
    );
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
  });

  it("should call onToggleAnimal when checkbox is clicked", async () => {
    const onToggleAnimal = vi.fn();
    const animals = [mockAnimals[0]];
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <AnimalSelectionSection
          {...defaultProps}
          animals={animals}
          onToggleAnimal={onToggleAnimal}
        />
      </TestWrapper>
    );
    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);
    expect(onToggleAnimal).toHaveBeenCalledWith(mockAnimals[0].id);
  });

  it("should display error message when error is provided", () => {
    render(
      <TestWrapper>
        <AnimalSelectionSection {...defaultProps} error="Animal selection is required" />
      </TestWrapper>
    );
    expect(screen.getByText("Animal selection is required")).toBeInTheDocument();
  });

  it("should display selected animals count", () => {
    const animals = [mockAnimals[0], mockAnimals[1]];
    const selectedAnimalIds = [mockAnimals[0].id, mockAnimals[1].id];
    render(
      <TestWrapper>
        <AnimalSelectionSection
          {...defaultProps}
          animals={animals}
          selectedAnimalIds={selectedAnimalIds}
        />
      </TestWrapper>
    );
    // Check for selected count text more specifically
    const countText = screen.getByText(/selected/i);
    expect(countText.textContent).toContain("2");
  });

  it("should not display selected animals count when none selected", () => {
    render(
      <TestWrapper>
        <AnimalSelectionSection {...defaultProps} selectedAnimalIds={[]} />
      </TestWrapper>
    );
    expect(screen.queryByText(/selected/i)).not.toBeInTheDocument();
  });

  it("should disable inputs when disabled prop is true", () => {
    render(
      <TestWrapper>
        <AnimalSelectionSection {...defaultProps} disabled={true} />
      </TestWrapper>
    );
    const input = screen.getByPlaceholderText(/search/i);
    expect(input).toBeDisabled();
  });

  it("should disable checkboxes when disabled prop is true", () => {
    const animals = [mockAnimals[0]];
    render(
      <TestWrapper>
        <AnimalSelectionSection {...defaultProps} animals={animals} disabled={true} />
      </TestWrapper>
    );
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeDisabled();
  });

  it("should apply selected styling to selected animal", () => {
    const animals = [mockAnimals[0]];
    const selectedAnimalIds = [mockAnimals[0].id];
    const { container } = render(
      <TestWrapper>
        <AnimalSelectionSection
          {...defaultProps}
          animals={animals}
          selectedAnimalIds={selectedAnimalIds}
        />
      </TestWrapper>
    );
    // Find the label that contains the checkbox (not the input label)
    const labels = container.querySelectorAll("label");
    const animalLabel = Array.from(labels).find((label) =>
      label.querySelector('input[type="checkbox"]')
    );
    expect(animalLabel).toHaveClass("bg-blue-50");
  });
});
