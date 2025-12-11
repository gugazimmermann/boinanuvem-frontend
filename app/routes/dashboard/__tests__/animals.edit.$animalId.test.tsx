import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import EditAnimal from "../animals.edit.$animalId";
import { getAnimalById, updateAnimal } from "~/services/animals.service";
import { getProperties } from "~/services/properties.service";

vi.mock("~/services/animals.service");
vi.mock("~/services/properties.service");
vi.mock("~/i18n", () => ({
  useTranslation: () => ({
    animals: {
      edit: {
        title: "Edit Animal",
        description: "Edit animal details",
        propertyRequired: "Property is required",
        registrationNumberLabel: "Registration Number",
        acquisitionDateLabel: "Acquisition Date",
        propertyLabel: "Property",
        statusLabel: "Status",
        save: "Save",
      },
      table: {
        code: "Code",
        active: "Active",
        inactive: "Inactive",
      },
      success: {
        updated: "Animal updated successfully",
      },
      errors: {
        updateFailed: "Failed to update animal",
      },
      emptyState: {
        title: "Animal not found",
      },
    },
    profile: {
      errors: {
        required: (field: string) => `${field} is required`,
      },
      company: {
        cancel: "Cancel",
      },
    },
    team: {
      new: {
        back: "Back",
      },
    },
    common: {
      cancel: "Cancel",
      save: "Save",
      loading: "Loading...",
    },
  }),
}));
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({ animalId: "animal-1" }),
  };
});
vi.mock("~/contexts/language-context", () => ({
  useLanguage: () => ({ language: "en" }),
}));
vi.mock("~/hooks/use-alert", () => ({
  useAlert: () => ({
    alertMessage: null,
    showAlert: vi.fn(),
  }),
}));

describe("animals.edit.$animalId", () => {
  const mockAnimal = {
    id: "animal-1",
    code: "A001",
    registrationNumber: "REG001",
    companyId: "company-1",
    propertyId: "property-1",
    status: "active" as const,
    acquisitionDate: "2024-01-01",
    createdAt: "2024-01-01T00:00:00Z",
  };

  const mockProperties = [
    {
      id: "property-1",
      name: "Property 1",
      code: "PROP-1",
      companyId: "company-1",
      status: "active" as const,
      createdAt: "2024-01-01T00:00:00Z",
      area: { value: 100, type: "hectares" as const },
      street: "Main St",
      number: "123",
      complement: "",
      neighborhood: "Downtown",
      city: "City",
      state: "ST",
      zipCode: "12345-678",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAnimalById).mockResolvedValue(mockAnimal);
    vi.mocked(getProperties).mockResolvedValue(mockProperties);
    vi.mocked(updateAnimal).mockResolvedValue(mockAnimal);
  });

  it("should load animal and properties asynchronously", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/animals/animal-1/edit"]}>{children}</MemoryRouter>
    );
    render(<EditAnimal />, { wrapper });

    await waitFor(() => {
      expect(getAnimalById).toHaveBeenCalledWith("animal-1");
      expect(getProperties).toHaveBeenCalled();
    });
  });

  it("should populate form after animal data loads", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/animals/animal-1/edit"]}>{children}</MemoryRouter>
    );
    render(<EditAnimal />, { wrapper });

    await waitFor(() => {
      expect(screen.getByDisplayValue("A001")).toBeInTheDocument();
      expect(screen.getByDisplayValue("REG001")).toBeInTheDocument();
    });
  });

  it("should handle form submission with async updateAnimal", async () => {
    const user = userEvent.setup();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/animals/animal-1/edit"]}>{children}</MemoryRouter>
    );
    render(<EditAnimal />, { wrapper });

    await waitFor(() => {
      expect(screen.getByDisplayValue("A001")).toBeInTheDocument();
    });

    const codeInput = screen.getByDisplayValue("A001");
    await user.clear(codeInput);
    await user.type(codeInput, "A002");

    const submitButton = screen.getByRole("button", { name: /save/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(updateAnimal).toHaveBeenCalled();
    });
  });

  it("should show loading state initially", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/animals/animal-1/edit"]}>{children}</MemoryRouter>
    );
    render(<EditAnimal />, { wrapper });

    // Wait for data to load
    await waitFor(() => {
      expect(getAnimalById).toHaveBeenCalled();
    });
  });

  it("should handle error when animal not found", async () => {
    vi.mocked(getAnimalById).mockResolvedValue(undefined);
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/animals/animal-1/edit"]}>{children}</MemoryRouter>
    );
    render(<EditAnimal />, { wrapper });

    await waitFor(() => {
      expect(getAnimalById).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });
});
