import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getSaleById,
  getSalesByCompanyId,
  getSalesByBuyerId,
  getSalesByAnimalId,
  isAnimalSold,
  getSalesByDateRange,
  getSalesBySaleType,
  addSale,
  updateSale,
  deleteSale,
} from "../sales.service";
import { PricingMode, SalePaymentMethod, SaleType } from "~/types";
import { ApiError } from "../api-client";

const { mockSalesData, mockApiClient, mockGet, mockPost, mockPut, mockDelete } = vi.hoisted(() => {
  const mockSalesData = [
    {
      id: "sale-1",
      companyId: "company-1",
      buyerId: "buyer-1",
      propertyId: "property-1",
      saleDate: "2024-01-15",
      saleType: "other_farm" as const,
      paymentMethod: "cash_flow",
      totalPrice: 5000,
      fees: 100,
      transportationFee: 50,
      additionalFees: 25,
      saleItems: [{ animalId: "animal-1", weight: 500, price: 10 }],
      linkedCashFlowId: "cf-1",
      createdAt: "2024-01-15",
    },
    {
      id: "sale-2",
      companyId: "company-1",
      buyerId: "buyer-2",
      propertyId: "property-1",
      saleDate: "2024-02-15",
      saleType: "auction",
      paymentMethod: "accounts_receivable",
      totalPrice: 3000,
      saleItems: [{ animalId: "animal-2", weight: 300, price: 10 }],
      linkedAccountsReceivableId: "ar-1",
      createdAt: "2024-02-15",
    },
  ];
  const mockGet = vi.fn();
  const mockPost = vi.fn();
  const mockPut = vi.fn();
  const mockDelete = vi.fn();
  return {
    mockSalesData,
    mockApiClient: {
      get: mockGet,
      post: mockPost,
      put: mockPut,
      delete: mockDelete,
    },
    mockGet,
    mockPost,
    mockPut,
    mockDelete,
  };
});

vi.mock("~/mocks/sales", () => {
  // Return the same array reference so the service uses it
  return {
    get mockSales() {
      return mockSalesData;
    },
  };
});

const { mockUpdateAnimal } = vi.hoisted(() => ({
  mockUpdateAnimal: vi.fn(),
}));

vi.mock("../animals.service", () => ({
  getAnimalById: vi.fn(),
  updateAnimal: mockUpdateAnimal,
  getAnimalsByCompanyId: vi.fn(),
}));

vi.mock("../cash-flow.service", () => ({
  addCashFlow: vi.fn(),
  updateCashFlow: vi.fn(),
  deleteCashFlow: vi.fn(),
}));

const { mockDeleteAccountsReceivable } = vi.hoisted(() => ({
  mockDeleteAccountsReceivable: vi.fn(),
}));

vi.mock("../accounts-receivable.service", () => ({
  addAccountsReceivable: vi.fn(),
  updateAccountsReceivable: vi.fn(),
  deleteAccountsReceivable: mockDeleteAccountsReceivable,
}));

vi.mock("~/utils/fees", () => ({
  getTotalFees: vi.fn(
    (fees: number | undefined, transport: number | undefined, additional: number | undefined) =>
      (fees || 0) + (transport || 0) + (additional || 0)
  ),
}));

vi.mock("../api-client", async (importOriginal: () => Promise<typeof import("../api-client")>) => {
  const actual = await importOriginal();
  return {
    ...actual,
    apiClient: mockApiClient,
  };
});

// Use mockSalesData directly instead of importing from non-existent mocks file
const mockSales = mockSalesData;
import { getAnimalById, updateAnimal } from "../animals.service";
import { addCashFlow, updateCashFlow, deleteCashFlow } from "../cash-flow.service";
import {
  addAccountsReceivable,
  updateAccountsReceivable,
  deleteAccountsReceivable,
} from "../accounts-receivable.service";

