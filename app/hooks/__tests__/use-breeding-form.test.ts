import { describe, it, expect, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useBreedingForm } from "../use-breeding-form";
import { getNextAttemptNumber } from "~/services/breedings.service";

vi.mock("~/services/breedings.service", () => ({
  getNextAttemptNumber: vi.fn((_animalId: string) => Promise.resolve(1)),
}));

describe("useBreedingForm", () => {
  const mockTranslation = {
    breedings: {
      new: {
        errors: {
          animalRequired: "Animal is required",
          dateRequired: "Date is required",
          methodRequired: "Method is required",
          bullRequired: "Bull is required",
          semenCodeRequired: "Semen code is required",
          attemptNumberRequired: "Attempt number is required",
          responsibleRequired: "Responsible is required",
        },
      },
    },
  } as unknown as import("~/i18n").TranslationKey;

  const mockCompanyId = "550e8400-e29b-41d4-a716-446655440000";

  it("should initialize with default form data", () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        companyId: mockCompanyId,
        t: mockTranslation,
      })
    );

    expect(result.current.formData.animalIds).toEqual([]);
    expect(result.current.formData.method).toBe("");
    expect(result.current.formData.bullId).toBe("");
    expect(result.current.formData.semenCode).toBe("");
    expect(result.current.formData.employeeIds).toEqual([]);
    expect(result.current.formData.serviceProviderIds).toEqual([]);
    expect(result.current.formData.confirmed).toBe(false);
  });

  it("should initialize with provided initialAnimalIds", () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        companyId: mockCompanyId,
        initialAnimalIds: ["A001", "A002"],
        t: mockTranslation,
      })
    );

    expect(result.current.formData.animalIds).toEqual(["A001", "A002"]);
  });

  it("should initialize with provided initialDate", () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        companyId: mockCompanyId,
        initialDate: "2024-01-15",
        t: mockTranslation,
      })
    );

    expect(result.current.formData.date).toBe("2024-01-15");
  });

  it("should update form data when handleChange is called", () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        companyId: mockCompanyId,
        t: mockTranslation,
      })
    );

    act(() => {
      result.current.handleChange("observation", "Test observation");
    });

    expect(result.current.formData.observation).toBe("Test observation");
  });

  it("should clear error when field is changed", () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        companyId: mockCompanyId,
        t: mockTranslation,
      })
    );

    act(() => {
      result.current.validate();
    });

    expect(result.current.errors.animalIds).toBeDefined();

    act(() => {
      result.current.handleChange("animalIds", ["A001"]);
    });

    expect(result.current.errors.animalIds).toBeUndefined();
  });

  it("should toggle animal selection", () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        companyId: mockCompanyId,
        t: mockTranslation,
      })
    );

    act(() => {
      result.current.toggleAnimalSelection("A001");
    });

    expect(result.current.formData.animalIds).toContain("A001");

    act(() => {
      result.current.toggleAnimalSelection("A001");
    });

    expect(result.current.formData.animalIds).not.toContain("A001");
  });

  it("should set attempt number when animal is selected for artificial insemination", async () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        companyId: mockCompanyId,
        t: mockTranslation,
      })
    );

    act(() => {
      result.current.handleMethodChange("artificial_insemination");
    });

    act(() => {
      result.current.toggleAnimalSelection("A001");
    });

    expect(getNextAttemptNumber).toHaveBeenCalledWith("A001");

    await waitFor(() => {
      expect(result.current.formData.attemptNumbers["A001"]).toBe(1);
    });
  });

  it("should clear attempt numbers when method changes from artificial_insemination", async () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        companyId: mockCompanyId,
        initialAnimalIds: ["A001"],
        t: mockTranslation,
      })
    );

    act(() => {
      result.current.handleMethodChange("artificial_insemination");
    });

    await waitFor(() => {
      expect(result.current.formData.attemptNumbers["A001"]).toBe(1);
    });

    act(() => {
      result.current.handleMethodChange("natural");
    });

    expect(result.current.formData.attemptNumbers).toEqual({});
  });

  it("should clear bullId when method changes from natural", () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        companyId: mockCompanyId,
        t: mockTranslation,
      })
    );

    act(() => {
      result.current.handleChange("method", "natural");
      result.current.handleChange("bullId", "B001");
    });

    expect(result.current.formData.bullId).toBe("B001");

    act(() => {
      result.current.handleMethodChange("artificial_insemination");
    });

    expect(result.current.formData.bullId).toBe("");
  });

  it("should clear semenCode when method changes from artificial_insemination", () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        companyId: mockCompanyId,
        t: mockTranslation,
      })
    );

    act(() => {
      result.current.handleChange("method", "artificial_insemination");
      result.current.handleChange("semenCode", "S001");
    });

    expect(result.current.formData.semenCode).toBe("S001");

    act(() => {
      result.current.handleMethodChange("natural");
    });

    expect(result.current.formData.semenCode).toBe("");
  });

  it("should toggle employee selection", () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        companyId: mockCompanyId,
        t: mockTranslation,
      })
    );

    act(() => {
      result.current.toggleSelection("employeeIds", "E001");
    });

    expect(result.current.formData.employeeIds).toContain("E001");

    act(() => {
      result.current.toggleSelection("employeeIds", "E001");
    });

    expect(result.current.formData.employeeIds).not.toContain("E001");
  });

  it("should toggle serviceProvider selection", () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        companyId: mockCompanyId,
        t: mockTranslation,
      })
    );

    act(() => {
      result.current.toggleSelection("serviceProviderIds", "SP001");
    });

    expect(result.current.formData.serviceProviderIds).toContain("SP001");

    act(() => {
      result.current.toggleSelection("serviceProviderIds", "SP001");
    });

    expect(result.current.formData.serviceProviderIds).not.toContain("SP001");
  });

  it("should update attempt number", async () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        companyId: mockCompanyId,
        initialAnimalIds: ["A001"],
        t: mockTranslation,
      })
    );

    act(() => {
      result.current.handleMethodChange("artificial_insemination");
    });

    await waitFor(() => {
      expect(result.current.formData.attemptNumbers["A001"]).toBeDefined();
    });

    act(() => {
      result.current.handleAttemptNumberChange("A001", "3");
    });

    expect(result.current.formData.attemptNumbers["A001"]).toBe(3);
  });

  it("should validate animalIds", () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        companyId: mockCompanyId,
        t: mockTranslation,
      })
    );

    act(() => {
      result.current.validate();
    });

    expect(result.current.errors.animalIds).toBeDefined();
  });

  it("should validate date", () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        companyId: mockCompanyId,
        initialAnimalIds: ["A001"],
        t: mockTranslation,
      })
    );

    act(() => {
      result.current.setFormData((prev) => ({ ...prev, date: "" }));
      result.current.validate();
    });

    expect(result.current.errors.date).toBeDefined();
  });

  it("should validate method", () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        companyId: mockCompanyId,
        initialAnimalIds: ["A001"],
        t: mockTranslation,
      })
    );

    act(() => {
      result.current.validate();
    });

    expect(result.current.errors.method).toBeDefined();
  });

  it("should validate bullId for natural method", () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        companyId: mockCompanyId,
        initialAnimalIds: ["A001"],
        t: mockTranslation,
      })
    );

    act(() => {
      result.current.handleMethodChange("natural");
      result.current.validate();
    });

    expect(result.current.errors.bullId).toBeDefined();
  });

  it("should validate semenCode for artificial_insemination", async () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        companyId: mockCompanyId,
        initialAnimalIds: ["A001"],
        t: mockTranslation,
      })
    );

    act(() => {
      result.current.handleMethodChange("artificial_insemination");
    });

    await waitFor(() => {
      expect(result.current.formData.attemptNumbers["A001"]).toBeDefined();
    });

    act(() => {
      result.current.validate();
    });

    expect(result.current.errors.semenCode).toBeDefined();
  });

  it("should validate attempt numbers for artificial_insemination", async () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        companyId: mockCompanyId,
        initialAnimalIds: ["A001"],
        t: mockTranslation,
      })
    );

    act(() => {
      result.current.handleMethodChange("artificial_insemination");
    });

    await waitFor(() => {
      expect(result.current.formData.attemptNumbers["A001"]).toBeDefined();
    });

    act(() => {
      // Clear attempt numbers to trigger validation error
      result.current.setFormData((prev) => ({ ...prev, attemptNumbers: {} }));
    });

    act(() => {
      result.current.validate();
    });

    expect(result.current.errors["attemptNumber_A001"]).toBeDefined();
  });

  it("should validate responsible", () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        companyId: mockCompanyId,
        initialAnimalIds: ["A001"],
        t: mockTranslation,
      })
    );

    act(() => {
      result.current.handleChange("method", "natural");
      result.current.handleChange("bullId", "B001");
      result.current.validate();
    });

    expect(result.current.errors.responsible).toBeDefined();
  });
});
