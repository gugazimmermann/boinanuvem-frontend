import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { AuthCard, AuthFormError, AuthButton } from "./ui";
import { Input } from "../ui";
import { useTranslation } from "~/i18n";

export type PasswordFormMode = "reset" | "setup";

export interface PasswordFormProps {
  readonly mode: PasswordFormMode;
  readonly title: string;
  readonly subtitle: string;
  readonly footer?: React.ReactNode;
  readonly onSubmit: (token: string, password: string) => Promise<void>;
  readonly onSuccess?: () => void;
  readonly errorMessages?: Record<string, string>;
  readonly successMessage: string;
  readonly loadingLabel: string;
  readonly submitLabel: string;
  readonly tokenRequiredMessage?: string;
  readonly tokenNotFoundMessage?: string;
}

export function PasswordForm({
  mode,
  title,
  subtitle,
  footer,
  onSubmit,
  onSuccess,
  errorMessages = {},
  successMessage,
  loadingLabel,
  submitLabel,
  tokenRequiredMessage = "Token é obrigatório",
  tokenNotFoundMessage = "Token não encontrado. Por favor, use o link enviado por email.",
}: PasswordFormProps) {
  const [searchParams] = useSearchParams();
  const t = useTranslation();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError("tokenRequired");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!token.trim()) {
      setError("tokenRequired");
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
      await onSubmit(token.trim(), newPassword);
      setSuccess(true);
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `${mode}PasswordError`;
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (errorKey: string) => {
    const defaultErrorMap: Record<string, string> = {
      tokenRequired: tokenRequiredMessage,
      passwordRequired: t.common.passwordRequired,
      passwordMinLength: t.common.passwordMinLength,
      passwordMismatch: t.common.passwordMismatch,
      resetPasswordError: t.common.resetPasswordError,
      setupPasswordError: "Erro ao configurar senha. Tente novamente.",
      "Invalid or expired reset token": "Token inválido ou expirado",
      "Invalid or expired verification token": "Token inválido ou expirado",
    };

    return errorMessages[errorKey] || defaultErrorMap[errorKey] || t.common.resetPasswordError;
  };

  return (
    <AuthCard title={title} subtitle={subtitle} footer={footer}>
      <form className="mt-6" onSubmit={handleSubmit}>
        {success ? (
          <div className="mb-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-800 dark:text-green-200">{successMessage}</p>
          </div>
        ) : (
          <>
            <AuthFormError error={error ? getErrorMessage(error) : undefined} />

            {!token && (
              <div className="mb-4 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  {tokenNotFoundMessage}
                </p>
              </div>
            )}

            <div className="w-full mt-4">
              <Input
                type="password"
                placeholder="Nova senha"
                aria-label="Nova senha"
                className="mt-0"
                showPasswordToggle
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                error={
                  error === "passwordRequired" || error === "passwordMinLength"
                    ? getErrorMessage(error)
                    : undefined
                }
              />
            </div>

            <div className="w-full mt-4">
              <Input
                type="password"
                placeholder="Repetir senha"
                aria-label="Repetir senha"
                className="mt-0"
                showPasswordToggle
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={error === "passwordMismatch" ? t.common.passwordMismatch : undefined}
              />
            </div>

            <div className="mt-6">
              <AuthButton
                type="submit"
                variant="primary"
                size="md"
                fullWidth
                disabled={isLoading || !token}
              >
                {isLoading ? loadingLabel : submitLabel}
              </AuthButton>
            </div>
          </>
        )}
      </form>
    </AuthCard>
  );
}
