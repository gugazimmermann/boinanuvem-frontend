import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import Sales from "../records.sales";
import { getSalesByCompanyId } from "~/services/sales.service";
import { getAnimalsByCompanyId } from "~/services/animals.service";
import { getBuyers } from "~/services/buyers.service";
import { getProperties } from "~/services/properties.service";
import { getBirthByAnimalId } from "~/services/births.service";
import { getAcquisitionByAnimalId } from "~/services/acquisitions.service";

vi.mock("~/services/sales.service");
vi.mock("~/services/animals.service");
vi.mock("~/services/buyers.service");
vi.mock("~/services/properties.service");
vi.mock("~/services/births.service");
vi.mock("~/services/acquisitions.service");
vi.mock("~/i18n", () => ({
  useTranslation: () => ({
    sales: {
      title: "Sales",
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
vi.mock("~/contexts/auth-context", () => ({
  useAuth: vi.fn(() => ({
    currentUser: {
      id: "user-1",
      email: "test@example.com",
      name: "Test User",
      mainUser: true,
      companyId: "company-1",
      permissions: {},
      company: null,
    },
    login: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: true,
    refreshTokens: vi.fn(),
    getAccessToken: vi.fn(() => "access-token"),
    getRefreshToken: vi.fn(() => "refresh-token"),
  })),
}));

describe("records.sales", () => {
  const mockSales = [
    {
      id: "sale-1",
      companyId: "company-1",
      saleDate: "2024-01-01",
      buyerId: "buyer-1",
      propertyId: "property-1",
      saleItems: [],
      totalPrice: 1000,
      paymentMethod: "cash" as const,
      createdAt: "2024-01-01T00:00:00Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSalesByCompanyId).mockResolvedValue(mockSales);
    vi.mocked(getAnimalsByCompanyId).mockResolvedValue([]);
    vi.mocked(getBuyers).mockResolvedValue([]);
    vi.mocked(getProperties).mockResolvedValue([]);
    vi.mocked(getBirthByAnimalId).mockResolvedValue(undefined);
    vi.mocked(getAcquisitionByAnimalId).mockResolvedValue(undefined);
  });

  it("should load sales, animals, buyers, and properties asynchronously", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/records/sales"]}>{children}</MemoryRouter>
    );
    render(<Sales />, { wrapper });

    await waitFor(() => {
      expect(getSalesByCompanyId).toHaveBeenCalled();
      expect(getAnimalsByCompanyId).toHaveBeenCalled();
      expect(getBuyers).toHaveBeenCalled();
      expect(getProperties).toHaveBeenCalled();
    });
  });

  it("should create maps for animals, buyers, and properties", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/records/sales"]}>{children}</MemoryRouter>
    );
    render(<Sales />, { wrapper });

    await waitFor(() => {
      expect(getSalesByCompanyId).toHaveBeenCalled();
    });
  });
});
