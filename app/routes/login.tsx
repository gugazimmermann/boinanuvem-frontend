import { useNavigate } from "react-router";
import { AuthLayout } from "../components/site/auth-layout";
import { AuthCard, AuthFooter, AuthFormError, AuthButton } from "../components/site/ui";
import { Input } from "../components/ui";
import { useAuthForm } from "../components/site/hooks";
import { ROUTES } from "../routes.config";
import { authenticateUser } from "../services/users.service";
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

  const { email, password, error, isLoading, setEmail, setPassword, handleSubmit } = useAuthForm({
    onSubmit: async (email, password) => {
      const user = await authenticateUser(email, password);

      if (!user) {
        throw new Error("invalidCredentials");
      }

      login(user.id);
      navigate(ROUTES.DASHBOARD);
    },
  });

  const getErrorMessage = (errorKey: string) => {
    const errorMap: Record<string, string> = {
      emailRequired: t.common.emailRequired,
      passwordRequired: t.common.passwordRequired,
      invalidCredentials: t.common.invalidCredentials,
      unknownError: t.common.loginError,
    };
    return errorMap[errorKey] || t.common.loginError;
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
