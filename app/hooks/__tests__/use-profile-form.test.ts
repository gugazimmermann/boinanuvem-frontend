import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useProfileForm } from "../use-profile-form";
import * as useAlertHook from "../use-alert";

vi.mock("../use-alert");

describe("useProfileForm", () => {
  const mockShowAlert = vi.fn();
  const mockAlertMessage = null;
  const mockOnSave = vi.fn();
  const mockOnSaveSuccess = vi.fn();

  const mockInitialData = {
    name: "John Doe",
    email: "john@example.com",
    phone: "1234567890",
    street: "123 Main St",
    number: "456",
    complement: "Apt 1",
    neighborhood: "Downtown",
    city: "City",
    state: "State",
    zipCode: "12345-678",
  };

  const mockValidate = vi.fn((data: { name?: string; email?: string }) => {
    const errors: Record<string, string> = {};
    if (!data.name?.trim()) {
      errors.name = "Name is required";
    }
    if (!data.email?.trim()) {
      errors.email = "Email is required";
    }
    return errors;
  });

  const defaultOptions = {
    initialData: mockInitialData,
    validate: mockValidate,
    onSave: mockOnSave,
    successMessage: "Profile saved successfully",
    errorMessage: "Error saving profile",
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

  it("should initialize with initial data", () => {
    const { result } = renderHook(() => useProfileForm(defaultOptions));

    expect(result.current.data).toEqual(mockInitialData);
    expect(result.current.errors).toEqual({});
    expect(result.current.isEditing).toBe(false);
    expect(result.current.isSaving).toBe(false);
  });

  it("should update data when setData is called", () => {
    const { result } = renderHook(() => useProfileForm(defaultOptions));

    const newData = { ...mockInitialData, name: "Jane Doe" };

    act(() => {
      result.current.setData(newData);
    });

    expect(result.current.data).toEqual(newData);
  });

  it("should update isEditing when setIsEditing is called", () => {
    const { result } = renderHook(() => useProfileForm(defaultOptions));

    act(() => {
      result.current.setIsEditing(true);
    });

    expect(result.current.isEditing).toBe(true);
  });

  it("should update field when handleChange is called", () => {
    const { result } = renderHook(() => useProfileForm(defaultOptions));

    act(() => {
      result.current.handleChange("name", "New Name");
    });

    expect(result.current.data.name).toBe("New Name");
  });

  it("should clear error when field is changed", async () => {
    const { result } = renderHook(() => useProfileForm(defaultOptions));

    act(() => {
      result.current.setData({ ...mockInitialData, name: "" });
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(result.current.errors.name).toBeDefined();

    act(() => {
      result.current.handleChange("name", "New Name");
    });

    expect(result.current.errors.name).toBeUndefined();
  });

  it("should validate data before saving", async () => {
    const { result } = renderHook(() => useProfileForm(defaultOptions));

    act(() => {
      result.current.setData({ ...mockInitialData, name: "" });
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(mockValidate).toHaveBeenCalled();
    expect(result.current.errors.name).toBe("Name is required");
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it("should save data when validation passes", async () => {
    mockOnSave.mockResolvedValue(undefined);

    const { result } = renderHook(() => useProfileForm(defaultOptions));

    await act(async () => {
      await result.current.handleSave();
    });

    expect(mockOnSave).toHaveBeenCalledWith(mockInitialData);
    expect(mockShowAlert).toHaveBeenCalledWith("Profile saved successfully", "success");
    expect(result.current.isEditing).toBe(false);
    expect(result.current.isSaving).toBe(false);
  });

  it("should call onSaveSuccess after successful save", async () => {
    mockOnSave.mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useProfileForm({
        ...defaultOptions,
        onSaveSuccess: mockOnSaveSuccess,
      })
    );

    await act(async () => {
      await result.current.handleSave();
    });

    expect(mockOnSaveSuccess).toHaveBeenCalledWith(mockInitialData);
  });

  it("should not call onSaveSuccess if not provided", async () => {
    mockOnSave.mockResolvedValue(undefined);

    const { result } = renderHook(() => useProfileForm(defaultOptions));

    await act(async () => {
      await result.current.handleSave();
    });

    expect(mockOnSaveSuccess).not.toHaveBeenCalled();
  });

  it("should handle save error", async () => {
    const error = new Error("Save failed");
    mockOnSave.mockRejectedValue(error);

    const { result } = renderHook(() => useProfileForm(defaultOptions));

    await act(async () => {
      await result.current.handleSave();
    });

    expect(mockShowAlert).toHaveBeenCalledWith("Error saving profile", "error");
    expect(result.current.isSaving).toBe(false);
  });

  it("should not save if onSave is not provided", async () => {
    const { result } = renderHook(() =>
      useProfileForm({
        ...defaultOptions,
        onSave: undefined,
      })
    );

    await act(async () => {
      await result.current.handleSave();
    });

    expect(result.current.isEditing).toBe(false);
    expect(mockShowAlert).toHaveBeenCalledWith("Profile saved successfully", "success");
  });

  it("should cancel editing and reset data", () => {
    const { result } = renderHook(() => useProfileForm(defaultOptions));

    act(() => {
      result.current.setIsEditing(true);
      result.current.setData({ ...mockInitialData, name: "Modified Name" });
      result.current.handleChange("email", "modified@example.com");
    });

    act(() => {
      result.current.handleCancel();
    });

    expect(result.current.data).toEqual(mockInitialData);
    expect(result.current.errors).toEqual({});
    expect(result.current.isEditing).toBe(false);
  });

  it("should update original data after successful save", async () => {
    mockOnSave.mockResolvedValue(undefined);

    const { result } = renderHook(() => useProfileForm(defaultOptions));

    const modifiedData = { ...mockInitialData, name: "Modified Name" };

    act(() => {
      result.current.setData(modifiedData);
    });

    await act(async () => {
      await result.current.handleSave();
    });

    act(() => {
      result.current.setData({ ...modifiedData, name: "Another Name" });
      result.current.handleCancel();
    });

    expect(result.current.data.name).toBe("Modified Name");
  });

  it("should return alertMessage from useAlert", () => {
    const { result } = renderHook(() => useProfileForm(defaultOptions));

    expect(result.current.alertMessage).toBe(mockAlertMessage);
  });

  it("should handle multiple field changes", () => {
    const { result } = renderHook(() => useProfileForm(defaultOptions));

    act(() => {
      result.current.handleChange("name", "New Name");
      result.current.handleChange("email", "newemail@example.com");
      result.current.handleChange("phone", "9876543210");
    });

    expect(result.current.data.name).toBe("New Name");
    expect(result.current.data.email).toBe("newemail@example.com");
    expect(result.current.data.phone).toBe("9876543210");
  });

  it("should set isSaving to true during save", async () => {
    let resolveSave: () => void;
    const savePromise = new Promise<void>((resolve) => {
      resolveSave = resolve;
    });

    mockOnSave.mockImplementation(() => savePromise);

    const { result } = renderHook(() => useProfileForm(defaultOptions));

    act(() => {
      result.current.handleSave();
    });

    expect(result.current.isSaving).toBe(true);

    act(() => {
      resolveSave!();
    });

    await act(async () => {
      await savePromise;
    });

    expect(result.current.isSaving).toBe(false);
  });
});
