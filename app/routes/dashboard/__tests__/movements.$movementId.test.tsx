import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import MovementDetails from "../movements.$movementId";
import { getAnimalMovementById } from "~/services/animal-movements.service";
import {
  getLocationMovementById,
  deleteLocationMovement,
} from "~/services/location-movements.service";
import type { AnimalMovement } from "~/types/animal-movement";
import type { LocationMovement } from "~/types/location-movement";
import { getAnimalById } from "~/services/animals.service";
import { getLocationById } from "~/services/locations.service";
import { getPropertyById } from "~/services/properties.service";
import { getEmployeeById } from "~/services/employees.service";
import { getServiceProviderById } from "~/services/service-providers.service";
import { getBirthsByCompanyId } from "~/services/births.service";

vi.mock("~/services/animal-movements.service");
vi.mock("~/services/location-movements.service", () => ({
  getLocationMovementById: vi.fn(),
  deleteLocationMovement: vi.fn(),
}));
vi.mock("~/services/animals.service");
vi.mock("~/services/locations.service");
vi.mock("~/services/properties.service");
vi.mock("~/services/employees.service");
vi.mock("~/services/service-providers.service");
vi.mock("~/services/births.service");
vi.mock("~/i18n", () => ({
  useTranslation: () => ({
    movements: {
      view: {
        title: "Movement Details",
      },
    },
    properties: {
      details: {
        movements: {
          title: "Movement Details",
          observation: "Observation",
          files: "Files",
          file: "File",
          emptyState: {
            title: "Movement not found",
          },
          types: {
            animal_movement: "Animal Movement",
            seeding: "Seeding",
          },
          deleteTitle: "Delete Location Movement",
          deleteMessage: "Are you sure you want to delete this movement?",
          deleteSuccess: "Movement deleted successfully",
          deleteError: "Failed to delete movement",
          table: {
            type: "Type",
            date: "Date",
            locations: "Locations",
            responsible: "Responsible",
          },
        },
      },
      table: {
        name: "Name",
      },
    },
    employees: {
      table: {
        name: "Name",
      },
    },
    serviceProviders: {
      table: {
        name: "Name",
      },
    },
    animals: {
      title: "Animals",
      table: {
        registration: "Registration",
        breed: "Breed",
        purity: "Purity",
        gender: "Gender",
        birthDate: "Birth Date",
        acquisitionDate: "Acquisition Date",
        weight: "Weight",
        weightInArrobas: "Weight (Arrobas)",
        lastWeighingDate: "Last Weighing Date",
        gmd: "GMD",
        breedingStatus: "Breeding Status",
        breedingStatusPregnant: "Pregnant",
        status: "Status",
        active: "Active",
        inactive: "Inactive",
      },
      breeds: {},
      purity: {},
      gender: {},
      emptyState: {
        title: "No animals found",
        descriptionWithoutSearch: "No animals found",
      },
    },
    common: {
      month: "month",
      months: "months",
      daysAgo: "days ago",
      dailyAverageGain: "Daily Average Gain",
      delete: "Delete",
      cancel: "Cancel",
    },
    team: {
      new: {
        back: "Back",
      },
    },
  }),
}));
vi.mock("~/contexts/language-context", () => ({
  useLanguage: () => ({ language: "en" }),
}));
const mockCanRemove = vi.fn(() => true);
vi.mock("~/utils/permissions", () => ({
  usePermissions: () => ({ canEdit: true, canRemove: mockCanRemove }),
}));
const mockShowAlert = vi.fn();
const mockNavigate = vi.fn();
vi.mock("~/hooks/use-alert", () => ({
  useAlert: () => ({
    alertMessage: null,
    showAlert: mockShowAlert,
  }),
}));

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useParams: () => ({ movementId: "movement-1" }),
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams()],
  };
});

