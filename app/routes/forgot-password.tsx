import { AuthLayout } from "../components/site/auth-layout";
import { AuthInput, AuthButton } from "../components/site/ui";
import { COLORS } from "../components/site/constants";
import { ROUTES } from "../routes.config";

export function meta() {
  return [
    { title: "Esqueceu a Senha - Boi na Nuvem" },
    {
      name: "description",
      content: "Recupere sua senha da conta Boi na Nuvem",
    },
  ];
}

export default function ForgotPassword() {
  return (
    <AuthLayout>
      <div className="w-full max-w-sm mx-auto overflow-hidden bg-white rounded-lg shadow-md">
        <div className="px-6 py-4">
          <div className="flex justify-center mx-auto mb-4">
            <div
              className="w-auto h-7 sm:h-8 flex items-center text-2xl font-bold"
              style={{ color: COLORS.secondary }}
            >
              Boi na Nuvem
            </div>
          </div>

          <h3 className="mt-3 text-xl font-medium text-center text-gray-600">
            Esqueceu a senha?
          </h3>

          <p className="mt-1 text-center text-gray-500">
            Digite seu email para receber um código de recuperação
          </p>

          <form className="mt-6">
            <div className="w-full">
              <AuthInput
                type="email"
                placeholder="Email"
                aria-label="Email"
                className="mt-0"
              />
            </div>

            <div className="mt-6">
              <AuthButton
                type="submit"
                variant="primary"
                size="md"
                fullWidth
              >
                Enviar Código
              </AuthButton>
            </div>
          </form>
        </div>

        <div className="flex items-center justify-center py-4 text-center bg-gray-50">
          <span className="text-sm text-gray-600">
            Lembrou sua senha?{" "}
          </span>

          <a
            href={ROUTES.LOGIN}
            className="mx-2 text-sm font-bold text-blue-500 hover:underline transition-colors cursor-pointer"
          >
            Entrar
          </a>
        </div>
      </div>
    </AuthLayout>
  );
}

