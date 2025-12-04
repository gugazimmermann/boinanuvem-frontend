import { useState, useCallback } from "react";
import { isValidEmail } from "~/utils/email-validation";

interface UsePasswordResetOptions {
  onSendCode?: (email: string) => Promise<void>;
  onResetPassword?: (code: string, newPassword: string) => Promise<void>;
}

export function usePasswordReset({ onSendCode, onResetPassword }: UsePasswordResetOptions = {}) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"email" | "reset">("email");

  const handleSendCode = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError("");

      if (!email.trim()) {
        setError("emailRequired");
        return;
      }

      if (!isValidEmail(email.trim())) {
        setError("invalidEmail");
        return;
      }

      setIsLoading(true);

      try {
        if (onSendCode) {
          await onSendCode(email.trim());
        }
        setStep("reset");
      } catch (err) {
        setError(err instanceof Error ? err.message : "sendCodeError");
      } finally {
        setIsLoading(false);
      }
    },
    [email, onSendCode]
  );

  const handleResetPassword = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError("");

      if (!code.trim()) {
        setError("codeRequired");
        return;
      }

      if (!newPassword.trim()) {
        setError("passwordRequired");
        return;
      }

      if (newPassword.length < 6) {
        setError("passwordMinLength");
        return;
      }

      if (newPassword !== confirmPassword) {
        setError("passwordMismatch");
        return;
      }

      setIsLoading(true);

      try {
        if (onResetPassword) {
          await onResetPassword(code.trim(), newPassword);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "resetPasswordError");
      } finally {
        setIsLoading(false);
      }
    },
    [code, newPassword, confirmPassword, onResetPassword]
  );

  const reset = useCallback(() => {
    setEmail("");
    setCode("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setStep("email");
  }, []);

  return {
    email,
    code,
    newPassword,
    confirmPassword,
    error,
    isLoading,
    step,
    setEmail,
    setCode,
    setNewPassword,
    setConfirmPassword,
    setStep,
    handleSendCode,
    handleResetPassword,
    reset,
  };
}