describe("movements.$movementId", () => {
  const mockMovement = {
    id: "movement-1",
    animalIds: ["animal-1"],
    locationId: "location-1",
    propertyId: "property-1",
    employeeIds: [] as string[],
    serviceProviderIds: [] as string[],
    date: "2024-01-01",
    companyId: "company-1",
    createdAt: "2024-01-01T00:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCanRemove.mockReturnValue(true);
    mockNavigate.mockClear();
    mockShowAlert.mockClear();
    vi.mocked(getAnimalMovementById).mockResolvedValue(mockMovement as AnimalMovement);
    vi.mocked(getLocationMovementById).mockResolvedValue(undefined);
    vi.mocked(deleteLocationMovement).mockResolvedValue(undefined);
    vi.mocked(getAnimalById).mockResolvedValue({
      id: "animal-1",
      code: "A001",
      registrationNumber: "REG001",
      companyId: "company-1",
      propertyId: "property-1",
      status: "active" as const,
      createdAt: "2024-01-01T00:00:00Z",
    });
    vi.mocked(getLocationById).mockResolvedValue({
      id: "location-1",
      name: "Location 1",
      companyId: "company-1",
      createdAt: "2024-01-01T00:00:00Z",
    });
    vi.mocked(getPropertyById).mockResolvedValue({
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
    });
    vi.mocked(getEmployeeById).mockResolvedValue({
      id: "employee-1",
      name: "Employee 1",
      companyId: "company-1",
      createdAt: "2024-01-01T00:00:00Z",
    });
    vi.mocked(getServiceProviderById).mockResolvedValue({
      id: "provider-1",
      name: "Provider 1",
      companyId: "company-1",
      createdAt: "2024-01-01T00:00:00Z",
    });
    vi.mocked(getBirthsByCompanyId).mockResolvedValue([]);
  });

  it("should load movement data asynchronously", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/movements/movement-1"]}>{children}</MemoryRouter>
    );
    render(<MovementDetails />, { wrapper });

    await waitFor(() => {
      expect(getAnimalMovementById).toHaveBeenCalledWith("movement-1");
    });
  });

  it("should load related animal and location data", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/movements/movement-1"]}>{children}</MemoryRouter>
    );
    render(<MovementDetails />, { wrapper });

    await waitFor(() => {
      expect(getAnimalById).toHaveBeenCalled();
      expect(getLocationById).toHaveBeenCalled();
    });
  });

  describe("Location Movement Delete", () => {
    const mockLocationMovement = {
      id: "movement-1",
      locationIds: ["location-1"],
      propertyId: "property-1",
      employeeIds: [] as string[],
      serviceProviderIds: [] as string[],
      type: "seeding" as const,
      date: "2024-01-01",
      companyId: "company-1",
      createdAt: "2024-01-01T00:00:00Z",
    };

    beforeEach(() => {
      vi.mocked(getLocationMovementById).mockResolvedValue(
        mockLocationMovement as LocationMovement
      );
      vi.mocked(getAnimalMovementById).mockResolvedValue(undefined);
    });

    it("should show delete button for location movement when user has permission", async () => {
      mockCanRemove.mockReturnValue(true);
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter initialEntries={["/dashboard/movements/movement-1"]}>{children}</MemoryRouter>
      );
      render(<MovementDetails />, { wrapper });

      await waitFor(() => {
        expect(getLocationMovementById).toHaveBeenCalledWith("movement-1");
      });

      await waitFor(() => {
        const deleteButton = screen.queryByText("Delete");
        expect(deleteButton).toBeInTheDocument();
      });
    });

    it("should not show delete button for location movement when user lacks permission", async () => {
      mockCanRemove.mockReturnValue(false);
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter initialEntries={["/dashboard/movements/movement-1"]}>{children}</MemoryRouter>
      );
      render(<MovementDetails />, { wrapper });

      await waitFor(() => {
        expect(getLocationMovementById).toHaveBeenCalledWith("movement-1");
      });

      await waitFor(() => {
        const deleteButton = screen.queryByText("Delete");
        expect(deleteButton).not.toBeInTheDocument();
      });
    });

    it("should not show delete button for animal movement", async () => {
      mockCanRemove.mockReturnValue(true);
      vi.mocked(getLocationMovementById).mockResolvedValue(undefined);
      vi.mocked(getAnimalMovementById).mockResolvedValue(mockMovement as AnimalMovement);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter initialEntries={["/dashboard/movements/movement-1"]}>{children}</MemoryRouter>
      );
      render(<MovementDetails />, { wrapper });

      await waitFor(() => {
        expect(getAnimalMovementById).toHaveBeenCalledWith("movement-1");
      });

      await waitFor(() => {
        const deleteButton = screen.queryByText("Delete");
        expect(deleteButton).not.toBeInTheDocument();
      });
    });

    it("should open confirmation modal when delete button is clicked", async () => {
      mockCanRemove.mockReturnValue(true);
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter initialEntries={["/dashboard/movements/movement-1"]}>{children}</MemoryRouter>
      );
      const { container } = render(<MovementDetails />, { wrapper });

      await waitFor(() => {
        expect(getLocationMovementById).toHaveBeenCalledWith("movement-1");
      });

      await waitFor(() => {
        const deleteButton = screen.getByText("Delete");
        expect(deleteButton).toBeInTheDocument();
      });

      const deleteButton = screen.getByText("Delete");
      fireEvent.click(deleteButton);

      await waitFor(() => {
        const dialog = container.querySelector("dialog");
        expect(dialog).toBeInTheDocument();
        expect(screen.getByText("Delete Location Movement")).toBeInTheDocument();
      });
    });

    it("should delete location movement and navigate on confirmation", async () => {
      mockCanRemove.mockReturnValue(true);
      const user = userEvent.setup();
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter initialEntries={["/dashboard/movements/movement-1"]}>{children}</MemoryRouter>
      );
      const { container } = render(<MovementDetails />, { wrapper });

      await waitFor(() => {
        expect(getLocationMovementById).toHaveBeenCalledWith("movement-1");
      });

      await waitFor(() => {
        const deleteButton = screen.getByText("Delete");
        expect(deleteButton).toBeInTheDocument();
      });

      const deleteButton = screen.getByText("Delete");
      await user.click(deleteButton);

      await waitFor(() => {
        const dialog = container.querySelector("dialog");
        expect(dialog).toBeInTheDocument();
      });

      // Find all Delete buttons and get the one inside the dialog
      await waitFor(() => {
        const allDeleteButtons = screen.getAllByText("Delete");
        const dialogDeleteButton = allDeleteButtons.find((btn) => {
          const dialog = container.querySelector("dialog");
          return dialog?.contains(btn);
        });
        expect(dialogDeleteButton).toBeDefined();
      });

      const dialog = container.querySelector("dialog");
      const allDeleteButtons = screen.getAllByText("Delete");
      const confirmButton = allDeleteButtons.find(
        (btn) => dialog?.contains(btn) && btn !== deleteButton
      );

      if (!confirmButton) {
        throw new Error("Confirm button not found in dialog");
      }

      await user.click(confirmButton);

      await waitFor(
        () => {
          expect(deleteLocationMovement).toHaveBeenCalledWith("movement-1");
        },
        { timeout: 5000 }
      );

      expect(mockShowAlert).toHaveBeenCalledWith("Movement deleted successfully", "success");

      // Wait for navigation (the component uses setTimeout with 1500ms)
      await waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalled();
        },
        { timeout: 5000 }
      );
    }, 20000);

    it("should handle delete error and show error message", async () => {
      mockCanRemove.mockReturnValue(true);
      vi.mocked(deleteLocationMovement).mockRejectedValue(new Error("Delete failed"));
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const user = userEvent.setup();

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter initialEntries={["/dashboard/movements/movement-1"]}>{children}</MemoryRouter>
      );
      const { container } = render(<MovementDetails />, { wrapper });

      await waitFor(() => {
        expect(getLocationMovementById).toHaveBeenCalledWith("movement-1");
      });

      await waitFor(() => {
        const deleteButton = screen.getByText("Delete");
        expect(deleteButton).toBeInTheDocument();
      });

      const deleteButton = screen.getByText("Delete");
      await user.click(deleteButton);

      await waitFor(() => {
        const dialog = container.querySelector("dialog");
        expect(dialog).toBeInTheDocument();
      });

      // Find all Delete buttons and get the one inside the dialog
      await waitFor(() => {
        const allDeleteButtons = screen.getAllByText("Delete");
        const dialogDeleteButton = allDeleteButtons.find((btn) => {
          const dialog = container.querySelector("dialog");
          return dialog?.contains(btn);
        });
        expect(dialogDeleteButton).toBeDefined();
      });

      const dialog = container.querySelector("dialog");
      const allDeleteButtons = screen.getAllByText("Delete");
      const confirmButton = allDeleteButtons.find(
        (btn) => dialog?.contains(btn) && btn !== deleteButton
      );

      if (!confirmButton) {
        throw new Error("Confirm button not found in dialog");
      }

      await user.click(confirmButton);

      await waitFor(
        () => {
          expect(deleteLocationMovement).toHaveBeenCalledWith("movement-1");
        },
        { timeout: 5000 }
      );

      expect(mockShowAlert).toHaveBeenCalledWith("Failed to delete movement", "error");

      consoleErrorSpy.mockRestore();
    }, 20000);

    it("should close modal when cancel is clicked", async () => {
      mockCanRemove.mockReturnValue(true);
      const user = userEvent.setup();
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter initialEntries={["/dashboard/movements/movement-1"]}>{children}</MemoryRouter>
      );
      const { container } = render(<MovementDetails />, { wrapper });

      await waitFor(() => {
        expect(getLocationMovementById).toHaveBeenCalledWith("movement-1");
      });

      await waitFor(() => {
        const deleteButton = screen.getByText("Delete");
        expect(deleteButton).toBeInTheDocument();
      });

      const deleteButton = screen.getByText("Delete");
      await user.click(deleteButton);

      await waitFor(() => {
        const dialog = container.querySelector("dialog");
        expect(dialog).toBeInTheDocument();
      });

      const dialog = container.querySelector("dialog");
      expect(dialog).toBeInTheDocument();

      // Find Cancel button inside the dialog
      await waitFor(() => {
        const cancelButton = screen.getByText("Cancel");
        expect(cancelButton).toBeInTheDocument();
        expect(dialog?.contains(cancelButton)).toBe(true);
      });

      const cancelButton = screen.getByText("Cancel");
      await user.click(cancelButton);

      await waitFor(
        () => {
          const dialogAfterClose = container.querySelector("dialog");
          expect(dialogAfterClose).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      expect(deleteLocationMovement).not.toHaveBeenCalled();
    }, 15000);
  });
});
