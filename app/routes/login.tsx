import { useNavigate } from "react-router";
import { AuthLayout } from "../components/site/auth-layout";
import { AuthInput, AuthButton } from "../components/site/ui";
import { COLORS } from "../components/site/constants";
import { ROUTES } from "../routes.config";

export function meta() {
  return [
    { title: "Entrar - Boi na Nuvem" },
    {
      name: "description",
      content: "Faça login na sua conta Boi na Nuvem",
    },
  ];
}

export default function Login() {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate(ROUTES.DASHBOARD);
  };

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

          <h3 className="mt-3 text-xl font-medium text-center text-gray-600">Bem-vindo de volta</h3>

          <p className="mt-1 text-center text-gray-500">Faça login ou crie uma conta</p>

          <form className="mt-6" onSubmit={handleSubmit}>
            <div className="w-full">
              <AuthInput type="email" placeholder="Email" aria-label="Email" className="mt-0" />
            </div>

            <div className="w-full mt-4">
              <AuthInput
                type="password"
                placeholder="Senha"
                aria-label="Senha"
                className="mt-0"
                showPasswordToggle
              />
            </div>

            <div className="flex items-center justify-between mt-4">
              <a
                href={ROUTES.FORGOT_PASSWORD}
                className="text-sm text-gray-600 hover:text-gray-500 transition-colors cursor-pointer"
              >
                Esqueceu a senha?
              </a>

              <AuthButton type="submit" variant="primary" size="md">
                Entrar
              </AuthButton>
            </div>
          </form>
        </div>

        <div className="flex items-center justify-center py-4 text-center bg-gray-50">
          <span className="text-sm text-gray-600">Não tem uma conta? </span>

          <a
            href={ROUTES.REGISTER}
            className="mx-2 text-sm font-bold text-blue-500 hover:underline transition-colors cursor-pointer"
          >
            Registrar
          </a>
        </div>
      </div>
    </AuthLayout>
  );
}
