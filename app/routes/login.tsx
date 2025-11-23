import { useState } from "react";
import { useNavigate } from "react-router";
import { AuthLayout } from "../components/site/auth-layout";
import { AuthInput, AuthButton } from "../components/site/ui";
import { ROUTES } from "../routes.config";
import { authenticateUser } from "../services/users.service";
import { useAuth } from "../contexts/auth-context";
import { requireGuest, useRequireGuest } from "../utils/route-guard";
import { useTranslation } from "../i18n";

export function meta() {
  return [
    { title: "Entrar - Boi na Nuvem" },
    {
      name: "description",
      content: "Faça login na sua conta Boi na Nuvem",
    },
  ];
}

export async function loader() {
  return requireGuest();
}

export default function Login() {
  useRequireGuest();
  const navigate = useNavigate();
  const { login } = useAuth();
  const t = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError(t.common.emailRequired);
      return;
    }

    if (!password.trim()) {
      setError("Senha é obrigatória");
      return;
    }

    setIsLoading(true);

    try {
      const user = await authenticateUser(email.trim(), password);

      if (!user) {
        setError("Email ou senha inválidos, ou usuário inativo");
        setIsLoading(false);
        return;
      }

      login(user.id);
      navigate(ROUTES.DASHBOARD);
    } catch {
      setError("Erro ao fazer login. Tente novamente.");
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-sm mx-auto overflow-hidden bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="px-6 py-4">
          <div className="flex justify-center mx-auto mb-4">
            <div className="w-auto h-7 sm:h-8 flex items-center text-2xl font-bold text-secondary dark:text-secondary-light">
              Boi na Nuvem
            </div>
          </div>

          <h3 className="mt-3 text-xl font-medium text-center text-gray-600 dark:text-gray-300">
            Bem-vindo de volta
          </h3>

          <p className="mt-1 text-center text-gray-500 dark:text-gray-400">
            Faça login ou crie uma conta
          </p>

          <form className="mt-6" onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                {error}
              </div>
            )}

            <div className="w-full">
              <AuthInput
                type="email"
                placeholder="Email"
                aria-label={t.common.ariaLabels.email}
                className="mt-0"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                error={error && !email.trim() ? t.common.emailRequired : undefined}
              />
            </div>

            <div className="w-full mt-4">
              <AuthInput
                type="password"
                placeholder="Senha"
                aria-label={t.common.ariaLabels.password}
                className="mt-0"
                showPasswordToggle
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                error={error && !password.trim() ? "Senha é obrigatória" : undefined}
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
        </div>

        <div className="flex items-center justify-center py-4 text-center bg-gray-50 dark:bg-gray-900">
          <span className="text-sm text-gray-600 dark:text-gray-400">Não tem uma conta? </span>

          <a
            href={ROUTES.REGISTER}
            className="mx-2 text-sm font-bold text-blue-500 dark:text-blue-400 hover:underline transition-colors cursor-pointer"
          >
            Registrar
          </a>
        </div>
      </div>
    </AuthLayout>
  );
}
