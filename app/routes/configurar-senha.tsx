import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { AuthLayout } from "../components/site/auth-layout";
import { AuthCard, AuthFooter, AuthFormError, AuthButton } from "../components/site/ui";
import { Input } from "../components/ui";
import { authService } from "../services/auth.service";
import { ROUTES } from "../routes.config";
import { requireGuest, useRequireGuest } from "../utils/route-guard";
import { useTranslation } from "../i18n";
import { createSEOMeta } from "../utils/seo-meta";

export function meta() {
  return createSEOMeta({
    title: "Configurar Senha",
    description:
      "Configure sua senha para acessar sua conta no Boi na Nuvem. Esta ação também verificará seu email.",
    url: "/configurar-senha",
    noindex: true,
  });
}

export function links() {
  return [{ rel: "canonical", href: "https://boinanuvem.com.br/configurar-senha" }];
}

export async function loader() {
  return requireGuest();
}

export default function SetupPassword() {
  useRequireGuest();
  const navigate = useNavigate();
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
      await authService.setupPassword(token.trim(), newPassword);
      setSuccess(true);
      setTimeout(() => {
        navigate(ROUTES.LOGIN);
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "setupPasswordError";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (errorKey: string) => {
    const errorMap: Record<string, string> = {
      tokenRequired: "Token é obrigatório",
      passwordRequired: t.common.passwordRequired,
      passwordMinLength: t.common.passwordMinLength,
      passwordMismatch: t.common.passwordMismatch,
      setupPasswordError: "Erro ao configurar senha. Tente novamente.",
      "Invalid or expired verification token": "Token inválido ou expirado",
    };
    return errorMap[errorKey] || "Erro ao configurar senha. Tente novamente.";
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Configurar Senha"
        subtitle="Configure sua senha para acessar sua conta. Esta ação também verificará seu email automaticamente."
        footer={
          <AuthFooter
            question="Já tem uma conta?"
            linkText="Fazer login"
            linkRoute={ROUTES.LOGIN}
          />
        }
      >
        <form className="mt-6" onSubmit={handleSubmit}>
          {success ? (
            <div className="mb-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200">
                Senha configurada e email verificado com sucesso! Redirecionando para o login...
              </p>
            </div>
          ) : (
            <>
              <AuthFormError error={error ? getErrorMessage(error) : undefined} />

              {!token && (
                <div className="mb-4 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Token não encontrado. Por favor, use o link enviado por email.
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
                  {isLoading ? "Configurando..." : "Configurar Senha"}
                </AuthButton>
              </div>
            </>
          )}
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
