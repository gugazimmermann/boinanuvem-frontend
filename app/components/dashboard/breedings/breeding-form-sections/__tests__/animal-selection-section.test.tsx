import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AnimalSelectionSection } from "../animal-selection-section";
import { useTranslation } from "~/i18n";
import type { Animal } from "~/types";

vi.mock("~/i18n");
vi.mock("~/components/ui", () => ({
  Input: ({
    value,
    onChange,
    placeholder,
    disabled,
  }: {
    value: string;
    onChange: (e: { target: { value: string } }) => void;
    placeholder?: string;
    disabled?: boolean;
  }) => (
    <input
      data-testid="search-input"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
    />
  ),
}));

vi.mock("../animal-code-display", () => ({
  AnimalCodeDisplay: ({ animal }: { animal: Animal }) => (
    <div data-testid="animal-code">{animal.code}</div>
  ),
}));

describe("AnimalSelectionSection", () => {
  const mockUseTranslation = vi.mocked(useTranslation);
  const mockAnimals: Animal[] = [
    {
      id: "1",
      code: "A001",
      name: "Animal 1",
      registrationNumber: "REG001",
      status: "active" as const,
      createdAt: "2024-01-01",
      companyId: "company-1",
      propertyId: "property-1",
    },
    {
      id: "2",
      code: "A002",
      name: "Animal 2",
      registrationNumber: "REG002",
      status: "active" as const,
      createdAt: "2024-01-01",
      companyId: "company-1",
      propertyId: "property-1",
    },
  ];

  const defaultProps = {
    animals: mockAnimals,
    selectedAnimalIds: [],
    searchValue: "",
    onSearchChange: vi.fn(),
    onToggleAnimal: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTranslation.mockReturnValue({
      breedings: {
        new: {
          animalSelectionTitle: "Select Animals",
          animalLabel: "Animals",
          searchPlaceholder: "Search animals",
          noAnimals: "No animals found",
          selectedAnimals: (count: number) => `${count} selected`,
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
  });

  it("should render animal selection title", () => {
    render(<AnimalSelectionSection {...defaultProps} />);
    expect(screen.getByText("Select Animals")).toBeInTheDocument();
  });

  it("should render search input", () => {
    render(<AnimalSelectionSection {...defaultProps} />);
    expect(screen.getByTestId("search-input")).toBeInTheDocument();
  });

  it("should call onSearchChange when search value changes", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    render(<AnimalSelectionSection {...defaultProps} onSearchChange={onSearchChange} />);

    const input = screen.getByTestId("search-input");
    await user.type(input, "Animal");

    expect(onSearchChange).toHaveBeenCalled();
  });

  it("should render animals list", () => {
    render(<AnimalSelectionSection {...defaultProps} />);
    expect(screen.getByText("A001")).toBeInTheDocument();
    expect(screen.getByText("A002")).toBeInTheDocument();
  });

  it("should show empty message when no animals", () => {
    render(<AnimalSelectionSection {...defaultProps} animals={[]} />);
    expect(screen.getByText("No animals found")).toBeInTheDocument();
  });

  it("should call onToggleAnimal when animal checkbox is clicked", async () => {
    const user = userEvent.setup();
    const onToggleAnimal = vi.fn();
    render(<AnimalSelectionSection {...defaultProps} onToggleAnimal={onToggleAnimal} />);

    const label = screen.getByText("A001").closest("label");
    if (label) {
      await user.click(label);
      expect(onToggleAnimal).toHaveBeenCalledWith("1");
    }
  });

  it("should show selected animals as checked", () => {
    render(<AnimalSelectionSection {...defaultProps} selectedAnimalIds={["1"]} />);
    const checkbox = screen
      .getByText("A001")
      .closest("label")
      ?.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(checkbox).toBeChecked();
  });

  it("should display error when error is provided", () => {
    render(<AnimalSelectionSection {...defaultProps} error="Animal is required" />);
    expect(screen.getByText("Animal is required")).toBeInTheDocument();
  });

  it("should disable inputs when disabled is true", () => {
    render(<AnimalSelectionSection {...defaultProps} disabled={true} />);
    const input = screen.getByTestId("search-input");
    expect(input).toBeDisabled();
  });
});
