import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { usePasswordReset } from "../use-password-reset";

vi.mock("~/utils/email-validation", () => ({
  isValidEmail: vi.fn((email: string) => email.includes("@")),
}));

describe("usePasswordReset", () => {
  const mockOnSendCode = vi.fn();
  const mockOnResetPassword = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with email step", () => {
    const { result } = renderHook(() => usePasswordReset());
    expect(result.current.step).toBe("email");
    expect(result.current.email).toBe("");
    expect(result.current.code).toBe("");
    expect(result.current.newPassword).toBe("");
    expect(result.current.confirmPassword).toBe("");
  });

  it("should update email", () => {
    const { result } = renderHook(() => usePasswordReset());
    act(() => {
      result.current.setEmail("test@example.com");
    });
    expect(result.current.email).toBe("test@example.com");
  });

  it("should update code", () => {
    const { result } = renderHook(() => usePasswordReset());
    act(() => {
      result.current.setCode("123456");
    });
    expect(result.current.code).toBe("123456");
  });

  it("should update newPassword", () => {
    const { result } = renderHook(() => usePasswordReset());
    act(() => {
      result.current.setNewPassword("newpassword123");
    });
    expect(result.current.newPassword).toBe("newpassword123");
  });

  it("should update confirmPassword", () => {
    const { result } = renderHook(() => usePasswordReset());
    act(() => {
      result.current.setConfirmPassword("newpassword123");
    });
    expect(result.current.confirmPassword).toBe("newpassword123");
  });

  it("should set error when email is empty on sendCode", async () => {
    const { result } = renderHook(() => usePasswordReset({ onSendCode: mockOnSendCode }));

    await act(async () => {
      const form = document.createElement("form");
      const event = new Event("submit", { bubbles: true, cancelable: true });
      Object.defineProperty(event, "target", { value: form });
      await result.current.handleSendCode(event as unknown as React.FormEvent<HTMLFormElement>);
    });

    expect(result.current.error).toBe("emailRequired");
    expect(mockOnSendCode).not.toHaveBeenCalled();
  });

  it("should set error when email is invalid on sendCode", async () => {
    const { result } = renderHook(() => usePasswordReset({ onSendCode: mockOnSendCode }));

    act(() => {
      result.current.setEmail("invalid-email");
    });

    await act(async () => {
      const form = document.createElement("form");
      const event = new Event("submit", { bubbles: true, cancelable: true });
      Object.defineProperty(event, "target", { value: form });
      await result.current.handleSendCode(event as unknown as React.FormEvent<HTMLFormElement>);
    });

    expect(result.current.error).toBe("invalidEmail");
    expect(mockOnSendCode).not.toHaveBeenCalled();
  });

  it("should call onSendCode and move to reset step", async () => {
    mockOnSendCode.mockResolvedValue(undefined);
    const { result } = renderHook(() => usePasswordReset({ onSendCode: mockOnSendCode }));

    act(() => {
      result.current.setEmail("test@example.com");
    });

    await act(async () => {
      const form = document.createElement("form");
      const event = new Event("submit", { bubbles: true, cancelable: true });
      Object.defineProperty(event, "target", { value: form });
      await result.current.handleSendCode(event as unknown as React.FormEvent<HTMLFormElement>);
    });

    expect(mockOnSendCode).toHaveBeenCalledWith("test@example.com");
    expect(result.current.step).toBe("reset");
  });

  it("should set error when onSendCode throws", async () => {
    mockOnSendCode.mockRejectedValue(new Error("Network error"));
    const { result } = renderHook(() => usePasswordReset({ onSendCode: mockOnSendCode }));

    act(() => {
      result.current.setEmail("test@example.com");
    });

    await act(async () => {
      const form = document.createElement("form");
      const event = new Event("submit", { bubbles: true, cancelable: true });
      Object.defineProperty(event, "target", { value: form });
      await result.current.handleSendCode(event as unknown as React.FormEvent<HTMLFormElement>);
    });

    expect(result.current.error).toBe("Network error");
    expect(result.current.step).toBe("email");
  });

  it("should set error when code is empty on resetPassword", async () => {
    const { result } = renderHook(() => usePasswordReset({ onResetPassword: mockOnResetPassword }));

    act(() => {
      result.current.setStep("reset");
    });

    await act(async () => {
      const form = document.createElement("form");
      const event = new Event("submit", { bubbles: true, cancelable: true });
      Object.defineProperty(event, "target", { value: form });
      await result.current.handleResetPassword(
        event as unknown as React.FormEvent<HTMLFormElement>
      );
    });

    expect(result.current.error).toBe("codeRequired");
    expect(mockOnResetPassword).not.toHaveBeenCalled();
  });

  it("should set error when newPassword is empty on resetPassword", async () => {
    const { result } = renderHook(() => usePasswordReset({ onResetPassword: mockOnResetPassword }));

    act(() => {
      result.current.setStep("reset");
      result.current.setCode("123456");
    });

    await act(async () => {
      const form = document.createElement("form");
      const event = new Event("submit", { bubbles: true, cancelable: true });
      Object.defineProperty(event, "target", { value: form });
      await result.current.handleResetPassword(
        event as unknown as React.FormEvent<HTMLFormElement>
      );
    });

    expect(result.current.error).toBe("passwordRequired");
    expect(mockOnResetPassword).not.toHaveBeenCalled();
  });

  it("should set error when password is too short", async () => {
    const { result } = renderHook(() => usePasswordReset({ onResetPassword: mockOnResetPassword }));

    act(() => {
      result.current.setStep("reset");
      result.current.setCode("123456");
      result.current.setNewPassword("12345");
    });

    await act(async () => {
      const form = document.createElement("form");
      const event = new Event("submit", { bubbles: true, cancelable: true });
      Object.defineProperty(event, "target", { value: form });
      await result.current.handleResetPassword(
        event as unknown as React.FormEvent<HTMLFormElement>
      );
    });

    expect(result.current.error).toBe("passwordMinLength");
    expect(mockOnResetPassword).not.toHaveBeenCalled();
  });

  it("should set error when passwords do not match", async () => {
    const { result } = renderHook(() => usePasswordReset({ onResetPassword: mockOnResetPassword }));

    act(() => {
      result.current.setStep("reset");
      result.current.setCode("123456");
      result.current.setNewPassword("password123");
      result.current.setConfirmPassword("password456");
    });

    await act(async () => {
      const form = document.createElement("form");
      const event = new Event("submit", { bubbles: true, cancelable: true });
      Object.defineProperty(event, "target", { value: form });
      await result.current.handleResetPassword(
        event as unknown as React.FormEvent<HTMLFormElement>
      );
    });

    expect(result.current.error).toBe("passwordMismatch");
    expect(mockOnResetPassword).not.toHaveBeenCalled();
  });

  it("should call onResetPassword with trimmed values", async () => {
    mockOnResetPassword.mockResolvedValue(undefined);
    const { result } = renderHook(() => usePasswordReset({ onResetPassword: mockOnResetPassword }));

    act(() => {
      result.current.setStep("reset");
      result.current.setCode("  123456  ");
      result.current.setNewPassword("password123");
      result.current.setConfirmPassword("password123");
    });

    await act(async () => {
      const form = document.createElement("form");
      const event = new Event("submit", { bubbles: true, cancelable: true });
      Object.defineProperty(event, "target", { value: form });
      await result.current.handleResetPassword(
        event as unknown as React.FormEvent<HTMLFormElement>
      );
    });

    expect(mockOnResetPassword).toHaveBeenCalledWith("123456", "password123");
  });

  it("should set error when onResetPassword throws", async () => {
    mockOnResetPassword.mockRejectedValue(new Error("Invalid code"));
    const { result } = renderHook(() => usePasswordReset({ onResetPassword: mockOnResetPassword }));

    act(() => {
      result.current.setStep("reset");
      result.current.setCode("123456");
      result.current.setNewPassword("password123");
      result.current.setConfirmPassword("password123");
    });

    await act(async () => {
      const form = document.createElement("form");
      const event = new Event("submit", { bubbles: true, cancelable: true });
      Object.defineProperty(event, "target", { value: form });
      await result.current.handleResetPassword(
        event as unknown as React.FormEvent<HTMLFormElement>
      );
    });

    expect(result.current.error).toBe("Invalid code");
  });

  it("should reset all fields and step", async () => {
    const mockOnSendCodeForError = vi.fn().mockRejectedValue(new Error("Some error"));
    const { result } = renderHook(() => usePasswordReset({ onSendCode: mockOnSendCodeForError }));

    act(() => {
      if (result.current) {
        result.current.setEmail("test@example.com");
        result.current.setCode("123456");
        result.current.setNewPassword("password123");
        result.current.setConfirmPassword("password123");
        result.current.setStep("reset");
      }
    });

    // Trigger an error to set error state
    await act(async () => {
      if (result.current) {
        result.current.setEmail("test@example.com");
        const form = document.createElement("form");
        const event = new Event("submit", { bubbles: true, cancelable: true });
        Object.defineProperty(event, "target", { value: form });
        await result.current.handleSendCode(event as unknown as React.FormEvent<HTMLFormElement>);
      }
    });

    expect(result.current?.error).toBe("Some error");

    act(() => {
      if (result.current) {
        result.current.reset();
      }
    });

    expect(result.current?.email).toBe("");
    expect(result.current?.code).toBe("");
    expect(result.current?.newPassword).toBe("");
    expect(result.current?.confirmPassword).toBe("");
    expect(result.current?.error).toBe("");
    expect(result.current?.step).toBe("email");
  });

  it("should set loading state during sendCode", async () => {
    let resolvePromise: () => void;
    const promise = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });
    mockOnSendCode.mockImplementation(() => promise);
    const { result } = renderHook(() => usePasswordReset({ onSendCode: mockOnSendCode }));

    act(() => {
      if (result.current) {
        result.current.setEmail("test@example.com");
      }
    });

    act(() => {
      if (result.current) {
        const form = document.createElement("form");
        const event = new Event("submit", { bubbles: true, cancelable: true });
        Object.defineProperty(event, "target", { value: form });
        void result.current.handleSendCode(event as unknown as React.FormEvent<HTMLFormElement>);
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

  it("should set loading state during resetPassword", async () => {
    let resolvePromise: () => void;
    const promise = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });
    mockOnResetPassword.mockImplementation(() => promise);
    const { result } = renderHook(() => usePasswordReset({ onResetPassword: mockOnResetPassword }));

    act(() => {
      if (result.current) {
        result.current.setStep("reset");
        result.current.setCode("123456");
        result.current.setNewPassword("password123");
        result.current.setConfirmPassword("password123");
      }
    });

    act(() => {
      if (result.current) {
        const form = document.createElement("form");
        const event = new Event("submit", { bubbles: true, cancelable: true });
        Object.defineProperty(event, "target", { value: form });
        void result.current.handleResetPassword(
          event as unknown as React.FormEvent<HTMLFormElement>
        );
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
});
