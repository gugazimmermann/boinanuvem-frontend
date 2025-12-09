import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useProfileForm } from "../use-profile-form";
import { useAlert } from "../use-alert";

vi.mock("../use-alert", () => ({
  useAlert: vi.fn(),
}));

describe("useProfileForm", () => {
  let mockShowAlert: ReturnType<typeof vi.fn>;
  let mockAlertMessage: string | null;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mockShowAlert = vi.fn();
    mockAlertMessage = null;

    vi.mocked(useAlert).mockReturnValue({
      alert: null,
      alertMessage: mockAlertMessage,
      showAlert: mockShowAlert,
      clearAlert: vi.fn(),
      AlertDisplay: () => null,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should initialize with provided initial data", () => {
    const initialData = {
      zipCode: "12345-678",
      street: "Main St",
      number: "123",
      complement: "",
      neighborhood: "Downtown",
      city: "São Paulo",
      state: "SP",
    };

    const { result } = renderHook(() =>
      useProfileForm({
        initialData,
        validate: vi.fn().mockReturnValue({}),
        successMessage: "Saved",
        errorMessage: "Error",
      })
    );

    expect(result.current.data).toEqual(initialData);
    expect(result.current.isEditing).toBe(false);
    expect(result.current.isSaving).toBe(false);
  });

  it("should update data when handleChange is called", () => {
    const { result } = renderHook(() =>
      useProfileForm({
        initialData: {
          zipCode: "",
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
        },
        validate: vi.fn().mockReturnValue({}),
        successMessage: "Saved",
        errorMessage: "Error",
      })
    );

    act(() => {
      result.current.handleChange("street", "New Street");
    });

    expect(result.current.data.street).toBe("New Street");
  });

  it("should clear error when field is changed", () => {
    const { result } = renderHook(() =>
      useProfileForm({
        initialData: {
          zipCode: "",
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
        },
        validate: vi.fn().mockReturnValue({}),
        successMessage: "Saved",
        errorMessage: "Error",
      })
    );

    act(() => {
      result.current.setData((prev) => ({ ...prev }));
    });

    act(() => {
      result.current.handleChange("street", "New Street");
    });

    expect(result.current.errors.street).toBeUndefined();
  });

  it("should set editing state when setIsEditing is called", () => {
    const { result } = renderHook(() =>
      useProfileForm({
        initialData: {
          zipCode: "",
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
        },
        validate: vi.fn().mockReturnValue({}),
        successMessage: "Saved",
        errorMessage: "Error",
      })
    );

    act(() => {
      result.current.setIsEditing(true);
    });

    expect(result.current.isEditing).toBe(true);
  });

  it("should validate data before saving", async () => {
    const validate = vi.fn().mockReturnValue({
      street: "Street is required",
    });

    const { result } = renderHook(() =>
      useProfileForm({
        initialData: {
          zipCode: "",
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
        },
        validate,
        successMessage: "Saved",
        errorMessage: "Error",
      })
    );

    await act(async () => {
      await result.current.handleSave();
    });

    expect(validate).toHaveBeenCalled();
    expect(result.current.errors.street).toBe("Street is required");
    expect(result.current.isEditing).toBe(false);
  });

  it("should call onSave when validation passes", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useProfileForm({
        initialData: {
          zipCode: "",
          street: "Main St",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
        },
        validate: vi.fn().mockReturnValue({}),
        onSave,
        successMessage: "Saved",
        errorMessage: "Error",
      })
    );

    await act(async () => {
      await result.current.handleSave();
    });

    expect(onSave).toHaveBeenCalledWith(result.current.data);
  });

  it("should call onSaveSuccess after successful save", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onSaveSuccess = vi.fn();
    const { result } = renderHook(() =>
      useProfileForm({
        initialData: {
          zipCode: "",
          street: "Main St",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
        },
        validate: vi.fn().mockReturnValue({}),
        onSave,
        onSaveSuccess,
        successMessage: "Saved",
        errorMessage: "Error",
      })
    );

    await act(async () => {
      await result.current.handleSave();
    });

    expect(onSaveSuccess).toHaveBeenCalledWith(result.current.data);
  });

  it("should show success message after save", async () => {
    const { result } = renderHook(() =>
      useProfileForm({
        initialData: {
          zipCode: "",
          street: "Main St",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
        },
        validate: vi.fn().mockReturnValue({}),
        onSave: vi.fn().mockResolvedValue(undefined),
        successMessage: "Profile saved successfully",
        errorMessage: "Error",
      })
    );

    await act(async () => {
      await result.current.handleSave();
    });

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(mockShowAlert).toHaveBeenCalledWith("Profile saved successfully", "success");
  });

  it("should show error message when save fails", async () => {
    const { result } = renderHook(() =>
      useProfileForm({
        initialData: {
          zipCode: "",
          street: "Main St",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
        },
        validate: vi.fn().mockReturnValue({}),
        onSave: vi.fn().mockRejectedValue(new Error("Save failed")),
        successMessage: "Saved",
        errorMessage: "Failed to save profile",
      })
    );

    await act(async () => {
      await result.current.handleSave();
    });

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(mockShowAlert).toHaveBeenCalledWith("Failed to save profile", "error");
  });

  it("should set isSaving during save operation", async () => {
    vi.useRealTimers();
    const onSave = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 10)));
    const { result } = renderHook(() =>
      useProfileForm({
        initialData: {
          zipCode: "",
          street: "Main St",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
        },
        validate: vi.fn().mockReturnValue({}),
        onSave,
        successMessage: "Saved",
        errorMessage: "Error",
      })
    );

    expect(result.current).not.toBeNull();

    // Start save without awaiting
    act(() => {
      if (result.current) {
        result.current.handleSave();
      }
    });

    // Wait for state update to be processed
    await waitFor(
      () => {
        expect(result.current.isSaving).toBe(true);
      },
      { timeout: 1000 }
    );

    // Wait for save to complete
    await waitFor(
      () => {
        expect(result.current.isSaving).toBe(false);
      },
      { timeout: 1000 }
    );

    vi.useFakeTimers();
  });

  it("should reset to original data when handleCancel is called", () => {
    const initialData = {
      zipCode: "12345-678",
      street: "Original St",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
    };

    const { result } = renderHook(() =>
      useProfileForm({
        initialData,
        validate: vi.fn().mockReturnValue({}),
        successMessage: "Saved",
        errorMessage: "Error",
      })
    );

    expect(result.current).not.toBeNull();

    act(() => {
      if (result.current) {
        result.current.setIsEditing(true);
        result.current.handleChange("street", "Modified St");
      }
    });

    expect(result.current.data.street).toBe("Modified St");

    act(() => {
      if (result.current) {
        result.current.handleCancel();
      }
    });

    expect(result.current.data.street).toBe("Original St");
    expect(result.current.isEditing).toBe(false);
    expect(result.current.errors).toEqual({});
  });

  it("should update originalData after successful save", async () => {
    const { result } = renderHook(() =>
      useProfileForm({
        initialData: {
          zipCode: "",
          street: "Original",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
        },
        validate: vi.fn().mockReturnValue({}),
        onSave: vi.fn().mockResolvedValue(undefined),
        successMessage: "Saved",
        errorMessage: "Error",
      })
    );

    expect(result.current).not.toBeNull();

    act(() => {
      if (result.current) {
        result.current.handleChange("street", "Updated");
      }
    });

    await act(async () => {
      if (result.current) {
        await result.current.handleSave();
      }
    });

    act(() => {
      if (result.current) {
        result.current.handleCancel();
      }
    });

    expect(result.current.data.street).toBe("Updated");
  });
});
