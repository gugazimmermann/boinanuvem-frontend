import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePasswordReset } from "../use-password-reset";
import { isValidEmail } from "~/utils/email-validation";

vi.mock("~/utils/email-validation", () => ({
  isValidEmail: vi.fn(),
}));

describe("usePasswordReset", () => {
  const mockOnSendCode = vi.fn();
  const mockOnResetPassword = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isValidEmail).mockReturnValue(true);
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => usePasswordReset());

    expect(result.current.email).toBe("");
    expect(result.current.code).toBe("");
    expect(result.current.newPassword).toBe("");
    expect(result.current.confirmPassword).toBe("");
    expect(result.current.error).toBe("");
    expect(result.current.isLoading).toBe(false);
    expect(result.current.step).toBe("email");
  });

  it("should update email when setEmail is called", () => {
    const { result } = renderHook(() => usePasswordReset());

    act(() => {
      result.current.setEmail("test@example.com");
    });

    expect(result.current.email).toBe("test@example.com");
  });

  it("should update code when setCode is called", () => {
    const { result } = renderHook(() => usePasswordReset());

    act(() => {
      result.current.setCode("123456");
    });

    expect(result.current.code).toBe("123456");
  });

  it("should update newPassword when setNewPassword is called", () => {
    const { result } = renderHook(() => usePasswordReset());

    act(() => {
      result.current.setNewPassword("newpassword123");
    });

    expect(result.current.newPassword).toBe("newpassword123");
  });

  it("should update confirmPassword when setConfirmPassword is called", () => {
    const { result } = renderHook(() => usePasswordReset());

    act(() => {
      result.current.setConfirmPassword("newpassword123");
    });

    expect(result.current.confirmPassword).toBe("newpassword123");
  });

  it("should update step when setStep is called", () => {
    const { result } = renderHook(() => usePasswordReset());

    act(() => {
      result.current.setStep("reset");
    });

    expect(result.current.step).toBe("reset");
  });

  describe("handleSendCode", () => {
    it("should set error when email is empty", async () => {
      const { result } = renderHook(() => usePasswordReset({ onSendCode: mockOnSendCode }));

      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>;

      await act(async () => {
        await result.current.handleSendCode(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(result.current.error).toBe("emailRequired");
      expect(mockOnSendCode).not.toHaveBeenCalled();
    });

    it("should set error when email is only whitespace", async () => {
      const { result } = renderHook(() => usePasswordReset({ onSendCode: mockOnSendCode }));

      act(() => {
        result.current.setEmail("   ");
      });

      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>;

      await act(async () => {
        await result.current.handleSendCode(mockEvent);
      });

      expect(result.current.error).toBe("emailRequired");
      expect(mockOnSendCode).not.toHaveBeenCalled();
    });

    it("should set error when email is invalid", async () => {
      vi.mocked(isValidEmail).mockReturnValue(false);

      const { result } = renderHook(() => usePasswordReset({ onSendCode: mockOnSendCode }));

      act(() => {
        result.current.setEmail("invalid-email");
      });

      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>;

      await act(async () => {
        await result.current.handleSendCode(mockEvent);
      });

      expect(result.current.error).toBe("invalidEmail");
      expect(mockOnSendCode).not.toHaveBeenCalled();
    });

    it("should call onSendCode and move to reset step on success", async () => {
      mockOnSendCode.mockResolvedValue(undefined);

      const { result } = renderHook(() => usePasswordReset({ onSendCode: mockOnSendCode }));

      act(() => {
        result.current.setEmail("test@example.com");
      });

      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>;

      await act(async () => {
        await result.current.handleSendCode(mockEvent);
      });

      expect(mockOnSendCode).toHaveBeenCalledWith("test@example.com");
      expect(result.current.step).toBe("reset");
      expect(result.current.error).toBe("");
      expect(result.current.isLoading).toBe(false);
    });

    it("should handle onSendCode error", async () => {
      const errorMessage = "Failed to send code";
      mockOnSendCode.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => usePasswordReset({ onSendCode: mockOnSendCode }));

      act(() => {
        result.current.setEmail("test@example.com");
      });

      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>;

      await act(async () => {
        await result.current.handleSendCode(mockEvent);
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.step).toBe("email");
      expect(result.current.isLoading).toBe(false);
    });

    it("should handle non-Error rejection", async () => {
      mockOnSendCode.mockRejectedValue("String error");

      const { result } = renderHook(() => usePasswordReset({ onSendCode: mockOnSendCode }));

      act(() => {
        result.current.setEmail("test@example.com");
      });

      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>;

      await act(async () => {
        await result.current.handleSendCode(mockEvent);
      });

      expect(result.current.error).toBe("sendCodeError");
    });

    it("should set loading state during send code", async () => {
      let resolveSendCode: () => void;
      const sendCodePromise = new Promise<void>((resolve) => {
        resolveSendCode = resolve;
      });
      mockOnSendCode.mockReturnValue(sendCodePromise);

      const { result } = renderHook(() => usePasswordReset({ onSendCode: mockOnSendCode }));

      act(() => {
        result.current.setEmail("test@example.com");
      });

      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>;

      act(() => {
        result.current.handleSendCode(mockEvent);
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolveSendCode!();
        await sendCodePromise;
      });

      expect(result.current.isLoading).toBe(false);
    });

    it("should work without onSendCode callback", async () => {
      const { result } = renderHook(() => usePasswordReset());

      act(() => {
        result.current.setEmail("test@example.com");
      });

      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>;

      await act(async () => {
        await result.current.handleSendCode(mockEvent);
      });

      expect(result.current.step).toBe("reset");
    });
  });

  describe("handleResetPassword", () => {
    it("should set error when code is empty", async () => {
      const { result } = renderHook(() =>
        usePasswordReset({ onResetPassword: mockOnResetPassword })
      );

      act(() => {
        result.current.setStep("reset");
        result.current.setNewPassword("newpassword123");
        result.current.setConfirmPassword("newpassword123");
      });

      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>;

      await act(async () => {
        await result.current.handleResetPassword(mockEvent);
      });

      expect(result.current.error).toBe("codeRequired");
      expect(mockOnResetPassword).not.toHaveBeenCalled();
    });

    it("should set error when newPassword is empty", async () => {
      const { result } = renderHook(() =>
        usePasswordReset({ onResetPassword: mockOnResetPassword })
      );

      act(() => {
        result.current.setStep("reset");
        result.current.setCode("123456");
        result.current.setConfirmPassword("newpassword123");
      });

      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>;

      await act(async () => {
        await result.current.handleResetPassword(mockEvent);
      });

      expect(result.current.error).toBe("passwordRequired");
      expect(mockOnResetPassword).not.toHaveBeenCalled();
    });

    it("should set error when newPassword is less than 6 characters", async () => {
      const { result } = renderHook(() =>
        usePasswordReset({ onResetPassword: mockOnResetPassword })
      );

      act(() => {
        result.current.setStep("reset");
        result.current.setCode("123456");
        result.current.setNewPassword("12345");
        result.current.setConfirmPassword("12345");
      });

      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>;

      await act(async () => {
        await result.current.handleResetPassword(mockEvent);
      });

      expect(result.current.error).toBe("passwordMinLength");
      expect(mockOnResetPassword).not.toHaveBeenCalled();
    });

    it("should set error when passwords do not match", async () => {
      const { result } = renderHook(() =>
        usePasswordReset({ onResetPassword: mockOnResetPassword })
      );

      act(() => {
        result.current.setStep("reset");
        result.current.setCode("123456");
        result.current.setNewPassword("newpassword123");
        result.current.setConfirmPassword("differentpassword");
      });

      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>;

      await act(async () => {
        await result.current.handleResetPassword(mockEvent);
      });

      expect(result.current.error).toBe("passwordMismatch");
      expect(mockOnResetPassword).not.toHaveBeenCalled();
    });

    it("should call onResetPassword with trimmed code and password on success", async () => {
      mockOnResetPassword.mockResolvedValue(undefined);

      const { result } = renderHook(() =>
        usePasswordReset({ onResetPassword: mockOnResetPassword })
      );

      act(() => {
        result.current.setStep("reset");
        result.current.setCode("  123456  ");
        result.current.setNewPassword("newpassword123");
        result.current.setConfirmPassword("newpassword123");
      });

      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>;

      await act(async () => {
        await result.current.handleResetPassword(mockEvent);
      });

      expect(mockOnResetPassword).toHaveBeenCalledWith("123456", "newpassword123");
      expect(result.current.error).toBe("");
      expect(result.current.isLoading).toBe(false);
    });

    it("should handle onResetPassword error", async () => {
      const errorMessage = "Failed to reset password";
      mockOnResetPassword.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() =>
        usePasswordReset({ onResetPassword: mockOnResetPassword })
      );

      act(() => {
        result.current.setStep("reset");
        result.current.setCode("123456");
        result.current.setNewPassword("newpassword123");
        result.current.setConfirmPassword("newpassword123");
      });

      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>;

      await act(async () => {
        await result.current.handleResetPassword(mockEvent);
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isLoading).toBe(false);
    });

    it("should handle non-Error rejection", async () => {
      mockOnResetPassword.mockRejectedValue("String error");

      const { result } = renderHook(() =>
        usePasswordReset({ onResetPassword: mockOnResetPassword })
      );

      act(() => {
        result.current.setStep("reset");
        result.current.setCode("123456");
        result.current.setNewPassword("newpassword123");
        result.current.setConfirmPassword("newpassword123");
      });

      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>;

      await act(async () => {
        await result.current.handleResetPassword(mockEvent);
      });

      expect(result.current.error).toBe("resetPasswordError");
    });

    it("should set loading state during reset password", async () => {
      let resolveResetPassword: () => void;
      const resetPasswordPromise = new Promise<void>((resolve) => {
        resolveResetPassword = resolve;
      });
      mockOnResetPassword.mockReturnValue(resetPasswordPromise);

      const { result } = renderHook(() =>
        usePasswordReset({ onResetPassword: mockOnResetPassword })
      );

      act(() => {
        result.current.setStep("reset");
        result.current.setCode("123456");
        result.current.setNewPassword("newpassword123");
        result.current.setConfirmPassword("newpassword123");
      });

      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>;

      act(() => {
        result.current.handleResetPassword(mockEvent);
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolveResetPassword!();
        await resetPasswordPromise;
      });

      expect(result.current.isLoading).toBe(false);
    });

    it("should work without onResetPassword callback", async () => {
      const { result } = renderHook(() => usePasswordReset());

      act(() => {
        result.current.setStep("reset");
        result.current.setCode("123456");
        result.current.setNewPassword("newpassword123");
        result.current.setConfirmPassword("newpassword123");
      });

      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>;

      await act(async () => {
        await result.current.handleResetPassword(mockEvent);
      });

      expect(result.current.error).toBe("");
    });
  });

  describe("reset", () => {
    it("should reset all fields and step to initial state", () => {
      const { result } = renderHook(() => usePasswordReset());

      act(() => {
        result.current.setEmail("test@example.com");
        result.current.setCode("123456");
        result.current.setNewPassword("newpassword123");
        result.current.setConfirmPassword("newpassword123");
        result.current.setStep("reset");
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.email).toBe("");
      expect(result.current.code).toBe("");
      expect(result.current.newPassword).toBe("");
      expect(result.current.confirmPassword).toBe("");
      expect(result.current.error).toBe("");
      expect(result.current.step).toBe("email");
    });
  });
});
