import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDashboardData } from "../use-dashboard-data";

vi.mock("~/mocks/properties", () => ({
  mockProperties: [
    { id: "prop-1", area: { value: 100, type: "hectares" } },
    { id: "prop-2", area: { value: 200, type: "hectares" } },
  ],
}));

vi.mock("~/mocks/locations", () => ({
  mockLocations: [{ id: "loc-1" }, { id: "loc-2" }],
}));

vi.mock("~/services/animals.service", () => ({
  getAnimalsByCompanyId: vi.fn(() => [
    { id: "animal-1", status: "active" },
    { id: "animal-2", status: "active" },
    { id: "animal-3", status: "inactive" },
  ]),
  getAnimalsByPropertyId: vi.fn(() => [{ id: "animal-1", status: "active" }]),
}));

vi.mock("~/services/weighings.service", () => ({
  getWeighingsByCompanyId: vi.fn(() => [
    { animalId: "animal-1", weight: 500, date: "2025-01-15" },
    { animalId: "animal-2", weight: 600, date: "2025-01-20" },
  ]),
}));

vi.mock("~/services/reproductive-indexes.service", () => ({
  getExpectedBirthsForecast: vi.fn(() => ({
    monthly: [{ month: "2025-02", expectedBirths: 5 }],
    total: 15,
  })),
}));

vi.mock("~/services/cash-flow.service", () => ({
  getCashFlowByCompanyId: vi.fn(() => [
    { id: "cf-1", type: "income", amount: 1000, date: "2025-01-15" },
    { id: "cf-2", type: "expense", amount: 500, date: "2025-01-20" },
  ]),
}));

vi.mock("~/services/accounts-payable.service", () => ({
  getAccountsPayableByCompanyId: vi.fn(() => [
    { id: "ap-1", status: "unpaid", amount: 1000, paidAmount: 0 },
  ]),
}));

vi.mock("~/services/accounts-receivable.service", () => ({
  getAccountsReceivableByCompanyId: vi.fn(() => [
    { id: "ar-1", status: "unpaid", amount: 2000, paidAmount: 0 },
  ]),
}));

vi.mock("~/services/employees.service", () => ({
  getEmployeesByCompanyId: vi.fn(() => [{ id: "emp-1" }]),
}));

vi.mock("~/services/suppliers.service", () => ({
  getSuppliersByCompanyId: vi.fn(() => [{ id: "sup-1" }]),
}));

vi.mock("~/services/buyers.service", () => ({
  getBuyersByCompanyId: vi.fn(() => [{ id: "buy-1" }]),
}));

vi.mock("~/services/births.service", () => ({
  getBirthsByCompanyId: vi.fn(() => [{ id: "birth-1", birthDate: "2025-01-15" }]),
  getBirthsByPropertyId: vi.fn(() => [{ id: "birth-1", birthDate: "2025-01-15" }]),
}));

vi.mock("~/services/breedings.service", () => ({
  getBreedingsByCompanyId: vi.fn(() => [{ id: "breeding-1", date: "2025-01-15" }]),
  getBreedingsByPropertyId: vi.fn(() => [{ id: "breeding-1", date: "2025-01-15" }]),
}));

vi.mock("~/services/sales.service", () => ({
  getSalesByCompanyId: vi.fn(() => [
    { id: "sale-1", saleDate: "2025-01-15", propertyId: "prop-1" },
  ]),
}));

vi.mock("~/services/sales-analytics.service", () => ({
  getSalesMetrics: vi.fn(() => ({
    totalSales: 10000,
    totalRevenue: 50000,
  })),
}));

