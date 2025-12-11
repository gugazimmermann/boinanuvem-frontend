import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import Properties from "../properties";
import { getProperties } from "~/services/properties.service";
import { getLocations } from "~/services/locations.service";
import { getAnimalsByCompanyId } from "~/services/animals.service";

vi.mock("~/services/properties.service");
vi.mock("~/services/locations.service");
vi.mock("~/services/animals.service");
vi.mock("~/i18n", () => ({
  useTranslation: () => ({
    properties: {
      title: "Properties",
      description: "Manage your properties",
      table: {
        name: "Name",
        address: "Address",
        area: "Area",
        pastures: "Pastures",
        locations: "Locations",
        animals: "Animals",
        status: "Status",
        active: "Active",
        inactive: "Inactive",
      },
      errors: {
        loadFailed: "Failed to load properties",
        deleteFailed: "Failed to delete property",
      },
      success: {
        deleted: "Property deleted successfully",
      },
      badge: {
        properties: (count: number) => `${count} properties`,
      },
      searchPlaceholder: "Search properties...",
      emptyState: {
        title: "No properties found",
        descriptionWithSearch: (search: string) => `No properties found for "${search}"`,
        descriptionWithoutSearch: "Start by adding a new property",
      },
      addProperty: "Add Property",
      filters: {
        all: "All",
        active: "Active",
        inactive: "Inactive",
      },
      deleteModal: {
        title: "Delete Property",
        message: (name: string) => `Are you sure you want to delete ${name}?`,
        confirm: "Delete",
        cancel: "Cancel",
      },
    },
  }),
}));
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});
vi.mock("~/contexts/language-context", () => ({
  useLanguage: () => ({ language: "en" }),
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

describe("properties.tsx", () => {
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
    vi.mocked(getProperties).mockResolvedValue(mockProperties);
    vi.mocked(getLocations).mockResolvedValue([]);
    vi.mocked(getAnimalsByCompanyId).mockResolvedValue([]);
  });

  it("should load properties asynchronously", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/properties"]}>{children}</MemoryRouter>
    );
    render(<Properties />, { wrapper });

    await waitFor(() => {
      expect(getProperties).toHaveBeenCalled();
    });
  });
});