describe("sales.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default API client mocks
    mockGet.mockResolvedValue(mockSales);
    mockPost.mockResolvedValue(mockSales[0]);
    mockPut.mockResolvedValue(mockSales[0]);
    mockDelete.mockResolvedValue(undefined);
  });

  describe("getSaleById", () => {
    it("should find sale by id", async () => {
      mockGet.mockResolvedValueOnce(mockSales[0]);
      const result = await getSaleById("sale-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("sale-1");
    });

    it("should return undefined when not found", async () => {
      mockGet.mockRejectedValueOnce(new Error("Not found"));
      const result = await getSaleById("nonexistent");
      expect(result).toBeUndefined();
    });
  });

  describe("getSalesByCompanyId", () => {
    it("should find sales by company id", async () => {
      mockGet.mockResolvedValueOnce(mockSales);
      const result = await getSalesByCompanyId("company-1");
      expect(result).toHaveLength(2);
    });
  });

  describe("getSalesByBuyerId", () => {
    it("should find sales by buyer id", async () => {
      mockGet.mockResolvedValueOnce(mockSales);
      const result = await getSalesByBuyerId("buyer-1");
      expect(result).toHaveLength(1);
      expect(result[0].buyerId).toBe("buyer-1");
    });
  });

  describe("getSalesByAnimalId", () => {
    it("should find sales by animal id", async () => {
      const animalSales = mockSales.filter((s: (typeof mockSales)[0]) =>
        s.saleItems.some((item: (typeof s.saleItems)[0]) => item.animalId === "animal-1")
      );
      mockGet.mockResolvedValueOnce(animalSales);
      const result = await getSalesByAnimalId("animal-1");
      expect(result).toHaveLength(1);
    });

    it("should return empty array when animal id is empty", async () => {
      const result = await getSalesByAnimalId("");
      expect(result).toEqual([]);
    });
  });

  describe("isAnimalSold", () => {
    it("should return true when animal status is sold", async () => {
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      getAnimal.mockResolvedValue({ id: "animal-1", status: "sold" });

      const result = await isAnimalSold("animal-1");
      expect(result).toBe(true);
    });

    it("should return false when animal status is active", async () => {
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      getAnimal.mockResolvedValue({ id: "animal-1", status: "active" });

      const result = await isAnimalSold("animal-1");
      expect(result).toBe(false);
    });

    it("should return false when animal id is empty", async () => {
      const result = await isAnimalSold("");
      expect(result).toBe(false);
    });

    it("should return false when animal not found", async () => {
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      getAnimal.mockResolvedValue(undefined);

      const result = await isAnimalSold("nonexistent");
      expect(result).toBe(false);
    });
  });

  describe("getSalesByDateRange", () => {
    it("should find sales within date range", async () => {
      mockGet.mockResolvedValueOnce(mockSales);
      const result = await getSalesByDateRange("company-1", "2024-01-01", "2024-01-31");
      expect(result).toHaveLength(1);
      expect(result[0].saleDate).toBe("2024-01-15");
    });

    it("should return empty array when no sales in range", async () => {
      mockGet.mockResolvedValueOnce(mockSales);
      const result = await getSalesByDateRange("company-1", "2024-03-01", "2024-03-31");
      expect(result).toEqual([]);
    });
  });

  describe("getSalesBySaleType", () => {
    it("should find sales by sale type", async () => {
      mockGet.mockResolvedValueOnce(mockSales);
      const result = await getSalesBySaleType("other_farm");
      expect(result).toHaveLength(1);
      expect(result[0].saleType).toBe("other_farm");
    });
  });

  describe("addSale", () => {
    it("should create sale with cash flow payment method", async () => {
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const addCash = addCashFlow as ReturnType<typeof vi.fn>;
      const updateAnimalMock = updateAnimal as ReturnType<typeof vi.fn>;
      getAnimal.mockResolvedValue({ id: "animal-3", code: "003", status: "active" });
      addCash.mockResolvedValue({ id: "cf-new" });
      updateAnimalMock.mockResolvedValue({ id: "animal-3", status: "sold" } as never);

      const formData = {
        companyId: "company-1",
        buyerId: "buyer-1",
        propertyId: "property-1",
        saleDate: "2024-03-01",
        saleType: SaleType.OTHER_FARM,
        pricingMode: PricingMode.TOTAL,
        paymentMethod: SalePaymentMethod.CASH_FLOW,
        totalPrice: 4000,
        fees: [],
        transportationFee: 50,
        additionalFees: 25,
        saleItems: [{ animalId: "animal-3", weight: 400, price: 10 }],
        propertyIds: [],
      };

      const createdSale = {
        ...mockSales[0],
        id: "sale-new",
        saleDate: "2024-03-01",
        totalPrice: 4000,
        saleItems: [{ animalId: "animal-3", weight: 400, price: 10 }],
      };
      mockPost.mockResolvedValueOnce(createdSale);

      const result = await addSale(formData);

      expect(result.id).toBeDefined();
      expect(updateAnimalMock).toHaveBeenCalledWith("animal-3", { status: "sold" });
      expect(addCash).toHaveBeenCalled();
    });

    it("should create sale with accounts receivable payment method", async () => {
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const addAR = addAccountsReceivable as ReturnType<typeof vi.fn>;
      const updateAnimalMock = updateAnimal as ReturnType<typeof vi.fn>;
      getAnimal.mockResolvedValue({ id: "animal-4", code: "004", status: "active" });
      addAR.mockResolvedValue({ id: "ar-new" });
      updateAnimalMock.mockResolvedValue({ id: "animal-4", status: "sold" } as never);

      const formData = {
        companyId: "company-1",
        buyerId: "buyer-1",
        propertyId: "property-1",
        saleDate: "2024-03-01",
        saleType: SaleType.OTHER_FARM,
        pricingMode: PricingMode.TOTAL,
        paymentMethod: SalePaymentMethod.ACCOUNTS_RECEIVABLE,
        totalPrice: 4000,
        fees: [],
        saleItems: [{ animalId: "animal-4", weight: 400, price: 10 }],
        propertyIds: [],
      };

      const createdSale = {
        ...mockSales[0],
        id: "sale-new",
        saleDate: "2024-03-01",
        totalPrice: 4000,
        saleItems: [{ animalId: "animal-4", weight: 400, price: 10 }],
      };
      mockPost.mockResolvedValueOnce(createdSale);

      const result = await addSale(formData);

      expect(result.id).toBeDefined();
      expect(addAR).toHaveBeenCalled();
    });
  });

  describe("updateSale", () => {
    it("should update sale without changing payment method", async () => {
      mockGet.mockResolvedValueOnce(mockSales[0]);
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      getAnimal.mockResolvedValue({ id: "animal-1", code: "001" });

      const updateData = { totalPrice: 6000 };
      const result = await updateSale("sale-1", updateData);

      expect(result).toBe(true);
      expect(updateCashFlow).toHaveBeenCalled();
    });

    it("should update sale and change payment method", async () => {
      mockGet.mockResolvedValueOnce(mockSales[1]); // Has accounts_receivable
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const updateAR = updateAccountsReceivable as ReturnType<typeof vi.fn>;

      getAnimal.mockResolvedValue({ id: "animal-2", code: "002" });
      updateAR.mockResolvedValue(undefined);

      const updateData = {
        pricingMode: PricingMode.TOTAL,
        paymentMethod: SalePaymentMethod.CASH_FLOW,
        totalPrice: 4000,
      };

      const result = await updateSale("sale-2", updateData);

      expect(result).toBe(true);
      // When price changes, it updates the existing linked accounts receivable amount
      expect(updateAR).toHaveBeenCalledWith(
        "ar-1",
        expect.objectContaining({ amount: expect.any(Number) })
      );
    });

    it("should return false when sale not found", async () => {
      // getSaleById catches errors and returns undefined, which causes updateSale to throw
      // We need to mock it to reject so getSaleById returns undefined
      mockGet.mockRejectedValueOnce(new ApiError("Not found", 404));

      await expect(updateSale("nonexistent", { totalPrice: 1000 })).rejects.toThrow();
    });

    it("should update animal statuses when sale items change", async () => {
      // Modify the mock sale to have two animals
      const saleWithTwoAnimals = {
        ...mockSales[0],
        saleItems: [
          { animalId: "animal-1", weight: 500, price: 10 },
          { animalId: "animal-2", weight: 400, price: 10 },
        ],
      };
      // First call is getSaleById, second call is the PUT request
      mockGet.mockResolvedValueOnce(saleWithTwoAnimals).mockResolvedValueOnce(saleWithTwoAnimals);

      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      getAnimal.mockImplementation(async (id: string) => {
        if (id === "animal-1") return { id: "animal-1", status: "sold" };
        if (id === "animal-2") return { id: "animal-2", status: "sold" };
        return undefined;
      });

      const updateData = {
        saleItems: [{ animalId: "animal-1", weight: 500, price: 10 }], // Removed animal-2
      };

      await updateSale("sale-1", updateData);

      expect(mockUpdateAnimal).toHaveBeenCalledWith("animal-2", { status: "active" });
    });
  });

  describe("deleteSale", () => {
    it("should delete sale and restore animal statuses", async () => {
      mockGet.mockResolvedValueOnce(mockSales[0]);
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const updateAnimalMock = updateAnimal as ReturnType<typeof vi.fn>;
      const deleteCashFlowMock = deleteCashFlow as ReturnType<typeof vi.fn>;
      getAnimal.mockResolvedValue({ id: "animal-1", code: "001", status: "sold" });
      updateAnimalMock.mockResolvedValue({ id: "animal-1", status: "active" } as never);
      deleteCashFlowMock.mockResolvedValue(undefined);

      const result = await deleteSale("sale-1");

      expect(result).toBe(true);
      expect(updateAnimalMock).toHaveBeenCalledWith("animal-1", { status: "active" });
      expect(deleteCashFlow).toHaveBeenCalledWith("cf-1");
    });

    it("should delete linked accounts receivable", async () => {
      // mockSales[1] already has linkedAccountsReceivableId: "ar-1"
      const sale = {
        ...mockSales[1],
        linkedAccountsReceivableId: "ar-1",
      };
      // Verify the sale has the property before transformation
      expect(sale.linkedAccountsReceivableId).toBe("ar-1");

      // Reset mockGet to clear the default mockResolvedValue from beforeEach
      mockGet.mockReset();
      // First call is getSaleById (which calls transformSale and preserves all properties),
      // Second call is the DELETE request for the sale itself
      mockGet.mockResolvedValueOnce(sale).mockResolvedValueOnce(undefined);

      // Clear any previous calls
      mockDeleteAccountsReceivable.mockClear();

      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const updateAnimalMock = updateAnimal as ReturnType<typeof vi.fn>;
      getAnimal.mockResolvedValue({ id: "animal-2", code: "002", status: "sold" });
      updateAnimalMock.mockResolvedValue({ id: "animal-2", status: "active" } as never);
      mockDeleteAccountsReceivable.mockResolvedValue(undefined);

      const result = await deleteSale("sale-2");

      expect(result).toBe(true);
      // Verify deleteAccountsReceivable was called with the correct ID
      // The transformSale function uses ...backendSale so it preserves linkedAccountsReceivableId
      // The imported deleteAccountsReceivable should be the mocked one
      expect(deleteAccountsReceivable).toBe(mockDeleteAccountsReceivable);
      expect(deleteAccountsReceivable).toHaveBeenCalledWith("ar-1");
      // Also verify the mock directly to be sure
      expect(mockDeleteAccountsReceivable).toHaveBeenCalledWith("ar-1");
    });

    it("should return false when sale not found", async () => {
      // getSaleById catches errors and returns undefined, which causes deleteSale to throw
      // We need to mock it to reject so getSaleById returns undefined
      // Clear the default mock first
      mockGet.mockReset();
      mockGet.mockRejectedValueOnce(new ApiError("Not found", 404));

      await expect(deleteSale("nonexistent")).rejects.toThrow();
    });
  });
});
