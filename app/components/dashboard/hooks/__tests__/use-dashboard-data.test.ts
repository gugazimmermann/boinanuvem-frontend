import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useDashboardData } from "../use-dashboard-data";
import { AccountsPayableStatus, AccountsReceivableStatus, AreaType, type Property } from "~/types";
import * as propertiesService from "~/services/properties.service";
import * as locationsService from "~/services/locations.service";
import * as animalsService from "~/services/animals.service";
import * as weighingsService from "~/services/weighings.service";
import * as reproductiveIndexesService from "~/services/reproductive-indexes.service";
import * as cashFlowService from "~/services/cash-flow.service";
import * as accountsPayableService from "~/services/accounts-payable.service";
import * as accountsReceivableService from "~/services/accounts-receivable.service";
import * as birthsService from "~/services/births.service";
import * as breedingsService from "~/services/breedings.service";
import * as employeesService from "~/services/employees.service";
import * as suppliersService from "~/services/suppliers.service";
import * as buyersService from "~/services/buyers.service";
import * as salesService from "~/services/sales.service";
import * as salesAnalyticsService from "~/services/sales-analytics.service";

vi.mock("~/services/properties.service");
vi.mock("~/services/locations.service");
vi.mock("~/services/animals.service");
vi.mock("~/services/weighings.service");
vi.mock("~/services/reproductive-indexes.service");
vi.mock("~/services/cash-flow.service");
vi.mock("~/services/accounts-payable.service");
vi.mock("~/services/accounts-receivable.service");
vi.mock("~/services/births.service");
vi.mock("~/services/breedings.service");
vi.mock("~/services/employees.service");
vi.mock("~/services/suppliers.service");
vi.mock("~/services/buyers.service");
vi.mock("~/services/sales.service");
vi.mock("~/services/sales-analytics.service");

