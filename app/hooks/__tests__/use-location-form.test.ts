import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLocationForm } from "../use-location-form";
import { LocationType, AreaType } from "~/types";
import { useAlert } from "../use-alert";

vi.mock("../use-alert", () => ({
  useAlert: vi.fn(),
}));

describe("useLocationForm", () => {
  let mockShowAlert: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mockShowAlert = vi.fn();

    vi.mocked(useAlert).mockReturnValue({
      alert: null,
      alertMessage: null,
      showAlert: mockShowAlert,
      clearAlert: vi.fn(),
      AlertDisplay: () => null,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should initialize with default form data", () => {
    const { result } = renderHook(() =>
      useLocationForm({
        translationKeys: {
          codeLabel: "Code",
          nameLabel: "Name",
          locationTypeLabel: "Location Type",
          areaLabel: "Area",
          propertyLabel: "Property",
          areaValidationError: "Invalid area",
        },
        translation: {
          profile: {
            errors: {
              required: (label) => `${label} is required`,
            },
          },
        },
        onSubmit: vi.fn(),
        successMessage: "Saved",
        errorMessage: "Error",
      })
    );

    expect(result.current.formData.code).toBe("");
    expect(result.current.formData.locationType).toBe(LocationType.PASTURE);
    expect(result.current.formData.areaType).toBe(AreaType.HECTARES);
    expect(result.current.formData.status).toBe("active");
  });

  it("should merge initial data with defaults", () => {
    const { result } = renderHook(() =>
      useLocationForm({
        initialData: {
          code: "L001",
          name: "Test Location",
        },
        translationKeys: {
          codeLabel: "Code",
          nameLabel: "Name",
          locationTypeLabel: "Location Type",
          areaLabel: "Area",
          propertyLabel: "Property",
          areaValidationError: "Invalid area",
        },
        translation: {
          profile: {
            errors: {
              required: (label) => `${label} is required`,
            },
          },
        },
        onSubmit: vi.fn(),
        successMessage: "Saved",
        errorMessage: "Error",
      })
    );

    expect(result.current.formData.code).toBe("L001");
    expect(result.current.formData.name).toBe("Test Location");
  });

  it("should update form data when handleChange is called", () => {
    const { result } = renderHook(() =>
      useLocationForm({
        translationKeys: {
          codeLabel: "Code",
          nameLabel: "Name",
          locationTypeLabel: "Location Type",
          areaLabel: "Area",
          propertyLabel: "Property",
          areaValidationError: "Invalid area",
        },
        translation: {
          profile: {
            errors: {
              required: (label) => `${label} is required`,
            },
          },
        },
        onSubmit: vi.fn(),
        successMessage: "Saved",
        errorMessage: "Error",
      })
    );

    act(() => {
      result.current.handleChange("name", "New Name");
    });

    expect(result.current.formData.name).toBe("New Name");
  });

  it("should clear error when field is changed", () => {
    const { result } = renderHook(() =>
      useLocationForm({
        translationKeys: {
          codeLabel: "Code",
          nameLabel: "Name",
          locationTypeLabel: "Location Type",
          areaLabel: "Area",
          propertyLabel: "Property",
          areaValidationError: "Invalid area",
        },
        translation: {
          profile: {
            errors: {
              required: (label) => `${label} is required`,
            },
          },
        },
        onSubmit: vi.fn(),
        successMessage: "Saved",
        errorMessage: "Error",
      })
    );

    act(() => {
      result.current.validate();
    });

    expect(result.current.errors.name).toBeDefined();

    act(() => {
      result.current.handleChange("name", "Test");
    });

    expect(result.current.errors.name).toBeUndefined();
  });

  it("should validate code field", () => {
    const { result } = renderHook(() =>
      useLocationForm({
        translationKeys: {
          codeLabel: "Code",
          nameLabel: "Name",
          locationTypeLabel: "Location Type",
          areaLabel: "Area",
          propertyLabel: "Property",
          areaValidationError: "Invalid area",
        },
        translation: {
          profile: {
            errors: {
              required: (label) => `${label} is required`,
            },
          },
        },
        onSubmit: vi.fn(),
        successMessage: "Saved",
        errorMessage: "Error",
      })
    );

    act(() => {
      result.current.validate();
    });

    expect(result.current.errors.code).toBeDefined();
  });

  it("should validate name field", () => {
    const { result } = renderHook(() =>
      useLocationForm({
        translationKeys: {
          codeLabel: "Code",
          nameLabel: "Name",
          locationTypeLabel: "Location Type",
          areaLabel: "Area",
          propertyLabel: "Property",
          areaValidationError: "Invalid area",
        },
        translation: {
          profile: {
            errors: {
              required: (label) => `${label} is required`,
            },
          },
        },
        onSubmit: vi.fn(),
        successMessage: "Saved",
        errorMessage: "Error",
      })
    );

    act(() => {
      result.current.validate();
    });

    expect(result.current.errors.name).toBeDefined();
  });

  it("should validate propertyId field", () => {
    const { result } = renderHook(() =>
      useLocationForm({
        translationKeys: {
          codeLabel: "Code",
          nameLabel: "Name",
          locationTypeLabel: "Location Type",
          areaLabel: "Area",
          propertyLabel: "Property",
          areaValidationError: "Invalid area",
        },
        translation: {
          profile: {
            errors: {
              required: (label) => `${label} is required`,
            },
          },
        },
        onSubmit: vi.fn(),
        successMessage: "Saved",
        errorMessage: "Error",
      })
    );

    act(() => {
      result.current.validate();
    });

    expect(result.current.errors.propertyId).toBeDefined();
  });

  it("should validate areaValue field", () => {
    const { result } = renderHook(() =>
      useLocationForm({
        translationKeys: {
          codeLabel: "Code",
          nameLabel: "Name",
          locationTypeLabel: "Location Type",
          areaLabel: "Area",
          propertyLabel: "Property",
          areaValidationError: "Invalid area",
        },
        translation: {
          profile: {
            errors: {
              required: (label) => `${label} is required`,
            },
          },
        },
        onSubmit: vi.fn(),
        successMessage: "Saved",
        errorMessage: "Error",
      })
    );

    act(() => {
      result.current.validate();
    });

    expect(result.current.errors.areaValue).toBeDefined();
  });

  it("should validate areaValue is a positive number", () => {
    const { result } = renderHook(() =>
      useLocationForm({
        initialData: {
          code: "L001",
          name: "Test",
          propertyId: "P001",
          areaValue: "-10",
        },
        translationKeys: {
          codeLabel: "Code",
          nameLabel: "Name",
          locationTypeLabel: "Location Type",
          areaLabel: "Area",
          propertyLabel: "Property",
          areaValidationError: "Invalid area",
        },
        translation: {
          profile: {
            errors: {
              required: (label) => `${label} is required`,
            },
          },
        },
        onSubmit: vi.fn(),
        successMessage: "Saved",
        errorMessage: "Error",
      })
    );

    act(() => {
      result.current.validate();
    });

    expect(result.current.errors.areaValue).toBe("Invalid area");
  });

  it("should call onSubmit when form is valid", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useLocationForm({
        initialData: {
          code: "L001",
          name: "Test Location",
          propertyId: "P001",
          areaValue: "10",
          areaType: AreaType.HECTARES,
        },
        translationKeys: {
          codeLabel: "Code",
          nameLabel: "Name",
          locationTypeLabel: "Location Type",
          areaLabel: "Area",
          propertyLabel: "Property",
          areaValidationError: "Invalid area",
        },
        translation: {
          profile: {
            errors: {
              required: (label) => `${label} is required`,
            },
          },
        },
        onSubmit,
        successMessage: "Saved",
        errorMessage: "Error",
      })
    );

    const event = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(event);
    });

    expect(onSubmit).toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        code: "L001",
        name: "Test Location",
        area: {
          value: 10,
          type: AreaType.HECTARES,
        },
      })
    );
  });

  it("should show success message after successful submission", async () => {
    const { result } = renderHook(() =>
      useLocationForm({
        initialData: {
          code: "L001",
          name: "Test Location",
          propertyId: "P001",
          areaValue: "10",
          areaType: AreaType.HECTARES,
        },
        translationKeys: {
          codeLabel: "Code",
          nameLabel: "Name",
          locationTypeLabel: "Location Type",
          areaLabel: "Area",
          propertyLabel: "Property",
          areaValidationError: "Invalid area",
        },
        translation: {
          profile: {
            errors: {
              required: (label) => `${label} is required`,
            },
          },
        },
        onSubmit: vi.fn().mockResolvedValue(undefined),
        successMessage: "Location saved",
        errorMessage: "Error",
      })
    );

    expect(result.current).not.toBeNull();

    const event = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent;

    await act(async () => {
      if (result.current) {
        await result.current.handleSubmit(event);
      }
    });

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(mockShowAlert).toHaveBeenCalledWith("Location saved", "success");
  });

  it("should show error message when submission fails", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { result } = renderHook(() =>
      useLocationForm({
        initialData: {
          code: "L001",
          name: "Test Location",
          propertyId: "P001",
          areaValue: "10",
          areaType: AreaType.HECTARES,
        },
        translationKeys: {
          codeLabel: "Code",
          nameLabel: "Name",
          locationTypeLabel: "Location Type",
          areaLabel: "Area",
          propertyLabel: "Property",
          areaValidationError: "Invalid area",
        },
        translation: {
          profile: {
            errors: {
              required: (label) => `${label} is required`,
            },
          },
        },
        onSubmit: vi.fn().mockRejectedValue(new Error("Failed")),
        successMessage: "Saved",
        errorMessage: "Failed to save location",
      })
    );

    expect(result.current).not.toBeNull();

    const event = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent;

    await act(async () => {
      if (result.current) {
        await result.current.handleSubmit(event);
      }
    });

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(mockShowAlert).toHaveBeenCalledWith("Failed to save location", "error");
    consoleErrorSpy.mockRestore();
  });

  it("should not submit when validation fails", async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useLocationForm({
        translationKeys: {
          codeLabel: "Code",
          nameLabel: "Name",
          locationTypeLabel: "Location Type",
          areaLabel: "Area",
          propertyLabel: "Property",
          areaValidationError: "Invalid area",
        },
        translation: {
          profile: {
            errors: {
              required: (label) => `${label} is required`,
            },
          },
        },
        onSubmit,
        successMessage: "Saved",
        errorMessage: "Error",
      })
    );

    const event = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(event);
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
