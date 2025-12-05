import { useState } from "react";
import { useNavigate } from "react-router";
import { AuthLayout } from "../components/site/auth-layout";
import { AuthCard, AuthFooter, AuthFormError, AuthButton } from "../components/site/ui";
import { Input } from "../components/ui";
import { authService } from "../services/auth.service";
import { ROUTES } from "../routes.config";
import { requireGuest, useRequireGuest } from "../utils/route-guard";
import { useTranslation } from "../i18n";
import { createSEOMeta } from "../utils/seo-meta";
import { isValidEmail } from "../utils/email-validation";

export function meta() {
  return createSEOMeta({
    title: "Esqueceu a Senha",
    description:
      "Recupere sua senha da conta Boi na Nuvem. Digite seu email para receber um código de recuperação.",
    url: "/esqueceu-senha",
    noindex: true,
  });
}

export function links() {
  return [{ rel: "canonical", href: "https://boinanuvem.com.br/esqueceu-senha" }];
}

export async function loader() {
  return requireGuest();
}

export default function ForgotPassword() {
  useRequireGuest();
  const navigate = useNavigate();
  const t = useTranslation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

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
      await authService.forgotPassword(email.trim());
      setSuccess(true);
      setTimeout(() => {
        navigate(ROUTES.LOGIN);
      }, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "sendCodeError";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (errorKey: string) => {
    const errorMap: Record<string, string> = {
      emailRequired: t.common.emailRequired,
      invalidEmail: t.common.invalidEmail,
      sendCodeError: t.common.sendCodeError,
      "User not found": t.common.sendCodeError,
    };
    return errorMap[errorKey] || t.common.sendCodeError;
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Esqueceu a senha?"
        subtitle="Digite seu email para receber um código de recuperação"
        footer={
          <AuthFooter question="Lembrou sua senha?" linkText="Entrar" linkRoute={ROUTES.LOGIN} />
        }
      >
        <form className="mt-6" onSubmit={handleSubmit}>
          {success ? (
            <div className="mb-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200">
                Email de recuperação enviado! Verifique sua caixa de entrada. Redirecionando para o
                login...
              </p>
            </div>
          ) : (
            <>
              <AuthFormError error={error ? getErrorMessage(error) : undefined} />

              <div className="w-full">
                <Input
                  type="email"
                  placeholder="Email"
                  aria-label={t.common.ariaLabels.email}
                  className="mt-0"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={
                    error === "emailRequired" || error === "invalidEmail"
                      ? getErrorMessage(error)
                      : undefined
                  }
                />
              </div>

              <div className="mt-6">
                <AuthButton
                  type="submit"
                  variant="primary"
                  size="md"
                  fullWidth
                  disabled={isLoading}
                >
                  {isLoading ? "Enviando..." : "Enviar Código"}
                </AuthButton>
              </div>
            </>
          )}
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
