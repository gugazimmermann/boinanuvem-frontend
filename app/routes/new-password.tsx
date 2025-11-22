import { AuthLayout } from "../components/site/auth-layout";
import { AuthInput, AuthButton } from "../components/site/ui";
import { ROUTES } from "../routes.config";
import { requireGuest, useRequireGuest } from "../utils/route-guard";

export function meta() {
  return [
    { title: "Nova Senha - Boi na Nuvem" },
    {
      name: "description",
      content: "Defina uma nova senha para sua conta Boi na Nuvem",
    },
  ];
}

export async function loader() {
  return requireGuest();
}

export default function NewPassword() {
  useRequireGuest();
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
            Nova Senha
          </h3>

          <p className="mt-1 text-center text-gray-500 dark:text-gray-400">
            Digite o código recebido e sua nova senha
          </p>

          <form className="mt-6">
            <div className="w-full">
              <AuthInput
                type="text"
                placeholder="Código de verificação"
                aria-label="Código de verificação"
                className="mt-0"
              />
            </div>

            <div className="w-full mt-4">
              <AuthInput
                type="password"
                placeholder="Nova senha"
                aria-label="Nova senha"
                className="mt-0"
                showPasswordToggle
              />
            </div>

            <div className="w-full mt-4">
              <AuthInput
                type="password"
                placeholder="Repetir senha"
                aria-label="Repetir senha"
                className="mt-0"
                showPasswordToggle
              />
            </div>

            <div className="mt-6">
              <AuthButton type="submit" variant="primary" size="md" fullWidth>
                Redefinir Senha
              </AuthButton>
            </div>
          </form>
        </div>

        <div className="flex items-center justify-center py-4 text-center bg-gray-50 dark:bg-gray-900">
          <span className="text-sm text-gray-600 dark:text-gray-400">Não recebeu o código? </span>

          <a
            href={ROUTES.FORGOT_PASSWORD}
            className="mx-2 text-sm font-bold text-blue-500 dark:text-blue-400 hover:underline transition-colors cursor-pointer"
          >
            Reenviar
          </a>
        </div>
      </div>
    </AuthLayout>
  );
}
