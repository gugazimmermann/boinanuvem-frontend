import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useSaleFormData } from "../use-sale-form-data";
import { getAnimalsByCompanyId } from "~/services/animals.service";
import { getBuyers } from "~/services/buyers.service";
import { getProperties } from "~/services/properties.service";
import { MemoryRouter } from "react-router";

vi.mock("~/services/animals.service", () => ({
  getAnimalsByCompanyId: vi.fn(),
}));

vi.mock("~/services/buyers.service", () => ({
  getBuyers: vi.fn(),
}));

vi.mock("~/services/properties.service", () => ({
  getProperties: vi.fn(),
}));

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useLocation: vi.fn(),
  };
});

import { useLocation } from "react-router";

describe("useSaleFormData", () => {
  const mockUseLocation = vi.mocked(useLocation);
  const mockAnimals = [
    {
      id: "animal-1",
      code: "A001",
      registrationNumber: "REG001",
      companyId: "company-1",
      propertyId: "property-1",
      status: "active" as const,
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "animal-2",
      code: "A002",
      registrationNumber: "REG002",
      companyId: "company-1",
      propertyId: "property-1",
      status: "sold" as const,
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "animal-3",
      code: "A003",
      registrationNumber: "REG003",
      companyId: "company-1",
      propertyId: "property-1",
      status: "active" as const,
      createdAt: "2024-01-01T00:00:00Z",
    },
  ];

  const mockBuyers = [
    {
      id: "buyer-1",
      name: "Buyer 1",
      companyId: "company-1",
      createdAt: "2024-01-01T00:00:00Z",
    },
  ];

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
    mockUseLocation.mockReturnValue({
      pathname: "/dashboard/records/sales/new",
      search: "",
      hash: "",
      state: null,
      key: "default",
    });
    vi.mocked(getAnimalsByCompanyId).mockResolvedValue(mockAnimals);
    vi.mocked(getBuyers).mockResolvedValue(mockBuyers);
    vi.mocked(getProperties).mockResolvedValue(mockProperties);
  });

  it("should load animals asynchronously", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter>{children}</MemoryRouter>
    );
    const { result } = renderHook(() => useSaleFormData({ companyId: "company-1" }), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.animals).toEqual([]);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.animals.length).toBeGreaterThan(0);
    expect(getAnimalsByCompanyId).toHaveBeenCalledWith("company-1");
  });

  it("should filter out sold animals by default", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter>{children}</MemoryRouter>
    );
    const { result } = renderHook(
      () => useSaleFormData({ companyId: "company-1", includeSoldAnimals: false }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.animals.length).toBe(2);
    expect(result.current.animals.every((a) => a.status === "active")).toBe(true);
  });

  it("should include sold animals when includeSoldAnimals is true", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter>{children}</MemoryRouter>
    );
    const { result } = renderHook(
      () => useSaleFormData({ companyId: "company-1", includeSoldAnimals: true }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.animals.length).toBe(3);
    expect(result.current.animals.some((a) => a.status === "sold")).toBe(true);
  });

  it("should get pre-selected animal IDs from props", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter>{children}</MemoryRouter>
    );
    const { result } = renderHook(
      () =>
        useSaleFormData({
          companyId: "company-1",
          preSelectedAnimalIds: ["animal-1", "animal-2"],
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.preSelectedAnimalIds).toEqual(["animal-1", "animal-2"]);
  });

  it("should get pre-selected animal IDs from location state", async () => {
    mockUseLocation.mockReturnValue({
      pathname: "/dashboard/records/sales/new",
      search: "",
      hash: "",
      state: { animalIds: ["animal-1", "animal-3"] },
      key: "default",
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter>{children}</MemoryRouter>
    );
    const { result } = renderHook(() => useSaleFormData({ companyId: "company-1" }), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.preSelectedAnimalIds).toEqual(["animal-1", "animal-3"]);
  });

  it("should prioritize preSelectedAnimalIds from props over location state", async () => {
    mockUseLocation.mockReturnValue({
      pathname: "/dashboard/records/sales/new",
      search: "",
      hash: "",
      state: { animalIds: ["animal-1", "animal-3"] },
      key: "default",
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter>{children}</MemoryRouter>
    );
    const { result } = renderHook(
      () =>
        useSaleFormData({
          companyId: "company-1",
          preSelectedAnimalIds: ["animal-2"],
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.preSelectedAnimalIds).toEqual(["animal-2"]);
  });

  it("should return empty array when location state has no animalIds", async () => {
    mockUseLocation.mockReturnValue({
      pathname: "/dashboard/records/sales/new",
      search: "",
      hash: "",
      state: {},
      key: "default",
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter>{children}</MemoryRouter>
    );
    const { result } = renderHook(() => useSaleFormData({ companyId: "company-1" }), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.preSelectedAnimalIds).toEqual([]);
  });

  it("should load buyers and properties", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter>{children}</MemoryRouter>
    );
    const { result } = renderHook(() => useSaleFormData({ companyId: "company-1" }), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.buyers.length).toBeGreaterThan(0);
    expect(result.current.properties.length).toBeGreaterThan(0);
    expect(getBuyers).toHaveBeenCalled();
    expect(getProperties).toHaveBeenCalled();
  });

  it("should filter buyers and properties by companyId", async () => {
    const allBuyers = [
      ...mockBuyers,
      {
        id: "buyer-2",
        name: "Buyer 2",
        companyId: "company-2",
        createdAt: "2024-01-01T00:00:00Z",
      },
    ];
    const allProperties = [
      ...mockProperties,
      {
        id: "property-2",
        name: "Property 2",
        code: "PROP-2",
        companyId: "company-2",
        status: "active" as const,
        createdAt: "2024-01-01T00:00:00Z",
        area: { value: 200, type: "hectares" as const },
        street: "Main St",
        number: "456",
        complement: "",
        neighborhood: "Downtown",
        city: "City",
        state: "ST",
        zipCode: "12345-678",
      },
    ];
    vi.mocked(getBuyers).mockResolvedValue(allBuyers);
    vi.mocked(getProperties).mockResolvedValue(allProperties);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter>{children}</MemoryRouter>
    );
    const { result } = renderHook(() => useSaleFormData({ companyId: "company-1" }), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.buyers.length).toBe(1);
    expect(result.current.buyers[0].companyId).toBe("company-1");
    expect(result.current.properties.length).toBe(1);
    expect(result.current.properties[0].companyId).toBe("company-1");
  });

  it("should handle loading states correctly", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter>{children}</MemoryRouter>
    );
    const { result } = renderHook(() => useSaleFormData({ companyId: "company-1" }), { wrapper });

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // After loading, should have data
    expect(result.current.animals.length).toBeGreaterThan(0);
  });

  it("should handle errors gracefully", async () => {
    vi.mocked(getAnimalsByCompanyId).mockRejectedValue(new Error("Failed to load"));
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter>{children}</MemoryRouter>
    );
    const { result } = renderHook(() => useSaleFormData({ companyId: "company-1" }), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.animals).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to load animals:", expect.any(Error));

    consoleErrorSpy.mockRestore();
  });

  it("should return empty arrays when companyId is not provided", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter>{children}</MemoryRouter>
    );
    const { result } = renderHook(() => useSaleFormData(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.animals).toEqual([]);
    expect(getAnimalsByCompanyId).not.toHaveBeenCalled();
  });

  it("should update when companyId changes", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter>{children}</MemoryRouter>
    );
    const { result, rerender } = renderHook(
      ({ companyId }: { companyId?: string }) => useSaleFormData({ companyId }),
      {
        wrapper,
        initialProps: { companyId: "company-1" },
      }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(getAnimalsByCompanyId).toHaveBeenCalledWith("company-1");

    rerender({ companyId: "company-2" });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(getAnimalsByCompanyId).toHaveBeenCalledWith("company-2");
  });

  it("should update when includeSoldAnimals changes", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter>{children}</MemoryRouter>
    );
    const { result, rerender } = renderHook(
      ({ includeSoldAnimals }: { includeSoldAnimals?: boolean }) =>
        useSaleFormData({ companyId: "company-1", includeSoldAnimals }),
      {
        wrapper,
        initialProps: { includeSoldAnimals: false },
      }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.animals.length).toBe(2);

    rerender({ includeSoldAnimals: true });

    await waitFor(() => {
      expect(result.current.animals.length).toBe(3);
    });
  });
});