describe("useDashboardData", () => {
  const companyId = "company-1";

  const mockProperties: Property[] = [
    {
      id: "1",
      companyId: "company-1",
      name: "Property 1",
      code: "PROP-1",
      area: { value: 100, type: AreaType.HECTARES },
      status: "active",
      createdAt: "2024-01-01T00:00:00Z",
      street: "Main St",
      number: "123",
      complement: "",
      neighborhood: "Downtown",
      city: "City",
      state: "ST",
      zipCode: "12345-678",
    },
    {
      id: "2",
      companyId: "company-1",
      name: "Property 2",
      code: "PROP-2",
      area: { value: 200, type: AreaType.HECTARES },
      status: "active",
      createdAt: "2024-01-01T00:00:00Z",
      street: "Main St",
      number: "456",
      complement: "",
      neighborhood: "Downtown",
      city: "City",
      state: "ST",
      zipCode: "12345-678",
    },
  ];

  const mockLocations = [{ id: "1", companyId: "company-1", name: "Location 1" }];

  const mockEmployees = [{ id: "1", companyId: "company-1", name: "Employee 1" }];

  const mockSuppliers = [{ id: "1", companyId: "company-1", name: "Supplier 1" }];

  const mockBuyers = [{ id: "1", companyId: "company-1", name: "Buyer 1" }];

  const mockAnimals = [
    { id: "1", companyId: "company-1", status: "active" },
    { id: "2", companyId: "company-1", status: "inactive" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(propertiesService.getProperties).mockResolvedValue(
      mockProperties as unknown as Awaited<ReturnType<typeof propertiesService.getProperties>>
    );
    vi.mocked(locationsService.getLocations).mockResolvedValue(
      mockLocations as unknown as Awaited<ReturnType<typeof locationsService.getLocations>>
    );
    vi.mocked(employeesService.getEmployees).mockResolvedValue(
      mockEmployees as unknown as Awaited<ReturnType<typeof employeesService.getEmployees>>
    );
    vi.mocked(suppliersService.getSuppliers).mockResolvedValue(
      mockSuppliers as unknown as Awaited<ReturnType<typeof suppliersService.getSuppliers>>
    );
    vi.mocked(buyersService.getBuyers).mockResolvedValue(
      mockBuyers as unknown as Awaited<ReturnType<typeof buyersService.getBuyers>>
    );
    vi.mocked(animalsService.getAnimalsByCompanyId).mockReturnValue(
      mockAnimals as unknown as ReturnType<typeof animalsService.getAnimalsByCompanyId>
    );
    vi.mocked(animalsService.getAnimalsByPropertyId).mockReturnValue(
      [] as unknown as ReturnType<typeof animalsService.getAnimalsByPropertyId>
    );
    vi.mocked(weighingsService.getWeighingsByCompanyId).mockReturnValue(
      [] as unknown as ReturnType<typeof weighingsService.getWeighingsByCompanyId>
    );
    vi.mocked(weighingsService.getWeighingsByAnimalId).mockReturnValue(
      [] as unknown as ReturnType<typeof weighingsService.getWeighingsByAnimalId>
    );
    vi.mocked(reproductiveIndexesService.getExpectedBirthsForecast).mockReturnValue({
      monthly: [],
      total: 0,
    } as never);
    vi.mocked(cashFlowService.getCashFlowByCompanyId).mockReturnValue([] as never);
    vi.mocked(accountsPayableService.getAccountsPayableByCompanyId).mockReturnValue([] as never);
    vi.mocked(accountsReceivableService.getAccountsReceivableByCompanyId).mockReturnValue(
      [] as never
    );
    vi.mocked(birthsService.getBirthsByCompanyId).mockReturnValue([] as never);
    vi.mocked(birthsService.getBirthsByPropertyId).mockReturnValue([] as never);
    vi.mocked(breedingsService.getBreedingsByCompanyId).mockReturnValue([] as never);
    vi.mocked(breedingsService.getBreedingsByPropertyId).mockReturnValue([] as never);
    vi.mocked(salesService.getSalesByCompanyId).mockReturnValue([] as never);
    vi.mocked(salesAnalyticsService.getSalesMetrics).mockResolvedValue({
      totalRevenue: 0,
      totalSales: 0,
      averagePrice: 0,
    } as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should fetch and filter properties by companyId", async () => {
    const { result } = renderHook(() => useDashboardData(companyId));

    await waitFor(() => {
      expect(result.current.totalProperties).toBe(2);
    });
  });

  it("should fetch and filter locations by companyId", async () => {
    const { result } = renderHook(() => useDashboardData(companyId));

    await waitFor(() => {
      expect(result.current.totalLocations).toBe(1);
    });
  });

  it("should filter animals by active status", async () => {
    const { result } = renderHook(() => useDashboardData(companyId));

    await waitFor(() => {
      expect(result.current.totalAnimals).toBe(1); // Only active animals
      expect(result.current.animals.length).toBe(1);
    });
  });

  it("should filter animals by propertyId when filter is provided", async () => {
    const filters = { propertyId: "property-1" };
    renderHook(() => useDashboardData(companyId, filters));

    await waitFor(() => {
      expect(animalsService.getAnimalsByPropertyId).toHaveBeenCalledWith("property-1");
    });
  });

  it("should calculate total weight from weighings", async () => {
    const mockWeighings = [
      { id: "1", animalId: "1", weight: 500, date: "2024-01-01" },
      { id: "2", animalId: "1", weight: 600, date: "2024-02-01" }, // More recent
      { id: "3", animalId: "2", weight: 400, date: "2024-01-01" },
    ];

    vi.mocked(weighingsService.getWeighingsByCompanyId).mockReturnValue(mockWeighings as never);

    const { result } = renderHook(() => useDashboardData(companyId));

    // Should use most recent weighing per animal
    await waitFor(() => {
      expect(result.current.totalWeight).toBe(1000); // 600 + 400
    });
  });

  it("should return employees filtered by companyId", async () => {
    const { result } = renderHook(() => useDashboardData(companyId));

    await waitFor(() => {
      expect(result.current.employees.length).toBe(1);
    });
  });

  it("should return suppliers filtered by companyId", async () => {
    const { result } = renderHook(() => useDashboardData(companyId));

    await waitFor(() => {
      expect(result.current.suppliers.length).toBe(1);
    });
  });

  it("should return buyers filtered by companyId", async () => {
    const { result } = renderHook(() => useDashboardData(companyId));

    await waitFor(() => {
      expect(result.current.buyers.length).toBe(1);
    });
  });

  it("should filter cash flow by date range when filters provided", async () => {
    const filters = { startDate: "2024-01-01", endDate: "2024-12-31" };
    const mockCashFlow = [
      { id: "1", date: "2024-06-01", type: "income", amount: 1000 },
      { id: "2", date: "2025-01-01", type: "income", amount: 2000 }, // Outside range
    ];

    vi.mocked(cashFlowService.getCashFlowByCompanyId).mockReturnValue(mockCashFlow as never);

    const { result } = renderHook(() => useDashboardData(companyId, filters));

    await waitFor(() => {
      expect(result.current.cashFlowData.length).toBe(1);
    });
  });

  it("should calculate total income and expenses", async () => {
    const mockCashFlow = [
      { id: "1", date: new Date().toISOString(), type: "income", amount: 1000 },
      { id: "2", date: new Date().toISOString(), type: "expense", amount: 500 },
    ];

    vi.mocked(cashFlowService.getCashFlowByCompanyId).mockReturnValue(mockCashFlow as never);

    const { result } = renderHook(() => useDashboardData(companyId));

    await waitFor(() => {
      expect(result.current.totalIncome).toBe(1000);
      expect(result.current.totalExpenses).toBe(500);
      expect(result.current.netCashFlow).toBe(500);
    });
  });

  it("should load sales metrics", async () => {
    const { result } = renderHook(() => useDashboardData(companyId));

    await waitFor(() => {
      expect(salesAnalyticsService.getSalesMetrics).toHaveBeenCalled();
    });

    expect(result.current.salesMetrics).toBeDefined();
  });

  it("should handle error in initial data fetch", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(propertiesService.getProperties).mockRejectedValue(new Error("Test error"));

    renderHook(() => useDashboardData(companyId));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to load dashboard data:",
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it("should calculate animalUnits when totalWeight is 0", async () => {
    vi.mocked(weighingsService.getWeighingsByCompanyId).mockReturnValue([] as never);
    const { result } = renderHook(() => useDashboardData(companyId));

    await waitFor(() => {
      expect(result.current.animalUnits).toBe(0);
    });
  });

  it("should calculate totalAreaInHectares for specific property", async () => {
    const filters = { propertyId: "1" };
    const { result } = renderHook(() => useDashboardData(companyId, filters));

    await waitFor(() => {
      expect(result.current.totalAreaInHectares).toBe(100);
    });
  });

  it("should return 0 for totalAreaInHectares when property not found", async () => {
    const filters = { propertyId: "non-existent" };
    const { result } = renderHook(() => useDashboardData(companyId, filters));

    await waitFor(() => {
      expect(result.current.totalAreaInHectares).toBe(0);
    });
  });

  it("should calculate stockingRate as 0 when area is 0", async () => {
    vi.mocked(propertiesService.getProperties).mockResolvedValue([] as never);
    const { result } = renderHook(() => useDashboardData(companyId));

    await waitFor(() => {
      expect(result.current.stockingRate).toBe(0);
    });
  });

  it("should calculate stockingRate as 0 when animalUnits is 0", async () => {
    vi.mocked(weighingsService.getWeighingsByCompanyId).mockReturnValue([] as never);
    const { result } = renderHook(() => useDashboardData(companyId));

    await waitFor(() => {
      expect(result.current.stockingRate).toBe(0);
    });
  });

  it("should filter weighings by propertyId", async () => {
    const filters = { propertyId: "property-1" };
    const mockPropertyAnimals = [{ id: "animal-1", companyId: "company-1", status: "active" }];
    vi.mocked(animalsService.getAnimalsByPropertyId).mockReturnValue(mockPropertyAnimals as never);
    const mockWeighings = [
      { id: "1", animalId: "animal-1", weight: 500, date: "2024-01-01" },
      { id: "2", animalId: "animal-2", weight: 600, date: "2024-01-01" },
    ];
    vi.mocked(weighingsService.getWeighingsByCompanyId).mockReturnValue(mockWeighings as never);

    const { result } = renderHook(() => useDashboardData(companyId, filters));

    await waitFor(() => {
      expect(result.current.allWeighings.length).toBe(1);
      expect(result.current.allWeighings[0].animalId).toBe("animal-1");
    });
  });

  it("should filter weighings by date range", async () => {
    const filters = { startDate: "2024-01-01", endDate: "2024-06-30" };
    const mockWeighings = [
      { id: "1", animalId: "1", weight: 500, date: "2024-03-01" },
      { id: "2", animalId: "1", weight: 600, date: "2024-07-01" },
    ];
    vi.mocked(weighingsService.getWeighingsByCompanyId).mockReturnValue(mockWeighings as never);

    const { result } = renderHook(() => useDashboardData(companyId, filters));

    await waitFor(() => {
      expect(result.current.allWeighings.length).toBe(1);
    });
  });

  it("should filter births by date range", async () => {
    const filters = { startDate: "2024-01-01", endDate: "2024-06-30" };
    const mockBirths = [
      { id: "1", companyId: "company-1", birthDate: "2024-03-01", animalId: "1" },
      { id: "2", companyId: "company-1", birthDate: "2024-07-01", animalId: "2" },
    ];
    vi.mocked(birthsService.getBirthsByCompanyId).mockReturnValue(mockBirths as never);

    const { result } = renderHook(() => useDashboardData(companyId, filters));

    await waitFor(() => {
      expect(result.current.births.length).toBe(1);
    });
  });

  it("should filter breedings by date range", async () => {
    const filters = { startDate: "2024-01-01", endDate: "2024-06-30" };
    const mockBreedings = [
      { id: "1", companyId: "company-1", date: "2024-03-01", animalId: "1" },
      { id: "2", companyId: "company-1", date: "2024-07-01", animalId: "2" },
    ];
    vi.mocked(breedingsService.getBreedingsByCompanyId).mockReturnValue(mockBreedings as never);

    const { result } = renderHook(() => useDashboardData(companyId, filters));

    await waitFor(() => {
      expect(result.current.breedings.length).toBe(1);
    });
  });

  it("should filter sales by propertyId", async () => {
    const filters = { propertyId: "property-1" };
    const mockSales = [
      { id: "1", companyId: "company-1", propertyId: "property-1", saleDate: "2024-01-01" },
      { id: "2", companyId: "company-1", propertyId: "property-2", saleDate: "2024-01-01" },
    ];
    vi.mocked(salesService.getSalesByCompanyId).mockReturnValue(mockSales as never);

    const { result } = renderHook(() => useDashboardData(companyId, filters));

    await waitFor(() => {
      expect(result.current.sales.length).toBe(1);
      expect(result.current.sales[0].propertyId).toBe("property-1");
    });
  });

  it("should filter sales by date range", async () => {
    const filters = { startDate: "2024-01-01", endDate: "2024-06-30" };
    const mockSales = [
      { id: "1", companyId: "company-1", saleDate: "2024-03-01" },
      { id: "2", companyId: "company-1", saleDate: "2024-07-01" },
    ];
    vi.mocked(salesService.getSalesByCompanyId).mockReturnValue(mockSales as never);

    const { result } = renderHook(() => useDashboardData(companyId, filters));

    await waitFor(() => {
      expect(result.current.sales.length).toBe(1);
    });
  });

  it("should calculate totalAccountsPayable with paidAmount", async () => {
    const mockAccountsPayable = [
      {
        id: "1",
        companyId: "company-1",
        amount: 1000,
        paidAmount: 300,
        status: AccountsPayableStatus.UNPAID,
        dueDate: "2024-01-01",
        description: "Test",
        propertyId: "property-1",
        createdAt: "2024-01-01",
      },
    ];
    // Reset and override the mock from beforeEach before rendering hook
    vi.mocked(accountsPayableService.getAccountsPayableByCompanyId).mockReset();
    vi.mocked(accountsPayableService.getAccountsPayableByCompanyId).mockReturnValue(
      mockAccountsPayable as never
    );

    const { result } = renderHook(() => useDashboardData(companyId));

    await waitFor(
      () => {
        expect(result.current.totalAccountsPayable).toBe(700);
      },
      { timeout: 3000 }
    );
  });

  it("should calculate totalAccountsReceivable with paidAmount", async () => {
    const mockAccountsReceivable = [
      {
        id: "1",
        companyId: "company-1",
        amount: 2000,
        paidAmount: 500,
        status: AccountsReceivableStatus.UNPAID,
        dueDate: "2024-01-01",
        description: "Test",
        propertyId: "property-1",
        createdAt: "2024-01-01",
      },
    ];
    // Reset and override the mock from beforeEach before rendering hook
    vi.mocked(accountsReceivableService.getAccountsReceivableByCompanyId).mockReset();
    vi.mocked(accountsReceivableService.getAccountsReceivableByCompanyId).mockReturnValue(
      mockAccountsReceivable as never
    );

    const { result } = renderHook(() => useDashboardData(companyId));

    await waitFor(
      () => {
        expect(result.current.totalAccountsReceivable).toBe(1500);
      },
      { timeout: 3000 }
    );
  });

  it("should handle error in sales metrics loading", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(salesAnalyticsService.getSalesMetrics).mockRejectedValue(new Error("Test error"));

    const { result } = renderHook(() => useDashboardData(companyId));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to load sales metrics:",
        expect.any(Error)
      );
      expect(result.current.salesMetrics).toBeNull();
    });

    consoleErrorSpy.mockRestore();
  });

  it("should calculate recentSales sorted by date", async () => {
    const mockSales = [
      { id: "1", companyId: "company-1", saleDate: "2024-01-01" },
      { id: "2", companyId: "company-1", saleDate: "2024-03-01" },
      { id: "3", companyId: "company-1", saleDate: "2024-02-01" },
    ];
    vi.mocked(salesService.getSalesByCompanyId).mockReturnValue(mockSales as never);

    const { result } = renderHook(() => useDashboardData(companyId));

    await waitFor(() => {
      expect(result.current.recentSales.length).toBe(3);
      expect(result.current.recentSales[0].id).toBe("2"); // Most recent first
    });
  });

  it("should limit recentSales to 10 items", async () => {
    const mockSales = Array.from({ length: 15 }, (_, i) => ({
      id: `sale-${i}`,
      companyId: "company-1",
      saleDate: `2024-${String(i + 1).padStart(2, "0")}-01`,
    }));
    vi.mocked(salesService.getSalesByCompanyId).mockReturnValue(mockSales as never);

    const { result } = renderHook(() => useDashboardData(companyId));

    await waitFor(() => {
      expect(result.current.recentSales.length).toBe(10);
    });
  });

  it("should calculate recentBirths sorted by date", async () => {
    const mockBirths = [
      { id: "1", companyId: "company-1", birthDate: "2024-01-01", animalId: "1" },
      { id: "2", companyId: "company-1", birthDate: "2024-03-01", animalId: "2" },
    ];
    vi.mocked(birthsService.getBirthsByCompanyId).mockReturnValue(mockBirths as never);

    const { result } = renderHook(() => useDashboardData(companyId));

    await waitFor(() => {
      expect(result.current.recentBirths.length).toBe(2);
      expect(result.current.recentBirths[0].id).toBe("2");
    });
  });

  it("should calculate recentBreedings sorted by date", async () => {
    const mockBreedings = [
      { id: "1", companyId: "company-1", date: "2024-01-01", animalId: "1" },
      { id: "2", companyId: "company-1", date: "2024-03-01", animalId: "2" },
    ];
    vi.mocked(breedingsService.getBreedingsByCompanyId).mockReturnValue(mockBreedings as never);

    const { result } = renderHook(() => useDashboardData(companyId));

    await waitFor(() => {
      expect(result.current.recentBreedings.length).toBe(2);
      expect(result.current.recentBreedings[0].id).toBe("2");
    });
  });
});
