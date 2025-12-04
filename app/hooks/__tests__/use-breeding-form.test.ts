import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBreedingForm } from "../use-breeding-form";
import * as breedingsService from "~/services/breedings.service";

vi.mock("~/services/breedings.service");

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
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(breedingsService.getNextAttemptNumber).mockReturnValue(1);
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        t: mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>,
      })
    );

    const today = new Date().toISOString().split("T")[0];
    expect(result.current.formData.date).toBe(today);
    expect(result.current.formData.animalIds).toEqual([]);
    expect(result.current.formData.method).toBe("");
    expect(result.current.formData.bullId).toBe("");
    expect(result.current.formData.attemptNumbers).toEqual({});
    expect(result.current.formData.semenCode).toBe("");
    expect(result.current.formData.employeeIds).toEqual([]);
    expect(result.current.formData.serviceProviderIds).toEqual([]);
    expect(result.current.formData.observation).toBe("");
    expect(result.current.formData.confirmed).toBe(false);
    expect(result.current.errors).toEqual({});
  });

  it("should initialize with provided initialAnimalIds", () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        initialAnimalIds: ["animal-1", "animal-2"],
        t: mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>,
      })
    );

    expect(result.current.formData.animalIds).toEqual(["animal-1", "animal-2"]);
  });

  it("should initialize with provided initialDate", () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        initialDate: "2024-01-15",
        t: mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>,
      })
    );

    expect(result.current.formData.date).toBe("2024-01-15");
  });

  it("should handle field changes", () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        t: mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>,
      })
    );

    act(() => {
      result.current.handleChange("date", "2024-01-20");
    });

    expect(result.current.formData.date).toBe("2024-01-20");
  });

  it("should clear error when field is changed", () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        t: mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>,
      })
    );

    act(() => {
      result.current.setFormData((prev) => ({
        ...prev,
        errors: { date: "Date is required" },
      }));
    });

    act(() => {
      result.current.handleChange("date", "2024-01-20");
    });

    const errors = result.current.errors;
    expect(errors.date).toBeUndefined();
  });

  it("should toggle animal selection", () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        t: mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>,
      })
    );

    act(() => {
      result.current.toggleAnimalSelection("animal-1");
    });

    expect(result.current.formData.animalIds).toContain("animal-1");

    act(() => {
      result.current.toggleAnimalSelection("animal-1");
    });

    expect(result.current.formData.animalIds).not.toContain("animal-1");
  });

  it("should add attempt number when selecting animal for artificial insemination", () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        t: mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>,
      })
    );

    act(() => {
      result.current.handleChange("method", "artificial_insemination");
    });

    act(() => {
      result.current.toggleAnimalSelection("animal-1");
    });

    expect(result.current.formData.attemptNumbers["animal-1"]).toBe(1);
    expect(breedingsService.getNextAttemptNumber).toHaveBeenCalledWith("animal-1");
  });

  it("should remove attempt number when deselecting animal", () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        t: mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>,
      })
    );

    act(() => {
      result.current.handleChange("method", "artificial_insemination");
    });

    act(() => {
      result.current.toggleAnimalSelection("animal-1");
    });

    expect(result.current.formData.attemptNumbers["animal-1"]).toBeDefined();

    act(() => {
      result.current.toggleAnimalSelection("animal-1");
    });

    expect(result.current.formData.attemptNumbers["animal-1"]).toBeUndefined();
  });

  it("should not add attempt number for natural breeding", () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        t: mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>,
      })
    );

    act(() => {
      result.current.handleChange("method", "natural");
    });

    act(() => {
      result.current.toggleAnimalSelection("animal-1");
    });

    expect(result.current.formData.attemptNumbers["animal-1"]).toBeUndefined();
  });

  it("should toggle employee selection", () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        t: mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>,
      })
    );

    act(() => {
      result.current.toggleSelection("employeeIds", "emp-1");
    });

    expect(result.current.formData.employeeIds).toContain("emp-1");

    act(() => {
      result.current.toggleSelection("employeeIds", "emp-1");
    });

    expect(result.current.formData.employeeIds).not.toContain("emp-1");
  });

  it("should toggle service provider selection", () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        t: mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>,
      })
    );

    act(() => {
      result.current.toggleSelection("serviceProviderIds", "sp-1");
    });

    expect(result.current.formData.serviceProviderIds).toContain("sp-1");

    act(() => {
      result.current.toggleSelection("serviceProviderIds", "sp-1");
    });

    expect(result.current.formData.serviceProviderIds).not.toContain("sp-1");
  });

  it("should handle method change to artificial_insemination", () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        initialAnimalIds: ["animal-1", "animal-2"],
        t: mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>,
      })
    );

    act(() => {
      result.current.handleMethodChange("artificial_insemination");
    });

    expect(result.current.formData.method).toBe("artificial_insemination");
    expect(result.current.formData.bullId).toBe("");
    expect(result.current.formData.attemptNumbers["animal-1"]).toBe(1);
    expect(result.current.formData.attemptNumbers["animal-2"]).toBe(1);
  });

  it("should handle method change to natural", () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        initialAnimalIds: ["animal-1"],
        t: mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>,
      })
    );

    act(() => {
      result.current.handleChange("bullId", "bull-1");
      result.current.handleChange("semenCode", "SEM-001");
    });

    act(() => {
      result.current.handleMethodChange("natural");
    });

    expect(result.current.formData.method).toBe("natural");
    expect(result.current.formData.bullId).toBe("bull-1");
    expect(result.current.formData.semenCode).toBe("");
    expect(result.current.formData.attemptNumbers).toEqual({});
  });

  it("should clear errors for bullId and semenCode when method changes", () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        t: mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>,
      })
    );

    act(() => {
      result.current.setFormData((prev) => ({
        ...prev,
        errors: { bullId: "Error", semenCode: "Error" },
      }));
    });

    act(() => {
      result.current.handleMethodChange("natural");
    });

    expect(result.current.errors.bullId).toBeUndefined();
    expect(result.current.errors.semenCode).toBeUndefined();
  });

  it("should handle attempt number change", () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        t: mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>,
      })
    );

    act(() => {
      result.current.handleChange("method", "artificial_insemination");
      result.current.toggleAnimalSelection("animal-1");
    });

    act(() => {
      result.current.handleAttemptNumberChange("animal-1", "5");
    });

    expect(result.current.formData.attemptNumbers["animal-1"]).toBe(5);
  });

  it("should not update attempt number for invalid value", () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        t: mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>,
      })
    );

    act(() => {
      result.current.handleChange("method", "artificial_insemination");
      result.current.toggleAnimalSelection("animal-1");
    });

    const initialAttempt = result.current.formData.attemptNumbers["animal-1"];

    act(() => {
      result.current.handleAttemptNumberChange("animal-1", "invalid");
    });

    expect(result.current.formData.attemptNumbers["animal-1"]).toBe(initialAttempt);
  });

  it("should not update attempt number for zero or negative", () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        t: mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>,
      })
    );

    act(() => {
      result.current.handleChange("method", "artificial_insemination");
      result.current.toggleAnimalSelection("animal-1");
    });

    const initialAttempt = result.current.formData.attemptNumbers["animal-1"];

    act(() => {
      result.current.handleAttemptNumberChange("animal-1", "0");
    });

    expect(result.current.formData.attemptNumbers["animal-1"]).toBe(initialAttempt);
  });

  it("should validate and return false when animalIds is empty", () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        t: mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>,
      })
    );

    let isValid: boolean;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid!).toBe(false);
    expect(result.current.errors.animalIds).toBe("Animal is required");
  });

  it("should validate and return false when date is empty", () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        initialAnimalIds: ["animal-1"],
        t: mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>,
      })
    );

    act(() => {
      result.current.handleChange("date", "");
    });

    let isValid: boolean;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid!).toBe(false);
    expect(result.current.errors.date).toBe("Date is required");
  });

  it("should validate and return false when method is empty", () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        initialAnimalIds: ["animal-1"],
        t: mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>,
      })
    );

    let isValid: boolean;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid!).toBe(false);
    expect(result.current.errors.method).toBe("Method is required");
  });

  it("should validate and return false when bullId is empty for natural method", () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        initialAnimalIds: ["animal-1"],
        t: mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>,
      })
    );

    act(() => {
      result.current.handleChange("method", "natural");
    });

    let isValid: boolean;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid!).toBe(false);
    expect(result.current.errors.bullId).toBe("Bull is required");
  });

  it("should validate and return false when semenCode is empty for artificial_insemination", () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        initialAnimalIds: ["animal-1"],
        t: mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>,
      })
    );

    act(() => {
      result.current.handleChange("method", "artificial_insemination");
    });

    let isValid: boolean;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid!).toBe(false);
    expect(result.current.errors.semenCode).toBe("Semen code is required");
  });

  it("should validate and return false when attemptNumber is missing for artificial_insemination", () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        initialAnimalIds: ["animal-1"],
        t: mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>,
      })
    );

    act(() => {
      result.current.handleChange("method", "artificial_insemination");
      result.current.handleChange("semenCode", "SEM-001");
    });

    let isValid: boolean;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid!).toBe(false);
    expect(result.current.errors["attemptNumber_animal-1"]).toBe("Attempt number is required");
  });

  it("should validate and return false when no responsible is selected", () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        initialAnimalIds: ["animal-1"],
        t: mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>,
      })
    );

    act(() => {
      result.current.handleChange("method", "natural");
      result.current.handleChange("bullId", "bull-1");
    });

    let isValid: boolean;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid!).toBe(false);
    expect(result.current.errors.responsible).toBe("Responsible is required");
  });

  it("should validate and return true when all fields are valid", () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        initialAnimalIds: ["animal-1"],
        t: mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>,
      })
    );

    act(() => {
      result.current.handleChange("method", "natural");
      result.current.handleChange("bullId", "bull-1");
      result.current.toggleSelection("employeeIds", "emp-1");
    });

    let isValid: boolean;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid!).toBe(true);
    expect(Object.keys(result.current.errors)).toHaveLength(0);
  });

  it("should validate artificial_insemination with all required fields", () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        t: mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>,
      })
    );

    act(() => {
      result.current.toggleAnimalSelection("animal-1");
      result.current.handleMethodChange("artificial_insemination");
      result.current.handleChange("semenCode", "SEM-001");
      result.current.toggleSelection("employeeIds", "emp-1");
    });

    let isValid: boolean;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid!).toBe(true);
  });

  it("should expose setFormData", () => {
    const { result } = renderHook(() =>
      useBreedingForm({
        t: mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>,
      })
    );

    const newData = {
      ...result.current.formData,
      observation: "New observation",
    };

    act(() => {
      result.current.setFormData(newData);
    });

    expect(result.current.formData.observation).toBe("New observation");
  });
});
