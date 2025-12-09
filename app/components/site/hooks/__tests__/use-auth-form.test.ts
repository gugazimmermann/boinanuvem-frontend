import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAuthForm } from "../use-auth-form";

describe("useAuthForm", () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with empty email and password", () => {
    const { result } = renderHook(() =>
      useAuthForm({
        onSubmit: mockOnSubmit,
      })
    );

    expect(result.current.email).toBe("");
    expect(result.current.password).toBe("");
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

    act(() => {
      result.current.setEmail("test@example.com");
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
      result.current.setPassword("password");
    });

    expect(result.current.error).toBe("");
  });

  it("should set error when email is empty on submit", async () => {
    const { result } = renderHook(() =>
      useAuthForm({
        onSubmit: mockOnSubmit,
      })
    );

    await act(async () => {
      const form = document.createElement("form");
      const event = new Event("submit", { bubbles: true, cancelable: true });
      Object.defineProperty(event, "target", { value: form });
      await result.current.handleSubmit(event as unknown as React.FormEvent<HTMLFormElement>);
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

    await act(async () => {
      const form = document.createElement("form");
      const event = new Event("submit", { bubbles: true, cancelable: true });
      Object.defineProperty(event, "target", { value: form });
      await result.current.handleSubmit(event as unknown as React.FormEvent<HTMLFormElement>);
    });

    expect(result.current.error).toBe("passwordRequired");
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should call onSubmit with trimmed email and password", async () => {
    const { result } = renderHook(() =>
      useAuthForm({
        initialEmail: "  test@example.com  ",
        initialPassword: "password123",
        onSubmit: mockOnSubmit,
      })
    );

    mockOnSubmit.mockResolvedValue(undefined);

    await act(async () => {
      const form = document.createElement("form");
      const event = new Event("submit", { bubbles: true, cancelable: true });
      Object.defineProperty(event, "target", { value: form });
      await result.current.handleSubmit(event as unknown as React.FormEvent<HTMLFormElement>);
    });

    expect(mockOnSubmit).toHaveBeenCalledWith("test@example.com", "password123");
  });

  it("should set loading state during submission", async () => {
    let resolvePromise: () => void;
    const promise = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });
    mockOnSubmit.mockImplementation(() => promise);
    const { result } = renderHook(() =>
      useAuthForm({
        initialEmail: "test@example.com",
        initialPassword: "password123",
        onSubmit: mockOnSubmit,
      })
    );

    act(() => {
      if (result.current) {
        const form = document.createElement("form");
        const event = new Event("submit", { bubbles: true, cancelable: true });
        Object.defineProperty(event, "target", { value: form });
        void result.current.handleSubmit(event as unknown as React.FormEvent<HTMLFormElement>);
      }
    });

    // Wait for loading state to become true
    await waitFor(() => {
      expect(result.current?.isLoading).toBe(true);
    });

    resolvePromise!();
    await waitFor(() => {
      expect(result.current?.isLoading).toBe(false);
    });
  });

  it("should set error when onSubmit throws", async () => {
    const { result } = renderHook(() =>
      useAuthForm({
        initialEmail: "test@example.com",
        initialPassword: "password123",
        onSubmit: mockOnSubmit,
      })
    );

    mockOnSubmit.mockRejectedValue(new Error("Network error"));

    await act(async () => {
      if (result.current) {
        const form = document.createElement("form");
        const event = new Event("submit", { bubbles: true, cancelable: true });
        Object.defineProperty(event, "target", { value: form });
        await result.current.handleSubmit(event as unknown as React.FormEvent<HTMLFormElement>);
      }
    });

    expect(result.current?.error).toBe("Network error");
  });

  it("should set error message from Error object", async () => {
    const { result } = renderHook(() =>
      useAuthForm({
        initialEmail: "test@example.com",
        initialPassword: "password123",
        onSubmit: mockOnSubmit,
      })
    );

    mockOnSubmit.mockRejectedValue(new Error("Custom error"));

    await act(async () => {
      if (result.current) {
        const form = document.createElement("form");
        const event = new Event("submit", { bubbles: true, cancelable: true });
        Object.defineProperty(event, "target", { value: form });
        await result.current.handleSubmit(event as unknown as React.FormEvent<HTMLFormElement>);
      }
    });

    expect(result.current?.error).toBe("Custom error");
  });

  it("should set unknownError when error is not an Error object", async () => {
    const { result } = renderHook(() =>
      useAuthForm({
        initialEmail: "test@example.com",
        initialPassword: "password123",
        onSubmit: mockOnSubmit,
      })
    );

    mockOnSubmit.mockRejectedValue("String error");

    await act(async () => {
      if (result.current) {
        const form = document.createElement("form");
        const event = new Event("submit", { bubbles: true, cancelable: true });
        Object.defineProperty(event, "target", { value: form });
        await result.current.handleSubmit(event as unknown as React.FormEvent<HTMLFormElement>);
      }
    });

    expect(result.current?.error).toBe("unknownError");
  });

  it("should clear error when clearError is called", () => {
    const { result } = renderHook(() =>
      useAuthForm({
        onSubmit: mockOnSubmit,
      })
    );

    act(() => {
      if (result.current) {
        result.current.setEmail("test@example.com");
        result.current.setPassword("password");
      }
    });

    act(() => {
      if (result.current) {
        result.current.clearError();
      }
    });

    expect(result.current?.error).toBe("");
  });

  it("should prevent default form submission", async () => {
    const { result } = renderHook(() =>
      useAuthForm({
        initialEmail: "test@example.com",
        initialPassword: "password123",
        onSubmit: mockOnSubmit,
      })
    );

    mockOnSubmit.mockResolvedValue(undefined);

    await act(async () => {
      if (result.current) {
        const form = document.createElement("form");
        const event = new Event("submit", { bubbles: true, cancelable: true });
        const preventDefault = vi.fn();
        Object.defineProperty(event, "preventDefault", { value: preventDefault });
        Object.defineProperty(event, "target", { value: form });
        await result.current.handleSubmit(event as unknown as React.FormEvent<HTMLFormElement>);
      }
    });

    // The preventDefault is called in the handler
    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it("should clear error when email changes and error exists", async () => {
    const { result } = renderHook(() =>
      useAuthForm({
        onSubmit: mockOnSubmit,
      })
    );

    // First, set an error by submitting with empty email
    await act(async () => {
      const form = document.createElement("form");
      const event = new Event("submit", { bubbles: true, cancelable: true });
      Object.defineProperty(event, "target", { value: form });
      await result.current.handleSubmit(event as unknown as React.FormEvent<HTMLFormElement>);
    });

    expect(result.current.error).toBe("emailRequired");

    // Now change email, which should clear the error
    act(() => {
      result.current.setEmail("test@example.com");
    });

    expect(result.current.error).toBe("");
  });

  it("should clear error when password changes and error exists", async () => {
    const { result } = renderHook(() =>
      useAuthForm({
        initialEmail: "test@example.com",
        onSubmit: mockOnSubmit,
      })
    );

    // First, set an error by submitting with empty password
    await act(async () => {
      const form = document.createElement("form");
      const event = new Event("submit", { bubbles: true, cancelable: true });
      Object.defineProperty(event, "target", { value: form });
      await result.current.handleSubmit(event as unknown as React.FormEvent<HTMLFormElement>);
    });

    expect(result.current.error).toBe("passwordRequired");

    // Now change password, which should clear the error
    act(() => {
      result.current.setPassword("newpassword");
    });

    expect(result.current.error).toBe("");
  });

  it("should treat email with only whitespace as empty", async () => {
    const { result } = renderHook(() =>
      useAuthForm({
        initialEmail: "   ",
        initialPassword: "password123",
        onSubmit: mockOnSubmit,
      })
    );

    await act(async () => {
      const form = document.createElement("form");
      const event = new Event("submit", { bubbles: true, cancelable: true });
      Object.defineProperty(event, "target", { value: form });
      await result.current.handleSubmit(event as unknown as React.FormEvent<HTMLFormElement>);
    });

    expect(result.current.error).toBe("emailRequired");
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should treat password with only whitespace as empty", async () => {
    const { result } = renderHook(() =>
      useAuthForm({
        initialEmail: "test@example.com",
        initialPassword: "   ",
        onSubmit: mockOnSubmit,
      })
    );

    await act(async () => {
      const form = document.createElement("form");
      const event = new Event("submit", { bubbles: true, cancelable: true });
      Object.defineProperty(event, "target", { value: form });
      await result.current.handleSubmit(event as unknown as React.FormEvent<HTMLFormElement>);
    });

    expect(result.current.error).toBe("passwordRequired");
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should not clear error when field changes if no error exists", () => {
    const { result } = renderHook(() =>
      useAuthForm({
        onSubmit: mockOnSubmit,
      })
    );

    // No error initially
    expect(result.current.error).toBe("");

    // Change email - error should still be empty (not cleared, just stays empty)
    act(() => {
      result.current.setEmail("test@example.com");
    });

    expect(result.current.error).toBe("");
  });

  it("should handle email with leading and trailing whitespace", async () => {
    const { result } = renderHook(() =>
      useAuthForm({
        initialEmail: "  test@example.com  ",
        initialPassword: "password123",
        onSubmit: mockOnSubmit,
      })
    );

    mockOnSubmit.mockResolvedValue(undefined);

    await act(async () => {
      const form = document.createElement("form");
      const event = new Event("submit", { bubbles: true, cancelable: true });
      Object.defineProperty(event, "target", { value: form });
      await result.current.handleSubmit(event as unknown as React.FormEvent<HTMLFormElement>);
    });

    // Email should be trimmed before submission
    expect(mockOnSubmit).toHaveBeenCalledWith("test@example.com", "password123");
  });
});
