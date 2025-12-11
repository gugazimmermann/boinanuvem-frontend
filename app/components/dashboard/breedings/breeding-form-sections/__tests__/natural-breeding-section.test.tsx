import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NaturalBreedingSection } from "../natural-breeding-section";
import { useTranslation } from "~/i18n";
import type { Animal, Birth, AnimalBreed } from "~/types";

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

describe("NaturalBreedingSection", () => {
  const mockUseTranslation = vi.mocked(useTranslation);
  const mockBulls: Animal[] = [
    {
      id: "1",
      code: "B001",
      name: "Bull 1",
      registrationNumber: "REG001",
      status: "active" as const,
      createdAt: "2024-01-01",
      companyId: "company-1",
      propertyId: "property-1",
    },
    {
      id: "2",
      code: "B002",
      name: "Bull 2",
      registrationNumber: "REG002",
      status: "active" as const,
      createdAt: "2024-01-01",
      companyId: "company-1",
      propertyId: "property-1",
    },
  ];

  const mockBirthsMap = new Map<string, Birth>();

  const defaultProps = {
    bulls: mockBulls,
    birthsMap: mockBirthsMap,
    selectedBullId: "",
    searchValue: "",
    onSearchChange: vi.fn(),
    onBullSelect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockBirthsMap.clear();
    mockUseTranslation.mockReturnValue({
      breedings: {
        new: {
          bullLabel: "Bull",
          bullSearchPlaceholder: "Search bulls",
          noBulls: "No bulls found",
          bullSelected: "Bull selected",
        },
      },
      animals: {
        breeds: {
          nelore: "Nelore",
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
  });

  it("should render bull search input", () => {
    render(<NaturalBreedingSection {...defaultProps} />);
    expect(screen.getByText("Bull")).toBeInTheDocument();
    expect(screen.getByTestId("search-input")).toBeInTheDocument();
  });

  it("should call onSearchChange when search value changes", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    render(<NaturalBreedingSection {...defaultProps} onSearchChange={onSearchChange} />);

    const input = screen.getByTestId("search-input");
    await user.type(input, "Bull");

    expect(onSearchChange).toHaveBeenCalled();
  });

  it("should render bulls list", () => {
    render(<NaturalBreedingSection {...defaultProps} />);
    expect(screen.getByText("B001")).toBeInTheDocument();
    expect(screen.getByText("B002")).toBeInTheDocument();
  });

  it("should display breed from birthsMap when available", () => {
    const mockBirth: Birth = {
      id: "birth-1",
      animalId: "1",
      birthDate: "2024-01-01",
      breed: "nelore" as AnimalBreed,
      companyId: "company-1",
      createdAt: "2024-01-01T00:00:00Z",
    };
    mockBirthsMap.set("1", mockBirth);
    render(<NaturalBreedingSection {...defaultProps} />);
    expect(screen.getByText("(Nelore)")).toBeInTheDocument();
  });

  it("should not display breed when not in birthsMap", () => {
    render(<NaturalBreedingSection {...defaultProps} />);
    // Should not show breed text when birth is not in map
    expect(screen.queryByText(/\(Nelore\)/)).not.toBeInTheDocument();
  });

  it("should show empty message when no bulls", () => {
    render(<NaturalBreedingSection {...defaultProps} bulls={[]} />);
    expect(screen.getByText("No bulls found")).toBeInTheDocument();
  });

  it("should call onBullSelect when bull is selected", async () => {
    const user = userEvent.setup();
    const onBullSelect = vi.fn();
    render(<NaturalBreedingSection {...defaultProps} onBullSelect={onBullSelect} />);

    const label = screen.getByText("B001").closest("label");
    if (label) {
      await user.click(label);
      expect(onBullSelect).toHaveBeenCalledWith("1");
    }
  });

  it("should show selected bull as checked", () => {
    render(<NaturalBreedingSection {...defaultProps} selectedBullId="1" />);
    const radio = screen
      .getByText("B001")
      .closest("label")
      ?.querySelector('input[type="radio"]') as HTMLInputElement;
    expect(radio).toBeChecked();
  });

  it("should display error when error is provided", () => {
    render(<NaturalBreedingSection {...defaultProps} error="Bull is required" />);
    expect(screen.getByText("Bull is required")).toBeInTheDocument();
  });

  it("should disable inputs when disabled is true", () => {
    render(<NaturalBreedingSection {...defaultProps} disabled={true} />);
    const input = screen.getByTestId("search-input");
    expect(input).toBeDisabled();
  });
});
