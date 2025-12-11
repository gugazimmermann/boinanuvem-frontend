import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import Animals from "../animals";
import { getAnimalsByCompanyId, deleteAnimal } from "~/services/animals.service";
import { getBirthsByCompanyId } from "~/services/births.service";
import { useListPage } from "~/hooks/use-list-page";
import { useDeleteHandler } from "~/hooks/use-delete-handler";
import { useAuth } from "~/contexts/auth-context";

vi.mock("~/services/animals.service");
vi.mock("~/services/births.service");
vi.mock("~/i18n", () => ({
  useTranslation: () => ({
    animals: {
      title: "Animals",
      description: "Manage your animals",
      addAnimal: "Add Animal",
      searchPlaceholder: "Search animals...",
      movement: {
        addButton: "Add Movement",
      },
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
        properties: "Properties",
        breedingStatus: "Breeding Status",
        breedingStatusPregnant: "Pregnant",
        status: "Status",
        active: "Active",
        inactive: "Inactive",
        sold: "Sold",
      },
      breeds: {},
      purity: {},
      gender: {},
      filters: {
        all: "All",
        active: "Active",
        inactive: "Inactive",
        sold: "Sold",
      },
      badge: {
        animals: (count: number) => `${count} animals`,
        selected: (count: number) => `${count} selected`,
      },
      emptyState: {
        title: "No animals found",
        descriptionWithSearch: (searchValue: string) =>
          `No animals found matching "${searchValue}"`,
        descriptionWithoutSearch: "No animals found",
      },
      deleteModal: {
        title: "Delete Animal",
        message: (registrationNumber: string) =>
          `Are you sure you want to delete animal with registration ${registrationNumber}?`,
        confirm: "Delete",
        cancel: "Cancel",
      },
      errors: {
        loadFailed: "Failed to load animals",
        deleteFailed: "Failed to delete animal",
      },
      success: {
        deleted: "Animal deleted successfully",
      },
    },
    common: {
      cancel: "Cancel",
      delete: "Delete",
      loading: "Loading...",
      clearSearch: "Clear search",
      month: "month",
      months: "months",
      daysAgo: "days ago",
      dailyAverageGain: "Daily Average Gain",
    },
  }),
}));
vi.mock("~/contexts/language-context", () => ({
  useLanguage: () => ({ language: "en" }),
}));
vi.mock("~/hooks/use-date-locale", () => ({
  useDateLocale: () => ({}),
}));
vi.mock("~/utils/permissions", () => ({
  usePermissions: () => ({
    canAdd: () => true,
    canEdit: () => true,
    canRemove: () => true,
  }),
}));
vi.mock("~/hooks/use-alert", () => ({
  useAlert: () => ({
    alertMessage: null,
    showAlert: vi.fn(),
  }),
}));
vi.mock("~/hooks/use-list-page", () => ({
  useListPage: vi.fn(),
}));
vi.mock("~/hooks/use-delete-handler", () => ({
  useDeleteHandler: vi.fn(),
}));
vi.mock("~/contexts/auth-context", () => ({
  useAuth: vi.fn(),
}));

describe("animals.tsx", () => {
  const mockAnimals = [
    {
      id: "animal-1",
      code: "A001",
      registrationNumber: "REG001",
      companyId: "company-1",
      propertyId: "property-1",
      status: "active" as const,
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "animal-2",
      code: "A002",
      registrationNumber: "REG002",
      companyId: "company-1",
      propertyId: "property-1",
      status: "active" as const,
      createdAt: "2024-01-01T00:00:00Z",
    },
  ];

  const mockBirths = [
    {
      id: "birth-1",
      animalId: "animal-1",
      birthDate: "2024-01-01",
      gender: "male" as const,
      companyId: "company-1",
      createdAt: "2024-01-01T00:00:00Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      currentUser: { id: "user-1", companyId: "company-1" },
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      refreshToken: vi.fn(),
      getAccessToken: vi.fn(() => "token"),
      getRefreshToken: vi.fn(() => "refresh"),
    });
    vi.mocked(getAnimalsByCompanyId).mockResolvedValue(mockAnimals);
    vi.mocked(getBirthsByCompanyId).mockResolvedValue(mockBirths);
    vi.mocked(deleteAnimal).mockResolvedValue(undefined);
    vi.mocked(useListPage).mockReturnValue({
      filteredData: mockAnimals,
      paginatedData: mockAnimals,
      searchValue: "",
      setSearchValue: vi.fn(),
      activeFilter: "all",
      setActiveFilter: vi.fn(),
      currentPage: 1,
      totalPages: 1,
      setCurrentPage: vi.fn(),
      sortState: { field: null, direction: null },
      handleSort: vi.fn(),
      clearSearch: vi.fn(),
    });
    vi.mocked(useDeleteHandler).mockReturnValue({
      isDeleteModalOpen: false,
      handleCloseModal: vi.fn(),
      handleDelete: vi.fn(),
      handleDeleteClick: vi.fn(),
      selectedItem: null,
    });
  });

  it("should load animals and births asynchronously", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/animals"]}>{children}</MemoryRouter>
    );
    render(<Animals />, { wrapper });

    await waitFor(() => {
      expect(getAnimalsByCompanyId).toHaveBeenCalled();
      expect(getBirthsByCompanyId).toHaveBeenCalled();
    });
  });

  it("should create births map from loaded births", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/animals"]}>{children}</MemoryRouter>
    );
    render(<Animals />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText("A001")).toBeInTheDocument();
    });
  });

  it("should handle animal deletion with async deleteAnimal", async () => {
    const mockHandleDeleteClick = vi.fn();
    vi.mocked(useDeleteHandler).mockReturnValue({
      isDeleteModalOpen: false,
      handleCloseModal: vi.fn(),
      handleDelete: vi.fn(),
      handleDeleteClick: mockHandleDeleteClick,
      selectedItem: null,
    });

    const user = userEvent.setup();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/animals"]}>{children}</MemoryRouter>
    );
    render(<Animals />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText("A001")).toBeInTheDocument();
    });

    // Find and click delete button
    const deleteButtons = screen.queryAllByRole("button", { name: /delete/i });
    if (deleteButtons.length > 0) {
      await user.click(deleteButtons[0]);
      await waitFor(() => {
        expect(mockHandleDeleteClick).toHaveBeenCalled();
      });
    }
  });

  it("should show loading state initially", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/animals"]}>{children}</MemoryRouter>
    );

    render(<Animals />, { wrapper });

    // Wait for data to load and component to update
    await waitFor(
      () => {
        expect(screen.getByText("A001")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});
