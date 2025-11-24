import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDashboardData } from "../use-dashboard-data";
import { getAnimalsByCompanyId, getAnimalsByPropertyId } from "~/services/animals.service";
import { getWeighingsByCompanyId } from "~/services/weighings.service";
import { getCashFlowByCompanyId } from "~/services/cash-flow.service";

vi.mock("~/services/animals.service", () => ({
  getAnimalsByCompanyId: vi.fn(() => [
    {
      id: "animal-1",
      status: "active",
      companyId: "company-1",
      propertyId: "property-1",
    },
  ]),
  getAnimalsByPropertyId: vi.fn(() => [
    {
      id: "animal-1",
      status: "active",
      companyId: "company-1",
      propertyId: "property-1",
    },
  ]),
}));

vi.mock("~/services/weighings.service", () => ({
  getWeighingsByCompanyId: vi.fn(() => [
    {
      id: "weighing-1",
      animalId: "animal-1",
      companyId: "company-1",
      weight: 500,
      date: "2024-01-01",
    },
  ]),
  getWeighingsByAnimalId: vi.fn(() => []),
}));

vi.mock("~/services/cash-flow.service", () => ({
  getCashFlowByCompanyId: vi.fn(() => []),
}));

vi.mock("~/services/sales.service", () => ({
  getSalesByCompanyId: vi.fn(() => []),
}));

vi.mock("~/services/births.service", () => ({
  getBirthsByCompanyId: vi.fn(() => []),
  getBirthsByPropertyId: vi.fn(() => []),
}));

vi.mock("~/services/breedings.service", () => ({
  getBreedingsByCompanyId: vi.fn(() => []),
  getBreedingsByPropertyId: vi.fn(() => []),
}));

vi.mock("~/services/reproductive-indexes.service", () => ({
  getExpectedBirthsForecast: vi.fn(() => ({
    monthly: [],
    total: 0,
  })),
}));

vi.mock("~/mocks/properties", () => ({
  mockProperties: [
    {
      id: "property-1",
      area: { value: 100, type: "hectares" },
    },
  ],
}));

vi.mock("~/mocks/locations", () => ({
  mockLocations: [{ id: "loc-1" }],
}));

vi.mock("~/services/accounts-payable.service", () => ({
  getAccountsPayableByCompanyId: vi.fn(() => []),
}));

vi.mock("~/services/accounts-receivable.service", () => ({
  getAccountsReceivableByCompanyId: vi.fn(() => []),
}));

vi.mock("~/services/employees.service", () => ({
  getEmployeesByCompanyId: vi.fn(() => []),
}));

vi.mock("~/services/suppliers.service", () => ({
  getSuppliersByCompanyId: vi.fn(() => []),
}));

vi.mock("~/services/buyers.service", () => ({
  getBuyersByCompanyId: vi.fn(() => []),
}));

vi.mock("~/services/sales-analytics.service", () => ({
  getSalesMetrics: vi.fn(() => ({
    totalRevenue: 0,
    averagePricePerKg: 0,
    totalAnimalsSold: 0,
  })),
}));

describe("useDashboardData", () => {
  const companyId = "company-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return dashboard data for company", () => {
    const { result } = renderHook(() => useDashboardData(companyId));

    expect(result.current).toHaveProperty("animals");
    expect(result.current).toHaveProperty("totalAnimals");
    expect(result.current).toHaveProperty("totalProperties");
    expect(result.current).toHaveProperty("totalLocations");
    expect(result.current).toHaveProperty("totalWeight");
  });

  it("should use batch weighing query for totalWeight calculation", () => {
    renderHook(() => useDashboardData(companyId));

    expect(getWeighingsByCompanyId).toHaveBeenCalledWith(companyId);
  });

  it("should filter animals by property when propertyId filter is provided", () => {
    const filters = { propertyId: "property-1" };
    renderHook(() => useDashboardData(companyId, filters));

    expect(getAnimalsByPropertyId).toHaveBeenCalledWith("property-1");
    expect(getAnimalsByCompanyId).not.toHaveBeenCalled();
  });

  it("should use company animals when no property filter is provided", () => {
    renderHook(() => useDashboardData(companyId));

    expect(getAnimalsByCompanyId).toHaveBeenCalledWith(companyId);
  });

  it("should filter weighings by property when propertyId filter is provided", () => {
    const filters = { propertyId: "property-1" };
    renderHook(() => useDashboardData(companyId, filters));

    expect(getWeighingsByCompanyId).toHaveBeenCalledWith(companyId);
  });

  it("should filter cash flow by date range when filters are provided", () => {
    const filters = {
      startDate: "2024-01-01",
      endDate: "2024-12-31",
    };
    renderHook(() => useDashboardData(companyId, filters));

    expect(getCashFlowByCompanyId).toHaveBeenCalledWith(companyId);
  });

  it("should calculate total weight correctly", () => {
    const { result } = renderHook(() => useDashboardData(companyId));

    expect(typeof result.current.totalWeight).toBe("number");
    expect(result.current.totalWeight).toBeGreaterThanOrEqual(0);
  });

  it("should calculate animal units correctly", () => {
    const { result } = renderHook(() => useDashboardData(companyId));

    expect(typeof result.current.animalUnits).toBe("number");
    expect(result.current.animalUnits).toBeGreaterThanOrEqual(0);
  });

  it("should return all required dashboard metrics", () => {
    const { result } = renderHook(() => useDashboardData(companyId));

    expect(result.current).toHaveProperty("totalIncome");
    expect(result.current).toHaveProperty("totalExpenses");
    expect(result.current).toHaveProperty("netCashFlow");
    expect(result.current).toHaveProperty("totalAccountsPayable");
    expect(result.current).toHaveProperty("totalAccountsReceivable");
    expect(result.current).toHaveProperty("salesMetrics");
    expect(result.current).toHaveProperty("allWeighings");
    expect(result.current).toHaveProperty("cashFlowData");
  });
});
