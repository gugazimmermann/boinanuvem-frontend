import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLocationForm } from "../use-location-form";
import { LocationType, AreaType } from "~/types";
import * as useAlertHook from "../use-alert";

vi.mock("../use-alert");

describe("useLocationForm", () => {
  const mockShowAlert = vi.fn();
  const mockAlertMessage = null;
  const mockOnSubmit = vi.fn();
  const mockOnSuccess = vi.fn();

  const mockTranslation = {
    profile: {
      errors: {
        required: (label: string) => `${label} is required`,
      },
    },
  };

  const mockTranslationKeys = {
    codeLabel: "Code",
    nameLabel: "Name",
    locationTypeLabel: "Location Type",
    areaLabel: "Area",
    propertyLabel: "Property",
    areaValidationError: "Area must be a positive number",
  };

  const defaultOptions = {
    translationKeys: mockTranslationKeys,
    translation: mockTranslation,
    onSubmit: mockOnSubmit,
    successMessage: "Location saved successfully",
    errorMessage: "Error saving location",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAlertHook.useAlert).mockReturnValue({
      alert: null,
      alertMessage: mockAlertMessage,
      showAlert: mockShowAlert,
      clearAlert: vi.fn(),
      AlertDisplay: () => null,
    });
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useLocationForm(defaultOptions));

    expect(result.current.formData).toEqual({
      code: "",
      name: "",
      locationType: LocationType.PASTURE,
      areaValue: "",
      areaType: AreaType.HECTARES,
      status: "active",
      propertyId: "",
    });
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
  });

  it("should initialize with initial data", () => {
    const initialData = {
      code: "LOC001",
      name: "Location 1",
      locationType: LocationType.BARN,
      areaValue: "10",
      areaType: AreaType.ACRES,
      status: "inactive" as const,
      propertyId: "prop-1",
    };

    const { result } = renderHook(() =>
      useLocationForm({
        ...defaultOptions,
        initialData,
      })
    );

    expect(result.current.formData).toEqual(initialData);
  });

  it("should update form data when handleChange is called", () => {
    const { result } = renderHook(() => useLocationForm(defaultOptions));

    act(() => {
      result.current.handleChange("name", "New Location");
    });

    expect(result.current.formData.name).toBe("New Location");
  });

  it("should clear error when field is changed", () => {
    const { result } = renderHook(() => useLocationForm(defaultOptions));

    act(() => {
      result.current.validate();
    });

    expect(result.current.errors.name).toBeDefined();

    act(() => {
      result.current.handleChange("name", "New Name");
    });

    expect(result.current.errors.name).toBeUndefined();
  });

  it("should validate required fields", () => {
    const { result } = renderHook(() => useLocationForm(defaultOptions));

    act(() => {
      const isValid = result.current.validate();
      expect(isValid).toBe(false);
    });

    expect(result.current.errors.code).toBe("Code is required");
    expect(result.current.errors.name).toBe("Name is required");
    // locationType has a default value, so it won't be in errors
    expect(result.current.errors.propertyId).toBe("Property is required");
    expect(result.current.errors.areaValue).toBe("Area is required");
  });

  it("should validate area value is a positive number", () => {
    const { result } = renderHook(() =>
      useLocationForm({
        ...defaultOptions,
        initialData: {
          code: "LOC001",
          name: "Location 1",
          locationType: LocationType.PASTURE,
          propertyId: "prop-1",
          areaValue: "invalid",
        },
      })
    );

    act(() => {
      const isValid = result.current.validate();
      expect(isValid).toBe(false);
    });

    expect(result.current.errors.areaValue).toBe("Area must be a positive number");
  });

  it("should validate area value is greater than zero", () => {
    const { result } = renderHook(() =>
      useLocationForm({
        ...defaultOptions,
        initialData: {
          code: "LOC001",
          name: "Location 1",
          locationType: LocationType.PASTURE,
          propertyId: "prop-1",
          areaValue: "0",
        },
      })
    );

    act(() => {
      const isValid = result.current.validate();
      expect(isValid).toBe(false);
    });

    expect(result.current.errors.areaValue).toBe("Area must be a positive number");
  });

  it("should validate area value is negative", () => {
    const { result } = renderHook(() =>
      useLocationForm({
        ...defaultOptions,
        initialData: {
          code: "LOC001",
          name: "Location 1",
          locationType: LocationType.PASTURE,
          propertyId: "prop-1",
          areaValue: "-10",
        },
      })
    );

    act(() => {
      const isValid = result.current.validate();
      expect(isValid).toBe(false);
    });

    expect(result.current.errors.areaValue).toBe("Area must be a positive number");
  });

  it("should pass validation with valid data", () => {
    const { result } = renderHook(() =>
      useLocationForm({
        ...defaultOptions,
        initialData: {
          code: "LOC001",
          name: "Location 1",
          locationType: LocationType.PASTURE,
          propertyId: "prop-1",
          areaValue: "10.5",
          areaType: AreaType.HECTARES,
        },
      })
    );

    act(() => {
      const isValid = result.current.validate();
      expect(isValid).toBe(true);
    });

    expect(Object.keys(result.current.errors)).toHaveLength(0);
  });

  it("should handle form submission successfully", async () => {
    mockOnSubmit.mockResolvedValue(undefined);

    const { result } = renderHook(() => useLocationForm(defaultOptions));

    act(() => {
      result.current.handleChange("code", "LOC001");
      result.current.handleChange("name", "Location 1");
      result.current.handleChange("locationType", LocationType.PASTURE);
      result.current.handleChange("propertyId", "prop-1");
      result.current.handleChange("areaValue", "10");
    });

    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockOnSubmit).toHaveBeenCalledWith({
      code: "LOC001",
      name: "Location 1",
      locationType: LocationType.PASTURE,
      area: {
        value: 10,
        type: AreaType.HECTARES,
      },
      status: "active",
      propertyId: "prop-1",
      companyId: "",
    });
    expect(mockShowAlert).toHaveBeenCalledWith("Location saved successfully", "success");
    expect(result.current.isSubmitting).toBe(false);
  });

  it("should call onSuccess callback after successful submission", async () => {
    mockOnSubmit.mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useLocationForm({
        ...defaultOptions,
        onSuccess: mockOnSuccess,
      })
    );

    act(() => {
      result.current.handleChange("code", "LOC001");
      result.current.handleChange("name", "Location 1");
      result.current.handleChange("locationType", LocationType.PASTURE);
      result.current.handleChange("propertyId", "prop-1");
      result.current.handleChange("areaValue", "10");
    });

    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it("should not call onSuccess if not provided", async () => {
    mockOnSubmit.mockResolvedValue(undefined);

    const { result } = renderHook(() => useLocationForm(defaultOptions));

    act(() => {
      result.current.handleChange("code", "LOC001");
      result.current.handleChange("name", "Location 1");
      result.current.handleChange("locationType", LocationType.PASTURE);
      result.current.handleChange("propertyId", "prop-1");
      result.current.handleChange("areaValue", "10");
    });

    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it("should handle form submission error", async () => {
    const error = new Error("Submission failed");
    mockOnSubmit.mockRejectedValue(error);

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useLocationForm(defaultOptions));

    act(() => {
      result.current.handleChange("code", "LOC001");
      result.current.handleChange("name", "Location 1");
      result.current.handleChange("locationType", LocationType.PASTURE);
      result.current.handleChange("propertyId", "prop-1");
      result.current.handleChange("areaValue", "10");
    });

    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith("Error submitting form:", error);
    expect(mockShowAlert).toHaveBeenCalledWith("Error saving location", "error");
    expect(result.current.isSubmitting).toBe(false);

    consoleErrorSpy.mockRestore();
  });

  it("should not submit if validation fails", async () => {
    const { result } = renderHook(() => useLocationForm(defaultOptions));

    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should update form data when initialData changes", () => {
    type Props = { initialData?: Partial<import("../use-location-form").LocationFormState> };
    const { result, rerender } = renderHook(
      ({ initialData }: Props) => useLocationForm({ ...defaultOptions, initialData }),
      {
        initialProps: { initialData: undefined } as Props,
      }
    );

    expect(result.current.formData.code).toBe("");

    rerender({
      initialData: {
        code: "LOC001",
        name: "Location 1",
      },
    } as Props);

    expect(result.current.formData.code).toBe("LOC001");
    expect(result.current.formData.name).toBe("Location 1");
  });

  it("should not update form data if initialData reference is the same", () => {
    const initialData = {
      code: "LOC001",
      name: "Location 1",
    };

    const { result, rerender } = renderHook(
      ({ initialData }) => useLocationForm({ ...defaultOptions, initialData }),
      {
        initialProps: { initialData },
      }
    );

    const firstCode = result.current.formData.code;

    rerender({ initialData });

    expect(result.current.formData.code).toBe(firstCode);
  });

  it("should handle area type changes", () => {
    const { result } = renderHook(() => useLocationForm(defaultOptions));

    act(() => {
      result.current.handleChange("areaType", AreaType.ACRES);
    });

    expect(result.current.formData.areaType).toBe(AreaType.ACRES);
  });

  it("should handle status changes", () => {
    const { result } = renderHook(() => useLocationForm(defaultOptions));

    act(() => {
      result.current.handleChange("status", "inactive");
    });

    expect(result.current.formData.status).toBe("inactive");
  });

  it("should handle location type changes", () => {
    const { result } = renderHook(() => useLocationForm(defaultOptions));

    act(() => {
      result.current.handleChange("locationType", LocationType.BARN);
    });

    expect(result.current.formData.locationType).toBe(LocationType.BARN);
  });

  it("should parse area value as float in submission", async () => {
    mockOnSubmit.mockResolvedValue(undefined);

    const { result } = renderHook(() => useLocationForm(defaultOptions));

    act(() => {
      result.current.handleChange("code", "LOC001");
      result.current.handleChange("name", "Location 1");
      result.current.handleChange("locationType", LocationType.PASTURE);
      result.current.handleChange("propertyId", "prop-1");
      result.current.handleChange("areaValue", "10.75");
    });

    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        area: expect.objectContaining({
          value: 10.75,
        }),
      })
    );
  });

  it("should return alertMessage from useAlert", () => {
    const { result } = renderHook(() => useLocationForm(defaultOptions));

    expect(result.current.alertMessage).toBe(mockAlertMessage);
  });

  it("should expose showAlert function", () => {
    const { result } = renderHook(() => useLocationForm(defaultOptions));

    act(() => {
      result.current.showAlert("Test message", "info");
    });

    expect(mockShowAlert).toHaveBeenCalledWith("Test message", "info");
  });
});
