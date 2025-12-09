import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useRecentActivities } from "../use-recent-activities";
import type { Animal, Birth, Breeding, Weighing, CashFlow, Sale } from "~/types";

describe("useRecentActivities", () => {
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
  } as ReturnType<typeof import("~/i18n").useTranslation>;

  const mockAnimals: Animal[] = [
    {
      id: "1",
      code: "A001",
      name: "Animal 1",
      createdAt: "2024-06-01T10:00:00Z",
      registrationNumber: "REG001",
      status: "active",
      companyId: "company-1",
      propertyId: "property-1",
    },
  ];

  const mockBirths: Birth[] = [
    {
      id: "1",
      birthDate: "2024-06-02T10:00:00Z",
    } as Birth,
  ];

  const mockWeighings: Weighing[] = [
    {
      id: "1",
      date: "2024-06-03T10:00:00Z",
    } as Weighing,
  ];

  const mockBreedings: Breeding[] = [
    {
      id: "1",
      date: "2024-06-04T10:00:00Z",
    } as Breeding,
  ];

  const mockCashFlow: CashFlow[] = [
    {
      id: "1",
      date: "2024-06-05T10:00:00Z",
      type: "income",
    } as CashFlow,
    {
      id: "2",
      date: "2024-06-06T10:00:00Z",
      type: "expense",
    } as CashFlow,
  ];

  const mockSales: Sale[] = [
    {
      id: "1",
      saleDate: "2024-06-07T10:00:00Z",
    } as Sale,
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return activities from all sources", () => {
    const { result } = renderHook(() =>
      useRecentActivities({
        animals: mockAnimals,
        births: mockBirths,
        weighings: mockWeighings,
        breedings: mockBreedings,
        cashFlowData: mockCashFlow,
        sales: mockSales,
        t: mockTranslation,
      })
    );

    expect(result.current.length).toBeGreaterThan(0);
    expect(result.current.some((a) => a.type === "animal")).toBe(true);
    expect(result.current.some((a) => a.type === "birth")).toBe(true);
    expect(result.current.some((a) => a.type === "weighing")).toBe(true);
    expect(result.current.some((a) => a.type === "breeding")).toBe(true);
    expect(result.current.some((a) => a.type === "transaction")).toBe(true);
    expect(result.current.some((a) => a.type === "sale")).toBe(true);
  });

  it("should sort activities by date descending", () => {
    const { result } = renderHook(() =>
      useRecentActivities({
        animals: mockAnimals,
        births: mockBirths,
        weighings: mockWeighings,
        breedings: mockBreedings,
        cashFlowData: mockCashFlow,
        sales: mockSales,
        t: mockTranslation,
      })
    );

    const dates = result.current.map((a) => new Date(a.date).getTime());
    for (let i = 0; i < dates.length - 1; i++) {
      expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1]);
    }
  });

  it("should limit results to default limit of 10", () => {
    const manyAnimals = Array.from({ length: 15 }, (_, i) => ({
      id: String(i),
      code: `A${i}`,
      name: `Animal ${i}`,
      createdAt: new Date(2024, 5, i + 1).toISOString(),
      registrationNumber: `REG${i}`,
      status: "active" as const,
      companyId: "company-1",
      propertyId: "property-1",
    }));

    const { result } = renderHook(() =>
      useRecentActivities({
        animals: manyAnimals,
        births: [],
        weighings: [],
        breedings: [],
        cashFlowData: [],
        sales: [],
        t: mockTranslation,
      })
    );

    expect(result.current.length).toBe(10);
  });

  it("should limit results to custom limit", () => {
    const manyAnimals = Array.from({ length: 15 }, (_, i) => ({
      id: String(i),
      code: `A${i}`,
      name: `Animal ${i}`,
      createdAt: new Date(2024, 5, i + 1).toISOString(),
      registrationNumber: `REG${i}`,
      status: "active" as const,
      companyId: "company-1",
      propertyId: "property-1",
    }));

    const { result } = renderHook(() =>
      useRecentActivities({
        animals: manyAnimals,
        births: [],
        weighings: [],
        breedings: [],
        cashFlowData: [],
        sales: [],
        t: mockTranslation,
        limit: 5,
      })
    );

    expect(result.current.length).toBe(5);
  });

  it("should create animal activities with correct properties", () => {
    const { result } = renderHook(() =>
      useRecentActivities({
        animals: mockAnimals,
        births: [],
        weighings: [],
        breedings: [],
        cashFlowData: [],
        sales: [],
        t: mockTranslation,
      })
    );

    const animalActivity = result.current.find((a) => a.type === "animal");
    expect(animalActivity).toBeDefined();
    expect(animalActivity?.icon).toBe("🐄");
    expect(animalActivity?.color).toBe("blue");
    expect(animalActivity?.title).toBe("New animal registered");
  });

  it("should create birth activities with correct properties", () => {
    const { result } = renderHook(() =>
      useRecentActivities({
        animals: [],
        births: mockBirths,
        weighings: [],
        breedings: [],
        cashFlowData: [],
        sales: [],
        t: mockTranslation,
      })
    );

    const birthActivity = result.current.find((a) => a.type === "birth");
    expect(birthActivity).toBeDefined();
    expect(birthActivity?.icon).toBe("👶");
    expect(birthActivity?.color).toBe("purple");
    expect(birthActivity?.title).toBe("New birth registered");
  });

  it("should create income transaction activities with correct icon and color", () => {
    const { result } = renderHook(() =>
      useRecentActivities({
        animals: [],
        births: [],
        weighings: [],
        breedings: [],
        cashFlowData: [{ id: "1", date: "2024-06-01", type: "income" } as CashFlow],
        sales: [],
        t: mockTranslation,
      })
    );

    const transactionActivity = result.current.find(
      (a) => a.type === "transaction" && a.color === "green"
    );
    expect(transactionActivity).toBeDefined();
    expect(transactionActivity?.icon).toBe("💰");
  });

  it("should create expense transaction activities with correct icon and color", () => {
    const { result } = renderHook(() =>
      useRecentActivities({
        animals: [],
        births: [],
        weighings: [],
        breedings: [],
        cashFlowData: [{ id: "1", date: "2024-06-01", type: "expense" } as CashFlow],
        sales: [],
        t: mockTranslation,
      })
    );

    const transactionActivity = result.current.find(
      (a) => a.type === "transaction" && a.color === "red"
    );
    expect(transactionActivity).toBeDefined();
    expect(transactionActivity?.icon).toBe("💸");
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

    expect(result.current).toEqual([]);
  });

  it("should use createdAt for animals when available", () => {
    const animalWithCreatedAt: Animal = {
      id: "1",
      code: "A001",
      name: "Animal 1",
      createdAt: "2024-06-01T10:00:00Z",
      registrationNumber: "REG001",
      status: "active",
      companyId: "company-1",
      propertyId: "property-1",
    };

    const { result } = renderHook(() =>
      useRecentActivities({
        animals: [animalWithCreatedAt],
        births: [],
        weighings: [],
        breedings: [],
        cashFlowData: [],
        sales: [],
        t: mockTranslation,
      })
    );

    const animalActivity = result.current.find((a) => a.type === "animal");
    expect(animalActivity?.date).toBe("2024-06-01T10:00:00Z");
  });
});