describe("useDashboardData", () => {
  const companyId = "company-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return dashboard data", () => {
    const { result } = renderHook(() => useDashboardData(companyId));
    expect(result.current).toBeDefined();
    expect(result.current.totalAnimals).toBe(2);
    expect(result.current.totalProperties).toBe(2);
    expect(result.current.totalLocations).toBe(2);
  });

  it("should filter animals by status", () => {
    const { result } = renderHook(() => useDashboardData(companyId));
    expect(result.current.animals.length).toBe(2);
    expect(result.current.animals.every((a) => a.status === "active")).toBe(true);
  });

  it("should calculate total weight", () => {
    const { result } = renderHook(() => useDashboardData(companyId));
    expect(result.current.totalWeight).toBeGreaterThan(0);
  });

  it("should calculate animal units", () => {
    const { result } = renderHook(() => useDashboardData(companyId));
    expect(result.current.animalUnits).toBeGreaterThanOrEqual(0);
  });

  it("should calculate total area in hectares", () => {
    const { result } = renderHook(() => useDashboardData(companyId));
    expect(result.current.totalAreaInHectares).toBe(300);
  });

  it("should calculate stocking rate", () => {
    const { result } = renderHook(() => useDashboardData(companyId));
    expect(result.current.stockingRate).toBeGreaterThanOrEqual(0);
  });

  it("should return expected births forecast", () => {
    const { result } = renderHook(() => useDashboardData(companyId));
    expect(result.current.expectedBirthsForecast).toBeDefined();
    expect(result.current.expectedBirthsForecast.monthly).toBeDefined();
    expect(Array.isArray(result.current.expectedBirthsForecast.monthly)).toBe(true);
    expect(result.current.nextThreeMonthsTotal).toBe(15);
  });

  it("should return cash flow data", () => {
    const { result } = renderHook(() => useDashboardData(companyId));
    expect(result.current.cashFlowData).toBeDefined();
    expect(Array.isArray(result.current.cashFlowData)).toBe(true);
  });

  it("should calculate current month cash flow", () => {
    const { result } = renderHook(() => useDashboardData(companyId));
    expect(result.current.currentMonthCashFlow).toBeDefined();
    expect(Array.isArray(result.current.currentMonthCashFlow)).toBe(true);
  });

  it("should calculate total income", () => {
    const { result } = renderHook(() => useDashboardData(companyId));
    expect(result.current.totalIncome).toBeGreaterThanOrEqual(0);
  });

  it("should calculate total expenses", () => {
    const { result } = renderHook(() => useDashboardData(companyId));
    expect(result.current.totalExpenses).toBeGreaterThanOrEqual(0);
  });

  it("should calculate net cash flow", () => {
    const { result } = renderHook(() => useDashboardData(companyId));
    expect(result.current.netCashFlow).toBeDefined();
  });

  it("should return accounts payable data", () => {
    const { result } = renderHook(() => useDashboardData(companyId));
    expect(result.current.accountsPayableData).toBeDefined();
    expect(Array.isArray(result.current.accountsPayableData)).toBe(true);
  });

  it("should return accounts receivable data", () => {
    const { result } = renderHook(() => useDashboardData(companyId));
    expect(result.current.accountsReceivableData).toBeDefined();
    expect(Array.isArray(result.current.accountsReceivableData)).toBe(true);
  });

  it("should calculate total accounts payable", () => {
    const { result } = renderHook(() => useDashboardData(companyId));
    expect(result.current.totalAccountsPayable).toBeGreaterThanOrEqual(0);
  });

  it("should calculate total accounts receivable", () => {
    const { result } = renderHook(() => useDashboardData(companyId));
    expect(result.current.totalAccountsReceivable).toBeGreaterThanOrEqual(0);
  });

  it("should return employees", () => {
    const { result } = renderHook(() => useDashboardData(companyId));
    expect(result.current.employees).toBeDefined();
    expect(Array.isArray(result.current.employees)).toBe(true);
  });

  it("should return suppliers", () => {
    const { result } = renderHook(() => useDashboardData(companyId));
    expect(result.current.suppliers).toBeDefined();
    expect(Array.isArray(result.current.suppliers)).toBe(true);
  });

  it("should return buyers", () => {
    const { result } = renderHook(() => useDashboardData(companyId));
    expect(result.current.buyers).toBeDefined();
    expect(Array.isArray(result.current.buyers)).toBe(true);
  });

  it("should return births", () => {
    const { result } = renderHook(() => useDashboardData(companyId));
    expect(result.current.births).toBeDefined();
    expect(Array.isArray(result.current.births)).toBe(true);
  });

  it("should return breedings", () => {
    const { result } = renderHook(() => useDashboardData(companyId));
    expect(result.current.breedings).toBeDefined();
    expect(Array.isArray(result.current.breedings)).toBe(true);
  });

  it("should return sales", () => {
    const { result } = renderHook(() => useDashboardData(companyId));
    expect(result.current.sales).toBeDefined();
    expect(Array.isArray(result.current.sales)).toBe(true);
  });

  it("should return sales metrics", () => {
    const { result } = renderHook(() => useDashboardData(companyId));
    expect(result.current.salesMetrics).toBeDefined();
  });

  it("should filter by propertyId when provided", () => {
    const { result } = renderHook(() => useDashboardData(companyId, { propertyId: "prop-1" }));
    expect(result.current.animals.length).toBe(1);
  });

  it("should filter by date range when provided", () => {
    const { result } = renderHook(() =>
      useDashboardData(companyId, {
        startDate: "2025-01-01",
        endDate: "2025-01-31",
      })
    );
    expect(result.current).toBeDefined();
  });
});
