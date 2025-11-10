import { AuthLayout } from "../components/site/auth-layout";
import { Input, Button } from "../components/ui";
import { COLORS } from "../components/site/constants";
import { ROUTES } from "../routes.config";

export function meta() {
  return [
    { title: "Nova Senha - Boi na Nuvem" },
    {
      name: "description",
      content: "Defina uma nova senha para sua conta Boi na Nuvem",
    },
  ];
}

export default function NewPassword() {
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
            Nova Senha
          </h3>

          <p className="mt-1 text-center text-gray-500">
            Digite o código recebido e sua nova senha
          </p>

          <form className="mt-6">
            <div className="w-full">
              <Input
                type="text"
                placeholder="Código de verificação"
                aria-label="Código de verificação"
                className="mt-0"
                inputClassName="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-500 bg-white border rounded-lg focus:border-blue-400 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-blue-300"
              />
            </div>

            <div className="w-full mt-4">
              <Input
                type="password"
                placeholder="Nova senha"
                aria-label="Nova senha"
                className="mt-0"
                showPasswordToggle
                inputClassName="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-500 bg-white border rounded-lg focus:border-blue-400 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-blue-300"
              />
            </div>

            <div className="w-full mt-4">
              <Input
                type="password"
                placeholder="Repetir senha"
                aria-label="Repetir senha"
                className="mt-0"
                showPasswordToggle
                inputClassName="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-500 bg-white border rounded-lg focus:border-blue-400 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-blue-300"
              />
            </div>

            <div className="mt-6">
              <Button
                type="submit"
                variant="primary"
                size="md"
                fullWidth
                className="px-6 py-2 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-blue-500 rounded-lg hover:bg-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50"
              >
                Redefinir Senha
              </Button>
            </div>
          </form>
        </div>

        <div className="flex items-center justify-center py-4 text-center bg-gray-50">
          <span className="text-sm text-gray-600">
            Não recebeu o código?{" "}
          </span>

          <a
            href={ROUTES.FORGOT_PASSWORD}
            className="mx-2 text-sm font-bold text-blue-500 hover:underline transition-colors cursor-pointer"
          >
            Reenviar
          </a>
        </div>
      </div>
    </AuthLayout>
  );
}

