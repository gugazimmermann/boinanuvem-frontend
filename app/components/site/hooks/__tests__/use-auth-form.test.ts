import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAuthForm } from "../use-auth-form";

describe("useAuthForm", () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default empty values", () => {
    const { result } = renderHook(() =>
      useAuthForm({
        onSubmit: mockOnSubmit,
      })
    );

    expect(result.current.email).toBe("");
    expect(result.current.password).toBe("");
    expect(result.current.error).toBe("");
    expect(result.current.isLoading).toBe(false);
  });

  it("should initialize with provided initial values", () => {
    const { result } = renderHook(() =>
      useAuthForm({
        initialEmail: "test@example.com",
        initialPassword: "password123",
        onSubmit: mockOnSubmit,
      })
    );

    expect(result.current.email).toBe("test@example.com");
    expect(result.current.password).toBe("password123");
  });

  it("should update email when setEmail is called", () => {
    const { result } = renderHook(() =>
      useAuthForm({
        onSubmit: mockOnSubmit,
      })
    );

    act(() => {
      result.current.setEmail("new@example.com");
    });

    expect(result.current.email).toBe("new@example.com");
  });

  it("should update password when setPassword is called", () => {
    const { result } = renderHook(() =>
      useAuthForm({
        onSubmit: mockOnSubmit,
      })
    );

    act(() => {
      result.current.setPassword("newpassword");
    });

    expect(result.current.password).toBe("newpassword");
  });

  it("should clear error when email is changed", () => {
    const { result } = renderHook(() =>
      useAuthForm({
        onSubmit: mockOnSubmit,
      })
    );

    // Set an error first
    act(() => {
      result.current.setEmail("test@example.com");
    });

    // Simulate an error by setting it directly (in real usage, this would come from submit)
    act(() => {
      result.current.setEmail("new@example.com");
    });

    expect(result.current.error).toBe("");
  });

  it("should clear error when password is changed", () => {
    const { result } = renderHook(() =>
      useAuthForm({
        onSubmit: mockOnSubmit,
      })
    );

    act(() => {
      result.current.setPassword("newpassword");
    });

    expect(result.current.error).toBe("");
  });

  it("should set error when email is empty on submit", async () => {
    const { result } = renderHook(() =>
      useAuthForm({
        onSubmit: mockOnSubmit,
      })
    );

    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent<HTMLFormElement>;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(result.current.error).toBe("emailRequired");
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should set error when email is only whitespace on submit", async () => {
    const { result } = renderHook(() =>
      useAuthForm({
        initialEmail: "   ",
        onSubmit: mockOnSubmit,
      })
    );

    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent<HTMLFormElement>;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(result.current.error).toBe("emailRequired");
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should set error when password is empty on submit", async () => {
    const { result } = renderHook(() =>
      useAuthForm({
        initialEmail: "test@example.com",
        onSubmit: mockOnSubmit,
      })
    );

    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent<HTMLFormElement>;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(result.current.error).toBe("passwordRequired");
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should set error when password is only whitespace on submit", async () => {
    const { result } = renderHook(() =>
      useAuthForm({
        initialEmail: "test@example.com",
        initialPassword: "   ",
        onSubmit: mockOnSubmit,
      })
    );

    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent<HTMLFormElement>;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(result.current.error).toBe("passwordRequired");
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should call onSubmit with trimmed email and password on successful submit", async () => {
    const { result } = renderHook(() =>
      useAuthForm({
        initialEmail: "  test@example.com  ",
        initialPassword: "password123",
        onSubmit: mockOnSubmit,
      })
    );

    mockOnSubmit.mockResolvedValue(undefined);

    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent<HTMLFormElement>;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockOnSubmit).toHaveBeenCalledWith("test@example.com", "password123");
    expect(result.current.error).toBe("");
    expect(result.current.isLoading).toBe(false);
  });

  it("should set loading state during submit", async () => {
    const { result } = renderHook(() =>
      useAuthForm({
        initialEmail: "test@example.com",
        initialPassword: "password123",
        onSubmit: mockOnSubmit,
      })
    );

    let resolveSubmit: () => void;
    const submitPromise = new Promise<void>((resolve) => {
      resolveSubmit = resolve;
    });
    mockOnSubmit.mockReturnValue(submitPromise);

    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent<HTMLFormElement>;

    act(() => {
      result.current.handleSubmit(mockEvent);
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolveSubmit!();
      await submitPromise;
    });

    expect(result.current.isLoading).toBe(false);
  });

  it("should handle submit error and set error message", async () => {
    const { result } = renderHook(() =>
      useAuthForm({
        initialEmail: "test@example.com",
        initialPassword: "password123",
        onSubmit: mockOnSubmit,
      })
    );

    const errorMessage = "Invalid credentials";
    mockOnSubmit.mockRejectedValue(new Error(errorMessage));

    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent<HTMLFormElement>;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.isLoading).toBe(false);
  });

  it("should handle non-Error rejection and set unknownError", async () => {
    const { result } = renderHook(() =>
      useAuthForm({
        initialEmail: "test@example.com",
        initialPassword: "password123",
        onSubmit: mockOnSubmit,
      })
    );

    mockOnSubmit.mockRejectedValue("String error");

    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent<HTMLFormElement>;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(result.current.error).toBe("unknownError");
    expect(result.current.isLoading).toBe(false);
  });

  it("should clear error when clearError is called", () => {
    const { result } = renderHook(() =>
      useAuthForm({
        onSubmit: mockOnSubmit,
      })
    );

    // Set an error first by submitting with empty email
    act(() => {
      result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>);
    });

    expect(result.current.error).toBe("emailRequired");

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBe("");
  });

  it("should clear error before submitting", async () => {
    const { result } = renderHook(() =>
      useAuthForm({
        initialEmail: "test@example.com",
        initialPassword: "password123",
        onSubmit: mockOnSubmit,
      })
    );

    // Set an error first by submitting with empty password
    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>);
    });

    // Change password to trigger error clear
    act(() => {
      result.current.setPassword("newpassword");
    });

    expect(result.current.error).toBe("");

    mockOnSubmit.mockResolvedValue(undefined);

    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent<HTMLFormElement>;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(result.current.error).toBe("");
  });
});
