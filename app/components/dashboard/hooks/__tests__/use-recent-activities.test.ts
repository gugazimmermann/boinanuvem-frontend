import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useRecentActivities } from "../use-recent-activities";
import type { useTranslation } from "~/i18n";
import type { Animal, Birth, Weighing, Breeding, CashFlow, Sale } from "~/types";
import { CashFlowCategory, PaymentMethod, SaleType, PricingMode, SalePaymentMethod } from "~/types";

const mockTranslation = {
  dashboard: {
    recentActivities: {
      newAnimalRegistered: "New animal registered",
      newBirthRegistered: "New birth registered",
      newWeighingRegistered: "New weighing registered",
      newBreedingRegistered: "New breeding registered",
      newTransactionRegistered: "New transaction registered",
      newSaleRegistered: "New sale registered",
    },
  },
} as ReturnType<typeof useTranslation>;

describe("useRecentActivities", () => {
  const mockAnimals: Animal[] = [
    {
      id: "animal-1",
      code: "A001",
      registrationNumber: "BR-2025-A001",
      status: "active",
      createdAt: "2025-01-15",
      companyId: "company-1",
      propertyId: "property-1",
    },
    {
      id: "animal-2",
      code: "A002",
      registrationNumber: "BR-2025-A002",
      status: "active",
      createdAt: "2025-01-20",
      companyId: "company-1",
      propertyId: "property-1",
    },
  ];

  const mockBirths: Birth[] = [
    {
      id: "birth-1",
      animalId: "animal-1",
      birthDate: "2025-01-10",
      createdAt: "2025-01-10",
      companyId: "company-1",
    },
  ];

  const mockWeighings: Weighing[] = [
    {
      id: "weighing-1",
      animalId: "animal-1",
      date: "2025-01-12",
      weight: 300,
      employeeIds: [],
      serviceProviderIds: [],
      createdAt: "2025-01-12",
      companyId: "company-1",
    },
  ];

  const mockBreedings: Breeding[] = [
    {
      id: "breeding-1",
      animalId: "animal-1",
      date: "2025-01-14",
      method: "natural",
      employeeIds: [],
      serviceProviderIds: [],
      createdAt: "2025-01-14",
      companyId: "company-1",
    },
  ];

  const mockCashFlow: CashFlow[] = [
    {
      id: "cf-1",
      date: "2025-01-16",
      type: "income",
      amount: 1000,
      description: "Income",
      category: CashFlowCategory.CATTLE_SALES,
      paymentMethod: PaymentMethod.CASH,
      status: "completed",
      propertyId: "property-1",
      createdAt: "2025-01-16",
      companyId: "company-1",
    },
    {
      id: "cf-2",
      date: "2025-01-18",
      type: "expense",
      amount: 500,
      description: "Expense",
      category: CashFlowCategory.FEED,
      paymentMethod: PaymentMethod.CASH,
      status: "completed",
      propertyId: "property-1",
      createdAt: "2025-01-18",
      companyId: "company-1",
    },
  ];

  const mockSales: Sale[] = [
    {
      id: "sale-1",
      saleDate: "2025-01-19",
      companyId: "company-1",
      propertyId: "property-1",
      buyerId: "buyer-1",
      saleType: SaleType.SLAUGHTERHOUSE,
      pricingMode: PricingMode.INDIVIDUAL,
      paymentMethod: SalePaymentMethod.CASH_FLOW,
      totalPrice: 10000,
      saleItems: [],
      createdAt: "2025-01-19",
    },
  ];

  const defaultOptions = {
    animals: mockAnimals,
    births: mockBirths,
    weighings: mockWeighings,
    breedings: mockBreedings,
    cashFlowData: mockCashFlow,
    sales: mockSales,
    t: mockTranslation,
  };

  it("should return recent activities", () => {
    const { result } = renderHook(() => useRecentActivities(defaultOptions));
    expect(result.current).toBeDefined();
    expect(Array.isArray(result.current)).toBe(true);
  });

  it("should include animal activities", () => {
    const { result } = renderHook(() => useRecentActivities(defaultOptions));
    const animalActivities = result.current.filter((a) => a.type === "animal");
    expect(animalActivities.length).toBe(2);
    expect(animalActivities[0].icon).toBe("🐄");
    expect(animalActivities[0].color).toBe("blue");
  });

  it("should include birth activities", () => {
    const { result } = renderHook(() => useRecentActivities(defaultOptions));
    const birthActivities = result.current.filter((a) => a.type === "birth");
    expect(birthActivities.length).toBe(1);
    expect(birthActivities[0].icon).toBe("👶");
    expect(birthActivities[0].color).toBe("purple");
  });

  it("should include weighing activities", () => {
    const { result } = renderHook(() => useRecentActivities(defaultOptions));
    const weighingActivities = result.current.filter((a) => a.type === "weighing");
    expect(weighingActivities.length).toBe(1);
    expect(weighingActivities[0].icon).toBe("⚖️");
    expect(weighingActivities[0].color).toBe("teal");
  });

  it("should include breeding activities", () => {
    const { result } = renderHook(() => useRecentActivities(defaultOptions));
    const breedingActivities = result.current.filter((a) => a.type === "breeding");
    expect(breedingActivities.length).toBe(1);
    expect(breedingActivities[0].icon).toBe("💑");
    expect(breedingActivities[0].color).toBe("pink");
  });

  it("should include transaction activities", () => {
    const { result } = renderHook(() => useRecentActivities(defaultOptions));
    const transactionActivities = result.current.filter((a) => a.type === "transaction");
    expect(transactionActivities.length).toBe(2);
    const incomeActivity = transactionActivities.find((a) => a.icon === "💰");
    const expenseActivity = transactionActivities.find((a) => a.icon === "💸");
    expect(incomeActivity).toBeDefined();
    expect(expenseActivity).toBeDefined();
    expect(incomeActivity?.color).toBe("green");
    expect(expenseActivity?.color).toBe("red");
  });

  it("should include sale activities", () => {
    const { result } = renderHook(() => useRecentActivities(defaultOptions));
    const saleActivities = result.current.filter((a) => a.type === "sale");
    expect(saleActivities.length).toBe(1);
    expect(saleActivities[0].icon).toBe("💵");
    expect(saleActivities[0].color).toBe("green");
  });

  it("should sort activities by date descending", () => {
    const { result } = renderHook(() => useRecentActivities(defaultOptions));
    const dates = result.current.map((a) => new Date(a.date).getTime());
    for (let i = 0; i < dates.length - 1; i++) {
      expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1]);
    }
  });

  it("should limit activities to default limit", () => {
    const { result } = renderHook(() => useRecentActivities(defaultOptions));
    expect(result.current.length).toBeLessThanOrEqual(10);
  });

  it("should respect custom limit", () => {
    const { result } = renderHook(() => useRecentActivities({ ...defaultOptions, limit: 5 }));
    expect(result.current.length).toBeLessThanOrEqual(5);
  });

  it("should handle empty arrays", () => {
    const { result } = renderHook(() =>
      useRecentActivities({
        animals: [],
        births: [],
        weighings: [],
        breedings: [],
        cashFlowData: [],
        sales: [],
        t: mockTranslation,
      })
    );
    expect(result.current).toBeDefined();
    expect(result.current.length).toBe(0);
  });
});
