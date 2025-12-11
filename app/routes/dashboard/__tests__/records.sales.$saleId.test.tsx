import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import SaleDetails from "../records.sales.$saleId";
import { getSaleById } from "~/services/sales.service";
import { getAnimalById } from "~/services/animals.service";
import { getBuyerById } from "~/services/buyers.service";
import { getPropertyById } from "~/services/properties.service";
import { getBirthByAnimalId } from "~/services/births.service";
import { getAcquisitionByAnimalId } from "~/services/acquisitions.service";
import { calculateAnimalProfitability } from "~/utils/profitability";

vi.mock("~/services/sales.service");
vi.mock("~/services/animals.service");
vi.mock("~/services/buyers.service");
vi.mock("~/services/properties.service");
vi.mock("~/services/births.service");
vi.mock("~/services/acquisitions.service");
vi.mock("~/utils/profitability", () => ({
  calculateAnimalProfitability: vi.fn(),
}));
vi.mock("~/i18n", () => ({
  useTranslation: () => ({
    sales: {
      view: {
        title: "Sale Details",
      },
    },
  }),
}));
vi.mock("~/contexts/language-context", () => ({
  useLanguage: () => ({ language: "en" }),
}));
vi.mock("~/utils/permissions", () => ({
  usePermissions: () => ({
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
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useParams: () => ({ saleId: "sale-1" }),
    useNavigate: () => vi.fn(),
  };
});

describe("records.sales.$saleId", () => {
  const mockSale = {
    id: "sale-1",
    companyId: "company-1",
    saleDate: "2024-01-01",
    buyerId: "buyer-1",
    propertyId: "property-1",
    saleItems: [
      {
        animalId: "animal-1",
        price: 1000,
        weight: 500,
      },
    ],
    totalPrice: 1000,
    paymentMethod: "cash" as const,
    saleType: "otherFarm" as const,
    pricingMode: "total" as const,
    createdAt: "2024-01-01T00:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSaleById).mockResolvedValue(mockSale);
    vi.mocked(getAnimalById).mockResolvedValue({
      id: "animal-1",
      code: "A001",
      registrationNumber: "REG001",
      companyId: "company-1",
      propertyId: "property-1",
      status: "active" as const,
      createdAt: "2024-01-01T00:00:00Z",
    });
    vi.mocked(getBirthByAnimalId).mockResolvedValue(undefined);
    vi.mocked(getAcquisitionByAnimalId).mockResolvedValue(undefined);
    vi.mocked(getBuyerById).mockResolvedValue({
      id: "buyer-1",
      name: "Buyer 1",
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
    vi.mocked(calculateAnimalProfitability).mockResolvedValue({
      animalId: "animal-1",
      totalCost: 500,
      salePrice: 1000,
      profit: 500,
      profitMargin: 50,
      costPerKg: 1,
      pricePerKg: 2,
      roi: 100,
    });
  });

  it("should load sale data asynchronously", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/records/sales/sale-1"]}>{children}</MemoryRouter>
    );
    render(<SaleDetails />, { wrapper });

    await waitFor(() => {
      expect(getSaleById).toHaveBeenCalledWith("sale-1");
    });
  });

  it("should load related animal, buyer, and property data", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/records/sales/sale-1"]}>{children}</MemoryRouter>
    );
    render(<SaleDetails />, { wrapper });

    await waitFor(() => {
      expect(getAnimalById).toHaveBeenCalled();
      expect(getBuyerById).toHaveBeenCalled();
      expect(getPropertyById).toHaveBeenCalled();
    });
  });
});
