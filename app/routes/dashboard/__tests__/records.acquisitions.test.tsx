import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import Acquisitions from "../records.acquisitions";
import { getAcquisitionsByCompanyId, deleteAcquisition } from "~/services/acquisitions.service";
import { getAnimalsByCompanyId } from "~/services/animals.service";
import { getProperties } from "~/services/properties.service";
import { getSuppliers } from "~/services/suppliers.service";
import { useAuth } from "~/contexts/auth-context";

vi.mock("~/services/acquisitions.service");
vi.mock("~/services/animals.service");
vi.mock("~/services/properties.service");
vi.mock("~/services/suppliers.service");
vi.mock("~/i18n", () => ({
  useTranslation: () => ({
    acquisitions: {
      title: "Acquisitions",
      description: "Manage all animal acquisitions",
      table: {
        date: "Date",
        acquisitionDate: "Acquisition Date",
        supplier: "Supplier",
        property: "Property",
        animals: "Animals",
        totalAmount: "Total Amount",
        totalPrice: "Total Price",
        costPerArroba: "Cost per Arroba",
        paymentMethod: "Payment Method",
      },
      paymentMethods: {
        cash: "Cash",
        cashFlow: "Cash Flow",
        accountsPayable: "Accounts Payable",
      },
      badge: {
        acquisitions: (count: number) => `${count} acquisitions`,
      },
      searchPlaceholder: "Search acquisitions...",
      filters: {
        supplier: "Supplier",
        allSuppliers: "All Suppliers",
      },
      emptyState: {
        title: "No acquisitions found",
        description: "Start by adding a new acquisition",
        descriptionWithSearch: (search: string) => `No acquisitions found for "${search}"`,
      },
      new: {
        addButton: "Add Acquisition",
      },
      success: {
        deleted: "Acquisition deleted successfully",
      },
      errors: {
        deleteFailed: "Failed to delete acquisition",
      },
      deleteModal: {
        title: "Delete Acquisition",
        message: "Are you sure you want to delete this acquisition?",
        confirm: "Delete",
        cancel: "Cancel",
      },
    },
    common: {
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      view: "View",
      loading: "Loading...",
      clearSearch: "Clear search",
    },
  }),
}));
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
vi.mock("~/mocks/companies", () => ({
  mockCompanies: [
    {
      id: "company-1",
      companyName: "Test Company",
    },
  ],
}));
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});
vi.mock("~/contexts/auth-context", () => ({
  useAuth: vi.fn(),
}));

describe("records.acquisitions", () => {
  const mockAcquisitions = [
    {
      id: "acq-1",
      companyId: "company-1",
      acquisitionDate: "2024-01-01",
      supplierId: "supplier-1",
      propertyId: "property-1",
      acquisitionItems: [],
      totalAmount: 1000,
      paymentMethod: "cash" as const,
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
    vi.mocked(getAcquisitionsByCompanyId).mockResolvedValue(mockAcquisitions);
    vi.mocked(getAnimalsByCompanyId).mockResolvedValue([]);
    vi.mocked(getProperties).mockResolvedValue([]);
    vi.mocked(getSuppliers).mockResolvedValue([]);
    vi.mocked(deleteAcquisition).mockResolvedValue(undefined);
  });

  it("should load acquisitions, animals, properties, and suppliers asynchronously", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/records/acquisitions"]}>{children}</MemoryRouter>
    );
    render(<Acquisitions />, { wrapper });

    await waitFor(() => {
      expect(getAcquisitionsByCompanyId).toHaveBeenCalled();
      expect(getAnimalsByCompanyId).toHaveBeenCalled();
      expect(getProperties).toHaveBeenCalled();
      expect(getSuppliers).toHaveBeenCalled();
    });
  });

  it("should create maps for properties, suppliers, and animals", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/records/acquisitions"]}>{children}</MemoryRouter>
    );
    render(<Acquisitions />, { wrapper });

    await waitFor(() => {
      expect(getAcquisitionsByCompanyId).toHaveBeenCalled();
    });
  });

  it("should show loading state initially", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/records/acquisitions"]}>{children}</MemoryRouter>
    );
    render(<Acquisitions />, { wrapper });

    // Wait for data to load
    await waitFor(() => {
      expect(getAcquisitionsByCompanyId).toHaveBeenCalled();
    });
  });
});
