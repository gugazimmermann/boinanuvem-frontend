import { useState } from "react";
import { useNavigate } from "react-router";
import { AuthLayout } from "../components/site/auth-layout";
import { AuthCard, AuthFooter, AuthFormError, AuthButton } from "../components/site/ui";
import { Input } from "../components/ui";
import { useAuthForm } from "../components/site/hooks";
import { ROUTES } from "../routes.config";
import { authService } from "../services/auth.service";
import { useAuth } from "../contexts/auth-context";
import { requireGuest, useRequireGuest } from "../utils/route-guard";
import { useTranslation } from "../i18n";
import { createSEOMeta } from "../utils/seo-meta";

export function meta() {
  return createSEOMeta({
    title: "Entrar",
    description:
      "Faça login na sua conta Boi na Nuvem e acesse o sistema completo de gestão para fazendas de gado de corte.",
    url: "/entrar",
    noindex: true,
  });
}

export function links() {
  return [{ rel: "canonical", href: "https://boinanuvem.com.br/entrar" }];
}

export async function loader() {
  return requireGuest();
}

export default function Login() {
  useRequireGuest();
  const navigate = useNavigate();
  const { login } = useAuth();
  const t = useTranslation();
  const [rememberMe, setRememberMe] = useState(false);

  const { email, password, error, isLoading, setEmail, setPassword, handleSubmit } = useAuthForm({
    onSubmit: async (email, password) => {
      try {
        const loginResponse = await authService.login(email, password, rememberMe);
        login(loginResponse);
        navigate(ROUTES.DASHBOARD);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "invalidCredentials";
        throw new Error(errorMessage);
      }
    },
  });

  const getErrorMessage = (errorKey: string) => {
    const errorMap: Record<string, string> = {
      emailRequired: t.common.emailRequired,
      passwordRequired: t.common.passwordRequired,
      invalidCredentials: t.common.invalidCredentials,
      "Account is not active. Please verify your email.":
        "Conta não está ativa. Por favor, verifique seu email.",
      "Invalid credentials": t.common.invalidCredentials,
      unknownError: t.common.loginError,
    };
    return errorMap[errorKey] || errorKey || t.common.loginError;
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Bem-vindo de volta"
        subtitle="Faça login ou crie uma conta"
        footer={
          <AuthFooter
            question="Não tem uma conta?"
            linkText="Registrar"
            linkRoute={ROUTES.REGISTER}
          />
        }
      >
        <form className="mt-6" onSubmit={handleSubmit}>
          <AuthFormError error={error ? getErrorMessage(error) : undefined} />
          {error && error.includes("verifique seu email") && (
            <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                Não recebeu o email de verificação?
              </p>
              <a
                href={ROUTES.PROFILE}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Reenviar email de verificação
              </a>
            </div>
          )}

          <div className="w-full">
            <Input
              type="email"
              placeholder="Email"
              aria-label={t.common.ariaLabels.email}
              className="mt-0"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error === "emailRequired" ? t.common.emailRequired : undefined}
            />
          </div>

          <div className="w-full mt-4">
            <Input
              type="password"
              placeholder="Senha"
              aria-label={t.common.ariaLabels.password}
              className="mt-0"
              showPasswordToggle
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={error === "passwordRequired" ? t.common.passwordRequired : undefined}
            />
          </div>

          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:bg-gray-700"
            />
            <label
              htmlFor="rememberMe"
              className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              Lembrar-me
            </label>
          </div>

          <div className="flex items-center justify-between mt-4">
            <a
              href={ROUTES.FORGOT_PASSWORD}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors cursor-pointer"
            >
              Esqueceu a senha?
            </a>

            <AuthButton type="submit" variant="primary" size="md" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </AuthButton>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
